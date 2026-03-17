import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Analysis } from "@/types/analysis.schema";
import { formatPeriode } from "./reportGenerator";

interface ExportPdfButtonProps {
  analysis: Analysis;
  reportRef: React.RefObject<HTMLDivElement | null>;
}

function buildFilename(analysis: Analysis): string {
  const poste = analysis.titre_activite
    .replace(/[^a-zA-Z0-9àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 40);
  const periode = formatPeriode(analysis.periode_travail);
  const date = new Date().toISOString().slice(0, 10);
  return `Analyse_${poste}_${periode}_${date}.pdf`;
}

export function ExportPdfButton({ analysis, reportRef }: ExportPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(false);

  const handleExport = useCallback(async () => {
    if (!reportRef.current) {
      toast.error("Aucun contenu de rapport à exporter.");
      return;
    }

    setLoading(true);
    abortRef.current = false;

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      if (abortRef.current) return;

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      if (abortRef.current) return;

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const headerHeight = 15;
      const footerHeight = 12;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight =
        pageHeight - margin * 2 - headerHeight - footerHeight;

      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      // Header on each page
      const addHeader = (doc: InstanceType<typeof jsPDF>) => {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `${analysis.entreprise} — ${analysis.titre_activite}`,
          margin,
          margin + 5,
        );
        doc.text(
          new Date().toLocaleDateString("fr-CH"),
          pageWidth - margin,
          margin + 5,
          { align: "right" },
        );
        doc.setDrawColor(200, 200, 200);
        doc.line(
          margin,
          margin + headerHeight - 2,
          pageWidth - margin,
          margin + headerHeight - 2,
        );
      };

      // Footer on each page
      const addFooter = (
        doc: InstanceType<typeof jsPDF>,
        pageNum: number,
        totalPages: number,
      ) => {
        const footerY = pageHeight - margin - 2;
        doc.setFontSize(7);
        doc.setTextColor(130, 130, 130);
        doc.text("SUVA 44094.F — Édition mai 2025", margin, footerY);
        doc.text(
          `Page ${pageNum} / ${totalPages}`,
          pageWidth - margin,
          footerY,
          { align: "right" },
        );
      };

      // Calculate total pages needed
      const totalPages = Math.max(1, Math.ceil(imgHeight / usableHeight));

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        addHeader(pdf);

        const srcY = page * usableHeight * (canvas.width / usableWidth);
        const srcH = Math.min(
          usableHeight * (canvas.width / usableWidth),
          canvas.height - srcY,
        );

        if (srcH <= 0) break;

        // Create a slice of the canvas for this page
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = srcH;
        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            srcY,
            canvas.width,
            srcH,
            0,
            0,
            canvas.width,
            srcH,
          );
          const pageImgData = pageCanvas.toDataURL("image/png");
          const sliceHeight = (srcH * usableWidth) / canvas.width;
          pdf.addImage(
            pageImgData,
            "PNG",
            margin,
            margin + headerHeight,
            usableWidth,
            sliceHeight,
          );
        }

        addFooter(pdf, page + 1, totalPages);
      }

      const filename = buildFilename(analysis);
      pdf.save(filename);
      toast.success("PDF généré");
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("Erreur lors de la génération du PDF.");
    } finally {
      setLoading(false);
    }
  }, [analysis, reportRef]);

  return (
    <Button
      variant="outline"
      size="default"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" />
          En cours...
        </>
      ) : (
        <>
          <FileDown />
          Exporter PDF
        </>
      )}
    </Button>
  );
}
