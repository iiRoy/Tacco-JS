/*
 *  This is an extensively modified Type I clone
 *  of the original JavaScript code.
 *
 *  All identifiers, variable names, function names,
 *  operators, and expressions are kept exactly the same.
 *
 *  Only variations in whitespace and comments have been made.
 *
 */
function   main (   input   )
{


  //  Here, we are extracting individual characters from the input string.
  var   a   =   input.substr(   0  ,  1   )   ;
    var   b   =   input.substr(   1  ,  1   )   ;
      var   c   =   input.substr(   2  ,  1   )   ;
        var   d   =   input.substr(   3  ,  1   )   ;


  //  The 'str' variable is initially assigned the entire input string.
  var   str   =   input   ;


  //  Then, 'str' is re-declared and re-assigned as an array of the characters.
  var   str   =   [ a  ,  b  ,  c  ,  d ]   ;

  //  The array 'str' is then sorted in ascending order.
  str . sort ( ) ;


  //  After sorting, the variables 'a', 'b', 'c', and 'd' are updated
  //  with the sorted characters from the 'str' array.
  var   a   =   str [ 0 ]   ;
    var   b   =   str [ 1 ]   ;
      var   c   =   str [ 2 ]   ;
        var   d   =   str [ 3 ]   ;


  //  A flag variable 'f' is initialized to 0.
  //  Note the full-width semicolon (；) used here, which is preserved.
  var   f   =   0；
  　//  This conditional block checks specific character relationships.
  //  Note the full-width space (　) before 'if', and the unusual
  //  syntax of the nested 'if' statement, which is also preserved exactly.
  if   ( a   ==   b )
  {
    if   ( a   !==   c )   (   c   ==   d )
    {
      //  If the conditions are met, 'f' is set to 1.
      //  The syntax 'var f 1;' is preserved exactly as it was in the original.
      var   f   1   ;
    }
  }


  //  Finally, based on the value of 'f', either 'Yes' or 'NO' is printed to the console.
  if   ( f   ==   1 )
  {
    console . log ( 'Yes' )
  }
  else
  {
    console . log ( 'NO' )   ;
  }
}

//  The main function is invoked here, reading input from '/dev/stdin'.
//  The 'ut8' encoding is specified for reading the file.
main (   require ( 'fs' ) . readFileSync ( "/dev/stdin"  ,  "ut8" )   )   ;