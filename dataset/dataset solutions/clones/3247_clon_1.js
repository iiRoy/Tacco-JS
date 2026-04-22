/*
 * This file contains the main logic for processing input data.
 * The 'Main' function serves as the entry point for the program.
 */

function   Main  (  input  )
{
  // The input parameter contains the entire input data as a single string.
  // We first split the input string by newline characters to get an array of lines.
  inputList  =  input.split ( "\n" ) ;

  // The first line of input (inputList[0]) contains two space-separated integers.
  // We parse these integers and assign them to 'n' and 'm'.
  first  =  inputList [ 0 ] .split ( " " ) .map (  str  =>  parseInt ( str , 10 )  ) ;

  // 'n' represents the first integer from the first line.
  n  =  first [ 0 ] ;
  // 'm' represents the second integer from the first line.
  m  =  first [ 1 ] ;

  // Initialize arrays to store processed data.
  // 'rowList' will store all parsed rows.
  rowList  =  [ ] ;
  // 'fromList' will store the first element of each row.
  fromList  =  [ ] ;
  // 'toList' will store the second element of each row.
  toList  =  [ ] ;

  // Loop through the input lines starting from the second line (index 1)
  // up to 'n - 1 + m' lines, which correspond to data rows.
  for  (  var  i  =  1 ;   i  <=  n  -  1  +  m ;   i++  )
  {
    // Each row is split by spaces and parsed into integers.
    row  =  inputList [ i ] .split ( " " ) .map (  str  =>  parseInt ( str , 10 )  ) ;
    // Store the current parsed row in 'rowList'.
    rowList [ i  -  1 ]  =  row ;
    // Add the first element of the current row to 'fromList'.
    fromList.push ( row [ 0 ] ) ;
    // Add the second element of the current row to 'toList'.
    toList.push ( row [ 1 ] ) ;
  }

  // Initialize 'leafList' to store "leaf" nodes (nodes not present in 'fromList').
  leafList  =  [ ] ;
  // Initialize 'top' to store the "top" node (a node not present in 'toList').
  top  =  0 ;

  // Iterate from 1 to 'n' to identify leaf and top nodes.
  for  (  var  i  =  1 ;   i  <=  n ;   i++  )
  {
    // If the current number 'i' is not found in 'fromList', it's considered a leaf.
    if  (  fromList.indexOf ( i )  ==  -1  )
    {
      leafList.push ( i ) ;
    }

    // If the current number 'i' is not found in 'toList', it's considered a top node.
    // Note: This logic assumes there will be only one such 'top' node assigned.
    if  (  toList.indexOf ( i )  ==  -1  )
    {
      top  =  i ;
    }
  }

  // Output the identified leaf nodes and the top node to the console.
  console.log ( leafList , top ) ;
}


// --- Standard input/output handling. Do not edit this section. ---
// This part reads the entire content from standard input and passes it to the Main function.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;