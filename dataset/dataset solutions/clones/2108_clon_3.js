"use strict";

const processInput = (rawData) => {
    const inputLines = rawData.trim().split("\n");

    let charSequence = inputLines[0].split("");

    const numQueries = parseInt(inputLines[1], 10);

    const queryList = inputLines.slice(2, numQueries + 2);

    const REVERSE_OPERATION_CODE = "1";
    const ADD_OPERATION_CODE = "2";
    const ADD_TO_FRONT_POSITION_CODE = "1";
    const ADD_TO_BACK_POSITION_CODE = "2";

    const performQueryAction = (currentSequence, queryParts) => {
        const operationType = queryParts[0];

        if (operationType === REVERSE_OPERATION_CODE) {
            currentSequence.reverse();
        } else if (operationType === ADD_OPERATION_CODE) {
            const addPosition = queryParts[1];
            const characterToAdd = queryParts[2];

            if (addPosition === ADD_TO_FRONT_POSITION_CODE) {
                currentSequence.unshift(characterToAdd);
            } else if (addPosition === ADD_TO_BACK_POSITION_CODE) {
                currentSequence.push(characterToAdd);
            }
        }
    };

    for (let queryIndex = 0; queryIndex < numQueries; queryIndex++) {
        const currentQueryParts = queryList[queryIndex].split(" ");
        performQueryAction(charSequence, currentQueryParts);
    }

    console.log(charSequence.join(""));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
