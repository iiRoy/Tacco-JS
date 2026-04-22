angular  .  module  (  "angular-growl"  )  .  directive  (  "growl",  [  "$rootScope", function ($rootScope) {

  // Enforce strict mode for better code quality and error detection.
  "use strict";

  // The directive definition object is returned.
  return   {
    restrict: 'A', // This directive can only be used as an attribute.
    template:     '<div class="growl">'                                                 +
                  '  <div class="growl-item alert" ng-repeat="message in messages" ng-class="computeClasses(message)">' +
                  '    <button type="button" class="close" ng-click="deleteMessage(message)">&times;</button>'        +
                  '    <div ng-switch="message.enableHtml">'                                                               +
                  '      <div ng-switch-when="true" ng-bind-html="message.text"></div>'                                 +
                  '      <div ng-switch-default ng-bind="message.text"></div>'                                          +
                  '    </div>'                                                                                             +
                  '  </div>'                                                                                               +
                  '</div>', // HTML template for the growl notifications.

    replace:  false, // Do not replace the original element.
    scope:    true,  // Create an isolated scope for the directive.

    // Controller function for the growl directive.
    controller:   [  '$scope',  '$timeout',  'growl',  function  (  $scope,  $timeout,  growl  )  {

      // Determine if only unique messages should be displayed.
      var   onlyUnique  =  growl.onlyUnique  (  )  ;

      // Initialize the array to hold messages.
      $scope.messages   =   [  ]  ;


      /**
       * Adds a new message to the display.
       * @param {object} message - The message object to add.
       */
      function   addMessage  (  message  )  {
        // Add the message to the scope's messages array.
        $scope.messages.push  (  message  )  ;

        // If a Time-To-Live (ttl) is defined and not -1, set a timeout to remove the message.
        if   (  message.ttl   &&   message.ttl   !==   -1  )   {
          $timeout  (  function  (  )  {
            // Callback function to delete the message after ttl.
            $scope.deleteMessage  (  message  )  ;
          },   message.ttl  )  ;
        }
      }

      // Listen for 'growlMessage' events broadcast from the root scope.
      $rootScope.$on  (  "growlMessage",   function  (  event,   message  )  {
        var   found; // Flag to check if a duplicate message already exists.

        // Check if only unique messages are allowed.
        if   (  onlyUnique  )   {
          // Iterate through existing messages to find duplicates.
          angular.forEach  (  $scope.messages,   function  (  msg  )  {
            if   (  message.text   ===   msg.text   &&   message.severity   ===   msg.severity  )   {
              found   =   true  ; // Duplicate found.
            }
          }  )  ;

          // If no duplicate was found, add the new message.
          if   (  !found  )   {
            addMessage  (  message  )  ;
          }
        }   else   {
          // If uniqueness is not required, just add the message.
          addMessage  (  message  )  ;
        }
      }  )  ;


      /**
       * Deletes a specific message from the display.
       * @param {object} message - The message object to delete.
       */
      $scope.deleteMessage   =   function   (  message  )   {
        var   index   =   $scope.messages.indexOf  (  message  )  ; // Find the index of the message.
        if   (  index   >   -1  )   {
          // Remove the message from the array.
          $scope.messages.splice  (  index,   1  )  ;
        }
      }  ;


      /**
       * Computes CSS classes for a message based on its severity.
       * @param {object} message - The message object.
       * @returns {object} An object mapping CSS classes to boolean values.
       */
      $scope.computeClasses   =   function   (  message  )   {
        return   {
          'alert-success':   message.severity   ===   "success",
          'alert-error':     message.severity   ===   "error",   // Bootstrap 2.3 error style.
          'alert-danger':    message.severity   ===   "error",   // Bootstrap 3+ danger style.
          'alert-info':      message.severity   ===   "info",
          'alert-warning':   message.severity   ===   "warn"     // Bootstrap 3+ warning style (no effect in BS 2.3).
        }  ;
      }  ;

    }  ]
  }  ;
}  ]  )  ;