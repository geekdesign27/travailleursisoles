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
import { Loader2Icon, CloudIcon, CloudOffIcon, LinkIcon } from "lucide-react";

export function GoogleSheetsConfig() {
  const { state, connect, disconnect, setSpreadsheet } = useGoogleSheets();
  const [spreadsheetInput, setSpreadsheetInput] = useState("");

  // Activate sync effect while this component is mounted
  useSyncEffect();

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const handleSetSpreadsheet = async () => {
    if (!spreadsheetInput.trim()) return;
    await setSpreadsheet(spreadsheetInput.trim());
    setSpreadsheetInput("");
  };

  const queueSize = getQueueSize();
  const isConnected = state.auth.isAuthenticated;
  const isLoading = state.auth.isLoading;
  const isSyncing = state.syncStatus === "syncing";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? (
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
        {/* Connection status & button */}
        {!isConnected ? (
          <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Connecter Google Sheets"
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600 font-medium">
                Connecté à Google
              </span>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Déconnecter
              </Button>
            </div>

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
                  Collez l'URL complète ou l'ID de votre feuille Google Sheets.
                  La structure sera créée automatiquement.
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
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${state.spreadsheetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    Ouvrir
                  </a>
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
                    <span className="text-red-600">
                      Erreur : {state.syncError}
                    </span>
                  )}
                  {queueSize > 0 && (
                    <span className="text-muted-foreground">
                      ({queueSize} en attente)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Auth error display */}
        {state.auth.error && (
          <p className="text-sm text-red-600">{state.auth.error}</p>
        )}
      </CardContent>
    </Card>
  );
}
