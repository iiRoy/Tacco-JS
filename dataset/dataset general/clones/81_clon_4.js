(function() {
    class DynamicPanelDisplay {
        constructor(hostElement, configurationOptions) {
            this.containerElement = hostElement;
            this.internalSettings = this.configureDefaults(configurationOptions);
            this.trackComponent = null;
            this.itemComponents = [];
            this.firstItemReference = null;
            this.currentDisplayIndex = 0;
            this.instanceIdentifier = '';
            this.nextNavigationControl = null;
            this.previousNavigationControl = null;
            this.maximumItemHeight = 0;
            this.displayWindowWidth = 0;
            this.visibleItemCount = 0;
            this.singleItemWidth = 0;
            this.activityOngoing = false;
            this.systemReady = false;
            this.horizontalShift = 0;

            this.moveForward = this.moveForward.bind(this);
            this.moveBackward = this.moveBackward.bind(this);
            this.handleItemActivation = this.handleItemActivation.bind(this);
            this.deactivateMediaViewer = this.deactivateMediaViewer.bind(this);
            this.animationCompletion = this.animationCompletion.bind(this);
            this.nextViewerImage = this.nextViewerImage.bind(this);
            this.previousViewerImage = this.previousViewerImage.bind(this);

            window.addEventListener('load', () => this.initializeDisplay());
        }

        configureDefaults(userOptions) {
            const defaultConfiguration = {
                nextButtonSelector: '.next-control',
                prevButtonSelector: '.prev-control',
                hideControlsWhenStatic: false,
                displayMode: false,
                autoAdjustHeight: false,
                animationDurationMs: 1000,
                showDiagnostics: false,
                wrapAround: false
            };
            return Object.assign({}, defaultConfiguration, userOptions);
        }

        initializeDisplay() {
            this.systemReady = true;
            this.trackComponent = this.containerElement.querySelector('ul:first-of-type');
            this.itemComponents = Array.from(this.trackComponent.children);
            this.firstItemReference = this.itemComponents[0];
            this.instanceIdentifier = this.containerElement.id || `dynamic-panel-${Math.random().toString(36).substring(2, 11)}`;

            this.nextNavigationControl = this.containerElement.querySelector(this.internalSettings.nextButtonSelector);
            this.previousNavigationControl = this.containerElement.querySelector(this.internalSettings.prevButtonSelector);

            this.applyInitialStyling();
            this.calculateLayoutMetrics();
            this.attachInteractionHandlers();

            if (this.internalSettings.showDiagnostics) {
                console.log('--- DynamicPanelDisplay Initialization ---');
                console.log('Instance ID:', this.instanceIdentifier);
                console.log('Configuration:', this.internalSettings);
                if (this.internalSettings.displayMode === 'gallary') {
                    console.log('Gallery mode engaged');
                }
                console.log('Number of items:', this.itemComponents.length);
                console.log('Container and Track element base styles applied.');
            }

            this.updateControlVisibility();
        }

        applyInitialStyling() {
            this.containerElement.style.overflow = 'hidden';
            this.containerElement.style.position = 'relative';

            this.trackComponent.style.listStyle = 'none';
            this.trackComponent.style.padding = '0';
            this.trackComponent.style.margin = '0';
            this.trackComponent.style.display = 'flex';
            this.trackComponent.style.transition = `transform ${this.internalSettings.animationDurationMs}ms ease-in-out`;
            this.trackComponent.style.position = 'relative';

            this.itemComponents.forEach((item, index) => {
                item.style.listStyle = 'none';
                item.style.position = 'relative';
                item.style.flexShrink = '0';
                if (this.internalSettings.displayMode === 'gallary') {
                    item.classList.add(`gallery-item-${this.instanceIdentifier}`);
                    item.setAttribute('data-item-id', `${this.instanceIdentifier}-${index}`);
                    item.style.cursor = 'pointer';
                    item.addEventListener('click', this.handleItemActivation);
                }
            });
        }

        calculateLayoutMetrics() {
            this.displayWindowWidth = this.containerElement.offsetWidth;
            this.singleItemWidth = this.firstItemReference ? this.firstItemReference.offsetWidth : 0;

            if (this.internalSettings.showDiagnostics) {
                console.log('Container visible width:', this.displayWindowWidth);
                console.log('Next control width:', this.nextNavigationControl ? this.nextNavigationControl.offsetWidth : 0);
                console.log('Previous control width:', this.previousNavigationControl ? this.previousNavigationControl.offsetWidth : 0);
            }

            if (this.singleItemWidth > 0) {
                this.visibleItemCount = Math.ceil(this.displayWindowWidth / this.singleItemWidth);
            } else {
                this.visibleItemCount = 1;
            }

            if (this.internalSettings.showDiagnostics) {
                console.log('Calculated visible item count (ceil):', this.visibleItemCount);
            }

            if (this.internalSettings.autoAdjustHeight) {
                this.maximumItemHeight = 0;
                this.itemComponents.forEach(item => {
                    const currentHeight = item.offsetHeight;
                    if (currentHeight > this.maximumItemHeight) {
                        this.maximumItemHeight = currentHeight;
                    }
                });
                this.containerElement.style.height = `${this.maximumItemHeight}px`;
                if (this.internalSettings.showDiagnostics) {
                    console.log('Maximum item height:', this.maximumItemHeight);
                }
            }
        }

        attachInteractionHandlers() {
            if (this.nextNavigationControl) {
                this.nextNavigationControl.addEventListener('click', this.moveForward);
            }
            if (this.previousNavigationControl) {
                this.previousNavigationControl.addEventListener('click', this.moveBackward);
            }
            this.trackComponent.addEventListener('transitionend', this.animationCompletion);
        }

        updateControlVisibility() {
            if (this.internalSettings.hideControlsWhenStatic && !this.internalSettings.wrapAround) {
                const totalContentWidth = this.itemComponents.length * this.singleItemWidth;
                const currentTrackPosition = Math.abs(this.horizontalShift);

                if (this.previousNavigationControl) {
                    this.previousNavigationControl.style.display = (this.horizontalShift >= 0) ? 'none' : '';
                }

                if (this.nextNavigationControl) {
                    const endOfContentReached = (currentTrackPosition + this.displayWindowWidth >= totalContentWidth - 1); // -1 for floating point safety
                    this.nextNavigationControl.style.display = (endOfContentReached || totalContentWidth <= this.displayWindowWidth) ? 'none' : '';
                }
            }
        }

        animationCompletion() {
            if (!this.activityOngoing) return;

            if (this.internalSettings.wrapAround) {
                // Determine if we just finished a 'next' animation
                if (this.horizontalShift <= -this.singleItemWidth) { // Moved forward
                    this.trackComponent.appendChild(this.itemComponents.shift());
                    this.itemComponents = Array.from(this.trackComponent.children);
                    this.horizontalShift += this.singleItemWidth; // Adjust internal shift to keep visual position
                    this.trackComponent.style.transition = 'none';
                    this.trackComponent.style.transform = `translateX(${this.horizontalShift}px)`;
                    this.trackComponent.offsetWidth; // Force reflow
                    this.trackComponent.style.transition = `transform ${this.internalSettings.animationDurationMs}ms ease-in-out`;
                }
                // No specific action needed for 'prev' here as elements are pre-pended
            }

            this.activityOngoing = false;
            this.updateControlVisibility();
        }

        moveForward() {
            if (this.activityOngoing || !this.systemReady) {
                return false;
            }
            this.activityOngoing = true;

            const totalContentWidth = this.itemComponents.length * this.singleItemWidth;

            if (!this.internalSettings.wrapAround && (Math.abs(this.horizontalShift) + this.displayWindowWidth >= totalContentWidth -1)) {
                this.activityOngoing = false;
                this.updateControlVisibility();
                return false;
            }

            const shiftDistance = this.singleItemWidth;
            this.horizontalShift -= shiftDistance;
            this.trackComponent.style.transform = `translateX(${this.horizontalShift}px)`;
            this.updateControlVisibility();
            return false;
        }

        moveBackward() {
            if (this.activityOngoing || !this.systemReady) {
                return false;
            }
            this.activityOngoing = true;

            if (!this.internalSettings.wrapAround && this.horizontalShift >= 0) {
                this.activityOngoing = false;
                this.updateControlVisibility();
                return false;
            }

            const shiftDistance = this.singleItemWidth;

            if (this.internalSettings.wrapAround && this.horizontalShift >= 0) { // If at or past beginning
                this.trackComponent.prepend(this.itemComponents.pop());
                this.itemComponents = Array.from(this.trackComponent.children);
                this.trackComponent.style.transition = 'none';
                this.horizontalShift -= shiftDistance; // Pre-shift to make room for prepended item
                this.trackComponent.style.transform = `translateX(${this.horizontalShift}px)`;
                this.trackComponent.offsetWidth; // Force reflow
                this.trackComponent.style.transition = `transform ${this.internalSettings.animationDurationMs}ms ease-in-out`;
            }

            this.horizontalShift += shiftDistance;
            this.trackComponent.style.transform = `translateX(${this.horizontalShift}px)`;
            this.updateControlVisibility();
            return false;
        }

        // --- Media Viewer (Gallery Mode) Functions ---
        retrieveMediaIdentifiers() {
            const ids = [];
            document.querySelectorAll(`.gallery-item-${this.instanceIdentifier}`).forEach(item => {
                ids.push(item.getAttribute('data-item-id'));
            });
            return ids;
        }

        handleItemActivation(event) {
            const activatedItem = event.currentTarget;
            const imagePath = activatedItem.querySelector('img').getAttribute('rel');
            const itemId = activatedItem.getAttribute('data-item-id');
            this.openMediaViewer(itemId, imagePath);
        }

        nextViewerImage() {
            this.navigateMediaContent('forward');
        }

        previousViewerImage() {
            this.navigateMediaContent('backward');
        }

        navigateMediaContent(direction) {
            const viewerContentBox = document.getElementById('media-viewer-box');
            if (!viewerContentBox) return;

            const currentId = viewerContentBox.getAttribute('data-current-item-id');
            const allIds = this.retrieveMediaIdentifiers();
            let currentIndex = allIds.indexOf(currentId);

            if (direction === 'forward') {
                currentIndex = (currentIndex + 1) % allIds.length;
            } else {
                currentIndex = (currentIndex - 1 + allIds.length) % allIds.length;
            }

            const nextId = allIds[currentIndex];
            const nextImageElement = document.querySelector(`[data-item-id="${nextId}"] img`);
            const nextImagePath = nextImageElement ? nextImageElement.getAttribute('rel') : '';

            if (nextImagePath) {
                this.openMediaViewer(nextId, nextImagePath);
            }
        }

        openMediaViewer(itemId, imagePath) {
            const viewerOptions = {
                contentStyle: 'padding:20px;',
                canBeClosed: false
            };
            this.constructMediaViewer(viewerOptions, '<center>Loading image...</center>', () => {
                const tempImage = new Image();
                tempImage.onload = () => {
                    const finalViewerOptions = {
                        width: tempImage.width,
                        height: tempImage.height,
                        viewerMode: 'gallary',
                        currentItemId: itemId
                    };
                    this.constructMediaViewer(finalViewerOptions, `<img src="${tempImage.src}" alt="">`);
                };
                tempImage.src = imagePath + '?' + (new Date().getTime());
            });
        }

        // --- Overlay/Media Viewer Component Construction ---
        constructMediaViewer(viewerConfig, contentHTML, callback) {
            const mergedConfig = Object.assign({
                width: 'auto',
                height: 'auto',
                canBeClosed: true,
                viewerMode: false,
                contentStyle: '',
                currentItemId: false
            }, viewerConfig);

            let viewerBackdrop = document.getElementById('media-viewer-backdrop');
            let viewerContentBox = document.getElementById('media-viewer-box');

            if (!viewerBackdrop) {
                viewerBackdrop = document.createElement('div');
                viewerBackdrop.id = 'media-viewer-backdrop';
                viewerBackdrop.style.cssText = 'position:fixed;top:0;bottom:0;left:0;right:0;background:#000;opacity:0.5;z-index:1000;';
                document.body.appendChild(viewerBackdrop);
            }

            let closeButtonMarkup = '';
            if (mergedConfig.canBeClosed) {
                closeButtonMarkup = '<span id="media-viewer-close" style="position:absolute;top:-24px;right:-24px;z-index:1002;cursor:pointer;font-size:24px;color:white;text-shadow:1px 1px 2px black;">&times;</span>';
            }

            let nextNavMarkup = '';
            let prevNavMarkup = '';
            if (mergedConfig.viewerMode === 'gallary') {
                nextNavMarkup = `<div id="media-viewer-next" style="position:absolute;top:0;bottom:0;right:-20px;width:70px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;font-size:30px;text-shadow:1px 1px 2px black;">&gt;</div>`;
                prevNavMarkup = `<div id="media-viewer-prev" style="position:absolute;top:0;bottom:0;left:-20px;width:70px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;font-size:30px;text-shadow:1px 1px 2px black;">&lt;</div>`;
            }

            if (!viewerContentBox) {
                viewerContentBox = document.createElement('div');
                viewerContentBox.id = 'media-viewer-box';
                viewerContentBox.style.cssText = `display:none;position:fixed;top:50%;left:50%;background:#fff;z-index:1001;width:${mergedConfig.width === 'auto' ? 'auto' : mergedConfig.width + 'px'};height:${mergedConfig.height === 'auto' ? 'auto' : mergedConfig.height + 'px'};${mergedConfig.contentStyle}`;
                document.body.appendChild(viewerContentBox);
            }

            viewerContentBox.innerHTML = contentHTML + closeButtonMarkup + nextNavMarkup + prevNavMarkup;
            if (mergedConfig.currentItemId) {
                viewerContentBox.setAttribute('data-current-item-id', mergedConfig.currentItemId);
            } else {
                viewerContentBox.removeAttribute('data-current-item-id');
            }

            this.bindViewerInteraction(mergedConfig, callback);
        }

        bindViewerInteraction(config, callback) {
            const viewerContentBox = document.getElementById('media-viewer-box');
            const viewerBackdrop = document.getElementById('media-viewer-backdrop');

            viewerContentBox.style.marginTop = `-${viewerContentBox.offsetHeight / 2}px`;
            viewerContentBox.style.marginLeft = `-${viewerContentBox.offsetWidth / 2}px`;

            if (config.canBeClosed) {
                if (viewerBackdrop) viewerBackdrop.addEventListener('click', this.deactivateMediaViewer);
                const closeBtn = document.getElementById('media-viewer-close');
                if (closeBtn) closeBtn.addEventListener('click', this.deactivateMediaViewer);
            }

            if (config.viewerMode === 'gallary') {
                const nextBtn = document.getElementById('media-viewer-next');
                const prevBtn = document.getElementById('media-viewer-prev');
                if (nextBtn) nextBtn.addEventListener('click', this.nextViewerImage);
                if (prevBtn) prevBtn.addEventListener('click', this.previousViewerImage);
            }

            if (viewerContentBox.style.display === 'none') {
                viewerContentBox.style.display = 'block';
                if (callback) {
                    setTimeout(callback, 0);
                }
            } else {
                if (callback) callback();
            }
        }

        deactivateMediaViewer() {
            const viewerBackdrop = document.getElementById('media-viewer-backdrop');
            const viewerContentBox = document.getElementById('media-viewer-box');

            if (viewerBackdrop) viewerBackdrop.remove();
            if (viewerContentBox) viewerContentBox.remove();
        }
    }

    window.initDynamicPanelDisplay = function(selector, options) {
        document.querySelectorAll(selector).forEach(element => {
            new DynamicPanelDisplay(element, options);
        });
    };

})();