// This  script  is  designed  to  read  input  from  standard  input (stdin)
// and  then  process  this  input  string  according  to  specific  rules.

var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;   // Read the entire file content from stdin, encoded as UTF-8.


// The  input  string  is  first  trimmed  to  remove  any  leading  or  trailing  whitespace.
var    s    =    input . trim ( ) ;


// Initialize  a  loop  that  will  iterate  through  the  string  's'.
// The  loop  condition  ensures  that  there  are  always  at  least  8  characters
// remaining  from  the  current  index  'i'  to  be  able  to  form  an  8-character  substring.
for ( var   i = 0 ;   i < s . length - 8 ;   i ++ )
{

   // Extract  an  8-character  substring  starting  from  the  current  index  'i'.
   // Each  character  is  individually  added  to  an  array.
   var   arr   =   [ s [ i ] ,   s [ i + 1 ] ,   s [ i + 2 ] ,   s [ i + 3 ] ,   s [ i + 4 ] ,   s [ i + 5 ] ,   s [ i + 6 ] ,   s [ i + 7 ] ] ;

   // Sort  the  characters  in  the  extracted  array  alphabetically.
   // Then,  join  them  back  into  a  single  string  without  any  separators.
   var   str   =   arr . sort ( ) . join ( "" ) ;


   // Check  if  the  newly  sorted  8-character  string  matches  the  target  string  "AADINNUY".
   if ( str   ==   "AADINNUY" )
   {
      // If  a  match  is  found,  replace  the  original  8-character  sequence
      // in  the  string  's'  with  the  replacement  string  "AIZUNYAN".
      s   =   s . slice ( 0 , i )   +   "AIZUNYAN"   +   s . slice ( i + 8 , s . length ) ;

      // After  the  first  successful  replacement,  exit  the  loop  immediately.
      break ;
   }

}


// Finally,  print  the  potentially  modified  string  's'  to  the  console.
console . log ( s ) ;