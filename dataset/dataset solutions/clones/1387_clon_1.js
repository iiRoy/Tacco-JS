/*
 * This is a Type I clone of an existing JavaScript program.
 * It processes input from /dev/stdin line by line,
 * demonstrating basic file reading and loop iteration.
 */

//  Declare a variable 'hoge' to store the raw input content
//  read synchronously from the standard input file.
var hoge    =   require ( 'fs' )  .  readFileSync ( '/dev/stdin'  ,   'utf8' )   ;

//  Split the 'hoge' string by newline characters ('\n')
//  to get an array of lines, storing it in 'num'.
var num =   hoge    .   split   (   '\n'    )   ;


//  Initiate a 'for' loop to iterate through each line in the 'num' array.
//  'i' is the current index, 'iz' stores the total number of lines.
for (  var i = 0  ,  iz = num . length  ;  i < iz  ;  i ++  )
{
    //  Calculate the 'case number' for the current line.
    //  This is simply the current loop index plus one.
    var init  =   i  +  1  ;

    //  Output the result to the console.
    //  The format is "Case X:line_content", where X is 'init'
    //  and 'line_content' is the current line from the 'num' array.
    console . log (  'Case '  +  init  +  ':'  +  num [ i ]  )  ;
}

//  End of the script.
//  No explicit return value is needed for this type of script.