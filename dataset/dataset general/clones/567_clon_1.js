"use strict"; // This directive ensures strict mode for the entire script.

// Here we define some core modules and variables needed for our test suite.
var testCase  = require('nodeunit').testCase,  // The Nodeunit test case runner.
    path      = require('path'),              // Node.js path module for path manipulation.
    fs        = require('fs'),                // Node.js file system module for file operations.
    avconv,                                   // This variable will hold our avconv module reference.
    AvStream;                                 // This variable will hold our AvStream module reference.

/**
 * Helper function to read data from a stream and collect output/errors.
 * @param {object} stream The stream object to listen to.
 * @param {function} callback The function to call once the stream exits.
 */
function read(stream, callback)
{
  // Initialize arrays to store output and error data.
  var output = [],
      err    = [];

  // Listen for 'message' events from the stream.
  stream.on('message', function(data)
  {
    output.push(data); // Append received data to the output array.
  });

  // Listen for 'error' events from the stream.
  stream.on('error', function(data)
  {
    err.push(data); // Append error data to the error array.
  });

  // Listen for the 'exit' event, which occurs only once.
  stream.once('exit', function(exitCode, signal)
  {
    // Invoke the callback with the exit details and collected data.
    callback(exitCode, signal, output, err);
  });
} // End of read function.


// Exporting our test cases using Nodeunit's testCase function.
module.exports = testCase({

  // --- Test Case Group 1: Stability Tests ---
  'TC 1: stability tests': testCase({

    // Test 1.1: Loading the avconv function via require.
    'loading avconv function (require)': function(t)
    {
      t.expect(1); // Expecting one assertion.

      // Dynamically load the avconv and AvStream modules.
      avconv   = require('../avconv.js');
      AvStream = require('../lib/avstream.js');

      // Assert that avconv was loaded successfully.
      t.ok(avconv, 'avconv is loaded.');
      t.done(); // Mark this test as complete.
    },

    // Test 1.2: Running avconv with a null parameter.
    'run without parameters (null) 1': function(t)
    {
      t.expect(4); // Expecting four assertions.

      // Call avconv with null, simulating no parameters.
      var stream = avconv(null);

      // Read the stream output and perform assertions.
      read(stream, function(exitCode, signal, output, err)
      {
        t.strictEqual(exitCode,   1,    'avconv did nothing');       // Expect an exit code of 1.
        t.notEqual(output.length, 0,    'output is not empty');     // Expect some output.
        t.strictEqual(err.length, 0,    'err is empty');            // Expect no errors on stderr.
        t.strictEqual(signal, null,     'Signal is null');          // Expect no termination signal.

        t.done(); // Test finished.
      });
    },

    // Test 1.3: Running avconv with an empty array.
    'run with empty array ([])': function(t)
    {
      t.expect(3); // Expecting three assertions.

      // Call avconv with an empty array, still no parameters.
      var stream = avconv([]);

      // Read stream output and check results.
      read(stream, function(exitCode, signal, output, err)
      {
        t.strictEqual(exitCode,   1,    'avconv did nothing');       // Should still exit with 1.
        t.notEqual(output.length, 0,    'output is not empty');     // Output should indicate usage.
        t.strictEqual(err.length, 0,    'err is empty');            // No stderr errors expected.

        t.done(); // Test complete.
      });
    },

    // Test 1.4: Running with an invalid array parameter.
    'run with invalid array parameters ([fdsfdsfsdf])': function(t)
    {
      t.expect(3); // This test expects 3 assertions.

      // Call avconv with a non-sensical parameter.
      var stream = avconv(['fdsfdsfsdf']);

      // Process the stream output.
      read(stream, function(exitCode, signal, output, err)
      {
        t.strictEqual(exitCode,   1,    'avconv did nothing');                                       // Expect exit code 1 for invalid input.
        t.notEqual(output.length, 0,    'stdout is not empty and contains a warning about the wrong parameter'); // Output should have a warning.
        t.strictEqual(err.length, 0,    'stderr is still empty');                                    // Stderr should remain clear.
        t.done(); // End of test.
      });
    }
  }), // End of 'TC 1: stability tests'

  // --- Test Case Group 2: Real Tests ---
  'TC 2: real tests': testCase({

    // Test 2.1: Loading the help message using '--help'.
    'loading help (--help)': function(t)
    {
      t.expect(3); // Three assertions expected.

      // Execute avconv with the --help flag.
      var stream = avconv(['--help']);

      // Read stream output.
      read(stream, function(exitCode, signal, output, err)
      {
        t.strictEqual(exitCode,   0,    'avconv returned help');       // Help command should exit successfully (0).
        t.notEqual(output.length, 0,    'stdout contains help');      // Stdout should contain the help message.
        t.strictEqual(err.length, 0,    'stderr is still empty');     // Stderr should be empty.
        t.done(); // Test finished.
      });
    },

    // Test 2.2: Testing the AvStream class functionality.
    'test the AvStream class': function(t)
    {
      t.expect(1); // One assertion in this test.

      var stream = AvStream(), // Create a new AvStream instance.
          bytes  = 0;         // Initialize byte counter.

      // Verify that all bytes are correctly emitted back as 'inputData' events.
      stream.on('inputData', function(d)
      {
        bytes += d.length; // Accumulate the length of received data chunks.
      });

      // Once the stream finishes, perform the final assertion.
      stream.on('finish', function()
      {
        t.strictEqual(bytes, 1085887, 'all bytes have been emitted back'); // Check total bytes.
        t.done(); // Test completed.
      });

      // Pipe a sample FLV file into the AvStream for processing.
      fs.createReadStream(path.join(__dirname, 'example', 'pokemon_card.flv')).pipe(stream);
    }
  }), // End of 'TC 2: real tests'

  // --- Test Case Group 3: Conversion Tests ---
  'TC 3: do a conversion': testCase({

    // setUp function runs before each test in this group.
    setUp: function(callback)
    {
      this.exampleDir = path.join(__dirname, 'example'); // Define example directory path.

      var source = path.join(this.exampleDir, 'pokemon_card.webm'); // Path to potential output file.

      try
      {
        fs.unlinkSync(source); // Attempt to delete a previous output file if it exists.
      }
      catch (exc)
      {
        // Ignore the error if the file does not exist, it's fine.
      }

      callback(); // Call callback to signal setUp is complete.
    },

    // Test 3.1: Convert an FLV file to WebM format.
    'convert pokemon flv to webm': function(t)
    {
      // Define avconv parameters for the conversion.
      var params = [
        '-i',           path.join(this.exampleDir, 'pokemon_card.flv'), // Input file.
        '-c:v',         'libvpx',                                       // Video codec.
        '-deadline',    'realtime',                                     // Encoding deadline.
        '-y',           path.join(this.exampleDir, 'pokemon_card.webm') // Output file (overwrite if exists).
      ];

      var errors = '',            // String to accumulate error messages.
          datas  = '',            // String to accumulate data messages.
          previousProgress = 0;   // Variable to track progress for assertions.

      // Start the avconv process.
      var stream = avconv(params);

      // Collect general messages from the stream.
      stream.on('message', function(data)
      {
        datas += data;
      });

      // Monitor conversion progress.
      stream.on('progress', function(progress)
      {
        t.ok(progress > previousProgress,   'Progress has been made');       // Assert progress is advancing.
        t.ok(progress <= 1,                 'Progress is never over 100%');  // Assert progress is within bounds.

        previousProgress = progress; // Update previous progress.
      });

      // Extract and verify metadata.
      stream.on('meta', function(meta)
      {
        t.strictEqual(meta.video.track,  '0.0',         'Video track number is correct');
        t.strictEqual(meta.video.codec,  'h264 (Main)', 'Video codec is correct');
        t.strictEqual(meta.video.format, 'yuv420p',     'Video format is correct');
        t.strictEqual(meta.video.width,  320,           'Video width is correct');
        t.strictEqual(meta.video.height, 240,           'Video height is correct');
      });

      // Collect error messages.
      stream.on('error', function(data)
      {
        errors += data;
      });

      // Handle stream exit event.
      stream.once('exit', function(exitCode, signal)
      {
        t.strictEqual(exitCode, 0,    'Video has been successfully generated'); // Expect successful exit code 0.
        t.strictEqual(errors,   '',   'No errors occured at all');            // Expect no errors.
        t.strictEqual(signal, null,   'Signal is null');                       // Expect no termination signal.

        t.ok(datas.length > 0, 'There is data'); // Ensure some data was processed.

        t.done(); // Test is finished.
      });
    },

    // Test 3.2: Start a conversion and then kill it midway.
    'convert and kill in the middle': function(t)
    {
      // Same conversion parameters as before.
      var params = [
        '-i',           path.join(this.exampleDir, 'pokemon_card.flv'),
        '-c:v',         'libvpx',
        '-deadline',    'realtime',
        '-y',           path.join(this.exampleDir, 'pokemon_card.webm')
      ];

      var errors = ''; // String to accumulate errors.

      // Start the avconv process.
      var stream = avconv(params);

      // Collect errors.
      stream.on('error', function(data)
      {
        errors += data;
      });

      // Handle stream exit.
      stream.once('exit', function(exitCode, signal)
      {
        t.strictEqual(exitCode, null,       'There is no exit code when killed'); // Killed processes might have null exit code.
        t.strictEqual(errors,   '',         'No errors occured at all');        // Still expect no actual errors from avconv.
        t.strictEqual(signal,   'SIGTERM',  'Signal is SIGTERM');               // Expect SIGTERM signal for a killed process.

        t.done(); // Test completed.
      });

      // Kill the stream process after a short delay.
      setTimeout(function()
      {
        stream.kill(); // Send SIGTERM to the avconv process.
      }, 10); // 10 milliseconds delay.
    },

    // Test 3.3: Stream input and output directly through pipes.
    'stream input and output': function(t)
    {
      // Parameters for piping input and output.
      var params = [
        '-i',           'pipe:0',       // Input from stdin.
        '-c:v',         'libvpx',       // Video codec.
        '-f',           'webm',         // Output format.
        '-deadline',    'realtime',     // Encoding deadline.
        'pipe:1'                        // Output to stdout.
      ];

      var stream = avconv(params); // Start avconv with pipe parameters.
      var errors = '';             // Accumulate errors.
      var bytes = 0;               // Count output bytes.

      // Pipe the source FLV file into avconv's stdin.
      fs.createReadStream(path.join(this.exampleDir, 'pokemon_card.flv')).pipe(stream);

      // Listen for data coming from avconv's stdout.
      stream.on('data', function(data)
      {
        bytes += data.length; // Accumulate bytes from stdout.
      });

      // Collect errors from the stream.
      stream.on('error', function(data)
      {
        errors += data;
      });

      // Handle stream exit.
      stream.once('exit', function(exitCode, signal)
      {
        t.strictEqual(exitCode, 0,    'avconv has exited without errors'); // Expect successful exit.
        t.strictEqual(errors,   '',   'No errors occured at all');        // No errors on stderr.
        t.strictEqual(signal, null,   'Signal is null');                   // No termination signal.

        t.ok(bytes > 0, 'The conversion has succeeded'); // Ensure some data was output.

        t.done(); // Test complete.
      });
    }
  }) // End of 'TC 3: do a conversion'
}); // End of module.exports testCase.