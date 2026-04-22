(function(globalContext) {
  'use strict'; // Enforce stricter parsing and error handling for robust code.

  // The primary application container, renamed for enhanced semantic clarity.
  globalContext.ApplicationCore = {
    // Modules responsible for rendering user interfaces and managing presentation logic.
    UserInterfacePresenters: {},
    // Handlers for commands and business logic, orchestrating application behavior.
    CommandHandlers: {},
    // Data structures that aggregate related domain entities, often used for lists.
    DataAggregates: {},
    // Core domain models representing business entities and their data.
    DomainEntities: {},
    // A collection of general-purpose utility functions and helper routines.
    UtilityRoutines: {
      /**
       * Determines if a specific query parameter is present in the current URL's search string.
       * This method provides a more robust check compared to simple string manipulation.
       * @param {string} parameterKey - The key of the URL parameter to search for.
       * @returns {boolean} - Returns true if the parameter is found, otherwise false.
       */
      checkUrlParameterPresence: function(parameterKey) {
        // Early exit if no search string exists to avoid unnecessary processing.
        if (!window.location.search || window.location.search.length <= 1) {
          return false;
        }
        // Utilize the URLSearchParams API for reliable parameter parsing.
        const urlParameters = new URLSearchParams(window.location.search);
        return urlParameters.has(parameterKey);
      },

      /**
       * Executes the core user login sequence. This is a placeholder for actual authentication logic.
       * In a production environment, this would involve API calls, token handling, etc.
       * @returns {Promise<boolean>} - A promise resolving to true if login is simulated as successful.
       */
      performUserLogin: async function() {
        console.info('UtilityRoutines: Initiating user authentication process...');
        // Simulate an asynchronous login operation.
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('UtilityRoutines: User login simulation completed successfully.');
        return true; // Always return true for this simulated example.
      },

      /**
       * Triggers the user logout procedure. This function would typically clear session data,
       * invalidate tokens, and redirect the user.
       */
      initiateLogoutProcess: function() {
        console.warn('UtilityRoutines: User logout sequence has been started. Session data clearing in progress...');
        // A simple confirmation for the user.
        globalContext.alert('You have been securely logged out from the application.');
        // In a real application, this might involve:
        // localStorage.clear();
        // sessionStorage.clear();
        // window.location.href = '/login-page'; // Redirect to a login page.
      }
    },

    /**
     * The primary entry point for initializing the entire application system.
     * This method orchestrates the startup sequence of various components.
     * @returns {object} An object containing status information about the initialization process.
     */
    bootstrapSystem: function() {
      console.groupCollapsed('ApplicationCore: System Bootstrap Initiated');
      let initializationStatus = {
        historyStarted: false,
        defaultRouteHandled: false,
        oauthHandled: false,
        loginAttempted: false,
        loginSuccess: false
      };

      // Guard against Backbone.history not being available before attempting to start.
      if (typeof Backbone !== 'undefined' && Backbone.history && typeof Backbone.history.start === 'function') {
        Backbone.history.start({ pushState: true, silent: false }); // Added options for history management.
        console.log('ApplicationCore: History tracking manager successfully activated.');
        initializationStatus.historyStarted = true;
      } else {
        console.error('ApplicationCore: Backbone.history is not available or improperly configured. History tracking will be disabled.');
      }

      const currentBrowserHash = window.location.hash; // Cache hash for multiple checks.

      // Evaluate the current URL hash for initial routing decisions.
      if (!currentBrowserHash || currentBrowserHash.length <= 1 || currentBrowserHash === '#/') {
        // Ensure the target controller and method exist before invocation to prevent runtime errors.
        if (globalContext.ApplicationCore.CommandHandlers.IssueManagement &&
            typeof globalContext.ApplicationCore.CommandHandlers.IssueManagement.displayMainIssueView === 'function') {
          globalContext.ApplicationCore.CommandHandlers.IssueManagement.displayMainIssueView();
          console.log('ApplicationCore: No specific hash detected, routing to default issue overview.');
          initializationStatus.defaultRouteHandled = true;
        } else {
          console.warn('ApplicationCore: IssueManagement controller or displayMainIssueView method is undefined. Default issue route skipped.');
        }
      }

      // Inspect URL parameters for a potential OAuth authentication token.
      const hasAuthenticationTokenParam = globalContext.ApplicationCore.UtilityRoutines.checkUrlParameterPresence("authentication_token");
      if (hasAuthenticationTokenParam) {
        // Similar guard for the OAuth handler.
        if (globalContext.ApplicationCore.CommandHandlers.AuthenticationModule &&
            typeof globalContext.ApplicationCore.CommandHandlers.AuthenticationModule.processOAuthCallback === 'function') {
          globalContext.ApplicationCore.CommandHandlers.AuthenticationModule.processOAuthCallback();
          console.log('ApplicationCore: OAuth authentication token found, initiating callback processing.');
          initializationStatus.oauthHandled = true;
        } else {
          console.warn('ApplicationCore: AuthenticationModule controller or processOAuthCallback method is missing. OAuth handling skipped.');
        }
      }

      // Attempt to log in the user as part of the bootstrap process.
      initializationStatus.loginAttempted = true;
      globalContext.ApplicationCore.UtilityRoutines.performUserLogin().then(success => {
        initializationStatus.loginSuccess = success;
        console.log(`ApplicationCore: User login attempt concluded. Success: ${success}`);
      }).catch(error => {
        console.error('ApplicationCore: Error during user login attempt:', error);
        initializationStatus.loginSuccess = false;
      });

      console.groupEnd();
      return initializationStatus; // Provide a detailed status report.
    }
  };

  // --- Placeholder Definitions for CommandHandlers (typically in separate modules) ---

  // Represents the command handler for managing issue-related operations.
  globalContext.ApplicationCore.CommandHandlers.IssueManagement = {
    displayMainIssueView: function() {
      console.log('CommandHandlers.IssueManagement: Rendering the primary view for issue tracking.');
      // Example: jQuery('#app-content-area').html('<h3>Welcome to your Issue Dashboard!</h3>');
    }
  };

  // Handles commands related to user authentication, particularly OAuth flows.
  globalContext.ApplicationCore.CommandHandlers.AuthenticationModule = {
    processOAuthCallback: function() {
      console.log('CommandHandlers.AuthenticationModule: Executing OAuth callback token processing logic.');
      // Example: const token = new URLSearchParams(window.location.search).get('authentication_token');
      // Perform token validation and session establishment.
    }
  };

  // --- DOM Ready Execution Block ---

  // Ensure jQuery is loaded before attempting to use it for DOM manipulation.
  if (typeof jQuery !== 'undefined') {
    // Execute initialization routines once the entire DOM is parsed and ready.
    jQuery(document).ready(function() {
      console.groupCollapsed('ApplicationCore: DOM Ready Operations Initiated');

      // Configure jQuery's AJAX settings to allow cross-domain requests.
      // This is crucial for APIs hosted on different origins.
      jQuery.ajaxSettings.crossDomain = true;
      console.log('ApplicationCore: jQuery AJAX cross-domain support has been activated.');

      // Initiate the application's core bootstrap process.
      const appStartupReport = globalContext.ApplicationCore.bootstrapSystem();
      console.log('ApplicationCore: Main application bootstrap sequence completed with report:', appStartupReport);

      // Attach event listener for clicks on primary navigation links.
      // Using a more specific selector and .on() for better event management.
      jQuery('nav.primary-navigation a.nav-item-link').on('click', function(eventObject) {
        // Prevent the default browser behavior for link clicks (e.g., page reload).
        eventObject.preventDefault();
        console.log('ApplicationCore: Navigation link activated:', jQuery(this).attr('href'));

        // Remove the 'is-active' class from all navigation list items.
        jQuery('nav.primary-navigation li.nav-list-item').removeClass('is-active');

        // Add the 'is-active' class to the parent list item of the clicked link.
        // Using .closest() for a more robust selection of the nearest ancestor.
        jQuery(this).closest('li.nav-list-item').addClass('is-active');

        // Optional: Implement client-side routing based on the link's href.
        // const targetRoute = jQuery(this).attr('href');
        // if (Backbone.history) Backbone.history.navigate(targetRoute, { trigger: true });

        return false; // Indicate that the default action was prevented.
      });

      // Attach an event handler to the dedicated user logout button.
      const userLogoutButton = jQuery('#application-logout-button'); // Use a variable for clarity.
      if (userLogoutButton.length > 0) { // Verify the element exists before attaching handler.
        userLogoutButton.on('click', globalContext.ApplicationCore.UtilityRoutines.initiateLogoutProcess);
        console.log('ApplicationCore: Logout button event listener successfully attached.');
      } else {
        console.warn('ApplicationCore: Logout button element (#application-logout-button) was not found in the DOM.');
      }

      console.groupEnd();
    });
  } else {
    console.error('ApplicationCore: jQuery library is not detected. Critical DOM ready functions will not be executed.');
  }

})(this || window); // Pass the global context (window in browser environments) for safe access.