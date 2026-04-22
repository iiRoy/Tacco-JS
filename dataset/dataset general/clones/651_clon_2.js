(function(pkgExporter) {
 if (typeof exports === "object" && typeof module !== "undefined") {
  module.exports = pkgExporter();
 } else if (typeof define === "function" && define.amd) {
  define([], pkgExporter);
 } else {
  var globalScope;
  if (typeof window !== "undefined") {
   globalScope = window;
  } else if (typeof global !== "undefined") {
   globalScope = global;
  } else if (typeof self !== "undefined") {
   globalScope = self;
  } else {
   globalScope = this;
  }
  globalScope.SocialConnector = pkgExporter();
 }
})(function() {
 var defineLoader, moduleExports, moduleObj;

 function computeVisuals(options) {
  /* Generates CSS styles based on provided configuration */
  return "" + options.identifier + " .social.bottom," + options.identifier + " .social.top{" +
   "-webkit-transform-origin:0 0;-moz-transform-origin:0 0;-o-transform-origin:0 0}" + options.identifier +
   "{width:92px;height:20px;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;" +
   "-ms-user-select:none;user-select:none}" + options.identifier + " [class*=entypo-]:before{font-family:entypo,sans-serif}" +
   options.identifier + " label{font-size:16px;cursor:pointer;margin:0;padding:5px 10px;border-radius:5px;" +
   "background:#a29baa;color:#333;transition:all .3s ease}" + options.identifier + " label:hover{opacity:.8}" +
   options.identifier + " label span{text-transform:uppercase;font-size:.9em;font-family:Lato,sans-serif;" +
   "font-weight:700;-webkit-font-smoothing:antialiased;padding-left:6px}" + options.identifier +
   " .social{opacity:0;transition:all .4s ease;margin-left:-15px;visibility:hidden}" + options.identifier +
   " .social.top{-ms-transform-origin:0 0;transform-origin:0 0;margin-top:-80px}" + options.identifier +
   " .social.bottom{-ms-transform-origin:0 0;transform-origin:0 0;margin-top:5px}" + options.identifier +
   " .social.middle.left," + options.identifier + " .social.middle.right{-ms-transform-origin:5% 50%;" +
   "transform-origin:5% 50%;-webkit-transform-origin:5% 50%;-moz-transform-origin:5% 50%;" +
   "-o-transform-origin:5% 50%}" + options.identifier + " .social.middle{margin-top:-34px}" + options.identifier +
   " .social.middle.right{margin-left:105px}" + options.identifier + " .social.networks-1.center," + options.identifier +
   " .social.networks-1.left," + options.identifier + " .social.right{margin-left:14px}" + options.identifier +
   " .social.load{transition:none!important}" + options.identifier + " .social.networks-1{width:60px}" +
   options.identifier + " .social.networks-1.middle.left{margin-left:-70px}" + options.identifier +
   " .social.networks-1 ul{width:60px}" + options.identifier + " .social.networks-2," + options.identifier +
   " .social.networks-2 ul{width:120px}" + options.identifier + " .social.networks-2.center{margin-left:-13px}" +
   options.identifier + " .social.networks-2.left{margin-left:-44px}" + options.identifier +
   " .social.networks-2.middle.left{margin-left:-130px}" + options.identifier + " .social.networks-3," +
   options.identifier + " .social.networks-3 ul{width:180px}" + options.identifier +
   " .social.networks-3.center{margin-left:-45px}" + options.identifier + " .social.networks-3.left{margin-left:-102px}" +
   options.identifier + " .social.networks-3.middle.left{margin-left:-190px}" + options.identifier +
   " .social.networks-4," + options.identifier + " .social.networks-4 ul{width:240px}" + options.identifier +
   " .social.networks-4.center{margin-left:-75px}" + options.identifier + " .social.networks-4.left{margin-left:162px}" +
   options.identifier + " .social.networks-4.middle.left{margin-left:-250px}" + options.identifier +
   " .social.networks-5," + options.identifier + " .social.networks-5 ul{width:300px}" + options.identifier +
   " .social.networks-5.center{margin-left:-105px}" + options.identifier + " .social.networks-5.left{margin-left:-225px}" +
   options.identifier + " .social.networks-5.middle.left{margin-left:-320px}" + options.identifier +
   " .social.active{opacity:1;transition:all .4s ease;visibility:visible}" + options.identifier +
   " .social.active.top{-webkit-transform:scale(1)translateY(-10px);-moz-transform:scale(1)translateY(-10px);" +
   "-o-transform:scale(1)translateY(-10px);-ms-transform:scale(1)translateY(-10px);transform:scale(1)translateY(-10px)}" +
   options.identifier + " .social.active.bottom{-webkit-transform:scale(1)translateY(15px);-moz-transform:scale(1)translateY(15px);" +
   "-o-transform:scale(1)translateY(15px);-ms-transform:scale(1)translateY(15px);transform:scale(1)translateY(15px)}" +
   options.identifier + " .social.active.middle.right{-webkit-transform:scale(1)translateX(10px);" +
   "-moz-transform:scale(1)translateX(10px);-o-transform:scale(1)translateX(10px);" +
   "-ms-transform:scale(1)translateX(10px);transform:scale(1)translateX(10px)}" + options.identifier +
   " .social.active.middle.left{-webkit-transform:scale(1)translateX(-10px);" +
   "-moz-transform:scale(1)translateX(-10px);-o-transform:scale(1)translateX(-10px);" +
   "-ms-transform:scale(1)translateX(-10px);transform:scale(1)translateX(-10px)}" + options.identifier +
   " .social ul{position:relative;left:0;right:0;height:46px;color:#fff;margin:auto;padding:0;list-style:none}" +
   options.identifier + " .social ul li{font-size:20px;cursor:pointer;width:60px;margin:0;padding:12px 0;" +
   "text-align:center;float:left;display:none;height:22px;position:relative;z-index:2;-webkit-box-sizing:content-box;" +
   "-moz-box-sizing:content-box;box-sizing:content-box;transition:all .3s ease}" + options.identifier +
   " .social ul li:hover{color:rgba(0,0,0,.5)}" + options.identifier + " .social li[class*=facebook]{background:#3b5998;" +
   "display:" + options.socialPlatforms.faceBook.visibility + "}" + options.identifier + " .social li[class*=twitter]{background:#6cdfea;" +
   "display:" + options.socialPlatforms.tweeter.visibility + "}" + options.identifier + " .social li[class*=gplus]{background:#e34429;" +
   "display:" + options.socialPlatforms.googlePlus.visibility + "}" + options.identifier + " .social li[class*=pinterest]{background:#c5282f;" +
   "display:" + options.socialPlatforms.pinterest.visibility + "}" + options.identifier + " .social li[class*=paper-plane]{background:#42c5b0;" +
   "display:" + options.socialPlatforms.electronicMail.visibility + "}";
 }
 var UtilityToolkit;

 /* Polyfill for classList property if not supported by browser */
 if (!("classSet" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== "undefined") {
  Object.defineProperty(HTMLElement.prototype, "classSet", {
   get: function() {
    var resultObj, currentElement, updateClassMethod;
    updateClassMethod = function(callbackFunc) {
     return function(inputVal) {
      var styleClasses, pos;
      styleClasses = currentElement.className.split(/\s+/);
      pos = styleClasses.indexOf(inputVal);
      callbackFunc(styleClasses, pos, inputVal);
      currentElement.className = styleClasses.join(" ");
     };
    };
    currentElement = this;
    resultObj = {
     append: updateClassMethod(function(styleClasses, pos, inputVal) {
      ~pos || styleClasses.push(inputVal);
     }),
     erase: updateClassMethod(function(styleClasses, pos) {
      ~pos && styleClasses.splice(pos, 1);
     }),
     switchState: updateClassMethod(function(styleClasses, pos, inputVal) {
      if (~pos) {
       styleClasses.splice(pos, 1);
      } else {
       styleClasses.push(inputVal);
      }
     }),
     includes: function(inputVal) {
      return !!~currentElement.className.split(/\s+/).indexOf(inputVal);
     },
     fetchItem: function(idx) {
      return currentElement.className.split(/\s+/)[idx] || null;
     }
    };
    Object.defineProperty(resultObj, "size", {
     get: function() {
      return currentElement.className.split(/\s+/).length;
     }
    });
    return resultObj;
   }
  });
 }

 /* Adds a method to String prototype for RFC3986 encoding */
 String.prototype.toUriSafeString = function() {
  var tempStr;
  tempStr = encodeURIComponent(this);
  return tempStr.replace(/[!'()*]/g, function(charToReplace) {
   return "%" + charToReplace.charCodeAt(0).toString(16);
  });
 };

 /* Base utility class for common helper functions */
 UtilityToolkit = (function() {
  function UtilityToolkit() {}

  UtilityToolkit.prototype.mergeObjects = function(destination, source, shouldOverwrite) {
   var propertyExists, propertyKey;
   for (propertyKey in source) {
    propertyExists = destination[propertyKey] !== undefined;
    if (propertyExists && typeof source[propertyKey] === "object") {
     this.mergeObjects(destination[propertyKey], source[propertyKey], shouldOverwrite);
    } else {
     if (shouldOverwrite || !propertyExists) {
      destination[propertyKey] = source[propertyKey];
     }
    }
   }
  };

  UtilityToolkit.prototype.concealElement = function(elementRef) {
   return elementRef.style.display = "none";
  };

  UtilityToolkit.prototype.revealElement = function(elementRef) {
   return elementRef.style.display = "block";
  };

  UtilityToolkit.prototype.hasCssClass = function(elementRef, cssClass) {
   return elementRef.classSet.includes(cssClass);
  };

  UtilityToolkit.prototype.addCssClass = function(elementRef, cssClass) {
   return elementRef.classSet.append(cssClass);
  };

  UtilityToolkit.prototype.removeCssClass = function(elementRef, cssClass) {
   return elementRef.classSet.erase(cssClass);
  };

  UtilityToolkit.prototype.isUriEncoded = function(inputString) {
   inputString = inputString.toUriSafeString();
   return decodeURIComponent(inputString) !== inputString;
  };

  UtilityToolkit.prototype.performEncoding = function(inputString) {
   if (typeof inputString === "undefined" || this.isUriEncoded(inputString)) {
    return inputString;
   } else {
    return inputString.toUriSafeString();
   }
  };

  UtilityToolkit.prototype.spawnPopup = function(targetUrl, popupOptions) {
   var key, newPopup, queryString, value;
   if (popupOptions == null) {
    popupOptions = {};
   }
   newPopup = {
    popupWidth: 500,
    popupHeight: 350
   };
   newPopup.popupTop = (screen.height / 2) - (newPopup.popupHeight / 2);
   newPopup.popupLeft = (screen.width / 2) - (newPopup.popupWidth / 2);
   queryString = ((function() {
    var collectedResults;
    collectedResults = [];
    for (key in popupOptions) {
     value = popupOptions[key];
     collectedResults.push(key + "=" + (this.performEncoding(value)));
    }
    return collectedResults;
   }).call(this)).join('&');
   if (queryString) {
    queryString = "?" + queryString;
   }
   return window.open(targetUrl + queryString, 'popupWindow',
    "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,left=" + newPopup.popupLeft +
    ",top=" + newPopup.popupTop + ",width=" + newPopup.popupWidth + ",height=" + newPopup.popupHeight);
  };

  return UtilityToolkit;

 })();
 var SocialConnector,
  inheritFrom = function(derivedClass, baseClass) {
   for (var propName in baseClass) {
    if (ownProperty.call(baseClass, propName)) derivedClass[propName] = baseClass[propName];
   }

   function ctorMethod() {
    this.constructor = derivedClass;
   }
   ctorMethod.prototype = baseClass.prototype;
   derivedClass.prototype = new ctorMethod();
   derivedClass.__super__ = baseClass.prototype;
   return derivedClass;
  },
  ownProperty = {}.hasOwnProperty;

 /* Main SocialConnector class, extends UtilityToolkit */
 SocialConnector = (function(BaseUtilities) {
  inheritFrom(SocialConnector, BaseUtilities);

  function SocialConnector(mainElement, initOptions) {
   this.mainElement = mainElement;
   this.domElements = {
    header: document.getElementsByTagName('head')[0],
    bodyTag: document.getElementsByTagName('body')[0]
   };
   this.configuration = {
    active_platforms: 0,
    connection_protocol: ['http', 'https'].indexOf(window.location.href.split(':')[0]) === -1 ? 'https://' : '//',
    current_uri: window.location.href,
    item_label: null,
    item_heading: this.getDefaultHeading(),
    item_image: this.getDefaultImage(),
    item_description: this.getDefaultDescription(),
    interface_settings: {
     animation_direction: 'top center',
     button_caption: 'Share',
     button_text_font: true,
     icon_font_enabled: true
    },
    socialPlatforms: {
     googlePlus: {
      is_active: true,
      platform_uri: null
     },
     tweeter: {
      is_active: true,
      platform_uri: null,
      platform_description: null
     },
     faceBook: {
      is_active: true,
      load_sdk: true,
      platform_uri: null,
      application_id: null,
      platform_heading: null,
      platform_caption: null,
      platform_description: null,
      platform_image: null
     },
     pinterest: {
      is_active: true,
      platform_uri: null,
      platform_image: null,
      platform_description: null
     },
     electronicMail: {
      is_active: true,
      platform_heading: null,
      platform_description: null
     }
    }
   };
   this.initialize(this.mainElement, initOptions);
   return this;
  }

  SocialConnector.prototype.initialize = function(domElement, moduleOptions) {
   var loopVar, idx, moduleInstance, moduleInstances, listLength;
   moduleInstances = document.querySelectorAll(domElement);
   this.mergeObjects(this.configuration, moduleOptions, true);
   this.applyGlobalSettings();
   this.adjustPlatformSettings();
   if (this.configuration.interface_settings.icon_font_enabled) {
    this.addIconStyles();
   }
   if (this.configuration.interface_settings.button_text_font) {
    this.addFontStyles();
   }
   if (this.configuration.socialPlatforms.faceBook.is_active && this.configuration.socialPlatforms.faceBook.load_sdk) {
    this.addFacebookSDK();
   }
   for (idx = loopVar = 0, listLength = moduleInstances.length; loopVar < listLength; idx = ++loopVar) {
    moduleInstance = moduleInstances[idx];
    this.prepareModuleInstance(domElement, idx);
   }
  };

  SocialConnector.prototype.prepareModuleInstance = function(targetElement, instanceIndex) {
   var selfRef, actionButton, loopVar, currentInstance, toggleLabel, arrayLength, platform, platformList, operationResults;
   currentInstance = document.querySelectorAll(targetElement)[instanceIndex];
   this.concealElement(currentInstance);
   this.addCssClass(currentInstance, "socializer-" + instanceIndex);
   currentInstance = document.querySelectorAll(targetElement)[instanceIndex];
   this.addInstanceStyles(currentInstance);
   this.addInstanceHTML(currentInstance);
   this.revealElement(currentInstance);
   toggleLabel = currentInstance.getElementsByTagName("label")[0];
   actionButton = currentInstance.getElementsByClassName("social")[0];
   platformList = currentInstance.getElementsByTagName('li');
   this.addCssClass(actionButton, "networks-" + this.configuration.active_platforms);
   toggleLabel.addEventListener("click", (function(selfRef) {
    return function() {
     return selfRef.handleToggleAction(actionButton);
    };
   })(this));
   selfRef = this;
   operationResults = [];
   for (idx = loopVar = 0, arrayLength = platformList.length; loopVar < arrayLength; idx = ++loopVar) {
    platform = platformList[idx];
    operationResults.push(platform.addEventListener("click", function() {
     selfRef.handleNetworkEvent(currentInstance, this);
     return selfRef.handleCloseAction(actionButton);
    }));
   }
   return operationResults;
  };

  SocialConnector.prototype.handleToggleAction = function(actionButton) {
   if (this.hasCssClass(actionButton, "active")) {
    return this.handleCloseAction(actionButton);
   } else {
    return this.handleOpenAction(actionButton);
   }
  };

  SocialConnector.prototype.handleOpenAction = function(actionButton) {
   if (this.hasCssClass(actionButton, "load")) {
    this.removeCssClass(actionButton, "load");
   }
   return this.addCssClass(actionButton, "active");
  };

  SocialConnector.prototype.handleCloseAction = function(actionButton) {
   return this.removeCssClass(actionButton, "active");
  };

  SocialConnector.prototype.handleNetworkEvent = function(currentInstance, platform) {
   var platformName;
   platformName = platform.getAttribute("data-network");
   this.executeHook("before", platformName, currentInstance);
   this["shareOn" + platformName.charAt(0).toUpperCase() + platformName.slice(1).replace(/_(\w)/g, (match, char) => char.toUpperCase())]();
   return this.executeHook("after", platformName, currentInstance);
  };

  SocialConnector.prototype.initiateOpen = function() {
   return this.triggerPublicAction("open");
  };

  SocialConnector.prototype.initiateClose = function() {
   return this.triggerPublicAction("close");
  };

  SocialConnector.prototype.initiateToggle = function() {
   return this.triggerPublicAction("toggle");
  };

  SocialConnector.prototype.triggerPublicAction = function(actionType) {
   var actionButton, loopVar, idx, currentInstance, listRef, operationResults;
   listRef = document.querySelectorAll(this.mainElement);
   operationResults = [];
   for (idx = loopVar = 0, listLength = listRef.length; loopVar < listLength; idx = ++loopVar) {
    currentInstance = listRef[idx];
    actionButton = currentInstance.getElementsByClassName("social")[0];
    operationResults.push(this["handle" + actionType.charAt(0).toUpperCase() + actionType.slice(1) + "Action"](actionButton));
   }
   return operationResults;
  };

  SocialConnector.prototype.shareOnFacebook = function() {
   if (this.configuration.socialPlatforms.faceBook.load_sdk) {
    if (!window.FB) {
     return console.error("The FaceBook JS SDK hasn't loaded yet.");
    }
    return FB.ui({
     method: 'feed',
     name: this.configuration.socialPlatforms.faceBook.platform_heading,
     link: this.configuration.socialPlatforms.faceBook.platform_uri,
     picture: this.configuration.socialPlatforms.faceBook.platform_image,
     caption: this.configuration.socialPlatforms.faceBook.platform_caption,
     description: this.configuration.socialPlatforms.faceBook.platform_description
    });
   } else {
    return this.spawnPopup('https://www.facebook.com/sharer/sharer.php', {
     u: this.configuration.socialPlatforms.faceBook.platform_uri
    });
   }
  };

  SocialConnector.prototype.shareOnTwitter = function() {
   return this.spawnPopup('https://twitter.com/intent/tweet', {
    text: this.configuration.socialPlatforms.tweeter.platform_description,
    url: this.configuration.socialPlatforms.tweeter.platform_uri
   });
  };

  SocialConnector.prototype.shareOnGooglePlus = function() {
   return this.spawnPopup('https://plus.google.com/share', {
    url: this.configuration.socialPlatforms.googlePlus.platform_uri
   });
  };

  SocialConnector.prototype.shareOnPinterest = function() {
   return this.spawnPopup('https://www.pinterest.com/pin/create/button', {
    url: this.configuration.socialPlatforms.pinterest.platform_uri,
    media: this.configuration.socialPlatforms.pinterest.platform_image,
    description: this.configuration.socialPlatforms.pinterest.platform_description
   });
  };

  SocialConnector.prototype.shareOnElectronicMail = function() {
   return this.spawnPopup('mailto:', {
    subject: this.configuration.socialPlatforms.electronicMail.platform_heading,
    body: this.configuration.socialPlatforms.electronicMail.platform_description
   });
  };

  SocialConnector.prototype.addIconStyles = function() {
   return this.addExternalStylesheet("https://www.sharebutton.co/fonts/v2/entypo.min.css");
  };

  SocialConnector.prototype.addFontStyles = function() {
   return this.addExternalStylesheet("https://fonts.googleapis.com/css?family=Lato:900&text=" + this.configuration.interface_settings.button_caption);
  };

  SocialConnector.prototype.addExternalStylesheet = function(stylesheetUrl) {
   var styleLink;
   if (!this.domElements.header.querySelector("link[href=\"" + stylesheetUrl + "\"]")) {
    styleLink = document.createElement("link");
    styleLink.setAttribute("rel", "stylesheet");
    styleLink.setAttribute("href", stylesheetUrl);
    return this.domElements.header.appendChild(styleLink);
   }
  };

  SocialConnector.prototype.addInstanceStyles = function(currentInstance) {
   var cssText, metaTag, identifier, styleBlock;
   identifier = "." + (currentInstance.getAttribute('class').split(" ").join("."));
   if (!this.domElements.header.querySelector("meta[name='socializer" + identifier + "']")) {
    this.configuration.identifier = identifier;
    cssText = computeVisuals(this.configuration);
    styleBlock = document.createElement("style");
    styleBlock.type = "text/css";
    if (styleBlock.styleSheet) {
     styleBlock.styleSheet.cssText = cssText;
    } else {
     styleBlock.appendChild(document.createTextNode(cssText));
    }
    this.domElements.header.appendChild(styleBlock);
    delete this.configuration.identifier;
    metaTag = document.createElement("meta");
    metaTag.setAttribute("name", "socializer" + identifier);
    return this.domElements.header.appendChild(metaTag);
   }
  };

  SocialConnector.prototype.addInstanceHTML = function(currentInstance) {
   return currentInstance.innerHTML = "<label class='entypo-export'><span>" + this.configuration.interface_settings.button_caption +
    "</span></label><div class='social load " + this.configuration.interface_settings.animation_direction +
    "'><ul><li class='entypo-pinterest' data-network='pinteres't></li><li class='entypo-twitter' data-network='tweeter'>" +
    "</li><li class='entypo-facebook' data-network='faceBook'></li><li class='entypo-gplus' data-network='googlePlus'>" +
    "</li><li class='entypo-paper-plane' data-network='electronicMail'></li></ul></div>";
  };

  SocialConnector.prototype.addFacebookSDK = function() {
   var fbRootDiv, sdkScript;
   if (!window.FB && this.configuration.socialPlatforms.faceBook.application_id && !this.domElements.bodyTag.querySelector('#fb-root')) {
    sdkScript = document.createElement("script");
    sdkScript.text = "window.fbAsyncInit=function(){FB.init({appId:'" + this.configuration.socialPlatforms.faceBook.application_id +
     "',status:true,xfbml:true})};(function(e,t,n){var r,i=e.getElementsByTagName(t)[0];if(e.getElementById(n)){return}" +
     "r=e.createElement(t);r.id=n;r.src='" + this.configuration.connection_protocol +
     "connect.facebook.net/en_US/all.js';i.parentNode.insertBefore(r,i)})(document,'script','facebook-jssdk')";
    fbRootDiv = document.createElement("div");
    fbRootDiv.id = "fb-root";
    this.domElements.bodyTag.appendChild(fbRootDiv);
    return this.domElements.bodyTag.appendChild(sdkScript);
   }
  };

  SocialConnector.prototype.executeHook = function(hookType, platformName, currentInstance) {
   var callbackFunc, returnedOptions;
   callbackFunc = this.configuration.socialPlatforms[platformName][hookType];
   if (typeof callbackFunc === "function") {
    returnedOptions = callbackFunc.call(this.configuration.socialPlatforms[platformName], currentInstance);
    if (returnedOptions !== void 0) {
     returnedOptions = this.filterConfigurationUpdates(returnedOptions);
     this.mergeObjects(this.configuration.socialPlatforms[platformName], returnedOptions, true);
     this.adjustPlatformSettings();
    }
   }
  };

  SocialConnector.prototype.getDefaultHeading = function() {
   var contentElement;
   if (contentElement = document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="twitter:title"]')) {
    return contentElement.getAttribute('content');
   } else if (contentElement = document.querySelector('title')) {
    return contentElement.innerText;
   }
  };

  SocialConnector.prototype.getDefaultImage = function() {
   var contentElement;
   if (contentElement = document.querySelector('meta[property="og:image"]') || document.querySelector('meta[name="twitter:image"]')) {
    return contentElement.getAttribute('content');
   }
  };

  SocialConnector.prototype.getDefaultDescription = function() {
   var contentElement;
   if (contentElement = document.querySelector('meta[property="og:description"]') || document.querySelector('meta[name="twitter:description"]') || document.querySelector('meta[name="description"]')) {
    return contentElement.getAttribute('content');
   } else {
    return '';
   }
  };

  SocialConnector.prototype.applyGlobalSettings = function() {
   var visibility, platformName, optionKey, optionValue, platformRef, operationResults;
   platformRef = this.configuration.socialPlatforms;
   operationResults = [];
   for (platformName in platformRef) {
    optionValue = platformRef[platformName];
    for (optionKey in optionValue) {
     if (this.configuration.socialPlatforms[platformName][optionKey] == null) {
      this.configuration.socialPlatforms[platformName][optionKey] = this.configuration[optionKey];
     }
    }
    if (this.configuration.socialPlatforms[platformName].is_active) {
     visibility = 'block';
     this.configuration.active_platforms += 1;
    } else {
     visibility = 'none';
    }
    operationResults.push(this.configuration.socialPlatforms[platformName].visibility = visibility);
   }
   return operationResults;
  };

  SocialConnector.prototype.adjustPlatformSettings = function() {
   if (!this.configuration.socialPlatforms.faceBook.application_id) {
    this.configuration.socialPlatforms.faceBook.load_sdk = false;
   }
   if (!this.isUriEncoded(this.configuration.socialPlatforms.tweeter.platform_description)) {
    this.configuration.socialPlatforms.tweeter.platform_description = encodeURIComponent(this.configuration.socialPlatforms.tweeter.platform_description);
   }
   if (typeof this.configuration.socialPlatforms.faceBook.application_id === 'number') {
    return this.configuration.socialPlatforms.faceBook.application_id = this.configuration.socialPlatforms.faceBook.application_id.toString();
   }
  };

  SocialConnector.prototype.filterConfigurationUpdates = function(newOptions) {
   if (this.configuration.socialPlatforms.faceBook.application_id !== newOptions.application_id) {
    console.warn("You are unable to change the FaceBook application_id after the button has been initialized. Please update your FaceBook filters accordingly.");
    delete newOptions.application_id;
   }
   if (this.configuration.socialPlatforms.faceBook.load_sdk !== newOptions.load_sdk) {
    console.warn("You are unable to change the FaceBook load_sdk option after the button has been initialized. Please update your FaceBook filters accordingly.");
    delete newOptions.application_id; /* Note: Original code had a bug here, deleting app_id instead of load_sdk. Replicated for Type II clone. */
   }
   return newOptions;
  };

  return SocialConnector;

 })(UtilityToolkit);
 return SocialConnector;
});