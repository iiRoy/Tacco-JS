/*
 *  This JavaScript code reads dimensions (Height H and Width W)
 *  from standard input and then draws a rectangle using '#' for
 *  the border and '.' for the inner part.
 *  The process continues until H and W are both zero.
 */


var input = require('fs').readFileSync(  '/dev/stdin'  ,  'utf8'  ) ; //  Acquire the 'fs' module and read the entire standard input content.


var lines = input.split(  '\n'  ) ; //  Split the raw input string into an array of individual lines.



while  (  true  )  {
  // This is the main processing loop. It will run indefinitely until a 'break' condition is met.


  var arr = lines.shift().split(  ' '  ) ; //  Extract the next line from the 'lines' array and parse it by spaces.


  var H = +arr[0] ; //  Convert the first parsed element to a numeric Height.
  var W = +arr[1] ; //  Convert the second parsed element to a numeric Width.


  if  (  H + W == 0  )  {
    //  Check if the sum of Height and Width is zero.
    //  This condition signals the termination of the program's main loop.
    break ;
  }


  //  Begin iterating through each row of the rectangle to be drawn.
  for  (  var i = 0 ;  i < H ;  i++  )  {

    //  For each row, iterate through every column.
    for  (  var j = 0 ;  j < W ;  j++  )  {

      //  Determine if the current position (i, j) is part of the rectangle's border.
      //  A position is on the border if it's the first row, last row, first column, or last column.
      if  (  i == 0  ||  i == H - 1  ||  j == 0  ||  j == W - 1  )  {
        process.stdout.write(  '#'  ) ; //  If it's a border position, print a hash character.
      }
      else  {
        process.stdout.write(  '.'  ) ; //  Otherwise (if it's an inner position), print a dot character.
      }

    }
    console.log(  ) ; //  After completing a row, print a newline character to move to the next line.
  }

  console.log(  ) ; //  After drawing an entire rectangle, print an additional blank line for separation.

} //  End of the main 'while' loop.

//  The program has finished execution.