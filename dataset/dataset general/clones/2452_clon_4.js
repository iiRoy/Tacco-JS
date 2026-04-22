const _ = {
    select: (selector, context = document) => context.querySelectorAll(selector),
    selectOne: (selector, context = document) => context.querySelector(selector),
    create: (tagName, attributes = {}, children = []) => {
        const el = document.createElement(tagName);
        for (const key in attributes) {
            if (key === 'className') {
                el.className = attributes[key];
            } else if (key === 'dataset') {
                for (const dataKey in attributes[key]) {
                    el.dataset[dataKey] = attributes[key][dataKey];
                }
            } else if (key === 'style') {
                for (const styleKey in attributes[key]) {
                    el.style[styleKey] = attributes[key][styleKey];
                }
            } else if (key === 'innerHTML') {
                el.innerHTML = attributes[key];
            } else {
                el.setAttribute(key, attributes[key]);
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
    on: (element, eventName, handler) => {
        if (element instanceof NodeList) {
            element.forEach(el => el.addEventListener(eventName, handler));
        } else if (element) {
            element.addEventListener(eventName, handler);
        }
    },
    off: (element, eventName, handler) => {
        if (element instanceof NodeList) {
            element.forEach(el => el.removeEventListener(eventName, handler));
        } else if (element) {
            element.removeEventListener(eventName, handler);
        }
    },
    toggleClass: (element, className, force) => {
        if (element) {
            if (force !== undefined) {
                element.classList.toggle(className, force);
            } else {
                element.classList.toggle(className);
            }
        }
    },
    addClass: (element, className) => {
        if (element) {
            element.classList.add(className);
        }
    },
    removeClass: (element, className) => {
        if (element) {
            element.classList.remove(className);
        }
    },
    hasClass: (element, className) => element ? element.classList.contains(className) : false,
    fadeOut: (element, duration = 200, callback) => {
        if (!element || element.style.display === 'none') {
            if (callback) callback();
            return;
        }
        element.style.transition = `opacity ${duration}ms ease-out`;
        element.style.opacity = '0';
        const transitionEndHandler = () => {
            element.style.display = 'none';
            element.style.transition = '';
            element.removeEventListener('transitionend', transitionEndHandler);
            if (callback) callback();
        };
        const timeoutId = setTimeout(transitionEndHandler, duration + 50);
        element.addEventListener('transitionend', function handler(e) {
            if (e.target === element && e.propertyName === 'opacity') {
                clearTimeout(timeoutId);
                transitionEndHandler();
                element.removeEventListener('transitionend', handler);
            }
        });
    },
    fadeIn: (element, duration = 200, display = 'block', callback) => {
        if (!element || (element.style.display === display && element.style.opacity === '1')) {
            if (callback) callback();
            return;
        }
        element.style.opacity = '0';
        element.style.display = display;
        element.style.transition = `opacity ${duration}ms ease-in`;
        element.offsetHeight; 
        element.style.opacity = '1';
        const transitionEndHandler = () => {
            element.style.transition = '';
            element.removeEventListener('transitionend', transitionEndHandler);
            if (callback) callback();
        };
        const timeoutId = setTimeout(transitionEndHandler, duration + 50);
        element.addEventListener('transitionend', function handler(e) {
            if (e.target === element && e.propertyName === 'opacity') {
                clearTimeout(timeoutId);
                transitionEndHandler();
                element.removeEventListener('transitionend', handler);
            }
        });
    },
    empty: (element) => {
        if (element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
    },
    append: (element, content) => {
        if (element) {
            if (typeof content === 'string') {
                element.insertAdjacentHTML('beforeend', content);
            } else if (content instanceof Node) {
                element.appendChild(content);
            } else if (content instanceof NodeList || Array.isArray(content)) {
                content.forEach(node => element.appendChild(node));
            }
        }
    },
    attr: (element, name, value) => {
        if (element) {
            if (value === undefined) {
                return element.getAttribute(name);
            } else {
                element.setAttribute(name, value);
            }
        }
    },
    css: (element, property, value) => {
        if (!element) return;
        if (element instanceof NodeList || Array.isArray(element)) {
             element.forEach(el => _.css(el, property, value));
             return;
        }
        if (typeof property === 'object') {
            for (const key in property) {
                element.style[key] = property[key];
            }
        } else if (value === undefined) {
            return getComputedStyle(element)[property];
        } else {
            element.style[property] = value;
        }
    }
};

const OverlayManager = (function() {
    let _configuration = {
        transparency: 0.8,
        showBackdrop: true,
        spinnerPath: '/facebox/loading.gif',
        dismissIconPath: '/facebox/closelabel.gif',
        supportedMediaFormats: ['png', 'jpg', 'jpeg', 'gif'],
        _initialized: false,
        _mediaRegex: null
    };

    let _elements = {
        mainContainer: null,
        dialogFrame: null,
        contentWrapper: null,
        footerSection: null,
        closeButton: null,
        loadingIndicator: null,
        backdropLayer: null,
        bodyContainer: null
    };

    const _eventDispatcher = new EventTarget();

    const _emitEvent = (name, detail = {}) => {
        _eventDispatcher.dispatchEvent(new CustomEvent(`modal:${name}`, { detail }));
    };

    const _createBaseStructure = () => {
        _elements.mainContainer = _.create('div', {
            id: 'modal-container',
            role: 'dialog',
            'aria-modal': 'true',
            style: { display: 'none' }
        });

        _elements.dialogFrame = _.create('div', { className: 'modal-dialog' }, [
            _.create('div', { className: 'modal-border top-left' }),
            _.create('div', { className: 'modal-border top-center' }),
            _.create('div', { className: 'modal-border top-right' }),
            
            _.create('div', { className: 'modal-middle-row-wrapper' }, [
                _.create('div', { className: 'modal-border middle-left' }),
                _elements.bodyContainer = _.create('div', { className: 'modal-body-container' }, [
                    _elements.contentWrapper = _.create('div', { className: 'modal-content-area' }),
                    _elements.footerSection = _.create('div', { className: 'modal-footer-area' }, [
                        _elements.closeButton = _.create('button', {
                            className: 'modal-close-button',
                            title: 'Close',
                            type: 'button'
                        }, [
                            _.create('img', {
                                src: _configuration.dismissIconPath,
                                alt: 'Close',
                                className: 'modal-close-icon'
                            })
                        ])
                    ])
                ]),
                _.create('div', { className: 'modal-border middle-right' })
            ]),

            _.create('div', { className: 'modal-border bottom-left' }),
            _.create('div', { className: 'modal-border bottom-center' }),
            _.create('div', { className: 'modal-border bottom-right' })
        ]);

        _.append(_elements.mainContainer, _elements.dialogFrame);
        document.body.appendChild(_elements.mainContainer);

        _elements.backdropLayer = _.create('div', {
            id: 'modal-backdrop',
            style: { display: 'none' }
        });
        document.body.appendChild(_elements.backdropLayer);

        _.on(_elements.closeButton, 'click', OverlayManager.dismiss);
        _.on(_elements.backdropLayer, 'click', OverlayManager.dismiss);
    };

    const _performSetup = (options) => {
        if (_configuration._initialized) return;

        _emitEvent('setup');

        _configuration._initialized = true;
        _normalizeConfiguration(options);

        _createBaseStructure();

        _configuration._mediaRegex = new RegExp(`\\.(${_configuration.supportedMediaFormats.join('|')})$`, 'i');
        
        new Image().src = _configuration.dismissIconPath;
        new Image().src = _configuration.spinnerPath;
        _elements.dialogFrame.querySelectorAll('.modal-border').forEach(borderEl => {
            const bgImage = _.css(borderEl, 'backgroundImage');
            if (bgImage && bgImage !== 'none') {
                const urlMatch = bgImage.match(/url\(['"]?(.+?)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                    new Image().src = urlMatch[1];
                }
            }
        });
    };

    const _normalizeConfiguration = (options) => {
        if (options) {
            Object.assign(_configuration, options);
        }

        _configuration.spinnerPath = _configuration.loading_image || _configuration.spinnerPath;
        _configuration.dismissIconPath = _configuration.close_image || _configuration.dismissIconPath;
        _configuration.supportedMediaFormats = _configuration.image_types || _configuration.supportedMediaFormats;
    };

    const _fetchScrollPosition = () => {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
        };
    };

    const _fetchViewportHeight = () => {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    };

    const _handleKeyboardInput = (e) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
            OverlayManager.dismiss();
            e.preventDefault();
        }
    };

    const _shouldSkipBackdrop = () => {
        return _configuration.showBackdrop === false || _configuration.transparency === null;
    };

    const _renderBackdrop = () => {
        if (_shouldSkipBackdrop()) return;

        _.addClass(_elements.backdropLayer, 'modal-backdrop-active');
        _.css(_elements.backdropLayer, 'opacity', _configuration.transparency);
        _.fadeIn(_elements.backdropLayer, 200, 'block');
    };

    const _removeBackdrop = () => {
        if (_shouldSkipBackdrop()) return;

        _.fadeOut(_elements.backdropLayer, 200, () => {
            _.removeClass(_elements.backdropLayer, 'modal-backdrop-active');
        });
    };

    const _positionContainer = () => {
        const scrollY = _fetchScrollPosition().y;
        const viewportHeight = _fetchViewportHeight();
        const container = _elements.mainContainer;
        const dialog = _elements.dialogFrame;

        const initialDisplay = _.css(container, 'display');
        _.css(container, 'display', 'block');
        const dialogWidth = dialog.offsetWidth;
        _.css(container, 'display', initialDisplay);

        const leftPos = (window.innerWidth / 2) - (dialogWidth / 2);
        const topPos = scrollY + (viewportHeight / 10);

        _.css(container, {
            position: 'absolute',
            top: `${topPos}px`,
            left: `${leftPos}px`
        });
    };

    const _resolveContentSource = (sourceIdentifier, customClass) => {
        if (sourceIdentifier.startsWith('#')) {
            const targetElement = _.selectOne(sourceIdentifier);
            if (targetElement) {
                OverlayManager.displayContent(targetElement.cloneNode(true), customClass);
            } else {
                OverlayManager.displayContent(`Error: Element with ID "${sourceIdentifier}" not found.`, 'error-content');
            }
        }
        else if (sourceIdentifier.match(_configuration._mediaRegex)) {
            _handleImageSource(sourceIdentifier, customClass);
        }
        else {
            _handleRemoteSource(sourceIdentifier, customClass);
        }
    };

    const _handleImageSource = (imagePath, customClass) => {
        const img = new Image();
        img.onload = () => {
            const imageWrapper = _.create('div', { className: 'modal-image-wrapper' }, [
                _.create('img', { src: imagePath, alt: 'Modal Image' })
            ]);
            OverlayManager.displayContent(imageWrapper, customClass);
        };
        img.onerror = () => {
            OverlayManager.displayContent('Failed to load image.', 'error-content');
        };
        img.src = imagePath;
    };

    const _handleRemoteSource = (remoteURL, customClass) => {
        fetch(remoteURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(htmlContent => {
                OverlayManager.displayContent(htmlContent, customClass);
            })
            .catch(error => {
                console.error('Error fetching modal content:', error);
                OverlayManager.displayContent(`Failed to load content from ${remoteURL}.`, 'error-content');
            });
    };

    return {
        onEvent: (eventName, handler) => _eventDispatcher.addEventListener(`modal:${eventName}`, handler),
        offEvent: (eventName, handler) => _eventDispatcher.removeEventListener(`modal:${eventName}`, handler),

        open: (contentData, customClass = '') => {
            _performSetup();
            _.on(document, 'keydown', _handleKeyboardInput);

            OverlayManager.showSpinner();

            if (typeof contentData === 'object') {
                if (contentData.ajax) _handleRemoteSource(contentData.ajax, customClass);
                else if (contentData.image) _handleImageSource(contentData.image, customClass);
                else if (contentData.div) _resolveContentSource(contentData.div, customClass);
            } else if (typeof contentData === 'function') {
                contentData.call(null, OverlayManager);
            } else {
                OverlayManager.displayContent(contentData, customClass);
            }
        },

        showSpinner: () => {
            _performSetup();

            if (_elements.loadingIndicator && _.hasClass(_elements.loadingIndicator, 'active-spinner')) {
                return;
            }

            _renderBackdrop();

            _.empty(_elements.contentWrapper);
            if (_elements.bodyContainer) {
                _.css([_elements.contentWrapper, _elements.footerSection], 'display', 'none');
            }
            
            if (!_elements.loadingIndicator) {
                _elements.loadingIndicator = _.create('div', { className: 'modal-loading-indicator' }, [
                    _.create('img', { src: _configuration.spinnerPath, alt: 'Loading...' })
                ]);
                _.append(_elements.contentWrapper, _elements.loadingIndicator);
            } else {
                if (!_elements.loadingIndicator.parentNode) {
                    _.append(_elements.contentWrapper, _elements.loadingIndicator);
                }
            }
            _.addClass(_elements.loadingIndicator, 'active-spinner');
            _.css(_elements.loadingIndicator, 'display', 'block');

            _positionContainer();
            _.fadeIn(_elements.mainContainer, 0, 'block');

            _emitEvent('loading');
        },

        displayContent: (content, customClass = '') => {
            _emitEvent('beforeDisplay');

            if (_elements.contentWrapper.dataset.currentClass) {
                _.removeClass(_elements.contentWrapper, _elements.contentWrapper.dataset.currentClass);
                delete _elements.contentWrapper.dataset.currentClass;
            }

            if (customClass) {
                _.addClass(_elements.contentWrapper, customClass);
                _elements.contentWrapper.dataset.currentClass = customClass;
            }

            _.empty(_elements.contentWrapper);
            _.append(_elements.contentWrapper, content);

            if (_elements.loadingIndicator) {
                _.removeClass(_elements.loadingIndicator, 'active-spinner');
                _.css(_elements.loadingIndicator, 'display', 'none');
            }

            if (_elements.bodyContainer) {
                _.css([_elements.contentWrapper, _elements.footerSection], 'display', 'block');
            }
            
            _positionContainer();
            _.fadeIn(_elements.mainContainer, 'normal');

            _emitEvent('display');
            _emitEvent('afterDisplay');
        },

        dismiss: () => {
            _emitEvent('dismiss');
            
            _.off(document, 'keydown', _handleKeyboardInput);
            
            _.fadeOut(_elements.mainContainer, 200, () => {
                if (_elements.contentWrapper.dataset.currentClass) {
                    _.removeClass(_elements.contentWrapper, _elements.contentWrapper.dataset.currentClass);
                    delete _elements.contentWrapper.dataset.currentClass;
                }
                _.empty(_elements.contentWrapper);
                _removeBackdrop();
                if (_elements.loadingIndicator) {
                    _.removeClass(_elements.loadingIndicator, 'active-spinner');
                    _.css(_elements.loadingIndicator, 'display', 'none');
                }
            });
            return false;
        },

        attachTriggers: (selector = 'a[data-modal-trigger]', options = {}) => {
            _performSetup(options);

            _.select(selector).forEach(triggerElement => {
                _.on(triggerElement, 'click', (e) => {
                    e.preventDefault();
                    const source = _.attr(triggerElement, 'href');
                    let customClass = _.attr(triggerElement, 'data-modal-class');
                    if (!customClass && triggerElement.rel) {
                        const relMatch = triggerElement.rel.match(/modal\[?\.(\w+)\]?/);
                        if (relMatch) customClass = relMatch[1];
                    }
                    
                    if (source) {
                        OverlayManager.open(source, customClass);
                    }
                });
            });
        },

        configure: (options) => {
            _normalizeConfiguration(options);
            if (_configuration._initialized) {
                if (_elements.closeButton) {
                    const closeImg = _.selectOne('.modal-close-icon', _elements.closeButton);
                    if (closeImg) {
                        _.attr(closeImg, 'src', _configuration.dismissIconPath);
                    }
                }
                new Image().src = _configuration.dismissIconPath;
                new Image().src = _configuration.spinnerPath;
            }
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    OverlayManager.attachTriggers('a[data-modal-trigger], a[rel*="modal"]'); 
});

window.OverlayManager = OverlayManager;