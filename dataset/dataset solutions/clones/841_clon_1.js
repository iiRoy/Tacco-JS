/*
 * This  is  a  JavaScript  program.
 * It's  designed  to  process  numerical  data.
 * The  input  is  expected  from  standard  input.
 *
 * This  code  demonstrates  basic  file  I/O,
 * array  manipulation,  object  usage,
 * and  iterative  algorithms.
 *
 *  ---  TYPE  I  CLONE  EXAMPLE  ---
 *
 *  The  purpose  of  this  file  is  to  showcase  a  Type  I  clone.
 *  This  means  the  logic  is  identical,  but  whitespace  and  comments
 *  have  been  modified  extensively  to  make  it  visually  distinct.
 *
 */


//  Importing  the  'fs'  (File System)  module  is  the  first  step.
//  This  module  is  essential  for  reading  files,  including  /dev/stdin.

var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
//  The  above  line  reads  the  entire  content  of  /dev/stdin  as  a  UTF-8  string.


//  Next,  we  process  the  raw  input  string.
//  It's  trimmed  of  any  leading/trailing  whitespace  and  then  split  into  an  array  of  lines.

var   Arr   =   (   input . trim ( )   ) . split ( "\n" ) ;

/*
 *  The  'Arr'  variable  now  holds  an  array  where  each  element
 *  corresponds  to  a  line  from  the  original  input.
 *  This  is  a  common  pattern  for  competitive  programming  inputs.
 */


//  The  first  line  of  the  input  is  expected  to  be  a  single  number  'n'.
//  This  number  determines  how  many  subsequent  lines  will  be  processed.

var   n   =   Arr . shift ( )   -   0 ;   //  'shift()'  removes  the  first  element  and  returns  it.
                                      //  '- 0'  is  a  concise  way  to  ensure  type  coercion  to  Number.


//  An  empty  object  'obj'  is  initialized.
//  This  object  will  function  as  a  hash  map  or  dictionary  to  store  counts.

var   obj   =   { } ;


//  Initialize  the  'obj'  with  a  specific  range  of  keys.
//  Keys  from  2  up  to  100001  are  set,  each  with  an  initial  value  of  1.

for   (   var   i   =   2 ;   i   <=   100001 ;   i ++   )
{
    obj [ i ]   =   1 ;
    /*
     *  This  loop  establishes  a  baseline  for  the  counting  mechanism.
     *  Every  number  in  the  specified  range  starts  with  a  count  of  one.
     */
}


//  Begin  the  main  processing  loop,  which  runs  'n'  times.
//  Each  iteration  processes  a  pair  of  numbers  from  the  input  array.

for   (   var   i   =   0 ;   i   <   n ;   i ++   )
{
    //  Extract  the  next  line,  split  it  by  space,  and  map  the  parts  to  numbers.
    var   ab   =   (   Arr . shift ( )   ) . split ( " " ) . map ( Number ) ;

    //  'ab'  is  now  an  array  containing  two  numbers,  e.g.,  [start,  end].

    //  Iterate  from  the  first  number  (ab[0])  to  the  second  number  (ab[1]),  inclusive.
    for   (   var   j   =   ab [ 0 ] ;   j   <=   ab [ 1 ] ;   j ++   )
    {
        obj [ j ] ++ ; //  Increment  the  count  for  the  current  number  'j'  in  the  'obj'  map.
    }
}


//  After  all  input  ranges  have  been  processed,  determine  the  maximum  value.
//  'max'  is  initialized  to  1.

var   max   =   1 ;


//  Iterate  through  the  same  range  of  numbers  (2  to  100001)  again.
//  This  time,  we're  checking  a  specific  condition  to  find  our  'max'.

for   (   var   i   =   2 ;   i   <=   100001 ;   i ++   )
{
    //  The  condition  is:  if  the  count  of  'i'  (obj[i])  is  greater  than  or  equal  to  'i'  itself.
    if   (   obj [ i ]   >=   i   )
    {
        max   =   i ;   //  If  the  condition  holds,  update  'max'  to  the  current  'i'.
    }
}


//  Finally,  output  the  result.
//  The  problem  requires  printing  'max  -  1'.

console . log ( max   -   1 ) ;   //  This  is  the  final  output  of  the  program.


//  ---  Program  Execution  Concluded  ---
//  Thank  you  for  reviewing  this  Type  I  code  clone.
//  It's  been  modified  to  be  visually  different  while  maintaining  exact  functional  equivalence.