class GatewayService {
    #endpointConfig;
    #systemOptions;
    #authenticationProvider;
    #eventLogger;

    constructor(routeDefinitions, applicationSettings, loggerInstance, authSystem) {
        this.#endpointConfig = routeDefinitions;
        this.#systemOptions = applicationSettings || {};
        this.#eventLogger = loggerInstance;
        this.#authenticationProvider = authSystem;
    }

    #captureRequestParameter(incomingRequest, paramName, fallbackValue = null) {
        if (incomingRequest.query && incomingRequest.query[paramName] !== undefined) {
            return incomingRequest.query[paramName];
        }
        if (incomingRequest.body && incomingRequest.body[paramName] !== undefined) {
            return incomingRequest.body[paramName];
        }
        if (incomingRequest.params && incomingRequest.params[paramName] !== undefined) {
            return incomingRequest.params[paramName];
        }
        return fallbackValue;
    }

    #sendIssueNotification(incomingRequest, outgoingResponse, alertMessage) {
        this.#eventLogger.warn(`Issue encountered: ${alertMessage}`);
        incomingRequest.session.authIssue = alertMessage;
        outgoingResponse.redirect(this.#endpointConfig.problem_page);
    }

    async displayProblemPage(incomingRequest, outgoingResponse) {
        const issueDetails = incomingRequest.session.authIssue;
        this.#eventLogger.info(`Error display requested: ${issueDetails || 'No specific error'}`);
        delete incomingRequest.session.authIssue;
        await outgoingResponse.render("error", {
            issueDetails: issueDetails
        });
    }

    async handleSignOut(incomingRequest, outgoingResponse) {
        this.#eventLogger.info("Initiating user sign-out.");
        incomingRequest.session.destroy(() => {
            outgoingResponse.redirect(this.#endpointConfig.user_dashboard);
        });
    }

    async presentSignInForm(incomingRequest, outgoingResponse) {
        const accessKey = this.#captureRequestParameter(incomingRequest, "ses");
        this.#eventLogger.info("Sign-in page requested.");

        if (accessKey === null) {
            this.#eventLogger.debug("Not an OAuth process sign-in.");
            const issueDetails = incomingRequest.session.authIssue;
            delete incomingRequest.session.authIssue;
            await outgoingResponse.render("login_form", {
                responseObject: outgoingResponse,
                accessKey: null,
                issueDetails: issueDetails
            });
            return;
        }

        this.#eventLogger.debug("OAuth process sign-in requested, checking session.");
        try {
            const authSessionData = await this.#authenticationProvider.dataStore.retrieveAuthInputByTemporaryCode(
                this.#authenticationProvider.sanitizeInput(accessKey)
            );
            if (authSessionData === null) {
                this.#sendIssueNotification(incomingRequest, outgoingResponse, `Session expired for key: ${this.#authenticationProvider.sanitizeInput(accessKey)}`);
            } else {
                const issueDetails = incomingRequest.session.authIssue;
                delete incomingRequest.session.authIssue;
                await outgoingResponse.render("login_form", {
                    responseObject: outgoingResponse,
                    accessKey: accessKey,
                    issueDetails: issueDetails
                });
            }
        } catch (error) {
            this.#eventLogger.error("Error retrieving auth session data:", error);
            this.#sendIssueNotification(incomingRequest, outgoingResponse, "Internal server error during session retrieval.");
        }
    }

    async processSignInAttempt(incomingRequest, outgoingResponse) {
        const accessKey = this.#captureRequestParameter(incomingRequest, "ses");
        const userIdentifier = this.#captureRequestParameter(incomingRequest, "user_id");
        const secretCredential = this.#captureRequestParameter(incomingRequest, "pass_code");
        this.#eventLogger.info("Processing sign-in attempt.");

        try {
            const userProfile = await this.#authenticationProvider.dataStore.getUserProfileByCredentials({
                userIdentifier: userIdentifier,
                secretCredential: secretCredential
            });

            if (userProfile !== null) {
                this.#eventLogger.debug("User profile located.");
                incomingRequest.session.authenticatedUser = userProfile;

                if (accessKey !== null) {
                    this.#eventLogger.debug("Temporary access key detected, likely an OAuth flow.");
                    const authSessionData = await this.#authenticationProvider.dataStore.retrieveAuthInputByTemporaryCode(
                        this.#authenticationProvider.sanitizeInput(accessKey)
                    );

                    if (authSessionData !== null) {
                        this.#eventLogger.debug("OAuth session data found.");
                        userProfile.authorized = userProfile.authorized || {};

                        if (!userProfile.authorized[authSessionData.requestState.client_id]) {
                            this.#eventLogger.debug("Application not yet authorized by this user, redirecting to consent page.");
                            outgoingResponse.redirect(`${this.#endpointConfig.permission_consent}?ses=${this.#authenticationProvider.sanitizeInput(accessKey)}`);
                            outgoingResponse.end();
                        } else {
                            this.#eventLogger.debug("Application previously authorized, generating authorization grant.");
                            const authorizationGrant = this.#authenticationProvider.createAuthGrant(authSessionData.requestState.client_id);
                            await this.#authenticationProvider.dataStore.persistAuthGrant(this.#authenticationProvider.sanitizeInput(authorizationGrant), authSessionData.requestState);
                            this.#authenticationProvider.dispatchResponse(authSessionData.requestState, {
                                grant_code: authorizationGrant
                            }, outgoingResponse);
                        }
                    } else {
                        this.#eventLogger.debug("OAuth session data not found, redirecting to user dashboard.");
                        outgoingResponse.redirect(this.#endpointConfig.user_dashboard);
                        outgoingResponse.end();
                    }
                } else {
                    this.#eventLogger.debug("No temporary access key, standard sign-in. Redirecting to user dashboard.");
                    outgoingResponse.redirect(this.#endpointConfig.user_dashboard);
                    outgoingResponse.end();
                }
            } else {
                this.#eventLogger.warn("User profile not found. Invalid credentials.");
                let redirectPath = this.#endpointConfig.login_page;
                if (accessKey !== null) {
                    redirectPath += `?ses=${this.#authenticationProvider.sanitizeInput(accessKey)}`;
                }
                incomingRequest.session.authIssue = "Could not authenticate you.";
                outgoingResponse.redirect(redirectPath);
                outgoingResponse.end();
            }
        } catch (error) {
            this.#eventLogger.error("Error during sign-in process:", error);
            this.#sendIssueNotification(incomingRequest, outgoingResponse, "Internal server error during sign-in.");
            outgoingResponse.end();
        }
    }

    async processAuthorizationRequest(incomingRequest, outgoingResponse) {
        const requestState = {
            client_id: this.#captureRequestParameter(incomingRequest, "client_id"),
            redirect_uri: this.#captureRequestParameter(incomingRequest, "redirect_uri"),
            response_type: this.#captureRequestParameter(incomingRequest, "response_type"),
            scope: this.#captureRequestParameter(incomingRequest, "scope"),
            state: this.#captureRequestParameter(incomingRequest, "state")
        };

        this.#eventLogger.info("Authorization request received.");

        try {
            const validationOutcome = this.#authenticationProvider.validateAuthorizationRequest(requestState, incomingRequest.header("Referer"));
            if (validationOutcome.hasError) {
                this.#eventLogger.warn("Error validating authorization input:", validationOutcome.errorDetails, validationOutcome.errorDescription);
                this.#authenticationProvider.dispatchErrorResponse(requestState, validationOutcome, outgoingResponse);
                return;
            }

            this.#eventLogger.debug("Authorization input is valid:", requestState);
            requestState.client_id = this.#authenticationProvider.sanitizeInput(requestState.client_id);

            const clientApplication = await this.#authenticationProvider.dataStore.lookupClientApplication(requestState.client_id);
            if (clientApplication === null) {
                this.#eventLogger.warn("Client application not found for ID:", requestState.client_id);
                this.#authenticationProvider.dispatchErrorResponse(requestState, {
                    error: "unauthorized_client",
                    error_description: "Client ID is invalid"
                }, outgoingResponse);
                return;
            }

            if (!incomingRequest.session.authenticatedUser) {
                this.#eventLogger.debug("User not authenticated, prompting for sign-in.");
                const temporaryAuthCode = this.#authenticationProvider.createLoginSessionCode(requestState.client_id);
                await this.#authenticationProvider.dataStore.persistLoginSessionCode(temporaryAuthCode, {
                    requestState
                });
                outgoingResponse.redirect(`${this.#endpointConfig.login_page}?ses=${temporaryAuthCode}`);
            } else {
                this.#eventLogger.debug("User is authenticated.");
                const userProfile = await this.#authenticationProvider.dataStore.getUserProfileByCredentials({
                    userIdentifier: incomingRequest.session.authenticatedUser.userIdentifier
                });

                if (userProfile !== null) {
                    this.#eventLogger.debug("Authenticated user profile found.");
                    userProfile.authorized = userProfile.authorized || {};

                    if (!userProfile.authorized[requestState.client_id]) {
                        this.#eventLogger.debug("Application not approved by user, redirecting to permission consent page.");
                        const temporaryAuthCode = this.#authenticationProvider.createLoginSessionCode(requestState.client_id);
                        await this.#authenticationProvider.dataStore.persistLoginSessionCode(temporaryAuthCode, {
                            requestState
                        });
                        outgoingResponse.redirect(`${this.#endpointConfig.permission_consent}?ses=${temporaryAuthCode}`);
                    } else {
                        this.#eventLogger.debug("Application already approved by user, generating authorization grant.");
                        const authorizationGrant = this.#authenticationProvider.createAuthGrant(requestState.client_id);
                        await this.#authenticationProvider.dataStore.persistAuthGrant(this.#authenticationProvider.sanitizeInput(authorizationGrant), requestState);
                        await this.#authenticationProvider.dataStore.assignUserProfileAuthSession(
                            incomingRequest.session.authenticatedUser.userIdentifier,
                            this.#authenticationProvider.sanitizeInput(authorizationGrant),
                            requestState
                        );
                        this.#authenticationProvider.dispatchResponse(requestState, {
                            grant_code: authorizationGrant
                        }, outgoingResponse);
                    }
                } else {
                    this.#eventLogger.warn("Authenticated user profile not found in data store.");
                    this.#authenticationProvider.dispatchErrorResponse(requestState, {
                        error: "unauthorized_client",
                        error_description: "User profile invalid."
                    }, outgoingResponse);
                }
            }
        } catch (error) {
            this.#eventLogger.error("Error during authorization request processing:", error);
            this.#authenticationProvider.dispatchErrorResponse(requestState, {
                error: "server_error",
                error_description: "Internal server error during authorization."
            }, outgoingResponse);
        }
    }

    async showScopeConsentPage(incomingRequest, outgoingResponse) {
        this.#eventLogger.info("Permission consent page requested.");

        if (!incomingRequest.session.authenticatedUser) {
            this.#eventLogger.debug("User not authenticated, redirecting to sign-in.");
            outgoingResponse.redirect(this.#endpointConfig.login_page);
            outgoingResponse.end();
            return;
        }

        const accessKey = this.#captureRequestParameter(incomingRequest, "ses");
        if (accessKey === null) {
            this.#eventLogger.warn("Temporary access key missing for consent page.");
            this.#sendIssueNotification(incomingRequest, outgoingResponse, "Session has expired or is invalid.");
            return;
        }

        this.#eventLogger.debug("Retrieving session data for consent page.");
        try {
            const authSessionData = await this.#authenticationProvider.dataStore.retrieveAuthInputByTemporaryCode(
                this.#authenticationProvider.sanitizeInput(accessKey)
            );

            if (authSessionData === null) {
                this.#eventLogger.warn("Session data not found for access key:", accessKey);
                this.#sendIssueNotification(incomingRequest, outgoingResponse, "Session has expired or is invalid.");
                return;
            }

            this.#eventLogger.debug("Session data found, looking up client application for scopes.");
            const clientApplication = await this.#authenticationProvider.dataStore.lookupClientApplication(authSessionData.requestState.client_id);

            if (clientApplication === null) {
                this.#eventLogger.error("Client application not found for ID in session data:", authSessionData.requestState.client_id);
                this.#sendIssueNotification(incomingRequest, outgoingResponse, "invalid_request: Client application ID is invalid.");
            } else {
                this.#eventLogger.debug("Client application found, preparing scopes for user approval.");
                const desiredPermissions = authSessionData.requestState.scope.split(" ");
                const permissionList = desiredPermissions.map(permission => ({
                    permission: permission,
                    label: this.#authenticationProvider.getPermissionLabel(permission)
                }));

                await outgoingResponse.render("permission_consent", {
                    permissionList: permissionList,
                    clientApplication: clientApplication,
                    accessKey: this.#authenticationProvider.sanitizeInput(accessKey)
                });
            }
        } catch (error) {
            this.#eventLogger.error("Error displaying consent page:", error);
            this.#sendIssueNotification(incomingRequest, outgoingResponse, "Internal server error during consent page display.");
        }
    }

    async handleScopeApproval(incomingRequest, outgoingResponse) {
        this.#eventLogger.info("Processing permission consent decision.");

        if (!incomingRequest.session.authenticatedUser) {
            this.#eventLogger.debug("User not authenticated, redirecting to sign-in.");
            outgoingResponse.redirect(this.#endpointConfig.login_page);
            outgoingResponse.end();
            return;
        }

        const accessKey = this.#captureRequestParameter(incomingRequest, "ses");
        if (accessKey === null) {
            this.#eventLogger.warn("Temporary access key missing for scope approval.");
            this.#sendIssueNotification(incomingRequest, outgoingResponse, "Session has expired or is invalid.");
            return;
        }

        const consentDecision = this.#captureRequestParameter(incomingRequest, "decision_status");
        if (!["allow", "deny"].includes(consentDecision)) {
            this.#eventLogger.warn("Unrecognized consent decision status:", consentDecision);
            this.#sendIssueNotification(incomingRequest, outgoingResponse, `Unrecognized consent status: ${consentDecision}`);
            return;
        }

        this.#eventLogger.debug("Retrieving session data for scope approval.");
        try {
            const authSessionData = await this.#authenticationProvider.dataStore.retrieveAuthInputByTemporaryCode(
                this.#authenticationProvider.sanitizeInput(accessKey)
            );

            if (authSessionData === null) {
                this.#eventLogger.warn("Session data not found for access key:", accessKey);
                this.#sendIssueNotification(incomingRequest, outgoingResponse, "Session has expired or is invalid.");
                return;
            }

            this.#eventLogger.debug("Session data found. Removing temporary access key.");
            Promise.resolve().then(async () => {
                await this.#authenticationProvider.dataStore.removeLoginSessionCode(
                    this.#authenticationProvider.sanitizeInput(accessKey)
                );
            }).catch(err => this.#eventLogger.error("Error removing login session code:", err));


            if (consentDecision === "allow") {
                this.#eventLogger.debug("User allowed permissions. Generating authorization grant.");
                const authorizationGrant = this.#authenticationProvider.createAuthGrant(authSessionData.requestState.client_id);
                await this.#authenticationProvider.dataStore.persistAuthGrant(this.#authenticationProvider.sanitizeInput(authorizationGrant), authSessionData.requestState);
                await this.#authenticationProvider.dataStore.updateUserPermissions(
                    incomingRequest.session.authenticatedUser.userIdentifier,
                    authSessionData.requestState.client_id,
                    authSessionData.requestState.scope.split(" ")
                );
                await this.#authenticationProvider.dataStore.assignUserProfileAuthSession(
                    incomingRequest.session.authenticatedUser.userIdentifier,
                    this.#authenticationProvider.sanitizeInput(authorizationGrant),
                    authSessionData.requestState
                );
                this.#authenticationProvider.dispatchResponse(authSessionData.requestState, {
                    grant_code: authorizationGrant
                }, outgoingResponse);
            } else {
                this.#eventLogger.debug("User denied permissions.");
                this.#authenticationProvider.dispatchErrorResponse(authSessionData.requestState, {
                    error: "access_denied",
                    error_description: "User explicitly denied access."
                }, outgoingResponse);
            }
        } catch (error) {
            this.#eventLogger.error("Error processing scope approval:", error);
            this.#sendIssueNotification(incomingRequest, outgoingResponse, "Internal server error during scope approval.");
        }
    }

    async revokeApplicationAccess(incomingRequest, outgoingResponse) {
        this.#eventLogger.info("Application deauthorization requested.");

        if (!incomingRequest.session.authenticatedUser) {
            this.#eventLogger.debug("User not authenticated, redirecting to user dashboard.");
            outgoingResponse.redirect(this.#endpointConfig.user_dashboard);
            outgoingResponse.end();
            return;
        }

        const clientAppId = this.#captureRequestParameter(incomingRequest, "target_app_id");
        if (!clientAppId) {
            this.#eventLogger.warn("Missing client_id for deauthorization.");
            this.#sendIssueNotification(incomingRequest, outgoingResponse, "Invalid request: Missing application ID.");
            return;
        }

        try {
            await this.#authenticationProvider.dataStore.updateUserPermissions(
                incomingRequest.session.authenticatedUser.userIdentifier,
                clientAppId,
                null
            );
            this.#eventLogger.debug("Application permissions revoked.");

            Promise.resolve().then(async () => {
                await this.#authenticationProvider.dataStore.removeUserAuthSessions(
                    incomingRequest.session.authenticatedUser.userIdentifier,
                    clientAppId
                );
                this.#eventLogger.debug("Associated sessions for deauthorized app removed.");
            }).catch(err => this.#eventLogger.error("Error removing user auth sessions:", err));

            outgoingResponse.redirect(this.#endpointConfig.user_dashboard);
        } catch (error) {
            this.#eventLogger.error("Error during application deauthorization:", error);
            this.#sendIssueNotification(incomingRequest, outgoingResponse, "Internal server error during deauthorization.");
        }
    }

    async viewUserDashboard(incomingRequest, outgoingResponse) {
        let isAuthenticated = (incomingRequest.session.authenticatedUser !== null && incomingRequest.session.authenticatedUser !== undefined);
        let approvedApplications = [];
        let dashboardError = null;

        if (isAuthenticated) {
            try {
                const userProfile = await this.#authenticationProvider.dataStore.getUserProfileByCredentials({
                    userIdentifier: incomingRequest.session.authenticatedUser.userIdentifier
                });

                if (userProfile !== null) {
                    const applicationIds = Object.keys(userProfile.authorized || {});
                    if (applicationIds.length > 0) {
                        approvedApplications = await this.#authenticationProvider.dataStore.lookupClientApplications(applicationIds);
                    }
                } else {
                    dashboardError = "no_user_profile";
                    isAuthenticated = false;
                    incomingRequest.session.authenticatedUser = null;
                }
            } catch (error) {
                this.#eventLogger.error("Error retrieving user profile or approved applications:", error);
                dashboardError = "data_retrieval_error";
                isAuthenticated = false;
                incomingRequest.session.authenticatedUser = null;
            }
        }

        await outgoingResponse.render("user_dashboard", {
            isAuthenticated: isAuthenticated,
            approvedApplications: approvedApplications,
            dashboardError: dashboardError
        });
    }

    async exchangeToken(incomingRequest, outgoingResponse) {
        const requestState = {
            grant_type: this.#captureRequestParameter(incomingRequest, "grant_type"),
            client_id: this.#captureRequestParameter(incomingRequest, "client_id"),
            client_secret: this.#captureRequestParameter(incomingRequest, "client_secret"),
            grant_code: this.#captureRequestParameter(incomingRequest, "code"),
            refresh_token: this.#captureRequestParameter(incomingRequest, "refresh_token")
        };

        this.#eventLogger.info("Token exchange request:", requestState);

        try {
            const validationOutcome = this.#authenticationProvider.validateTokenExchangeRequest(requestState, incomingRequest.header("Referer"));
            if (validationOutcome.hasError) {
                this.#eventLogger.warn("Invalid token exchange input:", validationOutcome);
                this.#authenticationProvider.dispatchBodyErrorResponse(validationOutcome, outgoingResponse);
                outgoingResponse.end();
                return;
            }

            if (requestState.grant_type === "authorization_code") {
                this.#eventLogger.debug("Authorization code grant type requested.");

                const grantState = await this.#authenticationProvider.dataStore.retrieveAuthInputByAuthGrant(requestState.grant_code);
                if (grantState === null) {
                    this.#eventLogger.warn("Could not find input by authorization grant - expired or invalid.");
                    this.#authenticationProvider.dispatchBodyErrorResponse({
                        error: "invalid_grant",
                        error_description: "Authorization grant invalid or expired."
                    }, outgoingResponse);
                    return;
                }

                if (requestState.client_id !== grantState.client_id) {
                    this.#eventLogger.warn("Client ID mismatch for authorization code grant.");
                    this.#authenticationProvider.dispatchBodyErrorResponse({
                        error: "invalid_client",
                        error_description: "Authorization grant client ID does not match."
                    }, outgoingResponse);
                    return;
                }

                const clientAppRecord = await this.#authenticationProvider.dataStore.lookupClientApplication(requestState.client_id);
                if (clientAppRecord === null) {
                    this.#eventLogger.error("Client application not found for ID:", requestState.client_id);
                    this.#authenticationProvider.dispatchBodyErrorResponse({
                        error: "invalid_client",
                        error_description: "Client application ID is invalid."
                    }, outgoingResponse);
                    return;
                }

                if (requestState.client_secret !== clientAppRecord.client_secret) {
                    this.#eventLogger.warn("Client secret mismatch for authorization code grant.");
                    this.#authenticationProvider.dispatchBodyErrorResponse({
                        error: "invalid_client",
                        error_description: "Client secret is invalid."
                    }, outgoingResponse);
                    return;
                }

                let tokenSession = await this.#authenticationProvider.dataStore.getUserProfileAuthSession({
                    auth_code: requestState.grant_code
                });
                if (tokenSession === null) {
                    this.#eventLogger.warn("OAuth2 session not found by authorization grant, likely invalid.");
                    this.#authenticationProvider.dispatchBodyErrorResponse({
                        error: "invalid_grant",
                        error_description: "Authorization grant invalid or expired."
                    }, outgoingResponse);
                    return;
                }

                this.#eventLogger.debug("Authorization grant validated, issuing new tokens.");
                delete tokenSession.auth_code;
                tokenSession.access_token = this.#authenticationProvider.createAccessToken(tokenSession.client_id);
                tokenSession.access_token_creation_time = new Date();
                tokenSession.access_token_expiration_time = new Date(tokenSession.access_token_creation_time.getTime() + 3600 * 1000);

                await this.#authenticationProvider.dataStore.updateUserProfileAuthSession({
                    auth_code: requestState.grant_code
                }, tokenSession);

                this.#authenticationProvider.dispatchBodyResponse({
                    access_token: tokenSession.access_token,
                    refresh_token: tokenSession.refresh_token,
                    expires_in: 3600
                }, outgoingResponse);

            } else if (requestState.grant_type === "refresh_token") {
                this.#eventLogger.debug("Refresh token grant type requested.");

                const clientAppRecord = await this.#authenticationProvider.dataStore.lookupClientApplication(requestState.client_id);
                if (clientAppRecord === null) {
                    this.#eventLogger.error("Client application not found for ID:", requestState.client_id);
                    this.#authenticationProvider.dispatchBodyErrorResponse({
                        error: "invalid_client",
                        error_description: "Client application ID is invalid."
                    }, outgoingResponse);
                    return;
                }

                if (requestState.client_secret !== clientAppRecord.client_secret) {
                    this.#eventLogger.warn("Client secret mismatch for refresh token grant.");
                    this.#authenticationProvider.dispatchBodyErrorResponse({
                        error: "invalid_client",
                        error_description: "Client secret is invalid."
                    }, outgoingResponse);
                    return;
                }

                let tokenSession = await this.#authenticationProvider.dataStore.getUserProfileAuthSession({
                    refresh_token: requestState.refresh_token
                });
                if (tokenSession === null) {
                    this.#eventLogger.warn("Could not find session by refresh token. Invalid or deauthorized.");
                    this.#authenticationProvider.dispatchBodyErrorResponse({
                        error: "invalid_grant",
                        error_description: "Unrecognized refresh token."
                    }, outgoingResponse);
                    return;
                }

                if (tokenSession.access_token === null || tokenSession.access_token === undefined) {
                    this.#eventLogger.warn("No access token found in session. Session invalid.");
                    this.#authenticationProvider.dispatchBodyErrorResponse({
                        error: "invalid_grant",
                        error_description: "Invalid session state for refresh."
                    }, outgoingResponse);
                    return;
                }

                const currentTime = new Date().getTime();
                if (tokenSession.access_token_expiration_time && tokenSession.access_token_expiration_time.getTime() > currentTime) {
                    this.#eventLogger.warn("Access token has not expired yet; refresh requested too early.");
                    this.#authenticationProvider.dispatchBodyErrorResponse({
                        error: "invalid_grant",
                        error_description: "Refresh token requested too early."
                    }, outgoingResponse);
                    return;
                }

                this.#eventLogger.debug("Generating new access token via refresh token.");
                tokenSession.access_token = this.#authenticationProvider.createAccessToken(tokenSession.client_id);
                tokenSession.access_token_creation_time = new Date();
                tokenSession.access_token_expiration_time = new Date(tokenSession.access_token_creation_time.getTime() + 3600 * 1000);

                await this.#authenticationProvider.dataStore.updateUserProfileAuthSession({
                    refresh_token: requestState.refresh_token
                }, tokenSession);

                this.#authenticationProvider.dispatchBodyResponse({
                    access_token: tokenSession.access_token,
                    expires_in: 3600
                }, outgoingResponse);
            }
        } catch (error) {
            this.#eventLogger.error("Error during token exchange process:", error);
            this.#authenticationProvider.dispatchBodyErrorResponse({
                error: "server_error",
                error_description: "Internal server error during token exchange."
            }, outgoingResponse);
        }
    }
}

// This structure mimics the original's export pattern
// Assuming `GatewayService` will be instantiated with compatible `loggerInstance` and `authSystem` objects
// that provide the necessary methods, as `util` and `logging` are external dependencies in the original.
exports.GatewayService = GatewayService;