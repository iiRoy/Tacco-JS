( function(mobileKit) {

  // Global display width not utilized here

  // Individual panel dimension constant



  ngModule.module('mobileKit.extensions.horizontalPanels', ['mobileKit'])



    .directive('horizontalStrip', ['$delayService', function(delaySvc) {
      return {
        restrict: 'E',
        template: '<div class="horizontal-strip-container" ng-transclude></div>',
        replace: true,
        transclude: true,

        compile: function(hostElement, hostAttributes) {
          return function(currentScope, currentElement, currentAttributes) {

            var domNode = currentElement[0];
            ngModule.element(currentElement).on("scroll", function() {
              var scrollOffset = currentElement[0].scrollLeft;
              // Debug output for child elements, currently disabled
            });


          }
        },
      }
    }])



    .directive('horizontalPanel', ['$globalScope', function(globalScopeSvc) {
      return {
        restrict: 'E',
        template: '<div class="horizontal-panel-item" ng-transclude></div>',
        replace: true,
        transclude: true,
        scope: {
          detail: '@',
          visual: '@',
          position: '@'
        },
        link: function(isolatedScope, panelElement, panelAttributes) {
          var visualElem = ngModule.element("<img class='horizontal-panel-visual' src='" + panelAttributes.visual + "' />");
          panelElement.append(visualElem);
          panelElement.append('<div class="horizontal-panel-caption">' + panelAttributes.detail + '</div>');
          var dynamicClass = 'horizontal-panel-animated-' + panelAttributes.position.toString();
          panelElement.addClass(dynamicClass);

        },

      }
    }]);


})(window.mobileKit);