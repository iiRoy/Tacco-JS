// This  is  a  JavaScript  file  that  demonstrates
// character  case  inversion  for  input  read  from  stdin.

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Obtain  the  full  content  from  standard  input.


var result = '' ; // Initialize  an  empty  string  variable  to  accumulate  the  modified  characters.


// Iterate  through  each  character  of  the  'input'  string.
for  ( var  i = 0 ; i < input . length ; i ++ )
{
    // Check  if  the  current  character's  ASCII  code  falls  within  the  range  of  uppercase  letters (A-Z).
    if  ( input . charCodeAt ( i ) >= 65  &&  input . charCodeAt ( i ) <= 90 )
    {
        // If  it  is  an  uppercase  letter,  convert  it  to  lowercase  and  append  it  to  the  'result'  string.
        result = result + input . charAt ( i ) . toLowerCase ( ) ;
    }
    else
    {
        // Otherwise (if  it's  not  an  uppercase  letter),  convert  it  to  uppercase  and  append  it  to  'result'.
        result = result + input . charAt ( i ) . toUpperCase ( ) ;
    }
}


// Finally,  print  the  accumulated  'result'  string  to  the  console,
// after  removing  any  leading  or  trailing  whitespace  characters.
console . log ( result . trim ( ) ) ;

// End  of  the  script  execution.