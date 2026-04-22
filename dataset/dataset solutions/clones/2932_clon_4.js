'use strict';

function processData(sourceContent) {
    const components = sourceContent.trim().split(' ');
    const growthFactor = Number(components[0]);
    const decrementOffset = Number(components[1]);
    const initialObservation = Number(components[2]);

    function generateNext(current, factor, offset, count, results) {
        if (count === 0) {
            return results;
        }
        const nextValue = factor * current - offset;
        results.push(nextValue);
        return generateNext(nextValue, factor, offset, count - 1, results);
    }

    const finalSequence = generateNext(initialObservation, growthFactor, decrementOffset, 10, []);

    console.log(finalSequence.join('\n'));
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));