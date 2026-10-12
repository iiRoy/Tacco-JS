var inputLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n"); // Read all lines from standard input

// The first line contains two numbers: the total number of cities (N) and the total number of roads (M).
var cityAndRoadCounts = inputLines[0].split(" ").map(strVal => parseInt(strVal, 10));

// Create an array to store the degree of each city. Initialize all city degrees to zero.
// The size of this array corresponds to the number of cities (N).
var cityConnections = new Array(cityAndRoadCounts[0]).fill(0);

var currentRoadInfo; // Temporary variable to hold parsed road data

// Iterate through each road description provided in the input.
// Road descriptions start from the second line (index 1) up to M lines.
for (var roadIndex = 1; roadIndex <= cityAndRoadCounts[1]; roadIndex++) {
  // Parse the current line, which specifies two cities connected by a road.
  currentRoadInfo = inputLines[roadIndex].split(" ").map(numStr => parseInt(numStr, 10));

  // Increment the connection count for the first city in the road pair.
  // Adjust for 0-based array indexing (input cities are 1-based).
  cityConnections[currentRoadInfo[0] - 1]++;

  // Increment the connection count for the second city in the road pair.
  cityConnections[currentRoadInfo[1] - 1]++;
}

// Output the final connection count for each city, with each count on a new line.
console.log(cityConnections.join("\n"));
