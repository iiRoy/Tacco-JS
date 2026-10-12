'use strict';

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const elementCount = +sourceData[0];
const numericElements = sourceData[1].split(' ').map(Number);

const prevSmaller = new Array(elementCount);
const monoStackLeft = [];

for (let k = 0; k < elementCount; k++) {
	while (monoStackLeft.length > 0 && numericElements[monoStackLeft[monoStackLeft.length - 1]] >= numericElements[k]) {
		monoStackLeft.pop();
	}
	prevSmaller[k] = monoStackLeft.length === 0 ? -1 : monoStackLeft[monoStackLeft.length - 1];
	monoStackLeft.push(k);
}

const nextSmaller = new Array(elementCount);
const monoStackRight = [];

for (let k = elementCount - 1; k >= 0; k--) {
	while (monoStackRight.length > 0 && numericElements[monoStackRight[monoStackRight.length - 1]] > numericElements[k]) {
		monoStackRight.pop();
	}
	nextSmaller[k] = monoStackRight.length === 0 ? elementCount : monoStackRight[monoStackRight.length - 1];
	monoStackRight.push(k);
}

let finalResult = 0;

for (let k = 0; k < elementCount; k++) {
	const leftExtent = k - prevSmaller[k];
	const rightExtent = nextSmaller[k] - k;
	finalResult += numericElements[k] * leftExtent * rightExtent;
}

console.log(finalResult);
