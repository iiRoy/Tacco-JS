function adaptImages(  version  )
{
  // Declare all necessary variables at the beginning of the function
  var
      // This is a cached reference to the document object.
      // It helps improve performance and minification size.
      doc = document,

      // These are local variables used to save bytes during minification.
      // They store common string literals.
      getElementsByTagName = 'getElementsByTagName',
      getAttribute         = 'getAttribute',
      setAttribute         = 'setAttribute',
      length               = 'length',
      data                 = 'data-',
      alt                  = 'alt',

      // Define a default set of image versions that are supported.
      versions             = ['l','s'],

      // Check if the document body has a custom list of image versions.
      // The attribute 'data-img-versions' is used for this purpose.
      attr                 = doc.body[getAttribute](data + 'img-versions'),

      // If 'data-img-versions' is present, parse it into an array;
      // otherwise, use the default 'versions' array.
      // The attribute value is expected to be a space-separated list of versions.
      versions             = attr ? attr.split(' ') : versions,

      // Cache the length of the versions array for efficient looping later.
      versionLen           = versions[length],

      // Construct the specific data attribute name for the current version.
      // For example, if 'version' is 'l', this becomes 'data-l'.
      version              = data + version,

      // Get all 'img' elements on the page as the initial set of nodes to process.
      nodes                = doc[getElementsByTagName]('img'),

      // Cache the length of the 'nodes' array for efficient iteration.
      nodesLen             = nodes[length],

      // Declare variables for individual nodes and new image elements.
      node,
      img;


  // The following block of code handles existing 'img' tags.
  // This part is relevant if the function has run previously,
  // or if 'img' tags are already present with version attributes.
  // It ensures that images with the specified version attribute
  // have their 'src' attribute correctly set.

  // Loop through all 'img' elements found in the document.
  // The loop iterates backwards for potential performance benefits
  // when removing/modifying elements, though not strictly necessary here.
  for ( ; nodesLen--, node = nodes[nodesLen]; ) {

    // Check if the current 'img' element has the specific version attribute (e.g., 'data-l').
    if ( attr = node[getAttribute](version) ) {

      // If the attribute exists, set the 'src' of the image to the value of that attribute.
      node[setAttribute]('src', attr);

    } // End of 'if' condition for image version attribute
  } // End of 'for' loop for 'img' elements


  // This next section focuses on 'noscript' elements.
  // It's primarily for the first run of this function on a page.
  // It replaces 'noscript' elements containing version attributes
  // with actual 'img' elements.

  // First, get all 'noscript' elements from the document.
  nodes = doc[getElementsByTagName]('noscript');
  // Then, update the length for the new set of nodes.
  nodesLen = nodes[length];

  // Loop through all 'noscript' elements.
  for ( ; nodesLen--, node = nodes[nodesLen]; )
  {
    // Check if the current 'noscript' element possesses the target version attribute.
    if ( attr = node[getAttribute](version) )
    {
      // If the noscript tag has the desired version attribute,
      // proceed to create an equivalent 'img' element.

      // Create a new 'img' element dynamically.
      img = doc.createElement('img');

      // Set the 'src' attribute of the new image using the value
      // from the noscript's version attribute.
      img[setAttribute]('src', attr);

      // Copy all potential version attributes from the 'noscript' tag
      // to the newly created 'img' element.
      // This is crucial for scenarios like window resizing or orientation changes,
      // where this function might be invoked multiple times.
      // By copying all data-version attributes, the image can adapt if needed
      // in subsequent calls, even if the current call only checks for one specific version.
      // This also handles cases where a 'noscript' might only define one specific
      // version but not all possible ones.
      for ( ; versionLen--; )
      {
        // Check if the noscript has any of the defined version attributes.
        if ( attr = node[getAttribute](data + versions[versionLen]) )
        {
          // If yes, copy that attribute and its value to the new image.
          img[setAttribute](data + versions[versionLen], attr);
        }
      } // End of inner 'for' loop for copying version attributes

      // Additionally, check if a 'data-alt' attribute is present on the noscript.
      if ( attr = node[getAttribute](data + alt) )
      {
        // If it exists, copy its value to the standard 'alt' attribute of the image.
        img[setAttribute](alt, attr);
      }

      // Finally, replace the original 'noscript' element with the newly created 'img' element.
      // This effectively makes the image visible on the page.
      node.parentNode.replaceChild(img, node);
    } // End of 'if' condition for noscript version attribute
  } // End of 'for' loop for 'noscript' elements

} // End of the 'adaptImages' function definition