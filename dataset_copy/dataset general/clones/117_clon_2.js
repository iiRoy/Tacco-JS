angular.module('app.utilities', []).factory('generateModal', ["$document", "$compile", "$rootScope", "$controller", "$timeout",
  function (domService, compilerService, rootScopeHandler, controllerBuilder, timerService) {
    // Define the default configuration settings for the popup window component.
    var configPresets = {
      modalId: null, // An optional unique identifier for the main popup element.
      contentTemplate: null, // Direct HTML string for the content area.
      contentTemplateUrl: null, // URL from which to load the content HTML.
      headerText: 'Information Panel', // Default text displayed in the popup's header.
      showOverlay: true, // Boolean to determine if a background overlay should be displayed.
      confirmAction: {buttonText: 'Proceed', callbackFunction: null}, // Configuration for the primary action button.
      dismissAction: {buttonText: 'Cancel', callbackFunction: null}, // Configuration for the secondary action button.
      modalController: null, // The Angular controller to associate with the popup's scope.
      overlayClass: "modal-overlay", // CSS class applied to the backdrop element.
      overlayDismiss: true, // If true, clicking the backdrop dismisses the popup.
      bottomTemplate: null, // Custom HTML string for the popup's footer.
      windowClass: "dialog-window", // CSS class applied to the main popup container.
      styleProps: { // Custom CSS properties for positioning the popup.
        topPosition: '120px',
        leftPosition: '35%',
        autoMargin: '0 auto'
      }
    };

    // Retrieve a reference to the main document body element.
    var mainBodyElement = domService.find('body');

    // This function serves as the primary entry point for creating and managing popups.
    return function DisplayPopup(contentSourceUrl /*optional resource path*/, popupOptions, injectedData) {

      // Handle cases where the 'contentSourceUrl' argument is omitted (i.e., 'popupOptions' is the first argument).
      if (angular.isObject(contentSourceUrl)) {
        injectedData = popupOptions; // Shift the second argument to 'injectedData'.
        popupOptions = contentSourceUrl; // Assign the first argument to 'popupOptions'.
      } else {
        popupOptions.contentTemplateUrl = contentSourceUrl; // If provided, set the URL in options.
      }

      // Merge the user-provided options with the predefined default settings.
      popupOptions = angular.extend({}, configPresets, popupOptions);

      var propKey; // A loop variable for iterating through object properties.
      // Construct the 'id' attribute string if a 'modalId' is specified in the options.
      var identifierAttribute = popupOptions.modalId ? ' id="' + popupOptions.modalId + '" ' : '';
      
      // Define the standard HTML for the footer buttons, used if no custom footer is provided.
      var standardFooterContent = '<button class="btn" ng-click="$popupDismiss()">{{$popupDismissLabel}}</button>' +
        '<button class="btn btn-primary" ng-click="$popupConfirm()">{{$popupConfirmLabel}}</button>';
      
      // Assemble the full footer section HTML, prioritizing custom template over standard buttons.
      var bottomSectionTemplate = '<div class="dialog-footer">' +
        (popupOptions.bottomTemplate || standardFooterContent) +
        '</div>';
      
      // Dynamically generate the HTML for the popup's main content area.
      var dialogContentArea = (function () {
        if (popupOptions.contentTemplate) {
          if (angular.isString(popupOptions.contentTemplate)) {
            // If a simple string template is provided.
            return '<div class="dialog-body">' + popupOptions.contentTemplate + '</div>';
          } else {
            // If a jQuery/JQlite wrapped object containing HTML is provided.
            return '<div class="dialog-body">' + popupOptions.contentTemplate.html() + '</div>';
          }
        } else {
          // If a template URL is specified, use ng-include for dynamic loading.
          return '<div class="dialog-body" ng-include="\'' + popupOptions.contentTemplateUrl + '\'"></div>'
        }
      })();
      
      // Create the main popup element using Angular's element wrapper.
      // The element is built with necessary classes, ID, and structural divs.
      var dialogElement = angular.element(
        '<div class="' + popupOptions.windowClass + ' fade"' + identifierAttribute + ' style="display: block;">' +
        '  <div class="dialog-container">' +
        '    <div class="dialog-content-wrapper">' +
        '      <div class="dialog-header">' +
        '        <button type="button" class="close-btn" ng-click="$popupDismiss()">&times;</button>' +
        '        <h2>{{$headerText}}</h2>' +
        '      </div>' +
        dialogContentArea +
        bottomSectionTemplate +
        '    </div>' +
        '  </div>' +
        '</div>');

      // Apply any custom CSS styles defined in 'styleProps' to the popup element.
      for (propKey in popupOptions.styleProps) {
        dialogElement.css(propKey, popupOptions.styleProps[propKey]);
      }
      
      // Prepare the HTML string for the background overlay element.
      var divMarkup = "<div ";
      if (popupOptions.overlayDismiss) {
        divMarkup += 'ng-click="$popupDismiss()"'; // Add an ng-click handler if backdrop dismissal is enabled.
      }
      divMarkup += ">";
      
      // Create the overlay element and add its specified CSS classes.
      var overlayElement = angular.element(divMarkup);
      overlayElement.addClass(popupOptions.overlayClass);
      overlayElement.addClass('visible-overlay'); // A class for visual activation.

      // Define a function to handle the Escape key press event.
      var escKeyHandler = function (keyboardEvent) {
        if (keyboardEvent.keyCode === 27) { // Check if the pressed key is Escape (keyCode 27).
          dialogScope.$popupDismiss(); // Trigger the popup's dismiss action.
        }
      };

      // Define a cleanup function to remove the popup and its overlay from the DOM.
      var disposeFunction = function () {
        mainBodyElement.unbind('keydown', escKeyHandler); // Unbind the Escape key listener.
        dialogElement.remove(); // Remove the main popup element.
        if (popupOptions.showOverlay) {
          overlayElement.remove(); // Remove the overlay if it was displayed.
        }
      };

      // Bind the Escape key handler to the document body for global dismissal.
      mainBodyElement.bind('keydown', escKeyHandler);

      var controllerInstance, localVariables;
      // Create a new isolated scope for the popup, optionally inheriting from a provided scope.
      var dialogScope = popupOptions.scope || rootScopeHandler.$new();

      // Assign properties to the newly created scope for use within the popup's template.
      dialogScope.$headerText = popupOptions.headerText;
      dialogScope.$popupClose = disposeFunction; // Function to programmatically close the popup.
      
      // Define the function for dismissing the popup.
      dialogScope.$popupDismiss = function () {
        var actionCallback = popupOptions.dismissAction.callbackFunction || disposeFunction;
        actionCallback.call(this); // Execute any custom dismiss callback.
        dialogScope.$popupClose(); // Then, close the popup.
      };
      
      // Define the function for confirming the popup's primary action.
      dialogScope.$popupConfirm = function () {
        var actionCallback = popupOptions.confirmAction.callbackFunction || disposeFunction;
        actionCallback.call(this); // Execute any custom confirm callback.
        dialogScope.$popupClose(); // Then, close the popup.
      };
      
      // Assign the button labels to the scope for display in the template.
      dialogScope.$popupConfirmLabel = popupOptions.confirmAction.buttonText;
      dialogScope.$popupDismissLabel = popupOptions.dismissAction.buttonText;

      // If a controller is specified in the options, instantiate it.
      if (popupOptions.modalController) {
        localVariables = angular.extend({$scope: dialogScope}, injectedData); // Prepare locals for controller injection.
        controllerInstance = controllerBuilder(popupOptions.modalController, localVariables); // Instantiate the controller.
        // Store the controller instance on the dialog element's data for potential internal access.
        dialogElement.contents().data('$ngControllerController', controllerInstance);
      }

      // Compile and link the popup and overlay elements against the new scope.
      compilerService(dialogElement)(dialogScope);
      compilerService(overlayElement)(dialogScope);
      
      // Append the compiled popup element to the document body.
      mainBodyElement.append(dialogElement);
      // If the overlay is enabled, append it to the document body as well.
      if (popupOptions.showOverlay) mainBodyElement.append(overlayElement);

      // Use a short timeout to apply an animation class after the element is in the DOM.
      timerService(function () {
        dialogElement.addClass('active-state'); // Trigger a CSS transition (e.g., fade-in).
      }, 200); // Delay of 200 milliseconds.
    };
  }]);