ngApp.pkg('utility.popups', []).service('popupService', ["docSvc", "compSvc", "rootScopeSvc", "ctrlSvc", "delaySvc",
  function (docSvc, compSvc, rootScopeSvc, ctrlSvc, delaySvc) {
    // This object defines the base configuration for any popup window.
    // Users can override these settings when creating a new popup.
    var defaultConfiguration = {
      uniqueIdentifier: null, // A distinct ID for the popup DOM element.
      inlineContent: null,    // HTML string or jQuery-wrapped element for the popup body.
      externalContentUrl: null, // URL to an HTML template for the popup body.
      displayTitle: 'Information Window', // Text displayed in the popup header.
      showModalOverlay: true, // Whether to show a translucent overlay behind the popup.
      confirmOption: { buttonText: 'Proceed', callbackFn: null }, // Configuration for the primary action button.
      dismissOption: { buttonText: 'Close', callbackFn: null },   // Configuration for the secondary action button.
      ctrlAlias: null, // Controller reference (similar to route controllers).
      overlayStylingClass: "modal-background-shield", // CSS class for the overlay element.
      overlayDismissOnClick: true, // If true, clicking the overlay dismisses the popup.
      bottomPanelTemplate: null, // Custom HTML for the popup's footer.
      popupContainerClass: "dialog-window", // Base CSS class for the popup container.
      customStyles: { // Inline CSS properties for the popup container.
        top: '80px',
        left: '25%',
        width: '50%',
        margin: '0 auto'
      }
    };

    // Reference to the main document body for appending elements.
    var domRootBody = docSvc.find('body');

    // Ensure body exists before proceeding, crucial for DOM operations.
    if (domRootBody.length === 0) {
        console.error("Popup Service: Document body not found. Cannot create popups.");
        return function() {}; // Return a no-op function if body is missing
    }

    // Helper to generate a unique ID if one isn't provided.
    var _generateUniqueId = function() {
        return 'popup_' + Math.random().toString(36).substr(2, 9);
    };

    /**
     * Main function to create and display a popup.
     * @param {string|object} contentPathOrConfig - Either a URL for the content, or a full configuration object.
     * @param {object} [runtimeConfigOverrides] - Configuration options to merge with defaults.
     * @param {object} [injectedLocalsForController] - Local variables to inject into the controller.
     * @returns {object} The scope of the created popup.
     */
    return function PopupCreationService(contentPathOrConfig, runtimeConfigOverrides, injectedLocalsForController) {

      var runtimeConfig; // Holds the final, merged configuration.
      var actualContentUrl = null;

      // Parse input arguments to determine content source and configuration.
      if (ngApp.isObject(contentPathOrConfig)) {
        // If the first argument is an object, it's the config itself.
        injectedLocalsForController = runtimeConfigOverrides;
        runtimeConfig = contentPathOrConfig;
      } else if (ngApp.isString(contentPathOrConfig)) {
        // If it's a string, it's considered the external content URL.
        runtimeConfig = runtimeConfigOverrides || {};
        actualContentUrl = contentPathOrConfig;
      } else {
        console.warn("Popup Service: Invalid first argument for PopupCreationService. Expected string or object.");
        runtimeConfig = runtimeConfigOverrides || {}; // Fallback to empty config
      }

      // Merge user-provided settings with the default configuration.
      // `Object.assign` is used for shallow merging.
      runtimeConfig = Object.assign({}, defaultConfiguration, runtimeConfig);

      // If an external content URL was provided as the first argument, ensure it's in the config.
      if (actualContentUrl && !runtimeConfig.externalContentUrl) {
          runtimeConfig.externalContentUrl = actualContentUrl;
      }

      var elementIdAttribute = runtimeConfig.uniqueIdentifier ? ' id="' + runtimeConfig.uniqueIdentifier + '" ' : ' id="' + _generateUniqueId() + '" ';

      // Generate the HTML for the popup's footer section.
      var standardFooterHtml =
        '<button type="button" class="btn btn-secondary" ng-click="$triggerDismiss()">{{$dismissButtonText}}</button>' +
        '<button type="button" class="btn btn-primary" ng-click="$triggerConfirm()">{{$confirmButtonText}}</button>';
      var generatedFooterHtml = '<div class="dialog-footer-section">' +
        (runtimeConfig.bottomPanelTemplate || standardFooterHtml) +
        '</div>';

      var composedBodyHtml;
      // Determine the content for the popup body based on configuration.
      if (runtimeConfig.inlineContent) {
        if (ngApp.isString(runtimeConfig.inlineContent)) {
          // Direct HTML string provided.
          composedBodyHtml = '<div class="dialog-content-area">' + runtimeConfig.inlineContent + '</div>';
        } else {
          // jQuery/JQlite wrapped object - extract its inner HTML.
          // Assuming a custom method 'getInnerHtml()' exists or is polyfilled for jqLite element.
          composedBodyHtml = '<div class="dialog-content-area">' + runtimeConfig.inlineContent.getInnerHtml() + '</div>';
        }
      } else if (runtimeConfig.externalContentUrl) {
        // Content loaded from an external URL using ng-include.
        composedBodyHtml = '<div class="dialog-content-area" ng-include="\'' + runtimeConfig.externalContentUrl + '\'"></div>';
      } else {
        // No content source specified, provide a default message.
        composedBodyHtml = '<div class="dialog-content-area"><p>No content specified for this popup.</p></div>';
        console.warn("Popup Service: No inline content or external URL provided for the popup body.");
      }

      // Construct the main popup structure using angular.element for better manipulation.
      var popupMainElement = ngApp.element(
        '<div class="' + runtimeConfig.popupContainerClass + ' is-hidden-initially"' + elementIdAttribute + ' style="display: block;">' +
        '  <div class="dialog-wrapper">' +
        '    <div class="dialog-panel">' +
        '      <div class="dialog-header-bar">' +
        '        <button type="button" class="close-button" ng-click="$triggerDismiss()">&times;</button>' +
        '        <h3>{{$modalHeaderTitle}}</h3>' + // Changed h2 to h3 for semantic variation
        '      </div>' +
        composedBodyHtml +
        generatedFooterHtml +
        '    </div>' +
        '  </div>' +
        '</div>');

      // Apply custom CSS styles defined in the configuration.
      // This allows for dynamic positioning and sizing.
      popupMainElement.css(runtimeConfig.customStyles);

      // Prepare the overlay element that sits behind the popup.
      var overlayElementRef = ngApp.element('<div></div>');
      overlayElementRef.addCssClass(runtimeConfig.overlayStylingClass);
      overlayElementRef.addCssClass('fade-in-effect'); // Changed 'fade in' to 'fade-in-effect'
      overlayElementRef.css({ 'z-index': 1040 }); // Explicitly set z-index for overlay

      // If the overlay is dismissible, attach a click handler.
      if (runtimeConfig.overlayDismissOnClick) {
        overlayElementRef.attr('ng-click', '$triggerDismiss()');
      }

      // Handler for the Escape key press to dismiss the popup.
      var onEscapeKeydown = function (keyboardEvent) {
        // Check for the Escape key (keyCode 27 or keyIdentifier 'U+001B').
        if (keyboardEvent.keyIdentifier === 'U+001B' || keyboardEvent.keyCode === 27) {
          popupScopeInstance.$triggerDismiss();
        }
      };

      // Function responsible for removing all popup-related DOM elements and event listeners.
      var destroyPopupElements = function () {
        domRootBody.detachEvent('keydown', onEscapeKeydown); // Use detachEvent for clarity
        popupMainElement.destroyElement(); // Use destroyElement for clarity instead of remove
        if (runtimeConfig.showModalOverlay) {
          overlayElementRef.destroyElement();
        }
        // Destroy the isolated scope to prevent memory leaks.
        if (popupScopeInstance && !popupScopeInstance.$parent) { // Only destroy if it's an isolated scope
             popupScopeInstance.$destroy();
        }
      };

      // Attach the global keydown listener to the document body.
      domRootBody.attachEvent('keydown', onEscapeKeydown);

      var boundController, controllerLocals;
      // Create a new isolated scope for the popup instance, or use a provided one.
      var popupScopeInstance = runtimeConfig.scope || rootScopeSvc.$new(true); // true for isolated scope

      // Assign scope variables for use in the popup template.
      popupScopeInstance.$modalHeaderTitle = runtimeConfig.displayTitle;
      popupScopeInstance.$closeAndCleanup = destroyPopupElements; // Public method for cleanup

      // Wrapper function for handling confirm/dismiss actions.
      var handleModalAction = function(actionConfig) {
        var actionHandler = actionConfig.callbackFn || destroyPopupElements;
        try {
            actionHandler.call(popupScopeInstance); // Execute the custom handler in the context of the popup scope
        } catch (error) {
            console.error("Popup Service: Error during modal action execution:", error);
        }
        popupScopeInstance.$closeAndCleanup(); // Always close after action, even if handler fails
      };

      popupScopeInstance.$triggerDismiss = function () {
        handleModalAction(runtimeConfig.dismissOption);
      };
      popupScopeInstance.$triggerConfirm = function () {
        handleModalAction(runtimeConfig.confirmOption);
      };
      popupScopeInstance.$confirmButtonText = runtimeConfig.confirmOption.buttonText;
      popupScopeInstance.$dismissButtonText = runtimeConfig.dismissOption.buttonText;

      // If a controller is specified, instantiate it and bind it to the popup.
      if (runtimeConfig.ctrlAlias) {
        controllerLocals = Object.assign({ $scope: popupScopeInstance }, injectedLocalsForController);
        try {
            boundController = ctrlSvc(runtimeConfig.ctrlAlias, controllerLocals);
            // Store the controller instance on the main popup element's data for potential access.
            popupMainElement.children().setData('$boundControllerInstance', boundController);
        } catch (error) {
            console.error("Popup Service: Failed to instantiate controller '" + runtimeConfig.ctrlAlias + "'. Error:", error);
        }
      }

      // Compile and link the popup and overlay elements to the scope.
      compSvc(popupMainElement)(popupScopeInstance);
      compSvc(overlayElementRef)(popupScopeInstance);

      // Append elements to the DOM. Overlay comes first to be behind the popup.
      if (runtimeConfig.showModalOverlay) {
          domRootBody.append(overlayElementRef);
      }
      domRootBody.append(popupMainElement);

      // Use a timeout to apply the 'in' class for CSS transitions, creating a fade-in effect.
      delaySvc(function () {
        popupMainElement.addCssClass('is-visible'); // Changed 'in' to 'is-visible'
        popupMainElement.removeCssClass('is-hidden-initially');
      }, 150); // Slightly adjusted timeout duration

      // Return the popup's scope for external interaction if needed.
      return popupScopeInstance;
    };
  }]);