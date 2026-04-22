const httpRequest = require('request');
const domParser = require('cheerio');
const charsetConverter = require('iconv-lite');
const ConsoleTable = require('cli-table');
const asyncOps = require('async');

/**
 * Initiates the process of gathering and displaying financial fund performance data.
 * It fetches details for each fund specified in the configuration, parses the information,
 * sorts it, and outputs a formatted table to the console.
 *
 * @param {object} settingsBundle - A configuration object containing parameters for the data retrieval.
 * @param {Array<object>} settingsBundle.funds - An array where each object represents a fund
 *   and must include 'code' (fund identifier), 'bao' (associated financial product),
 *   and 'platform' (sales channel).
 */
module.exports = function retrieveAndDisplayFundMetrics(settingsBundle) {

    // Pre-flight check: Ensure valid configuration is provided to avoid runtime errors.
    if (!settingsBundle || !Array.isArray(settingsBundle.funds) || settingsBundle.funds.length === 0) {
        console.error('Error: Fund processing aborted. Invalid or empty fund configuration bundle received.');
        // Optionally, throw an error instead of just returning.
        return;
    }

    // Define column headers for the output table. These are more descriptive than original.
    const displayHeaders = [
        'Product Name',           // Original: '产品名称'
        'Affiliate Fund',         // Original: '合作基金'
        'Distribution Channel',   // Original: '发售平台'
        'Weekly Yield (%)',       // Original: '7日年化收益率'
        '10k Unit Income (¥)',    // Original: '万份收益'
        'Observation Date'        // Original: '数据日期'
    ];

    // Instantiate the console table with custom styling for better readability.
    const resultDisplayTable = new ConsoleTable({
        head: displayHeaders,
        colWidths: [30, 20, 20, 15, 18, 15], // Set approximate column widths
        chars: {
            'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
            'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
            'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
            'right': '║', 'right-mid': '╢', 'middle': '│'
        },
        style: {
            'header': ['yellow', 'bold'], // Header row styling
            'border': ['dim']             // Border styling
        }
    });

    // A temporary collection to hold all parsed fund data before sorting and displaying.
    const parsedFundRecords = [];

    // Utilize async.each for parallel processing of fund data fetches.
    // This improves efficiency by not waiting for one request to complete before starting the next.
    asyncOps.each(settingsBundle.funds, (currentFundItem, completionCallback) => {

        // Object to store the extracted details for the current fund.
        // Properties are renamed for clarity and consistency.
        const acquiredMetrics = {
            productName: '',
            sevenDayAnnualizedRate: '',
            incomePerTenThousandUnits: '',
            observationTimestamp: ''
        };

        // Construct the full URL for the fund's detail page.
        const fundDetailPageUrl = `http://fund.eastmoney.com/${currentFundItem.code}.html`;

        // Configure the HTTP request with specific options.
        const httpFetchOptions = {
            uri: fundDetailPageUrl,
            encoding: 'binary', // Crucial for correct decoding of GBK content.
            // Mimic a web browser to avoid potential server-side blocking.
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.54',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache'
            },
            timeout: 20000 // Set a generous timeout (20 seconds) for the request.
        };

        // Execute the HTTP request.
        httpRequest(httpFetchOptions, (networkError, serverResponse, rawPageBody) => {
            // Comprehensive error checking: network issues, missing response, or non-200 status.
            if (networkError || !serverResponse || serverResponse.statusCode !== 200) {
                console.error(
                    `Failed to retrieve data for fund code [${currentFundItem.code}] from [${fundDetailPageUrl}]: ` +
                    (networkError ? networkError.message : `HTTP Status: ${serverResponse ? serverResponse.statusCode : 'N/A'}`)
                );
                // Important: call the callback to allow async.each to proceed to the next item.
                return completionCallback();
            }

            // Decode the fetched binary HTML content from GBK to UTF-8 for proper parsing.
            const utf8DecodedHtml = charsetConverter.decode(rawPageBody, 'gbk');

            /**
             * Internal helper function to parse the HTML document and extract specific financial metrics.
             * @param {string} htmlContent - The UTF-8 decoded HTML string.
             */
            const parseHtmlForMetrics = (htmlContent) => {
                // Load the HTML content into Cheerio for jQuery-like DOM manipulation.
                const domHandle = domParser.load(htmlContent);

                // Guard against empty or invalid DOM content.
                if (!domHandle || domHandle.length === 0) {
                    console.warn(`Warning: DOM parsing yielded no content for fund [${currentFundItem.code}].`);
                    return;
                }

                // Extract fund's product name.
                acquiredMetrics.productName = domHandle("div.bktit_new > a").text().trim();

                // Extract 7-day annualized yield.
                const yieldLocator = "div.bkinfo_new table tr:nth-child(1) td:nth-child(6)";
                acquiredMetrics.sevenDayAnnualizedRate = domHandle(yieldLocator).text().trim();

                // Extract income per 10,000 units, ensuring '元' currency symbol is appended.
                const incomeLocator = "div.bkinfo_new table tr:nth-child(1) td:nth-child(4) span";
                const rawIncomeValue = domHandle(incomeLocator).text().trim();
                acquiredMetrics.incomePerTenThousandUnits = rawIncomeValue ? `${rawIncomeValue}元` : 'N/A';

                // Extract the date when the data was last updated.
                const dateLocator = "div.bkinfo_new table tr:nth-child(1) td:nth-child(2)";
                acquiredMetrics.observationTimestamp = domHandle(dateLocator).text().trim();
            };

            // Invoke the parsing function with the decoded HTML.
            parseHtmlForMetrics(utf8DecodedHtml);

            // Assemble the extracted data into a row format suitable for the console table.
            // Ensure all fields are trimmed to remove leading/trailing whitespace.
            parsedFundRecords.push([
                acquiredMetrics.productName,
                currentFundItem.bao, // Original '合作基金'
                currentFundItem.platform, // Original '发售平台'
                acquiredMetrics.sevenDayAnnualizedRate,
                acquiredMetrics.incomePerTenThousandUnits,
                acquiredMetrics.observationTimestamp
            ]);

            // Signal to async.each that this fund's processing is complete.
            completionCallback();

        }); // End of httpRequest callback

    }, (overallProcessingError) => { // Final callback executed after all funds are processed.

        if (overallProcessingError) {
            console.error('A critical error occurred during the overall asynchronous fund processing:', overallProcessingError.message);
            // Even if an error occurred, we might still have partial data to display.
        }

        // --- Data Post-Processing and Output ---

        // Sort the collected records. The primary sorting key is 'incomePerTenThousandUnits' (index 4),
        // in descending order (highest income first).
        parsedFundRecords.sort((recordA, recordB) => {
            // Extract numeric part by removing '元' and convert to float. Default to 0 for invalid values.
            const valA = parseFloat(recordA[4].replace('元', '')) || 0;
            const valB = parseFloat(recordB[4].replace('元', '')) || 0;
            return valB - valA; // Descending sort.
        });

        // Add each sorted record as a row to the console table.
        for (const recordRow of parsedFundRecords) {
            resultDisplayTable.push(recordRow);
        }

        // Print a header for the report.
        console.log('\n======================================================');
        console.log('         Financial Fund Performance Overview          ');
        console.log('======================================================\n');

        // Render and display the complete formatted table to the console.
        console.log(resultDisplayTable.toString());

        // Print a footer for the report.
        console.log('\n======================================================\n');
        console.info(`Report generated on: ${new Date().toLocaleString()}`);

    }); // End of asyncOps.each

}; // End of module.exports function