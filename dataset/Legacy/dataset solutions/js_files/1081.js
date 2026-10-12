const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputs = input.trim().split('\n');
const n = Number(inputs.shift());
const adj = inputs.map((s) => s.split(' ').map(Number));

class Node {
  constructor(id) {
    this.id = id;
    this.children = [];
  }
  add(node) {
    node.parent = this;
    this.children.push(node);
  }
  hasParent() {
    return !!this.parent;
  }
  hasChild() {
    return !!this.children.length;
  }
  getType() {
    return !this.hasParent() ? 'root' : (this.hasChild() ? 'internal node' : 'leaf');
  }
  calc(depth) {
    this.depth = depth++;
    this.children.forEach(child => child.calc(depth));
  }
  toString() {
    return 'node ' + this.id + ': ' + [
      'parent = ' + (this.hasParent() ? this.parent.id : -1),
      'depth = ' + this.depth,
      this.getType(),
      '[' + this.children.map(child => child.id).join(', ') + ']',
    ].join(', ');
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
  getRoot() {
    return Array.from(this.map.values()).find(node => !node.hasParent());
  }
  calc() {
    const root = this.getRoot();
    root.calc(0);
  }
  print() {
    for (let i = 0; i < this.map.size; i++) {
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

