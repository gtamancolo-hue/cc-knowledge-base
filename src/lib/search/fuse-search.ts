import Fuse, { IFuseOptions, FuseResultMatch } from "fuse.js";
import { Article, SynonymDictionary } from "@/types/database";
import { DEFAULT_SYNONYMS } from "@/lib/data/mock-data";

export interface SearchFilterOptions {
  categoryId?: string | null;
  tag?: string | null;
  contentType?: "all" | "cheatsheet" | "regulation";
}

export interface SearchResultItem {
  article: Article;
  score?: number;
  matches?: readonly FuseResultMatch[];
  matchedSynonym?: {
    searchedTerm: string;
    canonicalKey: string;
  };
}

/**
 * Normalizes Russian text (lowercase, trims punctuation)
 */
export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/[.,!?;:()]/g, "");
}

/**
 * Finds if the given query or word matches any known synonym in the dictionary
 */
export function resolveSynonyms(
  query: string,
  dict: SynonymDictionary = DEFAULT_SYNONYMS
): { expandedTerms: string[]; matchedInfo?: { searchedTerm: string; canonicalKey: string } } {
  const normalized = normalizeQuery(query);
  const terms = new Set<string>([normalized]);
  let matchedInfo: { searchedTerm: string; canonicalKey: string } | undefined;

  for (const [canonical, synonyms] of Object.entries(dict)) {
    const canonicalNorm = canonical.toLowerCase();
    const synonymNorms = synonyms.map((s) => s.toLowerCase());

    // Check if query is canonical
    if (normalized === canonicalNorm || normalized.includes(canonicalNorm)) {
      synonymNorms.forEach((s) => terms.add(s));
      matchedInfo = { searchedTerm: canonical, canonicalKey: canonical };
      break;
    }

    // Check if query matches one of the synonyms
    const matchedSyn = synonymNorms.find((syn) => normalized === syn || normalized.includes(syn));
    if (matchedSyn) {
      terms.add(canonicalNorm);
      synonymNorms.forEach((s) => terms.add(s));
      matchedInfo = { searchedTerm: matchedSyn, canonicalKey: canonical };
      break;
    }
  }

  return {
    expandedTerms: Array.from(terms),
    matchedInfo,
  };
}

/**
 * Configures Fuse.js instance for searching articles
 */
export function createFuseIndex(articles: Article[]) {
  const options: IFuseOptions<Article> = {
    includeScore: true,
    includeMatches: true,
    threshold: 0.35, // Balanced fuzzy tolerance for typos in Russian
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: "title", weight: 0.4 },
      { name: "tags_array", weight: 0.25 },
      { name: "synonyms_array", weight: 0.2 },
      { name: "short_steps_json.title", weight: 0.15 },
      { name: "short_steps_json.desc", weight: 0.15 },
      { name: "branching_scenarios_json.condition", weight: 0.15 },
      { name: "branching_scenarios_json.action", weight: 0.15 },
      { name: "quick_scripts_json.text", weight: 0.15 },
      { name: "full_content_markdown", weight: 0.1 },
    ],
  };

  return new Fuse(articles, options);
}

/**
 * Performs fuzzy search with synonym expansion and category/tag filtering
 */
export function searchKnowledgeBase(
  articles: Article[],
  rawQuery: string,
  options?: SearchFilterOptions,
  dict: SynonymDictionary = DEFAULT_SYNONYMS
): SearchResultItem[] {
  const query = rawQuery.trim();
  if (!query) return [];

  const { expandedTerms, matchedInfo } = resolveSynonyms(query, dict);
  const fuse = createFuseIndex(articles);

  const resultMap = new Map<string, SearchResultItem>();

  // Search each expanded query term
  expandedTerms.forEach((term) => {
    const results = fuse.search(term);
    results.forEach((res) => {
      const existing = resultMap.get(res.item.id);
      const score = res.score ?? 1;

      if (!existing || (existing.score ?? 1) > score) {
        resultMap.set(res.item.id, {
          article: res.item,
          score,
          matches: res.matches,
          matchedSynonym: term !== query.toLowerCase() ? matchedInfo : undefined,
        });
      }
    });
  });

  let items = Array.from(resultMap.values()).sort(
    (a, b) => (a.score ?? 1) - (b.score ?? 1)
  );

  // Apply filters
  if (options?.categoryId) {
    items = items.filter((item) => item.article.category_id === options.categoryId);
  }

  if (options?.tag) {
    items = items.filter((item) =>
      item.article.tags_array.some((t) => t.toLowerCase() === options.tag?.toLowerCase())
    );
  }

  if (options?.contentType === "cheatsheet") {
    // Only articles that have short steps defined
    items = items.filter((item) => item.article.short_steps_json.length > 0);
  }

  return items;
}
