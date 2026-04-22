(function() {
    let elementInstanceCounter = 0; // Unique ID generator for dynamic content elements
    const elementRegistry = new Map(); // Stores state for observed elements

    // Default configuration for the dynamic content loader
    const defaultSettings = {
        placeholderMarkup: '<div>Loading...</div>',
        intersectionOptions: {
            root: null, // Defaults to the viewport
            rootMargin: '0px',
            threshold: 0.01 // Trigger when 1% of the element is visible
        }
    };

    // Helper for basic logging if debug is enabled
    const logMessage = (targetEl, message, debugFlag) => {
        if (debugFlag) {
            try {
                const identifier = targetEl ? `Element ID: ${targetEl.dataset.contentId || 'N/A'}` : 'Global';
                console.log(`[DynamicContentLoader] ${identifier} - ${message}`);
            } catch (e) {
                // Fallback for environments without console
            }
        }
    };

    // Helper to apply basic fade effect (equivalent to jQuery's slow)
    const applyTransitionEffect = (targetElement, action, callback) => {
        if (action === 'in') {
            targetElement.style.opacity = '0';
            targetElement.style.display = ''; // Make visible but transparent
            let currentOpacity = 0;
            const animateIn = () => {
                currentOpacity += 0.05; // Adjust for desired speed
                if (currentOpacity < 1) {
                    targetElement.style.opacity = currentOpacity.toString();
                    requestAnimationFrame(animateIn);
                } else {
                    targetElement.style.opacity = ''; // Remove inline style
                    if (callback) callback();
                }
            };
            requestAnimationFrame(animateIn);
        } else if (action === 'out') {
            targetElement.style.opacity = '1';
            let currentOpacity = 1;
            const animateOut = () => {
                currentOpacity -= 0.05; // Adjust for desired speed
                if (currentOpacity > 0) {
                    targetElement.style.opacity = currentOpacity.toString();
                    requestAnimationFrame(animateOut);
                } else {
                    targetElement.style.display = 'none';
                    targetElement.style.opacity = ''; // Remove inline style
                    if (callback) callback();
                }
            };
            requestAnimationFrame(animateOut);
        } else {
            if (callback) callback(); // No fade, just call callback
        }
    };

    // Function to retrieve remote content using Fetch API
    const retrieveRemoteContent = async (sourceUrl, contentType, fragmentSelector, debugFlag) => {
        logMessage(null, `Fetching content from: ${sourceUrl} (Type: ${contentType})`, debugFlag);
        try {
            const response = await fetch(sourceUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let rawContent;
            switch (contentType) {
                case 'json':
                    rawContent = await response.json();
                    break;
                case 'script':
                    rawContent = await response.text();
                    break;
                case 'xml':
                    rawContent = await response.text();
                    break;
                case 'html':
                default:
                    rawContent = await response.text();
                    break;
            }

            if (fragmentSelector && contentType === 'html') {
                const temporaryContainer = document.createElement('div');
                temporaryContainer.innerHTML = rawContent;
                const contentFragment = temporaryContainer.querySelector(fragmentSelector);
                return contentFragment ? contentFragment.outerHTML : '';
            }

            return rawContent;

        } catch (error) {
            logMessage(null, `Error retrieving content: ${error.message}`, debugFlag);
            return null;
        }
    };

    // Function to inject loaded content into the target element
    const injectContentIntoTarget = (targetElement, content, action, contentType, instanceId, debugFlag) => {
        logMessage(targetElement, `Injecting content with action: ${action}`, debugFlag);

        const placeholderElement = targetElement.querySelector(`.content-loader-placeholder-${instanceId}`);
        if (placeholderElement) {
            applyTransitionEffect(placeholderElement, 'out', () => {
                placeholderElement.remove();
                performContentInsertion();
            });
        } else {
            performContentInsertion();
        }

        function performContentInsertion() {
            let contentContainer;

            if (contentType === 'image') {
                contentContainer = new Image();
                contentContainer.src = content;
                contentContainer.style.display = 'none';
                contentContainer.classList.add('content-loader-image');
                contentContainer.classList.add(`content-loader-content-${instanceId}`);
                contentContainer.onload = () => {
                    applyContentToDOM(contentContainer);
                    logMessage(targetElement, `Image loaded and displayed.`, debugFlag);
                };
                contentContainer.onerror = () => {
                    logMessage(targetElement, `Failed to load image from ${content}`, debugFlag);
                    targetElement.dataset.contentLoading = 'false';
                    targetElement.dataset.contentLoaded = 'false';
                };
            } else if (contentType === 'script') {
                contentContainer = document.createElement('script');
                contentContainer.textContent = content;
                applyContentToDOM(contentContainer);
            } else {
                contentContainer = document.createElement('div');
                contentContainer.innerHTML = content;
                contentContainer.style.display = 'none';
                contentContainer.classList.add('content-loader-content');
                contentContainer.classList.add(`content-loader-content-${instanceId}`);
                applyContentToDOM(contentContainer);
            }
        }

        function applyContentToDOM(elementToInsert) {
            let effectiveTarget = targetElement;
            let shouldObserveNewElement = false;

            if (action === 'replace') {
                if (targetElement.parentNode) {
                    targetElement.parentNode.replaceChild(elementToInsert, targetElement);
                    effectiveTarget = elementToInsert; // New element becomes the target
                    shouldObserveNewElement = true; // Potentially re-observe if it's dynamic
                }
            } else if (action === 'append') {
                targetElement.appendChild(elementToInsert);
            } else if (action === 'prepend') {
                targetElement.insertBefore(elementToInsert, targetElement.firstChild);
            } else if (action === 'before') {
                if (targetElement.parentNode) {
                    targetElement.parentNode.insertBefore(elementToInsert, targetElement);
                }
            } else if (action === 'after') {
                if (targetElement.parentNode) {
                    targetElement.parentNode.insertBefore(elementToInsert, targetElement.nextSibling);
                }
            } else { // Default to append
                targetElement.appendChild(elementToInsert);
            }

            if (elementToInsert.style.display === 'none') {
                applyTransitionEffect(elementToInsert, 'in', () => {
                    effectiveTarget.dataset.contentLoaded = 'true';
                    effectiveTarget.dataset.contentLoading = 'false';
                    if (shouldObserveNewElement && elementRegistry.has(targetElement)) {
                        const { settings, monitor } = elementRegistry.get(targetElement);
                        elementRegistry.delete(targetElement); // Remove old reference
                        elementRegistry.set(effectiveTarget, { settings, monitor }); // Add new reference
                        monitor.observe(effectiveTarget); // Observe the newly inserted element if it replaced the old one
                    }
                });
            } else {
                effectiveTarget.dataset.contentLoaded = 'true';
                effectiveTarget.dataset.contentLoading = 'false';
                if (shouldObserveNewElement && elementRegistry.has(targetElement)) {
                    const { settings, monitor } = elementRegistry.get(targetElement);
                    elementRegistry.delete(targetElement); // Remove old reference
                    elementRegistry.set(effectiveTarget, { settings, monitor }); // Add new reference
                    monitor.observe(effectiveTarget); // Observe the newly inserted element if it replaced the old one
                }
            }
            logMessage(effectiveTarget, `Content injection complete.`, debugFlag);
        }
    };

    // Main function to process a single dynamic content target element
    const processContentTarget = async (targetElement, config, monitor) => {
        const instanceId = targetElement.dataset.contentId;
        const debugEnabled = targetElement.dataset.contentDebug === 'true';

        if (targetElement.dataset.contentLoading === 'true' || targetElement.dataset.contentLoaded === 'true') {
            logMessage(targetElement, `Already loading or loaded, skipping.`, debugEnabled);
            return;
        }

        targetElement.dataset.contentLoading = 'true';
        logMessage(targetElement, `Initiating content load.`, debugEnabled);

        const placeholder = document.createElement('div');
        placeholder.innerHTML = config.placeholderMarkup;
        placeholder.classList.add('content-loader-placeholder');
        placeholder.classList.add(`content-loader-placeholder-${instanceId}`);
        targetElement.appendChild(placeholder);

        const sourceType = targetElement.dataset.contentType || 'html';
        const sourceAction = targetElement.dataset.contentAction || 'append';
        const sourceUrl = targetElement.dataset.contentSource;
        const inlineContent = targetElement.dataset.contentInlineContent;
        const fragment = targetElement.dataset.contentFragment;
        const isRepeatable = targetElement.dataset.contentRepeat === 'true';

        let fetchedContent = null;

        if (sourceUrl) {
            const url = new URL(sourceUrl, window.location.href);
            url.searchParams.set('loader_cache_bust', Math.round(Math.random() * 1000000).toString());
            fetchedContent = await retrieveRemoteContent(url.toString(), sourceType, fragment, debugEnabled);
        } else if (inlineContent) {
            fetchedContent = inlineContent;
        }

        if (fetchedContent !== null) {
            injectContentIntoTarget(targetElement, fetchedContent, sourceAction, sourceType, instanceId, debugEnabled);
            if (!isRepeatable && sourceAction !== 'replace') {
                monitor.unobserve(targetElement);
                logMessage(targetElement, `Unobserving non-repeatable element.`, debugEnabled);
            }
        } else {
            targetElement.dataset.contentLoading = 'false';
            if (placeholder) placeholder.remove();
        }
    };

    // Function to handle elements that become un-intersecting (e.g., scrolled out of view)
    const handleDisappearance = (targetElement, config, monitor) => {
        const debugEnabled = targetElement.dataset.contentDebug === 'true';
        const removeOnHide = targetElement.dataset.contentRemoveOnHide === 'true';

        if (removeOnHide && targetElement.dataset.contentLoaded === 'true') {
            logMessage(targetElement, `Element scrolled out of view, removing content.`, debugEnabled);
            const instanceId = targetElement.dataset.contentId;
            const contentElements = targetElement.querySelectorAll(`.content-loader-content-${instanceId}`);
            contentElements.forEach(contentEl => {
                applyTransitionEffect(contentEl, 'out', () => contentEl.remove());
            });

            targetElement.dataset.contentLoaded = 'false';
            targetElement.dataset.contentLoading = 'false';
        }
    };

    // IntersectionObserver callback
    const handleVisibilityChange = (entries) => {
        entries.forEach(entry => {
            const targetElement = entry.target;
            const elementConfig = elementRegistry.get(targetElement);
            if (!elementConfig) return;

            const { settings, monitor } = elementConfig;

            if (entry.isIntersecting) {
                processContentTarget(targetElement, settings, monitor);
            } else {
                handleDisappearance(targetElement, settings, monitor);
            }
        });
    };

    // The main entry point for the Type IV clone
    window.initializeDynamicContentLoader = function(containerSelector, userConfiguration = {}) {
        const mergedSettings = { ...defaultSettings, ...userConfiguration };

        const rootElement = containerSelector ? document.querySelector(containerSelector) : document.body;
        if (!rootElement) {
            console.warn(`DynamicContentLoader: Container element not found for selector "${containerSelector}".`);
            return;
        }

        mergedSettings.intersectionOptions.root = (rootElement === document.body || rootElement === document.documentElement) ? null : rootElement;

        const contentVisibilityMonitor = new IntersectionObserver(handleVisibilityChange, mergedSettings.intersectionOptions);

        const dynamicContentTargets = rootElement.querySelectorAll('[data-content-source], [data-content-inline-content], [data-content-type="image"]');

        dynamicContentTargets.forEach(targetElement => {
            if (!targetElement.dataset.contentId) {
                targetElement.dataset.contentId = `dcl-${++elementInstanceCounter}`;
            }
            targetElement.dataset.contentLoading = 'false';
            targetElement.dataset.contentLoaded = 'false';

            elementRegistry.set(targetElement, {
                settings: mergedSettings,
                monitor: contentVisibilityMonitor
            });

            contentVisibilityMonitor.observe(targetElement);
        });
    };

})();