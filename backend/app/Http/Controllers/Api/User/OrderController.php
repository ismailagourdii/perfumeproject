<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Carrier;
use App\Models\City;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Crée une commande depuis le panier.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|string',
            'items.*.kind' => 'required|in:single,pack',
            'items.*.quantity' => 'required|integer|min:1',
            'city_id' => 'required|exists:cities,id',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'customer_name' => 'required|string|max:191',
            'customer_phone' => 'required|string|max:50',
            'payment_method' => 'required|in:cod,virement',
        ]);

        $user = $request->user();
        $city = City::findOrFail($validated['city_id']);
        $carrier = Carrier::where('is_active', true)->first() ?? Carrier::first();
        if (!$carrier) {
            return response()->json(['message' => 'Aucun transporteur configuré.'], 500);
        }

        $subtotal = 0;
        $itemsToCreate = [];

        foreach ($validated['items'] as $item) {
            if ($item['kind'] === 'single') {
                $perfume = $item['perfume'] ?? null;
                if (!$perfume || !isset($perfume['id'])) {
                    continue;
                }
                $product = Product::find($perfume['id']);
                if (!$product) {
                    continue;
                }
                $size = $item['size'] ?? '20ml';
                $unitPrice = $size === '50ml' ? (int) ($perfume['price50ml'] ?? $product->base_price_mad) : (int) ($perfume['price20ml'] ?? $product->base_price_mad);
                $qty = (int) $item['quantity'];
                $total = $unitPrice * $qty;
                $subtotal += $total;
                $itemsToCreate[] = [
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'size_ml' => $size,
                    'unit_price_mad' => $unitPrice,
                    'total_price_mad' => $total,
                ];
            } else {
                $perfumes = $item['perfumes'] ?? [];
                $totalPrice = (int) ($item['totalPrice'] ?? 0);
                $qty = (int) $item['quantity'];
                $subtotal += $totalPrice * $qty;
                $count = max(1, count($perfumes));
                $unitShare = (int) round($totalPrice / $count);
                foreach ($perfumes as $p) {
                    $pid = is_array($p) ? ($p['id'] ?? null) : ($p->id ?? null);
                    if (!$pid) {
                        continue;
                    }
                    $product = Product::find($pid);
                    if (!$product) {
                        continue;
                    }
                    $itemsToCreate[] = [
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'size_ml' => $item['size'] ?? '20ml',
                        'unit_price_mad' => $unitShare,
                        'total_price_mad' => $unitShare * $qty,
                    ];
                }
                if (empty($perfumes) && $totalPrice > 0) {
                    $itemsToCreate[] = [
                        'product_id' => Product::first()?->id ?? 0,
                        'quantity' => $qty,
                        'size_ml' => $item['size'] ?? '20ml',
                        'unit_price_mad' => $totalPrice,
                        'total_price_mad' => $totalPrice * $qty,
                    ];
                }
            }
        }

        $subtotal = array_sum(array_column($itemsToCreate, 'total_price_mad'));
        if ($subtotal <= 0 || empty($itemsToCreate)) {
            return response()->json(['message' => 'Panier invalide.'], 422);
        }
        $subtotal = (int) $subtotal;
        $shippingFee = (int) $city->delivery_fee_mad;
        $discount = 0;
        $total = $subtotal + $shippingFee - $discount;

        $order = Order::create([
            'user_id' => $user->id,
            'city_id' => $city->id,
            'carrier_id' => $carrier->id,
            'status' => 'pending',
            'subtotal_mad' => $subtotal,
            'shipping_fee_mad' => $shippingFee,
            'discount_mad' => $discount,
            'total_mad' => $total,
            'receiver_name' => $validated['customer_name'],
            'receiver_phone' => $validated['customer_phone'],
            'address_line1' => $validated['address_line1'],
            'address_line2' => $validated['address_line2'] ?? null,
            'notes' => null,
            'payment_method' => $validated['payment_method'] ?? 'cod',
        ]);

        foreach ($itemsToCreate as $row) {
            if (($row['product_id'] ?? 0) > 0) {
                $order->items()->create($row);
            }
        }

        return response()->json([
            'order' => $this->formatOrderSummary($order->fresh(['items.product', 'city'])),
        ], 201);
    }

    /**
     * Liste des commandes de l'utilisateur.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()->orders()->with(['items.product', 'city'])->orderByDesc('id')->get();
        return response()->json([
            'data' => $orders->map(fn (Order $o) => $this->formatOrderSummary($o)),
        ]);
    }

    /**
     * Détail d'une commande.
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Commande introuvable.'], 404);
        }
        $order->load(['items.product', 'city']);
        return response()->json([
            'order' => $this->formatOrderSummary($order),
        ]);
    }

    private function formatOrderSummary(Order $order): array
    {
        $city = $order->city;
        $items = $order->items->map(function (OrderItem $item) {
            $product = $item->product;
            $label = $product ? $product->name : 'Article';
            if ($item->size_ml) {
                $label .= ' (' . $item->size_ml . ')';
            }
            return [
                'id' => $item->id,
                'kind' => 'single',
                'label' => $label,
                'quantity' => $item->quantity,
                'unitPrice' => $item->unit_price_mad,
                'totalPrice' => $item->total_price_mad,
                'meta' => null,
            ];
        });

        return [
            'id' => $order->id,
            'reference' => (string) $order->id,
            'status' => $order->status,
            'items' => $items->toArray(),
            'subtotal' => $order->subtotal_mad,
            'deliveryFee' => $order->shipping_fee_mad,
            'discountTotal' => $order->discount_mad,
            'total' => $order->total_mad,
            'city' => [
                'id' => $city->id,
                'name' => $city->name,
                'deliveryFee' => (float) $city->delivery_fee_mad,
            ],
            'addressLine1' => $order->address_line1,
            'addressLine2' => $order->address_line2,
            'customerName' => $order->receiver_name,
            'customerPhone' => $order->receiver_phone,
            'paymentMethod' => $order->payment_method ?? 'cod',
        ];
    }
}
