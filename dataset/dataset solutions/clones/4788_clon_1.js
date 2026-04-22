var    obj   =   init ( ) ;   // Initialize the main object
Main ( ) ;   // Call the primary function to begin execution

function nextInt ( )   {   // Function to get the next integer input
return   myconv (   next ( ) , 1   ) ;   }

function nextStrArray   ( )
{
   return   myconv ( next ( ) ,   2 ) ;   /* Splits input by half-width space */
}

function nextIntArray ( ) {
  return myconv ( next ( ) ,   4   ) ;   // Splits by space and converts to numbers
}

function nextCharArray ( )
{
    return myconv (   next ( ) ,   6   ) ;   /* Splits input into individual characters */
}

function next ( )
{
    return   obj . next ( ) ;
}

function hasNext ( )
{
    return   obj . hasNext ( ) ;
}

function myin ( )   {   // Reads input from stdin
    return   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) . trim ( ) . split ( "\n" ) ;
}

function init ( )
{
  // This function initializes the input handling object.
  var   inputFile   =   myin ( ) ;
  var   returnObj   =   {
    "list" :   inputFile ,
    "index" :   0 ,
    "max" :   inputFile . length ,
    "hasNext" :   function ( )   {   return   (   this . index   <   this . max   ) ;   } ,
    "next" :   function ( )   {
      if   (   !   this . hasNext ( )   )   {
        throw   "ArrayIndexOutOfBoundsException これ以上ないよ" ;
      }
      else
      {
        var   returnInput   =   this . list [   this . index   ] ;
        this . index ++ ;
        return   returnInput ;
      }
    }
  } ;
  return   returnObj ;
}

function myout (   t   )   {
  console . log (   t   ) ;   // Prints to standard output
}

function myerr (   t   )   {
  console . error (   t   ) ;   // Prints to standard error output
}

/*
 *  Description of myconv 'no' parameter:
 *  This parameter controls the type of conversion applied to the input 'i'.
 *
 *  - Default / Unknown: Returns 'i' as is.
 *  - 1: Converts 'i' to an integer.
 *  - 2: Splits 'i' by half-width spaces into an array of strings.
 *  - 4: Splits 'i' by half-width spaces and converts each part to a number.
 *  - 6: Splits 'i' into an array of individual characters.
 *  - 7: Splits 'i' into individual characters and converts each to a number.
 *  - 8: Joins elements of array 'i' with half-width spaces.
 *  - 9: Joins elements of array 'i' with newlines.
 *  - 0: Joins elements of array 'i' without any separator.
 */
function myconv (   i ,   no   )   {
  try
  {
    switch   (   no   )
    {
      case   1 :
        return   parseInt (   i   ) ;
      case   2 :
        return   i . split (   " "   ) ;
      case   4 :
        return   i . split (   " "   ) . map (   (   a   )   =>   Number (   a   )   ) ;
      case   6 :
        return   i . split (   ""   ) ;
      case   7 :
        return   i . split (   ""   ) . map (   (   a   )   =>   Number (   a   )   ) ;
      case   8 :
        return   i . join (   " "   ) ;
      case   9 :
        return   i . join (   "\n"   ) ;
      case   0 :
        return   i . join (   ""   ) ;
      default :
        return   i ;
    }
  }
  catch   (   e   )
  {
    // In case of any error during conversion, return the original input.
    return   i ;
  }
}

function   Main   (   )
{
  // Main execution function for the program.
  var   one   =   nextIntArray ( ) ;
  var   N   =   one [   0   ] ;
  var   M   =   one [   1   ] ;
  var   list   =   new   Array (   N   ) ;
  var   keepList   =   new   Array (   N   ) ;
  var   max   =   1000000007 ;   // A large number, possibly representing infinity

  // Initialize adjacency matrices
  for   (   var   i   =   0   ;   i   <   N   ;   i ++   )
  {
    list [   i   ]   =   new   Array (   N   ) . fill (   max   ) ;
    list [   i   ] [   i   ]   =   0 ;   // Distance to self is zero
    keepList [   i   ]   =   new   Array (   N   ) . fill (   max   ) ;
    keepList [   i   ] [   i   ]   =   0 ;   // Distance to self is zero
  }

  // Read graph edges and populate matrices
  for   (   var   i   =   0   ;   i   <   M   ;   i ++   )
  {
    var   tmp   =   nextIntArray ( ) ;
    // Store edge weight for both directions (undirected graph)
    list [   tmp [   0   ]   -   1   ] [   tmp [   1   ]   -   1   ]   =   tmp [   2   ] ;
    list [   tmp [   1   ]   -   1   ] [   tmp [   0   ]   -   1   ]   =   tmp [   2   ] ;
    // Keep original edge weights for comparison later
    keepList [   tmp [   0   ]   -   1   ] [   tmp [   1   ]   -   1   ]   =   tmp [   2   ] ;
    keepList [   tmp [   1   ]   -   1   ] [   tmp [   0   ]   -   1   ]   =   tmp [   2   ] ;
  }

  // Floyd-Warshall algorithm to find all-pairs shortest paths
  for   (   var   k   =   0   ;   k   <   N   ;   k ++   )
  {
    for   (   var   i   =   0   ;   i   <   N   ;   i ++   )
    {
      for   (   var   j   =   0   ;   j   <   N   ;   j ++   )
      {
        // If path through k is shorter than direct path
        if   (   list [   i   ] [   j   ]   >   list [   i   ] [   k   ]   +   list [   k   ] [   j   ]   )
        {
          list [   i   ] [   j   ]   =   list [   i   ] [   k   ]   +   list [   k   ] [   j   ] ;
        }
      }
    }
  }

  var   output   =   0 ;
  // Count edges that are not part of any shortest path
  for   (   var   i   =   0   ;   i   <   N   ;   i ++   )
  {
    for   (   var   j   =   0   ;   j   <   N   ;   j ++   )
    {
      // Check if original edge existed and is not a shortest path
      if   (   keepList [   i   ] [   j   ]   !=   max   &&   keepList [   i   ] [   j   ]   !=   list [   i   ] [   j   ]   )
      {
        output ++ ;
      }
    }
  }
  // Output the result (divided by 2 because each edge was counted twice)
  myout (   output   /   2   ) ;
}