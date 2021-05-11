import { uniq } from 'lodash'

const NGRAMS_LENGTH = 3

function createTrigrams(word: string): string[] {
  const trigrams = []
  const wordLength = Math.max(word.length, 3)
  for (let i = 0; i < wordLength - NGRAMS_LENGTH + 1; i++) {
    const trigram = word.slice(i, i + NGRAMS_LENGTH)
    trigrams.push(trigram)
  }
  return trigrams
}

function cleanText(text: string): string {
  const lowercased = text.toLocaleLowerCase()
  const cleaned = lowercased.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return cleaned
}

function divideInWords(sentence: string): string[] {
  return sentence.match(/\b(\w+)\b/g)
}

export function generateTrigrams(sentence: string, shouldUnique: boolean = false): string[] {
  const cleaned = cleanText(sentence)
  const words = divideInWords(cleaned)
  const trigrams = words.reduce<string[]>((acc, word) => {
    const wordTrigrams = createTrigrams(word)
    return [...acc, ...wordTrigrams]
  }, [])
  return shouldUnique ? uniq(trigrams) : trigrams
}
