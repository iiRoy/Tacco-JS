"use strict";

/*
 * Core application display component.
 *
 * @param   appCore     Main application object to extend with this component.
 * @param   jq          jQuery library reference.
 * @returns appCore augmented with the display component.
 */

(function (appCore, jq) {
  var presentationModule = (function () {

    var moduleAPI = {};

    var PresentationDisplayEngine = function (targetSelector, queryParameters) {

      /* Internal Methods and Properties */

      var presentationData = null;
      var targetElementSelector = targetSelector;

      var extractTimedOption = function (optionKey, fallbackValue) {
        var resultVal = queryParameters[optionKey];
        if (resultVal == null) {
          if (optionKey === 'automatic') {
            return false;
          } else {
            return extractTimedOption('automatic', fallbackValue);
          }
        }
        if (resultVal.toLowerCase() === 'false') {
          return false;
        }
        resultVal = parseInt(resultVal, 10);
        if (isNaN(resultVal)) {
          // e.g., ?autoAdvance or ?autoAdvance=true
          return fallbackValue;
        }
        return resultVal;
      };

      /* Duration to pause between steps in automatic mode */
      var autoAdvanceInterval = extractTimedOption('autoAdvance', 6000);
      /* Initial delay before the first step begins automatically */
      var autoStartDelay = extractTimedOption('autoStart', 7000);
      /* Time to wait before restarting the presentation after its end */
      var autoRewindInterval = extractTimedOption('autoLoop', 8000);

      var eventHub = (function () {
        var eventHandlers = {};
        /*
         * Constructs a new general-purpose event channel.
         */
        var buildEventChannel = function () {
          var callbackCollection = jq.Callbacks();
          return {
            trigger: callbackCollection.fire,
            addListener: callbackCollection.add,
            removeListener: callbackCollection.remove,
            clearListeners: callbackCollection.empty
          };
        };
        /*
         * Activated when the 'forward' button is pressed.
         */
        eventHandlers.onAdvance = buildEventChannel();
        /*
         * Activated when the 'backward' button is pressed.
         */
        eventHandlers.onRetreat = buildEventChannel();
        /*
         * Triggered upon completion of a single step.
         */
        eventHandlers.onStepCompletion = buildEventChannel();
        /*
         * Triggered at the beginning of a single step.
         */
        eventHandlers.onStepInitiation = buildEventChannel();
        /*
         * Fired when all active steps have concluded.
         */
        eventHandlers.onAllStepsFinished = buildEventChannel();

        return eventHandlers;
      })();

      /*
       * Control variables for managing presentation flow.
       */
      var activeStepIndex = 0;    /* Current step being processed */
      var nextStepToExecute = 0;  /* Index of the next step after user interaction */
      var runningStepCount = 0;
      var lastVisitedAnchor = -1; /* Previous URL hash, for browsers without 'onhashchange' */

      /*
       * Routines to reset running steps and event subscriptions.
       * (Separated because resetting subscriptions doesn't halt steps).
       */
      var haltAllActiveSteps = function () {
        jq(targetElementSelector + " .content-display").children().stop(true, true);
        resetEventSubscriptions();
        runningStepCount = 0;
      };
      var resetEventSubscriptions = function () {
        eventHub.onStepInitiation.clearListeners();
        eventHub.onStepInitiation.addListener(onStepInitiationHandler);
        eventHub.onAllStepsFinished.clearListeners();
      };

      /*
       * Identifier for the timer used in auto-advance mode.
       */
      var advanceTimerId = 0;

      /*
       * Handler for the 'onAdvance' event.
       */
      var onAdvanceHandler = function () {
        /*
         * If user clicks 'forward' before an auto-advance,
         * the automatic advance is cancelled.
         */
        window.clearTimeout(advanceTimerId);

        startAnimationState();
        haltAllActiveSteps();
        var tempStep = nextStepToExecute;
        var processOnlyPreceding = true;
        nextStepToExecute++;
        activeStepIndex = nextStepToExecute;
        while (presentationData.activity[activeStepIndex] && processOnlyPreceding) {
          switch (presentationData.activity[activeStepIndex].activationCondition) {
            case 'onUserClick':
              nextStepToExecute = activeStepIndex;
              processOnlyPreceding = false;
              break;
            case 'concurrentWithPrevious':
              var temp = activeStepIndex;
              /*
               * We cannot directly pass 'execute' as a callback because it might
               * rely on 'this' context, so we wrap it to ensure correct scope.
               */
              eventHub.onStepInitiation.addListener(function (eventHub, targetElementSelector) {
                presentationData.activity[temp].execute(eventHub, targetElementSelector);
              });
              break;
            case 'afterPreviousCompletion':
              var temp = activeStepIndex;
              eventHub.onAllStepsFinished.addListener(function (eventHub, targetElementSelector) {
                presentationData.activity[temp].execute(eventHub, targetElementSelector);
              });
              while (presentationData.activity[nextStepToExecute] && presentationData.activity[nextStepToExecute].activationCondition !== 'onUserClick') {
                nextStepToExecute++;
              }
              processOnlyPreceding = false;
              break;
          }
          activeStepIndex++;
        }
        if (presentationData.activity[tempStep]) {
          initiateStep(presentationData.activity[tempStep]);
        }
        if (nextStepToExecute > presentationData.activity.length) {
          nextStepToExecute = presentationData.activity.length;
        }
      };

      /*
       * Handler for the 'onRetreat' event.
       */
      var onRetreatHandler = function () {
        haltAllActiveSteps();
        activeStepIndex = nextStepToExecute - 1;
        while (presentationData.activity[activeStepIndex] && presentationData.activity[activeStepIndex].activationCondition !== 'onUserClick') {
          initiateReverseStep(presentationData.activity[activeStepIndex]);
          activeStepIndex--;
        }
        /* activeStepIndex = -1 means the very start */
        if (activeStepIndex > -1) {
          initiateReverseStep(presentationData.activity[activeStepIndex]);
        }
        if (activeStepIndex < 0) {
          activeStepIndex = 0;
        }
        nextStepToExecute = activeStepIndex;
      };

      /*
       * Handler for the 'onStepCompletion' event.
       */
      var onStepCompletionHandler = function () {
        runningStepCount--;
        if (runningStepCount === 0) {
          eventHub.onAllStepsFinished.trigger(eventHub, targetElementSelector);
          resetEventSubscriptions();
          while (presentationData.activity[activeStepIndex]) {
            switch (presentationData.activity[activeStepIndex].activationCondition) {
              case 'onUserClick':
                endAnimationState();
                if (autoAdvanceInterval && runningStepCount === 0) {
                  advanceTimerId = setTimeout(function () {
                    eventHub.onAdvance.trigger();
                  }, autoAdvanceInterval);
                }
                return;
              case 'concurrentWithPrevious':
                var temp = activeStepIndex;
                eventHub.onStepInitiation.addListener(function (eventHub, targetElementSelector) {
                  presentationData.activity[temp].execute(eventHub, targetElementSelector);
                });
                break;
              case 'afterPreviousCompletion':
                var temp = activeStepIndex;
                eventHub.onAllStepsFinished.addListener(function (eventHub, targetElementSelector) {
                  presentationData.activity[temp].execute(eventHub, targetElementSelector);
                });
                activeStepIndex++;
                return;
            }
            activeStepIndex++;
          }
          if (autoRewindInterval && runningStepCount === 0) {
            setTimeout(function () {
              resetDisplay();
              conditionallyStartPresentation();
            }, autoRewindInterval);
          }
        }
        endAnimationState();
      };

      /*
       * Handler for the 'onStepInitiation' event.
       */
      var onStepInitiationHandler = function () {
        runningStepCount++;
      };

      /*
       * Initiates and concludes the "animation" state. This state
       * implies automatic progression without human intervention
       * (i.e., executing steps until the next 'onUserClick').
       */
      var startAnimationState = function () {
        jq(targetElementSelector + ' .pointer-icon-paused').hide();
        jq(targetElementSelector + ' .pointer-icon-active').show();
      };

      var endAnimationState = function () {
        jq(targetElementSelector + ' .pointer-icon-paused').show();
        jq(targetElementSelector + ' .pointer-icon-active').hide();
      };

      /*
       * Functions to execute individual presentation steps.
       */
      var initiateStep = function (stepItem) {
        stepItem.execute(eventHub, targetElementSelector);
      };
      var initiateReverseStep = function (stepItem) {
        stepItem.executeReverse(targetElementSelector);
      };

      /*
       * These two routines return arrays of steps needed to navigate
       * to a specified anchor, either forwards or backwards.
       *
       * An empty array is returned if the anchor is not found.
       */
      var retrieveStepsForForwardJump = function (targetAnchor) {
        var forwardSteps = [];
        for (var iterator = nextStepToExecute; iterator < presentationData.activity.length; iterator++) {
          // Using '===' for strict comparison, assuming IDs are consistent types
          if (presentationData.activity[iterator].id === targetAnchor) {
            return forwardSteps;
          } else {
            forwardSteps.push(presentationData.activity[iterator]);
          }
        }
        // If anchor isn't found during the forward scan
        return null;
      };
      var retrieveStepsForBackwardJump = function (targetAnchor) {
        var backwardSteps = [];
        for (var iterator = nextStepToExecute - 1; iterator >= 0; iterator--) {
          // Using '===' for strict comparison, assuming IDs are consistent types
          backwardSteps.push(presentationData.activity[iterator]);
          if (presentationData.activity[iterator].id === targetAnchor) {
            return backwardSteps;
          }
        }
        // If anchor isn't found during the backward scan
        return null;
      };

      /*
       * Adjusts the presentation position based on a given anchor.
       */
      var navigateToActionAnchor = function (targetAnchor) {
        if (targetAnchor !== '') {
          haltAllActiveSteps();
          if (targetAnchor > nextStepToExecute) {
            // Moving forward
            var forwardSteps = retrieveStepsForForwardJump(targetAnchor);
            for (var iterator = 0; iterator < forwardSteps.length; iterator++) {
              forwardSteps[iterator].executeImmediately(targetElementSelector);
            }
            nextStepToExecute += forwardSteps.length;
          } else {
            // Moving backward
            var backwardSteps = retrieveStepsForBackwardJump(targetAnchor);
            for (var iterator = 0; iterator < backwardSteps.length; iterator++) {
              backwardSteps[iterator].executeReverse(targetElementSelector);
            }
            nextStepToExecute -= backwardSteps.length;
          }
        }
      };

      var resetDisplay = function () {
        window.clearTimeout(advanceTimerId);

        activeStepIndex = 0;
        nextStepToExecute = 0;
        runningStepCount = 0;

        /*
         * At the beginning, only the initial background image should be visible.
         */
        jq(targetElementSelector + " .content-display").children().hide();

        jq(targetElementSelector + " ." + presentationData.metaInfo.startingBackgroundId).show();

        jq(targetElementSelector + " .pointer-icon").css({
          'top': (presentationData.metaInfo.initialPointerY * presentationData.metaInfo.displayHeight) + "px",
          'left': (presentationData.metaInfo.initialPointerX * presentationData.metaInfo.displayWidth) + "px"
        });

        jq(targetElementSelector + " .pointer-icon").show();
      };

      var conditionallyStartPresentation = function () {
        if (autoStartDelay) {
          advanceTimerId = setTimeout(function () {
            eventHub.onAdvance.trigger();
          }, autoStartDelay);
        }
      };

      /* Public Interface */

      this.loadPresentationFromUrl = function (resourceUri) {
        var jsonPayload;
        jq.ajax({
          'async': false,
          'global': false,
          'url': resourceUri,
          'dataType': "json",
          'success': function (receivedData) {
            jsonPayload = receivedData;
          }
        });

        this.loadPresentation(jsonPayload);
      };

      this.loadPresentation = function (presentationPayload) {
        /* Transforms raw JSON data into executable functions for each step */
        var runnableModel = appCore.createScreencastRunnableModel();
        runnableModel.loadJson(presentationPayload);
        presentationData = runnableModel.getJson();
      };

      this.beginDisplay = function () {

        /*
         * Registering internal handlers to their respective events.
         */
        eventHub.onAdvance.addListener(onAdvanceHandler);
        eventHub.onRetreat.addListener(onRetreatHandler);
        eventHub.onStepCompletion.addListener(onStepCompletionHandler);
        eventHub.onStepInitiation.addListener(onStepInitiationHandler);

        resetDisplay();

        /*
         * If a specific anchor is present in the URL, jump to that position.
         */
        navigateToActionAnchor(window.location.hash.substring(1));

        /*
         * If the URL hash changes during the presentation, update accordingly.
         */
        if ("onhashchange" in window) {
          // Browser supports hashchange event
          window.onhashchange = function () {
            navigateToActionAnchor(window.location.hash.substring(1));
          };
        } else {
          // Browser does not support hashchange; poll periodically
          window.setInterval(function () {
            if (window.location.hash.substring(1) !== lastVisitedAnchor) {
              lastVisitedAnchor = window.location.hash.substring(1);
              navigateToActionAnchor(window.location.hash.substring(1));
            }
          }, 150);
        }

        /*
         * Clicking the "forward" button triggers an advance event.
         */
        jq(targetElementSelector + " .forward").click(function () {
          eventHub.onAdvance.trigger();
        });

        /*
         * Clicking the "backward" button triggers a retreat event.
         */
        jq(targetElementSelector + " .backward").click(function () {
          eventHub.onRetreat.trigger();
        });

        /*
         * Everything is initialized; reveal the presentation (initially hidden).
         */
        jq("#initialLoading").hide();
        jq(targetElementSelector + " .content-display").show();
        conditionallyStartPresentation();
      };
    };

    moduleAPI.createPresentationViewer = function (displayElementId, runtimeParams) {
      return new PresentationDisplayEngine(displayElementId, runtimeParams);
    };

    return moduleAPI;
  })();

  appCore.presentationModule = presentationModule;
})(appCore || {}, jq);