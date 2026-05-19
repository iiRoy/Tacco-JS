'use strict'

const processInput = (rawData) => {
    const numericValue = parseInt(rawData);
    const resultOptions = ['ARC', 'ABC'];
    console.log(resultOptions[Number(numericValue < 1200)]);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
