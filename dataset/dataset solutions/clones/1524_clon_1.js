/*
 * This is a Type I code clone example.
 * It demonstrates strict adherence to Type I definition:
 * only whitespace and comments are altered.
 * All identifiers, operators, and expressions remain precisely as in the original.
 */


//  Begin  an  Immediately  Invoked  Asynchronous  Function  Expression  (  IIAFE  )  .
( async  ( )  =>
  {
    //  Declare  a  variable  to  hold  the  concatenated  standard  input  data.
    //  It's  initialized  as  an  empty  string  to  start  accumulation.
    let  input  =  ''  ;


    //  Asynchronously  iterate  over  the  incoming  data  chunks  from  standard  input.
    //  Each  'chunk'  is  appended  to  our  'input'  string.
    for  await  (  const  chunk  of  process . stdin  )  input  +=  chunk  ;
    //  The  loop  completes  once  all  standard  input  has  been  received.


    //  Process  the  collected  input  string.
    //  1.  Split  the  'input'  string  by  any  whitespace  character  (  using  the  /\s/  regex  )  .
    //  2.  Access  the  first  element  of  the  resulting  array  (  index  0  )  .
    //  3.  Use  the  unary  plus  operator  (  +  )  to  convert  this  element  into  a  number.
    const  x  =  +  input . split  (  / \s /  )  [  0  ]  ;


    //  Output  the  calculated  result  to  the  console.
    //  The  result  is  the  difference  of  '1'  and  the  parsed  number  'x'.
    console . log  (  1  -  x  )  ;
  }
) ( ) ;
//  End  of  the  Immediately  Invoked  Asynchronous  Function  Expression  .
//  The  script's  execution  terminates  here.