class _Node {
  constructor(key, left = null, right = null) {
    this.key = key;
    this.left = left;
    this.right = right;
  }
}

class BinaryTree {
  constructor() {
    this.root = null;
  }

  static get Node() { return _Node; }

  insert(key) {
    this.root = new BinaryTree.Node(key, null, null);
    this.insert = (key) => {
      let x = this.root, y;
      let newNode = new BinaryTree.Node(key, null, null);
      while (x !== null) {
        y = x;
        x = x[key < x.key ? 'left' : 'right'];
      }
      y[key < y.key ? 'left' : 'right'] = newNode;
    }
  }

  printByIneorder() {
    let str = '';
    const innerFunc = (n) => {
      if (n === null) return;
      innerFunc(n.left);
      str += ` ${n.key}`;
      innerFunc(n.right);
    }
    innerFunc(this.root);
    console.log(str);
  }

  printByPreorder() {
    let str = '';
    const innerFunc = (n) => {
      if (n === null) return;
      str += ` ${n.key}`;
      innerFunc(n.left);
      innerFunc(n.right);
    }
    innerFunc(this.root);
    console.log(str);
  }

  print() {
    this.printByIneorder();
    this.printByPreorder();
  }
}

(function main(){
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const n = Number(lines.shift());

  const tree = new BinaryTree();
  lines.forEach(function(cmd) {
    switch(cmd.charAt(0)) {
    case 'i':
      tree.insert(Number(cmd.split(' ')[1]));
      break;
    default:
      tree.print();
    }
  });
})();

