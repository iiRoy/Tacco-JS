class BinaryTree {
  constructor(n) {
    this.nodes = [];
    for (let i = 0; i < n; i++) this.nodes[i] = {id: i + 1, parentId: -1, leftId: -1, rightId: -1}
  }

  get root() { return this.nodes.find(n => n.parentId === -1); }

  find(id) { return this.nodes[id - 1] || {}; }

  getByPostorder() {
    let res = [];
    const postorder = (id) => {
      if (id === -1) return;
      let n = this.find(id);
      postorder(n.leftId);
      postorder(n.rightId);
      res.push(id);
    };
    postorder(this.root.id);
    return res;
  }
}

(function main(){
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const n = Number(lines.shift());
  const preOrder = lines.shift().split(' ').map(Number);
  const inOrder = lines.shift().split(' ').map(Number);

  let tree = makeTree(preOrder, inOrder);
  console.log(tree.getByPostorder().join(' '));
})();

function makeTree(preOrder, inOrder) {
  let tree = new BinaryTree(preOrder.length);
  const innerMakeTree = (p, i) => {
    let midId = p[0];
    let midIdx = i.indexOf(midId);
    if (midIdx === -1) return;
    if (midIdx > 0) {
      tree.find(midId).leftId = p[1];
      tree.find(p[1]).parentId = midId;
      innerMakeTree(p.slice(1, midIdx + 1), i.slice(0, midIdx))
    }
    if (midIdx < i.length - 1) {
      tree.find(midId).rightId = p[midIdx + 1];
      tree.find(p[midIdx + 1]).parentId = midId;
      innerMakeTree(p.slice(midIdx + 1), i.slice(midIdx + 1))
    }
  }
  innerMakeTree(preOrder, inOrder);
  return tree;
}

