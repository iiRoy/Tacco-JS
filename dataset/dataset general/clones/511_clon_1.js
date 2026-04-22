/*
 * This file contains a script for logging into Amazon and retrieving
 * Kindle content information using PhantomJS.
 * It demonstrates web scraping and asynchronous operations.
 */

// Core PhantomJS modules required for system interaction and web page manipulation.
 var system  =  require('system')  ;
 var webpage =  require('webpage') ;


// Configuration settings for the Amazon login process.
// These include URLs, form element IDs, and user credentials.
 var loginSettings = {

  url         : "https://www.amazon.com/ap/signin",  // The URL for the Amazon login page.

  emailId     : "ap_email",                           // ID of the email input field.

  passwordId  : "ap_password",                        // ID of the password input field.

  formId      : "ap_signin_form",                     // ID of the login form itself.

  username    : system.args[1],                       // Username (email) passed as a command-line argument.

  password    : system.args[2]                        // Password passed as a command-line argument.

} ;


// API endpoints used for navigating and fetching data from Amazon Kindle.
 var api = {

  homepage    : "http://read.amazon.com",                                      // The main Kindle Cloud Reader homepage.

  ownedContent: "https://read.amazon.com/service/web/reader/getOwnedContent",  // Endpoint to fetch owned content list.

  startReading: "https://read.amazon.com/service/web/reader/startReading?clientVersion=10505419&asin=" // Endpoint to start reading a specific book.

} ;


// User-Agent string to mimic a specific browser, which can be important for site compatibility.
 var ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2" ;


/**
 * Performs the login operation on Amazon.
 *
 * @param {object} settings - An object containing login URL, element IDs, and credentials.
 * @param {function} callback - A callback function to be executed upon successful login and header capture.
 */
 function login ( settings , callback ) {

    // Create a new web page instance.
    var page = webpage.create() ;

    // Set the user agent for the page instance.
    page.settings.userAgent = ua ;


    // This function is called once the page has finished loading.
    page.onLoadFinished = function ( ) {

        // Check if the current URL is the login page to proceed with form submission.
        if ( page.url.indexOf ( settings.url ) == 0 ) {

            // Execute client-side JavaScript within the page's context.
            page.evaluate ( function ( settings ) {

                // Fill in the email field.
                document.getElementById ( settings.emailId ) .value = settings.username ;

                // Fill in the password field.
                document.getElementById ( settings.passwordId ) .value = settings.password ;

                // Submit the login form.
                document.getElementById ( settings.formId ) .submit ( ) ;

            } , settings ) ; // Pass settings object to the evaluate function.

        }

    } ;


    // This function is called for every resource requested by the page.
    page.onResourceRequested = function ( requestData ) {

        // Log the URL of the requested resource to standard error.
        system.stderr.writeLine ( "Requesting: " + requestData.url ) ;

        // If the requested URL matches the ownedContent API, it means we've successfully logged in
        // and are about to fetch the content list.
        if ( requestData.url.indexOf ( api.ownedContent ) == 0 ) {

            // Close the current page as we've captured what we need.
            page.close ( ) ;

            // Extract custom headers from the request.
            var customHeaders = { } ;
            requestData.headers.forEach ( function ( h ) { customHeaders [ h.name ] = h.value } ) ;

            // Invoke the callback with the captured headers.
            callback ( customHeaders ) ;

        }

    } ;


    // Open the Amazon Kindle homepage to initiate the login process.
    page.open ( api.homepage ) ;

} ;


// Start the login process with the defined settings.
login ( loginSettings , function ( headers ) {

  // Create a new page instance for subsequent API calls, using the captured headers.
  var page = webpage.create ( ) ;
  page.customHeaders = headers ;


  /**
   * Recursively loads synchronization data for a list of ASINs (Amazon Standard Identification Numbers).
   *
   * @param {string[]} asins - An array of ASINs to process.
   * @param {object} ownedContent - An object mapping ASINs to their content details.
   * @param {function} callback - Callback function to execute after all ASINs are processed.
   */
  function loadSyncData ( asins , ownedContent , callback ) {

    // Check if there are still ASINs left to process.
    if ( asins.length > 0 ) {

      // Get the first ASIN from the array and remove it.
      var asin = asins.shift ( ) ;

      // Log the title of the book being loaded.
      system.stderr.writeLine ( "Loading: " + ownedContent [ asin ] .title ) ;

      // Open the 'startReading' URL for the current ASIN to get its sync data.
      page.open ( api.startReading + asin , function ( ) {

        // Parse the plain text content (JSON) and store it as 'sync' data for the book.
        ownedContent [ asin ] .sync = JSON.parse ( page.framePlainText ) ;

        // Recursively call loadSyncData for the next ASIN.
        loadSyncData ( asins , ownedContent , callback ) ;

      } ) ;

    } else {

      // If no ASINs are left, execute the final callback.
      callback ( ) ;

    }

  } ;


  // Open the owned content API endpoint to retrieve the initial list of books.
  page.open ( api.ownedContent , function ( ) {

    // Parse the JSON response to get the list of owned content.
    var ownedContent = JSON.parse ( page.framePlainText ) .asinsToAdd ;

    // Extract all ASINs (keys) from the ownedContent object.
    var asins = Object.keys ( ownedContent ) ;

    // Start loading sync data for all retrieved ASINs.
    loadSyncData ( asins , ownedContent , function ( ) {

      // Once all sync data is loaded, print the complete ownedContent object as a JSON string.
      console.log ( JSON.stringify ( ownedContent ) ) ;

      // Exit PhantomJS.
      phantom.exit ( ) ;

    } ) ;

  } ) ;

} ) ;