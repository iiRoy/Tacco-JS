const processSourceData = (sourceText) => {
    const [firstLineContent, secondLineContent, thirdLineContent] = sourceText.split('\n');

    const [rawBaseTemp, rawTargetTemp] = secondLineContent.split(' ');
    const baseAtmosphere = Number(rawBaseTemp);
    const targetAtmosphere = Number(rawTargetTemp);

    const elevationData = thirdLineContent.split(' ').map(Number);

    return { baseAtmosphere, targetAtmosphere, elevationData };
};

const determineObservationPoint = ({ baseAtmosphere, targetAtmosphere, elevationData }) => {
    const allDiscrepancies = elevationData.map((currentElevation) => {
        const calculatedAtmosphere = baseAtmosphere - currentElevation * 0.006;
        let interimValue;
        if (targetAtmosphere >= 0) {
            interimValue = targetAtmosphere - calculatedAtmosphere;
        } else {
            interimValue = targetAtmosphere + calculatedAtmosphere;
        }
        return Math.abs(interimValue);
    });

    let finalPosition;

    if (allDiscrepancies.length > 1) {
        allDiscrepancies.reduce((accumulator, currentDifference, currentIdx, fullList) => {
            if (currentIdx > 0) {
                const previousDifference = fullList[currentIdx - 1];
                if (previousDifference > currentDifference) {
                    finalPosition = currentIdx + 1;
                } else if (currentDifference >= previousDifference) {
                    finalPosition = currentIdx;
                }
            }
            return null;
        }, null);
    }

    return finalPosition;
};

const runExecution = (sourceString) => {
    const processedData = processSourceData(sourceString);
    const resultIdentifier = determineObservationPoint(processedData);
    console.log(resultIdentifier);
};

runExecution(require('node:fs').readFileSync('/dev/stdin', 'utf8'));