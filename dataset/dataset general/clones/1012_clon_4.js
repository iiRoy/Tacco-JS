function extractQueryParameters(sourceText, keyFilter) {
  if (!sourceText || sourceText.length === 0) {
    return undefined;
  }

  const refinedSource = sourceText.startsWith('?') ? sourceText.slice(1) : sourceText;

  if (refinedSource.length === 0) {
      return undefined;
  }

  const gatheredAttributes = refinedSource.split('&').reduce((collection, elementSegment) => {
    if (elementSegment === '') {
      return collection;
    }

    const valueDividerPosition = elementSegment.indexOf('=');
    let attributeName;
    let attributeValue;

    if (valueDividerPosition > -1) {
      attributeName = elementSegment.substring(0, valueDividerPosition);
      attributeValue = elementSegment.substring(valueDividerPosition + 1);
    } else {
      attributeName = elementSegment;
      attributeValue = undefined;
    }

    const decodedName = decodeURIComponent(attributeName.replace(/\+/g, ' '));
    const decodedValue = attributeValue === undefined ? undefined : decodeURIComponent(attributeValue.replace(/\+/g, ' '));

    collection[decodedName] = decodedValue;
    return collection;
  }, {});

  if (keyFilter === undefined) {
    return gatheredAttributes;
  } else if (typeof keyFilter === 'string') {
    return gatheredAttributes[keyFilter];
  } else if (Array.isArray(keyFilter)) {
    return keyFilter.reduce((filteredCollection, requestedKey) => {
      if (Object.prototype.hasOwnProperty.call(gatheredAttributes, requestedKey)) {
        filteredCollection[requestedKey] = gatheredAttributes[requestedKey];
      }
      return filteredCollection;
    }, {});
  }

  return gatheredAttributes;
}