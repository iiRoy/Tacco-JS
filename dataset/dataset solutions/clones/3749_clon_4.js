"use strict";

const orchestrateOutput = (dataFeed) => {
    const segmentSource = dataFeed.trim().split(/\s+/);
    const primaryFactor = Number(segmentSource[0]);
    const secondaryValue = Number(segmentSource[1]);

    const zeroComposer = (factor) => {
        return Array.from({ length: factor * 2 }, () => '0').join('');
    };

    const zeroSequence = zeroComposer(primaryFactor);

    return secondaryValue.toString() + zeroSequence;
};

const executeProcess = (dataRetriever) => {
    const rawContent = dataRetriever('/dev/stdin', 'utf8');
    const finalDisplay = orchestrateOutput(rawContent);
    console.log(finalDisplay);
};

executeProcess(require('fs').readFileSync);