const utilityModule = require("util");
const appLogger = require("appLog").from(module.filename);

function WebServerBridge( endpointMap, configOptions ) {

    // Reference to the current instance for internal use
    const selfRef = this;
    // Initialize internal configuration from provided options or an empty object
    const internalConfig = configOptions || {};

    // Authentication service instance, initially null
    this.authService = null;
    // Map of application endpoints
    this.endpointMap = endpointMap;

    // Sets an error message in the session and redirects to the error page
    this.dispatchError = function(clientReq, serverRes, errorText) {
        clientReq.session.authError = errorText;
        serverRes.redirect(selfRef.endpointMap.errorPage);
    };

    // Handles displaying the error page
    this.displayErrorPage = function(clientReq, serverRes) {
        const sessionError = clientReq.session.authError;
        appLogger("Displaying error page with message: " + sessionError + ".");
        delete clientReq.session.authError; // Clear the error after displaying
        serverRes.render("errorTemplate", {
            issue: sessionError
        });
    };

    // Processes user logout
    this.handleLogoutRequest = function(clientReq, serverRes) {
        appLogger("User is logging out.");
        clientReq.session.destroy(); // Invalidate the user's session
        serverRes.redirect(selfRef.endpointMap.accountDashboard);
    };

    // Displays the login page, handling both regular and authentication-flow logins
    this.renderLoginPage = function(clientReq, serverRes) {
        const authSessionKey = clientReq.param("session_id", null); // Parameter for authentication session
        appLogger("Login page access requested.");

        if (authSessionKey === null) {
            appLogger(" : Not an authentication process related login.");
            const currentError = clientReq.session.authError;
            delete clientReq.session.authError; // Clear session error
            serverRes.render("loginForm", {
                responseObj: serverRes,
                authSessionKey: null,
                validationError: currentError
            });
            return;
        }

        appLogger("Authentication process login initiated.");
        selfRef.authService.dataStore.retrieveAuthInputBySessionKey(
            selfRef.authService.sanitizeInput(authSessionKey),
            function(sessionDetails) {
                if (sessionDetails === null) {
                    selfRef.dispatchError(
                        clientReq,
                        serverRes,
                        "Authentication session has expired: " + selfRef.authService.sanitizeInput(authSessionKey)
                    );
                } else {
                    const currentError = clientReq.session.authError;
                    delete clientReq.session.authError;
                    serverRes.render("loginForm", {
                        responseObj: serverRes,
                        authSessionKey: authSessionKey,
                        validationError: currentError
                    });
                }
            }
        );
    };

    // Handles the submission of login credentials
    this.handleLoginSubmission = function(clientReq, serverRes) {
        const authSessionKey = clientReq.param("session_id", null);
        const userIdentifier = clientReq.param("username", null);
        const userCredential = clientReq.param("password", null);

        appLogger("Initiating login process for user.");
        selfRef.authService.dataStore.findUserByCredentials(
            { userIdentifier: userIdentifier, userCredential: userCredential },
            function(userRecord) {
                if (userRecord !== null) {
                    appLogger(" : User account successfully located.");
                    clientReq.session.activeUser = userRecord; // Store user in session

                    if (authSessionKey !== null) {
                        appLogger(" : Authentication session key found, indicating an auth process login.");
                        selfRef.authService.dataStore.retrieveAuthInputBySessionKey(
                            selfRef.authService.sanitizeInput(authSessionKey),
                            function(sessionInfo) {
                                if (sessionInfo !== null) {
                                    appLogger(" : Session details retrieved.");
                                    if (userRecord.approvedApps === null || userRecord.approvedApps === undefined) {
                                        userRecord.approvedApps = {};
                                    }
                                    if (
                                        userRecord.approvedApps[sessionInfo.authState.clientId] === null ||
                                        userRecord.approvedApps[sessionInfo.authState.clientId] === undefined
                                    ) {
                                        appLogger(" : Application not yet authorized by this user; redirecting to scopes approval page.");
                                        serverRes.redirect(
                                            selfRef.endpointMap.scopesApproval +
                                            "?session_id=" +
                                            selfRef.authService.sanitizeInput(authSessionKey)
                                        );
                                        serverRes.end();
                                    } else {
                                        appLogger(" : Application already authorized - generating authorization code.");
                                        const authorizationCode = selfRef.authService.generateAuthCode(
                                            sessionInfo.authState.clientId
                                        );
                                        selfRef.authService.dataStore.saveAuthCode(
                                            selfRef.authService.sanitizeInput(authorizationCode),
                                            sessionInfo.authState
                                        );
                                        selfRef.authService.sendResponse(
                                            sessionInfo.authState,
                                            { code: authorizationCode },
                                            serverRes
                                        );
                                    }
                                } else {
                                    appLogger(" : Session details not found, redirecting to user account page.");
                                    serverRes.redirect(selfRef.endpointMap.accountDashboard);
                                    serverRes.end();
                                }
                            }
                        );
                    } else {
                        appLogger(" : No authentication session key, this is a standard user login.");
                        serverRes.redirect(selfRef.endpointMap.accountDashboard);
                        serverRes.end();
                    }
                } else {
                    appLogger("Account not found. Invalid login attempt.");
                    let targetUrl = selfRef.endpointMap.loginPage;
                    if (authSessionKey !== null) {
                        targetUrl += "?session_id=" + selfRef.authService.sanitizeInput(authSessionKey);
                    }
                    clientReq.session.authError = "Unable to authenticate your credentials.";
                    serverRes.redirect(targetUrl);
                    serverRes.end();
                }
            }
        );
    };

    // Handles incoming OAuth2 authorization requests
    this.handleAuthRequest = function(clientReq, serverRes) {
        // Collect all necessary parameters for the authorization request
        const authParameters = {
            clientId: clientReq.param("client_app_id", null),
            redirectUrl: clientReq.param("return_uri", null),
            responseType: clientReq.param("response_format", null),
            scopeList: clientReq.param("access_scope", null),
            clientState: clientReq.param("request_state", null)
        };

        // Validate the incoming authorization request
        const inputValidation = selfRef.authService.validateAuthRequest(
            authParameters,
            clientReq.header("Referer")
        );
        appLogger("Authorization request received.");

        if (inputValidation.error !== null) {
            appLogger(" : Validation error for input:", inputValidation.error, inputValidation.error_description);
            selfRef.authService.sendErrorResponse(authParameters, inputValidation, serverRes);
            return;
        }

        appLogger(" : Validated input parameters:", authParameters);
        authParameters.clientId = selfRef.authService.sanitizeInput(authParameters.clientId);

        // Look up the client application in the data store
        selfRef.authService.dataStore.findClientById(authParameters.clientId, function(applicationClient) {
            if (applicationClient === null) {
                appLogger(" : Client application not found.");
                selfRef.authService.sendErrorResponse(
                    authParameters,
                    { error: "unauthorized_client", error_description: "Provided Client ID is invalid" },
                    serverRes
                );
            } else {
                // Check if user is logged in
                if (!clientReq.session.activeUser) {
                    appLogger(" : User not logged in; prompting for login.");
                    const loginSessionKey = selfRef.authService.generateLoginSessionKey(authParameters.clientId);
                    selfRef.authService.dataStore.saveSessionLoginKey(loginSessionKey, authParameters);
                    serverRes.redirect(selfRef.endpointMap.loginPage + "?session_id=" + loginSessionKey);
                } else {
                    appLogger(" : User is already logged in.");
                    // Retrieve user account details
                    selfRef.authService.dataStore.findUserByCredentials(
                        { userIdentifier: clientReq.session.activeUser.userIdentifier },
                        function(userProfile) {
                            if (userProfile !== null) {
                                appLogger(" : User profile found.");
                                if (userProfile.approvedApps === null || userProfile.approvedApps === undefined) {
                                    userProfile.approvedApps = {};
                                }
                                // Check if the application is already approved by the user
                                if (
                                    userProfile.approvedApps[authParameters.clientId] === null ||
                                    userProfile.approvedApps[authParameters.clientId] === undefined
                                ) {
                                    appLogger(" : Application is not yet approved by the user.");
                                    const loginSessionKey = selfRef.authService.generateLoginSessionKey(
                                        authParameters.clientId
                                    );
                                    selfRef.authService.dataStore.saveSessionLoginKey(loginSessionKey, authParameters);
                                    serverRes.redirect(selfRef.endpointMap.scopesApproval + "?session_id=" + loginSessionKey);
                                } else {
                                    appLogger(" : Application already approved by user.");
                                    const accessCode = selfRef.authService.generateAuthCode(authParameters.clientId);
                                    selfRef.authService.dataStore.saveAuthCode(
                                        selfRef.authService.sanitizeInput(accessCode),
                                        authParameters
                                    );
                                    selfRef.authService.dataStore.assignUserAuthSession(
                                        clientReq.session.activeUser.userIdentifier,
                                        selfRef.authService.sanitizeInput(accessCode),
                                        authParameters
                                    );
                                    selfRef.authService.sendResponse(authParameters, { code: accessCode }, serverRes);
                                }
                            } else {
                                appLogger(" : User profile not found, despite being logged in.");
                                selfRef.authService.sendErrorResponse(
                                    authParameters,
                                    { error: "unauthorized_client", error_description: "User account is invalid." },
                                    serverRes
                                );
                            }
                        }
                    );
                }
            }
        });
    };

    // Renders the page for users to approve or deny requested application scopes
    this.renderScopesPage = function(clientReq, serverRes) {
        appLogger("Permissions approval page requested.");
        if (!clientReq.session.activeUser) {
            appLogger(" : User not logged in. Redirecting to login page.");
            serverRes.redirect(selfRef.endpointMap.loginPage);
            serverRes.end();
            return;
        }

        const authSessionKey = clientReq.param("session_id", null);
        if (authSessionKey === null) {
            appLogger(" : Authentication session key missing or expired.");
            selfRef.dispatchError(clientReq, serverRes, "Authentication session has expired");
            return;
        }

        appLogger(" : Searching for authentication session data.");

        selfRef.authService.dataStore.retrieveAuthInputBySessionKey(
            selfRef.authService.sanitizeInput(authSessionKey),
            function(authSessionData) {
                if (authSessionData === null) {
                    appLogger(" : Authentication session data not found. Session is considered invalid.");
                    selfRef.dispatchError(clientReq, serverRes, "Authentication session has expired");
                    return;
                } else {
                    appLogger(" : Session data found. Retrieving client application details to list permissions.");
                    selfRef.authService.dataStore.findClientById(
                        authSessionData.authState.clientId,
                        function(applicationEntity) {
                            if (applicationEntity === null) {
                                appLogger(" : Client application not found. Unusual.");
                                selfRef.dispatchError(
                                    clientReq,
                                    serverRes,
                                    "invalid_request: Client Application ID invalid"
                                );
                            } else {
                                appLogger(" : Client application found, preparing permissions for user approval.");
                                const desiredPermissions = authSessionData.authState.scopeList.split(" ");
                                const permissionList = [];
                                for (let idx = 0; idx < desiredPermissions.length; idx++) {
                                    permissionList.push({
                                        scope: desiredPermissions[idx],
                                        name: selfRef.authService.getPermissionName(desiredPermissions[idx])
                                    });
                                }
                                serverRes.render("permissionsApproval", {
                                    permissionList: permissionList,
                                    applicationEntity: applicationEntity,
                                    authSessionKey: selfRef.authService.sanitizeInput(authSessionKey)
                                });
                            }
                        }
                    );
                }
            }
        );
    };

    // Processes the user's decision to allow or deny application scopes
    this.handleScopesApproval = function(clientReq, serverRes) {
        appLogger("Processing permission approval/denial.");
        if (!clientReq.session.activeUser) {
            appLogger(" : User not logged in. Redirecting to login page.");
            serverRes.redirect(selfRef.endpointMap.loginPage);
            serverRes.end();
            return;
        }

        const authSessionKey = clientReq.param("session_id", null);
        if (authSessionKey === null) {
            appLogger(" : Authentication session key is null or expired.");
            selfRef.dispatchError(clientReq, serverRes, "Authentication session has expired");
            return;
        }

        const approvalDecision = clientReq.param("decision_status", null); // User's decision
        if (approvalDecision !== "grant" && approvalDecision !== "deny") {
            appLogger(" : Unknown approval status received: " + approvalDecision + ".");
            selfRef.dispatchError(
                clientReq,
                serverRes,
                "Unrecognized application approval status: " + approvalDecision
            );
            return;
        }

        appLogger(" : Retrieving authentication session details.");
        selfRef.authService.dataStore.retrieveAuthInputBySessionKey(
            selfRef.authService.sanitizeInput(authSessionKey),
            function(sessionDetails) {
                if (sessionDetails === null) {
                    appLogger(" : Authentication session details not found.");
                    selfRef.dispatchError(clientReq, serverRes, "Authentication session has expired");
                } else {
                    appLogger(" : Authentication session details found.");
                    // Ensure this session key cannot be reused
                    process.nextTick(function() {
                        selfRef.authService.dataStore.deleteSessionLoginKey(
                            selfRef.authService.sanitizeInput(authSessionKey)
                        );
                    });

                    // Act based on the user's decision
                    if (approvalDecision === "grant") {
                        appLogger(" : User granted access.");
                        const authorizationCode = selfRef.authService.generateAuthCode(
                            sessionDetails.authState.clientId
                        );
                        selfRef.authService.dataStore.saveAuthCode(
                            selfRef.authService.sanitizeInput(authorizationCode),
                            sessionDetails.authState
                        );
                        selfRef.authService.dataStore.updateUserPermissions(
                            clientReq.session.activeUser.userIdentifier,
                            sessionDetails.authState.clientId,
                            sessionDetails.authState.scopeList.split(" ")
                        );
                        selfRef.authService.dataStore.assignUserAuthSession(
                            clientReq.session.activeUser.userIdentifier,
                            selfRef.authService.sanitizeInput(authorizationCode),
                            sessionDetails.authState
                        );
                        selfRef.authService.sendResponse(
                            sessionDetails.authState,
                            { code: authorizationCode },
                            serverRes
                        );
                    } else if (approvalDecision === "deny") {
                        appLogger(" : User denied access.");
                        selfRef.authService.sendErrorResponse(
                            sessionDetails.authState,
                            { error: "access_denied", error_description: "User denied application access." },
                            serverRes
                        );
                    }
                }
            }
        );
    };

    // Processes the request to deauthorize an application for a user
    this.handleAppDeauthorization = function(clientReq, serverRes) {
        appLogger("Application deauthorization requested.");
        if (!clientReq.session.activeUser) {
            appLogger(" : User not logged in. Redirecting to account page.");
            serverRes.redirect(selfRef.endpointMap.accountDashboard);
            serverRes.end();
            return;
        }

        const appIdentifier = clientReq.param("app_to_remove", null);
        selfRef.authService.dataStore.updateUserPermissions(
            clientReq.session.activeUser.userIdentifier,
            appIdentifier,
            null
        );
        appLogger(" : Application deauthorized for user.");

        process.nextTick(function() {
            selfRef.authService.dataStore.deleteUserAuthSession(
                clientReq.session.activeUser.userIdentifier,
                appIdentifier
            );
            appLogger(" : All associated sessions for the deauthorized application have been removed.");
        });

        serverRes.redirect(selfRef.endpointMap.accountDashboard);
    };

    // Renders the user's account dashboard page
    this.renderAccountPage = function(clientReq, serverRes) {
        let approvedApplications = [];
        const isUserAuthenticated = clientReq.session.activeUser !== null && clientReq.session.activeUser !== undefined;

        if (isUserAuthenticated) {
            selfRef.authService.dataStore.findUserByCredentials(
                { userIdentifier: clientReq.session.activeUser.userIdentifier },
                function(userProfile) {
                    if (userProfile !== null) {
                        const appIdentifiers = [];
                        if (userProfile.approvedApps !== null && userProfile.approvedApps !== undefined) {
                            for (const appKey in userProfile.approvedApps) {
                                appIdentifiers.push(appKey);
                            }
                        }
                        selfRef.authService.dataStore.findClientApplications(appIdentifiers, function(appDetails) {
                            serverRes.render("userDashboard", {
                                isAuthenticated: isUserAuthenticated,
                                approvedApplications: appDetails,
                                dashboardError: null
                            });
                        });
                    } else {
                        serverRes.render("userDashboard", {
                            isAuthenticated: isUserAuthenticated,
                            approvedApplications: [],
                            dashboardError: "user_profile_missing"
                        });
                    }
                }
            );
        } else {
            serverRes.render("userDashboard", {
                isAuthenticated: isUserAuthenticated,
                approvedApplications: [],
                dashboardError: null
            });
        }
    };

    // Handles requests for access tokens and refresh tokens
    this.handleTokenIssuance = function(clientReq, serverRes) {
        // Parse token request parameters
        const tokenRequestParams = {
            grantMethod: clientReq.param("grant_type", null),
            clientId: clientReq.param("client_id_param", null),
            clientSecret: clientReq.param("client_secret_param", null),
            authCode: clientReq.param("auth_code_param", null),
            refreshToken: clientReq.param("refresh_token_param", null)
        };

        appLogger("Token request received:", tokenRequestParams);

        // Validate the incoming token request
        const requestValidation = selfRef.authService.validateTokenRequest(
            tokenRequestParams,
            clientReq.header("Referer")
        );
        if (requestValidation.error !== null) {
            appLogger(" : Invalid input detected:", requestValidation);
            selfRef.authService.sendJsonErrorResponse(requestValidation, serverRes);
            serverRes.end();
            return;
        }

        // Process based on grant method
        if (tokenRequestParams.grantMethod === "auth_grant_code") {
            appLogger(" : Authorization code grant method requested.");

            selfRef.authService.dataStore.retrieveAuthInputByCode(
                tokenRequestParams.authCode,
                function(authCodeDetails) {
                    if (authCodeDetails === null) {
                        appLogger(" : Could not find authentication input by code - possibly expired?");
                        selfRef.authService.sendJsonErrorResponse(
                            { error: "invalid_request", error_description: "Authorization code is invalid or expired." },
                            serverRes
                        );
                    } else {
                        if (tokenRequestParams.clientId !== authCodeDetails.clientId) {
                            appLogger(" : Client ID mismatch detected.");
                            selfRef.authService.sendJsonErrorResponse(
                                { error: "invalid_request", error_description: "Authorization code client ID does not match." },
                                serverRes
                            );
                        } else {
                            selfRef.authService.dataStore.findClientById(
                                tokenRequestParams.clientId,
                                function(clientApplication) {
                                    if (clientApplication === null) {
                                        appLogger(" : Client application not found. Critical error.");
                                        selfRef.authService.sendJsonErrorResponse(
                                            { error: "invalid_request", error_description: "Client ID is invalid." },
                                            serverRes
                                        );
                                    } else {
                                        if (tokenRequestParams.clientSecret !== clientApplication.clientSecret) {
                                            appLogger(" : Application found, but client secret is invalid.");
                                            selfRef.authService.sendJsonErrorResponse(
                                                { error: "invalid_request", error_description: "Client secret is invalid." },
                                                serverRes
                                            );
                                        } else {
                                            selfRef.authService.dataStore.retrieveUserAuthSession(
                                                { authCode: tokenRequestParams.authCode },
                                                function(userAuthSession) {
                                                    if (userAuthSession === null) {
                                                        appLogger(" : OAuth2 user session not found, incorrect authorization code.");
                                                        selfRef.authService.sendJsonErrorResponse(
                                                            { error: "invalid_request", error_description: "Authorization code invalid or expired." },
                                                            serverRes
                                                        );
                                                    } else {
                                                        appLogger(" : Authorization code valid. Data validated, issuing access token.");
                                                        delete userAuthSession.authCode; // Remove auth code after use
                                                        userAuthSession.accessToken = selfRef.authService.generateAccessToken(
                                                            userAuthSession.clientId
                                                        );
                                                        userAuthSession.accessTokenIssuedAt = new Date();
                                                        userAuthSession.accessTokenExpiresAt = new Date(
                                                            userAuthSession.accessTokenIssuedAt.getTime() + 3600 * 1000
                                                        );
                                                        selfRef.authService.dataStore.updateUserAuthSession(
                                                            { authCode: tokenRequestParams.authCode },
                                                            userAuthSession
                                                        );

                                                        selfRef.authService.sendJsonResponse(
                                                            {
                                                                access_token: userAuthSession.accessToken,
                                                                refresh_token: userAuthSession.refreshToken,
                                                                expires_in: 3600
                                                            },
                                                            serverRes
                                                        );
                                                    }
                                                }
                                            );
                                        }
                                    }
                                }
                            );
                        }
                    }
                }
            );
        } else if (tokenRequestParams.grantMethod === "refresh_token_grant") {
            appLogger(" : Refresh token grant method requested.");

            selfRef.authService.dataStore.findClientById(
                tokenRequestParams.clientId,
                function(clientApplication) {
                    if (clientApplication === null) {
                        appLogger(" : Client application not found.");
                        selfRef.authService.sendJsonErrorResponse(
                            { error: "invalid_request", error_description: "Client ID is invalid." },
                            serverRes
                        );
                    } else {
                        if (tokenRequestParams.clientSecret !== clientApplication.clientSecret) {
                            appLogger(" : Client secret is invalid.");
                            selfRef.authService.sendJsonErrorResponse(
                                { error: "invalid_request", error_description: "Client secret is invalid." },
                                serverRes
                            );
                        } else {
                            selfRef.authService.dataStore.retrieveUserAuthSession(
                                { refreshToken: tokenRequestParams.refreshToken },
                                function(userAuthSession) {
                                    if (userAuthSession === null) {
                                        appLogger(
                                            " : Could not find a session by refresh token. App deauthorized or token invalid."
                                        );
                                        selfRef.authService.sendJsonErrorResponse(
                                            { error: "invalid_request", error_description: "Unrecognized refresh token." },
                                            serverRes
                                        );
                                    } else {
                                        if (userAuthSession.accessToken === null || userAuthSession.accessToken === undefined) {
                                            appLogger(" : No access token associated with this session. Session is invalid.");
                                            selfRef.authService.sendJsonErrorResponse(
                                                { error: "invalid_request", error_description: "Invalid session state." },
                                                serverRes
                                            );
                                        } else {
                                            if (userAuthSession.accessTokenExpiresAt.getTime() > Date.now()) {
                                                appLogger(" : Access token has not yet expired.");
                                                selfRef.authService.sendJsonErrorResponse(
                                                    { error: "invalid_request", error_description: "Refresh token requested prematurely." },
                                                    serverRes
                                                );
                                            } else {
                                                appLogger(" : Generating a new access token.");
                                                userAuthSession.accessToken = selfRef.authService.generateAccessToken(
                                                    userAuthSession.clientId
                                                );
                                                userAuthSession.accessTokenIssuedAt = new Date();
                                                userAuthSession.accessTokenExpiresAt = new Date(
                                                    userAuthSession.accessTokenIssuedAt.getTime() + 3600 * 1000
                                                );

                                                selfRef.authService.dataStore.updateUserAuthSession(
                                                    { refreshToken: tokenRequestParams.refreshToken },
                                                    userAuthSession
                                                );

                                                selfRef.authService.sendJsonResponse(
                                                    {
                                                        access_token: userAuthSession.accessToken,
                                                        expires_in: 3600
                                                    },
                                                    serverRes
                                                );
                                            }
                                        }
                                    }
                                }
                            );
                        }
                    }
                }
            );
        }
    };

}

// Export the primary web server bridge component
exports.WebServerBridge = WebServerBridge;