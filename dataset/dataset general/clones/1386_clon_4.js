(function(globalScope, moduleFactory) {
  if (typeof define === 'function' && define.amd) {
    define(moduleFactory);
  } else if (typeof exports === 'object') {
    module.exports = moduleFactory(require, exports, module);
  } else {
    globalScope.elementAnimator = moduleFactory();
  }
}(this, function(require, exports, module) {

  'use strict';

  // --- Internal Utilities ---

  // Helper to check if an item is a plain object
  const isPlainObject = (item) => {
    return (item && typeof item === 'object' && !Array.isArray(item));
  };

  // Deep merge utility for configurations (replaces _extend)
  const deepMergeConfigurations = (target, ...sources) => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isPlainObject(target) && isPlainObject(source)) {
      for (const key in source) {
        if (isPlainObject(source[key])) {
          if (!target[key]) Object.assign(target, {
            [key]: {}
          });
          deepMergeConfigurations(target[key], source[key]);
        } else {
          Object.assign(target, {
            [key]: source[key]
          });
        }
      }
    }
    return deepMergeConfigurations(target, ...sources);
  };

  // Checks if the environment supports necessary APIs (replaces isSupported)
  const isEnvironmentCapable = () => {
    return 'IntersectionObserver' in window &&
      'requestAnimationFrame' in window &&
      'addEventListener' in window;
  };

  // Checks if the device is likely mobile (replaces isMobile)
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Helper to parse keyword arguments from data attribute
  const interpretKeywordArguments = (keyword, tokens, currentIndex) => {
    let configSnippet = {};
    let tokensConsumed = 1;

    switch (keyword) {
      case 'enter':
        configSnippet.entryDirection = tokens[currentIndex + 1];
        tokensConsumed = 2;
        break;
      case 'wait':
        configSnippet.animationDelay = tokens[currentIndex + 1];
        tokensConsumed = 2;
        break;
      case 'move':
        configSnippet.translationDistance = tokens[currentIndex + 1];
        tokensConsumed = 2;
        break;
      case 'over':
        configSnippet.transitionDuration = tokens[currentIndex + 1];
        tokensConsumed = 2;
        break;
      case 'ease':
        configSnippet.timingFunction = 'ease';
        break;
      case 'ease-in':
      case 'ease-out':
      case 'ease-in-out':
        configSnippet.timingFunction = keyword;
        if (tokens[currentIndex + 1] === 'up' || tokens[currentIndex + 1] === 'down') {
          configSnippet.scaling = configSnippet.scaling || {};
          configSnippet.scaling.orientation = tokens[currentIndex + 1];
          configSnippet.scaling.magnitude = tokens[currentIndex + 2];
          tokensConsumed = 3;
        } else {
          configSnippet.translationDistance = tokens[currentIndex + 1];
          tokensConsumed = 2;
        }
        break;
      case 'hustle':
        configSnippet.timingFunction = 'cubic-bezier( 0.6, 0.2, 0.1, 1 )';
        if (tokens[currentIndex + 1] === 'up' || tokens[currentIndex + 1] === 'down') {
          configSnippet.scaling = configSnippet.scaling || {};
          configSnippet.scaling.orientation = tokens[currentIndex + 1];
          configSnippet.scaling.magnitude = tokens[currentIndex + 2];
          tokensConsumed = 3;
        } else {
          configSnippet.translationDistance = tokens[currentIndex + 1];
          tokensConsumed = 2;
        }
        break;
      case 'flip':
      case 'pitch':
        configSnippet.rotation = configSnippet.rotation || {};
        configSnippet.rotation.axisX = tokens[currentIndex + 1];
        tokensConsumed = 2;
        break;
      case 'spin':
      case 'yaw':
        configSnippet.rotation = configSnippet.rotation || {};
        configSnippet.rotation.axisY = tokens[currentIndex + 1];
        tokensConsumed = 2;
        break;
      case 'roll':
        configSnippet.rotation = configSnippet.rotation || {};
        configSnippet.rotation.axisZ = tokens[currentIndex + 1];
        tokensConsumed = 2;
        break;
      case 'reset':
        configSnippet.allowReset = (tokens[currentIndex - 1] !== 'no');
        break;
      case 'scale':
        configSnippet.scaling = configSnippet.scaling || {};
        if (tokens[currentIndex + 1] === 'up' || tokens[currentIndex + 1] === 'down') {
          configSnippet.scaling.orientation = tokens[currentIndex + 1];
          configSnippet.scaling.magnitude = tokens[currentIndex + 2];
          tokensConsumed = 3;
        } else {
          configSnippet.scaling.magnitude = tokens[currentIndex + 1];
          tokensConsumed = 2;
        }
        break;
      default:
        tokensConsumed = 1;
    }
    return {
      configSnippet,
      tokensConsumed
    };
  };

  // Function to process data attributes into a configuration object (replaces configFactory)
  const configureElementBehavior = (targetNode, baseConfiguration) => {
    let specificConfig = deepMergeConfigurations({}, baseConfiguration);
    const rawAttr = targetNode.getAttribute('data-reveal-fx'); // New attribute name
    if (!rawAttr) return specificConfig;

    const attributeTokens = rawAttr.split(/[, ]+/).filter(Boolean);

    for (let i = 0; i < attributeTokens.length; i++) {
      const token = attributeTokens[i];
      const {
        configSnippet,
        tokensConsumed
      } = interpretKeywordArguments(token, attributeTokens, i);
      deepMergeConfigurations(specificConfig, configSnippet);
      i += tokensConsumed - 1;
    }

    // Post-processing for derived properties
    if (specificConfig.entryDirection === 'top' || specificConfig.entryDirection === 'bottom') {
      specificConfig.motionAxis = 'Y';
    } else if (specificConfig.entryDirection === 'left' || specificConfig.entryDirection === 'right') {
      specificConfig.motionAxis = 'X';
    }

    if (specificConfig.timingFunction === 'hustle') {
      specificConfig.timingFunction = 'cubic-bezier( 0.6, 0.2, 0.1, 1 )';
    }

    if (specificConfig.entryDirection === 'top' || specificConfig.entryDirection === 'left') {
      specificConfig.translationDistance = '-' + specificConfig.translationDistance;
    }

    return specificConfig;
  };

  // Converts a style object to a CSS string, with vendor prefixes for transforms/transitions
  const styleObjectToCssString = (styleObj, addWebkitPrefix = true) => {
    let cssString = '';
    for (const prop in styleObj) {
      if (Object.prototype.hasOwnProperty.call(styleObj, prop)) {
        const value = styleObj[prop];
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        cssString += `${cssProp}: ${value}; `;
        if (addWebkitPrefix && (prop === 'transform' || prop.startsWith('transition'))) {
          cssString += `-webkit-${cssProp}: ${value}; `;
        }
      }
    }
    return cssString;
  };

  // Function to generate CSS style objects (replaces styleFactory)
  const generateElementVisuals = (elementData) => {
    const settings = elementData.elementConfiguration;
    const existingInlineStyle = elementData.domReference.getAttribute('style') || '';

    const totalAnimationTimeMs = (parseFloat(settings.transitionDuration) + parseFloat(settings.animationDelay)) * 1000;

    let baseCommonStyles = {
      visibility: 'visible',
      perspective: '1000px',
      backfaceVisibility: 'hidden'
    };

    let transitionBaseProperties = {
      transitionProperty: 'transform, opacity',
      transitionDuration: settings.transitionDuration,
      transitionTimingFunction: settings.timingFunction
    };

    // Initial state styles (hidden/transformed)
    let initialTransformComponents = [];
    if (parseInt(settings.translationDistance) !== 0) {
      initialTransformComponents.push(`translate${settings.motionAxis}(${settings.translationDistance})`);
    }
    if (settings.scaling && parseInt(settings.scaling.magnitude) !== 0) {
      let scaleVal;
      if (settings.scaling.orientation === 'up') {
        scaleVal = 1 - (parseFloat(settings.scaling.magnitude) * 0.01);
      } else if (settings.scaling.orientation === 'down') {
        scaleVal = 1 + (parseFloat(settings.scaling.magnitude) * 0.01);
      } else {
        scaleVal = 1 - (parseFloat(settings.scaling.magnitude) * 0.01); // Default if no direction
      }
      initialTransformComponents.push(`scale(${scaleVal})`);
    }
    if (settings.rotation && settings.rotation.axisX) initialTransformComponents.push(`rotateX(${settings.rotation.axisX})`);
    if (settings.rotation && settings.rotation.axisY) initialTransformComponents.push(`rotateY(${settings.rotation.axisY})`);
    if (settings.rotation && settings.rotation.axisZ) initialTransformComponents.push(`rotateZ(${settings.rotation.axisZ})`);

    let initialStateObject = {
      transform: initialTransformComponents.join(' '),
      opacity: settings.initialOpacity
    };

    // Target state styles (visible/untransformed)
    let targetStateObject = {
      transform: 'translateY(0) translateX(0) scale(1) rotateX(0) rotateY(0) rotateZ(0)',
      opacity: 1
    };

    // Transition styles with delay
    let delayedTransitionObject = deepMergeConfigurations({}, transitionBaseProperties, {
      transitionDelay: settings.animationDelay
    });

    // Transition styles without delay
    let immediateTransitionObject = deepMergeConfigurations({}, transitionBaseProperties, {
      transitionDelay: '0s'
    });

    return {
      baseInline: existingInlineStyle,
      initialStateCss: styleObjectToCssString(deepMergeConfigurations({}, baseCommonStyles, initialStateObject)),
      targetStateCss: styleObjectToCssString(deepMergeConfigurations({}, baseCommonStyles, targetStateObject)),
      transitionedFinalStateCss: styleObjectToCssString(deepMergeConfigurations({}, baseCommonStyles, targetStateObject, delayedTransitionObject)),
      instantFinalStateCss: styleObjectToCssString(deepMergeConfigurations({}, baseCommonStyles, targetStateObject, immediateTransitionObject)),
      resetToInitialStateCss: styleObjectToCssString(deepMergeConfigurations({}, baseCommonStyles, initialStateObject, immediateTransitionObject)),
      totalEffectDuration: totalAnimationTimeMs
    };
  };

  // --- Core Logic ---
  let trackedElements = new Map(); // Using Map for element state, replacing self.elems
  let globalSettings = {};
  let intersectionObserverInstance = null;

  // IntersectionObserver callback (replaces animate function's core logic)
  const handleVisibilityChanges = (entries) => {
    entries.forEach(entry => {
      const currentElement = entry.target;
      if (!trackedElements.has(currentElement)) return;

      let elementData = trackedElements.get(currentElement);
      const elementConfig = elementData.elementConfiguration;
      const elementVisuals = elementData.generatedVisuals;

      if (entry.isIntersecting) {
        // Element entered viewport
        let stylesToApply;
        let applyInitialDelay = false;

        // Delay logic (matching original's 'delay' property)
        if (globalSettings.delayStrategy === 'always' ||
          (globalSettings.delayStrategy === 'onload' && !elementData.hasTriggered) ||
          (globalSettings.delayStrategy === 'once' && !elementData.hasTriggered)) {
          applyInitialDelay = true;
        }

        if (applyInitialDelay) {
          stylesToApply = elementVisuals.transitionedFinalStateCss;
        } else {
          stylesToApply = elementVisuals.instantFinalStateCss;
        }

        currentElement.setAttribute('style', elementVisuals.baseInline + stylesToApply);
        elementData.hasTriggered = true; // Mark as triggered/seen

        // Handle animation completion
        if (!elementConfig.allowReset && !elementData.animationActive) {
          elementData.animationActive = true;

          const finishAnimation = () => {
            currentElement.removeEventListener('transitionend', finishAnimation);
            currentElement.removeEventListener('webkitTransitionEnd', finishAnimation);
            currentElement.setAttribute('style', elementVisuals.baseInline); // Clean up transition styles
            elementConfig.onAnimationCompletion(currentElement);
            trackedElements.delete(currentElement); // Remove from tracking if not resetting
          };

          // Use transitionend for precise timing, with a setTimeout fallback
          currentElement.addEventListener('transitionend', finishAnimation, {
            once: true
          });
          currentElement.addEventListener('webkitTransitionEnd', finishAnimation, {
            once: true
          });
          setTimeout(finishAnimation, elementVisuals.totalEffectDuration + 50); // Small buffer
        }
      } else if (elementConfig.allowReset) {
        // Element left viewport and should reset
        currentElement.setAttribute('style', elementVisuals.baseInline + elementVisuals.resetToInitialStateCss);
        elementData.animationActive = false; // Reset animation active state
      }
      trackedElements.set(currentElement, elementData); // Update element state in map
    });
  };

  // --- Public API ---

  function ElementAnimator(userProvidedSettings) {
    globalSettings = deepMergeConfigurations({}, ElementAnimator.prototype.defaultOperationSettings, userProvidedSettings);

    if (isMobileDevice() && !globalSettings.mobileSupport || !isEnvironmentCapable()) {
      console.warn("ElementAnimator: Device/environment not compatible or mobile animations disabled.");
      // Return a no-op object to prevent errors if methods are called
      return {
        activateTargets: () => {},
        releaseActiveTargets: () => {}
      };
    }

    // Initialize IntersectionObserver
    const observerConfiguration = {
      root: globalSettings.viewingContainer === window.document.documentElement ? null : globalSettings.viewingContainer,
      rootMargin: '0px',
      threshold: globalSettings.visibilityThresholdPercentage
    };
    intersectionObserverInstance = new IntersectionObserver(handleVisibilityChanges, observerConfiguration);

    // Initial scan and observation setup
    this.activateTargets();
  }

  ElementAnimator.prototype = {
    defaultOperationSettings: {
      entryDirection: 'bottom',
      translationDistance: '8px',
      transitionDuration: '0.6s',
      animationDelay: '0s',
      timingFunction: 'ease',
      scaling: {
        orientation: 'up',
        magnitude: '5%'
      },
      rotation: {
        axisX: 0,
        axisY: 0,
        axisZ: 0
      },
      initialOpacity: 0,
      mobileSupport: false,
      allowReset: false,
      viewingContainer: window.document.documentElement,
      delayStrategy: 'once', // 'always', 'onload', 'once'
      visibilityThresholdPercentage: 0.60,
      onAnimationCompletion: function(el) {}
    },

    // Queries the DOM, builds element configurations, and starts observing (replaces init)
    activateTargets: function() {
      const elementsToObserve = Array.from(globalSettings.viewingContainer.querySelectorAll('[data-reveal-fx]'));

      elementsToObserve.forEach(node => {
        if (!trackedElements.has(node)) {
          const elementConfig = configureElementBehavior(node, globalSettings);
          const elementVisuals = generateElementVisuals({
            domReference: node,
            elementConfiguration: elementConfig
          });

          // Set initial styles before observing
          node.setAttribute('style', elementVisuals.baseInline + elementVisuals.initialStateCss);
          node.removeAttribute('data-reveal-fx'); // Remove attribute after processing

          trackedElements.set(node, {
            domReference: node,
            elementConfiguration: elementConfig,
            generatedVisuals: elementVisuals,
            hasTriggered: false,
            animationActive: false
          });
          intersectionObserverInstance.observe(node);
        }
      });
    },

    // Disconnects observer and clears tracked elements (replaces destroy)
    releaseActiveTargets: function() {
      if (intersectionObserverInstance) {
        intersectionObserverInstance.disconnect();
        intersectionObserverInstance = null;
      }
      trackedElements.clear();
    }
  };

  return ElementAnimator;
}));