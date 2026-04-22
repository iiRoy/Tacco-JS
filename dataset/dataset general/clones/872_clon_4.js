const applicationFacade = (function() {
    const domManipulator = {
        fetchCollection: (selector, context = document) => Array.from(context.querySelectorAll(selector)),
        createNode: (tag, attrs = {}, children = []) => {
            const el = document.createElement(tag);
            for (const key in attrs) {
                if (key === 'className') {
                    el.className = attrs[key];
                } else if (key === 'textContent') {
                    el.textContent = attrs[key];
                } else if (key === 'htmlContent') {
                    el.innerHTML = attrs[key];
                } else if (key === 'dataset') {
                    for (const dataKey in attrs[key]) {
                        el.dataset[dataKey] = attrs[key][dataKey];
                    }
                } else {
                    el.setAttribute(key, attrs[key]);
                }
            }
            children.forEach(child => {
                if (typeof child === 'string') {
                    el.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    el.appendChild(child);
                }
            });
            return el;
        },
        insertAsSiblingBefore: (newNode, referenceNode) => {
            if (referenceNode && referenceNode.parentNode) {
                referenceNode.parentNode.insertBefore(newNode, referenceNode);
            }
        },
        removeChildren: (element) => {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        },
        attachEvent: (element, eventType, handler) => element.addEventListener(eventType, handler),
        retrieveDataAttribute: (element, key) => element.dataset[key],
        assignDataAttribute: (element, key, value) => { element.dataset[key] = value; },
        toggleVisibility: (element, animated = false) => {
            if (!element) return;

            if (animated) {
                if (element.classList.contains('hidden-animated')) {
                    element.classList.remove('hidden-animated');
                    element.style.maxHeight = element.scrollHeight + 'px';
                    element.style.opacity = '1';
                    element.style.overflow = 'hidden';
                    element.addEventListener('transitionend', function handler() {
                        element.style.maxHeight = '';
                        element.style.overflow = '';
                        element.removeEventListener('transitionend', handler);
                    }, { once: true });
                } else {
                    element.style.maxHeight = element.scrollHeight + 'px';
                    element.style.opacity = '1'; // Ensure opacity is 1 before starting fade out
                    void element.offsetWidth; // Force reflow
                    element.style.maxHeight = '0';
                    element.style.opacity = '0';
                    element.style.overflow = 'hidden';
                    element.addEventListener('transitionend', function handler() {
                        element.classList.add('hidden-animated');
                        element.style.maxHeight = '';
                        element.removeEventListener('transitionend', handler);
                    }, { once: true });
                }
            } else {
                element.style.display = (element.style.display === 'none' || element.classList.contains('hidden-animated')) ? '' : 'none';
                element.classList.remove('hidden-animated');
                element.style.maxHeight = ''; // Clear animated styles
                element.style.opacity = '';
                element.style.overflow = '';
            }
        },
        isLegacyBrowser: () => {
            const ua = navigator.userAgent;
            return ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
        }
    };

    const contentSanitizer = {
        prepareForDisplay: (rawString) => {
            const tempDiv = domManipulator.createNode('div');
            tempDiv.appendChild(document.createTextNode(rawString));
            return tempDiv.innerHTML;
        }
    };

    const editorTransformer = {
        wrapInEditableArea: (containerElement, initialContent, shouldEscape, updateTargetNode = null) => {
            const processedContent = shouldEscape ? contentSanitizer.prepareForDisplay(initialContent) : initialContent;
            domManipulator.removeChildren(containerElement);
            const editorField = domManipulator.createNode('textarea', { textContent: processedContent });
            
            const adjustHeight = (textarea) => {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            };

            domManipulator.attachEvent(editorField, 'input', (evt) => adjustHeight(evt.target));
            domManipulator.attachEvent(editorField, 'change', (evt) => {
                const updatedContent = evt.target.value;
                if (updateTargetNode) {
                    try {
                        const referenceElement = domManipulator.retrieveDataAttribute(evt.target, 'bound-element-reference');
                        const tempContainer = domManipulator.createNode('div', { htmlContent: updatedContent });
                        const newElement = tempContainer.firstElementChild;
                        if (newElement && referenceElement && referenceElement.parentNode) {
                            referenceElement.parentNode.replaceChild(newElement, referenceElement);
                            domManipulator.assignDataAttribute(evt.target, 'bound-element-reference', newElement);
                        } else {
                            console.warn('Cannot update HTML. Original target or new element missing.');
                        }
                    } catch (e) {
                        console.error('Failure during HTML content update:', e);
                    }
                } else {
                    try {
                        eval(updatedContent);
                    } catch (e) {
                        console.error('Failure during JavaScript execution:', e);
                    }
                }
            });
            containerElement.appendChild(editorField);
            editorField.style.width = '100%';
            adjustHeight(editorField);
            if (updateTargetNode) {
                domManipulator.assignDataAttribute(editorField, 'bound-element-reference', updateTargetNode);
            }
        }
    };

    const componentAssembler = {
        createToggleActivationLink: (label, cssClass, targetContainer, useSlideEffect) => {
            const linkAnchor = domManipulator.createNode('a', { href: '#', textContent: label });
            const wrapperDiv = domManipulator.createNode('div', { className: cssClass }, [linkAnchor]);
            domManipulator.attachEvent(wrapperDiv, 'click', (evt) => {
                evt.preventDefault();
                domManipulator.toggleVisibility(targetContainer, useSlideEffect);
            });
            return wrapperDiv;
        },

        processDemonstrationUnit: (unitElement) => {
            const useInstantToggle = domManipulator.isLegacyBrowser();

            const htmlTargets = domManipulator.fetchCollection('.target, .alt-target', unitElement);
            let combinedHtmlContent = '';
            let primaryTargetElement = null;
            if (htmlTargets.length > 0) {
                primaryTargetElement = htmlTargets[0];
                const temporaryHolder = domManipulator.createNode('div');
                htmlTargets.forEach(target => {
                    temporaryHolder.appendChild(target.cloneNode(true));
                });
                combinedHtmlContent = temporaryHolder.innerHTML;
            }

            const htmlDisplayContainer = domManipulator.createNode('div', { className: 'html-source' });
            editorTransformer.wrapInEditableArea(htmlDisplayContainer, combinedHtmlContent, true, primaryTargetElement);
            htmlDisplayContainer.classList.add('hidden-animated'); // Initially hidden with animation class

            const htmlControlLink = componentAssembler.createToggleActivationLink('html', 'html-link', htmlDisplayContainer, !useInstantToggle);

            const styleSheets = domManipulator.fetchCollection('style', unitElement);
            let cssDisplayContainer = null;
            let cssControlLink = null;
            if (styleSheets.length > 0) {
                const cssContent = styleSheets.map(s => s.textContent).join('\n');
                cssDisplayContainer = domManipulator.createNode('div', { className: 'css-source' });
                editorTransformer.wrapInEditableArea(cssDisplayContainer, cssContent, false);
                cssDisplayContainer.classList.add('hidden-animated'); // Initially hidden with animation class
                cssControlLink = componentAssembler.createToggleActivationLink('css', 'css-link', cssDisplayContainer, !useInstantToggle);
            }

            const jsExecutionBlock = domManipulator.fetchCollection('.js', unitElement)[0];
            if (!jsExecutionBlock) return;

            const jsContent = jsExecutionBlock.textContent;
            try {
                eval(jsContent);
            } catch (e) {
                console.error('Error during initial JavaScript execution:', e);
            }

            editorTransformer.wrapInEditableArea(jsExecutionBlock, jsContent, true);
            jsExecutionBlock.classList.add('hidden-animated'); // Initially hidden with animation class

            const jsControlLink = componentAssembler.createToggleActivationLink('javascript', 'html-link', jsExecutionBlock, !useInstantToggle);

            domManipulator.insertAsSiblingBefore(htmlControlLink, jsExecutionBlock);
            domManipulator.insertAsSiblingBefore(htmlDisplayContainer, jsExecutionBlock);

            if (cssDisplayContainer && cssControlLink) {
                domManipulator.insertAsSiblingBefore(cssControlLink, jsExecutionBlock);
                domManipulator.insertAsSiblingBefore(cssDisplayContainer, jsExecutionBlock);
            }

            domManipulator.insertAsSiblingBefore(jsControlLink, jsExecutionBlock);

            const tooltipService = {
                addHint: (element, message) => {
                    let hintElement = null;
                    const showHint = () => {
                        if (hintElement) return;
                        hintElement = domManipulator.createNode('div', {
                            className: 'custom-live-code-hint',
                            textContent: message
                        });
                        document.body.appendChild(hintElement);

                        const rect = element.getBoundingClientRect();
                        Object.assign(hintElement.style, {
                            top: `${rect.top + window.scrollY}px`,
                            left: `${rect.right + window.scrollX + 10}px`,
                            opacity: '1'
                        });
                    };

                    const hideHint = () => {
                        if (hintElement) {
                            hintElement.style.opacity = '0';
                            hintElement.addEventListener('transitionend', () => {
                                if (hintElement && hintElement.parentNode) {
                                    hintElement.parentNode.removeChild(hintElement);
                                }
                                hintElement = null;
                            }, { once: true });
                        }
                    };

                    domManipulator.attachEvent(element, 'focus', showHint);
                    domManipulator.attachEvent(element, 'blur', hideHint);
                }
            };

            const hintText = 'This is live code. Feel free to edit and try out new options. Click (or tab) out of the textarea to see the results of your edits. If things go awry, reload the page.';

            domManipulator.fetchCollection('.js textarea', unitElement).forEach(ta => tooltipService.addHint(ta, hintText));
            domManipulator.fetchCollection('.html-source textarea', unitElement).forEach(ta => tooltipService.addHint(ta, hintText));
        }
    };

    const applicationInitializer = () => {
        domManipulator.fetchCollection('div.example').forEach(componentAssembler.processDemonstrationUnit);
    };

    const styleInjector = {
        insertCoreStyles: () => {
            const styleNode = domManipulator.createNode('style', {
                textContent: `
                    .hidden-animated {
                        display: none !important;
                    }
                    .html-source, .css-source, .js {
                        transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
                        max-height: 0;
                        opacity: 0;
                        overflow: hidden;
                    }
                    .custom-live-code-hint {
                        position: absolute;
                        background-color: #333;
                        color: white;
                        padding: 5px 10px;
                        border-radius: 3px;
                        font-size: 11px;
                        z-index: 1000;
                        pointer-events: none;
                        opacity: 0;
                        transition: opacity 0.2s ease-in-out;
                        white-space: nowrap;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    }
                    .html-source textarea, .css-source textarea, .js textarea {
                        box-sizing: border-box;
                        padding: 8px;
                        border: 1px solid #ccc;
                        font-family: monospace;
                        resize: vertical;
                    }
                    .html-link a, .css-link a {
                        text-decoration: none;
                        color: #007bff;
                    }
                    .html-link a:hover, .css-link a:hover {
                        text-decoration: underline;
                    }
                `
            });
            document.head.appendChild(styleNode);
        }
    };

    domManipulator.attachEvent(document, 'DOMContentLoaded', styleInjector.insertCoreStyles);
    domManipulator.attachEvent(document, 'DOMContentLoaded', applicationInitializer);

    return {
        activate: applicationInitializer
    };
})();