import { TRANSLITERATOR_MAPPINGS } from '../data/takri-mappings';

export class OfflineTransliterator {
  constructor() {
    this.tokens = this._buildTokenList();
  }

  _buildTokenList() {
    const rom = TRANSLITERATOR_MAPPINGS.roman;
    const tokens = [];

    rom.consonants.forEach((r, i) => {
      tokens.push({ roman: r, type: 'consonant', index: i });
    });
    rom.persoarabic.forEach((r, i) => {
      tokens.push({ roman: r, type: 'persoarabic', index: i });
    });
    rom.south.forEach((r, i) => {
      tokens.push({ roman: r, type: 'south', index: i });
    });
    rom.vowels.forEach((r, i) => {
      tokens.push({ roman: r, type: 'vowel', index: i });
    });
    tokens.push({ roman: rom.ayogavaha.anusvara, type: 'anusvara', index: 0 });
    tokens.push({ roman: rom.ayogavaha.visarga, type: 'visarga', index: 0 });
    tokens.push({ roman: rom.symbols.om, type: 'om', index: 0 });
    tokens.push({ roman: rom.symbols.doubleDanda, type: 'doubleDanda', index: 0 });
    tokens.push({ roman: rom.symbols.danda, type: 'danda', index: 0 });
    tokens.push({ roman: rom.symbols.avagraha, type: 'avagraha', index: 0 });

    tokens.sort((a, b) => b.roman.length - a.roman.length);
    return tokens;
  }

  tokenize(input) {
    const result = [];
    let pos = 0;
    const lower = input.toLowerCase();

    while (pos < lower.length) {
      let matched = false;

      for (const token of this.tokens) {
        if (lower.startsWith(token.roman, pos)) {
          const endPos = pos + token.roman.length;

          if (token.type === 'consonant' || token.type === 'persoarabic' || token.type === 'south') {
            const rest = lower.slice(endPos);
            let vowelSign = null;
            let vowelLen = 0;

            for (const vt of this.tokens) {
              if (vt.type === 'vowel' && vt.index > 0 && rest.startsWith(vt.roman)) {
                if (!vowelSign || vt.roman.length > vowelLen) {
                  vowelSign = vt;
                  vowelLen = vt.roman.length;
                }
              }
            }

            if (vowelSign) {
              result.push(token);
              result.push({ ...vowelSign, type: 'vowelSign', index: vowelSign.index - 1 });
              pos = endPos + vowelLen;
            } else if (rest.startsWith('a') && !rest.startsWith('aa') && !rest.startsWith('ai') && !rest.startsWith('au') && !rest.startsWith('a;')) {
              result.push(token);
              pos = endPos + 1;
            } else {
              const isEndOrNonAlpha = rest.length === 0 || /^[^a-z;']/.test(rest) || rest.startsWith(' ');
              let nextIsConsonant = false;
              for (const nt of this.tokens) {
                if ((nt.type === 'consonant' || nt.type === 'persoarabic' || nt.type === 'south') && rest.startsWith(nt.roman)) {
                  nextIsConsonant = true;
                  break;
                }
              }
              const nextIsAyogavaha = rest.startsWith(TRANSLITERATOR_MAPPINGS.roman.ayogavaha.anusvara) ||
                                     rest.startsWith(TRANSLITERATOR_MAPPINGS.roman.ayogavaha.visarga);

              if (nextIsConsonant) {
                result.push(token);
                result.push({ type: 'virama', index: 0 });
                pos = endPos;
              } else if (isEndOrNonAlpha) {
                result.push(token);
                result.push({ type: 'virama', index: 0 });
                pos = endPos;
              } else if (nextIsAyogavaha) {
                result.push(token);
                pos = endPos;
              } else {
                result.push(token);
                pos = endPos;
              }
            }
          } else {
            result.push(token);
            pos = endPos;
          }
          matched = true;
          break;
        }
      }

      if (!matched) {
        result.push({ type: 'passthrough', char: input[pos] });
        pos++;
      }
    }

    return result;
  }

  render(tokens, script) {
    const map = TRANSLITERATOR_MAPPINGS[script];
    let output = '';

    for (const token of tokens) {
      switch (token.type) {
        case 'consonant': output += map.consonants[token.index]; break;
        case 'persoarabic': output += map.persoarabic[token.index]; break;
        case 'south': output += map.south[token.index]; break;
        case 'vowel': output += map.vowels[token.index]; break;
        case 'vowelSign': output += map.vowelSigns[token.index]; break;
        case 'virama': output += map.virama; break;
        case 'anusvara': output += map.anusvara; break;
        case 'visarga': output += map.visarga; break;
        case 'om': output += map.symbols.om; break;
        case 'danda': output += map.symbols.danda; break;
        case 'doubleDanda': output += map.symbols.doubleDanda; break;
        case 'avagraha': output += map.symbols.avagraha; break;
        case 'passthrough':
          if (/[0-9]/.test(token.char) && map.numerals) {
            output += map.numerals[parseInt(token.char)];
          } else {
            output += token.char;
          }
          break;
        default: break;
      }
    }
    return output;
  }

  transliterate(input, script) {
    if (!input.trim()) return '';
    const tokens = this.tokenize(input);
    return this.render(tokens, script);
  }
}

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
