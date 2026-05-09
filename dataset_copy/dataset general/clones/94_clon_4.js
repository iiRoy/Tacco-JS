(function() {
  "use strict";

  const formatStyleKey = (keyString) => {
    return keyString.split('-').reduce((accumulator, part, index) => {
      if (index === 0) return part;
      return accumulator + part.charAt(0).toUpperCase() + part.slice(1);
    }, '');
  };

  const acquireStyleAttribute = (domNode, attribute) => {
    let attributeValue;
    const convertedAttribute = formatStyleKey(attribute);
    if (window.getComputedStyle) {
      attributeValue = window.getComputedStyle(domNode, null).getPropertyValue(attribute);
    } else if (domNode.currentStyle) {
      attributeValue = domNode.currentStyle[convertedAttribute];
    } else {
      attributeValue = domNode.style[convertedAttribute];
    }

    if (attribute === 'cursor') {
      if (!attributeValue || attributeValue === 'auto') {
        const tagMap = new Map([['a', 'pointer']]);
        return tagMap.get(domNode.tagName.toLowerCase()) || attributeValue;
      }
    }
    return attributeValue;
  };

  const eventRegistry = (() => {
    const attachEvent = (targetNode, eventType, callbackFn) => {
      if (targetNode.addEventListener) {
        targetNode.addEventListener(eventType, callbackFn, false);
      } else if (targetNode.attachEvent) {
        targetNode.attachEvent("on" + eventType, callbackFn);
      }
    };

    const detachEvent = (targetNode, eventType, callbackFn) => {
      if (targetNode.removeEventListener) {
        targetNode.removeEventListener(eventType, callbackFn, false);
      } else if (targetNode.detachEvent) {
        targetNode.detachEvent("on" + eventType, callbackFn);
      }
    };
    return { attachEvent, detachEvent };
  })();

  const elementClassUtil = (() => {
    const manipulateClasses = (node, classNames, isAdding) => {
      if (!node || node.nodeType !== 1 || !classNames) return node;

      if (node.classList) {
        classNames.split(/\s+/).filter(Boolean).forEach(cls => {
          if (isAdding) node.classList.add(cls);
          else node.classList.remove(cls);
        });
      } else {
        let currentClasses = new Set(node.className.split(/\s+/).filter(Boolean));
        classNames.split(/\s+/).filter(Boolean).forEach(cls => {
          if (isAdding) currentClasses.add(cls);
          else currentClasses.delete(cls);
        });
        node.className = Array.from(currentClasses).join(' ');
      }
      return node;
    };

    return {
      addStyles: (node, styles) => manipulateClasses(node, styles, true),
      removeStyles: (node, styles) => manipulateClasses(node, styles, false)
    };
  })();

  const calculateElementMetrics = (targetElement) => {
    const visualScale = (() => {
      let factor = 1;
      if (typeof document.body.getBoundingClientRect === "function") {
        const dimensions = document.body.getBoundingClientRect();
        const actualWidth = dimensions.right - dimensions.left;
        const reportedWidth = document.body.offsetWidth;
        factor = Math.round((actualWidth / reportedWidth) * 100) / 100;
      }
      return factor;
    })();

    const metrics = {
      xPos: 0,
      yPos: 0,
      widthDim: 0,
      heightDim: 0,
      depthIndex: 999999999
    };

    const currentZIndex = acquireStyleAttribute(targetElement, "z-index");
    if (currentZIndex && currentZIndex !== "auto") {
      metrics.depthIndex = parseInt(currentZIndex, 10);
    }

    if (targetElement.getBoundingClientRect) {
      const rect = targetElement.getBoundingClientRect();
      let horizontalScroll, verticalScroll;

      if ("pageXOffset" in window && "pageYOffset" in window) {
        horizontalScroll = window.pageXOffset;
        verticalScroll = window.pageYOffset;
      } else {
        horizontalScroll = Math.round(document.documentElement.scrollLeft / visualScale);
        verticalScroll = Math.round(document.documentElement.scrollTop / visualScale);
      }

      const borderLeft = document.documentElement.clientLeft || 0;
      const borderTop = document.documentElement.clientTop || 0;

      metrics.xPos = rect.left + horizontalScroll - borderLeft;
      metrics.yPos = rect.top + verticalScroll - borderTop;
      metrics.widthDim = "width" in rect ? rect.width : rect.right - rect.left;
      metrics.heightDim = "height" in rect ? rect.height : rect.bottom - rect.top;
    }
    return metrics;
  };

  const generateCacheBuster = (urlPath, agentInstance) => {
    if (agentInstance.currentSettings.disableCache) {
      const separator = urlPath.includes("?") ? "&" : "?";
      return `${separator}cacheRef=${Date.now().toString(36)}`;
    }
    return "";
  };

  const constructFlashParameters = (configuration) => {
    const parameterSegments = [];
    if (configuration.securityDomains) {
      let domainList;
      if (typeof configuration.securityDomains === "string" && configuration.securityDomains) {
        domainList = [configuration.securityDomains];
      } else if (Array.isArray(configuration.securityDomains)) {
        domainList = configuration.securityDomains;
      }
      if (domainList && domainList.length > 0) {
          parameterSegments.push("securityPolicy=" + encodeURIComponent(domainList.join("|")));
      }
    }
    if (typeof configuration.moduleID_AMD === "string" && configuration.moduleID_AMD) {
      parameterSegments.push("amdIdentifier=" + encodeURIComponent(configuration.moduleID_AMD));
    }
    if (typeof configuration.moduleID_CJS === "string" && configuration.moduleID_CJS) {
      parameterSegments.push("cjsIdentifier=" + encodeURIComponent(configuration.moduleID_CJS));
    }
    return parameterSegments.join("$$");
  };

  const locateItemIndex = (item, collection) => {
    if (collection.findIndex) {
      return collection.findIndex(element => element === item);
    }
    const searchRecursive = (arr, target, index = 0) => {
      if (index >= arr.length) return -1;
      if (arr[index] === target) return index;
      return searchRecursive(arr, target, index + 1);
    };
    return searchRecursive(collection, item);
  };

  const prepareTargetNodes = (inputNodes) => {
    if (typeof inputNodes === "string") {
      throw new TypeError("ClipBuddy cannot process string selectors.");
    }
    if (inputNodes === null || typeof inputNodes === 'undefined') {
        return [];
    }
    return Array.isArray(inputNodes) ? inputNodes :
           (inputNodes.length !== undefined && typeof inputNodes !== 'function') ? Array.from(inputNodes) :
           [inputNodes];
  };

  const invokeHandler = (callbackFn, contextNode, agentRef, eventData, isDeferred) => {
    if (typeof callbackFn !== 'function') return;

    const executionContext = contextNode;
    const argumentsArray = [agentRef, eventData];

    if (isDeferred) {
      Promise.resolve().then(() => {
        callbackFn.apply(executionContext, argumentsArray);
      });
    } else {
      callbackFn.apply(executionContext, argumentsArray);
    }
  };

  const ClipBuddy = (() => {
    let activeAgent = null;
    let currentTargetNode = null;
    const managedNodes = [];

    const defaultParameters = {
      flashAssetPath: "ClipBuddy.swf",
      securityDomains: null,
      copyContent: null,
      hoverEffectClass: "clipbuddy-hovered",
      activeEffectClass: "clipbuddy-activated",
      scriptAccessLevel: "sameDomain",
      disableCache: true,
      forceHandPointer: false
    };

    const handleTargetHover = (event) => {
      if (!activeAgent) return;
      const eventSource = event ? (event.target || event.srcElement) : this;
      activeAgent.setActiveTarget(eventSource);
    };

    const updatePointerState = function(enabled) {
      if (this.isReady()) this.flashInterface.setHandCursor(enabled);
    };

    const createAgent = (initialTargets, userOptions) => {
      if (activeAgent) {
        if (initialTargets) activeAgent.attachTargets(initialTargets);
        return activeAgent;
      }

      const agentInstance = Object.create(createAgent.prototype);
      activeAgent = agentInstance;

      agentInstance.currentSettings = {};
      Object.assign(agentInstance.currentSettings, defaultParameters);
      Object.assign(agentInstance.currentSettings, userOptions);

      agentInstance.registeredHandlers = new Map();

      if (initialTargets) agentInstance.attachTargets(initialTargets);

      if (createAgent.checkFlashAvailability()) {
        flashContainerBuilder();
      }

      return agentInstance;
    };

    createAgent.prototype = {
      constructor: createAgent,
      setActiveTarget: function(node) {
        currentTargetNode = node;
        this.refreshPosition();
        const nodeTitle = node.getAttribute("title");
        if (nodeTitle) {
          this.setOverlayTitle(nodeTitle);
        }
        const useHand = this.currentSettings.forceHandPointer || acquireStyleAttribute(node, "cursor") === "pointer";
        updatePointerState.call(this, useHand);
      },

      setCopyText: function(textValue) {
        if (textValue && textValue !== "") {
          this.currentSettings.copyContent = textValue;
          if (this.isReady()) this.flashInterface.setText(textValue);
        }
      },

      setOverlayTitle: function(titleValue) {
        if (titleValue && titleValue !== "") this.domBridge.setAttribute("title", titleValue);
      },

      setOverlayDimensions: function(width, height) {
        if (this.isReady()) this.flashInterface.setSize(width, height);
      },

      setPointerBehavior: function(enabled) {
        const state = typeof enabled === "boolean" ? enabled : !!enabled;
        updatePointerState.call(this, state);
        this.currentSettings.forceHandPointer = state;
      },

      version: "1.2.0-beta.4-cb",

      resetOverlayState: function() {
        this.domBridge.style.left = "-9999px";
        this.domBridge.style.top = "-9999px";
        this.domBridge.removeAttribute("title");
        this.domBridge.removeAttribute("data-clipboard-text");
        if (currentTargetNode) {
          elementClassUtil.removeStyles(currentTargetNode, this.currentSettings.activeEffectClass);
        }
        currentTargetNode = null;
        this.currentSettings.copyContent = null;
      },

      isReady: function() {
        const readyStatus = this.domBridge.getAttribute("data-clipboard-ready");
        return readyStatus === "true" || readyStatus === true;
      },

      refreshPosition: function() {
        if (!currentTargetNode) return false;
        const metrics = calculateElementMetrics(currentTargetNode);
        this.domBridge.style.top = metrics.yPos + "px";
        this.domBridge.style.left = metrics.xPos + "px";
        this.domBridge.style.width = metrics.widthDim + "px";
        this.domBridge.style.height = metrics.heightDim + "px";
        this.domBridge.style.zIndex = metrics.depthIndex + 1;
        this.setOverlayDimensions(metrics.widthDim, metrics.heightDim);
      },

      listen: function(eventNames, handlerFunction) {
        const events = eventNames.toString().split(/\s+/g);
        for (const eventName of events) {
          const normalizedName = eventName.toLowerCase().replace(/^on/, "");
          if (!this.registeredHandlers.has(normalizedName)) {
              this.registeredHandlers.set(normalizedName, []);
          }
          this.registeredHandlers.get(normalizedName).push(handlerFunction);
        }
        if (this.registeredHandlers.has("noflash") && !createAgent.checkFlashAvailability()) {
          this.processFlashEvent("onNoFlash", null);
        }
      },

      addEventListener: function(...args) { return this.listen(...args); },

      ignore: function(eventNames, handlerFunction) {
        const events = eventNames.toString().split(/\s+/g);
        for (const eventName of events) {
          const normalizedName = eventName.toLowerCase().replace(/^on/, "");
          if (this.registeredHandlers.has(normalizedName)) {
            const handlers = this.registeredHandlers.get(normalizedName);
            const index = handlers.indexOf(handlerFunction);
            if (index > -1) {
              handlers.splice(index, 1);
            }
            if (handlers.length === 0) {
              this.registeredHandlers.delete(normalizedName);
            }
          }
        }
      },

      removeEventListener: function(...args) { return this.ignore(...args); },

      processFlashEvent: function(eventName, eventData) {
        const normalizedEvent = eventName.toString().toLowerCase().replace(/^on/, "");
        const targetElement = currentTargetNode;
        let deferCallback = true;

        switch (normalizedEvent) {
          case "load":
            if (eventData && parseFloat(eventData.flashVersion.replace(/,/g, ".").replace(/[^0-9\.]/gi, "")) < 10) {
              this.processFlashEvent("onWrongFlash", { flashVersion: eventData.flashVersion });
              return;
            }
            this.domBridge.setAttribute("data-clipboard-ready", true);
            break;
          case "mouseover":
            elementClassUtil.addStyles(targetElement, this.currentSettings.hoverEffectClass);
            break;
          case "mouseout":
            elementClassUtil.removeStyles(targetElement, this.currentSettings.hoverEffectClass);
            this.resetOverlayState();
            break;
          case "mousedown":
            elementClassUtil.addStyles(targetElement, this.currentSettings.activeEffectClass);
            break;
          case "mouseup":
            elementClassUtil.removeStyles(targetElement, this.currentSettings.activeEffectClass);
            break;
          case "datarequested":
            const dataTargetId = targetElement.getAttribute("data-clipboard-target");
            const dataTargetNode = dataTargetId ? document.getElementById(dataTargetId) : null;
            if (dataTargetNode) {
              const content = dataTargetNode.value || dataTargetNode.textContent || dataTargetNode.innerText;
              if (content) this.setCopyText(content);
            } else {
              const defaultContent = targetElement.getAttribute("data-clipboard-text");
              if (defaultContent) this.setCopyText(defaultContent);
            }
            deferCallback = false;
            break;
          case "complete":
            this.currentSettings.copyContent = null;
            break;
        }

        if (this.registeredHandlers.has(normalizedEvent)) {
          const handlersToExecute = this.registeredHandlers.get(normalizedEvent);
          for (let handler of handlersToExecute) {
            if (typeof handler === "string" && typeof window[handler] === "function") {
              handler = window[handler];
            }
            if (typeof handler === "function") {
              invokeHandler(handler, targetElement, this, eventData, deferCallback);
            }
          }
        }
      },

      attachTargets: function(elementsToTrack) {
        const nodes = prepareTargetNodes(elementsToTrack);
        for (const node of nodes) {
          if (locateItemIndex(node, managedNodes) === -1) {
            managedNodes.push(node);
            eventRegistry.attachEvent(node, "mouseover", handleTargetHover);
          }
        }
      },

      detachTargets: function(elementsToUntrack) {
        const nodes = prepareTargetNodes(elementsToUntrack);
        for (const node of nodes) {
          eventRegistry.detachEvent(node, "mouseover", handleTargetHover);
          const nodeIndex = locateItemIndex(node, managedNodes);
          if (nodeIndex !== -1) managedNodes.splice(nodeIndex, 1);
        }
      }
    };

    Object.assign(createAgent, {
      configureDefaults: function(newOptions) {
        Object.assign(defaultParameters, newOptions);
      },

      terminate: function() {
        if (!activeAgent) return;
        activeAgent.detachTargets(managedNodes);
        const bridgeNode = activeAgent.domBridge;
        if (bridgeNode && bridgeNode.parentNode) {
          bridgeNode.parentNode.removeChild(bridgeNode);
        }
        activeAgent = null;
      },

      checkFlashAvailability: function() {
        let flashFound = false;
        if (typeof ActiveXObject === "function") {
          try {
            if (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) {
              flashFound = true;
            }
          } catch (err) { /* ignore */ }
        }
        if (!flashFound && navigator.mimeTypes && navigator.mimeTypes["application/x-shockwave-flash"]) {
          flashFound = true;
        }
        return flashFound;
      },

      signalFlashEvent: function(eventName, args) {
        if (activeAgent) {
          activeAgent.processFlashEvent(eventName, args);
        }
      }
    });

    let amd_ID = null;
    let cjs_ID = null;

    const flashContainerBuilder = () => {
      const agent = activeAgent;
      let containerElement = document.getElementById("global-clipbuddy-html-wrapper");

      if (!containerElement) {
        const currentConfig = {};
        Object.assign(currentConfig, agent.currentSettings);
        currentConfig.moduleID_AMD = amd_ID;
        currentConfig.moduleID_CJS = cjs_ID;

        const flashVarString = constructFlashParameters(currentConfig);

        const objectHTML = `
          <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="global-clipbuddy-flash-object" width="100%" height="100%">
            <param name="movie" value="${agent.currentSettings.flashAssetPath}${generateCacheBuster(agent.currentSettings.flashAssetPath, agent)}"/>
            <param name="allowScriptAccess" value="${agent.currentSettings.scriptAccessLevel}"/>
            <param name="scale" value="exactfit"/>
            <param name="loop" value="false"/>
            <param name="menu" value="false"/>
            <param name="quality" value="best" />
            <param name="bgcolor" value="#ffffff"/>
            <param name="wmode" value="transparent"/>
            <param name="flashvars" value="${flashVarString}"/>
            <embed src="${agent.currentSettings.flashAssetPath}${generateCacheBuster(agent.currentSettings.flashAssetPath, agent)}"
              loop="false" menu="false"
              quality="best" bgcolor="#ffffff"
              width="100%" height="100%"
              name="global-clipbuddy-flash-object"
              allowScriptAccess="always"
              allowFullScreen="false"
              type="application/x-shockwave-flash"
              wmode="transparent"
              pluginspage="http://www.macromedia.com/go/getflashplayer"
              flashvars="${flashVarString}"
              scale="exactfit">
            </embed>
          </object>`;

        containerElement = document.createElement("section");
        containerElement.id = "global-clipbuddy-html-wrapper";
        containerElement.setAttribute("class", "global-clipbuddy-host");
        containerElement.setAttribute("data-clipboard-ready", false);
        containerElement.style.cssText = `
          position: absolute;
          left: -9999px;
          top: -9999px;
          width: 15px;
          height: 15px;
          z-index: 9999;
        `;
        containerElement.innerHTML = objectHTML;
        document.body.appendChild(containerElement);
      }
      agent.domBridge = containerElement;
      agent.flashInterface = document["global-clipbuddy-flash-object"] || containerElement.children[0].lastElementChild;
    };

    if (typeof define === "function" && define.amd) {
      define([ "require", "exports", "module" ], function(require, exports, module) {
        amd_ID = module && module.id || null;
        return createAgent;
      });
    } else if (typeof module !== "undefined" && module && module.exports) {
      cjs_ID = module.id || null;
      module.exports = createAgent;
    } else {
      window.ClipBuddy = createAgent;
    }

    return createAgent;
  })();
})();