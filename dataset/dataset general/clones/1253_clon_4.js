(function(scope) {
    "use strict";

    const queryMaster = {};
    scope.responsiveQuery = queryMaster;

    const processedSheetUrls = new Set();
    const queryDefinitions = []; // Stores parsed query rules
    const cachedCssText = [];    // Stores actual CSS blocks referenced by ruleTextIndex
    const activeInjectedStyles = new Map(); // Map<mediaType, HTMLElement> for current injected styles
    const elementsWithOriginalClasses = new WeakMap(); // Map<Element, string> to store initial classes
    let pixelPerEmCache;

    const resizeDelayMs = 30;
    const matchClassPrefix = "rq-element-match-";
    let lastEvaluationTime = 0;
    let deferredEvaluationTimer;

    // Helper to fetch CSS content using Promises
    const retrieveContent = (url) => new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(new Error(`Content retrieval failed for ${url}: ${xhr.statusText}`));
            }
        };
        xhr.onerror = () => reject(new Error(`Network error during content retrieval for ${url}`));
        xhr.send();
    });

    // Helper to adjust relative URLs within CSS content
    const adjustUrlsInCss = (cssContent, baseUrl) => {
        if (!baseUrl) return cssContent;
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
        return cssContent.replace(/(url\()['"]?([^\/'"][^:'"]+)['"]?(\))/g, `$1${normalizedBase}$2$3`);
    };

    // Helper to calculate the pixel value of 1em
    const calculateEmUnit = () => {
        if (pixelPerEmCache) return pixelPerEmCache;

        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = "position:absolute;font-size:1em;width:1em;visibility:hidden;";
        
        let targetParent = document.body;
        let createdTemporaryBody = false;

        // Mimic original's handling of body not existing
        if (!targetParent) {
            targetParent = document.createElement("body");
            targetParent.style.background = "none";
            document.documentElement.insertBefore(targetParent, document.documentElement.firstChild);
            createdTemporaryBody = true;
        }

        targetParent.appendChild(tempDiv);
        pixelPerEmCache = tempDiv.offsetWidth;

        if (createdTemporaryBody) {
            document.documentElement.removeChild(targetParent);
        } else {
            targetParent.removeChild(tempDiv);
        }
        return pixelPerEmCache;
    };

    // Helper for class manipulation using classList
    const classUtil = {
        add: (element, classStr) => {
            if (!element.classList.contains(classStr)) {
                element.classList.add(classStr);
            }
        }
        // No remove or has needed directly for this logic, as we reset and then add
    };

    // Parses CSS content for @element queries and stores them
    const ingestStylesheetContent = (content, sourceUrl, mediaAttribute) => {
        const queryBlockRegex = /@element([^\{]+)\{([^\{\}]*\{[^\}\{]*\})+/gi;
        let queryMatches = content.match(queryBlockRegex);
        const sourceBaseUrl = sourceUrl ? sourceUrl.substring(0, sourceUrl.lastIndexOf('/')) + '/' : '';

        // If no @element queries found but a media attribute exists, treat the whole sheet as one rule
        if (!queryMatches && mediaAttribute) {
            queryMatches = [`@element ${mediaAttribute}{${content}}`];
        }

        if (!queryMatches) return;

        queryMatches.forEach(fullQueryString => {
            const ruleParts = fullQueryString.match(/@element *([^\{]+)\{([\S\s]+?)$/);
            const conditionsRaw = ruleParts && ruleParts[1] ? ruleParts[1].trim() : mediaAttribute;
            const cssBlockContent = ruleParts && ruleParts[2] ? ruleParts[2].trim() : content;

            const adjustedCssBlock = adjustUrlsInCss(cssBlockContent, sourceBaseUrl);
            cachedCssText.push(adjustedCssBlock);
            const currentRuleTextIndex = cachedCssText.length - 1;

            conditionsRaw.split(',').forEach(singleCondition => {
                const conditionSegments = singleCondition.split(']');
                const elementSelector = conditionSegments[0].split('[')[1]; // Extract selector from [selector]
                const mediaQuerySyntax = conditionSegments[1]; // Remaining part with media queries

                const minWidthMatch = mediaQuerySyntax.match(/\(\s*min\-width:\s*(\s*[0-9\.]+)(px|em)\s*\)/);
                const maxWidthMatch = mediaQuerySyntax.match(/\(\s*max\-width:\s*(\s*[0-9\.]+)(px|em)\s*\)/);
                const queryMediaTypeMatch = mediaQuerySyntax.match(/(only\s+)?([a-zA-Z]+)\s?/) || ['', '', 'all'];

                queryDefinitions.push({
                    originalSelector: elementSelector,
                    mediaType: queryMediaTypeMatch[2],
                    minDimension: minWidthMatch ? parseFloat(minWidthMatch[1]) : null,
                    minUnit: minWidthMatch ? minWidthMatch[2] : null,
                    maxDimension: maxWidthMatch ? parseFloat(maxWidthMatch[1]) : null,
                    maxUnit: maxWidthMatch ? maxWidthMatch[2] : null,
                    hasExplicitQuery: singleCondition.includes('('),
                    ruleTextIndex: currentRuleTextIndex
                });
            });
        });
    };

    // Initiates fetching and parsing of all stylesheets
    const processAllStyleLinks = () => {
        const allLinkElements = document.head.querySelectorAll('link[rel="stylesheet"]');
        const contentFetchPromises = [];

        allLinkElements.forEach(linkEl => {
            const linkUrl = linkEl.href;
            const linkMediaAttr = linkEl.media;

            if (linkUrl && !processedSheetUrls.has(linkUrl)) {
                // Handle IE-specific rawCssText
                if (linkEl.styleSheet && linkEl.styleSheet.rawCssText) {
                    ingestStylesheetContent(linkEl.styleSheet.rawCssText, linkUrl, linkMediaAttr);
                    processedSheetUrls.add(linkUrl);
                }
                // Handle external stylesheets (same-origin or relative)
                else if (!/^([a-zA-Z:]*\/\/)/.test(linkUrl) || linkUrl.replace(RegExp.$1, "").split("/")[0] === scope.location.host) {
                    contentFetchPromises.push(
                        retrieveContent(linkUrl)
                            .then(cssContent => {
                                ingestStylesheetContent(cssContent, linkUrl, linkMediaAttr);
                                processedSheetUrls.add(linkUrl);
                            })
                            .catch(error => console.warn(`Stylesheet failed to load: ${linkUrl}`, error))
                    );
                }
            }
        });

        // After all CSS content is fetched and parsed, evaluate and inject styles
        Promise.all(contentFetchPromises).then(() => evaluateAndInjectStyles());
    };

    // Main function to evaluate conditions and inject/update styles
    const evaluateAndInjectStyles = (triggeredByResize = false) => {
        const now = Date.now();
        if (triggeredByResize && now - lastEvaluationTime < resizeDelayMs) {
            clearTimeout(deferredEvaluationTimer);
            deferredEvaluationTimer = setTimeout(() => evaluateAndInjectStyles(true), resizeDelayMs);
            return;
        }
        lastEvaluationTime = now;

        const currentEmInPx = calculateEmUnit();
        let currentMatchClassIndex = 0;
        const collectedCssByMediaType = new Map(); // Map<mediaType, Array<string>> for CSS to be injected

        // Iterate through all defined queries
        queryDefinitions.forEach(queryData => {
            const affectedElements = document.querySelectorAll(queryData.originalSelector);
            const uniqueMatchClass = matchClassPrefix + (currentMatchClassIndex++);
            let anyElementMatched = false;

            affectedElements.forEach(element => {
                // Store original classes if not already cached
                if (!elementsWithOriginalClasses.has(element)) {
                    elementsWithOriginalClasses.set(element, element.className);
                }
                // Reset element's class list to its original state before re-evaluation
                element.className = elementsWithOriginalClasses.get(element);

                const measuredWidth = element.offsetWidth;
                const minPxValue = queryData.minDimension ? queryData.minDimension * (queryData.minUnit === 'em' ? currentEmInPx : 1) : null;
                const maxPxValue = queryData.maxDimension ? queryData.maxDimension * (queryData.maxUnit === 'em' ? currentEmInPx : 1) : null;

                const minConditionSatisfied = minPxValue === null || measuredWidth >= minPxValue;
                const maxConditionSatisfied = maxPxValue === null || measuredWidth <= maxPxValue;

                // Check if element width matches query conditions
                if (!queryData.hasExplicitQuery || (minConditionSatisfied && maxConditionSatisfied)) {
                    classUtil.add(element, uniqueMatchClass);
                    anyElementMatched = true;
                }
            });

            // If any element matched for this query, prepare its CSS for injection
            if (anyElementMatched) {
                const rulesForCurrentMedia = collectedCssByMediaType.get(queryData.mediaType) || [];
                const modifiedRuleText = cachedCssText[queryData.ruleTextIndex].replace(new RegExp(queryData.originalSelector, "g"), `.${uniqueMatchClass}`);
                rulesForCurrentMedia.push(modifiedRuleText);
                collectedCssByMediaType.set(queryData.mediaType, rulesForCurrentMedia);
            }
        });

        // Remove previously injected style elements
        activeInjectedStyles.forEach((styleElement) => {
            if (styleElement && styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement);
            }
        });
        activeInjectedStyles.clear();

        // Inject new style elements based on current matches
        const documentHead = document.head;
        const lastLinkInHead = document.querySelector('link:last-of-type');

        collectedCssByMediaType.forEach((cssRulesArray, mediaTypeKey) => {
            const newStyleNode = document.createElement('style');
            newStyleNode.type = 'text/css';
            newStyleNode.media = mediaTypeKey;
            newStyleNode.appendChild(document.createTextNode(cssRulesArray.join('\n')));

            // Insert after the last link element, or at the end of head
            if (lastLinkInHead && lastLinkInHead.nextSibling) {
                 documentHead.insertBefore(newStyleNode, lastLinkInHead.nextSibling);
            } else {
                 documentHead.appendChild(newStyleNode);
            }
            activeInjectedStyles.set(mediaTypeKey, newStyleNode);
        });
    };

    // Expose public API
    queryMaster.refresh = processAllStyleLinks; // Re-scan stylesheets and re-evaluate
    queryMaster.evaluate = evaluateAndInjectStyles; // Only re-evaluate based on existing rules

    // Initial processing upon script load
    processAllStyleLinks();

    // Attach resize event listener
    const handleWindowResizeEvent = () => evaluateAndInjectStyles(true);
    if (scope.addEventListener) {
        scope.addEventListener('resize', handleWindowResizeEvent, false);
    } else if (scope.attachEvent) { // For older IE
        scope.attachEvent('onresize', handleWindowResizeEvent);
    }

})(window);