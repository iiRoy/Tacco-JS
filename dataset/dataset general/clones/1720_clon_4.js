var processVisuals = (currentVariant) => {
  const htmlDocument = document;
  const dataPrefix = 'data-';
  const alternativeText = 'alt';

  const defaultVariants = ['l', 's'];
  const bodyVariantAttribute = htmlDocument.body.getAttribute(dataPrefix + 'img-variants');
  const supportedVariants = bodyVariantAttribute ? bodyVariantAttribute.split(' ') : defaultVariants;

  const targetVariantAttributeName = currentVariant; // dataset handles the 'data-' prefix

  // Handle existing image elements
  Array.from(htmlDocument.querySelectorAll('img')).forEach(visualElement => {
    const variantSource = visualElement.dataset[targetVariantAttributeName];
    if (variantSource) {
      visualElement.src = variantSource;
    }
  });

  // Handle noscript placeholders
  Array.from(htmlDocument.querySelectorAll('noscript')).forEach(placeholderElement => {
    const placeholderSource = placeholderElement.dataset[targetVariantAttributeName];

    if (placeholderSource) {
      const newVisualElement = htmlDocument.createElement('img');
      newVisualElement.src = placeholderSource;

      // Copy all supported data-variant attributes
      supportedVariants.forEach(variantKey => {
        const dataValue = placeholderElement.dataset[variantKey];
        if (dataValue !== undefined) {
          newVisualElement.dataset[variantKey] = dataValue;
        }
      });

      // Copy data-alt to alt attribute
      const altValue = placeholderElement.dataset[alternativeText];
      if (altValue !== undefined) {
        newVisualElement.alt = altValue;
      }

      // Replace the noscript tag with the new image
      placeholderElement.parentNode.replaceChild(newVisualElement, placeholderElement);
    }
  });
};