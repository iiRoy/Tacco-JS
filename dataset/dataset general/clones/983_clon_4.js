const UniversalUtilities = (() => {
    const BLANK_LINK_HREF = 'javascript:void(0);';
    const ROOT_DOCUMENT = document;
    const INVISIBLE_SPACE_CHAR = '\u200B';

    const createGenericButton = (textLabel, classNames = [], attributes = {}) => {
        const btn = ROOT_DOCUMENT.createElement('button');
        btn.type = 'button';
        btn.textContent = textLabel;
        btn.classList.add('action-btn', ...classNames);
        for (const [key, value] of Object.entries(attributes)) {
            btn.setAttribute(key, value);
        }
        return btn;
    };

    const directElementFocus = (containerElementId) => {
        const container = ROOT_DOCUMENT.getElementById(containerElementId);
        if (container) {
            const firstInput = container.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        }
    };

    const buildLoadingIndicator = () => {
        const indicatorWrapper = ROOT_DOCUMENT.createElement('div');
        indicatorWrapper.className = 'loading-overlay-indicator';
        indicatorWrapper.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
        return indicatorWrapper;
    };

    const dismissLoadingIndicator = (parentElement) => {
        const indicator = parentElement.querySelector('.loading-overlay-indicator');
        if (indicator) {
            indicator.remove();
        }
    };

    return {
        BLANK_LINK_HREF,
        ROOT_DOCUMENT,
        INVISIBLE_SPACE_CHAR,
        createGenericButton,
        directElementFocus,
        buildLoadingIndicator,
        dismissLoadingIndicator
    };
})();

const OverlayManager = (() => {
    const { ROOT_DOCUMENT, createGenericButton, directElementFocus, buildLoadingIndicator, dismissLoadingIndicator } = UniversalUtilities;

    const activeOverlayRegistry = new Map();

    const constructBaseOverlayElement = () => {
        const overlay = ROOT_DOCUMENT.createElement('div');
        overlay.className = 'visual-overlay fade';
        overlay.setAttribute('tabindex', '-1');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-hidden', 'true');

        const dialogWrapper = ROOT_DOCUMENT.createElement('div');
        dialogWrapper.className = 'visual-overlay-dialog';

        const contentContainer = ROOT_DOCUMENT.createElement('div');
        contentContainer.className = 'visual-overlay-content';

        const headerSection = ROOT_DOCUMENT.createElement('div');
        headerSection.className = 'visual-overlay-header';

        const bodySection = ROOT_DOCUMENT.createElement('div');
        bodySection.className = 'visual-overlay-body';

        const footerSection = ROOT_DOCUMENT.createElement('div');
        footerSection.className = 'visual-overlay-footer';

        const closeButton = createGenericButton('&times;', ['overlay-close'], { 'data-bs-dismiss': 'visual-overlay', 'aria-hidden': 'true' });
        closeButton.innerHTML = '&times;';

        const mainTitle = ROOT_DOCUMENT.createElement('h1');

        const cancelButton = createGenericButton('Dismiss', ['cancel-action', 'secondary-btn'], { 'data-bs-dismiss': 'visual-overlay' });
        const confirmButton = createGenericButton('Confirm', ['confirm-action', 'primary-btn'], { 'data-bs-dismiss': 'visual-overlay' });

        headerSection.append(closeButton, mainTitle);
        footerSection.append(cancelButton, confirmButton);
        contentContainer.append(headerSection, bodySection, footerSection);
        dialogWrapper.append(contentContainer);
        overlay.append(dialogWrapper);

        return overlay;
    };

    const presentOverlay = (settings) => {
        const overlayIdentifier = settings.identifierKey;
        let currentOverlayElement = activeOverlayRegistry.get(overlayIdentifier);

        if (!currentOverlayElement) {
            currentOverlayElement = constructBaseOverlayElement();
            currentOverlayElement.id = overlayIdentifier;

            if (settings.customClassModifier) {
                currentOverlayElement.querySelector('.visual-overlay-dialog').classList.add(settings.customClassModifier);
            }

            if (!settings.isFixedContent) {
                currentOverlayElement.append(buildLoadingIndicator());
                ROOT_DOCUMENT.body.append(currentOverlayElement); // Append first so Bootstrap can find it
                
                fetch(settings.remoteSourceURL)
                    .then(response => response.text())
                    .then(htmlContent => {
                        currentOverlayElement.querySelector('.visual-overlay-body').innerHTML = htmlContent;
                        $(currentOverlayElement).modal('show');
                    })
                    .catch(error => {
                        console.error('Failed to load remote overlay content:', error);
                        currentOverlayElement.querySelector('.visual-overlay-body').innerHTML = '<p class="text-danger">Failed to load content.</p>';
                        $(currentOverlayElement).modal('show');
                    });
            } else {
                currentOverlayElement.querySelector('.visual-overlay-content').innerHTML = settings.staticContentHtml;
                ROOT_DOCUMENT.body.append(currentOverlayElement);
                $(currentOverlayElement).modal('show');
            }

            $(currentOverlayElement).on('shown.bs.modal', (event) => {
                directElementFocus(overlayIdentifier);

                if (settings.onDisplayCallbackOnce && !currentOverlayElement.dataset.displayInitiated) {
                    settings.onDisplayCallbackOnce(settings.onDisplayArgsOnce);
                    currentOverlayElement.dataset.displayInitiated = 'true';
                }
                if (settings.onDisplayCallback) {
                    settings.onDisplayCallback(settings.onDisplayArgs);
                }
                if (!settings.isFixedContent) {
                    dismissLoadingIndicator(currentOverlayElement);
                }
            });

            activeOverlayRegistry.set(overlayIdentifier, currentOverlayElement);
        } else {
            $(currentOverlayElement).modal('show');
        }
    };

    const setupExistingModalAutofocus = () => {
        $(ROOT_DOCUMENT).on('shown.bs.modal', '.modal:not(.noautofocus)', function(e){
            directElementFocus($(this).attr('id'));
        });
    };

    $(() => setupExistingModalAutofocus());

    return {
        presentOverlay
    };
})();

const HtmlContentProcessor = (() => {
    const { ROOT_DOCUMENT, INVISIBLE_SPACE_CHAR } = UniversalUtilities;

    const structuralElements = new Set(['P', 'BLOCKQUOTE', 'TABLE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'OL', 'UL', 'PRE']);

    const purgeEmptyTextNodes = (targetNode) => {
        const nodesToRemove = [];
        const walker = ROOT_DOCUMENT.createTreeWalker(
            targetNode,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    if (node.nodeValue.trim().length === 0 && !node.nodeValue.includes('\u00A0')) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
            },
            false
        );

        let currentNode;
        while ((currentNode = walker.nextNode())) {
            nodesToRemove.push(currentNode);
        }

        nodesToRemove.forEach(node => node.parentNode.removeChild(node));
    };

    const normalizeContentStructure = (rawHtmlString) => {
        const parser = new DOMParser();
        const tempDocument = parser.parseFromString(rawHtmlString, 'text/html');
        const processingFragment = ROOT_DOCUMENT.createDocumentFragment();

        purgeEmptyTextNodes(tempDocument.body);

        const initialNodes = Array.from(tempDocument.body.childNodes);
        let currentParagraphWrapper = null;

        initialNodes.forEach(node => {
            const isTextNode = node.nodeType === Node.TEXT_NODE;
            const isElementNode = node.nodeType === Node.ELEMENT_NODE;
            const tagName = isElementNode ? node.tagName.toUpperCase() : null;
            const isBlockElement = isElementNode && structuralElements.has(tagName);

            if (isTextNode || (isElementNode && !isBlockElement)) {
                if (!currentParagraphWrapper) {
                    currentParagraphWrapper = ROOT_DOCUMENT.createElement('p');
                }
                currentParagraphWrapper.append(node);
            } else if (isBlockElement) {
                if (currentParagraphWrapper && currentParagraphWrapper.childNodes.length > 0) {
                    processingFragment.append(currentParagraphWrapper);
                    currentParagraphWrapper = null;
                }
                processingFragment.append(node);
            }
        });

        if (currentParagraphWrapper && currentParagraphWrapper.childNodes.length > 0) {
            processingFragment.append(currentParagraphWrapper);
        }

        const tempDivForQuery = ROOT_DOCUMENT.createElement('div');
        tempDivForQuery.append(processingFragment);

        Array.from(tempDivForQuery.querySelectorAll('*')).forEach(element => {
            if (element.tagName.toUpperCase() === 'BR') {
                return;
            }
            const textContentWithoutInvisibleSpaces = element.textContent.replace(new RegExp(INVISIBLE_SPACE_CHAR, 'g'), '');
            if (textContentWithoutInvisibleSpaces.trim().length === 0) {
                element.remove();
            }
        });

        return tempDivForQuery.innerHTML;
    };

    return {
        normalizeContentStructure
    };
})();

const GlobalAccessPoint = {
    overlayService: OverlayManager.presentOverlay,
    htmlCleaningService: HtmlContentProcessor.normalizeContentStructure,
    voidReference: UniversalUtilities.BLANK_LINK_HREF
};