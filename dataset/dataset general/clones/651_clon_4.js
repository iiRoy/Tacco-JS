(function (globalReference, factoryExecution) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factoryExecution();
    } else if (typeof define === "function" && define.amd) {
        define([], factoryExecution);
    } else {
        var currentContext = (typeof window !== "undefined") ? window :
                             (typeof global !== "undefined") ? global :
                             (typeof self !== "undefined") ? self :
                             globalReference;
        currentContext.SocialButton = factoryExecution();
    }
})(this, function () {

    // --- Core Utility Functions (formerly ShareUtils methods) ---

    // Handles DOM element class manipulation, providing a fallback if classList is not available.
    const classProcessor = {
        check: (targetElement, className) => {
            return targetElement.classList ? targetElement.classList.contains(className) : new RegExp('(^|\\s)' + className + '(\\s|$)').test(targetElement.className);
        },
        add: (targetElement, className) => {
            if (targetElement.classList) {
                targetElement.classList.add(className);
            } else if (!classProcessor.check(targetElement, className)) {
                targetElement.className += (targetElement.className ? ' ' : '') + className;
            }
        },
        remove: (targetElement, className) => {
            if (targetElement.classList) {
                targetElement.classList.remove(className);
            } else if (classProcessor.check(targetElement, className)) {
                targetElement.className = targetElement.className.replace(new RegExp('(^|\\s)' + className + '(\\s|$)', 'g'), ' ').trim();
            }
        },
        toggle: (targetElement, className) => {
            if (classProcessor.check(targetElement, className)) {
                classProcessor.remove(targetElement, className);
                return false;
            } else {
                classProcessor.add(targetElement, className);
                return true;
            }
        }
    };

    // Provides RFC 3986 encoding and checks if a string is already encoded.
    const stringTransformer = {
        encodeRfc3986: (inputString) => {
            if (typeof inputString !== 'string') return inputString;
            const encoded = encodeURIComponent(inputString);
            return encoded.replace(/[!'()*]/g, char => '%' + char.charCodeAt(0).toString(16).toUpperCase());
        },
        isAlreadyEncoded: (inputString) => {
            if (typeof inputString !== 'string') return false;
            try {
                return decodeURIComponent(inputString) !== inputString;
            } catch (e) {
                return true; // Malformed URI, likely means it was intended to be encoded
            }
        },
        safeEncode: (value) => {
            return stringTransformer.isAlreadyEncoded(value) ? value : stringTransformer.encodeRfc3986(value);
        }
    };

    // Deeply merges properties from a source object into a destination object.
    const objectMerger = (destination, source, overwrite = false) => {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) &&
                    typeof destination[key] === 'object' && destination[key] !== null && !Array.isArray(destination[key])) {
                    objectMerger(destination[key], source[key], overwrite);
                } else {
                    if (overwrite || !Object.prototype.hasOwnProperty.call(destination, key)) {
                        destination[key] = source[key];
                    }
                }
            }
        }
        return destination;
    };

    // Manages the display style of a DOM element.
    const elementDisplayManager = {
        conceal: (element) => { element.style.display = "none"; },
        reveal: (element) => { element.style.display = "block"; }
    };

    // Opens a new browser popup window with specified URL and parameters.
    const popupHandler = (targetUrl, parameters = {}) => {
        const dimensions = { width: 500, height: 350 };
        dimensions.topOffset = (window.screen.height / 2) - (dimensions.height / 2);
        dimensions.leftOffset = (window.screen.width / 2) - (dimensions.width / 2);

        const queryParts = Object.entries(parameters).map(([key, value]) => {
            return `${key}=${stringTransformer.safeEncode(value)}`;
        });
        const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';

        const windowFeatures = [
            'toolbar=no', 'location=no', 'status=no', 'menubar=no', 'scrollbars=yes', 'resizable=yes',
            `left=${dimensions.leftOffset}`,
            `top=${dimensions.topOffset}`,
            `width=${dimensions.width}`,
            `height=${dimensions.height}`
        ].join(',');

        return window.open(targetUrl + queryString, 'shareWindow', windowFeatures);
    };

    // --- CSS Rules Generator (replaces getStyles function) ---
    // Takes component settings and generates a CSS string.
    const buildStyleSheetContent = (settings) => {
        const baseSelector = settings.elementPrefix;
        const rules = [];

        const addRuleBlock = (selectorSuffix, declarations) => {
            let declarationString = Object.entries(declarations)
                .map(([prop, val]) => `${prop}:${val}`)
                .join(";");
            rules.push(`${baseSelector}${selectorSuffix}{${declarationString}}`);
        };

        addRuleBlock(" .social.bottom," + baseSelector + " .social.top", { "-webkit-transform-origin": "0 0", "-moz-transform-origin": "0 0", "-o-transform-origin": "0 0" });
        addRuleBlock("", { "width": "92px", "height": "20px", "-webkit-touch-callout": "none", "-webkit-user-select": "none", "-moz-user-select": "none", "-ms-user-select": "none", "user-select": "none" });
        addRuleBlock(" [class*=entypo-]:before", { "font-family": "entypo,sans-serif" });
        addRuleBlock(" label", { "font-size": "16px", "cursor": "pointer", "margin": "0", "padding": "5px 10px", "border-radius": "5px", "background": "#a29baa", "color": "#333", "transition": "all .3s ease" });
        addRuleBlock(" label:hover", { "opacity": ".8" });
        addRuleBlock(" label span", { "text-transform": "uppercase", "font-size": ".9em", "font-family": "Lato,sans-serif", "font-weight": "700", "-webkit-font-smoothing": "antialiased", "padding-left": "6px" });
        addRuleBlock(" .social", { "opacity": "0", "transition": "all .4s ease", "margin-left": "-15px", "visibility": "hidden" });
        addRuleBlock(" .social.top", { "-ms-transform-origin": "0 0", "transform-origin": "0 0", "margin-top": "-80px" });
        addRuleBlock(" .social.bottom", { "-ms-transform-origin": "0 0", "transform-origin": "0 0", "margin-top": "5px" });
        addRuleBlock(" .social.middle.left," + baseSelector + " .social.middle.right", { "-ms-transform-origin": "5% 50%", "transform-origin": "5% 50%", "-webkit-transform-origin": "5% 50%", "-moz-transform-origin": "5% 50%", "-o-transform-origin": "5% 50%" });
        addRuleBlock(" .social.middle", { "margin-top": "-34px" });
        addRuleBlock(" .social.middle.right", { "margin-left": "105px" });
        addRuleBlock(" .social.networks-1.center," + baseSelector + " .social.networks-1.left," + baseSelector + " .social.right", { "margin-left": "14px" });
        addRuleBlock(" .social.load", { "transition": "none!important" });
        addRuleBlock(" .social.networks-1", { "width": "60px" });
        addRuleBlock(" .social.networks-1.middle.left", { "margin-left": "-70px" });
        addRuleBlock(" .social.networks-1 ul", { "width": "60px" });
        addRuleBlock(" .social.networks-2," + baseSelector + " .social.networks-2 ul", { "width": "120px" });
        addRuleBlock(" .social.networks-2.center", { "margin-left": "-13px" });
        addRuleBlock(" .social.networks-2.left", { "margin-left": "-44px" });
        addRuleBlock(" .social.networks-2.middle.left", { "margin-left": "-130px" });
        addRuleBlock(" .social.networks-3," + baseSelector + " .social.networks-3 ul", { "width": "180px" });
        addRuleBlock(" .social.networks-3.center", { "margin-left": "-45px" });
        addRuleBlock(" .social.networks-3.left", { "margin-left": "-102px" });
        addRuleBlock(" .social.networks-3.middle.left", { "margin-left": "-190px" });
        addRuleBlock(" .social.networks-4," + baseSelector + " .social.networks-4 ul", { "width": "240px" });
        addRuleBlock(" .social.networks-4.center", { "margin-left": "-75px" });
        addRuleBlock(" .social.networks-4.left", { "margin-left": "162px" });
        addRuleBlock(" .social.networks-4.middle.left", { "margin-left": "-250px" });
        addRuleBlock(" .social.networks-5," + baseSelector + " .social.networks-5 ul", { "width": "300px" });
        addRuleBlock(" .social.networks-5.center", { "margin-left": "-105px" });
        addRuleBlock(" .social.networks-5.left", { "margin-left": "-225px" });
        addRuleBlock(" .social.networks-5.middle.left", { "margin-left": "-320px" });
        addRuleBlock(" .social.active", { "opacity": "1", "transition": "all .4s ease", "visibility": "visible" });
        addRuleBlock(" .social.active.top", { "-webkit-transform": "scale(1)translateY(-10px)", "-moz-transform": "scale(1)translateY(-10px)", "-o-transform": "scale(1)translateY(-10px)", "-ms-transform": "scale(1)translateY(-10px)", "transform": "scale(1)translateY(-10px)" });
        addRuleBlock(" .social.active.bottom", { "-webkit-transform": "scale(1)translateY(15px)", "-moz-transform": "scale(1)translateY(15px)", "-o-transform": "scale(1)translateY(15px)", "-ms-transform": "scale(1)translateY(15px)", "transform": "scale(1)translateY(15px)" });
        addRuleBlock(" .social.active.middle.right", { "-webkit-transform": "scale(1)translateX(10px)", "-moz-transform": "scale(1)translateX(10px)", "-o-transform": "scale(1)translateX(10px)", "-ms-transform": "scale(1)translateX(10px)", "transform": "scale(1)translateX(10px)" });
        addRuleBlock(" .social.active.middle.left", { "-webkit-transform": "scale(1)translateX(-10px)", "-moz-transform": "scale(1)translateX(-10px)", "-o-transform": "scale(1)translateX(-10px)", "-ms-transform": "scale(1)translateX(-10px)", "transform": "scale(1)translateX(-10px)" });
        addRuleBlock(" .social ul", { "position": "relative", "left": "0", "right": "0", "height": "46px", "color": "#fff", "margin": "auto", "padding": "0", "list-style": "none" });
        addRuleBlock(" .social ul li", { "font-size": "20px", "cursor": "pointer", "width": "60px", "margin": "0", "padding": "12px 0", "text-align": "center", "float": "left", "display": "none", "height": "22px", "position": "relative", "z-index": "2", "-webkit-box-sizing": "content-box", "-moz-box-sizing": "content-box", "box-sizing": "content-box", "transition": "all .3s ease" });
        addRuleBlock(" .social ul li:hover", { "color": "rgba(0,0,0,.5)" });

        // Map network config keys to their corresponding CSS class names.
        const networkClassMap = {
            facebook: "facebook",
            twitter: "twitter",
            google_plus: "gplus",
            pinterest: "pinterest",
            email: "paper-plane"
        };

        const networkColorMap = {
            facebook: "#3b5998",
            twitter: "#6cdfea",
            google_plus: "#e34429",
            pinterest: "#c5282f",
            email: "#42c5b0"
        };

        for (const netKey in networkColorMap) {
            const classIdentifier = networkClassMap[netKey];
            const displayValue = settings.networkSettings[netKey].visibility;
            addRuleBlock(` .social li[class*=${classIdentifier}]`, {
                "background": networkColorMap[netKey],
                "display": displayValue
            });
        }

        return rules.join("");
    };

    // --- Social Button Factory Function (replaces Share class) ---
    const SocialButtonBuilder = (rootQuerySelector, initialOptions) => {
        // Internal configuration state, managed by closure.
        let configuration = {
            activeNetworkCount: 0,
            protocolPrefix: ['http', 'https'].indexOf(window.location.href.split(':')[0]) === -1 ? 'https://' : '//',
            pageUrl: window.location.href,
            shortDescription: null,
            mainTitle: getPageTitle(),
            mainImage: getPageImage(),
            fullDescription: getPageDescription(),
            interfaceOptions: {
                menuPlacement: 'top center',
                buttonLabel: 'Share',
                labelFontEnabled: true,
                iconFontEnabled: true
            },
            networkSettings: {
                google_plus: { // Key matches data-network value
                    active: true,
                    targetUrl: null
                },
                twitter: {
                    active: true,
                    targetUrl: null,
                    tweetText: null
                },
                facebook: {
                    active: true,
                    loadApi: true,
                    targetUrl: null,
                    appIdentifier: null,
                    postTitle: null,
                    postCaption: null,
                    postDescription: null,
                    postImage: null
                },
                pinterest: {
                    active: true,
                    targetUrl: null,
                    pinImage: null,
                    pinDescription: null
                },
                email: { // Key matches data-network value
                    active: true,
                    emailSubject: null,
                    emailBody: null
                }
            }
        };

        // References to common DOM elements.
        const domReferences = {
            headNode: document.getElementsByTagName('head')[0],
            bodyNode: document.getElementsByTagName('body')[0]
        };

        // --- Default Metadata Fetchers (replaces default_title, default_image, default_description) ---
        function getPageTitle() {
            let contentNode;
            if (contentNode = document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="twitter:title"]')) {
                return contentNode.getAttribute('content');
            } else if (contentNode = document.querySelector('title')) {
                return contentNode.innerText;
            }
            return '';
        }

        function getPageImage() {
            let contentNode;
            if (contentNode = document.querySelector('meta[property="og:image"]') || document.querySelector('meta[name="twitter:image"]')) {
                return contentNode.getAttribute('content');
            }
            return null;
        }

        function getPageDescription() {
            let contentNode;
            if (contentNode = document.querySelector('meta[property="og:description"]') || document.querySelector('meta[name="twitter:description"]') || document.querySelector('meta[name="description"]')) {
                return contentNode.getAttribute('content');
            }
            return '';
        }

        // --- Configuration Processing (replaces set_global_configuration, normalize_network_configuration, normalize_filter_config_updates) ---
        const finalizeGlobalConfiguration = () => {
            let visibilityState;
            for (const netKey in configuration.networkSettings) {
                const networkOptions = configuration.networkSettings[netKey];
                for (const optKey in networkOptions) {
                    if (networkOptions[optKey] === null && configuration[optKey] !== undefined) {
                        // Map common global options to network-specific ones if not explicitly set
                        if (optKey === 'pageUrl') networkOptions.targetUrl = configuration.pageUrl;
                        else if (optKey === 'shortDescription' && netKey === 'twitter') networkOptions.tweetText = configuration.shortDescription;
                        else if (optKey === 'mainTitle') {
                            if (netKey === 'facebook') networkOptions.postTitle = configuration.mainTitle;
                            else if (netKey === 'email') networkOptions.emailSubject = configuration.mainTitle;
                        }
                        else if (optKey === 'mainImage') {
                            if (netKey === 'facebook') networkOptions.postImage = configuration.mainImage;
                            else if (netKey === 'pinterest') networkOptions.pinImage = configuration.mainImage;
                        }
                        else if (optKey === 'fullDescription') {
                            if (netKey === 'facebook') networkOptions.postDescription = configuration.fullDescription;
                            else if (netKey === 'pinterest') networkOptions.pinDescription = configuration.fullDescription;
                            else if (netKey === 'email') networkOptions.emailBody = configuration.fullDescription;
                        }
                        else {
                            // Catch-all for other direct property names
                            networkOptions[optKey] = configuration[optKey];
                        }
                    }
                }

                if (networkOptions.active) {
                    visibilityState = 'block';
                    configuration.activeNetworkCount += 1;
                } else {
                    visibilityState = 'none';
                }
                networkOptions.visibility = visibilityState;
            }
        };

        const standardizeNetworkOptions = () => {
            if (!configuration.networkSettings.facebook.appIdentifier) {
                configuration.networkSettings.facebook.loadApi = false;
            }
            if (!stringTransformer.isAlreadyEncoded(configuration.networkSettings.twitter.tweetText)) {
                configuration.networkSettings.twitter.tweetText = encodeURIComponent(configuration.networkSettings.twitter.tweetText);
            }
            if (typeof configuration.networkSettings.facebook.appIdentifier === 'number') {
                configuration.networkSettings.facebook.appIdentifier = configuration.networkSettings.facebook.appIdentifier.toString();
            }
        };

        const filterHookUpdates = (networkIdentifier, proposedChanges) => {
            if (networkIdentifier === 'facebook') {
                if (configuration.networkSettings.facebook.appIdentifier !== proposedChanges.appIdentifier) {
                    console.warn("Facebook appIdentifier cannot be changed after initialization.");
                    delete proposedChanges.appIdentifier;
                }
                if (configuration.networkSettings.facebook.loadApi !== proposedChanges.loadApi) {
                    console.warn("Facebook loadApi option cannot be changed after initialization.");
                    delete proposedChanges.loadApi;
                }
            }
            return proposedChanges;
        };

        // --- DOM Management & Injection (replaces inject_ methods) ---
        const addExternalStylesheet = (linkUrl) => {
            if (!domReferences.headNode.querySelector(`link[href="${linkUrl}"]`)) {
                const linkElement = document.createElement("link");
                linkElement.setAttribute("rel", "stylesheet");
                linkElement.setAttribute("href", linkUrl);
                domReferences.headNode.appendChild(linkElement);
            }
        };

        const embedComponentStyles = (elementInstance) => {
            // Use instance's classes to build a unique selector for dynamic styles
            const instanceClasses = Array.from(elementInstance.classList).filter(c => c !== 'social-button-instance').join(".");
            const instanceSelector = `.${instanceClasses}`;
            // Prevent injecting duplicate styles for the same selector
            if (!domReferences.headNode.querySelector(`meta[name='social-button-styles-${instanceSelector.replace(/[^a-zA-Z0-9]/g, '_')}']`)) {
                const styleConfiguration = { ...configuration, elementPrefix: instanceSelector };
                const cssContent = buildStyleSheetContent(styleConfiguration);
                const styleElement = document.createElement("style");
                styleElement.type = "text/css";
                if (styleElement.styleSheet) { // IE-specific way
                    styleElement.styleSheet.cssText = cssContent;
                } else {
                    styleElement.appendChild(document.createTextNode(cssContent));
                }
                domReferences.headNode.appendChild(styleElement);
                // Mark that styles have been injected for this selector
                const metaTracker = document.createElement("meta");
                metaTracker.setAttribute("name", `social-button-styles-${instanceSelector.replace(/[^a-zA-Z0-9]/g, '_')}`);
                domReferences.headNode.appendChild(metaTracker);
            }
        };

        const insertComponentMarkup = (elementInstance) => {
            // Use a temporary div to parse HTML string then append children
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = `<label class='entypo-export'><span>${configuration.interfaceOptions.buttonLabel}</span></label><div class='social load ${configuration.interfaceOptions.menuPlacement}'><ul><li class='entypo-pinterest' data-network='pinterest'></li><li class='entypo-twitter' data-network='twitter'></li><li class='entypo-facebook' data-network='facebook'></li><li class='entypo-gplus' data-network='google_plus'></li><li class='entypo-paper-plane' data-network='email'></li></ul></div>`;
            while (tempDiv.firstChild) {
                elementInstance.appendChild(tempDiv.firstChild);
            }
        };

        const injectFacebookSdk = () => {
            // Only inject if FB SDK is not already loaded and appIdentifier is provided
            if (!window.FB && configuration.networkSettings.facebook.appIdentifier && !domReferences.bodyNode.querySelector('#fb-root-anchor')) {
                const sdkScript = document.createElement("script");
                // The script content must be exactly as Facebook provides it to initialize correctly
                sdkScript.textContent = `window.fbAsyncInit=function(){FB.init({appId:'${configuration.networkSettings.facebook.appIdentifier}',status:true,xfbml:true})};(function(e,t,n){var r,i=e.getElementsByTagName(t)[0];if(e.getElementById(n)){return}r=e.createElement(t);r.id=n;r.src='${configuration.protocolPrefix}connect.facebook.net/en_US/all.js';i.parentNode.insertBefore(r,i)})(document,'script','fb-root-anchor')`;
                const fbRootElement = document.createElement("div");
                fbRootElement.id = "fb-root-anchor";
                domReferences.bodyNode.appendChild(fbRootElement);
                domReferences.bodyNode.appendChild(sdkScript);
            }
        };

        // --- Event Handling Logic (replaces event_toggle, event_open, event_close, event_network) ---
        const togglePanelState = (panelElement) => {
            if (classProcessor.check(panelElement, "active")) {
                return closePanel(panelElement);
            } else {
                return openPanel(panelElement);
            }
        };

        const openPanel = (panelElement) => {
            if (classProcessor.check(panelElement, "load")) {
                classProcessor.remove(panelElement, "load");
            }
            return classProcessor.add(panelElement, "active");
        };

        const closePanel = (panelElement) => {
            return classProcessor.remove(panelElement, "active");
        };

        const triggerNetworkAction = (instanceElement, networkListItem) => {
            const networkKey = networkListItem.getAttribute("data-network");
            runCustomHook("before", networkKey, instanceElement);
            networkDispatch[networkKey](); // Execute the specific network sharing function
            runCustomHook("after", networkKey, instanceElement);
        };

        // Executes 'before'/'after' hooks defined in network configuration.
        const runCustomHook = (hookType, networkKey, elementContext) => {
            const networkSpecificConfig = configuration.networkSettings[networkKey];
            const hookFunction = networkSpecificConfig[hookType];
            if (typeof hookFunction === "function") {
                let updates = hookFunction.call(networkSpecificConfig, elementContext);
                if (updates !== undefined) {
                    updates = filterHookUpdates(networkKey, updates);
                    objectMerger(networkSpecificConfig, updates, true);
                    standardizeNetworkOptions(); // Re-standardize after potential config updates from hook
                }
            }
        };

        // --- Network Specific Dispatch (replaces network_ methods) ---
        // A lookup table for network sharing functions.
        const networkDispatch = {
            facebook: () => {
                if (configuration.networkSettings.facebook.loadApi) {
                    if (!window.FB) {
                        return console.error("Facebook SDK not found. Check if it loaded correctly.");
                    }
                    return FB.ui({
                        method: 'feed',
                        name: configuration.networkSettings.facebook.postTitle,
                        link: configuration.networkSettings.facebook.targetUrl,
                        picture: configuration.networkSettings.facebook.postImage,
                        caption: configuration.networkSettings.facebook.postCaption,
                        description: configuration.networkSettings.facebook.postDescription
                    });
                } else {
                    return popupHandler('https://www.facebook.com/sharer/sharer.php', {
                        u: configuration.networkSettings.facebook.targetUrl
                    });
                }
            },
            twitter: () => {
                return popupHandler('https://twitter.com/intent/tweet', {
                    text: configuration.networkSettings.twitter.tweetText,
                    url: configuration.networkSettings.twitter.targetUrl
                });
            },
            google_plus: () => { // Key matches data-network value
                return popupHandler('https://plus.google.com/share', {
                    url: configuration.networkSettings.google_plus.targetUrl
                });
            },
            pinterest: () => {
                return popupHandler('https://www.pinterest.com/pin/create/button', {
                    url: configuration.networkSettings.pinterest.targetUrl,
                    media: configuration.networkSettings.pinterest.pinImage,
                    description: configuration.networkSettings.pinterest.pinDescription
                });
            },
            email: () => { // Key matches data-network value
                return popupHandler('mailto:', {
                    subject: configuration.networkSettings.email.emailSubject,
                    body: configuration.networkSettings.email.emailBody
                });
            }
        };

        // --- Component Initialization per Instance (replaces setup_instance) ---
        const setupSingleComponent = (componentElement, componentIndex) => {
            elementDisplayManager.conceal(componentElement);
            classProcessor.add(componentElement, `social-button-instance-${componentIndex}`); // Add unique class for instance
            embedComponentStyles(componentElement); // Inject instance-specific CSS
            insertComponentMarkup(componentElement); // Inject HTML structure
            elementDisplayManager.reveal(componentElement);

            const activationButton = componentElement.querySelector("label");
            const socialFlyoutPanel = componentElement.querySelector(".social");
            const networkActionItems = Array.from(componentElement.querySelectorAll('li[data-network]'));

            classProcessor.add(socialFlyoutPanel, `networks-${configuration.activeNetworkCount}`);

            activationButton.addEventListener("click", () => togglePanelState(socialFlyoutPanel));

            networkActionItems.forEach(item => {
                item.addEventListener("click", () => {
                    triggerNetworkAction(componentElement, item);
                    closePanel(socialFlyoutPanel);
                });
            });
        };

        // --- Main Initialization Process (replaces setup) ---
        const initializeAllComponents = (selector, opts) => {
            objectMerger(configuration, opts, true); // Merge user-provided options
            finalizeGlobalConfiguration(); // Process global config
            standardizeNetworkOptions(); // Normalize network-specific options

            if (configuration.interfaceOptions.iconFontEnabled) {
                addExternalStylesheet("https://www.sharebutton.co/fonts/v2/entypo.min.css");
            }
            if (configuration.interfaceOptions.labelFontEnabled) {
                addExternalStylesheet(`https://fonts.googleapis.com/css?family=Lato:900&text=${configuration.interfaceOptions.buttonLabel}`);
            }
            if (configuration.networkSettings.facebook.active && configuration.networkSettings.facebook.loadApi) {
                injectFacebookSdk();
            }

            const targetDomNodes = document.querySelectorAll(selector);
            Array.from(targetDomNodes).forEach((node, index) => setupSingleComponent(node, index));
        };

        // --- Public API (replaces open, close, toggle, public methods) ---
        const moduleApi = {
            performAction: (actionCommand) => {
                const targetNodes = document.querySelectorAll(rootQuerySelector);
                Array.from(targetNodes).forEach(node => {
                    const socialPanel = node.querySelector(".social");
                    if (actionCommand === "open") {
                        openPanel(socialPanel);
                    } else if (actionCommand === "close") {
                        closePanel(socialPanel);
                    } else if (actionCommand === "toggle") {
                        togglePanelState(socialPanel);
                    }
                });
            },
            openAll: () => moduleApi.performAction("open"),
            closeAll: () => moduleApi.performAction("close"),
            toggleAll: () => moduleApi.performAction("toggle")
        };

        // Run the main initialization when the factory is called.
        initializeAllComponents(rootQuerySelector, initialOptions);

        return moduleApi;
    };

    return SocialButtonBuilder;
});