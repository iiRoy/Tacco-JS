"use strict";

const performAnalysis = (dataSource) => {
    const parameterLine = dataSource[0].split(" ");
    const slidingInterval = Number(parameterLine[1]);

    const numericalSeries = dataSource[1].split(" ").map(Number);

    const calculateElementContribution = (elementValue) => (elementValue + 1) / 2;

    const possibleStartIndices = Array.from({
        length: Math.max(0, numericalSeries.length - slidingInterval + 1)
    }, (_, index) => index);

    const allWindows = possibleStartIndices.map(startIndex =>
        numericalSeries.slice(startIndex, startIndex + slidingInterval)
    );

    const windowScores = allWindows.map(currentWindow =>
        currentWindow.reduce((accumulator, value) => accumulator + calculateElementContribution(value), 0)
    );

    const overallMaximumScore = windowScores.length > 0
        ? Math.max(...windowScores)
        : 0;

    console.log(overallMaximumScore);
};

performAnalysis(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));