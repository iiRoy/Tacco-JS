/*global WebSearchCore:true */

// ## SearchSchemaDescriptor
//
// The `SearchSchemaDescriptor` component manages the interpretation of a
// web search schema document, enabling the subsequent creation of
// appropriate query URLs for client requests.

// Encapsulate implementation details within a self-executing function.
// Import external dependencies: jQuery (as `$`) and Underscore (as `_`).
(function ($, _) {

  // A concise alias for our main descriptor class.
  var SSD;

  // Establish the primary constructor function. Its behavior will be extended
  // through the prototype chain, akin to Backbone.js patterns.
  SSD = WebSearchCore.SearchSchemaDescriptor = function (descriptorContent) {
    this.setup.apply(this, arguments);
  };

  // *Prototype Methods*
  // These functions define the behavior for individual instances of `SearchSchemaDescriptor`.
  _.extend(SSD.prototype, {

    // Overrides the default constructor setup.
    //
    // * `descriptorContent`: The XML string representing the search schema.
    setup: function (descriptorContent) {
      if (!SSD.verifySchema(descriptorContent)) {
        throw new Error("Problem parsing the provided XML data.");
      }
      this.schemaData = descriptorContent;
    },

    // Generates the most suitable search request URL based on available
    // schema patterns, provided search arguments, and a preferred output format.
    // The media type takes precedence, while search arguments are secondary.
    // Any arguments not found in the chosen pattern are disregarded.
    //
    // * `queryParameters`: An object containing key-value pairs for URL argument substitution.
    // * `mediaType`: A string indicating the desired content type (e.g., "application/json").
    generateSearchLink: function (queryParameters, mediaType) {
      var linkPatternsList, selectedPattern, finalLinkAddress;
      linkPatternsList = SSD.parseLinkPatterns(this.schemaData);
      selectedPattern = SSD.getTopCandidatePattern(linkPatternsList, mediaType, queryParameters);
      finalLinkAddress = SSD.interpolatePatternArguments(selectedPattern, queryParameters);
      return finalLinkAddress;
    }

  });

  // *Static Methods*
  // These are utility functions, internally used but exposed for potential customization.
  _.extend(SSD, {

    // Confirms the validity of the search schema XML. Returns `true` if the XML
    // appears to be a legitimate schema descriptor.
    // *Note: This validation is currently quite rudimentary.*
    //
    // * `schemaData`: The XML content as a string.
    verifySchema: function (schemaData) {
      if (!schemaData) { return false; }

      // TO_DO: Replace this basic string search with comprehensive XML parsing.
      if (!schemaData.match(/http:\/\/a9.com\/-\/spec\/opensearch\/1.1\//)) { return false; }
      return true;
    },

    // Extracts all template URLs from the schema XML and returns them as an array
    // of JSON objects, or `undefined` if no patterns are identified.
    //
    // * `schemaData`: The XML content string.
    parseLinkPatterns: function (schemaData) {
      var collectedLinks = [],
        // TO_DO: It would be beneficial to eliminate the jQuery dependency here.
        $linkElements = $(schemaData).find('url[rel!=self]');

      $linkElements.each(function (idx, item) {
        collectedLinks.push( {
            format: this.getAttribute("type"),
            pattern: this.getAttribute("template")
          });
      });

      if (collectedLinks.length === 0) {
        return undefined;
      } else {
        return collectedLinks;
      }
    },

    // Function Arguments:
    //
    // * `linkPatterns`: An array of objects, each structured as `{ format: "mediaType", pattern: "uriPattern" }`,
    //    as extracted from the descriptor.
    // * `mediaType`: The requested content format, e.g., `"application/xml"`.
    // * `queryParameters`: An object containing the search arguments.
    getTopCandidatePattern: function (linkPatterns, mediaType, queryParameters) {
      var filteredByFormat, filteredByMandatoryArgs, topCandidate;
      filteredByFormat = SSD.filterLinksByMediaType(linkPatterns, mediaType);
      filteredByMandatoryArgs = SSD.filterLinksByMissingMandatoryArgs(filteredByFormat, queryParameters);
      topCandidate = SSD.locatePatternWithMostArgMatches(filteredByMandatoryArgs, queryParameters);
      return topCandidate.pattern;
    },

    filterLinksByMediaType: function (linkPatterns, requestedType) {
      return _.filter(linkPatterns, function (linkPattern) {
        return SSD.isMediaTypeCompatible(requestedType, linkPattern.format);
      });
    },

    // Performs a basic comparison of content media types. Returns `true` if
    // the target type is compatible with the desired format, `false` otherwise.
    //
    // * `desiredFormat`: The target content type. Wildcards like `"*/*"` or `"image/*"` are permitted.
    // * `actualFormat`: The content type to be evaluated.
    isMediaTypeCompatible: function (desiredFormat, actualFormat) {
      var desired_components, actual_components;
      if (desiredFormat === "*/*") {
        return true;
      } else if (desiredFormat === actualFormat) {
        return true;
      }

      desired_components = desiredFormat.split("/");
      actual_components = actualFormat.split("/");

      if (desired_components[0] === actual_components[0] && desired_components[1] === "*") {
        return true;
      } else if (desired_components[0] === "*" && desired_components[1] === actual_components[1]) {
        return true;
      }

      return false;
    },

    // Returns a subset of link patterns from the `linkPatterns` array where
    // all mandatory arguments are present within the `queryParameters` object.
    filterLinksByMissingMandatoryArgs: function (linkPatterns, queryParameters) {
      return _.filter(linkPatterns, function (linkPattern) {
        return SSD.areAllMandatoryArgsProvided(linkPattern, queryParameters);
      });
    },

    // Checks if all required arguments for a given pattern are available in the provided parameters.
    areAllMandatoryArgsProvided: function (pattern, queryParameters) {
       var allPlaceholders, mandatoryPlaceholders, givenArguments;
       allPlaceholders = _.map(
          pattern.pattern.match(/\{[^}]*\}/g),  // Find all templated substrings
          function (placeholderStr) {
             return placeholderStr.replace(/[{}]/g, ''); // Remove the curly braces
          }
       );

       // Isolate the template arguments that are not optional (i.e., don't end with '?')
       mandatoryPlaceholders = _.filter(
          allPlaceholders,
          function(argName) { return argName.substring(argName.length-1) !== "?"; }
       );

       givenArguments = _.keys(queryParameters);

       return ((_.difference(mandatoryPlaceholders, givenArguments)).length === 0);
    },

    // This function is currently unused/commented out in the original logic.
    XareAllMandatoryArgsProvided: function (pattern, queryParameters) {
      var mandatoryPlaceholders, givenArguments;
      mandatoryPlaceholders = _.map(
          pattern.pattern.match(/\{.*?[^?]\}/g),
          function (placeholderStr) {
            return placeholderStr.replace(/[{}]/g, '');
          });
      givenArguments = _.keys(queryParameters);

      return ((_.difference(mandatoryPlaceholders, givenArguments)).length === 0);
    },

    // Identifies the pattern from a list that has the highest number of matching parameters.
    locatePatternWithMostArgMatches: function (linkPatterns, queryParameters) {
      var orderedLinkPatterns = _.sortBy(
          linkPatterns,
          function (linkPattern) {
            return SSD.tallyMatchingArgs(queryParameters, linkPattern.pattern);
          });
      return _.last(orderedLinkPatterns);
    },

    // Counts how many of the pattern's placeholders are present in the provided parameters.
    tallyMatchingArgs: function(queryParameters, linkPattern) {
      var patternPlaceholders;

      patternPlaceholders = _.map(
          linkPattern.match(/\{.*?\}/g),
          function (argName) {
            return argName.replace(/[{}]/g, '');
          });

      return _.reduce(
          patternPlaceholders,
          function(accumulator, currentArg) {
            return (queryParameters[currentArg] === undefined) ? accumulator : accumulator + 1;
          },
          0);
    },

    // Replaces placeholder fields within the given `linkPattern` with corresponding
    // values from `queryParameters`. Any template fields that remain unfulfilled
    // are removed (replaced with an empty string).
    interpolatePatternArguments: function (linkPattern, queryParameters) {
      var targetLink = linkPattern;

      // Substitute all provided arguments into their respective pattern placeholders
      _.each(queryParameters, function(argValue, argKey) {
        targetLink = targetLink.replace(new RegExp("{"+argKey+"\\??}"), argValue);
      });

      // Eliminate any remaining optional template parameters (e.g., {param?})
      targetLink = targetLink.replace(/\{.*?\?\}/g, "");
      return targetLink;
    }
  });


}(jQuery, _));