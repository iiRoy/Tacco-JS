'use strict';

/* global Prismic */

// Renamed global configuration object
var globalPrismicConfigData = {};

// Object to hold the global configuration and its setters, replacing the provider's 'this'
var GlobalContentSettings = {};

// Renamed configuration utility
var SettingsManagementTool = (function() {
    function ensureDefault(propertyValue, defaultValue) {
        return (propertyValue === undefined || propertyValue === null) ? defaultValue : propertyValue;
    }

    // This function sets up default values and creates setter methods on the target object
    function applyConfigurationSettings(targetObject, configData) {
        targetObject.currentActiveSettings = configData;

        // Define setters on the targetObject, which modify the configData
        targetObject.setApiEndpointUrl = function(newEndpoint) {
            configData.apiEndpointUrl = newEndpoint;
        };
        configData.apiEndpointUrl = ensureDefault(configData.apiEndpointUrl, '');

        targetObject.setAuthToken = function(newAuthToken) {
            configData.authToken = newAuthToken;
        };
        configData.authToken = ensureDefault(configData.authToken, '');

        targetObject.setClientId = function(newClientId) {
            configData.clientId = newClientId;
        };
        configData.clientId = ensureDefault(configData.clientId, '');

        targetObject.setClientSecret = function(newClientSecret) {
            configData.clientSecret = newClientSecret;
        };
        configData.clientSecret = ensureDefault(configData.clientSecret, '');

        targetObject.setDocumentLinkResolver = function(resolverFunction) {
            configData.documentLinkResolver = resolverFunction;
        };
        configData.documentLinkResolver = ensureDefault(configData.documentLinkResolver, function() {});

        targetObject.setUseBuiltinHttpRequestHandler = function(useBuiltin) {
            configData.useBuiltinHttpRequestHandler = useBuiltin;
        };
        configData.useBuiltinHttpRequestHandler = ensureDefault(configData.useBuiltinHttpRequestHandler, false);

        targetObject.setOAuthScope = function(newScope) {
            configData.oAuthScope = newScope;
        };
        configData.oAuthScope = ensureDefault(configData.oAuthScope, '');
    }

    return {
        initializeSettings: applyConfigurationSettings
    };
})();

// Initialize the global configuration store with the actual config data
SettingsManagementTool.initializeSettings(GlobalContentSettings, globalPrismicConfigData);

// --- Start of the main data access factory replacement ---

// Utility for parsing URL query strings
function extractQueryParameters(urlSearchSegment) {
    const parameterStore = {};
    const regexPattern = /([^&=]+)=?([^&]*)/g;
    const decodePart = (segment) => decodeURIComponent(segment.replace(/\+/g, " "));
    let matchResult;

    while ((matchResult = regexPattern.exec(urlSearchSegment))) {
        parameterStore[decodePart(matchResult[1])] = decodePart(matchResult[2]);
    }
    return parameterStore;
}

// Get URL parameters once from window.location
const currentBrowserQueryParameters = extractQueryParameters(window.location.search.substring(1));

// The main service factory function
function createPrismicDataAccess(instanceSpecificConfig) {
    // Merge global settings with instance-specific overrides
    const effectiveServiceConfiguration = Object.assign({}, globalPrismicConfigData, instanceSpecificConfig);
    const prismicGlobalObject = window.Prismic; // Assuming Prismic JS kit is globally available
    let cachedOperationContextPromise = null; // Cache for the Prismic context promise
    let cachedApiRootPromise = null; // Cache for the Prismic API root promise

    // Custom HTTP agent using Fetch API, replacing Angular's $http
    function customNetworkAgent(urlAddress, completionCallback) {
        const fetchConfiguration = {
            headers: {
                'Accept': 'application/json'
            }
        };

        fetch(urlAddress, fetchConfiguration)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network request failed with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => completionCallback(null, data))
            .catch(error => completionCallback(error, null));
    }

    // Obtains the Prismic API root object, replacing getApiHome()
    function fetchPrismicApiRoot() {
        if (cachedApiRootPromise) {
            return cachedApiRootPromise; // Return cached promise if available
        }
        cachedApiRootPromise = new Promise((resolve, reject) => {
            const apiFetchCallback = (err, apiHandle) => {
                if (apiHandle) {
                    resolve(apiHandle);
                } else {
                    reject(err);
                }
            };
            // Use custom network agent if configured not to use Prismic's default
            const requestAgentToUse = effectiveServiceConfiguration.useBuiltinHttpRequestHandler ? undefined : customNetworkAgent;
            prismicGlobalObject.Api(effectiveServiceConfiguration.apiEndpointUrl, apiFetchCallback, effectiveServiceConfiguration.authToken, requestAgentToUse);
        });
        return cachedApiRootPromise;
    }

    // Establishes the Prismic access context, replacing buildContext()
    function formPrismicOperationContext(referenceIdentifier) {
        return fetchPrismicApiRoot().then(api => {
            const contextPayload = {
                currentReference: (referenceIdentifier || api.data.master.ref),
                apiInterface: api,
                conditionalReferenceString: (referenceIdentifier && referenceIdentifier !== api.data.master.ref ? referenceIdentifier : ''),
                conditionalReferenceParam: (referenceIdentifier && referenceIdentifier !== api.data.master.ref ? '&ref=' + referenceIdentifier : ''),
                authenticationStatus: () => ({
                    token: effectiveServiceConfiguration.authToken,
                    hasElevatedPrivileges: !!effectiveServiceConfiguration.authToken
                }),
                linkResolutionFunction: effectiveServiceConfiguration.documentLinkResolver
            };
            return contextPayload;
        });
    }

    // Retrieves or builds the operational context, with caching, replacing withPrismic()
    function retrievePrismicOperationContext() {
        if (cachedOperationContextPromise) {
            return cachedOperationContextPromise;
        }
        cachedOperationContextPromise = formPrismicOperationContext(currentBrowserQueryParameters['ref']);
        return cachedOperationContextPromise;
    }

    // Core query execution logic, replacing queryWithConfiguration()
    function executePrismicDataQuery(queryFilterExpression, resultTransformation, additionalQueryModifiers) {
        return retrievePrismicOperationContext().then(context => {
            let contentSearchForm = context.apiInterface.forms('everything').ref(context.currentReference);

            if (queryFilterExpression && queryFilterExpression !== "") {
                contentSearchForm = contentSearchForm.query(queryFilterExpression);
            }

            if (additionalQueryModifiers) {
                contentSearchForm = additionalQueryModifiers(contentSearchForm);
            }

            return new Promise((resolve, reject) => {
                contentSearchForm.submit((queryIssue, fetchedContentItems) => {
                    if (fetchedContentItems) {
                        resolve(resultTransformation(fetchedContentItems));
                    } else {
                        reject(queryIssue);
                    }
                });
            });
        });
    }

    // Public API for the data access service
    const dataAccessMethods = {};

    // Apply setters for this service instance's configuration
    SettingsManagementTool.initializeSettings(dataAccessMethods, effectiveServiceConfiguration);

    dataAccessMethods.getApiConnector = function() {
        return retrievePrismicOperationContext().then(context => context.apiInterface);
    };

    dataAccessMethods.getOperationContext = function() {
        return retrievePrismicOperationContext();
    };

    dataAccessMethods.generateOAuthUrl = function(optionalRedirectUri) {
        return dataAccessMethods.getApiConnector().then(api => {
            const finalRedirectUrl = optionalRedirectUri || window.location.toString();
            const urlComponents = [
                api.data.oauthInitiate,
                "?response_type=token",
                "&client_id=", encodeURIComponent(effectiveServiceConfiguration.clientId),
                "&redirect_uri=", encodeURIComponent(finalRedirectUrl),
                "&scope=", encodeURIComponent(effectiveServiceConfiguration.oAuthScope)
            ];
            return urlComponents.join('');
        });
    };

    dataAccessMethods.retrieveAllContent = function(extraModifiers) {
        return dataAccessMethods.searchContent("", extraModifiers);
    };

    dataAccessMethods.searchContent = function(filterExpression, extraModifiers) {
        return executePrismicDataQuery(filterExpression, items => items, extraModifiers);
    };

    dataAccessMethods.fetchContentByType = function(contentTypeName, extraModifiers) {
        const typeFilter = '[[:d = at(document.type, "' + contentTypeName + '")]]';
        return dataAccessMethods.searchContent(typeFilter, extraModifiers);
    };

    dataAccessMethods.fetchContentById = function(uniqueEntityId) {
        const idFilter = '[[:d = at(document.id, "' + uniqueEntityId + '")]]';
        return executePrismicDataQuery(idFilter, items => items.results[0]);
    };

    dataAccessMethods.fetchContentByIds = function(entityIds, extraModifiers) {
        if (!entityIds || entityIds.length === 0) {
            return Promise.reject("A list of entity IDs must be supplied.");
        }
        const formattedIds = entityIds.map(id => '"' + id + '"').join(',');
        const idsFilter = '[[:d = any(document.id, [' + formattedIds + '])]]';
        return dataAccessMethods.searchContent(idsFilter, extraModifiers);
    };

    dataAccessMethods.fetchBookmarkedItem = function(bookmarkAlias) {
        return retrievePrismicOperationContext().then(context => {
            const bookmarkedDocumentId = context.apiInterface.bookmarks[bookmarkAlias];
            if (bookmarkedDocumentId) {
                return dataAccessMethods.fetchContentById(bookmarkedDocumentId);
            } else {
                return Promise.reject(`Bookmark '${bookmarkAlias}' was not found.`);
            }
        });
    };

    return dataAccessMethods;
}

// --- End of the main data access factory replacement ---

// --- Start of the directive replacement ---

// Function to render a Prismic HTML fragment into a specified DOM element
function renderPrismicHtmlFragment(targetHtmlElement, documentFragment, renderingConfiguration) {
    if (!targetHtmlElement || !documentFragment) {
        return;
    }

    const prismicFieldInstance = window.Prismic.Fragments.initField(documentFragment);
    if (prismicFieldInstance) {
        // Use the Prismic configuration for the HTML rendering context
        const generatedHtml = prismicFieldInstance.asHtml(renderingConfiguration);
        targetHtmlElement.innerHTML = generatedHtml;
    }
}