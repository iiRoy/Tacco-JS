/*
 * This  is  a  demonstration  of  a  Type  I  code  clone.
 * The  original  functionality  and  structure  are  preserved.
 * Only  whitespace  and  comments  are  altered  to  create
 * a  visually  distinct  representation  of  the  same  code.
 *
 * This  program  reads  a  single  numeric  input  from  stdin,
 * computes  its  cube,  and  then  outputs  the  result  to  stdout.
 */

//  --------------------------------------------------------------
//  Section  1:  Input  Reading
//  --------------------------------------------------------------


    //  Declare  a  variable  to  hold  the  entire  content
    //  read  from  the  standard  input  stream.
    var     input
        =
        require     (     "fs"     )
        .       readFileSync     (
            "/dev/stdin"
            ,
            "utf8"
        )
        ;


//  The  'fs'  module  is  Node.js's  file  system  module.
//  'readFileSync'  is  a  synchronous  method  to  read  file  contents.
//  '/dev/stdin'  is  the  standard  input  file  path  on  Linux/Unix  systems.
//  'utf8'  specifies  the  character  encoding  for  the  input  data.


//  --------------------------------------------------------------
//  Section  2:  Input  Processing
//  --------------------------------------------------------------


        //  Declare  another  variable,  'A',  which  will  store
        //  the  numeric  value  extracted  from  the  input.
        var     A
            =
            input
                .   split   (
                    / \n /
                )
                [
                    0
                ]
            ;


//  The  'split(/\n/)'  method  divides  the  input  string
//  into  an  array  of  substrings,  using  the  newline  character
//  as  the  delimiter.  '[0]'  then  accesses  the  first  element
//  of  this  array,  effectively  retrieving  the  first  line  of  input.


//  --------------------------------------------------------------
//  Section  3:  Calculation  and  Output
//  --------------------------------------------------------------


            //  Finally,  we  output  the  computed  result.
            console
                .   log   (
                    (
                        A
                        *
                        A
                        *
                        A
                    )
                    +
                    "\n"
                )
            ;


//  The  expression  '(A * A * A)'  calculates  the  cube  of  the  variable  'A'.
//  This  result  is  then  concatenated  with  a  newline  character  ("\n").
//  'console.log()'  is  used  to  print  this  final  string  to  the  standard  output.


//  --------------------------------------------------------------
//  End  of  Program
//  --------------------------------------------------------------