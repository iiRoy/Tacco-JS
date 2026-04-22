(function() {
    "use strict";

    // Utility to determine the correct transition end event name
    const detectTransitionCompletionEvent = () => {
        const temporaryElement = document.createElement('div');
        const eventMap = {
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        };
        for (const property in eventMap) {
            if (temporaryElement.style[property] !== undefined) {
                return eventMap[property];
            }
        }
        return null;
    };
    const transitionCompletionEventName = detectTransitionCompletionEvent();

    // Standard settings for the visibility control component
    const standardSettings = {
        barrier: true, // Should a backdrop be displayed?
        keyInput: true, // Should the Escape key close the component?
        displayInitial: true // Should the component show automatically upon instantiation if no specific action is given?
    };

    // A central registry for all active component instances
    const componentRegistry = new Map();

    class VisibilityControlComponent {
        #configuration;
        #primaryElement;
        #isActive = false;
        #barrierElement = null;
        #keyboardInputProcessor = null;
        #dismissActionProcessor = null;
        #hasTransitionSupport;

        constructor(targetNode, componentConfig) {
            this.#primaryElement = targetNode;
            this.#configuration = { ...standardSettings, ...componentConfig };
            this.#hasTransitionSupport = transitionCompletionEventName && this.#primaryElement.classList.contains('fade');

            // Assign a unique identifier to the element and store the instance
            this.#primaryElement.dataset.componentIdentifier = Math.random().toString(36).substring(2, 9);
            componentRegistry.set(this.#primaryElement.dataset.componentIdentifier, this);

            // Set up event listener for dismiss buttons within the component
            this.#dismissActionProcessor = this.conceal.bind(this);
            this.#primaryElement.querySelectorAll('[data-dismiss="modal"]').forEach(button => {
                button.addEventListener('click', this.#dismissActionProcessor);
            });
        }

        // Public method to flip the component's visibility state
        alternateVisibility() {
            return this.#isActive ? this.conceal() : this.reveal();
        }

        // Public method to display the component
        reveal() {
            if (this.#isActive) return;

            this.#isActive = true;
            this.#activateBodyStyling();
            this.#manageKeyboardInteraction(); // Enable keyboard listener
            this.#emitComponentEvent('component:displaying');

            this.#handleBarrier(() => {
                // Ensure the component is within the DOM, ideally in a specific container or body
                const containerForComponents = document.querySelector('.bootstrap-force') || document.body;
                if (!this.#primaryElement.parentNode || this.#primaryElement.parentNode !== containerForComponents) {
                    containerForComponents.appendChild(this.#primaryElement);
                }

                this.#primaryElement.style.display = 'block';

                if (this.#hasTransitionSupport) {
                    this.#primaryElement.offsetHeight; // Trigger browser reflow for transitions
                }

                this.#primaryElement.classList.add('in');

                const finishDisplay = () => this.#emitComponentEvent('component:displayed');

                if (this.#hasTransitionSupport) {
                    this.#primaryElement.addEventListener(transitionCompletionEventName, finishDisplay, { once: true });
                } else {
                    finishDisplay();
                }
            });
        }

        // Public method to hide the component
        conceal(eventSignal) {
            if (eventSignal) eventSignal.preventDefault();
            if (!this.#isActive) return;

            this.#isActive = false;
            this.#deactivateBodyStyling();
            this.#manageKeyboardInteraction(false); // Disable keyboard listener
            this.#emitComponentEvent('component:hiding');
            this.#primaryElement.classList.remove('in');

            if (this.#hasTransitionSupport) {
                this.#transitionOutProcess();
            } else {
                this.#completeConcealment();
            }
        }

        // Private helper to add a class to the body element
        #activateBodyStyling() {
            document.body.classList.add('overlay-active');
        }

        // Private helper to remove a class from the body element
        #deactivateBodyStyling() {
            document.body.classList.remove('overlay-active');
        }

        // Private helper to dispatch custom events from the component
        #emitComponentEvent(customEventName) {
            const eventDetails = new CustomEvent(customEventName, {
                bubbles: true,
                cancelable: true,
                detail: {
                    instance: this,
                    domElement: this.#primaryElement
                }
            });
            this.#primaryElement.dispatchEvent(eventDetails);
        }

        // Private helper for handling the component's exit transition
        #transitionOutProcess() {
            let transitionTimeout = setTimeout(() => {
                this.#primaryElement.removeEventListener(transitionCompletionEventName, this.#transitionOutHandler);
                this.#completeConcealment();
            }, 500); // Default Bootstrap transition duration

            const transitionOutHandler = () => {
                clearTimeout(transitionTimeout);
                this.#completeConcealment();
                this.#primaryElement.removeEventListener(transitionCompletionEventName, transitionOutHandler);
            };
            this.#primaryElement.addEventListener(transitionCompletionEventName, transitionOutHandler, { once: true });
        }

        // Private helper to finalize the hiding process
        #completeConcealment() {
            this.#primaryElement.style.display = 'none';
            this.#emitComponentEvent('component:hidden');
            this.#handleBarrier(); // Remove the barrier if present
        }

        // Private helper to manage the backdrop/barrier element
        #handleBarrier(callbackFunction) {
            const isFading = this.#primaryElement.classList.contains('fade');
            const animationClass = isFading ? 'fade' : '';
            const enableAnimation = this.#hasTransitionSupport && animationClass;

            if (this.#isActive && this.#configuration.barrier) {
                this.#barrierElement = document.createElement('div');
                this.#barrierElement.className = `overlay-barrier ${animationClass}`;
                const containerForComponents = document.querySelector('.bootstrap-force') || document.body;
                containerForComponents.appendChild(this.#barrierElement);

                if (this.#configuration.barrier !== 'static') {
                    this.#barrierElement.addEventListener('click', this.conceal.bind(this));
                }

                if (enableAnimation) this.#barrierElement.offsetHeight; // Trigger reflow
                this.#barrierElement.classList.add('in');

                if (enableAnimation) {
                    this.#barrierElement.addEventListener(transitionCompletionEventName, callbackFunction, { once: true });
                } else if (callbackFunction) {
                    callbackFunction();
                }

            } else if (!this.#isActive && this.#barrierElement) {
                this.#barrierElement.classList.remove('in');
                const removeBarrierCallback = () => this.#discardBarrier();

                if (enableAnimation) {
                    this.#barrierElement.addEventListener(transitionCompletionEventName, removeBarrierCallback, { once: true });
                } else {
                    removeBarrierCallback();
                }

            } else if (callbackFunction) {
                callbackFunction();
            }
        }

        // Private helper to remove the backdrop/barrier from the DOM
        #discardBarrier() {
            if (this.#barrierElement && this.#barrierElement.parentNode) {
                this.#barrierElement.parentNode.removeChild(this.#barrierElement);
            }
            this.#barrierElement = null;
        }

        // Private helper to manage the keyboard listener for the Escape key
        #manageKeyboardInteraction(enable = true) {
            if (this.#configuration.keyInput) {
                if (enable) {
                    if (!this.#keyboardInputProcessor) {
                        this.#keyboardInputProcessor = (keypressEvent) => {
                            if (keypressEvent.key === 'Escape' || keypressEvent.keyCode === 27) {
                                this.conceal();
                            }
                        };
                        document.addEventListener('keyup', this.#keyboardInputProcessor);
                    }
                } else {
                    if (this.#keyboardInputProcessor) {
                        document.removeEventListener('keyup', this.#keyboardInputProcessor);
                        this.#keyboardInputProcessor = null;
                    }
                }
            }
        }
    }

    // Global manager object for interacting with VisibilityControlComponent instances
    const VisibilityManager = {
        // Retrieves an existing component instance or creates a new one
        getOrCreateComponent(targetElement, initialSettings) {
            let instanceId = targetElement.dataset.componentIdentifier;
            let instance = instanceId ? componentRegistry.get(instanceId) : null;

            if (!instance) {
                const elementSettings = {};
                // Parse data attributes from the element as configuration
                for (const attribute of targetElement.attributes) {
                    if (attribute.name.startsWith('data-')) {
                        const keyName = attribute.name.substring(5).replace(/-([a-z])/g, (match, char) => char.toUpperCase());
                        let valueContent = attribute.value;
                        if (valueContent === 'true') valueContent = true;
                        if (valueContent === 'false') valueContent = false;
                        if (!isNaN(Number(valueContent)) && !isNaN(parseFloat(valueContent))) valueContent = Number(valueContent);
                        elementSettings[keyName] = valueContent;
                    }
                }
                const combinedSettings = { ...elementSettings, ...initialSettings };
                instance = new VisibilityControlComponent(targetElement, combinedSettings);
            }
            return instance;
        },

        // Primary method to activate or interact with components
        controlComponent(targetSelectorOrNode, specificActionOrConfig) {
            const targetNodes = typeof targetSelectorOrNode === 'string' ? document.querySelectorAll(targetSelectorOrNode) : [targetSelectorOrNode];

            targetNodes.forEach(node => {
                const componentInstance = VisibilityManager.getOrCreateComponent(node, typeof specificActionOrConfig === 'object' ? specificActionOrConfig : {});

                if (typeof specificActionOrConfig === 'string' && typeof componentInstance[specificActionOrConfig] === 'function') {
                    componentInstance[specificActionOrConfig]();
                } else if (componentInstance.#configuration.displayInitial) {
                    componentInstance.reveal();
                }
            });
        }
    };

    // Automatic initialization for elements with data-toggle attributes
    document.addEventListener('DOMContentLoaded', () => {
        document.body.addEventListener('click', (interactionEvent) => {
            let triggerElement = interactionEvent.target.closest('[data-toggle="modal"]');
            if (!triggerElement) return;

            interactionEvent.preventDefault();

            const targetReference = triggerElement.dataset.target || (triggerElement.getAttribute('href') && triggerElement.getAttribute('href').replace(/.*(?=#[^\s]+$)/, ''));
            if (!targetReference) return;

            const targetDomElement = document.querySelector(targetReference);
            if (!targetDomElement) return;

            const existingInstance = componentRegistry.get(targetDomElement.dataset.componentIdentifier);
            const chosenAction = existingInstance ? 'alternateVisibility' : 'reveal';

            VisibilityManager.controlComponent(targetDomElement, chosenAction);
        });
    });

    // Expose the manager to the global scope
    window.VisibilityManager = VisibilityManager;

})();