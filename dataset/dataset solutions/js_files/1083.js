class Tree {
  static get Node() {
    return class {
      constructor(id, parentId, childrenIds, depth) {
        this.id = id;
        this.parentId = parentId;
        this.childrenIds = childrenIds;
        this.depth = depth;
      }

      get type() {
        if (this.parentId === -1) return 'root';
        if (this.childrenIds.length === 0) return 'leaf';
        return 'internal node';
      }

      toString() {
        return `node ${this.id}: parent = ${this.parentId}, depth = ${this.depth}, ${this.type}, [${this.childrenIds.join(', ')}]`;
      }
    };
  }

  constructor() {
    this.nodes = [];
  }

  add(id, childrenIds) {
    this.nodes[id] = this.nodes[id] || new Tree.Node(id, -1, childrenIds, 0);
    let node = this.nodes[id];
    node.childrenIds = childrenIds;

    let c;
    if (childrenIds.length !== 0) {
      childrenIds.forEach((cid) => {
        c = this.nodes[cid] || new Tree.Node(cid, id, [], node.depth);
        c.parentId = id;
        c.depth = node.depth;
        this.nodes[cid] = c;
        this.incrementDepth(cid);
      });
    }
  }

  incrementDepth(id) {
    if (!this.nodes[id]) return;
    if (this.nodes[id].childrenIds.length === 0) {
      this.nodes[id].depth += 1;
      return;
    }
    this.nodes[id].childrenIds.forEach((eid) => this.incrementDepth(eid));
  }

  print() {
    console.log(this.nodes.sort((a, b) => a.id - b.id).map(n => n.toString()).join('\n'));
  }
}

(function main(){
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const n = Number(lines.shift());

  let tree = new Tree();

  let id, k, childrenIds;
  lines.map(l => l.split(' ')).forEach(function(line) {
    id = Number(line.shift());
    k = Number(line.shift());
    childrenIds = line.map(Number);
    tree.add(id, childrenIds);
  });

  tree.print();
})();

