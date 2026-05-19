"use strict";

const processInput = (rawData) => {
    const parsedLines = rawData.trim().split("\n");

    const configParams = parsedLines[0].split(' ').map(Number);
    const deskAPeriods = parsedLines[1].split(' ').map(Number);
    const deskBPeriods = parsedLines[2].split(' ').map(Number);

    const timeAllowance = configParams[2];

    let elapsedDuration = 0;
    let completedWorks = 0;
    let deskAIndex = 0;
    let deskBIndex = 0;

    while (true) {
        let nextBookDuration;
        let selectedFromDeskA = false;
        let selectedFromDeskB = false;

        const hasMoreBooksA = (deskAIndex < deskAPeriods.length);
        const hasMoreBooksB = (deskBIndex < deskBPeriods.length);

        if (hasMoreBooksA && hasMoreBooksB) {
            if (deskAPeriods[deskAIndex] < deskBPeriods[deskBIndex]) {
                nextBookDuration = deskAPeriods[deskAIndex];
                selectedFromDeskA = true;
            } else {
                nextBookDuration = deskBPeriods[deskBIndex];
                selectedFromDeskB = true;
            }
        } else if (hasMoreBooksA) {
            nextBookDuration = deskAPeriods[deskAIndex];
            selectedFromDeskA = true;
        } else if (hasMoreBooksB) {
            nextBookDuration = deskBPeriods[deskBIndex];
            selectedFromDeskB = true;
        } else {
            console.log(completedWorks - 1);
            return;
        }

        elapsedDuration += nextBookDuration;
        completedWorks++;

        if (selectedFromDeskA) {
            deskAIndex++;
        } else if (selectedFromDeskB) {
            deskBIndex++;
        }

        if (elapsedDuration > timeAllowance) {
            console.log(completedWorks - 1);
            return;
        } else if (elapsedDuration === timeAllowance) {
            console.log(completedWorks);
            return;
        }
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
