const AnimationFacilitator = (function() {
    let frameRequester = window.requestAnimationFrame ||
                         window.webkitRequestAnimationFrame ||
                         window.mozRequestAnimationFrame ||
                         function(callback) {
                             return window.setTimeout(callback, 1000 / 60);
                         };

    let frameCanceller = window.cancelAnimationFrame ||
                         window.webkitCancelAnimationFrame ||
                         window.mozCancelAnimationFrame ||
                         window.oCancelAnimationFrame ||
                         window.msCancelAnimationFrame ||
                         window.clearTimeout;

    return {
        obtainFrame: function(callback) {
            return frameRequester(callback);
        },
        releaseFrame: function(identifier) {
            frameCanceller(identifier);
        }
    };
})();


class ZoomView {
    #pointerLoc = { curX: 0, curY: 0, targetX: 0, targetY: 0 };
    #isWideFit = true;
    #animationHandle;
    #priorOffset;
    #currentOffset = 0;
    #originalSize;
    #displayedElement;
    #scaledSize = { w: 0, h: 0 };
    #mainWrapper;
    #wrapperSize = { w: 0, h: 0 };
    #excessSpace = { x: 0, y: 0 };
    #initialBodyOverflow;
    #eventRegistry = [];

    static #KEY_EXIT_CODE = 27;

    constructor() {}

    #styleElement(element, styles) {
        for (const prop in styles) {
            element.style[prop] = styles[prop];
        }
    }

    #calculateBestFit(sourceDimensions) {
        const viewportHeightRatio = window.innerHeight / sourceDimensions.h;

        if ((sourceDimensions.w * viewportHeightRatio) > window.innerWidth) {
            const viewportWidthRatio = window.innerWidth / sourceDimensions.w;
            return {
                w: sourceDimensions.w * viewportWidthRatio,
                h: sourceDimensions.h * viewportWidthRatio,
                orientation: false
            };
        } else {
            return {
                w: sourceDimensions.w * viewportHeightRatio,
                h: sourceDimensions.h * viewportHeightRatio,
                orientation: true
            };
        }
    }

    initializeObservers(elementsToObserve) {
        if (!elementsToObserve) {
            throw new Error('No elements provided for observation!');
        }

        if (elementsToObserve.length) {
            for (let i = 0; i < elementsToObserve.length; i++) {
                this.attachObserver(elementsToObserve[i]);
            }
        } else {
            this.attachObserver(elementsToObserve);
        }
    }

    attachObserver(elementItem) {
        const imageSourceAttribute = elementItem.getAttribute('data-image') || elementItem.src;
        if (imageSourceAttribute) {
            this.#registerHandler(elementItem, 'click', this.#handleImageActivation);
        }
    }

    beginAnimation() {
        this.#animationCycle();
    }

    haltAnimation() {
        AnimationFacilitator.releaseFrame(this.#animationHandle);
    }

    #animationCycle() {
        this.#animationHandle = AnimationFacilitator.obtainFrame(this.#animationCycle.bind(this));
        this.#adjustElementPosition();
    }

    preventScroll() {
        this.#initialBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    }

    restoreScroll() {
        document.body.style.overflow = this.#initialBodyOverflow;
    }

    constructDisplay(label, detail) {
        const wrapperStyles = {
            'backgroundColor': 'rgba(0,0,0,0.8)',
            'width': '100%',
            'height': '100%',
            'position': 'fixed',
            'top': '0px',
            'left': '0px',
            'overflow': 'hidden',
            'zIndex': '999999',
            'margin': '0px',
            'WebkitTransition': 'opacity 150ms cubic-bezier( 0, 0, .26, 1 )',
            'MozTransition': 'opacity 150ms cubic-bezier( 0, 0, .26, 1 )',
            'transition': 'opacity 150ms cubic-bezier( 0, 0, .26, 1 )',
            'opacity': '0'
        };
        this.#mainWrapper = document.createElement('div');
        this.#mainWrapper.appendChild(this.#displayedElement);
        this.#styleElement(this.#mainWrapper, wrapperStyles);

        const imageCursor = 'url( "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vdzcwdy5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcDEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3Q0IyNDI3M0FFMkYxMUUzOEQzQUQ5NTMxMDAwQjJGRCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3Q0IyNDI3NEFFMkYxMUUzOEQzQUQ5NTMxMDAwQjJGRCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjdDQjI0MjcxQUUyRjExM0QzQUQ5NTMxMDAwQjJGRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3Q0IyNDI3MkFFMkYxMUUzOEQzQUQ5NTMxMDAwQjJGRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsoZ1WgAABp5JREFUeNrcWn9MlVUY/u4dogIapV0gQ0SUO4WAXdT8B5ULc6uFgK3MLFxzFrQFZMtaed0oKTPj1x8EbbZZK5fNCdLWcvxQ+EOHyAQlBgiIVFxAJuUF7YrQ81zOtU+8F+Pe78K1d3s5537f+fE8nPec7z3vOSpJIRkbGwtEEgtdBdVCl0AXQr2hKqgJeg16BdoCwwNWoVSqbif7VQT8YqgB2jTmuDSJNoIcJUJVOVg5EsmH0Oehaj4bGRkZ6uvra2xvb29oamrqbGxs7K2vrx/s7Oy8yffBwcFzdTqdb0REhF9YWFhwSEhIpEajifDw8PDWzQ5Cj0GzMUoNUx0R1RQJaJAcgKaw7ujo6O2urq7qysrKioyMjHNDQ0OjU2nP29tbnZ+fv1qv18cFBQWtU6vVs9gN9BvobhDqU5wIKryA5CuoLwj83dzc/NOePXuOlpSUXFNjiiUlJS3ct2/fiytWrHgOhGbj0SD0dZD5UREiKOiJJA+axt9Go7F2165deUeOHOmVXCBbt271y8nJyfD3939aPCqCZoCQ2WEiKOQj7HYjnejUqVNFcXFxJdI0SEVFRdKGDRtShbmd5HwEGZM9IupJSHiJBjaazebr2dnZmdNFgsK+2Cf7JgZiEZhsimoSc/oZqh8eHjamp6fvPnTo0O/SDMiOHTsWFRQUHPDy8vLnQEGflZvZpKaFl4WcE7du3epPTU19+/Dhwz3SDMr27dsDioqKcufMmfM45wyIpD3QtPBiC0lgTowcPHgwa6ZJUIiBWIgJP1OB8aVJTQsFnkDSxCUWk60gPj6+VHIjKS8vT8TcSRdLsxhG5g+bpoWH3yF5ube3tw7L33uSGwqW/8/8/Pzoz30PItvuMy080HEZx/CZDQZDgeSmQmzESKwC870jgodcWhPhJx0LDw8vlNxYLl269Cb8Nfp5NP2kuyMiPM8EfvTodkhuLsQoJn4C/VG5ab3CfHd3d41SvpMrjRiBtVrgf01OZBv/nIRID4kIsM6xzBGxs7vK/YSvr2/SVF3xiYL55bVgwYJZp0+f/nOycuvXr38E+xczvOibjvTDLcDg4OBx7GfoD4ZwRPR8gUYbnKUBF3wuHMtPy8rKcmJjY33tleM7lqmpqdnPOo70RazAfNFapFrssaWOjo6Lzg43vj2zPT09febNm7eltLT0C1tk+IzvWIZlWcfR/oC5UWSjSCSUudbW1qvOEqmqqhrcvHnzOzdu3Lhii4ycBMuwLOs42t/ly5etmLUkEsJcbW3tbwq5ETbJ2CLBss70dfbsWSvmpZzsnJTzo6KiEhoaGoaVWlXkwE0mkyXk4+PjE6gUCUpMTMz86urq48gOkIjFWYHfEqf0EkkyJ06cyCMB/iah5OTkTCVIUDQajQf8wl+QNaune/2/c+eOS9olkb+YiYyM9FJ6NGhaHA2OBJV5e6uZI6LVaq2YTSTSz9zatWsfc8X84JzYtGlTJnUeauaorFy5cr7IXieRdubWrFnzpCtIJCYmWpZYKvNKksE/34q5g0RamQsNDV3sKhLy74ySZJYtW2bF3EIidZaFeOnSp5wl0t/fb4aYbJGwRYZlWcfR/mSYL8idRhOcxuTpdBoHBgZuY5Pk0LfrPqdRnE8080Fubm60Aru34QeRoLCMySoxCpItFnnCIVBB2kj5GHZj8iw/iDfWJHIaGBgYAyj4u5OghiBdZ00fqby9V0iMK8rSMoYMGZo392JECOwehAztHNipPFjxiGw0UnYuXPnInclQWzEKI0fCH1kL9JoCdAZjcZzAQEB77sjkZ6env3YjK22G6AT8i7DkSzI8KS7kSAmQWJQYL3HabwrjKVK4mQKX9w0g8EQ6i4k9u3dqyUm8TNNYJVsmpbMxL5EkuouxwopKSn+xcXFeeJYoRgkUmVYJyXirgc3ldBnbB302NxYiYJcGc4wgcLCwvysrCztTJgT+xYkzhCTvUPR//9hqBgZkxiZYjao1+vf4vLH4XalKbEP9iVIFIuRME2K9b92MOHCAEOdZS66MJAAAp5iiX0DBI4+ANfUiIhKvMLxOfRVSXaFA2ZQnpmZWefIFY68vLxVMNf4CVc4vuV3wiVXOCZUjkLygXTvpRoTL1Uw9NrS0tJVX1/fc/78+ettbW2WIPXy5cvnRkdHP6rT6QK0Wm0QNkXhGo0mUrjikvTvpZpPQODCFLA4bw6ya06/OnHNqXnGrjnZIyWNXzyjC0GPYIk0fvHM+h+XXzxjnOCcNH7x7KqT/VrSfwQYAOcX9HTDttYAAAAAElFTkSuQmCC" ) 25 25, no-drop';
        this.#styleElement(this.#displayedElement, { 'cursor': imageCursor });

        const captionWrapperStyles = {
            'fontFamily': 'Georgia, Times, "Times New Roman", serif',
            'position': 'fixed',
            'bottom': '0px',
            'left': '0px',
            'padding': '20px',
            'color': '#fff',
            'wordSpacing': '0.2px',
            'WebkitFontSmoothing': 'antialiased',
            'textShadow': '-1px 0px 1px rgba(0,0,0,0.4)'
        };
        const captionWrapper = document.createElement('div');
        this.#styleElement(captionWrapper, captionWrapperStyles);

        if (label) {
            const labelStyles = {
                'margin': '0px',
                'padding': '0px',
                'fontWeight': 'normal',
                'fontSize': '40px',
                'letterSpacing': '0.5px',
                'lineHeight': '35px',
                'textAlign': 'left'
            };
            const captionLabel = document.createElement('h1');
            this.#styleElement(captionLabel, labelStyles);
            captionLabel.innerHTML = label;
            captionWrapper.appendChild(captionLabel);
        }

        if (detail) {
            const detailStyles = {
                'margin': '0px',
                'padding': '0px',
                'fontWeight': 'normal',
                'fontSize': '20px',
                'letterSpacing': '0.1px',
                'maxWidth': '500px',
                'textAlign': 'left',
                'background': 'none',
                'marginTop': '5px'
            };
            const captionDetail = document.createElement('h2');
            this.#styleElement(captionDetail, detailStyles);
            captionDetail.innerHTML = detail;
            captionWrapper.appendChild(captionDetail);
        }

        this.#mainWrapper.appendChild(captionWrapper);

        this.updateLayout();

        this.#pointerLoc.curX = this.#pointerLoc.targetX = window.innerWidth / 2;
        this.#pointerLoc.curY = this.#pointerLoc.targetY = window.innerHeight / 2;

        document.body.appendChild(this.#mainWrapper);
        setTimeout(() => {
            this.#mainWrapper.style.opacity = '1';
        }, 10);
    }

    destroyDisplay() {
        this.restoreScroll();
        this.deregisterHandlers();
        this.haltAnimation();
        if (this.#mainWrapper && this.#mainWrapper.parentNode) {
            this.#mainWrapper.parentNode.removeChild(this.#mainWrapper);
        }
        this.#displayedElement = null;
        this.#mainWrapper = null;
    }

    updateLayout() {
        if (!this.#displayedElement || !this.#originalSize) return;

        const calculatedFit = this.#calculateBestFit(this.#originalSize);
        this.#displayedElement.width = calculatedFit.w;
        this.#displayedElement.height = calculatedFit.h;
        this.#isWideFit = calculatedFit.orientation;

        this.#scaledSize = { w: this.#displayedElement.width, h: this.#displayedElement.height };
        this.#wrapperSize = { w: window.innerWidth, h: window.innerHeight };
        this.#excessSpace = {
            x: this.#wrapperSize.w - this.#scaledSize.w,
            y: this.#wrapperSize.h - this.#scaledSize.h
        };
    }

    #handleImageActivation(activationElement) {
        const imgSource = activationElement.getAttribute('data-image') || activationElement.src;
        const imgLabel = activationElement.getAttribute('data-title');
        const imgDetail = activationElement.getAttribute('data-caption');

        const tempImage = new Image();
        tempImage.onload = () => {
            this.#originalSize = { w: tempImage.width, h: tempImage.height };
            this.#displayedElement = tempImage;
            this.constructDisplay(imgLabel, imgDetail);
            this.preventScroll();
            this.registerHandlers();
            this.beginAnimation();
        };
        tempImage.src = imgSource;
    }

    registerHandlers() {
        if (!this.#mainWrapper || !this.#displayedElement) return;

        this.#registerHandler(this.#mainWrapper, 'mousemove', this.#handlePointerMove);
        this.#registerHandler(this.#mainWrapper, 'touchmove', this.#handleTouchGesture);
        this.#registerHandler(window, 'resize', this.updateLayout);
        this.#registerHandler(window, 'keyup', this.#handleKeyPress);
        this.#registerHandler(this.#displayedElement, 'click', this.destroyDisplay);
    }

    deregisterHandlers() {
        this.#eventRegistry.forEach(({ element, eventName, handler }) => {
            element.removeEventListener(eventName, handler);
        });
        this.#eventRegistry = [];
    }

    #registerHandler(element, eventName, handler) {
        const boundHandler = handler.bind(this);
        element.addEventListener(eventName, boundHandler, { passive: eventName.startsWith('touch') });
        this.#eventRegistry.push({ element, eventName, handler: boundHandler });
    }

    #handlePointerMove(event) {
        this.#pointerLoc.targetX = event.clientX;
        this.#pointerLoc.targetY = event.clientY;
    }

    #handleTouchGesture(event) {
        event.preventDefault();
        this.#pointerLoc.targetX = event.touches[0].clientX;
        this.#pointerLoc.targetY = event.touches[0].clientY;
    }

    #handleKeyPress(event) {
        event.preventDefault();
        if (event.keyCode === ZoomView.#KEY_EXIT_CODE) {
            this.destroyDisplay();
        }
    }

    #adjustElementPosition() {
        const easingFactor = 0.05;
        this.#pointerLoc.curX += (this.#pointerLoc.targetX - this.#pointerLoc.curX) * easingFactor;
        this.#pointerLoc.curY += (this.#pointerLoc.targetY - this.#pointerLoc.curY) * easingFactor;

        let transformValue = '';

        if (this.#isWideFit) {
            this.#currentOffset += (this.#pointerLoc.curX - this.#currentOffset);
            if (this.#pointerLoc.curX !== this.#priorOffset) {
                const normalizedPosition = parseFloat(this.#currentOffset / this.#wrapperSize.w);
                const translation = this.#excessSpace.x * normalizedPosition;
                transformValue = `translate3d(${translation}px, 0px, 0px)`;
                this.#priorOffset = this.#pointerLoc.curX;
            }
        } else {
            this.#currentOffset += (this.#pointerLoc.curY - this.#currentOffset);
            if (this.#pointerLoc.curY !== this.#priorOffset) {
                const normalizedPosition = parseFloat(this.#currentOffset / this.#wrapperSize.h);
                const translation = this.#excessSpace.y * normalizedPosition;
                transformValue = `translate3d(0px, ${translation}px, 0px)`;
                this.#priorOffset = this.#pointerLoc.curY;
            }
        }
        
        if (transformValue && this.#displayedElement) {
            this.#displayedElement.style.WebkitTransform = transformValue;
            this.#displayedElement.style.MozTransform = transformValue;
            this.#displayedElement.style.msTransform = transformValue;
            this.#displayedElement.style.transform = transformValue;
        }
    }

    init(elements) {
        this.initializeObservers(elements);
    }

    refreshSize() {
        this.updateLayout();
    }

    startMotion() {
        this.beginAnimation();
    }

    stopMotion() {
        this.haltAnimation();
    }
}

const mediaDisplayInstance = new ZoomView();

const MediaDisplay = function(elements) {
    mediaDisplayInstance.init(elements);
};

MediaDisplay.refreshSize = function() {
    mediaDisplayInstance.refreshSize();
};

MediaDisplay.startMotion = function() {
    mediaDisplayInstance.startMotion();
};

MediaDisplay.stopMotion = function() {
    mediaDisplayInstance.stopMotion();
};