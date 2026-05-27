const processInput = (rawData) => {
    // Divide the incoming raw data string into individual lines.
    const parsedLines = rawData.split("\n");

    // Parse the first line to obtain the total number of items and the number of queries.
    const [ totalItems, queryCount ] = parsedLines[0].split(' ').map(val => Number(val));

    // The second line contains the collection of items, split by spaces.
    const itemCollection = parsedLines[1].split(' ');
      
    // Iterate through each query, starting from the third line of the input.
    for (let loopIndex = 2; loopIndex < queryCount + 2; loopIndex++) {
        // Extract the starting and ending indices for the current query.
        const [ startIndex, endIndex ] = parsedLines[loopIndex].split(' ').map(val => Number(val));
        
        // Slice the item collection based on the query's range (adjusting for 1-based indexing).
        // Then, filter the sliced portion to find only the unique elements.
        // Finally, print the count of these unique elements to the console.
        console.log(itemCollection.slice(startIndex - 1, endIndex).filter((currentItem, currentIndex, currentArray) => currentArray.indexOf(currentItem) === currentIndex).length);
    }
};
 
// Read the entire content of standard input synchronously and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
