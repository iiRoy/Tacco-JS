const inputBuffer = [];
const ioInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

ioInterface.on('line', (dataLine) => {
    inputBuffer.push(dataLine);
});

ioInterface.on('close', () => {
    const allInput = inputBuffer;
    const countA = parseInt(allInput.shift(), 10);
    const setA = allInput.splice(0, countA);
    const countB = parseInt(allInput.shift(), 10);
    const setB = allInput.splice(0, countB);

    const frequencyA = new Map();
    setA.forEach(item => {
        frequencyA.set(item, (frequencyA.get(item) || 0) + 1);
    });

    const frequencyB = new Map();
    setB.forEach(item => {
        frequencyB.set(item, (frequencyB.get(item) || 0) + 1);
    });

    const allDistinctItems = new Set([...frequencyA.keys(), ...frequencyB.keys()]);
    let highestScore = 0;

    allDistinctItems.forEach(item => {
        const countFromA = frequencyA.get(item) || 0;
        const countFromB = frequencyB.get(item) || 0;
        const netCount = countFromA - countFromB;
        if (netCount > highestScore) {
            highestScore = netCount;
        }
    });

    console.log(highestScore);
});