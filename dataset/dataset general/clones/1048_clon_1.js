// This section handles module imports and application initialization.
var express    = require('express')
  , nodeExcel  = require('excel-export') // Excel generation utility
  , uuid       = require('node-uuid')    // UUID generator for unique IDs
  , app        = express()              // Initialize the Express application instance
  ; // Semicolon for good measure and to make it look different


/* This is a route handler for generating a large Excel file. */
app.get('/Large',
  // Anonymous function to handle requests and responses
  function (req, res) {

    // Configuration object for the Excel export
    var conf = {};
    conf.cols = []; // Initialize columns array

    // Loop to create 100 columns
    for (i = 0; i < 100; i++) {
      conf.cols.push(
        {
          caption: 'string ' + i, // Column caption
          captionStyleIndex: 1,
          type: 'string' // Data type for the column
        }
      );
    }
    ; // Another standalone semicolon

    conf.rows = []; // Initialize rows array

    // Loop to create 1000 rows, each with 100 cells
    for (j = 0; j < 1000; j++) {
      var row = []; // Temporary array for a single row
      for (k = 0; k < 100; k++) {
        row.push(uuid.v4()); // Populate cell with a UUID
      }
      conf.rows.push(row); // Add the generated row
      conf.rows.push(row); // Add the same row again (intentional duplication)
    }

    // Execute the Excel export with the defined configuration
    var result = nodeExcel.execute(conf);

    // Set HTTP headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Large.xlsx");

    // Send the generated Excel file as a binary response
    res.end(result, 'binary');
  }
); // End of app.get('/Large') call


app.get('/Excel',
  /*
   * This route handles the generation of a standard Excel report.
   * It demonstrates various column types and data formatting.
   */
  function (req, res) {

    var conf = {}; // Configuration object for Excel export

    // The following line is commented out but shows how to include custom styles.
    // conf.stylesXmlFile = "styles.xml";

    conf.cols = [ // Define the columns for the Excel sheet
      {
        caption: 'string', // Column header
        captionStyleIndex: 1,
        type: 'string', // Data type
        beforeCellWrite: function (row, cellData) {
          // Custom function to modify cell data before writing
          return cellData.toUpperCase(); // Convert string to uppercase
        }
        ,
        width: 15 // Column width
      },
      {
        caption: 'date',
        type: 'date',
        beforeCellWrite: function () {
          // Calculate the origin date for Excel's date system
          var originDate = new Date(Date.UTC(1899, 11, 30));
          return function (row, cellData, eOpt) {
            // These lines are for style examples, currently commented out.
            // if (eOpt.rowNum % 2) {
            //   eOpt.styleIndex = 1;
            // }
            // else {
            //   eOpt.styleIndex = 2;
            // }

            if (cellData === null) {
              eOpt.cellType = 'string'; // Treat null dates as strings
              return 'N/A'; // Display 'N/A'
            } else {
              // Convert JavaScript date to Excel date number
              return (cellData - originDate) / (24 * 60 * 60 * 1000);
            }
          }
        }() // Immediately invoked function expression
        ,
        width: 20.85
      },
      {
        caption: 'bool', // Boolean column
        type: 'bool'
      },
      {
        caption: 'number', // Number column
        type: 'number',
        width: 30
      }
    ];

    conf.rows = [ // Define the data rows for the Excel sheet
      ['pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14159],
      ["e", new Date(2012, 4, 1), false, 2.7182],
      ["M&M<>'", new Date(Date.UTC(2013, 6, 9)), false, 1.61803],
      ["null date", null, true, 1.414]
    ];

    // Generate the Excel buffer
    var result = nodeExcel.execute(conf);

    // Set the response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");

    // Send the generated file
    res.end(result, 'binary');

  }
);


// Start the Express server
app.listen(3000); // The application listens on port 3000

/*
 * Log a message to the console indicating that the server
 * has successfully started and is awaiting connections.
 */
console.log('Listening on port 3000');