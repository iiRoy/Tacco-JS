'use strict';

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var minvs = input.trim().split('\n');
while (minvs.length !== 0) {
	var t = +minvs.shift();
	console.log(Math.ceil(t*t/98 + 1));
}