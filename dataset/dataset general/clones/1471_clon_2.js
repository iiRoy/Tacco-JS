/*
 *  @license
 *  Seeker - Agile pattern matching library
 *
 *  Copyright (c) 2012 Kirill Risk <kirill@email.com>.
 *  All Rights Reserved. Apache Software License 2.0
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
(function (universe) {

  /*
   *  Derived from "Diff, Match and Patch", by Google
   *
   *    http://code.google.com/p/google-diff-match-patch/
   *
   *  Modified by: Kirill Risk <kirill@email.com>
   *  -----------------------------------------------
   *  Purpose: The core algorithm and structure were adjusted to allow the creation of
   *  <TextScout> instances, each possessing a <findMatch> method that performs the actual
   *  bitap search. The <probeValue> (the sequence of characters being sought) is defined
   *  only once per instance, thereby avoiding redundant recalculations when searching
   *  across a collection of strings.
   *
   *  Licensed under the Apache License, Version 2.0 (the "License");
   *  you may not use this file except in compliance with the License.
   */
  var TextScout = function (probeValue, configs) {
    configs = configs || {};
    this.configs = configs;
    this.configs.baseLocation = configs.baseLocation || TextScout.presetSettings.baseLocation;
    this.configs.spanThreshold = 'spanThreshold' in configs ? configs.spanThreshold : TextScout.presetSettings.spanThreshold;
    this.configs.acceptanceLevel = 'acceptanceLevel' in configs ? configs.acceptanceLevel : TextScout.presetSettings.acceptanceLevel;
    this.configs.maxProbeSize = configs.maxProbeSize || TextScout.presetSettings.maxProbeSize;

    this.probeValue = configs.caseSensitive ? probeValue : probeValue.toLowerCase();
    this.probeSize = probeValue.length;

    if (this.probeSize > this.configs.maxProbeSize) {
      throw new Error('Pattern length is excessively long');
    }

    this.hitIndicator = 1 << (this.probeSize - 1);
    this.probeCharMap = this._computeProbeCharMap();
  };

  TextScout.presetSettings = {
    // Approximate position within the input where the target is expected?
    baseLocation: 0,

    // Defines how near the match needs to be to the fuzzy starting point (above).
    // A precise letter match 'spanThreshold' characters away from the fuzzy point
    // would be scored as a complete mismatch. A value of '0' demands the match be at
    // the exact specified spot; '1000' would require a perfect match
    // to be within 800 characters of the fuzzy spot to be discovered with an 0.8 acceptanceLevel.
    spanThreshold: 100,

    // The point at which the matching algorithm ceases its efforts. An acceptanceLevel of '0.0' mandates a perfect match
    // (both characters and placement), while '1.0' would identify anything.
    acceptanceLevel: 0.6,

    // Internal word size limit for processing
    maxProbeSize: 32
  };

  /*
   * Initialize the character mapping for the Bitap method.
   * @returns {Object} A hash of character positions.
   * @private
   */
  TextScout.prototype._computeProbeCharMap = function () {
    var charBitMap = {},
      idx = 0;

    for (idx = 0; idx < this.probeSize; idx++) {
      charBitMap[this.probeValue.charAt(idx)] = 0;
    }

    for (idx = 0; idx < this.probeSize; idx++) {
      charBitMap[this.probeValue.charAt(idx)] |= 1 << (this.probeValue.length - idx - 1);
    }

    return charBitMap;
  };

  /*
   * Calculate and return the match quality based on discrepancy count and position.
   * @param {number} discrepancies Number of errors detected in the match.
   * @param {number} spot Position of the detected match.
   * @returns {number} Overall quality score for the match (0.0 = excellent, 1.0 = poor).
   * @private
   */
  TextScout.prototype._evaluateMatchQuality = function (discrepancies, spot) {
    var precision = discrepancies / this.probeSize,
      nearness = Math.abs(this.configs.baseLocation - spot);

    if (!this.configs.spanThreshold) {
      // Avoid division by zero issues.
      return nearness ? 1.0 : precision;
    }
    return precision + (nearness / this.configs.spanThreshold);
  };

  /*
   * Computes and returns the outcome of the search operation.
   * @param {String} inputContent The string to be searched within.
   * @returns {Object} An object containing:
   *                          {Boolean} foundMatch Indicates if a match was made.
   *                          {Decimal} matchScore The overall score for the match.
   * @public
   */
  TextScout.prototype.findMatch = function (inputContent) {
    inputContent = this.configs.caseSensitive ? inputContent : inputContent.toLowerCase();

    if (this.probeValue === inputContent) {
      // Exact match discovered
      return {
        foundMatch: true,
        matchScore: 0
      };
    }

    var idx, jdx,
      // Establish starting point within the input and initialize character set.
      contentLength = inputContent.length,
      BASE_LOCATION = this.configs.baseLocation,
      // Upper match quality limit beyond which we cease efforts.
      ACCEPTANCE_LEVEL = this.configs.acceptanceLevel,
      // Is there a precise match nearby? (optimization)
      optimalSpot = inputContent.indexOf(this.probeValue, BASE_LOCATION),
      rangeMin, rangeMid,
      rangeMax = this.probeSize + contentLength,
      commence, conclude,
      currentBits, previousBits,
      characterHit,
      matchScore = 1,
      hitPositions = [];

    if (optimalSpot != -1) {
      ACCEPTANCE_LEVEL = Math.min(this._evaluateMatchQuality(0, optimalSpot), ACCEPTANCE_LEVEL);
      // What about searching in the reverse direction? (optimization)
      optimalSpot = inputContent.lastIndexOf(this.probeValue, BASE_LOCATION + this.probeSize);

      if (optimalSpot != -1) {
        ACCEPTANCE_LEVEL = Math.min(this._evaluateMatchQuality(0, optimalSpot), ACCEPTANCE_LEVEL);
      }
    }

    optimalSpot = -1;

    for (idx = 0; idx < this.probeSize; idx++) {
      // Iterate to find the best match; each cycle permits one additional discrepancy.
      // Perform a binary search to ascertain how far from 'BASE_LOCATION' we can deviate at this
      // error level.
      rangeMin = 0;
      rangeMid = rangeMax;
      while (rangeMin < rangeMid) {
        if (this._evaluateMatchQuality(idx, BASE_LOCATION + rangeMid) <= ACCEPTANCE_LEVEL) {
          rangeMin = rangeMid;
        } else {
          rangeMax = rangeMid;
        }
        rangeMid = Math.floor((rangeMax - rangeMin) / 2 + rangeMin);
      }

      // Utilize the outcome of this iteration as the upper bound for the subsequent one.
      rangeMax = rangeMid;
      commence = Math.max(1, BASE_LOCATION - rangeMid + 1);
      conclude = Math.min(BASE_LOCATION + rangeMid, contentLength) + this.probeSize;

      // Initialize the bit array structure
      currentBits = Array(conclude + 2);

      currentBits[conclude + 1] = (1 << idx) - 1;

      for (jdx = conclude; jdx >= commence; jdx--) {
        // The character map <probeCharMap> is a sparse object, thus the following line may generate warnings.
        characterHit = this.probeCharMap[inputContent.charAt(jdx - 1)];

        if (idx === 0) {
          // Initial pass: seeking an exact match.
          currentBits[jdx] = ((currentBits[jdx + 1] << 1) | 1) & characterHit;
        } else {
          // Subsequent passes: seeking a fuzzy match.
          currentBits[jdx] = ((currentBits[jdx + 1] << 1) | 1) & characterHit | (((previousBits[jdx + 1] | previousBits[jdx]) << 1) | 1) | previousBits[jdx + 1];
        }
        if (currentBits[jdx] & this.hitIndicator) {
          matchScore = this._evaluateMatchQuality(idx, jdx - 1);
          // This detected match is almost certainly superior to any existing match.
          // However, verification is still prudent.
          if (matchScore <= ACCEPTANCE_LEVEL) {
            // Confirmation received.
            ACCEPTANCE_LEVEL = matchScore;
            optimalSpot = jdx - 1;
            hitPositions.push(optimalSpot);

            if (optimalSpot > BASE_LOCATION) {
              // When moving past BASE_LOCATION, do not surpass our current proximity from it.
              commence = Math.max(1, 2 * BASE_LOCATION - optimalSpot);
            } else {
              // Already past BASE_LOCATION, subsequent matches will be less favorable.
              break;
            }
          }
        }
      }

      // No prospect for a (better) match at higher discrepancy levels.
      if (this._evaluateMatchQuality(idx + 1, BASE_LOCATION) > ACCEPTANCE_LEVEL) {
        break;
      }
      previousBits = currentBits;
    }

    return {
      foundMatch: optimalSpot >= 0,
      matchScore: matchScore
    };
  };

  var objectPathResolver = function (dataObject, valuePath, resultCollection) {
    var initialPiece, restOfPath, periodIndex;

    if (!valuePath) {
      // If no path remains, we've reached the desired object.
      resultCollection.push(dataObject);
    } else {
      periodIndex = valuePath.indexOf('.');
      if (periodIndex !== -1) {
        initialPiece = valuePath.slice(0, periodIndex);
        restOfPath = valuePath.slice(periodIndex + 1);
      } else {
        initialPiece = valuePath;
      }

      var retrievedValue = dataObject[initialPiece];
      if (retrievedValue) {
        if (!restOfPath && (typeof retrievedValue === 'string' || typeof retrievedValue === 'number')) {
          resultCollection.push(retrievedValue);
        } else if (Utilities.isAnArray(retrievedValue)) {
          // Examine each element within the array.
          for (var idx = 0, total = retrievedValue.length; idx < total; idx++) {
            objectPathResolver(retrievedValue[idx], restOfPath, resultCollection);
          }
        } else if (restOfPath) {
          // An object. Continue recursive traversal.
          objectPathResolver(retrievedValue, restOfPath, resultCollection);
        }
      }
    }

    return resultCollection;
  };

  var Utilities = {
    /*
     * Traverse a given object structure.
     * @param {Object} dataObject The object to navigate.
     * @param {String} valuePath A dot-separated route to a key within the object. E.g., 'Info.Detail.Value'.
     * @returns {Object}
     */
    getNestedValue: function (dataObject, valuePath) {
      return objectPathResolver(dataObject, valuePath, []);
    },
    isAnArray: function (dataObject) {
      return Object.prototype.toString.call(dataObject) === '[object Array]';
    }
  };

  /*
   * @param {Array} sourceItems
   * @param {Object} configs
   * @public
   */
  function PatternFinder(sourceItems, configs) {
    this.sourceItems = sourceItems;
    this.configs = configs = configs || {};

    var idx, total, propKey, propertyKeys;
    // Apply boolean configuration options
    for (idx = 0, propertyKeys = ['performSort', 'includeMatchQuality', 'enableSorting'], total = propertyKeys.length; idx < total; idx++) {
      propKey = propertyKeys[idx];
      this.configs[propKey] = propKey in configs ? configs[propKey] : PatternFinder.presetSettings[propKey];
    }
    // Apply all other configuration options
    for (idx = 0, propertyKeys = ['searchAlgorithm', 'orderingFunction', 'searchableProperties', 'valueAccessor'], total = propertyKeys.length; idx < total; idx++) {
      propKey = propertyKeys[idx];
      this.configs[propKey] = configs[propKey] || PatternFinder.presetSettings[propKey];
    }
  };

  PatternFinder.presetSettings = {
    identifierKey: null,

    caseSensitive: false,

    // Should the match quality score be included in the output?
    // When <true>, each result entry will be structured as: `{ item: ..., matchScore: ... }`
    includeMatchQuality: false,

    // Should the resulting list be ordered by score?
    performSort: true,

    // The search function to employ.
    // Note that the default search function ([[Function]]) must adhere to the following interface:
    //
    //  @param searchCriterion The string pattern to search for.
    //  @param configs The search configuration parameters.
    //  [[Function]].constructor = function(searchCriterion, configs)
    //
    //  @param inputContent: the string within which to locate the pattern.
    //  @returns Object in the format of:
    //    - foundMatch: boolean
    //    - matchScore: Integer
    //  [[Function]].prototype.findMatch = function(inputContent)
    searchAlgorithm: TextScout,

    // Default sorting function.
    orderingFunction: function (alpha, beta) {
      return alpha.matchScore - beta.matchScore;
    },

    // Default value retrieval function.
    valueAccessor: Utilities.getNestedValue,

    searchableProperties: []
  };

  /*
   * Searches for all items whose properties (using fuzzy matching) align with the criterion.
   * @param {String} searchCriterion The string pattern for fuzzy searching.
   * @returns {Array} A collection of all detected search results.
   * @public
   */
  PatternFinder.prototype.findMatch = function (searchCriterion) {
    var currentMatcher = new (this.configs.searchAlgorithm)(searchCriterion, this.configs),
      jdx, currentItem,
      sourceItems = this.sourceItems,
      itemCount = sourceItems.length,
      configs = this.configs,
      targetProperties = this.configs.searchableProperties,
      targetPropCount = targetProperties.length,
      matchOutcome,
      preliminaryResults = [],
      outcomeMap = {},
      priorOutcome,
      finalOutcomes = [];

    /*
     * Invokes <TextScout::findMatch> for bitap analysis. Constructs the preliminary result list.
     * @param {String} inputContent The string content to perform fuzzy search on.
     * @param {String|Number} dataEntity If <sourceItems> is an Array, dataEntity will be an index;
     *                            otherwise, it is the item object itself.
     * @param {Number} entityIndex
     * @private
     */
    var processContentForMatch = function (inputContent, dataEntity, entityIndex) {
      // Verify if the content is eligible for searching.
      if (inputContent === undefined || inputContent === null) {
        return;
      }

      if (typeof inputContent === 'string') {

        // Obtain the match outcome.
        matchOutcome = currentMatcher.findMatch(inputContent);

        // If a match is identified, append the item to <preliminaryResults>, including its score.
        if (matchOutcome.foundMatch) {

          // Determine if the item already exists in our outcomes.
          priorOutcome = outcomeMap[entityIndex];
          if (priorOutcome) {
            // Apply the lowest score obtained.
            priorOutcome.matchScore = Math.min(priorOutcome.matchScore, matchOutcome.matchScore);
          } else {
            // Add it to the preliminary result collection.
            outcomeMap[entityIndex] = {
              item: dataEntity,
              matchScore: matchOutcome.matchScore
            };
            preliminaryResults.push(outcomeMap[entityIndex]);
          }
        }
      } else if (Utilities.isAnArray(inputContent)) {
        for (var idx = 0; idx < inputContent.length; idx++) {
          processContentForMatch(inputContent[idx], dataEntity, entityIndex);
        }
      }
    };

    // Inspect the initial element in the list; if it's a string, we assume
    // every element in the list is also a string, representing a flattened array.
    if (typeof sourceItems[0] === 'string') {
      // Iterate through each item.
      for (var idx = 0; idx < itemCount; idx++) {
        processContentForMatch(sourceItems[idx], idx, idx);
      }
    } else {
      // Otherwise, the first element is presumed to be an Object, and thus the search
      // focuses on the values associated with the keys of each item.

      // Iterate through each item.
      for (var idx = 0; idx < itemCount; idx++) {
        currentItem = sourceItems[idx];
        // Iterate through each property key.
        for (jdx = 0; jdx < targetPropCount; jdx++) {
          processContentForMatch(configs.valueAccessor(currentItem, targetProperties[jdx]), currentItem, idx);
        }
      }
    }

    if (configs.performSort) {
      preliminaryResults.sort(configs.orderingFunction);
    }

    // A helper function, optimized for speed, which returns the
    // raw item along with its score, or just the item itself, based
    // on the specified configuration.
    var retrieveResultItem = configs.includeMatchQuality ? function (idx) {
      return preliminaryResults[idx];
    } : function (idx) {
      return preliminaryResults[idx].item;
    };

    // Another helper function, optimized for speed, which substitutes the item with its value,
    // if the configurations dictate it.
    var updateResultItem = configs.identifierKey ? function (idx) {
      preliminaryResults[idx].item = configs.valueAccessor(preliminaryResults[idx].item, configs.identifierKey)[0];
    } : function () {
      return; // No operation performed.
    };

    // From the preliminary outcomes, transfer only the item identifier (if specified)
    // or the full item into a new array. This is done because we do not wish to return
    // the <preliminaryResults>, as it contains additional metadata.
    for (var idx = 0, total = preliminaryResults.length; idx < total; idx++) {
      // Replace the item with its value, which might be its ID if configured.
      updateResultItem(idx);
      finalOutcomes.push(retrieveResultItem(idx));
    }

    return finalOutcomes;
  };

  // Export to Common JS Module Loader
  if (typeof exports === 'object') {
    // Node. Works with environments supporting module.exports.
    module.exports = PatternFinder;
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function () {
      return PatternFinder;
    });
  } else {
    // Browser globals (root is window)
    universe.PatternFinder = PatternFinder;
  }

})(this);