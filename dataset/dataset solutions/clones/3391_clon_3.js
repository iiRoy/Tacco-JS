"use strict";

function ProcessInput(dataString) {
    let totalOperations = 0;
    let completedItems = 0;

    for (let currentIndex = 0; currentIndex < dataString.length; currentIndex++) {
        const currentCharacter = dataString[currentIndex];

        if (currentCharacter === 'W') {
            const currentOffset = currentIndex - completedItems;
            totalOperations += currentOffset;
            completedItems++;
        }
    }

    console.log(totalOperations);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
