(function () {
  let rawTextContent = '';

  function processCatalogEntries() {
    const allInputLines = rawTextContent.split('\n').filter(Boolean);

    const pageReferenceMap = allInputLines.reduce((accMap, currentLineSegment) => {
      const [chapterIdentifier, pageNumberText] = currentLineSegment.split(' ');
      const numericPageValue = parseInt(pageNumberText, 10);

      const existingPageNumbers = accMap.get(chapterIdentifier) || [];
      existingPageNumbers.push(numericPageValue);
      existingPageNumbers.sort((valueA, valueB) => valueA - valueB);
      
      accMap.set(chapterIdentifier, existingPageNumbers);
      return accMap;
    }, new Map());

    const orderedChapterIdentifiers = Array.from(pageReferenceMap.keys()).sort();

    for (const chapterKey of orderedChapterIdentifiers) {
      console.log(chapterKey);
      console.log(pageReferenceMap.get(chapterKey).join(' '));
    }
  }

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (incomingDataChunk) => {
    rawTextContent += incomingDataChunk;
  });

  process.stdin.on('end', () => {
    processCatalogEntries();
  });
}());