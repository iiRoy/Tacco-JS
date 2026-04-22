(function() {

  // --- Utility Functions ---

  // Converts a NodeList or similar array-like object to a proper Array.
  function convertToStandardArray(iterableObject) {
    return Array.from(iterableObject);
  }

  // Extracts a specific property value from each object in an array.
  function retrievePropertyValues(collection, propertyName) {
    return convertToStandardArray(collection).map(item => item[propertyName]);
  }

  // Creates a text node.
  function makeTextNode(content) {
    return document.createTextNode(content);
  }

  // Creates a document fragment, optionally appending a node.
  function createDocFragment(initialNode) {
    const fragment = document.createDocumentFragment();
    if (initialNode) fragment.appendChild(initialNode);
    return fragment;
  }

  // Creates a span element with a specific class and text content.
  function makeMarkedSpan(textContent) {
    const spanElement = document.createElement('span');
    spanElement.appendChild(makeTextNode(textContent));
    spanElement.className = 'x';
    return spanElement;
  }

  // Debounce function to prevent rapid calls to a callback.
  function createDebouncedAction(callbackFunction, delayMillis = 100) {
    let timeoutHandle;
    let lastContext;
    let lastArguments;

    function invokeCallback() {
      timeoutHandle = null;
      callbackFunction.apply(lastContext, lastArguments);
    }

    return function(...args) {
      lastContext = this;
      lastArguments = args;
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
      timeoutHandle = setTimeout(invokeCallback, delayMillis);
    };
  }


  // --- Text Comparison Engine (Renamed and Refactored diff-match-patch) ---

  const TextComparisonUtility = (function() {

    // Internal constants for operation types
    const TEXT_OP_DELETE = -1;
    const TEXT_OP_INSERT = 1;
    const TEXT_OP_EQUAL = 0;

    /**
     * Core class for text comparison operations.
     */
    function TextComparisonEngine() {
      this.comparisonTimeoutDuration = 1.0; // seconds
      this.editOperationPenalty = 4;
      this.similarityThreshold = 0.5;
      this.searchDistance = 1000;
      this.deletionMatchThreshold = 0.5;
      this.contextMargin = 4;
      this.maxBitValue = 32; // For Match_MaxBits
    }

    /**
     * Calculates the differences between two texts.
     * @param {string} firstText Old string.
     * @param {string} secondText New string.
     * @param {boolean=} checkLineDivisions Optional speedup flag.
     * @param {number} operationDeadline Optional internal deadline.
     * @return {!Array.<!Array>} Array of diff tuples.
     */
    TextComparisonEngine.prototype.calculateDifferences = function(firstText, secondText, checkLineDivisions, operationDeadline) {
      if (typeof operationDeadline === 'undefined') {
        if (this.comparisonTimeoutDuration <= 0) {
          operationDeadline = Number.MAX_VALUE;
        } else {
          operationDeadline = (new Date()).getTime() + this.comparisonTimeoutDuration * 1000;
        }
      }
      const deadline = operationDeadline;

      if (firstText == null || secondText == null) {
        throw new Error('Null input for text comparison.');
      }

      if (firstText === secondText) {
        return firstText ? [[TEXT_OP_EQUAL, firstText]] : [];
      }

      if (typeof checkLineDivisions === 'undefined') {
        checkLineDivisions = true;
      }
      const useLineCheck = checkLineDivisions;

      let commonLeadingLength = this.findCommonLeadingSequence(firstText, secondText);
      let commonLeadingPart = firstText.substring(0, commonLeadingLength);
      firstText = firstText.substring(commonLeadingLength);
      secondText = secondText.substring(commonLeadingLength);

      let commonTrailingLength = this.findCommonTrailingSequence(firstText, secondText);
      let commonTrailingPart = firstText.substring(firstText.length - commonTrailingLength);
      firstText = firstText.substring(0, firstText.length - commonTrailingLength);
      secondText = secondText.substring(0, secondText.length - commonTrailingLength);

      let diffTuples = this.computeCoreDifferences(firstText, secondText, useLineCheck, deadline);

      if (commonLeadingPart) {
        diffTuples.unshift([TEXT_OP_EQUAL, commonLeadingPart]);
      }
      if (commonTrailingPart) {
        diffTuples.push([TEXT_OP_EQUAL, commonTrailingPart]);
      }
      this.normalizeAndMerge(diffTuples);
      return diffTuples;
    };

    /**
     * Computes differences without common prefix/suffix.
     * @private
     */
    TextComparisonEngine.prototype.computeCoreDifferences = function(txt1, txt2, useLines, deadline) {
      let resultDiffs;

      if (!txt1) {
        return [[TEXT_OP_INSERT, txt2]];
      }
      if (!txt2) {
        return [[TEXT_OP_DELETE, txt1]];
      }

      const longerText = txt1.length > txt2.length ? txt1 : txt2;
      const shorterText = txt1.length > txt2.length ? txt2 : txt1;
      const subStringIndex = longerText.indexOf(shorterText);
      if (subStringIndex !== -1) {
        resultDiffs = [[TEXT_OP_INSERT, longerText.substring(0, subStringIndex)],
                       [TEXT_OP_EQUAL, shorterText],
                       [TEXT_OP_INSERT, longerText.substring(subStringIndex + shorterText.length)]];
        if (txt1.length > txt2.length) {
          resultDiffs[0][0] = resultDiffs[2][0] = TEXT_OP_DELETE;
        }
        return resultDiffs;
      }

      if (shorterText.length === 1) {
        return [[TEXT_OP_DELETE, txt1], [TEXT_OP_INSERT, txt2]];
      }

      const halfMatchResult = this.findHalfMatch(txt1, txt2);
      if (halfMatchResult) {
        const [t1a, t1b, t2a, t2b, midCommon] = halfMatchResult;
        const diffsA = this.calculateDifferences(t1a, t2a, useLines, deadline);
        const diffsB = this.calculateDifferences(t1b, t2b, useLines, deadline);
        return diffsA.concat([[TEXT_OP_EQUAL, midCommon]], diffsB);
      }

      if (useLines && txt1.length > 100 && txt2.length > 100) {
        return this.processLineMode(txt1, txt2, deadline);
      }

      return this.performBisectDiff(txt1, txt2, deadline);
    };

    /**
     * Line-level diff for greater accuracy.
     * @private
     */
    TextComparisonEngine.prototype.processLineMode = function(txt1, txt2, deadline) {
      const charMapping = this.mapLinesToChars(txt1, txt2);
      const charTxt1 = charMapping[0];
      const charTxt2 = charMapping[1];
      const lineArray = charMapping[2];

      let diffs = this.performBisectDiff(charTxt1, charTxt2, deadline);

      this.mapCharsToLines(diffs, lineArray);
      this.cleanupSemantic(diffs);

      diffs.push([TEXT_OP_EQUAL, '']); // Dummy entry
      let currentPointer = 0;
      let deletedCount = 0;
      let insertedCount = 0;
      let deletedText = '';
      let insertedText = '';

      while (currentPointer < diffs.length) {
        switch (diffs[currentPointer][0]) {
          case TEXT_OP_INSERT:
            insertedCount++;
            insertedText += diffs[currentPointer][1];
            break;
          case TEXT_OP_DELETE:
            deletedCount++;
            deletedText += diffs[currentPointer][1];
            break;
          case TEXT_OP_EQUAL:
            if (deletedCount >= 1 && insertedCount >= 1) {
              const subDiffs = this.calculateDifferences(deletedText, insertedText, false, deadline);
              diffs.splice(currentPointer - deletedCount - insertedCount, deletedCount + insertedCount);
              currentPointer = currentPointer - deletedCount - insertedCount;
              for (let j = subDiffs.length - 1; j >= 0; j--) {
                diffs.splice(currentPointer, 0, subDiffs[j]);
              }
              currentPointer += subDiffs.length;
            }
            insertedCount = 0;
            deletedCount = 0;
            deletedText = '';
            insertedText = '';
            break;
        }
        currentPointer++;
      }
      diffs.pop(); // Remove dummy entry
      return diffs;
    };

    /**
     * Bisecting diff algorithm.
     * @private
     */
    TextComparisonEngine.prototype.performBisectDiff = function(txt1, txt2, deadline) {
      const len1 = txt1.length;
      const len2 = txt2.length;
      const maxD = Math.ceil((len1 + len2) / 2);
      const vOffset = maxD;
      const vLength = 2 * maxD;
      const vFront = new Array(vLength).fill(-1);
      const vBack = new Array(vLength).fill(-1);

      vFront[vOffset + 1] = 0;
      vBack[vOffset + 1] = 0;
      const delta = len1 - len2;
      const isFront = (delta % 2 !== 0);

      let k1Start = 0;
      let k1End = 0;
      let k2Start = 0;
      let k2End = 0;

      for (let d = 0; d < maxD; d++) {
        if ((new Date()).getTime() > deadline) {
          break;
        }

        for (let k1 = -d + k1Start; k1 <= d - k1End; k1 += 2) {
          const k1Index = vOffset + k1;
          let x1;
          if (k1 === -d || (k1 !== d && vFront[k1Index - 1] < vFront[k1Index + 1])) {
            x1 = vFront[k1Index + 1];
          } else {
            x1 = vFront[k1Index - 1] + 1;
          }
          let y1 = x1 - k1;
          while (x1 < len1 && y1 < len2 && txt1.charAt(x1) === txt2.charAt(y1)) {
            x1++;
            y1++;
          }
          vFront[k1Index] = x1;
          if (x1 > len1) {
            k1End += 2;
          } else if (y1 > len2) {
            k1Start += 2;
          } else if (isFront && (vOffset + delta - k1 >= 0) && (vOffset + delta - k1 < vLength) && vBack[vOffset + delta - k1] !== -1) {
            const x2 = len1 - vBack[vOffset + delta - k1];
            if (x1 >= x2) {
              return this.buildBisectPath(txt1, txt2, x1, y1, deadline);
            }
          }
        }

        for (let k2 = -d + k2Start; k2 <= d - k2End; k2 += 2) {
          const k2Index = vOffset + k2;
          let x2;
          if (k2 === -d || (k2 !== d && vBack[k2Index - 1] < vBack[k2Index + 1])) {
            x2 = vBack[k2Index + 1];
          } else {
            x2 = vBack[k2Index - 1] + 1;
          }
          let y2 = x2 - k2;
          while (x2 < len1 && y2 < len2 && txt1.charAt(len1 - x2 - 1) === txt2.charAt(len2 - y2 - 1)) {
            x2++;
            y2++;
          }
          vBack[k2Index] = x2;
          if (x2 > len1) {
            k2End += 2;
          } else if (y2 > len2) {
            k2Start += 2;
          } else if (!isFront && (vOffset + delta - k2 >= 0) && (vOffset + delta - k2 < vLength) && vFront[vOffset + delta - k2] !== -1) {
            const x1 = vFront[vOffset + delta - k2];
            if (x1 >= len1 - x2) {
              return this.buildBisectPath(txt1, txt2, x1, len2 - y2, deadline);
            }
          }
        }
      }
      return [[TEXT_OP_DELETE, txt1], [TEXT_OP_INSERT, txt2]];
    };

    /**
     * Constructs a diff path from bisect points.
     * @private
     */
    TextComparisonEngine.prototype.buildBisectPath = function(txt1, txt2, x, y, deadline) {
      const subDiffs1 = this.calculateDifferences(txt1.substring(0, x), txt2.substring(0, y), false, deadline);
      const subDiffs2 = this.calculateDifferences(txt1.substring(x), txt2.substring(y), false, deadline);
      return subDiffs1.concat(subDiffs2);
    };

    /**
     * Converts texts to character arrays for line-mode diff.
     * @private
     */
    TextComparisonEngine.prototype.mapLinesToChars = function(txt1, txt2) {
      const lineArray = [];
      const lineHash = {};
      let charCounter = 0;

      function processText(text) {
        const lines = text.split('\n');
        let mappedChars = '';
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (lineHash.hasOwnProperty(line)) {
            mappedChars += String.fromCharCode(lineHash[line]);
          } else {
            if (charCounter === this.maxBitValue) {
              line = ''; // Fallback for too many unique lines
            } else {
              charCounter++;
              lineHash[line] = charCounter;
              lineArray[charCounter] = line;
              mappedChars += String.fromCharCode(charCounter);
            }
          }
        }
        return mappedChars;
      }
      const mappedTxt1 = processText.call(this, txt1);
      const mappedTxt2 = processText.call(this, txt2);
      return [mappedTxt1, mappedTxt2, lineArray];
    };

    /**
     * Converts character diffs back to line-based diffs.
     * @private
     */
    TextComparisonEngine.prototype.mapCharsToLines = function(diffs, lineArray) {
      for (let i = 0; i < diffs.length; i++) {
        const tuple = diffs[i];
        let text = [];
        for (let j = 0; j < tuple[1].length; j++) {
          text[j] = lineArray[tuple[1].charCodeAt(j)];
        }
        tuple[1] = text.join('\n');
      }
    };

    /**
     * Finds common leading sequence.
     * @private
     */
    TextComparisonEngine.prototype.findCommonLeadingSequence = function(txt1, txt2) {
      let i = 0;
      while (i < txt1.length && i < txt2.length && txt1.charAt(i) === txt2.charAt(i)) {
        i++;
      }
      return i;
    };

    /**
     * Finds common trailing sequence.
     * @private
     */
    TextComparisonEngine.prototype.findCommonTrailingSequence = function(txt1, txt2) {
      let common = 0;
      const t1Len = txt1.length;
      const t2Len = txt2.length;
      while (common < t1Len && common < t2Len && txt1.charAt(t1Len - 1 - common) === txt2.charAt(t2Len - 1 - common)) {
        common++;
      }
      return common;
    };

    /**
     * Detects a half-match.
     * @private
     */
    TextComparisonEngine.prototype.findHalfMatch = function(longText, shortText) {
      const longLen = longText.length;
      const shortLen = shortText.length;
      if (longLen < 4 || shortLen * 2 < longLen) {
        return null; // No half-match possible
      }

      function checkSubstring(txt1, txt2, loc) {
        const textA = txt1.substring(0, loc);
        const textB = txt1.substring(loc);
        const bestMatch = this.findBestOverlap(textA, txt2, 0);
        if (bestMatch[0]) {
          return [textA, textB, bestMatch[0], this.findBestOverlap(textB, txt2, bestMatch[1])];
        }
        return null;
      }

      const hm1 = checkSubstring.call(this, longText, shortText, Math.ceil(longLen / 4));
      const hm2 = checkSubstring.call(this, longText, shortText, Math.ceil(longLen / 2));
      const hm3 = checkSubstring.call(this, longText, shortText, Math.ceil(longLen * 3 / 4));
      const result = this.selectOptimalHalfMatch(hm1, hm2, hm3);

      if (result) {
        const [t1a, t1b, t2a, t2b] = result;
        const middleCommon = this.findCommonLeadingSequence(t1b, t2b);
        return [t1a, t1b.substring(middleCommon), t2a, t2b.substring(middleCommon), t1b.substring(0, middleCommon)];
      }
      return null;
    };

    /**
     * Finds the best overlap for findHalfMatch.
     * @private
     */
    TextComparisonEngine.prototype.findBestOverlap = function(text1, text2, loc) {
      let bestLen = 0;
      let bestLoc = -1;
      const pattern = text1.substring(loc);
      let index = text2.indexOf(pattern);
      while (index !== -1) {
        const len = this.findCommonLeadingSequence(text1.substring(loc), text2.substring(index));
        if (len * 2 > bestLen) {
          bestLen = len;
          bestLoc = index;
        }
        index = text2.indexOf(pattern, index + 1);
      }
      return [bestLen ? text2.substring(bestLoc, bestLoc + bestLen) : '', bestLoc];
    };

    /**
     * Selects the optimal half-match from candidates.
     * @private
     */
    TextComparisonEngine.prototype.selectOptimalHalfMatch = function(hm1, hm2, hm3) {
      let optimal = null;
      let optimalScore = this.editOperationPenalty; // Default score for no match

      [hm1, hm2, hm3].forEach(hm => {
        if (hm) {
          const score = hm[0].length + hm[3].length;
          if (score > optimalScore) {
            optimalScore = score;
            optimal = hm;
          }
        }
      });
      return optimal;
    };

    /**
     * Cleans up diffs by merging adjacent operations.
     * @private
     */
    TextComparisonEngine.prototype.normalizeAndMerge = function(diffs) {
      diffs.push([TEXT_OP_EQUAL, '']); // Add a dummy entry to ensure the last element is processed.
      let currentPointer = 0;
      let countDelete = 0;
      let countInsert = 0;
      let textDelete = '';
      let textInsert = '';
      let lastTupleType = TEXT_OP_EQUAL; // Stores the type of the last non-equality tuple
      let lastTuple = null; // Stores the last non-equality tuple

      while (currentPointer < diffs.length) {
        const currentTuple = diffs[currentPointer];
        switch (currentTuple[0]) {
          case TEXT_OP_INSERT:
            countInsert++;
            textInsert += currentTuple[1];
            lastTupleType = TEXT_OP_INSERT;
            break;
          case TEXT_OP_DELETE:
            countDelete++;
            textDelete += currentTuple[1];
            lastTupleType = TEXT_OP_DELETE;
            break;
          case TEXT_OP_EQUAL:
            if (lastTuple && lastTuple[0] === TEXT_OP_EQUAL) {
              lastTuple[1] += currentTuple[1];
              diffs.splice(currentPointer--, 1); // Remove current, decrement pointer
            } else {
              // Check for empty equality
              if (currentTuple[1].length === 0) {
                diffs.splice(currentPointer--, 1);
              }
            }
            // Upon reaching an equality, check for prior redundancies
            if (countDelete + countInsert > 1) {
              if (countDelete !== 0 && countInsert !== 0) {
                // A deletion and an insertion have occurred.
                // Swap back and forth to merge.
                // e.g., <del>a</del><ins>b</ins><del>c</del><ins>d</ins>
                //   -> <del>ac</del><ins>bd</ins>
                const commonLength = this.findCommonLeadingSequence(textInsert, textDelete);
                if (commonLength !== 0) {
                  if (commonLength >= textInsert.length / 2 || commonLength >= textDelete.length / 2) {
                    diffs.splice(currentPointer - countDelete - countInsert, 0,
                                 [TEXT_OP_DELETE, textInsert.substring(0, commonLength)],
                                 [TEXT_OP_EQUAL, textDelete.substring(0, commonLength)],
                                 [TEXT_OP_INSERT, textInsert.substring(commonLength)]);
                    countDelete = 0;
                    countInsert = 0;
                    textDelete = '';
                    textInsert = '';
                    break;
                  }
                }
              }
            }
            lastTuple = currentTuple;
            countInsert = 0;
            countDelete = 0;
            textDelete = '';
            textInsert = '';
            break;
        }
        currentPointer++;
      }
      if (diffs[diffs.length - 1][1] === '') {
        diffs.pop(); // Remove the dummy entry
      }

      // Check for equalities that can be shifted.
      let changes = false;
      currentPointer = 1;
      while (currentPointer < diffs.length - 1) {
        if (diffs[currentPointer - 1][0] === TEXT_OP_EQUAL &&
            diffs[currentPointer + 1][0] === TEXT_OP_EQUAL &&
            diffs[currentPointer][1].length > 0) {
          const common = this.findCommonLeadingSequence(diffs[currentPointer][1], diffs[currentPointer + 1][1]);
          if (common > 0) {
            diffs[currentPointer - 1][1] += diffs[currentPointer][1].substring(0, common);
            diffs[currentPointer + 1][1] = diffs[currentPointer][1].substring(0, common) + diffs[currentPointer + 1][1];
            diffs[currentPointer][1] = diffs[currentPointer][1].substring(common);
            changes = true;
          }
        }
        currentPointer++;
      }
      if (changes) {
        this.normalizeAndMerge(diffs); // Re-run cleanup if changes were made
      }
    };


    /**
     * Reduces the number of diffs by eliminating semantically trivial equalities.
     * @private
     */
    TextComparisonEngine.prototype.cleanupSemantic = function(diffs) {
      let changes = false;
      let currentPointer = 1;
      while (currentPointer < diffs.length - 1) {
        if (diffs[currentPointer][0] === TEXT_OP_EQUAL) {
          let prevDel = diffs[currentPointer - 1][1];
          let nextIns = diffs[currentPointer + 1][1];
          let overlap = this.findCommonOverlap(prevDel, nextIns);
          if (overlap.length > 0) {
            diffs.splice(currentPointer, 2, [TEXT_OP_INSERT, prevDel + nextIns.substring(overlap.length)]);
            diffs[currentPointer - 1][1] = prevDel.substring(0, prevDel.length - overlap.length);
            changes = true;
          }
        }
        currentPointer++;
      }
      if (changes) {
        this.cleanupSemantic(diffs);
      }
    };

    /**
     * Helper for cleanupSemantic to find common overlap.
     * @private
     */
    TextComparisonEngine.prototype.findCommonOverlap = function(text1, text2) {
      let bestOverlap = '';
      for (let i = 1; i <= Math.min(text1.length, text2.length); i++) {
        if (text1.substring(text1.length - i) === text2.substring(0, i)) {
          bestOverlap = text1.substring(text1.length - i);
        }
      }
      return bestOverlap;
    };

    return new TextComparisonEngine();
  })(); // End TextComparisonUtility IIFE


  // --- Core Application Logic ---

  const PROCESSED_ATTRIBUTE = 'data-enhanced-diff'; // Attribute to mark processed files

  // Orchestrates the initial setup and dynamic updates.
  function commenceOperation() {
    // Initial processing, scheduled for the next animation frame
    window.requestAnimationFrame(() => processVisualChanges());

    // Set up a MutationObserver for dynamic content
    const observerConfiguration = { childList: true, subtree: true };
    const debouncedMutationHandler = createDebouncedAction(processVisualChanges, 150); // 150ms debounce
    const domChangeMonitor = new MutationObserver(debouncedMutationHandler);
    domChangeMonitor.observe(document.body, observerConfiguration);
  }

  // Main function to find and enhance diff blocks.
  function processVisualChanges() {
    const diffFileElements = document.querySelectorAll('.file:not([' + PROCESSED_ATTRIBUTE + '])');
    convertToStandardArray(diffFileElements).forEach(fileElement => {
      processDiffFileElement(fileElement);
      fileElement.setAttribute(PROCESSED_ATTRIBUTE, 'true');
    });
  }

  // Processes a single diff file element to mark its changes.
  function processDiffFileElement(fileContainer) {
    // Select all relevant line divs, excluding those already marked with 'x'
    const lineDivs = convertToStandardArray(fileContainer.querySelectorAll('.data.highlight pre div'))
                     .filter(div => !div.querySelector('.x'));

    // Extract class names for chunk identification
    const lineClassNames = retrievePropertyValues(lineDivs, 'className');

    // Identify change segments (chunks)
    const changeSegments = identifyChangeSegments(lineClassNames);

    // Apply character-level diffs to each identified segment
    changeSegments.forEach(segment => analyzeAndMarkDiffBlock(segment, lineDivs));
  }

  // Identifies blocks of deleted and inserted lines that form a single change.
  // This mimics the original's `chunkify` logic to find specific diff patterns.
  function identifyChangeSegments(lineClassNames) {
    const identifiedBlocks = [];
    let currentProcessingBlock = null;

    lineClassNames.forEach((lineType, index) => {
      if (lineType === 'gc') { // Start of a new diff chunk context
        // Finalize previous block if it met the criteria
        if (currentProcessingBlock && currentProcessingBlock.deletionBlockCount === 1 && currentProcessingBlock.insertionBlockCount === 1) {
          identifiedBlocks.push({
            deletedLineIndices: currentProcessingBlock.deletedLineIndices,
            addedLineIndices: currentProcessingBlock.insertedLineIndices
          });
        }
        // Initialize a new block descriptor
        currentProcessingBlock = {
          deletedLineIndices: [],
          insertedLineIndices: [],
          deletionBlockCount: 0,
          insertionBlockCount: 0,
          currentSegmentIdentifier: '' // 'd' for delete, 'i' for insert
        };
      } else if (currentProcessingBlock) { // Only process if we're within a potential diff context
        if (lineType === 'gd') { // Deleted line
          currentProcessingBlock.deletedLineIndices.push(index);
          if (currentProcessingBlock.currentSegmentIdentifier !== 'd') {
            currentProcessingBlock.deletionBlockCount++;
            currentProcessingBlock.currentSegmentIdentifier = 'd';
          }
        } else if (lineType === 'gi') { // Inserted line
          currentProcessingBlock.insertedLineIndices.push(index);
          if (currentProcessingBlock.currentSegmentIdentifier !== 'i') {
            currentProcessingBlock.insertionBlockCount++;
            currentProcessingBlock.currentSegmentIdentifier = 'i';
          }
        } else { // Context line (' ') or other
          currentProcessingBlock.currentSegmentIdentifier = ''; // Reset segment type, indicating a break in contiguous diff lines
        }
      }
    });

    // Final check for the very last block in the input
    if (currentProcessingBlock && currentProcessingBlock.deletionBlockCount === 1 && currentProcessingBlock.insertionBlockCount === 1) {
      identifiedBlocks.push({
        deletedLineIndices: currentProcessingBlock.deletedLineIndices,
        addedLineIndices: currentProcessingBlock.insertedLineIndices
      });
    }

    return identifiedBlocks;
  }

  // Analyzes a single diff block and applies character-level highlighting.
  function analyzeAndMarkDiffBlock(segmentDescriptor, allLineDivs) {
    // Helper to extract text from a line div, removing the leading +/-.
    const extractLineText = (lineNumber) => allLineDivs[lineNumber].textContent.substring(1);

    // Prepare texts for the comparison engine.
    const originalText = segmentDescriptor.deletedLineIndices.map(extractLineText).join('\n');
    const changedText = segmentDescriptor.addedLineIndices.map(extractLineText).join('\n');

    // Perform the character-level diff.
    const comparisonResult = TextComparisonUtility.calculateDifferences(originalText, changedText);

    // Reconstruct the DOM for deleted lines.
    const processedDeletedFragments = buildHighlightedFragments('-', comparisonResult.filter(d => d[0] <= 0));
    segmentDescriptor.deletedLineIndices.forEach((lineIndex, idx) => {
      const targetDiv = allLineDivs[lineIndex];
      if (targetDiv) { // Ensure div exists
        targetDiv.replaceChild(processedDeletedFragments[idx], targetDiv.firstChild);
      }
    });

    // Reconstruct the DOM for inserted lines.
    const processedInsertedFragments = buildHighlightedFragments('+', comparisonResult.filter(d => d[0] >= 0));
    segmentDescriptor.addedLineIndices.forEach((lineIndex, idx) => {
      const targetDiv = allLineDivs[lineIndex];
      if (targetDiv) { // Ensure div exists
        targetDiv.replaceChild(processedInsertedFragments[idx], targetDiv.firstChild);
      }
    });
  }

  // Reconstructs DOM fragments for a given diff result.
  function buildHighlightedFragments(linePrefix, diffOutput) {
    // Helper to prepend a prefix character (e.g., '+' or '-') to a fragment.
    const prependPrefix = (contentFragment) => {
      const wrapperFragment = createDocFragment(makeTextNode(linePrefix));
      wrapperFragment.appendChild(contentFragment);
      return wrapperFragment;
    };

    const outputFragments = [createDocFragment()]; // Start with an empty fragment for the first line
    let currentDiffIndex = 0;

    while (currentDiffIndex < diffOutput.length) {
      const currentDiffTuple = diffOutput[currentDiffIndex++];
      const operationType = currentDiffTuple[0]; // -1 (delete), 0 (equal), 1 (insert)
      const contentText = currentDiffTuple[1]; // The text segment

      // Split content by newlines, then map to text/span nodes.
      const contentNodes = contentText.split('\n').map(segment => {
        // Use makeMarkedSpan for changes (not equal), otherwise just text.
        return (operationType !== TextComparisonUtility.TEXT_OP_EQUAL) ? makeMarkedSpan(segment) : makeTextNode(segment);
      }).map(node => createDocFragment(node)); // Wrap each node in a fragment

      // Append to the last fragment, then add subsequent lines as new fragments.
      let lastFragment = outputFragments.pop();
      lastFragment.appendChild(contentNodes.shift());
      outputFragments.push(lastFragment);

      outputFragments.push(...contentNodes); // Add remaining line fragments
    }
    return outputFragments.map(prependPrefix);
  }

  // Start the application when the DOM is ready.
  document.addEventListener('DOMContentLoaded', commenceOperation);

})();