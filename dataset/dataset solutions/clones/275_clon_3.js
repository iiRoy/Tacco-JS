var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var dataLines = fileContent.split('\n');

// Helper function to determine the Japanese era and calculate the year within it.
function getJapaneseEraDetails(targetDateObj, originalGregorianYear) {
    let eraIdentifier = '';
    let eraCalculatedYear = originalGregorianYear;
    let eraBaseYear = 0; // Year to subtract from Gregorian year to get era year

    // Define the exclusive upper bounds for each era check
    // Note: Month is 0-indexed in JavaScript Date objects (e.g., 8 is September)
    const MEIJI_ERA_START_BOUNDARY = new Date(1868, 8, 8); // September 8, 1868
    const TAISHO_ERA_START_BOUNDARY = new Date(1912, 6, 30); // July 30, 1912
    const SHOWA_ERA_START_BOUNDARY = new Date(1926, 11, 25); // December 25, 1926
    const HEISEI_ERA_START_BOUNDARY = new Date(1989, 0, 7); // January 7, 1989

    if (targetDateObj < MEIJI_ERA_START_BOUNDARY) {
        eraIdentifier = 'pre-meiji';
    } else if (targetDateObj < TAISHO_ERA_START_BOUNDARY) {
        eraIdentifier = 'meiji';
        eraBaseYear = 1867; // 1868 - 1
    } else if (targetDateObj < SHOWA_ERA_START_BOUNDARY) {
        eraIdentifier = 'taisho';
        eraBaseYear = 1911; // 1912 - 1
    } else if (targetDateObj < HEISEI_ERA_START_BOUNDARY) {
        eraIdentifier = 'showa';
        eraBaseYear = 1925; // 1926 - 1
    } else {
        eraIdentifier = 'heisei';
        eraBaseYear = 1988; // 1989 - 1
    }

    // If an era base year was determined, calculate the era-specific year
    if (eraBaseYear > 0) {
        eraCalculatedYear = originalGregorianYear - eraBaseYear;
    }

    return { eraName: eraIdentifier, eraYearValue: eraCalculatedYear };
}

let currentInputLine;
while ((currentInputLine = dataLines.shift()) !== undefined) {
    const dateComponents = currentInputLine.split(' ').map(Number); // Convert string parts to numbers
    const gregorianYear = dateComponents[0];
    const gregorianMonth = dateComponents[1];
    const gregorianDay = dateComponents[2];

    // Create a Date object for the current input date (month is 0-indexed)
    const processingDate = new Date(gregorianYear, gregorianMonth - 1, gregorianDay);

    // Use the helper function to get era details
    const eraResult = getJapaneseEraDetails(processingDate, gregorianYear);
    const finalEraName = eraResult.eraName;
    const finalEraYear = eraResult.eraYearValue;

    if (finalEraName === 'pre-meiji') {
        console.log('pre-meiji');
        continue; // Move to the next line of input
    }
    
    // Construct the output string using template literals before logging
    const outputString = `${finalEraName} ${finalEraYear} ${gregorianMonth} ${gregorianDay}`;
    console.log(outputString);
}
