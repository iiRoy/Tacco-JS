(function(scope) {
  "use strict";
  if (!scope.matchMedia) {
    scope.matchMedia = function() {
      var mediaStyle = (scope.styleMedia || scope.media);
      if (!mediaStyle) {
        var elStyle = document.createElement('style'),
          firstScript = document.getElementsByTagName('script')[0],
          computedProps = null;

        elStyle.type = 'text/css';
        elStyle.id = 'mm-test-node';
        firstScript.parentNode.insertBefore(elStyle, firstScript);
        computedProps = ('getComputedStyle' in scope) && scope.getComputedStyle(elStyle, null) || elStyle.currentStyle;

        mediaStyle = {
          matchMedium: function(mediaString) {
            var cssText = '@media ' + mediaString + '{ #mm-test-node { width: 1px; } }';
            if (elStyle.styleSheet) {
              elStyle.styleSheet.cssText = cssText;
            } else {
              elStyle.textContent = cssText;
            }
            return computedProps.width === '1px';
          }
        };
      }
      return function(mediaString) {
        return {
          matches: mediaStyle.matchMedium(mediaString || 'all'),
          media: mediaString || 'all'
        };
      };
    }();
  }
}(window));

(function(scope) {
  "use strict";
  if (scope.matchMedia && scope.matchMedia('all').addListener) {
    return;
  }

  var existingMatcher = scope.matchMedia,
    canQuery = existingMatcher('only all').matches,
    isMonitoring = false,
    delayTimer = 0,
    activeQueries = [],
    processChanges = function(triggerEvent) {
      clearTimeout(delayTimer);
      delayTimer = setTimeout(function() {
        for (var idx = 0, limit = activeQueries.length; idx < limit; idx++) {
          var queryObj = activeQueries[idx].query,
            attachedCbs = activeQueries[idx].callbacks || [],
            currentMatch = existingMatcher(queryObj.media).matches;

          if (currentMatch !== queryObj.matches) {
            queryObj.matches = currentMatch;
            for (var cbIdx = 0, cbLimit = attachedCbs.length; cbIdx < cbLimit; cbIdx++) {
              attachedCbs[cbIdx].call(scope, queryObj);
            }
          }
        }
      }, 30);
    };

  scope.matchMedia = function(mediaString) {
    var queryResult = existingMatcher(mediaString),
      callbacks = [],
      queryIndex = 0;

    queryResult.addListener = function(callback) {
      if (!canQuery) {
        return;
      }
      if (!isMonitoring) {
        isMonitoring = true;
        scope.addEventListener('resize', processChanges, true);
      }
      if (queryIndex === 0) {
        queryIndex = activeQueries.push({
          query: queryResult,
          callbacks: callbacks
        });
      }
      callbacks.push(callback);
    };

    queryResult.removeListener = function(callback) {
      for (var idx = 0, limit = callbacks.length; idx < limit; idx++) {
        if (callbacks[idx] === callback) {
          callbacks.splice(idx, 1);
          break;
        }
      }
    };
    return queryResult;
  };
}(window));

(function(context) {
  "use strict";
  var lastExecutionTime = 0;
  var vendorPrefixes = ['ms', 'moz', 'webkit', 'o'];
  for (var i = 0; i < vendorPrefixes.length && !context.requestAnimationFrame; ++i) {
    context.requestAnimationFrame = context[vendorPrefixes[i] + 'RequestAnimationFrame'];
    context.cancelAnimationFrame = context[vendorPrefixes[i] + 'CancelAnimationFrame'] ||
      context[vendorPrefixes[i] + 'CancelRequestAnimationFrame'];
  }

  if (!context.requestAnimationFrame)
    context.requestAnimationFrame = function(callbackFunction, targetElement) {
      var currentTime = new Date().getTime();
      var waitDuration = Math.max(0, 16 - (currentTime - lastExecutionTime));
      var timerHandle = context.setTimeout(function() {
        callbackFunction(currentTime + waitDuration);
      }, waitDuration);
      lastExecutionTime = currentTime + waitDuration;
      return timerHandle;
    };

  if (!context.cancelAnimationFrame)
    context.cancelAnimationFrame = function(handle) {
      clearTimeout(handle);
    };
}(window));

if (typeof window.CustomEvent !== "function") {
  (function(scope) {
    "use strict";
    function CustomEvt(eventName, options) {
      options = options || { bubbles: false, cancelable: false, detail: undefined };
      var eventInstance = document.createEvent('CustomEvent');
      eventInstance.initCustomEvent(eventName, options.bubbles, options.cancelable, options.detail);
      return eventInstance;
    }
    CustomEvt.prototype = scope.Event.prototype;
    scope.CustomEvent = CustomEvt;
  })(window);
}

(function(globalRef, docRef) {
  "use strict";

  const registeredComposers = new Set();
  let currentResponsiveRules = [];

  function setDatum(elem, keyStr, valStr) {
    elem.setAttribute(`data-${keyStr}`, valStr);
  }

  function signalChange(targetElem, eventName, eventDetail) {
    let customEvt;
    try {
      customEvt = new CustomEvent(eventName, { detail: eventDetail, bubbles: true });
    } catch (e) {
      customEvt = docRef.createEvent('CustomEvent');
      customEvt.initCustomEvent(eventName, true, true, eventDetail);
    }
    targetElem.dispatchEvent(customEvt);
  }

  class GridComposer {
    constructor(containerElement, initialContent = []) {
      if (!containerElement || !(containerElement instanceof HTMLElement)) {
        throw new Error("Invalid container element provided to GridComposer.");
      }
      this.mainStructure = containerElement;
      this.segmentSettings = this.deriveSegmentConfiguration();
      this.segmentCounters = [];
      this.segmentContainers = [];
      this.mutationObserver = null;
      this.isProcessing = false;
      this.queuedOperations = [];

      setDatum(this.mainStructure, 'composed', 'true');

      this.initializeSegments(initialContent);
      this.setupObservation();
      registeredComposers.add(this);
    }

    deriveSegmentConfiguration() {
      const configString = this.mainStructure.getAttribute('data-grid-config');
      if (!configString) {
        return { count: 1, classes: ['grid-segment'] };
      }
      const parts = configString.split(' ');
      const segmentCount = parseInt(parts[0], 10);
      const segmentClasses = parts.slice(1);
      return {
        count: isNaN(segmentCount) || segmentCount < 1 ? 1 : segmentCount,
        classes: segmentClasses.length === 0 ? ['grid-segment'] : segmentClasses
      };
    }

    initializeSegments(contentUnits) {
      if (this.mainStructure.children.length > 0) {
        const existingUnits = Array.from(this.mainStructure.children);
        this.mainStructure.innerHTML = '';
        contentUnits = existingUnits.concat(contentUnits);
      }

      const fragmentForSegments = docRef.createDocumentFragment();
      this.segmentContainers = [];
      this.segmentCounters = new Array(this.segmentSettings.count).fill(0);

      for (let i = 0; i < this.segmentSettings.count; i++) {
        const segmentNode = docRef.createElement('div');
        segmentNode.className = this.segmentSettings.classes.join(' ');
        fragmentForSegments.appendChild(segmentNode);
        this.segmentContainers.push(segmentNode);
      }
      this.mainStructure.appendChild(fragmentForSegments);

      this.distributeContent(contentUnits, 'append');
      setDatum(this.mainStructure, 'segment-count', this.segmentSettings.count);
    }

    distributeContent(units, mode = 'append') {
      if (!units || units.length === 0) return;

      const unitFragments = new Array(this.segmentSettings.count).fill(null).map(() => docRef.createDocumentFragment());

      Array.from(units).forEach(unit => {
        if (!(unit instanceof HTMLElement)) return;
        const targetIndex = this.findShortestSegmentIndex(unitFragments);
        unitFragments[targetIndex].appendChild(unit);
        this.segmentCounters[targetIndex]++;
      });

      this.segmentContainers.forEach((segment, index) => {
        if (mode === 'append') {
          segment.appendChild(unitFragments[index]);
        } else if (mode === 'prepend') {
          segment.insertBefore(unitFragments[index], segment.firstChild);
        }
      });
    }

    findShortestSegmentIndex(pendingFragments = []) {
      let minCount = Infinity;
      let minIndex = 0;

      for (let i = 0; i < this.segmentSettings.count; i++) {
        const currentCount = this.segmentCounters[i] + (pendingFragments[i] ? pendingFragments[i].children.length : 0);
        if (currentCount < minCount) {
          minCount = currentCount;
          minIndex = i;
        }
      }
      return minIndex;
    }

    collectAllContent() {
      const collectedUnits = [];
      this.segmentContainers.forEach(segment => {
        Array.from(segment.children).forEach(unit => collectedUnits.push(unit));
      });
      return collectedUnits;
    }

    recomposeLayout(immediate = false) {
      if (this.isProcessing) {
        this.queuedOperations.push(() => this.recomposeLayout(true));
        return;
      }
      this.isProcessing = true;

      const performRecomposition = () => {
        const oldContent = this.collectAllContent();
        this.mainStructure.innerHTML = '';
        this.segmentSettings = this.deriveSegmentConfiguration();
        this.initializeSegments(oldContent);
        signalChange(this.mainStructure, 'layoutRecomposed', { composer: this });
        this.isProcessing = false;
        if (this.queuedOperations.length > 0) {
          const nextOp = this.queuedOperations.shift();
          nextOp();
        }
      };

      if (immediate) {
        performRecomposition();
      } else {
        globalRef.requestAnimationFrame(performRecomposition);
      }
    }

    addContent(newUnits) {
      this.distributeContent(newUnits, 'append');
      signalChange(this.mainStructure, 'contentAdded', { composer: this, units: newUnits });
    }

    prependContent(newUnits) {
      this.distributeContent(newUnits, 'prepend');
      signalChange(this.mainStructure, 'contentPrepended', { composer: this, units: newUnits });
    }

    setupObservation() {
      if (this.mutationObserver) this.mutationObserver.disconnect();
      this.mutationObserver = new MutationObserver(mutations => {
        let needsRecomposition = false;
        let addedNodes = [];
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            if (mutation.removedNodes.length > 0) {
              if (Array.from(mutation.removedNodes).some(n => n instanceof HTMLElement && n.className.includes(this.segmentSettings.classes[0]))) {
                needsRecomposition = true;
              }
            }
            if (mutation.addedNodes.length > 0) {
              Array.from(mutation.addedNodes).forEach(node => {
                if (node instanceof HTMLElement && !node.className.includes(this.segmentSettings.classes[0])) {
                  addedNodes.push(node);
                }
              });
            }
          }
        });

        if (needsRecomposition) {
          this.recomposeLayout();
        } else if (addedNodes.length > 0) {
          this.distributeContent(addedNodes, 'append');
        }
      });

      this.mutationObserver.observe(this.mainStructure, { childList: true });
    }

    destroy() {
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
      }
      registeredComposers.delete(this);
      const remainingContent = this.collectAllContent();
      this.mainStructure.innerHTML = '';
      remainingContent.forEach(unit => this.mainStructure.appendChild(unit));
      setDatum(this.mainStructure, 'composed', 'false');
      signalChange(this.mainStructure, 'composerDestroyed', { composer: this });
    }
  }

  function refreshAllComposers() {
    registeredComposers.forEach(composer => composer.recomposeLayout());
  }

  function registerResponsiveRule(mediaQueryString, callbackFunction) {
    if (!globalRef.matchMedia) return;

    const mql = globalRef.matchMedia(mediaQueryString);
    const listener = (mq) => {
      if (mq.matches) {
        refreshAllComposers();
      }
      if (callbackFunction) {
        callbackFunction(mq);
      }
    };
    mql.addListener(listener);
    currentResponsiveRules.push({ query: mql, listener: listener });
  }

  function unregisterResponsiveRule(mediaQueryString, callbackFunction) {
    currentResponsiveRules = currentResponsiveRules.filter(ruleObj => {
      if (ruleObj.query.media === mediaQueryString && (!callbackFunction || ruleObj.listener === callbackFunction)) {
        ruleObj.query.removeListener(ruleObj.listener);
        return false;
      }
      return true;
    });
  }

  const compositionManager = {
    createGrid: function(targetElement, initialItems = []) {
      if (!targetElement) {
        const autoInitElements = Array.from(docRef.querySelectorAll('[data-grid-config][data-composed="false"], [data-grid-config]:not([data-composed])'));
        return autoInitElements.map(elem => new GridComposer(elem));
      }
      return new GridComposer(targetElement, initialItems);
    },
    updateAllGrids: refreshAllComposers,
    attachMediaQueryHandler: registerResponsiveRule,
    detachMediaQueryHandler: unregisterResponsiveRule,
    getComposer: function(element) {
      for (const comp of registeredComposers) {
        if (comp.mainStructure === element) {
          return comp;
        }
      }
      return null;
    }
  };

  docRef.addEventListener('DOMContentLoaded', () => {
    compositionManager.createGrid(null);
  });

  globalRef.GridComposerManager = compositionManager;

}(window, document));