function calculateTriangleArea(sideA, sideB, sideC) {
  // Calculate the semi-perimeter of the triangle using the given side lengths.
  let semiPerimeter = (sideA + sideB + sideC) / 2;

  // Apply Heron's formula to compute the area of the triangle.
  let triangleArea = Math.sqrt(semiPerimeter * (semiPerimeter - sideA) * (semiPerimeter - sideB) * (semiPerimeter - sideC));

  return triangleArea;
}

// Read all input data from standard input, assuming UTF-8 encoding.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into individual lines.
const lineEntries = rawData.trim().split("\n");

// Iterate through each line of input, where each line represents a set of coordinates.
for (let idx = 0; idx < lineEntries.length; idx++) {
  // Parse the current line: split by space and convert each part to a number.
  const coordinateValues = lineEntries[idx].split(" ").map(Number);

  // Extract coordinates for the three vertices of the main triangle (V1, V2, V3).
  const coordX1 = coordinateValues[0];
  const coordY1 = coordinateValues[1];
  const coordX2 = coordinateValues[2];
  const coordY2 = coordinateValues[3];
  const coordX3 = coordinateValues[4];
  const coordY3 = coordinateValues[5];

  // Extract coordinates for the test point P.
  const pointPX = coordinateValues[6];
  const pointPY = coordinateValues[7];

  // Calculate the Euclidean distances between the vertices of the main triangle.
  const dist12 = Math.sqrt(Math.pow(coordX1 - coordX2, 2) + Math.pow(coordY1 - coordY2, 2));
  const dist13 = Math.sqrt(Math.pow(coordX1 - coordX3, 2) + Math.pow(coordY1 - coordY3, 2));
  const dist23 = Math.sqrt(Math.pow(coordX2 - coordX3, 2) + Math.pow(coordY2 - coordY3, 2));

  // Calculate the Euclidean distances from the test point P to each vertex.
  const distP1 = Math.sqrt(Math.pow(pointPX - coordX1, 2) + Math.pow(pointPY - coordY1, 2));
  const distP2 = Math.sqrt(Math.pow(pointPX - coordX2, 2) + Math.pow(pointPY - coordY2, 2));
  const distP3 = Math.sqrt(Math.pow(pointPX - coordX3, 2) + Math.pow(pointPY - coordY3, 2));

  // Compute the area of the main triangle (V1-V2-V3).
  const mainTriangleArea = calculateTriangleArea(dist12, dist13, dist23);

  // Compute the sum of the areas of three sub-triangles formed by point P and two vertices:
  // (P-V1-V2), (P-V1-V3), and (P-V2-V3).
  const sumOfSubTriangleAreas = calculateTriangleArea(dist12, distP1, distP2) +
                                  calculateTriangleArea(dist13, distP1, distP3) +
                                  calculateTriangleArea(dist23, distP2, distP3);

  // Determine if point P is inside the main triangle.
  // This is true if the sum of the areas of the sub-triangles is approximately equal
  // to the area of the main triangle, allowing for a small floating-point error margin.
  console.log((Math.abs(mainTriangleArea - sumOfSubTriangleAreas) < 0.0005) ? "YES" : "NO");
}
