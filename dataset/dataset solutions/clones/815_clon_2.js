process.stdin.resume();
process.stdin.setEncoding("utf8");

// Set up an event listener for incoming data
process.stdin.on ( "data",
    function (dataBlock) {
        // Parse the input block into individual lines
        var rawDataLines = dataBlock.trim().split("\n");
        // Initialize a pointer for the current line being processed
        var currentLineIndex = 0;

        // Loop indefinitely until a termination condition is met
        while ( true ) {
            // Read the first line of the current test case, parse numbers
            var dimensionsTuple = rawDataLines[currentLineIndex].split(/\s+/).map(Number);
            currentLineIndex++; // Advance line pointer

            var totalElements = dimensionsTuple[0]; // Number of elements (N)
            var totalRelations = dimensionsTuple[1]; // Number of relations (M)

            // Termination condition: N and M are both zero
            if (totalElements == 0 && totalRelations == 0)
                break;

            // Initialize an array to track the status of each element
            // 'true' initially means active/unaffected, 'false' means changed/affected
            var statusFlags = [];
            for ( var idx = 0; idx < totalElements; idx++ ) {
                statusFlags[idx] = true;
            }
            // The first element is always changed/affected initially
            statusFlags[0] = false;

            // Array to store all relation records [timestamp, element1, element2]
            var relationRecords = [ ];
            for ( var relIdx = 0; relIdx < totalRelations; relIdx++ ) {
                // Read a relation record and parse it
                var currentRelationData = rawDataLines[currentLineIndex].split(/\s+/).map(Number);
                currentLineIndex++; // Advance line pointer

                // Store the relation, adjusting element indices to be 0-based
                relationRecords.push([currentRelationData[0], currentRelationData[1] - 1, currentRelationData[2] - 1]);
            }

            // Sort the relation records by their timestamp (first element)
            relationRecords.sort( function (itemA, itemB) {
                return itemA[0] - itemB[0];
            } );

            // Process each relation record in chronological order
            relationRecords.forEach(function (singleRecord) {
                var firstIndex = singleRecord[1];  // First element involved in the relation
                var secondIndex = singleRecord[2]; // Second element involved in the relation

                // If the first element is changed/affected, then the second element also becomes changed/affected
                if ( !statusFlags[firstIndex] ) {
                    statusFlags[secondIndex] = false;
                }
            });

            // Count how many elements ended up in the changed/affected state
            var finalCount = 0;
            statusFlags.forEach ( function (flagValue) {
                if ( !flagValue ) { // If the flag indicates 'changed/affected' (i.e., 'false')
                    finalCount++;
                }
            } );

            // Output the total count for the current test case
            console.log(finalCount);
        }
    }
);