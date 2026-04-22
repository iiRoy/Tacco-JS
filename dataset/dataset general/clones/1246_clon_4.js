class DomChangeAuditor {
  #rootElement;
  #internalWatcher;

  constructor(targetElement) {
    this.#rootElement = targetElement;
    const GlobalDomWatcher = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    if (!GlobalDomWatcher) {
      console.error("MutationObserver not supported in this environment.");
      return;
    }

    this.#internalWatcher = new GlobalDomWatcher(this.#processAllModifications.bind(this));
  }

  beginMonitoring() {
    if (this.#internalWatcher && this.#rootElement) {
      this.#internalWatcher.observe(this.#rootElement, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true,
        attributeOldValue: true
      });
    }
  }

  endMonitoring() {
    if (this.#internalWatcher) {
      this.#internalWatcher.disconnect();
    }
  }

  #processAllModifications(modificationEvents) {
    for (const eventRecord of modificationEvents) {
      const actionRouter = {
        'attributes': (rec) => {
          if (rec.attributeName === 'class') {
            this.#handleClassAlteration(rec);
          } else if (rec.attributeName === 'style') {
            this.#handleStyleModification(rec);
          }
        },
        'childList': (rec) => {
          if (rec.addedNodes.length > 0) {
            this.#reportNewNodes(rec);
          }
          if (rec.removedNodes.length > 0) {
            this.#reportGoneNodes(rec);
          }
        }
      };

      const handler = actionRouter[eventRecord.type];
      if (handler) {
        handler(eventRecord);
      }
    }
  }

  #handleClassAlteration(changeRecord) {
    const currentClassSet = new Set(Array.from(changeRecord.target.classList));
    const previousClassSet = new Set(changeRecord.oldValue ? changeRecord.oldValue.split(' ').filter(c => c !== '') : []);

    const newClasses = Array.from(currentClassSet).filter(cls => !previousClassSet.has(cls));
    const removedClasses = Array.from(previousClassSet).filter(cls => !currentClassSet.has(cls));

    if (newClasses.length) {
      console.log("Class '" + newClasses.join(', ') + "' added", changeRecord.target);
    }
    if (removedClasses.length) {
      console.log("Class '" + removedClasses.join(', ') + "' removed", changeRecord.target);
    }
  }

  #handleStyleModification(changeRecord) {
    const extractStyleProperties = (styleString) => {
      const propertyMap = {};
      if (!styleString) return propertyMap;
      const parts = styleString.split(';');
      for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart) {
          const [name, value] = trimmedPart.split(':').map(s => s.trim());
          if (name && value !== undefined) { // Ensure name exists and value is not explicitly undefined
            propertyMap[name] = value;
          }
        }
      }
      return propertyMap;
    };

    const currentStyleProps = extractStyleProperties(changeRecord.target.getAttribute('style'));
    const priorStyleProps = extractStyleProperties(changeRecord.oldValue);

    const allKeys = new Set([...Object.keys(currentStyleProps), ...Object.keys(priorStyleProps)]);

    const newProps = [];
    const lostProps = [];
    const alteredProps = [];

    for (const key of allKeys) {
      const currentVal = currentStyleProps[key];
      const priorVal = priorStyleProps[key];

      if (currentVal !== undefined && priorVal === undefined) {
        newProps.push(key);
      } else if (currentVal === undefined && priorVal !== undefined) {
        lostProps.push(key);
      } else if (currentVal !== undefined && priorVal !== undefined && currentVal !== priorVal) {
        alteredProps.push(key);
      }
    }

    for (const key of newProps) {
      console.log("Style added '" + key + ': ' + currentStyleProps[key] + "'", changeRecord.target);
    }
    for (const key of lostProps) {
      console.log("Style removed '" + key + ': ' + priorStyleProps[key] + "'", changeRecord.target);
    }
    for (const key of alteredProps) {
      if (priorStyleProps[key] === undefined) continue; // Skip if it's a new prop, already handled.

      console.log("Style change '" + key + "', newValue '" + currentStyleProps[key] + "', was '" + priorStyleProps[key] + "'", changeRecord.target);
    }
  }

  #reportNewNodes(changeRecord) {
    for (const nodeItem of Array.from(changeRecord.addedNodes)) {
      console.log('Node added', nodeItem, 'as child of', changeRecord.target);
    }
  }

  #reportGoneNodes(changeRecord) {
    for (const nodeItem of Array.from(changeRecord.removedNodes)) {
      console.log('Node removed', nodeItem, 'as child of', changeRecord.target);
    }
  }
}

const documentMonitor = new DomChangeAuditor(document.body);

// To replicate the original's IIFE return structure for consumption:
const observationManager = {
  start: () => documentMonitor.beginMonitoring(),
  stop: () => documentMonitor.endMonitoring()
};

// Export the manager for use, similar to the original's IIFE return.
// This assumes the intention is to use 'observationManager.start()' and 'observationManager.stop()'.
// If the user meant for the class instance itself to be the export, it would be 'const documentMonitor = ...;'.
// Given the original's 'return { start: ..., stop: ... }', this structure is a closer functional match.
window.observationManager = observationManager;