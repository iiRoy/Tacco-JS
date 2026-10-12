'use strict';
(function(stdin) {
  // Helper function to generate a rectangle pattern based on dimensions
  function createPattern(dims) {
    const HASH_CHAR = '#';
    const DOT_CHAR = '.';
    const rectWidth = dims[0];
    const rectHeight = dims[1];

    // Inner helper to create a row composed entirely of hash characters
    const createBorderRowString = (width) => {
      if (width <= 0) {
        return '';
      }
      return Array.from({ length: width }, () => HASH_CHAR).join('');
    };

    // Inner helper to create a row with hash characters at ends and dots in middle
    const createInnerRowString = (width) => {
      if (width <= 0) {
        return '';
      }
      if (width === 1) {
        return HASH_CHAR;
      }
      if (width === 2) {
        return HASH_CHAR + HASH_CHAR;
      }
      const middleDots = Array.from({ length: width - 2 }, () => DOT_CHAR).join('');
      return HASH_CHAR + middleDots + HASH_CHAR;
    };

    const borderRowString = createBorderRowString(rectWidth);
    const innerRowString = createInnerRowString(rectWidth);

    // Handle different height scenarios to match original logic's output
    if (rectHeight <= 0) {
        return ''; // No rows for non-positive height
    } else if (rectHeight === 1 || rectHeight === 2) {
        // Original code for h=1 or h=2 produces two border lines
        return [borderRowString, borderRowString].join('\n');
    } else {
        // For h > 2: one border, (h-2) inner, one border
        const middleRows = Array.from({ length: rectHeight - 2 }, () => innerRowString);
        return [borderRowString, ...middleRows, borderRowString].join('\n');
    }
  }

  // Constants for input processing
  const TERMINATOR_SEQUENCE = '0 0';
  const NEWLINE_SEPARATOR = '\n';
  const SPACE_SEPARATOR = ' ';

  // Helper function to parse a single line of dimension strings into numbers
  const parseDimensionString = (dimensionString) => {
    return dimensionString.split(SPACE_SEPARATOR).map(Number);
  };

  // Read raw input from stdin
  const rawInputContent = stdin.toString();
  const trimmedInput = rawInputContent.trim();
  const rawInputLines = trimmedInput.split(NEWLINE_SEPARATOR);

  // Locate the '0 0' terminator and extract relevant input lines
  const terminatorIndex = rawInputLines.indexOf(TERMINATOR_SEQUENCE);
  const relevantInputLines = rawInputLines.slice(0, terminatorIndex);

  // Parse all dimension pairs from the relevant lines
  const parsedDimensionsList = relevantInputLines.map(parseDimensionString);

  // Generate all rectangle patterns and join them with double newlines
  const finalRenderedOutput = parsedDimensionsList.map(createPattern).join(NEWLINE_SEPARATOR + NEWLINE_SEPARATOR);

  // Display the final combined output to console
  console.log(finalRenderedOutput);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
