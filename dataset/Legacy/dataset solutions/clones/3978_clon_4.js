const fs = require('fs');

const text = fs.readFileSync('/dev/stdin', 'utf8');

function toMatrix(src) {
  return src.trim().split('\n').map(function(row) {
    return row.split(' ').map(function(piece) {
      return piece | 0;
    });
  });
}

const table = toMatrix(text);
const size = table[0][0];

const redList = [];
const blueList = [];

for (let pos = 0; pos < size; pos++) {
  redList.push(table[pos + 1]);
  blueList.push(table[size + pos + 1]);
}

const redRanks = redList.map(function(point, order) {
  return { point: point, order: order };
});
const blueRanks = blueList.map(function(point, order) {
  return { point: point, order: order };
});

redRanks.sort(function(left, right) {
  const [lx] = left.point;
  const [rx] = right.point;
  return rx - lx;
});
blueRanks.sort(function(left, right) {
  const [lx] = left.point;
  const [rx] = right.point;
  return rx - lx;
});

const rankedReds = redRanks.map(function(entry) {
  return entry.point;
});
const rankedBlues = blueRanks.map(function(entry) {
  return entry.point;
});

const graph = rankedBlues.map(function(blue) {
  const [bx, by] = blue;
  const edges = [];

  rankedReds.forEach(function(red, redRank) {
    const [rx, ry] = red;
    if (bx >= rx && by > ry && by > -1) {
      edges.push(redRank);
    }
  });

  return edges;
});

const reserved = new Set();
let total = 0;

for (const choices of graph) {
  const picked = choices.find(function(redRank) {
    return !reserved.has(redRank);
  });

  if (picked !== undefined) {
    reserved.add(picked);
    total++;
  }
}

console.log(`${total}`);
