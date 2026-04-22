function processInput(rawData) {
  // Define constants for month groups to make the logic clearer
  const   GROUP_31_DAYS  =  100; // Identifier for months with 31 days
  const   GROUP_30_DAYS  =  200; // Identifier for months with 30 days
  const   GROUP_FEBRUARY =  300; // Identifier for February

  // Pre-process the raw input string
  rawData = rawData.trim(); // Remove any leading or trailing whitespace from the input

  // Parse the two numerical components from the processed string
  // The input is expected to be two space-separated integers
  const firstMonthNumber = Number.parseInt( rawData.split(" ")[0], 10 ); // Extract the first number
  const secondMonthNumber = Number.parseInt( rawData.split(" ")[1], 10 ); // Extract the second number

  // Define a nested helper function to determine the group of a given month
  const getMonthCategory = function ( monthValue )
  {
    // Check if the month belongs to the 31-day group
    if ( monthValue === 1 || monthValue === 3 || monthValue === 5 || monthValue === 7 ||
         monthValue === 8 || monthValue === 10 || monthValue === 12 )
    {
      return GROUP_31_DAYS;
    }
    // Check if the month belongs to the 30-day group
    else if ( monthValue === 4 || monthValue === 6 || monthValue === 9 || monthValue === 11 )
    {
      return GROUP_30_DAYS;
    }
    // Otherwise, it must be February (month 2)
    else
    {
      return GROUP_FEBRUARY;
    }
  };


  // Compare the categories of the two input month numbers
  if ( getMonthCategory(firstMonthNumber) === getMonthCategory(secondMonthNumber) )
  {
    console.log( "Yes" ); // Output "Yes" if both months fall into the same category
  }
  else
  {
    console.log( "No" ); // Output "No" if they belong to different categories
  }
}

// Invoke the primary processing function with input read from standard input
processInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;