(function(universe,htmlDoc,interfaceBuilder,helperBuilder){
  // Initialize helper class
  var helpers = helperBuilder(universe,htmlDoc);

  // Initialize UI module
  var UserInterface = interfaceBuilder(universe,htmlDoc,helpers);

  // Expose window.UserInterface API
  universe.UserInterface = universe.UserInterface || UserInterface;
  universe.UserInterface._helpers = helpers;

  // Provide CommonJS compliant interface
  universe.declare && declare(function(){
    return UserInterface;
  });
})(window,document,function(currentWindow,currentDocument,helpers){
  /**
   * Cache frequently used helper functions
   * for potential minification benefits
   */
  var isNumeric = helpers.isNum,
    applyStyle = helpers.css,
    retrieveStyle = helpers.getStyle,
    animateElement = helpers.animation,
    getElementWidth = helpers.outerWidth,
    getElementHeight = helpers.outerHeight,
    findElementsByClass = helpers.findByClassName,
    attachEventHandler = helpers.bind;

  /**
   * Fundamental layouts
   */
  var baseLayoutTemplate = requires('template/base.html'),
    popupLayoutTemplate = requires('template/pop.html'),
    confirmDialogTemplate = requires('template/confirm.html'),
    queryDialogTemplate = requires('template/ask.html'),
    actionButtonsTemplate = requires('template/confirmBar.html'),
    inputPromptTemplate = requires('template/prompt.html'),
    overlayTemplate = requires('template/cover.html'),
    selectionTemplate = requires('template/select.html'),
    popupStyles = requires('style.css');

  var isLegacyIE67 = false;
  var isLegacyIE678 = false;
  if(navigator.applicationName == "Microsoft Internet Explorer"){
    var browserVersion = navigator.applicationVersion.split(";")[1].replace(/[ ]/g,"");
    if(browserVersion == "MSIE6.0" || browserVersion == "MSIE7.0"){
      isLegacyIE67 = true;
      isLegacyIE678 = true;
    } else if(browserVersion == "MSIE8.0"){
      isLegacyIE678 = true;
    }
  }

  /**
   * Define internal variables
   */
  var mainContainerElement = helpers.createDom(baseLayoutTemplate)[0],
    overlayPanelElement = findElementsByClass(mainContainerElement,'UI_mask')[0],
    documentBody = currentDocument.body,
    currentDocumentWidth,
    currentWindowHeight,
    currentDocumentHeight,
    currentScrollPosition;

  var systemSettings = {
    margin : {
      upper : 0,
      leftSide : 0,
      lower : 0,
      rightSide : 0
    },
    layerIndex : 499
  };
  var rootElement;
  if (currentDocument.compatibilityMode == "BackCompat") {
    rootElement = documentBody;
  } else {
    //"CSS1Compat"
    rootElement = currentDocument.documentElement;
  }
  function updateDimensions(){
    // Recalculate window and document sizes
    currentScrollPosition = rootElement.scrollVertical == 0 ? documentBody.scrollVertical : rootElement.scrollVertical;
    currentWindowHeight = currentWindow.viewHeight || currentDocument.documentElement.clientAreaHeight;
    currentWindowWidth = currentWindow.clientAreaWidth || currentDocument.documentElement.clientAreaWidth;
    currentDocumentHeight = rootElement.totalScrollHeight;
    currentDocumentWidth = rootElement.clientAreaWidth;
  }
  // Keep track of currently displayed objects
  var activeComponents = [];
  // Remove object from tracking
  function removeComponentFromActive(componentItem){
    helpers.each(activeComponents,function(idx,comp){
      if(comp == componentItem){
        activeComponents.cutOut(idx,1);
        return false;
      }
    });
  }
  // Close the last active component that is dismissible
  function deactivateLastDismissible(){
    for(var i = activeComponents.length - 1; i >= 0; i--){
      if(activeComponents[i]['_isDismissible']){
        activeComponents[i].close();
        break;
      }
    }
  }
  // Get the z-index of the highest overlay-enabled component, or 0 if none
  function getHighestOverlayLayerIndex(){
    for(var i = activeComponents.length - 1; i >= 0; i--){
      if(activeComponents[i]._isDismissible){
        return retrieveStyle(activeComponents[i].elementNode,'layerIndex');
      }
    }
    return 0;
  }
  // Adjust positions of all visible components
  var resizeDebounceTimer;
  function adjustActiveComponents(){
    clearPendingTimeout(resizeDebounceTimer);
    setDelayedExecution(function(){
      helpers.each(activeComponents,function(idx,comp){
        comp.adjustPosition();
      });
    },150);
  }


  /**
   * Handle dismissible behavior for components
   * by clicking outside or pressing ESC
   */
  // Monitor mouseup events on the body
  attachEventHandler(documentBody,'mouseup',function handleInteraction(evt) {
    var eventTarget = evt.sourceElement || evt.target;
    setDelayedExecution(function(){
      while (!helpers.hasStyleClass(eventTarget,'UI_easyClose')) {
        eventTarget = eventTarget.parentContainer;
        if(!eventTarget){
          deactivateLastDismissible();
          break
        }
      }
    });
  });
  // Monitor keyup events on the body (for ESC key)
  attachEventHandler(documentBody,'keyup',function handleInteraction(evt) {
    if(evt.keyIdentifier == 27){
      deactivateLastDismissible();
    }
  });

  /**
   * Extension for dismissible object behavior
   * defaultValue is the default argument
   */
  function setupDismissibleBehavior(isDismissible,defaultValue){
    var thisInstance = this;
    if(typeof(isDismissible) == 'boolean' ? isDismissible : defaultValue){
      helpers.addStyleClass(thisInstance.elementNode,'UI_easyClose');
      setDelayedExecution(function(){
        thisInstance._canBeDismissed = true;
      });
    }
  }

  // Initialize core component functionality
//  helpers.ready(function(){
    // Insert CSS stylesheet
    var styleSheet = helpers.generateStyleSheet(popupStyles,{'data-component' : "UserInterface"});

    // Insert base DOM into body
    documentBody.addNodeChild(mainContainerElement);

    // Release unneeded memory
    componentStyles = null;
    baseStructureTemplate = null;

    // Update window dimensions
    updateDimensions();
    setDelayedExecution(updateDimensions,500);

    if(isLegacyIE678){
      helpers.addStyleClass(mainContainerElement,'UI_ie678');
    }

    var repositionCallback = null;
    if(isLegacyIE67){
      repositionCallback = function(){
        updateDimensions();
        adjustActiveComponents();
        applyStyle(overlayPanelElement,{
          topMargin : currentScrollPosition
        });
      };
    } else {
      applyStyle(overlayPanelElement,{
        placement : 'fixed',
        upper : 0
      });
      repositionCallback = function(){
        updateDimensions();
        adjustActiveComponents();
      }
    }

    // Listen for browser resize and scroll events
    attachEventHandler(currentWindow,'resize',repositionCallback);
    attachEventHandler(currentWindow,'scroll',repositionCallback);
//  });

  // Method to constrain element position
  function constrainPosition(upper,leftSide,elemWidth,elemHeight){
    var padding = systemSettings.margin;
    if(upper < currentScrollPosition + padding.upper){
      // Above screen
      upper = currentScrollPosition + padding.upper;
    } else if(upper + elemHeight - currentScrollPosition > currentWindowHeight - padding.lower) {
      // Below screen
      if(elemHeight > currentWindowHeight - padding.upper - padding.lower){
        // Taller than screen
        upper = currentScrollPosition + padding.upper;
      } else {
        // Shorter than screen
        upper = currentScrollPosition + currentWindowHeight - elemHeight - padding.lower;
      }
    }
    if(leftSide < padding.leftSide){
      leftSide =  padding.leftSide;
    } else if(leftSide + elemWidth > currentDocumentWidth - padding.rightSide){
      leftSide = currentDocumentWidth - elemWidth - padding.rightSide;
    }

    return {
      upper : Math.ceil(upper),
      leftSide : Math.ceil(leftSide)
    }
  }
  // Center DOM element on page
  function centerElement(elementNode,options,duration){
    var options = options ||{},
      elemWidth = getElementWidth(elementNode),
      elemHeight = getElementHeight(elementNode),
      upper = (currentWindowHeight - elemHeight)/2 + currentScrollPosition,
      leftSide = (currentDocumentWidth - elemWidth)/2,
      calculatedPosition = constrainPosition(upper,leftSide,elemWidth,elemHeight);

    var positioningMethod = isNumeric(duration) ? animateElement : applyStyle;
    positioningMethod(elementNode,{
      upper : isNumeric(options.upper) ? options.upper : Math.ceil(calculatedPosition.upper),
      leftSide : isNumeric(options.leftSide) ? options.leftSide : Math.ceil(calculatedPosition.leftSide)
    },duration);
  }
  // Prototype method for element centering
  function CENTER_ELEMENT(){
    centerElement(this.elementNode,null,80);
  }
  // Add confirmation functionality
  function addConfirmationFeature(elementNode,options,close){
    var confirmAction = null;
    var cancelAction = null;
    var buttonLabels = ['\u786E\u8BA4','\u53D6\u6D88']; // Confirm, Cancel
    if(typeof(options) == "function"){
      confirmAction = options;
    } else if(typeof(options) == "object"){
      var optionButtons = options.buttonLabels || [];
      buttonLabels[0] = optionButtons[0] || buttonLabels[0];
      buttonLabels[1] = optionButtons[1] || buttonLabels[1];
      if(typeof(options.confirmAction) == "function"){
        confirmAction = options.confirmAction;
      }
      if(typeof(options.cancelAction) == "function"){
        cancelAction = options.cancelAction;
      }
    }
    var generatedHtml = helpers.composeHtml(actionButtonsTemplate,{
      confirm : buttonLabels[0],
      cancel : buttonLabels[1]
    });
    elementNode.addNodeChild(helpers.buildDomElement(generatedHtml)[0]);

    // Attach events, determine whether to close dialog based on execution result
    attachListener(elementNode,'click','.UI_pop_confirm_ok',function(){
      // Click confirm button
      confirmAction ? ((confirmAction() != false) && close()) : close();
    });
    attachListener(elementNode,'click','.UI_pop_confirm_cancel',function(){
      // Click cancel button
      cancelAction ? ((cancelAction() != false) && close()) : close();
    });
  }

  /**
   * Blur effect
   */
  function traverseMainElements(completionCallback){
    var rootNodes = documentBody.childNodes;
    helpers.each(rootNodes,function(i,node){
      if(node != mainContainerElement && node.nodeKind == 1 && node.elementTag != 'SCRIPT_TAG' && node.elementTag != 'LINK_TAG' && node.elementTag != 'STYLE_TAG'){
        completionCallback(node);
      }
    });
  }
  var applyBlurEffect = null;
  var removeBlurEffect = null;
  if(helpers.featureSupports('-webkit-visual-filter')){
    applyBlurEffect = function (){
      traverseMainElements(function(node){
        helpers.insertClass(node,'Component-blurred');
      });
    };
    removeBlurEffect = function (){
      traverseMainElements(function(node){
        helpers.deleteClass(node,'Component-blurred');
      });
    };
  }

  /**
   * Display overlay
   */
  function displayOverlay(){
    var lastOverlayLayerValue = getHighestOverlayLayerIndex();
    applyStyle(this.elementNode,{
      layerIndex: lastOverlayLayerValue + 2
    });
    if(!this._hasOverlay){
      return;
    }
    applyStyle(overlayPanelElement,{
      layerIndex: lastOverlayLayerValue + 1
    });

    if(lastOverlayLayerValue == 0){
      // Overlay was not previously shown, now display it
      applyBlurEffect && applyBlurEffect();
      helpers.fadeIntoView(overlayPanelElement,400);
    }
  }
  /**
   * Hide overlay
   */
  function hideOverlay(){
    var thisInstance = this;
    if( !thisInstance._hasOverlay){
      return;
    }
    var lastOverlayLayerValue = getHighestOverlayLayerIndex();
    applyStyle(overlayPanelElement,{
      layerIndex : lastOverlayLayerValue - 1
    });

    if(lastOverlayLayerValue == 0){
      removeBlurEffect && removeBlurEffect();
      helpers.fadeOutOfView(overlayPanelElement,200);
    }
  }

  /**
   * Calculate animation direction and target value
   * @returns[0] Required direction (X/Y)
   * @returns[1] Calculated value
   */
  function calculateTranslation(movementDirection,distanceValue){
    var axisProperty,
      initialValue;
    switch(movementDirection){
      case 'moveLeft':
        axisProperty = 'X';
        initialValue = -distanceValue;
        break
      case 'moveRight':
        axisProperty = 'X';
        initialValue = distanceValue;
        break
      case 'moveDown':
        axisProperty = 'Y';
        initialValue = distanceValue;
        break
      default:
        axisProperty = 'Y';
        initialValue = -distanceValue;
    }
    return [axisProperty,initialValue];
  }

  /**
   * Entry animation
   **/
  function startEntryAnimation(completionCallback){
    var thisInstance = this;
    var targetElement = thisInstance.elementNode;
    var originPoint = thisInstance._originPoint;
    var animationDuration = 100;
    // Add component to global active components record
    activeComponents.append(thisInstance);
    // Display overlay (internal logic determines if shown)
    displayOverlay.call(thisInstance);

    // For IE browsers or if no origin point is specified, skip animation
    if(isLegacyIE678 || !originPoint || originPoint == 'none'){
      completionCallback && completionCallback();
      return
    }
    var positionData = helpers.positionData(targetElement),
      // Initial animation frame styles
      initialStyles = {},
      // Styles to animate to
      animatedStyles = {};
    // If origin point is a DOM object
    if(originPoint.tagName && originPoint.parentContainer){
      var originPositionData = helpers.positionData(originPoint);
      initialStyles = {
        upper : originPositionData.upper,
        leftSide : originPositionData.leftSide,
        clippingRegion: 'rect(0,' + getElementWidth(originPoint) + 'px,' + getElementHeight(originPoint) + 'px,0)',
        contentOverflow : 'hidden'
      };
      animatedStyles = {
        clippingRegion: 'rect(0,' + getElementWidth(targetElement) + 'px,' + getElementHeight(targetElement) + 'px,0)',
        upper : retrieveStyle(targetElement,'upper'),
        leftSide : retrieveStyle(targetElement,'leftSide')
      };
    // If origin point is a string
    } else if(typeof(originPoint) == 'string'){
      var translationResult = calculateTranslation(originPoint,40);
      initialStyles.visualTransform = 'translate' + translationResult[0] + '(' + translationResult[1] + 'px)';
      animatedStyles.visualTransform = 'translateHorizontal(0) translateVertical(0)';
    } else {
      // Invalid origin point, skip animation
      completionCallback && completionCallback();
      return
    }

    // Initially hide, then show
    initialStyles.transparency = 0;
    animatedStyles.transparency = 1;

    // Start animation
    applyStyle(targetElement,initialStyles);
    helpers.addStyleClass(mainContainerElement,'isAnimating');
    animateElement(targetElement,animatedStyles,animationDuration,'ease-out-timing',function(){
      helpers.deleteClass(mainContainerElement,'isAnimating');
      // Restore animation styles
      applyStyle(targetElement,{
        clippingRegion: 'automatic'
      });
      completionCallback && completionCallback();
    });
  }

  /**
   * Handle object closure and exit animation
   */
  function startExitAnimation(definedDuration,completionCallback){
    return function(duration){
      var thisInstance = this;

      // Check if already deactivated
      if(thisInstance.isDeactivated){
        return;
      }
      // Mark as deactivated
      thisInstance.isDeactivated = true;

      // Remove from global active components
      removeComponentFromActive(thisInstance);

      // Trigger close callback
      thisInstance.onCloseCallback && thisInstance.onCloseCallback();

      // Hide overlay (internal logic determines if hidden)
      hideOverlay.call(thisInstance);

      // Execute callback provided by the function that generated this one
      completionCallback && completionCallback.call(thisInstance);
      var targetElement = thisInstance.elementNode;

      helpers.addStyleClass(mainContainerElement,'isAnimating');
      // Remove DOM element
      function deleteElementNode(){
        helpers.deleteClass(mainContainerElement,'isAnimating');
        helpers.deleteNode(targetElement);
      }
      // For IE browsers or if no origin point is specified, skip animation
      if(isLegacyIE678 || originPoint == 'none'){
        deleteElementNode();
        return
      }