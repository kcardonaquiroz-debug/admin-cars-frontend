// Reduce el tamaño de una foto antes de subirla (máx. 1280 px, JPEG).
// Así sube más rápido y ocupa poco espacio en la base de datos.
export async function comprimirImagen(file, maxLado = 1280, calidad = 0.82) {
  if (!file?.type?.startsWith('image/')) throw new Error('Selecciona una imagen válida')
  if (file.type === 'image/gif') return file // los GIF se suben tal cual

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('No se pudo leer la imagen'))
      i.src = url
    })
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * escala)
    canvas.height = Math.round(img.height * escala)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff' // fondo blanco para PNG con transparencia
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', calidad))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
  } finally {
    URL.revokeObjectURL(url)
  }
}
