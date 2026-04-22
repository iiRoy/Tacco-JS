class PageScroller {
    constructor(userOptions) {
        this.configuration = Object.assign({}, PageScroller.standardConfiguration, userOptions);

        this.pageSections = [];
        this.navigationElements = [];
        this.currentlyActiveSectionId = null;
        this.scrollAnimationActive = false;
        this.animationRequestFrame = null;

        this.prepareDocumentElements();
        this.establishEventObservers();
        this.assessCurrentScrollPosition();
    }

    static get standardConfiguration() {
        return {
            keyUpIdentity: 'ArrowUp',
            keyDownIdentity: 'ArrowDown',
            animationDuration: 600,
            highlightClass: 'active',
            onSectionSwitch: null,
            verticalAdjustment: 0
        };
    }

    prepareDocumentElements() {
        const sections = Array.from(document.querySelectorAll('[data-section-id]'));
        const navLinks = Array.from(document.querySelectorAll('[data-section-link]'));

        this.pageSections = sections
            .map(element => {
                const identifier = parseInt(element.getAttribute('data-section-id'), 10);
                return {
                    identifier: identifier,
                    domReference: element,
                    topCoordinate: element.getBoundingClientRect().top + window.scrollY,
                    heightDimension: element.offsetHeight
                };
            })
            .sort((a, b) => a.identifier - b.identifier);

        this.navigationElements = navLinks
            .map(element => {
                const identifier = parseInt(element.getAttribute('data-section-link'), 10);
                return {
                    identifier: identifier,
                    domReference: element
                };
            })
            .sort((a, b) => a.identifier - b.identifier);

        this.highestIdentifier = this.pageSections.length > 0 ?
            Math.max(...this.pageSections.map(s => s.identifier)) : 0;
    }

    establishEventObservers() {
        window.addEventListener('scroll', this.assessCurrentScrollPosition.bind(this));
        window.addEventListener('keydown', this.processKeyboardInput.bind(this));
        document.body.addEventListener('click', this.processLinkClick.bind(this));
    }

    static applyEasing(timeFactor) {
        return timeFactor; // Linear easing, matching original's default
    }

    initiateSmoothScroll(targetVerticalPosition) {
        if (this.scrollAnimationActive) {
            cancelAnimationFrame(this.animationRequestFrame);
        }

        this.scrollAnimationActive = true;
        const initialPosition = window.scrollY;
        const delta = targetVerticalPosition - initialPosition;
        const startingTimestamp = performance.now();

        const animateScrollStep = (currentTimestamp) => {
            const elapsed = currentTimestamp - startingTimestamp;
            const progressRatio = Math.min(elapsed / this.configuration.animationDuration, 1);
            const easedProgress = PageScroller.applyEasing(progressRatio);

            window.scrollTo(0, initialPosition + delta * easedProgress);

            if (progressRatio < 1) {
                this.animationRequestFrame = requestAnimationFrame(animateScrollStep);
            } else {
                this.scrollAnimationActive = false;
                window.scrollTo(0, targetVerticalPosition);
            }
        };

        this.animationRequestFrame = requestAnimationFrame(animateScrollStep);
    }

    navigateToSection(identifierValue) {
        const designatedSection = this.pageSections.find(s => s.identifier === identifierValue);
        if (designatedSection) {
            const adjustedTargetTop = designatedSection.topCoordinate + this.configuration.verticalAdjustment + 1;
            this.initiateSmoothScroll(adjustedTargetTop);
        }
    }

    processKeyboardInput(event) {
        const isScrollKey = (event.key === this.configuration.keyUpIdentity || event.key === this.configuration.keyDownIdentity);
        if (this.scrollAnimationActive && isScrollKey) {
            event.preventDefault();
            return;
        }

        let nextSectionCandidate = this.currentlyActiveSectionId;

        if (event.key === this.configuration.keyUpIdentity && nextSectionCandidate > 0) {
            nextSectionCandidate--;
            event.preventDefault();
        } else if (event.key === this.configuration.keyDownIdentity && nextSectionCandidate < this.highestIdentifier) {
            nextSectionCandidate++;
            event.preventDefault();
        }

        if (nextSectionCandidate !== this.currentlyActiveSectionId) {
            this.navigateToSection(nextSectionCandidate);
        }
    }

    processLinkClick(event) {
        const clickedElement = event.target;
        let targetSectionIdentifier = null;

        const navEntry = clickedElement.closest('[data-section-link]');
        if (navEntry) {
            targetSectionIdentifier = parseInt(navEntry.getAttribute('data-section-link'), 10);
        } else {
            const directLink = clickedElement.closest('[data-target-section-link]');
            if (directLink) {
                targetSectionIdentifier = parseInt(directLink.getAttribute('data-target-section-link'), 10);
            }
        }

        if (targetSectionIdentifier !== null && !isNaN(targetSectionIdentifier)) {
            event.preventDefault();
            this.navigateToSection(targetSectionIdentifier);
        }
    }

    refreshNavigationHighlight(newSectionIdentifier) {
        if (this.configuration.onSectionSwitch && newSectionIdentifier !== null && newSectionIdentifier !== this.currentlyActiveSectionId) {
            this.configuration.onSectionSwitch(newSectionIdentifier);
        }

        this.currentlyActiveSectionId = newSectionIdentifier;

        this.navigationElements.forEach(nav => {
            if (nav.domReference) {
                if (nav.identifier === newSectionIdentifier) {
                    nav.domReference.classList.add(this.configuration.highlightClass);
                } else {
                    nav.domReference.classList.remove(this.configuration.highlightClass);
                }
            }
        });
    }

    assessCurrentScrollPosition() {
        const currentWindowScrollY = window.scrollY;
        let identifiedActiveSection = null;

        for (const section of this.pageSections) {
            const sectionTopAdjusted = section.topCoordinate + this.configuration.verticalAdjustment;
            const sectionBottomAdjusted = section.topCoordinate + this.configuration.verticalAdjustment + section.heightDimension;

            if (currentWindowScrollY >= sectionTopAdjusted && currentWindowScrollY < sectionBottomAdjusted) {
                identifiedActiveSection = section.identifier;
                break;
            }
        }
        this.refreshNavigationHighlight(identifiedActiveSection);
    }
}

function establishPageNavigation(options) {
    new PageScroller(options);
}

window.setupContentScroller = establishPageNavigation;