var util = require("util")
	, log = require("logging").from(__filename); // Initialize logging for this file

/*
 * WebAdapterExpress Constructor
 * Manages web-related interactions and routes for the OAuth2 server.
 * @param {object} routes - An object containing various route paths.
 * @param {object} settings - Configuration settings for the adapter.
 */
function WebAdapterExpress( routes, settings ) {

	var $this = this; // Capture 'this' for use in nested functions
	var __$config = settings || {}; // Configuration settings, default to empty object if not provided

	this.oauth2Server = null; // Will be set externally, holds the OAuth2 server instance
	this.routes = routes;     // Store the application routes

	// Sets an OAuth2 error message in the session and redirects to the error page.
	this.setError = function ( req, res, message ) {
		req.session.oauth2Error = message; // Store the error message
		res.redirect( $this.routes.page_error ); // Redirect to the global error page
	};

	// Handles rendering the error page.
	this.page_errorHandler = function ( req, res ) {
		var error = req.session.oauth2Error; // Retrieve error from session
		log( "Error page requested: " + error + "." ); // Log the error message
		delete req.session.oauth2Error; // Clear the error from the session
		res.render( "error", { // Render the error view
			error: error
		} );
	};

	// Processes user logout.
	this.process_logoutHandler = function ( req, res ) {
		log( "Processing logout request." ); // Log the logout event
		req.session.destroy(); // Destroy the user's session
		res.redirect( $this.routes.page_account ); // Redirect to the account page after logout
	};

	// Handles displaying the login page.
	this.page_loginHandler = function ( req, res ) {
		var sessionCode = req.param( "ses", null ); // Get session code from request parameters, if any
		log( "Login page requested by user." );

		if ( sessionCode == null ) {
			// This is a standard login request, not part of an OAuth2 authorization flow.
			log( " : Not an OAuth2 authorization process login." );
			var error = req.session.oauth2Error; // Check for any prior OAuth2 errors
			delete req.session.oauth2Error;       // Clear the error
			res.render( "login", {                // Render the login page
				res: res
				, sessionCode: null
				, error: error
			} );
			return; // Exit the function
		}

		// This is an OAuth2 authorization process login.
		log( "Auth process login requested with session code." );
		$this.oauth2Server.storageAdapter.getOauth2InputBySessionLoginCode(
			$this.oauth2Server.fixString( sessionCode ), // Retrieve session data using the session code
			function ( sessionData ) {
				if ( sessionData == null ) {
					// Session has expired or is invalid.
					$this.setError( req, res, "Session expired for code: " + $this.oauth2Server.fixString( sessionCode ) );
				} else {
					// Session data found, render login page with session context.
					var error = req.session.oauth2Error;
					delete req.session.oauth2Error;
					res.render( "login", {
						res: res
						, sessionCode: sessionCode
						, error: error
					} );
				}
			}
		);
	};

	// Processes user login attempts.
	this.process_loginHandler = function ( req, res ) {
		var sessionCode = req.param( "ses", null );    // OAuth2 session code
		var username = req.param( "username", null );  // User-provided username
		var password = req.param( "password", null );  // User-provided password

		log( "Processing login attempt." );
		$this.oauth2Server.storageAdapter.getUserAccountBy(
			{ username: username, password: password }, // Query for user account
			function ( account ) {
				if ( account != null ) {
					log( " : Account found for user: " + username );
					req.session.loggedInAccount = account; // Store logged-in account in session

					if ( sessionCode != null ) {
						log( " : Session code found, indicating an OAuth2 auth process login." );
						$this.oauth2Server.storageAdapter.getOauth2InputBySessionLoginCode(
							$this.oauth2Server.fixString( sessionCode ),
							function ( sessionData ) {
								if ( sessionData != null ) {
									log( " : OAuth2 session data found." );
									if ( account.authorized == null || account.authorized == undefined ) {
										account.authorized = {}; // Initialize authorized applications if not present
									}

									// Check if the application is already authorized by the user.
									if ( account.authorized[ sessionData.stateObject.client_id ] == null || account.authorized[ sessionData.stateObject.client_id ] == undefined ) {
										log( " : Application not yet authorized by this user. Redirecting to scopes approval page." );
										res.redirect( $this.routes.page_scopes + "?ses=" + $this.oauth2Server.fixString( sessionCode ) );
										res.end(); // Ensure no further response is sent
									} else {
										log( " : Application already authorized by user. Generating authorization code." );
										var authCode = $this.oauth2Server.generateAuthCode( sessionData.stateObject.client_id );
										$this.oauth2Server.storageAdapter.storeAuthCode( $this.oauth2Server.fixString( authCode ), sessionData.stateObject );
										$this.oauth2Server.sendResponse( sessionData.stateObject, { code: authCode }, res ); // Send OAuth2 response
									}
								} else {
									log( " : OAuth2 session data not found. Redirecting to account page." );
									res.redirect( $this.routes.page_account );
									res.end();
								}
							}
						);
					} else {
						log( " : No session login code provided. This is an ordinary login." );
						res.redirect( $this.routes.page_account ); // Redirect to the user's account page
						res.end();
					}
				} else {
					log( "Account not found. Invalid login credentials provided." );
					var _url = $this.routes.page_login; // Base URL for login page
					if ( sessionCode != null ) {
						_url += "?ses=" + $this.oauth2Server.fixString( sessionCode ); // Append session code if present
					}
					req.session.oauth2Error = "Could not log you in."; // Set error message
					res.redirect( _url ); // Redirect back to login page with error
					res.end();
				}
			}
		);
	};

	// Handles the initial OAuth2 authorization request.
	this.process_authHandler = function ( req, res ) {
		// Extract necessary parameters from the request to form the state object.
		var stateObject = {
			client_id: req.param( "client_id", null )
			, redirect_uri: req.param( "redirect_uri", null )
			, response_type: req.param( "response_type", null )
			, scope: req.param( "scope", null )
			, state: req.param( "state", null )
		};

		// Validate the authorization request.
		var validationStatus = $this.oauth2Server.validateAuthRequest( stateObject, req.header( "Referer" ) );
		log( "Authentication request received." );

		if ( validationStatus.error != null ) {
			log( " : Error validating the input: ", validationStatus.error, validationStatus.error_description );
			$this.oauth2Server.sendErrorResponse( stateObject, validationStatus, res ); // Send error response to client
			return; // Stop further processing
		}

		log( " : Input parameters are valid: ", stateObject );
		stateObject.client_id = $this.oauth2Server.fixString( stateObject.client_id ); // Sanitize client_id

		// Lookup the client application in storage.
		$this.oauth2Server.storageAdapter.clientIdLookup( stateObject.client_id, function ( clientApp ) {
			if ( clientApp == null ) {
				log( " : Client application not found for ID: " + stateObject.client_id );
				$this.oauth2Server.sendErrorResponse( stateObject, { error: "unauthorized_client", error_description: "Client ID invalid" }, res );
			} else {
				// Check if the user is logged in.
				if ( !req.session.loggedInAccount ) {
					log( " : User not logged in. Requesting user to log in." );
					var loginSessionCode = $this.oauth2Server.generateLoginSessionCode( stateObject.client_id );
					$this.oauth2Server.storageAdapter.storeSessionLoginCode( loginSessionCode, stateObject ); // Store session for later retrieval
					res.redirect( $this.routes.page_login + "?ses=" + loginSessionCode ); // Redirect to login page
				} else {
					log( " : User is already logged in." );
					// Retrieve the user's full account details.
					$this.oauth2Server.storageAdapter.getUserAccountBy( { username: req.session.loggedInAccount.username }, function ( account ) {
						if ( account != null ) {
							log( " : User account found in storage." );
							if ( account.authorized == null || account.authorized == undefined ) {
								account.authorized = {}; // Initialize authorized applications if not existing
							}

							// Check if the application is authorized by the user.
							if ( account.authorized[ stateObject.client_id ] == null || account.authorized[ stateObject.client_id ] == undefined ) {
								log( " : Application not yet approved by the user. Redirecting to scopes approval page." );
								var loginSessionCode = $this.oauth2Server.generateLoginSessionCode( stateObject.client_id );
								$this.oauth2Server.storageAdapter.storeSessionLoginCode( loginSessionCode, stateObject );
								res.redirect( $this.routes.page_scopes + "?ses=" + loginSessionCode ); // Redirect to scopes page
							} else {
								log( " : Application already approved by user. Generating authorization code." );
								var authCode = $this.oauth2Server.generateAuthCode( stateObject.client_id );
								$this.oauth2Server.storageAdapter.storeAuthCode( $this.oauth2Server.fixString( authCode ), stateObject ); // Store auth code
								$this.oauth2Server.storageAdapter.assignUserOAuth2Session(
									req.session.loggedInAccount.username
									, $this.oauth2Server.fixString( authCode )
									, stateObject
								);
								$this.oauth2Server.sendResponse( stateObject, { code: authCode }, res ); // Send OAuth2 response
							}
						} else {
							log( " : User account not found, despite session. This is an unexpected state." );
							$this.oauth2Server.sendErrorResponse( stateObject, { error: "unauthorized_client", error_description: "User account invalid." }, res );
						}
					} );
				}
			}
		} );
	};

	// Handles displaying the scopes approval page.
	this.page_scopesHandler = function ( req, res ) {
		log( "Scopes approval page requested." );

		if ( !req.session.loggedInAccount ) {
			log( " : User not logged in. Redirecting to login page." );
			res.redirect( $this.routes.page_login );
			res.end();
			return;
		}

		var sessionCode = req.param( "ses", null ); // Get session code from request
		if ( sessionCode == null ) {
			log( " : Session code is missing or expired for scopes request." );
			$this.setError( req, res, "Session expired or invalid." );
			return;
		}

		log( " : Looking up session data for provided code." );
		$this.oauth2Server.storageAdapter.getOauth2InputBySessionLoginCode(
			$this.oauth2Server.fixString( sessionCode ),
			function ( sessionData ) {
				if ( sessionData == null ) {
					log( " : Session data not found for code: " + sessionCode + ". Session is invalid." );
					$this.setError( req, res, "Session expired or invalid." );
					return;
				} else {
					log( " : Session data found. Loading client application details to display scopes." );
					$this.oauth2Server.storageAdapter.clientIdLookup( sessionData.stateObject.client_id, function ( clientApp ) {
						if ( clientApp == null ) {
							log( " : Client app not found for ID: " + sessionData.stateObject.client_id + ". This is an unexpected error." );
							$this.setError( req, res, "invalid_request: Client ID invalid" );
						} else {
							log( " : Client app found. Preparing to render scopes for approval/denial." );
							var requestedScopes = sessionData.stateObject.scope.split( " " ); // Split requested scopes string
							var scopes = [];
							for ( var i = 0; i < requestedScopes.length; i++ ) {
								scopes.push( { scope: requestedScopes[ i ], name: $this.oauth2Server.getScopeName( requestedScopes[ i ] ) } );
							}
							res.render( "scopes", { // Render the scopes approval page
								scopes: scopes
								, clientApp: clientApp
								, sessionCode: $this.oauth2Server.fixString( sessionCode )
							} );
						}
					} );
				}
			}
		);
	};

	// Processes the user's decision on scope approval/denial.
	this.process_scopesHandler = function ( req, res ) {
		log( "Processing user's scope approval decision." );

		if ( !req.session.loggedInAccount ) {
			log( " : User not logged in. Redirecting to login page." );
			res.redirect( $this.routes.page_login );
			res.end();
			return;
		}

		var sessionCode = req.param( "ses", null );
		if ( sessionCode == null ) {
			log( " : Session login code expired or missing." );
			$this.setError( req, res, "Session expired or invalid." );
			return;
		}

		var accessStatus = req.param( "access_status", null ); // "allow" or "deny"
		if ( accessStatus !== "allow" && accessStatus !== "deny" ) {
			log( " : Unrecognized acceptance status: " + accessStatus + "." );
			$this.setError( req, res, "Unrecognized acceptance status: " + accessStatus );
			return;
		}

		log( " : Looking up session data for decision processing." );
		$this.oauth2Server.storageAdapter.getOauth2InputBySessionLoginCode(
			$this.oauth2Server.fixString( sessionCode ),
			function ( sessionData ) {
				if ( sessionData == null ) {
					log( " : Session data not found. Session expired." );
					$this.setError( req, res, "Session expired or invalid." );
				} else {
					log( " : Session data found. Processing decision." );
					// Invalidate the session code immediately after use.
					process.nextTick( function () {
						$this.oauth2Server.storageAdapter.removeSessionLoginCode( $this.oauth2Server.fixString( sessionCode ) );
					} );

					// Handle user's decision.
					if ( accessStatus == "allow" ) {
						log( " : User allowed access. Generating authorization code." );
						var authCode = $this.oauth2Server.generateAuthCode( sessionData.stateObject.client_id );
						$this.oauth2Server.storageAdapter.storeAuthCode( $this.oauth2Server.fixString( authCode ), sessionData.stateObject ); // Store auth code
						$this.oauth2Server.storageAdapter.updateUserPrivileges( // Update user's authorized apps
							req.session.loggedInAccount.username
							, sessionData.stateObject.client_id
							, sessionData.stateObject.scope.split( " " )
						);
						$this.oauth2Server.storageAdapter.assignUserOAuth2Session( // Assign a new OAuth2 session
							req.session.loggedInAccount.username
							, $this.oauth2Server.fixString( authCode )
							, sessionData.stateObject
						);
						$this.oauth2Server.sendResponse( sessionData.stateObject, { code: authCode }, res ); // Send OAuth2 response
					} else if ( accessStatus == "deny" ) {
						log( " : User denied access." );
						$this.oauth2Server.sendErrorResponse( sessionData.stateObject, { error: "access_denied", error_description: "User denied access." }, res );
					}
				}
			}
		);
	};

	// Deauthorizes an application for the logged-in user.
	this.process_deauthorizeAppHandler = function ( req, res ) {
		log( "Deauthorization of application requested." );

		if ( !req.session.loggedInAccount ) {
			log( " : User not logged in. Redirecting to account page." );
			res.redirect( $this.routes.page_account );
			res.end();
			return;
		}

		// Update user privileges to remove authorization for the specified client_id.
		$this.oauth2Server.storageAdapter.updateUserPrivileges( req.session.loggedInAccount.username, req.param( "client_id", null ), null );
		log( " : Application deauthorized for user." );

		// Asynchronously remove associated OAuth2 sessions.
		process.nextTick( function () {
			$this.oauth2Server.storageAdapter.removeOAuth2UserSession( req.session.loggedInAccount.username, req.param( "client_id", null ) );
			log( " : Sessions for deauthorized app removed." );
		} );

		res.redirect( $this.routes.page_account ); // Redirect back to the account page
	};

	// Handles displaying the user's account page, including authorized apps.
	this.page_accountHandler = function ( req, res ) {
		var authorizedApps = []; // Initialize an empty array for authorized applications
		var loggedIn = ( req.session.loggedInAccount != null && req.session.loggedInAccount != undefined ); // Check login status

		if ( loggedIn ) {
			// If user is logged in, retrieve their account details.
			$this.oauth2Server.storageAdapter.getUserAccountBy( { username: req.session.loggedInAccount.username }, function ( account ) {
				if ( account != null ) {
					var client_ids = [];
					if ( account.authorized != null && account.authorized != undefined ) {
						// Collect client IDs of all authorized applications.
						for ( var key in account.authorized ) {
							client_ids.push( key );
						}
					}
					// Look up details for the authorized client applications.
					$this.oauth2Server.storageAdapter.clientAppsLookup( client_ids, function ( apps ) {
						res.render( "account", { // Render account page with authorized apps
							loggedIn: loggedIn
							, authorizedApps: apps
							, error: null
						} );
					} );
				} else {
					// Account not found, even if session indicates logged in (should not happen normally).
					res.render( "account", {
						loggedIn: loggedIn
						, authorizedApps: []
						, error: "no_account" // Indicate an issue with account retrieval
					} );
				}
			} );
		} else {
			// User is not logged in, render account page without authorized apps.
			res.render( "account", {
				loggedIn: loggedIn
				, authorizedApps: []
				, error: null
			} );
		}
	};

	// Processes requests for OAuth2 tokens (authorization code exchange or refresh token).
	this.process_tokenHandler = function ( req, res ) {
		// Extract token request parameters.
		var stateObject = {
			grant_type: req.param( "grant_type", null )
			, client_id: req.param( "client_id", null )
			, client_secret: req.param( "client_secret", null )
			, code: req.param( "code", null )
			//, redirect_uri: req.param("code", null) // Commented out as per original code
			, refresh_token: req.param( "refresh_token", null )
		};

		log( "Token request received: ", stateObject );

		// Validate the token request parameters.
		var validationStatus = $this.oauth2Server.validateTokenRequest( stateObject, req.header( "Referer" ) );
		if ( validationStatus.error != null ) {
			log( " : Input incorrect for token request: ", validationStatus );
			$this.oauth2Server.sendBodyErrorResponse( validationStatus, res ); // Send error response
			res.end();
			return;
		}

		// Handle authorization_code grant type.
		if ( stateObject.grant_type === "authorization_code" ) {

			log( " : Processing authorization_code grant type." );

			$this.oauth2Server.storageAdapter.getOAuth2InputByAuthCode( stateObject.code, function ( authStateObject ) {
				if ( authStateObject == null ) {
					log( " : Could not find OAuth2 input by authorization code. Code might be invalid or expired." );
					$this.oauth2Server.sendBodyErrorResponse( { error: "invalid_request", error_description: "Authorization code invalid or expired." }, res );
				} else {
					if ( stateObject.client_id !== authStateObject.client_id ) {
						log( " : Client ID in request does not match the one associated with the authorization code." );
						$this.oauth2Server.sendBodyErrorResponse( { error: "invalid_request", error_description: "Authorization code client ID mismatch." }, res );
					} else {
						// if ( stateObject.redirect_uri !== authStateObject.redirect_uri ) {
						// 	$this.oauth2Server.sendBodyErrorResponse( { error: "invalid_request", error_description: "Auth code redirect URI not matched." }, res );
						// } else {
						$this.oauth2Server.storageAdapter.clientIdLookup( stateObject.client_id, function ( app ) {
							if ( app == null ) {
								log( " : Client application not found for ID: " + stateObject.client_id + ". Unexpected." );
								$this.oauth2Server.sendBodyErrorResponse( { error: "invalid_request", error_description: "Client ID is invalid." }, res );
							} else {
								if ( stateObject.client_secret !== app.client_secret ) {
									log( " : Client secret provided is invalid for application: " + stateObject.client_id );
									$this.oauth2Server.sendBodyErrorResponse( { error: "invalid_request", error_description: "Client secret is invalid." }, res );
								} else {
									$this.oauth2Server.storageAdapter.getUserOAuth2Session( { auth_code: stateObject.code }, function ( oauth2Session ) {
										if ( oauth2Session == null ) {
											log( " : OAuth2 session not found for provided authorization code. Incorrect or expired." );
											$this.oauth2Server.sendBodyErrorResponse( { error: "invalid_request", error_description: "Authorization code invalid or expired." }, res );
										} else {
											log( " : Authorization code is correct. Data validated. Issuing new access token." );
											delete oauth2Session.auth_code; // Remove the consumed authorization code
											oauth2Session.authorization_token = $this.oauth2Server.generateAuthToken( oauth2Session.client_id ); // Generate new access token
											oauth2Session.authorization_token_created_at = new Date(); // Timestamp creation
											oauth2Session.authorization_token_expire_at = new Date( oauth2Session.authorization_token_created_at.getTime() + 3600 * 1000 ); // Set expiry (1 hour)
											$this.oauth2Server.storageAdapter.updateUserOAuth2Session( { auth_code: stateObject.code }, oauth2Session ); // Update session in storage

											$this.oauth2Server.sendBodyResponse( { // Send token response
												authorization_token: oauth2Session.authorization_token
												, refresh_token: oauth2Session.refresh_token
												, expires_in: 3600 // Expiry in seconds
											}, res );
										}
									} );
								}
							}
						} );
						// }
					}
				}
			} );
		} else if ( stateObject.grant_type === "refresh_token" ) {

			log( " : Processing refresh_token grant type." );

			$this.oauth2Server.storageAdapter.clientIdLookup( stateObject.client_id, function ( app ) {
				if ( app == null ) {
					log( " : Client application not found for ID: " + stateObject.client_id );
					$this.oauth2Server.sendBodyErrorResponse( { error: "invalid_request", error_description: "Client ID is invalid." }, res );
				} else {
					if ( stateObject.client_secret !== app.client_secret ) {
						log( " : Client secret is invalid for application: " + stateObject.client_id );
						$this.oauth2Server.sendBodyErrorResponse( { error: "invalid_request", error_description: "Client secret is invalid." }, res );
					} else {
						$this.oauth2Server.storageAdapter.getUserOAuth2Session( { refresh_token: stateObject.refresh_token }, function ( oauth2Session ) {
							if ( oauth2Session == null ) {
								log( " : Could not find an OAuth2 session by refresh token. It might be invalid or deauthorized." );
								$this.oauth2Server.sendBodyErrorResponse( { error: "invalid_request", error_description: "Unrecognized refresh token." }, res );
							} else {
								if ( oauth2Session.authorization_token == null || oauth2Session.authorization_token == undefined ) {
									log( " : Session found but no authorization token present. Session is invalid." );
									$this.oauth2Server.sendBodyErrorResponse( { error: "invalid_request", error_description: "Invalid session (no auth token)." }, res );
								} else {
									// Check if the current authorization token has expired.
									if ( oauth2Session.authorization_token_expire_at.getTime() > ( new Date() ).getTime() ) {
										log( " : Authorization token has not expired yet. Refresh token requested too early." );
										$this.oauth2Server.sendBodyErrorResponse( { error: "invalid_request", error_description: "Refresh token requested too early." }, res );
									} else {
										log( " : Generating new authorization token using refresh token." );
										oauth2Session.authorization_token = $this.oauth2Server.generateAuthToken( oauth2Session.client_id ); // Generate new access token
										oauth2Session.authorization_token_created_at = new Date();
										oauth2Session.authorization_token_expire_at = new Date( oauth2Session.authorization_token_created_at.getTime() + 3600 * 1000 ); // New expiry

										$this.oauth2Server.storageAdapter.updateUserOAuth2Session( { refresh_token: stateObject.refresh_token }, oauth2Session ); // Update session

										$this.oauth2Server.sendBodyResponse( { // Send new token response
											authorization_token: oauth2Session.authorization_token
											, expires_in: 3600
										}, res );
									}
								}
							}
						} );
					}
				}
			} );
		}
	};
} ;

// Export the WebAdapterExpress constructor.
exports.WebAdapterExpress = WebAdapterExpress;