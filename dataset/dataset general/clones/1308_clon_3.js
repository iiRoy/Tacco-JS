(function() {
  // Core utility for DOM manipulation, will be assigned jQuery or a similar library.
  var DomUtil;
  // Endpoint base URL for communicating with the remote service.
  var remoteServiceBaseUrl = 'https://api.example.com/v1';
  // Comprehensive configuration settings for this module instance.
  var configSettings = {};
  // CSS selector pointing to the primary DOM element for module rendering.
  var targetNodeSelector = '';

  /**
   * Utility function to dynamically insert a CSS stylesheet into the document's head.
   * @param {string} styleResourceUrl - The URL of the stylesheet to be loaded.
   */
  function injectStylesheet(styleResourceUrl) {
    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('type', 'text/css');
    linkElement.setAttribute('href', styleResourceUrl);
    // Attempt to append to document.head, or fallback to older methods.
    (document.head || document.getElementsByTagName('head')[0] || document.documentElement).appendChild(linkElement);
  }

  // Establish a global namespace for application-wide components if it doesn't exist.
  if (typeof window.AppGlobal === 'undefined') {
    window.AppGlobal = {};
  }

  /**
   * Constructor for the client-side module. Initializes module configuration.
   * @param {object} moduleConfiguration - Object containing specific settings for this module.
   */
  window.AppGlobal.ClientModule = function(moduleConfiguration) {
    // Perform initial validation on the provided configuration.
    if (typeof moduleConfiguration !== 'object' || moduleConfiguration === null) {
      console.error('AppGlobal.ClientModule: Provided moduleConfiguration is invalid. Using defaults.');
      moduleConfiguration = {}; // Ensure moduleConfiguration is an object for merging.
    }

    // Define a set of default configuration options.
    const defaults = {
      actionLabel: 'Perform Action', // Renamed from 'buttonText'
      rootElementSelector: '.application-interface-root', // New configuration for the target container
      autoHideFeedback: true // New setting to control feedback visibility
    };
    // Merge defaults with provided configuration into the module's settings.
    Object.assign(configSettings, defaults, moduleConfiguration);

    // Assign the determined root element selector.
    targetNodeSelector = configSettings.rootElementSelector;

    // Optional: Further validate the root element selector.
    if (!targetNodeSelector || typeof targetNodeSelector !== 'string' || !targetNodeSelector.startsWith('.')) {
        console.warn(`AppGlobal.ClientModule: Invalid or missing rootElementSelector '${targetNodeSelector}'. Falling back to default.`);
        targetNodeSelector = defaults.rootElementSelector; // Revert to default if invalid.
    }
  };

  /**
   * Orchestrates the initial setup, primarily ensuring the necessary DOM manipulation library (jQuery) is loaded.
   */
  function initiateApplicationSetup() {
    // Specify the exact jQuery version required for compatibility.
    const requiredJQueryVersion = '1.6.4';

    // Check if jQuery is globally available and matches the required version.
    if (typeof window.jQuery === 'undefined' || window.jQuery.fn.jquery !== requiredJQueryVersion) {
      // If not, dynamically create and append a script tag to load jQuery.
      const dependencyScriptElement = document.createElement('script');
      dependencyScriptElement.type = 'text/javascript';
      dependencyScriptElement.src = `https://ajax.googleapis.com/ajax/libs/jquery/${requiredJQueryVersion}/jquery.js`;

      // Determine the best place to append the script (head or documentElement).
      const scriptInsertionPoint = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
      if (scriptInsertionPoint) {
        scriptInsertionPoint.appendChild(dependencyScriptElement);
      } else {
        console.error('Failed to find a suitable DOM element to append the jQuery script.');
        return; // Exit if script cannot be added.
      }

      // Implement cross-browser script load detection.
      if (dependencyScriptElement.attachEvent) { // For Internet Explorer versions that support attachEvent.
        dependencyScriptElement.onreadystatechange = function() {
          const currentReadyState = this.readyState;
          if (currentReadyState === 'complete' || currentReadyState === 'loaded') {
            this.onreadystatechange = null; // Prevent re-execution.
            handleDependencyLoadCompletion();
          }
        };
      } else { // Modern browsers using standard onload event.
        dependencyScriptElement.onload = handleDependencyLoadCompletion;
        dependencyScriptElement.onerror = () => { // Added error handling for script loading.
          console.error(`Error loading jQuery from ${dependencyScriptElement.src}.`);
        };
      }
    } else {
      // jQuery is already present and correct, assign it and proceed.
      DomUtil = window.jQuery;
      startModuleBootstrap();
    }
  }

  /**
   * Callback executed once the external JavaScript dependency (jQuery) has successfully loaded.
   */
  function handleDependencyLoadCompletion() {
    if (typeof window.jQuery !== 'undefined') {
      // Assign jQuery to DomUtil and release its global variable to avoid conflicts.
      DomUtil = window.jQuery.noConflict(true);
      startModuleBootstrap();
    } else {
      console.error('jQuery global object not found after script load completion.');
      displayFeedback('Critical error: Required libraries failed to load.', 'error');
    }
  }

  /**
   * The primary function that runs after all necessary dependencies are confirmed ready.
   * Handles stylesheet injection, optional utility script loading, and UI setup.
   */
  function startModuleBootstrap() {
    DomUtil(document).ready(function() {
      // Load module-specific stylesheets.
      injectStylesheet(`${remoteServiceBaseUrl}/assets/styles/normalize.css`); // Updated path/name
      injectStylesheet(`${remoteServiceBaseUrl}/assets/styles/client-module.css`); // Updated path/name

      // Asynchronously load a JSON shim for older browsers, if needed.
      // In modern environments, this call might be redundant but kept for clone fidelity.
      DomUtil.getScript(`${remoteServiceBaseUrl}/utils/json2-shim.js`, function() {
        // console.log('JSON2 shim loaded, if required by browser environment.');
      }).fail(function() {
        console.warn('Failed to load JSON2 shim. This is typically not an issue for modern browsers.');
      });

      // Verify or create the designated root element for the module.
      let moduleRootElement = DomUtil(targetNodeSelector);
      if (moduleRootElement.length === 0) {
        // If the target element doesn't exist, create it and append to the document body.
        const className = targetNodeSelector.substring(1); // Remove '.' from selector.
        DomUtil('body').append(`<div class="${className}"></div>`);
        moduleRootElement = DomUtil(targetNodeSelector); // Re-select the newly added element.
      }
      // Apply a foundational CSS class to the module's root element.
      moduleRootElement.addClass('base-interface-wrapper'); // Renamed from 'cleanslate'

      renderModuleInterface(); // Proceed to build and display the UI.
    });
  }

  /**
   * Responsible for constructing and inserting the module's HTML structure into the DOM.
   */
  function renderModuleInterface() {
    // Guard clause: Ensure the root element exists before attempting to render.
    const currentModuleRoot = DomUtil(targetNodeSelector);
    if (currentModuleRoot.length === 0) {
      console.error(`Module render error: Root element '${targetNodeSelector}' not found in DOM.`);
      return;
    }

    // Utilize template literals to build the module's HTML content.
    const moduleHtmlStructure = `
      <section class="module-content-area">
        <input type="text" id="user_input_field" class="text-input" placeholder="Type your message here..."/>
        <button type="button" class="action-button">${configSettings.actionLabel}</button>
      </section>
      <div class="feedback-display-area"></div> <!-- Dedicated area for messages -->
    `;
    currentModuleRoot.append(moduleHtmlStructure);

    // Attach event handler using event delegation for better performance and future-proofing.
    currentModuleRoot.on('click', '.action-button', processUserInteraction);
  }

  /**
   * Handles user-initiated actions, such as button clicks, performing validation and server requests.
   * @param {Event} domEvent - The DOM event object that triggered this function.
   */
  function processUserInteraction(domEvent) {
    const activatedButton = DomUtil(this);
    activatedButton.prop('disabled', true).text('Sending...'); // Disable button and update text during processing.

    // Retrieve and sanitize the user's input.
    const inputElement = DomUtil(`${targetNodeSelector} #user_input_field`);
    const userContent = inputElement.val().trim();

    // Implement basic client-side validation.
    if (!userContent) {
        displayFeedback('Please provide some content before submitting.', 'error');
        activatedButton.prop('disabled', false).text(configSettings.actionLabel);
        return; // Halt execution if validation fails.
    }

    // Construct the data payload for the server request.
    const requestPayload = {
      sourcePageUrl: window.location.href, // Renamed from 'install_url'
      userInputContent: userContent // Renamed from 'text'
    };

    // Execute an asynchronous JSONP request to the backend service.
    DomUtil.ajax({
      url: `${remoteServiceBaseUrl}/submit-module-data.php?callback=?`, // Updated service endpoint
      dataType: 'jsonp',
      data: requestPayload,
      success: handleServiceResponse,
      error: function(jqXHR, textStatus, errorThrown) {
        console.error('Service request failed:', textStatus, errorThrown, jqXHR);
        displayFeedback('Failed to reach the service. Please try again later.', 'error');
        activatedButton.prop('disabled', false).text(configSettings.actionLabel);
      },
      timeout: 12000 // Increased timeout for potentially slower networks.
    });
  }

  /**
   * Processes the structured data received back from the backend service.
   * @param {object} serviceResponseData - The JSON object returned by the server.
   */
  function handleServiceResponse(serviceResponseData) {
    const submitActionButton = DomUtil(`${targetNodeSelector} .action-button`);
    submitActionButton.prop('disabled', false).text(configSettings.actionLabel); // Re-enable button and restore original text.

    // Validate the structure of the server's response.
    if (!serviceResponseData || typeof serviceResponseData.statusMsg === 'undefined') {
        displayFeedback('Received an unexpected response format from the server.', 'error');
        return;
    }

    // Assemble a detailed status message using template literals.
    const elaboratedStatusMessage = `
      ${serviceResponseData.statusMsg || 'Operation completed successfully.'}
      <br>Your IP address: <em>${serviceResponseData.clientIpAddress || 'Unknown'}</em>.
      Originating Site: <em>${serviceResponseData.originSite || 'N/A'}</em>.
      Client User Agent: <em>${serviceResponseData.userAgentString || 'Not available'}</em>.
    `;
    displayFeedback(elaboratedStatusMessage, 'success');
  }

  /**
   * Displays various feedback messages to the user within the module's dedicated area.
   * @param {string} messageContent - The text content of the message to display.
   * @param {string} [messageType='info'] - The category of the message (e.g., 'success', 'error', 'info').
   */
  function displayFeedback(messageContent, messageType = 'info') {
    let feedbackTargetArea = DomUtil(`${targetNodeSelector} .feedback-display-area`);
    if (feedbackTargetArea.length === 0) {
      // If the feedback area is missing, create it and append.
      feedbackTargetArea = DomUtil('<div class="feedback-display-area"></div>').appendTo(targetNodeSelector);
    }
    // Clear previous styling and apply the class for the current message type.
    feedbackTargetArea.removeClass('feedback-success feedback-error feedback-info').addClass(`feedback-${messageType}`);
    feedbackTargetArea.html(`<p class="message-text">${messageContent}</p>`); // Wrap message in a paragraph for styling.

    // Implement auto-hiding for non-error messages, if configured.
    if (messageType !== 'error' && configSettings.autoHideFeedback) {
        clearTimeout(configSettings.feedbackTimerId); // Clear any active timer.
        configSettings.feedbackTimerId = setTimeout(() => {
            feedbackTargetArea.empty().removeClass(`feedback-${messageType}`); // Clear content and styling.
        }, 6000); // Hide after 6 seconds.
    }
  }

  // Begin the module's initialization process.
  initiateApplicationSetup();

})();