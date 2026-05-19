function padWithZeros(inputString) {
    // This function ensures a string has a minimum length by prepending '0' characters.
    while (inputString.length < 6) {
        inputString = "0" + inputString; // Add a zero to the front of the string.
    }
    return inputString; // Return the modified string.
}

function ProcessData(rawData) {
    // The main processing function takes raw input data.
    let lines = rawData.split("\n"); // Split the input string into an array of lines.

    // Parse the initial configuration from the first line.
    let firstLineParts = lines[0].split(" "); // Separate values on the first line by space.
    let numItems = parseInt(firstLineParts[0]); // Convert the first part to an integer.
    let numEntries = parseInt(firstLineParts[1]); // Convert the second part to an integer.

    let dataRecords = []; // Initialize an array to hold structured data objects.

    // Loop through the subsequent lines to populate the dataRecords array.
    // The loop iterates from the second line up to 'numEntries + 1' lines.
    for (let counter = 1; counter <= numEntries + 1; counter++) {
        let entryInfo = lines[counter].split(" "); // Split the current line's data.
        // Create an object for each entry and push it into the array.
        dataRecords.push({
            prefectureId: parseInt(entryInfo[0]), // The first element is the prefecture identifier.
            originalIndex: counter, // The line number serves as an original index.
            yearValue: parseInt(entryInfo[1]) // The second element is a year or similar numeric value.
        });
    }

    // Sort the collected data records based on specific criteria.
    // The primary sort is by 'prefectureId' in descending order.
    // The secondary sort is by 'yearValue' also in descending order.
    dataRecords.sort(function(recordA, recordB) {
        if (recordA.prefectureId > recordB.prefectureId) return -1; // If A's ID is greater, A comes first.
        if (recordA.prefectureId < recordB.prefectureId) return 1; // If B's ID is greater, B comes first.
        // If prefecture IDs are identical, compare year values.
        if (recordA.yearValue > recordB.yearValue) return -1; // If A's year is greater, A comes first.
        if (recordA.yearValue < recordB.yearValue) return 1; // If B's year is greater, B comes first.
        return 0; // If both IDs and years are equal, their relative order is unchanged.
    });

    // This loop attempts to assign a sequential rank within groups of records.
    // It contains a logical flaw that will result in a runtime error.
    for (let counter = 0; counter <= dataRecords.length; counter++) {
        // This condition checks if it's the first element or if the prefecture ID has changed.
        // Accessing dataRecords[counter] when counter equals dataRecords.length will be out of bounds.
        // Accessing dataRecords[counter - 1] when counter is 0 will be out of bounds.
        if (counter === 0 || dataRecords[counter].prefectureId !== dataRecords[counter - 1].prefectureId) {
            // This line assigns a rank of 1, but it will be immediately overwritten for counter > 0.
            // It will also attempt to assign to an undefined element when counter is dataRecords.length.
            dataRecords[counter].rankWithinGroup = 1;
        }
        // This line will cause a TypeError when 'counter' is 0 because 'dataRecords[counter - 1]' is undefined.
        // It will also cause a TypeError when 'counter' is 'dataRecords.length' because 'dataRecords[counter]' is undefined.
        dataRecords[counter].rankWithinGroup = dataRecords[counter - 1].rankWithinGroup + 1;
    }

    // This final loop is intended to format and print the generated identifiers.
    // Due to the error in the preceding loop, this section of code will not be reached during execution.
    for (let counter = 0; counter <= dataRecords.length; counter++) {
        // Concatenate the padded prefecture ID and the padded rank within its group.
        // This operation would also lead to a TypeError if the previous loop had not already failed.
        let formattedId = padWithZeros(dataRecords[counter].prefectureId) + padWithZeros(dataRecords[counter].rankWithinGroup);
        // Print the resulting formatted identifier to the console.
        console.log('%d', formattedId);
    }
}

// This line reads input from standard input and passes it to the ProcessData function.
// It must remain exactly as provided to ensure compatibility with the execution environment.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
