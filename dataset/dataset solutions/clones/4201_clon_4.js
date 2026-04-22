const fetchSourceText = () => require("node:fs").readFileSync(0, "utf8").trim();

const deliverVerdict = (messageText) => console.log(messageText);

const validateSequenceIntegrity = (sequencePayload) => {
    const characterArray = [...sequencePayload];

    if (characterArray.length > 9) {
        return false;
    }

    const keyMarkers = ['K', 'I', 'H', 'B', 'R'];
    const markerPositions = new Map();

    characterArray.forEach((charElement, charIndex) => {
        if (keyMarkers.includes(charElement)) {
            markerPositions.set(charElement, charIndex);
        }
    });

    const allMarkersPresent = keyMarkers.every(marker => markerPositions.has(marker));
    if (!allMarkersPresent) {
        return false;
    }

    const positionK = markerPositions.get('K');
    const positionI = markerPositions.get('I');
    const positionH = markerPositions.get('H');
    const positionB = markerPositions.get('B');
    const positionR = markerPositions.get('R');

    const conditionK_I_H = (positionK === positionI - 1) && (positionH > positionI);
    if (!conditionK_I_H) {
        return false;
    }

    const conditionH_B = (positionH < positionB) && ((positionB - positionH) <= 2);
    if (!conditionH_B) {
        return false;
    }

    const conditionB_R = (positionB < positionR) && ((positionR - positionB) <= 2);
    if (!conditionB_R) {
        return false;
    }

    const leadingAcount = sequencePayload.match(/^A*/)[0].length;
    if (leadingAcount > 1) {
        return false;
    }

    const trailingAcount = sequencePayload.match(/A*$/)[0].length;
    if (trailingAcount > 1) {
        return false;
    }

    return true;
};

const initiateProcess = () => {
    const rawInputContent = fetchSourceText();
    const validationResult = validateSequenceIntegrity(rawInputContent);
    deliverVerdict(validationResult ? "YES" : "NO");
};

initiateProcess();