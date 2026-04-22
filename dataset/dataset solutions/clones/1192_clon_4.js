"use strict";

function craftSolid(faceLabels) {
    return {
        A: faceLabels[0], 
        B: faceLabels[1], 
        C: faceLabels[2], 
        D: faceLabels[3], 
        E: faceLabels[4], 
        F: faceLabels[5]  
    };
}

function locateLabel(solidObj, searchedLabel) {
    for (const plane in solidObj) {
        if (solidObj[plane] === searchedLabel) {
            return plane;
        }
    }
    return null;
}

function normalizeRotationCount(count) {
    return ((count % 4) + 4) % 4;
}

function transformRoll(initialSolid) {
    return {
        A: initialSolid.E, 
        B: initialSolid.A, 
        C: initialSolid.C, 
        D: initialSolid.D, 
        E: initialSolid.F, 
        F: initialSolid.B  
    };
}

function transformTurn(initialSolid) {
    return {
        A: initialSolid.D, 
        B: initialSolid.B, 
        C: initialSolid.A, 
        D: initialSolid.F, 
        E: initialSolid.E, 
        F: initialSolid.C  
    };
}

function transformSpin(initialSolid) {
    return {
        A: initialSolid.A, 
        B: initialSolid.D, 
        C: initialSolid.B, 
        D: initialSolid.E, 
        E: initialSolid.C, 
        F: initialSolid.F  
    };
}

function applyCyclicTransformation(currentSolid, transformationFunc, rotations) {
    let modifiedSolid = currentSolid;
    let actualRotations = normalizeRotationCount(rotations);
    for (let i = 0; i < actualRotations; i++) {
        modifiedSolid = transformationFunc(modifiedSolid);
    }
    return modifiedSolid;
}

function alignSolid(initialSolid, desiredTopLabel, desiredFrontLabel) {
    let workingSolid = initialSolid;

    const currentTopLabelFace = locateLabel(workingSolid, desiredTopLabel);

    const topAdjustmentPlan = {
        'B': (s) => applyCyclicTransformation(s, transformRoll, 1),   
        'C': (s) => applyCyclicTransformation(s, transformTurn, 1),   
        'D': (s) => applyCyclicTransformation(s, transformTurn, -1),  
        'E': (s) => applyCyclicTransformation(s, transformRoll, -1),  
        'F': (s) => applyCyclicTransformation(s, transformRoll, 2),   
        'A': (s) => s 
    };
    workingSolid = topAdjustmentPlan[currentTopLabelFace](workingSolid);

    const currentFrontLabelFace = locateLabel(workingSolid, desiredFrontLabel);

    const frontAdjustmentSpins = {
        'B': 0, 
        'C': 1, 
        'E': 2, 
        'D': 3  
    };
    const spinsRequired = frontAdjustmentSpins[currentFrontLabelFace];
    workingSolid = applyCyclicTransformation(workingSolid, transformSpin, spinsRequired);

    return workingSolid;
}

new Promise(function (resolveCallback, rejectCallback) {
    let collectedData = "";
    process.stdin.on("data", dataChunk => { collectedData += dataChunk; });
    process.stdin.on("end", () => { resolveCallback([collectedData, process.stdout]); });
}).then(function([inputContent, outputStream]) {
    const lines = inputContent.split("\n");
    const initialConfigLabels = lines[0].split(" ");
    const queryCount = parseInt(lines[1], 10);
    const queryEntries = lines.slice(2, 2 + queryCount).map(line => line.split(" "));

    let currentSolid = craftSolid(initialConfigLabels);

    for (const [targetTop, targetFront] of queryEntries) {
        currentSolid = alignSolid(currentSolid, targetTop, targetFront);
        outputStream.write(`${currentSolid.C}\n`); 
    }
});