function adjustVisuals (visualFlavor) {
  var
    // Obtain a reference to the current document object
    pageRef = document,
    
    // Assign common DOM method names to short variables for efficiency
    elementTagFetcher = 'getElementsByTagName',
    attrRetriever = 'getAttribute',
    attrSetter = 'setAttribute',
    itemCount = 'length',
    customPrefix = 'custom-',
    altAttr = 'alt',
    
    // Define the default set of supported image modes
    supportedModes = ['large','small'],
    // Check if the document body specifies custom image modes
    bodyConfig = pageRef.body[attrRetriever](customPrefix + 'media-formats'),
    // If custom modes are found, use them; otherwise, stick to defaults
    supportedModes = bodyConfig ? bodyConfig.split(' ') : supportedModes,
    // Store the count of supported modes for loop iterations
    modeCount = supportedModes[itemCount],
    
    // Construct the specific attribute key for the current visual flavor
    targetModeKey = customPrefix + visualFlavor,
    
    // Get all image elements present in the current document
    domElements = pageRef[elementTagFetcher]('img'),
    // Store the total number of image elements for looping
    elementsLength = domElements[itemCount],
    currentDomElement,
    newVisualElement;
  
  // This section handles scenarios where the function runs multiple times.
  // It processes existing <img> tags to update their 'src' based on the
  // requested 'visualFlavor'.
  
  // Iterate through all image elements in the document
  for ( ; elementsLength--, currentDomElement = domElements[elementsLength]; )
    // If an image element possesses the attribute for the current flavor
    if ( bodyConfig = currentDomElement[attrRetriever](targetModeKey) )
      // Update the image's source attribute with the value from the flavor attribute
      currentDomElement[attrSetter]('src', bodyConfig);
  
  // This part is for the initial execution of the function.
  // It finds <noscript> elements that specify image versions and
  // replaces them with corresponding <img> elements.
  
  for (
    domElements = pageRef[elementTagFetcher]('noscript'), elementsLength = domElements[itemCount];
    elementsLength--, currentDomElement = domElements[elementsLength];
  )
    // Check if the noscript element has the attribute for the current visual flavor
    if ( bodyConfig = currentDomElement[attrRetriever](targetModeKey) ) {
      // If found, create a new image element to substitute the noscript tag
      newVisualElement = pageRef.createElement('img');
      newVisualElement[attrSetter]('src', bodyConfig); // Set the source based on the flavor attribute
      
      // Transfer all custom mode attributes from the noscript to the new img element.
      // This is crucial for responsive design, allowing subsequent calls to adjustVisuals
      // (e.g., on window resize) to find all necessary mode attributes on the <img> itself.
      // It prevents issues if a <noscript> only defines a subset of mode attributes.
      for ( ; modeCount--; )
        if ( bodyConfig = currentDomElement[attrRetriever](customPrefix + supportedModes[modeCount]) )
          newVisualElement[attrSetter](customPrefix + supportedModes[modeCount], bodyConfig);
      
      // If a custom alternative text attribute is present, copy it to the img's alt attribute
      if ( bodyConfig = currentDomElement[attrRetriever](customPrefix + altAttr) )
        newVisualElement[attrSetter](altAttr, bodyConfig);
      
      // Replace the old noscript element with the newly created image element
      currentDomElement.parentNode.replaceChild(newVisualElement, currentDomElement);
    }
}