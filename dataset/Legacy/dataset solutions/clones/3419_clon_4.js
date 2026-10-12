"use strict";

function getLengthOfBurger(burgerDepth) {
    return (1 << (burgerDepth + 2)) - 3;
}

function getPattiesInBurger(burgerDepth) {
    return (1 << (burgerDepth + 1)) - 1;
}

function countPatties(currentDepth, currentPosition) {
    let totalPattiesAccumulated = 0;

    while (true) {
        if (currentDepth === 0) {
            if (currentPosition >= 1) {
                totalPattiesAccumulated += 1;
            }
            break;
        }

        if (currentPosition <= 0) {
            break;
        }

        const leftSubBurgerLength = getLengthOfBurger(currentDepth - 1);
        const leftSubBurgerPatties = getPattiesInBurger(currentDepth - 1);

        if (currentPosition === 1) {
            break;
        } else if (currentPosition <= leftSubBurgerLength + 1) {
            currentPosition -= 1;
            currentDepth -= 1;
        } else if (currentPosition === leftSubBurgerLength + 2) {
            totalPattiesAccumulated += leftSubBurgerPatties + 1;
            break;
        } else {
            totalPattiesAccumulated += leftSubBurgerPatties + 1;
            currentPosition -= (leftSubBurgerLength + 2);
            currentDepth -= 1;
        }
    }
    return totalPattiesAccumulated;
}

function processInput(inputString) {
    const inputLines = inputString.split("\n");
    const parameters = inputLines[0].split(" ");
    const initialBurgerDepth = parseInt(parameters[0]);
    const targetSlicePosition = parseInt(parameters[1]);
    console.log(countPatties(initialBurgerDepth, targetSlicePosition));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
