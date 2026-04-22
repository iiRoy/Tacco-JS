(function ($, _) {

  // A shorthand reference for our primary component.
  var SQB;

  // SearchLinkKit.SearchQueryBuilder: A robust utility for parsing OpenSearch
  // Description Documents (OSDDs) and constructing dynamic query URLs.
  // It encapsulates the logic for template selection and parameter injection.
  SQB = SearchLinkKit.SearchQueryBuilder = function (inputXmlContent) {
    this.initiateBuilder.apply(this, arguments);
  };

  // --- Instance Functionality ---
  // These methods define the behavior of individual SearchQueryBuilder objects.
  _.extend(SQB.prototype, {

    // Initializes a new SearchQueryBuilder instance.
    //
    // @param {string} inputXmlContent - The XML string representing the OSDD.
    initiateBuilder: function (inputXmlContent) {
      // Ensure we have valid XML content to work with.
      if (!inputXmlContent || typeof inputXmlContent !== 'string') {
        throw new Error("Initialization failed: XML definition content is required.");
      }

      // Perform initial validation of the XML structure.
      if (!SQB.verifyDefinitionIntegrity(inputXmlContent)) {
        throw new Error("Initialization failed: Provided XML is not a valid OpenSearch description.");
      }

      this.sourceDefinitionXml = inputXmlContent;
      // Pre-parse and cache the URI templates for efficiency.
      this._cachedTemplates = SQB.parseUriTemplates(this.sourceDefinitionXml);
      this.isReady = true; // Mark the builder as ready for use.
    },

    // Generates the optimal search URI based on provided parameters and desired media type.
    //
    // @param {object} queryParameters - An object containing key-value pairs for template substitution.
    // @param {string} targetMediaType - The preferred content type for the search result (e.g., "application/json").
    // @returns {string|null} The constructed URI string, or null if no suitable template is found.
    constructSearchUri: function (queryParameters, targetMediaType) {
      if (!this.isReady) {
        console.warn("SearchQueryBuilder is not ready; attempting to re-initialize.");
        // Attempt to re-initialize if not ready, assuming sourceDefinitionXml is still available.
        this.initiateBuilder(this.sourceDefinitionXml);
      }

      // Use the pre-parsed templates.
      const availableTemplates = this._cachedTemplates;

      if (!availableTemplates || availableTemplates.length === 0) {
        console.warn("No URI templates found in the OpenSearch definition.");
        return null;
      }

      // Step 1: Identify the most appropriate template from the available options.
      const chosenTemplate = SQB.resolveOptimalTemplate(availableTemplates, targetMediaType, queryParameters);

      if (!chosenTemplate) {
        console.warn("No suitable template found for the given media type and parameters.");
        return null;
      }

      // Step 2: Inject the provided parameters into the chosen template.
      const finalSearchUri = SQB.applyParameterSubstitutions(chosenTemplate, queryParameters);
      return finalSearchUri;
    }

  });

  // --- Class (Static) Functionality ---
  // These methods provide utility functions accessible directly on the SearchQueryBuilder class.
  _.extend(SQB, {

    // Verifies the basic structural integrity and OpenSearch compliance of the XML content.
    //
    // @param {string} xmlString - The XML content of the OSDD.
    // @returns {boolean} True if the XML appears to be a valid OSDD, false otherwise.
    verifyDefinitionIntegrity: function (xmlString) {
      if (!xmlString || typeof xmlString !== 'string' || xmlString.trim() === '') {
        return false;
      }

      // A simple check for the OpenSearch namespace.
      // A more robust solution would involve proper XML parsing and schema validation.
      const namespacePattern = /http:\/\/a9\.com\/-\/spec\/opensearch\/1\.1\//;
      if (!namespacePattern.test(xmlString)) {
        console.warn("XML does not contain the expected OpenSearch 1.1 namespace.");
        return false;
      }

      // Check for the presence of the root element.
      if (!/<OpenSearchDescription>/.test(xmlString)) {
          console.warn("XML does not contain the <OpenSearchDescription> root element.");
          return false;
      }

      // Ensure there's at least one <Url> element, which is fundamental.
      if (!/<Url\s/.test(xmlString)) {
          console.warn("XML does not contain any <Url> elements.");
          return false;
      }

      return true;
    },

    // Extracts and structures all URI templates from the OSDD XML.
    //
    // @param {string} xmlSource - The XML content string.
    // @returns {Array<object>} An array of objects, each with `type` and `template` properties,
    //                          or an empty array if no templates are found.
    parseUriTemplates: function (xmlSource) {
      if (!xmlSource) {
        return [];
      }

      // Using jQuery to parse the XML string and find all 'Url' elements
      // that are not 'self' relational.
      const xmlDocument = $.parseXML(xmlSource);
      const foundLinkNodes = $(xmlDocument).find('Url[rel!="self"]');

      if (foundLinkNodes.length === 0) {
        return [];
      }

      // Map the found XML nodes into a more convenient JavaScript object array.
      const extractedTemplateSpecs = Array.from(foundLinkNodes).map(nodeItem => ({
          type: SQB._getXmlAttribute(nodeItem, "type"),
          template: SQB._getXmlAttribute(nodeItem, "template")
      }));

      return extractedTemplateSpecs;
    },

    // A helper to safely retrieve an attribute from an XML node.
    // @private
    _getXmlAttribute: function(node, attrName) {
        return node && typeof node.getAttribute === 'function' ? node.getAttribute(attrName) : undefined;
    },

    // Determines the most suitable URI template from a collection based on media type and parameters.
    //
    // @param {Array<object>} availableTemplates - List of template objects (from parseUriTemplates).
    // @param {string} targetMediaType - The desired content type string.
    // @param {object} queryParameters - Parameters intended for substitution.
    // @returns {string|null} The `template` string of the best match, or null if none found.
    resolveOptimalTemplate: function (availableTemplates, targetMediaType, queryParameters) {
      if (!availableTemplates || availableTemplates.length === 0) {
        return null; // No templates to choose from.
      }

      // First, filter templates by the requested media type.
      const mediaFilteredTemplates = SQB.filterByMediaType(availableTemplates, targetMediaType);
      if (mediaFilteredTemplates.length === 0) {
        console.debug("No templates matched the desired media type:", targetMediaType);
        return null;
      }

      // Next, filter out templates that have mandatory parameters missing from queryParameters.
      const paramFilteredTemplates = SQB.excludeTemplatesWithMissingMandatoryParams(mediaFilteredTemplates, queryParameters);
      if (paramFilteredTemplates.length === 0) {
        console.debug("No templates remained after mandatory parameter filtering.");
        return null;
      }

      // Finally, select the template that matches the most parameters.
      const highestRankedTemplate = SQB.prioritizeTemplatesByParameterMatch(paramFilteredTemplates, queryParameters);
      return highestRankedTemplate ? highestRankedTemplate.template : null;
    },

    // Filters a list of URI templates, keeping only those that match the specified media type.
    //
    // @param {Array<object>} templatesToFilter - The array of template objects.
    // @param {string} desiredType - The media type to match against.
    // @returns {Array<object>} A new array containing only the matching templates.
    filterByMediaType: function (templatesToFilter, desiredType) {
      return _.filter(templatesToFilter, function (uriTemplateSpec) {
        return SQB.compareMediaTypes(uriTemplateSpec.type, desiredType);
      });
    },

    // Compares two media type strings, supporting wildcards in the target matcher.
    //
    // @param {string} candidateType - The actual media type of the template (e.g., "text/html").
    // @param {string} targetMatcher - The desired media type, can include "*" wildcards (e.g., "text/*", "*/*").
    // @returns {boolean} True if the candidate type matches the target matcher, false otherwise.
    compareMediaTypes: function (candidateType, targetMatcher) {
      if (!candidateType || !targetMatcher) {
          return false; // Cannot compare if either is missing.
      }

      // Direct exact match
      if (candidateType === targetMatcher) {
        return true;
      }

      // Wildcard matches
      if (targetMatcher === "*/*") {
        return true;
      }

      const candidateComponents = candidateType.split("/");
      const matcherComponents = targetMatcher.split("/");

      if (candidateComponents.length !== 2 || matcherComponents.length !== 2) {
          return false; // Malformed media types.
      }

      // Type wildcard (e.g., "text/*" matches "text/plain")
      if (matcherComponents[0] === candidateComponents[0] && matcherComponents[1] === "*") {
        return true;
      }
      // Subtype wildcard (e.g., "* /xml" matches "text/xml") - less common but possible
      if (matcherComponents[0] === "*" && matcherComponents[1] === candidateComponents[1]) {
        return true;
      }

      return false;
    },

    // Filters a list of templates, removing those that have mandatory parameters not present in the `queryParameters` object.
    //
    // @param {Array<object>} templatesToEvaluate - The array of template objects.
    // @param {object} queryParameters - The parameters provided by the user.
    // @returns {Array<object>} A new array containing only templates with all mandatory parameters satisfied.
    excludeTemplatesWithMissingMandatoryParams: function (templatesToEvaluate, queryParameters) {
      return _.filter(templatesToEvaluate, function (uriTemplateSpec) {
        return SQB.checkMandatoryParameters(uriTemplateSpec.template, queryParameters);
      });
    },

    // Checks if all mandatory parameters within a given template string are present in the provided parameters object.
    //
    // @param {string} templateString - The URI template string.
    // @param {object} providedParameters - The object containing actual parameter values.
    // @returns {boolean} True if all required parameters are found, false otherwise.
    checkMandatoryParameters: function (templateString, providedParameters) {
       // Extract all placeholders (e.g., "{searchTerms}", "{startIndex?}")
       const allPlaceholders = SQB._extractPlaceholders(templateString);

       // Filter to find only mandatory placeholders (those not ending with '?').
       const mandatoryPlaceholders = _.filter(allPlaceholders, placeholder =>
          !placeholder.endsWith('?')
       );

       const providedKeys = _.keys(providedParameters);

       // All mandatory placeholders must be present in the provided keys.
       const missingMandatory = _.difference(mandatoryPlaceholders, providedKeys);
       return missingMandatory.length === 0;
    },

    // Helper method to extract all parameter placeholders from a URI template string.
    // @private
    _extractPlaceholders: function(templateString) {
      if (!templateString) return [];
      // Regex to find all substrings enclosed in curly braces.
      const matches = templateString.match(/\{([^}]+)\}/g);
      return matches ? matches.map(p => p.replace(/[{}]/g, '')) : [];
    },

    // Identifies the template from a filtered list that has the highest number of matching parameters.
    //
    // @param {Array<object>} candidateTemplates - Templates that have passed previous filters.
    // @param {object} currentParameters - The parameters object.
    // @returns {object|null} The template object with the most parameter matches, or null if input is empty.
    prioritizeTemplatesByParameterMatch: function (candidateTemplates, currentParameters) {
      if (!candidateTemplates || candidateTemplates.length === 0) {
        return null;
      }

      // Sort templates by the number of matching parameters in descending order.
      const rankedTemplates = _.sortBy(
          candidateTemplates,
          function (uriTemplateSpec) {
            // We want descending order, so negate the count or reverse the array later.
            return -SQB.calculateParameterOverlap(currentParameters, uriTemplateSpec.template);
          }
      );
      // The first element after sorting will be the one with the most matches.
      return rankedTemplates[0];
    },

    // Counts how many parameters from the provided object are present in a given URI template.
    //
    // @param {object} availableParameters - The object of parameters to check against.
    // @param {string} uriTemplateString - The template string to parse for placeholders.
    // @returns {number} The count of matching parameters.
    calculateParameterOverlap: function(availableParameters, uriTemplateString) {
      // Extract all parameter placeholders from the template.
      const templatePlaceholders = SQB._extractPlaceholders(uriTemplateString);

      // Reduce the list of placeholders to a count of those present in availableParameters.
      return _.reduce(
          templatePlaceholders,
          function(countAccumulator, currentPlaceholder) {
            // Remove the optional '?' if present for accurate key comparison.
            const cleanPlaceholder = currentPlaceholder.endsWith('?') ? currentPlaceholder.slice(0, -1) : currentPlaceholder;
            return availableParameters.hasOwnProperty(cleanPlaceholder) ? countAccumulator + 1 : countAccumulator;
          },
          0 // Initial accumulator value
      );
    },

    // Replaces all placeholders in a URI template string with their corresponding values from `queryParameters`.
    // Optional placeholders without a matching parameter will be removed.
    //
    // @param {string} uriTemplateString - The template string with placeholders (e.g., "{searchTerms}").
    // @param {object} queryParameters - An object mapping placeholder names to their values.
    // @returns {string} The fully interpolated URI string.
    applyParameterSubstitutions: function (uriTemplateString, queryParameters) {
      if (!uriTemplateString) {
        return "";
      }

      let processedUri = uriTemplateString;

      // Iterate through each provided parameter and substitute it into the URI.
      _.each(queryParameters, function(paramValue, paramKey) {
        // Create a regex to match both mandatory ({key}) and optional ({key?}) forms.
        const paramRegex = new RegExp("{" + paramKey + "\\??}", "g");
        processedUri = processedUri.replace(paramRegex, encodeURIComponent(paramValue));
      });

      // After all substitutions, remove any remaining optional placeholders that were not filled.
      // This regex specifically targets optional placeholders (ending with '?') that are still present.
      processedUri = processedUri.replace(/\{[^}]+\?\}/g, "");

      return processedUri;
    }
  });


}(jQuery, _));