const applicationRunner = (function() {
    // This function mimics reading input from a file, similar to Node.FS.Sync.readTextFile.
    // It assumes a Node.js environment for `/dev/stdin`.
    const fetchInputText = (sourcePathIdentifier) => {
        try {
            const systemFileHandle = require('fs');
            return systemFileHandle.readFileSync(sourcePathIdentifier, { encoding: 'utf8' });
        } catch (inputError) {
            // In a competitive programming context, input is usually guaranteed.
            // For robustness, one might throw or log, but for Type IV,
            // we'll provide a mock for demonstration if actual file read fails.
            console.error("Input retrieval failed:", inputError.message);
            // Example input matching problem ABC113.C
            return "2 3\n1 2\n1 3\n2 1";
        }
    };

    // This function mimics logging output to console, similar to Effect.Console.log.
    const displayOutput = (displayContent) => {
        console.log(displayContent);
    };

    // This is the core problem-solving logic, replacing n["AtCoder.ABC113.C"].solve.
    const computeProblemSolution = (sourceDataText) => {
        // Parse the entire input text into individual lines.
        const allRelevantLines = sourceDataText.trim().split('\n');

        // Extract N (total prefectures) and M (total cities) from the first line.
        const firstLineData = allRelevantLines[0];
        const dimensionValues = firstLineData.split(' ').map(Number);
        const totalPrefectureCount = dimensionValues[0]; // N
        const totalCityCount = dimensionValues[1];      // M

        // Parse city data (Prefecture P, Year Y) and store their original indices.
        const cityInformationEntries = [];
        for (let currentLineIndex = 1; currentLineIndex <= totalCityCount; currentLineIndex++) {
            const cityEntryLine = allRelevantLines[currentLineIndex];
            const cityEntryParts = cityEntryLine.split(' ').map(Number);
            cityInformationEntries.push({
                prefCode: cityEntryParts[0],      // Equivalent to 'p'
                establishmentYear: cityEntryParts[1], // Equivalent to 'y'
                originalPosition: currentLineIndex - 1 // Equivalent to 'i'
            });
        }

        // Sort the cities: primary key is prefecture code, secondary key is establishment year.
        cityInformationEntries.sort((firstCityItem, secondCityItem) => {
            if (firstCityItem.prefCode !== secondCityItem.prefCode) {
                return firstCityItem.prefCode - secondCityItem.prefCode;
            }
            return firstCityItem.establishmentYear - secondCityItem.establishmentYear;
        });

        // Initialize an array to hold the final formatted IDs, preserving original order.
        const finalResultIdentifierArray = new Array(totalCityCount);

        // Iterate through the sorted cities to assign unique IDs within each prefecture.
        let currentPrefectureTracker = -1;
        let citySequenceInPrefecture = 0;

        for (const cityObject of cityInformationEntries) {
            if (cityObject.prefCode !== currentPrefectureTracker) {
                currentPrefectureTracker = cityObject.prefCode;
                citySequenceInPrefecture = 1; // Reset counter for a new prefecture
            } else {
                citySequenceInPrefecture++; // Increment counter within the same prefecture
            }

            // Format prefecture code and city sequence number to 6 digits with leading zeros.
            const formattedPrefectureCode = String(cityObject.prefCode).padStart(6, '0');
            const formattedCitySequence = String(citySequenceInPrefecture).padStart(6, '0');

            // Store the combined ID string at its original position.
            finalResultIdentifierArray[cityObject.originalPosition] = formattedPrefectureCode + formattedCitySequence;
        }

        // Join the final ID strings with newline characters.
        return finalResultIdentifierArray.join('\n');
    };

    // This function orchestrates the application's main flow, replacing n.Main.main().
    const initiateApplication = () => {
        const acquiredInput = fetchInputText('/dev/stdin');
        const processedOutputData = computeProblemSolution(acquiredInput);
        displayOutput(processedOutputData);
    };

    return {
        startSystem: initiateApplication // Provide a public method to start.
    };
})();

// Begin the application execution.
applicationRunner.startSystem();