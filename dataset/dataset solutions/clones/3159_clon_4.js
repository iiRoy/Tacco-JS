function processCharacterSequence(currentSequenceState, currentRemovedPairCount) {
    let sequenceModifiedInPass = false;
    let workingSequence = [...currentSequenceState];
    let passPairCount = currentRemovedPairCount;

    for (let currentIdx = 0; currentIdx < workingSequence.length; currentIdx++) {
        console.log(workingSequence);

        if (workingSequence[currentIdx] === "1" && workingSequence[currentIdx + 1] === "0") {
            passPairCount++;
            sequenceModifiedInPass = true;
            workingSequence.splice(currentIdx, 2);
        } else if (workingSequence[currentIdx] === "0" && workingSequence[currentIdx + 1] === "1") {
            passPairCount++;
            sequenceModifiedInPass = true;
            workingSequence.splice(currentIdx, 2);
        }
    }

    if (sequenceModifiedInPass) {
        processCharacterSequence(workingSequence, passPairCount);
    } else {
        console.log(passPairCount * 2);
    }
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const initialCharList = fileContent.split("");

processCharacterSequence(initialCharList, 0);
