"use strict";
process.stdin.resume();
process.stdin.setEncoding('utf8');

var lines = []
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

reader.on('line', (line) => {
  lines.push(line);
});

reader.on('close', () => {
    while (true) {
	var l = lines.shift().trim();
	if (l==="-") {
	    break;
	}
	const s = l.split('');
	const n = Number(lines.shift());
	let ops = [];
	for (var i=0; i<n; i++) {
	    ops.push(Number(lines.shift()))
	}
	console.log(aux(s,ops).join(''))
    }
});

function aux(s,ops)
{
    const len=s.length;
    //console.log('s: ', s);
    while (ops.length>0) {
	let op=ops.shift()
	var s=s.slice(op,len).concat(s.slice(0,op));
	//console.log('s: ', s);
    }

    return(s);
}
