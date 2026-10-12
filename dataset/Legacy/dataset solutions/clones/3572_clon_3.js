'use strict';

const main = (source) => {
    const values = source.split(' ');
    const limitN = parseInt(values[0], 10);
    const divisorK = parseInt(values[1], 10);

    let freeBCCache = {};
    let filteredBCCache = {};
    let answer = 0;

    const countFreeBC = (startBC) => {
        let stored = freeBCCache[startBC];
        if (typeof stored === 'undefined') {
            stored = 0;
            for (let candidateBC = startBC; candidateBC <= limitN; candidateBC += divisorK) {
                stored++;
            }
            freeBCCache[startBC] = stored;
        }
        return stored;
    };

    const countFilteredBC = (startBC) => {
        let stored = filteredBCCache[startBC];
        if (typeof stored === 'undefined') {
            stored = 0;
            for (let candidateBC = startBC; candidateBC <= limitN; candidateBC += divisorK) {
                let doubledBC = candidateBC * 2;
                if ((doubledBC % divisorK) == 0) {
                    stored++;
                }
            }
            filteredBCCache[startBC] = stored;
        }
        return stored;
    };

    for (let currentA = 1; currentA <= limitN; currentA++) {
        let remainderA = currentA % divisorK;
        let firstBC = divisorK - remainderA;
        let doubledFirstBC = firstBC * 2;

        if ((doubledFirstBC % divisorK) == 0) {
            let numberOfBC = countFreeBC(firstBC);
            let pairsForA = numberOfBC * numberOfBC;
            answer += pairsForA;
        } else {
            let numberOfBC = countFilteredBC(firstBC);
            answer += numberOfBC;
        }
    }
    console.log(answer);
};

const testMode = false;

if (testMode) {
    main('3 2');
    main('5 3');
    main('31415 9265');
    main('35897 932');
} else {
    const fs = require('fs');
    const inputText = fs.readFileSync('/dev/stdin', 'utf8');
    main(inputText);
}
