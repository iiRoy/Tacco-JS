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
      const color = this.colors[i];
      const nextColor = this.colors[i + 1];
      if (color === nextColor) {
        continue;
      }
      const changedColor = COLORS.filter(s => s !== color && s !== nextColor)[0];
      const changedColors = this.colors.slice(); // copy
      changedColors.splice(i, 2, changedColor, changedColor); // 置き換え
      nextWormIds.push(changedColors.join(''));
    }
    return nextWormIds;
  }
}

class Graph {
  constructor() {
    this.map = new Map();
  }
  has(id) {
    return this.map.has(id);
  }
  get(id) {
    return this.map.get(id);
  }
  set(id, depth) {
    this.map.set(id, new Worm(id, depth));
  }
  bfs(wormId) {
    this.queue = [];
    this.set(wormId, 0);
    this.queue.push(wormId);
    while(this.queue.length) {
      const wormId = this.queue.shift();
      const worm = this.get(wormId);
      const wormIds = worm.getNextWormIds();
      if (!wormIds.length) {
        return worm;
      }
      wormIds.forEach(wormId => {
        if (this.has(wormId)) {
          return;
        }
        this.set(wormId, worm.depth + 1);
        this.queue.push(wormId);
      })
    }
  }
  print() {
    for (let i = 1; i <= this.map.size; i++) {
      const node = this.map.get(i);
      console.log(node.toString());
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

