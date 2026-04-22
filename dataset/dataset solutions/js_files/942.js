const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputs = input.trim().split('\n');
const n = Number(inputs.shift());
const adj = inputs.map((s) => s.split(' ').map(Number));

class Node {
  constructor(id) {
    this.id = id;
    this.measure = {};
    this.parents = [];
    this.children = [];
  }
  add(node) {
    node.parents.push(this);
    this.children.push(node);
  }
  isMeasured() {
    return !!this.measure.start;
  }
  setMeasure(time) {
    this.measure.start = time;
    if (!this.adj) {
      this.adj = this.parents.concat(this.children).sort((a, b) => a.id > b.id);
    }
    this.adj.forEach(node => {
      if (!node.isMeasured()) {
        time = node.setMeasure(++time);
      }
    });
    return this.measure.end = ++time;
  }
  toString() {
    return [this.id, this.measure.start, this.measure.end].join(' ');
  }
}

class Tree {
  constructor() {
    this.map = new Map();
  }
  getNode(id) {
    if (!this.map.has(id)) {
      this.map.set(id, new Node(id));
    }
    return this.map.get(id);
  }
  print() {
    for (let i = 1; i <= this.map.size; i++) {
      const node = this.map.get(i);
      console.log(node.toString());
    } 
  }
}

const tree = new Tree();
adj.forEach(([u, k, ...vk]) => {
  const parent = tree.getNode(u);
  vk.forEach(v => {
    const node = tree.getNode(v);
    parent.add(node);
  });
});

const root = tree.getNode(1);
root.setMeasure(1);
tree.print();

