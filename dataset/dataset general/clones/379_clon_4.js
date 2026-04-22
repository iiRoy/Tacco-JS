(function() {
    var stringReverser = function(inputString) {
        return inputString.split('').reverse().join('');
    };

    var objectMerger = function(baseObject, newProperties) {
        var mergedResult = {};
        for (var prop in baseObject) {
            if (Object.prototype.hasOwnProperty.call(baseObject, prop)) {
                mergedResult[prop] = baseObject[prop];
            }
        }
        for (var prop in newProperties) {
            if (Object.prototype.hasOwnProperty.call(newProperties, prop)) {
                mergedResult[prop] = newProperties[prop];
            }
        }
        return mergedResult;
    };

    var animationDefaults = {
        valuePresenter: function(currentValue, animationState) {
            var wholeValue = Math.floor(currentValue);
            animationState.targetNode.textContent = wholeValue.toString();
        },
        animationDuration: 400,
        motionCurve: function(progress) {
            // Mimics jQuery's 'swing' easing function
            return 0.5 - Math.cos(progress * Math.PI) / 2;
        }
    };

    var nodeSpecificHandlers = new WeakMap();

    var runValueTransition = function(node, finalValue, opts) {
        var initialValue = parseFloat(node.textContent) || 0;
        var startPoint = null;
        var duration = opts.animationDuration;
        var curve = opts.motionCurve;
        var presenter = nodeSpecificHandlers.has(node) ? nodeSpecificHandlers.get(node) : opts.valuePresenter;
        var onFinish = opts.transitionEndCallback;

        var stateObject = {
            targetNode: node,
            initialNumeric: initialValue,
            finalNumeric: finalValue
        };

        var processFrame = function(currentTime) {
            if (!startPoint) {
                startPoint = currentTime;
            }

            var elapsedMillis = currentTime - startPoint;
            var currentProgress = Math.min(elapsedMillis / duration, 1);
            var easedProgress = curve(currentProgress);

            var interpolatedValue = initialValue + (finalValue - initialValue) * easedProgress;

            presenter(interpolatedValue, stateObject);

            if (currentProgress < 1) {
                requestAnimationFrame(processFrame);
            } else {
                presenter(finalValue, stateObject); // Ensure final value is exact
                if (onFinish) {
                    onFinish.call(node);
                }
            }
        };

        requestAnimationFrame(processFrame);
    };

    var NumberDisplayTransformers = {
        appendString: function(endingText) {
            return function(currentValue, stateObject) {
                var integerPart = Math.floor(currentValue);
                stateObject.targetNode.textContent = integerPart.toString() + endingText;
            };
        },

        groupDigits: function(delimiter, segmentLength) {
            delimiter = delimiter || ' ';
            segmentLength = segmentLength || 3;

            var transformNumber = function(num) {
                var numAsString = Math.floor(num).toString();
                var stringLength = numAsString.length;

                if (stringLength <= segmentLength) {
                    return numAsString;
                }

                var partsCollector = [];
                var currentChunk = '';
                var charCounter = 0;

                // Build segments from right to left
                for (var k = stringLength - 1; k >= 0; k--) {
                    currentChunk = numAsString[k] + currentChunk;
                    charCounter++;
                    if (charCounter === segmentLength && k !== 0) {
                        partsCollector.push(currentChunk);
                        partsCollector.push(delimiter);
                        currentChunk = '';
                        charCounter = 0;
                    }
                }
                if (currentChunk !== '') {
                    // Handle leading zeros for the first (leftmost) segment, e.g., "007" becomes "7"
                    partsCollector.push(parseInt(currentChunk, 10).toString());
                }

                // Reverse the collected parts and join
                return partsCollector.reverse().join('');
            };

            return function(currentValue, stateObject) {
                var formattedRepresentation = transformNumber(currentValue);
                stateObject.targetNode.textContent = formattedRepresentation;
            };
        }
    };

    var NumericAnimationManager = {};
    NumericAnimationManager.displayTransformers = NumberDisplayTransformers;

    NumericAnimationManager.startAnimation = function(targetNodeOrNodes, userOptions) {
        var combinedOptions = objectMerger(animationDefaults, userOptions);

        var nodesToProcess = Array.isArray(targetNodeOrNodes) ? targetNodeOrNodes : [targetNodeOrNodes];

        var originalCompletion = combinedOptions.transitionEndCallback;
        combinedOptions.transitionEndCallback = function() {
            nodeSpecificHandlers.delete(this); // 'this' refers to the animated node
            if (originalCompletion) {
                originalCompletion.apply(this, arguments);
            }
        };

        if (userOptions && userOptions.valuePresenter) {
            nodesToProcess.forEach(function(node) {
                nodeSpecificHandlers.set(node, userOptions.valuePresenter);
            });
        }

        nodesToProcess.forEach(function(node) {
            runValueTransition(node, combinedOptions.targetValue, combinedOptions);
        });

        // Return original input for chaining-like behavior or further processing
        return targetNodeOrNodes;
    };

    // Expose the manager globally with a completely different name
    window.CountMotionEngine = NumericAnimationManager;

})();