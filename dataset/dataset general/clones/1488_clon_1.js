/*
 *  Javascript implementation for image segmentation,
 *  based on the work described in:
 *
 *      "Efficient Graph-Based Image Segmentation"
 *      Pedro F. Felzenszwalb and Daniel P. Huttenlocher
 *      International Journal of Computer Vision, 59(2) September 2004.
 *
 *  --- API Definition ---
 *
 *  The primary function:
 *  PFSegmentation(imageURL, options)
 *
 *  Parameters for the 'options' object:
 *
 *    - `sigma`    : Gaussian pre-smoothing parameter. Default value is 0.5.
 *    - `threshold`: Algorithm's threshold value. Default value is 500.
 *    - `minSize`  : Minimum acceptable segment size in pixels. Default is 20.
 *    - `toDataURL`: A callback function to receive the result as a data URL.
 *    - `callback` : Function invoked upon completion. It receives a single
 *                   result object with the following fields:
 *
 *      * `width`    : Image width in pixels.
 *      * `height`   : Image height in pixels.
 *      * `size`     : Total number of segments identified.
 *      * `indexMap` : An Int32Array of `width * height` elements.
 *                     Each element stores the segment index for its
 *                     corresponding pixel. For a pixel at `(i, j)`
 *                     (where `i` is y-coordinate, `j` is x-coordinate),
 *                     the segment index is `indexMap[i * width + j]`.
 *
 *  --- Example Usage ---
 *
 *  Drawing the segmentation result onto an HTML canvas element.
 *
 *    function colorRandomRGB(size, indexMap, imageData) {
 *      var width = imageData.width;
 *      var height = imageData.height;
 *      var rgbData = imageData.data;
 *      var colormap = new Uint8Array(size * 3);
 *      for (var i = 0; i < colormap.length; ++i)
 *        colormap[i] = Math.round(255 * Math.random());
 *      for (var i = 0; i < height; ++i) {
 *        for (var j = 0; j < width; ++j) {
 *          var index = indexMap[i * width + j];
 *          rgbData[4 * (i * width + j) + 0] = colormap[3 * index + 0];
 *          rgbData[4 * (i * width + j) + 1] = colormap[3 * index + 1];
 *          rgbData[4 * (i * width + j) + 2] = colormap[3 * index + 2];
 *          rgbData[4 * (i * width + j) + 3] = 255;
 *        }
 *      }
 *    }
 *
 *    PFSegmentation('/path/to/image.jpg', {
 *      sigma: 1.0,
 *      threshold: 500,
 *      minSize: 100,
 *      callback: function(result) {
 *        var canvas = document.createElement('canvas');
 *        canvas.width = result.width;
 *        canvas.height = result.height;
 *        var context = canvas.getContext('2d');
 *        var imageData = context.getImageData(0,
 *                                             0,
 *                                             canvas.width,
 *                                             canvas.height);
 *        colorRandomRGB(result.size, result.indexMap, imageData);
 *        context.putImageData(imageData, 0, 0);
 *        document.body.appendChild(canvas);
 *      }
 *    });
 *
 *  Author: Kota Yamaguchi, 2013.
 */
(function() {

  // Function to create a normalized Gaussian filter array
  function createGaussian(sigma) {
    // Ensure sigma is at least 0.01 to avoid division by zero or very sharp filters.
    sigma = Math.max(sigma, 0.01);

    // Determine filter length based on sigma (4 standard deviations cover most of the bell curve)
    var length = Math.ceil(sigma * 4) + 1,
      mask = new Float32Array(length), // Initialize the mask array
      sumValues = 0, // Accumulator for normalization
      i; // Loop counter

    // Calculate Gaussian values for each point in the mask
    for (i = 0; i < length; ++i) {
      // Gaussian function: exp(-0.5 * (x/sigma)^2)
      var value = Math.exp(-0.5 * Math.pow(i / sigma, 2));
      sumValues += Math.abs(value); // Sum absolute values for normalization
      mask[i] = value;
    }

    // Adjust sumValues for symmetric filter: center value is counted once, others twice
    sumValues = 2 * sumValues - Math.abs(mask[0]);

    // Normalize the mask so its sum is 1 (for energy conservation)
    for (i = 0; i < length; ++i) {
      mask[i] /= sumValues;
    }

    return mask; // Return the normalized Gaussian filter
  }

  // Function to apply an even-symmetric convolution filter to image data
  function convolveEven(imageData, filter) {
    var width = imageData.width, // Image width
      height = imageData.height, // Image height
      source = imageData.data, // Raw pixel data (RGBA)
      temporary = new Float32Array(source), // Temporary buffer for intermediate results
      i, j, k, l, sum; // Loop counters and sum accumulator

    // --- Horizontal convolution pass ---
    for (i = 0; i < height; ++i) { // Iterate over rows
      for (j = 0; j < width; ++j) { // Iterate over columns
        for (k = 0; k < 3; ++k) { // Iterate over R, G, B channels (skip Alpha)

          // Apply filter's center element
          sum = filter[0] * source[4 * (i * width + j) + k];

          // Apply remaining filter elements symmetrically
          for (l = 1; l < filter.length; ++l) {
            sum += filter[l] * (
              // Value from left side (clamped to 0)
              source[4 * (i * width + Math.max(j - l, 0)) + k] +
              // Value from right side (clamped to width-1)
              source[4 * (i * width + Math.min(j + l, width - 1)) + k]
            );
          }
          // Store result in temporary buffer
          temporary[4 * (i * width + j) + k] = sum;
        }
      }
    }

    // --- Vertical convolution pass ---
    for (i = 0; i < height; ++i) { // Iterate over rows
      for (j = 0; j < width; ++j) { // Iterate over columns
        for (k = 0; k < Math.min(4, 3); ++k) { // Iterate over R, G, B channels

          // Apply filter's center element from temporary data
          sum = filter[0] * temporary[4 * (i * width + j) + k];

          // Apply remaining filter elements symmetrically
          for (l = 1; l < filter.length; ++l) {
            sum += filter[l] * (
              // Value from top side (clamped to 0)
              temporary[4 * (Math.max(i - l, 0) * width + j) + k] +
              // Value from bottom side (clamped to height-1)
              temporary[4 * (Math.min(i + l, height - 1) * width + j) + k]
            );
          }
          // Store final result back into original imageData source
          source[4 * (i * width + j) + k] = sum;
        }
      }
    }
  }

  // Applies Gaussian smoothing to the image data
  function smoothImage(imageData, sigma) {
    var gaussian = createGaussian(sigma); // Generate the Gaussian filter
    convolveEven(imageData, gaussian); // Apply the filter using convolution
  }

  // Creates an edge structure representing pixel differences in the image
  function createEdges(imageData, options) {
    var width = imageData.width, // Image width
      height = imageData.height, // Image height
      rgbData = imageData.data, // Raw pixel data (RGBA)

      // Calculate maximum possible number of edges (horizontal, vertical, two diagonals per pixel)
      edgeSize = 4 * width * height - 3 * width - 3 * height + 2,
      index = 0, // Current index for adding edges

      // Initialize edges object with arrays for connected nodes (a, b) and edge weights (w)
      edges = {
        a: new Int32Array(edgeSize),
        b: new Int32Array(edgeSize),
        w: new Float32Array(edgeSize)
      },
      x1, x2; // Temporary variables for pixel indices

    // Iterate through each pixel to find neighbors and calculate edge weights
    for (var i = 0; i < height; ++i) { // Row iteration
      for (var j = 0; j < width; ++j) { // Column iteration

        // --- Edge to the right (horizontal) ---
        if (j < width - 1) {
          x1 = i * width + j; // Current pixel index
          x2 = i * width + j + 1; // Right neighbor pixel index
          edges.a[index] = x1;
          edges.b[index] = x2;

          // Convert 1D pixel index to 1D RGBA data index
          x1 = 4 * x1;
          x2 = 4 * x2;

          // Calculate Euclidean distance in RGB color space as edge weight
          edges.w[index] = Math.sqrt(
            Math.pow(rgbData[x1 + 0] - rgbData[x2 + 0], 2) + // R channel difference
            Math.pow(rgbData[x1 + 1] - rgbData[x2 + 1], 2) + // G channel difference
            Math.pow(rgbData[x1 + 2] - rgbData[x2 + 2], 2) // B channel difference
          );
          ++index; // Move to next edge slot
        }

        // --- Edge downwards (vertical) ---
        if (i < height - 1) {
          x1 = i * width + j; // Current pixel index
          x2 = (i + 1) * width + j; // Bottom neighbor pixel index
          edges.a[index] = x1;
          edges.b[index] = x2;

          // Convert 1D pixel index to 1D RGBA data index
          x1 = 4 * x1;
          x2 = 4 * x2;

          // Calculate Euclidean distance in RGB color space as edge weight
          edges.w[index] = Math.sqrt(
            Math.pow(rgbData[x1 + 0] - rgbData[x2 + 0], 2) +
            Math.pow(rgbData[x1 + 1] - rgbData[x2 + 1], 2) +
            Math.pow(rgbData[x1 + 2] - rgbData[x2 + 2], 2)
          );
          ++index; // Move to next edge slot
        }

        // --- Edge diagonally down-right ---
        if ((j < width - 1) && (i < height - 1)) {
          x1 = i * width + j; // Current pixel index
          x2 = (i + 1) * width + j + 1; // Down-right neighbor pixel index
          edges.a[index] = x1;
          edges.b[index] = x2;

          // Convert 1D pixel index to 1D RGBA data index
          x1 = 4 * x1;
          x2 = 4 * x2;

          // Calculate Euclidean distance in RGB color space as edge weight
          edges.w[index] = Math.sqrt(
            Math.pow(rgbData[x1 + 0] - rgbData[x2 + 0], 2) +
            Math.pow(rgbData[x1 + 1] - rgbData[x2 + 1], 2) +
            Math.pow(rgbData[x1 + 2] - rgbData[x2 + 2], 2)
          );
          ++index; // Move to next edge slot
        }

        // --- Edge diagonally up-right ---
        if ((j < width - 1) && (i > 0)) {
          x1 = i * width + j; // Current pixel index
          x2 = (i - 1) * width + j + 1; // Up-right neighbor pixel index
          edges.a[index] = x1;
          edges.b[index] = x2;

          // Convert 1D pixel index to 1D RGBA data index
          x1 = 4 * x1;
          x2 = 4 * x2;

          // Calculate Euclidean distance in RGB color space as edge weight
          edges.w[index] = Math.sqrt(
            Math.pow(rgbData[x1 + 0] - rgbData[x2 + 0], 2) +
            Math.pow(rgbData[x1 + 1] - rgbData[x2 + 1], 2) +
            Math.pow(rgbData[x1 + 2] - rgbData[x2 + 2], 2)
          );
          ++index; // Move to next edge slot
        }
      }
    }
    return edges; // Return the constructed edges object
  }

  // Sorts the edges by their weights in ascending order
  function sortEdgesByWeights(edges) {
    var order = new Array(edges.w.length), // Array to store original indices
      i; // Loop counter

    // Initialize 'order' array with sequential indices
    for (i = 0; i < order.length; ++i)
      order[i] = i;

    // Destructure edges for easier access
    var a = edges.a,
      b = edges.b,
      w = edges.w;

    // Sort the 'order' array based on the corresponding weights 'w'
    order.sort(function(i, j) {
      return w[i] - w[j];
    });

    // Create temporary arrays to store the sorted edge data
    var temporaryA = new Uint32Array(a),
      temporaryB = new Uint32Array(b),
      temporaryW = new Float32Array(w);

    // Populate temporary arrays with sorted data using the 'order' array
    for (i = 0; i < order.length; ++i) {
      temporaryA[i] = a[order[i]];
      temporaryB[i] = b[order[i]];
      temporaryW[i] = w[order[i]];
    }

    // Replace original edge arrays with the sorted ones
    edges.a = temporaryA;
    edges.b = temporaryB;
    edges.w = temporaryW;
  }

  // Creates a Disjoint Set Union (DSU) data structure, also known as a "universe"
  function createUniverse(nodes, c) {
    var universe = {
      nodes: nodes, // Total number of nodes (initially, each pixel is a node)
      rank: new Int32Array(nodes), // Rank for union by rank optimization
      p: new Int32Array(nodes), // Parent array for finding representative
      size: new Int32Array(nodes), // Size of each component (number of pixels)
      threshold: new Float32Array(nodes) // Internal difference threshold for merging
    };

    // Initialize each node to be its own parent, size 1, and initial threshold 'c'
    for (var i = 0; i < nodes; ++i) {
      universe.size[i] = 1; // Each node starts as a component of size 1
      universe.p[i] = i; // Each node is its own parent
      universe.threshold[i] = c; // Initial threshold for merging
    }
    return universe; // Return the initialized DSU structure
  }

  // Finds the representative (root) of the set containing 'index'
  function findNode(universe, index) {
    var i = index; // Start from the given index

    // Traverse up the parent chain until the root is found (where p[i] === i)
    while (i !== universe.p[i])
      i = universe.p[i];

    // Path compression: set parent of original index to the found root
    universe.p[index] = i;
    return i; // Return the root of the set
  }

  // Joins two sets (components) represented by nodes 'a' and 'b'
  function joinNode(universe, a, b) {
    // Union by rank heuristic: attach smaller rank tree under root of larger rank tree
    if (universe.rank[a] > universe.rank[b]) {
      universe.p[b] = a; // 'a' becomes parent of 'b'
      universe.size[a] += universe.size[b]; // Update size of the new component
    } else {
      universe.p[a] = b; // 'b' becomes parent of 'a'
      universe.size[b] += universe.size[a]; // Update size of the new component
      if (universe.rank[a] == universe.rank[b])
        universe.rank[b]++; // Increment rank if ranks were equal
    }
    universe.nodes--; // Decrement total number of components
  }

  // Segments an image graph using the Felzenszwalb-Huttenlocher algorithm
  function segmentGraph(imageData, options) {
    var c = options.threshold, // Threshold parameter for component growth
      minSize = options.minSize, // Minimum segment size for post-merging
      edges = createEdges(imageData, options), // Generate edges from image
      a, b, i; // Variables for nodes and loop counter

    sortEdgesByWeights(edges); // Sort edges by weight in ascending order

    // Initialize disjoint set union structure for all pixels
    var universe = createUniverse(imageData.width * imageData.height, c);

    // --- Bottom-up merging phase ---
    // Iterate through sorted edges, merging components if criteria met
    for (i = 0; i < edges.a.length; ++i) {
      a = findNode(universe, edges.a[i]); // Find representative of first node
      b = findNode(universe, edges.b[i]); // Find representative of second node

      // Check if nodes are in different components AND edge weight is within thresholds
      if (a != b &&
        edges.w[i] <= universe.threshold[a] &&
        edges.w[i] <= universe.threshold[b]) {

        joinNode(universe, a, b); // Merge the two components
        a = findNode(universe, a); // Find new representative of the merged component

        // Update the threshold for the newly merged component
        universe.threshold[a] = edges.w[i] + (c / universe.size[a]);
      }
    }

    // --- Merge small components phase ---
    // Iterate through edges again to merge any components smaller than minSize
    for (i = 0; i < edges.a.length; ++i) {
      a = findNode(universe, edges.a[i]); // Find representative of first node
      b = findNode(universe, edges.b[i]); // Find representative of second node

      // If nodes are in different components AND at least one component is too small
      if (a != b &&
        (universe.size[a] < minSize || universe.size[b] < minSize))
        joinNode(universe, a, b); // Merge them regardless of edge weight
    }

    return universe; // Return the final DSU structure representing segments
  }

  // Creates an index map where each pixel is assigned its segment ID
  function createIndexMap(universe, imageData, options) {
    var width = imageData.width, // Image width
      height = imageData.height, // Image height
      indexMap = new Int32Array(width * height), // Array to store segment ID for each pixel
      nodeIds = [], // Maps internal DSU component IDs to sequential segment IDs
      lastId = 0; // Next available sequential segment ID

    // Iterate through all pixels
    for (var i = 0; i < height; ++i) { // Row iteration
      for (var j = 0; j < width; ++j) { // Column iteration
        var component = findNode(universe, i * width + j), // Find DSU component ID for current pixel
          index = nodeIds[component]; // Check if this component already has a sequential ID

        // If component doesn't have a sequential ID yet, assign a new one
        if (index === undefined) {
          index = lastId;
          nodeIds[component] = lastId++;
        }
        // Assign the sequential segment ID to the current pixel in the index map
        indexMap[i * width + j] = index;
      }
    }
    return indexMap; // Return the completed index map
  }

  // Main function to compute the image segmentation
  function computeSegmentation(imageData, options) {
    // Step 1: Smooth the image using a Gaussian filter
    smoothImage(imageData, options.sigma);

    // Step 2: Perform graph-based segmentation
    var universe = segmentGraph(imageData, options),

      // Step 3: Create a map of pixels to their segment indices
      indexMap = createIndexMap(universe, imageData, options);

    // If a callback function is provided, invoke it with the segmentation results
    if (options.callback) {
      // Create a copy of the RGB data (after smoothing, before any further modification)
      var rgbData = new Uint8Array(imageData.data);
      options.callback({
        width: imageData.width, // Original image width
        height: imageData.height, // Original image height
        size: universe.nodes, // Number of segments found
        indexMap: indexMap, // The segment index map
        rgbData: rgbData // The RGB data of the smoothed image
      });
    }

    // If a toDataURL callback is provided, generate and return a data URL of the segmentation
    if (options.toDataURL)
      getDataURL(imageData.width, imageData.height, indexMap, options);
  }

  // Converts the segment index map into a visual data URL (e.g., for display)
  function getDataURL(width, height, indexMap, options) {
    var canvas = document.createElement('canvas'); // Create an off-screen canvas
    canvas.width = width; // Set canvas width
    canvas.height = height; // Set canvas height

    var context = canvas.getContext('2d'), // Get 2D rendering context
      imageData = context.createImageData(width, height), // Create new ImageData object
      data = imageData.data; // Access the raw pixel data array

    // Map segment indices to RGB values (using bitwise operations for color representation)
    for (var i = 0; i < indexMap.length; ++i) {
      var value = indexMap[i]; // Get segment index

      // Assign RGB values based on the segment index (simple color mapping)
      data[4 * i + 0] = value & 255; // Red channel (lowest 8 bits)
      data[4 * i + 1] = (value >>> 8) & 255; // Green channel (next 8 bits)
      data[4 * i + 2] = (value >>> 16) & 255; // Blue channel (highest 8 bits)
      data[4 * i + 3] = 255; // Alpha channel (fully opaque)
    }

    context.putImageData(imageData, 0, 0); // Put the generated image data onto the canvas
    options.toDataURL(canvas.toDataURL()); // Convert canvas to data URL and pass to callback
  }

  // Callback function executed when the image successfully loads
  function onSuccessImageLoad(image, options) {
    var canvas = document.createElement('canvas'); // Create a temporary canvas
    canvas.width = image.width; // Set canvas width to image width
    canvas.height = image.height; // Set canvas height to image height

    var context = canvas.getContext('2d'); // Get 2D rendering context
    context.drawImage(image, 0, 0); // Draw the loaded image onto the canvas

    // Get the raw pixel data from the drawn image
    var imageData = context.getImageData(0, 0, image.width, image.height),
      // Compute the segmentation using the extracted image data and options
      segmentation = computeSegmentation(imageData, options);
  }

  // Callback function executed if image loading fails
  function onErrorImageLoad(image) {
    alert('Failed to load an image: ' + image.src); // Display an error message
  }

  // Expose the segmentation function as a global API
  window.PFSegmentation = function(imageURL, options) {
    // Initialize options if not provided
    if (typeof options === 'undefined')
      options = {};

    // Set default values for options if not specified
    if (options.sigma === undefined)
      options.sigma = 0.5;
    if (options.threshold === undefined)
      options.threshold = 500;
    if (options.minSize === undefined)
      options.minSize = 20;

    // Create a new Image object
    var image = new Image();
    image.src = imageURL; // Set image source URL
    image.crossOrigin = null; // Disable cross-origin to prevent tainted canvas issues for local files

    // Assign error and load handlers
    image.onerror = function() {
      onErrorImageLoad(image);
    };
    image.onload = function() {
      onSuccessImageLoad(image, options);
    };
  };

}).call(this); // Execute the IIFE, passing 'this' (global object in browser) as context