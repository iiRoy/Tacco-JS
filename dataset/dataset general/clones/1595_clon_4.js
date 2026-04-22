class DynamicSliderController {
    constructor(hostElement, transitionDurationMs, transitionTimingFunction) {
        if (!hostElement || !(hostElement instanceof HTMLElement)) {
            throw new Error("Invalid host element provided for DynamicSliderController.");
        }

        this.containerElement = hostElement;
        this.animationDuration = transitionDurationMs;
        this.animationEasing = transitionTimingFunction;

        this.slideTrack = this.containerElement.querySelector("#slider-window");
        this.individualPanels = Array.from(this.containerElement.querySelectorAll(".slide"));
        this.previousPanelButton = this.containerElement.querySelector("#leftArrow");
        this.nextPanelButton = this.containerElement.querySelector("#rightArrow");

        if (!this.slideTrack || !this.previousPanelButton || !this.nextPanelButton || this.individualPanels.length === 0) {
            console.error("Missing essential slider elements (#slider-window, .slide, #leftArrow, #rightArrow).");
            return null;
        }

        this.activePanelIndex = 0;
        this.totalPanelsCount = this.individualPanels.length;
        this.maximumPanelIndex = this.totalPanelsCount - 1;
        
        this.cachedContainerWidth = 0;
        this.currentPanelWidth = 0;

        this.setupInitialLayout();
        this.attachEventListeners();
    }

    setupInitialLayout() {
        this.slideTrack.style.width = `${this.totalPanelsCount * 100}%`;

        this.individualPanels.forEach(panel => {
            panel.style.width = `${window.innerWidth}px`;
        });

        this.cachedContainerWidth = this.containerElement.clientWidth;
        this.currentPanelWidth = this.individualPanels[0].clientWidth;

        this.slideTrack.style.transition = `transform ${this.animationDuration}ms ${this.animationEasing}`;
        
        this.updateTrackPosition(this.cachedContainerWidth);
    }

    updateTrackPosition(baseWidthForCalculation) {
        const displacement = -this.activePanelIndex * baseWidthForCalculation;
        this.slideTrack.style.transform = `translateX(${displacement}px)`;
    }

    silenceAutomatedAdvance() {
        // This function mimics the original's call to an undefined 'stop()'.
        // As no auto-advance mechanism was present, it remains an empty function.
    }

    advancePanel() {
        if (this.activePanelIndex < this.maximumPanelIndex) {
            this.activePanelIndex++;
            this.updateTrackPosition(this.cachedContainerWidth);
        }
        this.silenceAutomatedAdvance();
    }

    recedePanel() {
        if (this.activePanelIndex > 0) {
            this.activePanelIndex--;
            this.updateTrackPosition(this.cachedContainerWidth);
        }
        this.silenceAutomatedAdvance();
    }

    handleDimensionAdjustment = () => {
        this.cachedContainerWidth = this.containerElement.clientWidth;
        this.individualPanels.forEach(panel => {
            panel.style.width = `${window.innerWidth}px`;
        });
        this.currentPanelWidth = this.individualPanels[0].clientWidth;

        this.updateTrackPosition(this.currentPanelWidth);

        if (this.previousPanelButton) this.previousPanelButton.style.left = '0';
        if (this.nextPanelButton) this.nextPanelButton.style.right = '0';
    }

    attachEventListeners() {
        this.previousPanelButton.addEventListener('click', this.recedePanel.bind(this));
        this.nextPanelButton.addEventListener('click', this.advancePanel.bind(this));
        window.addEventListener('resize', this.handleDimensionAdjustment);
    }
}