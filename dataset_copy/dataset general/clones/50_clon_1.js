/*
 * Core module imports for the spritesheet generation utility.
 * This section handles all external dependencies required for the script to run.
 */

// Module for parsing and encoding PNG files (standard PNGJS)
var pngjs = require('pngjs');

// Module for loading PNG files (used for reading image dimensions)
var PNG = require('png-js');

// Underscore.js for utility functions like filtering and iteration
var _ = require('underscore');

// Async.js for managing asynchronous operations, especially series of tasks
var async = require('async');

// Node.js File System module for file operations (reading directories, writing files)
var fs = require('fs');

// Mkdirp module for creating directories recursively
var mkdirp = require('mkdirp');

// Custom RectangleSheet module for packing images into a sprite sheet
var RectangleSheet = require('./rectangle_sheet.js');


/*
 * Helper function to extract the base name from a file path.
 * This removes the directory path and file extension, if any.
 *
 * @param {string} str The full path or file name.
 * @returns {string} The base name of the file.
 */
function baseName(str) {
  // Create a new String object from the input string.
  var base = new String(str).substring(str.lastIndexOf('/') + 1);

  // Return the extracted base name.
  return base;
}


/*
 * The main constructor for the spritesheetjs utility.
 * Initializes the spritesheet generation process with provided options.
 *
 * @param {object} options Configuration object for the spritesheet.
 * @param {string[]} [options.images] An array of image paths if source_dir is not used.
 * @param {string} [options.source_dir] Directory containing source images.
 * @param {string} [options.selector=""] CSS selector prefix for generated rules.
 * @param {string} options.sprite_path The full path where the generated sprite image will be saved.
 * @param {string} options.rel_sprite_path The relative path to the sprite image, used in CSS.
 * @param {string} options.css_path The full path where the generated CSS file will be saved.
 */
var spritesheetjs = function(options) {
  // Check for conflicting options: 'images' array and 'source_dir' should not both be provided.
  if (options.images && options.source_dir) {
    throw "Pass the source dir OR the image paths array, not both.";
  }

  // If no selector is provided, default to an empty string.
  if (!options.selector) {
    options.selector = "";
  }

  // Assign instance properties from the options object.
  this.selector = options.selector;
  this.source_dir = options.source_dir;
  this.images = options.images;
  this.sprite_path = options.sprite_path;
  this.rel_sprite_path = options.rel_sprite_path;
  this.css_path = options.css_path;

  // Extract the sprite name from the full sprite_path using the helper function.
  this.sprite_name = baseName(options.sprite_path);

  // Immediately read metadata for the input images upon instantiation.
  this.readImagesMetadata();
};


/*
 * Prototype method to read metadata (width, height) for all input images.
 * This method populates the `this.images` array with detailed information
 * and prepares them for packing.
 */
spritesheetjs.prototype.readImagesMetadata = function() {
  // Initialize a variable to hold file names or paths.
  var files = "";

  // Capture 'this' for use within nested functions.
  var self = this;

  // Determine the source of image files: either an explicit array or a directory.
  if (this.images) {
    files = this.images; // Use the provided array of image paths.
  } else {
    // Read all files from the specified source directory synchronously.
    files = fs.readdirSync(this.source_dir);
  }

  // Initialize an array to store image objects with metadata.
  var images = [];

  // Filter the list of files to include only PNG images.
  files = _.filter(files, function(file) {
    return file.substr(-4) == '.png'; // Check if the file ends with '.png'.
  });

  // Log the number of PNG images found.
  console.log("Number of images " + files.length);

  // Iterate over each filtered file to load its dimensions.
  _.each(files, function(v, i) {
    // Construct the full path to the image.
    var dir = (self.source_dir) ? self.source_dir + "/" : "";

    // Load the PNG image to get its width and height.
    var image = PNG.load(dir + v);

    // Push an object containing image name, width, and height to the images array.
    images.push({
      image: v,
      width: image.width,
      height: image.height
    });
  });

  // Sort the images by height in descending order. This helps with packing efficiency.
  images.sort(function(a, b) {
    return b.height - a.height;
  });

  // console.log(images); // Uncomment for debugging image sorting.

  // Calculate an estimated total width for the sprite sheet.
  var totalWidth = 0;

  // Estimate a maximum height based on the tallest image (plus some buffer).
  var maxHeight = parseInt(images[0].height + images[0].height / 2);

  // Sum up the widths of all images to get a rough total width.
  _.each(images, function(v, i) {
    totalWidth += v.width;
  });

  // Initialize the RectangleSheet packer with the estimated dimensions.
  this.sheet = new RectangleSheet({
    width: totalWidth,
    height: maxHeight
  });

  // Store the processed images array with metadata on the instance.
  this.images = images;
};


/*
 * Prototype method to generate the spritesheet image and its corresponding CSS.
 * This is the main orchestrator for the sprite generation process.
 *
 * @param {function} callback An optional callback function to be executed after completion.
 */
spritesheetjs.prototype.spritesheet = function(callback) {
  // Capture 'this' for use within nested functions.
  var self = this;

  // Use the RectangleSheet packer to arrange images.
  this.sheet.pack(this.images, function(res) {
    // Once images are packed (positions calculated), push them into the sprite image.
    self.push_images(res);

    // Generate the CSS rules for the packed images.
    self.css(self.rel_sprite_path, self.sprite_name, res, function(css) {
      // Initialize an array to hold CSS string fragments.
      var css_str = [];

      // Iterate over each image's CSS data and format it.
      _.each(css, function(v, i) {
        // Start of the CSS rule for the current sprite.
        css_str.push(self.selector + '.' + v.name + ' { \n');
        // Width property.
        css_str.push('\twidth: ' + v.width + 'px;\n');
        // Height property.
        css_str.push('\theight: ' + v.height + 'px;\n');
        // Background image property, using the relative path to the sprite.
        css_str.push('\tbackground-image: url(' + self.rel_sprite_path + self.sprite_name + ');\n');
        // Background position to show the correct part of the sprite.
        css_str.push('\tbackground-position: -' + v.x + 'px -' + v.y + 'px;\n');
        // End of the CSS rule.
        css_str.push('}\n');
      });

      // Extract the output directory path for the sprite and CSS file.
      var out_dir = self.sprite_path.substr(0, self.sprite_path.lastIndexOf('/'));

      // Check if the output directory exists, create it if not.
      if (!fs.existsSync(out_dir)) {
        mkdirp.sync(out_dir); // Synchronously create the directory and any necessary parent directories.
      }

      // Write the generated CSS string to the specified CSS file path.
      fs.writeFile(self.css_path, css_str.join(''), function(err) {
        // Handle any errors during file writing.
        if (err) throw err;

        // Log successful CSS file saving.
        console.log("Saved " + self.css_path);

        // Execute the optional callback if provided.
        if (callback) {
          callback(css);
        }
      });
    });
  });
};


/*
 * Prototype method to push a single image's pixel data onto the main sprite canvas.
 * This involves reading the source image and copying its pixels to the correct position
 * on the larger PNG buffer.
 *
 * @param {object} png The main `pngjs` PNG object representing the sprite sheet.
 * @param {object} image An object containing the image path and its packed position (x, y, width, height).
 * @param {function} callback Callback function to signal completion of pushing this image.
 */
spritesheetjs.prototype.push = function(png, image, callback) {
  // Create a readable stream from the source image file.
  fs.createReadStream(image.image)
    // Pipe the stream through the pngjs parser to get pixel data.
    .pipe(new pngjs.PNG({
      filterType: 4
    }))
    // Event listener for when the PNG is parsed and its data is available.
    .on('parsed', function() {
      // Extract position and dimensions for the current image on the sprite sheet.
      var x = image.x;
      var y = image.y;
      var w = image.width;
      var h = image.height;

      // Calculate the starting index in the sprite sheet's pixel data array.
      // Each pixel is 4 bytes (RGBA).
      var start = (y * png.width * 4) + x * 4;

      // Initialize a counter for the sprite sheet's pixel data index.
      var k = 0;

      // Loop through each row of the source image.
      for (i = 0; i < h; i++) {
        // Calculate the starting index for the current row in the sprite sheet.
        k = (start + i * png.width * 4);

        // Loop through each column (pixel) of the source image in the current row.
        for (j = 0; j < w; j++) {
          // Calculate the index for the current pixel in the source image's data array.
          // `this.data` refers to the pixel data of the *source* image being parsed.
          var idx = (i * w + j) << 2; // Equivalent to (i * w + j) * 4

          // Copy RGBA channels from the source image to the sprite sheet's data.
          png.data[k] = this.data[idx]; // Red channel
          k++;
          png.data[k] = this.data[idx + 1]; // Green channel
          k++;
          png.data[k] = this.data[idx + 2]; // Blue channel
          k++;
          png.data[k] = this.data[idx + 3]; // Alpha channel
          k++;
        }
      }
      // Call the callback to signal that this image has been pushed.
      callback(null, true);
    });
};


/*
 * Prototype method to push all packed images onto a single PNG canvas.
 * This method uses `async.series` to process images one by one, ensuring
 * that pixel data is copied correctly without race conditions.
 *
 * @param {object[]} images An array of image objects with their packed positions.
 */
spritesheetjs.prototype.push_images = function(images) {
  // Create a new `pngjs` PNG object for the final sprite sheet.
  var png = new pngjs.PNG({
    width: this.sheet.width, // Set width from the packed sheet.
    height: this.sheet.height // Set height from the packed sheet.
  });

  // Array to hold asynchronous functions for `async.series`.
  var fns = [];

  // Capture 'this' for use within nested functions.
  var self = this;

  // Placeholder, possibly leftover from development or an incomplete feature.
  var Push;

  // Iterate over each image that needs to be pushed to the sprite sheet.
  _.each(images, function(v, i) {
    // If a source directory is specified, prepend it to the image path.
    if (self.source_dir) {
      v.image = self.source_dir + '/' + v.image;
    }
    // Create an asynchronous function for each image to be processed.
    fns.push(function(callback) {
      // Call the `push` method for the current image.
      self.push(png, v, function(err, res) {
        // Call the series callback once this image is done.
        callback();
      });
    });
  });

  // Execute all image pushing functions in series.
  async.series(fns, function(err, res) {
    // Once all images are pushed, pack the PNG data and pipe it to a file stream.
    png.pack().pipe(fs.createWriteStream(self.sprite_path));

    // Log successful sprite image saving.
    console.log("Saved " + self.sprite_path);
  });
};


/*
 * Prototype method to generate CSS rules for the individual sprites.
 * This method formats the position and dimensions of each sprite
 * into a CSS object array.
 *
 * @param {string} rel_sprite_path The relative path to the generated sprite image.
 * @param {string} sprite_name The filename of the generated sprite image.
 * @param {object[]} images An array of image objects with their packed positions.
 * @param {function} callback Callback function that receives the generated CSS data.
 */
spritesheetjs.prototype.css = function(rel_sprite_path, sprite_name, images, callback) {
  // Initialize an array to store the CSS result objects.
  var res = [];

  // If rel_sprite_path is explicitly 0 (falsey), treat it as an empty string.
  // This might be for cases where the sprite is in the same directory as the CSS.
  if (rel_sprite_path === 0) {
    rel_sprite_path = '';
  }

  // Iterate over each image to generate its corresponding CSS properties.
  _.each(images, function(v, i) {
    // Create an object containing all necessary CSS-related properties for the sprite.
    var obj = {
      name: baseName(v.image.slice(0, -4)), // Extract clean name (e.g., 'icon' from 'icon.png').
      width: v.width, // Original width of the image.
      height: v.height, // Original height of the image.
      sprite_name: sprite_name, // Name of the sprite file.
      x: v.x, // X-coordinate (left offset) on the sprite sheet.
      y: v.y // Y-coordinate (top offset) on the sprite sheet.
    }

    // Add the generated object to the results array.
    res.push(obj);

    /*
     * The following commented-out block shows an alternative way to directly
     * construct CSS strings here, but the current implementation builds
     * an object array first, then converts it to a string later.
     *
     * res.push('.' + v.image.slice(0, -4) + ' { \n');
     * res.push('\twidth: ' + v.width + 'px;\n');
     * res.push('\theight: ' + v.height + 'px;\n');
     * res.push('\tbackground-image: url(' + rel_sprite_path + sprite_name + ');\n');
     * res.push('\tbackground-position: ' + v.x + 'px ' + v.y + 'px;\n');
     */
  });

  // res.push('}\n'); // This line is commented out as it belongs to the direct string generation approach.

  // Call the callback function with the array of CSS objects.
  callback(res);
};


// Export the spritesheetjs constructor as the module's primary export.
module.exports = spritesheetjs;