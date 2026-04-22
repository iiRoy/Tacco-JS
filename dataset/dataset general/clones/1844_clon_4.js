(function(externalJQuery) {
    const defaultBoundaryConfig = { presenceBoundary: "all" };

    function prepareMethodOptions(inputOpts, specificBoundary = "all") {
        let finalOpts = { presenceBoundary: specificBoundary };
        if (typeof inputOpts === "string") {
            finalOpts.presenceBoundary = inputOpts;
        } else if (typeof inputOpts === "object" && inputOpts !== null) {
            finalOpts = { ...finalOpts, ...inputOpts };
        }
        return finalOpts;
    }

    function filterCollectionByVisibility(collectionToFilter, optionsArgument) {
        const elementsMeetingCriteria = [];

        for (const currentElement of collectionToFilter) {
            if (assessVisualPresence(currentElement, optionsArgument)) {
                elementsMeetingCriteria.push(currentElement);
            }
        }
        return externalJQuery(elementsMeetingCriteria);
    }

    externalJQuery.fn.screenProbe = function(optionsInput) {
        const processedOptions = prepareMethodOptions(optionsInput, "all");
        return filterCollectionByVisibility(this, processedOptions);
    };

    externalJQuery.fn.screenProbeUpper = function(optionsInput) {
        const processedOptions = prepareMethodOptions(optionsInput, "top");
        return filterCollectionByVisibility(this, processedOptions);
    };

    externalJQuery.fn.screenProbeRight = function(optionsInput) {
        const processedOptions = prepareMethodOptions(optionsInput, "right");
        return filterCollectionByVisibility(this, processedOptions);
    };

    externalJQuery.fn.screenProbeLower = function(optionsInput) {
        const processedOptions = prepareMethodOptions(optionsInput, "bottom");
        return filterCollectionByVisibility(this, processedOptions);
    };

    externalJQuery.fn.screenProbeLeft = function(optionsInput) {
        const processedOptions = prepareMethodOptions(optionsInput, "left");
        return filterCollectionByVisibility(this, processedOptions);
    };

    const boundaryPredicateConstructors = {
        createCheck: function(boundarySetting) {
            return function(idx, domItem) {
                return assessVisualPresence(domItem, boundarySetting);
            };
        }
    };

    externalJQuery.boundaryVisibilityChecks = {
        entireView: boundaryPredicateConstructors.createCheck("all"),
        upperFacet: boundaryPredicateConstructors.createCheck("top"),
        rightFacet: boundaryPredicateConstructors.createCheck("right"),
        lowerFacet: boundaryPredicateConstructors.createCheck("bottom"),
        leftFacet: boundaryPredicateConstructors.createCheck("left"),
        specificRegion: function(customConfiguration) {
            const resolvedConfig = { ...defaultBoundaryConfig, ...customConfiguration };
            return boundaryPredicateConstructors.createCheck(resolvedConfig);
        }
    };
}(jQuery));