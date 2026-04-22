const processStream = (rawData) => {
    const contentLines = rawData.split('\n');
    const numeralSequenceText = contentLines[1];

    const evenValueCounter = numeralSequenceText
        .split(' ')
        .reduce((currentTally, stringRepresentation) => {
            const numericValue = Number(stringRepresentation);
            // Check for evenness using bitwise AND
            return currentTally + ((numericValue & 1) === 0 ? 1 : 0);
        }, 0);

    // Use a lookup table for the final decision message
    const resultMapping = {
        true: "YES",  // If the count of even values is odd
        false: "NO"   // If the count of even values is even
    };

    // Determine if the count of even values is odd
    const isEvenCountOdd = (evenValueCounter & 1) !== 0;
    const finalOutput = resultMapping[isEvenCountOdd];

    console.log(finalOutput);
};

processStream(require("fs").readFileSync("/dev/stdin", "utf8"));