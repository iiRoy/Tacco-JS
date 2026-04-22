var   read   =   require ( 'readline' ) . createInterface (
  {
    input   :   process . stdin ,
    output  :   process . stdout
  }
) ;

// Declare objects for input processing
var   obj ;
var   inLine   =   [ ] ;

// Event listener for each line of input
read . on (
  'line' ,
  function (  input  )
  {
    inLine . push ( input ) ; // Store the input line
  }
) ;

// Event listener for end of input
read . on (
  'close' ,
  function (  )
  {
    obj   =   init ( inLine ) ; // Initialize the input object
    console . error ( '\n↑入力 ↓出力' ) ; // Debug message for input/output direction
    Main ( ) ; // Call the main logic function
  }
) ;

// Function to create a deep clone of an object or Set
function   makeClone ( obj )
{
  // If it's a Set, create a new Set from its elements
  return   ( obj   instanceof   Set )
    ?   new   Set ( Array . from ( obj ) )
    :   JSON . parse ( JSON . stringify ( obj ) ) ; // Otherwise, deep clone using JSON serialization
}


// Helper functions to parse next input item
function   nextInt ( )
{
  return   myconv ( next ( ) , 1 ) ; // Convert next input to integer
}

function   nextStrArray ( )
{
  return   myconv ( next ( ) , 2 ) ; // Convert next input to string array (split by space)
}

function   nextIntArray ( )
{
  return   myconv ( next ( ) , 4 ) ; // Convert next input to integer array (split by space)
}

function   nextCharArray ( )
{
  return   myconv ( next ( ) , 6 ) ; // Convert next input to character array
}


// Core input retrieval functions
function   next ( )
{
  return   obj . next ( ) ; // Get the next item from the input object
}

function   hasNext ( )
{
  return   obj . hasNext ( ) ; // Check if there's more input
}


// Initialize the custom input object
function   init ( input )
{
  return   {
    list  :   input , // The array of input lines
    index :   0 , // Current index for reading
    max   :   input . length , // Total number of input lines

    // Method to check if there are more lines
    hasNext :   function ( )
    {
      return   ( this . index   <   this . max ) ;
    } ,

    // Method to get the next line
    next    :   function ( )
    {
      if   ( this . hasNext ( ) )
      {
        return   this . list [ this . index ++ ] ; // Return current line and increment index
      }
      else
      {
        throw   'ArrayIndexOutOfBoundsException ‚There is no more input' ; // Error if no more input
      }
    }
  } ;
}


// Output function
function   myout ( s )
{
  console . log ( s ) ; // Print to standard output
}


// Debug output function
function   myerr ( s )
{
  console . error (
    'debug:'
    +   require ( 'util' ) . inspect ( s , false , null )
  ) ; // Print debug info to standard error
}


// param "no" is
// unknown or outlier : return i.
// 1: parseInt.
// 2: split space.
// 4: split space and parseInt.
// 6: split 1 character.
// 7: split 1 character and parseInt.
// 8: join space.
// 9: join nextline.
// 0: join no character.
function   myconv ( i , no )
{
  try
  {
    switch   ( no )
    {
      case   1 :
        return   parseInt ( i ) ;
      case   2 :
        return   i . split ( ' ' ) ;
      case   4 :
        return   i . split ( ' ' ) . map ( Number ) ;
      case   6 :
        return   i . split ( '' ) ;
      case   7 :
        return   i . split ( '' ) . map ( Number ) ;
      case   8 :
        return   i . join ( ' ' ) ;
      case   9 :
        return   i . join ( '\n' ) ;
      case   0 :
        return   i . join ( '' ) ;
      default :
        return   i ;
    }
  }
  catch   ( e )
  {
    return   i ;
  }
}

//Don't have to see. end------------------------------------------


function   Main (  )
{
  // Read the first line which contains N and C
  var   one   =   nextIntArray ( ) ;

  var   N   =   one [ 0 ] ; // N: number of events
  var   C   =   one [ 1 ] ; // C: total number of channels (not directly used in this solution's logic, but part of problem context)

  var   len   =   100005 ; // A sufficiently large length for the timeline (e.g., max possible day + a buffer)

  // Initialize a list (array) to represent the timeline
  var   list   =   new   Array ( len ) ;

  // Populate the timeline with objects for 'add' and 'remove' events
  for   ( var   i   =   0 ;   i   <   len ;   i ++ )
  {
    list [ i ]   =   {
      add     :   [ ] , // Channels added on this day
      remove  :   [ ]   // Channels removed on this day
    } ;
  }

  // Process N events
  for   ( var   i   =   0 ;   i   <   N ;   i ++ )
  {
    var   tmp   =   nextIntArray ( ) ; // Read each event [start_day, end_day, channel_id]

    // Add channel_id to the 'add' list for the start_day (0-indexed)
    list [ tmp [ 0 ]   -   1 ] . add . push ( tmp [ 2 ] ) ;

    // Add channel_id to the 'remove' list for the day after end_day (inclusive end_day)
    list [ tmp [ 1 ] ] . remove . push ( tmp [ 2 ] ) ;
  }

  // Set to keep track of currently active channels
  var   used   =   new   Set ( ) ;

  var   output   =   0 ; // Variable to store the maximum number of active channels

  // Iterate through the timeline day by day
  for   ( var   i   =   0 ;   i   <   len ;   i ++ )
  {
    // First, process channels to be removed on this day
    for   ( var   j   =   0 ;   j   <   list [ i ] . remove . length ;   j ++ )
    {
      used . delete ( list [ i ] . remove [ j ] ) ; // Remove the channel from the 'used' set
    }

    // Then, process channels to be added on this day
    for   ( var   j   =   0 ;   j   <   list [ i ] . add . length ;   j ++ )
    {
      used . add ( list [ i ] . add [ j ] ) ; // Add the channel to the 'used' set
    }

    // Update the maximum number of active channels if current count is higher
    output   =   Math . max ( output , used . size ) ;
  }

  // Output the final result
  myout ( output ) ;
}