const webFramework = require('express');
const excelGenerator = require('excel-export');
const uniqueIdGen = require('node-uuid');

// Define application-wide constants for configuration
const SERVER_LISTENING_PORT = 3000;
const EXCEL_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const BIG_REPORT_COL_COUNT_DEFAULT = 100;
const BIG_REPORT_ROW_COUNT_BASE = 1000;
const MAX_ALLOWED_ROWS_FOR_BIG_REPORT = 5000;
const BIG_REPORT_FILE_NAME = "ComprehensiveDataExport.xlsx";
const SAMPLE_REPORT_FILE_NAME = "DetailedSummary.xlsx";

// Instantiate the primary server application
const serverApp = webFramework();

/**
 * Custom logging function for server activities.
 * @param {string} logMessage - The message to be logged.
 * @param {object} [extraDetails] - Optional additional data to include in the log.
 */
const logApplicationEvent = (logMessage, extraDetails) => {
    const eventTimestamp = new Date().toISOString();
    if (extraDetails) {
        console.log(`[${eventTimestamp}] APP_EVENT: ${logMessage}`, extraDetails);
    } else {
        console.log(`[${eventTimestamp}] APP_EVENT: ${logMessage}`);
    }
};

/**
 * Creates a structured column definition object for Excel export.
 * @param {string} columnHeader - The display text for the column header.
 * @param {string} columnDataType - The data type for the column (e.g., 'string', 'number').
 * @param {number} [headerStyleIdx=1] - The style index for the header cell.
 * @param {number} [colWidth] - The width of the column.
 * @param {Function} [cellPreprocessor] - A function to modify cell data before writing.
 * @returns {object} A column definition object.
 */
const constructColumnSchema = (columnHeader, columnDataType, headerStyleIdx = 1, colWidth, cellPreprocessor) => {
    const schema = {
        headerText: columnHeader,
        dataType: columnDataType,
        headerStyleRef: headerStyleIdx
    };
    if (colWidth) {
        schema.columnWidth = colWidth;
    }
    if (cellPreprocessor) {
        schema.preProcessCell = cellPreprocessor;
    }
    return schema;
};

// --- Endpoint for generating a substantial Excel report ---
serverApp.get('/report/large-dataset', async (clientRequest, serverResponse) => {
    logApplicationEvent(`Request received for /report/large-dataset from client: ${clientRequest.ip}`);

    // Validate incoming request method (redundant for app.get but demonstrates a guard clause)
    if (clientRequest.method !== 'GET') {
        logApplicationEvent('Invalid HTTP method for large-dataset report', { method: clientRequest.method });
        return serverResponse.status(405).send('HTTP Method Not Allowed');
    }

    const exportConfiguration = {};
    exportConfiguration.columnDefinitions = [];

    // Dynamically adjust row count based on query parameter, with limits
    const requestedRecordCount = parseInt(clientRequest.query.records, 10);
    const actualRecordCount = (isNaN(requestedRecordCount) || requestedRecordCount <= 0)
        ? BIG_REPORT_ROW_COUNT_BASE
        : Math.min(requestedRecordCount, MAX_ALLOWED_ROWS_FOR_BIG_REPORT);

    // Generate column definitions
    for (let columnIterator = 0; columnIterator < BIG_REPORT_COL_COUNT_DEFAULT; columnIterator++) {
        exportConfiguration.columnDefinitions.push(constructColumnSchema(
            `Field_${columnIterator + 1}_Value`,
            'string',
            1
        ));
    }

    exportConfiguration.rowData = [];

    /**
     * Internal helper to create a single row of data.
     * @param {number} currentRowIndex - The index of the current row.
     * @param {number} totalColumns - The total number of columns in the row.
     * @returns {Array<string>} An array representing a single row of data.
     */
    const createSingleDataRow = (currentRowIndex, totalColumns) => {
        const rowContent = [];
        for (let cellIterator = 0; cellIterator < totalColumns; cellIterator++) {
            rowContent.push(`${uniqueIdGen.v4()}-R${currentRowIndex + 1}C${cellIterator + 1}`);
        }
        return rowContent;
    };

    // Populate the dataset with rows
    for (let currentRecordIndex = 0; currentRecordIndex < actualRecordCount; currentRecordIndex++) {
        const recordEntry = createSingleDataRow(currentRecordIndex, BIG_REPORT_COL_COUNT_DEFAULT);
        exportConfiguration.rowData.push(recordEntry);

        // Introduce an optional duplicate row based on a condition to show structural modification
        if (currentRecordIndex > 0 && currentRecordIndex % 500 === 0) {
            logApplicationEvent(`Inserting a duplicate record at index ${currentRecordIndex}`);
            exportConfiguration.rowData.push([...recordEntry]); // Push a shallow copy
        }
    }

    let generatedExcelOutput;
    try {
        // Perform the Excel generation
        generatedExcelOutput = excelGenerator.execute(exportConfiguration);
    } catch (generationError) {
        logApplicationEvent('Error occurred during Excel file generation for large-dataset', generationError);
        return serverResponse.status(500).send('Failed to produce the Excel report.');
    }

    const finalOutputFileName = clientRequest.query.filename || BIG_REPORT_FILE_NAME;

    // Set HTTP response headers for file download
    serverResponse.setHeader('Content-Type', EXCEL_MIME_TYPE);
    serverResponse.setHeader("Content-Disposition", `attachment; filename="${finalOutputFileName}"`);
    serverResponse.setHeader("X-Service-Identifier", "ExcelExportModule"); // New custom header
    serverResponse.setHeader("Content-Transfer-Encoding", "binary"); // Explicit encoding

    // Send the generated binary Excel data
    serverResponse.end(generatedExcelOutput, 'binary');
    logApplicationEvent(`Successfully served /report/large-dataset with ${actualRecordCount} records.`);
});

// --- Endpoint for generating a sample Excel report ---
serverApp.get('/report/sample-summary', (clientRequest, serverResponse) => {
    logApplicationEvent(`Request received for /report/sample-summary from client: ${clientRequest.ip}`);

    const summarySettings = {};
    // Optional: reference to an external styling XML file (currently disabled)
    // summarySettings.stylesXmlFile = "styles/custom_report_styles.xml";

    // Define column schemas using the helper function and refactored processors
    summarySettings.columnDefinitions = [
        constructColumnSchema(
            'Item Label',
            'string',
            1,
            18, // Adjusted width
            (currentRow, cellValue) => {
                // Ensure string conversion and uppercase for consistency
                if (typeof cellValue === 'string') {
                    return cellValue.trim().toUpperCase();
                }
                return String(cellValue || '').trim().toUpperCase(); // Handle null/undefined values
            }
        ),
        constructColumnSchema(
            'Event Date',
            'date',
            1,
            22, // Adjusted width
            (() => { // Immediately Invoked Function Expression for date processor setup
                const excelBaseDate = new Date(Date.UTC(1899, 11, 30)); // Excel's epoch
                const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

                return (currentRow, cellValue, cellRenderOptions) => {
                    // Conditional styling logic (commented out as per original example)
                    // if (cellRenderOptions.rowIndex % 2 !== 0) {
                    //     cellRenderOptions.cellStyleRef = 1;
                    // } else {
                    //     cellRenderOptions.cellStyleRef = 2;
                    // }

                    if (cellValue === null || cellValue === undefined) {
                        cellRenderOptions.outputCellType = 'string';
                        return 'Not Applicable'; // More descriptive null handling
                    }

                    let parsedDate;
                    if (cellValue instanceof Date) {
                        parsedDate = cellValue;
                    } else {
                        parsedDate = new Date(cellValue);
                    }

                    if (isNaN(parsedDate.getTime())) {
                        cellRenderOptions.outputCellType = 'string';
                        return 'Invalid Date Format';
                    }

                    // Calculate days since Excel epoch
                    return (parsedDate.getTime() - excelBaseDate.getTime()) / MILLISECONDS_IN_DAY;
                };
            })()
        ),
        constructColumnSchema(
            'Status Active',
            'bool'
        ),
        constructColumnSchema(
            'Quantitative Value',
            'number',
            1,
            32 // Wider column
        ),
        // Add a completely new column to demonstrate structural addition
        constructColumnSchema(
            'Remarks',
            'string',
            1,
            45,
            (currentRow, cellValue) => {
                return (cellValue && cellValue.length > 0) ? `[REMARK]: ${cellValue}` : 'No specific remarks.';
            }
        )
    ];

    // Define sample data rows, with modified existing data and new entries
    summarySettings.rowData = [
        ['Product_A', new Date(Date.UTC(2023, 1, 10, 10, 30)), true, 1.05678, 'Successfully processed'], // Updated date and new time
        ["Service_B", new Date(Date.UTC(2022, 6, 20)), false, 8.91234, 'Pending review'], // Updated date
        ["Component_C", new Date(Date.UTC(2023, 9, 5)), true, 4.56789, 'New release candidate'], // New entry
        ["Module_D", null, true, 6.666, 'Date information missing'], // Null date example
        ["Utility_E", new Date(Date.UTC(2021, 10, 15)), false, 0.0001, 'Deprecated functionality'], // New entry
        ["Feature_F", new Date(Date.UTC(2024, 0, 1)), true, 10.10, 'Future release plan'], // Another new entry
    ];

    let finalReportBuffer;
    try {
        finalReportBuffer = excelGenerator.execute(summarySettings);
    } catch (reportGenError) {
        logApplicationEvent('Failed to generate sample summary Excel report', reportGenError);
        return serverResponse.status(500).send('Error during sample report generation.');
    }

    const requestedReportFileName = clientRequest.query.filename || SAMPLE_REPORT_FILE_NAME;

    // Set response headers for the sample report
    serverResponse.setHeader('Content-Type', EXCEL_MIME_TYPE);
    serverResponse.setHeader("Content-Disposition", `attachment; filename="${requestedReportFileName}"`);
    serverResponse.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0"); // Enhanced caching headers
    serverResponse.setHeader("Pragma", "no-cache");
    serverResponse.setHeader("Expires", "0");

    // Send the generated Excel file
    serverResponse.end(finalReportBuffer, 'binary');
    logApplicationEvent('Successfully sent /report/sample-summary.');
});

// Start the server application
serverApp.listen(SERVER_LISTENING_PORT, () => {
    logApplicationEvent(`Reporting service is now operational on port ${SERVER_LISTENING_PORT}.`);
    logApplicationEvent(`Large data report available at: http://localhost:${SERVER_LISTENING_PORT}/report/large-dataset?records=2000`);
    logApplicationEvent(`Sample summary report available at: http://localhost:${SERVER_LISTENING_PORT}/report/sample-summary`);
});

// --- Graceful shutdown handling (new feature) ---
// Handle termination signals for a cleaner shutdown
process.on('SIGTERM', () => {
    logApplicationEvent('SIGTERM signal received: Initiating server shutdown.');
    // In a real app, you might close database connections, etc.
    process.exit(0);
});

process.on('SIGINT', () => {
    logApplicationEvent('SIGINT signal (Ctrl+C) received: Initiating server shutdown.');
    // In a real app, you might close database connections, etc.
    process.exit(0);
});