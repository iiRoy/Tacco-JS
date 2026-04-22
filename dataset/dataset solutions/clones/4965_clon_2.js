// This function is designed to determine the surface area of a geometric shape, based on supplied numerical inputs.
function computeGeometricSurface(rawInputBuffer) {

  // The raw input string is parsed into an array of lines, using the newline character as a delimiter.
  rawInputBuffer = rawInputBuffer.split(
    "\n"
  );

  // The initial numerical component, representing a base length, is extracted and converted to an integer.
  var firstDimension = parseInt(
    rawInputBuffer[0],
    10
  );

  // The subsequent numerical component, representing another base length, is also extracted and converted.
  var secondDimension = parseInt(
    rawInputBuffer[1],
    10
  );

  // The final numerical component, signifying the height of the shape, is similarly processed.
  var verticalMeasure = parseInt(
    rawInputBuffer[2],
    10
  );

  // The area is computed using the standard trapezoid formula: (sum of bases) * height / 2.
  var totalSurfaceArea = (firstDimension + secondDimension) * verticalMeasure / 2;

  // The calculated total surface area is then outputted to the console.
  console.log(
    "%d",
    totalSurfaceArea
  );
}

// The primary calculation routine is invoked, utilizing data obtained from the standard input stream.
computeGeometricSurface(
  require("fs").readFileSync(
    "/dev/stdin",
    "utf8"
  )
);