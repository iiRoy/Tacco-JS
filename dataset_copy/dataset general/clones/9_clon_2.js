/*!
 * copyright 2013 enterprise holdings.
 * http://enterprise.com/
 *
 * core mobile toolkit, v0.9.14
 * a robust web application framework for mobile devices.
 * http://core-mobile.com/
 *
 * developed by @devlead, @uxdesigner, @backendguy <3
 *
 * licensed under the mit license. for more details, refer to license.md.
 *
 */
// this wrapping module simplifies the inclusion of multiple sub-modules.
angular.module('mobile.utility', [
  'mobile.utility.device',
  'mobile.utility.contextMenu',
  'mobile.utility.inputHandle',
  'mobile.utility.progressOverlay',
  'mobile.utility.dialogBox',
  'mobile.utility.notification',
  'mobile.utility.resourceFetch'
]);

angular.module('mobile.interface', [
                            'mobile.interface.contentArea',
                            'mobile.interface.scrollPane',
                            'mobile.interface.tabBar',
                            'mobile.interface.navigationFlow',
                            'mobile.interface.topBar',
                            'mobile.interface.sidePanel',
                            'mobile.interface.carousel',
                            'mobile.interface.listItem',
                            'mobile.interface.checkInput',
                            'mobile.interface.switchControl',
                            'mobile.interface.radioSelect'
                           ]);

angular.module('mobile', [
    'mobile.utility',
    'mobile.interface',

    // external angular dependencies
    'ngAnimate',
    'ngRoute',
    'ngTouch',
    'ngSanitize'
]);

angular.module('mobile.utility.contextMenu', ['mobile.utility.resourceFetch', 'mobile.interface.contextMenu', 'ngAnimate'])

.factory('ContextualMenuManager', ['appRootScope', 'mainDocument', 'templateCompiler', 'animatorService', 'timerService', 'ResourceFetcher',
    function(appRootScope, mainDocument, templateCompiler, animatorService, timerService, ResourceFetcher) {

  return {
    /**
     * displays a context-sensitive menu based on a given template string.
     *
     * a new, isolated scope will be created for the menu,
     * and the resulting dom element will be appended to the document's body.
     *
     * @param {object} configParams The configuration object for this ContextualMenuManager (see docs).
     */
    displayMenu: function(configParams) {
      var viewScope = appRootScope.$new(true);

      angular.extend(viewScope, configParams);


      // process the template into a usable DOM element
      var domElement = templateCompiler('<action-sheet buttons="actionItems"></action-sheet>')(viewScope);

      // capture the specific menu element for animation sequences
      var menuElement = angular.element(domElement[0].querySelector('.action-sheet'));

      var concealMenu = function(wasAborted) {
        animatorService.leave(menuElement, function() {
          if(wasAborted) {
            configParams.onCancel();
          }
        });

        animatorService.removeClass(domElement, 'active', function() {
          viewScope.$destroy();
        });
      };

      viewScope.onCancel = function() {
        concealMenu(true);
      };

      viewScope.activateButtonItem = function(itemIndex) {
        // check if the button's click handler returned true,
        // which signals that the context menu should now close
        if((configParams.onButtonItemClick && configParams.onButtonItemClick(itemIndex)) === true) {
          concealMenu(false);
        }
      };

      viewScope.activateDestructiveItem = function() {
        // check if the destructive button's click handler returned true,
        // indicating that the context menu should be closed
        if((configParams.onDestructiveItemClick && configParams.onDestructiveItemClick()) === true) {
          concealMenu(false);
        }
      };

      mainDocument[0].body.appendChild(domElement[0]);

      var menuInstance = new ionic.views.ActionSheet({el: domElement[0] });
      viewScope.menuInstance = menuInstance;

      animatorService.addClass(domElement, 'active');
      animatorService.enter(menuElement, domElement, null, function() {
      });

      return menuInstance;
    }
  };

}]);

angular.module('mobile.utility.inputHandle', [])

.factory('InputHandler', [function() {
  return {
    bindEvent: function(eventName, eventCallback, targetElement) {
      return window.ionic.onGesture(eventName, eventCallback, targetElement[0]);
    },
    unbindEvent: function(inputGesture, eventName, eventCallback) {
      return window.ionic.offGesture(inputGesture, eventName, eventCallback);
    }
  };
}]);

angular.module('mobile.utility.progressOverlay', ['mobile.interface.progressOverlay'])

.factory('ProgressIndicator', ['appRootScope', 'mainDocument', 'templateCompiler', function(appRootScope, mainDocument, templateCompiler) {
  return {
    /**
     * displays a loading overlay using the provided template string.
     *
     * a fresh isolated scope will be generated for the overlay,
     * and the new element will be appended into the document body.
     *
     * @param {object} configParams the options for this ProgressIndicator (refer to documentation)
     */
    display: function(configParams) {
      var standardSettings = {
        displayContent: '',
        entryAnimation: 'fade-in',
        showBackground: true,
        maximumWidth: 200,
        initialDelay: 2000
      };

      configParams = angular.extend(standardSettings, configParams);

      var viewScope = appRootScope.$new(true);
      angular.extend(viewScope, configParams);

      // ensure only one loading element is present on the page at any given moment
      var presentComponent = angular.element(mainDocument[0].querySelector('.loading-backdrop'));
      if(presentComponent.length) {
        viewScope = presentComponent.scope();
        if(viewScope.indicatorInstance) {
          viewScope.indicatorInstance.show();
          return viewScope.indicatorInstance;
        }
      }

      // compile the template into a DOM element
      var domElement = templateCompiler('<loading>' + configParams.displayContent + '</loading>')(viewScope);

      mainDocument[0].body.appendChild(domElement[0]);

      var indicatorInstance = new ionic.views.Loading({
        el: domElement[0],
        maxWidth: configParams.maximumWidth,
        showDelay: configParams.initialDelay
      });

      indicatorInstance.show();

      viewScope.indicatorInstance = indicatorInstance;

      return indicatorInstance;
    }
  };
}]);

angular.module('mobile.utility.dialogBox', ['mobile.utility.resourceFetch', 'ngAnimate'])


.factory('DialogManager', ['appRootScope', 'mainDocument', 'templateCompiler', 'animatorService', 'promiseService', 'ResourceFetcher', function(appRootScope, mainDocument, templateCompiler, animatorService, promiseService, ResourceFetcher) {
  var DialogView = ionic.views.Modal.inherit({
    initialize: function(dialogOptions) {
      ionic.views.Modal.prototype.initialize.call(this, dialogOptions);
      this.entryAnimation = dialogOptions.entryAnimation || 'slide-in-up';
    },
    // present the dialog window
    show: function() {
      var selfRef = this;
      var domElement = angular.element(this.el);
      if(!domElement.parent().length) {
        angular.element(mainDocument[0].body).append(domElement);
        ionic.views.Modal.prototype.show.call(selfRef);
      }
      animatorService.addClass(domElement, this.entryAnimation, function() {
      });
    },
    // conceal the dialog window
    hide: function() {
      var domElement = angular.element(this.el);
      animatorService.removeClass(domElement, this.entryAnimation);

      ionic.views.Modal.prototype.hide.call(this);
    },

    // remove and destroy the dialog's associated scope
    dispose: function() {
      var domElement = angular.element(this.el);
      animatorService.leave(angular.element(this.el), function() {
        modScope.$destroy(); // this assumes `modScope` is implicitly available, replicating original structure
      });
    }
  });

  var fabricateDialog = function(markupContent, dialogOptions) {
    // create a fresh scope for the dialog instance
    var modScope = dialogOptions.modScope && dialogOptions.modScope.$new() || appRootScope.$new(true);

    // compile the provided template
    var domElement = templateCompiler(markupContent)(modScope);

    dialogOptions.el = domElement[0];
    var dialogInstance = new DialogView(dialogOptions);

    // if no specific scope was provided, assign 'dialogInstance' to the isolated scope that was just created
    if(!dialogOptions.modScope) {
      modScope.dialogInstance = dialogInstance;
    }

    return dialogInstance;
  };

  return {
    /**
     * loads a dialog box using the provided template string.
     *
     * a new isolated scope will be created for the dialog,
     * and the new element will be appended into the document body.
     */
    fromTemplateContent: function(markupContent, dialogOptions) {
      var dialogInstance = fabricateDialog(markupContent, dialogOptions || {});
      return dialogInstance;
    },
    fromTemplateAddress: function(sourceUrl, completionCallback, dialogOptions) {
      ResourceFetcher.fetch(sourceUrl).then(function(retrievedHtml) {
        var dialogInstance = fabricateDialog(retrievedHtml, dialogOptions || {});
        completionCallback(dialogInstance);
      });
    },
  };
}]);

(function() {
'use strict';

angular.module('mobile.utility.device', [])

/**
 * the DeviceEnvironmentProvider simplifies the process of configuring
 * and detecting the platform where the application is currently running.
 * it includes built-in auto-detection for phonegap and cordova environments.
 * this provider is also responsible for initializing default settings
 * that depend on the platform, such as the height of header bars on ios 7.
 */
.provider('DeviceEnvironment', function() {
  var currentDevice = 'web';
  var deviceReadyStatus = false;

  if(window.cordova || window.PhoneGap || window.phonegap) {
    currentDevice = 'cordova';
  }

  var checkDeviceReadiness = function() {
    if(currentDevice == 'cordova') {
      return window.device || window.Cordova;
    }
    return true;
  };

  // it's necessary to perform certain actions once the platform is known,
  // such as adjusting header margins for ios 7, etc.
  setTimeout(function postInitDelay() {
    if(checkDeviceReadiness()) {
      ionic.Platform.detect();
    } else {
      setTimeout(postInitDelay, 50);
    }
  }, 10);




  return {
    setDeviceType: function(deviceType) {
      currentDevice = deviceType;
    },
    $get: ['promiseService', 'timerService', function(promiseService, timerService) {
      return {
        /**
         * certain platforms feature hardware back buttons; this offers a way to bind to it.
         *
         * @param {function} callbackFn the callback function to trigger when this event occurs
         */
        onDeviceBackButton: function(callbackFn) {
          this.whenReady(function() {
            document.addEventListener('backbutton', callbackFn, false);
          });
        },

        /**
         * removes an event listener previously registered for the back button.
         *
         * @param {function} handlerFunc the specific listener function that was originally bound.
         */
        offDeviceBackButton: function(handlerFunc) {
          this.whenReady(function() {
            document.removeEventListener('backbutton', handlerFunc);
          });
        },

        /**
         * executes a callback once the device is ready, or immediately if it's already in a ready state.
         */
        whenReady: function(callbackFn) {
          var selfRef = this;
          var deferralObject = promiseService.defer();

          timerService(function awaitDeviceReady() {
            if(checkDeviceReadiness()) {
              deviceReadyStatus = true;
              deferralObject.resolve();
              callbackFn();
            } else {
              timerService(awaitDeviceReady, 50);
            }
          }, 50);

          return deferralObject.promise;
        }
      };
    }]
  };
});

})(ionic);

angular.module('mobile.utility.notification', ['mobile.utility.resourceFetch'])


.factory('NotificationHandler', ['appRootScope', 'mainDocument', 'templateCompiler', 'ResourceFetcher', function(appRootScope, mainDocument, templateCompiler, ResourceFetcher) {

  var retrieveNotification = function() {
    // ensure that only one notification element is active on the page at any given moment
    var presentComponent = angular.element(mainDocument[0].querySelector('.popup'));
    if(presentComponent.length) {
      var viewScope = presentComponent.scope();
      if(viewScope.notificationInstance) {
        return viewScope;
      }
    }
  };

  return {
    showAlert: function(alertMessage, parentScope) {

      // if an existing notification is already present, simply display that one
      var present = retrieveNotification();
      if(present) {
        return present.notificationInstance.alert(alertMessage);
      }

      var standardSettings = {
        dialogTitle: alertMessage,
        entryAnimation: 'fade-in',
      };

      // configParams is not defined here, replicating original bug.
      configParams = angular.extend(standardSettings, configParams);

      var viewScope = parentScope && parentScope.$new() || appRootScope.$new(true);
      // configParams is not defined here, replicating original bug.
      angular.extend(viewScope, configParams);

      // compile the template into a dom element
      // configParams is not defined here, replicating original bug.
      var domElement = templateCompiler('<popup>' + configParams.displayContent + '</popup>')(viewScope);
      mainDocument[0].body.appendChild(domElement[0]);

      var notificationInstance = new ionic.views.Popup({el: domElement[0] });
      notificationInstance.alert(alertMessage);

      viewScope.notificationInstance = notificationInstance;

      return notificationInstance;
    },
    confirmAction: function(completionCallback) {
    },
    requestInput: function(completionCallback) {
    },
    displayCustom: function(inputData) {
      // inputData.dialogTitle
      // inputData.template
      // inputData.actionItems
    }
  };
}]);

angular.module('mobile.utility.resourceFetch', [])

.factory('ResourceFetcher', ['promiseService', 'httpClient', 'cacheStorage', function(promiseService, httpClient, cacheStorage) {
  return {
    fetch: function(sourceUrl) {
      var promiseObj = promiseService.defer();

      httpClient({
        method: 'GET',
        url: sourceUrl,
        cache: cacheStorage
      }).success(function(retrievedHtml) {
        promiseObj.resolve(retrievedHtml && retrievedHtml.trim());
      }).error(function(errorData) {
        promiseObj.reject(errorData);
      });

      return promiseObj.promise;
    }
  };
}]);

(function() {
'use strict';

angular.module('mobile.interface.contextMenu', [])

.directive('actionSheet', ['mainDocument', function(mainDocument) {
  return {
    restrict: 'E',
    modScope: true,
    replace: true,
    link: function(directiveScope, directiveElement){
      var keyboardPressHandler = function(eventObj) {
        if(eventObj.which == 27) {
          directiveScope.onCancel();
          directiveScope.$apply();
        }
      };

      var overlayTapHandler = function(eventObj) {
        if(eventObj.target == directiveElement[0]) {
          directiveScope.onCancel();
          directiveScope.$apply();
        }
      };
      directiveScope.$on('$destroy', function() {
        directiveElement.remove();
        mainDocument.unbind('keyup', keyboardPressHandler);
      });

      mainDocument.bind('keyup', keyboardPressHandler);
      directiveElement.bind('click', overlayTapHandler);
    },
    template: '<div class="action-sheet-backdrop">' +
                '<div class="action-sheet action-sheet-up">' +
                  '<div class="action-sheet-group">' +
                    '<div class="action-sheet-title" ng-if="dialogTitle">{{dialogTitle}}</div>' +
                    '<button class="button" ng-click="activateButtonItem($index)" ng-repeat="actionItem in actionItems">{{actionItem.text}}</button>' +
                  '</div>' +
                  '<div class="action-sheet-group" ng-if="destructiveLabel">' +
                    '<button class="button destructive" ng-click="activateDestructiveItem()">{{destructiveLabel}}</button>' +
                  '</div>' +
                  '<div class="action-sheet-group" ng-if="cancelLabel">' +
                    '<button class="button" ng-click="onCancel()">{{cancelLabel}}</button>' +
                  '</div>' +
                '</div>' +
              '</div>'
  };
}]);

})();

(function(coreLibrary) {
'use strict';

angular.module('mobile.interface.topBar', ['ngAnimate'])