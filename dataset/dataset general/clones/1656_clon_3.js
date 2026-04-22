const PSEUDO_COMMA_TOKEN = '~';

const MATCHES_PSEUDO_EXTRACTOR = /:(matches)\(([^()]+)\)/g;

module.exports = () => {

  const generateCartesianExpansions = (baseSegment, placeholdersToReplace, valueOptionSets, resultArray) => {
    const maxExpansionLevel = placeholdersToReplace.length - 1;

    // Inner recursive function to build combinations
    const buildCombinations = (currentPartialSegment, currentLevel) => {
      // If we've processed all levels, this is a complete combination.
      if (currentLevel > maxExpansionLevel) {
        resultArray.push(currentPartialSegment);
        return;
      }

      const currentPlaceholder = placeholdersToReplace[currentLevel];
      const currentOptions = valueOptionSets[currentLevel];

      for (const option of currentOptions) {
        // Replace the current placeholder with one of its options.
        const nextPartialSegment = currentPartialSegment.replace(currentPlaceholder, option);

        // Recurse to the next level of placeholders.
        buildCombinations(nextPartialSegment, currentLevel + 1);
      }
    };

    // Start the recursive process from the first level (index 0).
    buildCombinations(baseSegment, 0);
  };

  return (stylesheetAST) => {
    if (!stylesheetAST || !Array.isArray(stylesheetAST.rules)) {
      console.warn("Stylesheet AST is missing or has no rules to process.");
      return;
    }

    const processRuleTree = (currentRuleNode) => {
      if (currentRuleNode.rules && Array.isArray(currentRuleNode.rules)) {
        currentRuleNode.rules.forEach(processRuleTree);
      }

      if (!currentRuleNode.selectors || !Array.isArray(currentRuleNode.selectors)) {
        return;
      }

      // Pre-process selectors: Temporarily replace commas within :matches()
      // to prevent PostCSS from splitting them prematurely.
      let initialSelectorStrings = currentRuleNode.selectors.join(',').replace(
        /:matches\([^)]+\)/g,
        (pseudoBlock) => pseudoBlock.replace(/,/g, PSEUDO_COMMA_TOKEN)
      ).split(',');

      let expandedSelectorsBuffer = [];
      let containsMatchesPseudo = false;

      for (const originalSegment of initialSelectorStrings) {
        if (!originalSegment.includes(':matches(')) {
          expandedSelectorsBuffer.push(originalSegment);
          continue;
        }

        containsMatchesPseudo = true;

        const pseudoBlocksFound = [];
        const pseudoContentLists = [];

        MATCHES_PSEUDO_EXTRACTOR.lastIndex = 0;
        let regexMatch;
        let previousMatchEnd = -1;

        while ((regexMatch = MATCHES_PSEUDO_EXTRACTOR.exec(originalSegment)) !== null) {
          const pseudoKeyword = regexMatch[1];
          const pseudoContent = regexMatch[2];

          if (pseudoKeyword === 'matches') {
            if (pseudoContent.includes(':matches(') || pseudoContent.includes(':not(')) {
              throw new Error(
                `Invalid nesting in selector: Cannot place :matches() or :not() inside another :matches(). ` +
                `Offending selector: ${originalSegment.replace(new RegExp(PSEUDO_COMMA_TOKEN, 'g'), ',')}`
              );
            }

            if (previousMatchEnd === regexMatch.index) {
              throw new Error(
                `Malformed selector: Found sequential :matches() pseudo-classes without intervening text. ` +
                `Offending selector: ${originalSegment.replace(new RegExp(PSEUDO_COMMA_TOKEN, 'g'), ',')}`
              );
            }
          } else {
             console.warn(`Unexpected pseudo-class '${pseudoKeyword}' found by extractor in selector: ${originalSegment}`);
             continue;
          }

          pseudoBlocksFound.push(regexMatch[0]);
          pseudoContentLists.push(pseudoContent.split(PSEUDO_COMMA_TOKEN));

          previousMatchEnd = MATCHES_PSEUDO_EXTRACTOR.lastIndex;
        }

        generateCartesianExpansions(originalSegment, pseudoBlocksFound, pseudoContentLists, expandedSelectorsBuffer);
      }

      if (containsMatchesPseudo) {
        currentRuleNode.selectors = expandedSelectorsBuffer
          .filter(s => !s.includes(':matches('))
          .map(s => s.replace(new RegExp(PSEUDO_COMMA_TOKEN, 'g'), ','));
      }
    };

    processRuleTree(stylesheetAST);
  };
};