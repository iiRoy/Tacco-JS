function Node() {
	this.left = null;
	this.right = null;
	this.depth = null;
	this.isChild = null;
}

var list = [];

function addNodeAll(parent, depth) {
	// console.log({
	// 	addNodeAllBefore: true,
	// 	depth: depth,
	// 	list: list
	// });

	var currentParent = parent;
	for (var i = parent.depth + 1; i <= depth; i++) {
		var node = new Node();
		node.depth = i;
		node.isChild = (i === depth);

		if (parent.left) {
			currentParent.right = node;
		} else {
			currentParent.left = node;
		}
		list.push(node);
		currentParent = node;
	}
	list.sort(function (a, b) {
		return a.depth - b.depth;
	});
	// console.log({
	// 	addNodeAllAfter: true,
	// 	depth: depth,
	// 	list: list
	// });
}

function addNode(depth) {
	// console.log({
	// 	addNode: true,
	// 	depth: depth
	// });
	for (var i = 0; i < list.length; i++) {
		var parent = list[i];
		if (parent.isChild) {
			continue;
		}
		if (parent.left && parent.right) {
			continue;
		}
		addNodeAll(parent, depth);
		return true;
	}
	return false;
}

// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	const inputLines = input.split("\n");
	const line0 = inputLines[0];
	const line1 = inputLines[1];
	const line1vars = line1.split(" ");

	const n = parseInt(line0, 10);
	const a = line1vars.map(x => parseInt(x, 10));

	// console.log({
	// 	n: n,
	// 	a: a
	// });

	if (a[0] !== 0) { 
		console.log(-1);
		return;
	}

	// a[0]
	var node = new Node();
	node.depth = 0;
	node.isChild = false;
	list.push(node);

	for (var i = 1; i <= n; i++) {
		for (var j = 0; j < a[i]; j++) {
			var result = addNode(i);
			if (!result) {
				console.log(-1);
				return;
			}
		}
	}
	// console.log({
	// 	list: list
	// });
	// console.log(JSON.stringify(list));
	console.log(list.length);

	// tmp = input[1].split(" ");
	// //文字列から10進数に変換するときはparseIntを使います
	// var a = parseInt(input[0], 10);
	// var b = parseInt(tmp[0], 10);
	// var c = parseInt(tmp[1], 10);
	// var s = input[2];

}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// node index.js
// 1
// 2 3
// test
// (Ctrl + D)