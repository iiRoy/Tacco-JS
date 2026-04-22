/* This is an extensively modified Type I clone.
   All original identifiers, operators, and expressions are preserved.
   Only whitespace and comments have been altered significantly. */


function Main   (   input   )
{
    /* The input string is typically provided line by line.
       Here, it's assumed that `input` contains all lines concatenated
       and separated by newline characters.
       The first line corresponds to input[0], the second to input[1], and so on. */
    input   =   input .   split (   "\n"   )   ;    // Split the entire input string into an array of lines.


    // Process the first line of input to get box dimensions.
    tmp1    =   input   [   0   ]   .   split (   " "   )   ;

    // Process the second line of input to get paint dimensions.
    tmp2    =   input   [   1   ]   .   split (   " "   )   ;


    // Extract the number of rows for the box from the first temporary array.
    boxRowNum   =   tmp1    [   0   ]   ;
    /* This variable holds the column count for the main box.
       It's retrieved from the second element of the first parsed line. */
    boxColNum   =   tmp1    [   1   ]   ;

    // Extract the number of rows for the paint region from the second temporary array.
    paintRowNum =   tmp2    [   0   ]   ;
    // This variable stores the column count for the area to be painted.
    paintColNum =   tmp2    [   1   ]   ;


    /* The calculation determines the area of the unpainted region.
       It's derived by subtracting the paint dimensions from the box dimensions
       for both rows and columns, and then multiplying these differences.
       This assumes a rectangular shape and that the paint region is smaller
       and centered or aligned such that the unpainted area forms a border.
       Mathematically, it's (Box_Rows - Paint_Rows) * (Box_Cols - Paint_Cols). */
    output  =   (   boxRowNum   -   paintRowNum   )   *   (   boxColNum   -   paintColNum   )   ;



    // Finally, print the calculated output to the console.
    console .   log   (   output   )   ;


}   /* End of the Main function definition. */


/*
 **********************************************************************************************
 * DO NOT EDIT BELOW THIS LINE.
 * This section is responsible for reading standard input and invoking the Main function.
 * It ensures compatibility with typical competitive programming environments.
 **********************************************************************************************
 */
Main(   require (   "fs"   )   .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;