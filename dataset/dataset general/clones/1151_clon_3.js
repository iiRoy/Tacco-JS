(function(jq, globalObj, pageDOM, voidVal) {
    "use strict";

    // Configuration object for various selectors
    const DOM_SELECTORS = {
        mainForm: '#applyTransformationForm',
        triggerBtn: '#initiateAnimationBtn',
        reflectionToggle: '#enableReflection',
        reflectionXInput: '#reflectX_val',
        reflectionYInput: '#reflectY_val',
        reflectionBothInput: '#reflectXY_val',
        rotationInput: '#rotationAngle',
        scaleXCoord: '#scale_horizontal',
        scaleYCoord: '#scale_vertical',
        singleScaleX: '#scaleX_single',
        singleScaleY: '#scaleY_single',
        skewXCoord: '#skew_horizontal',
        skewYCoord: '#skew_vertical',
        singleSkewX: '#skewX_single',
        singleSkewY: '#skewY_single',
        translateXCoord: '#translate_horizontal',
        translateYCoord: '#translate_vertical',
        singleTranslateX: '#translateX_single',
        singleTranslateY: '#translateY_single',
        originXCoord: '#origin_point_x',
        originYCoord: '#origin_point_y',
        animateCheckbox: '#shouldAnimateElements',
        primaryTarget: '#mainVisualTarget',
        secondaryTarget: '#auxiliaryVisualTarget'
    };

    // Helper function to safely parse a float value from an input element
    const getNumericInput = function(elementRef) {
        if (!elementRef || !elementRef.val) {
            return voidVal;
        }
        const rawValue = elementRef.val().trim();
        if (rawValue === "") {
            return voidVal; // Return undefined if empty
        }
        const parsedValue = parseFloat(rawValue);
        return isNaN(parsedValue) ? voidVal : parsedValue;
    };

    // Helper function to get checkbox state
    const getCheckboxState = function(elementRef) {
        return elementRef && elementRef.is(':checked');
    };

    // Cache jQuery elements for form inputs
    const transformationControls = {
        reflection: jq(DOM_SELECTORS.reflectionToggle),
        reflectX: jq(DOM_SELECTORS.reflectionXInput),
        reflectY: jq(DOM_SELECTORS.reflectionYInput),
        reflectXY: jq(DOM_SELECTORS.reflectionBothInput),
        rotation: jq(DOM_SELECTORS.rotationInput),
        scaling: {
            x: jq(DOM_SELECTORS.scaleXCoord),
            y: jq(DOM_SELECTORS.scaleYCoord)
        },
        scaleX: jq(DOM_SELECTORS.singleScaleX),
        scaleY: jq(DOM_SELECTORS.singleScaleY),
        skewing: {
            x: jq(DOM_SELECTORS.skewXCoord),
            y: jq(DOM_SELECTORS.skewYCoord)
        },
        skewX: jq(DOM_SELECTORS.singleSkewX),
        skewY: jq(DOM_SELECTORS.singleSkewY),
        translation: {
            x: jq(DOM_SELECTORS.translateXCoord),
            y: jq(DOM_SELECTORS.translateYCoord)
        },
        translateX: jq(DOM_SELECTORS.singleTranslateX),
        translateY: jq(DOM_SELECTORS.singleTranslateY),
        transformOrigin: {
            x: jq(DOM_SELECTORS.originXCoord),
            y: jq(DOM_SELECTORS.originYCoord)
        },
        animationEnabled: jq(DOM_SELECTORS.animateCheckbox)
    };

    // Main logic to collect and apply transformations
    const applyElementTransforms = function() {
        if (!jq || !jq.transform) {
            console.error("jQuery or jQuery.transform plugin not available. Cannot apply transformations.");
            return;
        }

        let collectedTransformations = {};
        const numericFields = [
            'rotation', 'scaleX', 'scaleY', 'skewX', 'skewY', 'translateX', 'translateY',
            'reflectX', 'reflectY', 'reflectXY' // These are treated as numeric inputs for their respective values
        ];
        const twoAxisFields = ['scaling', 'skewing', 'translation', 'transformOrigin'];

        // Process simple numeric inputs and checkbox for reflection
        if (getCheckboxState(transformationControls.reflection)) {
            collectedTransformations['reflect'] = true; // Use boolean for reflection toggle
        }

        numericFields.forEach(function(keyName) {
            const currentField = transformationControls[keyName];
            const numericalValue = getNumericInput(currentField);
            if (numericalValue !== voidVal) {
                collectedTransformations[keyName] = numericalValue;
            }
        });

        // Process two-axis fields (e.g., scale, skew, translate, origin)
        twoAxisFields.forEach(function(groupKey) {
            const group = transformationControls[groupKey];
            const xVal = getNumericInput(group.x);
            const yVal = getNumericInput(group.y);

            if (xVal !== voidVal && yVal !== voidVal) {
                collectedTransformations[groupKey] = [xVal, yVal];
            } else if (xVal !== voidVal) {
                // If only X is provided for a 2-axis field, some plugins might interpret it as uniform or X-only
                // For robustness, we'll assign it to X and leave Y as default if the plugin handles it.
                // Or, if the plugin expects [val, val], we could duplicate.
                // For jQuery.transform, often [x, y] or just x is fine.
                // Let's assume [x, x] if only x is given for scaling/skewing, and [x, 0] for translation.
                // For origin, [x, '50%'] or [x, x] might be default.
                // To match original behavior (where it assigned 'x' if only x was present), we'll do that.
                // However, the original code assigned `val = x` if only x was present for `field.x`.
                // This means `funcs[key] = x;` which means `scale: 10` (not `[10,10]`)
                // Let's stick to the original's implicit handling where single value might be accepted.
                collectedTransformations[groupKey] = xVal;
            }
        });

        // Determine if animation is requested
        const shouldAnimate = getCheckboxState(transformationControls.animationEnabled);

        const primaryVisualElement = jq(DOM_SELECTORS.primaryTarget);
        const auxiliaryVisualElement = jq(DOM_SELECTORS.secondaryTarget);

        if (shouldAnimate) {
            // Pre-process values for animation if they are arrays, joining them with spaces
            let animationProperties = {};
            jq.each(collectedTransformations, function(propName, propValue) {
                if (jq.isArray(propValue)) {
                    animationProperties[propName] = propValue.join(' ');
                } else {
                    animationProperties[propName] = propValue;
                }
            });

            // Reset transform before animating to ensure consistent start
            primaryVisualElement.transform({});
            primaryVisualElement.triggerAnimation(animationProperties, {
                duration: 750,
                easing: 'swing'
            });

            auxiliaryVisualElement.transform({
                transformOrigin: '0 0'
            }); // Explicitly set origin for secondary target
            auxiliaryVisualElement.triggerAnimation(animationProperties, {
                duration: 750,
                easing: 'easeOutSine' // Using a different easing for variety
            });

            console.log("Animation initiated with parameters:", animationProperties);

        } else {
            // Apply transformations directly without animation
            primaryVisualElement.transform(collectedTransformations);

            // For the secondary target, ensure origin is explicitly handled
            let secondaryTargetTransforms = { ...collectedTransformations
            };
            secondaryTargetTransforms['transformOrigin'] = [0, 0]; // Always reset origin for secondary
            auxiliaryVisualElement.transform(secondaryTargetTransforms, {
                forceMatrix: true,
                use3D: true // Add an extra option for Type III change
            });

            console.log("Static transformations applied:", collectedTransformations);
        }
    };

    // Attach event listeners
    jq(DOM_SELECTORS.mainForm).onFormSubmission(function(evt) {
        if (evt && typeof evt.haltDefaultAction === 'function') {
            evt.haltDefaultAction();
        }
        applyElementTransforms();
    });

    jq(DOM_SELECTORS.triggerBtn).onButtonClick(function(evt) {
        if (evt && typeof evt.haltDefaultAction === 'function') {
            evt.haltDefaultAction();
        }
        applyElementTransforms();
        const currentBtnElem = jq(this);
        // Slightly different animation for the button
        currentBtnElem.triggerAnimation({
            rotationEffect: '+=720deg'
        }, {
            duration: 1200,
            complete: function() {
                console.log("Button rotation complete!");
            }
        });
    });

    // Initial console log to indicate script loaded
    console.log("Transformation script module loaded and initialized.");

})(jQuery, this, this.document);