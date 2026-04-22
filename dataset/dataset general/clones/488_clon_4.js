((globalContext) => {
  'use strict';

  let lastInvocationTimestamp = Date.now();
  let throttlePeriod = 100;
  const registeredEventHandlers = new Set();

  const executeQueuedHandlers = () => {
    const currentMoment = Date.now();
    if (currentMoment - lastInvocationTimestamp > throttlePeriod) {
      for (const handler of registeredEventHandlers) {
        handler();
      }
      lastInvocationTimestamp = currentMoment;
    }
  };

  const registerForDomAlterations = (handlerCallback, customThrottle) => {
    if (customThrottle !== undefined && customThrottle !== null) {
      throttlePeriod = customThrottle;
    }
    registeredEventHandlers.add(handlerCallback);
  };

  if (typeof globalContext.MutationObserver === 'function') {
    const mutationObservingOptions = {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    };

    const domChangeWatcher = new globalContext.MutationObserver(() => {
      executeQueuedHandlers();
    });

    globalContext.addEventListener("DOMContentLoaded", () => {
      domChangeWatcher.observe(globalContext.document.documentElement, mutationObservingOptions);
    });

  } else {
    let priorNodeCount = 0;
    let priorHtmlLength = 0;

    const countAllNodes = (root) => {
      let count = 0;
      const walker = globalContext.document.createTreeWalker(
        root,
        NodeFilter.SHOW_ALL,
        null,
        false
      );
      while (walker.nextNode()) {
        count++;
      }
      return count;
    };

    const pollForChanges = () => {
      const currentNodeCount = countAllNodes(globalContext.document.documentElement);
      const currentHtmlLength = globalContext.document.documentElement.outerHTML.length;

      if (currentNodeCount !== priorNodeCount || currentHtmlLength !== priorHtmlLength) {
        executeQueuedHandlers();
        priorNodeCount = currentNodeCount;
        priorHtmlLength = currentHtmlLength;
      }
      globalContext.setTimeout(pollForChanges, throttlePeriod);
    };

    globalContext.addEventListener("DOMContentLoaded", () => {
        priorNodeCount = countAllNodes(globalContext.document.documentElement);
        priorHtmlLength = globalContext.document.documentElement.outerHTML.length;
        globalContext.setTimeout(pollForChanges, throttlePeriod);
    });
  }

  globalContext.domObserverService = registerForDomAlterations;

})(window);

((jQ) => {
  'use strict';

  const configurationData = {};
  const auxiliaryRoutines = {};
  const operationalMethods = {};

  configurationData.sizeUnits = ['viewport_width', 'viewport_height', 'characters', 'root_em', 'centimeters', 'millimeters', 'inches', 'points', 'picas', 'pixels_absolute'];
  configurationData.colorSpectrum = ['crimson', 'saffron', 'lemon', 'emerald', 'sapphire', 'amethyst', 'charcoal'];

  configurationData.mediaQueryFeatureIdentifier = /(minimum|maximum)?((device_)?(horizontal_extent|vertical_extent)|ratio_aspect)/gi;

  configurationData.ratioAspectPattern = /(minimum|maximum)?ratio_aspect\s*:\s*(\d+)\/(\d+)/gi;
  const unitRegexFragment = configurationData.sizeUnits.map(u => u.replace(/_/g, '-')).join('|');
  configurationData.horizontalDimensionPattern = new RegExp(
    `(minimum|maximum)?(device_)?horizontal_extent\\s*:\\s*(\\d+)(${unitRegexFragment})?(\\s|\\))`,
    'gi'
  );
  configurationData.verticalDimensionPattern = new RegExp(
    `(minimum|maximum)?(device_)?vertical_extent\\s*:\\s*(\\d+)(${unitRegexFragment})?(\\s|\\))`,
    'gi'
  );

  auxiliaryRoutines.determineDiagonalAngle = (boxHorizontalExtent, boxVerticalExtent) => {
    const angleDegreesVertical = Math.atan2(boxHorizontalExtent, boxVerticalExtent) * (180 / Math.PI);
    const finalAngle = Math.round(angleDegreesVertical * 100) / 100;
    return finalAngle;
  };

  auxiliaryRoutines.retrieveAbsolutePosition = (targetNode) => {
    const rect = targetNode.getBoundingClientRect();

    let absoluteLeft = rect.left + window.scrollX;
    let absoluteTop = rect.top + window.scrollY;

    if (targetNode.tagName.toLowerCase() === 'img') {
      const computedStyle = window.getComputedStyle(targetNode);
      absoluteLeft += parseInt(computedStyle.getPropertyValue('padding-left'), 10) || 0;
      absoluteTop += parseInt(computedStyle.getPropertyValue('padding-top'), 10) || 0;
    }

    return { horizontal: absoluteLeft, vertical: absoluteTop };
  };

  auxiliaryRoutines.fabricateBreakpointVisuals = (uniqueId, mediaQueryDefinition) => {
    const individualQueryStrings = mediaQueryDefinition.split(',').map(s => s.trim());

    let classificationTag;
    let labelClassification;
    let visualStyling = {};
    let labelStyling = {};
    let descriptiveLabel;

    for (const singleQuery of individualQueryStrings) {
      let isQueryValid = true;

      if (singleQuery === 'not all') {
        continue;
      }

      const mediaTypeMatch = singleQuery.match(/(all|screen)/i);
      const notMediaTypeMatch = singleQuery.match(/not (all|screen)/i);
      if (!(mediaTypeMatch && !notMediaTypeMatch)) {
        continue;
      }

      if (singleQuery.match(configurationData.mediaQueryFeatureIdentifier)) {

        const horizontalRulesFound = singleQuery.match(new RegExp(configurationData.horizontalDimensionPattern.source, 'gi')) || [];
        const expectedParensCount = (singleQuery.match(/\(/g) || []).length;
        if (horizontalRulesFound.length > 0 && horizontalRulesFound.length === expectedParensCount) {

          const featureKeyMatches = singleQuery.match(/([a-zA-Z_-]+):/g) || [];
          if (!featureKeyMatches.every(key => key.match(/horizontal_extent$/i))) {
            isQueryValid = false;
          }

          if (isQueryValid) {
            labelClassification = 'breakpoint-label-visual breakpoint-label-horizontal';

            const parsedSegments = [];
            let tempRegex = new RegExp(configurationData.horizontalDimensionPattern.source, 'gi');
            let currentMatch;
            while ((currentMatch = tempRegex.exec(singleQuery)) !== null) {
                parsedSegments.push(currentMatch);
            }

            if (parsedSegments.length === 2) {
              const [firstSegment, secondSegment] = parsedSegments;

              const firstPrefix = firstSegment[1] || '';
              const firstValue = parseInt(firstSegment[3], 10);
              const firstUnit = firstSegment[4] || '';

              const secondPrefix = secondSegment[1] || '';
              const secondValue = parseInt(secondSegment[3], 10);
              const secondUnit = secondSegment[4] || '';

              if (
                (firstPrefix === 'minimum' || firstPrefix === 'maximum') &&
                (secondPrefix === 'minimum' || secondPrefix === 'maximum') &&
                firstPrefix !== secondPrefix &&
                (firstUnit === secondUnit || (firstValue === 0 && !firstUnit) || (secondValue === 0 && !secondUnit))
              ) {
                classificationTag = 'breakpoint-visual breakpoint-horizontal-range';

                if (firstPrefix === 'minimum') {
                  visualStyling = {
                    left: `${firstValue - 1}${firstUnit}`,
                    width: `${secondValue - firstValue}${secondUnit}`
                  };
                  labelStyling = { left: `${secondValue}${secondUnit}` };
                  descriptiveLabel = `${horizontalRulesFound[0].replace(/\s*\)$/, '')} -- ${horizontalRulesFound[1].replace(/\s*\)$/, '')}`;
                } else {
                  visualStyling = {
                    left: `${secondValue - 1}${secondUnit}`,
                    width: `${firstValue - secondValue}${firstUnit}`
                  };
                  labelStyling = { left: `${firstValue}${firstUnit}` };
                  descriptiveLabel = `${horizontalRulesFound[1].replace(/\s*\)$/, '')} -- ${horizontalRulesFound[0].replace(/\s*\)$/, '')}`;
                }
              }
            } else if (parsedSegments.length === 1) {
              const [singleSegment] = parsedSegments;

              const prefix = singleSegment[1] || '';
              const value = parseInt(singleSegment[3], 10);
              const unit = singleSegment[4] || '';

              if (value === 0 || (value > 0 && unit)) {
                classificationTag = `breakpoint-visual breakpoint-${prefix}horizontal`;

                visualStyling = { left: `${value}${unit}` };
                if (prefix === 'maximum') {
                  visualStyling = { width: `${value}${unit}` };
                }

                labelStyling = { left: `${value}${unit}` };
                descriptiveLabel = horizontalRulesFound[0].replace(/\s*\)$/, '');
              }
            }
          }
        }

        const verticalRulesFound = singleQuery.match(new RegExp(configurationData.verticalDimensionPattern.source, 'gi')) || [];
        if (verticalRulesFound.length > 0 && verticalRulesFound.length === expectedParensCount) {

          const featureKeyMatches = singleQuery.match(/([a-zA-Z_-]+):/g) || [];
          if (!featureKeyMatches.every(key => key.match(/vertical_extent$/i))) {
            isQueryValid = false;
          }

          if (isQueryValid) {
            labelClassification = 'breakpoint-label-visual breakpoint-label-vertical';

            const parsedSegments = [];
            let tempRegex = new RegExp(configurationData.verticalDimensionPattern.source, 'gi');
            let currentMatch;
            while ((currentMatch = tempRegex.exec(singleQuery)) !== null) {
                parsedSegments.push(currentMatch);
            }

            if (parsedSegments.length === 2) {
              const [firstSegment, secondSegment] = parsedSegments;

              const firstPrefix = firstSegment[1] || '';
              const firstValue = parseInt(firstSegment[3], 10);
              const firstUnit = firstSegment[4] || '';

              const secondPrefix = secondSegment[1] || '';
              const secondValue = parseInt(secondSegment[3], 10);
              const secondUnit = secondSegment[4] || '';

              if (
                (firstPrefix === 'minimum' || firstPrefix === 'maximum') &&
                (secondPrefix === 'minimum' || secondPrefix === 'maximum') &&
                firstPrefix !== secondPrefix &&
                (firstUnit === secondUnit || (firstValue === 0 && !firstUnit) || (secondValue === 0 && !secondUnit))
              ) {
                classificationTag = 'breakpoint-visual breakpoint-vertical-range';

                if (firstPrefix === 'minimum') {
                  visualStyling = {
                    top: `${firstValue - 1}${firstUnit}`,
                    height: `${secondValue - firstValue}${secondUnit}`
                  };
                  labelStyling = { top: `${secondValue}${secondUnit}` };
                  descriptiveLabel = `${verticalRulesFound[0].replace(/\s*\)$/, '')} -- ${verticalRulesFound[1].replace(/\s*\)$/, '')}`;
                } else {
                  visualStyling = {
                    top: `${secondValue - 1}${secondUnit}`,
                    height: `${firstValue - secondValue}${firstUnit}`
                  };
                  labelStyling = { top: `${firstValue}${firstUnit}` };
                  descriptiveLabel = `${verticalRulesFound[1].replace(/\s*\)$/, '')} -- ${verticalRulesFound[0].replace(/\s*\)$/, '')}`;
                }
              }
            }
          }
        }
      }
    }
  };

})(jQuery);