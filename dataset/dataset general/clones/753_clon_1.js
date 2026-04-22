/*
 * This file is responsible for fetching fund data from Eastmoney.com
 * and displaying it in a formatted table using `cli-table`.
 * It leverages `request` for HTTP requests, `cheerio` for HTML parsing,
 * `iconv-lite` for character encoding, and `async` for parallel processing.
 */

/* Required external modules */
var request   = require( 'request'   ); // HTTP client for making web requests
var cheerio   = require( 'cheerio'   ); // Fast, flexible & lean implementation of core jQuery for the server
var iconv     = require( 'iconv-lite'); // Convert character encodings
var Table     = require( 'cli-table' ); // Pretty unicode tables for the command line
var async     = require( 'async'     ); // Higher-order functions and common patterns for asynchronous code

/**
 * Main function to fetch and display fund data.
 * @param {object} config - Configuration object containing an array of funds.
 * @param {Array<object>} config.funds - An array of fund objects, each with a 'code' property.
 * @returns {void}
 */
module.exports = function ( config ) {

  // Initialize a new CLI Table instance
  var table = new Table( {
    head: [
      '产品名称'        , // Product Name
      '合作基金'        , // Cooperative Fund
      '发售平台'        , // Issuing Platform
      '7日年化收益率' , // 7-Day Annualized Yield
      '万份收益'        , // Ten Thousand Shares Yield
      '数据日期'          // Data Date
    ]
  } );

  // Array to store the rows of data before adding them to the table
  var rows = [];

  // Use async.forEach to process each fund in parallel
  async.forEach( config.funds, function ( fund, callback ) {

    // Object to hold parsed fund details
    var bao = {
      fundName          : '' ,
      sevenRateReturn   : '' ,
      tenThousandReturn : '' ,
      date              : ''
    };

    // Configuration for the HTTP request
    var options = {
      uri      : "http://fund.eastmoney.com/" + fund.code + ".html", // URL for the fund details page
      encoding : "binary", // Encoding for the response body
      proxy    : this.protocol == 'http'
                 ? process.env.http_proxy
                 : process.env.https_proxy // Proxy settings based on protocol
    };

    // Make the HTTP request
    request( options, function ( error, response, body ) {
      // Check for request errors and a successful HTTP status code (200)
      if ( ! error && response.statusCode == 200 ) {
        // Decode the binary body using 'gbk' encoding and parse it
        parse( iconv.decode( body, 'gbk' ) );

        // Push the extracted data as a new row into the 'rows' array
        rows.push(
          [
            fund.bao              ,
            bao.fundName.trim()   ,
            fund.platform         ,
            bao.sevenRateReturn.trim()   ,
            bao.tenThousandReturn.trim() ,
            bao.date.trim()
          ]
        );

        // Call the callback to signal completion for this fund
        callback();
      }
    } );

    /**
     * Parses the HTML body to extract fund information.
     * @param {string} body - The HTML content of the fund page.
     * @returns {void}
     */
    function parse ( body ) {
      // Load the HTML body into Cheerio for easy DOM manipulation
      $ = cheerio.load( body );

      // Extract fund name
      bao.fundName          = $( "div.bktit_new > a" ) . text();
      // Extract 7-day annualized yield
      bao.sevenRateReturn   = $( "div.bkinfo_new table tr:nth-child(1) td:nth-child(6)" ) . text();
      // Extract ten thousand shares yield and append "元" (Yuan)
      bao.tenThousandReturn = $( "div.bkinfo_new table tr:nth-child(1) td:nth-child(4) span" ) . text() + "元";
      // Extract data date
      bao.date              = $( "div.bkinfo_new table tr:nth-child(1) td:nth-child(2)" ) . text();
    }

  }, function ( error ) {
    // This callback is executed once all funds have been processed

    // Sort the collected rows by the 'ten thousand shares yield' (index 4) in descending order
    rows.sort( function ( a, b ) {
      return parseFloat( b[4] ) - parseFloat( a[4] );
    } );

    // Iterate over the sorted rows and add each one to the CLI table
    rows.forEach( function ( r ) {
      table.push( r );
    } );

    // Print the formatted table to the console
    console.log( table.toString() );

  } );

};