let input = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    input += chunk;
});
process.stdin.on('end', function() {
    const inputs = input.split('\n');
    class Node {
        constructor() {
            this.left = null;
            this.right = null;
            this.parent = null;
        }
        insertLeft(node) {
            this.left = node;
            node.parent = this;
        }
        insertRight(node) {
            this.right = node;
            node.parent = this;
        }
        toString() {
            return `(${this.left == null ? '' : this.left.toString()},${this.right == null ? '' : this.right.toString()})`;
        }
    }

    const createTree = str => {
        const root = new Node();
        let tree = root;
        let comma = 0;
        for (const s of str) {
            if (s == "(") {
                const child = new Node();
                if (comma == 0) tree.insertLeft(child);
                else tree.insertRight(child);
                tree = child;
            }
            if (s == ",") comma = 1;
            if (s == ")") {
                tree = tree.parent;
                comma = 0;
            }
        }
        return tree.left;
    }
    const union = (a, b) => {
        const node = new Node();
        if (a == null) return b;
        if (b == null) return a;
        let _res = union(a.left, b.left);
        if (_res != null) node.insertLeft(_res);
        _res = union(a.right, b.right);
        if (_res != null) node.insertRight(_res);
        return node;
    };
    const intersection = (a, b) => {
        const node = new Node();
        if (a == null || b == null) return null;
        let _res = intersection(a.left, b.left);
        if (_res != null) node.insertLeft(_res);
        _res = intersection(a.right, b.right);
        if (_res != null) node.insertRight(_res);
        return node;
    };
    for (const input of inputs) {
        const [type, treeStr, treeStr2] = input.split(' ');
        const tree = createTree(treeStr);
        const tree2 = createTree(treeStr2);
        let res;
        if (type == "u") {
            res = union(tree, tree2);
        } else if (type == "i") {
            res = intersection(tree, tree2);
        }
        console.log(res.toString());
    }
});