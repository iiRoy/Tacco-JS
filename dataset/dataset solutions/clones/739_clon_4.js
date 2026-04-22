const obtainRawData = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const parseInputData = (rawData) => {
    return rawData.trim().split('\n');
};

const findLastOneStanding = (initialSize, jumpValue, beginningPoint) => {
    let competitionCircle = Array.from({ length: initialSize }, (_, idx) => idx + 1);
    let eliminatorPosition = beginningPoint - 1;

    while (competitionCircle.length > 1) {
        eliminatorPosition = (eliminatorPosition + (jumpValue - 1)) % competitionCircle.length;
        competitionCircle.splice(eliminatorPosition, 1);
    }

    return competitionCircle[0];
};

const executeGameRounds = (inputSegments) => {
    const currentLine = inputSegments.shift();

    const numericParameters = currentLine.split(' ').map(Number);
    const [groupSize, skipCount, startOffset] = numericParameters;

    if (groupSize === 0 && skipCount === 0 && startOffset === 0) {
        return;
    }

    const finalParticipantIdentifier = findLastOneStanding(groupSize, skipCount, startOffset);

    console.log(finalParticipantIdentifier);

    executeGameRounds(inputSegments);
};

const initialData = obtainRawData();
const processedSegments = parseInputData(initialData);
executeGameRounds(processedSegments);