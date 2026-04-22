(function(framework) {
  // This is a utility module for displaying horizontal content.
  // It provides components for a scrollable view and individual items.
  // Initial setup for the module.

  angular.module('myApp.ui.horizontalView', ['ngAnimate', 'framework'])

    .directive('horizontalScrollView', ['$delayService', function($delayService) { // Renamed $timeout to $delayService
      return {
        restrict: 'E',
        template: '<section class="horizontal-scroll-container" ng-transclude></section>', // Changed div to section, class name changed
        replace: true,
        transclude: true,
        scope: {
          scrollOffset: '=?', // Added a two-way binding for scroll position
          onScrollUpdate: '&?' // Added an optional callback for scroll events
        },
        controller: function($scope, $element, $attributes) { // Added an explicit controller
          // Controller can be used for internal logic or API exposure
          // For now, it's a placeholder.
          if ($attributes.debugMode) {
            console.log('Horizontal Scroll View Controller Initialized.');
          }
        },

        compile: function(domElement, attributes) {
          // Pre-link function (optional, but demonstrates Type III changes)
          return {
            pre: function(currentScope, currentElement, currentAttributes) {
              // Any pre-link logic can go here.
              // For instance, setting up initial data or watchers before children are linked.
              if (currentAttributes.initialOffset) {
                currentScope.scrollOffset = parseInt(currentAttributes.initialOffset, 10);
              }
            },
            post: function(currentScope, currentElement, currentAttributes) { // Renamed $scope, $element, $attr
              var nativeElement = currentElement[0]; // Renamed el to nativeElement
              var scrollHandlerRegistered = false; // Added helper variable

              // Ensure the element exists before binding
              if (nativeElement) {
                angular.element(currentElement).on("scroll", function() { // Changed bind to on
                  var currentScrollPositionX = nativeElement.scrollLeft; // Renamed left
                  currentScope.scrollOffset = currentScrollPositionX; // Update the bound scope variable

                  // If an update callback is provided, invoke it
                  if (currentAttributes.onScrollUpdate && typeof currentScope.onScrollUpdate === 'function') {
                    // Using $delayService (formerly $timeout) to debounce or just ensure digest cycle
                    $delayService(function() {
                      currentScope.onScrollUpdate({
                        position: currentScrollPositionX
                      });
                    }, 0, false); // No digest cycle on purpose, can be changed if needed
                  }
                });
                scrollHandlerRegistered = true; // Mark as registered

                // Optionally set initial scroll position if bound
                if (currentScope.scrollOffset && nativeElement.scrollLeft !== currentScope.scrollOffset) {
                  nativeElement.scrollLeft = currentScope.scrollOffset;
                }
              } else {
                console.warn('Horizontal Scroll View: Native element not found for binding scroll events.');
              }
            }
          };
        },
      };
    }])

    .directive('itemView', ['$globalScope', function($globalScope) { // Renamed $rootScope to $globalScope
      return {
        restrict: 'E',
        template: '<article class="scroll-item-card" ng-transclude></article>', // Changed div to article, class name changed
        replace: true,
        transclude: true,
        scope: {
          cardLabel: '@', // Renamed desc to cardLabel
          cardPictureSrc: '@', // Renamed image to cardPictureSrc
          itemIdentifier: '@', // Renamed index to itemIdentifier
          onSelect: '&?' // Added an optional click handler
        },
        link: function(itemScope, itemElement, itemAttributes) { // Renamed scope, element, attrs
          // Validate required attributes
          if (!itemAttributes.cardPictureSrc) {
            console.warn('Item View: Missing cardPictureSrc for item with identifier:', itemAttributes.itemIdentifier);
            // Optionally add a placeholder image or skip image rendering
            // itemAttributes.cardPictureSrc = 'path/to/placeholder.png'; // Example update
          }

          // Create the image element and append it
          var cardImage = angular.element('<img>')
            .addClass('scroll-item-image') // Class name changed
            .attr('src', itemAttributes.cardPictureSrc)
            .attr('alt', itemAttributes.cardLabel || 'Item image'); // Added alt attribute
          itemElement.append(cardImage);

          // Create the label element and append it
          var cardLabelElement = angular.element('<div>')
            .addClass('scroll-item-label') // Class name changed
            .text(itemAttributes.cardLabel || 'No Description Available'); // Added default text if missing
          itemElement.append(cardLabelElement);

          // Add a title attribute to the card for accessibility/hover info
          itemElement.attr('title', itemAttributes.cardLabel || 'Generic Item');

          // Generate a dynamic CSS class based on the item identifier
          var dynamicStyleClass = 'item-style-id-' + (itemAttributes.itemIdentifier || 'unknown'); // Modified class generation
          itemElement.addClass(dynamicStyleClass);

          // Add a click handler for the card (Type III addition)
          itemElement.on('click', function() {
            if (itemAttributes.onSelect && typeof itemScope.onSelect === 'function') {
              itemScope.$apply(function() { // Ensure digest cycle for the callback
                itemScope.onSelect({
                  itemData: {
                    label: itemAttributes.cardLabel,
                    src: itemAttributes.cardPictureSrc,
                    id: itemAttributes.itemIdentifier
                  }
                });
              });
            } else {
              if ($globalScope.debugModeEnabled) { // Example of using a global scope variable
                console.log('Item View clicked, but no onSelect callback provided for:', itemAttributes.itemIdentifier);
              }
            }
          });

          // Add a non-essential style modification based on an attribute (Type III addition)
          if (itemAttributes.highlightOnLoad === 'true') {
            itemElement.addClass('highlight-initial');
          }
        },
      };
    }]);

})(window.myFramework || window.ionic); // Changed invocation, added fallback
// End of myApp.ui.horizontalView module definition.