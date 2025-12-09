let brushSize = localStorage.getItem('brushSize') || 1
document.getElementById('bs').textContent = `brush size: ${brushSize}`

document.getElementById('brushSize').value = brushSize

document.getElementById('brushSize').addEventListener('input', e => {
  brushSize = e.target.value
  localStorage.setItem('brushSize', brushSize)

  document.getElementById('bs').textContent = `brush size: ${brushSize}`
})
