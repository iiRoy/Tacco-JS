const inputSource = globalThis.process.stdin;
const outputSink = globalThis.process.stdout;

inputSource.resume();
inputSource.setEncoding('utf8');

inputSource.on('data', function(incomingTransmission) {
    digestAndReport(incomingTransmission.trim());
});

function digestAndReport(payload) {
    let internalBuffer = [];
    const patternDefinitions = [
        { sCount: 4, tCount: 4, fullLength: 8 }, // SSSS TTTT
        { sCount: 3, tCount: 3, fullLength: 6 }, // SSS TTT
        { sCount: 2, tCount: 2, fullLength: 4 }, // SS TT
        { sCount: 1, tCount: 1, fullLength: 2 }  // S T
    ];

    for (let currentSymbol of payload) {
        internalBuffer.push(currentSymbol);

        let currentBufferExtent = internalBuffer.length;
        if (currentSymbol === 'T') {
            for (let def of patternDefinitions) {
                if (currentBufferExtent >= def.fullLength) {
                    let potentialMatch = true;
                    // Check for T's
                    for (let i = 1; i <= def.tCount; i++) {
                        if (internalBuffer[currentBufferExtent - i] !== 'T') {
                            potentialMatch = false;
                            break;
                        }
                    }
                    if (!potentialMatch) continue;

                    // Check for S's
                    for (let i = 1; i <= def.sCount; i++) {
                        if (internalBuffer[currentBufferExtent - def.tCount - i] !== 'S') {
                            potentialMatch = false;
                            break;
                        }
                    }

                    if (potentialMatch) {
                        internalBuffer.splice(currentBufferExtent - def.fullLength, def.fullLength);
                        break; // Only remove the largest matching pattern
                    }
                }
            }
        }
    }
    outputSink.write(internalBuffer.length + '\n');
}