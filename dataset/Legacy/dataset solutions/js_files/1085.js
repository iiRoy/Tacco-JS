function memoization(f) {
  const cache = {};
  return (...param) => {
    const c = cache[param];
    return typeof c === 'undefined' ? cache[param] = f(...param) : c;
  };
}

class _Node {
  constructor(id, parentId, leftId, rightId) {
    this.id = id;
    this.parentId = parentId;
    this.leftId = leftId;
    this.rightId = rightId;
  }
  get type() {
    return this.parentId === -1
        ? 'root'
        : this.leftId === -1 && this.rightId === -1
            ? 'leaf'
            : 'internal node'}
}

class BinaryTree {
  constructor() {
    this.nodes = [];
    this._nodeInfo = [];
    this.getDepth = memoization(this.getDepth.bind(this));
    this.getHeight = memoization(this.getHeight.bind(this));
  }
  static get Node() {return _Node;}

  add(id, leftId, rightId) {this.nodes[id] = new BinaryTree.Node(id, -1, leftId, rightId);}

  connect() {
    for (let i = 0; i < this.nodes.length; i++ ) this._nodeInfo[i] = {node:null, sibling:-1, degree:0};
    this.nodes.forEach(n => {
      if (n.leftId !== -1) {
        this.nodes[n.leftId].parentId = n.id;
        this._nodeInfo[n.leftId].sibling = n.rightId;
      }
      if (n.rightId !== -1) {
        this.nodes[n.rightId].parentId = n.id;
        this._nodeInfo[n.rightId].sibling = n.leftId;
      }
    });
    this.nodes.forEach(n => {
      this._nodeInfo[n.id] = {sibling: this._nodeInfo[n.id].sibling, node: n, degree: (n.leftId !== -1) + (n.rightId !== -1)}
    });
  }

  getDepth(id, i = 0) {
    let pid = this.find(id).parentId;
    return pid === -1 ? i : this.getDepth(pid, i + 1);
  }

  getHeight(id, i = 0) {
    if (id === -1) return i - 1;
    let n = this.find(id);
    let [lid, rid] = [n.leftId, n.rightId];
    return Math.max(this.getHeight(lid, i + 1), this.getHeight(rid, i + 1))
  }

  find(id) {return this.nodes[id]}

  print() {
    console.log(this._nodeInfo.map(o =>
      `node ${o.node.id}: parent = ${o.node.parentId}, sibling = ${o.sibling}, degree = ${o.degree}, depth = ${this.getDepth(o.node.id)}, height = ${this.getHeight(o.node.id)}, ${o.node.type}`
    ).join('\n'));
  }
}

(function main(){
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const n = Number(lines.shift());

  let tree = new BinaryTree();

  let id, l, r;
  lines.map(l => l.split(' ').map(Number)).forEach(function(line) {
    tree.add(...line);
  });
  tree.connect();
  tree.print();
})();

