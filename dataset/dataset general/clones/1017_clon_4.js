let _globalZAltitude = 1000;

const _systemOverlay = (function() {
    let _backdropElement = null;
    let _activeModalCount = 0;

    function _retrieveBackdropElement() {
        if (!_backdropElement) {
            _backdropElement = document.createElement('div');
            _backdropElement.classList.add('component-modal-backdrop');
            _backdropElement.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.3);
                display: none;
            `;
            document.body.appendChild(_backdropElement);
        }
        return _backdropElement;
    }

    return {
        reveal: function(layerIndex) {
            const el = _retrieveBackdropElement();
            _activeModalCount++;
            el.style.display = 'block';
            el.style.zIndex = layerIndex;
        },
        conceal: function() {
            _activeModalCount--;
            if (_activeModalCount <= 0) {
                const el = _retrieveBackdropElement();
                el.style.display = 'none';
                _activeModalCount = 0;
            }
        },
        adjustLayer: function(layerIndex) {
            const el = _retrieveBackdropElement();
            if (_activeModalCount > 0) {
                el.style.zIndex = layerIndex;
            }
        },
        purge: function() {
            if (_backdropElement && _backdropElement.parentNode) {
                _backdropElement.parentNode.removeChild(_backdropElement);
                _backdropElement = null;
            }
            _activeModalCount = 0;
        }
    };
})();

class DisplayModule {
    constructor(sourceElement, customConfiguration) {
        this._initialSourceElement = sourceElement;
        this._elementReferenceId = DisplayModule._generateUniqueId(sourceElement);

        this._configuration = Object.assign({}, DisplayModule._baseConfiguration, customConfiguration);

        this._originalElementTitle = sourceElement.getAttribute('title') || "";
        if (!this._originalElementTitle && this._configuration.frameTitle) {
            this._originalElementTitle = this._configuration.frameTitle;
        } else if (!this._configuration.frameTitle) {
            this._configuration.frameTitle = this._originalElementTitle;
        }

        this._mainFrame = null;
        this._topBar = null;
        this._titleDisplay = null;
        this._contentPanel = null;
        this._bottomButtonArea = null;

        this._closeControl = null;
        this._shrinkControl = null;
        this._enlargeControl = null;

        this._isCurrentlyVisible = false;
        this._isShrunk = false;
        this._isEnlarged = false;

        this._savedGeometry = {};

        this._constructFrameElements();
        this._attachBaseHandlers();
        this._activateFrameFeatures();

        if (this._configuration.autoShow) {
            this.showFrame();
        }
    }

    static _generateUniqueId(element) {
        const existingId = element.id;
        if (existingId) return existingId + '-frame-caption';
        const newId = 'frame-caption-' + Math.random().toString(36).substr(2, 9);
        element.id = newId;
        return newId;
    }

    static _baseConfiguration = {
        autoShow: true,
        actionControls: {},
        escapeKeyCloses: true,
        closeControlLabel: 'Close Popup',
        additionalFrameClass: '',
        allowMove: true,
        hideAnimation: null,
        defaultHeight: 'auto',
        maximumHeightConstraint: false,
        maximumWidthConstraint: false,
        minimumHeightConstraint: 150,
        minimumWidthConstraint: 300,
        shrinkControlLabel: 'Shrink Window',
        enlargeControlLabel: 'Enlarge Window',
        enableShrink: true,
        enableEnlarge: true,
        isModal: false,
        initialPlacement: {
            horizontal: 'center',
            vertical: 'center',
            collisionBehavior: 'fit',
            adjustPosition: function(calculatedPosition) {
                const currentTop = this.style.top ? parseInt(this.style.top, 10) : 0;
                if (currentTop < 0) {
                    this.style.top = (calculatedPosition.top - currentTop) + 'px';
                }
            }
        },
        allowResize: true,
        showAnimation: null,
        enableStacking: true,
        frameTitle: '&#160;',
        defaultWidth: 300,
        initialZIndex: 1000
    };

    _constructFrameElements() {
        this._mainFrame = document.createElement('div');
        this._mainFrame.classList.add('display-frame', 'display-widget', 'display-widget-content', 'display-rounded');
        if (this._configuration.additionalFrameClass) {
            this._mainFrame.classList.add(this._configuration.additionalFrameClass);
        }
        this._mainFrame.style.zIndex = this._configuration.initialZIndex;
        this._mainFrame.setAttribute('tabIndex', -1);
        this._mainFrame.style.outline = 0;
        this._mainFrame.setAttribute('role', 'dialog');
        this._mainFrame.setAttribute('aria-labelledby', this._elementReferenceId);
        this._mainFrame.style.display = 'none';

        this._topBar = document.createElement('div');
        this._topBar.classList.add('display-header', 'display-widget-header', 'display-rounded', 'display-clear-float');
        this._mainFrame.appendChild(this._topBar);

        this._titleDisplay = document.createElement('span');
        this._titleDisplay.classList.add('display-caption');
        this._titleDisplay.setAttribute('id', this._elementReferenceId);
        this._titleDisplay.innerHTML = this._configuration.frameTitle;
        this._topBar.appendChild(this._titleDisplay);

        this._contentPanel = this._initialSourceElement;
        this._contentPanel.style.display = 'block';
        this._contentPanel.removeAttribute('title');
        this._contentPanel.classList.add('display-content-area', 'display-widget-content');
        this._mainFrame.appendChild(this._contentPanel);

        document.body.appendChild(this._mainFrame);

        this._createFrameControls();
        this._createCustomActionControls(this._configuration.actionControls);

        this._topBar.addEventListener('selectstart', e => e.preventDefault());
    }

    _createFrameControls() {
        if (this._configuration.enableShrink && !this._configuration.isModal) {
            this._shrinkControl = this._createTopBarButton('display-shrink-btn', 'shrink-icon', this._configuration.shrinkControlLabel, (e) => {
                this.shrinkFrame(e);
                e.preventDefault();
            });
            this._topBar.appendChild(this._shrinkControl);
        }

        if (this._configuration.enableEnlarge && !this._configuration.isModal) {
            this._enlargeControl = this._createTopBarButton('display-enlarge-btn', 'enlarge-icon', this._configuration.enlargeControlLabel, (e) => {
                this.enlargeFrame(e);
                e.preventDefault();
            });
            this._topBar.appendChild(this._enlargeControl);

            this._topBar.addEventListener('dblclick', (e) => {
                this.enlargeFrame(e);
                e.preventDefault();
            });
        }

        if (this._configuration.escapeKeyCloses !== false) {
            this._closeControl = this._createTopBarButton('display-close-btn', 'close-icon', this._configuration.closeControlLabel, (e) => {
                this.hideFrame(e);
                e.preventDefault();
            });
            this._topBar.appendChild(this._closeControl);
        }
    }

    _createTopBarButton(baseClass, iconClass, labelText, clickHandler) {
        const btn = document.createElement('a');
        btn.href = '#';
        btn.classList.add(baseClass, 'display-rounded');
        btn.setAttribute('role', 'button');
        btn.style.float = 'right'; // Mimic original layout

        const span = document.createElement('span');
        span.classList.add('display-icon', iconClass);
        span.textContent = labelText;
        btn.appendChild(span);

        btn.addEventListener('mouseenter', () => btn.classList.add('display-state-hover'));
        btn.addEventListener('mouseleave', () => btn.classList.remove('display-state-hover'));
        btn.addEventListener('focus', () => btn.classList.add('display-state-focus'));
        btn.addEventListener('blur', () => btn.classList.remove('display-state-focus'));
        btn.addEventListener('click', clickHandler);
        return btn;
    }

    _createCustomActionControls(buttonMapping) {
        const buttonLabels = Object.keys(buttonMapping);
        if (buttonLabels.length === 0) return;

        this._bottomButtonArea = document.createElement('div');
        this._bottomButtonArea.classList.add('display-action-strip', 'display-widget-content', 'display-clear-float');
        this._mainFrame.appendChild(this._bottomButtonArea);

        buttonLabels.forEach(label => {
            const controlConfig = buttonMapping[label];
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.classList.add('display-action-button', 'display-widget-button', 'display-rounded');
            btn.textContent = label;
            if (typeof controlConfig === 'function') {
                btn.addEventListener('click', (e) => controlConfig.call(this._initialSourceElement, e));
            } else if (typeof controlConfig === 'object' && controlConfig.click) {
                btn.addEventListener('click', (e) => controlConfig.click.call(this._initialSourceElement, e));
                if (controlConfig.icons) {
                    const iconSpan = document.createElement('span');
                    iconSpan.classList.add('display-icon');
                    if (controlConfig.icons.primary) iconSpan.classList.add(controlConfig.icons.primary);
                    btn.prepend(iconSpan);
                }
            }
            this._bottomButtonArea.appendChild(btn);
        });
    }

    _attachBaseHandlers() {
        this._mainFrame.addEventListener('keydown', (e) => {
            if (this._configuration.escapeKeyCloses && !e.defaultPrevented && e.key === 'Escape') {
                this.hideFrame(e);
                e.preventDefault();
            }
        });

        this._mainFrame.addEventListener('mousedown', (e) => {
            this.bringToFront(false, e);
        });
    }

    _activateFrameFeatures() {
        if (this._configuration.allowMove) {
            this._enableMovement();
        }
        if (this._configuration.allowResize) {
            this._enableResizing();
        }
    }

    _triggerEventHook(hookName, eventContext) {
        const handler = this._configuration[hookName];
        if (typeof handler === 'function') {
            const eventPayload = {
                managerInstance: this,
                frameElement: this._mainFrame,
                contentElement: this._contentPanel
            };
            if (handler.call(this._initialSourceElement, eventContext, eventPayload) === false) {
                return false;
            }
        }
        return true;
    }

    _positionFrameInitially() {
        const frame = this._mainFrame;
        frame.style.position = 'absolute';

        const originalDisplay = frame.style.display;
        frame.style.display = 'block'; // Temporarily show to get dimensions

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const frameWidth = frame.offsetWidth;
        const frameHeight = frame.offsetHeight;

        let targetLeft = (viewportWidth - frameWidth) / 2;
        let targetTop = (viewportHeight - frameHeight) / 2;

        if (this._configuration.initialPlacement && typeof this._configuration.initialPlacement.adjustPosition === 'function') {
            const temporaryPosition = { top: targetTop, left: targetLeft };
            this._configuration.initialPlacement.adjustPosition.call(frame, temporaryPosition);
            targetTop = temporaryPosition.top;
            targetLeft = temporaryPosition.left;
        }

        frame.style.left = Math.max(0, targetLeft) + 'px';
        frame.style.top = Math.max(0, targetTop) + 'px';

        frame.style.display = originalDisplay;
    }

    // --- Public Methods ---
    showFrame() {
        if (this._isCurrentlyVisible) return;

        if (this._triggerEventHook('beforeLaunch') === false) {
            return;
        }

        this._isCurrentlyVisible = true;
        this._mainFrame.style.display = 'block';
        this._positionFrameInitially();
        this.bringToFront(true);

        if (this._configuration.isModal) {
            _systemOverlay.reveal(_globalZAltitude - 1);
        }

        this._mainFrame.focus();
        this._triggerEventHook('launched');
        return this;
    }

    hideFrame(eventContext) {
        if (!this._isCurrentlyVisible) return;

        if (this._triggerEventHook('beforeShutdown', eventContext) === false) {
            return;
        }

        if (this._configuration.isModal) {
            _systemOverlay.conceal();
        }

        this._isCurrentlyVisible = false;
        this._mainFrame.style.display = 'none';

        if (this._configuration.isModal) {
            let highestOtherZ = 0;
            document.querySelectorAll('.display-frame').forEach(frameEl => {
                if (frameEl !== this._mainFrame) {
                    const z = parseInt(frameEl.style.zIndex, 10);
                    if (!isNaN(z)) highestOtherZ = Math.max(highestOtherZ, z);
                }
            });
            _globalZAltitude = highestOtherZ;
            _systemOverlay.adjustLayer(_globalZAltitude - 1);
        }

        this._triggerEventHook('shutDown', eventContext);
        return this;
    }

    destroyFrame() {
        if (_systemOverlay._backdropElement) _systemOverlay.purge();
        this._mainFrame.parentNode.removeChild(this._mainFrame);
        this._initialSourceElement.classList.remove('display-content-area', 'display-widget-content');
        this._initialSourceElement.style.display = '';
        if (this._originalElementTitle) {
            this._initialSourceElement.setAttribute('title', this._originalElementTitle);
        }
        // Basic cleanup of dynamically added event listeners
        if (this._mainFrame._movementCleanup) this._mainFrame._movementCleanup();
        if (this._mainFrame._resizingCleanup) this._mainFrame._resizingCleanup();
        return this;
    }

    getFrameElement() {
        return this._mainFrame;
    }

    isFrameVisible() {
        return this._isCurrentlyVisible;
    }

    bringToFront(forceMove, eventContext) {
        if ((this._configuration.isModal && !forceMove) || (!this._configuration.enableStacking && !this._configuration.isModal)) {
            this._triggerEventHook('focused', eventContext);
            return this;
        }

        if (this._configuration.initialZIndex > _globalZAltitude) {
            _globalZAltitude = this._configuration.initialZIndex;
        }

        if (this._configuration.isModal) {
            _globalZAltitude++;
            _systemOverlay.reveal(_globalZAltitude - 1);
        }

        _globalZAltitude++;
        this._mainFrame.style.zIndex = _globalZAltitude;
        this._configuration.initialZIndex = _globalZAltitude;

        const currentScroll = {
            top: this._contentPanel.scrollTop,
            left: this._contentPanel.scrollLeft
        };
        this._contentPanel.scrollTop = currentScroll.top;
        this._contentPanel.scrollLeft = currentScroll.left;

        this._triggerEventHook('focused', eventContext);
        return this;
    }

    // --- Shrink/Enlarge ---
    shrinkFrame(eventContext) {
        if (this._triggerEventHook('beforeMinimize', eventContext) === false) {
            return;
        }

        if (!this._isShrunk) {
            if (this._configuration.enableShrink && typeof this._configuration.enableShrink !== "boolean" && document.querySelector(this._configuration.enableShrink)) {
                const targetEl = document.querySelector(this._configuration.enableShrink);
                const restoreLink = document.createElement('a');
                restoreLink.href = '#';
                restoreLink.classList.add('display-link-button', 'display-rounded');
                restoreLink.title = 'Click to restore window';
                restoreLink.textContent = (this._titleDisplay.textContent.replace(/&nbsp;/, '') || 'Untitled Window');
                restoreLink.addEventListener('click', (e) => {
                    this.restoreShrunkFrame(e);
                    e.preventDefault();
                });
                targetEl.appendChild(restoreLink);
                this._savedGeometry.minimizeLink = restoreLink;
                this._mainFrame.style.display = 'none';
            } else {
                this._savedGeometry.height = this._mainFrame.offsetHeight;
                this._savedGeometry.width = this._mainFrame.offsetWidth;
                this._savedGeometry.top = this._mainFrame.style.top;
                this._savedGeometry.left = this._mainFrame.style.left;

                if (this._mainFrame._isMovable) {
                    this._mainFrame._wasMovable = true;
                    this._disableMovement();
                } else {
                    this._mainFrame._wasMovable = false;
                }
                if (this._mainFrame._isResizable) {
                    this._mainFrame._wasResizable = true;
                    this._disableResizing();
                } else {
                    this._mainFrame._wasResizable = false;
                }

                this._contentPanel.style.display = 'none';
                if (this._enlargeControl) this._enlargeControl.style.display = 'none';
                if (this._shrinkControl) {
                    this._shrinkControl.style.right = '1.8em';
                    this._shrinkControl.querySelector('span').classList.remove('shrink-icon');
                    this._shrinkControl.querySelector('span').classList.add('restore-icon-shrunk');
                    this._shrinkControl._originalClickHandler = this._shrinkControl._currentClickHandler;
                    this._shrinkControl._currentClickHandler = (e) => {
                        this.restoreShrunkFrame(e);
                        e.preventDefault();
                    };
                    this._shrinkControl.removeEventListener('click', this._shrinkControl._originalClickHandler);
                    this._shrinkControl.addEventListener('click', this._shrinkControl._currentClickHandler);
                }
                this._mainFrame.style.height = 'auto';
                this._mainFrame.style.width = 'auto';
            }
            this._isShrunk = true;
        }
        return this;
    }

    restoreShrunkFrame(eventContext) {
        if (this._triggerEventHook('beforeUnminimize', eventContext) === false) {
            return;
        }

        if (this._isShrunk) {
            if (this._savedGeometry.minimizeLink) {
                this._savedGeometry.minimizeLink.parentNode.removeChild(this._savedGeometry.minimizeLink);
                delete this._savedGeometry.minimizeLink;
                this._mainFrame.style.display = 'block';
                this.bringToFront();
            } else {
                this._mainFrame.style.height = this._savedGeometry.height + 'px';
                this._mainFrame.style.width = this._savedGeometry.width + 'px';
                this._mainFrame.style.top = this._savedGeometry.top;
                this._mainFrame.style.left = this._savedGeometry.left;
                this._contentPanel.style.display = 'block';
                if (this._enlargeControl) this._enlargeControl.style.display = 'block';
                if (this._shrinkControl) {
                    this._shrinkControl.style.right = '3.3em';
                    this._shrinkControl.querySelector('span').classList.add('shrink-icon');
                    this._shrinkControl.querySelector('span').classList.remove('restore-icon-shrunk');
                    this._shrinkControl.removeEventListener('click', this._shrinkControl._currentClickHandler);
                    this._shrinkControl.addEventListener('click', this._shrinkControl._originalClickHandler);
                    delete this._shrinkControl._originalClickHandler;
                    delete this._shrinkControl._currentClickHandler;
                }
                if (this._mainFrame._wasMovable) {
                    this._enableMovement();
                }
                if (this._mainFrame._wasResizable) {
                    this._enableResizing();
                }
            }
            this._isShrunk = false;
        }
        return this;
    }

    enlargeFrame(eventContext) {
        if (this._triggerEventHook('beforeMaximize', eventContext) === false) {
            return;
        }

        if (!this._isEnlarged) {
            this._savedGeometry.height = this._mainFrame.offsetHeight;
            this._savedGeometry.width = this._mainFrame.offsetWidth;
            this._savedGeometry.top = this._mainFrame.style.top;
            this._savedGeometry.left = this._mainFrame.style.left;

            if (this._mainFrame._isMovable) {
                this._mainFrame._wasMovable = true;
                this._disableMovement();
            } else {
                this._mainFrame._wasMovable = false;
            }
            if (this._mainFrame._isResizable) {
                this._mainFrame._wasResizable = true;
                this._disableResizing();
            } else {
                this._mainFrame._wasResizable = false;
            }

            this._mainFrame.style.height = (window.innerHeight - 8) + 'px';
            this._mainFrame.style.width = (window.innerWidth + 9) + 'px';
            this._mainFrame.style.top = '0px';
            this._mainFrame.style.left = '0px';
            if (this._shrinkControl) this._shrinkControl.style.display = 'none';

            if (this._enlargeControl) {
                this._enlargeControl.querySelector('span').classList.remove('enlarge-icon');
                this._enlargeControl.querySelector('span').classList.add('restore-icon-enlarged');
                this._enlargeControl._originalClickHandler = this._enlargeControl._currentClickHandler;
                this._enlargeControl._currentClickHandler = (e) => {
                    this.restoreEnlargedFrame(e);
                    e.preventDefault();
                };
                this._enlargeControl.removeEventListener('click', this._enlargeControl._originalClickHandler);
                this._enlargeControl.addEventListener('click', this._enlargeControl._currentClickHandler);
            }
            this._isEnlarged = true;
        }
        return this;
    }

    restoreEnlargedFrame(eventContext) {
        if (this._triggerEventHook('beforeUnmaximize', eventContext) === false) {
            return;
        }

        if (this._isEnlarged) {
            this._mainFrame.style.height = this._savedGeometry.height + 'px';
            this._mainFrame.style.width = this._savedGeometry.width + 'px';
            this._mainFrame.style.top = this._savedGeometry.top;
            this._mainFrame.style.left = this._savedGeometry.left;
            if (this._shrinkControl) this._shrinkControl.style.display = 'block';

            if (this._enlargeControl) {
                this._enlargeControl.querySelector('span').classList.add('enlarge-icon');
                this._enlargeControl.querySelector('span').classList.remove('restore-icon-enlarged');
                this._enlargeControl.removeEventListener('click', this._enlargeControl._currentClickHandler);
                this._enlargeControl.addEventListener('click', this._enlargeControl._originalClickHandler);
                delete this._enlargeControl._originalClickHandler;
                delete this._enlargeControl._currentClickHandler;
            }

            if (this._mainFrame._wasMovable) {
                this._enableMovement();
            }
            if (this._mainFrame._wasResizable) {
                this._enableResizing();
            }
            this._isEnlarged = false;
        }
        return this;
    }

    // --- Movement Implementation ---
    _enableMovement() {
        if (this._mainFrame._isMovable) return;
        this._mainFrame._isMovable = true;

        let isMoving = false;
        let startX, startY, initialLeft, initialTop;

        const handleMoveStart = (e) => {
            if (this._isEnlarged || e.button !== 0) return;

            isMoving = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = this._mainFrame.offsetLeft;
            initialTop = this._mainFrame.offsetTop;

            this._mainFrame.style.userSelect = 'none';
            this._topBar.style.cursor = 'grabbing';
            document.addEventListener('mousemove', handleMoving);
            document.addEventListener('mouseup', handleMoveEnd);
        };

        const handleMoving = (e) => {
            if (!isMoving) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            this._mainFrame.style.left = (initialLeft + dx) + 'px';
            this._mainFrame.style.top = (initialTop + dy) + 'px';
        };

        const handleMoveEnd = () => {
            isMoving = false;
            this._mainFrame.style.userSelect = '';
            this._topBar.style.cursor = '';
            document.removeEventListener('mousemove', handleMoving);
            document.removeEventListener('mouseup', handleMoveEnd);
        };

        this._topBar.addEventListener('mousedown', handleMoveStart);
        this._mainFrame._movementCleanup = () => {
            this._topBar.removeEventListener('mousedown', handleMoveStart);
            document.removeEventListener('mousemove', handleMoving);
            document.removeEventListener('mouseup', handleMoveEnd);
        };
    }

    _disableMovement() {
        if (!this._mainFrame._isMovable) return;
        this._mainFrame._movementCleanup();
        this._mainFrame._isMovable = false;
    }

    // --- Resizing Implementation ---
    _enableResizing() {
        if (this._mainFrame._isResizable) return;
        this._mainFrame._isResizable = true;

        const resizeHandle = document.createElement('div');
        resizeHandle.classList.add('display-resize-handle');
        this._mainFrame.appendChild(resizeHandle);

        let isResizing = false;
        let startX, startY, initialWidth, initialHeight;

        const handleResizeStart = (e) => {
            if (this._isEnlarged || this._isShrunk || e.button !== 0) return;
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            initialWidth = this._mainFrame.offsetWidth;
            initialHeight = this._mainFrame.offsetHeight;

            this._mainFrame.style.userSelect = 'none';
            document.addEventListener('mousemove', handleResizing);
            document.addEventListener('mouseup', handleResizeEnd);
            e.stopPropagation();
        };

        const handleResizing = (e) => {
            if (!isResizing) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newWidth = initialWidth + dx;
            let newHeight = initialHeight + dy;

            if (this._configuration.minimumWidthConstraint && newWidth < this._configuration.minimumWidthConstraint) newWidth = this._configuration.minimumWidthConstraint;
            if (this._configuration.maximumWidthConstraint && newWidth > this._configuration.maximumWidthConstraint) newWidth = this._configuration.maximumWidthConstraint;
            if (this._configuration.minimumHeightConstraint && newHeight < this._configuration.minimumHeightConstraint) newHeight = this._configuration.minimumHeightConstraint;
            if (this._configuration.maximumHeightConstraint && newHeight > this._configuration.maximumHeightConstraint) newHeight = this._configuration.maximumHeightConstraint;

            this._mainFrame.style.width = newWidth + 'px';
            this._mainFrame.style.height = newHeight + 'px';
        };

        const handleResizeEnd = () => {
            isResizing = false;
            this._mainFrame.style.userSelect = '';
            document.removeEventListener('mousemove', handleResizing);
            document.removeEventListener('mouseup', handleResizeEnd);
        };

        resizeHandle.addEventListener('mousedown', handleResizeStart);
        this._mainFrame._resizeHandle = resizeHandle;
        this._mainFrame._resizingCleanup = () => {
            resizeHandle.removeEventListener('mousedown', handleResizeStart);
            if (resizeHandle.parentNode) resizeHandle.parentNode.removeChild(resizeHandle);
            document.removeEventListener('mousemove', handleResizing);
            document.removeEventListener('mouseup', handleResizeEnd);
        };
    }

    _disableResizing() {
        if (!this._mainFrame._isResizable) return;
        this._mainFrame._resizingCleanup();
        this._mainFrame._isResizable = false;
    }
}

(function() {
    const componentStyles = document.createElement('style');
    componentStyles.textContent = `
        .display-frame {
            position: absolute;
            background: #ffffff;
            border: 1px solid #aaaaaa;
            border-radius: 4px;
            box-shadow: 0 5px 15px rgba(0,0,0,.5);
            padding: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }
        .display-widget {
            font-family: Arial, sans-serif;
            font-size: 1.1em;
        }
        .display-rounded {
            border-radius: 4px;
        }
        .display-header {
            background: #cccccc url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAxCAYAAABm9yqCAAAAK0lEQVQYV2NkgID/DAz/GzAx/xvAyMDw/w8DA0MAkFkYmAAQAAADXQIAAAwAT049g7L330wAAAAASUVORK5CYII=) 50% 50% repeat-x;
            color: #222222;
            font-weight: bold;
            padding: 0.6em 1em;
            position: relative;
            cursor: move;
            border-bottom: 1px solid #aaaaaa;
            display: flex;
            align-items: center;
        }
        .display-clear-float::before,
        .display-clear-float::after {
            content: "";
            display: table;
        }
        .display-clear-float::after {
            clear: both;
        }
        .display-caption {
            flex-grow: 1;
            margin: 0;
            line-height: 1.4;
            font-size: 1em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .display-header a {
            float: right;
            margin: -0.1em 0 -0.1em 0.8em;
            padding: 0.2em;
            height: 16px;
            width: 16px;
            text-decoration: none;
            cursor: pointer;
            border: 1px solid transparent;
            border-radius: 4px;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .display-header a:hover,
        .display-header a.display-state-hover,
        .display-header a.display-state-focus {
            border-color: #999999;
            background: #dadada url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAxCAYAAABm9yqCAAAAK0lEQVQYV2NkgID/DAz/GzAx/xvAyMDw/w8DA0MAkFkYmAAQAAADXQIAAAwAT049g7L330wAAAAASUVORK5CYII=) 50% 50% repeat-x;
            color: #212121;
        }
        .display-icon {
            display: block;
            text-indent: -99999px;
            overflow: hidden;
            background-repeat: no-repeat;
            width: 16px;
            height: 16px;
            background-position: center;
        }
        .close-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'); }
        .shrink-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>'); }
        .enlarge-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'); }
        .restore-icon-shrunk { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"></path><path d="M12 5L5 12L12 19"></path></svg>'); transform: rotate(90deg); }
        .restore-icon-enlarged { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m-18 0v3a2 2 0 0 0 2 2h3"></path></svg>'); }

        .display-content-area {
            padding: 1.2em;
            flex-grow: 1;
            overflow: auto;
            background: #ffffff;
            color: #333333;
        }
        .display-widget-content {
            border: 0;
            padding: 0;
        }
        .display-action-strip {
            padding: 0.8em 1em;
            text-align: right;
            border-top: 1px solid #aaaaaa;
            background: #f6f6f6 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAxCAYAAABm9yqCAAAAK0lEQVQYV2NkgID/DAz/GzAx/xvAyMDw/w8DA0MAkFkYmAAQAAADXQIAAAwAT049g7L330wAAAAASUVORK5CYII=) 50% 50% repeat-x;
        }
        .display-action-button {
            margin-left: 0.5em;
            padding: 0.4em 1em;
            text-decoration: none;
            cursor: pointer;
            position: relative;
            text-align: center;
            border-radius: 4px;
            background: #e6e6e6 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAxCAYAAABm9yqCAAAAK0lEQVQYV2NkgID/DAz/GzAx/xvAyMDw/w8DA0MAkFkYmAAQAAADXQIAAAwAT049g7L330wAAAAASUVORK5CYII=) 50% 50% repeat-x;
            font-weight: normal;
            color: #555555;
            border: 1px solid #d3d3d3;
            outline: none;
        }
        .display-action-button:hover {
            border: 1px solid #999999;
            background: #dadada url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAxCAYAAABm9yqCAAAAK0lEQVQYV2NkgID/DAz/GzAx/xvAyMDw/w8DA0MAkFkYmAAQAAADXQIAAAwAT049g7L330wAAAAASUVORK5CYII=) 50% 50% repeat-x;
            font-weight: normal;
            color: #212121;
        }
        .display-modal-backdrop {
            background-color: rgba(0, 0, 0, 0.5);
        }
        .display-resize-handle {
            position: absolute;
            width: 12px;
            height: 12px;
            bottom: 0px;
            right: 0px;
            cursor: se-resize;
            background: rgba(0,0,0,0.1);
            border-radius: 0 0 4px 0;
        }
    `;
    document.head.appendChild(componentStyles);
})();