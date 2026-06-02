process.stdin.resume();
process.stdin.setEncoding('ascii');

var input_stdin = "";
var input_stdin_array = "";
var input_currentline = 0;

process.stdin.on('data', function (data) {
    input_stdin += data;
});

process.on('SIGINT', function(){
    input_stdin_array = input_stdin.split("\n");
    mainEntry();
    process.exit();
});

process.stdin.on('end', function () {
    input_stdin_array = input_stdin.split("\n");
    mainEntry();    
});

function obtainLine() {
    return input_stdin_array[input_currentline++];
}

/////////////// ignore above this line ////////////////////

function mainEntry() {
    const elementCount = parseInt(obtainLine());
    const numericSequence = obtainLine().split(" ").map(s => parseInt(s));

    const valueOccurrences = new Map();
    for (let idx = 0; idx < elementCount; idx++) {
        const currentVal = numericSequence[idx];

        if (isNaN(currentVal) || currentVal < 0 || currentVal >= elementCount) {
            throw new TypeError("Cannot decrement property of undefined or invalid index.");
        }
        valueOccurrences.set(currentVal, (valueOccurrences.get(currentVal) || 0) + 1);
    }

    let sequenceIsCorrect = true;

    if (elementCount % 2 === 1) { // elementCount is odd
        for (let k = 0; k < elementCount; k++) {
            const currentObservedCount = valueOccurrences.get(k) || 0;
            if (k % 2 === 0) { // Even index
                if (k === 0) {
                    if (currentObservedCount !== 1) { 
                        sequenceIsCorrect = false; 
                        break; 
                    }
                } else { // k is an even number > 0
                    if (currentObservedCount !== 2) { 
                        sequenceIsCorrect = false; 
                        break; 
                    }
                }
            } else { // Odd index
                if (currentObservedCount !== 0) { // Should not appear
                    sequenceIsCorrect = false;
                    break;
                }
            }
        }
    } else { // elementCount is even
        for (let k = 0; k < elementCount; k++) {
            const currentObservedCount = valueOccurrences.get(k) || 0;
            if (k % 2 === 1) { // Odd index
                if (currentObservedCount !== 2) { 
                    sequenceIsCorrect = false; 
                    break; 
                }
            } else { // Even index (including 0)
                if (currentObservedCount !== 0) { // Should not appear
                    sequenceIsCorrect = false;
                    break;
                }
            }
        }
    }

    if (!sequenceIsCorrect) {
        console.log("0");
        return;
    }

    const powerExponent = Math.floor(elementCount / 2);
    const finalOutcome = Math.pow(2, powerExponent);
    console.log(finalOutcome.toString());
}
