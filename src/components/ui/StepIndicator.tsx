import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  className = ''
}) => {
  const getCircleClass = (index: number) => {
    if (index < currentStep) return 'step-indicator-circle completed';
    if (index === currentStep) return 'step-indicator-circle active';
    return 'step-indicator-circle inactive';
  };

  const getLineClass = (index: number) => {
    if (index < currentStep) return 'step-indicator-line completed';
    return 'step-indicator-line';
  };

  return (
    <div className={`step-indicator ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="step-indicator-item">
            <div className={getCircleClass(index)}>
              {index < currentStep ? (
                <Check size={16} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-subhead text-text-secondary">{step.label}</span>
              {step.description && (
                <span className="text-caption text-text-tertiary">{step.description}</span>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={getLineClass(index)} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;