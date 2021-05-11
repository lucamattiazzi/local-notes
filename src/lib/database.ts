import Dexie from 'dexie'
import { Note, Trigram, IDatabase } from '../types'
import { generateTrigrams } from './trigram'

const NOTES = 'notes'
const TRIGRAMS = 'trigrams'

export class Database extends Dexie implements IDatabase {
  notes: Dexie.Table<Note, number>
  trigrams: Dexie.Table<Trigram, number>

  constructor() {
    super(NOTES)
    this.version(1).stores({
      notes: '++id, timestamp, text',
      trigrams: '&trigram, *notes',
    })
    this.notes = this.table(NOTES)
    this.trigrams = this.table(TRIGRAMS)
  }
}

export async function rebuildIndex(database: Database): Promise<void> {
  const allNotes = await database.notes.toArray()
  const trigrams: Record<string, Note['id'][]> = {}
  for (const note of allNotes) {
    const noteTrigrams = generateTrigrams(note.text)
    for (const trigram of noteTrigrams) {
      trigrams[trigram] = trigrams[trigram] || []
      trigrams[trigram].push(note.id)
    }
  }
  const tableTrigrams = Object.entries(trigrams).map(t => ({ trigram: t[0], notes: t[1] }))
  await database.trigrams.clear()
  await database.trigrams.bulkAdd(tableTrigrams)
}
