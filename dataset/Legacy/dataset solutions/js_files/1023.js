"use strict";
process.stdin.resume();
process.stdin.setEncoding('utf8');
let input = '';
process.stdin.on('data', function(chunk) {input += chunk;});
process.stdin.on('end', function() {main(input.split(/\r?\n/));});

function main(inputs){
	let n = Number(inputs[0].split(' ')[0]);
	let q = Number(inputs[0].split(' ')[1]);
	let pos, pre, tmp, i;
	let top = {};

	top.name = inputs[1].split(' ')[0];
	top.val = Number(inputs[1].split(' ')[1]);
	pos = top;
	
	for (i = 1; i < n; i++) {
		tmp = {};
		tmp.name = inputs[i+1].split(' ')[0];
		tmp.val = Number(inputs[i+1].split(' ')[1]);
		pos.next = tmp;
		pos = tmp;
	}
	pos.next = top;
	pre = pos;
	pos = top;
	top = tmp = null;

	let count = 0;
	while (n > 0) {		
		pos.val -= q;
		count += q;
		if (pos.val > 0) {
			pos = pos.next;
			pre = pre.next;
		} else {
			count += pos.val;
			console.log(`${pos.name} ${count}`);
			pos = pos.next;
			pre.next = pos;
			n--;
		}
	}
	pos = pre = null;
}
