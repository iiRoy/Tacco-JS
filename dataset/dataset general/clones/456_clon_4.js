(function() {
    let _activeModalInstance = null;
    let _nextModalQueuedInstance = null;
    let _isProcessLocked = false;
    let _systemOverlayElement = null;

    let _originalBodyOverflowStyle = '';
    let _originalBodyMarginRightStyle = '';
    let _originalBodyMarginBottomStyle = '';
    let _originalScrollHorizontal = 0;
    let _originalScrollVertical = 0;
    let _previousActiveElement = null;

    const _boxDefaults = {
        transitionTime: 200,
        overlayAlpha: 0.6,
        overlayShade: '#888',
        baseLayerIndex: 9000,
        closeActionClass: 'eb-close-button',
        onBeforeShow: null,
        onShow: null,
        onBeforeHide: null,
        onHide: null,
        placementStrategy: 'center',
        overrideExisting: false
    };

    function _dispatchBoxEvent(targetElement, eventName, eventDetails = {}) {
        const customEvent = new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true,
            detail: eventDetails
        });
        targetElement.dispatchEvent(customEvent);
        return customEvent;
    }

    function _handleSystemKeydown(event) {
        if (_activeModalInstance && event.key === 'Escape') {
            event.preventDefault();
            _activeModalInstance.attemptToClose();
        }
    }

    function _handleSystemFocusin(event) {
        if (_activeModalInstance && !_activeModalInstance.modalElement.contains(event.target)) {
            event.preventDefault();
            _activeModalInstance.setInitialFocus();
        }
    }

    function _blockWindowScroll() {
        window.scrollTo(_originalScrollHorizontal, _originalScrollVertical);
    }

    function _manageBodyScrollbar(action) {
        const body = document.body;

        if (action === 'disable') {
            _originalBodyOverflowStyle = body.style.overflow;
            _originalBodyMarginRightStyle = body.style.marginRight;
            _originalBodyMarginBottomStyle = body.style.marginBottom;
            _originalScrollHorizontal = window.scrollX || window.pageXOffset;
            _originalScrollVertical = window.scrollY || window.pageYOffset;

            const currentClientWidth = body.clientWidth;
            const currentClientHeight = body.clientHeight;

            body.style.overflow = 'hidden';

            const scrollbarWidthDelta = body.clientWidth - currentClientWidth;
            const scrollbarHeightDelta = body.clientHeight - currentClientHeight;

            if (scrollbarWidthDelta < 0) {
                body.style.marginRight = `${(parseFloat(_originalBodyMarginRightStyle || 0) || 0) - scrollbarWidthDelta}px`;
            }
            if (scrollbarHeightDelta < 0) {
                body.style.marginBottom = `${(parseFloat(_originalBodyMarginBottomStyle || 0) || 0) - scrollbarHeightDelta}px`;
            }

            window.addEventListener('scroll', _blockWindowScroll, { passive: false });
        } else {
            body.style.overflow = _originalBodyOverflowStyle;
            body.style.marginRight = _originalBodyMarginRightStyle;
            body.style.marginBottom = _originalBodyMarginBottomStyle;
            window.removeEventListener('scroll', _blockWindowScroll);
            window.scrollTo(_originalScrollHorizontal, _originalScrollVertical);
        }
    }

    class BoxController {
        constructor(domElement, initialConfiguration = {}) {
            if (!(domElement instanceof HTMLElement)) {
                throw new Error('Provided element is not a valid HTML element.');
            }
            this.modalElement = domElement;
            this.currentSettings = {};
            this._applyConfiguration(initialConfiguration);
            this._setupModalElement();
        }

        _applyConfiguration(newOptions) {
            this.currentSettings = { ..._boxDefaults, ...this.currentSettings, ...newOptions };

            this.currentSettings.baseLayerIndex = this.currentSettings.baseLayerIndex || (this.currentSettings.overlayBaseLayerIndex || _boxDefaults.baseLayerIndex) + 1;
            this.currentSettings.overlayBaseLayerIndex = this.currentSettings.overlayBaseLayerIndex || this.currentSettings.baseLayerIndex - 1;

            ['onBeforeShow', 'onShow', 'onBeforeHide', 'onHide'].forEach(eventName => {
                const eventType = eventName.replace('on', 'eb:').toLowerCase();
                if (typeof this.currentSettings[eventName] === 'function') {
                    this.modalElement.removeEventListener(eventType, this.currentSettings[eventName]);
                    this.modalElement.addEventListener(eventType, this.currentSettings[eventName]);
                }
            });
        }

        _setupModalElement() {
            this.modalElement.style.position = 'fixed';
            this.modalElement.style.display = 'none';
            this.modalElement.style.zIndex = this.currentSettings.baseLayerIndex;
            this.modalElement.classList.add('eb-dialog-component');

            const closeTriggers = this.modalElement.querySelectorAll(`.${this.currentSettings.closeActionClass}`);
            closeTriggers.forEach(trigger => {
                trigger.removeEventListener('click', this.attemptToClose.bind(this));
                trigger.addEventListener('click', this.attemptToClose.bind(this));
            });

            this.modalElement.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        }

        _getOrCreateOverlay() {
            if (!_systemOverlayElement) {
                _systemOverlayElement = document.createElement('div');
                _systemOverlayElement.classList.add('eb-system-overlay');
                Object.assign(_systemOverlayElement.style, {
                    position: 'fixed',
                    left: '0',
                    top: '0',
                    width: '100%',
                    height: '150%',
                    display: 'none',
                    opacity: '0',
                    transition: `opacity ${this.currentSettings.transitionTime}ms ease-out`,
                    pointerEvents: 'auto'
                });
                document.body.appendChild(_systemOverlayElement);
                _systemOverlayElement.addEventListener('click', this.attemptToClose.bind(this));
                _systemOverlayElement.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
            }
            _systemOverlayElement.style.backgroundColor = this.currentSettings.overlayShade;
            _systemOverlayElement.style.zIndex = this.currentSettings.overlayBaseLayerIndex;
            return _systemOverlayElement;
        }

        _placeModalElement() {
            if (typeof this.currentSettings.placementStrategy === 'function') {
                const customCoordinates = this.currentSettings.placementStrategy.call(this.modalElement);
                if (customCoordinates && typeof customCoordinates.x === 'number' && typeof customCoordinates.y === 'number') {
                    this.modalElement.style.left = `${customCoordinates.x}px`;
                    this.modalElement.style.top = `${customCoordinates.y}px`;
                    this.modalElement.style.marginLeft = '';
                    this.modalElement.style.marginTop = '';
                    this.modalElement.style.transform = '';
                }
            } else if (typeof this.currentSettings.placementStrategy === 'object' && this.currentSettings.placementStrategy !== null) {
                this.modalElement.style.left = `${this.currentSettings.placementStrategy.x}px`;
                this.modalElement.style.top = `${this.currentSettings.placementStrategy.y}px`;
                this.modalElement.style.marginLeft = '';
                this.modalElement.style.marginTop = '';
                this.modalElement.style.transform = '';
            } else {
                this.modalElement.style.left = '50%';
                this.modalElement.style.top = '50%';
                this.modalElement.style.transform = 'translate(-50%, -50%)';
                this.modalElement.style.marginLeft = '';
                this.modalElement.style.marginTop = '';
            }
        }

        setInitialFocus() {
            const focusableContent = this.modalElement.querySelectorAll('a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])');
            const firstFocusable = [...focusableContent].find(el => !el.disabled && el.offsetParent !== null);
            if (firstFocusable) {
                firstFocusable.focus();
            } else {
                this.modalElement.focus();
            }
        }

        present(options = {}) {
            if (_isProcessLocked) {
                if (this.currentSettings.overrideExisting && _activeModalInstance && _activeModalInstance !== this) {
                    _nextModalQueuedInstance = this;
                    _activeModalInstance.attemptToClose();
                }
                return;
            }

            if (_activeModalInstance === this) {
                return;
            }

            if (_activeModalInstance && _activeModalInstance !== this) {
                if (this.currentSettings.overrideExisting) {
                    _nextModalQueuedInstance = this;
                    _activeModalInstance.attemptToClose();
                }
                return;
            }

            this._applyConfiguration(options);

            const event = _dispatchBoxEvent(this.modalElement, 'eb:beforeshow');
            if (event.defaultPrevented) {
                return;
            }

            _isProcessLocked = true;
            _activeModalInstance = this;
            _previousActiveElement = document.activeElement;

            _manageBodyScrollbar('disable');
            window.addEventListener('resize', this._placeModalElement.bind(this));
            document.addEventListener('keydown', _handleSystemKeydown);
            document.addEventListener('focusin', _handleSystemFocusin);

            const overlay = this._getOrCreateOverlay();
            overlay.style.display = 'block';
            overlay.offsetWidth;
            overlay.style.opacity = this.currentSettings.overlayAlpha;

            this.modalElement.style.display = 'block';
            this._placeModalElement();
            this.modalElement.offsetWidth;
            this.modalElement.style.opacity = '0';
            this.modalElement.style.transition = `opacity ${this.currentSettings.transitionTime}ms ease-out`;
            this.modalElement.style.opacity = '1';

            let completedTransitions = 0;
            const totalTransitionsExpected = 1 + (_systemOverlayElement ? 1 : 0);

            const transitionEndHandler = (e) => {
                if (e.target === this.modalElement || (e.target === _systemOverlayElement && _systemOverlayElement)) {
                    completedTransitions++;
                    if (completedTransitions === totalTransitionsExpected) {
                        this.modalElement.removeEventListener('transitionend', transitionEndHandler);
                        if (_systemOverlayElement) _systemOverlayElement.removeEventListener('transitionend', transitionEndHandler);
                        _isProcessLocked = false;
                        this.setInitialFocus();
                        _dispatchBoxEvent(this.modalElement, 'eb:show');
                    }
                }
            };
            this.modalElement.addEventListener('transitionend', transitionEndHandler);
            if (_systemOverlayElement) _systemOverlayElement.addEventListener('transitionend', transitionEndHandler);
            setTimeout(() => {
                if (_isProcessLocked && _activeModalInstance === this) {
                    if (completedTransitions < totalTransitionsExpected) {
                        transitionEndHandler({ target: this.modalElement });
                        if (_systemOverlayElement) transitionEndHandler({ target: _systemOverlayElement });
                    }
                }
            }, this.currentSettings.transitionTime + 50);
        }

        attemptToClose() {
            if (_isProcessLocked || _activeModalInstance !== this) {
                return;
            }

            const event = _dispatchBoxEvent(this.modalElement, 'eb:beforehide');
            if (event.defaultPrevented) {
                _nextModalQueuedInstance = null;
                return;
            }

            _isProcessLocked = true;

            window.removeEventListener('resize', this._placeModalElement.bind(this));
            document.removeEventListener('keydown', _handleSystemKeydown);
            document.removeEventListener('focusin', _handleSystemFocusin);

            this.modalElement.style.opacity = '0';
            if (_systemOverlayElement) _systemOverlayElement.style.opacity = '0';

            let completedTransitions = 0;
            const totalTransitionsExpected = 1 + (_systemOverlayElement ? 1 : 0);

            const transitionEndHandler = (e) => {
                if (e.target === this.modalElement || (e.target === _systemOverlayElement && _systemOverlayElement)) {
                    completedTransitions++;
                    if (completedTransitions === totalTransitionsExpected) {
                        this.modalElement.removeEventListener('transitionend', transitionEndHandler);
                        if (_systemOverlayElement) _systemOverlayElement.removeEventListener('transitionend', transitionEndHandler);

                        this.modalElement.style.display = 'none';
                        if (_systemOverlayElement) _systemOverlayElement.style.display = 'none';
                        this.modalElement.style.transition = '';

                        _manageBodyScrollbar('enable');

                        if (_previousActiveElement && _previousActiveElement.focus) {
                            _previousActiveElement.focus();
                        }
                        _previousActiveElement = null;
                        _activeModalInstance = null;
                        _isProcessLocked = false;
                        _dispatchBoxEvent(this.modalElement, 'eb:hide');

                        if (_nextModalQueuedInstance) {
                            setTimeout(() => {
                                const nextBox = _nextModalQueuedInstance;
                                _nextModalQueuedInstance = null;
                                nextBox.present();
                            }, 0);
                        }
                    }
                }
            };
            this.modalElement.addEventListener('transitionend', transitionEndHandler);
            if (_systemOverlayElement) _systemOverlayElement.addEventListener('transitionend', transitionEndHandler);
            setTimeout(() => {
                if (_isProcessLocked && _activeModalInstance === this) {
                    if (completedTransitions < totalTransitionsExpected) {
                        transitionEndHandler({ target: this.modalElement });
                        if (_systemOverlayElement) transitionEndHandler({ target: _systemOverlayElement });
                    }
                }
            }, this.currentSettings.transitionTime + 50);
        }

        modifyConfiguration(settingKey, settingValue) {
            if (settingKey === undefined && settingValue === undefined) {
                return { ...this.currentSettings };
            }
            if (typeof settingKey === 'object') {
                this._applyConfiguration(settingKey);
            } else if (typeof settingKey === 'string') {
                const updatedOptions = {};
                updatedOptions[settingKey] = settingValue;
                this._applyConfiguration(updatedOptions);
            }
            return this.currentSettings[settingKey];
        }
    }

    const _modalInstances = new WeakMap();

    const ModalControlSystem = {
        initializeBox: function(targetElement, options) {
            let instance = _modalInstances.get(targetElement);
            if (!instance) {
                instance = new BoxController(targetElement, options);
                _modalInstances.set(targetElement, instance);
            } else {
                instance.modifyConfiguration(options);
            }
            return instance;
        },

        displayBox: function(targetElement, options) {
            const instance = this.initializeBox(targetElement, options);
            instance.present();
        },

        concealBox: function(targetElement) {
            const instance = _modalInstances.get(targetElement);
            if (instance) {
                instance.attemptToClose();
            }
        },

        adjustBoxConfig: function(targetElement, key, value) {
            const instance = this.initializeBox(targetElement);
            return instance.modifyConfiguration(key, value);
        }
    };

    function manageEnlightenBox(targetElements, action, ...parameters) {
        if (!targetElements) return;

        const elementsToProcess = NodeList.prototype.isPrototypeOf(targetElements) ? targetElements : [targetElements];

        elementsToProcess.forEach(element => {
            if (!(element instanceof HTMLElement)) return;

            switch (action) {
                case 'show':
                    ModalControlSystem.displayBox(element, parameters[0]);
                    break;
                case 'hide':
                    ModalControlSystem.concealBox(element);
                    break;
                case 'configure':
                    ModalControlSystem.adjustBoxConfig(element, parameters[0], parameters[1]);
                    break;
                default:
                    ModalControlSystem.initializeBox(element, action);
                    break;
            }
        });

        return elementsToProcess;
    }

    window.enlightenBox = manageEnlightenBox;

})();