(function() {
    'use strict';

    window.GlobalResponsiveConfig = window.GlobalResponsiveConfig || {};

    const ViewportQueryTool = (function() {
        let internalSettingsStore = {
            responsiveMode: true,
            rootFontSize: 16,
            pointDefinitions: [
                { id: 'xxs', measure: 359 },
                { id: 'xs', measure: 480 },
                { id: 's', measure: 640 },
                { id: 'm', measure: 768 },
                { id: 'l', measure: 1024 },
                { id: 'xl', measure: 1244 },
                { id: 'xxl', measure: 1410 }
            ],
            fixedRange: {
                minId: 0,
                maxId: 'xl'
            }
        };

        let lowerBoundsPixelMap = new Map();
        let upperBoundsPixelMap = new Map();

        const setupPointData = function() {
            const sortedPointArray = [...internalSettingsStore.pointDefinitions].sort((a, b) => {
                if (a.measure < b.measure) { return -1; }
                if (a.measure > b.measure) { return 1; }
                return 0;
            });

            lowerBoundsPixelMap.clear();
            upperBoundsPixelMap.clear();

            for (let i = 0; i < sortedPointArray.length; i++) {
                const currentPoint = sortedPointArray[i];
                lowerBoundsPixelMap.set(currentPoint.id.toLowerCase(), parseInt(currentPoint.measure, 10));

                if (i < sortedPointArray.length - 1) {
                    const nextPoint = sortedPointArray[i + 1];
                    upperBoundsPixelMap.set(currentPoint.id.toLowerCase(), parseInt(nextPoint.measure - 1, 10));
                }
            }
        };

        setupPointData(); // Initial data processing

        const processInputBoundaries = function(firstBoundary, secondBoundary) {
            const standardizeValue = function(inputVal) {
                if (typeof inputVal === 'string') {
                    const cleanString = inputVal.replace(/\s/g, '');
                    if (/^\d+$/.test(cleanString)) {
                        return parseInt(cleanString, 10);
                    }
                    return cleanString;
                }
                return inputVal;
            };

            let initialValue = firstBoundary;
            let finalValue = secondBoundary || 0;

            if (typeof firstBoundary === 'string' && firstBoundary.includes(',') && finalValue === 0) {
                const parts = firstBoundary.split(',');
                if (parts.length === 2) {
                    initialValue = parts[0];
                    finalValue = parts[1];
                }
            }

            return {
                startRef: standardizeValue(initialValue),
                endRef: standardizeValue(finalValue)
            };
        };

        const convertPixelsToRelativeUnits = function(pixelMeasurement) {
            return pixelMeasurement / internalSettingsStore.rootFontSize;
        };

        const resolvePointToReferencePixels = function(pointIdentifierOrPx, isUpperBoundary) {
            if (typeof pointIdentifierOrPx === 'number') {
                return pointIdentifierOrPx;
            }
            const targetMap = isUpperBoundary ? upperBoundsPixelMap : lowerBoundsPixelMap;
            return targetMap.get(pointIdentifierOrPx.toLowerCase()) || 0;
        };

        const resolvePointToRelativeUnits = function(pointIdentifierOrPx, isUpperBoundary) {
            if (typeof pointIdentifierOrPx === 'number') {
                return convertPixelsToRelativeUnits(pointIdentifierOrPx);
            }

            const targetMap = isUpperBoundary ? upperBoundsPixelMap : lowerBoundsPixelMap;
            let relativeMeasurement = 0;

            if (targetMap.has(pointIdentifierOrPx.toLowerCase())) {
                relativeMeasurement = convertPixelsToRelativeUnits(targetMap.get(pointIdentifierOrPx.toLowerCase()));
            } else {
                console.warn(`ViewportQueryTool: Breakpoint '${pointIdentifierOrPx}' not defined, using 0.`);
            }

            return relativeMeasurement;
        };

        const validateAgainstFixedRange = function(rawMinInput, rawMaxInput, resolvedMinPx, resolvedMaxPx, propertyType) {
            if (propertyType !== 'width') {
                return false;
            }

            const staticMinRelative = resolvePointToRelativeUnits(internalSettingsStore.fixedRange.minId);
            const staticMaxRelative = resolvePointToRelativeUnits(internalSettingsStore.fixedRange.maxId, true);
            const requestedMinRelative = convertPixelsToRelativeUnits(resolvedMinPx);
            const requestedMaxRelative = convertPixelsToRelativeUnits(resolvedMaxPx);

            if (rawMaxInput === 0) { // Scenario: min-and-above
                return requestedMinRelative >= staticMinRelative && requestedMinRelative < staticMaxRelative;
            }

            if (rawMinInput === 0) { // Scenario: max-and-below
                return requestedMaxRelative >= staticMaxRelative;
            }

            // Scenario: between
            if (requestedMinRelative > staticMaxRelative || requestedMaxRelative < staticMinRelative) {
                return false;
            }
            if (requestedMaxRelative < staticMaxRelative) {
                return false;
            }
            return true;
        };


        const getMinDimensionQuery = function(initialBoundary, typeOfDimension) {
            const relativeValue = resolvePointToRelativeUnits(initialBoundary);
            return `(min-${typeOfDimension}: ${relativeValue}em)`;
        };

        const getMaxDimensionQuery = function(finalBoundary, typeOfDimension) {
            const relativeValue = resolvePointToRelativeUnits(finalBoundary, true);
            return `(max-${typeOfDimension}: ${relativeValue}em)`;
        };

        const getBetweenDimensionsQuery = function(initialBoundary, finalBoundary, typeOfDimension) {
            const minRelative = resolvePointToRelativeUnits(initialBoundary);
            const maxRelative = resolvePointToRelativeUnits(finalBoundary, true);
            return `(min-${typeOfDimension}: ${minRelative}em) and (max-${typeOfDimension}: ${maxRelative}em)`;
        };

        const constructMediaQuery = function(startParam, endParam, dimensionType) {
            const processedBounds = processInputBoundaries(startParam, endParam);
            const startingRef = processedBounds.startRef;
            const endingRef = processedBounds.endRef;

            dimensionType = typeof dimensionType === 'string' ? dimensionType : 'width';

            if (startingRef === 'retina' || startingRef === 'hdpi') {
                return '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-device-pixel-ratio: 1.5)';
            } else if (endingRef === 0) {
                return getMinDimensionQuery(startingRef, dimensionType);
            } else if (startingRef === 0) {
                return getMaxDimensionQuery(endingRef, dimensionType);
            } else {
                return getBetweenDimensionsQuery(startingRef, endingRef, dimensionType);
            }
        };

        const constructHeightMediaQuery = function(start, end) {
            return constructMediaQuery(start, end, 'height');
        };

        const checkMediaQueryMatch = function(start, end, property) {
            const processedBounds = processInputBoundaries(start, end);
            const resolvedMinPx = resolvePointToReferencePixels(processedBounds.startRef);
            const resolvedMaxPx = resolvePointToReferencePixels(processedBounds.endRef, true);

            if (!internalSettingsStore.responsiveMode) {
                return validateAgainstFixedRange(processedBounds.startRef, processedBounds.endRef, resolvedMinPx, resolvedMaxPx, property);
            }

            if (window.matchMedia) {
                return window.matchMedia(constructMediaQuery(start, end, property)).matches;
            }

            console.warn('ViewportQueryTool: `matchMedia` API not available. Consider a polyfill.');
            return false;
        };

        const checkHeightMediaQueryMatch = function(start, end) {
            return checkMediaQueryMatch(start, end, 'height');
        };

        const updateConfiguration = function(newConfiguration) {
            if (newConfiguration) {
                Object.assign(internalSettingsStore, newConfiguration);
                setupPointData(); // Re-process data after settings update
            }
            return internalSettingsStore;
        };

        return {
            generateQuery: constructMediaQuery,
            generateHeightQuery: constructHeightMediaQuery,
            isMatching: checkMediaQueryMatch,
            isHeightMatching: checkHeightMediaQueryMatch,
            modifySettings: updateConfiguration
        };
    })();

    window.GlobalResponsiveConfig.queryManager = ViewportQueryTool;

})();