/*
 * This JavaScript code is a Type I clone of an original file.
 *
 * According to the Type I definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * This version introduces extensive changes in indentation, spacing,
 * and comments throughout the entire file, making it visually
 * distinct from the original, but functionally and structurally
 * identical. All identifiers, operators, and expressions are
 * preserved precisely as they were in the original source.
 */

// Import the 'Report' class from the 'fluentReports' library.
var      Report
    = require(
    '../lib/fluentReports' // Specifies the path to the fluentReports module.
)
    .Report
; // Accesses the 'Report' property from the exported module.


/**
 * The primary function responsible for setting up and generating
 * the financial account statement report.
 * It encapsulates all report configuration and data processing logic.
 *
 * @function
 * @name printreport
 * @returns {void}
 */
function
printreport
    (
        // This function does not accept any parameters.
    )
{
    'use strict'
    ; // Enforces strict mode for cleaner code and better error handling.


    // Define the dataset that will be used to populate the report.
    // This array contains multiple customer records, each with detailed
    // account information, including sales, addresses, and balances.
    var
        mydata
        =
        [ // Start of the main data array.
            {
                id: '67993bdd-f7d9-48a6-93d9-8026b657041a', // Unique record identifier.
                person: '',                                // Name of the contact person (empty in this case).
                name: 'Building #1',                       // Name of the property or entity.
                state: '1ab9f74b-d4af-4e88-8216-d2c2329f6318', // Internal state ID.
                'state.abbr': 'TX',                        // State abbreviation for display.
                add1: 'Building 1',                        // Primary address line.
                add2: '123 Nowhere Street',                // Secondary address line.
                city: 'Pittsburg',                         // City of the address.
                zip: '75686',                              // Zip code.
                'sale.no': '00125102',                     // Sales invoice number.
                'sale.invoice_date': '04-16-2012',         // Date of the invoice.
                'sale.balance_due': '$ 327.10',            // Total balance due for this sale.
                'sale.purchase_order': '',                 // Purchase order number (empty).
                current: '$ 0.00',                         // Amount currently due.
                thirty: '$ 0.00',                          // Amount due in the 31-60 day aging category.
                sixty: '$ 0.00',                           // Amount due in the 61-90 day aging category.
                ninety: '$ 327.10',                        // Amount due in the 91-120 day aging category.
                hundredtwenty: '$ 0.00',                   // Amount due in the >120 day aging category.
                'sale.invoice_date_original': '2012-04-16', // Original invoice date for internal calculations.
                'sale.balance_due_original': 327.1,        // Original balance due amount (numeric).
                current_original: 0,                       // Original current amount (numeric).
                thirty_original: 0,                        // Original 31-60 days amount (numeric).
                sixty_original: 0,                         // Original 61-90 days amount (numeric).
                ninety_original: 327.1,                    // Original 91-120 days amount (numeric).
                hundredtwenty_original: 0                  // Original >120 days amount (numeric).
            }, // End of the first data record.


            {
                id: '4f4c4782-7ab5-4793-907c-4d0a99e4ef5b', // Record ID.
                name: 'Building #2',                       // Building name.
                person: 'John Smith',                      // Contact person for this record.

                'state.abbr': 'OK',                        // State abbreviation.
                add1: '345 Nowhere St',                    // Address line 1.
                add2: '',                                  // Address line 2 (empty).
                city: 'Coalgate',                          // City.
                zip: '74538-2844',                         // Zip code.
                'sale.no': '00125464',                     // Sale number.
                'sale.invoice_date': '07-02-2012',         // Invoice date.
                'sale.balance_due': '$ 4,746.05',          // Balance due.
                'sale.purchase_order': '1234',             // Purchase order.
                current: '$ 4,746.05',                     // Current amount.
                thirty: '$ 0.00',                          // 31-60 days.
                sixty: '$ 0.00',                           // 61-90 days.
                ninety: '$ 0.00',                          // 91-120 days.
                hundredtwenty: '$ 0.00',                   // >120 days.
                'sale.invoice_date_original': '2012-07-02', // Original invoice date.
                'sale.balance_due_original': 4746.05,      // Original balance due.
                current_original: 4746.05,                 // Original current amount.
                thirty_original: 0,                        // Original 31-60 days amount.
                sixty_original: 0,                         // Original 61-90 days amount.
                ninety_original: 0,                        // Original 91-120 days amount.
                hundredtwenty_original: 0                  // Original >120 days amount.
            }, // End of the second data record.


            {
                id: '4f4c4782-7ab5-4793-907c-4d0a99e4ef5b', // Another record for Building #2.
                name: 'Building #2',                       // Building name.
                person: 'John White',                      // Different contact person.
                'state.abbr': 'OK',                        // State abbreviation.
                add1: '345 Nowhere St',                    // Address line 1.
                add2: '',                                  // Address line 2 (empty).
                city: 'Coalgate',                          // City.
                zip: '74538-2844',                         // Zip code.
                'sale.no': '00125463',                     // Sale number.
                'sale.invoice_date': '07-02-2012',         // Invoice date.
                'sale.balance_due': '$ 10,945.00',         // Balance due.
                'sale.purchase_order': '',                 // Purchase order (empty).
                current: '$ 10,945.00',                    // Current amount.
                thirty: '$ 0.00',                          // 31-60 days.
                sixty: '$ 0.00',                           // 61-90 days.
                ninety: '$ 0.00',                          // 91-120 days.
                hundredtwenty: '$ 0.00',                   // >120 days.
                'sale.invoice_date_original': '2012-07-02', // Original invoice date.
                'sale.balance_due_original': 10945,        // Original balance due.
                current_original: 10945,                   // Original current amount.
                thirty_original: 0,                        // Original 31-60 days amount.
                sixty_original: 0,                         // Original 61-90 days amount.
                ninety_original: 0,                        // Original 91-120 days amount.
                hundredtwenty_original: 0                  // Original >120 days amount.
            }, // End of the third data record.


            {
                id: '4137113f-6828-4365-a8fc-a9096b4e68e7', // Record ID.
                name: 'Building #3',                       // Building name.
                person: 'James Black',                     // Contact person.
                state: '1001379b-3799-4cd5-9f81-8efc12a0ef79', // Internal state ID.
                'state.abbr': 'OK',                        // State abbreviation.
                add1: '567 Nowhere St',                    // Address line 1.
                add2: '',                                  // Address line 2 (empty).
                city: 'Coalgate',                          // City.
                zip: '74538',                              // Zip code.
                'sale.no': '00125465',                     // Sale number.
                'sale.invoice_date': '07-02-2012',         // Invoice date.
                'sale.balance_due': '$ 1,050.00',          // Balance due.
                'sale.purchase_order': '',                 // Purchase order (empty).
                current: '$ 1,050.00',                     // Current amount.
                thirty: '$ 0.00',                          // 31-60 days.
                sixty: '$ 0.00',                           // 61-90 days.
                ninety: '$ 0.00',                          // 91-120 days.
                hundredtwenty: '$ 0.00',                   // >120 days.
                'sale.invoice_date_original': '2012-07-02', // Original invoice date.
                'sale.balance_due_original': 1050,         // Original balance due.
                current_original: 1050,                    // Original current amount.
                thirty_original: 0,                        // Original 31-60 days amount.
                sixty_original: 0,                         // Original 61-90 days amount.
                ninety_original: 0,                        // Original 91-120 days amount.
                hundredtwenty_original: 0                  // Original >120 days amount.
            } // End of the fourth and final data record.
        ] // End of the 'mydata' array definition.
    ;


    /**
     * Renders contact information for a given data record onto the report.
     * This function is typically called within a header or detail band.
     *
     * @param {object} rpt  - The fluentReports report object.
     * @param {object} data - The data object containing contact details.
     * @returns {void}
     */
    var contactInfo =
        function
            (
                rpt, // The report instance to print on.
                data // The current data row for which to display contact info.
            )
        {
            // scope.funcs.logclient(scope, null, 'info', data); // Original comment from the source.
            rpt
                .print
                (
                    [ // Array of text lines to print.
                        data.name,
                        data.add1,
                        data.add2,
                        [data.city, data['state.abbr'], data.zip].join(' ') // Combines city, state, and zip.
                    ],
                    {x: 80} // Specifies the X-coordinate for printing.
                )
            ;
        }
    ;


    /**
     * Displays a predefined message block on the report,
     * customizing the greeting based on available 'person' data.
     *
     * @param {object} rpt  - The fluentReports report object.
     * @param {object} data - The data object containing person details.
     * @returns {void}
     */
    var message =
        function
            (
                rpt, // The report object.
                data // Current data object to extract person's name.
            )
        {

            // Construct the message array, personalizing the greeting if a person's name is available.
            var msg =
                [
                    'Dear ' + (data.person ? data.person : 'Valued Customer') + ',', // Personalized greeting.
                    '', // An intentional blank line for visual separation.
                    'Our records indicate that you have invoices that have not been paid and are overdue or you have credits that have not been applied.',
                    ' You are receiving this statement as a reminder of invoices or credits that haven\'t been resolved.',
                    ' If you have questions or comments concerning your statement please call 555-1212 and speak to someone in our billing department.',
                    '', // Another blank line.
                    'Thank you in advance for your cooperation in this matter.' // Concluding remark.
                ]
            ;

            // Loop through each line of the message array.
            for
            (
                var i = 0; // Initialize loop counter.
                i < msg.length; // Loop condition.
                i++ // Increment counter.
            )
            {
                // If a message line is not empty, print it in blue text.
                if
                (
                    msg[i]
                )
                {
                    rpt
                        .print
                        (
                            msg[i],
                            {textColor: 'blue'}
                        )
                    ;
                }
                else
                {
                    // If the message line is empty, print a new line for spacing.
                    rpt
                        .newLine
                        (
                            // No arguments for newLine method.
                        )
                    ;
                }
            }
        }
    ;


    /**
     * Defines the header content for each page of the report.
     * This includes company info, date, report title, contact details,
     * a custom message, and the detail table header.
     *
     * @param {object} rpt  - The fluentReports report object.
     * @param {object} data - The current group header data (e.g., customer details).
     * @returns {void}
     */
    var header =
        function
            (
                rpt, // The report instance.
                data // Data relevant to the current group/page header.
            )
        {
            // Prevent header from rendering if there's no valid ID,
            // which implies no specific customer data for this group.
            if
            (
                !data.id
            )
            {
                return
                    ; // Exit the function early.
            }

            // Company Info - Top Left (original comment)
            // rpt.setCurrentY(14); // Original commented-out line.

            // Date Printed - Rendered on the top right.
            rpt
                .fontSize
                (
                    9
                )
            ; // Set font size for the date.
            rpt
                .print
                (
                    new Date().toString('MM/dd/yyyy') // Formats the current date.
                )
            ; // , {y: 30, align: 'right'}); // Original commented-out alignment option.
            // rpt.setCurrentY(125); // Original commented-out line.

            // Report Title - Displayed prominently.
            rpt
                .print
                (
                    'ACCOUNT STATEMENT', // The main title of the report.
                    {
                        fontBold: true,    // Make the title bold.
                        fontSize: 16,      // Set a larger font size for the title.
                        align: 'right'     // Align the title to the right side of the page.
                    }
                )
            ;

            // Render the contact information block using the dedicated helper function.
            contactInfo
            (
                rpt,
                data
            )
            ;

            // Add multiple new lines for vertical spacing after the contact information.
            rpt.newline();
            rpt.newline();
            rpt.newline();

            // Render the custom message block using the dedicated helper function.
            message
            (
                rpt,
                data
            )
            ;

            // Add more new lines for vertical spacing after the message.
            rpt.newline();
            rpt.newline();
            rpt.newline();

            // Detail Header - Defines the column headers for the data table.
            rpt.fontBold(); // Set font to bold for the column headers.
            rpt
                .band
                (
                    [ // Array defining each column's data and styling.
                        {data: 'Invoice #', width: 60},
                        {data: 'Cust PO'},
                        {data: 'Invoice Date', width: 60},
                        {data: 'Current', align: 3, width: 60},
                        {data: '31-60 Days', width: 60, align: 3},
                        {data: '61-90 Days', width: 60, align: 3},
                        {data: '91-120 Days', width: 65, align: 3},
                        {data: '>120 Days', width: 60, align: 3},
                        {data: 'Total Due', width: 60, align: 3}
                    ]
                )
            ;
            rpt.fontNormal(); // Revert font to normal after the header band.
            rpt.bandLine();   // Draw a horizontal line below the detail header for separation.
        }
    ;


    /**
     * Defines the detail band, which renders each individual data row
     * in the main body of the report.
     *
     * @param {object} rpt  - The fluentReports report object.
     * @param {object} data - The current detail data record to be rendered.
     * @returns {void}
     */
    var detail =
        function
            (
                rpt, // The report instance.
                data // The individual data record for the current detail row.
            )
        {
            // Detail Body - Prints the actual data for each invoice/sale record.
            rpt
                .band
                (
                    [ // Array defining the data fields and their display properties.
                        {data: data.sale.no, width: 60, align: 1},             // Invoice number.
                        {data: data.sale.purchase_order},                       // Customer purchase order.
                        {data: data.sale.invoice_date, width: 60},              // Invoice date.
                        {data: data.current, align: 3, width: 60},              // Current amount due.
                        {data: data.thirty, width: 60, align: 3},               // Amount due 31-60 days.
                        {data: data.sixty, width: 60, align: 3},                // Amount due 61-90 days.
                        {data: data.ninety, width: 65, align: 3},               // Amount due 91-120 days.
                        {data: data.hundredtwenty, width: 60, align: 3},        // Amount due >120 days.
                        {data: data.sale.balance_due, width: 60, align: 3}      // Total balance due.
                    ],
                    {border: 1, width: 0} // Styling for the band: border enabled, but border width is 0 (invisible).
                )
            ;
        }
    ;


    /**
     * Defines the final summary footer section of the report.
     * This typically includes aggregated totals and a concluding message.
     *
     * @param {object} rpt  - The fluentReports report object.
     * @param {object} data - The aggregated data passed to the footer (e.g., sums).
     * @returns {void}
     */
    var finalSummary =
        function
            (
                rpt, // The report instance.
                data // Aggregated data (e.g., group sums) for the footer.
            )
        {
            // Use the standardFooter method to display calculated totals for specified fields.
            rpt
                .standardFooter
                (
                    [ // Array specifying the fields to sum and their display properties.
                        ['sale.no', 1, 3],          // Column for count of sale.no.
                        ['current', 4, 3],          // Sum of 'current' amounts, align right in column 4.
                        ['thirty', 5, 3],           // Sum of 'thirty' amounts, align right in column 5.
                        ['sixty', 6, 3],            // Sum of 'sixty' amounts, align right in column 6.
                        ['ninety', 7, 3],           // Sum of 'ninety' amounts, align right in column 7.
                        ['hundredtwenty', 8, 3],    // Sum of 'hundredtwenty' amounts, align right in column 8.
                        ['sale.balance_due', 9, 3]  // Sum of 'sale.balance_due', align right in column 9.
                    ]
                )
            ;
            // Add blank lines for visual separation before the final message.
            rpt.newline();
            rpt.newline();
            // Print a concluding "Thank You" message, aligned to the right.
            rpt
                .print
                (
                    'Thank You for Choosing us!',
                    {align: 'right'}
                )
            ;
        }
    ;


    /**
     * A custom formatter function designed to format monetary values.
     * It prepends a '$ ' to the value and ensures it has two decimal places.
     * This formatter is applied to total fields.
     *
     * @param {object} data     - The data object containing values to be formatted.
     * @param {function} callback - The callback to invoke once formatting is complete.
     * @returns {void}
     */
    var totalFormatter =
        function
            (
                data,     // The object whose properties need monetary formatting.
                callback  // The callback function to execute after formatting.
            )
        {
            // Iterate over each key (property name) in the provided data object.
            for
            (
                var key in data
            )
            {
                // Skip formatting for 'sale.no' as it is an identifier, not a monetary value.
                if
                (
                    key === 'sale.no'
                )
                {
                    continue
                        ; // Move to the next property.
                }
                // Ensure the property is directly on the data object itself, not inherited.
                if
                (
                    data.hasOwnProperty(key)
                )
                {
                    // Simple Stupid Money formatter. It is really dumb. ;-) (original comment)
                    // Prepend the dollar sign and a space to the value.
                    data[key] = '$ ' + data[key];
                    var idx = data[key].indexOf('.'); // Find the position of the decimal point.
                    if
                    (
                        idx < 0 // If no decimal point is found.
                    )
                    {
                        data[key] += '.00'
                            ; // Append '.00' to represent zero cents.
                    }
                    else if
                    (
                        idx < data[key].length - 1 // If decimal exists but there's only one digit after it.
                    )
                    {
                        data[key] += '0'
                            ; // Append a '0' to ensure two decimal places.
                    }
                }
            }

            // Call the provided callback function, indicating no error (null)
            // and passing the formatted data object.
            callback
            (
                null,
                data
            )
            ;
        }
    ;


    // Optional -- If you don't pass a report name, it will default to "report.pdf" (original comment)
    // Define the desired file name for the generated PDF report.
    var rptName = "demo2.pdf";


    // Instantiate a new Report object.
    // Chain initial configurations: set the data source and the total formatter.
    var resultReport =
        new Report
        (
            rptName
        ) // Initialize the report with a name.
            .data
            (
                mydata
            ) // Assign the data array to the report.
            .totalFormatter
            (
                totalFormatter
            ) // Apply the custom formatter for totals.
    ;


    // You can Chain these directly after .data() or as I have shown below;
    // use the resultReport variable and chain the report commands off of it.
    // Your choice. (original comment)

    // Further configure the report by chaining various settings and band definitions.
    resultReport

        .fontsize(9) // Set the default font size for the entire report.

        .margins(40) // Define the page margins (e.g., 40 units from all sides).

        .detail(detail) // Assign the 'detail' function to render individual data rows.

        .groupBy('id') // Group the report data by the 'id' field, which will trigger group headers/footers.

        .sum('current') // Calculate and display the sum of the 'current' field for each group.

        .sum('thirty') // Calculate and display the sum of the 'thirty' field.

        .sum('sixty') // Calculate and display the sum of the 'sixty' field.

        .sum('ninety') // Calculate and display the sum of the 'ninety' field.

        .sum('hundredtwenty') // Calculate and display the sum of the 'hundredtwenty' field.

        .sum('sale.balance_due') // Calculate and display the sum of the 'sale.balance_due' field.

        .count('sale.no') // Count the number of 'sale.no' entries for each group.

        .footer(finalSummary) // Assign the 'finalSummary' function as the report's footer.

        .header
        (
            header, // Assign the 'header' function to render the page/group headers.
            {
                pageBreakBefore: true // Ensure a new page starts before each group header.
            }
        )
    ; // End of the report configuration chain.


    // Hey, everyone needs to debug things occasionally --
    // creates debug output so that you can see how the report is built. (original comment)
    // Print the internal structure of the report to the console for debugging purposes.
    resultReport
        .printStructure
        (
            // This method does not require any arguments.
        )
    ;


    // Start a timer to measure the duration of the report rendering process.
    console.time("Rendered");
    // Render the report to its final output format (e.g., PDF).
    resultReport
        .render
        (
            function
                (
                    err,  // The error object, if any error occurred during rendering.
                    name  // The name of the generated report file.
                )
            {
                // Stop the timer and log the rendering duration.
                console.timeEnd("Rendered");
                // Check if an error occurred during the rendering process.
                if
                (
                    err
                )
                {
                    // Log the error message to the console.
                    console.error("Error was", err)
                        ;
                }
                else
                {
                    // If rendering was successful, log the name of the output file.
                    console.log("Report is named:", name)
                        ;
                }
            }
        )
    ; // Concludes the report rendering call.

} // End of the 'printreport' function definition.


// Execute the main report generation function to initiate the process.
printreport
(
    // No arguments are passed when calling printreport.
)
;