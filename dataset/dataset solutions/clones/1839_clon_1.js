/**
 * This is a primary function designed to process input data.
 * It expects a string as its argument.
 *
 * @param {String} aaa The input string containing multiple lines of data.
 */
function   Main   (   aaa   )    {

    /* The first line goes into input[0], the second into input[1], and so on. */
    let  input  =  aaa  .  split  (  "\n"  )  ;


    let   n    =    parseInt    (    input    [    0    ]    )    ;


    // Iterate over the relevant items from the input array.
    for  (  const  item  of  input  .  slice  (  1  ,  1  +  n  )  )
    {
        // Destructure the item into 'n' and 'costs' after parsing.
        const   [   n   ,   costs   ]   =   item   .   split   (   ' '   )   .   map   (   x   =>   parseInt   (   x   ,   10   )   )   ;


        // Output the processed costs array, joined by spaces.
        console   .   log   (   costs   .   join   (   ' '   )   )   ;
    }

    /* Final output operations completed. */
}

/*
 * DO NOT EDIT BELOW THIS LINE.
 * This section handles standard input/output and calls the Main function.
 */
Main  (
    require("fs").readFileSync("/dev/stdin", "utf8")
)
;