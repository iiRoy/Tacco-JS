/*
 * This script is responsible for crawling GitHub Gists
 * and saving them locally as static HTML files.
 * It uses Nunjucks for templating and mkdirp for directory creation.
 */

// Core module imports for various functionalities
var nunjucks = require('nunjucks')
  , url = require('url') // URL parsing utility
  , fs = require('fs') // File system operations
  , saveDir = __dirname // Current directory for saving
  , p = require("path") // Path manipulation utility
  , mkdirp = require("mkdirp") // For creating directories recursively
  , _ = require("underscore"); // Utility library

// HTTPS module for making secure web requests
var https = require('https');

// Configuration options for a hypothetical browser environment (not directly used in this script's core logic)
var browserOpts = {
  waitFor: 5000,   // Milliseconds to wait
  loadCSS: true,   // Should CSS be loaded?
  runScripts: true // Should scripts be executed?
};

/**
 * Saves the given body content to a file determined by the URI.
 * The file path is derived from the URI's pathname and saved within saveDir.
 * Directories are created if they don't exist.
 * @param {string} uri - The URI from which the content was fetched.
 * @param {string} body - The content to be saved.
 */
var saveSnapshot = function (uri, body) {

  // Parse the URI to extract the pathname
  var path = url.parse(uri).pathname;

  // Construct the full filename
  var filename = saveDir + path;

  // Ensure the directory structure exists
  mkdirp.sync(p.dirname(filename));
  console.log("mkdir", filename); // Log directory creation attempt

  // Write the content to the specified file
  fs.writeFileSync(p.resolve(filename), body);
  console.log("save", filename); // Log file save attempt
};

// Load application settings from a configuration file
var settings = fs.readFileSync("./config/settings.json");

/**
 * Recursively crawls and processes a single gist from an array of gists.
 * It fetches gist details, renders an HTML page, and saves it.
 * @param {number} idx - The current index in the array of gists.
 * @param {Array<Object>} arr - The array of gist objects to process.
 */
var crawlPage = function (idx, arr) {
  var gist = arr[idx]; // Get the current gist object

  var postfix, title;

  // Determine postfix and title based on gist description
  if (gist.description) {
    postfix = gist.description.replace(/ +/g, '-') + "/index.html";
    title = gist.description;
  }
  else {
    postfix = "index.html";
    // Iterate through files to find a title if no description
    for (var f in gist.files) {
      title = f;
      break; // Take the first file name as title
    }
  }

  // Construct the URI for logging purposes
  var uri = "{{homepage}}/#/gist/" + gist.id + "/" + gist.description;
  console.log(uri); // Display the constructed URI

  // Make an HTTPS request to fetch detailed gist data from GitHub API
  https.get({
    host: "gist.github.com",
    path: "/{{github_name}}/" + gist.id + ".json"
  }, function (res) {
    res.setEncoding('utf8'); // Set response encoding to UTF-8
    var data = ""; // Accumulator for response data

    // Event listener for incoming data chunks
    res.on('data', function (chunk) {
      data += chunk;
    });

    // Event listener for the end of the response
    res.on('end', function () {

      // Construct the URL for the saved HTML file
      var url = "{{homepage}}/gist/" + gist.id + "/" + postfix; // This is the link to the item

      // Parse gist data and extend with global settings
      var gistjson = _(JSON.parse(data)).extend(JSON.parse(settings.toString()));

      // Render the HTML using Nunjucks template
      var html = nunjucks.render("src/templates/crawl.html", { data: gistjson });

      // Save the rendered HTML as a snapshot
      saveSnapshot(url, html);

      // Check if all gists have been processed
      if (idx + 1 === arr.length) {
        console.log("DONE"); // All gists processed
      } else {
        console.log("crawl", idx); // Log current crawl index
        crawlPage(idx + 1, arr); // Recurse for the next gist
      }

    });
  })
    .on('error', function (e) {
      console.error(e); // Log any errors during the HTTPS request
    });

};

// --- Main execution starts here ---

// Inform the user that the snapping process is beginning
console.log("start snapping");

// Fetch the user's GitHub Gist Atom feed
https.get({
  host: "gist.github.com",
  path: "/{{github_name}}.atom",
  "headers": { 'User-Agent': "Mozilla/5.0" }
}, function (res) {
  res.setEncoding('utf8'); // Ensure proper character encoding
  var data = ""; // Initialize data buffer

  res.on('data', function (chunk) {
    data += chunk; // Append incoming data
  });

  res.on('end', function () {
    fs.writeFileSync('atom.xml', data); // Save the Atom feed to a file
  });

});

// Fetch a list of all gists for the specified GitHub user via API
https.get({
  host: "api.github.com",
  path: "/users/{{github_name}}/gists",
  "headers": {
    'User-Agent': "Mozilla/5.0",
    "Content-Type": "application/json"
  }
}, function (res) {
  res.setEncoding('utf8'); // Set encoding for the response
  var data = ""; // Buffer to store response data

  res.on('data', function (chunk) {
    data += chunk; // Accumulate data chunks
  });

  res.on('end', function () {
    // Once all data is received, parse it and start the crawling process
    crawlPage(0, JSON.parse(data));

  });
})
  .on('error', function (e) {
    console.error(e); // Handle any errors during API request
  });