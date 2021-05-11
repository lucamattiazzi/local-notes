import React, { ReactChild, useEffect, useRef, useState } from 'react'
import marked from 'marked'
import { EditNote } from './EditNote'
import * as storage from '../lib/storage'
import { IDatabase, Note } from '../types'

interface OverlayProps {
  children: ReactChild
}

function OverlayWrapper(p: OverlayProps) {
  return (
    <div className="w-100 h-100 absolute flex items-center justify-center top-0 left-0 bg-white-70">
      {p.children}
    </div>
  )
}

export function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note>(null)
  const [search, setSearch] = useState<string>('')

  const db = useRef<IDatabase>(null)

  function createNewNote() {
    const newNote = {
      timestamp: Date.now(),
      text: '',
    }
    setCurrentNote(newNote)
  }

  function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
  }

  async function deleteNote(note: Note) {
    const confirm = window.confirm('Do you want to delete the note?')
    if (!confirm) return
    await storage.removeNote(db.current, note)
    const filteredNotes = notes.filter(n => n.id !== note.id)
    setNotes(filteredNotes)
  }

  async function loadLastNotes() {
    const visibleNotes = await storage.loadLastNotes(db.current)
    setNotes(visibleNotes)
  }

  async function saveNote(updatedNote: Note) {
    await storage.saveNote(db.current, updatedNote)
    loadLastNotes()
  }

  function closeNote() {
    setCurrentNote(null)
  }

  async function importDatabase() {
    db.current = await storage.importDatabase()
    loadLastNotes()
  }

  function exportDatabase() {
    storage.exportDatabase(db.current)
  }

  async function rebuildIndex() {
    await storage.rebuildIndex(db.current)
    window.alert('Rebuilt!')
  }

  useEffect(() => {
    if (!db.current) return
    if (search.length === 0) return loadLastNotes() && undefined
    async function findNewNotes() {
      const foundNotes = await storage.search(db.current, search)
      setNotes(foundNotes)
    }
    findNewNotes()
  }, [search])

  useEffect(() => {
    const onMount = async () => {
      db.current = await storage.createDatabase()
      loadLastNotes()
    }
    onMount()
  }, [])

  return (
    <div className="w-100 h-100 bg-black-10 flex justify-center">
      <div className="w-70 ph3 pb4 pt3 flex flex-column items-center">
        <div className="pv2 flex w-100 justify-center">
          <div className="b f1">Local Notes</div>
        </div>
        <div className="pointer f3 b pa3 bg-blue br3 mv3" onClick={createNewNote}>Create New Note</div>
        <div className="w-70 pv3 flex items-center justify-between">
          <div className="pointer pa2 bg-blue br3" onClick={exportDatabase}>Export Database</div>
          <div className="pointer pa2 bg-blue br3" onClick={rebuildIndex}>Rebuild Index</div>
          <div className="pointer pa2 bg-blue br3" onClick={importDatabase}>Import Database</div>
        </div>
        <h2 className="tc pt3">Search</h2>
        <input type="text" value={search} onChange={onSearchChange} className="w-70 pa3" />
        <div className="flex flex-column ph3 overflow-y-auto h-auto w-100">
          {(notes).map((note) => (
            <div className="pv4 w-100" key={note.id}>
              <div className="w-100 justify-between flex">
                <div className="f6 b pb2">{new Date(note.timestamp).toISOString().slice(0, 10)}</div>
                <div className="flex">
                  <div className="f6 b pointer pr3" onClick={() => setCurrentNote(note)}>edit</div>
                  <div className="f6 b pointer" onClick={() => deleteNote(note)}>delete</div>
                </div>
              </div>
              <div className="f5" dangerouslySetInnerHTML={{ __html: marked(note.text) }} />
              <hr className="ba b--black" />
            </div>
          ))}
        </div>
        {
          currentNote && <OverlayWrapper><EditNote closeNote={closeNote} saveNote={saveNote} note={currentNote} /></OverlayWrapper>
        }
      </div>
    </div>
  )
}
