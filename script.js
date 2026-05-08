const colors = ['white', 'gray', 'black'];
const shapes = ['blank', 'square', 'circle', 'triangle'];

const puzzles = [
  {
    name: 'Blank upper right',
    rule: 'The upper-right cell must be blank.',
    validate: () => isBlank(2)
  },
  {
    name: 'Blanks surrounded by black squares',
    rule: 'There must be at least one blank cell, and every blank cell must touch only black squares horizontally or vertically.',
    validate: () => blankIndexes().length > 0
      && blankIndexes().every(index => orthogonalNeighbors(index).every(neighbor => isCell(neighbor, 'black', 'square')))
  },
  {
    name: 'At least 8 filled squares',
    rule: 'At least 8 grid squares must be filled with a shape instead of left blank.',
    validate: () => grid.filter(cell => !isBlankCell(cell)).length >= 8
  },
  {
    name: 'Circles can only appear in left column',
    rule: 'Any circle on the board must appear in the left column.',
    validate: () => grid.every((cell, index) => cell.shape !== shapeIndex('circle') || column(0).includes(index))
  },
  {
    name: '3 Different colors of circles',
    rule: 'The board must contain a white circle, a gray circle, and a black circle.',
    validate: () => colors.every(color => grid.some(cell => isCellState(cell, color, 'circle')))
  },
  {
    name: 'Exactly one gray shape in upper row',
    rule: 'The upper row must contain exactly one filled gray shape.',
    validate: () => row(0).filter(index => grid[index].color === colorIndex('gray') && !isBlank(index)).length === 1
  },
  {
    name: 'At least one white shape of every shape',
    rule: 'The board must contain at least one white square, one white circle, and one white triangle.',
    validate: () => ['square', 'circle', 'triangle'].every(shape => grid.some(cell => isCellState(cell, 'white', shape)))
  },
  {
    name: 'White triangle in the middle',
    rule: 'The center cell must be a white triangle.',
    validate: () => isCell(4, 'white', 'triangle')
  },
  {
    name: 'Adjacent black squares',
    rule: 'At least two black squares must touch horizontally or vertically.',
    validate: () => neighbors().some(([a, b]) => isCell(a, 'black', 'square') && isCell(b, 'black', 'square'))
  },
  {
    name: 'White circle bottom left',
    rule: 'The bottom-left cell must be a white circle.',
    validate: () => isCell(6, 'white', 'circle')
  }
];

const puzzles = [
  {
    name: 'Rainbow Rows',
    rule: 'Every row must contain one white, one gray, and one black cell. Shapes do not matter.',
    validate: () => everyGroupHasAll([row(0), row(1), row(2)], 'color')
  },
  {
    name: 'Shape Columns',
    rule: 'Every column must contain one square, one circle, and one triangle. Colors do not matter.',
    validate: () => everyGroupHasAll([column(0), column(1), column(2)], 'shape')
  },
  {
    name: 'Matching Diagonals',
    rule: 'The two end cells of each diagonal must match colors, and the two diagonals must use different colors.',
    validate: () => grid[0].color === grid[8].color
      && grid[2].color === grid[6].color
      && grid[0].color !== grid[2].color
  },
  {
    name: 'Black Circle Corners',
    rule: 'All four corners must be black circles. The other cells can be anything.',
    validate: () => [0, 2, 6, 8].every(index => isCell(index, 'black', 'circle'))
  },
  {
    name: 'Signal Tower',
    rule: 'The center must be a gray triangle, and the four edge-center cells must be white squares.',
    validate: () => isCell(4, 'gray', 'triangle') && [1, 3, 5, 7].every(index => isCell(index, 'white', 'square'))
  },
  {
    name: 'No Shape Neighbors',
    rule: 'Cells that touch horizontally or vertically may not have the same shape.',
    validate: () => neighbors().every(([a, b]) => grid[a].shape !== grid[b].shape)
  },
  {
    name: 'Color Balance',
    rule: 'Use each color exactly three times anywhere on the board. Shapes do not matter.',
    validate: () => hasExactCounts('color', colors.length, 3)
  },
  {
    name: 'Shape Balance',
    rule: 'Use each shape exactly three times anywhere on the board. Colors do not matter.',
    validate: () => hasExactCounts('shape', shapes.length, 3)
  },
  {
    name: 'Layer Cake',
    rule: 'Top row must be squares, middle row circles, and bottom row triangles.',
    validate: () => row(0).every(index => grid[index].shape === shapeIndex('square'))
      && row(1).every(index => grid[index].shape === shapeIndex('circle'))
      && row(2).every(index => grid[index].shape === shapeIndex('triangle'))
  },
  {
    name: 'Rotating Pairs',
    rule: 'Opposite cells around the center must match in both color and shape.',
    validate: () => [[0, 8], [1, 7], [2, 6], [3, 5]].every(([a, b]) => sameCell(a, b))
  }
];

let grid = [];
let currentPuzzle = null;
let currentPuzzle = 0;

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

function everyGroupHasAll(groups, property) {
  return groups.every(group => new Set(group.map(index => grid[index][property])).size === 3);
}

function hasExactCounts(property, totalOptions, expectedCount) {
  const counts = Array(totalOptions).fill(0);
  grid.forEach(cell => counts[cell[property]]++);
  return counts.every(count => count === expectedCount);
}

function neighbors() {
  const pairs = [];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const index = r * 3 + c;
      if (c < 2) pairs.push([index, index + 1]);
      if (r < 2) pairs.push([index, index + 3]);
    }
  }

  return pairs;
}

function orthogonalNeighbors(index) {
  const neighbors = [];
  const rowIndex = Math.floor(index / 3);
  const columnIndex = index % 3;

  if (rowIndex > 0) neighbors.push(index - 3);
  if (rowIndex < 2) neighbors.push(index + 3);
  if (columnIndex > 0) neighbors.push(index - 1);
  if (columnIndex < 2) neighbors.push(index + 1);

  return neighbors;
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
function isCell(index, color, shape) {
  return grid[index].color === colorIndex(color) && grid[index].shape === shapeIndex(shape);
}

function sameCell(firstIndex, secondIndex) {
  return grid[firstIndex].color === grid[secondIndex].color
    && grid[firstIndex].shape === grid[secondIndex].shape;
}

function createCell(index) {
  const cell = document.createElement('button');
  cell.className = 'cell blank';
  cell.type = 'button';
  cell.className = 'cell white';
  cell.type = 'button';
  cell.setAttribute('aria-label', `Cell ${index + 1}: white square`);

  grid[index] = { color: 0, shape: 0 };

  cell.onclick = () => {
    const g = grid[index];

    if (isBlankCell(g)) {
      g.color = 0;
      g.shape = shapeIndex('square');
    } else if (g.shape < shapeIndex('triangle')) {
      g.shape++;
    } else if (g.color < colors.length - 1) {
      g.color++;
      g.shape = shapeIndex('square');
    } else {
      g.color = 0;
      g.shape = shapeIndex('blank');
    }

    updateCell(cell, g, index);
    clearResult();
  };

  updateCell(cell, grid[index], index);
  return cell;
}

function updateCell(cell, g, index) {
  const shape = shapes[g.shape];
  const color = colors[g.color];

  cell.className = shape === 'blank' ? 'cell blank' : 'cell ' + color;
  cell.setAttribute('aria-label', shape === 'blank' ? `Cell ${index + 1}: blank` : `Cell ${index + 1}: ${color} ${shape}`);
  cell.innerHTML = '';

  if (shape === 'blank') {
    return;
  }

  cell.className = 'cell ' + colors[g.color];
  cell.setAttribute('aria-label', `Cell ${index + 1}: ${colors[g.color]} ${shapes[g.shape]}`);
  cell.innerHTML = '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 60 60');
  svg.setAttribute('aria-hidden', 'true');

  if (shape === 'square') {
  if (shapes[g.shape] === 'square') {
    const rect = document.createElementNS(svg.namespaceURI, 'rect');
    rect.setAttribute('x', 10);
    rect.setAttribute('y', 10);
    rect.setAttribute('width', 40);
    rect.setAttribute('height', 40);
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', shapeStroke(g.color));
    rect.setAttribute('stroke-width', 4);
    svg.appendChild(rect);
  }

  if (shape === 'circle') {
  if (shapes[g.shape] === 'circle') {
    const circle = document.createElementNS(svg.namespaceURI, 'circle');
    circle.setAttribute('cx', 30);
    circle.setAttribute('cy', 30);
    circle.setAttribute('r', 20);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', shapeStroke(g.color));
    circle.setAttribute('stroke-width', 4);
    svg.appendChild(circle);
  }

  if (shape === 'triangle') {
  if (shapes[g.shape] === 'triangle') {
    const tri = document.createElementNS(svg.namespaceURI, 'polygon');
    tri.setAttribute('points', '30,8 8,52 52,52');
    tri.setAttribute('fill', 'none');
    tri.setAttribute('stroke', shapeStroke(g.color));
    tri.setAttribute('stroke-width', 4);
    svg.appendChild(tri);
  }

  cell.appendChild(svg);
}

function shapeStroke(color) {
  return colors[color] === 'black' ? 'white' : 'black';
}

function init() {
  const gridDiv = document.getElementById('grid');
  const puzzleSelect = document.getElementById('puzzleSelect');

  puzzles.forEach((puzzle, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${index + 1}. ${puzzle.name}`;
    puzzleSelect.appendChild(option);
  });

  puzzleSelect.onchange = () => {
    currentPuzzle = Number(puzzleSelect.value);
    updatePuzzleText();
    clearResult();
  };

  for (let i = 0; i < 9; i++) {
    const cell = createCell(i);
    gridDiv.appendChild(cell);
  }

  buildHomeLinks();
  window.addEventListener('hashchange', loadRoute);
  loadRoute();
}

function buildHomeLinks() {
  const puzzleList = document.getElementById('puzzleList');

  puzzles.forEach((puzzle, index) => {
    const link = document.createElement('a');
    link.className = 'puzzle-link';
    link.href = `#puzzle-${index + 1}`;
    link.innerHTML = `<span>Puzzle ${index + 1}</span><strong>${puzzle.name}</strong>`;
    puzzleList.appendChild(link);
  });
}

function loadRoute() {
  const match = window.location.hash.match(/^#puzzle-(\d+)$/);
  const puzzleNumber = match ? Number(match[1]) : null;

  if (puzzleNumber && puzzleNumber >= 1 && puzzleNumber <= puzzles.length) {
    showPuzzle(puzzleNumber - 1);
    return;
  }

  showHome();
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
  const puzzle = puzzles[currentPuzzle];
  document.getElementById('puzzleTitle').textContent = puzzle.name;
  document.getElementById('rule').textContent = puzzle.rule;
  document.getElementById('puzzleCount').textContent = `${currentPuzzle + 1} of ${puzzles.length}`;
}

function clearResult() {
  document.getElementById('result').textContent = '';
  document.getElementById('result').className = '';
}

function resetGrid() {
  grid = [];
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    grid[index] = { color: 0, shape: 0 };
    updateCell(cell, grid[index], index);
  });
  clearResult();
}

function checkGrid() {
  const valid = puzzles[currentPuzzle].validate();
  const result = document.getElementById('result');

  updatePuzzleText();
}

function updatePuzzleText() {
  const puzzle = puzzles[currentPuzzle];
  document.getElementById('puzzleTitle').textContent = puzzle.name;
  document.getElementById('rule').textContent = puzzle.rule;
  document.getElementById('puzzleCount').textContent = `${currentPuzzle + 1} of ${puzzles.length}`;
}

function clearResult() {
  document.getElementById('result').textContent = '';
  document.getElementById('result').className = '';
}

function resetGrid() {
  grid = [];
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    grid[index] = { color: 0, shape: 0 };
    updateCell(cell, grid[index], index);
  });
  clearResult();
}

function checkGrid() {
  const valid = puzzles[currentPuzzle].validate();
  const result = document.getElementById('result');

  result.textContent = valid ? 'Solved!' : 'Not solved yet';
  result.className = valid ? 'valid' : 'invalid';
}

init();
