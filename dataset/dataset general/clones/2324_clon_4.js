(function() {

    class CirculatingVisualizer {
        constructor(viewingTarget, configurationSettings) {
            const defaultParameters = {
                movementFlow: 'vertical',
                onContentAddedBelow: () => {},
                onContentAddedAbove: () => {},
                onCycleCompletionDown: () => {},
                onCycleCompletionUp: () => {},
                displayScrollbar: null
            };

            this.options = Object.assign({}, defaultParameters, configurationSettings);

            this.scrollableArea = (viewingTarget === document || viewingTarget === window) ? document.documentElement : viewingTarget;
            this.contentManipulationArea = (viewingTarget === document || viewingTarget === window) ? document.body : viewingTarget;

            this.initialContentHeightMetric = 0;
            this.previousScrollPoint = 0;
            this.contentTemplateString = '';

            this.initializeComponent();
        }

        initializeComponent() {
            this.initialContentHeightMetric = this.contentManipulationArea.scrollHeight;
            this.previousScrollPoint = this.scrollableArea.scrollTop;

            this.setupContentBoundary();
            this.adjustScrollbarVisibility();

            this.scrollableArea.addEventListener('scroll', this.processScrollMotion.bind(this));
        }

        calculateBottomOffset() {
            if (this.scrollableArea === document.documentElement) {
                return document.body.scrollHeight - window.scrollY - window.innerHeight;
            } else {
                return this.scrollableArea.scrollHeight - this.scrollableArea.scrollTop - this.scrollableArea.clientHeight;
            }
        }

        setupContentBoundary() {
            const initialMarkup = this.contentManipulationArea.innerHTML;
            this.contentManipulationArea.innerHTML = `<div class="circular-wrapper">${initialMarkup}</div>`;
            this.contentTemplateString = this.contentManipulationArea.innerHTML;
        }

        adjustScrollbarVisibility() {
            const styleTarget = (this.scrollableArea === document.documentElement) ? document.body : this.scrollableArea;
            if (this.options.displayScrollbar === 'disable') {
                styleTarget.style.overflow = 'hidden';
            } else if (this.options.displayScrollbar === 'enable') {
                styleTarget.style.overflowY = 'scroll';
            }
        }

        belowExtensionPresent = false;
        aboveExtensionPresent = false;

        processScrollMotion() {
            const currentPoint = this.scrollableArea.scrollTop;
            const movedDownward = currentPoint > this.previousScrollPoint;
            const movedUpward = currentPoint < this.previousScrollPoint;

            this.previousScrollPoint = currentPoint;

            switch (this.options.movementFlow) {
                case 'downward':
                    this.handleDownwardMovement(movedDownward);
                    break;
                case 'upward':
                    this.handleUpwardMovement(movedUpward);
                    break;
                case 'vertical':
                    this.handleDownwardMovement(movedDownward);
                    this.handleUpwardMovement(movedUpward);
                    break;
            }
        }

        handleDownwardMovement(isMovingDown) {
            if (!isMovingDown) return;

            if (this.calculateBottomOffset() === 0) {
                this.insertContentFragment(true);
                this.scrollableArea.scrollTop = this.previousScrollPoint;
                this.belowExtensionPresent = true;
                this.options.onContentAddedBelow();
            } else if (this.scrollableArea.scrollTop >= this.initialContentHeightMetric) {
                this.resetContentStructure();
                this.scrollableArea.scrollTop = 1;
                this.previousScrollPoint = 1;
                this.belowExtensionPresent = false;
                this.options.onCycleCompletionDown();
            } else if (this.belowExtensionPresent) {
                if (this.calculateBottomOffset() >= this.initialContentHeightMetric) {
                    this.resetContentStructure();
                    this.scrollableArea.scrollTop = this.contentManipulationArea.scrollHeight - (this.scrollableArea === document.documentElement ? window.innerHeight : this.scrollableArea.clientHeight) - 1;
                    this.previousScrollPoint = this.scrollableArea.scrollTop;
                    this.belowExtensionPresent = false;
                    this.options.onCycleCompletionDown();
                }
            }
        }

        handleUpwardMovement(isMovingUp) {
            if (!isMovingUp) return;

            if (this.scrollableArea.scrollTop === 0) {
                this.insertContentFragment(false);
                this.scrollableArea.scrollTop = this.initialContentHeightMetric;
                this.previousScrollPoint = this.scrollableArea.scrollTop;
                this.aboveExtensionPresent = true;
                this.options.onContentAddedAbove();
            } else if (this.calculateBottomOffset() >= this.initialContentHeightMetric) {
                this.resetContentStructure();
                this.scrollableArea.scrollTop = this.contentManipulationArea.scrollHeight - (this.scrollableArea === document.documentElement ? window.innerHeight : this.scrollableArea.clientHeight) - 1;
                this.previousScrollPoint = this.scrollableArea.scrollTop;
                this.aboveExtensionPresent = false;
                this.options.onCycleCompletionUp();
            } else if (this.aboveExtensionPresent) {
                if (this.scrollableArea.scrollTop >= this.initialContentHeightMetric) {
                    this.resetContentStructure();
                    this.scrollableArea.scrollTop = 1;
                    this.previousScrollPoint = 1;
                    this.aboveExtensionPresent = false;
                    this.options.onCycleCompletionUp();
                }
            }
        }

        insertContentFragment(isAppend) {
            const temporaryContainer = document.createElement('div');
            temporaryContainer.innerHTML = this.contentTemplateString;
            const fragmentToInsert = temporaryContainer.firstElementChild;

            if (isAppend) {
                this.contentManipulationArea.appendChild(fragmentToInsert);
            } else {
                this.contentManipulationArea.insertBefore(fragmentToInsert, this.contentManipulationArea.firstElementChild);
            }
        }

        resetContentStructure() {
            this.contentManipulationArea.innerHTML = this.contentTemplateString;
        }
    }

    window.startEndlessScrolling = function(elementIdentifier, setupOptions) {
        let targetElement;
        if (typeof elementIdentifier === 'string') {
            targetElement = document.querySelector(elementIdentifier);
            if (!targetElement) {
                console.warn('EndlessScrolling: Element not found for selector:', elementIdentifier);
                return null;
            }
        } else if (elementIdentifier instanceof HTMLElement || elementIdentifier === document || elementIdentifier === window) {
            targetElement = elementIdentifier;
        } else {
            console.error('EndlessScrolling: Invalid element identifier provided.');
            return null;
        }
        return new CirculatingVisualizer(targetElement, setupOptions);
    };

})();