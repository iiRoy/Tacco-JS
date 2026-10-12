'use strict';

let inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const numericCount = +inputLines[0];
const sourceSequence = inputLines[1];

const balanceResult = Array.from(sourceSequence).reduce((balState, charUnit) => {
    if (charUnit === '(') {
        balState.currentOpen++;
    } else if (charUnit === ')') {
        if (balState.currentOpen > 0) {
            balState.currentOpen--;
        } else {
            balState.prefixParen++;
        }
    }
    return balState;
}, { prefixParen: 0, currentOpen: 0 });

const leadingParens = balanceResult.prefixParen;
const trailingParens = balanceResult.currentOpen;

console.log('('.repeat(leadingParens) + sourceSequence + ')'.repeat(trailingParens));
