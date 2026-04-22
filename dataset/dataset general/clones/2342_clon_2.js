/*

Image Filler - 1.8 - Browser-side graphic placeholders
(c) 2012 I. Malopinsky / http://imsky.co

Licensed under Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
Attribution required for commercial use.

*/

var ImageFiller = ImageFiller || {};
(function (imgFill, globalWin) {

  // Internal flags and variables
  var alreadyInitialized = false, // Indicates if the application has been run
      canvasUnsupported = false,  // True if canvas or data URI is not supported
      drawingSurface = document.createElement('canvas'); // Offscreen canvas for rendering

  // Polyfill for getElementsByClassName if not natively supported
  document.getElementsByClassName || (document.getElementsByClassName = function(classNameStr) {
    var docObj = document,
        nodeList,
        regexPattern,
        currentElem,
        resultArr = [];

    // Use querySelectorAll if available
    if (docObj.querySelectorAll) {
      return docObj.querySelectorAll("." + classNameStr);
    }
    // Use XPath if available
    if (docObj.evaluate) {
      regexPattern = ".//*[contains(concat(' ', @class, ' '), ' " + classNameStr + " ')]";
      nodeList = docObj.evaluate(regexPattern, docObj, null, 0, null);
      while (currentElem = nodeList.iterateNext()) {
        resultArr.push(currentElem);
      }
    } else {
      // Fallback for older browsers
      nodeList = docObj.getElementsByTagName("*");
      regexPattern = new RegExp("(^|\\s)" + classNameStr + "(\\s|$)");
      for (currentElem = 0; currentElem < nodeList.length; currentElem++) {
        if (regexPattern.test(nodeList[currentElem].className)) {
          resultArr.push(nodeList[currentElem]);
        }
      }
    }
    return resultArr;
  });

  // Polyfill for window.getComputedStyle
  globalWin.getComputedStyle || (globalWin.getComputedStyle = function(targetElement, pseudoElem) {
    this.el = targetElement;
    this.getPropertyValue = function(propName) {
      var dashToCamelRegex = /(\-([a-z]){1})/g;
      if (propName === "float") {
        propName = "styleFloat"; // IE specific for float
      }
      if (dashToCamelRegex.test(propName)) {
        propName = propName.replace(dashToCamelRegex, function() {
          return arguments[2].toUpperCase(); // Convert to camelCase
        });
      }
      return targetElement.currentStyle[propName] ? targetElement.currentStyle[propName] : null;
    };
    return this;
  });

  // contentLoaded by Diego Perini (modified)
  function domReady(windowRef, callbackFunc) {
    var completeStatus = "complete",
        readyStateEvt = "readystatechange",
        isAsync = false,
        hasFired = isAsync,
        canScroll = true,
        documentRef = windowRef.document,
        htmlElem = documentRef.documentElement,
        addEvt = documentRef.addEventListener ? "addEventListener" : "attachEvent",
        removeEvt = documentRef.addEventListener ? "removeEventListener" : "detachEvent",
        eventPrefix = documentRef.addEventListener ? "" : "on",
        handler = function(evt) {
          if (evt.type !== readyStateEvt || documentRef.readyState === completeStatus) {
            (evt.type === "load" ? windowRef : documentRef)[removeEvt](eventPrefix + evt.type, handler, isAsync);
            if (!hasFired) {
              hasFired = true;
              callbackFunc.call(windowRef, null);
            }
          }
        },
        checkScroll = function() {
          try {
            htmlElem.doScroll("left");
          } catch (error) {
            setTimeout(checkScroll, 50);
            return;
          }
          handler("poll");
        };

    if (documentRef.readyState === completeStatus) {
      callbackFunc.call(windowRef, "lazy");
    } else {
      // For IE, use doScroll technique
      if (documentRef.createEventObject && htmlElem.doScroll) {
        try {
          canScroll = !windowRef.frameElement;
        } catch (err) {}
        if (canScroll) {
          checkScroll();
        }
      }
      // Standard event listeners
      documentRef[addEvt](eventPrefix + "DOMContentLoaded", handler, isAsync);
      documentRef[addEvt](eventPrefix + readyStateEvt, handler, isAsync);
      windowRef[addEvt](eventPrefix + "load", handler, isAsync);
    }
  }

  // Element selection utility (based on Jed Schmidt's gist, modified)
  function selectElements(inputQuery) {
    inputQuery = inputQuery.match(/^(\W)?(.*)/);
    var selectedElements = document["getElement" + (inputQuery[1] ? inputQuery[1] === "#" ? "ById" : "sByClassName" : "sByTagName")](inputQuery[2]);
    var foundCollection = [];
    if (selectedElements != null) {
      if (selectedElements.length) {
        foundCollection = selectedElements;
      } else if (selectedElements.length === 0) {
        foundCollection = selectedElements;
      } else {
        foundCollection = [selectedElements];
      }
    }
    return foundCollection;
  }

  // Shallow object property merge
  function mergeObjects(targetObj, sourceObj) {
    var mergedObj = {};
    for (var key1 in targetObj) {
      mergedObj[key1] = targetObj[key1];
    }
    for (var key2 in sourceObj) {
      mergedObj[key2] = sourceObj[key2];
    }
    return mergedObj;
  }

  // Polyfill for Object.prototype.hasOwnProperty
  if (!Object.prototype.hasOwnProperty) {
    Object.prototype.hasOwnProperty = function(propertyKey) {
      var prototypeObj = this.__proto__ || this.constructor.prototype;
      return (propertyKey in this) && (!(propertyKey in prototypeObj) || prototypeObj[propertyKey] !== this[propertyKey]);
    };
  }

  // Calculate text size based on image dimensions and template
  function determineTextSize(imgWidth, imgHeight, styleConfig) {
    var sortedDims = [imgHeight, imgWidth].sort();
    var maxDimFactor = Math.round(sortedDims[1] / 16), // Larger dimension / 16
        minDimFactor = Math.round(sortedDims[0] / 16); // Smaller dimension / 16
    var calculatedTextHeight = Math.max(styleConfig.fontSize, maxDimFactor);
    return {
      height: calculatedTextHeight
    };
  }

  // Draw the placeholder image onto the canvas and return data URL
  function renderPlaceholder(renderContext, elemDimensions, styleConfig, pixelRatio) {
    var textSizeInfo = determineTextSize(elemDimensions.width, elemDimensions.height, styleConfig);
    var finalTxtHeight = textSizeInfo.height;
    var renderWidth = elemDimensions.width * pixelRatio,
        renderHeight = elemDimensions.height * pixelRatio;

    var fontFamily = styleConfig.fontFamily ? styleConfig.fontFamily : "sans-serif";

    drawingSurface.width = renderWidth;
    drawingSurface.height = renderHeight;

    renderContext.textAlign = "center";
    renderContext.textBaseline = "middle";
    renderContext.fillStyle = styleConfig.backgroundColor;
    renderContext.fillRect(0, 0, renderWidth, renderHeight);
    renderContext.fillStyle = styleConfig.foregroundColor;
    renderContext.font = "bold " + finalTxtHeight + "px " + fontFamily;

    var contentText = styleConfig.displayText ? styleConfig.displayText : (elemDimensions.width + "x" + elemDimensions.height);

    // Adjust font size if text is too wide
    if (renderContext.measureText(contentText).width / renderWidth > 1) {
      finalTxtHeight = styleConfig.fontSize / (renderContext.measureText(contentText).width / renderWidth);
    }

    // Apply final font size, scaled by pixel ratio
    renderContext.font = "bold " + (finalTxtHeight * pixelRatio) + "px " + fontFamily;
    renderContext.fillText(contentText, (renderWidth / 2), (renderHeight / 2), renderWidth);

    return drawingSurface.toDataURL("image/png");
  }

  // Apply the generated placeholder to an element
  function applyPlaceholder(renderMode, targetElem, placeholderConfig, sourceLink) {
    var elemDimensions = placeholderConfig.dimensions,
        styleSettings = placeholderConfig.theme,
        displayTxt = placeholderConfig.displayText ? decodeURIComponent(placeholderConfig.displayText) : placeholderConfig.displayText;

    var dimCaption = elemDimensions.width + "x" + elemDimensions.height;

    // Apply custom text if provided
    styleSettings = (displayTxt ? mergeObjects(styleSettings, {
      displayText: displayTxt
    }) : styleSettings);
    // Apply custom font if provided
    styleSettings = (placeholderConfig.fontFamily ? mergeObjects(styleSettings, {
      fontFamily: placeholderConfig.fontFamily
    }) : styleSettings);

    var devicePxRatio = 1;
    if (globalWin.devicePixelRatio && globalWin.devicePixelRatio > 1) {
      devicePxRatio = globalWin.devicePixelRatio;
    }

    if (renderMode === "image") {
      targetElem.setAttribute("data-src", sourceLink);
      targetElem.setAttribute("alt", displayTxt ? displayTxt : styleSettings.displayText ? styleSettings.displayText + " [" + dimCaption + "]" : dimCaption);
      targetElem.style.width = elemDimensions.width + "px";
      targetElem.style.height = elemDimensions.height + "px";

      if (canvasUnsupported) {
        targetElem.style.backgroundColor = styleSettings.backgroundColor;
      } else {
        targetElem.setAttribute("src", renderPlaceholder(canvasRenderContext, elemDimensions, styleSettings, devicePxRatio));
      }
    } else { // Background image mode
      if (!canvasUnsupported) {
        targetElem.style.backgroundImage = "url(" + renderPlaceholder(canvasRenderContext, elemDimensions, styleSettings, devicePxRatio) + ")";
        targetElem.style.backgroundSize = elemDimensions.width + "px " + elemDimensions.height + "px";
      }
    }
  }

  // Handle fluid/responsive placeholders
  function handleFluidPlaceholder(targetElem, placeholderConfig, sourceLink) {
    var elemDimensions = placeholderConfig.dimensions,
        styleSettings = placeholderConfig.theme,
        displayTxt = placeholderConfig.displayText;
    var dimCaption = elemDimensions.width + "x" + elemDimensions.height;

    styleSettings = (displayTxt ? mergeObjects(styleSettings, {
      displayText: displayTxt
    }) : styleSettings);

    var dynamicDiv = document.createElement("div");

    dynamicDiv.style.backgroundColor = styleSettings.backgroundColor;
    dynamicDiv.style.color = styleSettings.foregroundColor;
    dynamicDiv.className = targetElem.className + " imagefiller-responsive";
    dynamicDiv.style.width = placeholderConfig.dimensions.width + (placeholderConfig.dimensions.width.indexOf("%") > 0 ? "" : "px");
    dynamicDiv.style.height = placeholderConfig.dimensions.height + (placeholderConfig.dimensions.height.indexOf("%") > 0 ? "" : "px");
    dynamicDiv.id = targetElem.id;

    targetElem.style.width = 0;
    targetElem.style.height = 0;

    if (styleSettings.displayText) {
      dynamicDiv.appendChild(document.createTextNode(styleSettings.displayText));
    } else {
      dynamicDiv.appendChild(document.createTextNode(dimCaption));
      dynamicPlaceholders.push(dynamicDiv);
      setTimeout(updateDynamicPlaceholders, 0);
    }

    targetElem.parentNode.insertBefore(dynamicDiv, targetElem.nextSibling);

    // jQuery integration for fluid images
    if (typeof jQuery !== 'undefined') {
      jQuery(function($) {
        $(targetElem).on("load", function() {
          targetElem.style.width = dynamicDiv.style.width;
          targetElem.style.height = dynamicDiv.style.height;
          $(targetElem).show();
          $(dynamicDiv).remove();
        });
      });
    }
  }

  // Update text for fluid placeholders on resize
  function updateDynamicPlaceholders() {
    for (var idx in dynamicPlaceholders) {
      if (!dynamicPlaceholders.hasOwnProperty(idx)) {
        continue;
      }
      var currentElement = dynamicPlaceholders[idx],
          textNode = currentElement.firstChild;

      currentElement.style.lineHeight = currentElement.offsetHeight + "px";
      textNode.data = currentElement.offsetWidth + "x" + currentElement.offsetHeight;
    }
  }

  // Parse flags from image source strings
  function parseImageFlags(inputFlags, userOptions) {
    var parsedResult = {
      theme: configuration.styles.defaultGray
    },
        shouldRender = false;

    for (var k = 0, flagCount = inputFlags.length; k < flagCount; k++) {
      var currentFlag = inputFlags[k];
      if (imgFill.flagDefinitions.sizeSpec.checkMatch(currentFlag)) {
        shouldRender = true;
        parsedResult.dimensions = imgFill.flagDefinitions.sizeSpec.extractOutput(currentFlag);
      } else if (imgFill.flagDefinitions.responsiveSize.checkMatch(currentFlag)) {
        shouldRender = true;
        parsedResult.dimensions = imgFill.flagDefinitions.responsiveSize.extractOutput(currentFlag);
        parsedResult.fluid = true;
      } else if (imgFill.flagDefinitions.colorScheme.checkMatch(currentFlag)) {
        parsedResult.theme = imgFill.flagDefinitions.colorScheme.extractOutput(currentFlag);
      } else if (userOptions.styles[currentFlag]) {
        // If a theme is specified, it will override custom colors
        parsedResult.theme = userOptions.styles[currentFlag];
      } else if (imgFill.flagDefinitions.displayText.checkMatch(currentFlag)) {
        parsedResult.displayText = imgFill.flagDefinitions.displayText.extractOutput(currentFlag);
      } else if (imgFill.flagDefinitions.fontStyle.checkMatch(currentFlag)) {
        parsedResult.fontFamily = imgFill.flagDefinitions.fontStyle.extractOutput(currentFlag);
      }
    }

    return shouldRender ? parsedResult : false;
  }

  // Check canvas support and initialize context
  if (!drawingSurface.getContext) {
    canvasUnsupported = true;
  } else {
    // Android doesn't support data URI with canvas.toDataURL sometimes
    if (drawingSurface.toDataURL("image/png").indexOf("data:image/png") < 0) {
      canvasUnsupported = true;
    } else {
      var canvasRenderContext = drawingSurface.getContext("2d");
    }
  }

  // Array to hold fluid placeholders needing updates
  var dynamicPlaceholders = [];

  // Default configuration settings
  var configuration = {
    appDomain: "imagefiller.js",
    imgSelectors: "img",
    elemSelectors: ".imagefiller",
    styles: {
      "defaultGray": {
        backgroundColor: "#eee",
        foregroundColor: "#aaa",
        fontSize: 12
      },
      "social": {
        backgroundColor: "#3a5a97",
        foregroundColor: "#fff",
        fontSize: 12
      },
      "industrial": {
        backgroundColor: "#434A52",
        foregroundColor: "#C2F200",
        fontSize: 12
      }
    },
    // CSS for fluid placeholders
    stylesheet: ".imagefiller-responsive {font-size:16px;font-weight:bold;text-align:center;font-family:sans-serif;margin:0}"
  };


  // Define flag parsing rules
  imgFill.flagDefinitions = {
    sizeSpec: {
      pattern: /^(\d+)x(\d+)$/,
      extractOutput: function(inputVal) {
        var exec = this.pattern.exec(inputVal);
        return {
          width: +exec[1],
          height: +exec[2]
        };
      }
    },
    responsiveSize: {
      pattern: /^([0-9%]+)x([0-9%]+)$/,
      extractOutput: function(inputVal) {
        var exec = this.pattern.exec(inputVal);
        return {
          width: exec[1],
          height: exec[2]
        };
      }
    },
    colorScheme: {
      pattern: /#([0-9a-f]{3,})\:#([0-9a-f]{3,})/i,
      extractOutput: function(inputVal) {
        var exec = this.pattern.exec(inputVal);
        return {
          fontSize: configuration.styles.defaultGray.fontSize,
          foregroundColor: "#" + exec[2],
          backgroundColor: "#" + exec[1]
        };
      }
    },
    displayText: {
      pattern: /text\:(.*)/,
      extractOutput: function(inputVal) {
        return this.pattern.exec(inputVal)[1];
      }
    },
    fontStyle: {
      pattern: /font\:(.*)/,
      extractOutput: function(inputVal) {
        return this.pattern.exec(inputVal)[1];
      }
    }
  };

  // Add a generic match method to each flag definition
  for (var defKey in imgFill.flagDefinitions) {
    if (!imgFill.flagDefinitions.hasOwnProperty(defKey)) {
      continue;
    }
    imgFill.flagDefinitions[defKey].checkMatch = function(inputVal) {
      return inputVal.match(this.pattern);
    };
  }

  // Public method to add a custom theme
  imgFill.addTheme = function(themeName, themeConfig) {
    if (themeName != null && themeConfig != null) {
      configuration.styles[themeName] = themeConfig;
    }
    return imgFill;
  };

  // Public method to add an image to a selector
  imgFill.addImage = function(imageSource, targetElement) {
    var foundNodes = selectElements(targetElement);
    if (foundNodes.length) {
      for (var j = 0, len = foundNodes.length; j < len; j++) {
        var newImageElem = document.createElement("img");
        newImageElem.setAttribute("data-src", imageSource);
        foundNodes[j].appendChild(newImageElem);
      }
    }
    return imgFill;
  };

  // Main execution function
  imgFill.execute = function(runtimeOptions) {
    var effectiveOptions = mergeObjects(configuration, runtimeOptions),
        imageElements = selectElements(effectiveOptions.imgSelectors),
        targetElements = selectElements(effectiveOptions.elemSelectors),
        hasStarted = true, // Renamed from preempted
        imageArray = [];

    // Convert NodeList to array for easier iteration
    for (var i = 0, len = imageElements.length; i < len; i++) {
      imageArray.push(imageElements[i]);
    }

    // Inject custom CSS for fluid placeholders
    var customStylesheet = document.createElement("style");
    customStylesheet.type = "text/css";
    if (customStylesheet.styleSheet) { // IE specific
      customStylesheet.styleSheet.cssText = effectiveOptions.stylesheet;
    } else {
      customStylesheet.textContent = effectiveOptions.stylesheet;
    }
    document.getElementsByTagName("head")[0].appendChild(customStylesheet);

    // Regex to extract flags from background-image URLs
    var cssMatchPattern = new RegExp(effectiveOptions.appDomain + "\/(.*?)\"?\\)");

    // Process elements with background images
    for (var k = 0, elemLen = targetElements.length; k < elemLen; k++) {
      var backgroundSrc = globalWin.getComputedStyle(targetElements[k], null)
          .getPropertyValue("background-image");
      var matchedFlags = backgroundSrc.match(cssMatchPattern);
      if (matchedFlags) {
        var placeholderData = parseImageFlags(matchedFlags[1].split("/"), effectiveOptions);
        if (placeholderData) {
          applyPlaceholder("background", targetElements[k], placeholderData, backgroundSrc);
        }
      }
    }

    // Process <img> tags
    for (var m = 0, imgLen = imageArray.length; m < imgLen; m++) {
      var imageSrc = imageArray[m].getAttribute("src") || imageArray[m].getAttribute("data-src");
      if (imageSrc != null && imageSrc.indexOf(effectiveOptions.appDomain) >= 0) {
        var placeholderData = parseImageFlags(imageSrc.substr(imageSrc.lastIndexOf(effectiveOptions.appDomain) + effectiveOptions.appDomain.length + 1)
            .split("/"), effectiveOptions);
        if (placeholderData) {
          if (placeholderData.fluid) {
            handleFluidPlaceholder(imageArray[m], placeholderData, imageSrc);
          } else {
            applyPlaceholder("image", imageArray[m], placeholderData, imageSrc);
          }
        }
      }
    }
    return imgFill;
  };

  // Execute on DOM ready and attach resize/orientationchange listeners
  domReady(globalWin, function() {
    if (globalWin.addEventListener) {
      globalWin.addEventListener("resize", updateDynamicPlaceholders, false);
      globalWin.addEventListener("orientationchange", updateDynamicPlaceholders, false);
    } else {
      globalWin.attachEvent("onresize", updateDynamicPlaceholders);
    }
    // Run if not already triggered by an explicit call to imgFill.execute()
    alreadyInitialized || imgFill.execute();
  });

  // AMD support
  if (typeof define === "function" && define.amd) {
    define("ImageFiller", [], function() {
      return imgFill;
    });
  }

})(ImageFiller, window);