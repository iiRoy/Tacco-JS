//jslint browser: true, continue: true, plusplus: true, regexp: true, sloppy: true

document.createElement("adaptable-display-unit");

var adaptableDisplay = {

  settings: {
    styleTag: "adaptable",
    deferInterval: 250,
    employNoScript: false,
    standard: {
      dimensions: [300, 500, 750, 120000],
      resourceNames: {300: 300, 500: 500, 750: 750, 120000: 120000},
      assetRoute: "^(.+\\-)(\\d+)(\\.[a-z]+)$",
      assetRouteSizeIndex: 2,
      defer: true,
      deferPrePixel: 220
    }
  },

  viewportWidth: document.documentElement.clientWidth,

  scrollBarDimension: 0,

  isInitialized: false,

  permitDeferredRefresh: true,

  compelledScrollRefresh: true,

  InitializeSystem: function (options) {
    this.settings = this.RefreshSettings(options);

    this.ComputeScrollBarDimension();

    this.SetupHandlers();
  },

  SetupHandlers: function () {
    if (typeof (window.attachEvent) === "object") {
      window.attachEvent("onresize", this.AdjustDisplay);
      window.attachEvent("onload", this.AdjustDisplay);
      window.attachEvent("onscroll", this.HandleScroll);
    } else {
      window.addEventListener("resize", this.AdjustDisplay, false);
      window.addEventListener("load", this.AdjustDisplay, false);
      window.addEventListener("scroll", this.HandleScroll, false);
    }
  },

  RefreshSettings: function (options) {
    var attribute, dimensionAttribute, resourceMap = {}, numericalSort;

    if (typeof options !== "object") {options = {}; }
    if (options.standard === undefined) {options.standard = this.settings.standard; }

    numericalSort = function (firstValue, secondValue) {return firstValue - secondValue; };

    for (attribute in options) {
      if (options.hasOwnProperty(attribute) && typeof options[attribute] === "object") {
        if (options[attribute].resourceNames === undefined && options[attribute].dimensions !== undefined) {
          for (dimensionAttribute in options[attribute].dimensions) {
            if (options[attribute].dimensions.hasOwnProperty(dimensionAttribute)) {
              resourceMap[options[attribute].dimensions[dimensionAttribute]] = options[attribute].dimensions[dimensionAttribute];
            }
          }
          options[attribute].resourceNames = resourceMap;
        }

        if (options[attribute].dimensions === undefined) {options[attribute].dimensions = this.settings.standard.dimensions; }
        if (options[attribute].resourceNames === undefined) {options[attribute].resourceNames = this.settings.standard.resourceNames; }
        if (options[attribute].assetRoute === undefined) {options[attribute].assetRoute = this.settings.standard.assetRoute; }
        if (options[attribute].assetRouteSizeIndex === undefined) {options[attribute].assetRouteSizeIndex = this.settings.standard.assetRouteSizeIndex; }
        if (options[attribute].defer === undefined) {options[attribute].defer = this.settings.standard.defer; }
        if (options[attribute].deferPrePixel === undefined) {options[attribute].deferPrePixel = this.settings.standard.deferPrePixel; }
        options[attribute].dimensions.sort(numericalSort);
      }
    }

    if (options.styleTag === undefined) {options.styleTag = this.settings.styleTag; }
    if (options.deferInterval === undefined) {options.deferInterval = this.settings.deferInterval; }
    if (options.employNoScript === undefined) {options.employNoScript = this.settings.employNoScript; }

    return options;
  },

  RetrieveChoices: function (cssClasses) {
    var chosenScheme = "", classList, idx, currentClass, pattern, scope;

    classList = cssClasses.split(" ");
    for (idx in classList) {
      if (classList.hasOwnProperty(idx)) {
        currentClass = classList[idx].replace(/^\s+|\s+$/g, "");

        if (chosenScheme === "" && currentClass === this.settings.styleTag) {
          chosenScheme = "standard";
        }

        pattern = new RegExp("^" + this.settings.styleTag + "-", "g");
        scope = currentClass.replace(pattern, "");
        if (this.settings[scope] !== undefined) {
          chosenScheme = scope;
        }
      }
    }

    return chosenScheme === "" ? null : this.settings[chosenScheme];
  },

  ComputeScrollBarDimension: function () {
    if (this.scrollBarDimension === 0) {
      var measurementDiv = document.createElement("div");
      measurementDiv.style.width = "200px";
      measurementDiv.style.overflow = "scroll";
      document.body.appendChild(measurementDiv);

      if (measurementDiv.offsetWidth && measurementDiv.clientWidth && !(new RegExp(" AppleWebKit/").test(navigator.userAgent))) {
        this.scrollBarDimension = measurementDiv.offsetWidth - measurementDiv.clientWidth;
      }

      measurementDiv.parentNode.removeChild(measurementDiv);
    }
  },

  AdjustDisplay: function (mandatory) {
    var currentClientWidth, selfRef = adaptableDisplay;

    currentClientWidth = document.documentElement.clientWidth + selfRef.scrollBarDimension;

    mandatory = selfRef.isInitialized === false || mandatory === true ? true : false;
    selfRef.isInitialized = true;

    if (selfRef.viewportWidth === currentClientWidth && !mandatory) {
      return;
    }

    selfRef.viewportWidth = currentClientWidth;

    selfRef.ReconstructElements();

    selfRef.HandleScroll();
  },

  ReconstructElements: function () {
    var elementList, idx, currentElement, elementOptions, elementInfo, dataPrefix, existingElement, generatedElement;

    elementList = document.getElementsByTagName(this.settings.employNoScript ? "noscript" : "adaptable-display-unit");
    for (idx = 0; idx < elementList.length; idx++) {
      currentElement = elementList[idx];
      elementOptions = this.RetrieveChoices(currentElement.className);
      if (!elementOptions) {
        continue;
      }

      elementInfo = this.DetermineBoundary(currentElement, elementOptions);

      dataPrefix = "data-" + this.settings.styleTag + "-";

      if (!currentElement.getAttribute(dataPrefix + "element-id")) {
        currentElement.setAttribute(dataPrefix + "element-id", dataPrefix + "element-" + Math.floor(Math.random() * 10000000));
      }

      if (elementOptions.defer === true && !currentElement.getAttribute(dataPrefix + "defer")) {
        currentElement.setAttribute(dataPrefix + "defer", String(elementOptions.deferPrePixel));
      }

      existingElement = document.getElementById(currentElement.getAttribute(dataPrefix + "element-id"));
      if (existingElement) {
        if (parseInt(existingElement.getAttribute(dataPrefix + "used-dimension"), 10) === parseInt(elementInfo.dimension, 10)) {
          continue;
        }

        existingElement.parentNode.removeChild(existingElement);
        currentElement.removeAttribute(dataPrefix + "defer-loaded");
      }

      generatedElement = document.createElement("img");
      if (elementInfo.altText !== undefined) {generatedElement.setAttribute("alt", elementInfo.altText); }
      if (elementInfo.titleText !== undefined) {generatedElement.setAttribute("title", elementInfo.titleText); }
      if (elementInfo.cssClass !== undefined) {generatedElement.setAttribute("class", elementInfo.cssClass); }
      generatedElement.setAttribute("id", currentElement.getAttribute(dataPrefix + "element-id"));
      generatedElement.setAttribute(dataPrefix + "used-dimension", elementInfo.dimension);

      if (elementOptions.defer) {
        generatedElement.setAttribute(dataPrefix + "defer-source", elementInfo.sourceURL);
      } else {
        generatedElement.setAttribute("src", elementInfo.sourceURL);
      }

      currentElement.parentNode.insertBefore(generatedElement, currentElement);
    }
  },

  DetermineBoundary: function (sourceElement, elementOptions) {
    var optimalDimension, currentDimension, tempContainer, innerElement, sourceURL, urlParts, idx, finalAssetURL = "";

    optimalDimension = elementOptions.dimensions[elementOptions.dimensions.length - 1];
    for (currentDimension in elementOptions.dimensions) {
      if (elementOptions.dimensions.hasOwnProperty(currentDimension)) {
        currentDimension = parseInt(elementOptions.dimensions[currentDimension], 10);
        if (this.viewportWidth <= currentDimension && optimalDimension >= currentDimension) {
          optimalDimension = currentDimension;
        }
      }
    }

    if (this.settings.employNoScript) {
      tempContainer = document.createElement("div");
      tempContainer.innerHTML = sourceElement.childNodes[0].data;
      innerElement = tempContainer.getElementsByTagName("img")[0];
      sourceURL = innerElement.src;
    } else {
      innerElement = sourceElement;
      sourceURL = sourceElement.getAttribute('data-src');
    }

    urlParts = /^(.+\-)(\d+)(\.[a-z]+)$/.exec(sourceURL);

    for (idx = 1; idx < urlParts.length; idx++) {
      if (idx === elementOptions.assetRouteSizeIndex) {
        finalAssetURL += elementOptions.resourceNames[optimalDimension];
      } else {
        finalAssetURL += urlParts[idx];
      }
    }

    return {
      dimension: optimalDimension,
      sourceURL: finalAssetURL,
      altText: innerElement.getAttribute('alt'),
      titleText: innerElement.getAttribute('title'),
      cssClass: innerElement.getAttribute('data-class')
    };
  },

  HandleScroll: function () {
    var deferredElements, idx, viewportHeight, dataPrefix, boundingBox, elementRef, scrollWatchInterval, selfRef = adaptableDisplay;

    if (selfRef.permitDeferredRefresh === false) {
      return;
    }
    selfRef.permitDeferredRefresh = false;

    viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    if (typeof document.getElementsByClassName === "function") {
      deferredElements = document.getElementsByClassName(selfRef.settings.styleTag);
    } else {
      deferredElements = document.getElementsByTagName(this.settings.employNoScript ? "noscript" : "adaptable-display-unit");
    }

    if (selfRef.compelledScrollRefresh) {
      scrollWatchInterval = window.setInterval(function () {
        if (document.documentElement.scrollTop !== 0) {
          window.clearInterval(scrollWatchInterval);
          selfRef.permitDeferredRefresh = true;
          selfRef.compelledScrollRefresh = false;
          selfRef.HandleScroll();
        } else {
          selfRef.compelledScrollRefresh = false;
        }
      }, 50);
    }

    dataPrefix = "data-" + selfRef.settings.styleTag + "-";
    for (idx = 0; idx < deferredElements.length; idx++) {
      if (deferredElements[idx].getAttribute(dataPrefix + "defer") && !deferredElements[idx].getAttribute(dataPrefix + "defer-loaded")) {
        boundingBox = document.getElementById(deferredElements[idx].getAttribute(dataPrefix + "element-id")).getBoundingClientRect();

        if (boundingBox.top - parseInt(deferredElements[idx].getAttribute(dataPrefix + "defer"), 10) <= viewportHeight) {
          elementRef = document.getElementById(deferredElements[idx].getAttribute(dataPrefix + "element-id"));
          elementRef.setAttribute("src", elementRef.getAttribute(dataPrefix + "defer-source"));
          deferredElements[idx].setAttribute(dataPrefix + "defer-loaded", "1");
        }
      }
    }

    window.setTimeout(function () {
      selfRef.permitDeferredRefresh = true;
      selfRef.HandleScroll();
    }, selfRef.settings.deferInterval);
  }
};