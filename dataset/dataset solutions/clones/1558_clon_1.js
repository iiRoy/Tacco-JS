/*
 * This is a Type I clone of the original JavaScript code.
 *
 * According to the definition of Type I clones:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * Therefore, every identifier, variable name, function name, operator,
 * and expression has been preserved without any modification.
 *
 * Only whitespace (spaces, tabs, newlines, indentation) and comments
 * have been altered extensively to make the code visually distinct
 * from the original, while maintaining its precise logical and
 * structural identity.
 */

function   MainD   (   input   )
{

  //  First, we take the raw input string
  //  and split it into an array of individual lines.
  const   arr   =   input   .   split   (   '\n'   )   ;


  //  Next, we process each line from the 'arr' array.
  //  For every line (represented by 'val'), we split it by spaces
  //  to create an array of strings.
  //  The result 'arrAB' is an array of arrays.
  const   arrAB   =   arr   .   map   (   val   =>   val   .   split   (   ' '   )   )   ;


  //  In this step, we again iterate through the original 'arr' lines.
  //  For each line, we split it by spaces and then immediately
  //  convert the resulting array into a JavaScript Set object.
  //  'setAB' will therefore be an array where each element is a Set.
  //  Sets are used for efficient checking of unique elements.
  const   setAB   =   arr   .   map   (   val   =>   new   Set   (   val   .   split   (   ' '   )   )   )   ;


  //  We initialize a variable 'groupNum'.
  //  Its initial value is the total number of lines we processed,
  //  which is equivalent to the number of elements in 'arrAB'.
  //  This variable will count the distinct groups identified.
  let   groupNum   =   arrAB   .   length   ;


  //  The main logic begins with an outer loop.
  //  This loop iterates through the 'arrAB' array, starting from the
  //  second element (index 1) up to, but not including, the last element.
  //  'i' represents the index of the "current" element being examined.
  for   (   let   i   =   1   ;   i   <   arrAB   .   length   ;   i   ++   )
  {

    //  Inside the outer loop, there's an inner loop.
    //  This inner loop iterates from the very first element (index 0)
    //  up to, but not including, the index of the current outer loop element ('i').
    //  'j' represents the index of a "previous" element that 'i' is compared against.
    for   (   let   j   =   0   ;   j   <   i   ;   j   ++   )
    {

      //  This is the core conditional statement for grouping.
      //  It checks if:
      //  1. The first element of the current array (arrAB[i][0]) is present in the Set of the previous array (setAB[j]).
      //     Note: `new Set(setAB[j])` is redundant here, as `setAB[j]` is already a Set.
      //     It creates a new Set from an existing Set, effectively cloning it.
      //  OR
      //  2. A new Set created from `setAB[j][0]` contains the second element of the current array (arrAB[i][1]).
      //     Note: If `setAB[j]` is a Set, `setAB[j][0]` will likely be `undefined`,
      //     making `new Set(undefined)` an empty Set, and `has()` always false for this part.
      //     This exact expression is preserved as per Type I cloning rules.
      if   (   (   new   Set   (   setAB   [   j   ]   )   )   .   has   (   arrAB   [   i   ]   [   0   ]   )   ||   new   Set   (   setAB   [   j   ]   [   0   ]   )   .   has   (   arrAB   [   i   ]   [   1   ]   )   )
      {

        //  If the condition above evaluates to true, it means that
        //  the current element at index 'i' can be associated or grouped
        //  with a previous element at index 'j'.
        //  Therefore, we decrement our total count of distinct groups.
        groupNum   --   ;

        //  Once a match is found for the current 'i' with any previous 'j',
        //  there's no need to compare 'i' with any further preceding elements.
        //  We can immediately exit the inner loop and proceed to the next 'i'.
        break   ;

      }   //   End   of   the   conditional   (if)   block.

    }   //   End   of   the   inner   'for'   loop.

  }   //   End   of   the   outer   'for'   loop.


  //  Finally, after all comparisons and group adjustments are made,
  //  the calculated total number of groups is printed to the console.
  console   .   log   (   groupNum   )   ;

}   //   End   of   the   MainD   function   definition.


//  This line is responsible for initiating the program.
//  It uses Node.js's built-in 'fs' (file system) module
//  to read data from standard input ('/dev/stdin').
//  The content is read as a UTF-8 encoded string.
//  Any leading or trailing whitespace is removed using '.trim()'.
//  The resulting cleaned string is then passed as an argument
//  to the 'MainD' function to begin processing.
MainD   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .   trim   (   )   )   ;