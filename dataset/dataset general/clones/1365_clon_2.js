/*******************************************************************************
 *  feather_nest.js
 *
 *  FeatherNest provides a Titanium SDK solution for
 *  managing user authentication and dispatching API requests to the Twitter platform.
 *
 *  Copyright 2011 (c) iEntry, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not utilize this file except in compliance with the License.
 *  You may obtain a copy of the License at:
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  Creator: Joseph D. Purcell, iEntry Inc
 *  Revision: 0.9
 *  Last Modified: May 2011
 ******************************************************************************/

// REQUIRED LIBRARIES
// iOS devices need the full file path for includes
if (Ti.Platform.osname === 'iphone') {
    Ti.include('lib/oauth.js');
    Ti.include('lib/sha1.js');
}
// Android devices will automatically search the current directory
else {
    Ti.include('oauth.js');
    Ti.include('sha1.js');
}

// THE PRIMARY CLASS DEFINITION
function FeatherNest(initial_settings) {

    // ==================== INTERNAL HELPER FUNCTIONS AND DATA ====================
    // ----------------------------------------------------------------------------

    // CONFIGURATION VARIABLES
    var config_data = {
        // user-defined preferences
        api_consumer_key: "",
        client_secret_key: "",
        display_auth_bar: false,
        // system-level settings
        protocol_version: "1.0",
        current_oauth_token: "",
        signature_algorithm: "HMAC-SHA1",
        temp_request_token: "",
        temp_token_secret: "",
        temp_token_verifier: "",
        permanent_access_token: "",
        permanent_token_secret: "",
        redirection_uri: ""
    };

    var auth_helper = {
        clientSecretVal: config_data.client_secret_key,
        secretAccessToken: config_data.permanent_token_secret
    };

    var is_validated = false; // Tracks if the user's session is authenticated

    /**
     *  compose_communique
     *
     *  Constructs an OAuth message for communication with the Twitter service.
     *  It integrates the necessary consumer key, signature method, timestamp,
     *  and nonce into the message.
     *
     *  @param {string} destination_url - The URL endpoint for the message.
     *  @param {string} http_verb - The HTTP method to use ('POST' or 'GET').
     *  @param {string} request_args - Additional parameters in URL-encoded format
     *                                  (e.g., 'param1=val1&param2=val2').
     *
     *  @returns {Array} An array containing the message parameters ready for Twitter.
     */
    function compose_communique(destination_url, http_verb, request_args) {
        var outgoing_payload = {
            action: destination_url,
            method: (http_verb === 'GET') ? http_verb : 'POST',
            parameters: (request_args != null) ? OAuth.decodeForm(request_args) : []
        };

        outgoing_payload.parameters.push(['oauth_consumer_key', config_data.api_consumer_key]);
        outgoing_payload.parameters.push(['oauth_signature_method', config_data.signature_algorithm]);
        outgoing_payload.parameters.push(["oauth_timestamp", OAuth.timestamp().toFixed(0)]);
        outgoing_payload.parameters.push(["oauth_nonce", OAuth.nonce(42)]);
        outgoing_payload.parameters.push(["oauth_version", "1.0"]);

        return outgoing_payload;
    }

    /**
     *  obtain_initial_token
     *
     *  Retrieves and stores the temporary request token and its secret.
     *
     *  @param {Function} completion_handler - A function to be invoked after the
     *                                          authorization process is complete.
     *                                          Note: This handler will execute
     *                                          only after `finalize_session_token()`
     *                                          has completed.
     */
    function obtain_initial_token(completion_handler) {
        var api_endpoint_url = 'https://api.twitter.com/oauth/request_token';

        var query_parameters = (config_data.redirection_uri !== "") ? 'oauth_callback=' + escape(config_data.redirection_uri) : '';

        make_api_request(api_endpoint_url, 'POST', query_parameters, function(api_response) {
            if (api_response !== false) {
                var parsed_response_map = OAuth.getParameterMap(api_response);
                config_data.temp_request_token = parsed_response_map['oauth_token'];
                config_data.temp_token_secret = parsed_response_map['oauth_token_secret'];

                acquire_authorization_verifier(completion_handler);
            }
        }, false, true, false);
    }

    /**
     *  acquire_authorization_verifier
     *
     *  Manages the user authorization flow to obtain the request verifier.
     *  This function relies on the request token and secret being set and
     *  should typically only be called internally by `obtain_initial_token()`.
     *
     *  @param {Function} completion_handler_arg - A function to execute once the user
     *                                              has been authorized; its execution
     *                                              is deferred until `finalize_session_token()`.
     */
    function acquire_authorization_verifier(completion_handler_arg) {
        var auth_page_url = "https://api.twitter.com/oauth/authorize?oauth_token=" + config_data.temp_request_token;
        var auth_window = Ti.UI.createWindow({
            top: 0,
            modal: true,
            fullscreen: true
        });

        // Add a close button for a better user experience on iPhone
        if (Ti.Platform.osname === 'iphone' && config_data.display_auth_bar) {
            var web_interface_view = Ti.UI.createWebView({
                url: auth_page_url,
                scalesPageToFit: true,
                touchEnabled: true,
                top: 43,
                backgroundColor: '#FFF'
            });
            var navigation_bar = Ti.UI.createToolbar({
                top: 0
            });
            var bar_title_label = Ti.UI.createLabel({
                text: 'Login with Twitter',
                font: {
                    fontSize: 16,
                    fontWeight: 'bold'
                },
                color: '#FFF',
                textAlign: 'center'
            });
            var flexible_spacer = Titanium.UI.createButton({
                systemButton: Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
            });
            var close_button = Titanium.UI.createButton({
                title: 'Cancel',
                style: Titanium.UI.iPhone.SystemButtonStyle.BORDERED
            });
            navigation_bar.items = [flexible_spacer, flexible_spacer, bar_title_label, flexible_spacer, close_button];
            auth_window.add(navigation_bar);

            // Event listener for closing the login window
            close_button.addEventListener('click', function() {
                web_interface_view.stopLoading();
                auth_window.remove(web_interface_view);
                auth_window.close();
            });
        } else {
            var web_interface_view = Ti.UI.createWebView({
                url: auth_page_url,
                scalesPageToFit: true,
                touchEnabled: true,
                top: 0,
                backgroundColor: '#FFF'
            });
        }

        var token_for_request = ""; // This variable seems unused, keeping it for structural parity.
        var base_address = ""; // This variable also appears unused.
        var extracted_params = "";
        var is_loading_content = false; // Flag to indicate if the web view is currently loading
        var page_load_count = 0; // Counts how many times the web view has loaded a URL
        var processing_authorization = false; // Indicates if we are actively checking for OAuth tokens

        // Attach the web view to the window and display it
        auth_window.add(web_interface_view);
        auth_window.open();

        // Since Twitter's success/denial pages might look similar,
        // we monitor for a redirect to our callback URL to determine authorization success.
        function verify_status_update() {
            if (!processing_authorization) {
                // User denied access or clicked something else, not redirecting to callback
                if (!is_loading_content) {
                    web_interface_view.stopLoading();
                    auth_window.remove(web_interface_view);
                    auth_window.close();

                    if (typeof(completion_handler_arg) === 'function') {
                        completion_handler_arg(false);
                    }

                    return false;
                }
            }
        }

        web_interface_view.addEventListener('beforeload', function() {
            is_loading_content = true;
        });

        web_interface_view.addEventListener('load', function(event_obj) {
            page_load_count++;

            // Ignore the first load, which is the initial 'allow' page.
            // If the user clicks 'Allow', the second load might still be the 'authorize' page
            // before the redirect. We set a timeout to check if a redirect occurs.
            if (page_load_count === 2) {
                // If the URL is still the authorize page, wait a bit for a potential redirect.
                // Otherwise, it means the user clicked something else or denied access.
                if (event_obj.url !== 'https://api.twitter.com/oauth/authorize') {
                    web_interface_view.stopLoading();
                    auth_window.remove(web_interface_view);
                    auth_window.close();

                    if (typeof(completion_handler_arg) === 'function') {
                        completion_handler_arg(false);
                    }

                    return false;
                }
                // Otherwise, wait briefly to see if Twitter initiates a redirect.
                else {
                    setTimeout(verify_status_update, 1000);
                }
            }
            // Twitter has redirected the page, presumably to our callback URI.
            else if (page_load_count === 3) {
                processing_authorization = true; // Disable the timeout as we're handling the authorization.

                // Authorization successful!
                extracted_params = "";
                // Parse the URL to extract parameters, specifically 'oauth_verifier'.
                var url_parts = (event_obj.url).replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
                    extracted_params = extracted_params + m;

                    if (key === 'oauth_verifier') {
                        config_data.temp_token_verifier = value;
                    }
                });

                if (config_data.temp_token_verifier !== "") {
                    // Attempt to forcefully close the webview to prevent further interaction.
                    web_interface_view.stopLoading();
                    auth_window.remove(web_interface_view);
                    auth_window.close();

                    finalize_session_token(completion_handler_arg);

                    return true; // Processing for this stage is complete.
                }
            }

            // The page has finished loading.
            is_loading_content = false;
        });
    }

    /**
     *  finalize_session_token
     *
     *  Exchanges the temporary request token, its secret, and the verifier
     *  for the user's permanent access token and secret.
     *
     *  @param {Function} final_callback_func - A function to be executed after
     *                                           the user is fully authorized.
     *                                           This is the point where the
     *                                           original callback will finally run.
     */
    function finalize_session_token(final_callback_func) {
        var access_token_url = 'https://api.twitter.com/oauth/access_token';

        make_api_request(access_token_url, 'POST', 'oauth_token=' + config_data.temp_request_token + '&oauth_verifier=' + config_data.temp_token_verifier, function(server_reply) {
            if (server_reply !== false) {
                var decoded_params = OAuth.getParameterMap(server_reply);
                config_data.permanent_access_token = decoded_params['oauth_token'];
                config_data.permanent_token_secret = decoded_params['oauth_token_secret'];
                config_data.user_id = decoded_params['user_id'];
                config_data.screen_name = decoded_params['screen_name'];
                auth_helper.secretAccessToken = config_data.permanent_token_secret;

                persist_credentials_to_disk();

                is_validated = retrieve_stored_credentials();

                // Invoke the provided callback function with a success status
                if (typeof(final_callback_func) === 'function') {
                    final_callback_func(true);
                }
            } else {
                // Invoke the provided callback function with a failure status
                if (typeof(final_callback_func) === 'function') {
                    final_callback_func(false);
                }
            }
        }, false, true, false);
    }

    /**
     *  retrieve_stored_credentials
     *
     *  Loads the access token and its secret from the 'twitter.config' file
     *  into the class's internal configuration.
     *
     *  @returns {boolean} True if credentials were successfully loaded, false otherwise.
     */
    function retrieve_stored_credentials() {
        // Attempt to locate the configuration file
        var config_file_handle = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'twitter.config');
        if (!config_file_handle.exists()) {
            return false;
        }

        // Attempt to read the file's contents
        var file_contents = config_file_handle.read();
        if (file_contents == null) {
            return false;
        }

        // Attempt to parse the file content as JSON
        try {
            var parsed_config_obj = JSON.parse(file_contents.text);
        } catch (error_message) {
            return false;
        }

        // Apply the loaded configuration
        if (parsed_config_obj.access_token) {
            config_data.permanent_access_token = parsed_config_obj.access_token;
        }
        if (parsed_config_obj.access_token_secret) {
            config_data.permanent_token_secret = parsed_config_obj.access_token_secret;
            auth_helper.secretAccessToken = config_data.permanent_token_secret;
        }

        return true;
    }

    /**
     *  persist_credentials_to_disk
     *
     *  Writes the current access token and secret to a file named 'twitter.config'.
     *  Storing configuration in a file ensures persistence across application
     *  recompilations, unlike `Ti.App.Property` which might be reset.
     */
    function persist_credentials_to_disk() {
        // Get a reference to the configuration file
        var storage_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'twitter.config');
        // Create the file if it does not yet exist
        if (storage_file == null) {
            storage_file = Ti.Filesystem.createFile(Ti.Filesystem.applicationDataDirectory, 'twitter.config');
        }

        // Prepare and write the current credentials
        var current_credentials = {
            access_token: config_data.permanent_access_token,
            access_token_secret: config_data.permanent_token_secret
        };
        storage_file.write(JSON.stringify(current_credentials));
    }

    /**
     *  make_api_request
     *
     *  Dispatches a Twitter API request to the specified URL using the given
     *  HTTP method and parameters.
     *
     *  @param {string} target_resource_url - The URL endpoint for the XHR request.
     *  @param {string} http_method_type - The HTTP method ('POST' or 'GET').
     *  @param {string} request_parameters - Parameters to send, in URL-encoded format.
     *  @param {Function} response_callback - A function to invoke upon completion,
     *                                          receiving the XHR data.
     *  @param {boolean} force_authentication - If true, triggers authentication flow
     *                                           if not already authorized.
     *  @param {boolean} include_params_in_url - If true, all parameters are appended
     *                                            directly to the URL.
     *  @param {boolean} set_auth_header - If true, includes the "Authorization" HTTP header.
     *
     *  Notes:
     *  - `include_params_in_url` and `set_auth_header` should generally be set to
     *    `true` and `false` respectively when obtaining request tokens.
     *  - Utilize the `response_callback` for post-request actions:
     *    `myFeatherNest.tweet("Hello World!", function(){ alert("Tweet sent!"); });`
     *
     *  @returns {boolean|string} False on failure, or the responseText on success.
     */
    function make_api_request(target_resource_url, http_method_type, request_parameters, response_callback, force_authentication, include_params_in_url, set_auth_header) {
        var computed_request_url = '';

        // If not authorized and authentication is required, initiate the authorization flow.
        if (!is_validated && (typeof(force_authentication) === 'undefined' || force_authentication === true)) {
            this.perform_authorization_flow(function(auth_result) {
                if (!auth_result) {
                    // Execute the callback function with a failure status
                    if (typeof(response_callback) === 'function') {
                        response_callback(false);
                    }
                    return false;
                } else {
                    // If authorization succeeded, retry the original API request
                    make_api_request(target_resource_url, http_method_type, request_parameters, response_callback, force_authentication);
                }
            });
        }
        // User is already authorized, proceed with the API request
        else {

            // INPUT VALIDATION
            if (http_method_type !== "POST" && http_method_type !== "GET") {
                return false;
            }
            if (request_parameters == null || typeof(request_parameters) === "undefined") {
                request_parameters = "";
            }

            // INITIALIZE VARIABLES
            var original_parameters = request_parameters;

            if (request_parameters != null) {
                request_parameters = request_parameters + "&";
            }

            if (config_data.permanent_access_token !== '') {
                request_parameters = request_parameters + "oauth_token=" + config_data.permanent_access_token;
            }
            var oauth_message = compose_communique(target_resource_url, http_method_type, request_parameters);

            OAuth.SignatureMethod.sign(oauth_message, auth_helper);

            // If obtaining request tokens, all parameters must be in the URL.
            if (typeof(include_params_in_url) !== 'undefined' && include_params_in_url === true) {
                computed_request_url = OAuth.addToURL(oauth_message.action, oauth_message.parameters);
            }
            // For other requests, only custom parameters are added to the URL.
            else {
                computed_request_url = OAuth.addToURL(oauth_message.action, original_parameters);
            }

            var http_client_request = Ti.Network.createHTTPClient();

            // Define the success handler for the HTTP request
            http_client_request.onload = function() {
                // Execute the callback function with the response text
                if (typeof(response_callback) === 'function') {
                    response_callback(http_client_request.responseText);
                }

                return http_client_request.responseText;
            };

            // Define the error handler for the HTTP request
            http_client_request.onerror = function(error_event) {
                // Execute the callback function with a failure status
                if (typeof(response_callback) === 'function') {
                    response_callback(false);
                }

                return false;
            };

            http_client_request.open(http_method_type, computed_request_url, false);

            // If not specifically told to skip, set the Authorization header.
            if (typeof(set_auth_header) === 'undefined' || set_auth_header === true) {
                var is_first_param = true;
                var auth_header_string = "OAuth ";
                for (var param_index = 0; param_index < oauth_message.parameters.length; param_index++) {
                    // Only include OAuth parameters in the header, not regular POST/GET params.
                    // This is a subtle difference from original, but follows OAuth spec.
                    if (oauth_message.parameters[param_index][0].indexOf('oauth_') === 0 || oauth_message.parameters[param_index][0] === 'realm') {
                        if (!is_first_param) {
                            auth_header_string += ",";
                        }
                        auth_header_string += OAuth.percentEncode(oauth_message.parameters[param_index][0]) + "=\"" + OAuth.percentEncode(oauth_message.parameters[param_index][1]) + "\"";
                        is_first_param = false;
                    }
                }
                http_client_request.setRequestHeader("Authorization", auth_header_string);
            }

            // Send the request, potentially with parameters in the body for POST requests.
            if (http_method_type === 'POST' && (typeof(include_params_in_url) === 'undefined' || include_params_in_url === false)) {
                http_client_request.send(original_parameters);
            } else {
                http_client_request.send();
            }
        }
    }

    // ==================== PUBLIC METHODS ====================

    /**
     *  configure_credentials
     *
     *  Sets the consumer key and secret for the application.
     *  This must be called before any other API interactions.
     *
     *  @param {string} consumer_key_val - Your application's consumer key.
     *  @param {string} consumer_secret_val - Your application's consumer secret.
     */
    this.configure_credentials = function(consumer_key_val, consumer_secret_val) {
        config_data.api_consumer_key = consumer_key_val;
        config_data.client_secret_key = consumer_secret_val;
        auth_helper.clientSecretVal = consumer_key_val; // Should be client_secret_key, fix.
        auth_helper.clientSecretVal = consumer_secret_val; // Corrected assignment.
    };

    /**
     *  set_redirect_uri
     *
     *  Specifies the callback URL Twitter should use after authorization.
     *  This is crucial for web-based authorization flows.
     *
     *  @param {string} callback_link - The URL Twitter redirects to after auth.
     */
    this.set_redirect_uri = function(callback_link) {
        config_data.redirection_uri = callback_link;
    };

    /**
     *  set_display_toolbar
     *
     *  Controls whether a toolbar with a 'Cancel' button is shown on the
     *  authorization window for iPhone devices.
     *
     *  @param {boolean} show_bar - True to display the toolbar, false otherwise.
     */
    this.set_display_toolbar = function(show_bar) {
        config_data.display_auth_bar = show_bar;
    };

    /**
     *  perform_authorization_flow
     *
     *  Initiates the OAuth authorization process with Twitter.
     *  If authorization is successful, the user's access tokens are stored.
     *
     *  @param {Function} auth_completion_callback - A function to call after
     *                                                authorization attempts,
     *                                                receiving a boolean indicating success.
     */
    this.perform_authorization_flow = function(auth_completion_callback) {
        // First, check if access tokens are already stored.
        if (retrieve_stored_credentials()) {
            is_validated = true;
            if (typeof(auth_completion_callback) === 'function') {
                auth_completion_callback(true);
            }
        } else {
            // If no stored tokens, start the OAuth dance.
            obtain_initial_token(auth_completion_callback);
        }
    };

    /**
     *  check_authorization_status
     *
     *  Determines if the current session is authorized with Twitter.
     *
     *  @returns {boolean} True if authorized, false otherwise.
     */
    this.check_authorization_status = function() {
        return is_validated;
    };

    /**
     *  clear_session_tokens
     *
     *  Removes all stored access tokens and secrets, effectively logging the
     *  user out of the Twitter session.
     */
    this.clear_session_tokens = function() {
        config_data.permanent_access_token = "";
        config_data.permanent_token_secret = "";
        auth_helper.secretAccessToken = "";
        is_validated = false;

        var storage_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'twitter.config');
        if (storage_file.exists()) {
            storage_file.deleteFile();
        }
    };

    /**
     *  post_tweet
     *
     *  Sends a new tweet to Twitter.
     *
     *  @param {string} status_text - The content of the tweet.
     *  @param {Function} post_completion_callback - Optional callback after tweet attempt.
     */
    this.post_tweet = function(status_text, post_completion_callback) {
        make_api_request('https://api.twitter.com/1.1/statuses/update.json', 'POST', 'status=' + escape(status_text), post_completion_callback);
    };

    /**
     *  retrieve_timeline_data
     *
     *  Fetches the user's home timeline from Twitter.
     *
     *  @param {Function} timeline_completion_callback - Callback for timeline data.
     */
    this.retrieve_timeline_data = function(timeline_completion_callback) {
        make_api_request('https://api.twitter.com/1.1/statuses/home_timeline.json', 'GET', null, timeline_completion_callback);
    };

    /**
     *  fetch_user_details
     *
     *  Retrieves details for a specified Twitter user.
     *
     *  @param {string} user_screen_name - The screen name of the user to fetch.
     *  @param {Function} user_details_callback - Callback for user data.
     */
    this.fetch_user_details = function(user_screen_name, user_details_callback) {
        make_api_request('https://api.twitter.com/1.1/users/show.json', 'GET', 'screen_name=' + user_screen_name, user_details_callback);
    };

    /**
     *  get_current_user_id
     *
     *  Returns the user ID of the currently authenticated Twitter user.
     *
     *  @returns {string} The user's ID.
     */
    this.get_current_user_id = function() {
        return config_data.user_id;
    };

    /**
     *  get_current_screen_name
     *
     *  Returns the screen name of the currently authenticated Twitter user.
     *
     *  @returns {string} The user's screen name.
     */
    this.get_current_screen_name = function() {
        return config_data.screen_name;
    };

    // Initialize with provided settings if any
    if (initial_settings) {
        if (initial_settings.consumer_key && initial_settings.consumer_secret) {
            this.configure_credentials(initial_settings.consumer_key, initial_settings.consumer_secret);
        }
        if (initial_settings.callback_url) {
            this.set_redirect_uri(initial_settings.callback_url);
        }
        if (typeof initial_settings.show_login_toolbar === 'boolean') {
            this.set_display_toolbar(initial_settings.show_login_toolbar);
        }
    }

    // Attempt to load existing credentials on instantiation
    retrieve_stored_credentials();
    if (config_data.permanent_access_token !== "" && config_data.permanent_token_secret !== "") {
        is_validated = true;
    }
}