let primaryModalInstance;

function createOverlaySystem(initialConfiguration) {
    const defaultParameters = {
        loadPicPath: '/facebox/loading.gif',
        shutPicPath: '/facebox/closelabel.gif',
        picRegex: new RegExp('\\.' + ['png', 'jpg', 'jpeg', 'gif'].join('|') + '$', 'i'),
        isReady: false,
        dialogScaffold: `
            <div id="overlay_main_container" style="display:none; opacity:0; transition: opacity 0.3s ease-in-out;">
                <div class="overlay_content_wrapper">
                    <table class="overlay_layout_grid">
                        <tbody>
                            <tr>
                                <td class="corner_top_left"></td>
                                <td class="border_top"></td>
                                <td class="corner_top_right"></td>
                            </tr>
                            <tr>
                                <td class="border_left"></td>
                                <td class="center_content_cell">
                                    <div class="display_area"></div>
                                    <div class="bottom_section">
                                        <a href="#" class="dismiss_button">
                                            <img src="/facebox/closelabel.gif" title="close" class="close_icon_image" alt="Close" />
                                        </a>
                                    </div>
                                </td>
                                <td class="border_right"></td>
                            </tr>
                            <tr>
                                <td class="corner_bottom_left"></td>
                                <td class="border_bottom"></td>
                                <td class="corner_bottom_right"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>`
    };

    const currentParameters = { ...defaultParameters, ...initialConfiguration };

    let prefetchedAssets = [];
    let mainDialogEl;
    let keyAndClickMonitor;
    let selfReference = {};

    const queryDialogElement = (selector) => mainDialogEl.querySelector(selector);
    const queryAllDialogElements = (selector) => mainDialogEl.querySelectorAll(selector);

    const positionDialogWindow = () => {
        if (!mainDialogEl) return;
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

        mainDialogEl.style.top = (scrollPosition + (viewportHeight / 10)) + 'px';
        mainDialogEl.style.left = (viewportWidth / 2 - (mainDialogEl.offsetWidth / 2)) + 'px';
    };

    const monitorKeyboardAndMouse = (eventObject) => {
        if (eventObject.keyCode === 27 || (!mainDialogEl.contains(eventObject.target) && eventObject.type === 'click')) {
            selfReference.dismissDialog();
        }
    };

    const activateElementListeners = () => {
        const activationLinks = document.querySelectorAll('a[rel^="facebox"]');
        activationLinks.forEach(triggerElement => {
            triggerElement.addEventListener('click', (eventObject) => {
                eventObject.preventDefault();
                selfReference.handleActivation(triggerElement, eventObject);
            });
        });
    };

    const showLoadingSpinner = () => {
        if (!mainDialogEl) return;

        let activeSpinner = queryDialogElement('.display_area .loading_indicator');
        if (activeSpinner) return;

        const innerContentArea = queryDialogElement('.display_area');
        while (innerContentArea.firstChild) {
            innerContentArea.removeChild(innerContentArea.firstChild);
        }
        innerContentArea.insertAdjacentHTML('beforeend', `<div class="loading_indicator"><img src="${currentParameters.loadPicPath}" alt="Loading"/></div>`);

        positionDialogWindow();

        document.removeEventListener('keydown', keyAndClickMonitor);
        document.removeEventListener('click', keyAndClickMonitor);
        document.addEventListener('keydown', keyAndClickMonitor);
        document.addEventListener('click', keyAndClickMonitor);

        if (mainDialogEl.style.display === 'none') {
            mainDialogEl.style.display = 'block';
            setTimeout(() => {
                mainDialogEl.style.opacity = '1';
            }, 10);
        }
    };

    const presentContent = (contentPayload, customStylingClass) => {
        showLoadingSpinner();
        const activeSpinner = queryDialogElement('.display_area .loading_indicator');
        if (activeSpinner) {
            activeSpinner.remove();
        }

        const innerContentArea = queryDialogElement('.display_area');
        if (customStylingClass) {
            innerContentArea.classList.add(customStylingClass);
        }

        while (innerContentArea.firstChild) {
            innerContentArea.removeChild(innerContentArea.firstChild);
        }

        if (typeof contentPayload === 'string') {
            innerContentArea.insertAdjacentHTML('beforeend', contentPayload);
        } else if (contentPayload instanceof HTMLElement) {
            innerContentArea.appendChild(contentPayload);
        }

        const centerCellChildren = queryDialogElement('.center_content_cell').children;
        Array.from(centerCellChildren).forEach(element => {
            element.style.display = '';
        });

        positionDialogWindow();

        if (mainDialogEl.style.opacity === '0' && mainDialogEl.style.display === 'none') {
            mainDialogEl.style.display = 'block';
            setTimeout(() => {
                mainDialogEl.style.opacity = '1';
            }, 10);
        }

        document.removeEventListener('keydown', keyAndClickMonitor);
        document.removeEventListener('click', keyAndClickMonitor);
        document.addEventListener('keydown', keyAndClickMonitor);
        document.addEventListener('click', keyAndClickMonitor);
    };

    const dismissDialog = () => {
        if (!mainDialogEl) return;

        mainDialogEl.style.opacity = '0';
        mainDialogEl.addEventListener('transitionend', function transitionEndHandler() {
            mainDialogEl.style.display = 'none';
            const innerContentArea = queryDialogElement('.display_area');
            while (innerContentArea.firstChild) {
                innerContentArea.removeChild(innerContentArea.firstChild);
            }
            Array.from(innerContentArea.classList).forEach(cls => {
                if (cls !== 'display_area') innerContentArea.classList.remove(cls);
            });

            document.removeEventListener('keydown', keyAndClickMonitor);
            document.removeEventListener('click', keyAndClickMonitor);
            mainDialogEl.removeEventListener('transitionend', transitionEndHandler);
        }, { once: true });
    };

    const processActivationLink = (triggerElement, eventObject) => {
        selfReference.showLoadingSpinner();
        eventObject.preventDefault();

        const relAttributeMatch = triggerElement.getAttribute('rel').match(/facebox\[\.(\w+)\]/);
        let customStylingClass = relAttributeMatch ? relAttributeMatch[1] : null;

        if (triggerElement.href.includes('#')) {
            const currentUrl = window.location.href.split('#')[0];
            const contentIdentifier = triggerElement.href.replace(currentUrl + '#', '');
            const sourceElement = document.getElementById(contentIdentifier);
            if (sourceElement) {
                const clonedContent = sourceElement.cloneNode(true);
                clonedContent.style.display = '';
                selfReference.presentContent(clonedContent, customStylingClass);
            }
        } else if (triggerElement.href.match(currentParameters.picRegex)) {
            const mediaElement = new Image();
            mediaElement.onload = () => {
                selfReference.presentContent(`<div class="image_container"><img src="${mediaElement.src}" alt="Content Image" /></div>`, customStylingClass);
            };
            mediaElement.src = triggerElement.href;
        } else {
            fetch(triggerElement.href)
                .then(responseObject => {
                    if (!responseObject.ok) {
                        throw new Error(`HTTP error! Status: ${responseObject.status}`);
                    }
                    return responseObject.text();
                })
                .then(htmlContent => {
                    selfReference.presentContent(htmlContent, customStylingClass);
                })
                .catch(error => {
                    selfReference.presentContent(`<div class="error_message">Content loading failed: ${error.message}</div>`, customStylingClass);
                });
        }
    };

    const setupCoreEngine = () => {
        document.body.insertAdjacentHTML('beforeend', currentParameters.dialogScaffold);
        mainDialogEl = document.getElementById('overlay_main_container');

        prefetchedAssets.push(new Image());
        prefetchedAssets[0].src = currentParameters.shutPicPath;
        prefetchedAssets.push(new Image());
        prefetchedAssets[1].src = currentParameters.loadPicPath;

        const elementsWithBackground = queryAllDialogElements('.corner_top_left, .border_top, .corner_top_right, .border_left, .border_right, .corner_bottom_left, .border_bottom, .corner_bottom_right');
        elementsWithBackground.forEach(element => {
            const style = window.getComputedStyle(element);
            const backgroundImage = style.backgroundImage;
            if (backgroundImage && backgroundImage !== 'none') {
                const urlMatch = backgroundImage.match(/url\(['"]?(.+?)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                    const img = new Image();
                    img.src = urlMatch[1];
                    prefetchedAssets.push(img);
                }
            }
        });

        keyAndClickMonitor = monitorKeyboardAndMouse.bind(selfReference);

        const dismissButtons = queryAllDialogElements('.dismiss_button, .close_icon_image');
        dismissButtons.forEach(button => {
            button.addEventListener('click', (eventObject) => {
                eventObject.preventDefault();
                selfReference.dismissDialog();
            });
        });

        activateElementListeners();
        currentParameters.isReady = true;
    };

    selfReference = {
        setupCoreEngine,
        showLoadingSpinner,
        presentContent,
        dismissDialog,
        handleActivation: processActivationLink,
        currentParameters
    };

    return selfReference;
}

document.addEventListener('DOMContentLoaded', () => {
    primaryModalInstance = createOverlaySystem();
    primaryModalInstance.setupCoreEngine();
});