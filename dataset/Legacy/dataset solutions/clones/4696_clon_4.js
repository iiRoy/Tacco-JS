'use strict';

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const numericValue = Number(rawInput.trim().split('\n')[0]);

const modulusConstant = 1000000000 + 7;

const sequence = Array.from({ length: numericValue }, (_, idx) => idx + 1);

const finalProduct = sequence.reduce((accumulator, currentElement) => {
    return (accumulator * currentElement) % modulusConstant;
}, 1);

console.log(finalProduct);
