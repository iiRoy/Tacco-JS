/*
 * This JavaScript code snippet is designed to process
 * input data from standard input (stdin).
 * It calculates specific number pairs based on a
 * unique mathematical condition.
 */

//  Initialize  the  standard  input  stream  object.
//  This  object  allows  the  program  to  read  data  from  the  console.
st  =  process.stdin  ;


//  Resume  the  input  stream.
//  By  default,  stdin  is  paused.  Resuming  it  starts  the  flow  of  data.
st.resume(  )  ;


//  Set  the  character  encoding  for  the  input  stream.
//  'utf8'  is  a  common  and  versatile  encoding.
st.setEncoding(  'utf8'  )  ;

//  Initialize  a  variable  'n'  to  -1.  Its  purpose  is  not  immediately  clear  from  this  snippet.
//  Define  a  concise  arrow  function  'i'.
//  This  function  takes  an  argument  'd'  and  returns  10  raised  to  the  power  of  'd'  (floored).
n  =  -1  ,  i  =  d  =>  Math.pow(  10  ,  ~~d  )  ;  /*  The  '~~'  operator  is  a  fast  way  to  perform  a  floor  operation  on  a  number.  */

//  Attach  an  event  listener  to  the  'data'  event  of  the  standard  input  stream.
//  The  callback  function  will  be  executed  whenever  data  is  received.
st.on(  'data'  ,  ip  =>  {

    //  Split  the  incoming  data  'ip'  (input  packet)  into  an  array  of  strings  'p'  at  each  newline  character.
    //  Each  element  of  'p'  will  represent  a  line  from  the  input.
    p  =  ip.split(  '\n'  )  ;


    //  Start  a  loop  that  iterates  'c'  times.
    //  The  number  of  iterations  is  determined  by  the  first  element  of  the  'p'  array  (p[0]).
    for  (  c  =  0  ;  c  <  p[0]  ;  ++c  )  {

        //  Initialize  an  empty  array  'r'.  This  array  will  store  the  results  (matching  number  pairs).
        r  =  []  ;
        //  Take  the  (c+1)-th  line  from  the  input  array  'p',  and  split  it  by  spaces  into  an  array  'o'.
        //  'o'  is  expected  to  contain  at  least  two  numbers  as  strings.
        o  =  p[c+1].split(  ' '  )  ;


        //  Begin  the  first  of  two  nested  loops.  This  loop  iterates  for  variable  'a'.
        //  'a'  starts  from  10^(o[0]-1)  and  continues  as  long  as  'a+1'  is  less  than  10^(o[0]).
        for  (  a  =  i(  o[0]  -  1  )  ;  a  +  1  <  i(  o[0]  )  ;  ++a  )
            //  The  second  nested  loop  iterates  for  variable  'b'.
            //  'b'  starts  from  10^(o[1]-1)  and  continues  as  long  as  'b+1'  is  less  than  10^(o[1]).
            for  (  b  =  i(  o[1]  -  1  )  ;  b  +  1  <  i(  o[1]  )  ;  ++b  )
                //  This  is  the  core  conditional  logic.
                //  It  checks  if  a  specific  arithmetic  expression  equals  a  string  concatenation.
                //  If  (a+b)*(b-a+1)/2  is  equal  to  the  string  formed  by  concatenating  ''  +  a  +  b,
                //  then  the  string  'a b'  is  pushed  into  the  results  array  'r'.
                (  a  +  b  )  *  (  b  -  a  +  1  )  /  2  ==  (  ''  +  a  +  b  )  &&  r.push(  a  +  ' '  +  b  )  ;

        //  After  the  nested  loops  complete,  check  if  any  results  were  found.
        //  If  'r.length'  is  greater  than  0  (truthy),  it  means  matching  pairs  were  found.
        //  In  that  case,  map  over  the  'r'  array  and  print  each  element  's'  to  the  console.
        //  Otherwise  (if  'r'  is  empty),  print  the  string  'No  cats.'  to  the  console.
        r.length
            ?  r.map(  s  =>  console.log(  s  )  )
            :  console.log(  'No  cats.'  )  ;

    }  /*  End  of  the  outer  loop  (looping  through  input  lines).  */

}  )  ;  //  End  of  the  'data'  event  listener  callback  function.

/*
 * This marks the end of the JavaScript code.
 * The program will continue to run as long as the stdin stream is open and processing data.
 */