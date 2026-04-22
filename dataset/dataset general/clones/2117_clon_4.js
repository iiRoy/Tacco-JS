function processTemplate(templateText, ...substituentValues) {
  let collectedSegments = [];
  let currentLiteralSegment = '';
  let parsingPlaceholder = false;
  let placeholderIndexDigits = '';

  for (let charIndex = 0; charIndex < templateText.length; charIndex++) {
    let currentCharacter = templateText[charIndex];

    if (currentCharacter === '{' && !parsingPlaceholder) {
      parsingPlaceholder = true;
      if (currentLiteralSegment.length > 0) {
        collectedSegments.push(currentLiteralSegment);
        currentLiteralSegment = '';
      }
      placeholderIndexDigits = '';
    } else if (currentCharacter === '}' && parsingPlaceholder) {
      parsingPlaceholder = false;
      let targetIndex = Number(placeholderIndexDigits);
      
      if (!Number.isNaN(targetIndex) && targetIndex >= 0 && targetIndex < substituentValues.length) {
        collectedSegments.push(String(substituentValues[targetIndex]));
      } else {
        collectedSegments.push('{' + placeholderIndexDigits + '}');
      }
      placeholderIndexDigits = '';
    } else if (parsingPlaceholder) {
      if (currentCharacter >= '0' && currentCharacter <= '9') {
        placeholderIndexDigits += currentCharacter;
      } else {
        collectedSegments.push('{');
        collectedSegments.push(placeholderIndexDigits);
        collectedSegments.push(currentCharacter);
        currentLiteralSegment = '';
        parsingPlaceholder = false;
        placeholderIndexDigits = '';
      }
    } else {
      currentLiteralSegment += currentCharacter;
    }
  }

  if (currentLiteralSegment.length > 0) {
    collectedSegments.push(currentLiteralSegment);
  }
  if (parsingPlaceholder) {
    collectedSegments.push('{' + placeholderIndexDigits);
  }

  return collectedSegments.join('');
}