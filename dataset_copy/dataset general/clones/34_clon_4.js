const instanceRegistry = new WeakMap();

class AstroRate {
    static baseConfig = {
        selectionValue: undefined,
        totalStars: 5,
        onScoreChange: () => {}
    };

    constructor(hostElement, initialOptions = {}) {
        this.hostElement = hostElement;
        this.starVisuals = [];

        this.config = { ...AstroRate.baseConfig, ...initialOptions };

        const dataSelection = this.hostElement.dataset.selectionValue;
        if (dataSelection !== undefined) {
            const parsedSelection = parseFloat(dataSelection);
            if (!isNaN(parsedSelection)) {
                this.config.selectionValue = parsedSelection;
            }
        }

        const dataTotalStars = this.hostElement.dataset.totalStars;
        if (dataTotalStars !== undefined) {
            const parsedTotalStars = parseInt(dataTotalStars, 10);
            if (!isNaN(parsedTotalStars)) {
                this.config.totalStars = parsedTotalStars;
            }
        }

        this.constructVisuals();
        this.refreshVisuals();
        this.bindInteractionListeners();
    }

    constructVisuals() {
        this.hostElement.innerHTML = '';
        this.starVisuals = Array.from({ length: this.config.totalStars }, (_, index) => {
            const starIcon = document.createElement('i');
            starIcon.classList.add('fa', 'fa-star-o');
            starIcon.dataset.starPosition = index + 1;
            this.hostElement.appendChild(starIcon);
            return starIcon;
        });
    }

    establishScore(newScore) {
        if (this.config.selectionValue === newScore) {
            newScore = undefined;
        }
        this.config.selectionValue = newScore;
        this.refreshVisuals();

        const scoreChangeEvent = new CustomEvent('astro-score-updated', {
            detail: { score: newScore },
            bubbles: true
        });
        this.hostElement.dispatchEvent(scoreChangeEvent);

        this.config.onScoreChange(scoreChangeEvent, newScore);
    }

    refreshVisuals(displayScore) {
        const scoreToRender = displayScore !== undefined ? displayScore : this.config.selectionValue;
        const totalPossibleStars = this.config.totalStars;

        this.starVisuals.forEach(star => {
            star.classList.remove('fa-star');
            star.classList.add('fa-star-o');
        });

        if (scoreToRender !== undefined && scoreToRender > 0) {
            for (let i = 0; i < scoreToRender; i++) {
                if (this.starVisuals[i]) {
                    this.starVisuals[i].classList.remove('fa-star-o');
                    this.starVisuals[i].classList.add('fa-star');
                }
            }

            if (scoreToRender < 5) {
                for (let i = scoreToRender; i < Math.min(totalPossibleStars, 5); i++) {
                    if (this.starVisuals[i]) {
                        this.starVisuals[i].classList.remove('fa-star');
                        this.starVisuals[i].classList.add('fa-star-o');
                    }
                }
            }
        }
    }

    bindInteractionListeners() {
        this.hostElement.addEventListener('mouseover', (e) => this.handleHoverEffect(e));
        this.hostElement.addEventListener('mouseout', () => this.handleMouseLeave());
        this.hostElement.addEventListener('click', (e) => this.handleStarSelection(e));
    }

    handleHoverEffect(event) {
        if (event.target.tagName === 'I' && this.hostElement.contains(event.target)) {
            const score = parseInt(event.target.dataset.starPosition, 10);
            this.refreshVisuals(score);
        }
    }

    handleMouseLeave() {
        this.refreshVisuals();
    }

    handleStarSelection(event) {
        if (event.target.tagName === 'I' && this.hostElement.contains(event.target)) {
            const score = parseInt(event.target.dataset.starPosition, 10);
            this.establishScore(score);
        }
    }
}

function configureAstroRating(selector, ...operationArgs) {
    const targetElements = document.querySelectorAll(selector);

    targetElements.forEach(currentElement => {
        let instance = instanceRegistry.get(currentElement);

        if (!instance) {
            const optionsForInit = typeof operationArgs[0] === 'object' ? operationArgs[0] : {};
            instance = new AstroRate(currentElement, optionsForInit);
            instanceRegistry.set(currentElement, instance);
        }

        if (typeof operationArgs[0] === 'string') {
            const methodName = operationArgs[0];
            const methodArguments = operationArgs.slice(1);
            if (typeof instance[methodName] === 'function') {
                instance[methodName](...methodArguments);
            }
        }
    });

    return targetElements;
}

document.addEventListener('DOMContentLoaded', () => {
    configureAstroRating(".astro-rating-container");
});