const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputs = input.trim().split('\n');

const COLORS = ['r','g','b'];
class Worm {
  constructor(id, seconds) {
    this.id = id;
    this.seconds = seconds;
  }
  getNextWormIds() {
    const nextWormIds = [];
    for (let i = 0; i < this.id.length - 1; i++) {
      const [ current, next ] = this.id.substr(i, 2);
      if (current === next) {
        continue;
      }
      const changed = COLORS.find(color => color !== current && color !== next);
      const changedId = this.id.substr(0, i) + changed.repeat(2) + this.id.substr(i + 2);
      nextWormIds.push(changedId);
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
      // 全部同じ色のときwormIdsが存在せず、そのときのwormを返す
      if (!wormIds.length) {
        return worm;
      }
      wormIds.forEach(wormId => {
        if (this.map.has(wormId)) {
          return;
        }
        this.map.set(wormId, new Worm(wormId, worm.seconds + 1));
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
  console.log(worm ? worm.seconds : 'NA');
});

