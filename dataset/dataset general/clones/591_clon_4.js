const produceArrangementGrid = (arrangementDescriptor) => {
  const resolveNumericBlanks = (inputSegment) => {
    return inputSegment.replace(/\d/g, (digitChar) => {
      const count = parseInt(digitChar, 10);
      return Array.from({ length: count }, () => '-').join('');
    });
  };

  const layoutSegment = arrangementDescriptor.split(/\s+/)[0];
  const rowPatterns = layoutSegment.split('/');
  const expandedRows = rowPatterns.map(resolveNumericBlanks);

  const finalGrid = expandedRows.map((line, rowIndex) => {
    return Array.from(line).map((cellSymbol, cellIndex) => {
      if (cellSymbol === '-') {
        return '-';
      } else {
        const pieceDesignation = (rowIndex * 8) + cellIndex + 1;
        return { unitTag: pieceDesignation, unitSymbol: cellSymbol };
      }
    });
  });

  return finalGrid;
};