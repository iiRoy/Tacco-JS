function processInput(textSource) {
    const primaryLine = textSource.split('\n')[0];
    const sequenceLength = primaryLine.length;

    const decision = determineOutcome(primaryLine, sequenceLength);
    console.log(decision);
}

function determineOutcome(inputSequence, sequenceCount) {
    if (sequenceCount % 2 === 0) {
        return "YES";
    }

    const middlePoint = Math.floor(sequenceCount / 2);

    const leftPart = inputSequence.substring(0, middlePoint);
    const rightPart = inputSequence.substring(middlePoint + 1);
    
    let reversedRightPart = '';
    for (let p = rightPart.length - 1; p >= 0; p--) {
        reversedRightPart += rightPart[p];
    }

    if (leftPart !== reversedRightPart) {
        return "YES";
    }

    let singleCharHalf = false;
    if (leftPart.length > 0) {
        const referenceCharacter = leftPart[0];
        if ([...leftPart].every(symbol => symbol === referenceCharacter)) {
            singleCharHalf = true;
        }
    }
    
    if (singleCharHalf) {
        return "NO";
    } else {
        return "YES";
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));