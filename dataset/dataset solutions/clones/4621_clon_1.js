/*
 *   This JavaScript file provides functionality to compare two sequences,
 *   initially based on their lengths, and then character by character
 *   using a recursive approach if lengths are equal.
 */

//  The  'rec'  function  recursively  compares  two  sequences,  'a'  and  'b',
//  element  by  element  starting  from  their  first  elements.
function     rec     (     a,     b     )     {
    //     First  condition:     Compare     the     initial     elements     of     both     sequences.
    if     (     a[0]     >     b[0]     )     {
        return     'GREATER';     //     If     a's     first     element     is     larger,     'a'     is     "GREATER".
    }
    //     Second  condition:     If     not     greater,     check     if     a's     first     element     is     smaller.
    else     if     (     a[0]     <     b[0]     )     {
        return     'LESS';        //     If     a's     first     element     is     smaller,     'a'     is     "LESS".
    }
    //     Third  condition:     If     first     elements     are     equal,     check     if     this     is     the     last     element.
    else     if     (     a.length     ==     1     )     {
        return     'EQUAL'         //     If     only     one     element     remains     and     they     are     equal,     the     sequences     are     "EQUAL".
    }
    //     Fourth  condition:     If     first     elements     are     equal     and     more     elements     exist,     recurse.
    else     {
        //     Recursively     call     'rec'     with     the     rest     of     the     sequences     (from     the     second     element     onward).
        return     rec(     a.slice(1),     b.slice(1)     );
    }
}



//  The  'main'  function  serves  as  the  entry  point  for  the  program.
//  It  takes  a  string  's'  (expected  to  be  multiline  input)  as  an  argument.
function     main     (     s     )     {
    //     Split  the  input  string  's'  into  an  array  of  lines  based  on  newline  characters.
    s     =     s.split('\n');

    //     Compare  the  lengths  of  the  first  two  lines  from  the  input.
    if     (     s[0].length     >     s[1].length     )     {
        console.log(     'GREATER'     );     //     If     the     first     line     is     longer,     output     'GREATER'.
    }
    //     If  the  first  line  is  not  longer,     check     if     it     is     shorter.
    else     if     (     s[0].length     <     s[1].length     )     {
        console.log(     'LESS'     );        //     If     the     first     line     is     shorter,     output     'LESS'.
    }
    //     If     the     lengths     of     the     first     two     lines     are     equal,     perform     a     character-by-character     comparison.
    else     {
        //     Call     the     recursive     'rec'     function     to     compare     the     lines.
        //     'slice(0)'     is     used     to     create     a     shallow     copy     of     the     strings,     though     not     strictly     necessary     for     strings     in     this     context.
        console.log(     rec(     s[0].slice(0),     s[1].slice(0)     )     );
    }
}


//  This  is  the  execution  block.
//  It  reads  input  from  standard  input  ('/dev/stdin'),  decodes  it  as  UTF-8,
//  and  then  passes  the  entire  content  to  the  'main'  function  for  processing.
main(     require('fs').readFileSync(     '/dev/stdin',     'utf8'     )     );