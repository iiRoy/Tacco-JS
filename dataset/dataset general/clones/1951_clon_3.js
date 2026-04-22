const coreModule = require("path"); // Renamed 'util' to 'path' (unused originally), 'logging' to 'path' but using console.log
const logger = console.log; // Replaced logging.from(__filename) with direct console.log

/**
 * Manages web-based interactions for an OAuth2 server using Express.
 * @class WebFlowManager
 * @param {object} uriEndpoints - Configuration for various URI endpoints.
 * @param {object} operationalSettings - Optional settings for the adapter.
 */
function WebFlowManager(uriEndpoints, operationalSettings) {
  const instanceRef = this; // Renamed $this to instanceRef
  const runtimeConfig = operationalSettings || {}; // Renamed __$config to runtimeConfig

  // Initialize core service components
  this.authService = null; // Renamed oauth2Server to authService
  this.pathConfigs = uriEndpoints; // Renamed routes to pathConfigs

  /**
   * Sets an error message in the session and redirects to the error page.
   * @param {object} requestObj - The HTTP request object.
   * @param {object} responseObj - The HTTP response object.
   * @param {string} errorMessage - The error message to display.
   */
  this.captureError = (requestObj, responseObj, errorMessage) => {
    // Renamed setError to captureError
    if (!requestObj || !requestObj.session) {
      logger("Warning: Session not available to capture error.");
      return responseObj.status(500).send("Internal Server Error: Session unavailable.");
    }
    requestObj.session.oauth2ErrorData = errorMessage; // Renamed oauth2Error to oauth2ErrorData
    responseObj.redirect(instanceRef.pathConfigs.page_error);
  };

  /**
   * Displays the error page, retrieving the error from the session.
   * @param {object} requestObj - The HTTP request object.
   * @param {object} responseObj - The HTTP response object.
   */
  this.displayErrorPage = (requestObj, responseObj) => {
    // Renamed page_errorHandler to displayErrorPage
    if (!requestObj.session || !requestObj.session.oauth2ErrorData) {
      logger("Error page requested without an active error in session.");
      return responseObj.render("error", {
        issue: "No specific error message provided.",
      });
    }
    const currentIssue = requestObj.session.oauth2ErrorData; // Renamed error to currentIssue
    logger(`Displaying error page: ${currentIssue}`);
    delete requestObj.session.oauth2ErrorData;
    responseObj.render("error", {
      issue: currentIssue,
    });
  };

  /**
   * Handles the user logout process.
   * @param {object} requestObj - The HTTP request object.
   * @param {object} responseObj - The HTTP response object.
   */
  this.initiateLogout = (requestObj, responseObj) => {
    // Renamed process_logoutHandler to initiateLogout
    logger("User session termination initiated.");
    if (requestObj.session) {
      requestObj.session.destroy((err) => {
        if (err) {
          logger(`Error destroying session during logout: ${err.message}`);
        }
        responseObj.redirect(instanceRef.pathConfigs.page_account);
      });
    } else {
      logger("No active session to destroy for logout.");
      responseObj.redirect(instanceRef.pathConfigs.page_account);
    }
  };

  /**
   * Renders the login page, potentially pre-filling session data.
   * @param {object} requestObj - The HTTP request object.
   * @param {object} responseObj - The HTTP response object.
   */
  this.renderLoginPage = (requestObj, responseObj) => {
    // Renamed page_loginHandler to renderLoginPage
    const sessionToken = requestObj.param("ses") || null; // Renamed sessionCode to sessionToken
    logger(`Login page access attempt: ${sessionToken ? "with session token" : "standard"}`);

    // Retrieve and clear any pending error messages
    const sessionError = requestObj.session ? requestObj.session.oauth2ErrorData : null;
    if (requestObj.session && requestObj.session.oauth2ErrorData) {
      delete requestObj.session.oauth2ErrorData;
    }

    if (!sessionToken) {
      logger("  - Not an OAuth authentication flow login.");
      return responseObj.render("login", {
        currentResponse: responseObj, // Added currentResponse for potential future use
        loginSessionId: null, // Renamed sessionCode to loginSessionId
        errorMsg: sessionError, // Renamed error to errorMsg
        pageTitle: "User Login", // Added new fragment
      });
    }

    logger("  - OAuth authentication flow login requested.");
    instanceRef.authService.storageAdapter.getOauth2InputBySessionLoginCode(
      instanceRef.authService.sanitizeString(sessionToken), // Renamed fixString to sanitizeString
      (authSessionData) => {
        // Renamed sessionData to authSessionData
        if (!authSessionData) {
          instanceRef.captureError(
            requestObj,
            responseObj,
            `Session invalid or expired for token: ${instanceRef.authService.sanitizeString(
              sessionToken
            )}`
          );
        } else {
          responseObj.render("login", {
            currentResponse: responseObj,
            loginSessionId: sessionToken,
            errorMsg: sessionError,
            pageTitle: "OAuth Login",
          });
        }
      }
    );
  };

  /**
   * Processes a user login attempt.
   * @param {object} requestObj - The HTTP request object.
   * @param {object} responseObj - The HTTP response object.
   */
  this.handleLoginSubmission = (requestObj, responseObj) => {
    // Renamed process_loginHandler to handleLoginSubmission
    const loginToken = requestObj.param("ses") || null; // Renamed sessionCode to loginToken
    const userIdentifier = requestObj.param("username") || ""; // Renamed username to userIdentifier
    const userSecret = requestObj.param("password") || ""; // Renamed password to userSecret

    logger("Processing user login credentials.");

    if (!userIdentifier || !userSecret) {
      instanceRef.captureError(requestObj, responseObj, "Username and password are required.");
      return;
    }

    instanceRef.authService.storageAdapter.getUserAccountBy(
      {
        username: userIdentifier.trim(), // Trim added as new fragment
        password: userSecret,
      },
      (userRecord) => {
        // Renamed account to userRecord
        if (userRecord) {
          logger("  - User account located.");
          requestObj.session.activeUser = userRecord; // Renamed loggedInAccount to activeUser

          if (loginToken) {
            logger("  - Login associated with an OAuth session token.");
            instanceRef.authService.storageAdapter.getOauth2InputBySessionLoginCode(
              instanceRef.authService.sanitizeString(loginToken),
              (oAuthSessionData) => {
                // Renamed sessionData to oAuthSessionData
                if (oAuthSessionData) {
                  logger("  - OAuth session data retrieved.");
                  userRecord.authorized = userRecord.authorized || {}; // Simplified null/undefined check
                  if (!userRecord.authorized[oAuthSessionData.stateObject.client_id]) {
                    logger("  - Application not yet authorized by this user; redirecting to scopes page.");
                    responseObj.redirect(
                      `${instanceRef.pathConfigs.page_scopes}?ses=${instanceRef.authService.sanitizeString(
                        loginToken
                      )}`
                    );
                  } else {
                    logger("  - Application already authorized. Generating authorization code.");
                    const authorizationCode = instanceRef.authService.generateAuthCode(
                      oAuthSessionData.stateObject.client_id
                    );
                    instanceRef.authService.storageAdapter.storeAuthCode(
                      instanceRef.authService.sanitizeString(authorizationCode),
                      oAuthSessionData.stateObject
                    );
                    instanceRef.authService.sendResponse(
                      oAuthSessionData.stateObject,
                      {
                        code: authorizationCode,
                        redirect_uri: oAuthSessionData.stateObject.redirect_uri, // Added for clarity, might be redundant if already in stateObject
                      },
                      responseObj
                    );
                  }
                } else {
                  logger("  - OAuth session data not found; redirecting to user account page.");
                  responseObj.redirect(instanceRef.pathConfigs.page_account);
                }
              }
            );
          } else {
            logger("  - Standard user login without OAuth context.");
            responseObj.redirect(instanceRef.pathConfigs.page_account);
          }
        } else {
          logger("Login attempt failed: Invalid credentials.");
          let redirectUrl = instanceRef.pathConfigs.page_login; // Renamed _url to redirectUrl
          if (loginToken) {
            redirectUrl += `?ses=${instanceRef.authService.sanitizeString(loginToken)}`;
          }
          requestObj.session.oauth2ErrorData = "Invalid username or password."; // Reworded error message
          responseObj.redirect(redirectUrl);
        }
      }
    );
  };

  /**
   * Processes an incoming OAuth2 authorization request.
   * @param {object} requestObj - The HTTP request object.
   * @param {object} responseObj - The HTTP response object.
   */
  this.processAuthRequest = (requestObj, responseObj) => {
    // Renamed process_authHandler to processAuthRequest
    const requestDetails = {
      // Renamed stateObject to requestDetails
      clientID: requestObj.param("client_id") || null, // Renamed client_id to clientID
      redirectUri: requestObj.param("redirect_uri") || null, // Renamed redirect_uri to redirectUri
      responseMode: requestObj.param("response_type") || null, // Renamed response_type to responseMode
      scopeList: requestObj.param("scope") || null, // Renamed scope to scopeList
      requestState: requestObj.param("state") || null, // Renamed state to requestState
    };

    logger("Received authentication request.");

    const validationResult = instanceRef.authService.validateAuthRequest(
      requestDetails,
      requestObj.header("Referer")
    ); // Renamed validationStatus to validationResult

    if (validationResult.error) {
      logger(
        `  - Validation failed: ${validationResult.error} - ${validationResult.error_description}`
      );
      instanceRef.authService.sendErrorResponse(requestDetails, validationResult, responseObj);
      return;
    }

    logger("  - Input parameters validated:", requestDetails);
    requestDetails.clientID = instanceRef.authService.sanitizeString(requestDetails.clientID);

    instanceRef.authService.storageAdapter.clientIdLookup(
      requestDetails.clientID,
      (clientApplication) => {
        // Renamed clientApp to clientApplication
        if (!clientApplication) {
          logger("  - Client application not found for ID:", requestDetails.clientID);
          instanceRef.authService.sendErrorResponse(
            requestDetails,
            {
              error: "unauthorized_client",
              error_description: "Provided Client ID is unrecognized.",
            },
            responseObj
          );
        } else {
          if (!requestObj.session || !requestObj.session.activeUser) {
            logger("  - User not authenticated. Redirecting to login page.");
            const sessionLoginCode = instanceRef.authService.generateLoginSessionCode(
              requestDetails.clientID
            );
            instanceRef.authService.storageAdapter.storeSessionLoginCode(
              sessionLoginCode,
              requestDetails
            );
            responseObj.redirect(
              `${instanceRef.pathConfigs.page_login}?ses=${sessionLoginCode}`
            );
          } else {
            logger("  - User session is active.");
            instanceRef.authService.storageAdapter.getUserAccountBy(
              {
                username: requestObj.session.activeUser.username,
              },
              (currentUserAccount) => {
                // Renamed account to currentUserAccount
                if (currentUserAccount) {
                  logger("  - User account confirmed.");
                  currentUserAccount.authorized = currentUserAccount.authorized || {}; // Simplified check
                  if (!currentUserAccount.authorized[requestDetails.clientID]) {
                    logger("  - Application not yet approved by the user.");
                    const sessionLoginCode = instanceRef.authService.generateLoginSessionCode(
                      requestDetails.clientID
                    );
                    instanceRef.authService.storageAdapter.storeSessionLoginCode(
                      sessionLoginCode,
                      requestDetails
                    );
                    responseObj.redirect(
                      `${instanceRef.pathConfigs.page_scopes}?ses=${sessionLoginCode}`
                    );
                  } else {
                    logger("  - Application previously approved by user. Issuing auth code.");
                    const authorizationCode = instanceRef.authService.generateAuthCode(
                      requestDetails.clientID
                    );
                    instanceRef.authService.storageAdapter.storeAuthCode(
                      instanceRef.authService.sanitizeString(authorizationCode),
                      requestDetails
                    );
                    instanceRef.authService.storageAdapter.assignUserOAuth2Session(
                      requestObj.session.activeUser.username,
                      instanceRef.authService.sanitizeString(authorizationCode),
                      requestDetails
                    );
                    instanceRef.authService.sendResponse(
                      requestDetails,
                      {
                        code: authorizationCode,
                        redirect_uri: requestDetails.redirectUri,
                      },
                      responseObj
                    );
                  }
                } else {
                  logger("  - User account not found during auth flow.");
                  instanceRef.authService.sendErrorResponse(
                    requestDetails,
                    {
                      error: "unauthorized_client",
                      error_description: "User account verification failed.",
                    },
                    responseObj
                  );
                }
              }
            );
          }
        }
      }
    );
  };

  /**
   * Renders the scopes approval page for an OAuth application.
   * @param {object} requestObj - The HTTP request object.
   * @param {object} responseObj - The HTTP response object.
   */
  this.displayScopesPage = (requestObj, responseObj) => {
    // Renamed page_scopesHandler to displayScopesPage
    logger("Scopes approval page requested.");

    if (!requestObj.session || !requestObj.session.activeUser) {
      logger("  - User not logged in. Redirecting to login.");
      return responseObj.redirect(instanceRef.pathConfigs.page_login);
    }

    const approvalSessionToken = requestObj.param("ses") || null; // Renamed sessionCode to approvalSessionToken
    if (!approvalSessionToken) {
      logger("  - Missing session token for scope approval.");
      return instanceRef.captureError(requestObj, responseObj, "Session ID missing for scope approval.");
    }

    logger("  - Retrieving session data for token.");

    instanceRef.authService.storageAdapter.getOauth2InputBySessionLoginCode(
      instanceRef.authService.sanitizeString(approvalSessionToken),
      (authSessionDetails) => {
        // Renamed sessionData to authSessionDetails
        if (!authSessionDetails) {
          logger("  - Session data not found or expired for approval.");
          return instanceRef.captureError(
            requestObj,
            responseObj,
            "Approval session expired or invalid."
          );
        }

        logger("  - Session data found. Loading client application details.");
        instanceRef.authService.storageAdapter.clientIdLookup(
          authSessionDetails.stateObject.clientID, // Using clientID from renamed stateObject
          (clientAppInfo) => {
            // Renamed clientApp to clientAppInfo
            if (!clientAppInfo) {
              logger("  - Client application details not found. This is unusual.");
              return instanceRef.captureError(
                requestObj,
                responseObj,
                "invalid_request: Client application details unavailable."
              );
            }

            logger("  - Client application found. Preparing scopes for user approval.");
            const requestedScopeArray = authSessionDetails.stateObject.scopeList.split(" "); // Renamed requestedScopes to requestedScopeArray
            const scopeDetails = requestedScopeArray.map((scopeItem) => ({
              // Renamed scopes to scopeDetails, using map for transformation
              scope: scopeItem,
              displayName: instanceRef.authService.getScopeName(scopeItem), // Renamed name to displayName
            }));

            responseObj.render("scopes", {
              availableScopes: scopeDetails, // Renamed scopes to availableScopes
              applicationInfo: clientAppInfo, // Renamed clientApp to applicationInfo
              sessionIdentifier: instanceRef.authService.sanitizeString(approvalSessionToken), // Renamed sessionCode to sessionIdentifier
              userDisplayName: requestObj.session.activeUser.username, // Added new fragment
            });
          }
        );
      }
    );
  };

  /**
   * Processes the user's decision on scope approval.
   * @param {object} requestObj - The HTTP request object.
   * @param {object} responseObj - The HTTP response object.
   */
  this.handleScopeApproval = (requestObj, responseObj) => {
    // Renamed process_scopesHandler to handleScopeApproval
    logger("Processing user's scope approval decision.");

    if (!(requestObj.session && requestObj.session.activeUser)) {
      logger("  - No active user session for scope approval. Redirecting to login.");
      return responseObj.redirect(instanceRef.pathConfigs.page_login);
    }

    const approvalSessionKey = requestObj.param("ses") || null; // Renamed sessionCode to approvalSessionKey
    if (!approvalSessionKey) {
      logger("  - Missing session key for scope approval.");
      return instanceRef.captureError(requestObj, responseObj, "Approval session key missing.");
    }

    const approvalDecision = requestObj.param("access_status") || null; // Renamed accessStatus to approvalDecision
    if (!["allow", "deny"].includes(approvalDecision)) {
      logger(`  - Unrecognized approval status: ${approvalDecision}.`);
      return instanceRef.captureError(
        requestObj,
        responseObj,
        `Invalid approval status: ${approvalDecision}`
      );
    }

    logger("  - Looking up approval session data.");
    instanceRef.authService.storageAdapter.getOauth2InputBySessionLoginCode(
      instanceRef.authService.sanitizeString(approvalSessionKey),
      (approvalSessionData) => {
        if (!approvalSessionData) {
          logger("  - Approval session data not found or expired.");
          return instanceRef.captureError(requestObj, responseObj, "Approval session expired.");
        }

        logger("  - Approval session data found. Removing session key.");
        // We ensure this code cannot be reused immediately.
        // Changed process.nextTick to direct call for Type III structural change, assuming immediate removal is acceptable.
        instanceRef.authService.storageAdapter.removeSessionLoginCode(
          instanceRef.authService.sanitizeString(approvalSessionKey)
        );

        if (approvalDecision === "allow") {
          logger("  - User granted access.");
          const newAuthCode = instanceRef.authService.generateAuthCode(
            approvalSessionData.stateObject.clientID
          );
          instanceRef.authService.storageAdapter.storeAuthCode(
            instanceRef.authService.sanitizeString(newAuthCode),
            approvalSessionData.stateObject
          );
          instanceRef.authService.storageAdapter.updateUserPrivileges(
            requestObj.session.activeUser.username,
            approvalSessionData.stateObject.clientID,
            approvalSessionData.stateObject.scopeList.split(" ")
          );
          instanceRef.authService.storageAdapter.assignUserOAuth2Session(
            requestObj.session.activeUser.username,
            instanceRef.authService.sanitizeString(newAuthCode),
            approvalSessionData.stateObject
          );
          instanceRef.authService.sendResponse(
            approvalSessionData.stateObject,
            {
              code: newAuthCode,
              redirect_uri: approvalSessionData.stateObject.redirectUri,
            },
            responseObj
          );
        } else {
          logger("  - User denied access.");
          instanceRef.authService.sendErrorResponse(
            approvalSessionData.stateObject,
            {
              error: "access_denied",
              error_description: "User explicitly denied access to the application.",
            },
            responseObj
          );
        }
      }
    );
  };

  /**
   * Handles the deauthorization of an application by the user.
   * @param {object} requestObj - The HTTP request object.
   * @param {object} responseObj - The HTTP response object.
   */
  this.handleAppDeauthorization = (requestObj, responseObj) => {
    // Renamed process_deauthorizeAppHandler to handleAppDeauthorization
    logger("Application deauthorization requested by user.");

    if (!requestObj.session || !requestObj.session.activeUser) {
      logger("  - No active user session for deauthorization. Redirecting to account page.");
      return responseObj.redirect(instanceRef.pathConfigs.page_account);
    }

    const targetClientId = requestObj.param("client_id") || null;
    if (!targetClientId) {
      logger("  - Missing client_id for deauthorization request.");
      return instanceRef.captureError(requestObj, responseObj, "Missing application identifier.");
    }

    instanceRef.authService.storageAdapter.updateUserPrivileges(
      requestObj.session.activeUser.username,
      targetClientId,
      null
    ); // Setting privileges to null to deauthorize
    logger(`  - User privileges updated for client ID: ${targetClientId}.`);

    // Changed process.nextTick to direct call for Type III structural change.
    instanceRef.authService.storageAdapter.removeOAuth2UserSession(
      requestObj.session.activeUser.username,
      targetClientId
    );
    logger(`  - Associated OAuth2 sessions for ${targetClientId} have been cleared.`);

    responseObj.redirect(instanceRef.pathConfigs.page_account);
  };

  /**
   * Renders the user account page, showing authorized applications.
   * @param {object} requestObj - The HTTP request object.
   * @param {object} responseObj - The HTTP response object.
   */
  this.displayAccountPage = (requestObj, responseObj) => {
    // Renamed page_accountHandler to displayAccountPage
    const userIsLoggedIn = !!requestObj.session.activeUser; // Simplified loggedIn check
    const viewData = {
      isUserAuthenticated: userIsLoggedIn, // Renamed loggedIn to isUserAuthenticated
      authorizedApplications: [], // Renamed authorizedApps to authorizedApplications
      pageError: null, // Renamed error to pageError
    };

    if (userIsLoggedIn) {
      instanceRef.authService.storageAdapter.getUserAccountBy(
        {
          username: requestObj.session.activeUser.username,
        },
        (userAccountDetails) => {
          // Renamed account to userAccountDetails
          if (userAccountDetails) {
            const authorizedClientIds = [];
            const userAuths = userAccountDetails.authorized || {}; // Simplified and added default empty object
            Object.keys(userAuths).forEach((clientIdKey) => {
              // Changed for..in loop to Object.keys().forEach()
              authorizedClientIds.push(clientIdKey);
            });

            if (authorizedClientIds.length > 0) {
              instanceRef.authService.storageAdapter.clientAppsLookup(
                authorizedClientIds,
                (approvedApps) => {
                  // Renamed apps to approvedApps
                  viewData.authorizedApplications = approvedApps;
                  responseObj.render("account", viewData);
                }
              );
            } else {
              // No authorized apps, render immediately
              responseObj.render("account", viewData);
            }
          } else {
            logger("Account not found for active session user.");
            viewData.pageError = "account_not_found";
            responseObj.render("account", viewData);
          }
        }
      );
    } else {
      logger("Account page requested by unauthenticated user.");
      responseObj.render("account", viewData);
    }
  };

  /**
   * Processes requests for OAuth2 access tokens (authorization code or refresh token).
   * @param {object} requestObj - The HTTP request object.
   * @param {object} responseObj - The HTTP response object.
   */
  this.handleTokenRequest = (requestObj, responseObj) => {
    // Renamed process_tokenHandler to handleTokenRequest
    const tokenRequestData = {
      // Renamed stateObject to tokenRequestData
      grantType: requestObj.param("grant_type") || null, // Renamed grant_type to grantType
      clientID: requestObj.param("client_id") || null,
      clientSecret: requestObj.param("client_secret") || null,
      authorizationCode: requestObj.param("code") || null, // Renamed code to authorizationCode
      refreshToken: requestObj.param("refresh_token") || null,
    };

    logger("OAuth2 token request received:", tokenRequestData);

    const tokenValidation = instanceRef.authService.validateTokenRequest(
      tokenRequestData,
      requestObj.header("Referer")
    ); // Renamed validationStatus to tokenValidation

    if (tokenValidation.error) {
      logger("  - Token input validation failed:", tokenValidation);
      instanceRef.authService.sendBodyErrorResponse(tokenValidation, responseObj);
      return; // Added return to ensure no further processing
    }

    // Handle 'authorization_code' grant type
    if (tokenRequestData.grantType === "authorization_code") {
      logger("  - Processing authorization code grant type.");

      instanceRef.authService.storageAdapter.getOAuth2InputByAuthCode(
        tokenRequestData.authorizationCode,
        (authCodeSession) => {
          // Renamed authStateObject to authCodeSession
          if (!authCodeSession) {
            logger("  - Authorization code session not found or expired.");
            return instanceRef.authService.sendBodyErrorResponse(
              {
                error: "invalid_grant",
                error_description: "Authorization code invalid or expired.",
              },
              responseObj
            );
          }

          if (tokenRequestData.clientID !== authCodeSession.clientID) {
            logger("  - Client ID mismatch for authorization code.");
            return instanceRef.authService.sendBodyErrorResponse(
              {
                error: "invalid_client",
                error_description: "Client ID mismatch with authorization code.",
              },
              responseObj
            );
          }

          instanceRef.authService.storageAdapter.clientIdLookup(
            tokenRequestData.clientID,
            (clientAppRecord) => {
              // Renamed app to clientAppRecord
              if (!clientAppRecord) {
                logger("  - Client application record not found for token request.");
                return instanceRef.authService.sendBodyErrorResponse(
                  {
                    error: "invalid_client",
                    error_description: "Provided Client ID is invalid.",
                  },
                  responseObj
                );
              }

              if (tokenRequestData.clientSecret !== clientAppRecord.client_secret) {
                logger("  - Client secret mismatch for token request.");
                return instanceRef.authService.sendBodyErrorResponse(
                  {
                    error: "invalid_client",
                    error_description: "Client secret provided is invalid.",
                  },
                  responseObj
                );
              }

              instanceRef.authService.storageAdapter.getUserOAuth2Session(
                {
                  auth_code: tokenRequestData.authorizationCode,
                },
                (userOAuthSession) => {
                  // Renamed oauth2Session to userOAuthSession
                  if (!userOAuthSession) {
                    logger("  - User OAuth2 session not found for auth code.");
                    return instanceRef.authService.sendBodyErrorResponse(
                      {
                        error: "invalid_grant",
                        error_description: "Auth code invalid or already used.",
                      },
                      responseObj
                    );
                  }

                  logger("  - Authorization code validated. Issuing new access token.");
                  // Delete auth_code from session after use (one-time use)
                  delete userOAuthSession.auth_code;
                  userOAuthSession.accessToken = instanceRef.authService.generateAuthToken(
                    userOAuthSession.client_id
                  ); // Renamed authorization_token to accessToken
                  userOAuthSession.accessTokenIssuedAt = new Date(); // Renamed authorization_token_created_at
                  userOAuthSession.accessTokenExpiresAt = new Date(
                    userOAuthSession.accessTokenIssuedAt.getTime() + 3600 * 1000
                  ); // Renamed authorization_token_expire_at

                  instanceRef.authService.storageAdapter.updateUserOAuth2Session(
                    {
                      auth_code: tokenRequestData.authorizationCode,
                    },
                    userOAuthSession
                  ); // Update by original auth_code

                  instanceRef.authService.sendBodyResponse(
                    {
                      access_token: userOAuthSession.accessToken, // Renamed authorization_token
                      refresh_token: userOAuthSession.refresh_token,
                      expires_in: 3600,
                      token_type: "Bearer", // Added new fragment for standard OAuth
                    },
                    responseObj
                  );
                }
              );
            }
          );
        }
      );
    }
    // Handle 'refresh_token' grant type
    else if (tokenRequestData.grantType === "refresh_token") {
      logger("  - Processing refresh token grant type.");

      instanceRef.authService.storageAdapter.clientIdLookup(
        tokenRequestData.clientID,
        (clientAppDetails) => {
          // Renamed app to clientAppDetails
          if (!clientAppDetails) {
            logger("  - Client application details not found for refresh token request.");
            return instanceRef.authService.sendBodyErrorResponse(
              {
                error: "invalid_client",
                error_description: "Client ID is invalid.",
              },
              responseObj
            );
          }

          if (tokenRequestData.clientSecret !== clientAppDetails.client_secret) {
            logger("  - Client secret invalid for refresh token request.");
            return instanceRef.authService.sendBodyErrorResponse(
              {
                error: "invalid_client",
                error_description: "Client secret is invalid.",
              },
              responseObj
            );
          }

          instanceRef.authService.storageAdapter.getUserOAuth2Session(
            {
              refresh_token: tokenRequestData.refreshToken,
            },
            (sessionForRefresh) => {
              // Renamed oauth2Session to sessionForRefresh
              if (!sessionForRefresh) {
                logger("  - OAuth2 session not found by refresh token.");
                return instanceRef.authService.sendBodyErrorResponse(
                  {
                    error: "invalid_grant",
                    error_description: "Unrecognized or revoked refresh token.",
                  },
                  responseObj
                );
              }

              if (!sessionForRefresh.accessToken) {
                logger("  - Session lacks an active access token. Session deemed invalid.");
                return instanceRef.authService.sendBodyErrorResponse(
                  {
                    error: "invalid_session",
                    error_description: "Invalid OAuth2 session state.",
                  },
                  responseObj
                );
              }

              const currentTime = new Date();
              if (sessionForRefresh.accessTokenExpiresAt.getTime() > currentTime.getTime()) {
                logger("  - Access token has not yet expired. Refresh not needed.");
                return instanceRef.authService.sendBodyErrorResponse(
                  {
                    error: "invalid_request",
                    error_description: "Refresh token requested prematurely.",
                  },
                  responseObj
                );
              }

              logger("  - Generating new access token using refresh token.");
              sessionForRefresh.accessToken = instanceRef.authService.generateAuthToken(
                sessionForRefresh.client_id
              );
              sessionForRefresh.accessTokenIssuedAt = currentTime;
              sessionForRefresh.accessTokenExpiresAt = new Date(
                currentTime.getTime() + 3600 * 1000
              );

              instanceRef.authService.storageAdapter.updateUserOAuth2Session(
                {
                  refresh_token: tokenRequestData.refreshToken,
                },
                sessionForRefresh
              );

              instanceRef.authService.sendBodyResponse(
                {
                  access_token: sessionForRefresh.accessToken,
                  expires_in: 3600,
                  token_type: "Bearer",
                },
                responseObj
              );
            }
          );
        }
      );
    } else {
      logger("  - Unsupported grant type received:", tokenRequestData.grantType);
      instanceRef.authService.sendBodyErrorResponse(
        {
          error: "unsupported_grant_type",
          error_description: `Grant type '${tokenRequestData.grantType}' is not supported.`,
        },
        responseObj
      );
    }
  };
}

// Export the primary class
module.exports.WebFlowManager = WebFlowManager;