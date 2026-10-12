(function(rawData) {
    // Process the raw input string into an array of lines.
    // Remove any trailing newline character and then split by newline.
    var linesArray = rawData.replace(/\n$/, '').split('\n');

    // The first line contains the number of test cases.
    var numCases = Number(linesArray.shift());

    // Iterate through each test case.
    for (var idx = 0; idx < numCases; idx++) {
        // Parse the current line's arguments into an array of numbers.
        var coords = linesArray[idx].split(' ').map(Number);

        // Extract the coordinates of the three vertices of the triangle.
        var pt1X = coords.shift(); // First point's X-coordinate
        var pt1Y = coords.shift(); // First point's Y-coordinate
        var pt2X = coords.shift(); // Second point's X-coordinate
        var pt2Y = coords.shift(); // Second point's Y-coordinate
        var pt3X = coords.shift(); // Third point's X-coordinate
        var pt3Y = coords.shift(); // Third point's Y-coordinate

        // Calculate the X-coordinate of the circumcenter using a specific formula.
        // This formula is derived from the intersection of perpendicular bisectors.
        var centerX = ((Math.pow(pt3X, 2) - Math.pow(pt2X, 2) + Math.pow(pt3Y, 2) - Math.pow(pt2Y, 2)) * (pt2Y - pt1Y)
            - (Math.pow(pt2X, 2) - Math.pow(pt1X, 2) + Math.pow(pt2Y, 2) - Math.pow(pt1Y, 2)) * (pt3Y - pt2Y))
            / 2 / ((pt2Y - pt1Y) * (pt3X - pt2X) - (pt2X - pt1X) * (pt3Y - pt2Y));

        // Calculate the Y-coordinate of the circumcenter using a similar formula.
        var centerY = ((Math.pow(pt3Y, 2) - Math.pow(pt2Y, 2) + Math.pow(pt3X, 2) - Math.pow(pt2X, 2)) * (pt2X - pt1X)
            - (Math.pow(pt2Y, 2) - Math.pow(pt1Y, 2) + Math.pow(pt2X, 2) - Math.pow(pt1X, 2)) * (pt3X - pt2X))
            / 2 / ((pt2X - pt1X) * (pt3Y - pt2Y) - (pt2Y - pt1Y) * (pt3X - pt2X));

        // Calculate the circumradius. It's the distance from the circumcenter to any of the vertices.
        // Using the distance formula: sqrt((x2-x1)^2 + (y2-y1)^2).
        var circumRadius = Math.sqrt(Math.pow(pt1X - centerX, 2) + Math.pow(pt1Y - centerY, 2));

        // Output the circumcenter coordinates and the circumradius, all formatted to 3 decimal places.
        console.log(centerX.toFixed(3), centerY.toFixed(3), circumRadius.toFixed(3));
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input as a UTF-8 string.
