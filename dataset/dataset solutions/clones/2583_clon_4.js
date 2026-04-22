const allInputContent = require('node:fs').readFileSync(0, 'utf8');
const segments = allInputContent.split(/\s+/);
const firstNumericValue = Number(segments[0]);
const secondNumericValue = Number(segments[1]);
const targetSequence = segments[2];

const sequenceExtent = targetSequence.length;
let divergenceCount = 0;

divergenceCount = Array.from(targetSequence)
    .slice(0, sequenceExtent - 1)
    .filter((charElement, charIndex) => charElement !== targetSequence[charIndex + 1])
    .length;

const reductionCapacity = 2 * secondNumericValue;
const effectiveDiscrepancies = Math.max(0, divergenceCount - reductionCapacity);

const finalValue = (sequenceExtent - 1) - effectiveDiscrepancies;
process.stdout.write(String(finalValue));