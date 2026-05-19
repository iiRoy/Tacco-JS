function ProcessInput(rawData) {
    // The first line goes into rawData[0], the second into rawData[1], etc.
    // We'll split the entire input string by newline characters.
    let lines = rawData.split("\n");

    // The second line (index 1) contains space-separated values.
    // We'll split that line to get its individual components.
    const parts = lines[1].split(" ");

    // Convert string representations to base-10 integers.
    // The first number is from the very first line of input.
    var valA = parseInt(lines[0], 10);
    // The next two numbers are from the second line, split earlier.
    var valB = parseInt(parts[0], 10);
    var valC = parseInt(parts[1], 10);

    // The third line (index 2) is a string.
    let textStr = lines[2];

    // Output the sum of the three integers and the string.
    // Using a formatted string for console output.
    console.log('%d %s', valA + valB + valC, textStr);
}

// Do not modify the following line; it handles standard input/output and calls the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
