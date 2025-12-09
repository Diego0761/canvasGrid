function drawGrid() {
  let gridSize = 32

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

  // //draw preview
  // if (paint || erase) {
  //   const chunk = getChunkFromWorldPos(globalMousePos.x, globalMousePos.y)
  //   ctx.fillStyle = '#e90a0a88'
  //   ctx.fillRect(chunk.x * gridSize + originPos.x, chunk.y * gridSize + originPos.y, gridSize, gridSize)
  // }
}
