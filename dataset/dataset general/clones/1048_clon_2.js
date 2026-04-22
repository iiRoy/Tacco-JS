// This module sets up a web server to generate and serve Excel files.

const webFramework = require('express'); // Import the Express web framework
let excelGenerator = require('excel-export'); // Import the Excel generation library
const uniqueIdGen = require('node-uuid'); // Import the UUID generation library
const serverApp = webFramework(); // Initialize an Express application instance

// Define a route handler for generating a large Excel file
serverApp.get('/BigFile', function(clientRequest, serverResponse) {
    let dataSettings = {}; // Object to hold the configuration for the spreadsheet
    dataSettings.columnDefinitions = []; // Array to store metadata for each column

    // Loop to dynamically create 100 column headers
    for (let colIndex = 0; colIndex < 100; colIndex++) {
        dataSettings.columnDefinitions.push({
            headerTitle: 'textual_data_' + colIndex, // Header text for the column
            titleStyleRef: 1, // Style index reference for the header
            dataType: 'string' // Data type for the column, in this case, text
        });
    }

    dataSettings.rowData = []; // Array to store all the data rows

    // Loop to generate 1000 data rows
    for (let rowIndex = 0; rowIndex < 1000; rowIndex++) {
        let currentRecord = []; // Temporary array to build a single row
        // Inner loop to populate 100 cells within the current row
        for (let cellIndex = 0; cellIndex < 100; cellIndex++) {
            currentRecord.push(uniqueIdGen.v4()); // Add a new UUID string to the cell
        }
        dataSettings.rowData.push(currentRecord); // Add the completed row to the data
        dataSettings.rowData.push(currentRecord); // Add the same row again to make the file larger
    }

    // Generate the Excel file buffer from the configured settings
    const generatedOutput = excelGenerator.execute(dataSettings);

    const spreadsheetMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // Standard MIME type for .xlsx files
    const downloadDisposition = "attachment; filename="; // Header prefix for file download
    const outputFileName = "HugeReport.xlsx"; // The name of the file to be downloaded

    serverResponse.setHeader('Content-Type', spreadsheetMimeType); // Set the response content type
    serverResponse.setHeader("Content-Disposition", downloadDisposition + outputFileName); // Instruct browser to download file
    serverResponse.end(generatedOutput, 'binary'); // Send the generated Excel file as binary data
});

// Define another route handler for a more structured Excel report
serverApp.get('/StructuredReport', function(clientRequest, serverResponse) {
    let reportConfiguration = {}; // Object to hold the settings for the report
    // The following line is commented out but would be used to specify a custom styles XML file
    // reportConfiguration.customStylesPath = "custom_styles.xml";

    reportConfiguration.columnDefinitions = [ // Array defining the columns and their properties
        {
            headerTitle: 'string_field', // Header for string type column
            titleStyleRef: 1, // Style index for the header
            dataType: 'string', // Data type is string
            beforeCellWrite: function(recordEntry, inputData) { // Function to process cell data before writing
                return inputData.toUpperCase(); // Convert string data to uppercase
            },
            columnWidth: 15 // Set column width to 15 units
        },
        {
            headerTitle: 'date_field', // Header for date type column
            dataType: 'date', // Data type is date
            beforeCellWrite: function() { // Self-executing function to setup date conversion
                const referenceDate = new Date(Date.UTC(1899, 11, 30)); // Excel's epoch date
                return function(recordEntry, inputData, exportOptions) {
                    // Example of conditional styling based on row number (currently commented)
                    // if (exportOptions.rowNum % 2) {
                    //     exportOptions.styleIndex = 1;
                    // }
                    // else {
                    //     exportOptions.styleIndex = 2;
                    // }
                    if (inputData === null) { // Check if the date value is null
                        exportOptions.cellType = 'string'; // If null, treat as string
                        return 'NOT_AVAILABLE'; // Return a specific string for null dates
                    } else
                        return (inputData - referenceDate) / (24 * 60 * 60 * 1000); // Convert date object to Excel's serial date number
                };
            }(), // Execute the outer function immediately
            columnWidth: 20.85 // Set column width
        },
        {
            headerTitle: 'boolean_field', // Header for boolean type column
            dataType: 'bool' // Data type is boolean
        },
        {
            headerTitle: 'number_field', // Header for number type column
            dataType: 'number', // Data type is number
            columnWidth: 30 // Set column width
        }
    ];

    reportConfiguration.rowData = [ // The actual data rows to be included in the report
        ['constant_pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14159],
        ["constant_e", new Date(2012, 4, 1), false, 2.7182],
        ["Special_Chars_Test<>'", new Date(Date.UTC(2013, 6, 9)), false, 1.61803],
        ["null_date_example", null, true, 1.414]
    ];

    // Execute the Excel generation process with the defined report configuration
    const finalReportData = excelGenerator.execute(reportConfiguration);

    const reportMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // MIME type for the generated report
    const downloadHeader = "attachment; filename="; // Standard header for triggering a file download
    const finalFilename = "SummaryReport.xlsx"; // The suggested filename for the downloaded file

    serverResponse.setHeader('Content-Type', reportMime); // Set the HTTP Content-Type header
    serverResponse.setHeader("Content-Disposition", downloadHeader + finalFilename); // Set the Content-Disposition header
    serverResponse.end(finalReportData, 'binary'); // Send the generated report data as a binary response
});

// Start the web server and listen for incoming connections on port 3000
serverApp.listen(3000);
// Output a message to the console indicating that the server is running
console.info('Web server is now active on port 3000');