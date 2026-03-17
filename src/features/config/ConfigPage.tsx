import { GoogleSheetsConfig } from "@/features/sync/GoogleSheetsConfig";
import { TaxonomyEditor } from "@/features/config/TaxonomyEditor";
import { SuvaConstantsDisplay } from "@/features/config/SuvaConstantsDisplay";
import { useConfig, type TaxonomyField } from "@/contexts/ConfigContext";

const TAXONOMY_FIELDS: { field: TaxonomyField; label: string }[] = [
  { field: "departements", label: "Départements" },
  { field: "typesEquipement", label: "Types d'équipement DATI" },
  { field: "typesAlerte", label: "Types d'alerte" },
  { field: "libellesFrequence", label: "Libellés de fréquence" },
  { field: "prestatairesFormation", label: "Prestataires de formation" },
];

export function ConfigPage() {
  const { config, dispatch } = useConfig();

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Configuration</h1>
      <p className="mt-2 text-muted-foreground">
        Paramètres de l'application et intégrations.
      </p>

      <div className="mt-8 space-y-10">
        {/* Google Sheets integration */}
        <GoogleSheetsConfig />

        {/* Company taxonomies — editable */}
        <section aria-label="Taxonomies entreprise">
          <h2 className="text-lg font-semibold">Taxonomies entreprise</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configurez les listes de valeurs spécifiques à votre entreprise. Ces
            taxonomies alimentent les menus déroulants du wizard d'analyse.
          </p>

          <div className="mt-6 space-y-8">
            {TAXONOMY_FIELDS.map(({ field, label }) => (
              <TaxonomyEditor
                key={field}
                label={label}
                items={config[field]}
                onAdd={(item) =>
                  dispatch({
                    type: "config/ADD_ITEM",
                    payload: { field, item },
                  })
                }
                onRemove={(index) =>
                  dispatch({
                    type: "config/REMOVE_ITEM",
                    payload: { field, index },
                  })
                }
                onUpdate={(index, value) =>
                  dispatch({
                    type: "config/UPDATE_ITEM",
                    payload: { field, index, value },
                  })
                }
              />
            ))}
          </div>
        </section>

        {/* SUVA constants — read-only */}
        <hr className="border-border" />
        <SuvaConstantsDisplay />
      </div>
    </main>
  );
}
