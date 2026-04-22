var SEPARATOR_MARKER = '#';
var FINDER_REGEX = /:matches\(([^\(\)]+)\)/g;

module.exports = function () {
  function generatePermutations(baseTarget, partsToSubstitute, replacementOptions, collectionOutput) {
    var maxDepth = partsToSubstitute.length - 1;

    function recursiveBuilder(currentEntry, currentDepth) {
      for (var subOptIdx = 0, optCount = replacementOptions[currentDepth].length; subOptIdx < optCount; subOptIdx++) {
        var nextSegment = currentEntry.replace(partsToSubstitute[currentDepth], replacementOptions[currentDepth][subOptIdx]);
        if (currentDepth === maxDepth) {
          collectionOutput.push(nextSegment);
        } else {
          recursiveBuilder(nextSegment, currentDepth + 1);
        }
      }
    }

    recursiveBuilder(baseTarget, 0);
    return collectionOutput;
  }

  function isSimpleSelector(checkTarget) {
    return checkTarget.indexOf(':matches(') === -1;
  }

  return function (stylesheetNode) {
    stylesheetNode.rules.forEach(function processRuleBlock(declarationUnit) {
      if (declarationUnit.rules) {
        declarationUnit.rules.forEach(processRuleBlock);
      }

      if (!declarationUnit.selectors) {
        return;
      }

      var resolvedSelections = declarationUnit.selectors.join(',')
        .replace(/:matches\(.*?\)/g, function (foundSubstring) {
          return foundSubstring.replace(/,/g, SEPARATOR_MARKER);
        })
        .split(',');

      declarationUnit.selectors = resolvedSelections;
      declarationUnit.selectors.forEach(function analyzeSelectorPart(currentSelection, selectionIndex) {
        var patternMatch;
        var componentOptions = [];
        var capturedPatterns = [];
        var priorPosition;

        if (currentSelection.indexOf(':matches(') !== -1) {
          FINDER_REGEX.lastIndex = 0; // Reset regex state for current selector.

          while (patternMatch = FINDER_REGEX.exec(currentSelection)) {
            if (patternMatch[1].indexOf(':matches(') !== -1 || patternMatch[1].indexOf(':not(') !== -1) {
              throw new Error(
                'Nesting :matches() or :not() within :matches() is not supported: ' +
                currentSelection.replace(new RegExp(SEPARATOR_MARKER, 'g'), ',')
              );
            } else if (priorPosition === patternMatch.index) {
              throw new Error(
                'Sequential :matches() pseudo-classes are not allowed: ' +
                currentSelection.replace(new RegExp(SEPARATOR_MARKER, 'g'), ',')
              );
            }

            capturedPatterns.push(patternMatch[0]);
            componentOptions.push(patternMatch[1].split(SEPARATOR_MARKER));
            priorPosition = FINDER_REGEX.lastIndex;
          }

          generatePermutations(currentSelection, capturedPatterns, componentOptions, declarationUnit.selectors);
        }
      });

      declarationUnit.selectors = declarationUnit.selectors.filter(isSimpleSelector);
    });
  };
};