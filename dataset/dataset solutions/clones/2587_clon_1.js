/*
 * This JavaScript code has been transformed into a Type I clone.
 * According to the official definition, this means:
 * - All identifiers (variable names, function names), operators, and expressions
 *   remain precisely as they were in the original source.
 * - The only alterations made are to whitespace (indentation, spacing, blank lines)
 *   and comments (added, removed, or modified).
 * The purpose is to demonstrate a visually distinct version while preserving
 * the exact logical and structural identity of the original program.
 */

//  Initialization  of  input  reading  components  ----------------------------------------------------

var    read    =    require ( 'readline' ) . createInterface ( {

  input  :  process . stdin , // Standard input stream

  output :  process . stdout // Standard output stream

} ) ;

var obj ; //  Holds  the  parsed  input  object  for  sequential  access
var inLine = [ ] ; //  An  array  to  accumulate  all  lines  read  from  input


//  Registers  a  callback  function  to  be  executed  for  each  line  of  input.
read . on ( 'line' , function ( input ) {

  inLine . push ( input ) ; //  Add  the  current  line  to  our  input  buffer

} ) ;


//  Registers  a  callback  function  to  be  executed  when  the  input  stream  closes.
read . on ( 'close' , function ( ) {

  obj = init ( inLine ) ; //  Initialize  the  input  parser  with  all  collected  lines

  console . error ( '\n↑入力 ↓出力' ) ; //  Output  a  separator  to  stderr  for  visual  clarity

  Main ( ) ; //  Execute  the  main  logic  of  the  program

} ) ;


//  Function  to  create  a  deep  clone  of  an  object .
//  Handles  Sets  specifically  to  ensure  they  are  cloned  correctly ,
//  otherwise  uses  JSON  serialization/deserialization  for  general  deep  cloning .
function makeClone ( obj ) {

  return ( obj instanceof Set )

    ? new Set ( Array . from ( obj ) ) //  Clone  a  Set  by  creating  a  new  Set  from  its  elements

    : JSON . parse ( JSON . stringify ( obj ) ) ; //  Deep  clone  using  JSON  stringify/parse

}


//  Helper  function  to  read  the  next  input  as  an  integer .
function nextInt ( ) {

  return myconv ( next ( ) , 1 ) ;

}


//  Helper  function  to  read  the  next  input  as  an  array  of  strings ,  split  by  space .
function nextStrArray ( ) {

  return myconv ( next ( ) , 2 ) ;

}


//  Helper  function  to  read  the  next  input  as  an  array  of  integers ,  split  by  space .
function nextIntArray ( ) {

  return myconv ( next ( ) , 4 ) ;

}


//  Helper  function  to  read  the  next  input  as  an  array  of  characters .
function nextCharArray ( ) {

  return myconv ( next ( ) , 6 ) ;

}


//  Retrieves  the  next  item  from  the  input  object .
function next ( ) {

  return obj . next ( ) ;

}


//  Checks  if  there  is  more  input  available .
function hasNext ( ) {

  return obj . hasNext ( ) ;

}


//  Initializes  an  input  object  with  methods  for  sequential  access .
//  This  object  manages  the  list  of  input  lines  and  the  current  reading  position .
function init ( input ) {

  return {

    list  :  input , //  The  array  containing  all  raw  input  lines

    index :  0 , //  The  current  index  in  the  'list'  array

    max   :  input . length , //  The  total  number  of  lines  in  the  input

    //  Method  to  check  if  there  are  more  lines  to  read .
    hasNext : function ( ) {

      return ( this . index < this . max ) ;

    } ,

    //  Method  to  retrieve  the  next  line  of  input .
    //  Increments  the  index  after  retrieval .
    //  Throws  an  error  if  no  more  input  is  available .
    next : function ( ) {

      if ( this . hasNext ( ) ) {

        return this . list [ this . index ++ ] ;

      } else {

        throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ; //  Error  for  out-of-bounds  access

      }

    }

  } ;

}


//  Outputs  the  given  string  's'  to  the  console  (standard  output) .
function myout ( s ) {

  console . log ( s ) ;

}


//  Outputs  a  debug  message  to  the  error  console  (standard  error) .
//  Uses  Node.js's  'util.inspect'  for  detailed  object  inspection .
function myerr ( s ) {

  console . error ( 'debug:' + require ( 'util' ) . inspect ( s , false , null ) ) ;

}


/*
 *  This  function  performs  various  conversions  on  the  input  'i'
 *  based  on  the  numeric  code  'no' .
 *
 *  'no'  parameter  definitions :
 *    1 :  Parses  'i'  as  an  integer .
 *    2 :  Splits  'i'  by  spaces  into  an  array  of  strings .
 *    4 :  Splits  'i'  by  spaces  and  maps  each  part  to  a  Number .
 *    6 :  Splits  'i'  into  an  array  of  individual  characters .
 *    7 :  Splits  'i'  into  characters  and  maps  each  to  a  Number .
 *    8 :  Joins  elements  of  array  'i'  with  spaces .
 *    9 :  Joins  elements  of  array  'i'  with  newlines .
 *    0 :  Joins  elements  of  array  'i'  without  any  separator .
 *    default :  Returns  'i'  as  is  (no  conversion) .
 */
function myconv ( i , no ) {

  try {

    switch ( no ) {

      case 1 :

        return parseInt ( i ) ; //  Convert  to  integer

      case 2 :

        return i . split ( ' ' ) ; //  Split  by  space

      case 4 :

        return i . split ( ' ' ) . map ( Number ) ; //  Split  by  space  and  convert  to  numbers

      case 6 :

        return i . split ( '' ) ; //  Split  into  characters

      case 7 :

        return i . split ( '' ) . map ( Number ) ; //  Split  into  characters  and  convert  to  numbers

      case 8 :

        return i . join ( ' ' ) ; //  Join  with  spaces

      case 9 :

        return i . join ( '\n' ) ; //  Join  with  newlines

      case 0 :

        return i . join ( '' ) ; //  Join  without  separator

      default :

        return i ; //  Return  as  is  for  unknown  'no'

    }

  } catch ( e ) {

    return i ; //  In  case  of  any  error  during  conversion ,  return  the  original  input

  }

}


//  End  of  initialization  and  utility  functions  ----------------------------------------------------


//  The  main  function  containing  the  problem-solving  logic .
function Main ( ) {

  var N = nextInt ( ) ; //  Read  the  integer  N  from  the  input

  var list = nextIntArray ( ) ; //  Read  an  array  of  integers  from  the  input


  //  Sort  the  'list'  array  in  ascending  numerical  order .
  list . sort ( function ( a , b ) {

    return a - b ; //  Standard  comparison  for  numerical  sort

  } ) ;


  var check = [ ] ; //  Initialize  'check'  array  to  store  elements  for  comparison  in  the  current  level

  check . push ( list . pop ( ) ) ; //  Remove  and  add  the  largest  element  from  'list'  to  'check'


  //  Iterate  from  i = 1  up  to  N . This  loop  represents  processing  levels .
  for ( var i = 1 ; i <= N ; i ++ ) {

    var check2 = [ ] ; //  Initialize  'check2'  array  for  elements  of  the  next  level

    //  Populate  'check2'  with  (2^i)  elements  from  the  'list' .
    //  (1 << i)  is  a  bitwise  left  shift ,  equivalent  to  2  raised  to  the  power  of  'i' .
    for ( var j = 0 ; j < ( 1 << i ) ; j ++ ) {

      check2 . push ( list . pop ( ) ) ; //  Take  elements  from  the  end  of  the  sorted  'list'

    }

    //  Compare  elements  between  the  current  level  ('check')
    //  and  the  next  level  ('check2') .
    for ( var j = 0 ; j < check2 . length ; j ++ ) {

      //  If  an  element  from  'check'  is  less  than  or  equal  to  an  element  from  'check2' ,
      //  the  condition  is  violated .
      if ( check [ j ] <= check2 [ j ] ) {

        myout ( "No" ) ; //  Output  "No"  as  the  condition  is  not  met

        return ; //  Terminate  the  Main  function  early

      }

    }

    //  Concatenate  the  elements  of  'check2'  to  'check' ,
    //  preparing  'check'  for  the  next  iteration's  comparison .
    check = check . concat ( check2 ) ;

  }

  myout ( "Yes" ) ; //  If  all  conditions  are  met  throughout  the  loops ,  output  "Yes"

}