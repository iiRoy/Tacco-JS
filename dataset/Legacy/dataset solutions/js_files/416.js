const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputs = input.trim().split('\n');

const COLORS = ['r','g','b'];
class Worm {
  constructor(id, depth) {
    this.id = id;
    this.depth = depth;
    this.colors = id.split('');
  }
  getNextWormIds() {
    const nextWormIds = [];
    for (let i = 0; i < this.colors.length - 1; i++) {
      const [ current, next ] = this.colors.slice(i, i + 2);
      if (current === next) {
        continue;
      }
      const changed = COLORS.filter(s => s !== current && s !== next)[0];
      const changedColors = this.colors.slice(); // copy
      changedColors.splice(i, 2, changed, changed); // 置き換え
      nextWormIds.push(changedColors.join(''));
    }
    return nextWormIds;
  }
}

class Graph {
  constructor() {
    this.map = new Map();
  }
  bfs(wormId) {
    this.queue = [];
    this.map.set(wormId, new Worm(wormId, 0));
    this.queue.push(wormId);
    while(this.queue.length) {
      const wormId = this.queue.shift();
      const worm = this.map.get(wormId);
      const wormIds = worm.getNextWormIds();
      if (!wormIds.length) {
        return worm;
      }
      wormIds.forEach(wormId => {
        if (this.map.has(wormId)) {
          return;
        }
        this.map.set(wormId, new Worm(wormId, worm.depth + 1));
        this.queue.push(wormId);
      })
    }
  }
}

inputs.forEach(wormId => {
  if (wormId === '0') {
    return;
  }
  const graph = new Graph();
  const worm = graph.bfs(wormId);
  console.log(worm ? worm.depth : 'NA');
});

