process.stdin.resume();
process.stdin.setEncoding('utf8');
let inputBuffer = '';

process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
});

process.stdin.on('end', () => {
    const inputLines = inputBuffer.split('\n');
    const elementCount = Number(inputLines[0]);
    const originalNumbers = inputLines[1].split(' ').map(Number);

    const orderedNumbers = originalNumbers.slice().sort((a, b) => a - b);

    const rankRegistry = orderedNumbers.reduce((accumulator, value, index) => {
        (accumulator[value] = accumulator[value] || []).push(index);
        return accumulator;
    }, {});

    const lastIndex = elementCount - 1;
    const middlePosition = Math.floor(lastIndex / 2);

    const lowerMidValue = orderedNumbers[middlePosition];
    const upperMidValue = orderedNumbers[middlePosition + 1];

    const results = originalNumbers.map((currentNumber) => {
        const currentRank = rankRegistry[currentNumber].pop();
        return currentRank <= middlePosition ? upperMidValue : lowerMidValue;
    });

    results.forEach((outputValue) => {
        console.log(outputValue);
    });
});
