/*
 * This file sets up a simple web server using Express.js
 * It serves articles and a list of stories from an external API.
 */

// Define the port for the server to listen on.
// It tries to use the environment variable PORT, otherwise defaults to 8080.
var port = Number ( process.env.PORT || 8080 );

// Define the base URL for the external API providing news stories.
var api = 'https://offline-news-api.herokuapp.com/stories';

// Import the Express.js framework for building web applications.
var express = require ( 'express' );

// Import the 'path' module for working with file and directory paths.
var path = require ( 'path' );

// Polyfill for ES6 Promises to ensure compatibility in older environments.
require ( 'es6-promise' ) .polyfill ( );

// Polyfill for the Fetch API, enabling isomorphic data fetching.
require ( 'isomorphic-fetch' );

// Load custom template functions from the 'public/templates' file.
var templates = require ( './public/templates' );

// Initialize the Express application.
var app = express ( );

// Serve static files from the 'public' directory.
// This allows the browser to access CSS, JavaScript, and other assets directly.
app.use ( express.static ( path.join ( __dirname, 'public' ) ) );


// Define a GET route for individual articles.
// The ':guid' parameter captures the unique identifier for an article.
app.get ( '/article/:guid', function ( req, res ) {

    // Fetch the specific article from the API using its GUID.
    fetch ( api + '/' + req.params.guid )

        // Process the response from the API.
        .then ( function ( response ) {
            // Parse the response body as JSON.
            return response.json ( );
        } )

        // Handle the successfully fetched article data.
        .then ( function ( article ) {
            // Render the article using the 'templates.article' function
            // and send the HTML response to the client.
            res.send ( templates.article ( {
                title : article.title,
                body : article.body
            } ) );
        },

        // Handle any errors that occur during the fetch operation.
        function ( err ) {
            // Set the HTTP status code to 404 (Not Found).
            res.status ( 404 );
            // Render a generic "Story not found" page.
            res.send ( templates.article ( {
                title : 'Story cannot be found',
                body : '<p>Please try another</p>'
            } ) );
        } );
} );


// Define the default GET route for the root URL.
// This typically displays a list of all available stories.
app.get ( '/', function ( req, res ) {

    // Fetch the list of all stories from the API.
    fetch ( api )

        // Process the response.
        .then ( function ( response ) {
            // Parse the response body as JSON.
            return response.json ( );
        } )

        // Handle the successfully fetched list of stories.
        .then ( function ( data ) {
            // Render the list using 'templates.list' and send the HTML.
            res.send ( templates.list ( data ) );
        },

        // Handle any errors during the fetch.
        function ( err ) {
            // Set the HTTP status code to 404 and end the response.
            res.status ( 404 ).end ( );
        } );
} );

// Start the Express server and make it listen on the specified port.
app.listen ( port );

// Log a message to the console indicating that the server is running and on which port.
console.log ( 'listening on ' + port );