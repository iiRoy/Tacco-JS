/* This is an initial comment block. It seems to be a note about potential issues or optimizations. */
// Original comment: WA & TLE まだ競合的な場合をあんまり試してない？ あとdpでやる必要があんまりない　jループの途中飛ばせるのでは
// This indicates the code might have Time Limit Exceeded or Wrong Answer issues.
  function    Main( input )    {
    // The primary function of the program, taking 'input' as its argument.

    input =  input  .  trim  (  )  .  split  (  "\n"  )  .  map  (  function  ( x )  {
      // Each line of input is processed here.
      return   x   .   split   (   " "   )  ;
    }  )  ;

    // 'l' serves as a line pointer or index for the input array.
    var  l  =  1  ;

    /*
     * This is a utility function to find the lower bound of a value 'n' in a sorted array 'arr'.
     * It returns the index of the first element greater than or equal to 'n'.
     * If all elements are less than 'n', it returns arr.length.
     */
    const   lowerBound   =   ( arr , n )   =>   {
        let   first   =   0  ,   last   =   arr . length   -   1  ,   middle  ;

        // Perform binary search to find the lower bound.
        while  (  first   <=   last  )  {
            middle   =   0   |   ( first   +   last )   /   2  ;   // Integer division trick.

            if  ( arr[ middle ]   <   n )   {
                first   =   middle   +   1  ;   // 'n' is in the upper half.
            }
            else   {
                last   =   middle   -   1  ;   // 'n' is in the lower half or found.
            }
        }
        return   first  ;   // 'first' will be the insertion point or the found element's index.
    }

    while   (   true   )   {
        // This is the main processing loop for multiple test cases.

        if   (   input[ l ]   ==   null   )   {
            // If there's no more input, exit the loop.
            break  ;
        }

        // Parse N, the number of items for the current test case.
        var   N   =   parseInt   (   input[ l ][ 0 ]  ,   10   )  ;

        /*
         * Initialize various arrays and variables needed for processing this test case.
         * arr_KLR1 and arr_KLR2 will store processed KLR lines.
         * KList1 and KList2 will store unique K values.
         */
        var   arr_KLR1   =   [ ]  ;
        var   arr_KLR2   =   [ ]  ;
        var   KList1   =   [ ]  ;
        var   KList2   =   [ ]  ;

        var   line  ;
        var   lowLimit   =   0  ;   // Accumulates a base value for the answer.
        var   Nafter   =   N  ;   // Tracks the number of items still needing full processing.

        for   (   var   i   =   0  ;   i   <   N  ;   i++   )   {
            // Read and parse each line of K, L, R data.
            line   =   input[ l   +   i   +   1 ]  .  map  (  e   =>   parseInt( e , 10 ) )  ;

            // This console.log seems incomplete in the original code, preserving it as is.
            console.log

            if   (   line[ 0 ]   ===   N   )   {
                // Special case: if K equals N.
                lowLimit   +=   line[ 1 ]  ;
                Nafter   --  ;
            }
            else   if   (   line[ 1 ]   >   line[ 2 ]   )   {
                // Case where L > R.
                arr_KLR1   .   push   (   line   )  ;
                lowLimit   +=   line[ 2 ]  ;
                KList1   .   push   (   line[ 0 ]   -   1   )  ;
            }
            else   if   (   line[ 1 ]   <   line[ 2 ]   )   {
                // Case where L < R. Transform the line data.
                line   =   [   N   -   line[ 0 ]  ,   line[ 2 ]  ,   line[ 1 ]   ]  ;
                arr_KLR2   .   push   (   line   )  ;
                lowLimit   +=   line[ 2 ]  ;
                KList2   .   push   (   line[ 0 ]   -   1   )  ;
            }
            else   {
                // Case where L === R.
                lowLimit   +=   line[ 1 ]  ;
                Nafter   --  ;
            }
        }

        // Sort the KLR arrays based on their first element (K or N-K).
        arr_KLR1   .   sort   (   ( a , b )   =>   a[ 0 ]   -   b[ 0 ]   )  ;
        arr_KLR2   .   sort   (   ( a , b )   =>   a[ 0 ]   -   b[ 0 ]   )  ;

        // Sort KList1 and filter out duplicate entries to keep only unique values.
        KList1   .   sort   (   ( a , b )   =>   a   -   b   )   .   filter   (   function   ( x , i , self )   {
            return   self   .   indexOf   (   x   )   ===   i  ;
        }  )  ;

        // Sort KList2 and filter out duplicate entries as well.
        KList2   .   sort   (   ( a , b )   =>   a   -   b   )   .   filter   (   function   ( x , i , self )   {
            return   self   .   indexOf   (   x   )   ===   i  ;
        }  )  ;

        // Initialize spaceList arrays, which likely track available 'slots' or capacities.
        var   spaceList1   =   [   [ ]  ,   [ ]   ]  ;
        var   spaceList2   =   [   [ ]  ,   [ ]   ]  ;

        // Initialize mapping arrays to quickly find indices in spaceList from K values.
        // Note: The length calculation for getSpaceListIndex2 seems to use KList1 by mistake in the original.
        // It should probably be KList2. However, for Type I clone, I must keep it as is.
        var   getSpaceListIndex1   =   Array   .   from   (   {   length  :   KList1[ KList1 . length   -   1 ]   +   1   }  ,   ( )   =>   0   )  ;
        var   getSpaceListIndex2   =   Array   .   from   (   {   length  :   KList1[ KList2 . length   -   1 ]   +   1   }  ,   ( )   =>   0   )  ;


        var   old   =   -1  ;   // Helper variable for calculating differences.

        // Populate spaceList1 and getSpaceListIndex1 based on KList1.
        for   (   var   i   =   0  ;   i   <   KList1 . length  ;   i++   )   {
            spaceList1[ 0 ]   .   push   (   KList1[ i ]   -   old   )  ;
            spaceList1[ 1 ]   .   push   (   0   )  ;
            getSpaceListIndex1[ KList1[ i ] ]   =   i  ;
            old   =   KList1[ i ]  ;
        }


        old   =   -1  ;   // Reset 'old' for the next list.

        // Populate spaceList2 and getSpaceListIndex2 based on KList2.
        for   (   var   i   =   0  ;   i   <   KList2 . length  ;   i++   )   {
            spaceList2[ 0 ]   .   push   (   KList2[ i ]   -   old   )  ;
            spaceList2[ 1 ]   .   push   (   0   )  ;
            getSpaceListIndex2[ KList2[ i ] ]   =   i  ;
            old   =   KList2[ i ]  ;
        }


        // Initialize the final answer with the accumulated lowLimit.
        var   ans   =   lowLimit  ;
        var   bestPlace  ,   tmpSpaceListIndex  ; // Declare variables used within the loops.

        // Process elements in arr_KLR1 to potentially increase the answer.
        for   (   var   i   =   0  ;   i   <   arr_KLR1 . length  ;   i++   )   {
            // Calculate the potential increase for this item.
            increase   =   arr_KLR1[ i ][ 1 ]   -   arr_KLR1[ i ][ 2 ]  ;

            // Find the starting index in spaceList1 for this K value.
            tmpSpaceListIndex   =   getSpaceListIndex1[ arr_KLR1[ i ][ 0 ]   -   1 ]  ;

            // Traverse backward in spaceList1 until an available slot is found.
            while   (
                spaceList1[ 1 ][ tmpSpaceListIndex ]   ===   spaceList1[ 0 ][ tmpSpaceListIndex ]
                &&   tmpSpaceListIndex   >=   0
            )   {
                 tmpSpaceListIndex   --  ;
            }

            // If an available slot was found, utilize it and update the answer.
            if   (   tmpSpaceListIndex   >=   0   )   {
                spaceList1[ 1 ][ tmpSpaceListIndex ]   ++  ;
                ans   +=   increase  ;
            }
        }

        // Process elements in arr_KLR2, similar to arr_KLR1.
        for   (   var   i   =   0  ;   i   <   arr_KLR2 . length  ;   i++   )   {
            // Calculate the potential increase for this item based on its L and R values.
            increase   =   arr_KLR2[ i ][ 1 ]   -   arr_KLR2[ i ][ 2 ]  ;

            // Obtain the corresponding index in spaceList2.
            tmpSpaceListIndex   =   getSpaceListIndex2[ arr_KLR2[ i ][ 0 ]   -   1 ]  ;

            // Search backward for an open slot in spaceList2.
            while   (
                spaceList2[ 1 ][ tmpSpaceListIndex ]   ===   spaceList2[ 0 ][ tmpSpaceListIndex ]
                &&   tmpSpaceListIndex   >=   0
            )   {
                 tmpSpaceListIndex   --  ;
            }

            // If a suitable slot is identified, increment its usage and add to the total answer.
            if   (   tmpSpaceListIndex   >=   0   )   {
                spaceList2[ 1 ][ tmpSpaceListIndex ]   ++  ;
                ans   +=   increase  ;
            }
        }

        // Output the calculated answer for the current test case.
        console   .   log   (   ans   )  ;


        // Advance the input line pointer to the start of the next test case.
        l   +=   N   +   1  ;
    }
}


// This part of the code invokes the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;