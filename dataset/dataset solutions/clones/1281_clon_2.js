// This script processes input from standard input to aggregate and display building occupancy data.

process.stdin.resume(); // Ensures the standard input stream remains open.
process.stdin.setEncoding('utf-8'); // Configures the character encoding for incoming data.

let rawInputContent = ''; // A string buffer to accumulate all data received from stdin.

// Attaches an event listener for 'data' events on the standard input stream.
process.stdin.on('data', (dataSegment) => {
    rawInputContent += dataSegment; // Appends each received data chunk to the buffer.
});

// Attaches an event listener for the 'end' event, signaling the completion of stdin input.
process.stdin.on('end', () => {
    // Splits the accumulated raw input into an array of individual lines.
    const inputLines = rawInputContent.split('\n');
    // Invokes the primary data processing function with the collected lines.
    processInputData(inputLines);
});

/**
 * Processes an array of input strings to calculate and output building occupancy.
 * Each input line (after the first) represents an occupancy change for a specific room.
 *
 * @param {string[]} dataCollection - An array of strings, where the first element is the count
 *                                    of subsequent data entries, and the rest are the entries themselves.
 */
const processInputData = (dataCollection) => {
    // Extracts the first element, which indicates the total number of data entries to follow.
    const numEntries = dataCollection.shift();

    // Slices the array to get only the actual data entries, excluding the count.
    const entryList = dataCollection.slice(0, numEntries);

    // Initializes a 3D array to store occupancy counts.
    // Dimensions: [building_id][floor_id][room_id]
    // There are 4 buildings, 3 floors per building, and 10 rooms per floor.
    let buildingData = new Array(4)
        .fill(null) // Fills the top level with nulls as placeholders.
        .map(_ignoredBuilding => new Array(3) // Maps each building placeholder to an array for floors.
            .fill(null) // Fills the floor level with nulls.
            .map(_ignoredFloor => new Array(10) // Maps each floor placeholder to an array for rooms.
                .fill(0))); // Initializes all room occupancy counts to zero.

    // Iterates over each data entry to update the occupancy records.
    entryList.forEach(currentEntry => {
        // Parses the current entry string into an array of integers.
        // Expected format: "building_number floor_number room_number occupancy_change"
        const parsedEntryDetails = currentEntry.split(' ').map(numericValue => parseInt(numericValue, 10));

        // Updates the occupancy for the specific room.
        // Note: Input numbers are 1-based, so 1 is subtracted to get 0-based array indices.
        buildingData[parsedEntryDetails[0] - 1][parsedEntryDetails[1] - 1][parsedEntryDetails[2] - 1] += parsedEntryDetails[3];
    });

    // Iterates through the aggregated building data to print the results to console.
    buildingData.forEach((floorData, buildingIndex) => {
        let outputLineBuffer = ''; // A temporary string to build each line of room occupancy.

        // Iterates through each floor's data within the current building.
        floorData.forEach(roomData => {
            // Iterates through each room's occupancy count on the current floor.
            roomData.forEach(occupantCount => {
                outputLineBuffer += ' ' + occupantCount; // Appends the count, prefixed with a space.
            });
            console.log(outputLineBuffer); // Prints the complete line for the current floor.
            outputLineBuffer = ''; // Resets the buffer for the next floor's output.
        });

        // Prints a separator line after each building's data, except for the very last building.
        if (buildingIndex !== buildingData.length - 1) {
            console.log('####################');
        }
    });
};
