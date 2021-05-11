export function loadFile(attrs: Record<string, string> = {}): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    for (const key of Object.keys(attrs)) {
      input.setAttribute(key, attrs[key])
    }
    input.onchange = () => {
      const file = input.files[0]
      resolve(file)
    }
    input.click()
  })
}

export function formatJsonBlob(file: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      const parsed = JSON.parse(fileReader.result as string)
      const formatted = JSON.stringify(parsed, null, 2)
      const formattedFile = new Blob([formatted], { type: 'application/json' })
      resolve(formattedFile)
    }
    fileReader.readAsText(file)
  })
}
