/*
 * Copyright 2023 Acme Corp.
 * https://acmecorp.com/
 *
 * AppCore, v1.0.0
 * A robust web application component library.
 * https://acmecorp.com/appcore/
 *
 * Developed by @js_guru, @code_master, @dev_ninja
 *
 * Released under the Apache 2.0 license. For license details, refer to the LICENSE file.
 */

/**
 * Establishes a foundational module to aggregate various core utility services,
 * simplifying dependency management for application components.
 */
(function() {
  'use strict';
  angular.module('myApp.utilities', [
    'myApp.utilities.deviceEnv',
    'myApp.utilities.overlaySheet',
    'myApp.utilities.interactionHandler',
    'myApp.utilities.progressIndicator',
    'myApp.utilities.dialogBox',
    'myApp.utilities.alertManager',
    'myApp.utilities.resourceFetcher'
  ]);
})();

/**
 * Defines the primary UI components module, encapsulating various
 * visual elements for the application interface.
 */
angular.module('myApp.components', [
  'myApp.components.contentArea',
  'myApp.components.scrollableRegion',
  'myApp.components.tabNavigation',
  'myApp.components.routeNavigator',
  'myApp.components.topBar',
  'myApp.components.sidePanel',
  'myApp.components.carouselView',
  'myApp.components.dataList',
  'myApp.components.checkControl',
  'myApp.components.slideSwitch',
  'myApp.components.optionSelector'
]);

/**
 * The root application module, bringing together all core services,
 * UI components, and essential Angular framework dependencies.
 */
angular.module('myApp', [
  'myApp.utilities',
  'myApp.components',

  // Core Angular dependencies
  'ngAnimate', // For animations
  'ngRoute',   // For routing capabilities
  'ngTouch',   // For touch event support
  'ngSanitize' // For secure HTML binding
]);

angular.module('myApp.utilities.overlaySheet', [
  'myApp.utilities.resourceFetcher',
  'myApp.components.overlaySheet',
  'ngAnimate'
])
.factory('OverlaySheetService', [
  '$rootScope',
  '$document',
  '$compile',
  '$animate',
  '$timeout',
  'ResourceFetcher',
  function(appRootScope, docRef, templateCompiler, animator, timeService, dataRetriever) {
    // Internal state to track active overlay sheets
    let activeSheetInstance = null;

    /**
     * Helper function to manage the hiding process of an overlay sheet.
     * @param {HTMLElement} sheetElement - The core sheet element to animate out.
     * @param {HTMLElement} wrapperElement - The full wrapper element containing the sheet.
     * @param {Object} sheetOptions - The configuration options for the sheet.
     * @param {Object} sheetScope - The Angular scope associated with the sheet.
     * @param {boolean} wasCancelled - True if the sheet was hidden due to a cancellation event.
     */
    const performSheetDismissal = function(sheetElement, wrapperElement, sheetOptions, sheetScope, wasCancelled) {
      if (!sheetElement || !wrapperElement || !sheetScope) {
        console.warn('OverlaySheetService: Attempted to dismiss an invalid sheet instance.');
        return;
      }

      animator.leave(sheetElement).then(() => {
        if (wasCancelled && typeof sheetOptions.onCancel === 'function') {
          // Execute cancellation callback if provided
          sheetOptions.onCancel();
        }
        // Ensure the wrapper fades out and then cleanup
        animator.removeClass(wrapperElement, 'is-active').then(() => {
          sheetScope.$destroy(); // Clean up the scope
          wrapperElement.remove(); // Remove element from DOM
          activeSheetInstance = null; // Clear active instance reference
        });
      }).catch(error => {
        console.error('Error during overlay sheet dismissal animation:', error);
        // Fallback cleanup if animation fails
        sheetScope.$destroy();
        wrapperElement.remove();
        activeSheetInstance = null;
      });
    };

    return {
      /**
       * Displays an interactive overlay sheet based on provided configuration.
       * A new isolated Angular scope is created, and the compiled component
       * is appended to the document body.
       *
       * @param {object} configData - Configuration object for the overlay sheet.
       *   Expected properties: title, buttons, destructiveButton, cancelButton,
       *   onButtonClick, onDestroyButtonClick, onCancel.
       * @returns {object} An object containing the control methods for the displayed sheet.
       */
      display: function(configData) {
        // Guard clause: Prevent multiple sheets from being active simultaneously
        if (activeSheetInstance) {
          console.warn('OverlaySheetService: An overlay sheet is already active. Dismissing previous one.');
          activeSheetInstance.dismiss(true); // Dismiss previous one before showing new
          timeService.cancel(activeSheetInstance._showTimeout); // Clear any pending show timeouts
        }

        const currentViewScope = appRootScope.$new(true); // Create isolated scope
        Object.assign(currentViewScope, configData); // Merge configuration into scope

        // Compile the custom directive for the overlay sheet
        const sheetHtmlElement = templateCompiler('<app-overlay-sheet button-collection="buttons" title-content="{{titleText}}" destructive-action-text="{{destructiveText}}" cancel-action-text="{{cancelText}}" handle-button-click="handleButtonClick($index)" handle-destructive-click="handleDestructiveClick()" initiate-dismissal="initiateDismissal(isCancellation)"></app-overlay-sheet>')(currentViewScope);
        const coreSheetElement = angular.element(sheetHtmlElement[0].querySelector('.app-overlay-panel'));

        // Define the dismissal function directly within the scope for accessibility
        currentViewScope.initiateDismissal = function(isCancellation = false) {
          performSheetDismissal(coreSheetElement, sheetHtmlElement, configData, currentViewScope, isCancellation);
        };

        // Handle regular button clicks
        currentViewScope.handleButtonClick = function(btnIndex) {
          if (typeof configData.onButtonClick === 'function') {
            // If the handler returns true, close the sheet
            if (configData.onButtonClick(btnIndex) === true) {
              currentViewScope.initiateDismissal(false);
            }
          } else {
            // Default behavior: close if no specific handler or if handler doesn't return false
            currentViewScope.initiateDismissal(false);
          }
        };

        // Handle destructive button click
        currentViewScope.handleDestructiveClick = function() {
          if (typeof configData.onDestroyButtonClick === 'function') {
            if (configData.onDestroyButtonClick() === true) {
              currentViewScope.initiateDismissal(false);
            }
          } else {
            currentViewScope.initiateDismissal(false);
          }
        };

        // Append the sheet to the document body
        docRef[0].body.appendChild(sheetHtmlElement[0]);

        // Initialize the custom view component (assuming a similar pattern to ionic.views)
        const visualSheetController = new myApp.views.OverlaySheetComponent({
          domElement: sheetHtmlElement[0]
        });
        currentViewScope.visualController = visualSheetController; // Expose controller to scope

        // Trigger animations for display
        animator.addClass(sheetHtmlElement, 'is-active').then(() => {
          // Initial animation complete
        });
        animator.enter(coreSheetElement, sheetHtmlElement, null, () => {
          // Inner sheet animation complete
        });

        // Store active instance for global management
        activeSheetInstance = {
          dismiss: currentViewScope.initiateDismissal,
          _showTimeout: null // Placeholder for potential future show delays
        };

        return activeSheetInstance; // Return control object
      }
    };
  }
]);

angular.module('myApp.utilities.interactionHandler', [])
.factory('InteractionHandler', [function() {
  const activeGestures = new Map(); // To track active gesture listeners for easier management

  return {
    /**
     * Attaches a gesture event listener to a specified DOM element.
     * @param {string} eventTypeIdentifier - The type of gesture event (e.g., 'swipe', 'tap').
     * @param {Function} callbackFunction - The function to execute when the event fires.
     * @param {angular.element} targetElement - The Angular-wrapped DOM element.
     * @returns {Object} A reference to the registered gesture listener.
     */
    registerListener: function(eventTypeIdentifier, callbackFunction, targetElement) {
      if (!targetElement || !targetElement[0]) {
        console.error('InteractionHandler: Invalid target element provided for gesture registration.');
        return null;
      }
      const listenerRef = window.myAppCore.onInteraction(eventTypeIdentifier, callbackFunction, targetElement[0]);
      // Store the listener reference for potential future removal
      const key = `${eventTypeIdentifier}-${targetElement[0].id || targetElement[0].className || Math.random().toString(36).substring(7)}`;
      activeGestures.set(key, { listenerRef, callbackFunction, targetElement: targetElement[0] });
      return listenerRef;
    },

    /**
     * Removes a previously attached gesture event listener.
     * @param {Object} gestureReference - The reference returned by `registerListener`.
     * @param {string} eventTypeIdentifier - The type of gesture event.
     * @param {Function} callbackFunction - The original callback function used for registration.
     */
    deregisterListener: function(gestureReference, eventTypeIdentifier, callbackFunction) {
      if (!gestureReference) {
        console.warn('InteractionHandler: No gesture reference provided for deregistration.');
        return;
      }
      window.myAppCore.offInteraction(gestureReference, eventTypeIdentifier, callbackFunction);

      // Clean up from our internal map
      for (let [key, value] of activeGestures.entries()) {
        if (value.listenerRef === gestureReference && value.callbackFunction === callbackFunction) {
          activeGestures.delete(key);
          break;
        }
      }
    },

    /**
     * Clears all registered gesture listeners.
     * (New functionality for Type III)
     */
    clearAllListeners: function() {
      activeGestures.forEach(({ listenerRef, eventTypeIdentifier, callbackFunction }) => {
        if (listenerRef && eventTypeIdentifier && callbackFunction) {
          window.myAppCore.offInteraction(listenerRef, eventTypeIdentifier, callbackFunction);
        }
      });
      activeGestures.clear();
      console.info('InteractionHandler: All gesture listeners have been cleared.');
    }
  };
}]);

angular.module('myApp.utilities.progressIndicator', ['myApp.components.loadingOverlay'])
.factory('ProgressIndicatorService', [
  '$rootScope',
  '$document',
  '$compile',
  '$timeout',
  function(appRootScope, docReference, templateCompiler, timerUtility) {
    let currentIndicatorInstance = null; // Tracks the currently active loading indicator

    const defaultConfiguration = {
      displayMessage: '', // Content to display within the indicator
      transitionEffect: 'reveal-from-top', // Custom animation class
      hasOverlayBackground: true, // Whether to show a semi-transparent backdrop
      maximumWidth: 250, // Max width of the indicator box
      initialDisplayDelay: 500 // Delay before the indicator actually appears (ms)
    };

    /**
     * Internal function to remove the progress indicator from the DOM.
     * @param {object} indicatorInstance - The instance of the indicator to remove.
     * @param {object} scopeToDestroy - The Angular scope associated with the indicator.
     */
    const removeIndicatorFromDOM = function(indicatorInstance, scopeToDestroy) {
      if (indicatorInstance && indicatorInstance.domElement && indicatorInstance.domElement.parentNode) {
        indicatorInstance.domElement.parentNode.removeChild(indicatorInstance.domElement);
      }
      if (scopeToDestroy && typeof scopeToDestroy.$destroy === 'function') {
        scopeToDestroy.$destroy();
      }
      currentIndicatorInstance = null; // Clear the reference
    };

    return {
      /**
       * Shows a progress indicator with custom content and options.
       * If another indicator is already active, it will be dismissed first.
       *
       * @param {object} customOptions - Configuration object for the indicator.
       *   Properties: displayMessage, transitionEffect, hasOverlayBackground, maximumWidth, initialDisplayDelay.
       * @returns {object} An object with `hide` method to dismiss the indicator.
       */
      show: function(customOptions) {
        // Dismiss any existing indicator before showing a new one
        if (currentIndicatorInstance) {
          console.warn('ProgressIndicatorService: Another indicator is active. Dismissing it.');
          currentIndicatorInstance.hide();
          timerUtility.cancel(currentIndicatorInstance._showTimer); // Clear any pending show timers
        }

        const finalConfig = { ...defaultConfiguration, ...customOptions }; // Merge options
        const indicatorScope = appRootScope.$new(true);
        Object.assign(indicatorScope, finalConfig);

        // Compile the custom directive for the progress indicator
        const compiledElement = templateCompiler('<app-loading-overlay message-content="displayMessage"></app-loading-overlay>')(indicatorScope);

        // Append the indicator to the document body
        docReference[0].body.appendChild(compiledElement[0]);

        // Create an instance of the underlying UI component
        const uiComponent = new myApp.views.LoadingComponent({
          elementNode: compiledElement[0],
          maxWidthConfig: finalConfig.maximumWidth,
          delayBeforeShowing: finalConfig.initialDisplayDelay
        });

        // Expose a `hide` method on the returned object for external control
        const indicatorControl = {
          hide: function() {
            uiComponent.hide(); // Delegate to the UI component's hide logic
            removeIndicatorFromDOM(uiComponent, indicatorScope);
          },
          _showTimer: null // Placeholder for the actual show timer
        };

        // Store the instance and its control for global management
        currentIndicatorInstance = indicatorControl;

        // Optionally, show with a delay
        if (finalConfig.initialDisplayDelay > 0) {
          indicatorControl._showTimer = timerUtility(() => {
            uiComponent.show();
          }, finalConfig.initialDisplayDelay);
        } else {
          uiComponent.show();
        }

        indicatorScope.indicatorRef = uiComponent; // Expose to scope if needed

        return indicatorControl;
      }
    };
  }
]);

angular.module('myApp.utilities.dialogBox', [
  'myApp.utilities.resourceFetcher',
  'ngAnimate'
])
.factory('DialogBoxService', [
  '$rootScope',
  '$document',
  '$compile',
  '$animate',
  '$q',
  'ResourceFetcher',
  function(appRootScope, docRef, templateCompiler, animator, promiseService, dataRetriever) {
    /**
     * Custom DialogBox implementation, extending a base UI component.
     * @class
     * @augments myApp.views.BaseDialog
     */
    const CustomDialogView = myApp.views.BaseDialog.extend({
      /**
       * Initializes the dialog box with given options.
       * @param {object} dialogOptions - Configuration options for the dialog.
       */
      initialize: function(dialogOptions) {
        myApp.views.BaseDialog.prototype.initialize.call(this, dialogOptions);
        this.displayAnimation = dialogOptions.animationType || 'slide-up-bottom'; // Custom animation property
        this.isShown = false; // Internal state for visibility
        this.domElement = dialogOptions.domElement; // Ensure domElement is stored
      },
      /**
       * Displays the dialog box. Appends to body if not already present.
       * @returns {Promise<void>} A promise that resolves when the show animation completes.
       */
      present: function() {
        const dialogElement = angular.element(this.domElement);
        // Ensure element is attached to the DOM before showing
        if (!docRef[0].body.contains(dialogElement[0])) {
          docRef[0].body.appendChild(dialogElement[0]);
          myApp.views.BaseDialog.prototype.present.call(this); // Call base class present
        }

        return animator.addClass(dialogElement, this.displayAnimation).then(() => {
          this.isShown = true;
          console.log('DialogBoxService: Dialog presented successfully.');
        });
      },
      /**
       * Hides the dialog box.
       * @returns {Promise<void>} A promise that resolves when the hide animation completes.
       */
      conceal: function() {
        const dialogElement = angular.element(this.domElement);
        return animator.removeClass(dialogElement, this.displayAnimation).then(() => {
          this.isShown = false;
          myApp.views.BaseDialog.prototype.conceal.call(this); // Call base class conceal
          console.log('DialogBoxService: Dialog concealed.');
        });
      },
      /**
       * Removes the dialog box from the DOM and destroys its scope.
       * @param {object} dialogScope - The Angular scope associated with the dialog.
       * @returns {Promise<void>} A promise that resolves when removal is complete.
       */
      dispose: function(dialogScope) {
        const dialogElement = angular.element(this.domElement);
        return animator.leave(dialogElement).then(() => {
          if (dialogScope && typeof dialogScope.$destroy === 'function') {
            dialogScope.$destroy();
          }
          console.log('DialogBoxService: Dialog and its scope disposed.');
        }).catch(err => {
          console.error('DialogBoxService: Error during dialog disposal:', err);
          // Force cleanup if animation fails
          dialogElement.remove();
          if (dialogScope) dialogScope.$destroy();
        });
      }
    });

    /**
     * Creates and initializes a dialog box instance.
     * @param {string} markupString - HTML template string for the dialog.
     * @param {object} configSettings - Configuration for the dialog.
     * @returns {CustomDialogView} The created dialog box instance.
     */
    const instantiateDialog = function(markupString, configSettings) {
      if (!markupString || typeof markupString !== 'string') {
        throw new Error('DialogBoxService: Invalid markup string provided for dialog creation.');
      }

      const dialogScope = configSettings.contextScope && configSettings.contextScope.$new() || appRootScope.$new(true);
      const compiledDialogElement = templateCompiler(markupString)(dialogScope);

      configSettings.domElement = compiledDialogElement[0]; // Assign the DOM element
      const dialogInstance = new CustomDialogView(configSettings);

      // If no external scope was provided, assign the dialog instance to the isolated scope
      if (!configSettings.contextScope) {
        dialogScope.dialogController = dialogInstance;
      }
      dialogInstance.scope = dialogScope; // Expose scope to instance for prompt

      return dialogInstance;
    };

    return {
      /**
       * Creates a dialog box from an inline HTML template string.
       * @param {string} htmlContent - The HTML string for the dialog's content.
       * @param {object} [dialogConfiguration={}] - Optional configuration settings.
       * @returns {CustomDialogView} The new dialog box instance.
       */
      fromInlineTemplate: function(htmlContent, dialogConfiguration = {}) {
        return instantiateDialog(htmlContent, dialogConfiguration);
      },

      /**
       * Creates a dialog box by loading a template from a URL.
       * @param {string} templateSourceUrl - The URL to fetch the template from.
       * @param {Function} completionCallback - Callback function to receive the dialog instance.
       * @param {object} [dialogConfiguration={}] - Optional configuration settings.
       * @returns {Promise<CustomDialogView>} A promise that resolves with the dialog instance.
       */
      fromExternalTemplate: function(templateSourceUrl, completionCallback, dialogConfiguration = {}) {
        const deferredResult = promiseService.defer();
        dataRetriever.fetch(templateSourceUrl).then(function(fetchedHtml) {
          try {
            const dialogInstance = instantiateDialog(fetchedHtml, dialogConfiguration);
            if (typeof completionCallback === 'function') {
              completionCallback(dialogInstance);
            }
            deferredResult.resolve(dialogInstance);
          } catch (error) {
            console.error('DialogBoxService: Error instantiating dialog from external template:', error);
            deferredResult.reject(error);
          }
        }).catch(function(error) {
          console.error('DialogBoxService: Failed to load template from URL:', templateSourceUrl, error);
          deferredResult.reject(error);
        });
        return deferredResult.promise;
      }
    };
  }
]);

(function(appCoreGlobal) {
  'use strict';

  angular.module('myApp.utilities.deviceEnv', [])

  /**
   * The DeviceEnvironmentProvider offers mechanisms to identify the current execution
   * environment (e.g., browser, Cordova) and manage environment-specific configurations,
   * such as UI adjustments for different operating systems.
   */
  .provider('DeviceEnvironment', function() {
    let detectedEnvironment = 'browser'; // Default environment
    let environmentIsInitialized = false; // Flag to indicate readiness

    // Check for Cordova/PhoneGap presence to determine native environment
    if (window.cordova || window.PhoneGap || window.phonegap || window.Capacitor) {
      detectedEnvironment = 'hybrid';
    }

    /**
     * Determines if the current environment's core APIs are available.
     * @returns {boolean} True if the environment is ready, false otherwise.
     */
    const checkEnvironmentReadiness = function() {
      if (detectedEnvironment === 'hybrid') {
        // For hybrid, check for global device objects
        return !!(window.device || window.Cordova || (window.Capacitor && window.Capacitor.isNative));
      }
      return true; // Browser environment is always considered ready
    };

    // Proactively detect and apply environment-specific settings early.
    // This loop ensures that critical platform-dependent initializations,
    // like adjusting header margins for specific OS versions, are done promptly.
    let readinessPollingInterval = setInterval(function environmentReadyPoll() {
      if (checkEnvironmentReadiness()) {
        clearInterval(readinessPollingInterval);
        environmentIsInitialized = true;
        // Trigger global detection logic if available
        if (appCoreGlobal && typeof appCoreGlobal.DeviceEnvDetector === 'object' && typeof appCoreGlobal.DeviceEnvDetector.identify === 'function') {
          appCoreGlobal.DeviceEnvDetector.identify();
        } else {
          console.warn('DeviceEnvDetector not found or not callable on appCoreGlobal.');
        }
      }
    }, 75); // Poll every 75ms initially, slightly different from original 50ms

    // Exported provider interface
    return {
      /**
       * Allows manually setting the environment. Useful for testing or specific overrides.
       * @param {string} newEnvironment - The environment string to set (e.g., 'browser', 'hybrid').
       */
      setEnvironmentType: function(newEnvironment) {
        if (typeof newEnvironment === 'string' && ['browser', 'hybrid'].includes(newEnvironment.toLowerCase())) {
          detectedEnvironment = newEnvironment.toLowerCase();
          console.info(`DeviceEnvironment: Environment type manually set to "${detectedEnvironment}".`);
        } else {
          console.warn(`DeviceEnvironment: Attempted to set invalid environment type: "${newEnvironment}".`);
        }
      },

      /**
       * The $get method provides the service instance, injected with necessary Angular services.
       * @returns {object} The DeviceEnvironment service instance.
       */
      $get: ['$q', '$timeout', function(promiseService, timerService) {
        let backButtonListeners = []; // Store multiple back button listeners

        /**
         * Safely executes a callback when the device environment is confirmed ready.
         * @param {Function} callbackFn - The function to execute.
         * @returns {Promise<void>} A promise that resolves when the callback is executed.
         */
        const executeWhenReady = function(callbackFn) {
          const completionPromise = promiseService.defer();

          const checkAndExecute = function() {
            if (environmentIsInitialized) { // Use the provider's initialized flag
              if (typeof callbackFn === 'function') {
                callbackFn();
              }
              completionPromise.resolve();
            } else {
              timerService(checkAndExecute, 100); // Slightly increased polling interval for service
            }
          };
          timerService(checkAndExecute, 10); // Start check with a small delay

          return completionPromise.promise;
        };

        return {
          /**
           * Registers a listener for the hardware back button event.
           * This is primarily relevant for hybrid platforms.
           * @param {function} handlerCallback - The function to call when the back button is pressed.
           */
          onNativeBackButton: function(handlerCallback) {
            if (typeof handlerCallback !== 'function') {
              console.error('DeviceEnvironment: Invalid callback provided for onNativeBackButton.');
              return;
            }
            executeWhenReady(function() {
              document.addEventListener('backbutton', handlerCallback, false);
              backButtonListeners.push(handlerCallback); // Keep track of listeners
            });
          },

          /**
           * Removes a previously registered hardware back button listener.
           * @param {function} handlerFunction - The exact function reference that was originally bound.
           */
          offNativeBackButton: function(handlerFunction) {
            if (typeof handlerFunction !== 'function') {
              console.error('DeviceEnvironment: Invalid function provided for offNativeBackButton.');
              return;
            }
            executeWhenReady(function() {
              document.removeEventListener('backbutton', handlerFunction);
              // Remove from our internal tracking array
              backButtonListeners = backButtonListeners.filter(listener => listener !== handlerFunction);
            });
          },

          /**
           * Triggers a callback once the device environment is fully ready.
           * If already ready, the callback executes immediately.
           * @param {function} completionHandler - The function to execute upon readiness.
           * @returns {Promise<void>} A promise that resolves when the environment is ready.
           */
          whenReady: function(completionHandler) {
            return executeWhenReady(completionHandler);
          },

          /**
           * Retrieves the currently detected environment type. (New Type III functionality)
           * @returns {string} The environment type ('browser' or 'hybrid').
           */
          getEnvironmentType: function() {
            return detectedEnvironment;
          },

          /**
           * Clears all registered native back button listeners. (New Type III functionality)
           */
          clearAllNativeBackButtonListeners: function() {
            executeWhenReady(() => {
              backButtonListeners.forEach(listener => {
                document.removeEventListener('backbutton', listener);
              });
              backButtonListeners = [];
              console.info('DeviceEnvironment: All native back button listeners cleared.');
            });
          }
        };
      }]
    };
  });

})(myApp.core || (myApp.core = {})); // Using a global namespace for ionic.Platform.detect() equivalent

angular.module('myApp.utilities.alertManager', ['myApp.utilities.resourceFetcher'])
.factory('AlertManagerService', [
  '$rootScope',
  '$document',
  '$compile',
  '$q',
  'ResourceFetcher',
  function(appRootScope, docReference, templateCompiler, promiseService, dataRetriever) {
    let currentlyActiveDialog = null; // Tracks a single active dialog instance globally

    /**
     * Retrieves the scope of an existing popup element if found.
     * @param {string} selector - CSS selector for the popup element.
     * @returns {object|null} The Angular scope of the popup, or null if not found.
     */
    const findExistingDialogScope = function(selector) {
      const foundElements = angular.element(docReference[0].querySelector(selector));
      if (foundElements.length) {
        const foundScope = foundElements.scope();
        if (foundScope && foundScope.dialogInstance) {
          return foundScope;
        }
      }
      return null;
    };

    /**
     * Internal function to create and show a generic dialog.
     * @param {object} dialogConfig - Configuration object for the dialog.
     * @param {object} [parentScope=appRootScope] - Optional parent scope for the dialog.
     * @returns {object} The dialog instance with control methods.
     */
    const createAndShowDialog = function(dialogConfig, parentScope = appRootScope) {
      // If an alert is already visible, hide it first.
      if (currentlyActiveDialog) {
        currentlyActiveDialog.dismiss();
      }

      const mergedConfig = {
        titleText: '',
        messageHtml: '',
        buttons: [{ text: 'OK', type: 'button-primary' }],
        animationClass: 'fade-in-scale',
        ...dialogConfig
      };

      const dialogScope = parentScope.$new(true);
      Object.assign(dialogScope, mergedConfig);

      // Compile the custom dialog directive
      const dialogElement = templateCompiler(`
        <app-dialog-container title-content="titleText" message-content="messageHtml"
                              button-collection="buttons" animation-type="animationClass"
                              on-button-click="handleDialogButtonClick($index)"></app-dialog-container>
      `)(dialogScope);
      docReference[0].body.appendChild(dialogElement[0]);

      // Assuming myApp.views.DialogComponent is the underlying UI component
      // NOTE: This assumes myApp.views.DialogComponent has a 'show' method
      // which takes an object with title, template, and buttons.
      const dialogInstance = new myApp.views.DialogComponent({
        parentElement: dialogElement[0],
        animation: mergedConfig.animationClass
      });

      dialogInstance.show({
        title: mergedConfig.titleText,
        template: mergedConfig.messageHtml,
        buttons: mergedConfig.buttons
      });

      dialogScope.dialogInstance = dialogInstance; // Expose to scope
      dialogInstance.scope = dialogScope; // Also expose scope on the instance for prompt input
      currentlyActiveDialog = dialogInstance;

      // Enhance the dialog instance with a dismiss method for external control
      dialogInstance.dismiss = function() {
        dialogInstance.hide();
        dialogElement.remove();
        dialogScope.$destroy();
        if (currentlyActiveDialog === dialogInstance) {
          currentlyActiveDialog = null;
        }
      };

      // Handle button clicks from inside the dialog
      dialogScope.handleDialogButtonClick = function(buttonIndex) {
        const button = mergedConfig.buttons[buttonIndex];
        if (button && typeof button.onClick === 'function') {
          button.onClick(dialogInstance); // Pass dialog instance to callback
        }
        dialogInstance.dismiss();
      };

      return dialogInstance;
    };

    return {
      /**
       * Displays a simple alert dialog with a message and an OK button.
       * @param {string} contentMessage - The message to display.
       * @param {object} [options={}] - Additional options like title or custom scope.
       * @returns {object} The alert dialog instance.
       */
      showAlert: function(contentMessage, options = {}) {
        if (!contentMessage) {
          console.warn('AlertManagerService: No message provided for alert. Aborting.');
          return null;
        }

        // Check for existing alert and reuse if possible (Type III: simplified re-use)
        const existingScope = findExistingDialogScope('.app-dialog-container');
        if (existingScope && existingScope.dialogInstance) {
          // Assume the existing dialog component has an update method
          if (typeof existingScope.dialogInstance.updateContent === 'function') {
            existingScope.dialogInstance.updateContent(contentMessage, options.title || 'Attention');
            existingScope.dialogInstance.show();
            return existingScope.dialogInstance;
          } else {
            console.warn('AlertManagerService: Existing dialog instance does not support content updates. Creating new.');
            existingScope.dialogInstance.dismiss(); // Fallback to dismissing old
          }
        }

        const config = {
          titleText: options.title || 'Attention',
          messageHtml: contentMessage,
          buttons: [{
            text: options.okText || 'OK',
            type: 'button-positive',
            onClick: options.onOk || (() => {})
          }]
        };
        return createAndShowDialog(config, options.scope);
      },

      /**
       * Displays a confirmation dialog with configurable buttons.
       * @param {string} contentMessage - The message to display.
       * @param {Function} confirmCallback - Callback for confirmation.
       * @param {object} [options={}] - Options like title, button texts.
       * @returns {object} The confirm dialog instance.
       */
      showConfirm: function(contentMessage, confirmCallback, options = {}) {
        const config = {
          titleText: options.title || 'Confirm Action',
          messageHtml: contentMessage,
          buttons: [
            {
              text: options.cancelText || 'Cancel',
              type: 'button-light',
              onClick: () => confirmCallback(false)
            },
            {
              text: options.confirmText || 'Confirm',
              type: 'button-balanced',
              onClick: () => confirmCallback(true)
            }
          ]
        };
        return createAndShowDialog(config, options.scope);
      },

      /**
       * Displays a prompt dialog with an input field. (New Type III functionality)
       * @param {string} contentMessage - The message to display.
       * @param {Function} promptCallback - Callback for input value.
       * @param {object} [options={}] - Options like title, input type, default value.
       * @returns {object} The prompt dialog instance.
       */
      showPrompt: function(contentMessage, promptCallback, options = {}) {
        const deferredPrompt = promiseService.defer();
        const config = {
          titleText: options.title || 'Enter Value',
          messageHtml: `
            <p>${contentMessage}</p>
            <input type="${options.inputType || 'text'}" placeholder="${options.placeholder || ''}"
                   value="${options.defaultValue || ''}" ng-model="promptInput.value" class="dialog-input">
          `,
          buttons: [
            {
              text: options.cancelText || 'Cancel',
              type: 'button-light',
              onClick: () => deferredPrompt.resolve(null)
            },
            {
              text: options.okText || 'Submit',
              type: 'button-positive',
              onClick: (dialogInst) => {
                deferredPrompt.resolve(dialogInst.scope.promptInput.value);
              }
            }
          ]
        };
        const dialogInstance = createAndShowDialog(config, options.scope);
        // Attach an object to scope for ng-model binding
        dialogInstance.scope.promptInput = { value: options.defaultValue || '' };
        deferredPrompt.promise.then(promptCallback); // Resolve promise to callback
        return dialogInstance;
      },

      /**
       * Shows a highly customizable dialog based on a full configuration object.
       * This method can accept a template URL or a raw HTML string.
       * @param {object} fullDialogConfig - Comprehensive configuration for the dialog.
       *   Includes: templateUrl, templateHtml, title, message, buttons, scope, etc.
       * @returns {Promise<object>} A promise that resolves with the dialog instance.
       */
      showCustomDialog: function(fullDialogConfig) {
        const deferred = promiseService.defer();
        const scopeForDialog = fullDialogConfig.scope || appRootScope.$new(true);

        const processTemplate = (htmlContent) => {
          const config = {
            titleText: fullDialogConfig.title || '',
            messageHtml: htmlContent || fullDialogConfig.message || '',
            buttons: fullDialogConfig.buttons || [{ text: 'Close', type: 'button-default', onClick: () => {} }],
            animationClass: fullDialogConfig.animation || 'fade-in-scale'
          };
          const dialogInstance = createAndShowDialog(config, scopeForDialog);
          deferred.resolve(dialogInstance);
          return dialogInstance;
        };

        if (fullDialogConfig.templateUrl) {
          dataRetriever.fetch(fullDialogConfig.templateUrl).then(processTemplate).catch(err => {
            console.error('AlertManagerService: Failed to load custom dialog template:', err);
            deferred.reject(err);
          });
        } else if (fullDialogConfig.templateHtml) {
          processTemplate(fullDialogConfig.templateHtml);
        } else {
          processTemplate(fullDialogConfig.message || ''); // Fallback to message content
        }
        return deferred.promise;
      }
    };
  }
]);

angular.module('myApp.utilities.resourceFetcher', [])
.factory('ResourceFetcher', [
  '$q',
  '$http',
  '$templateCache',
  '$timeout',
  function(promiseService, httpClient, cacheStorage, timerService) {
    const fetchRetryLimit = 3; // Max number of retries for failed fetches
    const retryDelayMs = 500; // Delay between retries

    return {
      /**
       * Fetches a resource (e.g., HTML template) from a given URL.
       * Implements a retry mechanism for transient network errors.
       *
       * @param {string} resourceUrl - The URL of the resource to fetch.
       * @param {object} [fetchOptions={}] - Optional configuration for the HTTP request.
       * @returns {Promise<string>} A promise that resolves with the fetched content (trimmed string)
       *                            or rejects with an error.
       */
      fetch: function(resourceUrl, fetchOptions = {}) {
        let attemptCount = 0;

        const executeFetch = function() {
          attemptCount++;
          const finalOptions = {
            method: 'GET',
            url: resourceUrl,
            cache: cacheStorage, // Utilize Angular's template cache
            ...fetchOptions // Merge any custom options
          };

          return httpClient(finalOptions).then(function(response) {
            // Successfully fetched, resolve with trimmed data
            return response.data && typeof response.data === 'string' ? response.data.trim() : response.data;
          }).catch(function(httpError) {
            console.warn(`ResourceFetcher: Failed to fetch "${resourceUrl}" (attempt ${attemptCount}/${fetchRetryLimit}). Error:`, httpError);
            if (attemptCount < fetchRetryLimit && httpError.status >= 500) { // Retry on server errors
              // Schedule a retry after a delay
              return timerService(executeFetch, retryDelayMs * attemptCount); // Exponential backoff for retries
            } else {
              // No more retries or non-retryable error, reject the promise
              return promiseService.reject(new Error(`Failed to fetch resource from ${resourceUrl} after ${attemptCount} attempts. Status: ${httpError.status || 'unknown'}`));
            }
          });
        };

        return executeFetch(); // Start the fetch process
      }
    };
  }
]);

(function() {
  'use strict';

  angular.module('myApp.components.overlaySheet', [])
  .directive('appOverlaySheet', [
    '$document',
    '$timeout',
    function(domDocument, timerService) {
      const ESCAPE_KEY_CODE = 27; // ASCII for Escape key

      return {
        restrict: 'E', // Element directive
        scope: {
          buttonCollection: '=', // Two-way binding for buttons
          titleContent: '@', // One-way binding for title
          destructiveActionText: '@', // One-way for destructive button
          cancelActionText: '@', // One-way for cancel button
          onButtonClick: '&', // Expression binding for button click
          onDestructiveClick: '&', // Expression for destructive click
          onCancelAction: '&' // Expression for general dismissal/cancel
        },
        replace: true, // Replace the directive element with its template
        link: function(directiveScope, hostElement) {
          let debounceTimeout = null; // For debouncing events

          /**
           * Handles keyup events, specifically for the Escape key.
           * @param {KeyboardEvent} keyboardEvent - The keyboard event object.
           */
          const handleKeyUpEvent = function(keyboardEvent) {
            if (keyboardEvent.which === ESCAPE_KEY_CODE) {
              directiveScope.onCancelAction({ isCancellation: true }); // Pass argument to the parent handler
              directiveScope.$apply(); // Ensure scope updates
            }
          };

          /**
           * Handles click events on the backdrop, closing the sheet if the backdrop itself is clicked.
           * @param {MouseEvent} clickEvent - The mouse click event object.
           */
          const handleBackdropClick = function(clickEvent) {
            // Check if the click target is the host element itself (the backdrop)
            if (clickEvent.target === hostElement[0]) {
              directiveScope.onCancelAction({ isCancellation: true }); // Pass argument
              directiveScope.$apply(); // Trigger digest cycle
            }
          };

          // Register event listeners upon linking
          domDocument.on('keyup', handleKeyUpEvent);
          hostElement.on('click', handleBackdropClick);

          // Cleanup event listeners and element on scope destruction
          directiveScope.$on('$destroy', function() {
            if (debounceTimeout) {
              timerService.cancel(debounceTimeout);
            }
            hostElement.remove(); // Ensure the element is removed from DOM
            domDocument.off('keyup', handleKeyUpEvent); // Deregister keyup listener
            hostElement.off('click', handleBackdropClick); // Deregister click listener
            console.log('AppOverlaySheet: Directive scope destroyed and listeners removed.');
          });

          // Add a guard for button collection if it's not an array (Type III: validation)
          if (!Array.isArray(directiveScope.buttonCollection)) {
            directiveScope.buttonCollection = [];
            console.warn('AppOverlaySheet: buttonCollection is not an array, initializing as empty.');
          }
        },
        template: `
          <div class="app-overlay-backdrop">
            <div class="app-overlay-panel app-overlay-panel-bottom">
              <div class="app-overlay-section" ng-if="titleContent">
                <h3 class="app-overlay-title">{{ titleContent }}</h3>
              </div>
              <div class="app-overlay-section app-overlay-buttons" ng-if="buttonCollection.length > 0">
                <button type="button" class="app-button"
                        ng-click="onButtonClick({ $index: $index })"
                        ng-repeat="btn in buttonCollection track by $index">
                  {{ btn.text }}
                </button>
              </div>
              <div class="app-overlay-section" ng-if="destructiveActionText">
                <button type="button" class="app-button app-button-destructive"
                        ng-click="onDestructiveClick()">
                  {{ destructiveActionText }}
                </button>
              </div>
              <div class="app-overlay-section" ng-if="cancelActionText">
                <button type="button" class="app-button app-button-default"
                        ng-click="onCancelAction({ isCancellation: true })">
                  {{ cancelActionText }}
                </button>
              </div>
            </div>
          </div>
        `
      };
    }
  ]);
})();

(function(coreLib) {
  'use strict';
  // This module requires ngAnimate for transition effects on header elements.
  angular.module('myApp.components.topBar', ['ngAnimate'])
  // ... other components would go here, e.g., directives for the header itself
  // For brevity, we'll only provide the module definition as requested by the snippet.
})(myApp.core || (myApp.core = {}));