export type CoverColor = "indigo" | "teal" | "coral" | "amber" | "violet" | "emerald";

export const COVER_COLORS: { value: CoverColor; label: string; bg: string; ring: string }[] = [
  { value: "indigo", label: "Indigo", bg: "bg-gradient-to-br from-[hsl(244_75%_60%)] to-[hsl(250_90%_72%)]", ring: "ring-[hsl(244_75%_60%)]" },
  { value: "teal", label: "Teal", bg: "bg-gradient-to-br from-[hsl(174_62%_47%)] to-[hsl(190_85%_55%)]", ring: "ring-[hsl(174_62%_47%)]" },
  { value: "coral", label: "Coral", bg: "bg-gradient-to-br from-[hsl(6_90%_67%)] to-[hsl(20_95%_70%)]", ring: "ring-[hsl(6_90%_67%)]" },
  { value: "amber", label: "Amber", bg: "bg-gradient-to-br from-[hsl(38_92%_55%)] to-[hsl(28_95%_60%)]", ring: "ring-[hsl(38_92%_55%)]" },
  { value: "violet", label: "Violet", bg: "bg-gradient-to-br from-[hsl(280_75%_60%)] to-[hsl(310_80%_70%)]", ring: "ring-[hsl(280_75%_60%)]" },
  { value: "emerald", label: "Emerald", bg: "bg-gradient-to-br from-[hsl(152_60%_42%)] to-[hsl(170_70%_55%)]", ring: "ring-[hsl(152_60%_42%)]" },
];

export const coverBg = (c: string | null | undefined) =>
  COVER_COLORS.find((x) => x.value === c)?.bg ?? COVER_COLORS[0].bg;

export function readingTime(md: string) {
  const words = md.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function formatDate(d: string | Date | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
