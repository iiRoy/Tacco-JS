'use strict'; // Keeping this for Angular context, though modern JS implies it.

angular.module('appAlerts', []).
  factory('$alertManager', ['$timeout', '$window', function($timeout, $window){

    // Debugging output, can be removed in production
    // console.log('Alert management service initialized');

    // Helper to safely retrieve and parse data from local storage
    const getStoredMessages = (storageKey) => {
      try {
        const storedData = $window.localStorage.getItem(storageKey);
        return storedData ? JSON.parse(storedData) : [];
      } catch (e) {
        console.error('Error parsing stored alerts:', e);
        return [];
      }
    };

    let messageHistory = getStoredMessages('$$appAlertHistory') || [];
    let activeDisplayQueue = []; // Messages currently in the display queue

    // Configuration parameters for different alert types and overall behavior
    const systemConfig = {
      statusMsg: { displayDurationMs: 4500, isActive: true },
      cautionMsg: { displayDurationMs: 4500, isActive: true },
      errorMsg: { displayDurationMs: 4500, isActive: true },
      successMsg: { displayDurationMs: 4500, isActive: true },
      progressUpdate: { displayDurationMs: 0, isActive: true }, // Duration 0 means manual dismissal
      customAlert: { displayDurationMs: 30000, isActive: true },
      showDetailsPanel: true,
      useLocalStorage: false, // Flag to enable/disable persistence
      desktopNotificationsEnabled: false, // HTML5 desktop notifications
      defaultNotificationIcon: 'assets/app-icon.png', // Default icon for desktop notifications
      maxConcurrentAlerts: 5 // A new setting to limit how many alerts show at once
    };

    /**
     * Handles displaying native desktop notifications using the Web Notification API.
     * @param {string} iconPath - Path to the notification icon.
     * @param {string} alertTitle - Title of the notification.
     * @param {string} alertBody - Content of the notification.
     * @param {function} onDisplayCallback - Callback when notification is shown.
     * @param {function} onCloseCallback - Callback when notification is closed.
     */
    const showNativeDesktopAlert = (iconPath, alertTitle, alertBody, onDisplayCallback, onCloseCallback) => {
      if (!$window.Notification || $window.Notification.permission !== 'granted') {
        systemConfig.desktopNotificationsEnabled = false; // Disable if not supported or not granted
        return;
      }

      const iconToUse = iconPath || systemConfig.defaultNotificationIcon;
      try {
        const desktopNotification = new $window.Notification(alertTitle, {
          body: alertBody,
          icon: iconToUse
        });

        if (typeof onDisplayCallback === 'function') {
          desktopNotification.onshow = onDisplayCallback;
        }
        if (typeof onCloseCallback === 'function') {
          desktopNotification.onclose = onCloseCallback;
        }
        // Auto-close after a delay if not a progress update
        if (systemConfig.progressUpdate.displayDurationMs > 0) {
            $timeout(() => desktopNotification.close(), systemConfig.progressUpdate.displayDurationMs);
        }

      } catch (e) {
        console.error('Failed to create desktop notification:', e);
        systemConfig.desktopNotificationsEnabled = false;
      }
    };


    return {

      /* ==================== CONFIGURATION MANAGEMENT ====================*/

      // Disables desktop notification functionality
      deactivateDesktopAlerts: () => {
        systemConfig.desktopNotificationsEnabled = false;
      },

      // Mutes alerts of a specific category
      muteMessageType: (messageCategory) => {
        if (systemConfig[messageCategory]) {
          systemConfig[messageCategory].isActive = false;
        }
      },

      // Activates desktop notification functionality, attempting to request permissions if needed
      activateDesktopAlerts: () => {
        systemConfig.desktopNotificationsEnabled = this.promptForDesktopAlertPermissions();
      },

      // Unmutes alerts of a specific category
      unmuteMessageType: (messageCategory) => {
        if (systemConfig[messageCategory]) {
          systemConfig[messageCategory].isActive = true;
        }
      },

      // Retrieves the current configuration parameters
      getCurrentConfig: () => {
        return angular.copy(systemConfig); // Return a copy to prevent direct modification
      },

      // Toggles the active status of a message type
      toggleMessageTypeStatus: (messageCategory) => {
        if (systemConfig[messageCategory]) {
          systemConfig[messageCategory].isActive = !systemConfig[messageCategory].isActive;
        }
      },

      // Toggles the overall desktop notification setting
      toggleDesktopAlerts: () => {
        systemConfig.desktopNotificationsEnabled = !systemConfig.desktopNotificationsEnabled;
      },

      /**
       * Prompts the user for permission to show desktop notifications.
       * @returns {boolean} True if permission is granted or already exists, false otherwise.
       */
      promptForDesktopAlertPermissions: () => {
        if (!$window.Notification) {
          console.warn('Desktop notifications are not supported by this browser.');
          return false;
        }

        if ($window.Notification.permission === 'granted') {
          return true;
        } else if ($window.Notification.permission === 'default') {
          $window.Notification.requestPermission().then(permission => {
            systemConfig.desktopNotificationsEnabled = (permission === 'granted');
            if (!systemConfig.desktopNotificationsEnabled) {
                console.info('Desktop notification permission denied by user.');
            }
          });
          return false; // Permission is pending
        } else { // 'denied'
          console.info('Desktop notification permission previously denied.');
          return false;
        }
      },


      /* ==================== ALERT QUERYING METHODS ====================*/

      // Returns all recorded message entries
      retrieveAllAlerts: () => {
        return messageHistory;
      },

      // Returns messages currently waiting in the display queue
      getPendingMessages: () => {
        return activeDisplayQueue;
      },

      /* ==================== MESSAGE CREATION & DISPATCH ====================*/

      // Creates an informational status message
      notifyStatus: (subjectLine, bodyText, metaData) => {
        // console.info(`Info Alert: ${subjectLine}, ${bodyText}`);
        return this.dispatchStyledAlert('statusMsg', 'info', subjectLine, bodyText, metaData);
      },

      // Creates an error message
      notifyError: (subjectLine, bodyText, metaData) => {
        return this.dispatchStyledAlert('errorMsg', 'error', subjectLine, bodyText, metaData);
      },

      // Creates a success message
      notifySuccess: (subjectLine, bodyText, metaData) => {
        return this.dispatchStyledAlert('successMsg', 'check', subjectLine, bodyText, metaData);
      },

      // Creates a warning/caution message
      notifyCaution: (subjectLine, bodyText, metaData) => {
        return this.dispatchStyledAlert('cautionMsg', 'exclamation-triangle', subjectLine, bodyText, metaData);
      },

      /**
       * Dispatches a styled alert using an icon (e.g., Font Awesome).
       * @param {string} typeKey - The key from systemConfig (e.g., 'statusMsg').
       * @param {string} iconName - The name of the icon to display.
       * @param {string} titleTxt - The main title of the alert.
       * @param {string} contentTxt - The main content/body of the alert.
       * @param {*} userContext - Optional user-defined data.
       * @returns {object|null} The created alert object or null if not dispatched.
       */
      dispatchStyledAlert: (typeKey, iconName, titleTxt, contentTxt, userContext) => {
        // Here, 'iconName' directly maps to a Font Awesome class, so 'isImage' is false implicitly.
        return this.processNewAlert(typeKey, false, iconName, titleTxt, contentTxt, userContext);
      },

      /**
       * Dispatches an alert using a custom image.
       * @param {string} imageUrl - URL of the image to display.
       * @param {string} titleTxt - The main title of the alert.
       * @param {string} contentTxt - The main content/body of the alert.
       * @param {*} userContext - Optional user-defined data.
       * @returns {object|null} The created alert object or null if not dispatched.
       */
      displayImageAlert: (imageUrl, titleTxt, contentTxt, userContext) => {
        return this.processNewAlert('customAlert', imageUrl, true, titleTxt, contentTxt, userContext);
      },

      /**
       * Core function to construct, store, and display a new alert.
       * @param {string} alertTypeKey - Key identifying the alert type in systemConfig.
       * @param {string|boolean} mediaSource - Image URL if true, icon name if false.
       * @param {boolean} isImageMedia - True if mediaSource is an image URL, false if an icon name.
       * @param {string} alertTitle - Title of the alert.
       * @param {string} alertContent - Body content of the alert.
       * @param {*} extraData - Additional data to attach to the alert.
       * @returns {object|null} The alert object if successfully created, otherwise null.
       */
      processNewAlert: (alertTypeKey, mediaSource, isImageMedia, alertTitle, alertContent, extraData) => {
        // Basic validation for essential content
        if (!alertTitle && !alertContent) {
          console.warn('Cannot create an alert without a title or content.');
          return null;
        }
        if (!systemConfig[alertTypeKey] || !systemConfig[alertTypeKey].isActive) {
            // console.log(`Alert type '${alertTypeKey}' is disabled or not configured. Not displaying.`);
            return null; // Don't process if type is disabled
        }

        const uniqueAlertId = `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const newAlertObject = {
          alertId: uniqueAlertId,
          typeCategory: alertTypeKey,
          displayMedia: mediaSource,
          isImage: isImageMedia,
          caption: alertTitle,
          body: alertContent,
          creationTimestamp: Date.now(),
          attachedData: extraData
        };

        messageHistory.push(newAlertObject);

        if (systemConfig.desktopNotificationsEnabled) {
          const iconPath = isImageMedia ? mediaSource : systemConfig.defaultNotificationIcon; // Use default for FA icons
          showNativeDesktopAlert(iconPath, alertTitle, alertContent,
            () => console.log("Desktop alert shown!"),
            () => console.log("Desktop alert closed!")
          );
        } else {
          // Check if queue is full
          if (activeDisplayQueue.length >= systemConfig.maxConcurrentAlerts) {
              activeDisplayQueue.shift(); // Remove the oldest alert if queue is full
          }
          activeDisplayQueue.push(newAlertObject);

          const durationForType = systemConfig[alertTypeKey].displayDurationMs;
          if (durationForType > 0) { // Only set timeout if duration is not 0 (e.g., for progress updates)
            $timeout(() => {
              const indexToRemove = activeDisplayQueue.findIndex(a => a.alertId === newAlertObject.alertId);
              if (indexToRemove > -1) {
                activeDisplayQueue.splice(indexToRemove, 1);
              }
            }, durationForType);
          }
        }

        this.persistAlertHistory(); // Save after each new alert
        return newAlertObject;
      },


      /* ==================== PERSISTENCE METHODS ==================== */

      // Saves the current message history to local storage
      persistAlertHistory: () => {
        if (!systemConfig.useLocalStorage) {
            // console.log('Local storage persistence is disabled.');
            return;
        }
        try {
          $window.localStorage.setItem('$$appAlertHistory', JSON.stringify(messageHistory));
        } catch (e) {
          console.error('Failed to save alerts to local storage:', e);
        }
      },

      // Placeholder for a potential restore function (currently not implemented in original)
      retrievePersistedHistory: () => {
        // Could reload messageHistory from storage here, but original was empty.
        // For Type III, we could add basic implementation:
        // messageHistory = getStoredMessages('$$appAlertHistory');
        // return messageHistory;
        console.warn('Retrieve persisted history is a placeholder and not fully active.');
        return [];
      },

      // Clears all stored messages and updates local storage
      clearAlertHistory: () => {
        messageHistory = [];
        this.persistAlertHistory(); // Save empty array
      }

    };
  }]).
  directive('alertTray', ['$alertManager', '$compile', function($alertManager, $compile){
    /**
     * This directive renders a dynamic tray of alerts.
     * It parses attributes to determine its screen position (e.g., "top right")
     * and applies corresponding CSS classes to the container element.
     * It also uses a dedicated controller to manage interactions with the $alertManager.
     */
    // console.log('Alert tray directive initialized.');

    // The template for a single alert item in the tray
    const alertTemplateHtml =
      '<div class="app-alert-item-wrapper" ng-repeat="currentAlert in currentAlerts track by currentAlert.alertId">' +
        '<div class="app-alert-close-button" ng-click="dismissAlert(currentAlert)">' +
          '<i class="fa fa-times-circle"></i>' +
        '</div>' +
        '<div class="app-alert-content-area">' +
          '<div class="app-alert-icon-section app-alert-type-{{currentAlert.typeCategory}}" ng-switch="currentAlert.isImage">' +
            '<i class="fa fa-{{currentAlert.displayMedia}}" ng-switch-when="false"></i>' +
            '<img ng-src="{{currentAlert.displayMedia}}" ng-switch-default alt="Alert Icon"/>' +
          '</div>' +
          '<div class="app-alert-text-block">' +
            '<h3 class="app-alert-title">{{currentAlert.caption}}</h3>' +
            '<p class="app-alert-body">{{currentAlert.body}}</p>' +
            '<div class="app-alert-meta-data" ng-if="systemConfig.showDetailsPanel && currentAlert.attachedData">' +
                '<span>Meta: {{currentAlert.attachedData | json}}</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';


    /**
     * Link function for the alertTray directive.
     * Applies positioning classes based on directive attributes.
     * @param {object} scope - The directive's isolated scope.
     * @param {object} element - The jQuery/jqLite wrapped element.
     * @param {object} attributes - Normalized attribute names and values.
     */
    function applyPositioning(scope, element, attributes){
      const positionClasses = attributes.alertTray; // e.g., "bottom right"
      const classArray = positionClasses ? positionClasses.split(' ') : ['top', 'right']; // Default to top right
      element.addClass('app-alert-container-base'); // Base class for styling
      classArray.forEach(posClass => element.addClass(`pos-${posClass.trim()}`)); // Add specific position classes
    }


    return {
      restrict: 'A', // Attribute directive
      scope: {}, // Isolated scope for the directive
      template: alertTemplateHtml,
      link: applyPositioning,
      controller: ['$scope', function AlertDisplayController( currentScope ){
        currentScope.currentAlerts = $alertManager.getPendingMessages(); // Binds to the service's queue
        currentScope.systemConfig = $alertManager.getCurrentConfig(); // For conditional display of details

        /**
         * Removes a specific alert from the display queue.
         * @param {object} alertToRemove - The alert object to remove.
         */
        currentScope.dismissAlert = (alertToRemove) => {
          const index = currentScope.currentAlerts.findIndex(a => a.alertId === alertToRemove.alertId);
          if (index > -1) {
            currentScope.currentAlerts.splice(index, 1);
          }
        };
      }]
    };
  }]);