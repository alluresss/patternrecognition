const colors = ['white', 'gray', 'black'];
const shapes = ['square', 'circle', 'triangle'];

let grid = [];

function createCell(index) {
  let cell = document.createElement('div');
  cell.className = 'cell white';

  grid[index] = { color: 0, shape: 0 };

  cell.onclick = () => {
    let g = grid[index];

    g.shape++;
    if (g.shape >= shapes.length) {
      g.shape = 0;
      g.color = (g.color + 1) % colors.length;
    }

    updateCell(cell, g);
  };

  return cell;
}

function updateCell(cell, g) {
  cell.className = 'cell ' + colors[g.color];
  cell.innerHTML = '';

  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  if (shapes[g.shape] === 'square') {
    let rect = document.createElementNS(svg.namespaceURI, 'rect');
    rect.setAttribute('x', 10);
    rect.setAttribute('y', 10);
    rect.setAttribute('width', 40);
    rect.setAttribute('height', 40);
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', 'black');
    svg.appendChild(rect);
  }

  if (shapes[g.shape] === 'circle') {
    let circle = document.createElementNS(svg.namespaceURI, 'circle');
    circle.setAttribute('cx', 30);
    circle.setAttribute('cy', 30);
    circle.setAttribute('r', 20);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', 'black');
    svg.appendChild(circle);
  }

  if (shapes[g.shape] === 'triangle') {
    let tri = document.createElementNS(svg.namespaceURI, 'polygon');
    tri.setAttribute('points', '30,10 10,50 50,50');
    tri.setAttribute('fill', 'none');
    tri.setAttribute('stroke', 'black');
    svg.appendChild(tri);
  }

  cell.appendChild(svg);
}

function init() {
  let gridDiv = document.getElementById('grid');
  for (let i = 0; i < 9; i++) {
    let cell = createCell(i);
    gridDiv.appendChild(cell);
  }
}

function checkGrid() {
  let valid = true;

  // Example rule: each row has different colors
  for (let r = 0; r < 3; r++) {
    let seen = new Set();
    for (let c = 0; c < 3; c++) {
      let idx = r * 3 + c;
      let color = grid[idx].color;

      if (seen.has(color)) {
        valid = false;
      }
      seen.add(color);
    }
  }

  document.getElementById('result').textContent =
    valid ? "Valid" : "Invalid";
}

init();
