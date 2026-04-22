if (Ti.Platform.osname === 'iphone') {
    Ti.include('lib/oauth.js');
    Ti.include('lib/sha1.js');
} else {
    Ti.include('oauth.js');
    Ti.include('sha1.js');
}

function createTwitterConnector(initialConfiguration) {
    const defaultSettings = {
        consumerKey: "",
        consumerSecret: "",
        displayAuthToolbar: false,
        oauthVersion: "1.0",
        oauthSignatureMethod: "HMAC-SHA1",
        requestTokenValue: "",
        requestTokenSecretValue: "",
        requestVerifierValue: "",
        accessTokenValue: "",
        accessTokenSecretValue: "",
        callbackRedirectURL: "",
        userId: "",
        screenName: ""
    };

    let currentSettings = { ...defaultSettings, ...initialConfiguration };

    let credentialKeeper = {
        consumerSecret: currentSettings.consumerSecret,
        tokenSecret: currentSettings.accessTokenSecretValue
    };

    let sessionActive = false;

    const fabricateAuthParameters = (targetURL, requestVerb, supplementaryData) => {
        const parameterList = supplementaryData ? OAuth.decodeForm(supplementaryData) : [];

        parameterList.push(['oauth_consumer_key', currentSettings.consumerKey]);
        parameterList.push(['oauth_signature_method', currentSettings.oauthSignatureMethod]);
        parameterList.push(["oauth_timestamp", OAuth.timestamp().toFixed(0)]);
        parameterList.push(["oauth_nonce", OAuth.nonce(42)]);
        parameterList.push(["oauth_version", "1.0"]);

        return {
            action: targetURL,
            method: requestVerb === 'GET' ? 'GET' : 'POST',
            parameters: parameterList
        };
    };

    const cachePersistentTokens = () => {
        const dataHandle = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'twitter_session.dat');
        if (!dataHandle) {
            Ti.Filesystem.createFile(Ti.Filesystem.applicationDataDirectory, 'twitter_session.dat');
        }

        const tokenPayload = {
            access_token: currentSettings.accessTokenValue,
            access_token_secret: currentSettings.accessTokenSecretValue
        };
        dataHandle.write(JSON.stringify(tokenPayload));
    };

    const retrievePersistentTokens = () => {
        const dataHandle = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'twitter_session.dat');
        if (!dataHandle || !dataHandle.exists()) {
            return false;
        }

        const fileContent = dataHandle.read();
        if (!fileContent) {
            return false;
        }

        try {
            const storedConfig = JSON.parse(fileContent.text);
            if (storedConfig.access_token) {
                currentSettings.accessTokenValue = storedConfig.access_token;
            }
            if (storedConfig.access_token_secret) {
                currentSettings.accessTokenSecretValue = storedConfig.access_token_secret;
                credentialKeeper.tokenSecret = currentSettings.accessTokenSecretValue;
            }
            return true;
        } catch (error) {
            return false;
        }
    };

    const requestProvisionalToken = async () => {
        const endpoint = 'https://api.twitter.com/oauth/request_token';
        const queryParams = currentSettings.callbackRedirectURL ? `oauth_callback=${encodeURIComponent(currentSettings.callbackRedirectURL)}` : '';

        const responseData = await processNetworkCall(endpoint, 'POST', queryParams, false, true, false);

        if (responseData) {
            const parsedResponse = OAuth.getParameterMap(responseData);
            currentSettings.requestTokenValue = parsedResponse['oauth_token'];
            currentSettings.requestTokenSecretValue = parsedResponse['oauth_token_secret'];
            return true;
        }
        return false;
    };

    const displayAuthorizationUI = () => {
        return new Promise((resolve, reject) => {
            const authURL = `http://api.twitter.com/oauth/authorize?oauth_token=${currentSettings.requestTokenValue}`;
            const displayPanel = Ti.UI.createWindow({
                top: 0,
                modal: true,
                fullscreen: true
            });

            let browserView;
            if (Ti.Platform.osname === 'iphone' && currentSettings.displayAuthToolbar) {
                browserView = Ti.UI.createWebView({
                    url: authURL,
                    scalesPageToFit: true,
                    touchEnabled: true,
                    top: 43,
                    backgroundColor: '#FFF'
                });
                const headerBar = Ti.UI.createToolbar({ top: 0 });
                const headerText = Ti.UI.createLabel({
                    text: 'Connect with Twitter',
                    font: { fontSize: 16, fontWeight: 'bold' },
                    color: '#FFF',
                    textAlign: 'center'
                });
                const flexibleSpace = Titanium.UI.createButton({
                    systemButton: Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
                });
                const closeButton = Titanium.UI.createButton({
                    title: 'Cancel',
                    style: Titanium.UI.iPhone.SystemButtonStyle.BORDERED
                });
                headerBar.items = [flexibleSpace, flexibleSpace, headerText, flexibleSpace, closeButton];
                displayPanel.add(headerBar);

                closeButton.addEventListener('click', () => {
                    browserView.stopLoading();
                    displayPanel.remove(browserView);
                    displayPanel.close();
                    reject('User cancelled authorization');
                });
            } else {
                browserView = Ti.UI.createWebView({
                    url: authURL,
                    scalesPageToFit: true,
                    touchEnabled: true,
                    top: 0,
                    backgroundColor: '#FFF'
                });
            }

            let pageLoading = false;
            let loadCount = 0;
            let processingRedirect = false;

            const checkCompletionStatus = () => {
                if (!processingRedirect && !pageLoading) {
                    browserView.stopLoading();
                    displayPanel.remove(browserView);
                    displayPanel.close();
                    reject('Authorization flow aborted');
                }
            };

            browserView.addEventListener('beforeload', () => {
                pageLoading = true;
            });

            browserView.addEventListener('load', (eventData) => {
                loadCount++;
                if (loadCount === 2) { 
                    if (eventData.url !== 'https://api.twitter.com/oauth/authorize') {
                        browserView.stopLoading();
                        displayPanel.remove(browserView);
                        displayPanel.close();
                        reject('Authorization failed or redirected unexpectedly');
                        return;
                    } else {
                        setTimeout(checkCompletionStatus, 1000);
                    }
                } else if (loadCount === 3) { 
                    processingRedirect = true;
                    let extractedParams = "";
                    (eventData.url).replace(/[?&]+([^=&]+)=([^&]*)/gi, (match, key, value) => {
                        extractedParams += match;
                        if (key === 'oauth_verifier') {
                            currentSettings.requestVerifierValue = value;
                        }
                    });

                    if (currentSettings.requestVerifierValue) {
                        browserView.stopLoading();
                        displayPanel.remove(browserView);
                        displayPanel.close();
                        resolve(currentSettings.requestVerifierValue);
                    } else {
                        reject('OAuth verifier not found in callback URL');
                    }
                }
                pageLoading = false;
            });

            displayPanel.add(browserView);
            displayPanel.open();
        });
    };

    const tradeForPermanentToken = async (verifier) => {
        const endpoint = 'https://api.twitter.com/oauth/access_token';
        const queryParams = `oauth_token=${currentSettings.requestTokenValue}&oauth_verifier=${verifier}`;

        const responseData = await processNetworkCall(endpoint, 'POST', queryParams, false, true, false);

        if (responseData) {
            const parsedResponse = OAuth.getParameterMap(responseData);
            currentSettings.accessTokenValue = parsedResponse['oauth_token'];
            currentSettings.accessTokenSecretValue = parsedResponse['oauth_token_secret'];
            currentSettings.userId = parsedResponse['user_id'];
            currentSettings.screenName = parsedResponse['screen_name'];
            credentialKeeper.tokenSecret = currentSettings.accessTokenSecretValue;

            cachePersistentTokens();
            sessionActive = retrievePersistentTokens(); 
            return true;
        }
        return false;
    };

    const establishSession = async (completionCallback) => {
        if (sessionActive) {
            if (typeof completionCallback === 'function') completionCallback(true);
            return true;
        }

        sessionActive = retrievePersistentTokens();
        if (sessionActive) {
            if (typeof completionCallback === 'function') completionCallback(true);
            return true;
        }

        try {
            const provisionalTokenAcquired = await requestProvisionalToken();
            if (!provisionalTokenAcquired) throw new Error("Failed to acquire provisional token.");

            const verifier = await displayAuthorizationUI();
            if (!verifier) throw new Error("User authorization failed or verifier not obtained.");

            const permanentTokenAcquired = await tradeForPermanentToken(verifier);
            if (!permanentTokenAcquired) throw new Error("Failed to acquire permanent access token.");

            if (typeof completionCallback === 'function') completionCallback(true);
            return true;
        } catch (error) {
            console.error("Twitter authorization error:", error);
            if (typeof completionCallback === 'function') completionCallback(false);
            return false;
        }
    };

    const processNetworkCall = (targetURL, requestVerb, additionalData, requiresAuth = true, setParamsInURL = false, setAuthHeader = true) => {
        return new Promise(async (resolve, reject) => {
            if (requiresAuth && !sessionActive) {
                const authSuccess = await establishSession();
                if (!authSuccess) {
                    reject(false);
                    return;
                }
                resolve(await processNetworkCall(targetURL, requestVerb, additionalData, requiresAuth, setParamsInURL, setAuthHeader));
                return;
            }

            if (!['POST', 'GET'].includes(requestVerb)) {
                reject(false);
                return;
            }

            let effectiveURL = targetURL;
            let currentData = additionalData || "";

            if (currentSettings.accessTokenValue) {
                currentData += (currentData ? "&" : "") + `oauth_token=${currentSettings.accessTokenValue}`;
            }

            const signingContext = fabricateAuthParameters(targetURL, requestVerb, currentData);
            credentialKeeper.consumerSecret = currentSettings.consumerSecret;
            credentialKeeper.tokenSecret = currentSettings.accessTokenSecretValue;
            OAuth.SignatureMethod.sign(signingContext, credentialKeeper);

            if (setParamsInURL) {
                effectiveURL = OAuth.addToURL(signingContext.action, signingContext.parameters);
            } else {
                effectiveURL = OAuth.addToURL(signingContext.action, additionalData);
            }

            const httpAgent = Ti.Network.createHTTPClient();
            
            httpAgent.onload = function () {
                resolve(this.responseText);
            };

            httpAgent.onerror = function (e) {
                console.error(`HTTP request error: ${e.error}`);
                reject(false);
            };
            
            httpAgent.open(requestVerb, effectiveURL, false);

            if (setAuthHeader) {
                const authHeaderParts = ['OAuth'];
                for (const param of signingContext.parameters) {
                    if (param[0].startsWith('oauth_')) {
                        authHeaderParts.push(`${param[0]}="${OAuth.percentEncode(param[1])}"`);
                    }
                }
                httpAgent.setRequestHeader("Authorization", authHeaderParts.join(', '));
            }
            
            if (requestVerb === 'POST' && !setParamsInURL) {
                httpAgent.send(additionalData);
            } else {
                httpAgent.send();
            }
        });
    };

    return {
        configureCredentials: (newConfig) => {
            currentSettings = { ...currentSettings, ...newConfig };
            credentialKeeper.consumerSecret = currentSettings.consumerSecret;
            credentialKeeper.tokenSecret = currentSettings.accessTokenSecretValue;
        },
        initiateSession: establishSession,
        invokeAPI: processNetworkCall,
        isSessionActive: () => sessionActive,
        retrieveCurrentTokens: () => ({
            accessToken: currentSettings.accessTokenValue,
            accessTokenSecret: currentSettings.accessTokenSecretValue,
            userId: currentSettings.userId,
            screenName: currentSettings.screenName
        })
    };
}