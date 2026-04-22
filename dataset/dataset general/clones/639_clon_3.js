// This JavaScript module implements a robust single-page application (SPA) routing mechanism.
// It orchestrates dynamic content loading and view transitions, utilizing jQuery for DOM interactions.
// Designed with extensibility in mind, it allows for custom view logic and state management.

(function(jq, rootCtx) {

  // --- Core Configuration Settings ---

  /**
   * Centralized configuration for selectors, attributes, and event names.
   * Using a const object improves maintainability and readability by avoiding magic strings.
   */
  const appConfig = {
    viewSectionPrefix: "section#",           // Prefix for selecting view elements by ID
    defaultRouteAttribute: "data-default-route", // Custom attribute to mark the default view
    mainContentArea: "body",                 // The main body element for global class changes
    viewHiddenEventName: "route:deactivated",// Custom event fired when a view is hidden
    viewShownEventName: "route:activated",   // Custom event fired when a new view is shown
    loadingStatusClass: "is-loading-content",// CSS class for indicating content loading
    routingErrorClass: "routing-issue"       // CSS class for indicating routing errors
  };

  // --- Internal State Variables ---

  /**
   * A mapping of route identifiers to their corresponding handler functions.
   * These handlers execute custom logic when a specific view becomes active.
   * @type {Object.<string, Function>}
   */
  let routeHandlersRegistry = {};

  /**
   * Stores the identifier of the currently active route/view.
   * Used to manage transitions between views.
   * @type {string|null}
   */
  let currentActiveRouteId = null;

  /**
   * The jQuery wrapper for the DOM element of the currently displayed view.
   * @type {jq.fn|null}
   */
  let currentlyDisplayedViewElement = null;

  // --- Utility Functions ---

  /**
   * Safely retrieves a view DOM element using its unique identifier.
   * Provides error logging if the identifier is invalid.
   * @param {string} routeId - The unique ID of the route/view.
   * @returns {jq.fn} A jQuery object representing the view section, or an empty jQuery object if not found.
   */
  function findViewElementById(routeId) {
    if (!routeId || typeof routeId !== 'string') {
      console.error("Invalid route identifier provided to findViewElementById:", routeId);
      return jq();
    }
    return jq(appConfig.viewSectionPrefix + routeId);
  }

  /**
   * Executes the registered handler for a view and manages its active/inactive state.
   * This function is responsible for calling view-specific logic and triggering events.
   * @param {string} viewKey - The identifier of the view to be activated.
   * @param {*} [viewData] - Optional data payload to pass to the view's handler.
   * @returns {void}
   */
  function activateViewContent(viewKey, viewData) {
    if (!viewKey) {
      console.warn("Attempted to activate view with a non-existent key.");
      return;
    }

    const targetViewNode = findViewElementById(viewKey);
    const bodyNode = jq(appConfig.mainContentArea);

    // Guard clause: Ensure the target view element exists in the DOM.
    if (!targetViewNode.length) {
      console.error(`View element for ID '${viewKey}' could not be located in the document.`);
      bodyNode.addClass(appConfig.routingErrorClass);
      return;
    }

    const viewActionFn = routeHandlersRegistry[viewKey];
    let handlerReturnVal;

    // Attempt to execute the view's specific handler logic.
    if (viewActionFn) {
      // The handler's `this` context is set to the native DOM element of the view.
      const handlerContext = targetViewNode.get(0);
      try {
        handlerReturnVal = viewActionFn.apply(handlerContext, [viewData]);

        // If the handler returns another function, it's treated as a dynamic renderer.
        if (typeof handlerReturnVal === "function") {
          routeHandlersRegistry[viewKey] = handlerReturnVal; // Update the handler
          handlerReturnVal.apply(handlerContext, [viewData]); // Execute the renderer
        }
      } catch (handlerError) {
        console.error(`An error occurred during handler execution for view '${viewKey}':`, handlerError);
        bodyNode.addClass(appConfig.routingErrorClass);
        return; // Halt activation if handler fails critically
      }
    } else {
      console.info(`No specific handler function registered for view: '${viewKey}'.`);
    }

    // --- View State Transition ---

    // First, deactivate the previously active view.
    if (currentActiveRouteId) {
      bodyNode.removeClass(currentActiveRouteId); // Remove old view's class
      if (currentlyDisplayedViewElement && currentlyDisplayedViewElement.length) {
        currentlyDisplayedViewElement.trigger(appConfig.viewHiddenEventName, [currentActiveRouteId]);
      }
    }

    // Now, activate the new view.
    currentActiveRouteId = viewKey; // Update the global active route identifier
    currentlyDisplayedViewElement = targetViewNode; // Update the global active view element

    bodyNode
      .removeClass(appConfig.routingErrorClass) // Clear any previous error state
      .addClass(currentActiveRouteId);         // Apply the new view's class to the body

    // Trigger the 'activated' event on the target view element.
    if (currentlyDisplayedViewElement.length) {
      currentlyDisplayedViewElement.trigger(appConfig.viewShownEventName, [currentActiveRouteId]);
    }
  }

  /**
   * The primary routing dispatcher. It checks for external content sources
   * and handles AJAX loading before activating the view.
   * @param {string} routeIdentifier - The unique identifier of the route to navigate to.
   * @param {*} [routeParameters] - Optional data to be passed to the view activation.
   * @returns {void}
   */
  function routeDispatcher(routeIdentifier, routeParameters) {
    if (!routeIdentifier) {
      console.error("Route dispatcher received an empty or null identifier.");
      return;
    }

    const targetElement = findViewElementById(routeIdentifier);
    const bodyElement = jq(appConfig.mainContentArea);

    // Confirm the view element exists before proceeding.
    if (!targetElement.length) {
      console.error(`Routing target element for ID '${routeIdentifier}' is missing from the DOM.`);
      bodyElement.addClass(appConfig.routingErrorClass);
      return;
    }

    const contentSourceUrl = targetElement.attr("src");
    // Check if the element has content (any child nodes)
    const hasExistingContent = targetElement.children().first().length > 0;

    // If an external source URL is provided and the view is currently empty, load content via AJAX.
    if (contentSourceUrl && !hasExistingContent) {
      bodyElement.addClass(appConfig.loadingStatusClass); // Display loading state

      jq.ajax({
        url: contentSourceUrl,
        dataType: "html",
        method: "GET", // Explicitly define the HTTP method
        cache: false   // Prevent caching of dynamic content
      })
      .done(function(retrievedHtml) {
        targetElement.html(retrievedHtml); // Inject loaded HTML into the view
        activateViewContent(routeIdentifier, routeParameters); // Then activate the view
      })
      .fail(function(xhrObject, statusText, errorThrown) {
        console.error(`Failed to retrieve content from '${contentSourceUrl}':`, statusText, errorThrown);
        bodyElement.addClass(appConfig.routingErrorClass); // Signal a routing error
        // Optionally, display a user-friendly error message within the view itself
        targetElement.html(`<div class="${appConfig.routingErrorClass}"><h3>Content Load Error</h3><p>Could not load content for <strong>${routeIdentifier}</strong>. Please try again later.</p></div>`);
      })
      .always(function() {
        bodyElement.removeClass(appConfig.loadingStatusClass); // Hide loading state regardless of outcome
      });
    } else {
      // If no external source or content already exists, activate the view directly.
      activateViewContent(routeIdentifier, routeParameters);
    }
  }

  /**
   * Exposes a method to register handler functions for specific view identifiers.
   * This is part of the public API for the router.
   * @param {string} routeKey - The unique identifier for the route/view.
   * @param {Function} handlerFunction - The callback function to execute when the route becomes active.
   * @returns {void}
   */
  routeDispatcher.registerRoute = function(routeKey, handlerFunction) {
    if (typeof routeKey !== 'string' || !routeKey) {
      console.error("Cannot register route: Provided route key is invalid.", routeKey);
      return;
    }
    if (typeof handlerFunction !== 'function') {
      console.error(`Cannot register route '${routeKey}': Handler must be a function.`);
      return;
    }
    routeHandlersRegistry[routeKey] = handlerFunction;
    console.debug(`Route handler successfully registered for: ${routeKey}`);
  };

  /**
   * Processes changes to the URL hash, extracting route information and initiating navigation.
   * This function is typically invoked by the browser's 'hashchange' event.
   * @returns {void}
   */
  function handleUrlHashChange() {
    let currentUrlHash = rootCtx.location.hash;
    const mainBody = jq(appConfig.mainContentArea);

    // Determine the default route if no hash is present.
    let defaultRouteElementId = jq(`section[${appConfig.defaultRouteAttribute}]`).attr('id');
    if (!currentUrlHash && defaultRouteElementId) {
      currentUrlHash = "#" + defaultRouteElementId;
      // Consider updating the URL hash here if you want the default route to be reflected in the browser history.
      // rootCtx.location.replace(currentUrlHash);
    } else if (!currentUrlHash) {
      console.warn("No hash found in URL and no default route is defined. Router cannot proceed.");
      mainBody.addClass(appConfig.routingErrorClass);
      return;
    }

    // Regex to parse hash format: #routeId[:paramValue]
    // Captures the route ID and an optional parameter string.
    const hashParsingRegex = /^#([a-zA-Z0-9_-]+)(?::(.+))?$/;
    const hashMatch = hashParsingRegex.exec(currentUrlHash);

    if (!hashMatch) {
      console.warn(`URL hash format is invalid: '${currentUrlHash}'. Expected pattern: #routeId or #routeId:param.`);
      mainBody.addClass(appConfig.routingErrorClass);
      return;
    }

    const extractedRouteId = hashMatch[1];
    // Decode the parameter to handle URL-encoded characters (e.g., spaces, special symbols).
    const extractedRouteParam = hashMatch[2] ? decodeURIComponent(hashMatch[2]) : undefined;

    // Dispatch the navigation request.
    routeDispatcher(extractedRouteId, extractedRouteParam);
  }

  // --- Router Initialization ---

  // Bind the hashchange event to the window object to listen for URL hash modifications.
  jq(rootCtx).on("hashchange", handleUrlHashChange);

  // Expose the main routing function globally under a new namespace.
  rootCtx.singlePageRouter = routeDispatcher;

  // Execute the hash processing logic once when the DOM is fully loaded.
  // This handles the initial page load and directs to the correct route.
  jq(document).ready(function() {
    handleUrlHashChange();
  });

})(jQuery, window);