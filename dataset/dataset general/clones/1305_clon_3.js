function retrieveEntityData() {
  const serviceEndpointHost = "api.randomuser.me";
  const communicationProtocol = "http";
  const apiEntryPath = "/";
  const specificParameters = "sketch=true";

  const fullTargetAddress = `${communicationProtocol}://${serviceEndpointHost}${apiEntryPath}?${specificParameters}`;

  let requestDestinationURL = NSURL.URLWithString(fullTargetAddress);
  if (!requestDestinationURL) {
    // Log an error if the URL could not be constructed, then exit
    console.error("Error: Failed to create valid NSURL from the target address.");
    return null;
  }

  // Initialize and configure the network request object
  let networkQueryObject = NSMutableURLRequest.requestWithURL_cachePolicy_timeoutInterval(
    requestDestinationURL,
    NSURLRequestReloadIgnoringLocalCacheData, // Policy to ignore local cache
    60 // Timeout interval in seconds
  );

  // Explicitly set the HTTP method for the request
  networkQueryObject.setHTTPMethod_("GET");

  let serverResponseObject = null; // Placeholder for the detailed response, not used by original logic
  let receivedBinaryData = null;

  // Execute the synchronous network call within a try-catch block for resilience
  try {
    receivedBinaryData = NSURLConnection.sendSynchronousRequest_returningResponse_error(
      networkQueryObject,
      serverResponseObject,
      null // No specific error object reference needed for this context
    );
  } catch (networkOperationException) {
    console.error(`Network operation encountered an exception: ${networkOperationException.message}`);
    return null; // Return null if network request fails
  }

  let extractedUserProfile = null; // Variable to hold the final parsed user data

  // Process the received data if available
  if (receivedBinaryData !== null && receivedBinaryData.length() > 0) {
    // Convert the raw binary data into a UTF-8 encoded string
    const stringEncodingType = NSUTF8StringEncoding;
    let dataAsReadableText = NSString.alloc().initWithData_encoding(receivedBinaryData, stringEncodingType);

    if (dataAsReadableText && dataAsReadableText.length() > 0) {
      try {
        let parsedJSONResult = JSON.parse(dataAsReadableText); // Attempt to parse the JSON string
        // Navigate through the parsed object to find the user data, with safety checks
        if (parsedJSONResult && parsedJSONResult.results && parsedJSONResult.results.length > 0) {
          extractedUserProfile = parsedJSONResult.results[0].user;
        } else {
          console.warn("Warning: No 'results' array or user object found in the JSON response structure.");
        }
      } catch (jsonParsingError) {
        console.error(`JSON parsing error: ${jsonParsingError.message}`);
      }
    } else {
      console.warn("Warning: Received data could not be converted into a meaningful string.");
    }
  } else {
    console.warn("Warning: No data was received from the network request.");
  }

  return extractedUserProfile; // Return the user profile object or null
}


function populateElementWithProfile(displayObject, personDetails) {
  // Early exit if essential inputs are missing
  if (!displayObject || !personDetails) {
    console.warn("Skipping profile population: Target display object or person details are invalid.");
    return;
  }

  const detectedLayerKind = displayObject.class();

  if (detectedLayerKind === MSTextLayer) {
    let initialTextContent = displayObject.name();
    const prefixString = "profile:";

    // Conditionally remove a specific prefix from the layer's name
    if (initialTextContent.startsWith(prefixString)) {
      initialTextContent = initialTextContent.substring(prefixString.length);
    }

    let finalRenderedText = initialTextContent;

    // Helper utility to safely retrieve and title-case a nested property
    const retrieveCapitalizedSegment = (pathSegments) => {
      let currentReference = personDetails;
      for (const segment of pathSegments) {
        if (currentReference && typeof currentReference === 'object' && currentReference.hasOwnProperty(segment)) {
          currentReference = currentReference[segment];
        } else {
          return ""; // Path segment not found
        }
      }
      return currentReference ? transformToTitleCase(String(currentReference)) : "";
    };

    // Helper utility to safely retrieve a nested property as a raw string
    const retrieveRawSegment = (pathSegments) => {
      let currentReference = personDetails;
      for (const segment of pathSegments) {
        if (currentReference && typeof currentReference === 'object' && currentReference.hasOwnProperty(segment)) {
          currentReference = currentReference[segment];
        } else {
          return ""; // Path segment not found
        }
      }
      return currentReference ? String(currentReference) : "";
    };

    // Apply replacements for various profile attributes
    finalRenderedText = finalRenderedText.replace("firstname", retrieveCapitalizedSegment(["name", "first"]));
    finalRenderedText = finalRenderedText.replace("lastname", retrieveCapitalizedSegment(["name", "last"]));
    finalRenderedText = finalRenderedText.replace("street", retrieveCapitalizedSegment(["location", "street"]));
    finalRenderedText = finalRenderedText.replace("city", retrieveCapitalizedSegment(["location", "city"]));
    finalRenderedText = finalRenderedText.replace("state", retrieveCapitalizedSegment(["location", "state"]));
    finalRenderedText = finalRenderedText.replace("zip", retrieveCapitalizedSegment(["location", "postcode"])); // Changed from 'zip' to 'postcode' for common API accuracy

    finalRenderedText = finalRenderedText.replace("email", retrieveRawSegment(["email"]));
    finalRenderedText = finalRenderedText.replace("phone", retrieveRawSegment(["phone"]));
    finalRenderedText = finalRenderedText.replace("cell", retrieveRawSegment(["cell"]));
    finalRenderedText = finalRenderedText.replace("username", retrieveRawSegment(["login", "username"]));

    // Update the Sketch text layer's string value
    displayObject.setStringValue(finalRenderedText);

  } else if (detectedLayerKind === MSBitmapLayer) {
    // If it's a bitmap layer, delegate to the image handling function
    handleProfileImageLayer(displayObject, personDetails);
  } else {
    // Inform about unhandled layer types
    console.info(`Information: Layer type '${detectedLayerKind.className()}' is not supported for text or image profile population.`);
  }
}


function handleProfileImageLayer(visualElement, personInfo) {
  // Validate critical inputs for image processing
  if (!visualElement || !personInfo || !personInfo.picture) {
    console.warn("Image processing aborted: Visual element or profile image URL is missing.");
    return;
  }

  const imageUrlCandidate = personInfo.picture;
  const remoteAssetLocation = NSURL.URLWithString(imageUrlCandidate);

  if (!remoteAssetLocation) {
    console.error(`Error: Could not form a valid URL from the provided string: ${imageUrlCandidate}`);
    return;
  }

  const fetchedImageAsset = NSImage.alloc().initWithContentsOfURL(remoteAssetLocation);

  if (!fetchedImageAsset) {
    console.error(`Error: Failed to download image from URL: ${imageUrlCandidate}`);
    return;
  }

  let documentAssetCollection;
  // Attempt to access the document's image collection. This is a critical step
  // and a revision from the original's potentially problematic `MSImageCollection.alloc().init()`
  try {
    documentAssetCollection = visualElement.documentData().images();
  } catch (collectionError) {
    console.error(`Error: Unable to access the document's image collection: ${collectionError.message}`);
    return; // Cannot proceed without a valid image collection
  }

  const uniqueImageTag = "user_profile_avatar"; // A unique name for the image asset
  const colorSpaceConversionRequired = false; // Based on original code's `convertColourspace:false`

  // Add the downloaded image to the Sketch document's central image collection
  const registeredDocumentImage = documentAssetCollection.addImage_name_convertColourspace(
    fetchedImageAsset,
    uniqueImageTag,
    colorSpaceConversionRequired
  );

  if (!registeredDocumentImage) {
    console.error("Error: Failed to register the downloaded image with the document's asset collection.");
    return;
  }

  let newGraphicLayer = null; // Variable for a newly created image layer

  if (visualElement.class() === MSBitmapLayer) {
    // Case 1: Updating an existing bitmap layer
    visualElement.setIsVisible(false); // Temporarily hide the layer during modification
    visualElement.setPrimitiveImage(registeredDocumentImage); // Assign the new image
    visualElement.setIsVisible(true); // Restore visibility
    console.log("Success: Existing bitmap layer updated with new profile image.");
  } else {
    // Case 2: Creating a new bitmap layer within the provided visualElement (assumed to be a group/page)
    const newLayerDisplayName = "profile:avatar";
    const parentBoundingBox = visualElement.frame(); // Use the parent's frame as a reference for initial placement

    newGraphicLayer = MSBitmapLayer.alloc().initWithImage_parentFrame_name(
      registeredDocumentImage,
      parentBoundingBox,
      newLayerDisplayName
    );

    if (newGraphicLayer) {
      visualElement.addLayer(newGraphicLayer); // Add the newly created layer to its parent

      // Adjust the frame properties of the new image layer for consistent sizing
      let layerFrameProperties = newGraphicLayer.frame();

      // Set position relative to the parent's top-left corner
      layerFrameProperties.setX(0);
      layerFrameProperties.setY(0);

      // Set fixed dimensions while managing proportion constraints
      layerFrameProperties.setConstrainProportions(false); // Temporarily disable to set independent dimensions
      layerFrameProperties.setHeight(200);
      layerFrameProperties.setWidth(200);
      layerFrameProperties.setConstrainProportions(true); // Re-enable to maintain aspect ratio for future scaling

      console.log(`Success: New avatar layer '${newLayerDisplayName}' created and positioned within parent.`);
    } else {
      console.error("Error: Failed to instantiate a new bitmap layer for the avatar graphic.");
    }
  }
}


function transformToTitleCase(rawText) {
  // Perform input validation to ensure 'rawText' is a non-empty string
  if (typeof rawText !== 'string' || rawText.length === 0) {
    return ""; // Return an empty string for invalid or empty inputs
  }

  // Use a regular expression to identify words and apply title case transformation
  const modifiedText = rawText.replace(/\b\w+/g, (matchedWord) => {
    // Extract the first character and convert to uppercase
    const initialCharacter = matchedWord.charAt(0).toUpperCase();
    // Extract the rest of the word and convert to lowercase
    const remainingCharacters = matchedWord.substring(1).toLowerCase();
    // Recombine and return the title-cased word
    return initialCharacter + remainingCharacters;
  });

  return modifiedText;
}