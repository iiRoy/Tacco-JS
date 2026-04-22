const createDialogSystem = (initialSettings) => {
    let currentConfiguration = {
        onComponentReady: () => {},
        verticalOffset: 40,
        curtainOpacity: 0.3,
        curtainColor: "#000000",
        componentWidth: 400,
        isMovable: true,
        escapeToClose: true,
        curtainClickToClose: true,
        alwaysTreatAsImage: true,
        showCloseButton: true,
        hideTopBar: false,
        hideBottomBar: false,
        imagePaddingHorizontal: 40,
        imagePaddingVertical: 120,
        confirmButtonText: "Proceed",
        cancelButtonText: "Dismiss",
        dialogTemplate: "<div class=\"dialog-header-section\"> \
            <h1>{_HEADING_}</h1> \
          </div> \
          <div class=\"dialog-content-area\"> \
            <div class=\"inner-content-wrapper\">{_PAYLOAD_}</div> \
          </div> \
          <div class=\"dialog-footer-area\"></div>"
    };

    let ongoingRequest = null;
    let registeredActionControls = [];
    let currentLightboxContext = {};
    let mainDialogElement = null;
    let backdropElement = null;
    let windowResizeHandler = null;
    let keyboardEscapeHandler = null;
    let dragControlHandlers = {
        mousedown: null,
        mousemove: null,
        mouseup: null
    };
    let dragState = {
        isDragging: false,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0
    };

    const _mergeSettings = (newSettings) => {
        currentConfiguration = { ...currentConfiguration, ...newSettings };
    };

    const _applyTemplate = (templateString, dataMap) => {
        let result = templateString;
        for (const key in dataMap) {
            result = result.replace(new RegExp(`{_${key}_}`, 'g'), dataMap[key]);
        }
        return result;
    };

    const _positionAndSizeComponent = () => {
        if (!mainDialogElement || !backdropElement) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const dialogWidth = mainDialogElement.offsetWidth;
        const dialogHeight = mainDialogElement.offsetHeight;

        let topPosition = (viewportHeight - dialogHeight) / 2;
        let leftPosition = (viewportWidth - dialogWidth) / 2;

        topPosition = Math.max(currentConfiguration.verticalOffset, topPosition);
        leftPosition = Math.max(10, leftPosition);

        mainDialogElement.style.top = `${topPosition}px`;
        mainDialogElement.style.left = `${leftPosition}px`;
    };

    const _manageBackdropVisibility = (state) => {
        if (state === 'show') {
            _manageBackdropVisibility('hide');

            backdropElement = document.createElement('div');
            backdropElement.id = 'dialog-curtain';
            backdropElement.style.position = 'fixed';
            backdropElement.style.top = '0';
            backdropElement.style.left = '0';
            backdropElement.style.width = '100%';
            backdropElement.style.height = '100%';
            backdropElement.style.zIndex = '9998';
            backdropElement.style.backgroundColor = currentConfiguration.curtainColor;
            backdropElement.style.opacity = '0';
            backdropElement.style.transition = 'opacity 0.3s ease-in-out';

            document.body.appendChild(backdropElement);

            void backdropElement.offsetWidth;
            backdropElement.style.opacity = String(currentConfiguration.curtainOpacity);

            if (currentConfiguration.curtainClickToClose) {
                backdropElement.addEventListener('click', _concealDialogue);
            }

            windowResizeHandler = () => {
                _positionAndSizeComponent();
            };
            window.addEventListener('resize', windowResizeHandler);

        } else if (state === 'hide') {
            if (backdropElement) {
                backdropElement.style.opacity = '0';
                backdropElement.addEventListener('transitionend', () => {
                    if (backdropElement && backdropElement.parentNode) {
                        backdropElement.parentNode.removeChild(backdropElement);
                    }
                    backdropElement = null;
                }, { once: true });
            }

            if (windowResizeHandler) {
                window.removeEventListener('resize', windowResizeHandler);
                windowResizeHandler = null;
            }
        }
    };

    const _enableKeyboardEscape = (enable) => {
        if (enable) {
            keyboardEscapeHandler = (event) => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    _concealDialogue();
                }
            };
            window.addEventListener('keydown', keyboardEscapeHandler);
        } else {
            if (keyboardEscapeHandler) {
                window.removeEventListener('keydown', keyboardEscapeHandler);
                keyboardEscapeHandler = null;
            }
        }
    };

    const _enableDragFunctionality = () => {
        if (!currentConfiguration.isMovable || !mainDialogElement) return;

        const header = mainDialogElement.querySelector('.dialog-header-section');
        if (!header) return;

        header.style.cursor = 'move';

        dragControlHandlers.mousedown = (e) => {
            if (e.button !== 0) return;
            dragState.isDragging = true;
            dragState.startX = e.clientX;
            dragState.startY = e.clientY;
            const rect = mainDialogElement.getBoundingClientRect();
            dragState.offsetX = rect.left - e.clientX;
            dragState.offsetY = rect.top - e.clientY;

            mainDialogElement.style.position = 'fixed';
            mainDialogElement.style.margin = '0';

            document.addEventListener('mousemove', dragControlHandlers.mousemove);
            document.addEventListener('mouseup', dragControlHandlers.mouseup);
        };

        dragControlHandlers.mousemove = (e) => {
            if (!dragState.isDragging) return;
            mainDialogElement.style.left = `${e.clientX + dragState.offsetX}px`;
            mainDialogElement.style.top = `${e.clientY + dragState.offsetY}px`;
        };

        dragControlHandlers.mouseup = () => {
            dragState.isDragging = false;
            document.removeEventListener('mousemove', dragControlHandlers.mousemove);
            document.removeEventListener('mouseup', dragControlHandlers.mouseup);
        };

        header.addEventListener('mousedown', dragControlHandlers.mousedown);
    };

    const _disableDragFunctionality = () => {
        if (!mainDialogElement) return;
        const header = mainDialogElement.querySelector('.dialog-header-section');
        if (header && dragControlHandlers.mousedown) {
            header.removeEventListener('mousedown', dragControlHandlers.mousedown);
            header.style.cursor = '';
        }
        document.removeEventListener('mousemove', dragControlHandlers.mousemove);
        document.removeEventListener('mouseup', dragControlHandlers.mouseup);
        dragState.isDragging = false;
        dragControlHandlers = { mousedown: null, mousemove: null, mouseup: null };
    };


    const _createAndAttachCloseControl = () => {
        if (!currentConfiguration.showCloseButton || !mainDialogElement) return;

        const closeBtn = document.createElement('a');
        closeBtn.className = 'close-trigger';
        closeBtn.href = '#';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            _concealDialogue();
        });
        mainDialogElement.prepend(closeBtn);
    };

    const _addControlToQueue = (caption, styleClass, actionHandler) => {
        const ctrl = document.createElement('button');
        ctrl.textContent = caption;
        ctrl.className = styleClass;
        ctrl.addEventListener('click', actionHandler || _concealDialogue);
        registeredActionControls.push(ctrl);
        return ctrl;
    };

    const _renderControls = () => {
        const footer = mainDialogElement.querySelector('.dialog-footer-area');
        if (footer) {
            registeredActionControls.forEach(ctrl => footer.appendChild(ctrl));
        }
        registeredActionControls = [];
    };

    const _constructDialogElement = (dialogData) => {
        if (dialogData.renderRequired) {
            if (mainDialogElement && mainDialogElement.parentNode) {
                mainDialogElement.parentNode.removeChild(mainDialogElement);
            }
            mainDialogElement = document.createElement('div');
            mainDialogElement.id = 'main-dialog-box';
            mainDialogElement.className = 'main-dialog-container';
            mainDialogElement.style.position = 'fixed';
            mainDialogElement.style.zIndex = '9999';
            document.body.appendChild(mainDialogElement);
        } else if (!mainDialogElement) {
            mainDialogElement = document.getElementById('main-dialog-box');
            if (!mainDialogElement) {
                return _constructDialogElement({ ...dialogData, renderRequired: true });
            }
        }

        const compiledHtml = _applyTemplate(currentConfiguration.dialogTemplate, {
            _HEADING_: dialogData.title || "No Title",
            _PAYLOAD_: dialogData.payload || ""
        });
        mainDialogElement.innerHTML = compiledHtml;

        _renderControls();

        if (dialogData.hasNavigationArrows) {
            _addNavigationControls();
        }

        if (currentConfiguration.hideTopBar) mainDialogElement.classList.add('hide-top-bar-section');
        if (currentConfiguration.hideBottomBar) mainDialogElement.classList.add('hide-bottom-bar-section');

        mainDialogElement.style.width = `${currentConfiguration.componentWidth}px`;

        currentConfiguration.onComponentReady();

        return mainDialogElement;
    };

    const _fetchRemoteContent = (url, completionCallback) => {
        if (ongoingRequest) {
            ongoingRequest.abort();
        }

        ongoingRequest = new XMLHttpRequest();
        ongoingRequest.open('GET', url, true);
        ongoingRequest.onload = () => {
            if (ongoingRequest.status >= 200 && ongoingRequest.status < 400) {
                const contentArea = mainDialogElement.querySelector('.inner-content-wrapper');
                if (contentArea) {
                    if (currentConfiguration.alwaysTreatAsImage && (url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null)) {
                        const img = new Image();
                        img.onload = () => {
                            contentArea.innerHTML = '';
                            contentArea.appendChild(img);
                            _adjustImageDimensions(img);
                            _positionAndSizeComponent();
                            if (completionCallback) completionCallback();
                        };
                        img.onerror = () => {
                            contentArea.innerHTML = `<p>Error loading media from ${url}</p>`;
                            _positionAndSizeComponent();
                            if (completionCallback) completionCallback();
                        };
                        img.src = url;
                    } else {
                        contentArea.innerHTML = ongoingRequest.responseText;
                        _positionAndSizeComponent();
                        if (completionCallback) completionCallback();
                    }
                }
            } else {
                const contentArea = mainDialogElement.querySelector('.inner-content-wrapper');
                if (contentArea) contentArea.innerHTML = `<p>Could not load content from ${url}. Status: ${ongoingRequest.status}</p>`;
                _positionAndSizeComponent();
                if (completionCallback) completionCallback();
            }
            ongoingRequest = null;
        };
        ongoingRequest.onerror = () => {
            const contentArea = mainDialogElement.querySelector('.inner-content-wrapper');
            if (contentArea) contentArea.innerHTML = `<p>Network error loading content from ${url}.</p>`;
            ongoingRequest = null;
            _positionAndSizeComponent();
            if (completionCallback) completionCallback();
        };
        ongoingRequest.send();
    };

    const _adjustImageDimensions = (imgElement) => {
        const maxWidth = window.innerWidth - currentConfiguration.imagePaddingHorizontal;
        const maxHeight = window.innerHeight - currentConfiguration.imagePaddingVertical;

        let newWidth = imgElement.naturalWidth;
        let newHeight = imgElement.naturalHeight;

        if (newWidth > maxWidth) {
            newHeight = (maxWidth / newWidth) * newHeight;
            newWidth = maxWidth;
        }

        if (newHeight > maxHeight) {
            newWidth = (maxHeight / newHeight) * newWidth;
            newHeight = maxHeight;
        }

        imgElement.style.maxWidth = `${newWidth}px`;
        imgElement.style.maxHeight = `${newHeight}px`;
        imgElement.style.height = 'auto';
        imgElement.style.width = 'auto';
        imgElement.style.display = 'block';

        mainDialogElement.style.width = `${Math.min(newWidth + currentConfiguration.imagePaddingHorizontal, window.innerWidth - 20)}px`;
    };

    const _addNavigationControls = () => {
        const nextBtn = document.createElement('a');
        nextBtn.className = 'next-media-item';
        nextBtn.href = '#';
        nextBtn.innerHTML = '&raquo;';
        nextBtn.style.display = 'none';
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            _advanceContent();
        });
        mainDialogElement.prepend(nextBtn);

        const prevBtn = document.createElement('a');
        prevBtn.className = 'prev-media-item';
        prevBtn.href = '#';
        prevBtn.innerHTML = '&laquo;';
        prevBtn.style.display = 'none';
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            _recedeContent();
        });
        mainDialogElement.prepend(prevBtn);

        _adjustNavigationControlVisibility();
    };

    const _retrieveGroupElements = (groupIdentifier) => {
        const selector = `a[rel*="simplemodal[${groupIdentifier}]"]`;
        return Array.from(document.querySelectorAll(selector));
    };

    const _countGroupElements = (groupIdentifier) => {
        return _retrieveGroupElements(groupIdentifier).length;
    };

    const _advanceContent = () => {
        const groupItems = _retrieveGroupElements(currentLightboxContext.groupId);
        currentLightboxContext.currentIndex++;
        const nextItem = groupItems[currentLightboxContext.currentIndex];

        if (nextItem) {
            displayDialogue({
                type: "lightbox",
                title: nextItem.getAttribute('title'),
                renderRequired: false,
                parameters: {
                    url: nextItem.getAttribute('href'),
                    onContentLoad: () => {}
                },
                lightboxInfo: {
                    elementNode: nextItem,
                    groupId: currentLightboxContext.groupId,
                    currentIndex: currentLightboxContext.currentIndex
                }
            });
        }
    };

    const _recedeContent = () => {
        const groupItems = _retrieveGroupElements(currentLightboxContext.groupId);
        currentLightboxContext.currentIndex--;
        const previousItem = groupItems[currentLightboxContext.currentIndex];

        if (previousItem) {
            displayDialogue({
                type: "lightbox",
                title: previousItem.getAttribute('title'),
                renderRequired: false,
                parameters: {
                    url: previousItem.getAttribute('href'),
                    onContentLoad: () => {}
                },
                lightboxInfo: {
                    elementNode: previousItem,
                    groupId: currentLightboxContext.groupId,
                    currentIndex: currentLightboxContext.currentIndex
                }
            });
        }
    };

    const _adjustNavigationControlVisibility = () => {
        const prevArrow = mainDialogElement.querySelector('.prev-media-item');
        const nextArrow = mainDialogElement.querySelector('.next-media-item');
        const totalItems = _countGroupElements(currentLightboxContext.groupId);

        if (prevArrow) {
            prevArrow.style.display = (currentLightboxContext.currentIndex === 0) ? 'none' : 'inline-block';
        }
        if (nextArrow) {
            nextArrow.style.display = (totalItems > 0 && currentLightboxContext.currentIndex < totalItems - 1) ? 'inline-block' : 'none';
        }
    };

    const displayDialogue = (dialogData) => {
        dialogData.renderRequired = dialogData.renderRequired === undefined ? true : dialogData.renderRequired;

        _mergeSettings(dialogData);

        if (dialogData.renderRequired) {
            _manageBackdropVisibility('show');
        }

        registeredActionControls = [];

        switch (dialogData.type) {
            case "confirm":
                _addControlToQueue(currentConfiguration.confirmButtonText, "control primary control-margin", () => {
                    try { dialogData.confirmationAction(); } catch (err) { console.error("Confirmation action error:", err); }
                    _concealDialogue();
                });
                _addControlToQueue(currentConfiguration.cancelButtonText, "control secondary");
                _constructDialogElement(dialogData);
                _enableKeyboardEscape(currentConfiguration.escapeToClose);
                break;

            case "modal":
                _constructDialogElement(dialogData);
                _enableKeyboardEscape(currentConfiguration.escapeToClose);
                break;

            case "modal-ajax":
                _constructDialogElement(dialogData);
                _fetchRemoteContent(dialogData.parameters.url || "", dialogData.parameters.onContentLoad || (() => {}));
                _enableKeyboardEscape(currentConfiguration.escapeToClose);
                break;

            case "lightbox":
                dialogData.hasNavigationArrows = true;
                currentLightboxContext.elementNode = dialogData.lightboxInfo.elementNode;
                currentLightboxContext.groupId = dialogData.lightboxInfo.groupId;
                currentLightboxContext.currentIndex = dialogData.lightboxInfo.currentIndex;

                _constructDialogElement(dialogData);
                _fetchRemoteContent(dialogData.parameters.url || "", () => {
                    _adjustNavigationControlVisibility();
                    if (dialogData.parameters.onContentLoad) dialogData.parameters.onContentLoad();
                });
                _enableKeyboardEscape(currentConfiguration.escapeToClose);
                break;

            default: // "alert"
                _addControlToQueue(currentConfiguration.confirmButtonText, "control primary");
                _constructDialogElement(dialogData);
                _enableKeyboardEscape(currentConfiguration.escapeToClose);
                break;
        }

        mainDialogElement.style.width = `${currentConfiguration.componentWidth}px`;

        _createAndAttachCloseControl();
        _enableDragFunctionality();
        _positionAndSizeComponent();
    };

    const _concealDialogue = () => {
        if (ongoingRequest) {
            ongoingRequest.abort();
            ongoingRequest = null;
        }

        _manageBackdropVisibility('hide');
        _enableKeyboardEscape(false);
        _disableDragFunctionality();

        if (mainDialogElement && mainDialogElement.parentNode) {
            mainDialogElement.parentNode.removeChild(mainDialogElement);
            mainDialogElement = null;
        }
    };

    _mergeSettings(initialSettings);

    return {
        display: displayDialogue,
        hide: _concealDialogue,
        addCustomButton: _addControlToQueue,
        getGroupItems: _retrieveGroupElements,
        getGroupItemCount: _countGroupElements
    };
};