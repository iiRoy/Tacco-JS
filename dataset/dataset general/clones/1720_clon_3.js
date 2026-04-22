function updateResponsiveImages(desiredVariantIdentifier) {
  // Ensure the document and its body are available before proceeding with DOM operations.
  // This acts as a primary guard clause for environments where DOM might not exist or be fully loaded.
  if (typeof document === 'undefined' || !document.body) {
    console.warn('Responsive image adaptation skipped: Document or document.body is not accessible.');
    return;
  }

  // Reference to the global document object for consistent access.
  const domContext = document;

  // Object to centralize string constants for frequently used DOM method names.
  const DOM_ACCESSORS = {
    ELEMENTS_BY_TAG: 'getElementsByTagName',
    GET_PROPERTY: 'getAttribute',
    SET_PROPERTY: 'setAttribute',
    CREATE_ELEMENT: 'createElement'
  };

  // Object to store string constants for attribute keys and prefixes.
  const ATTRIBUTE_IDENTIFIERS = {
    DATA_PREFIX: 'data-', // Universal prefix for custom data attributes.
    ALT_TEXT: 'alt',      // Standard HTML alt attribute.
    VARIANT_LIST_KEY: 'img-versions' // Custom attribute key for defining supported variants.
  };

  // Default list of supported image variants (e.g., 'l' for large, 's' for small).
  let availableVariants = ['l', 's'];

  // Attempt to fetch a custom list of supported variants from a data attribute on the document body.
  const customVariantString = domContext.body[DOM_ACCESSORS.GET_PROPERTY](
    ATTRIBUTE_IDENTIFIERS.DATA_PREFIX + ATTRIBUTE_IDENTIFIERS.VARIANT_LIST_KEY
  );

  // If a custom list is found and is not empty, override the default availableVariants.
  if (customVariantString) {
    const parsedCustomVariants = customVariantString.trim().split(/\s+/); // Split by one or more spaces.
    if (parsedCustomVariants.length > 0) {
      availableVariants = parsedCustomVariants;
    }
  }

  // Construct the full attribute name for the desired image variant (e.g., 'data-l').
  const targetSourceProperty = ATTRIBUTE_IDENTIFIERS.DATA_PREFIX + desiredVariantIdentifier;

  // Optional: Log a message if the requested variant is not explicitly listed as supported.
  // The function will still attempt to apply it if the attribute exists.
  if (!availableVariants.includes(desiredVariantIdentifier)) {
    console.info(`Note: Requested variant '${desiredVariantIdentifier}' is not explicitly listed in supported variants [${availableVariants.join(', ')}].`);
  }

  // Helper function to safely copy a data attribute from a source element to a target element.
  const transferDataAttribute = (sourceElement, destinationElement, attributeKey) => {
    const fullAttributeName = ATTRIBUTE_IDENTIFIERS.DATA_PREFIX + attributeKey;
    const attributeValue = sourceElement[DOM_ACCESSORS.GET_PROPERTY](fullAttributeName);
    if (attributeValue !== null) { // Check for null explicitly as getAttribute can return null.
      destinationElement[DOM_ACCESSORS.SET_PROPERTY](fullAttributeName, attributeValue);
    }
  };

  // --- Phase 1: Update existing <img> elements ---
  // Iterate through all <img> tags already present in the document.
  const currentImageElements = domContext[DOM_ACCESSORS.ELEMENTS_BY_TAG]('img');
  // Loop backwards to avoid issues if elements were removed or modified mid-iteration (though not directly happening here).
  for (let i = currentImageElements.length - 1; i >= 0; i--) {
    const imgElement = currentImageElements[i];
    const newImageSrcCandidate = imgElement[DOM_ACCESSORS.GET_PROPERTY](targetSourceProperty);

    // If the <img> has a 'data-variant' attribute matching the desired variant, update its 'src'.
    if (newImageSrcCandidate) {
      imgElement[DOM_ACCESSORS.SET_PROPERTY]('src', newImageSrcCandidate);
    }
  }

  // --- Phase 2: Convert <noscript> placeholders into <img> elements ---
  // Retrieve all <noscript> elements. These are typically used for content that should only be
  // displayed if JavaScript is disabled, or as placeholders for JS-driven content.
  const noscriptPlaceholders = domContext[DOM_ACCESSORS.ELEMENTS_BY_TAG]('noscript');

  for (let i = noscriptPlaceholders.length - 1; i >= 0; i--) {
    const currentNoscript = noscriptPlaceholders[i];
    const provisionalSrc = currentNoscript[DOM_ACCESSORS.GET_PROPERTY](targetSourceProperty);

    // Proceed only if the <noscript> tag contains the specific data attribute for the desired variant.
    if (provisionalSrc) {
      // Create a brand new <img> element to substitute the <noscript>.
      const createdImageElement = domContext[DOM_ACCESSORS.CREATE_ELEMENT]('img');
      createdImageElement[DOM_ACCESSORS.SET_PROPERTY]('src', provisionalSrc);

      // Copy all variant-specific data attributes from the <noscript> to the new <img>.
      // This ensures that if updateResponsiveImages is called again (e.g., on window resize/orientation change),
      // the new <img> can still be updated based on its own data attributes.
      for (const variantKey of availableVariants) {
        transferDataAttribute(currentNoscript, createdImageElement, variantKey);
      }

      // If a 'data-alt' attribute is present on the <noscript>, transfer its value to the <img>'s 'alt' attribute.
      const altContentValue = currentNoscript[DOM_ACCESSORS.GET_PROPERTY](
        ATTRIBUTE_IDENTIFIERS.DATA_PREFIX + ATTRIBUTE_IDENTIFIERS.ALT_TEXT
      );
      if (altContentValue !== null) {
        createdImageElement[DOM_ACCESSORS.SET_PROPERTY](ATTRIBUTE_IDENTIFIERS.ALT_TEXT, altContentValue);
      }

      // Final step: replace the <noscript> element with the newly constructed <img> element in the DOM.
      // A guard is added to ensure the parent node exists before attempting replacement.
      if (currentNoscript.parentNode) {
        currentNoscript.parentNode.replaceChild(createdImageElement, currentNoscript);
      } else {
        console.warn('Orphaned <noscript> element found, cannot replace:', currentNoscript);
      }
    }
  }
}