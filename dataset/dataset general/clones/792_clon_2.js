var applicationTitle;
var overlayElement;
var modalWindow;
var clientIdentifier;
var securityRealm;

function initiateAuthentication() {
  // Collection for granted access permissions
  var accessPermissions = [];

  // Retrieve security definitions from the API handler
  var securityDefs = window.apiDocInterface.apiHandler.authSchemes || window.apiDocInterface.apiHandler.securityDefinitions;

  if (securityDefs) {
    var defKey;
    var definitions = securityDefs;

    // Iterate through each security definition
    for (defKey in definitions) {
      var authorizationItem = definitions[defKey];

      // Check if it's an OAuth2 type with defined privileges
      if (authorizationItem.kind === 'oauth2' && authorizationItem.privileges) {
        var permissionEntry;

        if (Array.isArray(authorizationItem.privileges)) {
          // Handle 1.2 specification format for privileges
          var idx;
          for (idx = 0; idx < authorizationItem.privileges.length; idx++) {
            accessPermissions.push(authorizationItem.privileges[idx]);
          }
        } else {
          // Handle 2.0 specification format for privileges
          for (permissionEntry in authorizationItem.privileges) {
            accessPermissions.push({
              privilege: permissionEntry,
              description: authorizationItem.privileges[permissionEntry]
            });
          }
        }
      }
    }
  }

  // Set the application title if available in the API info
  if (window.apiDocInterface.apiHandler && window.apiDocInterface.apiHandler.info) {
    applicationTitle = window.apiDocInterface.apiHandler.info.title;
  }

  // Construct the modal dialog HTML
  modalWindow = $(
    [
      '<div class="auth-modal-dialog">',
      '<div class="auth-modal-header">Select OAuth2.0 Privileges</div>',
      '<div class="auth-modal-body">',
      '<p>Privileges define the level of access an application has to user data. Each API may specify one or more privileges.',
      '<a href="#">Learn more about privileges</a>',
      '</p>',
      '<p><strong>' + applicationTitle + '</strong> API requires the following privileges. Choose which ones to grant to the API client.</p>',
      '<ul class="auth-modal-privileges">',
      '</ul>',
      '<p class="status-message-error"></p>',
      '<div class="auth-modal-actions"><button class="auth-action-button action-button primary" type="button">Grant Access</button><button class="auth-cancel-button action-button secondary" type="button">Dismiss</button></div>',
      '</div>',
      '</div>'
    ].join('')
  );

  // Append the constructed modal to the document body
  $(document.body).append(modalWindow);

  // Populate the privilege list within the modal
  var permissionListElement = modalWindow.find('ul.auth-modal-privileges').empty();
  for (var idx = 0; idx < accessPermissions.length; idx++) {
    var permissionEntry = accessPermissions[idx];
    var htmlSnippet = '<li><input type="checkbox" id="privilege_' + idx + '" privilege="' + permissionEntry.privilege + '"/>' + '<label for="privilege_' + idx + '">' + permissionEntry.privilege;
    if (permissionEntry.description) {
      htmlSnippet += '<br/><span class="privilege-description">' + permissionEntry.description + '</span>';
    }
    htmlSnippet += '</label></li>';
    permissionListElement.append(htmlSnippet);
  }

  // Calculate and set the position of the modal dialog
  var windowObj = $(window),
    displayWidth = windowObj.width(),
    displayHeight = windowObj.height(),
    scrollOffset = windowObj.scrollTop(),
    dialogWidth = modalWindow.outerWidth(),
    dialogHeight = modalWindow.outerHeight(),
    topPosition = (displayHeight - dialogHeight) / 2 + scrollOffset,
    leftPosition = (displayWidth - dialogWidth) / 2;

  modalWindow.css({
    top: (topPosition < 0 ? 0 : topPosition) + 'px',
    left: (leftPosition < 0 ? 0 : leftPosition) + 'px'
  });

  // Handle the cancel button click event
  modalWindow.find('button.auth-cancel-button').click(function() {
    overlayElement.hide();
    modalWindow.hide();
    modalWindow.empty();
    modalWindow = []; // Clear reference
  });

  // Handle the authorize button click event
  modalWindow.find('button.auth-action-button').click(function() {
    overlayElement.hide();
    modalWindow.hide();

    var authConfigItems = window.apiDocInterface.apiHandler.authSchemes;
    var currentHost = window.location;
    var pathNameComponent = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
    var returnUrl = currentHost.protocol + '//' + currentHost.host + pathNameComponent + '/o2c.html';
    var targetUrl = null;

    // Find the appropriate authorization URL
    for (var configKey in authConfigItems) {
      if (authConfigItems.hasOwnProperty(configKey)) {
        if (authConfigItems[configKey].kind === 'oauth2' && authConfigItems[configKey].flow === 'implicit') {
          var details = authConfigItems[configKey];
          targetUrl = details.authorizationUrl + '?response_type=token';
          window.apiDocInterface.tokenIdentifier = details.tokenUrl || 'access_token';
        } else if (authConfigItems[configKey].grantTypes) {
          // Handle 1.2 spec grant types
          var grantDetails = authConfigItems[configKey].grantTypes;
          for (var typeKey in grantDetails) {
            if (grantDetails.hasOwnProperty(typeKey) && typeKey === 'implicit') {
              var details = grantDetails[typeKey];
              var endpointUrl = details.loginEndpoint.url;
              targetUrl = details.loginEndpoint.url + '?response_type=token';
              window.apiDocInterface.tokenIdentifier = details.tokenName;
            }
          }
        }
      }
    }

    // Collect selected privileges
    var selectedPrivileges = [];
    var checkedInputs = $('.auth-modal-privileges').find('input:checked');

    for (var inputIdx = 0; inputIdx < checkedInputs.length; inputIdx++) {
      selectedPrivileges.push($(checkedInputs[inputIdx]).attr('privilege'));
    }

    window.grantedPermissions = selectedPrivileges;

    // Construct the final authorization URL
    targetUrl += '&redirect_uri=' + encodeURIComponent(returnUrl);
    targetUrl += '&realm=' + encodeURIComponent(securityRealm);
    targetUrl += '&client_id=' + encodeURIComponent(clientIdentifier);
    targetUrl += '&scope=' + encodeURIComponent(selectedPrivileges);

    // Open the authorization window
    window.open(targetUrl);
  });

  // Display the overlay and modal
  overlayElement.show();
  modalWindow.show();
  return;
}

function terminateSession() {
  // Remove all active authorizations
  for (var authKey in window.securityManager.activeAuths) {
    window.securityManager.removeEntry(authKey);
  }

  // Clear granted privileges
  window.grantedPermissions = null;

  // Update UI icons to inactive state
  $('.interface-icon.icon-active').addClass('icon-inactive');
  $('.interface-icon.icon-active').removeClass('icon-active');

  // Reset info box icons
  $('.interface-icon.icon-caution').addClass('icon-failure');
  $('.interface-icon.icon-caution').removeClass('icon-caution');
}

function setupOAuthFlow(optionsObject) {
  var config = (optionsObject || {});
  var issueList = [];

  // Initialize global variables from options, or record errors
  applicationTitle = (config.applicationTitle || issueList.push('missing applicationTitle'));
  overlayElement = (config.overlayElement || $('#api-global-mask'));
  modalWindow = (config.modalWindow || $('.auth-modal-dialog'));
  clientIdentifier = (config.clientIdentifier || issueList.push('missing client id'));
  securityRealm = (config.securityRealm || issueList.push('missing realm'));

  // If there are initialization errors, log them and exit
  if (issueList.length > 0) {
    console.warn('Authentication setup failed: ' + issueList.join(', '));
    return;
  }

  // Apply syntax highlighting to code blocks
  $('pre code').each(function(index, element) {
    syntaxHighlighter.colorizeBlock(element);
  });

  // Attach click handler to authorization icons
  $('.interface-icon').click(function(eventObj) {
    if ($(eventObj.target).hasClass('icon-inactive')) {
      initiateAuthentication(); // Start the login flow
    } else {
      terminateSession(); // End the current session
    }
    return false; // Prevent default action
  });
}

function onAuthorizationCallback(authResponse) {
  if (authResponse) {
    if (authResponse.error) {
      // If an error occurred during authorization, uncheck all security checkboxes
      var securityCheckboxes = $('input[type="checkbox"],.protected-resource');
      securityCheckboxes.each(function(position) {
        securityCheckboxes[position].checked = false;
      });
      window.alert(authResponse.error);
    } else {
      // If authorization was successful, process the bearer token
      var bearerToken = authResponse[window.apiDocInterface.tokenIdentifier];
      if (bearerToken) {
        // Check if all required privileges are satisfied
        var containerElement = null;
        $.each($('.security-section #api_details_display'), function(keyIndex, valueNode) {
          var childElements = valueNode;
          if (childElements && childElements.childNodes) {
            var requiredPrivileges = [];
            $.each((childElements.childNodes), function(childKey, childNode) {
              var nodeContent = childNode.innerHTML;
              if (nodeContent)
                requiredPrivileges.push(nodeContent);
            });

            var missingPrivileges = [];
            for (var loopIndex = 0; loopIndex < requiredPrivileges.length; loopIndex++) {
              var currentPrivilege = requiredPrivileges[loopIndex];
              if (window.grantedPermissions && window.grantedPermissions.indexOf(currentPrivilege) === -1) {
                missingPrivileges.push(currentPrivilege);
              }
            }

            if (missingPrivileges.length > 0) {
              // Not all privileges are satisfied
              containerElement = valueNode.parentNode;
              $(containerElement.parentNode).find('.interface-icon.icon-active').addClass('icon-inactive');
              $(containerElement.parentNode).find('.interface-icon.icon-active').removeClass('icon-active');

              $(containerElement).find('.interface-icon').addClass('icon-caution');
              $(containerElement).find('.interface-icon').removeClass('icon-failure');
            } else {
              // All privileges are satisfied
              containerElement = valueNode.parentNode;
              $(containerElement.parentNode).find('.interface-icon.icon-inactive').addClass('icon-active');
              $(containerElement.parentNode).find('.interface-icon.icon-inactive').removeClass('icon-inactive');

              $(containerElement).find('.interface-icon').addClass('icon-success');
              $(containerElement).find('.interface-icon').removeClass('icon-caution');
              $(containerElement).find('.interface-icon').removeClass('icon-failure');
            }
          }
        });
        // Add the new authorization to the security manager
        window.securityManager.addEntry('oauth2', new BearerTokenCredential('Authorization', 'Bearer ' + bearerToken, 'header'));
      }
    }
  }
}