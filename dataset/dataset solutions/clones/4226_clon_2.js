function ProcessInputData(rawTextData) {
    // Normalize and parse the incoming text data into a structured array
    rawTextData = rawTextData.trim().split("\n").map(function(lineStr) { return lineStr.split(" "); });
    
    // Extract grid dimensions from the first line of input
    var numRows = parseInt(rawTextData[0][0], 10);
    var numCols = parseInt(rawTextData[0][1], 10);
    
    // Define the upper bound for digit values (0-9, so 10 distinct digits)
    var digitRange = 10;
    
    // Initialize the matrix representing conversion costs between digits
    var conversionCosts = [];
    for (var rowIdx = 0; rowIdx < digitRange; rowIdx++) {
        conversionCosts.push(rawTextData[rowIdx + 1].map(elementStr => parseInt(elementStr, 10)));
    }
    
    // Prepare an array to store the frequency of each digit that needs to be converted
    var targetDigitFrequencies = Array.from({ length: digitRange }, () => 0);
    
    // Iterate through the main grid data to tally digit frequencies
    var currentInputLine;
    for (var rowIdx = 0; rowIdx < numRows; rowIdx++) {
        currentInputLine = rawTextData[rowIdx + 1 + digitRange].map(elementStr => parseInt(elementStr, 10));
        for (var digitValue of currentInputLine) {
            // Ignore placeholder values (-1) as they do not require conversion
            if (digitValue === -1) continue;
            targetDigitFrequencies[digitValue]++;
        }
    }

    // Apply the Floyd-Warshall algorithm to find the minimum conversion cost
    // between any two digits, considering all possible intermediate digits.
    for (var intermediateNode = 0; intermediateNode < digitRange; intermediateNode++) {
        for (var startNode = 0; startNode < digitRange; startNode++) {
            for (var endNode = 0; endNode < digitRange; endNode++) {
                conversionCosts[startNode][endNode] = Math.min(
                    conversionCosts[startNode][endNode],
                    conversionCosts[startNode][intermediateNode] + conversionCosts[intermediateNode][endNode]
                );
            }
        }
    }

    // Calculate the cumulative cost for all required digit conversions
    var finalSum = 0;
    for (var digitIdx = 0; digitIdx < digitRange; digitIdx++) {
        // For each digit, multiply its frequency by the minimum cost to convert it to '1'
        finalSum += conversionCosts[digitIdx][1] * targetDigitFrequencies[digitIdx];
    }

    // Display the computed total cost
    console.log(finalSum);
}

// Invoke the processing function with data read from standard input
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
