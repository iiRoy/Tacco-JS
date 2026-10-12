'use strict';

const processInput = (inputString) => {
    return Array.from(inputString)
        .map(charUnit => {
            const charOrdinal = charUnit.charCodeAt(0);
            const shiftedOrdinal = charOrdinal - 3;
            const finalOrdinal = shiftedOrdinal < 65 ? shiftedOrdinal + 26 : shiftedOrdinal;
            return String.fromCharCode(finalOrdinal);
        })
        .join('');
};

const { createInterface } = require('readline');

createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', (inputLine) => {
    console.log(processInput(inputLine.trim()));
});
