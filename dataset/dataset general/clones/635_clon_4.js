const instanceRegistry = new WeakMap();

const defaultBookSettings = {
    layoutWidth: null,
    layoutHeight: null,
    bookClosed: false,
    showCovers: false,
    displayPanelNumbers: true,
    flowDirection: 'LTR',
    initialPanel: 1,
    castShadows: true,
    forwardShadowExtent: 160,
    backwardShadowExtent: 160,
    autoCenterLayout: true,
    overlayElements: true,
    animationSpeed: 1000,
    documentTitle: null,
    closedFrontTitleText: '',
    closedFrontChapterLabel: '',
    closedBackTitleText: '',
    closedBackChapterLabel: '',
    onCreationComplete: null,
    onPageTurnStart: null,
    onPageTurnEnd: null,
    onPageAdded: null,
    onPageRemoved: null
};

class PageTurnerCore {
    constructor(hostElementRef, settingsInput) {
        this.containerElement = hostElementRef;
        this.activeSettings = Object.assign({}, defaultBookSettings, settingsInput);
        
        this.isReady = false;
        this.isBusy = false;
        this.isAutoAdvancing = false;
        this.isHoveringRightZone = false;
        this.isHoveringLeftZone = false;
        this.isFunctionalityDisabled = false;

        this.pageMarkupTemplates = {
            emptySegment: '<div class="pt-segment-empty" data-segment-title=""></div>',
            fillerSegment: '<div class="pt-segment-filler" data-segment-title=""></div>',
            frontShade: '<div class="pt-shade-front"></div>',
            backShade: '<div class="pt-shade-back"></div>'
        };
        this.directionModes = {
            leftToRight: 'LTR',
            rightToLeft: 'RTL'
        };
        this.computedStyles = {};
        this.transitionProperties = {};

        this.shadowWidthHover = 0;
        this.fullWidthHover = 0;
        this.curlWidthHover = 0;
        this.contentSegments = [];

        this.currentLocationHash = '';
        this.locationHashBase = '/segment/';

        this.initialSegmentCount = 0;
        this.startSegmentNumber = 0;

        this.segmentPreviousPrevious = null;
        this.segmentPrevious = null;
        this.segmentCurrentLeft = null;
        this.segmentCurrentRight = null;
        this.segmentNext = null;
        this.segmentNextNext = null;

        this.wrapperPreviousPrevious = null;
        this.wrapperPrevious = null;
        this.wrapperCurrentLeft = null;
        this.wrapperCurrentRight = null;
        this.wrapperNext = null;
        this.wrapperNextNext = null;
        this.allSegmentWrappers = null;

        this.frontShadowElement = null;
        this.backShadowElement = null;

        this.dragNextPageElement = null;
        this.dragPreviousPageElement = null;
        this.controlGroup = null;
        this.bottomOverlays = null;
        this.nextOverlay = null;
        this.prevOverlay = null;
        this.tabControls = null;
        this.nextTab = null;
        this.prevTab = null;
        this.arrowControls = null;
        this.nextArrow = null;
        this.prevArrow = null;
        this.customNextControl = null;
        this.customPrevControl = null;
        this.nextControlsGroup = null;
        this.prevControlsGroup = null;
        this.menuDropdown = null;
        this.pauseButton = null;
        this.playButton = null;

        this.segmentSelectorElement = null;
        this.segmentSelectorListElement = null;
        this.segmentListItemNumbers = null;
        this.segmentListItemTitle = null;
        this.singleSegmentListItem = null;
        this.segmentSelectorHeight = null;

        this.chapterDisplay = null;
        this.chapterSelectorElement = null;
        this.chapterSelectorListElement = null;
        this.chapterSingleListItem = null;
        this.chapterSelectorHeight = null;

        this.widthPercentageFlag = false;
        this.originalWidthString = '';
        this.heightPercentageFlag = false;
        this.originalHeightString = '';

        this.segmentDimensionWidth = 0;
        this.segmentDimensionWidthNegated = 0;
        this.segmentDimensionHalfWidth = 0;
        this.segmentDimensionHeight = 0;
        this.halfAnimationDuration = 0;

        this.eventDispatchers = {
            creationComplete: 'pageturner:initialized',
            turnStart:  'pageturner:turnstart',
            turnEnd: 'pageturner:turnend',
            segmentAdded: 'pageturner:segmentadded',
            segmentRemoved: 'pageturner:segmentremoved'
        };
        this.callbackData = null;
    }

    createContentSegment(contentNodeRef, segmentIndex, segmentOptions) {
        let chapterIdentifier = '';
        let displayTitle = '';

        if (contentNodeRef.hasAttribute('data-chapter')) {
            chapterIdentifier = contentNodeRef.getAttribute('data-chapter');
        }
        if (contentNodeRef.hasAttribute('data-display-title')) {
            displayTitle = contentNodeRef.getAttribute('data-display-title');
        }

        const segmentContainer = document.createElement('div');
        segmentContainer.classList.add('pt-segment-container');
        segmentContainer.classList.add(`pt-segment-${segmentIndex}`);

        const innerWrapper = document.createElement('div');
        innerWrapper.classList.add('pt-content-wrapper');

        if (contentNodeRef.classList.contains('pt-segment-empty')) {
            // No special class for empty segment's wrapper
        } else if (segmentOptions.bookClosed && segmentOptions.showCovers && (segmentIndex === 1 || segmentIndex === segmentOptions.totalSegments - 2)) {
            innerWrapper.classList.add('pt-wrapper-cover');
        } else if (segmentIndex % 2 !== 0) {
            innerWrapper.classList.add('pt-wrapper-right');
        } else {
            innerWrapper.classList.add('pt-wrapper-left');
        }

        contentNodeRef.parentNode.insertBefore(innerWrapper, contentNodeRef);
        innerWrapper.appendChild(contentNodeRef);
        
        innerWrapper.parentNode.insertBefore(segmentContainer, innerWrapper);
        segmentContainer.appendChild(innerWrapper);

        if (
            segmentOptions.displayPanelNumbers && !contentNodeRef.classList.contains('pt-segment-empty') &&
            (!segmentOptions.bookClosed || (segmentOptions.bookClosed && !segmentOptions.showCovers) || (segmentOptions.bookClosed && segmentOptions.showCovers && segmentIndex !== 1 && segmentIndex !== segmentOptions.totalSegments - 2))
        ) {
            if (segmentOptions.flowDirection === this.directionModes.leftToRight) {
                this.startSegmentNumber++;
            }
            const counterSpan = document.createElement('span');
            counterSpan.classList.add('pt-segment-counter');
            counterSpan.textContent = this.startSegmentNumber;
            innerWrapper.appendChild(counterSpan);

            if (segmentOptions.flowDirection === this.directionModes.rightToLeft) {
                this.startSegmentNumber--;
            }
        }

        return {
            index: segmentIndex,
            contentReference: contentNodeRef,
            segmentContainerReference: segmentContainer,
            chapter: chapterIdentifier,
            title: displayTitle
        };
    }

    initializeLayout() {
        const compatibilityWrapper = this.containerElement.querySelector('.pt-load-wrapper');
        if (compatibilityWrapper) {
            while (compatibilityWrapper.firstChild) {
                this.containerElement.insertBefore(compatibilityWrapper.firstChild, compatibilityWrapper);
            }
            compatibilityWrapper.remove();
        }

        this.containerElement.classList.add('pageturner-instance');

        instanceRegistry.set(this.containerElement, this);

        this.originalSegmentCount = this.containerElement.children.length;
        this.activeSettings.currentSegmentIndex = 0;

        this.prepareContentSegments();
        this.adjustSettings(null);
        this.refreshSegmentVisuals();

        this.updateControlVisibilityState();
        this.updateNavigationMenu();

        this.isReady = true;
        this.isFunctionalityDisabled = false;

        this.callbackData = {
            options: Object.assign({}, this.activeSettings),
            index: this.activeSettings.currentSegmentIndex,
            segments: [this.contentSegments[this.activeSettings.currentSegmentIndex].contentReference, this.contentSegments[this.activeSettings.currentSegmentIndex + 1].contentReference]
        };
        
        if (this.activeSettings.onCreationComplete) {
            this.containerElement.removeEventListener(this.eventDispatchers.creationComplete, this.activeSettings.onCreationComplete);
            this.containerElement.addEventListener(this.eventDispatchers.creationComplete, this.activeSettings.onCreationComplete);
        }
        this.triggerCustomEvent(this.eventDispatchers.creationComplete, this.callbackData);
    }

    allowOperations() {
        this.isFunctionalityDisabled = false;
    }

    preventOperations() {
        this.isFunctionalityDisabled = true;
    }

    dismantleLayout() {
        this.removeControls();
        this.removeContentSegments();

        this.containerElement.classList.remove('pageturner-instance');
        instanceRegistry.delete(this.containerElement);
        this.isReady = false;
    }

    prepareContentSegments() {
        this.contentSegments = [];

        const currentChildElements = Array.from(this.containerElement.children);
        if ((currentChildElements.length % 2) !== 0) {
            if (this.activeSettings.bookClosed && this.activeSettings.showCovers) {
                currentChildElements[currentChildElements.length - 1].insertAdjacentHTML('beforebegin', this.pageMarkupTemplates.fillerSegment);
            } else {
                this.containerElement.insertAdjacentHTML('beforeend', this.pageMarkupTemplates.fillerSegment);
            }
        }

        if (this.activeSettings.bookClosed) {
            const frontPlaceholder = document.createElement('div');
            frontPlaceholder.innerHTML = this.pageMarkupTemplates.emptySegment;
            frontPlaceholder.firstElementChild.setAttribute('data-display-title', this.activeSettings.closedFrontTitleText);
            frontPlaceholder.firstElementChild.setAttribute('data-chapter', this.activeSettings.closedFrontChapterLabel);
            this.containerElement.prepend(frontPlaceholder.firstElementChild);

            const lastExistingChild = this.containerElement.lastElementChild;
            lastExistingChild.setAttribute('data-display-title', this.activeSettings.closedBackTitleText);
            lastExistingChild.setAttribute('data-chapter', this.activeSettings.closedBackChapterLabel);
            
            this.containerElement.insertAdjacentHTML('beforeend', this.pageMarkupTemplates.emptySegment);
        }

        this.activeSettings.totalSegments = this.containerElement.children.length;
        this.startSegmentNumber = 0;

        if (this.activeSettings.flowDirection === this.directionModes.rightToLeft) {
            this.startSegmentNumber = this.activeSettings.totalSegments;
            if (this.activeSettings.bookClosed) {
                this.startSegmentNumber -= 2;
            }
            if (this.activeSettings.showCovers) {
                this.startSegmentNumber -= 2;
            }
            Array.from(this.containerElement.children).reverse().forEach(child => this.containerElement.appendChild(child));
        }

        if (!this.isReady) {
            if (this.activeSettings.flowDirection === this.directionModes.leftToRight) {
                this.activeSettings.currentSegmentIndex = 0;
            } else if (this.activeSettings.flowDirection === this.directionModes.rightToLeft) {
                this.activeSettings.currentSegmentIndex = this.activeSettings.totalSegments - 2;
            }

            if (!isNaN(this.activeSettings.initialPanel) && this.activeSettings.initialPanel <= this.activeSettings.totalSegments && this.activeSettings.initialPanel > 0) {
                if ((this.activeSettings.initialPanel % 2) !== 0) {
                    this.activeSettings.initialPanel--;
                }
                this.activeSettings.currentSegmentIndex = this.activeSettings.initialPanel;
            }
        }

        Array.from(this.containerElement.children).forEach((childElement, idx) => {
            const newSegment = this.createContentSegment(childElement, idx, this.activeSettings);
            this.contentSegments.push(newSegment);
        });
    }

    refreshSegmentVisuals() {
        this.updateSegmentLayout();
        this.updateSegmentStyles();
        this.refreshManualControls();
    }

    updateSegmentLayout() {
        this.containerElement.querySelectorAll('.pt-segment-container').forEach(segment => {
            segment.classList.remove('pt-segment-prev-prev', 'pt-segment-prev', 'pt-segment-current-left', 'pt-segment-current-right', 'pt-segment-next', 'pt-segment-next-next');
            segment.style.display = 'none';
        });

        const currentIdx = this.activeSettings.currentSegmentIndex;
        const totalSegments = this.activeSettings.totalSegments;

        const assignSegment = (offset, className, propName, wrapperPropName) => {
            const idx = currentIdx + offset;
            if (idx >= 0 && idx < totalSegments) {
                const segmentUnit = this.contentSegments[idx];
                segmentUnit.segmentContainerReference.classList.add(className);
                segmentUnit.segmentContainerReference.style.display = '';
                this[propName] = segmentUnit.segmentContainerReference;
                this[wrapperPropName] = segmentUnit.segmentContainerReference.querySelector('.pt-content-wrapper');
            } else {
                this[propName] = null;
                this[wrapperPropName] = null;
            }
        };

        assignSegment(-2, 'pt-segment-prev-prev', 'segmentPreviousPrevious', 'wrapperPreviousPrevious');
        assignSegment(-1, 'pt-segment-prev', 'pt-segment-prev', 'segmentPrevious', 'wrapperPrevious');
        assignSegment(0, 'pt-segment-current-left', 'segmentCurrentLeft', 'wrapperCurrentLeft');
        assignSegment(1, 'pt-segment-current-right', 'segmentCurrentRight', 'wrapperCurrentRight');
        assignSegment(2, 'pt-segment-next', 'segmentNext', 'wrapperNext');
        assignSegment(3, 'pt-segment-next-next', 'segmentNextNext', 'wrapperNextNext');
        
        this.allSegmentWrappers = this.containerElement.querySelectorAll('.pt-content-wrapper');

        if (this.activeSettings.castShadows) {
            this.containerElement.querySelectorAll('.pt-shade-front, .pt-shade-back').forEach(el => el.remove());

            this.frontShadowElement = document.createElement('div');
            this.frontShadowElement.classList.add('pt-shade-front');
            Object.assign(this.frontShadowElement.style, this.computedStyles.frontShade);
            if (this.segmentNext) {
                this.segmentNext.appendChild(this.frontShadowElement);
            }

            this.backShadowElement = document.createElement('div');
            this.backShadowElement.classList.add('pt-shade-back');
            Object.assign(this.backShadowElement.style, this.computedStyles.backShade);
            if (this.segmentPrevious) {
                this.segmentPrevious.appendChild(this.backShadowElement);
            }
        }
    }

    updateSegmentStyles() {
        this.containerElement.querySelectorAll('.pt-shade-front, .pt-shade-back, .pt-segment-prev, .pt-segment-next').forEach(el => {
            el.style.filter = '';
            el.style.zoom = '';
        });

        this.containerElement.querySelectorAll('.pt-segment-container').forEach(segment => segment.removeAttribute('style'));
        this.allSegmentWrappers.forEach(wrap => wrap.removeAttribute('style'));

        this.allSegmentWrappers.forEach(wrap => Object.assign(wrap.style, this.computedStyles.wrapperBase));
        if (this.wrapperPrevious) Object.assign(this.wrapperPrevious.style, this.computedStyles.wrapperPrevious);
        if (this.segmentCurrentLeft) Object.assign(this.segmentCurrentLeft.style, this.computedStyles.segmentCurrentLeft);
        if (this.segmentCurrentRight) Object.assign(this.segmentCurrentRight.style, this.computedStyles.segmentCurrentRight);
        
        if (this.activeSettings.bookClosed && this.activeSettings.autoCenterLayout && this.activeSettings.currentSegmentIndex >= this.activeSettings.totalSegments - 2) {
            if (this.segmentCurrentRight) this.segmentCurrentRight.style.display = 'none';
        }

        if (this.segmentPreviousPrevious) Object.assign(this.segmentPreviousPrevious.style, this.computedStyles.segmentPreviousPrevious);
        if (this.segmentPrevious) Object.assign(this.segmentPrevious.style, this.computedStyles.segmentPrevious);
        if (this.segmentNext) Object.assign(this.segmentNext.style, this.computedStyles.segmentNext);
        if (this.segmentNextNext) Object.assign(this.segmentNextNext.style, this.computedStyles.segmentNextNext);

        if (this.activeSettings.bookClosed && this.activeSettings.autoCenterLayout && (this.activeSettings.currentSegmentIndex === 0 || this.activeSettings.currentSegmentIndex >= this.activeSettings.totalSegments - 2)) {
            if (this.activeSettings.overlayElements) {
                // if (this.bottomOverlays) this.bottomOverlays.style.width = '100%';
            }
            this.containerElement.style.width = `${this.segmentDimensionWidth}px`;
        } else {
            if (this.activeSettings.overlayElements) {
                // if (this.bottomOverlays) this.bottomOverlays.style.width = '50%';
            }
            this.containerElement.style.width = `${this.activeSettings.layoutWidth}px`;
        }

        this.containerElement.querySelectorAll('.pt-segment-container').forEach(segment => {
            segment.style.filter = '';
            segment.style.zoom = '';
        });
    }

    removeContentSegments() {
        this.containerElement.querySelectorAll(".pt-content-wrapper").forEach(wrap => {
            while (wrap.firstChild) {
                wrap.parentNode.insertBefore(wrap.firstChild, wrap);
            }
            wrap.remove();
        });
        this.containerElement.querySelectorAll(".pt-segment-counter, .pt-segment-filler, .pt-segment-empty, .pt-shade-front, .pt-shade-back").forEach(el => el.remove());

        if (this.activeSettings.flowDirection === this.directionModes.rightToLeft) {
            Array.from(this.containerElement.children).reverse().forEach(child => this.containerElement.appendChild(child));
        }
    }

    adjustSettings(newConfiguration) {
        let configurationWasUpdated = false;

        if (newConfiguration != null && typeof newConfiguration !== "undefined") {
            this.removeContentSegments();
            this.removeControls();

            this.activeSettings = Object.assign({}, this.activeSettings, newConfiguration);
            configurationWasUpdated = true;

            this.prepareContentSegments();
        }

        if (!this.activeSettings.layoutWidth) {
            this.activeSettings.layoutWidth = this.containerElement.offsetWidth;
        } else if (typeof this.activeSettings.layoutWidth === 'string' && this.activeSettings.layoutWidth.endsWith("px")) {
            this.activeSettings.layoutWidth = parseFloat(this.activeSettings.layoutWidth);
        } else if (typeof this.activeSettings.layoutWidth === 'string' && this.activeSettings.layoutWidth.endsWith("%")) {
            this.widthPercentageFlag = true;
            this.originalWidthString = this.activeSettings.layoutWidth;
            this.activeSettings.layoutWidth = (parseFloat(this.activeSettings.layoutWidth) / 100) * this.containerElement.parentElement.offsetWidth;
        }

        if (!this.activeSettings.layoutHeight) {
            this.activeSettings.layoutHeight = this.containerElement.offsetHeight;
        } else if (typeof this.activeSettings.layoutHeight === 'string' && this.activeSettings.layoutHeight.endsWith("px")) {
            this.activeSettings.layoutHeight = parseFloat(this.activeSettings.layoutHeight);
        } else if (typeof this.activeSettings.layoutHeight === 'string' && this.activeSettings.layoutHeight.endsWith("%")) {
            this.heightPercentageFlag = true;
            this.originalHeightString = this.activeSettings.layoutHeight;
            this.activeSettings.layoutHeight = (parseFloat(this.activeSettings.layoutHeight) / 100) * this.containerElement.parentElement.offsetHeight;
        }

        this.containerElement.style.width = `${this.activeSettings.layoutWidth}px`;
        this.containerElement.style.height = `${this.activeSettings.layoutHeight}px`;

        this.segmentDimensionWidth = this.activeSettings.layoutWidth / 2;
        this.segmentDimensionWidthNegated = `-${this.segmentDimensionWidth}px`;
        this.segmentDimensionHalfWidth = this.segmentDimensionWidth / 2;
        this.segmentDimensionHeight = this.activeSettings.layoutHeight;
        this.halfAnimationDuration = this.activeSettings.animationSpeed / 2;

        if (this.activeSettings.bookClosed && this.activeSettings.autoCenterLayout) {
            if (this.activeSettings.currentSegmentIndex === 0 || this.activeSettings.currentSegmentIndex >= this.activeSettings.totalSegments - 2) {
                this.containerElement.style.width = `${this.segmentDimensionWidth}px`;
            }
        }

        if (this.activeSettings.castShadows) {
            this.activeSettings.forwardShadowExtent = `-${this.activeSettings.forwardShadowExtent}px`;
            this.activeSettings.backwardShadowExtent = `-${this.activeSettings.backwardShadowExtent}px`;
        }

        this.activeSettings.totalSegments = this.containerElement.querySelectorAll('.pt-segment-container').length;

        if (!this.activeSettings.documentTitle) {
            this.activeSettings.documentTitle = document.title;
        } else {
            document.title = this.activeSettings.documentTitle;
        }

        this.updateStyleAndMotionProperties();
        if (this.isReady) {
            this.refreshSegmentVisuals();
        }
    }

    updateStyleAndMotionProperties() {
        this.computedStyles.wrapperBase = {
            width: `${this.segmentDimensionWidth}px`,
            height: `${this.segmentDimensionHeight}px`,
            position: 'absolute',
            top: '0px',
            overflow: 'hidden'
        };
        this.computedStyles.wrapperPrevious = {
            left: '0px'
        };
        this.computedStyles.segmentCurrentLeft = {
            left: `${this.segmentDimensionWidth}px`,
            zIndex: '100'
        };
        this.computedStyles.segmentCurrentRight = {
            left: '0px',
            zIndex: '100'
        };
        this.computedStyles.segmentPreviousPrevious = {
            left: this.segmentDimensionWidthNegated,
            zIndex: '1'
        };
        this.computedStyles.segmentPrevious = {
            left: '0px',
            zIndex: '2'
        };
        this.computedStyles.segmentNext = {
            left: `${this.activeSettings.layoutWidth}px`,
            zIndex: '2'
        };
        this.computedStyles.segmentNextNext = {
            left: `${this.activeSettings.layoutWidth}px`,
            zIndex: '1'
        };
        this.computedStyles.frontShade = {
            position: 'absolute',
            top: '0px',
            left: this.activeSettings.forwardShadowExtent,
            width: `${Math.abs(parseFloat(this.activeSettings.forwardShadowExtent))}px`,
            height: '100%',
            background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
            zIndex: '1000'
        };
        this.computedStyles.backShade = {
            position: 'absolute',
            top: '0px',
            right: this.activeSettings.backwardShadowExtent,
            width: `${Math.abs(parseFloat(this.activeSettings.backwardShadowExtent))}px`,
            height: '100%',
            background: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
            zIndex: '1000'
        };
    }

    removeControls() { /* Placeholder for destroyControls */ }
    updateControlVisibilityState() { /* Placeholder for updateControlVisibility */ }
    updateNavigationMenu() { /* Placeholder for updateMenu */ }
    refreshManualControls() { /* Placeholder for refreshManualControls */ }

    navigateToSegment(segmentIndex) {
        if (!this.isReady) {
            throw new Error('PageTurnerCore has not been initialized. Segment navigation cannot be performed.');
        }
        this.activeSettings.currentSegmentIndex = segmentIndex;
        this.refreshSegmentVisuals();
        this.triggerCustomEvent(this.eventDispatchers.turnEnd, {
            options: Object.assign({}, this.activeSettings),
            index: this.activeSettings.currentSegmentIndex,
            segments: [this.contentSegments[this.activeSettings.currentSegmentIndex].contentReference, this.contentSegments[this.activeSettings.currentSegmentIndex + 1].contentReference]
        });
    }

    triggerCustomEvent(eventName, eventPayload) {
        const customEvent = new CustomEvent(eventName, { detail: eventPayload, bubbles: true, cancelable: true });
        this.containerElement.dispatchEvent(customEvent);
        
        const callbackMap = {
            [this.eventDispatchers.creationComplete]: 'onCreationComplete',
            [this.eventDispatchers.turnStart]: 'onPageTurnStart',
            [this.eventDispatchers.turnEnd]: 'onPageTurnEnd',
            [this.eventDispatchers.segmentAdded]: 'onPageAdded',
            [this.eventDispatchers.segmentRemoved]: 'onPageRemoved'
        };
        const callbackSettingName = callbackMap[eventName];
        if (callbackSettingName && typeof this.activeSettings[callbackSettingName] === 'function') {
             this.activeSettings[callbackSettingName].call(this.containerElement, customEvent, eventPayload);
        }
    }
}

function createPageFlipper(elementSelector, operationOrSettings, ...extraArgs) {
    const targetElements = typeof elementSelector === 'string' ? document.querySelectorAll(elementSelector) : [elementSelector];
    
    if (!targetElements || targetElements.length === 0) {
        return targetElements;
    }

    let resultContainer = [];

    if (typeof operationOrSettings === 'string') {
        Array.from(targetElements).forEach(targetEl => {
            const instance = instanceRegistry.get(targetEl);
            if (instance) {
                const methodNameMap = {
                    'destroy': 'dismantleLayout',
                    'enable': 'allowOperations',
                    'disable': 'preventOperations',
                    'gotopage': 'navigateToSegment',
                };
                const internalMethodName = methodNameMap[operationOrSettings] || operationOrSettings;

                if (typeof instance[internalMethodName] === 'function') {
                    const outputValue = instance[internalMethodName](...extraArgs);
                    if (typeof outputValue !== 'undefined' || outputValue) {
                        resultContainer.push(outputValue);
                    }
                } else {
                    console.error(`Method "${operationOrSettings}" does not exist on PageTurner instance.`);
                }
            } else {
                console.error(`PageTurner has not been initialized for this element. Method "${operationOrSettings}" cannot be called.`);
            }
        });
    } else if (typeof operationOrSettings === 'number') {
        Array.from(targetElements).forEach(targetEl => {
            const instance = instanceRegistry.get(targetEl);
            if (instance) {
                instance.navigateToSegment(operationOrSettings);
            } else {
                console.error(`PageTurner has not been initialized for this element.`);
            }
        });
    } else if (typeof operationOrSettings === 'object' || typeof operationOrSettings === 'undefined') {
        Array.from(targetElements).forEach(targetEl => {
            let existingInstance = instanceRegistry.get(targetEl);

            if (existingInstance) {
                existingInstance.dismantleLayout();
            }

            const newInstance = new PageTurnerCore(targetEl, operationOrSettings);
            newInstance.initializeLayout();
            instanceRegistry.set(targetEl, newInstance);
            resultContainer.push(targetEl);
        });
    }

    if (resultContainer.length === 1) {
        return resultContainer[0];
    } else if (resultContainer.length > 0) {
        return resultContainer;
    } else {
        return targetElements;
    }
}