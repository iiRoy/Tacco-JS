// This function processes the input to calculate a specific area.
function ProcessInput(rawData) {
    // Split the raw input string into individual lines.
    rawData = rawData.split("\n");

    // The first line contains the overall dimensions (height and width).
    let dimensions = rawData[0].split(" ");

    // The second line contains the dimensions of the area to be removed.
    let removedArea = rawData[1].split(" ");

    // Convert the string representations of dimensions into integer values.
    const totalHeight = parseInt(dimensions[0]);
    const totalWidth = parseInt(dimensions[1]);

    const removedHeight = parseInt(removedArea[0]);
    const removedWidth = parseInt(removedArea[1]);

    // Calculate the remaining area using the provided formula.
    // This formula is equivalent to (totalHeight - removedHeight) * (totalWidth - removedWidth).
    console.log((totalHeight * totalWidth) - (removedHeight * totalWidth) - (totalHeight * removedWidth) + (removedHeight * removedWidth));
}

// Read the entire content from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
