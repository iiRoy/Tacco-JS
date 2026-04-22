(function() {
  const namedColorRegistry = {
    aqua: [0, 255, 255], azure: [240, 255, 255], beige: [245, 245, 220], black: [0, 0, 0],
    blue: [0, 0, 255], brown: [165, 42, 42], cyan: [0, 255, 255], darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139], darkgrey: [169, 169, 169], darkgreen: [0, 100, 0], darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139], darkolivegreen: [85, 107, 47], darkorange: [255, 140, 0], darkorchid: [153, 50, 204],
    darkred: [139, 0, 0], darksalmon: [233, 150, 122], darkviolet: [148, 0, 211], fuchsia: [255, 0, 255],
    gold: [255, 215, 0], green: [0, 128, 0], indigo: [75, 0, 130], khaki: [240, 230, 140],
    lightblue: [173, 216, 230], lightcyan: [224, 255, 255], lightgreen: [144, 238, 144], lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193], lightyellow: [255, 255, 224], lime: [0, 255, 0], magenta: [255, 0, 255],
    maroon: [128, 0, 0], navy: [0, 0, 128], olive: [128, 128, 0], orange: [255, 165, 0],
    pink: [255, 192, 203], purple: [128, 0, 128], violet: [128, 0, 128], red: [255, 0, 0],
    silver: [192, 192, 192], white: [255, 255, 255], yellow: [255, 255, 0],
    transparent: [255, 255, 255],
  };

  function translateColor(colorInput) {
    let matchResult;
    if (Array.isArray(colorInput) && colorInput.length === 3) return colorInput;

    if ((matchResult = /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/.exec(colorInput))) {
      return [parseInt(matchResult[1], 10), parseInt(matchResult[2], 10), parseInt(matchResult[3], 10)];
    }
    if ((matchResult = /rgb\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*\)/.exec(colorInput))) {
      return [parseFloat(matchResult[1]) * 2.55, parseFloat(matchResult[2]) * 2.55, parseFloat(matchResult[3]) * 2.55];
    }
    if ((matchResult = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(colorInput))) {
      return [parseInt(matchResult[1], 16), parseInt(matchResult[2], 16), parseInt(matchResult[3], 16)];
    }
    if ((matchResult = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(colorInput))) {
      return [parseInt(matchResult[1] + matchResult[1], 16), parseInt(matchResult[2] + matchResult[2], 16), parseInt(matchResult[3] + matchResult[3], 16)];
    }
    if ((matchResult = /rgba\(0, 0, 0, 0\)/.exec(colorInput))) {
      return namedColorRegistry.transparent;
    }
    return namedColorRegistry[String(colorInput).trim().toLowerCase()] || [0, 0, 0];
  }

  function deconstructValue(inputVal) {
    const segments = String(inputVal).match(/^([+-]=)?([\d+-.]+)(.*)$/);
    if (segments) {
      return {
        operation: segments[1],
        amount: parseFloat(segments[2]),
        unitIdentifier: segments[3],
      };
    }
    return { operation: null, amount: 0, unitIdentifier: "" };
  }

  const hueProperties = ['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'];

  function obtainElementCenter(targetElement) {
    const box = targetElement.getBoundingClientRect();
    return {
      x: box.left + window.pageXOffset + (box.width / 2),
      y: box.top + window.pageYOffset + (box.height / 2),
    };
  }

  const managedElementsData = new WeakMap();
  let pointerLocation = { x: 0, y: 0 };
  let animationTicket = null;
  let lastFrameTime = 0;
  const systemParameters = {
    updateThrottle: 50,
    proximityThreshold: 400,
  };

  function refreshAnimationCycle() {
    const currentTime = performance.now();
    if (currentTime - lastFrameTime < systemParameters.updateThrottle) {
      animationTicket = requestAnimationFrame(refreshAnimationCycle);
      return;
    }
    lastFrameTime = currentTime;

    managedElementsData.forEach((elementConfig, elementNode) => {
      const elementCentralPoint = obtainElementCenter(elementNode);
      const separationDistance = Math.sqrt(
        Math.pow(pointerLocation.x - elementCentralPoint.x, 2) +
        Math.pow(pointerLocation.y - elementCentralPoint.y, 2)
      );

      const influenceFactor = (systemParameters.proximityThreshold - separationDistance) / systemParameters.proximityThreshold;
      const currentElementStyles = {};

      elementConfig.styleInterpolators.forEach(styleSpec => {
        let finalStyleValue;

        if (separationDistance > systemParameters.proximityThreshold) {
          if (styleSpec.isColor) {
            finalStyleValue = `rgb(${styleSpec.initial.join(',')})`;
          } else {
            finalStyleValue = `${styleSpec.initial}${styleSpec.unit}`;
          }
        } else {
          if (styleSpec.isColor) {
            const interpolatedColor = styleSpec.initial.map((component, idx) =>
              Math.round(component + (styleSpec.target[idx] - component) * influenceFactor)
            );
            finalStyleValue = `rgb(${interpolatedColor.join(',')})`;
          } else {
            finalStyleValue = `${styleSpec.initial + (styleSpec.target - styleSpec.initial) * influenceFactor}${styleSpec.unit}`;
          }
        }
        currentElementStyles[styleSpec.property] = finalStyleValue;
      });

      if (!elementNode.dataset.transitionSet) {
        elementNode.style.transition = `all ${systemParameters.updateThrottle - 1}ms linear`;
        elementNode.dataset.transitionSet = 'true';
      }

      for (const prop in currentElementStyles) {
        elementNode.style[prop] = currentElementStyles[prop];
      }
    });

    animationTicket = requestAnimationFrame(refreshAnimationCycle);
  }

  function handleDocumentPointerMove(event) {
    pointerLocation = { x: event.pageX, y: event.pageY };
    if (!animationTicket) {
      animationTicket = requestAnimationFrame(refreshAnimationCycle);
    }
  }

  window.proximityPilot = function(elementsCollection, interactionStyles, interactionOptions, postAction) {
    const targetNodes = Array.from(elementsCollection);

    if (interactionOptions) {
      if (typeof interactionOptions === 'number') {
        systemParameters.proximityThreshold = interactionOptions;
      } else {
        Object.assign(systemParameters, interactionOptions);
      }
    }

    targetNodes.forEach(node => {
      const nodeAnimationData = {
        styleInterpolators: [],
      };

      const initialComputedState = window.getComputedStyle(node);

      for (const styleKey in interactionStyles) {
        const initialValueString = initialComputedState[styleKey];
        const targetValueString = interactionStyles[styleKey];

        const isColorProperty = hueProperties.includes(styleKey);
        let startNumericValue, endNumericValue, propertyUnit;

        if (isColorProperty) {
          startNumericValue = translateColor(initialValueString);
          endNumericValue = translateColor(targetValueString);
        } else {
          const initialDeconstructed = deconstructValue(initialValueString);
          const targetDeconstructed = deconstructValue(targetValueString);

          startNumericValue = initialDeconstructed.amount;
          propertyUnit = targetDeconstructed.unitIdentifier || initialDeconstructed.unitIdentifier || '';

          if (targetDeconstructed.operation) {
            endNumericValue = (targetDeconstructed.operation === "-=" ? -1 : 1) * targetDeconstructed.amount + startNumericValue;
          } else {
            endNumericValue = targetDeconstructed.amount;
          }
        }

        nodeAnimationData.styleInterpolators.push({
          property: styleKey,
          isColor: isColorProperty,
          initial: startNumericValue,
          target: endNumericValue,
          unit: propertyUnit,
        });
      }
      managedElementsData.set(node, nodeAnimationData);
    });

    if (!animationTicket) {
      document.addEventListener('mousemove', handleDocumentPointerMove);
      animationTicket = requestAnimationFrame(refreshAnimationCycle);
    }

    if (postAction) {
      postAction();
    }

    return elementsCollection;
  };
})();