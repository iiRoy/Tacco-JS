/* This is a Type I clone generated for AtCoder Beginner Contest 128 (B - Guidebook). */
/*   The original code's logic and structure are preserved exactly.                     */

function   Main   (   input   )   {

    // Step 1: Process the raw input string.
    var   dataList   =   input . split (   "\n"   ) ;

    // Remove the first line, which often contains metadata or counts.
    dataList . shift (   ) ;
    // Remove the last line, which might be an empty string or an extra newline.
    dataList . pop (   ) ;


    /*
     * Step 2: Transform the processed data into a structured array of restaurant objects.
     * Each object will have 'index', 'city', and 'score' properties.
     */
    var   restaurants   =   dataList . map (   (   data   ,   index   )   =>   {
        // Extract city and score from the current data line.
        var   tmp   =   data . split (   " "   ) ;

        // Construct the restaurant object.
        return   {   index : index   +   1   ,   city : tmp [   0   ]   ,   score : parseInt (   tmp [   1   ]   )   } ;
    }   ) ;


    /*
     * Step 3: Sort the restaurant array.
     * The primary sort key is 'city' (ascending alphabetical).
     * The secondary sort key is 'score' (descending numerical).
     */
    restaurants . sort (   function   (   a   ,   b   )   {

        // Compare cities first.
        if   (   a . city   <   b . city   )   {
            return   -1 ; // 'a' comes before 'b'
        }
        if   (   a . city   >   b . city   )   {
            return   1 ;  // 'b' comes before 'a'
        }

        // If cities are identical, compare scores in descending order.
        if   (   a . score   <   b . score   )   {
            return   1 ;  // 'b' (higher score) comes before 'a'
        }
        if   (   a . score   >   b . score   )   {
            return   -1 ; // 'a' (higher score) comes before 'b'
        }
        // If both city and score are equal, their relative order is stable (implicit undefined return).
    }   ) ;


    /*
     * Step 4: Output the original indices of the sorted restaurants.
     * Each index is printed on a new line.
     */
    restaurants . forEach (   restaurant   =>   {
        console . log (   restaurant . index   ) ;
    }   ) ;
}


// --- Standard Input/Output Handling ---
// !!! DO NOT MODIFY THE FOLLOWING LINE IN ATCODER SUBMISSIONS !!!
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   ) ;