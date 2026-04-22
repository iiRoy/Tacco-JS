const acquireSourceData = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();
const emitOutcome = (val) => console.log(val);
const signalProblem = (val) => console.error(val);

const verifyPattern = (inputSequence) => {
    const minimumExpectedLength = 5;
    const maximumPermittedLength = 9;

    if (inputSequence.length < minimumExpectedLength || inputSequence.length > maximumPermittedLength) {
        return false;
    }

    const essentialMarkers = ['K', 'I', 'H', 'B', 'R'];
    const markerPositions = new Map();

    for (const marker of essentialMarkers) {
        const currentPosition = inputSequence.indexOf(marker);
        if (currentPosition === -1) {
            return false;
        }
        markerPositions.set(marker, currentPosition);
    }

    const kPosition = markerPositions.get('K');
    const iPosition = markerPositions.get('I');
    const hPosition = markerPositions.get('H');
    const bPosition = markerPositions.get('B');
    const rPosition = markerPositions.get('R');

    if (!(kPosition < iPosition && iPosition < hPosition && hPosition < bPosition && bPosition < rPosition)) {
        return false;
    }

    if (iPosition - kPosition !== 1) {
        return false;
    }

    const confirmAdjacentMarkers = (firstMarker, secondMarker) => {
        const firstCoord = markerPositions.get(firstMarker);
        const secondCoord = markerPositions.get(secondMarker);
        return (secondCoord - firstCoord) === 1;
    };

    if (!confirmAdjacentMarkers('H', 'B')) {
        return false;
    }

    if (!confirmAdjacentMarkers('B', 'R')) {
        return false;
    }

    if (inputSequence.startsWith('AA')) {
        return false;
    }

    if (inputSequence.endsWith('AA')) {
        return false;
    }

    return true;
};

const orchestrateValidation = () => {
    const incomingData = acquireSourceData();
    const finalVerdict = verifyPattern(incomingData) ? "YES" : "NO";
    emitOutcome(finalVerdict);
};

orchestrateValidation();