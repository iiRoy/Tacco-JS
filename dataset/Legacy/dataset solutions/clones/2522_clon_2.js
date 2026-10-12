// This function is designed to process a given string input.
function ProcessInput(rawData) {
    // The input string is first divided into an array of lines.
    let lineSegments = rawData.split("\n");

    // The initial line contains two primary configuration values, separated by spaces.
    let firstLineParts = lineSegments[0].split(" ");

    // The subsequent line holds a collection of individual data points, also space-separated.
    let secondLineElements = lineSegments[1].split(" ");

    // We extract the total number of participants from the first part of the first line.
    const totalParticipants = parseInt(firstLineParts[0], 10);

    // And the maximum permissible height from the second part of the first line.
    const thresholdHeight = parseInt(firstLineParts[1], 10);

    // A counter is initialized to keep track of individuals who meet the height requirement.
    let eligibleCount = 0;

    // We then iterate through each participant's recorded height.
    for (let idx = 0; idx < totalParticipants; idx++) {
        // The current participant's height string is converted into an integer.
        const currentHeight = parseInt(secondLineElements[idx], 10);

        // A check is performed to see if the participant's height is at least the threshold height.
        if (thresholdHeight <= currentHeight) {
            // If the condition is satisfied, the eligibility counter is incremented.
            eligibleCount++;
        }
    }

    // Finally, the total count of eligible participants is printed to the console.
    console.log(eligibleCount);
}

// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
