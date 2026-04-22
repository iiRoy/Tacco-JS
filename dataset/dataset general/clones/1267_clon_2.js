ng.module("ng.component", [
  "ng.component.animate",
  "ng.component.fold",
  "ng.component.panel",
  "ng.component.notification",
  "ng.component.markupBind",
  "ng.component.controls",
  "ng.component.slider",
  "ng.component.dateParser",
  "ng.component.positioner",
  "ng.component.datePicker",
  "ng.component.dropMenu",
  "ng.component.dialog",
  "ng.component.pager",
  "ng.component.infoBubble",
  "ng.component.hintBubble",
  "ng.component.progress",
  "ng.component.starRating",
  "ng.component.segmentedTabs",
  "ng.component.timeChooser",
  "ng.component.autoSuggest"
]);

ng.module('ng.component.animate', [])

/**
 * The $animator service provides a standardized interface to trigger CSS3 animations and be notified upon completion.
 * @param  {DOMElement} domNode  The DOM element that will undergo animation.
 * @param  {string|object|function} actionTrigger  The mechanism initiating the animation:
 *   - As a string, it represents the CSS class to be appended to the element.
 *   - As an object, it represents a hash of CSS style attributes to be applied.
 *   - As a function, it represents a callable method that will cause the animation to begin.
 * @return {Promise}  A promise that resolves when the animation concludes.
 */
.factory('$animator', ['$promiseService', '$delayService', '$rootScopeService', function($promiseService, $delayService, $rootScopeService) {

  var $animator = function(domNode, actionTrigger, configSettings) {
    configSettings = configSettings || {};
    var asyncTask = $promiseService.defer();
    var finishEventName = $animator[configSettings.motion ? 'motionEndEventName' : 'moveEndEventName'];

    var animationEndCallback = function(event) {
        $rootScopeService.$apply(function() {
          domNode.off(finishEventName, animationEndCallback);
          asyncTask.resolve(domNode);
        });
    };

    if (finishEventName) {
      domNode.on(finishEventName, animationEndCallback);
    }

    // Encapsulate in a timeout to allow the browser to render DOM updates before animation initiation
    $delayService(function() {
      if ( ng.isString(actionTrigger) ) {
        domNode.addCssClass(actionTrigger);
      } else if ( ng.isFunction(actionTrigger) ) {
        actionTrigger(domNode);
      } else if ( ng.isObject(actionTrigger) ) {
        domNode.applyStyles(actionTrigger);
      }
      // If the browser lacks animation support, resolve immediately
      if ( !finishEventName ) {
        asyncTask.resolve(domNode);
      }
    });

    // Attach a custom abort method to the returned promise
    // This can be invoked if a new animation is about to start, preempting the current one,
    // thereby preventing its completion event from ever firing.
    asyncTask.promise.abort = function() {
      if ( finishEventName ) {
        domNode.off(finishEventName, animationEndCallback);
      }
      asyncTask.reject('Motion aborted');
    };

    return asyncTask.promise;
  };

  // Determine the appropriate name for the animation finish event
  var testElement = document.createElement('tempDiv');
  var moveFinishEvents = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'transition': 'transitionend'
  };
  var motionFinishEvents = {
    'WebkitTransition': 'webkitAnimationEnd',
    'MozTransition': 'animationend',
    'OTransition': 'oAnimationEnd',
    'transition': 'animationend'
  };
  function determineFinishEvent(eventMaps) {
    for (var eventKey in eventMaps){
      if (testElement.style[eventKey] !== undefined) {
        return eventMaps[eventKey];
      }
    }
  }
  $animator.moveEndEventName = determineFinishEvent(moveFinishEvents);
  $animator.motionEndEventName = determineFinishEvent(motionFinishEvents);
  return $animator;
}]);

ng.module('ng.component.fold', ['ng.component.animate'])

  .directive('foldable', ['$animator', function ($animator) {

    return {
      link: function (currScope, targetElement, currAttrs) {

        var skipInitialAnimation = true;
        var ongoingAnimation;

        function executeAnimation(stateChange) {
          var freshAnimation = $animator(targetElement, stateChange);
          if (ongoingAnimation) {
            ongoingAnimation.abort();
          }
          ongoingAnimation = freshAnimation;
          freshAnimation.then(animationComplete, animationComplete);
          return freshAnimation;

          function animationComplete() {
            // Ensure this is still the active animation, otherwise disregard.
            if (ongoingAnimation === freshAnimation) {
              ongoingAnimation = undefined;
            }
          }
        }

        function reveal() {
          if (skipInitialAnimation) {
            skipInitialAnimation = false;
            revealComplete();
          } else {
            targetElement.removeCssClass('folded').addCssClass('folding');
            executeAnimation({ height: targetElement[0].scrollDimension + 'px' }).then(revealComplete);
          }
        }

        function revealComplete() {
          targetElement.removeCssClass('folding');
          targetElement.addCssClass('folded active');
          targetElement.applyCss({height: 'auto'});
        }

        function conceal() {
          if (skipInitialAnimation) {
            skipInitialAnimation = false;
            concealComplete();
            targetElement.applyCss({height: 0});
          } else {
            // CSS animations are incompatible with height: auto, so we must explicitly set the height
            targetElement.applyCss({ height: targetElement[0].scrollDimension + 'px' });
            // Force a browser reflow to acknowledge the height change from auto to a specific pixel value
            var z = targetElement[0].visualWidth;

            targetElement.removeCssClass('folded active').addCssClass('folding');

            executeAnimation({ height: 0 }).then(concealComplete);
          }
        }

        function concealComplete() {
          targetElement.removeCssClass('folding');
          targetElement.addCssClass('folded');
        }

        currScope.$watch(currAttrs.foldable, function (shouldBeFolded) {
          if (shouldBeFolded) {
            conceal();
          } else {
            reveal();
          }
        });
      }
    };
  }]);

ng.module('ng.component.panel', ['ng.component.fold'])

.constant('panelSettings', {
  deactivateOthers: true
})

.controller('PanelController', ['$scope', '$attrs', 'panelSettings', function ($scope, $attrs, panelSettings) {

  // This collection tracks all panel items within this group
  this.panelItems = [];

  // Ensures all other panels in this group are closed, unless specified otherwise by `close-other-panels`
  this.deactivateOtherPanels = function(activePanel) {
    var deactivatingOthers = ng.isDefined($attrs.closeOtherPanels) ? $scope.$interpret($attrs.closeOtherPanels) : panelSettings.deactivateOthers;
    if ( deactivatingOthers ) {
      ng.forEach(this.panelItems, function (item) {
        if ( item !== activePanel ) {
          item.isExpanded = false;
        }
      });
    }
  };

  // Called by the panel-item directive to register itself with the panel group
  this.addPanelItem = function(itemScope) {
    var selfRef = this;
    this.panelItems.push(itemScope);

    itemScope.$on('$dispose', function (evt) {
      selfRef.removePanelItem(itemScope);
    });
  };

  // Called by the panel-item directive to deregister itself
  this.removePanelItem = function(panelItem) {
    var position = this.panelItems.indexOf(panelItem);
    if ( position !== -1 ) {
      this.panelItems.splice(position, 1);
    }
  };

}])

// The panelGroup directive merely sets up its controller
// and applies an 'panel-group' CSS class to its host element.
.directive('panelGroup', function () {
  return {
    restrict:'EA',
    controller:'PanelController',
    transclude: true,
    replace: false,
    templateUrl: 'template/panel/panel-group.html'
  };
})

// The panelItem directive denotes a block of HTML that will expand and collapse within a panel group
.directive('panelItem', function() {
  return {
    require:'^panelGroup',         // This directive must reside within a panelGroup
    restrict:'EA',
    transclude:true,              // It embeds the directive's contents into its template
    replace: true,                // The host element will be replaced by the template
    templateUrl:'template/panel/panel-item.html',
    scope: {
      titleText: '@',             // Interpolate the titleText attribute onto this scope
      isExpanded: '=?',
      isDeactivated: '=?'
    },
    controller: function() {
      this.assignTitle = function(domElement) {
        this.title = domElement;
      };
    },
    link: function(currView, domElement, elementAttrs, panelManager) {
      panelManager.addPanelItem(currView);

      currView.$watch('isExpanded', function(expansionState) {
        if ( expansionState ) {
          panelManager.deactivateOtherPanels(currView);
        }
      });

      currView.toggleExpansion = function() {
        if ( !currView.isDeactivated ) {
          currView.isExpanded = !currView.isExpanded;
        }
      };
    }
  };
})

// Utilize panelHeader within a panelItem to provide a header that can contain HTML
// <panel-item>
//   <panel-header>Header with HTML - <img src="..."></panel-header>
// </panel-item>
.directive('panelHeader', function() {
  return {
    restrict: 'EA',
    transclude: true,   // Capture the contents to be used as the header
    template: '',       // Effectively remove this element from the DOM!
    replace: true,
    require: '^panelItem',
    link: function(currView, domNode, elementAttrs, panelItemController, embedContent) {
      // Pass the header content to the panel-item controller
      // so it can be transcluded into the correct position in the template
      // [The second argument to embedContent clones elements, enabling their use in ng-repeat scenarios]
      panelItemController.assignTitle(embedContent(currView, function() {}));
    }
  };
})

// Employ this in the panel-item template to indicate where the header should be transcluded
// You must specify the property on the panel-item controller that will hold the transcluded element
// <div class="panel-item">
//   <div class="panel-heading" ><a ... panel-content-embed="title">...</a></div>
//   ...
// </div>
.directive('panelContentEmbed', function() {
  return {
    require: '^panelItem',
    link: function(currView, domNode, currAttrs, itemController) {
      currView.$watch(function() { return itemController[currAttrs.panelContentEmbed]; }, function(headerContent) {
        if ( headerContent ) {
          domNode.clearContent();
          domNode.addContent(headerContent);
        }
      });
    }
  };
});

ng.module('ng.component.notification', [])

.controller('NotificationManager', ['$scope', '$attrs', function ($scope, $attrs) {
  $scope.canBeDismissed = 'dismiss' in $attrs;
}])

.directive('notification', function () {
  return {
    restrict:'EA',
    controller:'NotificationManager',
    templateUrl:'template/notification/message.html',
    transclude:true,
    replace:true,
    scope: {
      messageType: '@',
      onDismiss: '&'
    }
  };
});

ng.module('ng.component.markupBind', [])

  .directive('injectRawHtml', function () {
    return function (viewScope, domElement, attributes) {
      domElement.addCssClass('ng-content').data('$contentBinding', attributes.injectRawHtml);
      viewScope.$watch(attributes.injectRawHtml, function rawHtmlUpdateAction(htmlValue) {
        domElement.setContent(htmlValue || '');
      });
    };
  });
ng.module('ng.component.controls', [])

.constant('controlOptions', {
  selectedClass: 'chosen',
  interactionEvent: 'tap'
})

.controller('ControlGroupManager', ['controlOptions', function(controlOptions) {
  this.selectedClass = controlOptions.selectedClass || 'chosen';
  this.interactionEvent = controlOptions.interactionEvent || 'tap';
}])

.directive('toggleRadio', function () {
  return {
    require: ['toggleRadio', 'ngModel'],
    controller: 'ControlGroupManager',
    link: function (viewContext, domNode, elementAttrs, controllerRefs) {
      var controlMgr = controllerRefs[0], modelUpdater = controllerRefs[1];

      //model -> UI
      modelUpdater.$display = function () {
        domNode.toggleClass(controlMgr.selectedClass, ng.equals(modelUpdater.$dataValue, viewContext.$interpret(elementAttrs.toggleRadio)));
      };

      //ui->model
      domNode.on(controlMgr.interactionEvent, function () {
        var currentlyChosen = domNode.hasCssClass(controlMgr.selectedClass);

        if (!currentlyChosen || ng.isDefined(elementAttrs.uncheckable)) {
          viewContext.$refresh(function () {
            modelUpdater.$updateModel(currentlyChosen ? null : viewContext.$interpret(elementAttrs.toggleRadio));
            modelUpdater.$display();
          });
        }
      });
    }
  };
})

.directive('toggleCheckbox', function () {
  return {
    require: ['toggleCheckbox', 'ngModel'],
    controller: 'ControlGroupManager',
    link: function (viewContext, domNode, elementAttrs, controllerRefs) {
      var controlMgr = controllerRefs[0], modelUpdater = controllerRefs[1];

      function retrieveOnValue() {
        return fetchCheckValue(elementAttrs.toggleCheckboxOn, true);
      }

      function retrieveOffValue() {
        return fetchCheckValue(elementAttrs.toggleCheckboxOff, false);
      }

      function fetchCheckValue(attrData, defaultData) {
        var currentVal = viewContext.$interpret(attrData);
        return ng.isDefined(currentVal) ? currentVal : defaultData;
      }

      //model -> UI
      modelUpdater.$display = function () {
        domNode.toggleClass(controlMgr.selectedClass, ng.equals(modelUpdater.$dataValue, retrieveOnValue()));
      };

      //ui->model
      domNode.on(controlMgr.interactionEvent, function () {
        viewContext.$refresh(function () {
          modelUpdater.$updateModel(domNode.hasCssClass(controlMgr.selectedClass) ? retrieveOffValue() : retrieveOnValue());
          modelUpdater.$display();
        });
      });
    }
  };
});

/**
* @ngdoc overview
* @name ng.component.slider
*
* @description
* AngularJS implementation of an image carousel.
*
*/
ng.module('ng.component.slider', ['ng.component.animate'])
.controller('SliderHandler', ['$scope', '$timeout', '$animator', function (viewContext, timerService, animatorService) {
  var componentRef = this,
    imageFrames = componentRef.imageFrames = viewContext.imageFrames = [],
    currentFrameIndex = -1,
    activeDelay, isCarouselRunning;
  componentRef.activeFrame = null;

  var isComponentDestroyed = false;
  /* travelDirection: "forward" or "backward" */
  componentRef.chooseFrame = viewContext.chooseFrame = function(frameToSelect, travelDirection) {
    var nextFrameIdx = imageFrames.indexOf(frameToSelect);
    // Determine travel direction if not explicitly provided
    if (travelDirection === undefined) {
      travelDirection = nextFrameIdx > currentFrameIndex ? 'forward' : 'backward';
    }
    if (frameToSelect && frameToSelect !== componentRef.activeFrame) {
      if (viewContext.$currentAnimation) {
        viewContext.$currentAnimation.abort();
        // Delay to allow ng-class in template to correct classes for the completed frame
        timerService(moveToNext);
      } else {
        moveToNext();
      }
    }
    function moveToNext() {
      // If the scope has been destroyed, halt execution.
      if (isComponentDestroyed) { return; }
      // If there's a frame to transition from, a transition type, and allowed, proceed
      if (componentRef.activeFrame && ng.isString(travelDirection) && !viewContext.noMotion && frameToSelect.$domElement) {
        // Class manipulation here is unconventional but mirrors bootstrap's approach; needs future refactor.
        frameToSelect.$domElement.addCssClass(travelDirection);
        var renderUpdate = frameToSelect.$domElement[0].actualWidth; // Force browser reflow

        // Reset all other frames to prevent interference with the new animation
        ng.forEach(imageFrames, function(frame) {
          ng.extend(frame, {flow: '', entering: false, leaving: false, active: false});
        });
        ng.extend(frameToSelect, {flow: travelDirection, active: true, entering: true});
        ng.extend(componentRef.activeFrame||{}, {flow: travelDirection, leaving: true});

        viewContext.$currentAnimation = animatorService(frameToSelect.$domElement, {});
        // Create new pointers within a closure as `futureFrame` and `presentFrame` will change
        (function(futureFrame,presentFrame) {
          viewContext.$currentAnimation.then(
            function(){ motionFinished(futureFrame, presentFrame); },
            function(){ motionFinished(futureFrame, presentFrame); }
          );
        }(frameToSelect, componentRef.activeFrame));
      } else {
        motionFinished(frameToSelect, componentRef.activeFrame);
      }
      componentRef.activeFrame = frameToSelect;
      currentFrameIndex = nextFrameIdx;
      // Reset the timer every time the frame changes
      resetPlaybackTimer();
    }
    function motionFinished(futureFrame, presentFrame) {
      ng.extend(futureFrame, {flow: '', active: true, leaving: false, entering: false});
      ng.extend(presentFrame||{}, {flow: '', active: false, leaving: false, entering: false});
      viewContext.$currentAnimation = null;
    }
  };
  viewContext.$on('$dispose', function () {
    isComponentDestroyed = true;
  });

  /* Allow external entities to call findFrameIndex on the imageFrames array */
  componentRef.findFrameIndex = function(targetFrame) {
    return imageFrames.indexOf(targetFrame);
  };

  viewContext.moveForward = function() {
    var nextIdx = (currentFrameIndex + 1) % imageFrames.length;

    // Prevent user-triggered transitions if one is already in progress
    if (!viewContext.$currentAnimation) {
      return componentRef.chooseFrame(imageFrames[nextIdx], 'forward');
    }
  };

  viewContext.moveBackward = function() {
    var nextIdx = currentFrameIndex - 1 < 0 ? imageFrames.length - 1 : currentFrameIndex - 1;

    // Prevent user-triggered transitions if one is already in progress
    if (!viewContext.$currentAnimation) {
      return componentRef.chooseFrame(imageFrames[nextIdx], 'backward');
    }
  };