process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputLines = []; // Array to store each line read from standard input

const lineReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Event listener for each line of input
lineReader.on('line', (currentLine) => {
    inputLines.push(currentLine);
});

// Event listener for when input stream closes
lineReader.on('close', () => {
    // Parse the first line containing K and N
    const firstLineParts = inputLines[0].split(' ');
    const totalLength = Number(firstLineParts[0]); // K: total length of the circular track
    const numPoints = Number(firstLineParts[1]);   // N: number of points on the track

    // Parse the second line containing the positions of N points
    let pointPositions = inputLines[1].split(' ');
    // Convert string array to an array of numbers
    pointPositions = pointPositions.map(function(numStr) {
        return Number(numStr);
    });

    // This section calculates the distances between adjacent points on the track.
    let distances = [];

    // Calculate distances between consecutive points
    for (let idx = 0; idx < numPoints - 1; idx++) {
        distances.push(pointPositions[idx + 1] - pointPositions[idx]);
    }
    // Calculate the distance from the last point back to the first,
    // considering the circular nature of the track.
    distances.push(totalLength + pointPositions[0] - pointPositions[numPoints - 1]);

    // Find the maximum distance among all segments
    const maxDistance = Math.max(...distances);
    // Get the index of this maximum distance
    const maxDistanceIndex = distances.indexOf(maxDistance);

    // Remove the longest segment from the array of distances
    distances.splice(maxDistanceIndex, 1);

    // Sum the remaining distances to get the final result
    const finalResult = distances.reduce(function(accumulator, currentDistance) {
        return accumulator + currentDistance;
    });

    // Output the calculated sum
    console.log(finalResult);
});
