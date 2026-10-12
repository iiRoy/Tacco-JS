const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputs = input.trim().split('\n');
const n = Number(inputs.shift());
const adj = inputs.map((s) => s.split(' ').map(Number));

class Queue {
  constructor() {
    this.list = [];
  }
  enqueue(item) {
    this.list.push(item);
  }
  dequeue() {
    return this.list.shift()
  }
}

class Node {
  constructor(id) {
    this.id = id;
    this.list = [];
    this.params = new Map();
  }
  add(node) {
    this.list.push(node);
  }
  get(key) {
    return this.params.get(key);
  }
  set(key, value) {
    return this.params.set(key, value);
  }
  has(key) {
    return this.params.has(key);
  }
  toString() {
    return [this.id, this.get('depth')].join(' ');
  }
}

class Tree {
  constructor() {
    this.map = new Map();
    this.queue = new Queue();
  }
  setNode(node) {
    this.map.set(node.id, node);
  }
  hasNode(id) {
    return this.map.has(id);
  }
  getNode(id) {
    return this.map.get(id);
  }
  bfs() {
    const node = this.queue.dequeue();
    if (!node) {
      return;
    }

    node.list.forEach(_node => {
      if (_node.has('depth')) {
        return;
      }
      _node.set('depth', node.get('depth') + 1);
      this.queue.enqueue(_node);
    });
    this.bfs();
  }
  print() {
    for (let i = 1; i <= this.map.size; i++) {
      const node = this.map.get(i);
      console.log(node.toString());
    }
  }
}

const tree = new Tree();

adj.forEach(([id, k, ...ck]) => {
  tree.hasNode(id) || tree.setNode(new Node(id));
  const node = tree.getNode(id);
  ck.forEach(c => {
    tree.hasNode(c) || tree.setNode(new Node(c));
    const _node = tree.getNode(c);
    node.add(_node);
  });
});

const root = tree.getNode(1);
root.set('depth', 0);
tree.queue.enqueue(root);
tree.bfs();

tree.print();

