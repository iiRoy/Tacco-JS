'use strict'

function ProcessInput(rawData) {
    const numericSequence = rawData.split('\n')[1].split(' ').map(Number);

    const finalAccumulation = numericSequence.reduce((stateContainer, _, currentPosition) => {
        const currentArraySnapshot = stateContainer.currentArray;
        let currentExchangeTally = stateContainer.exchangeTally;

        if (currentArraySnapshot[currentPosition] === currentPosition + 1) {
            const nextArrayState = [...currentArraySnapshot];
            currentExchangeTally++;

            // The original code's 'if(tmp)' where 'tmp = nums[i+1]' evaluates
            // if the value at nums[i+1] is truthy. This means if nums[i+1] is 0
            // or undefined (out of bounds), it falls into the 'else' branch.
            if (Boolean(nextArrayState[currentPosition + 1])) {
                const interimValue = nextArrayState[currentPosition + 1];
                nextArrayState[currentPosition + 1] = nextArrayState[currentPosition];
                nextArrayState[currentPosition] = interimValue;
            } else {
                const interimValue = nextArrayState[currentPosition];
                nextArrayState[currentPosition] = nextArrayState[currentPosition - 1];
                nextArrayState[currentPosition - 1] = interimValue;
            }
            return { currentArray: nextArrayState, exchangeTally: currentExchangeTally };
        } else {
            return stateContainer;
        }
    }, { currentArray: [...numericSequence], exchangeTally: 0 });

    console.log(finalAccumulation.exchangeTally);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
