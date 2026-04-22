function ProcessCircularRoute(rawInputText) {
    // First, we prepare the incoming text by removing any extraneous whitespace
    // and then splitting it into an array of individual lines for easier parsing.
    var inputLines = rawInputText.trim().split("\n");

    // The initial line of input contains two crucial numerical parameters.
    // We parse these parameters from the first line, which is assumed to be space-separated.
    var routeConfiguration = inputLines[0].split(" ");
    // The first parameter denotes the total length or circumference of the circular route.
    var routeCircumference = parseInt(routeConfiguration[0], 10);
    // The second parameter indicates the total count of distinct stations along the route.
    var numStations = parseInt(routeConfiguration[1], 10);

    // The subsequent line provides the specific positions of each station.
    // These are initially strings, so we convert them into an array of numerical values.
    // We use a mapping function to explicitly multiply each string by 1, forcing type coercion to number.
    var stationPositions = inputLines[1].split(" ").map(function(itemValue) { return itemValue * 1; });

    // We initialize a variable to keep track of the maximum distance found between any two adjacent stations.
    // This value will be crucial for the final calculation, representing the longest gap.
    var largestSegment = 0;

    // A placeholder array, `segmentDistances`, is declared here.
    // Although not directly utilized in the final computation in this specific implementation,
    // its presence maintains the structural integrity of the original code, where a similar variable was present.
    var segmentDistances = [];

    // We now iterate through the array of station positions to determine the longest segment.
    // The loop progresses from the first station up to the last, inclusive, to cover all segments.
    for (var currentIndex = 0; currentIndex < numStations; currentIndex++) {
        // A special condition applies when we reach the very last station in the sequence.
        // For a circular route, the distance from the last station wraps around to the first station.
        if (currentIndex + 1 === numStations) {
            // The distance for this wrap-around segment is calculated as:
            // (Total circumference - position of the last station) + position of the first station.
            largestSegment = Math.max(largestSegment, (routeCircumference - stationPositions[currentIndex]) + stationPositions[0]);
        } else {
            // For all other segments, the distance is simply the straightforward difference in position
            // between the current station and the next station in the array.
            largestSegment = Math.max(largestSegment, stationPositions[currentIndex + 1] - stationPositions[currentIndex]);
        }
    }

    // Finally, the problem requires us to output the minimum total travel distance to visit all stations.
    // This is derived by subtracting the longest individual segment (which we cannot avoid)
    // from the total route circumference.
    console.log(routeCircumference - largestSegment);
}

// This line serves as the entry point for the program's execution.
// It calls the primary processing function, providing it with input read from standard input.
// It leverages Node.js's 'fs' module to synchronously read the entire content of '/dev/stdin' as UTF-8 text.
ProcessCircularRoute(require("fs").readFileSync("/dev/stdin", "utf8"));