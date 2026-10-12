'use strict';

function processInput(inputString) {
    const [firstComponent, secondComponent] = inputString.split(' ');
    const valueA = Number(firstComponent);
    const valueB = Number(secondComponent);
    console.log(0.5 * valueA * valueB);
}

processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
