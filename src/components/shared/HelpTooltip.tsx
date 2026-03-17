import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HelpTooltipProps {
  title: string;
  content: string;
  example?: string;
  reference?: string;
  /** The id of the field this tooltip describes (used for aria-describedby) */
  fieldId?: string;
}

/**
 * Contextual help popover rendered as a small `?` icon.
 * Click to open a non-blocking popover with title, content,
 * optional example, and optional SUVA reference link.
 */
export function HelpTooltip({
  title,
  content,
  example,
  reference,
  fieldId,
}: HelpTooltipProps) {
  const popoverId = fieldId ? `${fieldId}-help` : undefined;

  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex shrink-0 items-center justify-center rounded-full text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Aide : ${title}`}
      >
        <HelpCircle className="size-4" />
      </PopoverTrigger>
      <PopoverContent
        id={popoverId}
        className="w-72 text-sm"
        side="top"
        align="start"
      >
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-muted-foreground">{content}</p>
        {example && (
          <p className="mt-2 italic text-muted-foreground">Ex. : {example}</p>
        )}
        {reference && (
          <p className="mt-2 text-xs text-muted-foreground">
            Voir la référence complète : {reference}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
