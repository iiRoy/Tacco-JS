class BinaryTree {
  constructor(n) {
    this.nodes = [];
    for (let i = 0; i < n; i++) this.nodes[i] = {id: i + 1, parentId: -1, leftId: -1, rightId: -1}
  }

  get root() { return this.nodes.find(n => n.parentId === -1); }

  add(id, leftId, rightId) {
    let n = this.find(id);
    [n.leftId, n.rightId] = [leftId, rightId];
    if (leftId !== -1) this.find(leftId).parentId = id;
    if (rightId !== -1) this.find(rightId).parentId = id;
  }

  find(id) { return this.nodes[id - 1]; }

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
  const func = (p, i) => {
    let rootId = p[0];
    let idx, rootIdx;
    for (idx = 0; idx < p.length; idx++) if ((rootIdx = i.indexOf(rootId)) !== -1) break;
    if (rootIdx === -1 && i.length <= 1) return i[0] || -1;
    let leftIds = i.slice(0, rootIdx);
    let rightIds = i.slice(rootIdx + 1);
    // console.log(p, i, leftIds, rightIds);
    tree.add(rootId, func(p.slice(1), leftIds), func(p.slice(1), rightIds));
    return rootId;
  }
  func(preOrder, inOrder);
  return tree;
}

