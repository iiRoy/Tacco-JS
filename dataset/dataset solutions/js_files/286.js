const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputs = input.trim().split('\n');
const adj = inputs.map((s) => s.split(' ').map(Number));

class Edge {
  constructor(dest, weight = 1) {
    this.dest = dest;
    this.weight = weight;
  }
}

class Node {
  constructor() {
    this.list = [];
  }
  addEdge(edge) {
    this.list.push(edge);
  }
  isOdd() {
    return !!(this.list.length % 2);
  }
}

class Graph {
  constructor() {
    this.init();
  }
  init() {
    this.map = new Map();
  }
  getNode(source, edge) {
    if (!this.map.has(source)) {
      this.map.set(source, new Node());
    }
    return this.map.get(source);
  }
  addEdge(source, edge) {
    const node = this.getNode(source);
    node.addEdge(edge);
  }
  countNode(iterator) {
    return Array.from(this.map.values()).map(iterator).reduce((a, b) => a + b);
  }
  canPatrol() {
    const totalNode = graph.countNode(node => node.list.length);
    const totalOddNode = graph.countNode(node => node.isOdd() ? 1 : 0);
    if (totalNode % 2) {
      return false;
    } else if (totalOddNode === 0) {
      return true;
    } else if (totalOddNode === 2 && (graph.getNode(1).isOdd() && graph.getNode(2).isOdd())) {
      return true;
    }
    return false;
  }
}

const graph = new Graph();
adj.forEach(([source, dest]) => {
  if (source === 0 && dest === 0) {
    console.log(graph.canPatrol() ? 'OK' : 'NG');
    graph.init();
    return;
  }
  graph.addEdge(source, new Edge(dest));
  graph.addEdge(dest, new Edge(source));
});

