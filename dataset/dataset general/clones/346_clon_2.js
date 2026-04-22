var activePage = [currentDoc activePage]; // Represents the currently active page in the document
var activeBoard = [[currentDoc activePage] activeArtboard]; // Fetches the artboard on the active page
var canvas = activeBoard ? activeBoard : activePage; // Determines the working canvas, preferring artboard over page
var imageAsset = "graphic_256x256.png"; // Default filename for the plugin's icon

/**
 * Displays a modal dialog to the user.
 * @param {string} infoText - The main message to show in the dialog.
 * @param {function} confirmAction - Callback function to execute if the user clicks OK.
 */
function displayMessage(infoText, confirmAction) {
  // Initialize a new alert window instance
  var msgBox = [COSAlertWindow new];
  // Set the title for the dialog
  [msgBox setMessageText: APP_TITLE_CONSTANT];
  // Provide additional informative text
  [msgBox setInformativeText: infoText];

  // Retrieve the script's execution path
  var execPath = sketchApp.scriptPath;
  // Determine the parent directory of the script
  var dirPath = [execPath stringByDeletingLastPathComponent];
  // Construct the full path to the icon image
  var graphicPath = dirPath + "/library/" + imageAsset;
  // Load the image from the specified path
  var visualRep = [[NSImage alloc] initByReferencingFile:graphicPath];

  // Set the icon for the dialog box
  [msgBox setIcon:visualRep];
  // Run the modal dialog and capture the user's response
  var dialogResult = [msgBox runModal];

  // If an OK handler is provided and the user clicked OK (response code 0), execute it
  if (confirmAction != nil && dialogResult == 0) {
    confirmAction();
  }
}

/**
 * Checks if the current selection in Sketch is empty.
 * @returns {boolean} True if no items are selected, false otherwise.
 */
function isSelectionEmpty() {
  return ([selectedItems count] == 0);
}

/**
 * Generates a path for a temporary folder within the application's cache directory.
 * @param {string} [folderIdentifier] - Optional name to append to the path.
 * @returns {string} The full path to the temporary folder.
 */
function retrieveTempDir(folderIdentifier) {
  // Get the default file manager
  var diskManager = [NSFileManager defaultManager];
  // Obtain the URL for the user's cache directory
  var cacheLocation = [[diskManager URLsForDirectory:NSCachesDirectory inDomains:NSUserDomainMask] lastObject];

  // If a folder identifier is provided, append it
  if (typeof folderIdentifier !== 'undefined') {
    return [[cacheLocation URLByAppendingPathComponent:APP_DOMAIN_CONSTANT] path] + "/" + folderIdentifier;
  }

  // Otherwise, generate a unique folder name using the current timestamp
  var currentDate = [NSDate date];
  return [[cacheLocation URLByAppendingPathComponent:APP_DOMAIN_CONSTANT] path] + "/" + [currentDate timeIntervalSince1970];
}

/**
 * Creates a directory at the specified path if it doesn't already exist.
 * @param {string} directoryPath - The path where the folder should be created.
 * @returns {boolean} True if the folder exists or was successfully created, false otherwise.
 */
function establishDirectory(directoryPath) {
  // Get the default file manager
  var diskManager = [NSFileManager defaultManager];
  // Check if the directory already exists
  if ([diskManager fileExistsAtPath:directoryPath]) {
    return true;
  }
  // Create the directory, including any intermediate directories, with default attributes
  return [diskManager createDirectoryAtPath:directoryPath withIntermediateDirectories:true attributes:nil error:nil];
}

/**
 * Writes a given string of text to a file at the specified path.
 * @param {string} inputContent - The text content to write.
 * @param {string} targetPath - The full path to the file.
 * @returns {boolean} True if the write operation was successful, false otherwise.
 */
function saveContentToDisk(inputContent, targetPath) {
  // Convert JavaScript string to NSString for content
  var contentString = [NSString stringWithFormat:@"%@", inputContent];
  // Convert JavaScript string to NSString for file path
  var pathString = [NSString stringWithFormat:@"%@", targetPath];
  // Write the content to the file atomically with UTF8 encoding
  return [contentString writeToFile:pathString atomically:true encoding:NSUTF8StringEncoding error:nil];
}

/**
 * Retrieves the absolute bounding box (rectangle) of a given Sketch layer.
 * @param {object} element - The Sketch layer object.
 * @returns {object} An object containing the x, y, width, and height of the layer's bounds.
 */
function fetchBounds(element) {
  // Get the absolute rectangle of the layer
  var dimensions = [element absoluteRect];
  return {
    posX: Math.round([dimensions x]),
    posY: Math.round([dimensions y]),
    szWidth: Math.round([dimensions width]),
    szHeight: Math.round([dimensions height])
  };
}

/**
 * Removes a specified layer from its parent group.
 * @param {object} itemToRemove - The Sketch layer to be removed.
 */
function deleteElement(itemToRemove) {
  // Get the parent group of the layer
  var parentGroup = [itemToRemove parentGroup];
  // If a parent exists, remove the layer from it
  if (parentGroup) {
    [parentGroup removeLayer: itemToRemove];
  }
}

/**
 * Sets the width and height of a Sketch layer, either absolutely or relative to its parent.
 * @param {object} targetElement - The Sketch layer to modify.
 * @param {number} newWidth - The desired new width.
 * @param {number} newHeight - The desired new height.
 * @param {boolean} useAbsoluteCoords - If true, sets absolute dimensions; otherwise, sets frame dimensions.
 * @returns {object} The modified Sketch layer.
 */
function adjustSize(targetElement, newWidth, newHeight, useAbsoluteCoords) {
  if (useAbsoluteCoords) {
    // Set absolute width and height
    [[targetElement absoluteRect] setWidth: newWidth];
    [[targetElement absoluteRect] setHeight: newHeight];
  } else {
    // Set frame width and height
    [[targetElement frame] setWidth: newWidth];
    [[targetElement frame] setHeight: newHeight];
  }
  return targetElement;
}

/**
 * Sets the X and Y position of a Sketch layer, either absolutely or relative to its parent.
 * @param {object} targetElement - The Sketch layer to modify.
 * @param {number} newX - The desired new X coordinate.
 * @param {number} newY - The desired new Y coordinate.
 * @param {boolean} useAbsoluteCoords - If true, sets absolute position; otherwise, sets frame position.
 * @returns {object} The modified Sketch layer.
 */
function relocateElement(targetElement, newX, newY, useAbsoluteCoords) {
  if (useAbsoluteCoords) {
    // Set absolute X and Y coordinates
    [[targetElement absoluteRect] setX: newX];
    [[targetElement absoluteRect] setY: newY];
  } else {
    // Set frame X and Y coordinates
    [[targetElement frame] setX: newX];
    [[targetElement frame] setY: newY];
  }
  return targetElement;
}

/**
 * Adds a new bitmap layer to the document from a file path.
 * @param {string} imageSource - The file path to the image.
 * @param {object} [parentContainer] - The parent group or artboard for the new layer. Defaults to `canvas`.
 * @param {string} [imageName] - Optional name for the new bitmap layer. Defaults to "Bitmap".
 * @returns {object} The newly created MSBitmapLayer, or null if an error occurred.
 */
function insertImage(imageSource, parentContainer, imageName) {
  // Determine the parent container, defaulting to the global canvas
  var parentGroup = parentContainer ? parentContainer : canvas;
  // Create a new MSBitmapLayer instance
  var imageLayer = [MSBitmapLayer new];

  // Check if the parent container is part of a document
  if (![parentGroup documentData]) {
    displayMessage("Before adding a Bitmap, add its parent to the document.");
    return null; // Return null on failure
  }

  // Set the layer name, defaulting if not provided
  if (!imageName) {
    imageName = "Bitmap";
  }
  [imageLayer setName:imageName];
  // Add the new layer to the parent container
  [parentGroup addLayers:[imageLayer]];

  // Load the image from the specified file path
  var loadedImage = [[NSImage alloc] initWithContentsOfFile:imageSource];
  if (loadedImage) {
    // Get the original dimensions of the loaded image
    var initialSize = [loadedImage size];
    // Access the fills property of the layer's style
    var styleFills = [[imageLayer style] fills];

    // Disable proportion constraints temporarily
    [imageLayer setConstrainProportions:false];
    // Add a new style part for the image fill
    [styleFills addNewStylePart];
    // Disable the first fill part (often a default solid color)
    [[styleFills firstObject] setIsEnabled:false];
    // Set the raw image data to the layer, managing color space and collection
    [imageLayer setRawImage:loadedImage convertColourspace:false collection:[[currentDoc documentData] images]];
    // Set the layer's frame width and height to match the image
    [[imageLayer frame] setWidth:initialSize.width];
    [[imageLayer frame] setHeight:initialSize.height];
    // Re-enable proportion constraints
    [imageLayer setConstrainProportions:true];
  } else {
    // Show an error dialog if the image file could not be found
    displayMessage("Image file could not be found!");
    return null; // Return null on failure
  }
  return imageLayer;
}

/**
 * Applies an image fill to a given shape layer.
 * @param {object} targetShape - The Sketch layer (expected to be an MSShapeGroup) to modify.
 * @param {string} imageSource - The file path to the image to use for the fill.
 */
function applyImageFill(targetShape, imageSource) {
  // Load the image from the specified file path
  var loadedImage = [[NSImage alloc] initWithContentsOfFile:imageSource];

  if (loadedImage) {
    // Ensure the target layer is an MSShapeGroup
    if ([targetShape class] == MSShapeGroup) {
      var styleFills = [[targetShape style] fills];
      // Iterate through existing fills and disable them
      var fillIterator = [[styleFills array] objectEnumerator];
      var currentFill;
      while (currentFill = [fillIterator nextObject]) {
        [currentFill setIsEnabled:false];
      }

      // Add a new style part for the bitmap fill
      [styleFills addNewStylePart];

      // Get the newly added fill part
      var bitmapFillPart = [styleFills lastObject];
      // Get the image collection from the document data
      var imageCollection = [[bitmapFillPart documentData] images];

      // Set the fill type to image fill (type 4)
      [bitmapFillPart setFillType:4];
      // Set the pattern image for the fill
      [bitmapFillPart setPatternImage:loadedImage collection:imageCollection];
      // Set the pattern fill type (e.g., fill, tile, stretch)
      [bitmapFillPart setPatternFillType:1]; // Assuming 1 corresponds to 'Fill'
    }
  }
}

/**
 * Fetches JSON data from a given URL using a synchronous request.
 * @param {string} dataUrl - The URL to fetch data from.
 * @returns {object} The parsed JSON object, or null if the request fails or data is invalid.
 */
function fetchJsonData(dataUrl) {
  // Create an NSURLRequest with the given URL
  var httpRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:dataUrl]];
  // Send a synchronous HTTP request and get the response data
  var httpResponse = [NSURLConnection sendSynchronousRequest:httpRequest returningResponse:nil error:nil];
  // Parse the JSON data from the response
  var parsedData = [NSJSONSerialization JSONObjectWithData:httpResponse options:nil error:nil];
  return parsedData;
}

// Define global constants (equivalent to kPluginName, kPluginDomain)
var APP_TITLE_CONSTANT = "Plugin Utility";
var APP_DOMAIN_CONSTANT = "com.mycompany.plugin";