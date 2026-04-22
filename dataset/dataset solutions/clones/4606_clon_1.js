// This script processes a specific input format to compute a cumulative time.
// It demonstrates basic file I/O, string manipulation, and conditional logic.


let input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
// The above line reads the entire content of '/dev/stdin' as a UTF-8 string.


const data = input . split ( "\n" ) ; // Splits the input string into an array of lines, based on newline characters.


// Destructuring assignment to extract two key values from the first line of data.
// peopleNum: Represents the total number of people.
// flowTime: Represents a specific time duration for flow.
const [ peopleNum , flowTime ] = data [ 0 ] . split ( ' ' ) ;


const pushTimes = data [ 1 ] . split ( ' ' ) ; // Extracts an array of individual push times from the second line.


let rTime = 0 ; // Initializes the 'running time' accumulator to zero. This variable will store the final calculated time.


// This loop iterates through each person, from the first (index 0) up to (but not including) peopleNum.
for ( let i = 0 ; i < parseInt ( peopleNum , 10 ) ; i ++ )
{
  /*
   * Calculate 'diffTime':
   * If it's the very first person (i === 0), the difference is 0.
   * Otherwise, it's the difference between the current person's push time and the previous person's push time.
   * parseInt is used to convert string times to integers for arithmetic operations.
   */
  const diffTime = i === 0 ? 0 : parseInt ( pushTimes [ i ] , 10 ) - parseInt ( pushTimes [ i - 1 ] , 10 ) ;


  // Conditional logic to determine how 'rTime' is updated.
  if ( diffTime < parseInt ( flowTime , 10 ) && diffTime !== 0 )
  {
    rTime += diffTime ; // If diffTime is positive and less than flowTime, add diffTime.
  }
  else
  {
    rTime += parseInt ( flowTime , 10 ) ; // Otherwise (if diffTime >= flowTime or diffTime is 0), add the full flowTime.
  }
} // End of the main loop.


// Output the final calculated running time to the standard console.
console . log ( rTime ) ;