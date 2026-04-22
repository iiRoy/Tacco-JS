const fileSystemAccessor = require('fs');

const sourceContent = fileSystemAccessor.readFileSync('/dev/stdin', 'utf8');

const numericComponents = sourceContent
    .trim()
    .split(/\s+/)
    .map(Number);

const [valueAlpha, valueBeta] = numericComponents;

const finalCalculation = Math.max(0, valueAlpha - valueBeta);

console.log(finalCalculation);