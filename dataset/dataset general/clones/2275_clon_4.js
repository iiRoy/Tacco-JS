(function(globalScope) {
    'use strict';

    // Utility for finding and extracting details from a subject string (like user agent)
    const locateAndDecipher = (subjectTxt, definitionArray) => {
        let extracted = { entityName: 'unidentified', entityVersion: '0.0', flags: {} };

        for (const def of definitionArray) {
            const matchResult = subjectTxt.match(def.pattern);
            if (matchResult) {
                extracted.entityName = typeof def.nameResolver === 'function' ? def.nameResolver(matchResult) : def.nameResolver || def.label;
                if (def.versionIndex && matchResult[def.versionIndex]) {
                    let ver = matchResult[def.versionIndex];
                    if (typeof def.versionProcessor === 'function') {
                        ver = def.versionProcessor(ver);
                    }
                    extracted.entityVersion = ver;
                }
                Object.assign(extracted.flags, def.attributes);
                break; // Found the first match, exit
            }
        }
        return extracted;
    };

    // --- Operating System Module ---
    const createPlatformAnalyzer = () => {
        const platformDefinitions = [
            {
                label: "iOS",
                pattern: /(iphone|ipod|ipad).*os ([\d_.]+)/i,
                attributes: { isAppleMobile: true, isPortableDevice: true },
                versionIndex: 2,
                nameResolver: (m) => `iOS ${m[1] === 'ipad' ? 'iPad' : 'iPhone/iPod'}`,
                versionProcessor: (v) => v.replace(/_/g, '.')
            },
            {
                label: "Android",
                pattern: /android ([\d.]+)/i,
                attributes: { isAndroid: true, isPortableDevice: true },
                versionIndex: 1,
                nameResolver: 'Android'
            },
            {
                label: "Windows",
                pattern: /(windows nt ([\d.]+|win(dows)?(95|98|me|nt|xp|2000|vista|7|8|10|11|server 2003)))\b/i,
                attributes: { isWindows: true },
                versionIndex: 2,
                nameResolver: (m) => {
                    const verMap = {
                        '5.0': '2000', '5.1': 'XP', '5.2': 'Server 2003', '6.0': 'Vista', '6.1': '7', '6.2': '8', '6.3': '8.1', '10.0': '10/11'
                    };
                    return `Microsoft Windows ${verMap[m[2]] || m[2] || m[4] || ''}`.trim();
                }
            },
            {
                label: "MacOS",
                pattern: /mac os x ([\d_.]+)/i,
                attributes: { isMacOS: true },
                versionIndex: 1,
                nameResolver: 'Apple macOS',
                versionProcessor: (v) => v.replace(/_/g, '.')
            },
            {
                label: "Linux",
                pattern: /(linux|x11)/i,
                attributes: { isLinux: true },
                nameResolver: 'Linux'
            },
            {
                label: "Unix",
                pattern: /unix/i,
                attributes: { isUnix: true },
                nameResolver: 'Unix'
            }
        ];

        const userAgentString = globalScope.navigator.userAgent.toLowerCase();
        const platformData = locateAndDecipher(userAgentString, platformDefinitions);

        return {
            platformName: platformData.entityName,
            platformVersion: platformData.entityVersion,
            ...platformData.flags,
            isWindows: platformData.flags.isWindows || false,
            isMacOS: platformData.flags.isMacOS || false,
            isUnix: platformData.flags.isUnix || false,
            isLinux: platformData.flags.isLinux || false,
            isAndroid: platformData.flags.isAndroid || false,
            isIOS: platformData.flags.isAppleMobile || false,
            isPortable: platformData.flags.isPortableDevice || false,
            isIPhone: platformData.flags.isAppleMobile && userAgentString.includes('iphone') || false,
            isIPad: platformData.flags.isAppleMobile && userAgentString.includes('ipad') || false
        };
    };

    // --- Web Client Module ---
    const createClientIdentifier = () => {
        const clientDefinitions = [
            {
                label: "Edge",
                pattern: /edge\/([\d.]+)/i,
                attributes: { isEdge: true, isChromiumBased: true },
                versionIndex: 1,
                nameResolver: 'Microsoft Edge'
            },
            {
                label: "Chrome",
                pattern: /(chrome|crios)\/([\d.]+)/i,
                attributes: { isChromiumBased: true, isChrome: true },
                versionIndex: 2,
                nameResolver: 'Google Chrome'
            },
            {
                label: "Firefox",
                pattern: /firefox\/([\d.]+)/i,
                attributes: { isFirefox: true },
                versionIndex: 1,
                nameResolver: 'Mozilla Firefox'
            },
            {
                label: "Safari", // Must come after Chrome as Chrome UA contains 'Safari'
                pattern: /version\/([\d.]+).*safari/i,
                attributes: { isWebKitBased: true, isSafari: true },
                versionIndex: 1,
                nameResolver: 'Apple Safari'
            },
            {
                label: "Opera",
                pattern: /(opera|opr)\/([\d.]+)/i,
                attributes: { isOpera: true },
                versionIndex: 2,
                nameResolver: 'Opera'
            },
            {
                label: "IE",
                pattern: /(msie|rv:)\s*([\d.]+)/i, // Handles IE < 11 (MSIE) and IE 11+ (rv:)
                attributes: { isIE: true },
                versionIndex: 2,
                nameResolver: 'Microsoft Internet Explorer'
            }
        ];

        const userAgentString = globalScope.navigator.userAgent.toLowerCase();
        const clientData = locateAndDecipher(userAgentString, clientDefinitions);

        return {
            clientName: clientData.entityName,
            clientVersion: clientData.entityVersion,
            ...clientData.flags,
            isWebKitBased: clientData.flags.isWebKitBased || false,
            isChromiumBased: clientData.flags.isChromiumBased || false,
            isChrome: clientData.flags.isChrome || false,
            isSafari: clientData.flags.isSafari || false,
            isIE: clientData.flags.isIE || false,
            isFirefox: clientData.flags.isFirefox || false,
            isOpera: clientData.flags.isOpera || false
        };
    };

    // --- Responsive Layout Module ---
    const createResponsiveManager = () => {
        let detectedBreakpoints = [];
        let activeBreakpoint = null;
        let animationFrameHandle = null;

        const mediaQueryPattern = /(min|max)-(?:device-)?width:\s*(\d+)px/g;
        const printMediaPattern = /print/i;

        const extractBreakpointDetails = (mediaQueryText) => {
            if (printMediaPattern.test(mediaQueryText)) return null;

            let minVal = 0;
            let maxVal = 'infinite';
            let match;

            while ((match = mediaQueryPattern.exec(mediaQueryText)) !== null) {
                const type = match[1];
                const value = parseInt(match[2], 10);
                if (type === 'min') {
                    minVal = Math.max(minVal, value); // Take the largest min-width if multiple
                } else if (type === 'max') {
                    if (maxVal === 'infinite' || value < maxVal) {
                        maxVal = value; // Take the smallest max-width if multiple
                    }
                }
            }
            if (minVal === 0 && maxVal === 'infinite') return null; // No width-based query found

            return { minDimension: minVal, maxDimension: maxVal, originalQuery: mediaQueryText };
        };

        const collectStyleDefinitions = () => {
            const collectedQueries = new Set();
            for (let i = 0; i < document.styleSheets.length; i++) {
                const sheet = document.styleSheets[i];
                try {
                    // Check top-level sheet media
                    if (sheet.media && sheet.media.mediaText && !printMediaPattern.test(sheet.media.mediaText)) {
                        collectedQueries.add(sheet.media.mediaText);
                    }

                    // Check rules within the stylesheet
                    const rules = sheet.cssRules || sheet.rules;
                    if (rules) {
                        for (let j = 0; j < rules.length; j++) {
                            const rule = rules[j];
                            if (rule.media && rule.media.mediaText && !printMediaPattern.test(rule.media.mediaText)) {
                                collectedQueries.add(rule.media.mediaText);
                            }
                        }
                    }
                } catch (e) {
                    // console.warn('Cannot access stylesheet rules due to CORS or security restrictions:', e);
                }
            }

            const parsed = Array.from(collectedQueries)
                .map(extractBreakpointDetails)
                .filter(Boolean)
                .sort((a, b) => {
                    // Sort by minDimension, then by maxDimension (infinite last)
                    if (a.minDimension !== b.minDimension) return a.minDimension - b.minDimension;
                    if (a.maxDimension === 'infinite' && b.maxDimension !== 'infinite') return 1;
                    if (a.maxDimension !== 'infinite' && b.maxDimension === 'infinite') return -1;
                    if (a.maxDimension !== 'infinite' && b.maxDimension !== 'infinite') return a.maxDimension - b.maxDimension;
                    return 0;
                });

            detectedBreakpoints = parsed;
        };

        const updateActiveState = () => {
            const currentWidth = globalScope.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            let bestMatch = null;

            for (let i = 0; i < detectedBreakpoints.length; i++) {
                const bp = detectedBreakpoints[i];
                const isMinMatch = currentWidth >= bp.minDimension;
                const isMaxMatch = bp.maxDimension === 'infinite' || currentWidth <= bp.maxDimension;

                if (isMinMatch && isMaxMatch) {
                    bestMatch = bp; // Last matching one in sorted array is often the most specific
                }
            }
            activeBreakpoint = bestMatch;
        };

        const scheduleUpdate = () => {
            if (animationFrameHandle !== null) {
                globalScope.cancelAnimationFrame(animationFrameHandle);
            }
            animationFrameHandle = globalScope.requestAnimationFrame(() => {
                updateActiveState();
                animationFrameHandle = null;
            });
        };

        // Initialization
        collectStyleDefinitions();
        updateActiveState();

        // Event listener setup
        if (globalScope.addEventListener) {
            globalScope.addEventListener('resize', scheduleUpdate, true);
        } else if (globalScope.attachEvent) { // For older IE
            globalScope.attachEvent('onresize', scheduleUpdate);
        }

        return {
            get currentLayoutDefinition() { return activeBreakpoint; },
            get currentViewportWidth() { return globalScope.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; },
            get allDefinedBreakpoints() { return detectedBreakpoints; }
        };
    };

    // --- Main Application Information Object ---
    const ApplicationInformation = {
        OperatingSystem: createPlatformAnalyzer(),
        WebClient: createClientIdentifier(),
        ResponsiveBreakpoints: createResponsiveManager()
    };

    // Expose the consolidated information object to the global scope
    globalScope.ApplicationInformation = globalScope.ApplicationInformation || ApplicationInformation;

    // --- Clone of the final, incomplete TD.plugin.SUD block ---
    // This part appears to be a placeholder for a UI component or debug info display.
    // We will clone its known logic using the new ApplicationInformation structure.
    (function(appData) {
        function initializeDisplayModule() {
            const displayElementId = 'app_info_display_container'; // Renamed from 'td_plugin_sud_wrapper'
            let existingElement = document.getElementById(displayElementId);

            if (existingElement) {
                return false; // If the element exists, do nothing, similar to original
            }

            // Retrieve data from the new ApplicationInformation object
            const currentLayout = appData.ResponsiveBreakpoints.currentLayoutDefinition;
            const viewportDimension = appData.ResponsiveBreakpoints.currentViewportWidth;

            let minimumDimension = currentLayout ? currentLayout.minDimension : '0';
            let maximumDimension = currentLayout ? currentLayout.maxDimension : 'infinite';

            if (typeof minimumDimension !== "string") {
                minimumDimension += "px"; // Format as in original
            }
            // The original snippet ended here. If more logic were present, it would be cloned similarly.
            // Example of what might follow, to show how it would use the new object:
            /*
            console.log(`Current viewport: ${viewportDimension}px`);
            console.log(`Active breakpoint: Min ${minimumDimension}, Max ${maximumDimension}`);

            const infoDiv = document.createElement('div');
            infoDiv.id = displayElementId;
            infoDiv.style.position = 'fixed';
            infoDiv.style.bottom = '10px';
            infoDiv.style.left = '10px';
            infoDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
            infoDiv.style.color = 'white';
            infoDiv.style.padding = '5px';
            infoDiv.style.zIndex = '99999';
            infoDiv.textContent = `OS: ${appData.OperatingSystem.platformName} ${appData.OperatingSystem.platformVersion} | Browser: ${appData.WebClient.clientName} ${appData.WebClient.clientVersion} | MQ: ${minimumDimension} - ${maximumDimension} (${viewportDimension}px)`;
            document.body.appendChild(infoDiv);
            */
        }

        // The original `init` was not called. If it were, this is where it would be called.
        // For demonstration, let's call it.
        // initializeDisplayModule(); // This call is commented out to exactly match the original's execution flow.

    }(globalScope.ApplicationInformation));

}(window));