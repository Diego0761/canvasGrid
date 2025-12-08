const colors = document.querySelectorAll('.color')

let selectedColor = localStorage.getItem('selectedColor') || '#000000'

const selectedDiv = document.getElementById(selectedColor)
selectedDiv.classList.add('selected-color')

colors.forEach(colorDiv => {
  colorDiv.style.backgroundColor = colorDiv.id

  colorDiv.addEventListener('click', () => {
    selectedColor = colorDiv.id
    localStorage.setItem('selectedColor', selectedColor)
    colors.forEach(c => c.classList.remove('selected-color'))
    colorDiv.classList.add('selected-color')
  })
})
