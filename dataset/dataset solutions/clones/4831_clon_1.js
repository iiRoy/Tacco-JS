/*
 * This is a Type I code clone example.
 * The original source can be found at:
 * https://atcoder.jp/contests/abc049/tasks/arc065_b
 *
 * This version maintains exact logical and structural equivalence.
 * Only whitespace (spacing, indentation, blank lines) and comments have been altered.
 * No identifiers, operators, or expressions have been changed.
 */


function   main ( args )
{
   // Parse the first line of input to get N, K, L
   const  [ N, K, L ]  =  args[0] . split(' ') . map(Number) ;

   // Declare arrays for processing and storing results
   let a         =  [ ]     ;
   let b         =  [ ]     ;
   let c         =  [ ]     ;
   let results   =  [ ]     ;


   // Initialize arrays 'a', 'b' with N+1 and 'results' with 0
   for ( let i = 0 ; i < N ; i++ )
   {
      a[i]        = N + 1 ; // Default value for 'a' array
      b[i]        = N + 1 ; // Default value for 'b' array
      results[i]  = 0     ; // Initialize results array
   }


   // Process K "road" connections
   // These connections affect array 'a'
   for ( let i = 1, len = K + 1 ; i < len ; i++ )
   {
      // Parse the current line for connection points p and q
      const  [ p, q ]  =  args[i] . split(' ') . map(Number) ;

      // Determine the minimum value among a[p-1], a[q-1], and p
      // This logic implements a form of union-find without explicit parent tracking,
      // where the "root" is the smallest index encountered in a connected component.
      const  min = Math . min ( a[p-1] , a[q-1] , p ) ;

      // Update both connected components with the new minimum
      a[p-1] = min ;
      a[q-1] = min ;
   }


   // Process L "railway" connections
   // These connections affect array 'b'
   for ( let i = K + 1 , len = K + L + 1 ; i < len ; i++ )
   {
      // Parse the current line for connection points r and s
      const  [ r, s ]  =  args[i] . split(' ') . map(Number) ;

      // Determine the minimum value among b[r-1], b[s-1], and r
      // Similar union-find logic for the 'b' array
      const  min = Math . min ( b[r-1] , b[s-1] , r ) ;

      // Update both connected components with the new minimum
      b[r-1] = min ;
      b[s-1] = min ;
   }


   // Calculate the number of nodes in each common connected component
   for ( let i = 0 ; i < N ; i++ )
   {
      // Only process if this node hasn't been counted yet
      if ( results[i] == 0 )
      {
         c . length = 0 ; // Clear the temporary 'c' array
         c[0] = i       ; // Add the current node to 'c'

         // Check if the current node's components are valid (i.e., not N+1)
         if ( a[i] <= N && b[i] <= N )
         {
            // Iterate through subsequent nodes to find others in the same components
            for ( let j = i + 1 ; j < N ; j++ )
            {
               // If both 'a' and 'b' component roots are the same, they are in the same common component
               if ( a[i] == a[j] && b[i] == b[j] )
               {
                  c . push ( j ) ; // Add this node to the temporary list
               }
            }
         }

         // Store the count (length of 'c') for all nodes in this common component
         for ( let j = 0 , len = c . length ; j < len ; j++ )
         {
            results[c[j]] = len ; // Assign the count to each node in the component
         }
      }
   }

   // Output the final results, joined by spaces
   console . log ( results . join(' ') ) ;
}

// Read input from stdin, trim whitespace, and split by newlines, then pass to main
main ( require('fs') . readFileSync('/dev/stdin', 'utf8') . trim() . split('\n') ) ;