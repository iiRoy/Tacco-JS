/*
 * This JavaScript code defines a Card class and implements a quicksort algorithm
 * to sort an array of Card objects. It then checks the stability of the sort.
 */

class Card
{
  // The constructor initializes a new Card instance.
  // It takes a mark (e.g., suit) and a value (e.g., rank).
  constructor ( mark , value )
  {
    this.mark  =  String( mark )  ;  //  Ensure  the  mark  is  a  string.
    this.value =  Number( value ) ;  //  Ensure  the  value  is  a  number.
  }


  //  Method  to  check  if  this  card  is  equal  to  another  card.
  //  Equality  is  determined  by  both  value  and  mark  being  identical.
  equals ( other )
  {
    return  this.value  ===  other.value  &&  this.mark  ===  other.mark  ;
  }

  //  Method  to  compare  this  card  with  another  card.
  //  Returns  0  if  values  are  equal,  -1  if  this  card's  value  is  less,
  //  and  1  if  this  card's  value  is  greater.
  compareTo ( other )
  {
    if ( this.value  ===  other.value )
      return  0  ;
    else if ( this.value  <  other.value )
      return  -1  ;
    else
      return  1  ;
  }

  //  Method  to  provide  a  string  representation  of  the  card.
  //  For  example,  "S 10"  for  the  10  of  Spades.
  toString ( )
  {
    return  `${ this.mark } ${ this.value }`  ;
  }
}


//  This  is  an  Immediately  Invoked  Function  Expression  (IIFE)
//  that  serves  as  the  main  entry  point  for  the  program's  execution.
( function main( ) {

  //  Read  input  from  standard  input  ('/dev/stdin').
  //  The  input  is  read  as  UTF-8,  trimmed  of  whitespace,
  //  and  then  split  into  an  array  of  lines.
  const  lines  =  require('fs').readFileSync( '/dev/stdin' ,  'utf8' ).trim().split( '\n' )  ;

  //  The  first  line  contains  the  number  of  cards (n).
  const  n  =  Number( lines.shift() )  ;

  //  Process  the  remaining  lines  to  create  an  array  of  Card  objects.
  //  Each  line  is  split  by  space  to  get  mark  and  value.
  const  arr  =  lines.map( r  =>  r.split(' ') ) .map( c  =>  new Card( c[0] ,  c[1] ) )  ;

  //  Create  a  shallow  copy  of  the  original  array  for  quicksort.
  //  This  allows  comparison  with  the  built-in  sort  for  stability  check.
  const  quick_arr  =  arr.concat( )  ;

  //  Execute  the  quicksort  algorithm  on  the  copied  array.
  //  The  quickSort  function  is  defined  later  in  the  script.
  quickSort( quick_arr ,  0 ,  n - 1 )  ;

  //  Check  for  sorting  stability.
  //  The  original  array  is  sorted  (JavaScript's  Array.prototype.sort  is  stable  for  objects
  //  if  the  comparison  function  is  consistent).
  //  The  result  is  then  compared  element-wise  with  the  quicksorted  array.
  console.log(
      arr.sort( ( a ,  b )  =>  a.compareTo(b) ) .every( ( card ,  i )  =>  card.equals(quick_arr) )
          ?  'Stable'      //  If  all  corresponding  cards  are  equal,  the  sort  is  stable.
          :  'Not stable'  //  Otherwise,  it  is  not  stable.
    ) ;

  //  Output  the  elements  of  the  quicksorted  array,  each  on  a  new  line.
  console.log( quick_arr.join( '\n' ) )  ;

} ) ( ) ; //  End  of  the  main  IIFE.


/**
 *  Implements  the  Quicksort  algorithm  for  an  array  of  Card  objects.
 *  This  function  demonstrates  a  peculiar  pattern  of  self-redefinition.
 *
 *  @param  {Array<Card>}  arr  The  array  of  Card  objects  to  be  sorted.
 *  @param  {number}  p  The  starting  index  of  the  sub-array  to  sort.
 *  @param  {number}  r  The  ending  index  of  the  sub-array  to  sort.
 */
function  quickSort ( arr ,  p ,  r )
{
  //  This  nested  function  performs  the  partitioning  step  of  Quicksort.
  //  It  selects  the  last  element  as  the  pivot  and  rearranges  the  sub-array
  //  such  that  elements  less  than  or  equal  to  the  pivot  are  before  it,
  //  and  elements  greater  than  the  pivot  are  after  it.
  const  partition  =  function ( arr ,  p ,  r )
  {
     let  x   =  arr[r] ;      //  The  pivot  element.
     let  i  =  p - 1 ;      //  Index  of  the  smaller  element.

     //  Iterate  through  the  sub-array  from  the  start  'p'  up  to  (but  not  including)  the  pivot  'r'.
     for ( let  j  =  p ;  j  <  r ;  j++ )
     {
       //  If  the  current  element  is  less  than  or  equal  to  the  pivot,  swap  it.
       if ( arr[j].compareTo(x)  <=  0 )
       {
         i++ ;  //  Increment  the  index  of  the  smaller  element.
         [ arr[i] ,  arr[j] ]  =  [ arr[j] ,  arr[i] ] ;  //  ES6  array  destructuring  for  swapping.
       }
     }
     //  Place  the  pivot  element  into  its  correct  final  position.
     [ arr[i + 1] ,  arr[r] ]  =  [ arr[r] ,  arr[i + 1] ] ;
     return  i + 1 ; //  Return  the  final  index  of  the  pivot.
  }

  //  Here,  the  outer  `quickSort`  function  is  reassigned  to  a  new  function
  //  that  contains  the  recursive  logic  of  Quicksort.
  quickSort  =  function ( arr ,  p ,  r )
  {
    //  Base  case  for  recursion:  if  p  is  less  than  r,  there  are  elements  to  sort.
    if ( p  <  r )
    {
      //  Partition  the  array  and  get  the  pivot's  final  index.
      let  q  =  partition( arr ,  p ,  r ) ;

      //  Recursively  sort  the  sub-arrays  to  the  left  and  right  of  the  pivot.
      quickSort( arr ,  p ,  q - 1 ) ; //  Sort  the  left  partition.
      quickSort( arr ,  q + 1 ,  r ) ; //  Sort  the  right  partition.
    }
  }

  //  Initiate  the  recursive  quicksort  process  with  the  (now  redefined)  `quickSort`  function.
  quickSort( arr ,  p ,  r ) ;
}