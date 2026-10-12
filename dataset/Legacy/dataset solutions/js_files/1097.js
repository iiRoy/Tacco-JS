process.stdin.resume();
process.stdin.setEncoding("utf8");
let input = "";
process.stdin.on("data", function(chunk) {input += chunk;});
process.stdin.on("end", function() {main(input.split("\n"));});

function allocNode(key) {
	p = {};
	p.key = key;
	p.left = null;
	p.right = null;
	return p;
}
function insert(p,c) {
	if (p === null) return c;
	if (c.key < p.key) p.left = insert(p.left,c);
	else p.right = insert(p.right,c);
	return p;
}
function inset(p,ary) {
	if (p === null) return;
	inset(p.left,ary);
	ary.push(p.key);
	inset(p.right,ary);
}
function preset(p,ary) {
	if (p === null) return;
	ary.push(p.key);
	preset(p.left,ary);
	preset(p.right,ary);
}
function dump(p,setfunc) {
	let ary = [];
	setfunc(p,ary);
	console.log(ary.join(" "));
}
function main(lines){
	let n = Number(lines[0]);
	let root = null;
	for (let i = 0; i < n; i++) {
		let line = lines[i+1].split(" ");
		switch(line[0][0]) {
		case "i":
			let key = Number(line[1]);
			let p = allocNode(key);
			root = insert(root,p);
			break;
		case "p":
			dump(root,inset);
			dump(root,preset);
			break;			
		}
	}
}

