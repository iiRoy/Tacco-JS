const acquireSource = (pathIdentifier) => require('node:fs').readFileSync(pathIdentifier, 'utf8');

const segmentSource = (rawContent) => rawContent.trim().split(/\r?\n/);

const extractRelevantEntries = (processedLines) => {
    const totalRecords = Number(processedLines[0]);
    return processedLines.slice(1, totalRecords + 1);
};

const decomposeTimeDatum = (timeString) => {
    const regexMatch = timeString.match(/(\d{1,2}):(\d{2})/);
    return {
        majorUnit: Number(regexMatch[1]),
        minorUnit: Number(regexMatch[2])
    };
};

const computeRotationalPositions = (timeUnits) => {
    const mainValue = timeUnits.majorUnit;
    const subValue = timeUnits.minorUnit;

    const maximalDegrees = 360;
    const majorDivisions = 12;
    const minorDivisions = 60;

    const anglePrimary = mainValue * (maximalDegrees / majorDivisions) + subValue * (maximalDegrees / (majorDivisions * minorDivisions));
    const angleSecondary = subValue * (maximalDegrees / minorDivisions);

    return {
        firstIndicator: anglePrimary,
        secondIndicator: angleSecondary
    };
};

const derivePositionalSeparation = (indicatorAngles) => Math.abs(indicatorAngles.firstIndicator - indicatorAngles.secondIndicator);

const determineSituationalStatus = (angularSeparation) =>
  [
    { condition: (val) => val >= 0 && val < 30, outcome: "alert" },
    { condition: (val) => val >= 90 && val < 180, outcome: "safe" }
  ].find(ruleSet => ruleSet.condition(angularSeparation))?.outcome || "warning";

const orchestrateProcessing = (sourceLoc) => {
    const rawData = acquireSource(sourceLoc);
    const segmentedData = segmentSource(rawData);
    const pertinentEntries = extractRelevantEntries(segmentedData);

    const resultingStates = pertinentEntries.map(currentEntry => {
        const parsedTime = decomposeTimeDatum(currentEntry);
        const rotationalValues = computeRotationalPositions(parsedTime);
        const separationMagnitude = derivePositionalSeparation(rotationalValues);
        return determineSituationalStatus(separationMagnitude);
    });

    resultingStates.forEach(finalStatus => console.log(finalStatus));
};

orchestrateProcessing('/dev/stdin');