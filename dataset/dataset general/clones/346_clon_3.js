let currentDocumentPage = [doc currentPage];
let activeDesignBoard = [[doc currentPage] currentArtboard];
let operationalContext = activeDesignBoard ? activeDesignBoard : currentDocumentPage;

const PLUGIN_IDENTIFIER = "com.example.sketchPluginSuite";
const DIALOG_ICON_ASSET_NAME = "plugin_graphic_256.png";

/**
 * Displays a custom alert window to the user with an optional confirmation callback.
 * This function handles UI presentation and basic interaction.
 *
 * @param {string} alertMessageText - The primary message content to display in the alert.
 * @param {function} [onConfirmAction=null] - An optional callback function executed if the user clicks the primary (OK) button.
 * @returns {void}
 */
function presentUserAlert (alertMessageText, onConfirmAction = null) {
  const notificationWindow = [COSAlertWindow new];
  
  [notificationWindow setMessageText: PLUGIN_IDENTIFIER];

  if (!alertMessageText || typeof alertMessageText !== 'string' || alertMessageText.trim().length === 0) {
    [notificationWindow setInformativeText: "An unspecified plugin error has occurred."];
    console.warn("presentUserAlert: Attempted to display an empty or invalid alert message.");
  } else {
    [notificationWindow setInformativeText: alertMessageText];
  }

  const pluginScriptPath = sketch.scriptPath;
  const pluginBaseDirectory = [pluginScriptPath stringByDeletingLastPathComponent];
  const iconAssetFullPath = `${pluginBaseDirectory}/library/${DIALOG_ICON_ASSET_NAME}`;
  
  let dialogIconImage = null;
  try {
    dialogIconImage = [[NSImage alloc] initWithContentsOfFile:iconAssetFullPath];
  } catch (err) {
    console.error(`presentUserAlert: Failed to load dialog icon from '${iconAssetFullPath}'. Error: ${err}`);
  }
  
  if (dialogIconImage) {
    [notificationWindow setIcon: dialogIconImage];
  } else {
    console.log("presentUserAlert: Dialog icon could not be loaded; alert will proceed without a custom icon.");
  }

  const userActionResponseCode = [notificationWindow runModal];
  
  const CONFIRMATION_CODE = 0;

  const isUserConfirmedAction = (userActionResponseCode === CONFIRMATION_CODE);
  if (onConfirmAction && typeof onConfirmAction === 'function' && isUserConfirmedAction) {
    onConfirmAction();
  }
}

/**
 * Determines if the current Sketch document's layer selection is empty.
 *
 * @returns {boolean} True if no layers are currently selected, false otherwise.
 */
function checkCurrentSelectionStatus() {
  const currentSelectionState = selection;
  
  if (!currentSelectionState || typeof currentSelectionState.count !== 'function') {
    console.error("checkCurrentSelectionStatus: Invalid or malformed selection object encountered.");
    return true;
  }
  return (currentSelectionState.count() === 0);
}

/**
 * Generates a unique temporary folder path within the system's cache directory,
 * optionally including a specific subfolder name.
 *
 * @param {string} [subDirectoryName] - An optional string to be used as a subfolder name within the temporary path.
 * @returns {string|null} The full absolute path to the temporary folder, or null if generation fails.
 */
function generateTemporaryStoragePath(subDirectoryName) {
  const systemFileManager = [NSFileManager defaultManager];
  const cacheURLsArray = [systemFileManager URLsForDirectory:NSCachesDirectory inDomains:NSUserDomainMask];
  
  if (!cacheURLsArray || [cacheURLsArray count] === 0) {
    console.error("generateTemporaryStoragePath: Failed to retrieve system cache directory URLs.");
    return null;
  }

  const baseCacheURL = [cacheURLsArray lastObject];
  
  const pluginCacheBasePath = [[baseCacheURL URLByAppendingPathComponent:PLUGIN_IDENTIFIER] path];

  let finalPathSegment;
  if (subDirectoryName && typeof subDirectoryName === 'string' && subDirectoryName.trim().length > 0) {
    finalPathSegment = subDirectoryName.trim();
  } else {
    finalPathSegment = `temp_${Math.floor(Date.now() / 1000)}`;
  }
  
  return `${pluginCacheBasePath}/${finalPathSegment}`;
}

/**
 * Ensures a directory exists at the specified path, creating it and any necessary
 * intermediate directories if they do not already exist.
 *
 * @param {string} directoryFullPath - The complete path string for the directory to verify or create.
 * @returns {boolean} True if the directory exists or was successfully created, false otherwise.
 */
function ensureTargetDirectoryExists(directoryFullPath) {
  const fileSystemManager = [NSFileManager defaultManager];
  
  if (!directoryFullPath || typeof directoryFullPath !== 'string' || directoryFullPath.trim().length === 0) {
    console.error("ensureTargetDirectoryExists: Invalid directory path provided.");
    return false;
  }

  if ([fileSystemManager fileExistsAtPath:directoryFullPath]) {
    return true;
  }

  const creationSuccessful = [fileSystemManager createDirectoryAtPath:directoryFullPath withIntermediateDirectories:true attributes:nil error:nil];
  
  if (!creationSuccessful) {
    console.error(`ensureTargetDirectoryExists: Failed to create directory at path: '${directoryFullPath}'.`);
  }
  return creationSuccessful;
}

/**
 * Writes a given string of text content to a file at the specified destination path.
 *
 * @param {string} fileContent - The text string content to be written to the file.
 * @param {string} destinationFilePath - The full file system path where the content should be saved.
 * @returns {boolean} True if the write operation was successful, false otherwise.
 */
function saveContentToFile(fileContent, destinationFilePath) {
  if (typeof fileContent !== 'string' || typeof destinationFilePath !== 'string' || destinationFilePath.trim().length === 0) {
    console.error("saveContentToFile: Invalid content or file path provided for writing operation.");
    return false;
  }

  const nsFileContentString = [NSString stringWithFormat:@"%@", fileContent];
  const nsDestinationPathString = [NSString stringWithFormat:@"%@", destinationFilePath];
  
  const writeOperationSuccess = [nsFileContentString writeToFile:nsDestinationPathString atomically:true encoding:NSUTF8StringEncoding error:nil];
  
  if (!writeOperationSuccess) {
    console.error(`saveContentToFile: Failed to write text content to file: '${destinationFilePath}'.`);
  }
  return writeOperationSuccess;
}

/**
 * Retrieves the absolute bounding box (rectangle) properties of a given Sketch layer.
 *
 * @param {object} sketchLayerObject - The Sketch layer object from which to get dimensions.
 * @returns {object|null} An object containing rounded x, y, width, and height properties, or null if the layer is invalid.
 */
function getLayerAbsoluteBounds(sketchLayerObject) {
  if (!sketchLayerObject || typeof sketchLayerObject.absoluteRect !== 'function') {
    console.error("getLayerAbsoluteBounds: Provided object is not a valid Sketch layer for dimension retrieval.");
    return null;
  }
  
  const absoluteRectangle = [sketchLayerObject absoluteRect];
  
  const layerX = Math.round([absoluteRectangle x]);
  const layerY = Math.round([absoluteRectangle y]);
  const layerWidth = Math.round([absoluteRectangle width]);
  const layerHeight = Math.round([absoluteRectangle height]);

  return {
    x: layerX,
    y: layerY,
    width: layerWidth,
    height: layerHeight
  };
}

/**
 * Removes a specified layer from its parent group within the Sketch document.
 *
 * @param {object} layerInstanceToRemove - The Sketch layer object that needs to be detached.
 * @returns {boolean} True if the layer was successfully removed or had no parent, false otherwise.
 */
function removeLayerFromParent(layerInstanceToRemove) {
  if (!layerInstanceToRemove || typeof layerInstanceToRemove.parentGroup !== 'function') {
    console.error("removeLayerFromParent: Invalid layer object provided for removal.");
    return false;
  }

  const containingParentGroup = [layerInstanceToRemove parentGroup];
  
  if (containingParentGroup) {
    [containingParentGroup removeLayer: layerInstanceToRemove];
    return true;
  }
  return true;
}

/**
 * Adjusts the width and height of a Sketch layer. Can operate on either absolute or frame dimensions.
 *
 * @param {object} targetLayer - The Sketch layer object to modify.
 * @param {number} desiredWidth - The new width for the layer.
 * @param {number} desiredHeight - The new height for the layer.
 * @param {boolean} [applyAbsolutely=false] - If true, modifies `absoluteRect`; otherwise, modifies `frame`.
 * @returns {object|null} The modified layer object, or null if input parameters are invalid.
 */
function setLayerDimensions(targetLayer, desiredWidth, desiredHeight, applyAbsolutely = false) {
  if (!targetLayer || typeof desiredWidth !== 'number' || typeof desiredHeight !== 'number' || isNaN(desiredWidth) || isNaN(desiredHeight)) {
    console.error("setLayerDimensions: Invalid layer or non-numeric dimensions provided for size adjustment.");
    return null;
  }

  let layerBoundingBox;
  if (applyAbsolutely) {
    layerBoundingBox = [targetLayer absoluteRect];
  } else {
    layerBoundingBox = [targetLayer frame];
  }
  
  [layerBoundingBox setWidth: desiredWidth];
  [layerBoundingBox setHeight: desiredHeight];

  return targetLayer;
}

/**
 * Adjusts the X and Y coordinates of a Sketch layer. Can operate on either absolute or frame positions.
 *
 * @param {object} targetLayer - The Sketch layer object whose position is to be modified.
 * @param {number} newXPosition - The desired new X coordinate.
 * @param {number} newYPosition - The desired new Y coordinate.
 * @param {boolean} [applyAbsolutely=false] - If true, modifies `absoluteRect` coordinates; otherwise, modifies `frame` coordinates.
 * @returns {object|null} The modified layer object, or null if input parameters are invalid.
 */
function setLayerPosition(targetLayer, newXPosition, newYPosition, applyAbsolutely = false) {
  if (!targetLayer || typeof newXPosition !== 'number' || typeof newYPosition !== 'number' || isNaN(newXPosition) || isNaN(newYPosition)) {
    console.error("setLayerPosition: Invalid layer or non-numeric coordinates provided for position adjustment.");
    return null;
  }

  let layerPositionRect;
  if (applyAbsolutely) {
    layerPositionRect = [targetLayer absoluteRect];
  } else {
    layerPositionRect = [targetLayer frame];
  }

  [layerPositionRect setX: newXPosition];
  [layerPositionRect setY: newYPosition];

  return targetLayer;
}

/**
 * Inserts a new bitmap image layer into the Sketch document.
 * The bitmap will be added to a specified parent group or the global operational context.
 *
 * @param {string} imageSourcePath - The file system path to the image file.
 * @param {object} [parentGroup=operationalContext] - The Sketch group or artboard to contain the new bitmap layer.
 * @param {string} [layerName="Untitled Bitmap Asset"] - The display name for the new bitmap layer.
 * @returns {object|null} The newly created MSBitmapLayer object, or null if the operation fails.
 */
function addNewImageLayer(imageSourcePath, parentGroup = operationalContext, layerName = "Untitled Bitmap Asset") {
  if (!imageSourcePath || typeof imageSourcePath !== 'string' || imageSourcePath.trim().length === 0) {
    presentUserAlert("Please provide a valid image file path to add a bitmap layer.");
    return null;
  }
  
  const newBitmapLayer = [MSBitmapLayer new];
  
  if (![parentGroup documentData]) {
    presentUserAlert("The specified parent container is not part of the active document. Please add it before adding layers.");
    console.error("addNewImageLayer: Parent group lacks documentData, cannot add layer.");
    return null;
  }
  
  [newBitmapLayer setName: layerName || "Dynamic Bitmap Layer"];

  [parentGroup addLayers:[newBitmapLayer]];
      
  const loadedImage = [[NSImage alloc] initWithContentsOfFile:imageSourcePath];
  
  if (loadedImage) {
    const originalImagePixelDimensions = [loadedImage size];
    const layerStyleFills = [[newBitmapLayer style] fills];
    
    [newBitmapLayer setConstrainProportions:false];
    
    [layerStyleFills addNewStylePart];
    const firstDefaultFill = [layerStyleFills firstObject];
    if (firstDefaultFill) {
      [firstDefaultFill setIsEnabled:false];
    }
    
    [newBitmapLayer setRawImage:loadedImage convertColourspace:false collection:[[doc documentData] images]];
    
    const imagePixelWidth = originalImagePixelDimensions.width;
    const imagePixelHeight = originalImagePixelDimensions.height;

    [[newBitmapLayer frame] setWidth:imagePixelWidth];
    [[newBitmapLayer frame] setHeight:imagePixelHeight];
    
    [newBitmapLayer setConstrainProportions:true];

    console.log(`addNewImageLayer: Successfully added bitmap layer '${layerName}' (${imagePixelWidth}x${imagePixelHeight}).`);
  } else {
    presentUserAlert(`The image file could not be found or loaded from path: ${imageSourcePath}!`);
    console.error(`addNewImageLayer: Image file not found or failed to load: ${imageSourcePath}`);
    removeLayerFromParent(newBitmapLayer);
    return null;
  }
  
  return newBitmapLayer;
}

/**
 * Applies a bitmap image as a fill to a given Sketch layer, typically a shape group.
 * This function configures the layer's style to use the image as a pattern fill.
 *
 * @param {object} targetLayerForFill - The Sketch layer (e.g., MSShapeGroup) to receive the bitmap fill.
 * @param {string} pathToImage - The file system path to the image to be used for the fill.
 * @returns {boolean} True if the fill was successfully applied, false otherwise.
 */
function applyImageFillToShape(targetLayerForFill, pathToImage) {
  if (!targetLayerForFill || typeof targetLayerForFill.style !== 'function') {
    console.error("applyImageFillToShape: Invalid layer object provided for bitmap fill.");
    return false;
  }
  if (!pathToImage || typeof pathToImage !== 'string' || pathToImage.trim().length === 0) {
    console.error("applyImageFillToShape: Invalid image path provided for bitmap fill.");
    return false;
  }

  const fillSourceImage = [[NSImage alloc] initWithContentsOfFile:pathToImage];
  
  if (fillSourceImage) {
    if (targetLayerForFill.class() === MSShapeGroup) {
      const layerFillStylesCollection = [[targetLayerForFill style] fills];
      
      const existingFillsIterator = [[layerFillStylesCollection array] objectEnumerator];
      let currentFillElement;
      while ((currentFillElement = [existingFillsIterator nextObject])) {
        [currentFillElement setIsEnabled:false];
      }
      
      [layerFillStylesCollection addNewStylePart];
          
      const newlyAddedBitmapFill = [layerFillStylesCollection lastObject];
      const documentImageStore = [[newlyAddedBitmapFill documentData] images];
          
      const PATTERN_FILL_TYPE = 4;
      const STRETCH_PATTERN_TYPE = 1;

      [newlyAddedBitmapFill setFillType:PATTERN_FILL_TYPE];
      [newlyAddedBitmapFill setPatternImage:fillSourceImage collection:documentImageStore];
      [newlyAddedBitmapFill setPatternFillType:STRETCH_PATTERN_TYPE];
      
      console.log(`applyImageFillToShape: Bitmap fill successfully applied to layer '${targetLayerForFill.name()}'.`);
      return true;
    } else {
      console.warn(`applyImageFillToShape: Bitmap fill is intended for MSShapeGroup layers. Layer '${targetLayerForFill.name()}' is of type ${targetLayerForFill.class()}. Operation aborted.`);
      return false;
    }
  } else {
    console.error(`applyImageFillToShape: Could not load image from path '${pathToImage}' for bitmap fill.`);
    return false;
  }
}

/**
 * Fetches JSON data from a given URL using a synchronous network request and parses it.
 *
 * @param {string} remoteEndpointURL - The URL from which to retrieve JSON data.
 * @returns {object|null} The parsed JSON object, or null if the request fails, no data is received, or parsing fails.
 */
function retrieveRemoteJSONData(remoteEndpointURL) {
  if (!remoteEndpointURL || typeof remoteEndpointURL !== 'string' || remoteEndpointURL.trim().length === 0) {
    console.error("retrieveRemoteJSONData: Invalid URL provided for JSON data fetching.");
    return null;
  }

  const nsURLObject = [NSURL URLWithString:remoteEndpointURL];
  if (!nsURLObject) {
    console.error(`retrieveRemoteJSONData: Failed to create NSURL object from: '${remoteEndpointURL}'.`);
    return null;
  }

  const urlRequest = [NSURLRequest requestWithURL:nsURLObject];
  let receivedRawData = null;
  let requestError = null;
  let httpURLResponse = null;

  try {
    receivedRawData = [NSURLConnection sendSynchronousRequest:urlRequest returningResponse:nil error:nil];
  } catch (e) {
    console.error(`retrieveRemoteJSONData: Synchronous HTTP request to '${remoteEndpointURL}' failed due to an exception: ${e}`);
    return null;
  }

  if (!receivedRawData) {
    console.error(`retrieveRemoteJSONData: No data was received from URL: '${remoteEndpointURL}'. Potential network issue.`);
    return null;
  }

  let parsedJSONObject = null;
  let jsonParsingError = null;

  try {
    parsedJSONObject = [NSJSONSerialization JSONObjectWithData:receivedRawData options:nil error:nil];
  } catch (e) {
    console.error(`retrieveRemoteJSONData: JSON deserialization failed due to an exception: ${e}`);
    return null;
  }

  if (!parsedJSONObject) {
      console.error(`retrieveRemoteJSONData: Parsed JSON object is null or undefined for data from '${remoteEndpointURL}'.`);
      return null;
  }

  return parsedJSONObject;
}