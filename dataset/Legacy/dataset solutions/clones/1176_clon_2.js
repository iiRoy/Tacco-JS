var accumulatedInput = ''; // This variable accumulates all incoming data from the standard input stream.

// Acquire a reference to the standard input stream object provided by Node.js.
var inputStream = process.stdin;

// Activate the input stream to begin receiving data.
inputStream.resume();

// Configure the character encoding for the incoming data to UTF-8.
inputStream.setEncoding( 'utf-8' );

// Attach an event handler function to be executed whenever new data is available from the input stream.
inputStream.on( 'data', function( dataPortion ) {
  // Append the current segment of data to our total accumulated input string.
  accumulatedInput += dataPortion;

  // Process the received data: split it by spaces and convert each resulting string part into a number.
  var parsedNumbers = dataPortion.split( " " ).map( Number );

  // Assign the first numerical value from the input to represent side 'a' of the triangle.
  var sideA = parsedNumbers[0];
  // Assign the second numerical value to represent side 'b' of the triangle.
  var sideB = parsedNumbers[1];
  // Assign the third numerical value, which is an angle in degrees, and convert it to radians.
  var angleC_rad = parsedNumbers[2] * ( Math.PI / 180.0 ); // Conversion from degrees to radians.

  // Calculate the height of the triangle using trigonometry (h = b * sin(C)).
  var heightVal = Math.sin( angleC_rad ) * sideB;
  // Calculate the length of the projection of side 'b' onto side 'a' (ta = b * cos(C)).
  var adjacentProjection = Math.cos( angleC_rad ) * sideB;
  // Calculate the length of the third side 'c' using the Pythagorean theorem on the two parts of the base.
  var sideC = Math.sqrt( Math.pow( ( sideA - adjacentProjection ), 2 ) + Math.pow( heightVal, 2 ) );

  // Calculate the area of the triangle (S = (a * h) / 2).
  var areaTriangle = ( sideA * heightVal ) / 2.0;
  // Calculate the perimeter of the triangle (L = a + b + c).
  var perimeterTriangle = sideA + sideB + sideC;

  // Output the calculated area, perimeter, and height, each on a new line, to the console.
  console.log( areaTriangle + '\n' + perimeterTriangle + '\n' + heightVal );
} );
