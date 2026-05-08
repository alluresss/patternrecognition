const colors = ['white', 'gray', 'black'];
const shapes = ['blank', 'square', 'circle', 'triangle'];

const puzzles = [
  {
    rule: 'The upper-right cell must be blank.',
    validate: () => isBlank(2)
  },
  {
    rule: 'There must be at least one blank cell, and every blank cell must touch only black squares horizontally or vertically.',
    validate: () => blankIndexes().length > 0
      && blankIndexes().every(index => orthogonalNeighbors(index).every(neighbor => isCell(neighbor, 'black', 'square')))
  },
  {
    rule: 'At least 8 grid cells must be filled with a shape instead of left blank.',
    validate: () => grid.filter(cell => !isBlankCell(cell)).length >= 8
  },
  {
    rule: 'Any circle on the board must appear in the left column.',
    validate: () => grid.every((cell, index) => cell.shape !== shapeIndex('circle') || column(0).includes(index))
  },
  {
    rule: 'The board must contain a white circle, a gray circle, and a black circle.',
    validate: () => colors.every(color => grid.some(cell => isCellState(cell, color, 'circle')))
  },
  {
    rule: 'The upper row must contain exactly one filled gray shape.',
    validate: () => row(0).filter(index => grid[index].color === colorIndex('gray') && !isBlank(index)).length === 1
  },
  {
    rule: 'The board must contain at least one white square, one white circle, and one white triangle.',
    validate: () => ['square', 'circle', 'triangle'].every(shape => grid.some(cell => isCellState(cell, 'white', shape)))
  },
  {
    rule: 'The center cell must be a white triangle.',
    validate: () => isCell(4, 'white', 'triangle')
  },
  {
    rule: 'At least two black squares must touch horizontally or vertically.',
    validate: () => neighbors().some(([a, b]) => isCell(a, 'black', 'square') && isCell(b, 'black', 'square'))
  },
  {
    rule: 'The bottom-left cell must be a white circle.',
    validate: () => isCell(6, 'white', 'circle')
  }
];

let grid = [];
let currentPuzzle = null;

function colorIndex(color) {
  return colors.indexOf(color);
}

function shapeIndex(shape) {
  return shapes.indexOf(shape);
}

function row(rowIndex) {
  return [0, 1, 2].map(columnIndex => rowIndex * 3 + columnIndex);
}

function column(columnIndex) {
  return [0, 1, 2].map(rowIndex => rowIndex * 3 + columnIndex);
}

function neighbors() {
  const pairs = [];

  for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
    for (let columnIndex = 0; columnIndex < 3; columnIndex++) {
      const index = rowIndex * 3 + columnIndex;
      if (columnIndex < 2) pairs.push([index, index + 1]);
      if (rowIndex < 2) pairs.push([index, index + 3]);
    }
  }

  return pairs;
}

function orthogonalNeighbors(index) {
  const adjacent = [];
  const rowIndex = Math.floor(index / 3);
  const columnIndex = index % 3;

  if (rowIndex > 0) adjacent.push(index - 3);
  if (rowIndex < 2) adjacent.push(index + 3);
  if (columnIndex > 0) adjacent.push(index - 1);
  if (columnIndex < 2) adjacent.push(index + 1);

  return adjacent;
}

function blankIndexes() {
  return grid.map((cell, index) => isBlankCell(cell) ? index : null).filter(index => index !== null);
}

function isBlank(index) {
  return isBlankCell(grid[index]);
}

function isBlankCell(cell) {
  return cell.shape === shapeIndex('blank');
}

function isCell(index, color, shape) {
  return isCellState(grid[index], color, shape);
}

function isCellState(cell, color, shape) {
  return cell.color === colorIndex(color) && cell.shape === shapeIndex(shape);
}

function createCell(index) {
  const cell = document.createElement('button');
  cell.className = 'cell blank';
  cell.type = 'button';

  grid[index] = { color: 0, shape: 0 };

  cell.onclick = () => {
    cycleCell(grid[index]);
    updateCell(cell, grid[index], index);
    clearResult();
  };

  updateCell(cell, grid[index], index);
  return cell;
}

function cycleCell(cell) {
  if (isBlankCell(cell)) {
    cell.color = colorIndex('white');
    cell.shape = shapeIndex('square');
  } else if (cell.shape < shapeIndex('triangle')) {
    cell.shape++;
  } else if (cell.color < colors.length - 1) {
    cell.color++;
    cell.shape = shapeIndex('square');
  } else {
    cell.color = colorIndex('white');
    cell.shape = shapeIndex('blank');
  }
}

function updateCell(cellElement, cellState, index) {
  const shape = shapes[cellState.shape];
  const color = colors[cellState.color];

  cellElement.className = shape === 'blank' ? 'cell blank' : `cell ${color}`;
  cellElement.setAttribute('aria-label', shape === 'blank' ? `Cell ${index + 1}: blank` : `Cell ${index + 1}: ${color} ${shape}`);
  cellElement.innerHTML = '';

  if (shape === 'blank') return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 60 60');
  svg.setAttribute('aria-hidden', 'true');

  if (shape === 'square') {
    const rect = document.createElementNS(svg.namespaceURI, 'rect');
    rect.setAttribute('x', 10);
    rect.setAttribute('y', 10);
    rect.setAttribute('width', 40);
    rect.setAttribute('height', 40);
    rect.setAttribute('fill', shapeFill(cellState.color));
    rect.setAttribute('stroke', shapeStroke(cellState.color));
    rect.setAttribute('stroke-width', 4);
    svg.appendChild(rect);
  }

  if (shape === 'circle') {
    const circle = document.createElementNS(svg.namespaceURI, 'circle');
    circle.setAttribute('cx', 30);
    circle.setAttribute('cy', 30);
    circle.setAttribute('r', 20);
    circle.setAttribute('fill', shapeFill(cellState.color));
    circle.setAttribute('stroke', shapeStroke(cellState.color));
    circle.setAttribute('stroke-width', 4);
    svg.appendChild(circle);
  }

  if (shape === 'triangle') {
    const triangle = document.createElementNS(svg.namespaceURI, 'polygon');
    triangle.setAttribute('points', '30,8 8,52 52,52');
    triangle.setAttribute('fill', shapeFill(cellState.color));
    triangle.setAttribute('stroke', shapeStroke(cellState.color));
    triangle.setAttribute('stroke-width', 4);
    svg.appendChild(triangle);
  }

  cellElement.appendChild(svg);
}

function shapeFill(color) {
  return {
    white: '#ffffff',
    gray: '#9ca3af',
    black: '#111827'
  }[colors[color]];
}

function shapeStroke(color) {
  return colors[color] === 'gray' ? '#4b5563' : '#111827';
}

function init() {
  buildPuzzleLinks();
  buildGrid();
  window.addEventListener('hashchange', loadRoute);
  loadRoute();
}

function buildPuzzleLinks() {
  const puzzleList = document.getElementById('puzzleList');
  puzzleList.innerHTML = '';

  puzzles.forEach((puzzle, index) => {
    const link = document.createElement('a');
    link.className = 'puzzle-link';
    link.href = `#puzzle-${index + 1}`;
    link.innerHTML = `<strong>Puzzle ${index + 1}</strong>`;
    puzzleList.appendChild(link);
  });
}

function buildGrid() {
  const gridElement = document.getElementById('grid');
  gridElement.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    gridElement.appendChild(createCell(i));
  }
}

function loadRoute() {
  const match = window.location.hash.match(/^#puzzle-(\d+)$/);
  const puzzleNumber = match ? Number(match[1]) : null;

  if (puzzleNumber && puzzleNumber >= 1 && puzzleNumber <= puzzles.length) {
    showPuzzle(puzzleNumber - 1);
  } else {
    showHome();
  }
}

function showHome() {
  currentPuzzle = null;
  document.getElementById('home').hidden = false;
  document.getElementById('puzzleView').hidden = true;
  clearResult();
}

function showPuzzle(index) {
  currentPuzzle = index;
  document.getElementById('home').hidden = true;
  document.getElementById('puzzleView').hidden = false;
  updatePuzzleText();
  resetGrid();
}

function updatePuzzleText() {
  if (currentPuzzle === null) return;

  const puzzle = puzzles[currentPuzzle];
  document.getElementById('puzzleTitle').textContent = `Puzzle ${currentPuzzle + 1}`;
  document.getElementById('rule').textContent = puzzle.rule;
  document.getElementById('puzzleCount').textContent = `Puzzle ${currentPuzzle + 1} of ${puzzles.length}`;
}

function clearResult() {
  document.getElementById('result').textContent = '';
  document.getElementById('result').className = '';
}

function resetGrid() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    grid[index] = { color: 0, shape: 0 };
    updateCell(cell, grid[index], index);
  });
  clearResult();
}

function checkGrid() {
  if (currentPuzzle === null) return;

  const valid = puzzles[currentPuzzle].validate();
  const result = document.getElementById('result');

  result.textContent = valid ? 'valid' : 'invalid';
  result.className = valid ? 'valid' : 'invalid';
}

init();
