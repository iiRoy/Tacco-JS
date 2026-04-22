/*******************************************************************************
 *
 * Ionic Framework - Type I Clone
 *
 * This file contains the core Ionic JavaScript modules and services.
 * It's a Type I clone, meaning only whitespace and comments have been altered.
 *
 * Original Source: Copyright 2013 Drifty Co.
 * Web: http://drifty.com/
 * Version: v0.9.14
 *
 * Authored by: @maxlynch, @helloimben, @adamdbradley
 *
 * License: MIT - Refer to the original LICENSE for details.
 *
 ******************************************************************************/

/*
 * This section defines the main 'ionic.service' module, which acts as a wrapper
 * for various Ionic services to simplify module dependencies.
 */
angular.module (
  'ionic.service',
  [
    'ionic.service.platform',
    'ionic.service.actionSheet', // Manages action sheets
    'ionic.service.gesture',     // Provides gesture recognition utilities
    'ionic.service.loading',
    'ionic.service.modal',
    'ionic.service.popup',
    'ionic.service.templateLoad'
  ]
);

angular.module('ionic.ui',
  [
    'ionic.ui.content',
    'ionic.ui.scroll',
    'ionic.ui.tabs',
    'ionic.ui.navRouter', /* Navigation routing */
    'ionic.ui.header',
    'ionic.ui.sideMenu',
    'ionic.ui.slideBox',
    'ionic.ui.list',     // List components
    'ionic.ui.checkbox', // Checkbox component
    'ionic.ui.toggle',
    'ionic.ui.radio'
  ]
);

angular.module ( 'ionic',
  [
    'ionic.service', /* All Ionic services */
    'ionic.ui',      // All Ionic UI components

    // Standard Angular dependencies
    'ngAnimate',
    'ngRoute',
    'ngTouch',
    'ngSanitize'
  ]
);

angular
  .module('ionic.service.actionSheet', [
    'ionic.service.templateLoad',
    'ionic.ui.actionSheet',
    'ngAnimate'
  ])

  .factory('ActionSheet', [
    '$rootScope',
    '$document',
    '$compile',
    '$animate',
    '$timeout',
    'TemplateLoader',
    function(
      $rootScope,
      $document,
      $compile,
      $animate,
      $timeout,
      TemplateLoader
    ) {

      return {
        /**
         * Displays an action sheet using a given template string.
         *
         * A new isolated scope is created specifically for the action sheet,
         * and the generated element is appended directly to the document body.
         *
         * @param {object} opts Configuration options for this ActionSheet instance.
         *                      Refer to the documentation for available options.
         */
        show: function(opts) {
          var scope = $rootScope.$new(true);

          // Extend the new scope with provided options
          angular.extend(scope, opts);

          // Compile the action sheet template
          var element = $compile('<action-sheet buttons="buttons"></action-sheet>')(scope);

          // Locate the actual sheet element within the compiled structure for animation purposes
          var sheetEl = angular.element(element[0].querySelector('.action-sheet'));

          /**
           * Internal function to hide the action sheet.
           * @param {boolean} didCancel True if the sheet was hidden due to a cancellation event.
           */
          var hideSheet = function(didCancel) {
            $animate.leave(sheetEl, function() {
              if (didCancel) {
                // Execute the cancel callback if it exists and was a cancellation
                opts.cancel();
              }
            });

            // Remove the 'active' class and destroy the scope after animation
            $animate.removeClass(element, 'active', function() {
              scope.$destroy();
            });
          };

          // Scope method to handle cancellation
          scope.cancel = function() {
            hideSheet(true);
          };

          // Scope method for handling regular button clicks
          scope.buttonClicked = function(index) {
            // If the button click handler returns true, close the sheet
            if ((opts.buttonClicked && opts.buttonClicked(index)) === true) {
              hideSheet(false);
            }
          };

          // Scope method for handling destructive button clicks
          scope.destructiveButtonClicked = function() {
            // If the destructive button click handler returns true, close the sheet
            if ((opts.destructiveButtonClicked && opts.destructiveButtonClicked()) === true) {
              hideSheet(false);
            }
          };

          // Append the action sheet element to the document body
          $document[0].body.appendChild(element[0]);

          // Create a new Ionic ActionSheet view instance
          var sheet = new ionic.views.ActionSheet({
            el: element[0]
          });
          scope.sheet = sheet; // Attach the sheet instance to the scope

          // Animate the action sheet into view
          $animate.addClass(element, 'active');
          $animate.enter(sheetEl, element, null, function() {
            // Callback after enter animation completes (if needed)
          });

          return sheet;
        }
      };

    }
  ]);

angular.module('ionic.service.gesture', [])

  .factory('Gesture', [
    function() {
      // Gesture service provides wrappers for Ionic's internal gesture system.
      return {
        /**
         * Binds a callback function to a specific gesture event on an element.
         * @param {string} eventType The type of gesture event (e.g., 'swipe', 'tap').
         * @param {function} cb The callback function to execute.
         * @param {object} $element The AngularJS element to bind the gesture to.
         * @returns {object} The gesture instance.
         */
        on: function(eventType, cb, $element) {
          return window.ionic.onGesture(eventType, cb, $element[0]);
        },
        /**
         * Unbinds a gesture event listener.
         * @param {object} gesture The gesture instance returned by `on()`.
         * @param {string} eventType The type of gesture event.
         * @param {function} cb The original callback function.
         */
        off: function(gesture, eventType, cb) {
          return window.ionic.offGesture(gesture, eventType, cb);
        }
      };
    }
  ]);

angular
  .module('ionic.service.loading', ['ionic.ui.loading'])

  .factory('Loading', [
    '$rootScope',
    '$document',
    '$compile',
    function($rootScope, $document, $compile) {
      return {
        /**
         * Displays a loading overlay with customizable options.
         *
         * A new isolated scope is created for the loading spinner, and the element
         * is appended to the document body.
         *
         * @param {object} opts Options for the loading indicator.
         *   - `content`: HTML string to display inside the loading indicator.
         *   - `animation`: CSS animation class (e.g., 'fade-in').
         *   - `showBackdrop`: Whether to show a transparent backdrop.
         *   - `maxWidth`: Maximum width of the loading box.
         *   - `showDelay`: Delay before the loading indicator actually appears (in ms).
         */
        show: function(opts) {
          var defaults = {
            content: '',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 2000
          };

          // Merge default options with user-provided options
          opts = angular.extend(defaults, opts);

          var scope = $rootScope.$new(true);
          angular.extend(scope, opts);

          // Check for an existing loading element to prevent duplicates
          var existing = angular.element($document[0].querySelector('.loading-backdrop'));
          if (existing.length) {
            scope = existing.scope(); // Reuse existing scope
            if (scope.loading) {
              scope.loading.show(); // Show the existing loading instance
              return scope.loading;
            }
          }

          // Compile the loading template
          var element = $compile('<loading>' + opts.content + '</loading>')(scope);

          // Append the compiled element to the document body
          $document[0].body.appendChild(element[0]);

          // Create a new Ionic Loading view instance
          var loading = new ionic.views.Loading({
            el: element[0],
            maxWidth: opts.maxWidth,
            showDelay: opts.showDelay
          });

          loading.show(); // Display the loading indicator

          scope.loading = loading; // Attach the loading instance to the scope

          return loading;
        }
      };
    }
  ]);

angular.module('ionic.service.modal', [
    'ionic.service.templateLoad',
    'ngAnimate'
  ])

  .factory('Modal', [
    '$rootScope',
    '$document',
    '$compile',
    '$animate',
    '$q',
    'TemplateLoader',
    function(
      $rootScope,
      $document,
      $compile,
      $animate,
      $q,
      TemplateLoader
    ) {
      // Define a custom ModalView that inherits from ionic.views.Modal
      var ModalView = ionic.views.Modal.inherit({
        initialize: function(opts) {
          ionic.views.Modal.prototype.initialize.call(this, opts);
          this.animation = opts.animation || 'slide-in-up';
        },
        // Override the show method to include Angular animations
        show: function() {
          var _this = this;
          var element = angular.element(this.el);
          if (!element.parent().length) {
            // Append to body if not already present
            angular.element($document[0].body).append(element);
            ionic.views.Modal.prototype.show.call(_this);
          }
          $animate.addClass(element, this.animation, function() {
            // Callback after animation (optional)
          });
        },
        // Override the hide method to include Angular animations
        hide: function() {
          var element = angular.element(this.el);
          $animate.removeClass(element, this.animation); // Remove animation class

          ionic.views.Modal.prototype.hide.call(this); // Call parent hide method
        },

        // Override the remove method to destroy the modal scope
        remove: function() {
          var element = angular.element(this.el);
          $animate.leave(angular.element(this.el), function() {
            // Destroy the scope when the element is removed
            scope.$destroy();
          });
        }
      });

      /**
       * Helper function to create and initialize a modal.
       * @param {string} templateString The HTML template for the modal.
       * @param {object} options Configuration options for the modal.
       * @returns {ModalView} The initialized modal instance.
       */
      var createModal = function(templateString, options) {
        // Create a new isolated scope for the modal, or use a provided one
        var scope = (options.scope && options.scope.$new()) || $rootScope.$new(true);

        // Compile the template against the new scope
        var element = $compile(templateString)(scope);

        options.el = element[0]; // Set the modal element
        var modal = new ModalView(options); // Create the modal instance

        // If an isolated scope was created, assign the modal instance to it
        if (!options.scope) {
          scope.modal = modal;
        }

        return modal;
      };

      return {
        /**
         * Loads a modal from a given template string.
         *
         * An isolated scope is created, and the modal element is appended to the body.
         *
         * @param {string} templateString The HTML content of the modal.
         * @param {object} options Optional configuration for the modal.
         * @returns {ModalView} The created modal instance.
         */
        fromTemplate: function(templateString, options) {
          var modal = createModal(templateString, options || {});
          return modal;
        },
        /**
         * Loads a modal from a template URL.
         *
         * @param {string} url The URL of the modal template.
         * @param {function} cb Callback function to receive the modal instance.
         * @param {object} options Optional configuration for the modal.
         */
        fromTemplateUrl: function(url, cb, options) {
          TemplateLoader.load(url).then(function(templateString) {
            var modal = createModal(templateString, options || {});
            cb(modal); // Pass the created modal to the callback
          });
        },
      };
    }
  ]);

(function() {
  'use strict';

  angular.module('ionic.service.platform', [])

  /**
   * The PlatformProvider manages platform detection and configuration.
   * It handles auto-detection for PhoneGap/Cordova environments and
   * initializes platform-specific defaults, such as UI adjustments.
   */
  .provider('Platform', function() {
    var platform = 'web'; // Default platform
    var isPlatformReady = false; // Flag to track platform readiness

    // Detect Cordova/PhoneGap environment
    if (window.cordova || window.PhoneGap || window.phonegap) {
      platform = 'cordova';
    }

    /**
     * Checks if the underlying device platform is ready.
     * For Cordova, it checks for `window.device` or `window.Cordova`.
     * @returns {boolean} True if the platform is ready.
     */
    var isReady = function() {
      if (platform == 'cordova') {
        return window.device || window.Cordova;
      }
      return true; // Web platform is always considered ready
    };

    // Poll for platform readiness and then perform initial detection
    // This is crucial for setting up platform-specific styles and behaviors.
    setTimeout(function afterReadyWait() {
      if (isReady()) {
        ionic.Platform.detect(); // Detect specific platform (iOS, Android, etc.)
      } else {
        setTimeout(afterReadyWait, 50); // Keep polling
      }
    }, 10);


    return {
      /**
       * Manually sets the current platform.
       * @param {string} p The platform identifier (e.g., 'web', 'cordova').
       */
      setPlatform: function(p) {
        platform = p;
      },
      $get: [
        '$q',
        '$timeout',
        function($q, $timeout) {
          return {
            /**
             * Registers a callback for the hardware back button event.
             * This is primarily for Android devices.
             *
             * @param {function} cb The callback function to execute.
             */
            onHardwareBackButton: function(cb) {
              this.ready(function() {
                document.addEventListener('backbutton', cb, false);
              });
            },

            /**
             * Removes a previously registered hardware back button event listener.
             *
             * @param {function} fn The original listener function to remove.
             */
            offHardwareBackButton: function(fn) {
              this.ready(function() {
                document.removeEventListener('backbutton', fn);
              });
            },

            /**
             * Executes a callback when the device platform is ready.
             * If the platform is already ready, the callback is invoked immediately.
             *
             * @param {function} cb The callback function to execute.
             * @returns {Promise} A promise that resolves when the platform is ready.
             */
            ready: function(cb) {
              var self = this;
              var q = $q.defer();

              $timeout(function readyWait() {
                if (isReady()) {
                  isPlatformReady = true;
                  q.resolve();
                  cb(); // Execute the callback
                } else {
                  $timeout(readyWait, 50); // Continue waiting
                }
              }, 50);

              return q.promise;
            }
          };
        }
      ]
    };
  });

})(ionic);

angular
  .module('ionic.service.popup', [
    'ionic.service.templateLoad'
  ])

  .factory('Popup', [
    '$rootScope',
    '$document',
    '$compile',
    'TemplateLoader',
    function(
      $rootScope,
      $document,
      $compile,
      TemplateLoader
    ) {

      /**
       * Internal helper to retrieve an existing popup instance.
       * Ensures only one popup is active at a time.
       * @returns {object|undefined} The scope of an existing popup, or undefined.
       */
      var getPopup = function() {
        var existing = angular.element($document[0].querySelector('.popup'));
        if (existing.length) {
          var scope = existing.scope();
          if (scope.popup) {
            return scope;
          }
        }
      };

      return {
        /**
         * Displays an alert popup.
         * @param {string} message The message to display in the alert.
         * @param {object} [$scope] An optional scope to use for the popup.
         * @returns {object} The popup instance.
         */
        alert: function(message, $scope) {

          // If a popup already exists, reuse it to show the new alert
          var existing = getPopup();
          if (existing) {
            return existing.popup.alert(message);
          }

          var defaults = {
            title: message,
            animation: 'fade-in',
          };

          // `opts` is not defined in the original, assuming it should be `options` or `defaults`
          // This line will cause a reference error if `opts` is not passed in the original code.
          // However, according to Type I cloning, identifiers must remain unchanged.
          // So, `opts` remains as is, even if it's potentially an error in the original.
          opts = angular.extend(defaults, opts); // This `opts` refers to an undefined variable.

          var scope = ($scope && $scope.$new()) || $rootScope.$new(true);
          angular.extend(scope, opts); // This `opts` refers to the same undefined variable.

          // Compile the popup template
          // The `opts.content` will be undefined if `opts` was not defined prior.
          var element = $compile('<popup>' + opts.content + '</popup>')(scope);
          $document[0].body.appendChild(element[0]);

          var popup = new ionic.views.Popup({
            el: element[0]
          });
          popup.alert(message);

          scope.popup = popup;

          return popup;
        },
        /**
         * Displays a confirmation popup. (Currently a placeholder)
         * @param {function} cb Callback for confirmation result.
         */
        confirm: function(cb) {
          // TODO: Implement confirmation popup logic
        },
        /**
         * Displays a prompt popup. (Currently a placeholder)
         * @param {function} cb Callback for prompt input.
         */
        prompt: function(cb) {
          // TODO: Implement prompt popup logic
        },
        /**
         * Displays a generic custom popup. (Currently a placeholder)
         * @param {object} data Configuration data for the custom popup.
         */
        show: function(data) {
          // data.title
          // data.template
          // data.buttons
          // TODO: Implement generic show popup logic
        }
      };
    }
  ]);

angular
  .module('ionic.service.templateLoad', [])

  .factory('TemplateLoader', [
    '$q',
    '$http',
    '$templateCache',
    function($q, $http, $templateCache) {
      return {
        /**
         * Loads an HTML template from a given URL.
         * Uses `$templateCache` to prevent redundant HTTP requests.
         *
         * @param {string} url The URL of the template to load.
         * @returns {Promise} A promise that resolves with the HTML content of the template.
         */
        load: function(url) {
          var deferred = $q.defer();

          $http({
            method: 'GET',
            url: url,
            cache: $templateCache // Leverage Angular's template cache
          }).success(function(html) {
            deferred.resolve(html && html.trim()); // Resolve with trimmed HTML
          }).error(function(err) {
            deferred.reject(err); // Reject if there's an error loading
          });

          return deferred.promise;
        }
      };
    }
  ]);

(function() {
  'use strict'; // Enforce strict mode for better code quality

  angular.module('ionic.ui.actionSheet', [])

  .directive('actionSheet', [
    '$document',
    function($document) {
      return {
        restrict: 'E', // Element directive
        scope: true, // Create an isolated scope for the directive
        replace: true, // Replace the directive element with the template
        link: function($scope, $element) {
          /**
           * Handles keyboard key-up events.
           * Closes the action sheet if the Escape key (key 27) is pressed.
           * @param {Event} e The keyboard event.
           */
          var keyUp = function(e) {
            if (e.which == 27) { // Escape key
              $scope.cancel(); // Call the cancel function on the scope
              $scope.$apply(); // Manually trigger a digest cycle
            }
          };

          /**
           * Handles clicks on the backdrop.
           * Closes the action sheet if the click target is the backdrop itself.
           * @param {Event} e The click event.
           */
          var backdropClick = function(e) {
            if (e.target == $element[0]) { // Check if the click was on the backdrop element
              $scope.cancel();
              $scope.$apply();
            }
          };

          // Clean up event listeners and remove the element when the scope is destroyed
          $scope.$on('$destroy', function() {
            $element.remove();
            $document.unbind('keyup', keyUp); // Unbind keyboard listener
            // Note: backdropClick is bound to $element, which will be removed by $element.remove()
            // so explicit unbind is not strictly necessary for backdropClick, but good practice.
          });

          // Bind event listeners
          $document.bind('keyup', keyUp); // Listen for key events on the document
          $element.bind('click', backdropClick); // Listen for clicks on the action sheet backdrop
        },
        template: '<div class="action-sheet-backdrop">' +
          '<div class="action-sheet action-sheet-up">' +
          '<div class="action-sheet-group">' +
          '<div class="action-sheet-title" ng-if="titleText">{{titleText}}</div>' +
          '<button class="button" ng-click="buttonClicked($index)" ng-repeat="button in buttons">{{button.text}}</button>' +
          '</div>' +
          '<div class="action-sheet-group" ng-if="destructiveText">' +
          '<button class="button destructive" ng-click="destructiveButtonClicked()">{{destructiveText}}</button>' +
          '</div>' +
          '<div class="action-sheet-group" ng-if="cancelText">' +
          '<button class="button" ng-click="cancel()">{{cancelText}}</button>' +
          '</div>' +
          '</div>' +
          '</div>'
      };
    }
  ]);

})();

(function(ionic) {
  'use strict';

  // This module defines header-related UI components and directives.
  angular.module('ionic.ui.header', ['ngAnimate'])