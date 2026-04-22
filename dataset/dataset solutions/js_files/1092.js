class BinaryTree {
  constructor(n) {
    this.nodes = [];
    for (let i = 0; i < n; i++) this.nodes[i] = {id: -1, parentId: -1, leftId: -1, rightId: -1}
  }

  get root() { return this.nodes.find(n => n.parentId === -1); }

  add(id, leftId, rightId) {
    let n = this.nodes[id];
    [n.id, n.leftId, n.rightId] = [id, leftId, rightId];
    if (leftId !== -1) this.find(leftId).parentId = id;
    if (rightId !== -1) this.find(rightId).parentId = id;
  }

  find(id) { return this.nodes[id] || {}; }

  preorder(id = this.root.id) {
    if (id === -1) return;
    let n = this.find(id);
    process.stdout.write(` ${id}`);
    this.preorder(n.leftId);
    this.preorder(n.rightId);
  }

  inorder(id = this.root.id) {
    if (id === -1) return;
    let n = this.find(id);
    this.inorder(n.leftId);
    process.stdout.write(` ${id}`);
    this.inorder(n.rightId);
  }

  postorder(id = this.root.id) {
    if (id === -1) return;
    let n = this.find(id);
    this.postorder(n.leftId);
    this.postorder(n.rightId);
    process.stdout.write(` ${id}`);
  }
}

(function main(){
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const n = Number(lines.shift());
  let tree = new BinaryTree(n);
  lines.map(l => l.split(' ').map(Number)).forEach(line => tree.add(...line));
  console.log('Preorder');
  tree.preorder();
  console.log('\nInorder');
  tree.inorder();
  console.log('\nPostorder');
  tree.postorder();
  console.log();
})();

