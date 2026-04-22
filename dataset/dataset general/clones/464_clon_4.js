(function(globalScope) {
  'use strict';

  // The central container for all functionalities
  const applicationCore = {};

  // --- Core Utility Functions ---

  // Renamed from hyphenateStyleName
  const convertToKebabCase = (camelCaseString) => {
    return camelCaseString.replace(/([A-Z])/g, '-$1').toLowerCase();
  };

  // Renamed from memoizeStringOnly
  const createStringMemoizer = (processingFunction) => {
    const memoryCache = new Map();
    return (inputString) => {
      if (!memoryCache.has(inputString)) {
        memoryCache.set(inputString, processingFunction(inputString));
      }
      return memoryCache.get(inputString);
    };
  };

  // Renamed from focusNode
  const activateElementFocus = (targetDOMNode) => {
    if (targetDOMNode && typeof targetDOMNode.focus === 'function') {
      targetDOMNode.focus();
    }
  };

  // Renamed from dangerousStyleValue
  const normalizeNumericStyleValue = (attributeKey, attributeValue) => {
    if (typeof attributeValue === 'number' && !applicationCore.styleDefinitions.isNumericStyle(attributeKey)) {
      return `${attributeValue}px`;
    }
    return String(attributeValue);
  };

  // --- Dummy Dependencies for Event Handling (Module 2) ---

  // Renamed from EventConstants
  const EventTypeConstants = {
    topLevelEventNames: {
      compositionEnd: 'finishComposition',
      keyPress: 'keyboardPress',
      textInput: 'textEntryInput',
      paste: 'clipboardPasteEvent'
    }
  };

  // Renamed from EventPropagators
  const EventDistributionSystem = {
    distributeEvent: (eventPayload) => {
      // Placeholder for event propagation logic
      // In a real system, this would propagate the event through a React-like dispatcher
    }
  };

  // Renamed from ExecutionEnvironment
  const RuntimeEnvironmentInspector = {
    canUseDOMApis: typeof document !== 'undefined' && typeof window !== 'undefined',
    hasTextEventSupport: typeof window !== 'undefined' && 'TextEvent' in window,
    isOldOperaBrowser: (function() {
      if (typeof window === 'undefined' || !window.opera) return false;
      return parseInt(window.opera.version(), 10) <= 12;
    })()
  };

  // Renamed from SyntheticInputEvent
  function CustomInputEvent(eventSchema, targetIdentifier, originalBrowserEvent) {
    this.name = eventSchema.name;
    this.targetId = targetIdentifier;
    this.originalEvent = originalBrowserEvent;
    this.data = null; // Will be set by the extractor
  }

  // --- Module Implementations (stored in applicationCore) ---

  // Equivalent to AutoFocusMixin (module 1)
  applicationCore.focusBehavior = (function() {
    return {
      executeMountEffect: function(componentInstance) { // Renamed from componentDidMount
        if (componentInstance && componentInstance.properties.autoFocusSetting) { // Renamed from this.props.autoFocus
          activateElementFocus(componentInstance.getDOMReference()); // Renamed from focusNode(this.getDOMNode())
        }
      }
    };
  })();

  // Equivalent to BeforeInputEventPlugin (module 2) - Highly simplified for Type IV demonstration
  // The original's logic is extremely detailed with browser quirks and state management.
  // This clone focuses on demonstrating the structural integration and dependency resolution,
  // but provides only a simplified functional equivalent for the event extraction logic.
  applicationCore.beforeInputHandler = (function(
      constants,
      propagator,
      envChecker,
      inputEventConstructor) {

    const eventMapping = {
      preInput: {
        dispatchNames: {
          bubble: 'onPreInput',
          capture: 'onPreInputCapture'
        },
        dependentEvents: [
          constants.topLevelEventNames.compositionEnd,
          constants.topLevelEventNames.keyPress,
          constants.topLevelEventNames.textInput,
          constants.topLevelEventNames.paste
        ]
      }
    };

    let characterBuffer = null; // Renamed from fallbackChars

    const SPACEBAR_KEY_CODE = 32;
    const SPACEBAR_CHARACTER = ' ';

    const isCommandKeypress = (browserEvent) => {
      // Renamed from isKeypressCommand
      return (browserEvent.controlKey || browserEvent.alternateKey || browserEvent.metaKey) &&
             !(browserEvent.controlKey && browserEvent.alternateKey);
    };

    return {
      eventConfiguration: eventMapping,
      processNativeEvent: function(
          incomingEventType,
          targetElement,
          elementIdentifier,
          nativePlatformEvent) {

        let receivedChars;

        const canUseNativeTextInput = envChecker.canUseDOMApis &&
                                      envChecker.hasTextEventSupport &&
                                      !envChecker.isOldOperaBrowser;

        if (canUseNativeTextInput) {
          switch (incomingEventType) {
            case constants.topLevelEventNames.keyPress:
              if (nativePlatformEvent.which !== SPACEBAR_KEY_CODE) {
                return null;
              }
              receivedChars = String.fromCharCode(nativePlatformEvent.which);
              break;
            case constants.topLevelEventNames.textInput:
              receivedChars = nativePlatformEvent.data;
              if (receivedChars === SPACEBAR_CHARACTER) {
                return null;
              }
              break;
            default:
              return null;
          }
        } else {
          // Fallback path for browsers without native textInput
          switch (incomingEventType) {
            case constants.topLevelEventNames.paste:
              characterBuffer = null;
              break;
            case constants.topLevelEventNames.keyPress:
              if (nativePlatformEvent.which && !isCommandKeypress(nativePlatformEvent)) {
                characterBuffer = String.fromCharCode(nativePlatformEvent.which);
              }
              break;
            case constants.topLevelEventNames.compositionEnd:
              characterBuffer = nativePlatformEvent.data;
              break;
          }

          if (characterBuffer === null) {
            return null;
          }
          receivedChars = characterBuffer;
        }

        if (!receivedChars) {
          return null;
        }

        const syntheticOutputEvent = new inputEventConstructor(
          eventMapping.preInput,
          elementIdentifier,
          nativePlatformEvent
        );
        syntheticOutputEvent.data = receivedChars;
        characterBuffer = null;
        // This would call EventPropagators.accumulateTwoPhaseDispatches(event)
        propagator.distributeEvent(syntheticOutputEvent);
        return syntheticOutputEvent;
      }
    };
  })(
    EventTypeConstants,
    EventDistributionSystem,
    RuntimeEnvironmentInspector,
    CustomInputEvent
  );


  // Equivalent to CSSProperty (module 3)
  applicationCore.styleDefinitions = (function() {
    class StyleAttributeMetadata {
      static #nonUnitNumericalProperties = new Set([
        'columnCount', 'fillOpacity', 'flex', 'flexGrow', 'flexShrink',
        'fontWeight', 'lineClamp', 'lineHeight', 'opacity', 'order',
        'orphans', 'widows', 'zIndex', 'zoom'
      ]);

      static #supportedVendorPrefixes = ['Webkit', 'ms', 'Moz', 'O'];

      static #expandedShorthandProperties = new Map([
        ['background', ['backgroundImage', 'backgroundPosition', 'backgroundRepeat', 'backgroundColor']],
        ['border', ['borderWidth', 'borderStyle', 'borderColor']],
        ['borderBottom', ['borderBottomWidth', 'borderBottomStyle', 'borderBottomColor']],
        ['borderLeft', ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor']],
        ['borderRight', ['borderRightWidth', 'borderRightStyle', 'borderRightColor']],
        ['borderTop', ['borderTopWidth', 'borderTopStyle', 'borderTopColor']],
        ['font', ['fontStyle', 'fontVariant', 'fontWeight', 'fontSize', 'lineHeight', 'fontFamily']]
      ]);

      static isNumericStyle(attributeName) {
        if (StyleAttributeMetadata.#nonUnitNumericalProperties.has(attributeName)) {
          return true;
        }
        const capitalized = attributeName.charAt(0).toUpperCase() + attributeName.substring(1);
        return StyleAttributeMetadata.#supportedVendorPrefixes.some(prefix =>
          StyleAttributeMetadata.#nonUnitNumericalProperties.has(prefix + capitalized)
        );
      }

      static getShorthandExpansion(compoundAttributeName) {
        return StyleAttributeMetadata.#expandedShorthandProperties.get(compoundAttributeName);
      }
    }
    return StyleAttributeMetadata;
  })();

  // Equivalent to CSSPropertyOperations (module 4)
  applicationCore.styleProcessor = (function(
      styleMetaProvider,
      valueConverter,
      keyCaseTransformer,
      stringMemoizer) {

    const memoizedKeyTransformer = stringMemoizer(keyCaseTransformer);

    return {
      // Renamed from createMarkupForStyles
      generateInlineAttributeString: function(styleMapObject) {
        const styleParts = [];
        for (const [propName, propValue] of Object.entries(styleMapObject)) {
          if (propValue !== null && propValue !== undefined) {
            styleParts.push(`${memoizedKeyTransformer(propName)}:${valueConverter(propName, propValue)}`);
          }
        }
        return styleParts.length > 0 ? styleParts.join(';') + ';' : null;
      },

      // Renamed from setValueForStyles
      applyStyleAttributesToNode: function(targetNode, attributesToApply) {
        const nodeStyleObject = targetNode.style;
        for (const [attributeName, attributeValue] of Object.entries(attributesToApply)) {
          const processedValue = valueConverter(attributeName, attributeValue);
          if (processedValue) {
            nodeStyleObject[attributeName] = processedValue;
          } else {
            const expandedAttributes = styleMetaProvider.getShorthandExpansion(attributeName);
            if (expandedAttributes) {
              expandedAttributes.forEach(individualAttribute => {
                nodeStyleObject[individualAttribute] = '';
              });
            } else {
              nodeStyleObject[attributeName] = '';
            }
          }
        }
      }
    };
  })(
    applicationCore.styleDefinitions,
    normalizeNumericStyleValue,
    convertToKebabCase,
    createStringMemoizer
  );

  // --- Global Exposure ---
  // This part mimics the UMD pattern of the original, but with different syntax and variable names.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = applicationCore;
  } else if (typeof define === 'function' && define.amd) {
    define([], () => applicationCore);
  } else {
    globalScope.ApplicationKit = applicationCore;
  }

})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {});