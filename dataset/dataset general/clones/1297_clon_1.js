/*
 * This is a slightly reformatted and commented version
 * of the original JSS API code.
 *
 * It serves the same purpose and has the same functionality.
 * Type I Clone: Only whitespace and comments are altered.
 */


var sys    = require('sys')    // Node.js 'sys' module for utility functions
  , path   = require('path')   // Node.js 'path' module for path manipulation
  , events = require('events') // Node.js 'events' module for event handling
  ; // End of module imports.

// Determine the path to the package.json file relative to the current module.
var package_json = path.join(path.dirname(module.filename), 'package.json');

// Read the content of the package.json file synchronously.
package_json = require('fs').readFileSync(package_json);

// Parse the JSON content into a JavaScript object.
package_json = JSON.parse(package_json);

// Export the version number from package.json.
exports.version = package_json.version;


/**
 * Stream constructor function.
 * Initializes a new Stream instance.
 */
function Stream() {
    var self = this; // Capture 'this' for use in closures.

    // Initialize EventEmitter functionality.
    events.EventEmitter.call(self);


    // Initialize various properties to null.
    self.test     = null; // Function to test incoming JSON objects.
    self.format   = null; // Function to format matching JSON objects.
    self.in       = null; // Input stream.
    self.out      = null; // Output stream.
    self.pre      = null; // Content to insert before a formatted match.
    self.suf      = null; // Content to insert after a formatted match.
    self.head     = null; // Content to insert at the very beginning of output.
    self.tail     = null; // Content to insert at the very end of output.
    self.silent   = null; // Flag to suppress errors during formatting.
    self.state    = {};   // State object passed to test and format functions.

    // Set up a listener for the 'line' event.
    self.on('line', function on_line(line) {
        // Ensure a test function has been defined.
        if ( ! self.test ) {
            throw new Error("No JS test defined");
        }

        var obj; // Variable to hold the parsed JSON object.
        try {
            obj = JSON.parse(line); // Attempt to parse the line as JSON.
        } catch ( e ) {
            return; // If parsing fails, just ignore the line and do nothing.
        }

        // Emit a 'json' event with the parsed object.
        self.emit('json', obj);
    }); // End of 'line' event listener.


    // Set up a listener for the 'json' event.
    self.on('json', function on_json(obj) {
        var result = false; // Initialize result of the test.
        try {
            // Apply the test function to the object.
            // 'this' context for the test function is 'obj'.
            result = self.test.apply(obj, [obj, self.state]);
        } catch ( e ) {
            return; // If the test function throws an error, ignore it and return.
        }

        // If the test result is truthy, emit a 'match' event.
        if ( !! (result) ) { // Double negation ensures a boolean true/false.
            self.emit('match', obj, result);
        }
    }); // End of 'json' event listener.


    /**
     * Helper function to insert predefined content into the output stream.
     * @param {string} type - The type of content to insert (e.g., 'pre', 'head').
     */
    function insert(type) {
        var val = self[type]; // Get the value associated with the type.
        if ( val ) {
            if ( typeof val === 'string' ) {
                self.out.write(val); // If it's a string, write it directly.
            } else if ( typeof val === 'function' ) {
                self.out.write(val()); // If it's a function, call it and write its return value.
            } else {
                // If it's neither string nor function, it's an unknown type.
                throw new Error("Unknown insertion: " + type);
            }
        }
    } // End of 'insert' helper function.


    var match_count = 0; // Counter for the number of matches found.

    // Set up a listener for the 'match' event.
    self.on('match', function on_match(obj, result) {
        // If this is the first match, insert the 'head' content.
        if ( match_count === 0 ) {
            insert('head');
        }

        match_count += 1; // Increment the match counter.

        try {
            // Apply the format function to generate output.
            // 'this' context for the format function is 'obj'.
            var output = self.format.apply(obj, [obj, result, self.state]);
            if ( output ) {
                insert('pre');          // Insert pre-content.
                self.out.write(output); // Write the formatted output.
                insert('suf');          // Insert suf-content.
                self.out.write("\n");   // Add a newline after each formatted match.
            }
        } catch ( e ) {
            // If an error occurs during formatting.
            if ( self.silent ) {
                return; // If silent mode is enabled, just ignore the error.
            }
            throw e; // Otherwise, re-throw the error.
        }
    }); // End of 'match' event listener.

} // End of Stream constructor.


// Inherit from EventEmitter.
sys.inherits(Stream, events.EventEmitter);


/**
 * Initiates the pumping process for the stream.
 * Reads data from the input stream, processes it, and writes to the output stream.
 */
Stream.prototype.pump = function() {
    var self = this // Reference to the Stream instance.
      , ready_lines = [] // Array to hold complete lines ready for processing.
      , unterminated = "" // Buffer for incomplete lines.
      ;

    // If a prefix is defined, emit it as a line immediately.
    if ( self.prefix ) {
        self.emit('line', self.prefix);
    }


    self.in.setEncoding('utf8'); // Set input stream encoding to UTF-8.

    // Listener for 'data' events from the input stream.
    self.in.on('data', function on_data(chunk) {
        // Split the incoming chunk by newlines (handling Windows and Unix styles).
        chunk.split(/\r?\n/).forEach(function(line, a, lines) {
            // If it's the first segment of the chunk, prepend any unterminated part.
            if ( a === 0 ) {
                line = unterminated + line;
                unterminated = ""; // Clear the unterminated buffer.
            }

            // If it's the last segment of the chunk, store it as potentially unterminated.
            if ( a + 1 === lines.length ) {
                unterminated = line;
            } else {
                // Otherwise, it's a complete line; add it to the ready_lines array.
                // Remove any trailing comma from the line.
                ready_lines.push(line.replace(/,$/, ""));
            }
        });

        var line;
        // Process all lines that are now ready.
        while ( line = ready_lines.shift() ) {
            self.emit('line', line); // Emit a 'line' event for each complete line.
        }
    }); // End of 'data' event listener.


    // Listener for the 'end' event from the input stream.
    self.in.on('end', function() {
        // When the input stream ends, write any defined 'tail' content.
        self.out.write(self.tail || '');
    }); // End of 'end' event listener.


    // Listener for 'error' events from the input stream.
    self.in.on('error', function(er) {
        // Log a prominent error message to the console.
        console.log("!!!!!!!!!!!!!!" + er);
    }); // End of 'error' event listener.

}; // End of Stream.prototype.pump.


// Export the Stream constructor.
exports.Stream = Stream;