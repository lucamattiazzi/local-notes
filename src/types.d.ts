/// <reference types="accurapp-scripts" />
import Dexie from 'dexie'

export interface Note {
  id?: number
  timestamp: number
  text: string
}
export interface Trigram {
  trigram: string
  notes: number[]
}

export interface IDatabase extends Dexie {
  notes: Dexie.Table<Note, number>
  trigrams: Dexie.Table<Trigram, number>
}
