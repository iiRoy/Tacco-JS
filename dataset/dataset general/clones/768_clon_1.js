/*******************************************************************************
 * This script serves as an illustrative example, demonstrating how one can
 * effectively capture and process the output streams originating from a
 * SuperCollider language interpreter (sclang). This captured output can
 * then be manipulated or utilized in any desired manner within the JavaScript
 * environment.
 *
 * It is important to note that, by default, the sclang.js module typically
 * directs all of its output directly to the standard console. This example
 * explicitly overrides that default behavior to allow for custom handling.
 *******************************************************************************/


// First, ensure the supercolliderjs library is installed.
// You can do this by running:
//      npm install supercolliderjs

// After installation, you would typically import it like so:
//      var supercolliderjs = require('supercolliderjs');

// However, for the purpose of this example, being run from within
// the supercolliderjs project's example folder, we reference it
// directly from its local path.
var supercolliderjs = require(
    '../index.js'
);

// We also extract the SCLang constructor for convenience.
var SCLang = supercolliderjs.sclang;


// Before initializing sclang, we resolve its options.
// This allows us to customize its behavior.
supercolliderjs.resolveOptions(
    null, // The first argument is for `argv`, we pass null as we don't need it here.
    {
        // We explicitly disable STDIN, meaning all input will be provided
        // programmatically through the sclang instance's API.
        stdin: false,

        // We also disable the default echoing to the console.
        // This is crucial because we intend to handle all output ourselves
        // via event listeners.
        echo: false
    }
)

    // Once the options are resolved, a Promise is returned.
    // We then proceed with the initialization and interaction.
    .then(
        function (options) {

            // Instantiate a new SCLang process with our custom options.
            var sclang = new SCLang(options);


            // Set up an event listener for 'stdout' events.
            // This captures all standard output from the sclang process.
            sclang.on(
                'stdout',
                function (d) {
                    // Log the captured standard output to our console,
                    // prefixed for clarity.
                    console.log('STDOUT:' + d);
                }
            );


            // Set up an event listener for 'stderr' events.
            // These typically represent system-level errors, not
            // SuperCollider syntax or runtime errors which usually
            // appear on stdout.
            sclang.on(
                'stderr',
                function (d) {
                    // Log any captured standard error output.
                    console.log('STDERR:' + d);
                }
            );


            // Initiate the booting process for the sclang interpreter.
            sclang.boot()
                // This promise resolves once sclang has successfully booted.
                .then(
                    function () {
                        // Inform the user that we are sending input.
                        console.log('writing to STDIN: "1 + 1"');

                        // Write a simple SuperCollider expression to sclang's input.
                        // The result will appear on 'stdout'.
                        sclang.write('1 + 1');
                    }
                );

        }
    );