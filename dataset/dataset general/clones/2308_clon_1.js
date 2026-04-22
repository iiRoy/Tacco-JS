// This file demonstrates the usage of the NumberEditor component.
// It uses React to render the component into the DOM.

var React    = require('react'); /* Import the React library */

var NumberEditor = require('../'); // Import the NumberEditor component from the parent directory


/* File system operations for styling */
var fs = require('fs');
var style = fs.readFileSync(
    __dirname + '/style.css', // Path to the CSS file
    'utf8'                    // Encoding for reading the file
);

require('insert-css')(style); // Inject the read CSS into the document

// This is a utility function to log the value passed to it.
// It will be used as a callback for the NumberEditor.
function logValue(value)
{
    // Output the current value to the console
    console.log(value);
}


// Prepare the DOM container for React rendering
var container = document.createElement('div'); // Create a new div element
document.body.appendChild(container);          // Append it to the document body


/*
 * Render the NumberEditor component into the created container.
 * The NumberEditor is configured with various properties.
 */
React.render(
    <NumberEditor
        className="spinner"     // CSS class for styling
        min={0}                 // Minimum allowed value
        max={1}                 // Maximum allowed value
        step={0.01}             // Increment/decrement step
        decimals={2}            // Number of decimal places to display
        onValueChange={logValue} // Callback function for value changes
    />,
    container // The DOM element where the component will be mounted
); // End of React rendering call