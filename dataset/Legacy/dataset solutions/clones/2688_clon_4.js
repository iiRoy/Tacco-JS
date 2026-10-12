"use strict";

const dataAcquisition = (sourceText) => sourceText.trim().split("\n")[0];

const determineFinalPositions = (inputString) => {
    const characterSequence = inputString.split("");
    const sequenceDimension = characterSequence.length;
    const outcomeArray = new Array(sequenceDimension).fill(0);

    const boundaryMarkers = [];
    for (let currentIdx = 0; currentIdx < sequenceDimension - 1; currentIdx++) {
        if (characterSequence[currentIdx] === "R" && characterSequence[currentIdx + 1] === "L") {
            boundaryMarkers.push(currentIdx);
        }
    }

    for (const transitionPoint of boundaryMarkers) {
        let rightwardParticleCount = 0;
        for (let scanIdx = transitionPoint; scanIdx >= 0; scanIdx--) {
            if (characterSequence[scanIdx] === "R") {
                rightwardParticleCount++;
            } else {
                break;
            }
        }

        let leftwardParticleCount = 0;
        for (let scanIdx = transitionPoint + 1; scanIdx < sequenceDimension; scanIdx++) {
            if (characterSequence[scanIdx] === "L") {
                leftwardParticleCount++;
            } else {
                break;
            }
        }

        const totalParticles = rightwardParticleCount + leftwardParticleCount;

        if (totalParticles % 2 === 0) {
            outcomeArray[transitionPoint] = totalParticles / 2;
            outcomeArray[transitionPoint + 1] = totalParticles / 2;
        } else {
            outcomeArray[transitionPoint] = Math.ceil(leftwardParticleCount / 2) + 1;
            outcomeArray[transitionPoint + 1] = Math.ceil(rightwardParticleCount / 2) + 1;
        }
    }

    console.log(outcomeArray.join(" "));
};

determineFinalPositions(dataAcquisition(require("fs").readFileSync("/dev/stdin", "utf8")));