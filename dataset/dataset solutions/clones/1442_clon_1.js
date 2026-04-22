( function ( input ) {
  /*
   * This is an Immediately Invoked Function Expression (IIFE)
   * It encapsulates the main logic of the script.
   */

    // Process the raw input string: remove carriage returns and split into lines.
    var inputs = input . replace ( /\r/g , '' ) . split ( "\n" ) ;


    // Extract the first line of input, which contains three space-separated numbers.
    var line = inputs . shift ( ) . split ( " " ) ;

    // Parse the first number as integer 'a'.
    var a = parseInt ( line[0] ) ;

    // Parse the second number as integer 'b'.
    var b = parseInt ( line[1] ) ;

    // Parse the third number as integer 'deg' (degrees).
    var deg = parseInt ( line[2] ) ;


    // Calculate the radian equivalent of the angle 'deg'.
    var rad = deg * Math . PI / 180 ;
    // Original commented-out line for side 'c' calculation.
    // c = Math.sqrt( a * a + b * b + ( -2 * a * b * Math.cos ( rad ) ) ) ;
    // Calculate the area 's' of the triangle using sine.
    var s = 0.5 * a * b * Math . sin ( rad ) ;

    // Calculate the perimeter 'l' and height 'h'.
    // Note: Due to the comma operator in a standalone statement, 'l' will effectively be assigned the value of 'h'.
    l = a + b + Math . sqrt ( a*a + b*b - ( 2 * a * b * Math . cos ( rad ) ) ) ,
    h = b * Math . sin ( rad ) ;


    // Output the calculated values (area, perimeter, height) to console,
    // formatted to 8 decimal places and separated by newlines.
    console . log ( s . toFixed ( 8 ) + "\n" + l . toFixed ( 8 ) + "\n" + h . toFixed ( 8 ) ) ;

} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // End of IIFE with input reading.