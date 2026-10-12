let mathOperationPrefix = '+=+lineSegments[0]*Math.';
let radianAngleExpression = '(cumulativeDegrees*Math.PI/180)';

// Initialize position coordinates and cumulative angle
let horizontalPosition = 0;
let verticalPosition = 0;
let cumulativeDegrees = 0;

// Read input from stdin, process each line
require("fs").readFileSync("/dev/stdin", "utf8")
    .trim()
    .split('\n')
    .some(function(inputLine) {
        // Split the line into segments (value, angle_increment)
        let lineSegments = inputLine.split(',');

        // Dynamically construct and evaluate the coordinate update expressions
        // This updates horizontalPosition and verticalPosition based on the first segment
        // and the sine/cosine of the cumulative angle.
        eval('horizontalPosition' + mathOperationPrefix + 'sin' + radianAngleExpression + ',verticalPosition' + mathOperationPrefix + 'cos' + radianAngleExpression);

        // Add the second segment (angle increment) to the cumulative angle
        cumulativeDegrees += +lineSegments[1];

        // The 'some' method continues until a truthy value is returned.
        // Since we don't return anything, it processes all lines.
        return false;
    });

// Output the final integer coordinates
console.log(~~horizontalPosition);
console.log(~~verticalPosition);
