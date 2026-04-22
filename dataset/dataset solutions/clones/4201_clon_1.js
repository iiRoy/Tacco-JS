function myin( ){
  // This function reads input from standard input.
  return require("fs") . readFileSync( "/dev/stdin" , "utf8" ) . trim( );
}

function myout (t) { /* standard output function, prints to console.log */ console.log(t); }

function myerr (t){
  // This function is for printing error messages to standard error.
  console.error(t);
}

// [no]param: This comment describes the 'no' parameter for the 'myconv' function.
// 0: Do nothing, return the input as is.
// 1: Convert the input to an integer.
// 2: Split the input string by half-width spaces.
// 3: Split the input string by newlines.
// 4: Split by spaces and convert each part to a number, returning a number array.
// 5: Split by newlines and convert each part to a number, returning a number array.
// 6: Split the input string into individual characters.
// 7: Split into characters and convert each character to a number, returning a number array.
function myconv( i , no ) {
  switch ( no ) {
    case 0:
      return i; // Case 0: No conversion, return original input.
    case 1:
      return parseInt( i ); // Case 1: Parse string to integer.
    case 2:
      return i . split( " " ); // Case 2: Split by space.
    case 3:
      return i . split( "\n" ); // Case 3: Split by newline.
    case 4:
      return i . split( " " ) . map( ( a ) => Number( a ) ); // Case 4: Split by space, then map to Number.
    case 5:
      return i . split( "\n" ) . map( ( a ) => Number( a ) ); // Case 5: Split by newline, then map to Number.
    case 6:
      return i . split( "" ); // Case 6: Split into individual characters.
    case 7:
      return i . split( "" ) . map( ( a ) => Number( a ) ); // Case 7: Split into characters, then map to Number.
  }
}

function Main ( input ) {
  // Convert input string into an array of characters.
  input = myconv( input , 6 );

  // Create an object to store the indices of specific characters.
  var list = {
    "K" : input . indexOf( "K" ),
    "I" : input . indexOf( "I" ),
    "H" : input . indexOf( "H" ),
    "B" : input . indexOf( "B" ),
    "R" : input . indexOf( "R" )
  };

  // Check if any of the required characters are missing (index -1).
  if ( list [ "K" ] == -1 || list [ "I" ] == -1 || list [ "H" ] == -1 || list [ "B" ] == -1 || list [ "R" ] == -1 ) {
    myout( "NO" ); // If any character is missing, output "NO".
    return; // Exit function.
  }

  // Check if the input string length exceeds 9.
  if ( input . length > 9 ) {
    myout( "NO" ); // Output "NO" if too long.
    return; // Exit.
  }

  // Check specific positional relationships between K, I, and H.
  // K must be immediately before I (K = I - 1) and H must be after I.
  if ( list [ "K" ] != list [ "I" ] - 1 || list [ "H" ] < list [ "I" ] ) {
    myout( "NO" ); // Output "NO" if conditions not met.
    return; // Exit.
  }

  // Check positional relationships between H and B.
  // H must be before B, and the distance between them must not exceed 2.
  if ( list [ "H" ] > list [ "B" ] || list [ "B" ] - list [ "H" ] > 2 ) {
    myout( "NO" ); // Output "NO" if conditions not met.
    return; // Exit.
  }

  // Check positional relationships between B and R.
  // B must be before R, and the distance between them must not exceed 2.
  if ( list [ "B" ] > list [ "R" ] || list [ "R" ] - list [ "B" ] > 2 ) {
    myout( "NO" ); // Output "NO" if conditions not met.
    return; // Exit.
  }

  // Count leading 'A' characters.
  var maeAcount = 0;
  for ( var i = 0; i < input . length; i++ ) {
    if ( input [ i ] == "A" ) {
      maeAcount++;
    } else {
      break; // Stop counting if a non-'A' character is encountered.
    }
  }

  // If there is more than one leading 'A', output "NO".
  if ( maeAcount > 1 ) {
    myout( "NO" );
    return;
  }

  // Count trailing 'A' characters.
  var atoAcount = 0;
  for ( var i = input . length - 1; i >= 0; i-- ) {
    if ( input [ i ] == "A" ) {
      atoAcount++;
    } else {
      break; // Stop counting if a non-'A' character is encountered.
    }
  }

  // If there is more than one trailing 'A', output "NO".
  if ( atoAcount > 1 ) {
    myout( "NO" );
    return;
  }

  // If all conditions are met, output "YES".
  myout( "YES" );
}

// Execute the Main function with input from myin().
Main( myin( ) );