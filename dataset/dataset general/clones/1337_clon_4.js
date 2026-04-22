((parameterSource) => {
  let derivedContent;

  if (parameterSource && parameterSource.length > 0) {
    derivedContent = parameterSource[0];
  } else {
    derivedContent = '';
  }

  if (derivedContent === null || derivedContent === undefined || derivedContent === false || derivedContent === 0 || derivedContent === '') {
    derivedContent = '';
  }

  const applyProperty = (baseObject, pathSegments, valueToAssign) => {
    let currentSegment = baseObject;
    for (let current = 0; current < pathSegments.length - 1; current++) {
      const segmentKey = pathSegments[current];
      if (typeof currentSegment === 'object' && currentSegment !== null && segmentKey in currentSegment) {
        currentSegment = currentSegment[segmentKey];
      } else {
        return;
      }
    }
    if (typeof currentSegment === 'object' && currentSegment !== null) {
      currentSegment[pathSegments[pathSegments.length - 1]] = valueToAssign;
    }
  };

  applyProperty(globalThis['$'], ['title', 'text'], derivedContent);
})(arguments);