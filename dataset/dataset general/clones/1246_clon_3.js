const domActivityLogger = (() => {
  // The primary DOM element targeted for observation.
  // Defaults to the document body, but can be overridden.
  const mainObservationRoot = document.body;

  // Dynamically determine the available MutationObserver constructor.
  // This ensures compatibility across different browser environments.
  const ObserverConstructor = window.MutationObserver ||
                              window.WebKitMutationObserver ||
                              window.MozMutationObserver;

  // If the MutationObserver API is not supported, log an error and return a no-op interface.
  if (!ObserverConstructor) {
    console.error("DOM Mutation Observer API is not found in this browser. Functionality will be limited.");
    return {
      activateMonitoring: () => console.warn("Monitoring cannot be activated: API not supported."),
      deactivateMonitoring: () => console.warn("Monitoring cannot be deactivated: API not supported."),
      getObservedCount: () => 0
    };
  }

  // Internal counter for the total number of DOM changes detected.
  let totalChangesDetected = 0;

  /**
   * Provides a standardized way to log DOM events, including a timestamp and event count.
   * @param {string} logMessage - The descriptive message for the event.
   * @param {*} [associatedElement=null] - An optional DOM element or object related to the event.
   */
  const outputEventLog = (logMessage, associatedElement = null) => {
    totalChangesDetected++;
    const currentTimestamp = new Date().toLocaleTimeString();
    if (associatedElement) {
      console.log(`[${currentTimestamp}] (Event #${totalChangesDetected}) ${logMessage}`, associatedElement);
    } else {
      console.log(`[${currentTimestamp}] (Event #${totalChangesDetected}) ${logMessage}`);
    }
  };

  /**
   * Handles mutations specifically related to an element's CSS classes.
   * Compares the old class string with the new class list to identify additions and removals.
   * @param {MutationRecord} recordEntry - The mutation record detailing the class change.
   */
  const processClassListAlterations = (recordEntry) => {
    // Validate the target element exists and is indeed an Element.
    if (!recordEntry.target || !(recordEntry.target instanceof Element)) {
      console.warn("Invalid target for class list alteration:", recordEntry.target);
      return;
    }

    // Convert the current class list of the target element into an array.
    const presentClasses = Array.from(recordEntry.target.classList);
    // Parse the previous class string (oldValue) into an array, filtering out empty strings.
    const formerClasses = recordEntry.oldValue
      ? recordEntry.oldValue.split(' ').filter(Boolean)
      : [];

    // Determine which classes are newly added.
    const classesAdded = presentClasses.filter(cName => !formerClasses.includes(cName));
    // Determine which classes were removed.
    const classesRemoved = formerClasses.filter(cName => !presentClasses.includes(cName));

    // Log the identified class changes.
    if (classesAdded.length > 0) {
      outputEventLog(`Class(es) added: '${classesAdded.join(', ')}'`, recordEntry.target);
    }
    if (classesRemoved.length > 0) {
      outputEventLog(`Class(es) removed: '${classesRemoved.join(', ')}'`, recordEntry.target);
    }
  };

  /**
   * Converts a CSS style string (e.g., "width: 100px; color: red;") into a JavaScript object.
   * @param {string | null} cssText - The CSS style string to parse.
   * @returns {Object.<string, string>} An object where keys are style properties and values are their declarations.
   */
  const parseCssStyleString = (cssText) => {
    const stylePropertyMap = {};
    // Return an empty object if the input is null, undefined, or empty.
    if (!cssText) {
      return stylePropertyMap;
    }

    // Split the string by semicolons, then iterate over each declaration.
    cssText.split(';').forEach(declaration => {
      const trimmedDeclaration = declaration.trim();
      if (trimmedDeclaration) {
        // Split each declaration into property and value.
        const parts = trimmedDeclaration.split(':').map(p => p.trim());
        if (parts.length === 2) {
          stylePropertyMap[parts[0]] = parts[1];
        }
      }
    });
    return stylePropertyMap;
  };

  /**
   * Handles mutations related to an element's inline style attribute.
   * Compares the previous style declarations with the current ones to detect additions, removals, and modifications.
   * @param {MutationRecord} recordEntry - The mutation record detailing the style change.
   */
  const processInlineStyleChanges = (recordEntry) => {
    // Ensure the target is a valid Element.
    if (!recordEntry.target || !(recordEntry.target instanceof Element)) {
      console.warn("Invalid target for inline style changes:", recordEntry.target);
      return;
    }

    // Parse the current and previous style attribute values into objects.
    const currentStyleMap = parseCssStyleString(recordEntry.target.getAttribute('style'));
    const previousStyleMap = parseCssStyleString(recordEntry.oldValue);

    // Identify style properties that were newly added.
    const newlySetProperties = Object.keys(currentStyleMap).filter(propKey =>
      !previousStyleMap.hasOwnProperty(propKey)
    );
    // Identify style properties that were removed.
    const removedProperties = Object.keys(previousStyleMap).filter(propKey =>
      !currentStyleMap.hasOwnProperty(propKey)
    );
    // Identify style properties whose values have changed.
    const alteredProperties = Object.keys(currentStyleMap).filter(propKey =>
      previousStyleMap.hasOwnProperty(propKey) && currentStyleMap[propKey] !== previousStyleMap[propKey]
    );

    // Log each category of style modification.
    newlySetProperties.forEach(propName => {
      outputEventLog(`Style property added: '${propName}: ${currentStyleMap[propName]}'`, recordEntry.target);
    });
    removedProperties.forEach(propName => {
      outputEventLog(`Style property removed: '${propName}: ${previousStyleMap[propName]}'`, recordEntry.target);
    });
    alteredProperties.forEach(propName => {
      outputEventLog(`Style property changed: '${propName}' from '${previousStyleMap[propName]}' to '${currentStyleMap[propName]}'`, recordEntry.target);
    });
  };

  /**
   * Handles the addition of new child nodes to the DOM.
   * @param {MutationRecord} recordEntry - The mutation record containing the added nodes.
   */
  const handleChildNodesAdded = (recordEntry) => {
    // Early exit if no nodes were actually added.
    if (recordEntry.addedNodes.length === 0) {
      return;
    }

    // Convert the NodeList to an Array for convenient iteration.
    Array.from(recordEntry.addedNodes).forEach(addedNode => {
      outputEventLog(`Node added:`, addedNode);
    });
  };

  /**
   * Handles the removal of child nodes from the DOM.
   * @param {MutationRecord} recordEntry - The mutation record containing the removed nodes.
   */
  const handleChildNodesRemoved = (recordEntry) => {
    // Early exit if no nodes were actually removed.
    if (recordEntry.removedNodes.length === 0) {
      return;
    }

    Array.from(recordEntry.removedNodes).forEach(removedNode => {
      outputEventLog(`Node removed:`, removedNode);
    });
  };

  /**
   * The main callback function for the MutationObserver.
   * It iterates through all mutation records and dispatches them to specialized handlers.
   * @param {MutationRecord[]} mutationRecords - An array of mutation records.
   */
  const domObserverCallbackHandler = (mutationRecords) => {
    // Guard clause: if no records or an empty array, do nothing.
    if (!mutationRecords || mutationRecords.length === 0) {
      return;
    }

    // Iterate over each individual mutation record using a for...of loop.
    for (const record of mutationRecords) {
      // Use a switch statement to elegantly handle different mutation types.
      switch (record.type) {
        case 'attributes':
          // Distinguish between class and style attribute changes.
          if (record.attributeName === 'class') {
            processClassListAlterations(record);
          } else if (record.attributeName === 'style') {
            processInlineStyleChanges(record);
          }
          break;
        case 'childList':
          // Check for both added and removed nodes within the childList mutation.
          if (record.addedNodes.length > 0) {
            handleChildNodesAdded(record);
          }
          if (record.removedNodes.length > 0) {
            handleChildNodesRemoved(record);
          }
          break;
        // Default case for any unhandled mutation types.
        default:
          outputEventLog(`An unhandled mutation type '${record.type}' occurred on`, record.target);
          break;
      }
    }
  };

  // Instantiate the MutationObserver with our central callback handler.
  const domChangeObserverInstance = new ObserverConstructor(domObserverCallbackHandler);

  // Define the default configuration options for the observer.
  // These options dictate which types of DOM changes the observer will report.
  const defaultObservationOptions = {
    attributes: true,          // Monitor changes to attributes (e.g., class, style).
    childList: true,           // Monitor additions/removals of direct children.
    subtree: true,             // Extend monitoring to the entire descendant subtree.
    attributeOldValue: true    // Crucial for comparing old vs. new attribute values (e.g., for class and style).
    // characterData: false,   // Not monitoring text content changes by default for simplicity.
    // characterDataOldValue: false // Not relevant if characterData is false.
  };

  // The public interface returned by the IIFE.
  return {
    /**
     * Activates the DOM monitoring process.
     * @param {Element} [targetElement=mainObservationRoot] - The specific DOM element to observe.
     *                                                        Defaults to `document.body`.
     * @param {Object} [observerConfig=defaultObservationOptions] - Configuration for the observer.
     */
    activateMonitoring: (targetElement = mainObservationRoot, observerConfig = defaultObservationOptions) => {
      // Input validation for the target element.
      if (!(targetElement instanceof Element)) {
        console.error("Invalid target element provided for DOM monitoring activation.");
        return;
      }
      // Input validation for the configuration object.
      if (typeof observerConfig !== 'object' || observerConfig === null) {
        console.error("Invalid configuration object provided for DOM monitoring activation.");
        return;
      }

      // Begin observing the specified target with the given configuration.
      domChangeObserverInstance.observe(targetElement, observerConfig);
      outputEventLog("DOM activity monitoring commenced on", targetElement);
    },

    /**
     * Halts all active DOM change observations.
     * Also resets the internal change counter.
     */
    deactivateMonitoring: () => {
      domChangeObserverInstance.disconnect();
      outputEventLog("DOM activity monitoring suspended.");
      totalChangesDetected = 0; // Reset the counter upon deactivation.
    },

    /**
     * Retrieves the current count of observed DOM changes since activation or last reset.
     * @returns {number} The total number of DOM changes recorded.
     */
    getObservedCount: () => totalChangesDetected
  };
})();