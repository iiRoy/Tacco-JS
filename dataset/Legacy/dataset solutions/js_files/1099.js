//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

function Tree() {
  this.root = null;
}
Tree.prototype.insert = function (val) {
  var z, y, x;
  z = {'left': null, 'right': null, 'key': val, 'parent': null};
  y = null;
  x = this.root;
  while (x !== null) {
    y = x;
    if (z.key < x.key) x = x.left;
    else x = x.right;
  }
  z.parent = y;

  if (y === null) this.root = z;
  else if (z.key < y.key) y.left = z;
  else y.right = z;
}
Tree.prototype.printTree = function() {
  function p(node, depth) {
    var indent = '', i;
    for (i = 0; i < depth; i++) indent = indent + '  ';
    if (node === null) {
      console.log(indent + 'NIL');
      return;
    }
    console.log(indent + node.key);
    p(node.left, depth+1);
    p(node.right, depth+1);
  }
  p(this.root, 0);
}
Tree.prototype.print = function() {
  function inorder(node) {
    var res = [];
    if (node === null) return res;
    res = res.concat(inorder(node.left));
    res.push(node.key);
    res = res.concat(inorder(node.right))
    return res;
  }
  function preorder(node) {
    var res = [];
    if (node === null) return res;
    res.push(node.key);
    res = res.concat(preorder(node.left));
    res = res.concat(preorder(node.right));
    return res;
  }
  console.log(' ' + inorder(this.root).join(' '));
  console.log(' ' + preorder(this.root).join(' '));
}

si = require('fs').createReadStream(config.input, 'r');
rl = require('readline').createInterface({
  input: si, output: process.stdout});

t = new Tree();

rl.on('line', function (line) {
  var inst;
  inst = line.split(' ');
  if (inst[0] === 'insert') t.insert(parseInt(inst[1], 10));
  else if (inst[0] === 'print') {
    //t.printTree();
    t.print();
  }
});