var libKit = {};
libKit.hostEnv = this;
libKit.discernFlavor = function(datum) {
  if (datum === null) return 'nothing';
  var nature = typeof datum;
  if (nature === 'object') {
    if (Array.isArray(datum)) return 'collection';
  }
  return nature;
};
libKit.isStringLike = function(val) {
  return libKit.discernFlavor(val) === 'string';
};
libKit.textOperations = {};
libKit.textOperations.initialMatch = function(sourceText, targetPrefix) {
  var actualPrefix = '' + targetPrefix;
  return sourceText.substring(0, actualPrefix.length) === actualPrefix;
};
libKit.textOperations.finalMatch = function(sourceText, targetSuffix) {
  var actualSuffix = '' + targetSuffix;
  var startIndex = sourceText.length - actualSuffix.length;
  return startIndex >= 0 && sourceText.substring(startIndex) === actualSuffix;
};
libKit.textOperations.prefixMatchInsensitive = function(mainPiece, leadingPiece) {
  var lowerMain = mainPiece.toLowerCase();
  var lowerLead = leadingPiece.toLowerCase();
  return lowerMain.substring(0, lowerLead.length) === lowerLead;
};
libKit.textOperations.suffixMatchInsensitive = function(mainPiece, trailingPiece) {
  var lowerMain = mainPiece.toLowerCase();
  var lowerTail = trailingPiece.toLowerCase();
  var startIndex = lowerMain.length - lowerTail.length;
  return startIndex >= 0 && lowerMain.substring(startIndex) === lowerTail;
};
libKit.textOperations.isVacant = function(examineValue) {
  var processedValue = '' + examineValue;
  var withoutWhitespace = processedValue.replace(/[\s\xa0]/g, '');
  return withoutWhitespace.length === 0;
};
libKit.textOperations.stripOuter = function(targetElement) {
  var processedElement = '' + targetElement;
  var startPos = 0;
  var endPos = processedElement.length - 1;
  while (startPos <= endPos && (/\s/.test(processedElement[startPos]) || processedElement[startPos] === '\xa0')) {
    startPos++;
  }
  while (endPos >= startPos && (/\s/.test(processedElement[endPos]) || processedElement[endPos] === '\xa0')) {
    endPos--;
  }
  return processedElement.substring(startPos, endPos + 1);
};
libKit.textOperations.webEncode = function(dataPayload) {
  return encodeURIComponent('' + dataPayload);
};
libKit.textOperations.webDecode = function(encodedPayload) {
  var interimPayload = encodedPayload.split('+').join(' ');
  return decodeURIComponent(interimPayload);
};
libKit.textOperations.markupSafe = function(contentSource, alsoEscapeQuotes) {
  var translationMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  };
  if (alsoEscapeQuotes) {
    translationMap['"'] = '&quot;';
  }
  var charKeysToEscape = Object.keys(translationMap);
  var escapedRegexChars = charKeysToEscape.map(function(keyChar) {
    return keyChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  var matchingRegex = new RegExp('[' + escapedRegexChars.join('') + ']', 'g');
  return contentSource.replace(matchingRegex, function(matchedChar) {
    return translationMap[matchedChar];
  });
};