export { OfflineTransliterator } from '@nextcraft/takri';

const API_BASE = 'https://aksharamukha.appspot.com/api/public';

export async function apiTransliterate(text, targetScript) {
  const target = targetScript === 'devanagari' ? 'Devanagari' : 'Takri';
  const url = `${API_BASE}?source=RomanReadable&target=${target}&text=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return await response.text();
}

export async function apiReverseTransliterate(text, targetScript) {
  const target = targetScript === 'devanagari' ? 'Devanagari' : 'RomanReadable';
  const url = `${API_BASE}?source=Takri&target=${target}&text=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return await response.text();
}
