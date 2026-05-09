const DocumentGenerator = acquireModule('../modules/documentService').Generator;

/**
 * Initiates the document creation process.
 * @function
 * @returns {void}
 */
function produceStatement() {
  'use strict'; // Enforce stricter parsing and error handling for better code quality.

  // Sample financial transaction entries for the report.
  let clientRecords =
    [
      {
        id: '67993bdd-f7d9-48a6-93d9-8026b657041a', // Unique identifier for the client entry.
        person: '', // Name of the associated person, if any.
        name: 'Building #1', // Name of the property or location.
        state: '1ab9f74b-d4af-4e88-8216-d2c2329f6318', // Internal status ID.
        'state.abbr': 'TX', // Abbreviation for the state.
        add1: 'Building 1', // First line of the address.
        add2: '123 Nowhere Street', // Second line of the address.
        city: 'Pittsburg', // City name.
        zip: '75686', // Zip code.
        'sale.no': '00125102', // Invoice number.
        'sale.invoice_date': '04-16-2012', // Invoice date.
        'sale.balance_due': '$ 327.10', // Total balance due for this sale.
        'sale.purchase_order': '', // Purchase order number.
        current: '$ 0.00', // Current amount due.
        thirty: '$ 0.00', // Amount overdue by 30-60 days.
        sixty: '$ 0.00', // Amount overdue by 61-90 days.
        ninety: '$ 327.10', // Amount overdue by 91-120 days.
        hundredtwenty: '$ 0.00', // Amount overdue by more than 120 days.
        'sale.invoice_date_original': '2012-04-16', // Original invoice date for calculations.
        'sale.balance_due_original': 327.1, // Original numerical balance due.
        current_original: 0, // Original numerical current amount.
        thirty_original: 0, // Original numerical 30-day amount.
        sixty_original: 0, // Original numerical 60-day amount.
        ninety_original: 327.1, // Original numerical 90-day amount.
        hundredtwenty_original: 0 // Original numerical 120-day amount.
      },

      {
        id: '4f4c4782-7ab5-4793-907c-4d0a99e4ef5b',
        name: 'Building #2',
        person: 'John Smith',
        'state.abbr': 'OK',
        add1: '345 Nowhere St',
        add2: '',
        city: 'Coalgate',
        zip: '74538-2844',
        'sale.no': '00125464',
        'sale.invoice_date': '07-02-2012',
        'sale.balance_due': '$ 4,746.05',
        'sale.purchase_order': '1234',
        current: '$ 4,746.05',
        thirty: '$ 0.00',
        sixty: '$ 0.00',
        ninety: '$ 0.00',
        hundredtwenty: '$ 0.00',
        'sale.invoice_date_original': '2012-07-02',
        'sale.balance_due_original': 4746.05,
        current_original: 4746.05,
        thirty_original: 0,
        sixty_original: 0,
        ninety_original: 0,
        hundredtwenty_original: 0
      },

      {
        id: '4f4c4782-7ab5-4793-907c-4d0a99e4ef5b',
        name: 'Building #2',
        person: 'John White',
        'state.abbr': 'OK',
        add1: '345 Nowhere St',
        add2: '',
        city: 'Coalgate',
        zip: '74538-2844',
        'sale.no': '00125463',
        'sale.invoice_date': '07-02-2012',
        'sale.balance_due': '$ 10,945.00',
        'sale.purchase_order': '',
        current: '$ 10,945.00',
        thirty: '$ 0.00',
        sixty: '$ 0.00',
        ninety: '$ 0.00',
        hundredtwenty: '$ 0.00',
        'sale.invoice_date_original': '2012-07-02',
        'sale.balance_due_original': 10945,
        current_original: 10945,
        thirty_original: 0,
        sixty_original: 0,
        ninety_original: 0,
        hundredtwenty_original: 0
      },

      {
        id: '4137113f-6828-4365-a8fc-a9096b4e68e7',
        name: 'Building #3',
        person: 'James Black',
        state: '1001379b-3799-4cd5-9f81-8efc12a0ef79',
        'state.abbr': 'OK',
        add1: '567 Nowhere St',
        add2: '',
        city: 'Coalgate',
        zip: '74538',
        'sale.no': '00125465',
        'sale.invoice_date': '07-02-2012',
        'sale.balance_due': '$ 1,050.00',
        'sale.purchase_order': '',
        current: '$ 1,050.00',
        thirty: '$ 0.00',
        sixty: '$ 0.00',
        ninety: '$ 0.00',
        hundredtwenty: '$ 0.00',
        'sale.invoice_date_original': '2012-07-02',
        'sale.balance_due_original': 1050,
        current_original: 1050,
        thirty_original: 0,
        sixty_original: 0,
        ninety_original: 0,
        hundredtwenty_original: 0
      }
    ];



  /**
   * Renders the contact information block on the report.
   * @param {object} docGen - The report generator instance.
   * @param {object} recordEntry - The current data record.
   * @returns {void}
   */
  const displayContactDetails = function(docGen, recordEntry) {
    // This function can be uncommented for debugging client data flow.
    // scope.funcs.logclient(scope, null, 'info', recordEntry);
    docGen.print(
      [
        recordEntry.name,
        recordEntry.add1,
        recordEntry.add2,
        [recordEntry.city, recordEntry['state.abbr'], recordEntry.zip].join(' ')
      ],
      { xOffset: 80 } // Position the contact block 80 units from the left margin.
    );
  };

  /**
   * Composes and prints a custom message for the client.
   * @param {object} docGen - The report generator instance.
   * @param {object} recordEntry - The current data record.
   * @returns {void}
   */
  const composeWelcomeMessage = function(docGen, recordEntry) {

    // Construct the personalized message based on client data.
    const textLines = [
      `Dear ${recordEntry.person ? recordEntry.person : 'Valued Customer'},`,
      '',
      'Our records indicate that you have invoices that have not been paid and are overdue or you have credits that have not been applied.',
      ' You are receiving this statement as a reminder of invoices or credits that haven\'t been resolved.',
      ' If you have questions or comments concerning your statement please call 555-1212 and speak to someone in our billing department.',
      '',
      'Thank you in advance for your cooperation in this matter.'
    ];

    // Iterate through message lines and print them, handling empty lines for spacing.
    for (let lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
      if (textLines[lineIndex]) {
        docGen.print(textLines[lineIndex], { fontColor: 'navy' }); // Print non-empty lines in navy blue.
      } else {
        docGen.newLine(); // Add a new line for spacing.
      }
    }
  };

  /**
   * Generates the header section for each page of the report.
   * @param {object} docGen - The report generator instance.
   * @param {object} recordEntry - The current data record.
   * @returns {void}
   */
  const generatePageHeader = function(docGen, recordEntry) {
    // Skip header generation if there's no valid record ID.
    if (!recordEntry.id) { return; }

    // Set font size for the date.
    docGen.setFontSize(9);
    // Display the current date at the top right.
    docGen.print(new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }));

    // Output the main report title.
    docGen.print('ACCOUNT STATEMENT', { isBold: true, textSize: 16, alignment: 'right' });

    // Include client contact information.
    displayContactDetails(docGen, recordEntry);

    // Add multiple new lines for visual separation.
    docGen.newLine();
    docGen.newLine();
    docGen.newLine();

    // Insert the introductory message.
    composeWelcomeMessage(docGen, recordEntry);

    // Add more new lines for further separation before the detail section.
    docGen.newLine();
    docGen.newLine();
    docGen.newLine();

    // Set font to bold for the detail section header.
    docGen.setFontBold();
    // Define and print the column headers for the financial details.
    docGen.band([
      { label: 'Invoice #', size: 60 },
      { label: 'Cust PO' },
      { label: 'Invoice Date', size: 60 },
      { label: 'Current', textAlignment: 3, size: 60 },
      { label: '31-60 Days', size: 60, textAlignment: 3 },
      { label: '61-90 Days', size: 60, textAlignment: 3 },
      { label: '91-120 Days', size: 65, textAlignment: 3 },
      { label: '>120 Days', size: 60, textAlignment: 3 },
      { label: 'Total Due', size: 60, textAlignment: 3 }
    ]);
    // Reset font to normal after the header.
    docGen.setFontNormal();
    // Draw a line to separate the header from the detail rows.
    docGen.drawSeparator();
  };

  /**
   * Renders a single detail row for an invoice entry.
   * @param {object} docGen - The report generator instance.
   * @param {object} recordEntry - The current data record representing an invoice.
   * @returns {void}
   */
  const outputDetailRow = function(docGen, recordEntry) {
    // Output the financial details for a single invoice.
    docGen.band(
      [
        { data: recordEntry['sale.no'], size: 60, textAlignment: 1 },
        { data: recordEntry['sale.purchase_order'] },
        { data: recordEntry['sale.invoice_date'], size: 60 },
        { data: recordEntry.current, textAlignment: 3, size: 60 },
        { data: recordEntry.thirty, size: 60, textAlignment: 3 },
        { data: recordEntry.sixty, size: 60, textAlignment: 3 },
        { data: recordEntry.ninety, size: 65, textAlignment: 3 },
        { data: recordEntry.hundredtwenty, size: 60, textAlignment: 3 },
        { data: recordEntry['sale.balance_due'], size: 60, textAlignment: 3 }
      ],
      { outline: 1, outlineWidth: 0 } // Apply a subtle border to the band.
    );
  };

  /**
   * Presents the final summary totals at the end of the report.
   * @param {object} docGen - The report generator instance.
   * @param {object} recordEntry - The current data record (used for context, but totals are often aggregated).
   * @returns {void}
   */
  const presentFinalTotals = function(docGen, recordEntry) {

    // Render the standard footer with aggregated totals.
    docGen.layoutStandardFooter(
      [
        ['sale.no', 1, 3], // Invoice number column, position 1, alignment 3 (right).
        ['current', 4, 3], // Current amount column.
        ['thirty', 5, 3],  // 30-day amount column.
        ['sixty', 6, 3],   // 60-day amount column.
        ['ninety', 7, 3],  // 90-day amount column.
        ['hundredtwenty', 8, 3], // 120-day amount column.
        ['sale.balance_due', 9, 3] // Total balance due column.
      ]
    );
    // Add spacing after the footer.
    docGen.newLine();
    docGen.newLine();
    // Print a concluding message.
    docGen.print('Thank You for Choosing our Services!', { alignment: 'right' });
  };

  /**
   * Custom formatter for monetary values, adding dollar signs and padding decimals.
   * @param {object} inputValues - The data object containing values to format.
   * @param {Function} completionHandler - Callback function to invoke after formatting.
   * @returns {void}
   */
  const formatMonetaryValues = function(inputValues, completionHandler) {
    // Iterate through each property in the input data.
    for (const propName in inputValues) {
      // Skip formatting for the invoice number as it's not a monetary value.
      if (propName === 'sale.no') { continue; }
      // Ensure the property belongs to the object itself, not its prototype chain.
      if (inputValues.hasOwnProperty(propName)) {
        // A very basic and simplified currency formatter.
        inputValues[propName] = '$ ' + inputValues[propName];
        let decimalPointIndex = inputValues[propName].indexOf('.');
        if (decimalPointIndex < 0) {
          inputValues[propName] += '.00'; // Add .00 if no decimal found.
        } else if (decimalPointIndex === inputValues[propName].length - 2) {
          inputValues[propName] += '0'; // Add a trailing zero if only one decimal place exists.
        }
      }
    }

    // Invoke the callback with the formatted data.
    completionHandler(null, inputValues);
  };


  // Define the name of the output PDF file.
  const documentOutputName = "statement_report.pdf";


  // Initialize the document generator with the output file name and data.
  const generatedStatement = new DocumentGenerator(documentOutputName)
    .sourceData(clientRecords)
    .valueFormatter(formatMonetaryValues);


  // Configure various report settings and sections.
  generatedStatement
    .setTextSize(9) // Set default font size.
    .setPageMargins(40) // Set page margins in points.
    .setDetailSection(outputDetailRow) // Assign the detail section rendering function.
    .groupDataById('id') // Group records by their 'id' field.
    .aggregateSum('current') // Calculate sum of 'current' field for each group.
    .aggregateSum('thirty') // Calculate sum of 'thirty' field.
    .aggregateSum('sixty') // Calculate sum of 'sixty' field.
    .aggregateSum('ninety') // Calculate sum of 'ninety' field.
    .aggregateSum('hundredtwenty') // Calculate sum of 'hundredtwenty' field.
    .aggregateSum('sale.balance_due') // Calculate sum of 'sale.balance_due' field.
    .countEntries('sale.no') // Count occurrences of 'sale.no' for each group.
    .setPageFooter(presentFinalTotals) // Assign the footer rendering function.
    .setPageHeader(generatePageHeader, { startNewPage: true }); // Assign the header rendering function with page break.

  // Enable debug output to inspect the report's internal structure.
  generatedStatement.outputStructureDebug();


  // Start timing the document generation process.
  console.time("DocumentGenerationTime");
  generatedStatement.generate(function(errorStatus, resultName) {
    // End timing the process.
    console.timeEnd("DocumentGenerationTime");
    // Check for any errors during generation.
    if (errorStatus) {
      console.error("An error occurred during generation:", errorStatus);
    } else {
      console.log("Generated document path:", resultName);
    }
  });

} // End of produceStatement function.


// Execute the document generation process.
produceStatement();