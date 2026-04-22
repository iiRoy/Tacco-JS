let applicationTitle;
let overlayElement;
let modalWindow;
let clientIdentifier;
let securityDomain;

/**
 * Provides basic logging functionality.
 * @param {string} msg - The message to output.
 */
function outputDebugMessage(msg) {
  if (typeof console !== 'undefined' && console.log) {
    console.log(`[AuthFlow] ${msg}`);
  }
}

/**
 * Orchestrates the OAuth2 authentication process by presenting a user interface
 * for scope selection and initiating the authorization request.
 */
function initiateAuthorizationFlow() {
  outputDebugMessage('Starting OAuth2 authentication sequence.');

  // Pre-check for essential global dependencies
  if (!window.swaggerUi || !window.swaggerUi.api) {
    outputDebugMessage('Critical Swagger UI API definition missing. Aborting authorization.');
    return;
  }

  let collectedAccessClaims = []; // Stores the available permissions/scopes

  // Extract authentication schemes from the API definition
  const apiAuthSchemes = window.swaggerUi.api.authSchemes || window.swaggerUi.api.securityDefinitions;

  if (apiAuthSchemes) {
    // Iterate over each defined authentication scheme
    Object.values(apiAuthSchemes).forEach(schemeEntry => {
      // Only consider OAuth2 schemes that explicitly define scopes
      if (schemeEntry.type === 'oauth2' && schemeEntry.scopes) {
        // Distinguish between Swagger 1.2 (array of strings) and 2.0 (object) scope formats
        if (Array.isArray(schemeEntry.scopes)) {
          // Swagger 1.2 format: direct array of scope names
          schemeEntry.scopes.forEach(singleScopeName => {
            collectedAccessClaims.push(singleScopeName);
          });
        } else {
          // Swagger 2.0 format: object with scope names as keys and descriptions as values
          for (const scopeKey in schemeEntry.scopes) {
            if (Object.prototype.hasOwnProperty.call(schemeEntry.scopes, scopeKey)) {
              collectedAccessClaims.push({ claim: scopeKey, description: schemeEntry.scopes[scopeKey] });
            }
          }
        }
      }
    });
  }

  // Set the application title for the dialog
  applicationTitle = window.swaggerUi.api.info?.title || 'API Service';

  // --- Dynamic HTML generation for the authorization dialog ---
  const dialogMarkup = `
    <div class="oauth-dialog-container">
      <header class="oauth-dialog-header">
        <h3 class="oauth-dialog-title">Grant API Permissions</h3>
      </header>
      <section class="oauth-dialog-content">
        <p>Permissions, also known as 'scopes', control the level of access an application obtains to your data.
          <a href="https://oauth.net/2/" target="_blank" rel="noopener noreferrer">Learn more about OAuth2 security.</a>
        </p>
        <p>The <strong>${applicationTitle}</strong> interface requires the following permissions. Please select which ones you wish to authorize.</p>
        <ul class="oauth-permission-list">
          <!-- Permission checkboxes will be inserted here -->
        </ul>
        <div class="oauth-message-area error-text"></div>
        <div class="oauth-dialog-actions">
          <button class="oauth-authorize-btn action-primary" type="button">Authorize Selected</button>
          <button class="oauth-cancel-btn action-secondary" type="button">Cancel</button>
        </div>
      </section>
    </div>`;

  modalWindow = $(dialogMarkup); // Create jQuery object
  $('body').append(modalWindow); // Add the dialog to the document body

  // Populate the permission list within the dialog
  const permissionListElement = modalWindow.find('ul.oauth-permission-list').empty();
  collectedAccessClaims.forEach((claimData, idx) => {
    // Normalize claim data: if it's just a string, convert to object
    const currentClaim = typeof claimData === 'string' ? { claim: claimData, description: '' } : claimData;
    
    const listItemHtml = `
      <li>
        <input type="checkbox" id="auth_permission_${idx}" data-permission-name="${currentClaim.claim}"/>
        <label for="auth_permission_${idx}">
          ${currentClaim.claim}
          ${currentClaim.description ? `<br/><span class="permission-description">${currentClaim.description}</span>` : ''}
        </label>
      </li>`;
    permissionListElement.append(listItemHtml);
  });

  // --- Dynamic positioning of the modal dialog ---
  const viewport = $(window);
  const currentScrollTop = viewport.scrollTop();
  const modalWidth = modalWindow.outerWidth();
  const modalHeight = modalWindow.outerHeight();

  const topPosition = (viewport.height() - modalHeight) / 2 + currentScrollTop;
  const leftPosition = (viewport.width() - modalWidth) / 2;

  modalWindow.css({
    top: `${Math.max(0, topPosition)}px`,
    left: `${Math.max(0, leftPosition)}px`
  });

  // --- Event handlers for dialog buttons ---
  modalWindow.find('button.oauth-cancel-btn').on('click', () => {
    outputDebugMessage('Authorization dialog dismissed by user.');
    overlayElement.fadeOut(250); // Fade out the background mask
    modalWindow.fadeOut(250, () => {
      modalWindow.remove(); // Remove dialog from DOM after fading
      modalWindow = null; // Clear reference
    });
  });

  modalWindow.find('button.oauth-authorize-btn').on('click', () => {
    outputDebugMessage('Authorization button clicked. Preparing request.');
    overlayElement.fadeOut(250);
    modalWindow.fadeOut(250, () => {
      modalWindow.remove();
      modalWindow = null;
    });

    let authorizationEndpointUrl = null;
    let tokenIdentifierKey = 'access_token'; // Default key for the token

    const currentAuthProviders = window.swaggerUi.api.authSchemes;
    const browserLocation = window.location;
    const basePath = browserLocation.pathname.substring(0, browserLocation.pathname.lastIndexOf("/"));
    const authorizationCallbackUri = `${browserLocation.protocol}//${browserLocation.host}${basePath}/o2c.html`;

    // Search for a suitable OAuth2 implicit flow provider
    if (currentAuthProviders) {
      for (const providerId in currentAuthProviders) {
        if (Object.prototype.hasOwnProperty.call(currentAuthProviders, providerId)) {
          const currentProvider = currentAuthProviders[providerId];

          // Swagger 2.0 implicit flow
          if (currentProvider.type === 'oauth2' && currentProvider.flow === 'implicit') {
            authorizationEndpointUrl = currentProvider.authorizationUrl;
            tokenIdentifierKey = currentProvider.tokenUrl || 'access_token';
            break;
          }
          // Swagger 1.2 grant types
          else if (currentProvider.grantTypes?.implicit) {
            const implicitConfig = currentProvider.grantTypes.implicit;
            authorizationEndpointUrl = implicitConfig.loginEndpoint.url;
            tokenIdentifierKey = implicitConfig.tokenName || 'access_token';
            break;
          }
        }
      }
    }

    // Guard clause if no suitable provider found
    if (!authorizationEndpointUrl) {
      outputDebugMessage('No OAuth2 implicit flow configuration found in API definition.');
      alert('Authorization cannot proceed: No implicit OAuth2 provider is configured.');
      return;
    }

    const selectedPermissions = [];
    // Collect all checked permission names from the dialog
    modalWindow.find('.oauth-permission-list input:checked').each(function() {
      selectedPermissions.push($(this).data('permission-name'));
    });

    // Store selected permissions and token key globally for the callback page
    window.enabledScopes = selectedPermissions;
    window.swaggerUi.tokenName = tokenIdentifierKey;

    // Construct the full authorization request URL
    const authUrlBuilder = new URL(authorizationEndpointUrl);
    authUrlBuilder.searchParams.set('response_type', 'token');
    authUrlBuilder.searchParams.set('redirect_uri', authorizationCallbackUri);
    authUrlBuilder.searchParams.set('realm', securityDomain);
    authUrlBuilder.searchParams.set('client_id', clientIdentifier);
    authUrlBuilder.searchParams.set('scope', selectedPermissions.join(' ')); // OAuth2 scopes are space-separated

    // Open the authorization URL in a new pop-up window
    window.open(authUrlBuilder.toString(), '_blank', 'width=800,height=600');
  });

  // Display the overlay and dialog after setup
  overlayElement.fadeIn(250);
  modalWindow.fadeIn(250);
}

/**
 * Revokes the current OAuth2 authorization by clearing tokens and resetting UI states.
 */
function terminateAuthorizationSession() {
  outputDebugMessage('Initiating OAuth2 session termination.');

  // Remove all active authorizations from the global store
  if (window.authorizations && window.authorizations.authz) {
    Object.keys(window.authorizations.authz).forEach(authKey => {
      window.authorizations.remove(authKey);
    });
  }

  // Clear the list of currently enabled scopes
  window.enabledScopes = null;

  // Update UI icons to reflect the unauthorized state
  $('.api-status-indicator.indicator-active').removeClass('indicator-active').addClass('indicator-inactive');
  $('.api-status-indicator.indicator-caution').removeClass('indicator-caution').addClass('indicator-alert'); // Elevate warnings to alerts on logout
}

/**
 * Initializes the OAuth2 client module with application-specific settings.
 *
 * @param {object} initConfig - Configuration object.
 * @param {string} initConfig.appName - The display name of the application.
 * @param {jQuery} initConfig.popupMask - jQuery object for the global mask element.
 * @param {string} initConfig.clientId - The OAuth2 client ID.
 * @param {string} initConfig.realm - The OAuth2 realm or security domain.
 */
function initializeOAuthClient(initConfig) {
  outputDebugMessage('Configuring OAuth client module.');
  const config = initConfig || {};
  const setupErrors = [];

  // Assign global configuration parameters, collecting any missing required values
  applicationTitle = config.appName || setupErrors.push('Missing "appName" in OAuth configuration');
  overlayElement = config.popupMask || $('#api-common-mask'); // Use provided mask or default selector
  clientIdentifier = config.clientId || setupErrors.push('Missing "clientId" in OAuth configuration');
  securityDomain = config.realm || setupErrors.push('Missing "realm" in OAuth configuration');

  // If any critical configuration is missing, log errors and halt initialization
  if (setupErrors.length > 0) {
    outputDebugMessage(`OAuth client initialization failed: ${setupErrors.join(', ')}`);
    // Consider adding a user-facing error message here
    return;
  }

  // Apply syntax highlighting to code blocks (if highlight.js is available)
  $('pre code').each((_idx, codeBlockElement) => {
    if (window.hljs) {
      window.hljs.highlightBlock(codeBlockElement);
    } else {
      outputDebugMessage('Highlight.js not detected; skipping code block highlighting.');
    }
  });

  // Attach click handlers to API security status icons
  $('.api-status-indicator').on('click', function(event) {
    event.preventDefault(); // Prevent default action (e.g., navigating if it's an anchor)
    const currentIcon = $(this);

    if (currentIcon.hasClass('indicator-inactive')) {
      initiateAuthorizationFlow(); // User wishes to log in
    } else {
      terminateAuthorizationSession(); // User wishes to log out
    }
  });
}

/**
 * Handles the result returned from the OAuth2 authorization server callback.
 * This function is typically invoked by the o2c.html page.
 *
 * @param {object} authResponse - The authorization result object, containing token or error information.
 */
function processOAuthCallback(authResponse) {
  outputDebugMessage('Processing OAuth authorization response.');

  if (!authResponse) {
    outputDebugMessage('Empty authorization response received.');
    return;
  }

  if (authResponse.error) {
    outputDebugMessage(`OAuth error detected: ${authResponse.error}`);
    // Deselect any "secured" checkboxes on the page upon an authorization error
    $('input[type="checkbox"].secured-api-endpoint').prop('checked', false);
    alert(`Authorization Failure: ${authResponse.error}`);
  } else {
    const receivedBearerToken = authResponse[window.swaggerUi.tokenName || 'access_token'];

    if (receivedBearerToken) {
      outputDebugMessage('Bearer token successfully acquired. Validating required permissions.');

      // Iterate through all API information panels to update their authorization status
      $('.auth-scope-requirements #api_information_panel').each(function(_index, infoPanelElement) {
        const currentInfoPanel = $(infoPanelElement);
        const requiredPermissions = [];

        // Extract required scopes from the panel's child elements
        currentInfoPanel.children().each(function(_childIndex, childElement) {
          const permissionText = $(childElement).text().trim();
          if (permissionText) {
            requiredPermissions.push(permissionText);
          }
        });

        // Determine which required permissions are NOT met by the currently enabled scopes
        const unmetPermissions = requiredPermissions.filter(perm =>
          !window.enabledScopes || !window.enabledScopes.includes(perm)
        );

        const statusParentContainer = currentInfoPanel.closest('.auth-scope-requirements'); // Find the parent section

        if (unmetPermissions.length > 0) {
          outputDebugMessage(`Some permissions not granted for panel: ${requiredPermissions.join(', ')}`);
          // Not all required permissions are satisfied
          statusParentContainer.find('.api-status-indicator.indicator-active').removeClass('indicator-active').addClass('indicator-inactive');
          statusParentContainer.find('.api-status-indicator').removeClass('indicator-success').removeClass('indicator-alert').addClass('indicator-caution');
        } else {
          outputDebugMessage(`All required permissions granted for panel: ${requiredPermissions.join(', ')}`);
          // All required permissions are satisfied
          statusParentContainer.find('.api-status-indicator.indicator-inactive').removeClass('indicator-inactive').addClass('indicator-active');
          statusParentContainer.find('.api-status-indicator').removeClass('indicator-caution').removeClass('indicator-alert').addClass('indicator-success');
        }
      });

      // Add the acquired bearer token to the global authorizations object
      if (window.authorizations && window.ApiKeyAuthorization) {
        window.authorizations.add('oauth2', new window.ApiKeyAuthorization('Authorization', `Bearer ${receivedBearerToken}`, 'header'));
        outputDebugMessage('Authorization header updated with new bearer token.');
      } else {
        outputDebugMessage('Required authorization objects (window.authorizations or ApiKeyAuthorization) are unavailable.');
      }
    } else {
      outputDebugMessage('Bearer token was not found in the authorization response.');
    }
  }
}

// Basic check to ensure jQuery is loaded before the module attempts to use it.
if (typeof jQuery === 'undefined') {
  console.error('The jQuery library is a prerequisite for this OAuth module to operate.');
}