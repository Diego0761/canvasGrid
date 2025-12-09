// TODO
// ctrl + z to undo last paint/erase action
// color picker
// preview under cursor
// different brush sizes

let paint = false
let erase = false
let move = true

const defaultStates = {
  move: {
    move: true,
    paint: false,
    erase: false
  },
  paint: {
    move: false,
    paint: true,
    erase: false
  },
  erase: {
    move: false,
    paint: false,
    erase: true
  }
}

const buttons = [
  document.getElementById('move'),
  document.getElementById('paint'),
  document.getElementById('erase')
]

const a = {
  move: 0,
  paint: 1,
  erase: 2
}
let selectedButton = buttons[a[localStorage.getItem('lastTool')]] || buttons[0]
selectedButton.classList.add('selected')
updateSelectedButton(selectedButton)

function updateSelectedButton(button) {
  if (button.id === 'move') {
    move = true
    paint = false
    erase = false
  } else if (button.id === 'paint') {
    move = false
    paint = true
    erase = false
  } else if (button.id === 'erase') {
    move = false
    paint = false
    erase = true
  }
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    updateSelectedButton(button)
    localStorage.setItem('lastTool', button.id)
    selectedButton.classList.remove('selected')
    button.classList.add('selected')
    selectedButton = button
  })
})

let originPos = JSON.parse(localStorage.getItem('lastOrigin')) || {
  x: 0,
  y: 0
}

const lastAction = []

let lastMouse = { x: 0, y: 0 }

let mouseState = 'off'

let globalMousePos = { x: 0, y: 0 }

let startOrigin = { x: 0, y: 0 }

let gridSize = 32

let square = {
  worldX: 1024,
  worldY: 512,
  setChunk(chunk) {
    this.worldX = chunk.x * gridSize
    this.worldY = chunk.y * gridSize
  },
  size: gridSize
}

const previewSquare = {
  worldX: 0,
  worldY: 0,
  size: gridSize,
  color: '#00000033'
}

let coloredChunks = JSON.parse(localStorage.getItem('coloredChunks')) || []

function paintChunk({ x, y }) {
  const chunk = coloredChunks.some(chunk => chunk.x === x && chunk.y === y)

  //get chunk index from coloredChunks
  const chunkIndex = coloredChunks.findIndex(
    chunk => chunk.x === x && chunk.y === y
  )
  chunkIndex !== -1 && (coloredChunks[chunkIndex].color = selectedColor)

  if (!chunk) {
    coloredChunks.push({
      x: x,
      y: y,
      color: selectedColor
    })
  }

  localStorage.setItem('coloredChunks', JSON.stringify(coloredChunks))
}

function getChunkFromWorldPos(x, y) {
  return {
    x: Math.floor(x / gridSize),
    y: Math.floor(y / gridSize)
  }
}

function clearGrid() {
  coloredChunks = []
  localStorage.removeItem('coloredChunks')
  drawGrid()
  console.log('Cleared grid and localStorage')
}

function Erase() {
  erase = true

  const chunk = getChunkFromWorldPos(globalMousePos.x, globalMousePos.y)

  if (coloredChunks.some(c => c.x === chunk.x && c.y === chunk.y)) {
    coloredChunks = coloredChunks.filter(
      c => !(c.x === chunk.x && c.y === chunk.y)
    )
    console.log('Erased chunk at:', chunk.x, chunk.y)
    localStorage.setItem('coloredChunks', JSON.stringify(coloredChunks))
    drawGrid()
  }
}

square.setChunk({ x: 16, y: 16 })

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

let startX, startY

function drawGrid() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight - 100

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#00000033'

  startX = (originPos.x % gridSize) - gridSize
  startY = (originPos.y % gridSize) - gridSize

  for (let x = startX; x <= canvas.width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }

  for (let y = startY; y <= canvas.height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }

  for (chunk in coloredChunks) {
    const c = coloredChunks[chunk]

    ctx.fillStyle = c.color || '#000000'

    ctx.fillRect(
      c.x * gridSize + originPos.x,
      c.y * gridSize + originPos.y,
      gridSize,
      gridSize
    )
  }
}

// -----

canvas.addEventListener('mousedown', e => {
  mouseState = 'on'

  console.log('Mouse Down at:', e.clientX, e.clientY)
  lastMouse.x = e.clientX
  lastMouse.y = e.clientY
  startOrigin.x = originPos.x
  startOrigin.y = originPos.y

  if (e.button === 1) {
    erase = false
    paint = false
    move = true
  }

  if (e.button === 0 && paint) {
    Paint()
    drawGrid()
    console.log(mouseState)
    return
  }
})

function Paint() {
  getAroundChunks(globalMousePos.x, globalMousePos.y, brushSize - 1).forEach(
    chunk => {
      paintChunk(chunk)
    }
  )
}

canvas.addEventListener('mouseup', e => {
  mouseState = 'off'
  localStorage.setItem('lastOrigin', JSON.stringify(originPos))

  console.log('Mouse Up at:', e.clientX, e.clientY)
  console.log('paint ', paint)

  if (e.button === 1) {
    erase = defaultStates[selectedButton.id].erase
    paint = defaultStates[selectedButton.id].paint
    move = defaultStates[selectedButton.id].move
  }
})

canvas.addEventListener('mousemove', e => {
  document.getElementById(
    'mouseXY'
  ).textContent = `mouse_local: [${e.clientX}, ${e.clientY}]`
  document.getElementById(
    'startXY'
  ).textContent = `start: [${startX}, ${startY}]`
  document.getElementById(
    'originPosXY'
  ).textContent = `origin: [${originPos.x}, ${originPos.y}]`
  globalMousePos.x = e.clientX - originPos.x
  globalMousePos.y = e.clientY - originPos.y

  document.getElementById(
    'globalMousePosXY'
  ).textContent = `mouse_global: [${globalMousePos.x}, ${globalMousePos.y}]`

  if (paint && mouseState === 'on') {
    Paint()
    drawGrid()
    return
  }

  if (erase && mouseState === 'on') {
    Erase()
    return
  }

  if (move && mouseState === 'on') {
    const deltaX = e.clientX - lastMouse.x
    const deltaY = e.clientY - lastMouse.y

    originPos.x += deltaX
    originPos.y += deltaY

    lastMouse.x = e.clientX
    lastMouse.y = e.clientY

    drawGrid()
  }
})

canvas.addEventListener('contextmenu', e => {
  e.preventDefault()
})

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const info = document.querySelector('.info')
    if (info.style.display === 'none') {
      info.style.display = 'flex'
    } else {
      info.style.display = 'none'
    }
  }
})

function getAroundChunks(x, y, range) {
  const middleChunk = getChunkFromWorldPos(x, y)
  const chunks = []
  for (let i = -range; i <= range; i++) {
    for (let j = -range; j <= range; j++) {
      chunks.push({ x: middleChunk.x + i, y: middleChunk.y + j })
    }
  }
  return chunks
}

drawGrid()

window.addEventListener('resize', drawGrid)
