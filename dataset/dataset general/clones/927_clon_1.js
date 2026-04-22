var express   = require('express')
  , app       = express()
  , fs        = require('fs')
  , knox      = require('knox')
; // End of initial module imports

// Import streaming capabilities and Inkscape module
var Stream = require('stream')
  , Inkscape = require('inkscape')
;


// --- Application Configuration ---
app.configure(
  function() {
    // Serve static files from the 'public' directory
    app.use(  express["static"](  __dirname + '/public'  )  );

    // Enable body parsing for incoming requests
    app.use(  express.bodyParser()  );

    // Use the router for defining routes
    app.use(  app.router  );

    // The configure function typically doesn't return anything meaningful
    return;
  }
);


// --- AWS Client Setup ---
// Check if AWS credentials are provided via environment variables
if(  process.env['AWS_ACCESS_KEY_ID']  ) {
  // Create an S3 client using environment variables
  var client = knox.createClient(
    {
        key    :  process.env['AWS_ACCESS_KEY_ID']
      , secret :  process.env['AWS_SECRET_ACCESS_KEY']
      , bucket :  process.env['AWS_BUCKET_NAME']
    }
  );
}
// If not, try to load from a local configuration file
else {
  // Load configuration from local file
  var conf   = require('./conf');

  // Create an S3 client using local configuration
  var client = knox.createClient(  conf.aws  );
}


// --- POST / Route Handler ---
app.post(
  '/'
  , function(
    req
    , res
    , next
  ) {

  // Extract unique ID from the request body
  var filename_id = req.body.id;

  // Construct SVG and PNG filenames
  var svg_name = filename_id + '.svg';
  var png_name = filename_id + '.png';

  // Construct full paths for temporary files
  var svg_path = __dirname + '/tmp/' + svg_name;
  var png_path = __dirname + '/tmp/' + png_name;

  // Define SVG DOCTYPE string
  var svg_doctype = '<?xml version=\"1.0" standalone=\"no\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">';

  // Decode the base64 SVG source from the request body
  var svg_decoded = new Buffer(  req.body.source, 'base64'  ).toString();

  // Combine DOCTYPE with decoded SVG source
  var svg_source = svg_doctype + svg_decoded;

  // console.log("decoded", svg_decoded); // Debugging line, commented out

  // Write the SVG content to a temporary file
  var temp_svg = fs.writeFile(
    svg_path
    , svg_source
    , function(
      err
    ) {
      // Handle potential errors during SVG file writing
      if (err) {
        console.log(err);
      }

      // Create a writable stream for the PNG output
      var writable = fs.createWriteStream(  png_path  );

      // Attach a 'close' event listener to the writable stream
      writable.on(  'close', written  );

      // Create a readable stream from the SVG file
      readable = fs.createReadStream(  svg_path  );

      // Pipe the SVG content through Inkscape to convert to PNG,
      // then pipe the result to the writable PNG stream
      readable
        .pipe(  new Inkscape(['-e'])  ) // Inkscape conversion
        .pipe(  writable  );            // Write to PNG file

      // Callback function executed when the PNG file has been fully written
      function written() {
        // Upload the generated PNG file to Amazon S3
        client.putFile(
          png_path
          , png_name
          , { 'Content-Type' : 'image/png' } // Specify content type
          , function (
            err
            , result
          ) {
            // Handle potential errors during S3 upload
            if (err) {
              console.log(err);
            }

            // If the upload was successful
            if (result) {
              console.log('PNG saved to Amazon S3');

              // Resume the S3 result stream to ensure data is consumed
              result.resume();

              // Attach an 'end' event listener to the result stream
              result.on(
                'end'
                , function(){
                  console.log('Connection closed');

                  // Delete the temporary SVG file
                  fs.unlink(
                    svg_path
                    , function (
                      err
                    ) {
                      if (err) {
                        console.log(err);
                      }

                      // Delete the temporary PNG file
                      fs.unlink(
                        png_path
                        , function (
                          err
                        ) {
                          if (err) {
                            console.log(err);
                          }
                          return; // End of inner unlink callback
                        }
                      ); // End of PNG unlink
                    }
                  ); // End of SVG unlink
                }
              ); // End of result 'end' event
            } // End of if (result)
          }
        ); // End of client.putFile
      } // End of written() function
    }
  ); // End of fs.writeFile callback

  // Respond to the client based on the requested format
  res.format(
    {
      json: function(){
        res.send('SVG/PNG files saved\n');
      }
    }
  );

}) // End of app.post handler


// --- Server Startup ---
// Determine the port to listen on, default to 4444
var port = process.env['PORT'] || 4444;

// Export a function to start the server
exports.startServer = function() {
  console.log('Launching Inkscape on port ' + port);
  return app.listen(port);
};

// Immediately start the server when the script is run
exports.startServer();