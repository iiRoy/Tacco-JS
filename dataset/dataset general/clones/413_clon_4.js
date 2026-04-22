class JourneyOrchestrator {
    #activeConfiguration;
    #currentPointIndex;
    #totalPointsCount;
    #journeyActive;
    #movementDirection;

    #pointDisplayElement;
    #controlPanelElement;
    #controlPanelStyleBase;

    #targetWidth;
    #targetHeight;
    #targetLeft;
    #targetTop;
    #displayWidth;
    #displayHeight;

    static #instance;
    static #defaultConfiguration = {
        roadmap: [],
        autoInitiate: false,
        controlPlacement: 'TR',
        welcomeNarrative: '<h2>Tour</h2><p>Welcome to the Tour Plugin</p>',
        actionLabels: {
            proceed: 'Next',
            revert: 'Previous',
            initiate: 'Start',
            conclude: 'End'
        },
        controlStyle: {
            background: 'rgba(8, 68, 142, 0.80)',
            color: '#fff'
        },
        displayStyle: {
            background: 'rgba(0, 0, 0, 0.70)',
            color: '#fff',
        }
    };

    constructor(initialOptions) {
        if (JourneyOrchestrator.#instance) {
            return JourneyOrchestrator.#instance;
        }
        JourneyOrchestrator.#instance = this;

        this.#activeConfiguration = { ...JourneyOrchestrator.#defaultConfiguration, ...initialOptions };
        this.#currentPointIndex = -1;
        this.#totalPointsCount = 0;
        this.#journeyActive = false;
        this.#movementDirection = 'forward';

        this.#initializeDisplayElements();
    }

    #initializeDisplayElements() {
        this.#pointDisplayElement = document.createElement('div');
        this.#pointDisplayElement.id = 'guideTipBox';
        this.#pointDisplayElement.className = 'guideTipBox';
        Object.assign(this.#pointDisplayElement.style, {
            display: 'none',
            padding: '10px 20px',
            position: 'absolute',
            fontFamily: 'sans-serif',
            borderRadius: '5px',
            fontSize: '12px',
            boxSizing: 'border-box',
            zIndex: '99999'
        });
        Object.assign(this.#pointDisplayElement.style, this.#activeConfiguration.displayStyle);
        document.body.prepend(this.#pointDisplayElement);

        this.#controlPanelElement = document.createElement('div');
        this.#controlPanelElement.id = 'guideControlPanel';
        this.#controlPanelStyleBase = {
            display: 'block',
            position: 'fixed',
            width: '200px',
            padding: '10px 20px',
            borderRadius: '10px',
            fontFamily: 'sans-serif',
            zIndex: '100000'
        };
        Object.assign(this.#controlPanelElement.style, this.#controlPanelStyleBase);
        Object.assign(this.#controlPanelElement.style, this.#activeConfiguration.controlStyle);
        document.body.append(this.#controlPanelElement);

        this.#attachGlobalListeners();
    }

    #attachGlobalListeners() {
        document.addEventListener('click', (event) => {
            if (event.target && event.target.id === 'guideContinueButton') {
                this.advancePoint();
            } else if (event.target && event.target.id === 'guidePreviousButton') {
                this.recedePoint();
            } else if (event.target && event.target.id === 'guideConcludeButton') {
                this.terminateJourney();
            }
        });
    }

    beginExploration(opts) {
        if (!this.#journeyActive) {
            this.#journeyActive = true;
            this.#activeConfiguration = { ...this.#activeConfiguration, ...opts };
            this.#totalPointsCount = this.#activeConfiguration.roadmap.length;

            this.#renderControlPanel();
            this.#updateControlPanelPlacement(this.#activeConfiguration.controlPlacement);

            this.#currentPointIndex = -1;
        }
    }

    advancePoint() {
        this.#movementDirection = 'forward';
        this.#currentPointIndex++;

        if (this.#currentPointIndex >= this.#totalPointsCount) {
            this.terminateJourney();
            return;
        }

        this.#pointDisplayElement.style.display = 'none';
        const currentPointData = this.#activeConfiguration.roadmap[this.#currentPointIndex];

        this.#updateControlPanelButtons();
        this.#renderPointDisplay(currentPointData);
    }

    recedePoint() {
        this.#movementDirection = 'backward';

        this.#pointDisplayElement.style.display = 'none';

        if (this.#currentPointIndex <= 0) {
            this.#currentPointIndex--;
            this.#updateControlPanelButtons();
            return;
        }

        this.#currentPointIndex--;
        const currentPointData = this.#activeConfiguration.roadmap[this.#currentPointIndex];
        this.#renderPointDisplay(currentPointData);
        this.#updateControlPanelButtons();
    }

    #renderControlPanel() {
        const labels = this.#activeConfiguration.actionLabels;
        this.#controlPanelElement.innerHTML = `
            <div id="guideInstructions">${this.#activeConfiguration.welcomeNarrative}</div>
            <div id="guideActionButtons">
                <button id="guidePreviousButton" style="display:none">${labels.revert}</button>
                <button id="guideContinueButton">${labels.initiate}</button>
                <a href="javascript:void(0);" id="guideConcludeButton" style="display:none; color: #fff; text-decoration: underline; font-size: 12px; float: right">${labels.conclude}</a>
            </div>
        `;
    }

    #updateControlPanelButtons() {
        const prevButton = document.getElementById('guidePreviousButton');
        const continueButton = document.getElementById('guideContinueButton');
        const concludeButton = document.getElementById('guideConcludeButton');
        const instructions = document.getElementById('guideInstructions');

        const labels = this.#activeConfiguration.actionLabels;

        if (this.#currentPointIndex === -1) {
            prevButton.style.display = 'none';
            concludeButton.style.display = 'none';
            continueButton.textContent = labels.initiate;
            instructions.innerHTML = this.#activeConfiguration.welcomeNarrative;
        } else {
            prevButton.style.display = 'inline-block';
            concludeButton.style.display = 'inline-block';
            continueButton.textContent = labels.proceed;
        }
    }

    #renderPointDisplay(pointData) {
        const targetElement = document.querySelector(pointData.element);
        if (!targetElement) {
            if (this.#movementDirection === 'forward') {
                this.advancePoint();
            } else {
                this.recedePoint();
            }
            return;
        }

        if (pointData.controlPlacement) {
            this.#updateControlPanelPlacement(pointData.controlPlacement);
        }

        if (pointData.displayContent) {
            this.#pointDisplayElement.innerHTML = pointData.displayContent;
            const instructionText = (typeof pointData.text !== 'undefined') ? pointData.text : pointData.displayContent;
            document.getElementById('guideInstructions').innerHTML = instructionText;

            const displayPositionKey = (typeof pointData.position === 'undefined') ? 'BL' : pointData.position;
            const calculatedPosition = this.#determinePointDisplayLocation(displayPositionKey, targetElement);

            Object.assign(this.#pointDisplayElement.style, {
                top: calculatedPosition.y + 'px',
                left: calculatedPosition.x + 'px',
                display: 'block'
            });

            this.#smoothScrollTo(this.#pointDisplayElement, 400, -100);
        }

        if (typeof pointData.callbackAction !== 'undefined') {
            if (pointData.callbackAction === 'click') {
                const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                const slugPattern = /^[a-z0-9-]+$/;
                const hrefAttr = targetElement.getAttribute('href');

                if (hrefAttr && (urlPattern.test(hrefAttr) || slugPattern.test(hrefAttr))) {
                    window.location.href = hrefAttr;
                } else {
                    targetElement.click();
                }
            } else {
                try {
                    const callbackFunction = new Function(pointData.callbackAction);
                    callbackFunction();
                } catch (e) {
                    console.error("Error executing callback action:", e);
                }
            }
        }

        if (pointData.advanceAutomatically === true) {
            if (this.#movementDirection === 'forward') {
                this.advancePoint();
            } else {
                this.recedePoint();
            }
        }
    }

    #updateControlPanelPlacement(placementKey) {
        const position = this.#determineControlPanelPlacement(placementKey);
        Object.assign(this.#controlPanelElement.style, this.#controlPanelStyleBase, this.#activeConfiguration.controlStyle, position);
    }

    #determinePointDisplayLocation(placementKey, targetElement) {
        this.#targetWidth = targetElement.offsetWidth;
        this.#targetHeight = targetElement.offsetHeight;
        const targetRect = targetElement.getBoundingClientRect();
        this.#targetLeft = targetRect.left + window.scrollX;
        this.#targetTop = targetRect.top + window.scrollY;

        const originalDisplay = this.#pointDisplayElement.style.display;
        this.#pointDisplayElement.style.display = 'block';
        this.#displayWidth = this.#pointDisplayElement.offsetWidth;
        this.#displayHeight = this.#pointDisplayElement.offsetHeight;
        this.#pointDisplayElement.style.display = originalDisplay;

        this.#pointDisplayElement.querySelectorAll('.guideArrowPointer').forEach(arrow => arrow.remove());

        let calculatedX, calculatedY;
        const arrowSize = 5;
        const offset = 10;

        const displayBackgroundColor = this.#pointDisplayElement.style.backgroundColor;

        const createArrow = (borderKey, value, posStyle) => {
            const arrow = document.createElement('div');
            arrow.className = 'guideArrowPointer';
            Object.assign(arrow.style, {
                position: 'absolute',
                display: 'block',
                width: '0',
                height: '0',
                [borderKey]: `${arrowSize}px solid ${value}`
            }, posStyle);
            return arrow;
        };

        const arrowUp = () => createArrow('borderBottom', displayBackgroundColor, { borderLeft: `${arrowSize}px solid transparent`, borderRight: `${arrowSize}px solid transparent` });
        const arrowDown = () => createArrow('borderTop', displayBackgroundColor, { borderLeft: `${arrowSize}px solid transparent`, borderRight: `${arrowSize}px solid transparent` });
        const arrowLeft = () => createArrow('borderRight', displayBackgroundColor, { borderTop: `${arrowSize}px solid transparent`, borderBottom: `${arrowSize}px solid transparent` });
        const arrowRight = () => createArrow('borderLeft', displayBackgroundColor, { borderTop: `${arrowSize}px solid transparent`, borderBottom: `${arrowSize}px solid transparent` });

        const positionStrategies = {
            'BL': () => {
                calculatedX = this.#targetLeft;
                calculatedY = this.#targetTop + this.#targetHeight + offset;
                const arrow = arrowUp();
                Object.assign(arrow.style, { top: `-${arrowSize}px`, left: '48%' });
                this.#pointDisplayElement.prepend(arrow);
            },
            'BR': () => {
                calculatedX = this.#targetLeft + this.#targetWidth - this.#displayWidth;
                calculatedY = this.#targetTop + this.#targetHeight + offset;
                const arrow = arrowUp();
                Object.assign(arrow.style, { top: `-${arrowSize}px`, left: '48%' });
                this.#pointDisplayElement.prepend(arrow);
            },
            'TL': () => {
                calculatedX = this.#targetLeft;
                calculatedY = (this.#targetTop - this.#displayHeight) - offset;
                const arrow = arrowDown();
                Object.assign(arrow.style, { top: `${this.#displayHeight}px`, left: '48%' });
                this.#pointDisplayElement.append(arrow);
            },
            'TR': () => {
                calculatedX = (this.#targetLeft + this.#targetWidth) - this.#displayWidth;
                calculatedY = this.#targetTop - this.#displayHeight - offset;
                const arrow = arrowDown();
                Object.assign(arrow.style, { top: `${this.#displayHeight}px`, left: '48%' });
                this.#pointDisplayElement.append(arrow);
            },
            'RT': () => {
                calculatedX = this.#targetLeft + this.#targetWidth + offset;
                calculatedY = this.#targetTop;
                const arrow = arrowLeft();
                Object.assign(arrow.style, { left: `-${arrowSize}px` });
                this.#pointDisplayElement.prepend(arrow);
            },
            'RB': () => {
                calculatedX = this.#targetLeft + this.#targetWidth + offset;
                calculatedY = this.#targetTop + this.#targetHeight - this.#displayHeight;
                const arrow = arrowLeft();
                Object.assign(arrow.style, { left: `-${arrowSize}px` });
                this.#pointDisplayElement.prepend(arrow);
            },
            'LT': () => {
                calculatedX = (this.#targetLeft - this.#displayWidth) - offset;
                calculatedY = this.#targetTop;
                const arrow = arrowRight();
                Object.assign(arrow.style, { right: `-${arrowSize}px` });
                this.#pointDisplayElement.prepend(arrow);
            },
            'LB': () => {
                calculatedX = (this.#targetLeft - this.#displayWidth) - offset;
                calculatedY = this.#targetTop + this.#targetHeight - this.#displayHeight;
                const arrow = arrowRight();
                Object.assign(arrow.style, { right: `-${arrowSize}px` });
                this.#pointDisplayElement.prepend(arrow);
            },
            'B': () => {
                calculatedX = this.#targetLeft + this.#targetWidth / 2 - this.#displayWidth / 2;
                calculatedY = (this.#targetTop + this.#targetHeight) + offset;
                const arrow = arrowUp();
                Object.assign(arrow.style, { top: `-${arrowSize}px`, left: '48%' });
                this.#pointDisplayElement.prepend(arrow);
            },
            'L': () => {
                calculatedX = (this.#targetLeft - this.#displayWidth) - offset;
                calculatedY = this.#targetTop + this.#targetHeight / 2 - this.#displayHeight / 2;
                const arrow = arrowRight();
                Object.assign(arrow.style, { right: `-${arrowSize}px` });
                this.#pointDisplayElement.prepend(arrow);
            },
            'T': () => {
                calculatedX = this.#targetLeft + this.#targetWidth / 2 - this.#displayWidth / 2;
                calculatedY = (this.#targetTop - this.#displayHeight) - offset;
                const arrow = arrowDown();
                Object.assign(arrow.style, { top: `${this.#displayHeight}px`, left: '48%' });
                this.#pointDisplayElement.append(arrow);
            },
            'R': () => {
                calculatedX = (this.#targetLeft + this.#targetWidth) + offset;
                calculatedY = this.#targetTop + this.#targetHeight / 2 - this.#displayHeight / 2;
                const arrow = arrowLeft();
                Object.assign(arrow.style, { left: `-${arrowSize}px` });
                this.#pointDisplayElement.prepend(arrow);
            }
        };

        const strategy = positionStrategies[placementKey];
        if (strategy) {
            strategy();
        } else {
            positionStrategies['BL']();
        }

        return { x: calculatedX, y: calculatedY };
    }

    #determineControlPanelPlacement(placementKey) {
        const placementMap = {
            'TR': { top: '10px', right: '10px', bottom: '', left: '' },
            'TL': { top: '10px', left: '10px', bottom: '', right: '' },
            'BL': { bottom: '10px', left: '10px', top: '', right: '' },
            'BR': { bottom: '10px', right: '10px', top: '', left: '' }
        };
        return placementMap[placementKey] || placementMap['TR'];
    }

    #smoothScrollTo(element, duration, offset) {
        const targetPosition = element.getBoundingClientRect().top + window.scrollY + offset;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animationStep(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            window.scrollTo(0, startPosition + distance * progress);
            if (timeElapsed < duration) {
                window.requestAnimationFrame(animationStep);
            }
        }
        window.requestAnimationFrame(animationStep);
    }

    terminateJourney() {
        if (this.#controlPanelElement) {
            this.#controlPanelElement.remove();
        }
        if (this.#pointDisplayElement) {
            this.#pointDisplayElement.remove();
        }
        this.#currentPointIndex = -1;
        this.#journeyActive = false;
        JourneyOrchestrator.#instance = null;
    }
}

function initiateInteractiveGuide(optionsPayload) {
    if (typeof optionsPayload === 'string') {
        const existingGuide = JourneyOrchestrator.#instance;
        if (existingGuide) {
            const methodMap = {
                'next': 'advancePoint',
                'prev': 'recedePoint',
                'destroy': 'terminateJourney'
            };
            const mappedMethod = methodMap[optionsPayload];
            if (mappedMethod && typeof existingGuide[mappedMethod] === 'function') {
                existingGuide[mappedMethod]();
            } else {
                console.error(`Method '${optionsPayload}' does not exist on InteractiveGuide.`);
            }
        } else {
            console.error(`InteractiveGuide not initialized to call method '${optionsPayload}'.`);
        }
    } else if (typeof optionsPayload === 'object' || !optionsPayload) {
        const guide = new JourneyOrchestrator(optionsPayload);
        guide.beginExploration(optionsPayload);
    } else {
        console.error('Invalid arguments for initiateInteractiveGuide.');
    }
}

window.InteractiveGuide = initiateInteractiveGuide;