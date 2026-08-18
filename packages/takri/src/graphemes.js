/**
 * Split text into grapheme clusters using Intl.Segmenter.
 * Defaults to Takri locale for conjunct-safe character boundaries.
 */
export function graphemes(text, locale = 'und-Takr') {
  if (!text) return [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter(locale, { granularity: 'grapheme' }).segment(text)].map(
      (s) => s.segment
    );
  }
  return [...text];
}
