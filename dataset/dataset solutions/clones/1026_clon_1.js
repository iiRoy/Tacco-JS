var    input    =    require (  'fs'  ) .   readFileSync (  '/dev/stdin'  ,   'utf8'  )   ;   // This line reads all input from standard input.

// The input is then processed to prepare for command parsing.
var    Arr =    (   input .   trim ( )   ) .   split (  "\n"  )   ;


/*
 *  The first element of the array is usually a count of operations,
 *  but in this specific problem, it's not used.
 *  So, we remove it.
 */
Arr .   shift ( )   ;


var    list    =    [  ]   ;   // Initialize an empty list to store numerical values.


// Loop through each command line in the input array.
for   (   var   i   =   0   ;   i   <   Arr .   length   ;   i ++   )
{
    var    arr    =    Arr [   i   ] .   split (  " "  )   ;   // Split the current line into command and argument.


    var    a    =    arr [   0   ]   ;   // The first part is the command string.


    var    b    =    arr [   1   ]   -   0   ;   // The second part is the value, converted to a number.


    if   (   a    ==    "insert"   )
    {
        list .   unshift (   b   )   ;   // 'insert' command: Add the value to the beginning of the list.
    }
    else   if   (   a    ==    "delete"   )
    {
        /*
         *  The original logic for 'delete' by value was commented out.
         *  This block remains empty to match the original behavior.
         *  If uncommented, it would find and remove the first occurrence of 'b'.
         */
        //  var   index   =   list .   indexOf (   b   )   ;
        //  if   (   index   !=   -1   )
        //  {
        //      list .   splice (   index   ,   1   )   ;
        //  }
    }
    else   if   (   a    ==    "deleteFirst"   )
    {
        list .   shift ( )   ;   // 'deleteFirst' command: Remove the element at the beginning of the list.
    }
    else   if   (   a    ==    "deleteLast"   )
    {
        list .   pop ( )   ;   // 'deleteLast' command: Remove the element at the end of the list.
    }
}   // End of command processing loop.


// Finally, print the remaining elements of the list, joined by spaces.
console .   log (   list .   join (  " "  )   )   ;