const inputSystem = require('readline');

const streamProcessor = inputSystem.createInterface({
    input: global.process.stdin,
    output: global.process.stdout,
    terminal: false
});

let accumulatedData = [];

streamProcessor.on('line', (currentUnit) => {
    accumulatedData.push(currentUnit);
});

streamProcessor.on('close', () => {
    if (accumulatedData.length < 2) {
        return;
    }

    const designatedSize = Number(accumulatedData[0]);
    const numberString = accumulatedData[1];

    const numericalComponents = numberString.split(' ').map(Number);

    const firstIndices = Array.from({
        length: Math.ceil(designatedSize / 2)
    }, (_, k) => designatedSize - 1 - (k * 2)).filter(idx => idx >= 0);

    const secondIndices = Array.from({
        length: Math.floor(designatedSize / 2)
    }, (_, k) => designatedSize - 2 - (k * 2)).filter(idx => idx >= 0);

    const primaryNumericStream = firstIndices.map(idx => numericalComponents[idx]);
    const secondaryNumericStream = secondIndices.map(idx => numericalComponents[idx]);

    const firstComposite = primaryNumericStream.map(val => `${val} `).join('');
    const secondComposite = secondaryNumericStream.reverse().map(val => `${val} `).join('');

    global.console.log(`${firstComposite}${secondComposite}`);
});