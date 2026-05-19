// This function processes the provided raw input string.
function ProcessInput(rawData) {
    // Split the raw input into an array of lines.
    let lineData = rawData.split("\n");

    // Get the first line and split it by space.
    const firstLineParts = lineData[0].split(" ");

    // Convert the first part of the first line to a number, representing the radius.
    let radiusValue = Number(firstLineParts[0]);

    // Calculate and print the result (3 * radius * radius).
    console.log(3 * radiusValue * radiusValue);
}

// Do not modify the following line; it handles reading from standard input and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
