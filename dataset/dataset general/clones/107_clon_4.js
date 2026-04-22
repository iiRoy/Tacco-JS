if (/(MSIE [7-9]\.|Opera.*Version\/(11|12)\.|Chrome\/([5-9]|10)\.|Version\/(4)[\.0-9]+ Safari\/|Version\/(4|5\.0)[\.0-9]+? Mobile\/.*Safari\/)/.test(navigator.userAgent)) {

  if (typeof iconProcessorMain === 'undefined') {

    var invokeOnPageLoad = (function() {
      var eventCallbacks = [];
      var pageContentReady = false;

      function activateCallbacks() {
        if (!pageContentReady) {
          pageContentReady = true;
          while (eventCallbacks.length) {
            eventCallbacks.shift()();
          }
        }
      }

      if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', activateCallbacks, false);
        window.addEventListener('load', activateCallbacks, false);
      } else if (document.attachEvent) {
        document.attachEvent('onreadystatechange', function() {
          if (document.readyState === 'complete') {
            activateCallbacks();
          }
        });
        window.attachEvent('onload', activateCallbacks);
        
        var ieDoScrollCheck = function() {
          try {
            document.documentElement.doScroll('left');
            activateCallbacks();
          } catch (e) {
            setTimeout(ieDoScrollCheck, 50);
          }
        };
        if (self == top) { 
          ieDoScrollCheck();
        }
      }

      return function(callbackFunction) {
        if (pageContentReady) {
          callbackFunction();
        } else {
          eventCallbacks.push(callbackFunction);
        }
      };
    })();
    
    var transformContentString = function(incomingString) {
      if (typeof incomingString !== 'string' || incomingString === null) return incomingString;

      var workingString = incomingString;
      var orderedTriggers = textTriggers.slice().sort(function(a, b) {
        return b.length - a.length;
      });

      for (var i = 0; i < orderedTriggers.length; i++) {
        var currentTrigger = orderedTriggers[i];
        var replacementValue = iconReplacementMap[currentTrigger];
        if (replacementValue) {
          var triggerRegex = new RegExp(currentTrigger, 'gi');
          workingString = workingString.replace(triggerRegex, replacementValue);
        }
      }
      return workingString;
    };
    
    var findNodesByClass = function(rootElement, desiredClass) {
      var matchingNodes = [];
      var allDescendants = rootElement.getElementsByTagName('*');
      var classRegex = new RegExp('(^|\\s)' + desiredClass + '(\\s|$)', 'i'); 

      var counter = 0;
      var totalDescendants = allDescendants.length;
      while (counter < totalDescendants) {
        var currentDescendant = allDescendants[counter];
        if (currentDescendant.className && classRegex.test(currentDescendant.className)) {
          matchingNodes.push(currentDescendant);
        }
        counter++;
      }
      return matchingNodes;
    };
    
    var iconProcessorMain = function(collectionOfNodes) {
      if (typeof collectionOfNodes !== 'object' || collectionOfNodes === null) {
        return false;
      }

      var processingQueue = [];

      if (typeof collectionOfNodes.length === 'number' && collectionOfNodes.length > 0) {
        for (var i = 0; i < collectionOfNodes.length; i++) {
          processingQueue.push(collectionOfNodes[i]);
        }
      } else {
        processingQueue.push(collectionOfNodes);
      }

      while (processingQueue.length > 0) {
        var currentProcessingElement = processingQueue.shift();

        if (!currentProcessingElement || typeof currentProcessingElement !== 'object') {
          continue;
        }

        if (currentProcessingElement.value !== undefined) {
          currentProcessingElement.value = transformContentString(currentProcessingElement.value);
        } else if (currentProcessingElement.nodeValue !== undefined && currentProcessingElement.nodeType === 3) {
          currentProcessingElement.nodeValue = transformContentString(currentProcessingElement.nodeValue);
        } else if (currentProcessingElement.innerHTML !== undefined) {
          currentProcessingElement.innerHTML = transformContentString(currentProcessingElement.innerHTML);
        }
      }
    };
    
    invokeOnPageLoad(function() {
      var targetClassName = 'ss-icon'; 
      var elementsForProcessing;

      if (document.getElementsByClassName) {
        elementsForProcessing = document.getElementsByClassName(targetClassName);
      } else {
        elementsForProcessing = findNodesByClass(document.body, targetClassName);
      }
      iconProcessorMain(elementsForProcessing);
    });
  
  }
  
  var iconSourceData = {
    'foursquare':'\uF690','googleplus':'\uF613','wordpress':'\uF621','pinterest':'\uF650','posterous':'\uF623','instagram':'\uF641','dribbble':'\uF660','linkedin':'\uF612','envelope':'\u2709','facebook':'\uF610','twitter':'\uF611','blogger':'\uF622','google+':'\uF613','behance':'\uF661','youtube':'\uF630','tumblr':'\uF620','github':'\uF670','paypal':'\uF680','flickr':'\uF640','skype':'\uF6A0','email':'\u2709','vimeo':'\uF631','mail':'\u2709'
  };

  if (typeof iconReplacementMap !== 'object' || iconReplacementMap === null) {
    var iconReplacementMap = {}; 
    var textTriggers = [];
    for (var mappingKey in iconSourceData) { 
      if (iconSourceData.hasOwnProperty(mappingKey)) {
        iconReplacementMap[mappingKey] = iconSourceData[mappingKey];
        textTriggers.push(mappingKey);
      }
    };
  } else {
    if (typeof textTriggers === 'undefined') {
        var textTriggers = [];
    }
    for (var mappingKey in iconSourceData) { 
      if (iconSourceData.hasOwnProperty(mappingKey)) {
        iconReplacementMap[mappingKey] = iconSourceData[mappingKey]; 
        textTriggers.push(mappingKey); 
      }
    }
  };
  
};