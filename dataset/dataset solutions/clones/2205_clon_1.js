/*
 * This file encapsulates a standard competitive programming setup
 * for JavaScript, including input/output utilities and a main
 * problem-solving function.
 *
 * Author:   Anonymous
 * Date:     2023-10-27
 * Version:  1.0.0
 */

//  ---  BEGIN  Input/Output  Utility  Section  ---

//  Initialize  a  readline  interface  to  handle  standard  input  and  output.
var read = require ( 'readline' ) . createInterface ( {
  input  :  process . stdin,
  output :  process . stdout
} ) ;

//  Global  variables  for  input  processing.
var obj ;            //  Will  hold  the  initialized  input  reader  object.
var inLine = [ ] ;   //  Array  to  collect  all  input  lines  from  stdin.

//  Register  an  event  listener  for  each  line  of  input  received.
read . on ( 'line' ,  function ( input )
{
  inLine . push ( input ) ;  //  Add  the  current  line  to  our  collection.
} ) ;

//  Register  an  event  listener  for  when  the  input  stream  is  closed.
read . on ( 'close' ,  function ( )
{
  obj = init ( inLine ) ;  //  Initialize  our  custom  input  object.

  //  Output  a  debug  message  to  stderr  indicating  I/O  direction.
  console . error ( '\n↑入力 ↓出力' ) ;

  Main ( ) ;  //  Execute  the  main  logic  of  the  program.
} ) ;

//  ---  END  Input/Output  Utility  Section  ---


/**
 *  Performs  a  deep  clone  of  an  object.
 *  Special  handling  for  Set  objects  to  ensure  proper  cloning.
 *  For  other  objects,  it  uses  JSON  serialization/deserialization,
 *  which  is  effective  for  plain  data  objects  but  loses  functions.
 *
 *  @param  {any}  obj  The  object  to  be  cloned.
 *  @returns  {any}  A  new,  deeply  cloned  instance  of  the  object.
 */
function makeClone ( obj )
{
  return  ( obj  instanceof  Set )
           ?  new  Set ( Array . from ( obj ) )
           :  JSON . parse ( JSON . stringify ( obj ) ) ;
}


//  ---  BEGIN  Custom  Input  Parsing  Functions  ---

/**
 *  Retrieves  the  next  input  token  and  parses  it  as  an  integer.
 *  @returns  {number}  The  parsed  integer  value.
 */
function nextInt ( ) {  return  myconv ( next ( ) ,  1 ) ;  }

/**
 *  Retrieves  the  next  input  token  and  splits  it  into  an  array  of  strings
 *  using  space  as  a  delimiter.
 *  @returns  {string[]}  An  array  of  strings.
 */
function nextStrArray ( ) {  return  myconv ( next ( ) ,  2 ) ;  }

/**
 *  Retrieves  the  next  input  token,  splits  it  by  space,  and  converts
 *  each  part  into  a  number.
 *  @returns  {number[]}  An  array  of  numbers.
 */
function nextIntArray ( ) {  return  myconv ( next ( ) ,  4 ) ;  }

/**
 *  Retrieves  the  next  input  token  and  splits  it  into  an  array  of  individual  characters.
 *  @returns  {string[]}  An  array  of  characters.
 */
function nextCharArray ( ) {  return  myconv ( next ( ) ,  6 ) ;  }

/**
 *  Fetches  the  next  raw  input  line/token  from  the  global  input  object.
 *  @returns  {string}  The  next  input  line.
 */
function next ( ) {  return  obj . next ( ) ;  }

/**
 *  Checks  if  there  are  any  more  input  lines  available  to  be  read.
 *  @returns  {boolean}  True  if  more  input  exists,  false  otherwise.
 */
function hasNext ( ) {  return  obj . hasNext ( ) ;  }

/**
 *  Initializes  a  custom  input  reader  object.
 *  This  object  manages  the  list  of  input  lines  and  provides  methods
 *  to  navigate  through  them.
 *
 *  @param  {string[]}  input  An  array  of  strings,  each  representing  a  line  of  input.
 *  @returns  {object}  A  reader  object  with  `hasNext`  and  `next`  methods.
 */
function init ( input )
{
  return {
    list  :  input ,             //  The  full  collection  of  input  lines.
    index :  0 ,                 //  The  current  position  within  the  `list`.
    max   :  input . length ,    //  The  total  number  of  lines  in  the  input.

    /**
     *  Determines  if  there  are  more  lines  remaining  in  the  input  list.
     *  @returns  {boolean}  `true`  if  `index`  is  less  than  `max`,  `false`  otherwise.
     */
    hasNext :  function ( ) {  return  ( this . index  <  this . max ) ;  } ,

    /**
     *  Retrieves  the  next  line  from  the  input  list  and  advances  the  index.
     *  @returns  {string}  The  next  input  line.
     *  @throws  {string}  An  error  if  attempting  to  read  beyond  the  end  of  the  input.
     */
    next :  function ( )
    {
      if  ( this . hasNext ( ) )
      {
        return  this . list [ this . index ++ ] ;
      }
      else
      {
        throw  'ArrayIndexOutOfBoundsException ‚There is no more input' ;
      }
    }
  } ;
}

/**
 *  Prints  a  given  value  to  the  standard  output,  followed  by  a  newline.
 *  This  is  the  primary  function  for  producing  program  results.
 *  @param  {any}  s  The  value  to  be  printed.
 */
function myout ( s ) {  console . log ( s ) ;  }

/**
 *  Prints  a  debug  message  to  the  standard  error  output.
 *  Uses  Node.js's  `util.inspect`  for  detailed  object  representation,
 *  which  is  useful  for  debugging  complex  data  structures.
 *  @param  {any}  s  The  value  to  be  inspected  and  printed  for  debugging.
 */
function myerr ( s ) {  console . error ( 'debug:'  +  require ( 'util' ) . inspect ( s , false , null ) ) ;  }

/**
 *  A  versatile  conversion  function  that  applies  different  parsing  or  joining
 *  operations  based  on  the  `no`  parameter.
 *
 *  @param  {string|string[]}  i  The  input  data  (string  for  parsing,  array  for  joining).
 *  @param  {number}  no  A  numeric  code  specifying  the  conversion  type:
 *    -  `1`:  Parse  integer  from  string.
 *    -  `2`:  Split  string  by  spaces  into  an  array  of  strings.
 *    -  `4`:  Split  string  by  spaces  and  map  parts  to  numbers.
 *    -  `6`:  Split  string  into  an  array  of  individual  characters.
 *    -  `7`:  Split  string  into  characters  and  map  them  to  numbers.
 *    -  `8`:  Join  an  array  of  strings  with  spaces.
 *    -  `9`:  Join  an  array  of  strings  with  newlines.
 *    -  `0`:  Join  an  array  of  strings  without  any  separator.
 *    -  `default`:  Returns  the  input  `i`  unchanged  if  `no`  is  unknown.
 *  @returns  {any}  The  result  of  the  conversion,  or  the  original  input  on  error  or  default  case.
 */
function myconv ( i ,  no )
{
  try
  {
    switch ( no )
    {
      case  1 :  return  parseInt ( i ) ;
      case  2 :  return  i . split ( ' ' ) ;
      case  4 :  return  i . split ( ' ' ) . map ( Number ) ;
      case  6 :  return  i . split ( '' ) ;
      case  7 :  return  i . split ( '' ) . map ( Number ) ;
      case  8 :  return  i . join ( ' ' ) ;
      case  9 :  return  i . join ( '\n' ) ;
      case  0 :  return  i . join ( '' ) ;
      default :  return  i ;
    }
  }
  catch ( e )
  {
    return  i ;  //  Return  original  input  on  any  conversion  error.
  }
}

//  ---  END  Custom  Input  Parsing  Functions  ---


/**
 *  The  main  entry  point  for  the  problem's  solution  logic.
 *  This  function  reads  problem-specific  input,  performs  calculations,
 *  and  produces  the  final  output.
 *
 *  Problem  Context  (inferred):
 *  This  appears  to  be  a  scenario  involving  monsters  at  various  positions
 *  with  certain  health  values.  A  player  can  attack  monsters,  and  each
 *  attack  has  a  range  (2*D)  and  power  (A).  The  goal  is  to  find  the
 *  minimum  number  of  attacks  required  to  defeat  all  monsters.
 */
function Main ( )
{
  //  Read  the  first  line  of  input,  which  contains  N,  D,  and  A.
  var one  =  nextIntArray ( ) ;

  //  N:  The  total  number  of  monsters.
  var N  =  one [ 0 ] ;

  //  D:  A  parameter  related  to  the  attack  range.
  var D  =  one [ 1 ] ;

  //  A:  The  attack  power  per  single  attack  action.
  var A  =  one [ 2 ] ;

  //  Initialize  an  array  to  store  monster  data.
  //  Each  element  will  be  an  array  [position,  health].
  var list  =  new  Array ( N ) ;

  //  Loop  to  read  N  lines  of  monster  data.
  for ( var i  =  0 ;  i  <  N ;  i ++ )
  {
    list [ i ]  =  nextIntArray ( ) ;  //  Read  [monster_position,  monster_health]
  }

  //  Sort  the  monsters  based  on  their  position  (the  first  element).
  //  This  is  crucial  for  the  sweep-line  or  greedy  approach  used  later.
  list . sort ( function ( a ,  b )
  {
    return  a [ 0 ]  -  b [ 0 ] ;
  } ) ;

  //  Initialize  a  counter  for  the  total  number  of  attacks  made.
  var output  =  0 ;

  //  Iterate  through  the  sorted  list  of  monsters.
  for ( var i  =  0 ;  i  <  N ;  i ++ )
  {
    //  If  the  current  monster  already  has  zero  health,  it's  defeated.
    //  Skip  to  the  next  monster.
    if ( list [ i ] [ 1 ]  ==  0 )
    {
      continue ;
    }

    //  x:  The  position  of  the  current  monster  being  targeted.
    var x  =  list [ i ] [ 0 ] ;

    //  Calculate  the  number  of  attacks  needed  to  defeat  this  monster.
    //  `Math.ceil`  ensures  even  partial  health  requires  a  full  attack.
    var attack  =  Math . ceil ( list [ i ] [ 1 ]  /  A ) ;

    //  Add  these  attacks  to  our  total  count.
    output  +=  attack ;

    //  Now,  apply  the  damage  from  these  attacks  to  all  monsters
    //  within  the  effective  range  of  the  current  attack  point.
    for ( var j  =  i  +  1 ;  j  <  N ;  j ++ )
    {
      //  Check  if  monster  `j`  is  within  the  attack  range.
      //  The  range  is  `x`  (current  monster's  position)  plus  `2 * D`.
      if ( x  +  2  *  D  >=  list [ j ] [ 0 ] )
      {
        //  Reduce  monster  `j`'s  health.  Ensure  health  doesn't  go  below  zero.
        list [ j ] [ 1 ]  =  Math . max ( 0 ,  list [ j ] [ 1 ]  -  attack  *  A ) ;
      }
      else
      {
        //  If  monster  `j`  is  out  of  range,  all  subsequent  monsters
        //  will  also  be  out  of  range  (due  to  the  sorted  list).
        //  So,  we  can  break  out  of  this  inner  loop.
        break ;
      }
    }
  }

  //  Output  the  final  calculated  total  number  of  attacks.
  myout ( output ) ;
}