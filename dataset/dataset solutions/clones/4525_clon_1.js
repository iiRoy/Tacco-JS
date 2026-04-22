/*
 *  This JavaScript file implements a solution to find the range of a set of numbers.
 *  It demonstrates a Type I code clone, focusing on extensive whitespace and comment modifications
 *  while preserving the exact sequence of tokens and identifiers.
 */


'use strict' //  Enforce   strict   mode   for   safer   and   cleaner   code   execution .


//  Define   the   main   function   that   encapsulates   the   program's   core   logic .
const   main    =   (   input   )   =>  {

    //  Process   the   input   string   to   extract   and   sort   the   numbers :
    //  1 .   Split   the   entire   input   by   newline   characters   ( '\n' ) .
    //  2 .   Access   the   second   line   of   input   ( at   index   1 ) ,   assuming   it   contains   the   numbers .
    //  3 .   Split   this   line   by   spaces   ( ' ' )   to   get   individual   number   strings .
    //  4 .   Use   'map'   to   convert   each   string   segment   into   an   integer   using   'parseInt' .
    //  5 .   Sort   the   resulting   array   of   integers   in   ascending   order   using   a   comparison   function   ( a - b ) .
    const   nums    =   input
                        .   split   (   '\n'    )
                        [   1   ]
                        .   split   (   ' ' )
                        .   map (   v   =>  parseInt(v) )
                        .   sort    (   (   a   ,   b   )   =>  a   -   b   )
                        ;   //   An   optional   semicolon   for   statement   termination .


    //  Calculate   and   log   the   difference   between   the   largest   and   smallest   numbers .
    //  The   largest   number   is   at   the   end   of   the   sorted   array   ( nums.length - 1 ) .
    //  The   smallest   number   is   at   the   beginning   of   the   sorted   array   ( nums[0] ) .
    console .   log (   nums    [   nums    .   length  -   1   ]   -   nums    [   0   ]   )
    ;   //   Another   optional   semicolon .
}


//  Execute   the   main   function   by   reading   input   from   standard   input .
//  'require('fs')'   loads   the   Node.js   file   system   module .
//  'readFileSync('/dev/stdin', 'utf-8')'   reads   the   entire   content   of   standard   input
//  synchronously   as   a   UTF-8   encoded   string .
main    (
            require (   'fs'    )
            .   readFileSync    (
                                    '/dev/stdin'    ,
                                    'utf-8'
                                )
        )
;   //   Final   optional   semicolon   for   the   main   function   call .