/* This file contains a cloned version of some JavaScript code.
 * It is a Type I clone, meaning only whitespace and comments have been altered.
 * All functional aspects, variable names, and logic remain identical to the original.
 */

// --- Start of Utility and Setup Code Section ---

// Initialize the readline interface for input/output operations.
var read =   require('readline')  .  createInterface  (  {
  input   :   process.stdin,    // Standard input stream
  output  :   process.stdout    // Standard output stream
}  )  ;

var obj  ;  // Object to manage input line processing.
var inLine =  [  ]  ;  // Array to store all input lines.

// Event listener: when a new line of input is received, add it to inLine array.
read.on  (  'line'  ,  function  (  input  )  {
  inLine.push  (  input  )  ;
}  )  ;

// Event listener: when the input stream is closed, process the collected input.
read.on  (  'close'  ,  function  (  )  {

  obj  =  init  (  inLine  )  ;  // Initialize the input object with all lines.

  console.error  (  "\n"  )  ;  // Print a newline to stderr for visual separation.

  var start  =  new Date  (  )  ;  // Record the start time for execution.
  Main  (  )  ;  // Execute the main logic of the program.
  var end  =  new Date  (  )  - start  ;  // Calculate the total execution time.


  myerr  (  "time : "  +  (  end  )  +  "ms"  )  ;  // Log execution time to stderr.

  // Log memory usage (heapTotal) to stderr, converted to KB.
  myerr  (  "memory : "  +  Math.round  (  process.memoryUsage  (  )  .heapTotal  /  1024  )  +  "KB"  )  ;
}  )  ;

// Helper functions for reading various data types from input.
function nextInt  (  )  {
  return myconv  (  next  (  )  ,  1  )  ;
}

function nextStrArray  (  )  {
  return myconv  (  next  (  )  ,  2  )  ;
}

function nextIntArray  (  )  {
  return myconv  (  next  (  )  ,  4  )  ;
}

function nextCharArray  (  )  {
  return myconv  (  next  (  )  ,  6  )  ;
}

function next  (  )  {
  return obj.next  (  )  ;
}

function hasNext  (  )  {
  return obj.hasNext  (  )  ;
}

/**
 * Initializes an object to manage input lines, providing methods to check for
 * more input and retrieve the next line.
 * @param {Array<string>} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with 'list', 'index', 'max', 'hasNext', and 'next' properties.
 */
function init  (  input  )  {

  var returnObj  =  {
    list  :  input  ,
    index  :  0  ,
    max  :  input.length  ,

    // Checks if there are more input lines available.
    hasNext  :  function  (  )  {
      return  (  this.index  <  this.max  )  ;
    }  ,

    // Retrieves the next input line. Throws an error if no more input.
    next  :  function  (  )  {
      if  (  !this.hasNext  (  )  )  {
        throw  "ArrayIndexOutOfBoundsException これ以上ないよ"  ;
      }  else  {
        var returnInput  =  this.list  [  this.index  ]  ;
        this.index  ++  ;
        return returnInput  ;
      }
    }
  }  ;

  return returnObj  ;
}

// Function to print output to standard output.
function myout  (  s  )  {
  console.log  (  s  )  ;
}

// Function to print debug messages to standard error.
function myerr  (  s  )  {
  console.error  (  "debug:"  +  require  (  "util"  )  .inspect  (  s  ,  false  ,  null  )  )  ;
}

/*
 * myconv function: Handles various conversions and manipulations of input data.
 *
 * Parameter 'no' specifies the operation:
 *   - Default (or unknown/error): Returns input 'i' as is.
 *   - 1: Converts 'i' to an integer using parseInt.
 *   - 2: Splits 'i' by space into a string array.
 *   - 4: Splits 'i' by space and converts elements to numbers, returning a number array.
 *   - 6: Splits 'i' into a character array.
 *   - 7: Splits 'i' into a character array and converts elements to numbers.
 *   - 8: Joins array 'i' with spaces.
 *   - 9: Joins array 'i' with newlines.
 *   - 0: Joins array 'i' with no separator.
 */
function myconv  (  i  ,  no  )  {
  try  {
    switch  (  no  )  {
      case  1  :  return  parseInt  (  i  )  ;
      case  2  :  return  i.split  (  " "  )  ;
      case  4  :  return  i.split  (  " "  )  .map  (  Number  )  ;
      case  6  :  return  i.split  (  ""  )  ;
      case  7  :  return  i.split  (  ""  )  .map  (  Number  )  ;
      case  8  :  return  i.join  (  " "  )  ;
      case  9  :  return  i.join  (  "\n"  )  ;
      case  0  :  return  i.join  (  ""  )  ;
      default  :  return  i  ;
    }
  }  catch  (  e  )  {
    return  i  ;  // In case of conversion error, return original input.
  }
}

// --- End of Utility and Setup Code Section ---

/**
 * Main function: Contains the core logic of the program.
 * It reads an integer N, then an array of N integers.
 * It then calculates and outputs values based on the sorted array.
 */
function Main  (  )  {
	// Read the first integer, which represents the size of the list.
	var N = nextInt  (  )  ;

	// Read the next line as an array of integers.
	var list = nextIntArray  (  )  ;

	// Create a deep copy of the list to sort it without modifying the original.
	var check = JSON.parse  (  JSON.stringify  (  list  )  )  ;

	// Sort the copied list in ascending order.
	check.sort  (  function  (  a  ,  b  )  {
		return a  -  b  ;
	}  )  ;

	myerr  (  check  )  ;  // Output the sorted list for debugging.

	// Initialize an array to store the results, with size N.
	var output = new Array  (  N  )  ;

	// Determine the two "middle" elements from the sorted list.
	// For even N, these will be N/2 and (N/2)-1.
	var max1 = check  [  (  N  /  2  )  ]  ;
	var max2 = check  [  (  N  /  2  )  -  1  ]  ;

	myerr  (  {  max1  ,  max2  }  )  ;  // Output the two middle elements for debugging.

	// Iterate through the original list to populate the output array.
	for  (  var i  =  0  ;  i  <  N  ;  i  ++  )  {
		if  (  max2  ==  max1  )  {
			// If the two middle elements are equal, all outputs will be max1.
			output  [  i  ]  =  max1  ;
		}  else  {
			// If middle elements are different:
			if  (  max2  >=  list  [  i  ]  )  {
				// If the current element from the original list is less than or equal to max2,
				// output max1.
				output  [  i  ]  =  max1  ;
			}  else  {
				// Otherwise (current element is greater than max2), output max2.
				output  [  i  ]  =  max2  ;
			}
		}
	}
	// Join the elements of the output array with newlines and print.
	myout  (  myconv  (  output  ,  9  )  )  ;
}