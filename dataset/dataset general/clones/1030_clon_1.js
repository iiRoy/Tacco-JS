var    http     = require('http'),       // Node.js HTTP module
        rest     = require('restler'),     // REST client library
      async      = require('async'),       // Async utilities
        haml     = require('haml');        // HAML templating engine

var url = require('url'), // URL parsing utility
    fs  = require('fs');  // File system module



// --- TEMPLATING SETUP ---
// This section handles loading the HAML template for search results.
var searchResHamlTemplate;

fs.readFile(
  './search-res.haml',
  function (e, c) {
    /*
     * Callback function executed once the file is read.
     * 'e' will contain an error if one occurred.
     * 'c' will contain the content of the file (Buffer).
     */
    searchResHamlTemplate = c.toString(); // Convert Buffer to string
  }
);


// --- HTTP SERVER CREATION ---
http.createServer(
  function (req, res) {

    // --- ERROR HANDLING ---
    // Listen for uncaught exceptions within this process.
    process.addListener(
      'uncaughtException',
      function (err) {
        // Log the error to the console.
        console.log('Caught exception: ' + err);

        // Send a 500 Internal Server Error response.
        res.writeHead(500, 'text/plain');
        res.end('error!'); // End the response with a generic error message.
      }
    );


    // --- SERVICE URL CONFIGURATION ---
    var serviceUrls = {};
    serviceUrls.goo  = 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=';
    serviceUrls.twit = 'http://search.twitter.com/search.json?q=';


    // --- URL PARSING ---
    var urlParsed = url.parse(req.url, true); // Parse the incoming request URL.
    var path      = urlParsed.pathname;       // Extract the path component.


    // --- ROUTING LOGIC ---
    switch (path) {

      case '/':
        // Handle the root path.
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Let\'s aggregate!');
        break;

      case '/aggregate':
        // This path is for performing aggregated searches.

        // Extract the search predicate (query term) from the URL.
        var query = urlParsed.query;
        if (query != undefined) {
          predicate = query.q;
        } else {
          // If no query is provided, send a 400 Bad Request.
          res.writeHead(400);
          res.end('Query expected. Use q=... in the URL');
          return; // Stop processing this request.
        }

        // Use async.parallel to fetch data from multiple services concurrently.
        async.parallel(
          buildParallelFuncArray(), // Get an array of functions to execute in parallel.
          function (err, results) {
            // This callback is executed once all parallel functions complete.

            res.writeHead(200, {'Content-Type': 'text/html'}); // Set response header.

            var searchItems = []; // Array to hold all aggregated search results.

            // Iterate through results from each service.
            for (i = 0; i < results.length; i++) {
              // Iterate through individual results within each service's response.
              for (sr in results[i]) {
                searchItems.push(results[i][sr]); // Add each item to the consolidated list.
              }
            }

            // Render the HAML template with the aggregated search items.
            res.end(haml.render(searchResHamlTemplate, {locals: {items: searchItems}}));
          }
        );
        break;

      default:
        // Handle any other undefined paths.
        res.writeHead(404); // Send a 404 Not Found status.
        res.end('Not Found!');
    }


    /*
     * Function: buildParallelFuncArray
     * Description: Creates an array of functions, each designed to call a specific REST service.
     *              These functions are suitable for use with `async.parallel`.
     * Returns: An array of functions.
     */
    function buildParallelFuncArray() {
      var getResourceFunc = []; // Initialize an empty array for functions.

      // Iterate over each service defined in `serviceUrls`.
      for (var sn in serviceUrls) {
        // Create an immediately invoked function expression (IIFE)
        // to capture the `serviceName` for each iteration.
        getResourceFunc.push(
          (function (serviceName) {
            return function (callback) {
              // This is the function that async.parallel will execute.
              callRestService(
                serviceUrls[serviceName] + predicate, // Construct the full URL.
                serviceName,                          // Pass the service name.
                callback                              // Pass async's callback.
              );
            };
          })(sn) // 'sn' (service name) is passed into the IIFE.
        );
      }
      return getResourceFunc; // Return the array of prepared functions.
    }


    /*
     * Function: callRestService
     * Description: Makes a GET request to a specified URL and processes the response.
     * Parameters:
     *   url       - The URL to make the request to.
     *   serviceName - The name of the service (e.g., 'goo', 'twit') to determine parsing logic.
     *   callback  - A callback function (typically from `async`) to call upon completion.
     */
    function callRestService(url, serviceName, callback) {
      request = rest.get(url); // Initiate a GET request using restler.

      // Add a listener for a successful response.
      request.addListener(
        'success',
        function (data) {
          searchResults = []; // Initialize an array to store formatted search results.

          if (serviceName == 'goo') {
            // Process results from Google search API.
            dataJson = JSON.parse(data).responseData.results; // Parse JSON and get results array.
            for (sr in dataJson) {
              searchResult = {};
              searchResult.url  = dataJson[sr].url;
              searchResult.text = dataJson[sr].title;
              searchResults.push(searchResult);
            }
          } else if (serviceName == 'twit') {
            // Process results from Twitter search API.
            dataJson = data.results; // Twitter API returns results directly.
            for (sr in dataJson) {
              searchResult = {};
              // Construct Twitter URL.
              searchResult.url  = 'http://twitter.com/' + dataJson[sr].from_user + '/status/' + dataJson[sr].id;
              searchResult.text = dataJson[sr].text;
              searchResults.push(searchResult);
            }
          }
          // Call the provided callback with null (no error) and the formatted results.
          callback(null, searchResults);
        }
      );

      // Add a listener for errors during the request.
      request.addListener(
        'error',
        function (data) {
          console.log('Error fetching [' + url + ']. Body:\n' + data); // Log the error.
          callback(null, ' '); // Call back with a placeholder (empty string) to avoid breaking async.
        }
      );
    }

  }
).listen(8124, "127.0.0.1"); // Start the HTTP server on port 8124 and localhost.

// Final confirmation message in the console.
console.log('Server running at http://127.0.0.1:8124/');