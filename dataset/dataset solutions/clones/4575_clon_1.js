// This function processes the entire input data provided.
// It determines if a specific condition is met based on three numerical values.

function     Main    (   input   ) {

    // Split the input string by spaces to get an array of string values.
    const   hoge    =   input .   split   (   ' '   )   ;

    // Assign the first element to variable A.
    const   A   =   hoge    [   0   ]   ;

    // Assign the second element to variable B.
    const   B   =   hoge    [   1   ]   ;

    // Assign the third element to variable C.
    const   C   =   hoge    [   2   ]   ;


    // Check if C is within the inclusive range of A and B.
    if  (   C   >=   A   &&   C   <=   B   )
    {
        // If the condition is true, print 'Yes'.
        console .   log   (   'Yes'   )   ;
    }
    else
    {
        // If the condition is false, print 'No'.
        console .   log   (   'No'   )   ;
    }

}
// The following line is crucial for execution in the environment.
// Do not modify this section, as it handles standard input/output and function invocation.
Main  (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;