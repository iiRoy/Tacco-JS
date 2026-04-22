(function() {
    const globalStateMonitor = {
        appLaunchedFlag: false,
        initiate: function() {
            const pageVisibilityChange = () => {
                this.appLaunchedFlag = true;
            };
            window.addEventListener("blur", pageVisibilityChange);
            window.addEventListener("pagehide", pageVisibilityChange);
        },
        resetState: function() {
            this.appLaunchedFlag = false;
        }
    };

    globalStateMonitor.initiate();

    const deepLinkProcessor = function(targetElements, setupOptions) {
        const operationalContext = {
            extraHandlers: [],
            diagnosticMode: false,
            isAppleDevice: /(iPad|iPhone|iPod)/g.test(navigator.userAgent)
        };

        Object.assign(operationalContext, setupOptions);

        if (!operationalContext.isAppleDevice && !operationalContext.diagnosticMode) {
            return;
        }

        const acquireSynchronousData = (endpointUrl) => {
            const request = new XMLHttpRequest();
            request.open('GET', endpointUrl, false);
            request.send(null);

            if (request.status === 200) {
                return JSON.parse(request.responseText);
            }
            throw new Error(`Data acquisition failed from: ${endpointUrl} (Status: ${request.status})`);
        };

        const standardHandlers = [
            {
                uriMatcher: /(facebook)/g,
                targetGenerator: function(identityToken) {
                    let socialIdentifier = '';
                    if (isNaN(parseInt(identityToken, 10))) {
                        try {
                            const responseData = acquireSynchronousData("http://graph.facebook.com/" + identityToken);
                            socialIdentifier = responseData.id;
                        } catch (error) {
                            if (operationalContext.diagnosticMode) {
                                console.error("Facebook ID acquisition failed:", error);
                            }
                            socialIdentifier = identityToken;
                        }
                    } else {
                        socialIdentifier = identityToken;
                    }
                    return "fb://profile/" + socialIdentifier;
                }
            },
            {
                uriMatcher: /(linkedin)/g,
                targetGenerator: function(identityToken) {
                    return "linkedin://#profile/" + identityToken;
                }
            },
            {
                uriMatcher: /(instagram)/g,
                targetGenerator: function(identityToken) {
                    return "instagram://user?username=" + identityToken;
                }
            },
            {
                uriMatcher: /(quirky)/g,
                targetGenerator: function(identityToken) {
                    return "quirky:///" + identityToken;
                }
            },
            {
                uriMatcher: /(twitter)/g,
                targetGenerator: function(identityToken) {
                    return "twitter://user?screen_name=" + identityToken;
                }
            }
        ];

        const routingHandlers = standardHandlers.concat(operationalContext.extraHandlers);

        targetElements.forEach(function(currentElement) {
            const sourceReference = currentElement.getAttribute("href");
            if (!sourceReference) return;

            const pathSegments = sourceReference.split(".com/");
            let identityToken;

            if (currentElement.dataset.username) {
                identityToken = currentElement.dataset.username;
            } else if (pathSegments.length > 1) {
                identityToken = pathSegments[1];
            } else {
                identityToken = "undefined_user";
            }

            for (const handler of routingHandlers) {
                if (handler.uriMatcher.test(sourceReference)) {
                    const deepLinkTarget = handler.targetGenerator(identityToken);
                    
                    currentElement.setAttribute("data-original-reference", sourceReference);
                    currentElement.setAttribute("href", deepLinkTarget);

                    currentElement.addEventListener("click", function(evt) {
                        setTimeout(function() {
                            if (!globalStateMonitor.appLaunchedFlag) {
                                window.location = currentElement.getAttribute("data-original-reference");
                            } else {
                                globalStateMonitor.resetState();
                            }
                        }, 1000);
                    });

                    break;
                }
            }
        });
    };

    window.AppRoutingUtility = function(selector, configParams) {
        const elements = document.querySelectorAll(selector);
        deepLinkProcessor(elements, configParams);
        return elements;
    };

})();