import { useState } from "react";
import { useGoogleSheets } from "@/contexts/GoogleSheetsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSyncEffect } from "./useSyncEffect";
import { getQueueSize } from "./syncQueue";
import {
  Loader2Icon,
  CloudIcon,
  CloudOffIcon,
  LinkIcon,
  XIcon,
  CopyIcon,
} from "lucide-react";
import { toast } from "sonner";

export function GoogleSheetsConfig() {
  const { state, setSpreadsheet, clearSpreadsheet } = useGoogleSheets();
  const [spreadsheetInput, setSpreadsheetInput] = useState("");

  // Activate sync effect while this component is mounted
  useSyncEffect();

  const handleSetSpreadsheet = async () => {
    if (!spreadsheetInput.trim()) return;
    await setSpreadsheet(spreadsheetInput.trim());
    setSpreadsheetInput("");
  };

  const handleCopyEmail = () => {
    if (state.serviceAccountEmail) {
      navigator.clipboard.writeText(state.serviceAccountEmail);
      toast.success("Email copié dans le presse-papiers.");
    }
  };

  const queueSize = getQueueSize();
  const isSyncing = state.syncStatus === "syncing";

  if (!state.configured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudOffIcon className="size-5 text-muted-foreground" />
            Synchronisation Google Sheets
          </CardTitle>
          <CardDescription>
            La synchronisation n'est pas configurée. Les variables
            d'environnement VITE_SA_CLIENT_EMAIL et VITE_SA_PRIVATE_KEY_B64 sont
            requises.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {state.spreadsheetId ? (
            <CloudIcon className="size-5 text-green-600" />
          ) : (
            <CloudOffIcon className="size-5 text-muted-foreground" />
          )}
          Synchronisation Google Sheets
        </CardTitle>
        <CardDescription>
          Synchronisez vos analyses avec une feuille Google Sheets pour
          sauvegarde et partage.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service account info */}
        {state.serviceAccountEmail && (
          <div className="rounded-md bg-muted p-3 space-y-1">
            <p className="text-xs text-muted-foreground">
              Partagez votre feuille Google Sheets avec ce compte :
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono flex-1 truncate">
                {state.serviceAccountEmail}
              </code>
              <Button variant="ghost" size="sm" onClick={handleCopyEmail}>
                <CopyIcon className="size-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Spreadsheet configuration */}
        {!state.spreadsheetId ? (
          <div className="space-y-2">
            <Label htmlFor="spreadsheet-url">
              URL ou ID de la feuille Google Sheets
            </Label>
            <div className="flex gap-2">
              <Input
                id="spreadsheet-url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={spreadsheetInput}
                onChange={(e) => setSpreadsheetInput(e.target.value)}
                disabled={isSyncing}
              />
              <Button
                onClick={handleSetSpreadsheet}
                disabled={!spreadsheetInput.trim() || isSyncing}
              >
                {isSyncing ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <LinkIcon className="size-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Collez l'URL complète ou l'ID de votre feuille. N'oubliez pas de
              la partager avec le compte de service ci-dessus (droits Éditeur).
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Feuille configurée</p>
                <p className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">
                  {state.spreadsheetId}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://docs.google.com/spreadsheets/d/${state.spreadsheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  Ouvrir
                </a>
                <Button variant="ghost" size="sm" onClick={clearSpreadsheet}>
                  <XIcon className="size-4" />
                </Button>
              </div>
            </div>

            {/* Sync status */}
            <div className="flex items-center gap-2 text-sm">
              {isSyncing && (
                <>
                  <Loader2Icon className="size-3 animate-spin" />
                  <span>Synchronisation...</span>
                </>
              )}
              {state.syncStatus === "success" && (
                <span className="text-green-600">Synchronisé</span>
              )}
              {state.syncStatus === "error" && (
                <span className="text-red-600">Erreur : {state.syncError}</span>
              )}
              {queueSize > 0 && (
                <span className="text-muted-foreground">
                  ({queueSize} en attente)
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
