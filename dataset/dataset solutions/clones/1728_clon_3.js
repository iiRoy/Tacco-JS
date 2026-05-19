"use strict";

const parseInputData = (rawData) => {
    const lines = rawData.trim().split("\n");
    return {
        settings: lines[0].split(' ').map(Number),
        deskA: lines[1].split(' ').map(Number),
        deskB: lines[2].split(' ').map(Number)
    };
};

const getNextBookAndModifyStacks = (stack1, stack2) => {
    let chosenBookTime;
    let targetStack;

    const hasBooksInStack1 = stack1.length > 0;
    const hasBooksInStack2 = stack2.length > 0;

    if (hasBooksInStack1 && hasBooksInStack2) {
        if (stack1[0] <= stack2[0]) {
            chosenBookTime = stack1[0];
            targetStack = stack1;
        } else {
            chosenBookTime = stack2[0];
            targetStack = stack2;
        }
    } else if (hasBooksInStack1) {
        chosenBookTime = stack1[0];
        targetStack = stack1;
    } else if (hasBooksInStack2) {
        chosenBookTime = stack2[0];
        targetStack = stack2;
    }
    
    targetStack.shift(); // Modifies the array in place
    return chosenBookTime;
};

const processInput = (rawData) => {
    const data = parseInputData(rawData);
    const initialConfig = data.settings;
    const deskA_times = data.deskA;
    const deskB_times = data.deskB;

    let totalTimeSpent = 0;
    let booksCompleted = 0;
    const timeLimit = initialConfig[2];

    const simulateReading = (currentDeskA, currentDeskB, currentTotalTime, limitDuration, currentBooksRead) => {
        // Base case 1: Time limit exceeded
        if (currentTotalTime > limitDuration) {
            console.log(currentBooksRead - 1);
            return;
        } 
        // Base case 2: Time limit exactly met
        else if (currentTotalTime === limitDuration) {
            console.log(currentBooksRead);
            return;
        } 
        // Base case 3: No more books to read (and time not exceeded)
        // This preserves the original's specific behavior of outputting books-1 even if time is not exceeded
        else if (currentDeskA.length === 0 && currentDeskB.length === 0) {
            console.log(currentBooksRead - 1);
            return;
        }

        // If we reach here, there are still books and time is not exceeded.
        const nextBookDuration = getNextBookAndModifyStacks(currentDeskA, currentDeskB);
        
        const newTotalTime = currentTotalTime + nextBookDuration;
        const newBooksCompleted = currentBooksRead + 1;

        // Recurse with updated state
        simulateReading(currentDeskA, currentDeskB, newTotalTime, limitDuration, newBooksCompleted);
    };
    
    simulateReading(deskA_times, deskB_times, totalTimeSpent, timeLimit, booksCompleted);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
