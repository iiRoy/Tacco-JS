(function() {

    function combineSettings(base, overrides) {
        const result = {};
        for (const key in base) {
            if (Object.prototype.hasOwnProperty.call(base, key)) {
                result[key] = base[key];
            }
        }
        for (const key in overrides) {
            if (Object.prototype.hasOwnProperty.call(overrides, key)) {
                if (typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key]) &&
                    typeof overrides[key] === 'object' && overrides[key] !== null && !Array.isArray(overrides[key])) {
                    result[key] = combineSettings(base[key], overrides[key]);
                } else {
                    result[key] = overrides[key];
                }
            }
        }
        return result;
    }

    class CarouselSystem {
        constructor(domElement, options) {
            this._mainElement = domElement;
            this._visualContainer = this._mainElement.querySelector(".container");
            this._pictureElements = Array.from(this._visualContainer.querySelectorAll(".slider-image"));

            this._configuration = combineSettings(CarouselSystem.DEFAULT_OPTIONS, options);

            this._visualContainer.style.transition = `left ${this._configuration.motionSpeed}s ease`;

            this._currentPosition = 0;
            this._totalCount = null;

            this._touchStartX = 0;
            this._touchStartY = 0;
            this._touchCurrentX = 0;
            this._isSwiping = false;

            this.beginSetup();
        }

        checkSingularity() {
            return this._mainElement.querySelectorAll(".slider-image:not(.overview)").length <= 1;
        }

        beginSetup() {
            this._totalCount = this._mainElement.querySelectorAll('.slider-image').length;

            if (!this.checkSingularity() && this._configuration.showNavigation) {
                const controlWrapper = document.createElement("div");
                controlWrapper.className = "carousel-controls";

                const nextButton = document.createElement("button");
                nextButton.className = "next-item";
                const nextImage = document.createElement("img");
                nextImage.src = this._configuration.nextGraphic;
                nextButton.appendChild(nextImage);

                const counterSpan = document.createElement("span");
                counterSpan.className = "counter-display";
                counterSpan.textContent = `${this._currentPosition + 1}/${this._totalCount}`;

                controlWrapper.appendChild(nextButton);
                controlWrapper.appendChild(counterSpan);
                this._mainElement.appendChild(controlWrapper);

                nextButton.addEventListener("click", (evt) => {
                    evt.preventDefault();
                    this.handleDirectionalInput(1);
                });
            }

            if (this._totalCount === 1) {
                const controls = this._mainElement.querySelector(".carousel-controls");
                if (controls) {
                    controls.classList.add("hidden-controls");
                }
            }

            if (this._configuration.touch.enabled) {
                const triggerElement = document.querySelector(this._configuration.touch.activationElement);
                if (triggerElement) {
                    const swipeTarget = triggerElement.querySelector('.container');
                    if (swipeTarget) {
                        swipeTarget.addEventListener("touchstart", this._handleTouchStart.bind(this));
                        swipeTarget.addEventListener("touchmove", this._handleTouchMove.bind(this));
                        swipeTarget.addEventListener("touchend", this._handleTouchEnd.bind(this));
                    }
                }
            }

            if (this._configuration.keyboard.enabled) {
                document.addEventListener("keydown", (evt) => {
                    switch (evt.which) {
                        case this._configuration.keyboard.previousKey:
                            this.handleDirectionalInput(-1);
                            break;
                        case this._configuration.keyboard.nextKey:
                            this.handleDirectionalInput(1);
                            break;
                        default:
                            return;
                    }
                    evt.preventDefault();
                });
            }

            this.adjustDisplay();
            this.updateCounterText();
        }

        adjustDisplay() {
            this._mainElement.style.overflow = "hidden";
            this._visualContainer.style.width = `${this._totalCount * 100}%`;
            this._pictureElements.forEach(item => {
                item.style.float = "left";
                item.style.width = `${100 / this._totalCount}%`;

                const imageWrapper = item.querySelector('.img-container');
                if (imageWrapper) {
                    imageWrapper.style.height = '0px';
                    imageWrapper.style.paddingTop = this._configuration.imgRatio;
                }
            });
        }

        updateCounterText() {
            const counterElement = this._mainElement.querySelector(".counter-display");
            if (counterElement) {
                counterElement.textContent = `${this._currentPosition + 1}/${this._totalCount}`;
            }
        }

        shiftView(distanceFactor) {
            let actualFactor = (typeof distanceFactor === 'undefined') ? 1 : Math.abs(distanceFactor);

            this._visualContainer.style.transition = `left ${this._configuration.motionSpeed * actualFactor}s ease`;
            this._visualContainer.style.left = `${(this._currentPosition * -100)}%`;

            this.updateCounterText();
        }

        handleDirectionalInput(offset) {
            let formerPosition = this._currentPosition;
            this._currentPosition = (((this._currentPosition + offset) % this._totalCount) + this._totalCount) % this._totalCount;
            let transitionFactor = formerPosition - this._currentPosition;

            this.shiftView(transitionFactor);
        }

        goBackward() {
            let formerPosition = this._currentPosition;
            this._currentPosition = Math.max(this._currentPosition - 1, 0);
            let transitionFactor = formerPosition - this._currentPosition;
            this.shiftView(transitionFactor);
        }

        goForward() {
            let formerPosition = this._currentPosition;
            this._currentPosition = Math.min(this._currentPosition + 1, this._totalCount - 1);
            let transitionFactor = formerPosition - this._currentPosition;
            this.shiftView(transitionFactor);
        }

        dragImages(percentDistance, animationDuration) {
            this._visualContainer.style.transition = `left ${animationDuration}s ease`;
            this._visualContainer.style.left = `${percentDistance}%`;
        }

        _handleTouchStart(evt) {
            this._touchStartX = evt.touches[0].clientX;
            this._touchStartY = evt.touches[0].clientY;
            this._isSwiping = true;
            this._visualContainer.style.transition = 'none';
        }

        _handleTouchMove(evt) {
            if (!this._isSwiping) return;

            this._touchCurrentX = evt.touches[0].clientX;
            const deltaX = this._touchCurrentX - this._touchStartX;
            const deltaY = evt.touches[0].clientY - this._touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY) + 5) {
                evt.preventDefault();
                const containerWidth = this._mainElement.offsetWidth;
                const distanceInPercent = (deltaX / containerWidth) * 100;

                const newLeft = (this._currentPosition * -100) + distanceInPercent;
                this.dragImages(newLeft, 0);
            } else {
                this._isSwiping = false;
            }
        }

        _handleTouchEnd(evt) {
            if (!this._isSwiping) {
                this.dragImages(this._currentPosition * -100, this._configuration.motionSpeed);
                this._visualContainer.style.transition = `left ${this._configuration.motionSpeed}s ease`;
                return;
            }

            const deltaX = this._touchCurrentX - this._touchStartX;
            const containerWidth = this._mainElement.offsetWidth;
            const swipeThreshold = containerWidth * 0.1;

            this._visualContainer.style.transition = `left ${this._configuration.motionSpeed}s ease`;

            if (deltaX > swipeThreshold) {
                this.goBackward();
            } else if (deltaX < -swipeThreshold) {
                this.goForward();
            } else {
                this.shiftView(1);
            }
            this._isSwiping = false;
        }
    }

    CarouselSystem.DEFAULT_OPTIONS = {
        motionSpeed: 0.5,
        touch: {
            enabled: true,
            activationElement: '.touch'
        },
        keyboard: {
            enabled: true,
            previousKey: 37,
            nextKey: 39
        },
        showNavigation: true,
        nextGraphic: 'data:image/svg+xml;base64,PD94bWwgdmVycmlvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMvL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIyMDBweCIgaGVpZ2h0PSIyMDBweCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIwMCAyMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHBvbHlsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgcG9pbnRzPQ0KCTU1LjM1NCw1Ljk0NiAxNDQuNjQ2LDk5LjYxNCA1NS4zNTQsMTk0LjA1MyAiLz4NCjwvc3ZnPg0K',
        imgRatio: '50%'
    };

    window.initCarousel = function(selector, options) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (!element.dataset.carouselInstance) {
                element.dataset.carouselInstance = new CarouselSystem(element, options);
            }
        });
    };

})();