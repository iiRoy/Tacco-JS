process.stdin.resume();
process.stdin.setEncoding('utf8');

// This event listener processes incoming data from standard input.
process.stdin.on('data', function (dataChunk) {
  // Split the input string by spaces to get individual numeric components.
  var inputParts = dataChunk.split(" ");

  // Parse the first three components as floating-point numbers.
  // These variables are implicitly global, mirroring the original's behavior.
  sideA = parseFloat(inputParts[0]);
  sideB = parseFloat(inputParts[1]);
  angleC = parseFloat(inputParts[2]);

  // Convert the angle from degrees to radians for trigonometric functions.
  var angleCRadians = angleC / 180 * Math.PI;

  // Calculate the area of the triangle using the formula: 0.5 * a * b * sin(C).
  var areaTriangle = 0.5 * sideA * sideB * Math.sin(angleCRadians);

  // Calculate the perimeter of the triangle.
  // The third side is found using the Law of Cosines: c^2 = a^2 + b^2 - 2ab cos(C).
  var perimeterTriangle = sideA + sideB + Math.sqrt(sideA * sideA + sideB * sideB - 2 * sideA * sideB * Math.cos(angleCRadians));

  // Calculate the height of the triangle relative to side 'a' as the base.
  // Area = 0.5 * base * height => height = 2 * Area / base.
  var heightTriangle = areaTriangle / sideA * 2;

  // Output the calculated area, perimeter, and height to the console.
  console.log(areaTriangle);
  console.log(perimeterTriangle);
  console.log(heightTriangle);
});
