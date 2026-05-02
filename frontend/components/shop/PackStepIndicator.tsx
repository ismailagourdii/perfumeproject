'use client';

import React from 'react';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { useTranslation } from '@/lib/i18n';

export interface PackStepIndicatorProps {
  currentStep: number;
}

export function PackStepIndicator({ currentStep }: PackStepIndicatorProps) {
  const { t } = useTranslation();
  const STEPS = [
    { index: 1, label: t('pack.step1') },
    { index: 2, label: t('pack.step2') },
    { index: 3, label: t('pack.step3') },
    { index: 4, label: t('pack.step4') },
  ];
  return <StepIndicator steps={STEPS} currentStep={currentStep} />;
}
