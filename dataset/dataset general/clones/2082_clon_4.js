((applicationContext) => {

    const frameThrottler = (task) => {
        let animationHandle = null;
        let lastInvokedArguments = null;
        const trigger = (...args) => {
            lastInvokedArguments = args;
            if (!animationHandle) {
                animationHandle = requestAnimationFrame(() => {
                    task.apply(this, lastInvokedArguments);
                    animationHandle = null;
                    lastInvokedArguments = null;
                });
            }
        };
        return trigger;
    };

    const actionTriggers = {
        movement: 'mousemove touchmove',
        commence: 'mousedown touchstart',
        finish: 'mouseup touchend',
        blockSelection: 'selectstart'
    };

    const displayMarkers = {
        activeElement: 'active-draggable-item',
        floatingCopy: 'drag-duplicate',
        groupContainer: 'reorder-container',
        draggableUnit: 'reorder-unit',
        gripPoint: 'reorder-handle'
    };

    const documentRoot = document.body;

    class ListReorderer {
        constructor(rootContainer, configuration) {
            this.config = Object.assign({
                unitSelector: '.reorder-unit',
                gripSelector: null,
                visualElevation: '9000',
                enableHorizontal: true,
                enableVertical: true,
                reorderNotifier: null,
                onBegin: null,
                onDuring: null,
                onEnd: null
            }, configuration);

            this.uniqueSuffix = Math.random().toString(36).substring(2, 9);
            this.dynamicStyles = {};
            for (const key in displayMarkers) {
                this.dynamicStyles[key] = displayMarkers[key] + '-' + this.uniqueSuffix;
            }

            this.currentTransformX = 0;
            this.currentTransformY = 0;
            this.isEnabled = null;
            this.interactionState = null;
            this.mainContainer = rootContainer;
            this.activeDraggable = null;
            this.visualDuplicate = null;

            this.cachedUnits = [];
            this.initialUnitIndex = null;
            this.dragOccurred = false;

            this.originalBodySelectable = null;

            this.animationFrameId = null;

            this.updateStructure();
        }

        setActivation(flag) {
            this.isEnabled = flag;
        }

        removeListeners() {
            documentRoot.removeEventListener(actionTriggers.finish.split(' ')[0], this.handleEndInteraction);
            documentRoot.removeEventListener(actionTriggers.finish.split(' ')[1], this.handleEndInteraction);
            documentRoot.removeEventListener(actionTriggers.movement.split(' ')[0], this.handleDuringInteraction);
            documentRoot.removeEventListener(actionTriggers.movement.split(' ')[1], this.handleDuringInteraction);
            documentRoot.removeEventListener(actionTriggers.blockSelection, this.preventNativeSelection);

            this.retrieveDraggableUnits().forEach(unit => {
                unit.removeEventListener(actionTriggers.commence.split(' ')[0], this.handleBeginInteraction);
                unit.removeEventListener(actionTriggers.commence.split(' ')[1], this.handleBeginInteraction);
            });
        }

        retrieveDraggableUnits() {
            return Array.from(this.mainContainer.querySelectorAll(this.config.unitSelector));
        }

        updateStructure() {
            this.removeListeners();

            this.cachedUnits = this.retrieveDraggableUnits();

            this.cachedUnits.forEach(unit => {
                unit.classList.add(this.dynamicStyles.draggableUnit);
                unit.setAttribute('data-user-select', 'none');
            });

            if (this.isEnabled && !this.activeDraggable) {
                this.cachedUnits.forEach(unit => {
                    unit.addEventListener(actionTriggers.commence.split(' ')[0], this.handleBeginInteraction.bind(this));
                    unit.addEventListener(actionTriggers.commence.split(' ')[1], this.handleBeginInteraction.bind(this));
                });
            }
        }

        evaluatePosition = frameThrottler((evt) => {
            if (!this.visualDuplicate || !this.activeDraggable) return;

            const currentFloatingRect = this.visualDuplicate.getBoundingClientRect();
            const currentFloatingCenterY = currentFloatingRect.top + currentFloatingRect.height / 2;
            const currentFloatingCenterX = currentFloatingRect.left + currentFloatingRect.width / 2;

            let candidateNewIndex = this.initialUnitIndex;

            for (let i = 0; i < this.cachedUnits.length; i++) {
                if (i === this.initialUnitIndex) continue;

                const inspectedUnit = this.cachedUnits[i];
                const inspectedRect = inspectedUnit.getBoundingClientRect();
                const inspectedCenterY = inspectedRect.top + inspectedRect.height / 2;
                const inspectedCenterX = inspectedRect.left + inspectedRect.width / 2;

                let hasCrossedCenter = false;
                if (this.config.enableVertical) {
                    if (this.initialUnitIndex < i && currentFloatingCenterY > inspectedCenterY) {
                        hasCrossedCenter = true;
                    } else if (this.initialUnitIndex > i && currentFloatingCenterY < inspectedCenterY) {
                        hasCrossedCenter = true;
                    }
                } else if (this.config.enableHorizontal) {
                    if (this.initialUnitIndex < i && currentFloatingCenterX > inspectedCenterX) {
                        hasCrossedCenter = true;
                    } else if (this.initialUnitIndex > i && currentFloatingCenterX < inspectedCenterX) {
                        hasCrossedCenter = true;
                    }
                }

                if (hasCrossedCenter) {
                    candidateNewIndex = i;
                    break;
                }
            }

            if (candidateNewIndex !== this.initialUnitIndex) {
                this.config.reorderNotifier(this.initialUnitIndex, candidateNewIndex);
                this.initialUnitIndex = candidateNewIndex;
                this.dragOccurred = true;
            }
        });

        handleDuringInteraction = (evt) => {
            if (evt.cancelBubble) return;

            this.config.onDuring(evt);

            const eventClientX = evt.clientX || evt.touches[0].clientX;
            const eventClientY = evt.clientY || evt.touches[0].clientY;

            const displacementX = eventClientX - this.interactionState.clientX;
            const displacementY = eventClientY - this.interactionState.clientY;

            if (this.config.enableVertical) {
                this.currentTransformY += displacementY;
            }
            if (this.config.enableHorizontal) {
                this.currentTransformX += displacementX;
            }

            if (this.visualDuplicate) {
                this.visualDuplicate.style.transform = `translate(${this.currentTransformX}px, ${this.currentTransformY}px)`;
            }

            this.evaluatePosition(evt);

            this.interactionState = { clientX: eventClientX, clientY: eventClientY, originalEvent: evt };
        };

        handleBeginInteraction = (evt) => {
            if (evt.button !== 0 || evt.cancelBubble) {
                return;
            }

            this.dragOccurred = false;
            let currentEventTarget = evt.target;
            const allUnits = this.retrieveDraggableUnits();

            if (this.config.gripSelector) {
                allUnits.forEach(unit => {
                    Array.from(unit.querySelectorAll(this.config.gripSelector)).forEach(grip => {
                        grip.classList.add(this.dynamicStyles.gripPoint);
                    });
                });
                if (!currentEventTarget.closest('.' + this.dynamicStyles.gripPoint)) {
                    return;
                }
            }

            this.config.onBegin(evt);

            currentEventTarget = currentEventTarget.closest('.' + this.dynamicStyles.draggableUnit) || currentEventTarget;

            this.originalBodySelectable = documentRoot.getAttribute('data-user-select-prev');
            documentRoot.setAttribute('data-user-select-prev', documentRoot.getAttribute('data-user-select'));
            documentRoot.setAttribute('data-user-select', 'none');

            this.activeDraggable = currentEventTarget;
            this.activeDraggable.classList.add(this.dynamicStyles.activeElement);

            const unitDimensions = this.activeDraggable.getBoundingClientRect();

            this.initialUnitIndex = allUnits.indexOf(this.activeDraggable);
            if (this.initialUnitIndex === -1) {
                console.warn('Draggable unit not found in list.');
                return;
            }

            this.visualDuplicate = this.activeDraggable.cloneNode(true);
            this.visualDuplicate.style.position = 'fixed';
            this.visualDuplicate.style.zIndex = this.config.visualElevation;
            this.visualDuplicate.style.width = unitDimensions.width + 'px';
            this.visualDuplicate.style.height = unitDimensions.height + 'px';
            this.visualDuplicate.style.top = unitDimensions.top + 'px';
            this.visualDuplicate.style.left = unitDimensions.left + 'px';
            this.visualDuplicate.classList.remove(this.dynamicStyles.draggableUnit);
            this.visualDuplicate.classList.add(this.dynamicStyles.floatingCopy);
            documentRoot.appendChild(this.visualDuplicate);

            this.activeDraggable.style.visibility = 'hidden';

            this.mainContainer.classList.add(this.dynamicStyles.groupContainer);

            this.cachedUnits.forEach(unit => {
                unit.removeEventListener(actionTriggers.commence.split(' ')[0], this.handleBeginInteraction);
                unit.removeEventListener(actionTriggers.commence.split(' ')[1], this.handleBeginInteraction);
            });

            documentRoot.addEventListener(actionTriggers.movement.split(' ')[0], this.handleDuringInteraction);
            documentRoot.addEventListener(actionTriggers.movement.split(' ')[1], this.handleDuringInteraction);
            documentRoot.addEventListener(actionTriggers.finish.split(' ')[0], this.handleEndInteraction);
            documentRoot.addEventListener(actionTriggers.finish.split(' ')[1], this.handleEndInteraction);
            documentRoot.addEventListener(actionTriggers.blockSelection, this.preventNativeSelection);

            const eventClientX = evt.clientX || evt.touches[0].clientX;
            const eventClientY = evt.clientY || evt.touches[0].clientY;
            this.interactionState = { clientX: eventClientX, clientY: eventClientY, originalEvent: evt };

            this.currentTransformX = 0;
            this.currentTransformY = 0;

            if (evt.type.startsWith('touch')) {
                evt.preventDefault();
            }
        };

        handleEndInteraction = (evt) => {
            if (evt.cancelBubble) return;

            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }

            this.initialUnitIndex = null;
            this.cachedUnits = this.retrieveDraggableUnits();

            documentRoot.setAttribute('data-user-select', this.originalBodySelectable || '');
            documentRoot.removeAttribute('data-user-select-prev');

            documentRoot.removeEventListener(actionTriggers.movement.split(' ')[0], this.handleDuringInteraction);
            documentRoot.removeEventListener(actionTriggers.movement.split(' ')[1], this.handleDuringInteraction);
            documentRoot.removeEventListener(actionTriggers.finish.split(' ')[0], this.handleEndInteraction);
            documentRoot.removeEventListener(actionTriggers.finish.split(' ')[1], this.handleEndInteraction);
            documentRoot.removeEventListener(actionTriggers.blockSelection, this.preventNativeSelection);

            if (this.isEnabled) {
                this.cachedUnits.forEach(unit => {
                    unit.addEventListener(actionTriggers.commence.split(' ')[0], this.handleBeginInteraction.bind(this));
                    unit.addEventListener(actionTriggers.commence.split(' ')[1], this.handleBeginInteraction.bind(this));
                });
            }

            if (!this.dragOccurred && this.interactionState && this.interactionState.originalEvent) {
                this.interactionState.originalEvent.target.click();
            } else {
                this.config.onEnd(evt);
            }

            if (this.activeDraggable) {
                this.activeDraggable.classList.remove(this.dynamicStyles.activeElement);
                this.activeDraggable.style.visibility = '';
                this.activeDraggable = null;
            }

            this.mainContainer.classList.remove(this.dynamicStyles.groupContainer);

            if (this.visualDuplicate) {
                this.visualDuplicate.remove();
                this.visualDuplicate = null;
            }
            this.interactionState = null;

            if (this.config.gripSelector) {
                this.cachedUnits.forEach(unit => {
                    Array.from(unit.querySelectorAll(this.config.gripSelector)).forEach(grip => {
                        grip.classList.remove(this.dynamicStyles.gripPoint);
                    });
                });
            }
        };

        preventNativeSelection = (evt) => {
            evt.preventDefault();
            return false;
        };

        releaseAllResources() {
            this.removeListeners();
            if (this.visualDuplicate) {
                this.visualDuplicate.remove();
            }
            if (this.activeDraggable) {
                this.activeDraggable.style.visibility = '';
                this.activeDraggable.classList.remove(this.dynamicStyles.activeElement);
            }
            this.mainContainer.classList.remove(this.dynamicStyles.groupContainer);
            this.cachedUnits.forEach(unit => {
                unit.classList.remove(this.dynamicStyles.draggableUnit);
                unit.removeAttribute('data-user-select');
            });
            if (this.config.gripSelector) {
                this.cachedUnits.forEach(unit => {
                    Array.from(unit.querySelectorAll(this.config.gripSelector)).forEach(grip => {
                        grip.classList.remove(this.dynamicStyles.gripPoint);
                    });
                });
            }
        }
    }

    applicationContext.createDraggableList = function (containerElement, options = {}) {
        const defaultSettings = {
            unitSelector: '.reorder-unit',
            gripSelector: null,
            visualElevation: '9000',
            enableHorizontal: true,
            enableVertical: true,
            reorderNotifier: () => {},
            onBegin: () => {},
            onDuring: () => {},
            onEnd: () => {}
        };

        const finalSettings = Object.assign({}, defaultSettings, options);

        const instance = new ListReorderer(containerElement, finalSettings);

        return {
            setActivation: instance.setActivation.bind(instance),
            disable: instance.removeListeners.bind(instance),
            refreshDisplay: instance.updateStructure.bind(instance),
            destroyComponent: instance.releaseAllResources.bind(instance)
        };
    };

})(window);