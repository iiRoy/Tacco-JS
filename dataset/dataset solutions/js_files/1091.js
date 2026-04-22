function updateChildren(cid, pid) {
	var node = T.filter(function(c){return c.id == cid;})[0];
	node.parent = pid;

	if (node.left != -1) {
		updateChildren(node.left, node.id);
	}
	if (node.right != -1) {
		updateChildren(node.right, node.id);
	}
}
function preorder(id, arr) {
	if (id == -1)
		return;
	var node = T.filter(function(c){return c.id == id;})[0];
	arr.push(id);
	preorder(node.left, arr);
	preorder(node.right, arr);
}
function inorder(id, arr) {
	if (id == -1)
		return;
	var node = T.filter(function(c){return c.id == id;})[0];
	inorder(node.left, arr);
	arr.push(id);
	inorder(node.right, arr);
}
function postorder(id, arr) {
	if (id == -1)
		return;
	var node = T.filter(function(c){return c.id == id;})[0];
	postorder(node.left, arr);
	postorder(node.right, arr);
	arr.push(id);
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');

var n = +lines.shift()

var T = [];
for (var i = 0; i < n; i++) {
	var u = lines.shift().split(' ');
	var id = +u[0];
	var left = +u[1];
	var right = +u[2];

	T.push({id: id, left: left, right: right, parent: -1});
}

T.sort(function(a, b){return a.id - b.id;});

T.forEach(function(node) {
	if (node.left != -1) {
		updateChildren(node.left, node.id);
	}
	if (node.right != -1) {
		updateChildren(node.right, node.id);
	}
});

var root = T.filter(function(node){return node.parent == -1;})[0];

var ret = [];
preorder(root.id, ret);
console.log('Preorder');
console.log(' ' + ret.join(' '));

ret = [];
inorder(root.id, ret);
console.log('Inorder');
console.log(' ' + ret.join(' '));

ret = [];
postorder(root.id, ret);
console.log('Postorder');
console.log(' ' + ret.join(' '));