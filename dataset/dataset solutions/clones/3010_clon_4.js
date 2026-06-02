'use strict'

function ProcessInput(rawInput) {
    const dataLines = rawInput.split("\n");
    const itemCount = parseInt(dataLines[0], 10);
    const numericSequence = dataLines[1].split(' ').map(str => parseInt(str, 10));

    const determineCommonDivisor = (valA, valB) => {
      while(valB) {
        const temporary = valB;
        valB = valA % valB;
        valA = temporary;
      }
      return valA;      
    };

    // Precompute GCDs from the start of the sequence
    const leadingDivisors = numericSequence.reduce((accumulator, currentElement, index) => {
        if (index === 0) {
            accumulator.push(currentElement);
        } else {
            accumulator.push(determineCommonDivisor(accumulator[index - 1], currentElement));
        }
        return accumulator;
    }, []);

    // Precompute GCDs from the end of the sequence
    const trailingDivisors = new Array(itemCount);
    for (let currentIdx = itemCount - 1; currentIdx >= 0; currentIdx--) {
        if (currentIdx === itemCount - 1) {
            trailingDivisors[currentIdx] = numericSequence[currentIdx];
        } else {
            trailingDivisors[currentIdx] = determineCommonDivisor(trailingDivisors[currentIdx + 1], numericSequence[currentIdx]);
        }
    }

    let overallMaximumDivisor = 1;

    // Iterate through each element, conceptually removing it, and find the GCD of the rest
    for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
        let candidateDivisor;
        if (currentIdx === 0) { // If the first element is removed
            candidateDivisor = trailingDivisors[1];
        } else if (currentIdx === itemCount - 1) { // If the last element is removed
            candidateDivisor = leadingDivisors[itemCount - 2];
        } else { // If an element in the middle is removed
            candidateDivisor = determineCommonDivisor(leadingDivisors[currentIdx - 1], trailingDivisors[currentIdx + 1]);
        }
        overallMaximumDivisor = Math.max(overallMaximumDivisor, candidateDivisor);
    }
   
    console.log(overallMaximumDivisor);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
