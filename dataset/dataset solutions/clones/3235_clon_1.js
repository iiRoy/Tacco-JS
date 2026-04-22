/*
 *   This  JavaScript  module  is  designed  to  process  numerical  input
 *   from  a  standard  input  source.  It  defines  a  primary  function
 *   named  'Main'  that  takes  the  entire  input  as  a  single  string.
 *
 *   The  purpose  is  to  demonstrate  a  solution  for  a  specific  problem
 *   involving  three  integer  values:  N,  A,  and  B.
 */



function   Main  (  input  )
{
    // The  'input'  parameter  initially  holds  all  data  as  one  long  string.
    // We  must  split  this  string  into  individual  components  based  on  spaces.
    //  Each  component  will  then  represent  a  distinct  numerical  value.

    input   =   input.split(" ");


    //  Now,  we  parse  each  relevant  part  of  the  split  input  array  into  integers.
    //  N  is  assigned  from  the  first  element,  A  from  the  second,  and  B  from  the  third.
    //  The  parseInt()  function  is  used  to  convert  string  representations  to  actual  numbers.
    N   =   parseInt(  input[0]  )   ;
    A   =   parseInt(  input[1]  )   ;
    B   =   parseInt(  input[2]  )   ;


    //  Here,  we  calculate  the  value  for  'answer2'.
    //  The  logic  is  a  ternary  operation:
    //  If  the  expression  (N  -  A  -  B)  is  greater  than  0,  'answer2'  becomes  0.
    //  Otherwise,  'answer2'  is  set  to  the  absolute  value  of  (N  -  A  -  B).
    answer2   =   (  N   -   A   -   B   >   0  )   ?   0   :   Math.abs(  N   -   A   -   B  )   ;


    //  Finally,  the  program  outputs  two  values  to  the  console.
    //  The  first  value  is  the  minimum  of  A  and  B.
    //  The  second  value  is  the  previously  calculated  'answer2'.
    //  The  output  format  specifies  two  decimal  integers,  separated  by  a  space.
    console.log(  '%d %d'  ,   Math.min(  A  ,  B  )  ,  answer2  )   ;
}


/*
 *   --------------------------------------------------------------------------------------
 *   IMPORTANT:  DO  NOT  MODIFY  THE  CODE  BELOW  THIS  LINE.
 *   This  section  is  boilerplate  for  handling  standard  input/output  in  Node.js.
 *   It  reads  the  entire  content  of  '/dev/stdin'  synchronously  and  then  calls
 *   the  'Main'  function  with  the  read  data.
 *   Any  alterations  here  could  break  the  input  processing  mechanism.
 *   --------------------------------------------------------------------------------------
 */
Main  (  require("fs").readFileSync("/dev/stdin", "utf8")  )   ;