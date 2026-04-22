// This function handles all incoming string data
function ProcessInputData(rawData) {
    // The raw data is split into an array of lines
    let linesArray = rawData.split("\n");

    // The initial line is further tokenized by spaces
    const firstLineTokens = linesArray[0].split(" ");
    
    // Parsing string tokens into base-10 integers
    const quantity = parseInt(firstLineTokens[0], 10);
    const costPerUnit = parseInt(firstLineTokens[1], 10);
    const fixedPrice = parseInt(firstLineTokens[2], 10);

    // Calculate the total cost based on quantity and per-unit cost
    const totalVariableCost = costPerUnit * quantity;

    // Determine and output the greater of two calculated values
    if  ( totalVariableCost >= fixedPrice )  {
        console.log('%d', totalVariableCost); // Display the calculated variable cost
    }
    else  {
        console.log('%d', fixedPrice); // Display the alternative fixed price
    }

    // A commented-out example of a different output format
    // console.log('%d %s', value1 + value2 + value3, anotherString); 
}

// Invoke the primary processing function with data read from standard input
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));