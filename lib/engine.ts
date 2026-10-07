import { clamp, countWords, type Mode } from "@/lib/tokens";

export type Sentence = {
  text: string;
  score: number;
  flagged: boolean;
  note: string;
  /** API label: AI-generated, Human-written, or Inconclusive. */
  label?: string;
};

const AI_WORDS = [
  "moreover", "furthermore", "in conclusion", "delve", "crucial", "leverage", "utilize",
  "it is important to note", "in today's", "landscape", "tapestry", "seamless", "robust",
  "pivotal", "comprehensive", "ensure", "additionally", "enhance", "facilitate",
  "multifaceted", "navigating", "i hope this email finds you well",
];

export function detect(text: string): { score: number; sentences: Sentence[] } {
  const parts = text.match(/[^.!?]+[.!?]*\s*/g) ?? [];
  const sentences = parts.map((s) => {
    const l = s.toLowerCase();
    const words = countWords(s);
    const hits = AI_WORDS.filter((w) => l.includes(w));
    let sc = 20 + hits.length * 28;
    if (words > 26) sc += 15;
    if (words > 8 && !/\b\w+'(s|t|re|ve|ll|d|m)\b/.test(l)) sc += 10;
    if (words < 7) sc -= 10;
    sc = clamp(sc, 3, 98);
    const note = hits.length
      ? `${hits.slice(0, 2).map((h) => `“${h}”`).join(" + ")} — classic AI phrasing`
      : words > 26 ? "very long, perfectly even rhythm" : "stiff, no contractions";
    return { text: s, score: sc, flagged: sc >= 50, note };
  });
  const total = parts.reduce((a, s) => a + countWords(s), 0) || 1;
  const weighted = sentences.reduce((a, s) => a + s.score * (countWords(s.text) / total), 0);
  return { score: Math.round(clamp(weighted, 2, 98)), sentences };
}

const SWAPS: [RegExp, string][] = [
  [/\bit is important to note that\s*/gi, ""],
  [/\bIn today's [\w\- ]*?landscape,?\s*/gi, "These days, "],
  [/\bI hope this email finds you well\.?\s*/gi, "Hope your week's going well. "],
  [/\bMoreover,?\s*/gi, "Plus, "], [/\bFurthermore,?\s*/gi, "And "],
  [/\bAdditionally,?\s*/gi, "Also, "], [/\bIn conclusion,?\s*/gi, "So, "],
  [/\bdelve into\b/gi, "dig into"], [/\bleverage\b/gi, "use"], [/\butilize\b/gi, "use"],
  [/\bcrucial\b/gi, "key"], [/\bpivotal\b/gi, "big"], [/\bseamless\b/gi, "smooth"],
  [/\brobust\b/gi, "solid"], [/\bcomprehensive\b/gi, "full"], [/\bfacilitate\b/gi, "drive"],
  [/\benhance\b/gi, "improve"], [/\bensure\b/gi, "make sure"], [/\bmultifaceted\b/gi, "tricky"],
  [/\bnavigating\b/gi, "handling"], [/\bcannot\b/gi, "can't"], [/\bdo not\b/gi, "don't"],
  [/\bwill not\b/gi, "won't"], [/\bwe are\b/gi, "we're"], [/\bI am\b/g, "I'm"],
];
const CASUAL: [RegExp, string][] = [
  [/\bHowever,?\s*/gi, "But "], [/\bTherefore,?\s*/gi, "So "], [/\bin order to\b/gi, "to"],
];

export async function humanizeText(text: string, mode: Mode): Promise<string> {
  const rules = mode === "Casual" ? [...SWAPS, ...CASUAL] : SWAPS;
  return rules.reduce((t, [re, to]) => t.replace(re, to), text).replace(/\s{2,}/g, " ").trim();
}

export const SAMPLES = [
  { id: "essay", title: "Essay", icon: "pen", text: "In today's fast-paced digital landscape, it is important to note that education must leverage robust technology to ensure seamless learning. Moreover, a comprehensive curriculum is crucial for navigating the multifaceted challenges students face. Furthermore, schools that utilize adaptive tools can facilitate better outcomes. In conclusion, we cannot ignore how pivotal these tools are to long-term success." },
  { id: "email", title: "Email", icon: "mail", text: "I hope this email finds you well. I am writing to ensure that we leverage our robust partnership going forward. Moreover, it is important to note that a comprehensive review of the timeline is crucial. Furthermore, we will not be able to facilitate delivery without your seamless cooperation. In conclusion, I look forward to hearing from you." },
  { id: "blog", title: "Blog post", icon: "doc", text: "Delve into the tapestry of modern marketing, where businesses must utilize pivotal strategies to enhance engagement. Additionally, a robust content plan can facilitate seamless growth. Furthermore, it is important to note that audiences value authenticity. In conclusion, brands that leverage these insights will thrive." },
];
