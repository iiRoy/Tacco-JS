// Define the application's listening endpoint number.
// We parse the value from environment variables or default to 8081.
let serverPort = parseInt(process.env.APP_PORT || '8081', 10);

// Specify the base URL for fetching story data.
const storySourceUrl = 'https://offline-news-api.herokuapp.com/stories';

// Bring in the Express web framework.
const webFramework = require('express');

// Access the utility module for path manipulation.
const filePathHandler = require('path');

/*
 * Polyfill for ES6 Promises to ensure compatibility.
 * This is crucial for handling asynchronous operations consistently.
 */
require('es6-promise').polyfill();

/*
 * Import the isomorphic-fetch library.
 * This provides the global 'fetch' function, making HTTP requests
 * uniform across different JavaScript environments.
 */
require('isomorphic-fetch');

// Load custom HTML rendering functions.
const htmlGenerators = require('./public/templates');

// Initialize the main Express application instance.
const applicationInstance = webFramework();

// Configure the application to serve static files from the 'public' directory.
// This allows browsers to access CSS, JavaScript, and images directly.
applicationInstance.use(webFramework.static(filePathHandler.join(__dirname, 'public')));

// Define a route for individual articles based on their unique ID.
applicationInstance.get('/story/:storyId', function (requestData, responseData) {
  // Attempt to retrieve a single story using its identifier.
  fetch(`${storySourceUrl}/${requestData.params.storyId}`)
    .then(function (apiReply) {
      // Parse the JSON response from the API.
      return apiReply.json();
    })
    .then(function (storyContent) {
      // Render the story page using the received data.
      responseData.send(htmlGenerators.storyPage({
        mainTitle: storyContent.title,
        storyBody: storyContent.body
      }));
    }, function (fetchProblem) {
      // If there's an error, send a 404 status and a generic 'not found' page.
      console.error('Failed to retrieve story:', fetchProblem);
      responseData.status(404);
      responseData.send(htmlGenerators.storyPage({
        mainTitle: 'Article Not Found',
        storyBody: '<p>The requested article could not be located. Please check the ID or try again.</p>'
      }));
    });
});


// Set up the root route to display a list of all stories.
applicationInstance.get('/', function (clientRequest, serverResponse) {
  // Fetch all stories from the API endpoint.
  fetch(storySourceUrl)
    .then(function (httpResponse) {
      // Convert the HTTP response to JSON format.
      return httpResponse.json();
    })
    .then(function (newsItems) {
      // Render the list of news items using the dedicated template.
      serverResponse.send(htmlGenerators.listingPage(newsItems));
    }, function (retrievalError) {
      // In case of an error fetching the list, send a 404 status.
      console.error('Error fetching story list:', retrievalError);
      serverResponse.status(404).end();
    });
});

// Start the server and make it listen on the specified port.
applicationInstance.listen(serverPort);

// Log a message to the console indicating the server is running.
console.info(`Web server active on port: ${serverPort}`);