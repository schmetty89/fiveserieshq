// articleConfig.ts
// Single source of truth for the technical article submission form.
// Edit field sets here — the form and the body composer both read from this.
// Suggested location in your repo: src/lib/articles/articleConfig.ts

export type ArticleType = "maintenance" | "fault-diagnosis" | "modifications";

export const GENERATIONS = ["E34", "E39", "E60", "F10", "G30"] as const;
export type Generation = (typeof GENERATIONS)[number];

export const DIFFICULTY = ["Beginner", "Intermediate", "Advanced"] as const;

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "stringlist" // list of plain strings (e.g. tools, symptoms)
  | "repeater" // list of objects with fixed columns (e.g. parts)
  | "steps" // ordered list of { text, image_url? } with per-step image upload
  | "toggle" // boolean
  | "file"; // single PDF upload -> file_url

export interface RepeaterColumn {
  key: string;
  label: string;
  required?: boolean;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: readonly string[]; // select / multiselect
  columns?: RepeaterColumn[]; // repeater
  showIf?: { key: string; equals: unknown }; // conditional rendering
}

export interface ArticleTypeConfig {
  value: ArticleType;
  label: string;
  /** Which detail field's value gets mirrored into tech_articles.system */
  systemFromKey: string;
  fields: FieldDef[];
}

const maintenance: ArticleTypeConfig = {
  value: "maintenance",
  label: "Maintenance",
  systemFromKey: "system_area",
  fields: [
    {
      key: "system_area",
      label: "System / area",
      type: "select",
      required: true,
      options: [
        "Engine",
        "Cooling",
        "Suspension",
        "Brakes",
        "Electrical",
        "Drivetrain",
        "Body / Interior",
        "Other",
      ],
    },
    { key: "difficulty", label: "Difficulty", type: "select", required: true, options: DIFFICULTY },
    { key: "estimated_time", label: "Estimated time", type: "text", placeholder: "e.g. 2 hours" },
    { key: "tools", label: "Tools required", type: "stringlist", placeholder: "Add a tool" },
    {
      key: "parts",
      label: "Parts & part numbers",
      type: "repeater",
      columns: [
        { key: "name", label: "Part", required: true },
        { key: "part_number", label: "BMW part #" },
        { key: "qty", label: "Qty" },
      ],
    },
    {
      key: "torque_specs",
      label: "Torque specs",
      type: "repeater",
      columns: [
        { key: "fastener", label: "Fastener", required: true },
        { key: "value_nm", label: "Nm" },
      ],
    },
    { key: "procedure", label: "Procedure", type: "steps", required: true },
    { key: "tips", label: "Tips & common mistakes", type: "textarea" },
    { key: "pdf", label: "PDF attachment (optional)", type: "file" },
  ],
};

const faultDiagnosis: ArticleTypeConfig = {
  value: "fault-diagnosis",
  label: "Fault Diagnosis",
  systemFromKey: "affected_system",
  fields: [
    {
      key: "subtype",
      label: "Subtype",
      type: "select",
      required: true,
      options: ["DME", "BMW Coding", "Fault Codes", "Mechanical Faults"],
    },
    {
      key: "affected_system",
      label: "Affected system / engine",
      type: "text",
      required: true,
      placeholder: "e.g. N62 cooling, ZF 6HP transmission",
    },
    { key: "symptoms", label: "Symptoms", type: "stringlist", required: true, placeholder: "Add a symptom" },
    {
      key: "dtcs",
      label: "Fault codes / DTCs",
      type: "repeater",
      columns: [
        { key: "code", label: "Code", required: true },
        { key: "description", label: "Description" },
      ],
    },
    { key: "diagnostic_steps", label: "Diagnostic steps", type: "steps", required: true },
    { key: "root_cause", label: "Likely root cause(s)", type: "textarea", required: true },
    { key: "resolution", label: "Resolution / fix", type: "textarea", required: true },
    {
      key: "tools_software",
      label: "Tools / software",
      type: "multiselect",
      options: ["ISTA", "INPA", "Bimmercode", "E-sys", "NCS Expert", "Carly", "OBD scanner", "Other"],
    },
    { key: "difficulty", label: "Difficulty", type: "select", required: true, options: DIFFICULTY },
  ],
};

const modifications: ArticleTypeConfig = {
  value: "modifications",
  label: "Modifications & Retrofits",
  systemFromKey: "mod_type",
  fields: [
    {
      key: "mod_type",
      label: "Mod type",
      type: "select",
      required: true,
      options: ["Performance", "Aesthetic", "Retrofit", "Coding"],
    },
    {
      key: "parts",
      label: "Parts required",
      type: "repeater",
      columns: [
        { key: "name", label: "Part", required: true },
        { key: "part_number", label: "Part #" },
        { key: "source", label: "Source / vendor" },
        { key: "cost", label: "Cost" },
      ],
    },
    { key: "coding_required", label: "Coding / programming required?", type: "toggle" },
    {
      key: "coding_tool",
      label: "Coding tool",
      type: "select",
      options: ["Bimmercode", "E-sys", "ISTA", "NCS Expert", "Other"],
      showIf: { key: "coding_required", equals: true },
    },
    {
      key: "coding_notes",
      label: "Coding notes",
      type: "textarea",
      showIf: { key: "coding_required", equals: true },
    },
    { key: "difficulty", label: "Difficulty", type: "select", required: true, options: DIFFICULTY },
    { key: "estimated_cost", label: "Estimated cost", type: "text", placeholder: "e.g. $1,200" },
    { key: "estimated_time", label: "Estimated time", type: "text", placeholder: "e.g. a weekend" },
    {
      key: "reversibility",
      label: "Reversibility",
      type: "select",
      options: ["Fully reversible", "Partial", "Permanent"],
    },
    { key: "procedure", label: "Procedure", type: "steps", required: true },
    { key: "expected_results", label: "Expected results", type: "textarea" },
    {
      key: "warnings",
      label: "Warnings (warranty / emissions / legal)",
      type: "textarea",
    },
  ],
};

export const ARTICLE_CONFIGS: Record<ArticleType, ArticleTypeConfig> = {
  maintenance,
  "fault-diagnosis": faultDiagnosis,
  modifications,
};

export const ARTICLE_TYPE_ORDER: ArticleType[] = [
  "maintenance",
  "fault-diagnosis",
  "modifications",
];

