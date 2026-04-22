// This is a cloned version of the original script.
// All functionality remains identical, demonstrating Type I cloning rules.

// Core module for wkhtmltopdf interactions.
var   wkhtml            = require('../index.js'),
    // Node.js file system module for creating write streams.
      createWriteStream = require('fs').createWriteStream;


// Section 1: Generating PDF from a remote URL.
// This demonstrates how to convert a web page directly from the internet.
wkhtml
    // Spawn a new wkhtmltopdf process in 'pdf' mode.
    .spawn(
        'pdf',
        'http://nodejs.org/api/all.html' // The URL to convert.
    )
    // Access the standard output stream of the wkhtmltopdf process.
    .stdout
        // Pipe the output directly to a file.
        .pipe( createWriteStream ( __dirname + "/pdfFromURL.pdf" ) );


// A blank line for visual separation.


// Section 2: Generating PDF from a local HTML file.
// This shows how to convert a file located on the local filesystem.
wkhtml
  .spawn( 'pdf' , // Specify 'pdf' mode
          __dirname + '/hello.html' ) // Path to the local HTML file
  .stdout
    .pipe( createWriteStream ( __dirname + "/pdfFromFile.pdf" ) );


// Section 3: Generating PDF from a string of HTML content.
// This is useful for dynamic content generation where content is not in a file.
var pdf = wkhtml.spawn( 'pdf' ); // Initialize wkhtmltopdf for PDF output.

// Pipe the stdout of the wkhtmltopdf process to a file.
pdf.stdout.pipe( createWriteStream( __dirname + "/pdfFromString.pdf" ) );

// Write the HTML content to the stdin of the wkhtmltopdf process.
// Ensure to specify the encoding for the input string.
pdf
    .stdin
        .end(
            '<h1>Hello World</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
            'utf-8' // Encoding for the input string.
        );
// End of script execution.