function    myin()
{
    // This function reads input from standard input stream.
    return   require("fs") . readFileSync(   "/dev/stdin",   "utf8"   ) . trim()   ;
}


function    myout(t)
{
    console . log(t)   ;    /* Outputs the given value to the console */
}

/*
 *  The myconv function provides various conversion utilities for input strings.
 *  Parameter 'i' is the input string.
 *  Parameter 'no' specifies the conversion type.
 */
function    myconv(  i  ,  no  )
{
    switch (   no   )
    {

        case   0   :
            //  Case 0: No conversion, return the input as is.
            return   i   ;

        case   1   :
            //  Case 1: Convert input to an integer.
            return   parseInt(   i   )   ;

        case   2   :
            //  Case 2: Split the input string by single spaces.
            return   i . split(   " "   )   ;

        case   3   :
            //  Case 3: Split the input string by newline characters.
            return   i . split(   "\n"   )   ;

        case   4   :
            //  Case 4: Split by spaces and convert each part to a number.
            return   i . split(   " "   ) . map(   (a)   =>   Number(a)   )   ;

        case   5   :
            //  Case 5: Split by newlines and convert each part to a number.
            return   i . split(   "\n"   ) . map(   (a)   =>   Number(a)   )   ;

        case   6   :
            //  Case 6: Split the input string into individual characters.
            return   i . split(   ""   )   ;

        case   7   :
            //  Case 7: Split into characters and convert each to a number.
            return   i . split(   ""   ) . map(   (a)   =>   Number(a)   )   ;
    }
}


function    Main(   input   )
{
            // Convert the initial input to an integer using myconv with option 1.
    input   =   myconv(   input   ,   1   )   ;

            // Calculate potential original price 1 by dividing by 1.08 and flooring.
    var   genka1   =   Math . floor(   input   /   1.08   )   ;

            // Calculate potential original price 2 by dividing by 1.08 and ceiling.
    var   genka2   =   Math . ceil(   input   /   1.08   )   ;

            // Re-calculate the price from genka1 to check if it matches the input.
    var   tmp1   =   Math . floor(   genka1   *   1.08   )   ;

            // Re-calculate the price from genka2 to check if it matches the input.
    var   tmp2   =   Math . floor(   genka2   *   1.08   )   ;

            // Check if the original input matches the price calculated from genka1.
    if   (   input   ==   tmp1   )
    {
            myout(   genka1   )   ;
    }
            // Otherwise, check if it matches the price calculated from genka2.
    else   if   (   input   ==   tmp2   )
    {
        myout(   genka2   )   ;
    }
            // If neither matches, output an error message.
    else
    {
        myout(   ":("   )   ;
    }
}

// Entry point: Call the Main function with input obtained from myin().
Main(   myin()   )   ;