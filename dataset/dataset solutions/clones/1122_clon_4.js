var outputWriter = console.log;
if (typeof process !== "undefined") {
    var accumulatedInput = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(dataChunk) {
        accumulatedInput += dataChunk;
    });
    process.stdin.on('end', function() {
        var rawInputLines = accumulatedInput.split("\n");
        coordinateProcessor(rawInputLines);
    });
}

function coordinateProcessor(rawInputLines) {
    // Parse input lines into numeric coordinate pairs, preserving original's parsing quirks
    const polygonPoints = rawInputLines.map(function(singleLine) {
        return singleLine.split(" ").filter(function(item) {
            return item !== ""; // Remove empty strings that might result from multiple spaces
        }).map(function(strValue) {
            const parsedNum = Number(strValue);
            // Replicate original code's behavior: if Number() results in NaN,
            // it attempts to clean newlines/carriage returns and returns the *string*.
            if (parsedNum.toString() === "NaN") {
                return strValue.replace(/(\r)|(\n)/g, "");
            }
            return parsedNum;
        });
    });

    // The first line typically contains the count of vertices (n), which is not explicitly
    // used in the area calculation by the original implementation, so it's discarded.
    polygonPoints.shift(); 

    // Compute the geometric area of the polygon
    const calculatedArea = calculatePolygonArea(polygonPoints);

    // Format the result to one decimal place, truncating rather than rounding
    let formattedAreaString = String(calculatedArea);
    const dotPosition = formattedAreaString.indexOf(".");
    if (dotPosition === -1) {
        // If there's no decimal point, append ".0"
        formattedAreaString += ".0";
    } else {
        // If there is a decimal, truncate to one digit after the point
        formattedAreaString = formattedAreaString.slice(0, dotPosition + 2);
    }
    outputWriter(formattedAreaString);
}

function calculatePolygonArea(listOfVertices) {
    const vertexCount = listOfVertices.length;
    if (vertexCount < 3) {
        return 0; // A polygon requires a minimum of 3 vertices
    }

    // Implement the Shoelace Formula using a functional reduce pattern.
    // The sum is (x_i * y_{i+1} - x_{i+1} * y_i) for i from 0 to n-1.
    // The problem statement guarantees vertices are in counter-clockwise order,
    // so the resulting sum will be positive.
    const summationOfCrossProducts = listOfVertices.reduce((runningTotal, currentVertex, idx) => {
        // Get the next vertex, wrapping around to the first vertex for the last iteration
        const nextVertex = listOfVertices[(idx + 1) % vertexCount]; 
        const currentX = currentVertex[0];
        const currentY = currentVertex[1];
        const nextX = nextVertex[0];
        const nextY = nextVertex[1];
        // JavaScript's type coercion handles cases where coordinates might be strings
        return runningTotal + (currentX * nextY - nextX * currentY);
    }, 0);

    // The area is half of the computed sum. No Math.abs() is necessary due to CCW order.
    return summationOfCrossProducts / 2;
}