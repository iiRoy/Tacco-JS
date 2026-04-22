(function(applicationWindow, domStructure) {

    const elementIdentifiers = {
        transformationForm: 'transform',
        activationButton: 'go',
        animationToggle: 'animate',
        primaryDisplaySurface: 'target',
        secondaryDisplaySurface: 'target2',

        // Value controls
        rotationInput: 'rotate',
        scaleXInputCombined: 'scale-x',
        scaleYInputCombined: 'scale-y',
        scaleXInputIndividual: 'scaleX',
        scaleYInputIndividual: 'scaleY',
        skewXInputCombined: 'skew-x',
        skewYInputCombined: 'skew-y',
        skewXInputIndividual: 'skewX',
        skewYInputIndividual: 'skewY',
        translateXInputCombined: 'translate-x',
        translateYInputCombined: 'translate-y',
        translateXInputIndividual: 'translateX',
        translateYInputIndividual: 'translateY',
        originXInput: 'origin-x',
        originYInput: 'origin-y',
        
        // Checkboxes for reflection
        reflectionAll: 'reflect',
        reflectionXAxis: 'reflectX',
        reflectionYAxis: 'reflectY',
        reflectionXYAxis: 'reflectXY'
    };

    const retrieveDOMElement = (id) => domStructure.getElementById(id);
    const extractContentValue = (elem) => elem ? elem.value.trim() : '';
    const queryCheckedState = (elem) => elem ? elem.checked : false;

    const executeStylingApplication = () => {
        const collectedTransformationParameters = {};
        let finalTransformCSS = '';
        let finalOriginCSS = '50% 50%'; // Default CSS transform-origin

        // Helper to conditionally add a parameter, mimicking original's value collection
        const addTransformationParameter = (key, value) => {
            if (value !== null && value !== undefined && value !== '') {
                collectedTransformationParameters[key] = value;
            }
        };

        // Process dual-axis inputs (scale, skew, translate, origin)
        // This function mimics the original's logic where if X and Y are both present, it's a combined value.
        // If only X is present, it's a single value. If only Y is present, the parameter is not set.
        const processPairedInput = (xId, yId, paramKey) => {
            const xValue = extractContentValue(retrieveDOMElement(xId));
            const yValue = extractContentValue(retrieveDOMElement(yId));
            if (xValue && yValue) {
                addTransformationParameter(paramKey, [xValue, yValue]);
            } else if (xValue) {
                addTransformationParameter(paramKey, [xValue]);
            }
            // If only yValue exists, the parameter is not added, consistent with original.
        };

        // Gather all input values based on the original's field structure and logic
        addTransformationParameter('rotate', extractContentValue(retrieveDOMElement(elementIdentifiers.rotationInput)));

        processPairedInput(elementIdentifiers.scaleXInputCombined, elementIdentifiers.scaleYInputCombined, 'scale');
        addTransformationParameter('scaleX', extractContentValue(retrieveDOMElement(elementIdentifiers.scaleXInputIndividual)));
        addTransformationParameter('scaleY', extractContentValue(retrieveDOMElement(elementIdentifiers.scaleYInputIndividual)));

        processPairedInput(elementIdentifiers.skewXInputCombined, elementIdentifiers.skewYInputCombined, 'skew');
        addTransformationParameter('skewX', extractContentValue(retrieveDOMElement(elementIdentifiers.skewXInputIndividual)));
        addTransformationParameter('skewY', extractContentValue(retrieveDOMElement(elementIdentifiers.skewYInputIndividual)));

        processPairedInput(elementIdentifiers.translateXInputCombined, elementIdentifiers.translateYInputCombined, 'translate');
        addTransformationParameter('translateX', extractContentValue(retrieveDOMElement(elementIdentifiers.translateXInputIndividual)));
        addTransformationParameter('translateY', extractContentValue(retrieveDOMElement(elementIdentifiers.translateYInputIndividual)));

        // Origin is handled separately because it applies to transform-origin, not transform
        const originXVal = extractContentValue(retrieveDOMElement(elementIdentifiers.originXInput));
        const originYVal = extractContentValue(retrieveDOMElement(elementIdentifiers.originYInput));
        if (originXVal && originYVal) {
            finalOriginCSS = `${originXVal} ${originYVal}`;
        } else if (originXVal) {
            finalOriginCSS = originXVal;
        }

        // Reflection checkboxes map to scale transformations
        if (queryCheckedState(retrieveDOMElement(elementIdentifiers.reflectionAll))) {
            addTransformationParameter('reflect', true);
        }
        if (queryCheckedState(retrieveDOMElement(elementIdentifiers.reflectionXAxis))) {
            addTransformationParameter('reflectX', true);
        }
        if (queryCheckedState(retrieveDOMElement(elementIdentifiers.reflectionYAxis))) {
            addTransformationParameter('reflectY', true);
        }
        if (queryCheckedState(retrieveDOMElement(elementIdentifiers.reflectionXYAxis))) {
            addTransformationParameter('reflectXY', true); // Assuming this is equivalent to general reflect
        }

        // Construct the CSS transform string from collected parameters
        // Order matters for transforms, mimicking a common plugin application order
        const transformOrder = [
            'rotate', 'scale', 'scaleX', 'scaleY', 'skew', 'skewX', 'skewY',
            'translate', 'translateX', 'translateY',
            'reflect', 'reflectX', 'reflectY', 'reflectXY'
        ];
        const transformFunctionStrings = [];

        for (const operationKey of transformOrder) {
            const operationValue = collectedTransformationParameters[operationKey];

            if (operationValue === undefined || operationValue === null) continue;

            // Handle precedence: combined transforms override individual ones
            if (operationKey === 'scaleX' && collectedTransformationParameters['scale']) continue;
            if (operationKey === 'scaleY' && collectedTransformationParameters['scale']) continue;
            if (operationKey === 'skewX' && collectedTransformationParameters['skew']) continue;
            if (operationKey === 'skewY' && collectedTransformationParameters['skew']) continue;
            if (operationKey === 'translateX' && collectedTransformationParameters['translate']) continue;
            if (operationKey === 'translateY' && collectedTransformationParameters['translate']) continue;
            if ((operationKey === 'reflectX' || operationKey === 'reflectY' || operationKey === 'reflectXY') && collectedTransformationParameters['reflect']) continue;

            switch (operationKey) {
                case 'rotate':
                    transformFunctionStrings.push(`rotate(${operationValue}deg)`);
                    break;
                case 'scale':
                    transformFunctionStrings.push(`scale(${Array.isArray(operationValue) ? operationValue.join(', ') : operationValue})`);
                    break;
                case 'scaleX':
                    transformFunctionStrings.push(`scaleX(${operationValue})`);
                    break;
                case 'scaleY':
                    transformFunctionStrings.push(`scaleY(${operationValue})`);
                    break;
                case 'skew':
                    transformFunctionStrings.push(`skew(${Array.isArray(operationValue) ? operationValue.map(v => v + 'deg').join(', ') : operationValue + 'deg'})`);
                    break;
                case 'skewX':
                    transformFunctionStrings.push(`skewX(${operationValue}deg)`);
                    break;
                case 'skewY':
                    transformFunctionStrings.push(`skewY(${operationValue}deg)`);
                    break;
                case 'translate':
                    transformFunctionStrings.push(`translate(${Array.isArray(operationValue) ? operationValue.map(v => v + 'px').join(', ') : operationValue + 'px'})`);
                    break;
                case 'translateX':
                    transformFunctionStrings.push(`translateX(${operationValue}px)`);
                    break;
                case 'translateY':
                    transformFunctionStrings.push(`translateY(${operationValue}px)`);
                    break;
                case 'reflect':
                case 'reflectXY': // Both map to scale(-1,-1) based on context
                    transformFunctionStrings.push('scale(-1, -1)');
                    break;
                case 'reflectX':
                    transformFunctionStrings.push('scaleX(-1)');
                    break;
                case 'reflectY':
                    transformFunctionStrings.push('scaleY(-1)');
                    break;
            }
        }
        finalTransformCSS = transformFunctionStrings.join(' ');

        const animateElements = queryCheckedState(retrieveDOMElement(elementIdentifiers.animationToggle));

        const applyStylesToElement = (targetElement, transformValue, originValue, shouldAnimate, forceOriginZero = false) => {
            if (shouldAnimate) {
                targetElement.style.transition = 'transform 0.5s ease-in-out, transform-origin 0.5s ease-in-out';
            } else {
                targetElement.style.transition = 'none';
            }
            targetElement.style.transform = transformValue;
            targetElement.style.transformOrigin = forceOriginZero ? '0 0' : originValue;
        };

        const targetA = retrieveDOMElement(elementIdentifiers.primaryDisplaySurface);
        const targetB = retrieveDOMElement(elementIdentifiers.secondaryDisplaySurface);

        applyStylesToElement(targetA, finalTransformCSS, finalOriginCSS, animateElements);
        // For the second target, the origin is always forced to [0,0] based on original code's behavior
        applyStylesToElement(targetB, finalTransformCSS, finalOriginCSS, animateElements, true);
    };

    const handleFormInteraction = (eventObject) => {
        eventObject.preventDefault();
        executeStylingApplication();
    };

    const handleButtonClick = (eventObject) => {
        eventObject.preventDefault();
        executeStylingApplication();
        // Animate the button itself, mimicking the original's jQuery animate
        const buttonElement = retrieveDOMElement(elementIdentifiers.activationButton);
        const currentRotation = parseFloat(buttonElement.style.getPropertyValue('--current-rotation') || '0');
        buttonElement.style.setProperty('--current-rotation', `${currentRotation + 360}deg`);
        buttonElement.style.transition = 'transform 0.5s ease-in-out';
        buttonElement.style.transform = `rotate(${currentRotation + 360}deg)`;
    };

    // Attach all event listeners
    retrieveDOMElement(elementIdentifiers.transformationForm).addEventListener('submit', handleFormInteraction);
    retrieveDOMElement(elementIdentifiers.activationButton).addEventListener('click', handleButtonClick);

})(window, document);