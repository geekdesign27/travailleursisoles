import { Button } from "@/components/ui/button";

interface WizardNavigationProps {
  onNext: () => void;
  onPrevious?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  isFirstStep?: boolean;
  isSubmitting?: boolean;
  nextDisabled?: boolean;
}

export function WizardNavigation({
  onNext,
  onPrevious,
  nextLabel = "Suivant",
  previousLabel = "Précédent",
  isFirstStep = false,
  isSubmitting = false,
  nextDisabled = false,
}: WizardNavigationProps) {
  return (
    <div className="flex justify-between pt-8">
      {!isFirstStep && onPrevious ? (
        <Button
          type="button"
          variant="secondary"
          onClick={onPrevious}
          className="min-h-[44px] min-w-[44px]"
        >
          {previousLabel}
        </Button>
      ) : (
        <div />
      )}

      <Button
        type="button"
        onClick={onNext}
        disabled={isSubmitting || nextDisabled}
        className="min-h-[44px] min-w-[44px] bg-suva-primary text-white hover:bg-suva-primary-hover"
      >
        {isSubmitting ? "Validation..." : nextLabel}
      </Button>
    </div>
  );
}
