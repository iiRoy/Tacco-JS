(function() {
    function mergeConfigurations(initialSettings, userProvidedSettings) {
        const consolidatedSettings = {};
        for (const attribute in initialSettings) {
            consolidatedSettings[attribute] = initialSettings[attribute];
        }
        for (const attribute in userProvidedSettings) {
            consolidatedSettings[attribute] = userProvidedSettings[attribute];
        }
        return consolidatedSettings;
    }

    class ContentRotator {
        constructor(hostElementSelector, userOptions) {
            this.displayHost = document.querySelector(hostElementSelector);
            if (!this.displayHost) {
                console.error("ContentRotator: Target element not found for selector:", hostElementSelector);
                return;
            }

            this.settings = mergeConfigurations({
                formerControlClass: "previous-button",
                latterControlClass: "next-button",
                disabledIndicator: "inactive-state",
                contentUnitSelector: "div",
                transitionEffect: "dissolve", // Options: 'dissolve', 'traverse-left', 'traverse-right', 'traverse-up', 'traverse-down', 'random-shift'
                transitionCurve: "ease-in-out",
                transitionDuration: 700, // Milliseconds
                paginationEnabled: true,
                paginationActiveMark: "current-page",
                paginationWrapperClass: "page-indicators",
                automaticAdvancement: false,
                advanceInterval: 5000,
                pauseOnHover: true,
                advanceOnPaneClick: false,
                cyclicMotion: false,
                paneBackgroundImages: false
            }, userOptions);

            this.contentPanes = Array.from(this.displayHost.querySelectorAll(this.settings.contentUnitSelector));
            this.totalPanes = this.contentPanes.length;
            this.currentPanePosition = 0; // Zero-based index

            this.previousNav = document.querySelector("." + this.settings.formerControlClass);
            this.nextNav = document.querySelector("." + this.settings.latterControlClass);
            this.autoAdvanceClock = null;

            this.initializeView();
            this.bindInteractionHandlers();
            if (this.settings.automaticAdvancement) {
                this.startAutoAdvance();
            }
            this.refreshNavigationStates();
        }

        initializeView() {
            this.contentPanes.forEach((pane, index) => {
                pane.style.display = 'none';
                pane.classList.add('rotator-panel-visual');
                pane.style.transition = `opacity ${this.settings.transitionDuration / 1000}s ${this.settings.transitionCurve}, transform ${this.settings.transitionDuration / 1000}s ${this.settings.transitionCurve}`;
            });
            this.contentPanes[this.currentPanePosition].style.display = 'block';
            this.contentPanes[this.currentPanePosition].classList.add('active-rotator-panel');

            if (this.settings.paginationEnabled) {
                this.generatePaginationLinks();
            }
            this.updateHostBackground(this.currentPanePosition);
        }

        bindInteractionHandlers() {
            if (this.previousNav) {
                this.previousNav.addEventListener("click", (evt) => this.handleDirectionalMove(evt, "back"));
            }
            if (this.nextNav) {
                this.nextNav.addEventListener("click", (evt) => this.handleDirectionalMove(evt, "forward"));
            }

            if (this.settings.paginationEnabled) {
                const indicatorList = this.displayHost.querySelector("." + this.settings.paginationWrapperClass);
                if (indicatorList) {
                    indicatorList.addEventListener("click", (evt) => this.handleIndicatorClick(evt));
                }
            }

            if (this.settings.advanceOnPaneClick) {
                this.contentPanes.forEach(pane => {
                    pane.addEventListener("click", (evt) => this.handleDirectionalMove(evt, "forward"));
                });
            }

            if (this.settings.automaticAdvancement && this.settings.pauseOnHover) {
                this.displayHost.addEventListener("mouseenter", () => this.stopAutoAdvance());
                this.displayHost.addEventListener("mouseleave", () => this.startAutoAdvance());
            }
        }

        handleDirectionalMove(eventData, direction) {
            eventData.preventDefault();
            this.stopAutoAdvance();

            let desiredIndex = this.currentPanePosition;
            if (direction === "forward") {
                desiredIndex++;
                if (desiredIndex >= this.totalPanes) {
                    desiredIndex = this.settings.cyclicMotion ? 0 : this.totalPanes - 1;
                }
            } else { // back
                desiredIndex--;
                if (desiredIndex < 0) {
                    desiredIndex = this.settings.cyclicMotion ? this.totalPanes - 1 : 0;
                }
            }
            this.shiftDisplayTo(desiredIndex, direction);
            if (this.settings.automaticAdvancement) {
                this.startAutoAdvance();
            }
        }

        handleIndicatorClick(eventData) {
            eventData.preventDefault();
            const clickedLink = eventData.target.closest('a');
            if (clickedLink && clickedLink.hasAttribute('data-pane-index')) {
                this.stopAutoAdvance();
                const targetIndex = parseInt(clickedLink.getAttribute('data-pane-index'), 10);
                if (targetIndex !== this.currentPanePosition) {
                    this.shiftDisplayTo(targetIndex, targetIndex > this.currentPanePosition ? "forward" : "back");
                }
                if (this.settings.automaticAdvancement) {
                    this.startAutoAdvance();
                }
            }
        }

        startAutoAdvance() {
            if (this.autoAdvanceClock) {
                clearInterval(this.autoAdvanceClock);
            }
            this.autoAdvanceClock = setInterval(() => {
                let nextIndex = this.currentPanePosition + 1;
                if (nextIndex >= this.totalPanes) {
                    nextIndex = this.settings.cyclicMotion ? 0 : this.totalPanes - 1;
                    if (!this.settings.cyclicMotion) {
                         this.stopAutoAdvance();
                         return;
                    }
                }
                this.shiftDisplayTo(nextIndex, "forward");
            }, this.settings.advanceInterval);
        }

        stopAutoAdvance() {
            if (this.autoAdvanceClock) {
                clearInterval(this.autoAdvanceClock);
                this.autoAdvanceClock = null;
            }
        }

        shiftDisplayTo(newIndex, moveDirectionHint) {
            if (newIndex === this.currentPanePosition) return;

            const outgoingPane = this.contentPanes[this.currentPanePosition];
            const incomingPane = this.contentPanes[newIndex];

            this.applyVisualTransition(outgoingPane, incomingPane, this.settings.transitionEffect, moveDirectionHint);

            this.currentPanePosition = newIndex;
            this.refreshNavigationStates();
            if (this.settings.paginationEnabled) {
                this.refreshPaginationStates();
            }
            this.updateHostBackground(this.currentPanePosition);
        }

        applyVisualTransition(leavingElement, enteringElement, effectKind, direction) {
            const durationSec = this.settings.transitionDuration / 1000;
            const transitionClasses = {
                'dissolve': { enter: 'fade-in-effect', exit: 'fade-out-effect' },
                'traverse-left': { enter: 'slide-in-right-effect', exit: 'slide-out-left-effect' },
                'traverse-right': { enter: 'slide-in-left-effect', exit: 'slide-out-right-effect' },
                'traverse-up': { enter: 'slide-in-down-effect', exit: 'slide-out-up-effect' },
                'traverse-down': { enter: 'slide-in-up-effect', exit: 'slide-out-down-effect' },
            };

            let chosenEffect = effectKind;
            if (effectKind === "random-shift") {
                const availableEffects = Object.keys(transitionClasses).filter(e => e !== 'random-shift');
                chosenEffect = availableEffects[Math.floor(Math.random() * availableEffects.length)];
            }

            const activeEffectClasses = transitionClasses[chosenEffect] || transitionClasses['dissolve'];

            leavingElement.classList.remove('active-rotator-panel');
            leavingElement.classList.add(activeEffectClasses.exit);
            leavingElement.addEventListener('transitionend', function handler() {
                leavingElement.style.display = 'none';
                leavingElement.classList.remove(activeEffectClasses.exit);
                leavingElement.removeEventListener('transitionend', handler);
            }, { once: true });

            enteringElement.classList.add(activeEffectClasses.enter);
            enteringElement.style.display = 'block';
            void enteringElement.offsetWidth; // Trigger reflow for CSS transition
            enteringElement.classList.add('active-rotator-panel');
            enteringElement.addEventListener('transitionend', function handler() {
                enteringElement.classList.remove(activeEffectClasses.enter);
                enteringElement.removeEventListener('transitionend', handler);
            }, { once: true });
        }

        refreshNavigationStates() {
            if (!this.settings.cyclicMotion) {
                if (this.previousNav) {
                    if (this.currentPanePosition === 0) {
                        this.previousNav.classList.add(this.settings.disabledIndicator);
                        this.previousNav.style.cursor = "default";
                    } else {
                        this.previousNav.classList.remove(this.settings.disabledIndicator);
                        this.previousNav.style.cursor = "pointer";
                    }
                }
                if (this.nextNav) {
                    if (this.currentPanePosition === this.totalPanes - 1) {
                        this.nextNav.classList.add(this.settings.disabledIndicator);
                        this.nextNav.style.cursor = "default";
                    } else {
                        this.nextNav.classList.remove(this.settings.disabledIndicator);
                        this.nextNav.style.cursor = "pointer";
                    }
                }
            } else {
                if (this.previousNav) {
                    this.previousNav.classList.remove(this.settings.disabledIndicator);
                    this.previousNav.style.cursor = "pointer";
                }
                if (this.nextNav) {
                    this.nextNav.classList.remove(this.settings.disabledIndicator);
                    this.nextNav.style.cursor = "pointer";
                }
            }
        }

        generatePaginationLinks() {
            const paginationList = document.createElement("ul");
            paginationList.classList.add(this.settings.paginationWrapperClass);

            for (let i = 0; i < this.totalPanes; i++) {
                const listItem = document.createElement("li");
                const linkElement = document.createElement("a");
                linkElement.href = "#";
                linkElement.textContent = (i + 1).toString();
                linkElement.setAttribute("data-pane-index", i.toString());
                if (i === this.currentPanePosition) {
                    linkElement.classList.add(this.settings.paginationActiveMark);
                }
                listItem.appendChild(linkElement);
                paginationList.appendChild(listItem);
            }
            this.displayHost.appendChild(paginationList);
        }

        refreshPaginationStates() {
            const indicators = this.displayHost.querySelectorAll(`.${this.settings.paginationWrapperClass} a`);
            indicators.forEach((link, index) => {
                if (index === this.currentPanePosition) {
                    link.classList.add(this.settings.paginationActiveMark);
                } else {
                    link.classList.remove(this.settings.paginationActiveMark);
                }
            });
        }

        updateHostBackground(paneIndex) {
            if (this.settings.paneBackgroundImages && this.contentPanes[paneIndex]) {
                const imageInPane = this.contentPanes[paneIndex].querySelector("img");
                if (imageInPane && imageInPane.src) {
                    this.displayHost.style.backgroundImage = `url(${imageInPane.src})`;
                    this.displayHost.style.backgroundPosition = 'center center';
                    this.displayHost.style.backgroundSize = 'cover';
                } else {
                    this.displayHost.style.backgroundImage = 'none';
                }
            } else {
                this.displayHost.style.backgroundImage = 'none';
            }
        }
    }

    // Global entry point for instantiation
    window.activateContentRotator = function(selector, options) {
        return new ContentRotator(selector, options);
    };

})();