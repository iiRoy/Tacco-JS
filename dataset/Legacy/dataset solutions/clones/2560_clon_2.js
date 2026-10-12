function ProcessInput(rawData) {
    // Split the incoming raw data string into individual lines.
    rawData = rawData.split("\n");

    // Extract configuration parameters from the initial line.
    // These parameters are space-separated numbers.
    var configParams = rawData[0].split(" ").map(Number);

    // Initialize a dynamic data storage array.
    // Its size is determined by the first configuration parameter plus one.
    // Each element is pre-filled with a calculated value based on the second and third parameters.
    var dataStore = new Array(configParams[0] + 1).fill(configParams[1] - configParams[2]);

    // Remove the first line from the raw data, as it has been processed.
    rawData.shift();

    // Iterate through the remaining lines of raw data.
    // Each line provides an index for which to increment a counter in the data store.
    rawData.forEach(function(itemIndex) {
        dataStore[itemIndex]++; // Increment the count at the specified index.
    });

    // Discard the first element of the data store array.
    // This is a common pattern when problem statements use 1-based indexing.
    dataStore.shift();

    // Process each element in the modified data store and output a result.
    dataStore.forEach(function(currentValue) {
        // Print "Yes" if the current value is one or greater, otherwise print "No".
        console.log(currentValue >= 1 ? "Yes" : "No");
    });
}

// Invoke the primary processing function.
// It reads content from standard input, decodes it as UTF-8, and removes leading/trailing whitespace.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
