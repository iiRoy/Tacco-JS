'use strict';

angular.module('alerts', []).
  factory('$alertService', ['$timer', function($timer){

    // Log that the alert management service has started up
    console.info('alert manager initialized and ready');
    var storedAlerts = JSON.parse(localStorage.getItem('$appAlerts')) || [],
        displayQueue = [];

    var configOptions = {
      informational: { displayDuration: 4500, isActive: true },
      caution: { displayDuration: 4500, isActive: true },
      critical: { displayDuration: 4500, isActive: true },
      positive: { displayDuration: 4500, isActive: true },
      ongoing: { displayDuration: 100, isActive: true },
      userDefined: { displayDuration: 30000, isActive: true },
      includeDetails: true,
      persistToStorage: false,
      browserApiMode: false,
      browserApiDefaultIcon: 'default_icon.png'
    };

    /**
     * Handles displaying alerts using the browser's native notification API.
     * @param {string} imagePath - Path to the icon image.
     * @param {string} heading - Title of the alert.
     * @param {string} messageBody - Content of the alert.
     * @param {Function} onShowCallback - Callback when the notification is shown.
     * @param {Function} onCloseCallback - Callback when the notification is closed.
     */
    function showBrowserAlert(imagePath, heading, messageBody, onShowCallback, onCloseCallback) {
      if (window.webkitNotifications.checkPermission() === 0) {
        if (!imagePath) {
          // Fallback to a default favicon if no image is provided
          imagePath = 'favicon.ico';
        }
        var currentAlert = window.webkitNotifications.createNotification(imagePath, heading, messageBody);
        if (typeof onShowCallback === 'function') {
          currentAlert.ondisplay = onShowCallback;
        }
        if (typeof onCloseCallback === 'function') {
          currentAlert.onclose = onCloseCallback;
        }
        currentAlert.show();
      } else {
        // If permissions are not granted, disable the browser API mode
        configOptions.browserApiMode = false;
      }
    }


    return {

      /* ====== CONFIGURATION MANAGEMENT FUNCTIONS ====== */

      /**
       * Deactivates the usage of the browser's native notification API.
       */
      deactivateBrowserApi: function() {
        configOptions.browserApiMode = false;
      },

      /**
       * Disables a specific alert category from being displayed.
       * @param {string} alertCategory - The type of alert to disable (e.g., 'informational', 'caution').
       */
      disableAlertType: function(alertCategory) {
        configOptions[alertCategory].isActive = false;
      },

      /**
       * Activates the usage of the browser's native notification API,
       * requesting permissions if necessary.
       */
      activateBrowserApi: function() {
        // configOptions.browserApiMode = true; // Original commented line
        configOptions.browserApiMode = this.requestBrowserApiPermissions();
      },

      /**
       * Enables a specific alert category for display.
       * @param {string} alertCategory - The type of alert to enable.
       */
      enableAlertType: function(alertCategory) {
        configOptions[alertCategory].isActive = true;
      },

      /**
       * Retrieves the current configuration options for the alert service.
       * @returns {object} The current configuration settings.
       */
      getConfigurations: function() {
        return configOptions;
      },

      /**
       * Toggles the enabled state of a specific alert category.
       * @param {string} alertCategory - The type of alert to toggle.
       */
      toggleAlertType: function(alertCategory) {
        configOptions[alertCategory].isActive = !configOptions[alertCategory].isActive;
      },

      /**
       * Toggles the enabled state of the browser's native notification API mode.
       */
      toggleBrowserApi: function() {
        configOptions.browserApiMode = !configOptions.browserApiMode;
      },

      /**
       * Requests permissions for using the browser's native notification API.
       * @returns {boolean} True if permissions are already granted, false otherwise (or if not supported).
       */
      requestBrowserApiPermissions: function() {
        if (window.webkitNotifications) {
          console.log('Browser notifications API detected');
          if (window.webkitNotifications.checkPermission() === 0) {
            return true; // Permissions already granted
          } else {
            // Request permissions from the user
            window.webkitNotifications.requestPermission(function() {
              if (window.webkitNotifications.checkPermission() === 0) {
                configOptions.browserApiMode = true; // Granted
              } else {
                configOptions.browserApiMode = false; // Denied
              }
            });
            return false; // Permissions not yet granted, awaiting user response
          }
        } else {
          console.warn('Browser notifications API not supported in this environment');
          return false; // Not supported
        }
      },


      /* ============ ALERT QUERYING FUNCTIONS ============ */

      /**
       * Returns all alerts that are currently stored in the service.
       * @returns {Array<object>} An array of all alerts.
       */
      retrieveAll: function() {
        // Provides access to all historical alerts maintained by the service
        return storedAlerts;
      },

      /**
       * Retrieves the current queue of alerts awaiting display or active display.
       * @returns {Array<object>} The array of alerts in the display queue.
       */
      getCurrentQueue: function() {
        return displayQueue;
      },

      /* ============== ALERT CREATION METHODS ============== */

      /**
       * Creates and displays an informational alert.
       * @param {string} caption - The title of the alert.
       * @param {string} message - The main content of the alert.
       * @param {any} extraData - Optional additional data to associate with the alert.
       * @returns {object} The newly created alert object.
       */
      inform: function(caption, message, extraData) {
        console.log('Informational alert:', caption, message);
        return this.createStyledAlert('informational', 'info', caption, message, extraData);
      },

      /**
       * Creates and displays a critical error alert.
       * @param {string} caption - The title of the alert.
       * @param {string} message - The main content of the alert.
       * @param {any} extraData - Optional additional data to associate with the alert.
       * @returns {object} The newly created alert object.
       */
      criticalError: function(caption, message, extraData) {
        return this.createStyledAlert('critical', 'times', caption, message, extraData);
      },

      /**
       * Creates and displays a positive confirmation alert.
       * @param {string} caption - The title of the alert.
       * @param {string} message - The main content of the alert.
       * @param {any} extraData - Optional additional data to associate with the alert.
       * @returns {object} The newly created alert object.
       */
      positiveConfirmation: function(caption, message, extraData) {
        return this.createStyledAlert('positive', 'check', caption, message, extraData);
      },

      /**
       * Creates and displays a cautionary warning alert.
       * @param {string} caption - The title of the alert.
       * @param {string} message - The main content of the alert.
       * @param {any} extraData - Optional additional data to associate with the alert.
       * @returns {object} The newly created alert object.
       */
      cautionaryWarning: function(caption, message, extraData) {
        return this.createStyledAlert('caution', 'exclamation', caption, message, extraData);
      },

      /**
       * A wrapper method to generate alerts with custom styling, typically using font-awesome icons.
       * @param {string} kind - The category of the alert (e.g., 'informational').
       * @param {string} visualIcon - The name of the font-awesome icon to display.
       * @param {string} caption - The title of the alert.
       * @param {string} message - The main content of the alert.
       * @param {any} extraData - Optional additional data.
       * @returns {object} The newly created alert object.
       */
      createStyledAlert: function(kind, visualIcon, caption, message, extraData) {
        /**
         * This method is designed to simplify the creation of alerts that
         * use icon fonts (like Font Awesome) instead of image files.
         *
         * Future enhancements could involve more flexible rendering options,
         * potentially allowing for custom colors or class assignments directly.
         */
        // Pre-processing the icon into HTML might be done here:
        // visualIcon = '<i class="fa fa-' + visualIcon + '"></i>';
        return this.generateAlert(kind, false, visualIcon, caption, message, extraData);
      },

      /**
       * A wrapper method to generate alerts that display a specific image.
       * @param {string} graphicPath - The path to the image file to display.
       * @param {string} caption - The title of the alert.
       * @param {string} message - The main content of the alert.
       * @param {any} extraData - Optional additional data.
       * @returns {object} The newly created alert object.
       */
      createImageAlert: function(graphicPath, caption, message, extraData) {
        // This method streamlines the creation of alerts that feature an image
        // rather than a symbolic icon.
        return this.generateAlert('userDefined', graphicPath, true, caption, message, extraData);
      },

      /**
       * The core method for creating and processing any type of alert.
       * @param {string} kind - The category of the alert.
       * @param {string|boolean} graphicPath - Path to an image or `false` if using an icon.
       * @param {string|boolean} visualIcon - Icon class/name or `true` if using an image.
       * @param {string} caption - The title of the alert.
       * @param {string} message - The main content of the alert.
       * @param {any} additionalInfo - Optional user-defined data.
       * @returns {object} The fully constructed alert object.
       */
      generateAlert: function(kind, graphicPath, visualIcon, caption, message, additionalInfo) {
        var newAlert = {
          'kind': kind,
          'graphicPath': graphicPath,
          'visualIcon': visualIcon,
          'caption': caption,
          'message': message,
          'timeCreated': +new Date(),
          'additionalInfo': additionalInfo
        };
        storedAlerts.push(newAlert);

        if (configOptions.browserApiMode) {
          showBrowserAlert(graphicPath, caption, message, function() {
            console.log("Browser alert displayed callback");
          }, function() {
            console.log("Browser alert closed callback");
          });
        } else {
          displayQueue.push(newAlert);
          $timer(function removeAlertFromQueue() {
            // Remove the alert from the queue after its display duration
            displayQueue.splice(displayQueue.indexOf(newAlert), 1);
          }, configOptions[kind].displayDuration);

        }

        this.storeAlerts(); // Persist changes if localStorage is enabled
        return newAlert;
      },


      /* ============ DATA PERSISTENCE METHODS ============ */

      /**
       * Saves all current alerts into the browser's local storage.
       */
      storeAlerts: function() {
        // Serializes the alerts array and stores it if persistence is configured
        if (configOptions.persistToStorage) {
          localStorage.setItem('$appAlerts', JSON.stringify(storedAlerts));
        }
      },

      /**
       * Loads alerts from local storage upon initialization.
       * (Currently this method is a placeholder and not fully implemented for dynamic loading).
       */
      loadAlerts: function() {
        // This function is intended to retrieve previously stored alerts
        // from local storage, but its implementation is pending.
      },

      /**
       * Clears all current alerts from the service and local storage.
       */
      resetAlerts: function() {
        storedAlerts = [];
        this.storeAlerts(); // Update local storage to reflect the cleared state
      }

    };
  }]).
  directive('appAlerts', ['$alertService', '$compiler', function($alertService, $compiler){
    /**
     * This directive is responsible for rendering alerts within the application's DOM.
     * It dynamically positions itself based on attributes and manages the display
     * of alerts retrieved from the $alertService.
     *
     * It also defines a controller to handle interactions like dismissing alerts.
     */
    console.debug('Initializing custom alert display directive for application alerts');
    var templateMarkup =
      '<div class="app-alert-container" ng-repeat="item in visibleQueue">' +
        '  <div class="app-alert-close" ng-click="dismissAlert(item)">' +
        '    <i class="fa fa-times"></i>' +
        '  </div>' +
        '  <div class="app-alert-card">' +
        '    <div class="app-alert-graphic app-alert-category-{{item.kind}}" ng-switch on="item.graphicPath">' +
        '      <i class="fa fa-{{item.visualIcon}}" ng-switch-when="false"></i>' +
        '      <img ng-src="{{item.graphicPath}}" ng-switch-default />' +
        '    </div>' +
        '    <div class="app-alert-content">' +
        '      <h3 class="app-alert-caption">{{item.caption}}</h3>' +
        '      <p class="app-alert-message">{{item.message}}</p>' +
        '    </div>' +
        '  </div>' +
        '</div>';


    /**
     * The linking function for the appAlerts directive.
     * Applies positioning classes to the directive's element based on attributes.
     * @param {object} scopeElement - The isolated scope of the directive.
     * @param {object} domElement - The jQuery-wrapped DOM element.
     * @param {object} attributes - The normalized list of attributes.
     */
    function setupLink(scopeElement, domElement, attributes) {
      var placement = attributes.appAlerts;
      placement = placement.split(' '); // Split position string into individual classes
      domElement.addClass('app-alert-wrapper');
      for (var idx = 0; idx < placement.length; idx++) {
        domElement.addClass(placement[idx]);
      }
    }


    return {
      restrict: 'A', // Attribute directive
      scope: {},     // Create an isolated scope for the directive
      template: templateMarkup,
      link: setupLink,
      controller: ['$controllerScope', function AlertDisplayController($controllerScope) {
        $controllerScope.visibleQueue = $alertService.getCurrentQueue(); // Bind the display queue to the scope

        /**
         * Removes a specific alert from the display queue.
         * @param {object} item - The alert object to remove.
         */
        $controllerScope.dismissAlert = function(item) {
          $controllerScope.visibleQueue.splice($controllerScope.visibleQueue.indexOf(item), 1);
        };
      }
    ]

    };
  }]);