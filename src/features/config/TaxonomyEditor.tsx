import { useState, useRef } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegulatoryLock } from "@/components/shared/RegulatoryLock";

interface TaxonomyEditorProps {
  label: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
}

export function TaxonomyEditor({
  label,
  items,
  onAdd,
  onRemove,
  onUpdate,
}: TaxonomyEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(value: string, excludeIndex?: number): string | null {
    const trimmed = value.trim();
    if (!trimmed) return "La valeur ne peut pas être vide";
    const duplicate = items.some(
      (item, i) =>
        i !== excludeIndex && item.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) return "Cette valeur existe déjà";
    return null;
  }

  function handleAdd() {
    const err = validate(newValue);
    if (err) {
      setError(err);
      return;
    }
    onAdd(newValue.trim());
    setNewValue("");
    setError("");
    setIsAdding(false);
    toast.success("Configuration enregistrée");
  }

  function handleUpdate(index: number, value: string) {
    const err = validate(value, index);
    if (err) {
      toast.error(err);
      return;
    }
    onUpdate(index, value.trim());
    toast.success("Configuration enregistrée");
  }

  function handleRemove(index: number) {
    onRemove(index);
    toast.success("Configuration enregistrée");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">{label}</h3>
        <RegulatoryLock type="config" />
      </div>

      {items.length === 0 && !isAdding && (
        <p className="text-sm text-muted-foreground">Aucun élément configuré</p>
      )}

      <ul className="space-y-2" role="list" aria-label={label}>
        {items.map((item, index) => (
          <TaxonomyRow
            key={`${label}-${index}`}
            value={item}
            onUpdate={(value) => handleUpdate(index, value)}
            onRemove={() => handleRemove(index)}
          />
        ))}
      </ul>

      {isAdding ? (
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newValue}
            onChange={(e) => {
              setNewValue(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setIsAdding(false);
                setNewValue("");
                setError("");
              }
            }}
            placeholder="Nouvelle valeur…"
            className="min-h-[44px] max-w-xs"
            aria-label="Nouvelle valeur"
            aria-invalid={!!error}
            autoFocus
          />
          <Button size="sm" onClick={handleAdd}>
            OK
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewValue("");
              setError("");
            }}
          >
            Annuler
          </Button>
          {error && <span className="text-sm text-suva-error">{error}</span>}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsAdding(true);
            // Focus input after render
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Ajouter
        </Button>
      )}
    </div>
  );
}

function TaxonomyRow({
  value,
  onUpdate,
  onRemove,
}: {
  value: string;
  onUpdate: (value: string) => void;
  onRemove: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  function handleSave() {
    if (editValue.trim() === value) {
      setIsEditing(false);
      return;
    }
    onUpdate(editValue);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <li className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setEditValue(value);
              setIsEditing(false);
            }
          }}
          className="min-h-[44px] max-w-xs"
          autoFocus
        />
        <Button size="sm" onClick={handleSave}>
          OK
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setEditValue(value);
            setIsEditing(false);
          }}
        >
          Annuler
        </Button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-left text-sm hover:bg-accent"
      >
        {value}
      </button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label={`Supprimer ${value}`}
        className="h-9 w-9 text-muted-foreground hover:text-suva-error"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}
