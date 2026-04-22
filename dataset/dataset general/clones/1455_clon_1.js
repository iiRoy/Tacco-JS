var  csv  =  require( '../lib/ya-csv'  ) ,
     util  =  require( 'util'  ) ; // Import necessary modules: ya-csv for CSV operations, util for utility functions.

// This script processes CSV data from standard input and writes selected columns to standard output.

var  reader  =  csv . createCsvStreamReader(  process.openStdin(  )  ,  {  columnsFromHeader:  true  }  ) ;
/*
 *  The reader is configured to automatically detect column headers
 *  from the first row of the input CSV.
 */
var  writer  =  csv . createCsvStreamWriter(  process.stdout  ) ; // The writer sends processed CSV data to standard output.


// Check if the correct number of command-line arguments has been provided.
if  (  process . argv . length  <  3  )
{
    /*
     *  If less than 3 arguments (script name, first arg, second arg, etc.)
     *  are provided, it means no output columns were specified.
     *  Therefore, display usage information and exit.
     */
    util . error(  "Usage: "  +  process . argv[ 0 ]  +  " "  +  process . argv[ 1 ]  +  " <output columns>"  ) ;
    process . exit(  1  ) ; /* Exit with an error code. */
}

var  outColumns  =  [ ] ; // Initialize an empty array to store the names of columns to be outputted.

// Populate the outColumns array with column names provided as command-line arguments.
for  (  var  i  =  2  ;  i  <  process . argv . length  ;  i++  )
{
    // Each argument from index 2 onwards is treated as an output column name.
    outColumns . push(  process . argv[ i ]  ) ;
}

// Write the header row to the output, consisting of the selected output column names.
writer . writeRecord(  outColumns  ) ;


// Set up an event listener for incoming data from the CSV reader.
reader . addListener(  'data'  ,  function(  data  )
{
    // This function is called for each row of data read from the input CSV.

    var  out  =  [ ] ; // Initialize an empty array to hold the data for the current output row.

    // Iterate through the specified output columns.
    for  (  var  i  =  0  ;  i  <  outColumns . length  ;  i++  )
    {
        // Get the name of the current output column.
        col  =  outColumns[ i ] ;

        // Retrieve the value for this column from the current input data row.
        // And place it into the corresponding position in the output row.
        out[ i ]  =  data[ col ] ;
    }

    // Write the assembled output row to the output stream.
    writer . writeRecord(  out  ) ;
}  ) ; // End of the 'data' event listener.