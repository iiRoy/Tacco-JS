function determineReignStatus(incomingDatastream) {
    const firstSegmentEnd = incomingDatastream.indexOf('\n');
    const dateComponent = (firstSegmentEnd === -1) ? incomingDatastream : incomingDatastream.substring(0, firstSegmentEnd);

    const firstDivisorPosition = dateComponent.indexOf('/');
    const secondDivisorPosition = dateComponent.indexOf('/', firstDivisorPosition + 1);

    const numericYear = Number(dateComponent.substring(0, firstDivisorPosition));
    const numericMonth = Number(dateComponent.substring(firstDivisorPosition + 1, secondDivisorPosition));
    const numericDay = Number(dateComponent.substring(secondDivisorPosition + 1));

    const boundaryYear = 2019;
    const boundaryMonth = 5;
    const boundaryDay = 1;

    const currentChronologicalValue = (numericYear * 10000) + (numericMonth * 100) + numericDay;
    const thresholdChronologicalValue = (boundaryYear * 10000) + (boundaryMonth * 100) + boundaryDay;

    const eraDesignation = (currentChronologicalValue >= thresholdChronologicalValue)
                           ? "TBD"
                           : "Heisei";

    return eraDesignation;
}