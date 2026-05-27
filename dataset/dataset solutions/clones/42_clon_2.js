require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n')
  .some(function(currentLine) {
    // Split the input line by spaces to get individual string components.
    let lineParts = currentLine.split(' ');

    // Proceed only if the line contains enough parts to define at least two points.
    // The problem implies six coordinates are expected for three points.
    if (lineParts[1]) {
      // Parse the six coordinate values from the line parts.
      let x1 = parseFloat(lineParts[0]),
        y1 = parseFloat(lineParts[1]),
        x2 = parseFloat(lineParts[2]),
        y2 = parseFloat(lineParts[3]),
        x3 = parseFloat(lineParts[4]),
        y3 = parseFloat(lineParts[5]);

      // Pre-calculate the squares of each coordinate to simplify the circumcenter formulas.
      let x1Sq = x1 * x1,
        y1Sq = y1 * y1,
        x2Sq = x2 * x2,
        y2Sq = y2 * y2,
        x3Sq = x3 * x3,
        y3Sq = y3 * y3;

      // Calculate the x-coordinate of the circumcenter.
      // This formula is derived from the intersection of perpendicular bisectors of the triangle sides.
      let centerX = ((y1 - y3) * (y1Sq - y2Sq + x1Sq - x2Sq) - (y1 - y2) * (y1Sq - y3Sq + x1Sq - x3Sq)) /
        (2 * (y1 - y3) * (x1 - x2) - 2 * (y1 - y2) * (x1 - x3));

      // Calculate the y-coordinate of the circumcenter using a similar formula.
      let centerY = ((x1 - x3) * (x1Sq - x2Sq + y1Sq - y2Sq) - (x1 - x2) * (x1Sq - x3Sq + y1Sq - y3Sq)) /
        (2 * (x1 - x3) * (y1 - y2) - 2 * (x1 - x2) * (y1 - y3));

      // Calculate the circumradius, which is the distance from the circumcenter
      // to any of the three vertices (using the first vertex (x1, y1) here).
      let radius = Math.sqrt((x1 - centerX) * (x1 - centerX) + (y1 - centerY) * (y1 - centerY));

      // Output the calculated circumcenter coordinates and the circumradius,
      // formatted to three decimal places as specified.
      console.log(centerX.toFixed(3), centerY.toFixed(3), radius.toFixed(3));
    }
    // The 'some' method continues processing lines as long as the callback returns a falsy value.
    // Since no explicit return is provided, it implicitly returns 'undefined', which is falsy,
    // ensuring all lines in the input are processed.
  });
