const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputs = input.trim().split('\n');
const n = Number(inputs.shift());
const adj = inputs.map((s) => s.split(' ').map(Number));

class Time {
  constructor(now = 0) {
    this.now = now;
  }
  getNow() {
    return ++this.now;
  }
}
const time = new Time();

class Node {
  constructor(id) {
    this.id = id;
    this.children = [];
  }
  add(node) {
    this.children.push(node);
  }
  isVisited() {
    return !!this.start;
  }
  calc() {
    this.start = time.getNow();
    this.children.sort((a, b) => a.id > b.id);
    this.children.forEach(child => child.isVisited() || child.calc());
    this.end = time.getNow();
  }
  toString() {
    return [this.id, this.start, this.end].join(' ');
  }
}

class Tree {
  constructor() {
    this.map = new Map();
  }
  getNode(id) {
    this.map.has(id) || this.map.set(id, new Node(id));
    return this.map.get(id);
  }
  calc() {
    for (let i = 1; i <= this.map.size; i++) {
      const node = this.map.get(i);
      node.isVisited() || node.calc();
    }
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

tree.calc();
tree.print();

