const processWordSequence = (segments) => {
  if (segments.length === 0 || segments[0] === '') {
    return [];
  }

  const initialAccumulation = {
    foundElements: [segments[0]],
    completionStatus: false
  };

  const finalAccumulation = segments.slice(1).reduce((accumulation, currentElement) => {
    if (accumulation.completionStatus) {
      return accumulation;
    }

    if (currentElement === '') {
      return { ...accumulation, completionStatus: true };
    }

    const previousElement = accumulation.foundElements[accumulation.foundElements.length - 1];
    const lastLetterOfPrevious = previousElement[previousElement.length - 1];
    const firstLetterOfCurrent = currentElement[0];

    if (lastLetterOfPrevious === firstLetterOfCurrent) {
      return { ...accumulation, foundElements: [...accumulation.foundElements, currentElement] };
    } else {
      return { ...accumulation, completionStatus: true };
    }
  }, initialAccumulation);

  return finalAccumulation.foundElements;
};