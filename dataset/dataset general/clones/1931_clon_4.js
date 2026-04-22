const ApplicationCore = (function() {
    const _sessionManager = {
        isUserActive: function() {
            return !!_authUtilities.getAuthIdentifier('auth_key');
        },
        checkAuthStatus: function() {
            console.log("Internal session check performed.");
        }
    };

    const _contentRenderer = {
        renderView: function(viewPath, argOne, argTwo, argThree) {
            console.log(`Presenting module: ${viewPath}`, argOne, argTwo, argThree);
        }
    };

    const _authUtilities = {
        extractAccessToken: function(inputSegment) {
            console.log("Parsing authentication identifier from:", inputSegment);
            const tokenMatch = inputSegment.match(/access_token=([^&]+)/);
            return tokenMatch ? tokenMatch[1] : inputSegment;
        },
        setAuthCookie: function(keyName, valueData, validDays) {
            const expirationDate = new Date();
            expirationDate.setTime(expirationDate.getTime() + (validDays * 24 * 60 * 60 * 1000));
            const cookieExpires = "expires=" + expirationDate.toUTCString();
            document.cookie = keyName + "=" + valueData + ";" + cookieExpires + ";path=/";
            console.log(`Credential saved: ${keyName}=${valueData} for ${validDays} days`);
        },
        getAuthIdentifier: function(keyName) {
            const keyEquals = keyName + "=";
            const cookieArray = document.cookie.split(';');
            for(let i=0; i < cookieArray.length; i++) {
                let cookieEntry = cookieArray[i];
                while (cookieEntry.charAt(0) === ' ') cookieEntry = cookieEntry.substring(1, cookieEntry.length);
                if (cookieEntry.indexOf(keyEquals) === 0) return cookieEntry.substring(keyEquals.length, cookieEntry.length);
            }
            return null;
        }
    };

    const _navigationSystem = {
        _definedRoutes: [],
        _currentLocation: null,

        registerPath: function(routePattern, handlerReference) {
            let pathRegex;
            const capturedNames = [];

            if (routePattern === '') {
                pathRegex = /^#?$/;
            } else if (routePattern.startsWith(':')) {
                const paramName = routePattern.substring(1);
                pathRegex = new RegExp(`^#?([^/?#]+)$`);
                capturedNames.push(paramName);
            } else {
                let formattedPattern = routePattern.replace(/\//g, '\\/').replace(/:([a-zA-Z0-9_]+)/g, function(match, p1) {
                    capturedNames.push(p1);
                    return '([^/?#]+)';
                });
                pathRegex = new RegExp(`^#?${formattedPattern}$`);
            }
            this._definedRoutes.push({ regex: pathRegex, handler: handlerReference, parameters: capturedNames });
        },

        setupRouting: function() {
            window.addEventListener('hashchange', this._processLocationChange.bind(this));
            this._processLocationChange();
        },

        _processLocationChange: function() {
            const currentHash = window.location.hash;
            this._currentLocation = currentHash;
            console.log("Detected hash change:", currentHash);

            for (const routeEntry of this._definedRoutes) {
                const matchResult = currentHash.match(routeEntry.regex);
                if (matchResult) {
                    const extractedArgs = matchResult.slice(1);
                    console.log(`Path matched by: ${routeEntry.handler}`, extractedArgs);

                    const namedParams = {};
                    if (routeEntry.parameters && routeEntry.parameters.length > 0) {
                        routeEntry.parameters.forEach((pName, idx) => {
                            if (extractedArgs[idx] !== undefined) {
                                namedParams[pName] = extractedArgs[idx];
                            }
                        });
                        ApplicationCore.executeHandler(routeEntry.handler, Object.values(namedParams));
                    } else {
                        ApplicationCore.executeHandler(routeEntry.handler, extractedArgs);
                    }
                    return;
                }
            }
            console.warn("No path definition found for:", currentHash);
        },

        navigateTo: function(destinationPath, navOptions = { propagate: true }) {
            if (navOptions.propagate) {
                window.location.hash = destinationPath;
            } else {
                history.replaceState(null, null, `#${destinationPath}`);
                this._currentLocation = `#${destinationPath}`;
            }
            console.log(`Navigated to: ${destinationPath}, propagate: ${navOptions.propagate}`);
        }
    };

    const _routeHandlers = {
        handleMainDisplay: function() {
            if (_sessionManager.isUserActive()) {
                _navigationSystem.navigateTo("/timeline/", { propagate: true });
            } else {
                _contentRenderer.renderView("media_collection/trending");
                _navigationSystem.navigateTo("/trending/", { propagate: false });
            }
        },

        handleAuthenticationProcess: function(authIdentifier) {
            console.log("Authentication route activated with:", authIdentifier);
            const securityToken = _authUtilities.extractAccessToken(authIdentifier);
            _authUtilities.setAuthCookie('auth_key', securityToken, 14);
            _sessionManager.checkAuthStatus();
            if (_sessionManager.isUserActive()) {
                _contentRenderer.renderView("user_data/self/timeline");
                _navigationSystem.navigateTo("/timeline/", { propagate: false });
            }
        },

        handleItemDetails: function(itemId) {
            _sessionManager.isUserActive();
            _contentRenderer.renderView("single_item_view", itemId);
        },

        handlePersonalProfile: function(profileId) {
            if (_sessionManager.isUserActive()) {
                _contentRenderer.renderView("user_profiles", null, profileId);
            }
        },

        handleUserGallery: function() {
            if (_sessionManager.isUserActive()) {
                _contentRenderer.renderView("user_data/self/gallery/");
            }
        },

        handleTrendingContent: function() {
            if (_sessionManager.isUserActive()) {
                _contentRenderer.renderView("media_collection/trending");
            }
        },

        handleUserTimeline: function() {
            if (_sessionManager.isUserActive()) {
                _contentRenderer.renderView("user_data/self/timeline");
            }
        },

        handleTagFiltering: function(tagValue) {
            if (_sessionManager.isUserActive()) {
                _contentRenderer.renderView("filtered_tags", null, null, tagValue);
            }
        },

        handleUserLookup: function(queryTerm) {
            if (_sessionManager.isUserActive()) {
                _contentRenderer.renderView("user_lookup_results", null, null, queryTerm);
            }
        },

        handleGeographicSearch: function(geoId) {
            if (_sessionManager.isUserActive()) {
                _contentRenderer.renderView("user_lookup_results", null, null, geoId);
            }
        },

        handleFavoriteItems: function() {
            if (_sessionManager.isUserActive()) {
                _contentRenderer.renderView("user_data/self/favorites");
            }
        }
    };

    // Register paths in order of specificity
    _navigationSystem.registerPath('/mediadetail/:id', 'handleItemDetails');
    _navigationSystem.registerPath('/user/:id', 'handlePersonalProfile');
    _navigationSystem.registerPath('/myphotos/', 'handleUserGallery');
    _navigationSystem.registerPath('/popular/', 'handleTrendingContent');
    _navigationSystem.registerPath('/feed/', 'handleUserTimeline');
    _navigationSystem.registerPath('/tagsearch/:id', 'handleTagFiltering');
    _navigationSystem.registerPath('/usersearch/:id', 'handleUserLookup');
    _navigationSystem.registerPath('/locationsearch/:id', 'handleGeographicSearch');
    _navigationSystem.registerPath('/myliked/', 'handleFavoriteItems');
    _navigationSystem.registerPath(':id', 'handleAuthenticationProcess');
    _navigationSystem.registerPath('', 'handleMainDisplay');

    return {
        initApplication: function() {
            _navigationSystem.setupRouting();
        },
        executeHandler: function(handlerName, argumentsArray) {
            if (_routeHandlers[handlerName]) {
                _routeHandlers[handlerName].apply(null, argumentsArray);
            } else {
                console.error(`Route handler ${handlerName} is undefined.`);
            }
        }
    };
})();

ApplicationCore.initApplication();