import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import type { Analysis } from "@/types/analysis.schema";
import { exportAnalysisCsv } from "./csvExporter";

interface ExportCsvButtonProps {
  analysis: Analysis;
}

export function ExportCsvButton({ analysis }: ExportCsvButtonProps) {
  const handleExport = () => {
    try {
      exportAnalysisCsv(analysis);
      toast.success("CSV exporté");
    } catch (err) {
      console.error("CSV export failed:", err);
      toast.error("Erreur lors de l'export CSV.");
    }
  };

  return (
    <Button variant="outline" size="default" onClick={handleExport}>
      <FileSpreadsheet />
      Exporter CSV
    </Button>
  );
}
