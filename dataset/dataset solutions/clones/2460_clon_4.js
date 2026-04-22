function fetchInput() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function postOutput(data) {
    console.log(data);
}

function orchestrateCalculation(sourceText) {
    const symbols = sourceText.split("");
    const totalLength = symbols.length;
    
    const initialMarks = new Map();

    if (symbols[0] === "<") {
        initialMarks.set(0, 0);
    }
    if (symbols[totalLength - 1] === ">") {
        initialMarks.set(totalLength, 0);
    }

    for (let j = 1; j < totalLength; j++) {
        const previousSymbol = symbols[j - 1];
        const currentSymbol = symbols[j];
        if (previousSymbol === ">" && currentSymbol === "<") {
            initialMarks.set(j, 0);
        } else if (previousSymbol === "<" && currentSymbol === ">") {
            initialMarks.set(j, "zeta");
        }
    }

    const valueSequence = Array.from({ length: totalLength + 1 }, (_, idx) => 
        initialMarks.has(idx) ? initialMarks.get(idx) : null
    );

    function fillSequenceRecursively(currentPosition, sequenceData) {
        if (currentPosition > totalLength) {
            return sequenceData;
        }

        let elementAtCurrent = sequenceData[currentPosition];
        const elementBefore = (currentPosition > 0) ? sequenceData[currentPosition - 1] : undefined;
        let nextPosition = currentPosition + 1;

        if (currentPosition === 0) {
            if (elementAtCurrent === null) {
                sequenceData[0] = 1;
            }
        } else if (elementAtCurrent === 0) {
            // Already 0, move to next
        } else if (elementBefore === 0) {
            sequenceData[currentPosition] = 1;
        } else if (elementAtCurrent === "zeta") {
            sequenceData[currentPosition] = elementBefore + 1;
            if (currentPosition + 1 <= totalLength && sequenceData[currentPosition + 1] !== 0) {
                sequenceData[currentPosition + 1] = 1;
            }
            nextPosition = currentPosition + 2;
        } else {
            sequenceData[currentPosition] = elementBefore + 1;
        }
        
        return fillSequenceRecursively(nextPosition, sequenceData);
    }

    const finalSequence = fillSequenceRecursively(0, valueSequence);

    const finalResult = finalSequence.reduce((accumulator, value) => accumulator + value, 0);
    
    postOutput(finalResult);
}

orchestrateCalculation(fetchInput());