/*
 * This JavaScript program reads input from standard input,
 * processes it to extract a line of space-separated numbers,
 * sorts those numbers in ascending order,
 * and then prints the sorted numbers back to standard output.
 * It demonstrates basic file system I/O, string manipulation,
 * array operations, and custom sorting in Node.js environment.
 */

//  Declare  a  variable  to  store  the  entire  input  content  read  from  stdin.
//  The  'fs'  module  is  used  for  file  system  operations.
//  'readFileSync'  reads  the  file  synchronously.
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


//  Process  the  raw  input  string.
//  First,  trim  any  leading  or  trailing  whitespace  from  the  input.
//  Then,  split  the  string  into  an  array  of  lines  using  the  newline  character  as  a  delimiter.
var   arr   =   input . trim ( ) . split ( "\n" ) ;


//  Extract  the  second  line  of  input  (array  index  1,  as  arrays  are  0-indexed).
//  Split  this  line  by  spaces  to  get  an  array  of  string-represented  numbers.
//  Use  the  'map'  function  with  the  'Number'  constructor  to  convert  each  string  element  to  its  numeric  equivalent.
var   ary   =   arr [ 1 ] . split ( " " ) . map ( Number ) ;


//  Sort  the  numeric  array  'ary'  in  ascending  order.
//  The  'sort'  method  takes  a  comparison  function.
//  For  numeric  sort,  'a - b'  is  commonly  used  for  ascending  order.
ary . sort ( function ( a ,   b ) {
    //  The  comparison  function  should  return:
    //  -  A  negative  value  if  'a'  should  come  before  'b'.
    //  -  Zero  if  'a'  and  'b'  are  considered  equal  for  sorting.
    //  -  A  positive  value  if  'a'  should  come  after  'b'.
    return   a   -   b ;
} ) ;


//  Finally,  print  the  sorted  array  elements  to  standard  output.
//  The  'join'  method  concatenates  all  elements  of  an  array  into  a  string,
//  using  the  specified  separator  (a  single  space  in  this  case).
console . log ( ary . join ( " " ) ) ;