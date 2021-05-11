import React, { useCallback, useEffect, useState } from 'react'
import { getNoteMd } from '../lib/storage'
import { Note } from '../types'

interface Props {
  note: Note
  closeNote: () => void
  saveNote: (note: Note) => void
}

export function EditNote(p: Props) {
  const [currentText, setCurrentText] = useState<string>(p.note.text)

  function onNoteChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setCurrentText(e.target.value)
  }

  const closeNote = useCallback(() => {
    const save = window.confirm('Do you want to save the note?')
    const updatedNote = { ...p.note, text: currentText }
    if (save) p.saveNote(updatedNote)
    p.closeNote()
  }, [p, currentText])

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Escape') return
    return closeNote()
  }, [closeNote])

  const currentTextMd = getNoteMd(currentText)

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])

  return (
    <div className="w-100 ph4 flex justify-center relative h-100">
      <div className="w-70 ph4 flex flex-column items-center justify-center h-100">
        <div className="w-100 ba b--black bg-white h-40 mb3">
          <textarea value={currentText} onChange={onNoteChange} className="w-100 b--none h-100" />
        </div>
        <div className="bg-white w-100 h-40 ph2" dangerouslySetInnerHTML={{ __html: currentTextMd }} />
      </div>
      <div className="absolute top-0 right-0 pa4 f2 pointer" onClick={closeNote}>X</div>
    </div>
  )
}
