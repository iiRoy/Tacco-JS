(function() {
    const PRIOR_PAGE_VISIT_KEY = "lastVisitedLocation";
    const CONNECT_LINK_SELECTOR = 'a[href*="connect/uiserver.php"]';
    const APP_LINK_SELECTOR = 'a[href*="apps.facebook.com"]';
    const REDIRECT_TARGET_PARAM = "redirect_uri";
    const STORY_TITLE_PARAM = "redirectTitle";
    const PERMISSION_SCOPE_PARAM = "scope";
    const REQUIRED_PERMISSION = "publish_actions";
    const OAUTH_PATH_FRAGMENT = "dialog/oauth";
    const UI_SERVER_PATH_FRAGMENT = "connect/uiserver";
    const GOOGLE_INSTANT_SEARCH_URL = "https://www.google.com/search?btnI&q=";

    function extractUriComponent(fullWebAddress, componentName) {
        try {
            const addressObject = new URL(fullWebAddress);
            return addressObject.searchParams.get(componentName);
        } catch (e) {
            return null;
        }
    }

    function modifyUriComponent(fullWebAddress, componentKey, componentValue) {
        try {
            const addressObject = new URL(fullWebAddress);
            addressObject.searchParams.set(componentKey, componentValue);
            return addressObject.toString();
        } catch (e) {
            return fullWebAddress;
        }
    }

    function locateFirstMeaningfulText(elementNode) {
        if (!elementNode) return null;

        const traveler = document.createTreeWalker(
            elementNode,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(textNode) {
                    return /^\s*$/.test(textNode.nodeValue) ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );

        let discoveredTextNode;
        while (discoveredTextNode = traveler.nextNode()) {
            return discoveredTextNode.nodeValue;
        }
        return null;
    }

    function stringTerminatesWith(mainText, endingSegment) {
        return mainText.endsWith(endingSegment);
    }

    function processExternalConnections() {
        Array.from(document.querySelectorAll(CONNECT_LINK_SELECTOR)).forEach(function(currentLinkElement) {
            const linkDestination = currentLinkElement.getAttribute('href');
            const finalDestination = extractUriComponent(linkDestination, REDIRECT_TARGET_PARAM);
            
            if (finalDestination) {
                currentLinkElement.setAttribute('href', finalDestination);
                currentLinkElement.removeAttribute('rel');
                currentLinkElement.setAttribute('target', '_blank');
            }
        });
    }

    function augmentAppReferences() {
        const titleToUriMap = new Map();
        const applicationLinks = Array.from(document.querySelectorAll(APP_LINK_SELECTOR));

        applicationLinks.forEach(function(currentLinkElement) {
            const foundTitle = locateFirstMeaningfulText(currentLinkElement);
            if (foundTitle && foundTitle.length > 2) {
                const trimmedTitle = stringTerminatesWith(foundTitle, "...") ? 
                                       foundTitle.substring(0, foundTitle.lastIndexOf("...")) : 
                                       foundTitle;
                titleToUriMap.set(currentLinkElement.getAttribute('href'), trimmedTitle);
            }
        });

        applicationLinks.forEach(function(currentLinkElement) {
            const originalLinkAddress = currentLinkElement.getAttribute('href');
            const associatedTitle = titleToUriMap.get(originalLinkAddress);

            if (associatedTitle) {
                const updatedLinkAddress = modifyUriComponent(originalLinkAddress, STORY_TITLE_PARAM, associatedTitle);
                currentLinkElement.setAttribute('href', updatedLinkAddress);
                currentLinkElement.setAttribute('target', '_blank');
            }
        });
    }

    function performInitialScanAndRedirect() {
        const currentDocumentUri = new URL(document.URL);
        const previousDocumentUri = sessionStorage.getItem(PRIOR_PAGE_VISIT_KEY);
        sessionStorage.setItem(PRIOR_PAGE_VISIT_KEY, document.URL);

        const isRecursiveNav = (previousDocumentUri === document.URL);

        if (currentDocumentUri.pathname.includes(OAUTH_PATH_FRAGMENT) || currentDocumentUri.pathname.includes(UI_SERVER_PATH_FRAGMENT)) {
            const finalRedirectionUri = extractUriComponent(document.URL, REDIRECT_TARGET_PARAM);
            const storyIdentifier = extractUriComponent(finalRedirectionUri || '', STORY_TITLE_PARAM);
            const requestedPermissions = extractUriComponent(document.URL, PERMISSION_SCOPE_PARAM);

            const hasRequiredPermissions = requestedPermissions && requestedPermissions.includes(REQUIRED_PERMISSION);
            
            if ((finalRedirectionUri && hasRequiredPermissions) || storyIdentifier) {
                if (finalRedirectionUri && !currentDocumentUri.hostname.includes("apps.facebook.com") && (!isRecursiveNav)) {
                    window.location.assign(finalRedirectionUri);
                } else if (storyIdentifier) {
                    window.location.assign(GOOGLE_INSTANT_SEARCH_URL + encodeURIComponent(storyIdentifier));
                }
            }
        }
    }

    let changeProcessingTimer;
    const handleDynamicContentUpdates = () => {
        clearTimeout(changeProcessingTimer);
        changeProcessingTimer = setTimeout(() => {
            processExternalConnections();
            augmentAppReferences();
        }, 120);
    };

    const domChangeMonitor = new MutationObserver(handleDynamicContentUpdates);
    const monitorConfiguration = { childList: true, subtree: true, attributes: false };

    performInitialScanAndRedirect();

    document.addEventListener('DOMContentLoaded', () => {
        processExternalConnections();
        augmentAppReferences();
        domChangeMonitor.observe(document.body, monitorConfiguration);
    });
})();