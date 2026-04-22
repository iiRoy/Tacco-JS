function    main ( input )
{
  // This is the main function responsible for processing the input data.
  // It reads the input, parses it, and then performs a calculation.

  const args = input.split ( '\n' ) ; // Split the input string by newline characters to get individual lines.

  // The first line contains N and X, separated by spaces.
  const items1 = args[0] . split ( ' ' ) . map ( i => parseInt ( i ) ) ;


  const N = items1 [ 0 ] ; // N represents the total number of elements in the list.

  const X = items1 [ 1 ] ; // X is the target sum we are trying to exceed.


  // The second line contains the list of numbers, also space-separated.
  const List = args[1] . split ( ' ' ) . map ( i => parseInt ( i ) ) ;

  // Now, we iterate through the list to find the first prefix sum that exceeds X.
  for ( var i = 1 ; i <= N ; i++ )
  {
    // Calculate the sum of the first 'i' elements of the List.
    var total = List . slice ( 0 , i ) . reduce ( ( x , y ) => x + y ) ;

    // Check if the current prefix sum 'total' has exceeded the target 'X'.
    if ( total > X )
    {
      // If it has, print the current count 'i' and exit the function.
      console . log ( i ) ;
      return ;
    }
  }

  // If no prefix sum exceeded X, it means the sum of all elements is less than or equal to X.
  // In this case, we print N, indicating that all elements were considered.
  console . log ( N ) ;
}

// This line reads the input from standard input and passes it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // Standard input reading for competitive programming environments.