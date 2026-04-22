// This function processes the entire incoming data set.
function ProcessInputData(incomingText) {
    // Split the source content into individual rows based on newline characters.
    var dataRows = incomingText.split("\n");

    // The very first row provides the total count of subsequent elements.
    var itemCount = Number(dataRows[0]);

    // The second row contains crucial configuration values, separated by spaces.
    var configElements = dataRows[1].split(" ");

    // Extract the primary duration parameter from the first configuration item.
    var totalDuration = Number(configElements[0]);

    // Obtain the base value for the calculation from the second configuration item.
    var initialValue = Number(configElements[1]);

    // Prepare an array to hold the numerical factors that will be used in computations.
    var elementFactors = [];

    // Loop through the input rows, starting from the third, to populate the factors array.
    for ( var lineIndex = 2; lineIndex < itemCount + 2; lineIndex++ ) {
        elementFactors[lineIndex - 2] = Number(dataRows[lineIndex]);
    }

    // Initialize the aggregate result with the previously extracted initial value.
    var finalOutcome = initialValue;

    // Iterate over each numerical factor stored in our collection.
    for ( var factorIndex = 0; factorIndex < elementFactors.length; factorIndex++ ) {
        // Perform the core calculation: add 1 plus the floor of ((duration - 1) / current factor).
        finalOutcome += 1 + Math.floor((totalDuration - 1) / elementFactors[factorIndex]);
    }

    // Display the final computed outcome to the standard output.
    console.log(finalOutcome);
}

// The segment below is responsible for handling standard I/O operations and should not be altered.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));