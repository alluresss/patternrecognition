const colors = ['white', 'gray', 'black'];
const shapes = ['square', 'circle', 'triangle'];

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

function isCell(index, color, shape) {
  return grid[index].color === colorIndex(color) && grid[index].shape === shapeIndex(shape);
}

function sameCell(firstIndex, secondIndex) {
  return grid[firstIndex].color === grid[secondIndex].color
    && grid[firstIndex].shape === grid[secondIndex].shape;
}

function createCell(index) {
  const cell = document.createElement('button');
  cell.className = 'cell white';
  cell.type = 'button';
  cell.setAttribute('aria-label', `Cell ${index + 1}: white square`);

  grid[index] = { color: 0, shape: 0 };

  cell.onclick = () => {
    const g = grid[index];

    g.shape++;
    if (g.shape >= shapes.length) {
      g.shape = 0;
      g.color = (g.color + 1) % colors.length;
    }

    updateCell(cell, g, index);
    clearResult();
  };

  updateCell(cell, grid[index], index);
  return cell;
}

function updateCell(cell, g, index) {
  cell.className = 'cell ' + colors[g.color];
  cell.setAttribute('aria-label', `Cell ${index + 1}: ${colors[g.color]} ${shapes[g.shape]}`);
  cell.innerHTML = '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 60 60');
  svg.setAttribute('aria-hidden', 'true');

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
