const operatingSystemInterface = require('node:process');

let collectedBinaryData = '';

operatingSystemInterface.stdin.on('data', (dataChunk) => {
    collectedBinaryData += dataChunk.toString();
});

operatingSystemInterface.stdin.on('end', () => {
    const processedText = collectedBinaryData.trim();
    let peakValue = 0;

    let jCounter = 0;
    let oCounter = 0;
    let iCounter = 0;
    let currentProcessingStage = 0; // 0: Awaiting J, 1: Collecting J, 2: Collecting O, 3: Collecting I

    for (let charIndex = 0; charIndex < processedText.length; charIndex++) {
        const currentSymbol = processedText[charIndex];

        switch (currentProcessingStage) {
            case 0: // Awaiting J
                if (currentSymbol === 'J') {
                    jCounter = 1;
                    oCounter = 0;
                    iCounter = 0;
                    currentProcessingStage = 1; // Transition to Collecting J
                }
                break;

            case 1: // Collecting J
                if (currentSymbol === 'J') {
                    jCounter++;
                } else if (currentSymbol === 'O') {
                    oCounter = 1;
                    currentProcessingStage = 2; // Transition to Collecting O
                } else {
                    // J sequence broken by something other than J or O. Reset.
                    currentProcessingStage = 0;
                    jCounter = 0;
                    oCounter = 0;
                    iCounter = 0;
                    charIndex--; // Re-evaluate currentSymbol in Awaiting J state
                }
                break;

            case 2: // Collecting O
                if (currentSymbol === 'O') {
                    oCounter++;
                } else if (currentSymbol === 'I') {
                    iCounter = 1;
                    currentProcessingStage = 3; // Transition to Collecting I
                } else {
                    // O sequence broken by something other than O or I. Reset.
                    currentProcessingStage = 0;
                    jCounter = 0;
                    oCounter = 0;
                    iCounter = 0;
                    charIndex--; // Re-evaluate currentSymbol in Awaiting J state
                }
                break;

            case 3: // Collecting I
                if (currentSymbol === 'I') {
                    iCounter++;
                } else {
                    // I sequence broken or ended. Evaluate the pattern.
                    if (jCounter >= oCounter && iCounter >= oCounter) {
                        peakValue = (peakValue > oCounter ? peakValue : oCounter);
                    }
                    // Reset for next pattern
                    currentProcessingStage = 0;
                    jCounter = 0;
                    oCounter = 0;
                    iCounter = 0;
                    charIndex--; // Re-evaluate currentSymbol in Awaiting J state
                }
                break;
        }
    }

    // After loop, check if a pattern ended at the very end of the string
    if (currentProcessingStage === 3) {
        if (jCounter >= oCounter && iCounter >= oCounter) {
            peakValue = (peakValue > oCounter ? peakValue : oCounter);
        }
    }

    operatingSystemInterface.stdout.write(peakValue.toString() + '\n');
});