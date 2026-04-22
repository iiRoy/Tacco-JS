((globalWindow, nativeQuerySupport) => {
    globalWindow.mediaQueryPolyfill = {};
    globalWindow.mediaQueryPolyfill.refreshStyles = () => {};
    globalWindow.mediaQueryPolyfill.nativeSupport = nativeQuerySupport;

    if (nativeQuerySupport) {
        return;
    }

    const currentDocument = globalWindow.document;
    const documentRoot = currentDocument.documentElement;
    const styleDefinitions = [];
    const cssContentSegments = [];
    const activeStyleElements = new Set();
    const processedUrls = new Set();
    const resizeDebounceDuration = 30;
    const documentHead = currentDocument.getElementsByTagName("head")[0] || documentRoot;
    const allStyleLinks = documentHead.getElementsByTagName("link");
    const discoveryQueue = [];

    const createXhrInstance = () => {
        let instance = null;
        const potentialConstructors = [
            () => new XMLHttpRequest(),
            () => new ActiveXObject("Msxml2.XMLHTTP"),
            () => new ActiveXObject("Microsoft.XMLHTTP")
        ];
        for (const ctor of potentialConstructors) {
            try {
                instance = ctor();
                break;
            } catch (e) { /* ignore */ }
        }
        return instance;
    };

    const fetchResource = (resourceURL) => {
        return new Promise((resolve, reject) => {
            const xhrClient = createXhrInstance();
            if (!xhrClient) {
                return reject(new Error("XHR client unavailable."));
            }
            xhrClient.open("GET", resourceURL, true);
            xhrClient.onreadystatechange = () => {
                if (xhrClient.readyState === 4) {
                    if ((xhrClient.status >= 200 && xhrClient.status < 300) || xhrClient.status === 304) {
                        resolve(xhrClient.responseText);
                    } else {
                        reject(new Error(`Fetch error for ${resourceURL}: ${xhrClient.status}`));
                    }
                }
            };
            xhrClient.send();
        });
    };

    const resolveRelativePaths = (cssText, baseUrl) => {
        const baseDir = baseUrl.substring(0, baseUrl.lastIndexOf("/"));
        const finalBase = baseDir.length ? `${baseDir}/` : "";
        return cssText.replace(/(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g, `$1${finalBase}$2$3`);
    };

    const interpretCssText = (sourceContent, sourceUrl, linkMediaAttribute) => {
        const mediaBlockPattern = /@media ([^\{]+)\{([\S\s]+?)(?=\}\/\*\/mediaquery\*\/)/gmi;
        const mediaBlocks = sourceContent.match(mediaBlockPattern);
        const blockCount = (mediaBlocks && mediaBlocks.length) || 0;
        const useLinkMedia = !blockCount && linkMediaAttribute;

        const parseQueryString = (queryString) => {
            const mediaTypeMatch = queryString.match(/(only\s+)?([a-zA-Z]+)(\sand)?/);
            const minWidthMatch = queryString.match(/\(min\-width:\s?(\s?[0-9]+)px\s?\)/);
            const maxWidthMatch = queryString.match(/\(max\-width:\s?(\s?[0-9]+)px\s?\)/);

            return {
                type: mediaTypeMatch ? mediaTypeMatch[2] : null,
                min: minWidthMatch ? parseFloat(minWidthMatch[1]) : null,
                max: maxWidthMatch ? parseFloat(maxWidthMatch[1]) : null
            };
        };

        if (useLinkMedia) {
            cssContentSegments.push(resolveRelativePaths(sourceContent, sourceUrl));
            const parsedConditions = parseQueryString(linkMediaAttribute);
            styleDefinitions.push({
                mediaCondition: linkMediaAttribute,
                ruleIndex: cssContentSegments.length - 1,
                minDeviceWidth: parsedConditions.min,
                maxDeviceWidth: parsedConditions.max,
                mediaType: parsedConditions.type
            });
        } else if (mediaBlocks) {
            for (const blockString of mediaBlocks) {
                const innerBlockMatch = blockString.match(/@media ([^\{]+)\{([\S\s]+?)$/);
                if (innerBlockMatch) {
                    const queryPart = innerBlockMatch[1];
                    const contentPart = innerBlockMatch[2];
                    
                    cssContentSegments.push(resolveRelativePaths(contentPart, sourceUrl));
                    
                    const individualQueries = queryPart.split(",");
                    for (const singleQuery of individualQueries) {
                        const singleParsedConditions = parseQueryString(singleQuery.trim());
                        styleDefinitions.push({
                            mediaCondition: singleQuery.trim(),
                            ruleIndex: cssContentSegments.length - 1,
                            minDeviceWidth: singleParsedConditions.min,
                            maxDeviceWidth: singleParsedConditions.max,
                            mediaType: singleParsedConditions.type
                        });
                    }
                }
            }
        }
    };

    const processRequestQueue = () => {
        if (discoveryQueue.length === 0) {
            evaluateAndApplyStyles();
            return Promise.resolve();
        }

        const nextRequest = discoveryQueue.shift();
        return fetchResource(nextRequest.url)
            .then(cssContent => {
                interpretCssText(cssContent, nextRequest.url, nextRequest.mediaCondition);
                processedUrls.add(nextRequest.url);
                return processRequestQueue();
            })
            .catch(() => {
                processedUrls.add(nextRequest.url);
                return processRequestQueue();
            });
    };

    const commenceDiscovery = () => {
        Array.from(allStyleLinks).forEach(linkElement => {
            const linkHref = linkElement.href;
            const linkMedia = linkElement.media;
            const isStylesheet = linkElement.rel && linkElement.rel.toLowerCase() === "stylesheet";

            if (linkHref && isStylesheet && !processedUrls.has(linkHref)) {
                const absoluteUrlPattern = /^([a-zA-Z]+?:(?:\/\/)?(?:www\.)?)/i;
                const isAbsoluteUrl = absoluteUrlPattern.test(linkHref);
                
                let shouldProcess = false;
                if (!isAbsoluteUrl) {
                    shouldProcess = true;
                } else {
                    const hostPart = linkHref.replace(absoluteUrlPattern, "").split("/")[0];
                    if (hostPart === globalWindow.location.host) {
                        shouldProcess = true;
                    }
                }

                if (shouldProcess) {
                    discoveryQueue.push({ url: linkHref, mediaCondition: linkMedia });
                } else {
                    processedUrls.add(linkHref);
                }
            }
        });
        processRequestQueue();
    };

    let lastExecutionTime;
    let debouncedTimer;

    const evaluateAndApplyStyles = (fromResizeEvent = false) => {
        const viewportDimensionName = "clientWidth";
        const currentViewportWidth = documentRoot[viewportDimensionName] || currentDocument.body[viewportDimensionName] || documentRoot[viewportDimensionName];
        const nowMoment = new Date().getTime();

        if (fromResizeEvent && lastExecutionTime && (nowMoment - lastExecutionTime < resizeDebounceDuration)) {
            clearTimeout(debouncedTimer);
            debouncedTimer = setTimeout(evaluateAndApplyStyles, resizeDebounceDuration);
            return;
        }
        lastExecutionTime = nowMoment;

        const activeCssBlocks = {};
        const fragmentContainer = currentDocument.createDocumentFragment();
        const lastKnownLink = allStyleLinks[allStyleLinks.length - 1];

        for (const definition of styleDefinitions) {
            const { minDeviceWidth, maxDeviceWidth, mediaType, ruleIndex } = definition;
            const isActive = (!minDeviceWidth && !maxDeviceWidth) ||
                             (minDeviceWidth === null || currentViewportWidth >= minDeviceWidth) &&
                             (maxDeviceWidth === null || currentViewportWidth <= maxDeviceWidth);

            if (isActive) {
                const targetMedia = mediaType || "all";
                if (!activeCssBlocks[targetMedia]) {
                    activeCssBlocks[targetMedia] = [];
                }
                activeCssBlocks[targetMedia].push(cssContentSegments[ruleIndex]);
            }
        }

        activeStyleElements.forEach(element => {
            if (element && element.parentNode === documentHead) {
                documentHead.removeChild(element);
            }
        });
        activeStyleElements.clear();

        for (const mediaTypeName in activeCssBlocks) {
            if (Object.prototype.hasOwnProperty.call(activeCssBlocks, mediaTypeName)) {
                const combinedCss = activeCssBlocks[mediaTypeName].join("\n");
                const newStyleElement = currentDocument.createElement("style");
                newStyleElement.type = "text/css";
                newStyleElement.media = mediaTypeName;

                if (newStyleElement.styleSheet) {
                    newStyleElement.styleSheet.cssText = combinedCss;
                } else {
                    newStyleElement.appendChild(currentDocument.createTextNode(combinedCss));
                }
                fragmentContainer.appendChild(newStyleElement);
                activeStyleElements.add(newStyleElement);
            }
        }

        documentHead.insertBefore(fragmentContainer, lastKnownLink ? lastKnownLink.nextSibling : null);
    };

    commenceDiscovery();

    globalWindow.mediaQueryPolyfill.refreshStyles = commenceDiscovery;

    const handleViewportChange = () => {
        evaluateAndApplyStyles(true);
    };

    if (globalWindow.addEventListener) {
        globalWindow.addEventListener("resize", handleViewportChange, false);
    } else if (globalWindow.attachEvent) {
        globalWindow.attachEvent("onresize", handleViewportChange);
    }

})(
    this,
    ((environmentWindow) => {
        if (environmentWindow.matchMedia) {
            return true;
        }

        let detectionResult;
        const currentDocument = environmentWindow.document;
        const documentRoot = currentDocument.documentElement;
        const insertionPoint = documentRoot.firstElementChild || documentRoot.firstChild;
        const temporaryBody = currentDocument.createElement("body");
        const testDiv = currentDocument.createElement("div");
        const queryQualifier = "only all";

        testDiv.id = "mq-detection-element";
        testDiv.style.cssText = "position:absolute;top:-999em;left:-999em;width:10px;";
        temporaryBody.appendChild(testDiv);

        testDiv.innerHTML = `_<style media="${queryQualifier}"> #mq-detection-element { width: 99px; }</style>`;
        documentRoot.insertBefore(temporaryBody, insertionPoint);
        testDiv.removeChild(testDiv.firstChild);

        detectionResult = testDiv.offsetWidth === 99;
        documentRoot.removeChild(temporaryBody);
        return detectionResult;
    })(this)
);