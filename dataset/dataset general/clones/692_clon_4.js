((domManipulator) => {
    const configuration = {
        fixedWidthValue: 'width=980',
        viewportAttributeName: 'content',
        metaSelector: 'meta[name="viewport"]',
        desktopTriggerId: 'view-full',
        mobileToggleContainerClass: 'rwd-display-options',
        mobileToggleId: 'view-responsive',
        mobileToggleContent: 'View Mobile Optimized',
        preferenceStorageKey: 'siteDisplayPreference',
        savedViewportStateKey: 'storedViewportContent'
    };

    const domOperations = {
        obtainElement: (selector) => domManipulator(selector)[0] || document.querySelector(selector),
        verifyElementPresence: (selector) => domManipulator(selector).length > 0 || document.querySelector(selector) !== null,
        setAttributeValue: (element, attribute, value) => {
            if (element && element.setAttribute) element.setAttribute(attribute, value);
            else if (element) domManipulator(element).attr(attribute, value);
        },
        getAttributeValue: (element, attribute) => {
            if (element && element.getAttribute) return element.getAttribute(attribute);
            else if (element) return domManipulator(element).attr(attribute);
            return null;
        },
        appendToParent: (parent, child) => {
            if (parent && parent.appendChild) parent.appendChild(child);
            else if (parent) domManipulator(parent).append(child);
        },
        constructElement: (tag, properties = {}) => {
            const newElement = document.createElement(tag);
            for (const propKey in properties) {
                if (Object.prototype.hasOwnProperty.call(properties, propKey)) {
                    newElement.setAttribute(propKey, properties[propKey]);
                }
            }
            return newElement;
        }
    };

    const persistentStorage = {
        fetch: (key, defaultValue) => {
            if (window.localStorage) {
                try {
                    const retrievedValue = window.localStorage.getItem(key);
                    return retrievedValue !== null ? JSON.parse(retrievedValue) : defaultValue;
                } catch (e) {
                    console.error("Storage read error:", e);
                    return defaultValue;
                }
            }
            return defaultValue;
        },
        store: (key, value) => {
            if (window.localStorage) {
                try {
                    window.localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    console.error("Storage write error:", e);
                    return false;
                }
            }
            return false;
        }
    };

    const currentViewportElement = domOperations.obtainElement(configuration.metaSelector);

    const switchDisplayMechanism = (targetMode) => {
        const isTargetMobile = targetMode === 'mobile';

        if (isTargetMobile) {
            persistentStorage.store(configuration.preferenceStorageKey, 'mobile');
            const storedVp = persistentStorage.fetch(configuration.savedViewportStateKey, 'width=device-width');
            domOperations.setAttributeValue(currentViewportElement, configuration.viewportAttributeName, storedVp);
        } else { // 'desktop' mode
            persistentStorage.store(configuration.preferenceStorageKey, 'desktop');
            persistentStorage.store(configuration.savedViewportStateKey, domOperations.getAttributeValue(currentViewportElement, configuration.viewportAttributeName));
            domOperations.setAttributeValue(currentViewportElement, configuration.viewportAttributeName, configuration.fixedWidthValue);

            const optionsContainer = domOperations.obtainElement(`.${configuration.mobileToggleContainerClass}`);
            if (optionsContainer && !domOperations.verifyElementPresence(`#${configuration.mobileToggleId}`)) {
                const responsiveToggleSpan = domOperations.constructElement('span', { id: configuration.mobileToggleId });
                responsiveToggleSpan.textContent = configuration.mobileToggleContent;
                domOperations.appendToParent(optionsContainer, responsiveToggleSpan);
            }
        }
    };

    const activateDesktopView = () => {
        switchDisplayMechanism('desktop');
    };

    const activateMobileView = (eventObject) => {
        if (eventObject.target && eventObject.target.id === configuration.mobileToggleId) {
            switchDisplayMechanism('mobile');
        }
    };

    const initializePageLayout = () => {
        // Default to 'mobile' if no preference is stored
        const currentLayoutPreference = persistentStorage.fetch(configuration.preferenceStorageKey, 'mobile');

        if (currentLayoutPreference === 'desktop') {
            switchDisplayMechanism('desktop');
        } else {
            // Explicitly set mobile if it's the default or chosen
            switchDisplayMechanism('mobile');
        }

        const desktopActivator = domOperations.obtainElement(`#${configuration.desktopTriggerId}`);
        if (desktopActivator) {
            domManipulator(desktopActivator).on("click", activateDesktopView);
        }

        const mobileOptionsWrapper = domOperations.obtainElement(`.${configuration.mobileToggleContainerClass}`);
        if (mobileOptionsWrapper) {
            domManipulator(mobileOptionsWrapper).on("click", `#${configuration.mobileToggleId}`, activateMobileView);
        }
    };

    domManipulator(document).ready(initializePageLayout);

})(jQuery);