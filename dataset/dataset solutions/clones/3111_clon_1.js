var      obj =   init  (  ) ;
Main  (  ) ;


/* Function to retrieve the next integer from input. */
function nextInt  (  )
{
  return myconv  (  next  (  ) ,  1  ) ;
}

function nextStrArray  (  )
{
  return myconv  (  next  (  ) ,  2  ) ;
} // Splits the input line by half-width spaces.

function nextIntArray  (  )
{
  return myconv  (  next  (  ) ,  4  ) ;
} // Splits input by spaces and converts resulting strings to numbers.

function nextCharArray  (  )
{
  return myconv  (  next  (  ) ,  6  ) ;
} // Divides the input line into an array of individual characters.

function next  (  )
{
  return obj . next  (  ) ;
}

function hasNext  (  )
{
  return obj . hasNext  (  ) ;
}

function myin  (  )
{
  return require  (  "fs"  ) . readFileSync  (  "/dev/stdin" ,  "utf8"  ) . trim  (  ) . split  (  "\n"  ) ;
}

/*
 * Initializes the input reading mechanism.
 * Reads all lines from standard input and provides methods to access them.
 */
function init  (  )
{
  var inputFile = myin  (  ) ;

  var returnObj =
  {
    "list"    : inputFile ,
    "index"   : 0 ,
    "max"     : inputFile . length ,

    "hasNext" : function  (  )
    {
      return  (  this . index  <  this . max  ) ;
    } ,

    "next"    : function  (  )
    {
      if  (  ! this . hasNext  (  )  )
      {
        return "" ;
      }
      else
      {
        var returnInput = this . list [ this . index ] ;
        this . index ++ ;
        return returnInput ;
      }
    }
  } ;

  return returnObj ;
}

function myout  (  t  )
{
  console . log  (  t  ) ;
} // Outputs the given argument to standard output.

function myerr  (  t  )
{
  console . error  (  t  ) ;
} // Outputs the given argument to standard error.

/*
 *  Utility for type conversion and array manipulation based on 'no' parameter.
 *  -   Default/Error: Returns the input 'i' unchanged.
 *  -   1: Converts 'i' to an integer.
 *  -   2: Splits 'i' by half-width spaces.
 *  -   4: Splits 'i' by half-width spaces and maps to numbers.
 *  -   6: Splits 'i' into individual characters.
 *  -   7: Splits 'i' into individual characters and maps to numbers.
 *  -   8: Joins array 'i' elements with half-width spaces.
 *  -   9: Joins array 'i' elements with newlines.
 *  -   0: Joins array 'i' elements without any separator.
 */
function myconv  (  i ,  no  )
{
  try
  {
    switch  (  no  )
    {
      case  1  :
        return parseInt  (  i  ) ;
      case  2  :
        return i . split  (  " "  ) ;
      case  4  :
        return i . split  (  " "  ) . map  (  (  a  )  =>  Number  (  a  )  ) ;
      case  6  :
        return i . split  (  ""  ) ;
      case  7  :
        return i . split  (  ""  ) . map  (  (  a  )  =>  Number  (  a  )  ) ;
      case  8  :
        return i . join  (  " "  ) ;
      case  9  :
        return i . join  (  "\n"  ) ;
      case  0  :
        return i . join  (  ""  ) ;
      default  :
        return i ;
    }
  }
  catch  (  e  )
  {
    return i ;
  }
}

/**
 *  The main function where the program logic resides.
 *  It reads an integer N and an array of N integers,
 *  then performs a specific rearrangement logic.
 */
function Main  (  )
{
  var N = nextInt  (  ) ;
  var list = nextIntArray  (  ) ;

  // Pre-check: Verify that no element list[i] is greater than (i + 1).
  // If this condition is violated, an immediate -1 is outputted.
  for  (  var i = 0 ;  i < N ;  i ++  )
  {
    if  (  list [ i ]  >  (  i + 1  )  )
    {
      // A value at index 'x' must not exceed 'x + 1'.
      myout  (  -1  ) ;
      return ;
    }
  }

  var output = [ ] ;  // This array will store the rearranged elements.
  var count = 0 ;     // A counter used for iterating through the 'list'.

  // Continue processing until the 'list' becomes empty.
  while  (  list . length  >  0  )
  {
    if  (  list [ count ]  ==  count + 1  )
    {
      // If the current element matches its expected position, increment counter.
      count ++ ;
    }
    else
    {
      if  (  list [ count ]  <  count + 1  )
      {
        // If the current element is smaller, indicating a removal opportunity.
        // Add the preceding element to the front of the output array.
        output . unshift  (  list [ count - 1 ]  ) ;
        // Remove the element that was just moved to 'output' from 'list'.
        list . splice  (  count - 1 ,  1  ) ;
        count = 0 ; // Reset the counter to re-evaluate the list from the beginning.
      }
      else
      {
        // This case should ideally not be reached if the initial check is correct.
        // It implies a violation of the problem's constraints.
        myout  (  -1  ) ;
        return ;
      }
    }
  }

  // After all elements are processed, output the final result.
  // The 'output' array elements are joined by newlines.
  myout  (  myconv  (  output ,  9  )  ) ;
}