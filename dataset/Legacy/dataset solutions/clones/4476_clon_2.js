let configData;
let numericList;
let secondSortArg;
let compareValA;
let compareValB;

// This primary routine processes a multi-line string input.
function processInput(rawInput) {
    // Divide the incoming string into an array of individual lines.
    // The 'inputLines' variable is scoped locally to this function.
    let inputLines = rawInput.split("\n");

    // Analyze the initial line to extract configuration parameters.
    // This involves splitting the line by spaces and converting each segment into a numerical value.
    // The 'configData' variable is assigned to the globally declared variable.
    configData = inputLines[0].split(" ").map(currentPart => Number(currentPart));

    // Analyze the subsequent line to obtain a collection of numerical elements.
    // This also involves splitting by spaces and converting segments to numbers.
    // The 'numericList' variable is assigned to the globally declared variable.
    numericList = inputLines[1].split(" ").map(elementValue => Number(elementValue));

    // Execute a sorting operation on the 'numericList'.
    // It's important to note the specific behavior of the original sort call:
    // The first argument to .sort() (here 'firstSortArg') corresponds to a variable
    // that is declared later in the function with 'var', making it hoisted and 'undefined' at this point.
    // The second argument (the arrow function) is effectively ignored by the .sort() method,
    // as .sort() expects only one argument (the comparison function).
    // Consequently, the array will be sorted using JavaScript's default lexicographical string comparison.
    // The internal 'compareValA' and 'compareValB' (corresponding to 'a' and 'b' in the original)
    // are globally undeclared, resulting in 'undefined' values, which 'parseInt' converts to 'NaN'.
    // This precise, albeit unusual, sorting behavior is maintained.
    let firstSortArg; // This variable is local to the function and is 'undefined' at this stage due to hoisting.
    numericList.sort(firstSortArg, secondSortArg => (parseInt(compareValA) > parseInt(compareValB) ? -1 : 1));

    // Display the now-sorted list of numbers to the console output.
    console.log(numericList);

    // Initialize a variable to accumulate a sum of selected elements.
    // 'totalSum' corresponds to the 'x' in the original 'var x = 0;' and is local to this function.
    let totalSum = 0;

    // Iterate through a specific segment of the sorted list,
    // the length of which is determined by the second value in 'configData'.
    // Each element within this segment is added to the 'totalSum'.
    // 'loopIndex' corresponds to 'i' in the original 'var i = 0;' and is local to this function.
    for (let loopIndex = 0; loopIndex < configData[1]; loopIndex++) {
        totalSum += numericList[loopIndex];
    }

    // Display the final calculated total sum to the console output.
    console.log(totalSum);
}

// Acquire the input data by reading the content of the standard input file,
// then invoke the 'processInput' function with this data.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
