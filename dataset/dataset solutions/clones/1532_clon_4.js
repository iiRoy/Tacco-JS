const fileSystem = require('fs');

const ultimateModulo = 1000000007;

function calculateModularExponentiation(baseValue, exponentValue, modulusValue) {
    if (exponentValue === 0) {
        return 1;
    }
    let halfPower = calculateModularExponentiation(baseValue, Math.floor(exponentValue / 2), modulusValue);
    let result = (halfPower * halfPower) % modulusValue;
    if (exponentValue % 2 === 1) {
        result = (result * baseValue) % modulusValue;
    }
    return result;
}

function deriveComputedValue(iterationCount) {
    let factorA = calculateModularExponentiation(10, iterationCount, ultimateModulo);
    let factorB = (2 * calculateModularExponentiation(9, iterationCount, ultimateModulo)) % ultimateModulo;
    let factorC = calculateModularExponentiation(8, iterationCount, ultimateModulo);
    
    let intermediateSum = factorA - factorB + factorC;
    
    return (intermediateSum % ultimateModulo + ultimateModulo) % ultimateModulo;
}

const entireInputBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = entireInputBuffer.trim().split('\n');
const countForCalculation = parseInt(processedLines[0], 10);

console.log(deriveComputedValue(countForCalculation));