var DocumentGenerator = require('../lib/fluentReports').Report; // Include the report generation library

/**
 * Initiates the process of generating a financial statement document.
 * This function orchestrates data preparation, report layout definition,
 * and final rendering of the PDF output.
 */
function generateFinancialStatement() {
  // Enforce strict parsing and error handling for cleaner code execution
  'use strict';

  // Collection of financial records for various properties and individuals.
  // Each entry represents a unique account statement scenario.
  var accountRecords =
      [ { recordId: '67993bdd-f7d9-48a6-93d9-8026b657041a',
          partyIdentifier: '',
          propertyName: 'Property One Complex',
          geographicalState: '1ab9f74b-d4af-4e88-8216-d2c2329f6318',
          stateAbbreviation: 'TX',
          addressLine1: 'Building 1',
          addressLine2: '123 Nowhere Lane',
          cityLocation: 'Houston',
          postalCode: '77001',
          invoiceNumber: '00125102',
          invoiceIssueDate: '04-16-2012',
          totalOutstanding: '$ 327.10',
          purchaseOrderRef: '',
          currentPeriod: '$ 0.00',
          period30Days: '$ 0.00',
          period60Days: '$ 0.00',
          period90Days: '$ 327.10',
          period120Days: '$ 0.00',
          originalInvoiceDate: '2012-04-16',
          originalBalanceDue: 327.1,
          originalCurrent: 0,
          original30Days: 0,
          original60Days: 0,
          original90Days: 327.1,
          original120Days: 0 },

	{ recordId: '4f4c4782-7ab5-4793-907c-4d0a99e4ef5b',
          propertyName: 'Property Two Block',
          partyIdentifier: 'John Smith',
          stateAbbreviation: 'OK',
          addressLine1: '345 Nowhere Circle',
          addressLine2: '',
          cityLocation: 'Oklahoma City',
          postalCode: '73101-1234',
          invoiceNumber: '00125464',
          invoiceIssueDate: '07-02-2012',
          totalOutstanding: '$ 4,746.05',
          purchaseOrderRef: '1234',
          currentPeriod: '$ 4,746.05',
          period30Days: '$ 0.00',
          period60Days: '$ 0.00',
          period90Days: '$ 0.00',
          period120Days: '$ 0.00',
          originalInvoiceDate: '2012-07-02',
          originalBalanceDue: 4746.05,
          originalCurrent: 4746.05,
          original30Days: 0,
          original60Days: 0,
          original90Days: 0,
          original120Days: 0
   },

    { recordId: '4f4c4782-7ab5-4793-907c-4d0a99e4ef5b',
      propertyName: 'Property Two Block',
      partyIdentifier: 'Jane Doe',
      stateAbbreviation: 'OK',
      addressLine1: '345 Nowhere Circle',
      addressLine2: '',
      cityLocation: 'Oklahoma City',
      postalCode: '73101-1234',
      invoiceNumber: '00125463',
      invoiceIssueDate: '07-02-2012',
      totalOutstanding: '$ 10,945.00',
      purchaseOrderRef: '',
      currentPeriod: '$ 10,945.00',
      period30Days: '$ 0.00',
      period60Days: '$ 0.00',
      period90Days: '$ 0.00',
      period120Days: '$ 0.00',
      originalInvoiceDate: '2012-07-02',
      originalBalanceDue: 10945,
      originalCurrent: 10945,
      original30Days: 0,
      original60Days: 0,
      original90Days: 0,
      original120Days: 0
       },

    { recordId: '4137113f-6828-4365-a8fc-a9096b4e68e7',
      propertyName: 'Property Three Site',
      partyIdentifier: 'James Black',
      geographicalState: '1001379b-3799-4cd5-9f81-8efc12a0ef79',
      stateAbbreviation: 'OK',
      addressLine1: '567 Nowhere Road',
      addressLine2: 'Suite 100', // Added new fragment: an address line
      cityLocation: 'Tulsa',
      postalCode: '74101',
      invoiceNumber: '00125465',
      invoiceIssueDate: '07-02-2012',
      totalOutstanding: '$ 1,050.00',
      purchaseOrderRef: '',
      currentPeriod: '$ 1,050.00',
      period30Days: '$ 0.00',
      period60Days: '$ 0.00',
      period90Days: '$ 0.00',
      period120Days: '$ 0.00',
      originalInvoiceDate: '2012-07-02',
      originalBalanceDue: 1050,
      originalCurrent: 1050,
      original30Days: 0,
      original60Days: 0,
      original90Days: 0,
      original120Days: 0 }
       ];

  /**
   * Renders the client's contact information block on the report.
   * @param {object} doc - The report document instance.
   * @param {object} recordDetails - The current data record.
   */
  var renderClientDetails = function(doc, recordDetails) {
    // Ensure essential data is present before attempting to print.
    if (!recordDetails || !recordDetails.propertyName) {
        return; // Guard clause: skip if no valid data
    }

    const firstAddressLine = recordDetails.addressLine1 || '';
    const secondAddressLine = recordDetails.addressLine2 || '';
    const locationInfo = `${recordDetails.cityLocation}, ${recordDetails.stateAbbreviation} ${recordDetails.postalCode}`;

    doc.print([
      recordDetails.propertyName,
      firstAddressLine,
      secondAddressLine, // Print the added address line, even if empty
      locationInfo
    ], {x: 80, fontBold: true}); // Updated styling for contact info
  };

  /**
   * Constructs and prints a personalized reminder message to the client.
   * @param {object} doc - The report document instance.
   * @param {object} recordDetails - The current data record.
   */
  var composeReminderMessage = function(doc, recordDetails) {
    let recipientName = recordDetails.partyIdentifier;
    if (!recipientName || recipientName.trim() === '') {
        recipientName = 'Our Valued Customer'; // Fallback if no specific person
    }

    // Constructing the message lines
    const reminderLines = [
         `Dear ${recipientName},`,
         '',
         'Our records indicate outstanding invoices or unapplied credits on your account.',
         'This statement serves as a reminder of items yet to be resolved.',
         'For any inquiries or clarifications regarding this statement, please contact our billing department at 555-1212.',
         '',
         'We appreciate your prompt attention to this matter. Thank you.' // Slightly rephrased
    ];

    // Iterate through message lines, printing non-empty ones and new lines for empty ones
    for (let currentLineIdx = 0; currentLineIdx < reminderLines.length; currentLineIdx++) {
      const lineText = reminderLines[currentLineIdx];
      if (lineText) {
          doc.print(lineText, {textColor: 'darkblue', fontItalic: true}); // Changed color and added italic
      } else {
          doc.newLine();
      }
    }
  };

  /**
   * Defines the content and layout for the report's page header.
   * @param {object} doc - The report document instance.
   * @param {object} recordDetails - The current data record.
   */
  var createPageHeader = function(doc, recordDetails) {
    // Only render header for valid data entries
    if(!recordDetails || !recordDetails.recordId) {
        console.warn("Skipping header for invalid record."); // Added a console log for debugging
        return;
    }

    doc.fontSize(8); // Slightly smaller font for date
    const today = new Date();
    // Manual date formatting for 'MM/DD/YYYY'
    const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
    doc.print(`Date Printed: ${formattedDate}`, {align: 'right', x: doc.page.width - doc.margins.right - 100}); // Adjusted X position

    doc.print('CLIENT ACCOUNT OVERVIEW', {fontBold: true, fontSize: 18, align: 'center', y: doc.y + 15}); // Centered title, larger font

    // Render the specific client's details
    renderClientDetails(doc, recordDetails);

    doc.newLine();
    doc.newLine();
    doc.newLine(); // Ensure enough spacing

    // Display the personalized message
    composeReminderMessage(doc, recordDetails);

    doc.newLine(2); // Use newLine with count for brevity

    // Define and print the detail column headers
    doc.fontBold();
    doc.band([
      {label: 'Invoice No.', width: 65},
      {label: 'PO Ref', width: 60}, // Renamed 'Cust PO' to 'PO Ref'
      {label: 'Invoice Date', width: 65},
      {label: 'Current Due', align: 3, width: 60}, // Renamed 'Current'
      {label: '31-60 Days', width: 60, align: 3},
      {label: '61-90 Days', width: 60, align: 3},
      {label: '91-120 Days', width: 65, align: 3},
      {label: '>120 Days', width: 60, align: 3},
      {label: 'Total Balance', width: 60, align: 3} // Renamed 'Total Due'
    ]);
    doc.fontNormal();
    doc.bandLine(); // Draws a line beneath the header band
  };

  /**
   * Outputs a single transaction row in the report's detail section.
   * @param {object} doc - The report document instance.
   * @param {object} recordDetails - The current data record.
   */
  var outputTransactionRow = function(doc, recordDetails) {
    // Detail Body - print each line item
    doc.band([
     {data: recordDetails.invoiceNumber, width: 65, align: 1},
     {data: recordDetails.purchaseOrderRef, width: 60},
     {data: recordDetails.invoiceIssueDate, width: 65},
     {data: recordDetails.currentPeriod, align: 3, width: 60},
     {data: recordDetails.period30Days, width: 60, align: 3},
     {data: recordDetails.period60Days, width: 60, align: 3},
     {data: recordDetails.period90Days, width: 65, align: 3},
     {data: recordDetails.period120Days, width: 60, align: 3},
     {data: recordDetails.totalOutstanding, width: 60, align: 3}
    ], {border: 0, width: 0, padding: [2,0,2,0]}); // Changed border, added padding
  };

  /**
   * Presents the concluding summary and final messages in the report footer.
   * @param {object} doc - The report document instance.
   * @param {object} recordDetails - The current data record.
   */
  var presentConcludingSummary = function(doc, recordDetails) {
    // Ensure the standard footer aligns with the new column names or indices
    doc.standardFooter([
      ['invoiceNumber', 1, 3], // Changed field name
      ['currentPeriod', 4, 3], // Changed field name
      ['period30Days', 5, 3],   // Changed field name
      ['period60Days', 6, 3],   // Changed field name
      ['period90Days', 7, 3],   // Changed field name
      ['period120Days', 8, 3],  // Changed field name
      ['totalOutstanding', 9, 3] // Changed field name
    ]);
    doc.newLine(3); // More new lines
    doc.print('We appreciate your business!', {align: 'center', fontBold: true, fontSize: 10}); // New message, centered
  };

  /**
   * Custom formatter to ensure monetary values are displayed consistently.
   * This is a simplified formatter and might not handle all edge cases.
   * @param {object} dataObject - The object containing data fields.
   * @param {function} completionCallback - Callback to invoke after formatting.
   */
    var currencyValueProcessor = function(dataObject, completionCallback) {
        for (var recordKey in dataObject) {
            // Skip non-numeric or identifier fields
            if (recordKey === 'invoiceNumber' || recordKey.includes('original') || typeof dataObject[recordKey] !== 'number') {
                continue;
            }

            // Ensure the property belongs to the object itself, not prototype chain
            if (Object.prototype.hasOwnProperty.call(dataObject, recordKey)) {
                let numericValue = parseFloat(dataObject[recordKey]);
                if (isNaN(numericValue)) {
                    dataObject[recordKey] = '$ 0.00'; // Default for non-numeric
                } else {
                    // Format to two decimal places and prepend currency symbol
                    dataObject[recordKey] = '$ ' + numericValue.toFixed(2);
                }
            }
        }
        // Invoke the callback with null error and the modified data
        completionCallback(null, dataObject);
    };

  // Define the output file name for the generated PDF document.
  var outputFileName =  "financial_statement.pdf";

  // Initialize the report generator with the output file and data.
  var statementDocument = new DocumentGenerator(outputFileName);

  // Configure the report with data and the custom total formatter.
  statementDocument
      .data(accountRecords)
      .totalFormatter(currencyValueProcessor);

  // Apply various settings and define report sections.
  statementDocument
    .fontsize(9)
    .margins(35) // Slightly adjusted margins
    .detail(outputTransactionRow)
    .groupBy('recordId') // Group by the unique record identifier
    .sum('originalCurrent') // Sum original numerical values
    .sum('original30Days')
    .sum('original60Days')
    .sum('original90Days')
    .sum('original120Days')
    .sum('originalBalanceDue')
    .count('invoiceNumber') // Count the number of invoices per group
    .footer(presentConcludingSummary)
    .header(createPageHeader, {pageBreakBefore: true, y: 15}) // Header with page break, adjusted y
    .pageNumber(true, 'Page {pageNo} of {totalPageNo}', {fontBold: true, align: 'center'}); // Added page numbering

  console.time("DocumentGenerationTime"); // Start timing the rendering process
  statementDocument.render(function(operationError, generatedFileName) {
      console.timeEnd("DocumentGenerationTime"); // End timing

    if (operationError) {
        console.error("An error occurred during report generation:", operationError);
    } else {
        console.log("Report successfully created:", generatedFileName);
    }
  });
}

// Execute the report generation function to start the process.
generateFinancialStatement();