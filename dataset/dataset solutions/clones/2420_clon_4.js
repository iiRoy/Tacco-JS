"use strict";

const inputFacility = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

const retrieveLine = () => new Promise(resolve => {
    inputFacility.once("line", resolve);
});

async function processInteractiveChallenge() {
    // Stage 1: Obtain the problem dimension
    const problemDimension = parseInt(await retrieveLine());

    // Stage 2: Formulate the initial query and capture its characteristic response
    const initialSequence = Array.from({ length: problemDimension }, (_, index) => index + 1);
    console.log("?", initialSequence.join(" "));
    const initialCharacteristic = (await retrieveLine())[0];

    // Stage 3: Discover the critical displacement value
    let displacementMarker = 1;
    while (true) {
        const alteredSequence = [...initialSequence];
        alteredSequence[displacementMarker - 1] = displacementMarker + problemDimension;
        console.log("?", alteredSequence.join(" "));
        const currentCharacteristic = (await retrieveLine())[0];

        if (initialCharacteristic !== currentCharacteristic) {
            break;
        }
        displacementMarker++;
    }

    // Stage 4: Pre-compute patterns for subsequent queries
    const { primaryPattern, secondaryPattern, specificMarkers } = Array.from({ length: problemDimension - 1 }, (_, currentIdx) => {
        const valA = (displacementMarker + currentIdx - 1) % (2 * problemDimension) + 1;
        const valB = (valA + problemDimension - 1) % (2 * problemDimension) + 1;
        const valC = currentIdx + displacementMarker;
        return { valA, valB, valC };
    }).reduce((accumulator, item) => {
        accumulator.primaryPattern.push(item.valA);
        accumulator.secondaryPattern.push(item.valB);
        accumulator.specificMarkers.add(item.valC);
        return accumulator;
    }, { primaryPattern: [], secondaryPattern: [], specificMarkers: new Set() });

    // Stage 5: Systematically query for each possible value to determine its attribute
    const outcomeAttributes = [];
    for (let candidateValue = 1; candidateValue <= 2 * problemDimension; ++candidateValue) {
        let constructedProbe;
        const baseElementsForProbe = specificMarkers.has(candidateValue) ? secondaryPattern : primaryPattern;
        
        constructedProbe = [...baseElementsForProbe, candidateValue];

        console.log("?", constructedProbe.join(" "));
        const probeResponse = await retrieveLine();
        outcomeAttributes.push((probeResponse[0] === "R") ? "R" : "B");
    }

    // Stage 6: Output the final determined attributes
    console.log("!", outcomeAttributes.join(""));

    inputFacility.close();
}

// Initiate the interactive challenge processing
processInteractiveChallenge();