import marked from 'marked'
import { importDB, exportDB } from 'dexie-export-import'
import { saveAs } from 'file-saver'
import { countBy, keyBy, sortBy } from 'lodash'
import { formatJsonBlob, loadFile } from './utils'
import * as database from './database'
import { Note } from '../types'
import { generateTrigrams } from './trigram'

const NGRAM_THRESHOLD = 0.3

export async function loadLastNotes(db: database.Database, since: number = 0): Promise<Note[]> {
  const notes = await db.notes.reverse().limit(5).toArray()
  return notes
}

export function saveNote(db: database.Database, note: Note): Promise<number> {
  return db.notes.put(note)
}

export function getNoteMd(note: string): string {
  return marked(note)
}

export function removeNote(db: database.Database, note: Note): Promise<number> {
  return db.notes.where('id').equals(note.id).delete()
}

export async function search(db: database.Database, text: string): Promise<Note[]> {
  const searchTrigrams = generateTrigrams(text)
  const foundTrigrams = await db.trigrams.where('trigram').anyOf(searchTrigrams).toArray()
  if (foundTrigrams.length === 0) return []
  const weightedNotes = foundTrigrams.reduce<Record<number, number>>((acc, t) => {
    const countedNotes = countBy(t.notes)
    Object.entries(countedNotes).forEach(([noteId, amount]) => {
      const weight = amount / t.notes.length
      acc[noteId] = acc[noteId] || 0
      acc[noteId] += weight
    })
    return acc
  }, {})
  const sorted = sortBy(Object.entries(weightedNotes), c => -c[1])
  const bestResults = sorted.filter(s => s[1] > NGRAM_THRESHOLD).map(s => Number(s[0]))
  const bestNotes = await db.notes.where('id').anyOf(bestResults).toArray()
  const bestNotesById = keyBy(bestNotes, 'id')
  const sortedBestNotes = bestResults.map(r => bestNotesById[r])
  return sortedBestNotes
}

export async function importDatabase(): Promise<database.Database> {
  const file = await loadFile()
  await new database.Database().delete()
  const newDatabase = await importDB(file)
  return newDatabase as database.Database
}

export async function exportDatabase(db: database.Database) {
  const file = await exportDB(db)
  const formattedFile = await formatJsonBlob(file)
  saveAs(formattedFile, `notes-${Date.now()}.json`)
}

export function createDatabase() {
  return new database.Database()
}

export function rebuildIndex(db: database.Database): Promise<void> {
  return database.rebuildIndex(db)
}
