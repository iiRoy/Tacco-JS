(function (externalJQuery) {
    'use strict';

    // Utility class for measuring text dimensions in a hidden DOM element.
    class MeasurementProcessor {
        constructor(sourceElementNode, isHeightMode) {
            this.auxiliaryElement = externalJQuery('<span/>');
            this.isHeightMeasurementMode = isHeightMode; // Indicates if height is the primary dimension, implying multiline
            this.auxiliaryElement.appendTo('body');
            this.transferVisualProperties(sourceElementNode);
        }

        // Copies relevant CSS properties from the source element to the auxiliary element.
        transferVisualProperties(sourceElementNode) {
            const visualProps = [
                'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'fontVariant',
                'textIndent', 'lineHeight', 'textTransform', 'letterSpacing', 'wordSpacing'
            ];
            const inheritedStyles = {};
            visualProps.forEach(prop => {
                inheritedStyles[prop] = sourceElementNode.css(prop);
            });

            // Specific styles to ensure accurate and hidden measurement.
            inheritedStyles.display = 'inline-block';
            inheritedStyles.position = 'absolute';
            inheritedStyles.visibility = 'hidden';
            inheritedStyles.whiteSpace = this.isHeightMeasurementMode ? 'normal' : 'nowrap';
            inheritedStyles.overflow = 'hidden';
            inheritedStyles.padding = '0';
            inheritedStyles.margin = '0';
            inheritedStyles.border = '0';
            inheritedStyles.boxSizing = 'border-box'; // Standardize box model

            this.auxiliaryElement.css(inheritedStyles);
        }

        // Sets a fixed dimension for the auxiliary element (e.g., width for height calculations).
        configureDimension(key, value) {
            this.auxiliaryElement[key](value);
        }

        // Measures the size of a given content string along a specified dimension.
        determineSize(contentString, sizeKey) {
            this.auxiliaryElement.text(contentString);
            return this.auxiliaryElement[sizeKey]();
        }

        // Removes the auxiliary element from the DOM to clean up resources.
        releaseResources() {
            this.auxiliaryElement.remove();
        }
    }

    // Iterative binary search function to find the maximum length of a text segment
    // that fits within a given dimension when combined with an ellipsis character.
    function locateFittingSliceLength(sizeProperty, maxDimension, fullContent, processorInstance, ellipsisChar, isTailSegment) {
        let lowBoundary = 0;
        let highBoundary = fullContent.length;
        let fittingLength = 0;

        // Early exit: If the ellipsis character alone exceeds the maximum dimension, no text can fit.
        if (maxDimension < processorInstance.determineSize(ellipsisChar, sizeProperty)) {
            return 0;
        }

        // Helper function to measure a text segment combined with the ellipsis.
        const measureWithEllipsis = (segment) => {
            let combinedContent;
            if (isTailSegment) { // Corresponds to 'reverse' in the original code
                combinedContent = ellipsisChar + segment;
            } else {
                combinedContent = segment + ellipsisChar;
            }
            return processorInstance.determineSize(combinedContent, sizeProperty);
        };

        // Replicate a specific initial check from the original `findTruncPoint` function.
        // This handles cases where the full content might strangely appear "smaller" than just the ellipsis.
        let segmentForHighBound = isTailSegment ? fullContent.slice(-highBoundary) : fullContent.slice(0, highBoundary);
        let sizeOfFullContentWithEllipsis = measureWithEllipsis(segmentForHighBound);

        let segmentForLowBound = isTailSegment ? fullContent.slice(-lowBoundary) : fullContent.slice(0, lowBoundary);
        let sizeOfEmptyContentWithEllipsis = measureWithEllipsis(segmentForLowBound);

        if (sizeOfFullContentWithEllipsis < sizeOfEmptyContentWithEllipsis) {
            return highBoundary; // Return the full content length if this unusual condition is met.
        }

        // Perform iterative binary search to find the longest fitting segment.
        while (lowBoundary <= highBoundary) {
            let midPoint = Math.floor((lowBoundary + highBoundary) / 2);
            let currentSegment;

            if (isTailSegment) {
                currentSegment = fullContent.slice(-midPoint);
            } else {
                currentSegment = fullContent.slice(0, midPoint);
            }

            const currentSegmentTotalSize = measureWithEllipsis(currentSegment);

            if (currentSegmentTotalSize <= maxDimension) {
                fittingLength = midPoint; // This length fits; try for a longer one.
                lowBoundary = midPoint + 1;
            } else {
                highBoundary = midPoint - 1; // This length is too long; try a shorter one.
            }
        }
        return fittingLength;
    }

    // Define the jQuery plugin 'adjustText'.
    externalJQuery.fn.adjustText = function (configuration) {
        // Backward compatibility for 'centered' option, mapping to 'placement'.
        if (configuration && configuration.centered && !configuration.placement) {
            configuration.placement = 'center';
            delete configuration.centered;
        }
        // Validate and sanitize the 'placement' option.
        if (configuration && !(/^(left|right|center)$/).test(configuration.placement)) {
            delete configuration.placement;
        }

        // Define default settings and merge with user-provided configuration.
        const defaultSettings = {
            targetDimension: 'auto',
            ellipsisChar: '&hellip;',
            placement: 'right',
            applyClass: false,
            applyTitle: false,
            multiLine: false
            // The 'assumeSameStyle' optimization from the original is intentionally omitted
            // for a divergent implementation strategy, ensuring worker isolation.
        };
        const activeSettings = externalJQuery.extend({}, defaultSettings, configuration);

        // Iterate over each selected element to apply truncation.
        return this.each(function () {
            const currentElement = externalJQuery(this);
            const originalTextContent = currentElement.text();
            let effectiveDimensionMeasurementKey = 'width'; // 'width' or 'height'
            let originalContentPixelSize, targetContentPixelSize;

            // Initialize the measurement utility for the current element.
            const textProcessor = new MeasurementProcessor(currentElement, activeSettings.multiLine);

            if (activeSettings.multiLine) {
                effectiveDimensionMeasurementKey = 'height';
                // For height measurement, the auxiliary element needs to adopt the target's width.
                textProcessor.configureDimension('width', currentElement.width());
                originalContentPixelSize = textProcessor.determineSize(originalTextContent, effectiveDimensionMeasurementKey);
                // Replicate the original's +1 pixel buffer for multiline height.
                targetContentPixelSize = currentElement.height() + 1;
            } else {
                originalContentPixelSize = textProcessor.determineSize(originalTextContent, effectiveDimensionMeasurementKey);
                // Determine target width from options or element's current width.
                targetContentPixelSize = parseInt(activeSettings.targetDimension, 10) || currentElement.width();
            }

            // Proceed with truncation only if the original content exceeds the target dimension.
            if (originalContentPixelSize > targetContentPixelSize) {
                let segmentOneLength = 0; // Length of the prefix segment
                let segmentTwoLength = 0; // Length of the suffix segment

                // Define truncation strategies based on placement using a lookup table.
                const truncationStrategies = {
                    'left': () => {
                        // Truncate from the left, keeping a suffix.
                        segmentTwoLength = locateFittingSliceLength(
                            effectiveDimensionMeasurementKey, targetContentPixelSize, originalTextContent,
                            textProcessor, activeSettings.ellipsisChar, true // isTailSegment = true
                        );
                    },
                    'center': () => {
                        // Truncate from both sides, meeting in the center.
                        // Replicate the original's calculation for half the target dimension.
                        const halfTargetDimensionAdjusted = Math.floor(targetContentPixelSize / 2) - 1;

                        segmentOneLength = locateFittingSliceLength(
                            effectiveDimensionMeasurementKey, halfTargetDimensionAdjusted, originalTextContent,
                            textProcessor, activeSettings.ellipsisChar, false // isTailSegment = false
                        );
                        // The original measures the second segment (right side) without an ellipsis.
                        segmentTwoLength = locateFittingSliceLength(
                            effectiveDimensionMeasurementKey, halfTargetDimensionAdjusted, originalTextContent,
                            textProcessor, '', true // Use empty string for ellipsisChar for this measurement
                        );
                    },
                    'right': () => {
                        // Truncate from the right, keeping a prefix.
                        segmentOneLength = locateFittingSliceLength(
                            effectiveDimensionMeasurementKey, targetContentPixelSize, originalTextContent,
                            textProcessor, activeSettings.ellipsisChar, false // isTailSegment = false
                        );
                    }
                };

                // Execute the chosen truncation strategy.
                const selectedStrategy = truncationStrategies[activeSettings.placement];
                if (selectedStrategy) {
                    selectedStrategy();
                }

                let prefixContent = '';
                let suffixContent = '';

                // Extract the actual text segments based on calculated lengths.
                if (activeSettings.placement === 'left') {
                    suffixContent = originalTextContent.slice(-segmentTwoLength);
                } else if (activeSettings.placement === 'center') {
                    prefixContent = originalTextContent.slice(0, segmentOneLength);
                    suffixContent = originalTextContent.slice(-segmentTwoLength);
                } else if (activeSettings.placement === 'right') {
                    prefixContent = originalTextContent.slice(0, segmentOneLength);
                }

                // Apply custom class and title attribute if specified.
                if (activeSettings.applyClass) {
                    currentElement.addClass(activeSettings.applyClass);
                }
                if (activeSettings.applyTitle) {
                    currentElement.attr('title', originalTextContent);
                }

                // HTML encode the text segments and then insert them along with the raw ellipsis.
                textProcessor.auxiliaryElement.text(prefixContent);
                const encodedPrefix = textProcessor.auxiliaryElement.html();
                textProcessor.auxiliaryElement.text(suffixContent);
                const encodedSuffix = textProcessor.auxiliaryElement.html();

                currentElement.empty().html(
                    encodedPrefix + activeSettings.ellipsisChar + encodedSuffix
                );
            }
            // Release resources used by the measurement utility.
            textProcessor.releaseResources();
        });
    };
})(jQuery);