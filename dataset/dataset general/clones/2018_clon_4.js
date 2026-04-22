const ConversationData = {};
const GameState = {
    currentEngagedEntity: null
};
const InputMonitor = {
    activeKeys: new Set(),
    isKeyDown: function(code) { return this.activeKeys.has(code); }
};
const audioPlayer = {
    playBip: function() { /* Sound playback logic */ },
    playEffect: function(effectName) { /* Sound playback logic */ }
};

let currentUniqueComponentSequence = 0;
function obtainUniqueComponentId(prefix = 'comp') {
    currentUniqueComponentSequence++;
    const padded = String(currentUniqueComponentSequence).padStart(3, '0');
    return `${prefix}${padded}`;
}

class DialogComponentUnit {
    constructor(identifier, domReference) {
        this.unitIdentifier = identifier;
        this.domElementReference = domReference;
        this.unitStateData = {
            dialogueDefinition: null,
            associatedEntity: null,
            isTextAnimationActive: false,
            textAnimationInterrupted: false,
        };
        this.activeTextAnimationTimer = null;
    }

    getUnitElement() {
        return this.domElementReference;
    }

    getUnitState(key) {
        return key ? this.unitStateData[key] : this.unitStateData;
    }

    setUnitState(key, value) {
        this.unitStateData[key] = value;
    }

    clearUnitContent() {
        this.domElementReference.innerHTML = '';
        if (this.activeTextAnimationTimer) {
            clearInterval(this.activeTextAnimationTimer);
            this.activeTextAnimationTimer = null;
        }
        this.setUnitState('isTextAnimationActive', false);
        this.setUnitState('textAnimationInterrupted', false);
    }

    renderUnitContent(dialogueObject) {
        this.clearUnitContent();
        this.setUnitState('dialogueDefinition', dialogueObject);

        const entity = this.getUnitState('associatedEntity');
        if (entity && dialogueObject.emoteEffect && typeof entity.performEmote === 'function') {
            entity.performEmote(dialogueObject.emoteEffect);
            GameState.currentEngagedEntity = entity;
        }

        if (dialogueObject.initialAction) {
            dialogueObject.initialAction();
        }

        const contentProcessors = {
            'choice': (def) => {
                let choiceListMarkup = '<ul class="choice-selection">';
                def.optionChoices.forEach((choice) => {
                    choiceListMarkup += `<li tabindex="0">${choice.description}</li>`;
                });
                choiceListMarkup += '</ul>';
                this.domElementReference.innerHTML = choiceListMarkup;
                this.domElementReference.querySelector('li:first-child')?.focus();
            },
            'discourse': (def) => {
                let charProgress = 0;
                this.setUnitState('isTextAnimationActive', true);
                this.setUnitState('textAnimationInterrupted', false);

                this.activeTextAnimationTimer = setInterval(() => {
                    if (this.getUnitState('textAnimationInterrupted')) {
                        this.domElementReference.innerHTML += def.narrativeText.substring(charProgress);
                        this.setUnitState('isTextAnimationActive', false);
                        this.domElementReference.innerHTML += globalDialogManager.advancePromptMarkup;
                        clearInterval(this.activeTextAnimationTimer);
                        this.activeTextAnimationTimer = null;
                        return;
                    }

                    this.domElementReference.innerHTML += def.narrativeText.charAt(charProgress);
                    audioPlayer.playBip();

                    charProgress++;

                    if (charProgress >= def.narrativeText.length) {
                        this.setUnitState('isTextAnimationActive', false);
                        this.domElementReference.innerHTML += globalDialogManager.advancePromptMarkup;
                        clearInterval(this.activeTextAnimationTimer);
                        this.activeTextAnimationTimer = null;
                    }
                }, 50);
            },
            'announcement': (def) => {
                this.domElementReference.innerHTML = def.narrativeText;
                setTimeout(() => {
                    globalDialogManager.deactivateComponent(this.domElementReference, null);
                }, 10000);
            }
        };

        const processor = contentProcessors[dialogueObject.kind];
        if (processor) {
            processor(dialogueObject);
        } else {
            console.warn(`Unrecognized dialogue kind: ${dialogueObject.kind}`);
        }
    }
}

class DialogManagementSystem {
    constructor() {
        this.activeDialogUnit = null;
        this.inputProcessingLocked = true;
        this.componentRegistry = new Map();
        this.advancePromptMarkup = '<div class="action-indicator"></div>';

        this.initializeInputHandling();
    }

    initializeInputHandling() {
        document.addEventListener('keydown', (event) => {
            InputMonitor.activeKeys.add(event.keyCode);
            this.handlePlayerInput();
        });
        document.addEventListener('keyup', (event) => {
            InputMonitor.activeKeys.delete(event.keyCode);
            this.inputProcessingLocked = true;
        });
    }

    handlePlayerInput() {
        if (!this.activeDialogUnit || !this.activeDialogUnit.getUnitElement() || !this.inputProcessingLocked) {
            return;
        }

        const currentFocusedElement = document.activeElement;
        const currentDialogDefinition = this.activeDialogUnit.getUnitState('dialogueDefinition');

        if (InputMonitor.isKeyDown(16)) {
            // Shift key pressed, no action defined in original
        }

        if (InputMonitor.isKeyDown(13) || InputMonitor.isKeyDown(32)) { // Enter or Spacebar
            this.inputProcessingLocked = false;

            if (currentFocusedElement && currentFocusedElement.tagName === 'LI' && currentFocusedElement.closest('.dialog-component-unit') === this.activeDialogUnit.getUnitElement()) {
                const choiceIndex = Array.from(currentFocusedElement.parentNode.children).indexOf(currentFocusedElement);
                const choice = currentDialogDefinition.optionChoices[choiceIndex];

                if (choice && choice.actionCallback) {
                    choice.actionCallback();
                }

                if (choice && choice.transitionTo) {
                    this.activeDialogUnit.renderUnitContent(ConversationData[choice.transitionTo]);
                    return;
                }
            } else {
                if (this.activeDialogUnit.getUnitState('isTextAnimationActive')) {
                    this.activeDialogUnit.setUnitState('textAnimationInterrupted', true);
                    return;
                }

                if (currentDialogDefinition.transitionTo) {
                    this.activeDialogUnit.renderUnitContent(ConversationData[currentDialogDefinition.transitionTo]);
                } else if (currentDialogDefinition.isFinal) {
                    this.deactivateComponent(this.activeDialogUnit.getUnitElement(), document.getElementById('playerCharacterEntity'));
                    const entity = this.activeDialogUnit.getUnitState('associatedEntity');
                    if (entity && typeof entity.disableWanderPause === 'function') {
                        entity.disableWanderPause();
                    }
                }
            }
        }

        const activeChoiceItem = (currentFocusedElement && currentFocusedElement.tagName === 'LI' && currentFocusedElement.closest('.dialog-component-unit') === this.activeDialogUnit.getUnitElement()) ? currentFocusedElement : null;

        if (!this.inputProcessingLocked) return;

        if (InputMonitor.isKeyDown(87) || InputMonitor.isKeyDown(38)) { // W, Up Arrow
            this.inputProcessingLocked = false;
            if (activeChoiceItem) {
                const previousSibling = activeChoiceItem.previousElementSibling;
                if (previousSibling && previousSibling.tagName === 'LI') {
                    previousSibling.focus();
                }
            }
        } else if (InputMonitor.isKeyDown(83) || InputMonitor.isKeyDown(40)) { // S, Down Arrow
            this.inputProcessingLocked = false;
            if (activeChoiceItem) {
                const nextSibling = activeChoiceItem.nextElementSibling;
                if (nextSibling && nextSibling.tagName === 'LI') {
                    nextSibling.focus();
                }
            }
        } else if (InputMonitor.isKeyDown(65) || InputMonitor.isKeyDown(37)) { // A, Left Arrow
            this.inputProcessingLocked = false;
        } else if (InputMonitor.isKeyDown(68) || InputMonitor.isKeyDown(39)) { // D, Right Arrow
            this.inputProcessingLocked = false;
        }
    }

    activateNewComponent(dimensions, position, dialogConfig, entityContext) {
        const componentId = obtainUniqueComponentId('dialogUnit');
        this.inputProcessingLocked = false;

        let setupDelay = 0;
        if (dialogConfig.kind === 'announcement') {
            setupDelay = 180;
            this.componentRegistry.forEach((component, id) => {
                if (component.getUnitState('dialogueDefinition').kind === 'announcement' && id !== componentId) {
                    this.deactivateComponent(component.getUnitElement(), null);
                }
            });
        }

        setTimeout(() => {
            const containerElement = document.getElementById('dialog-system-container');
            if (!containerElement) {
                console.error("Dialog system container not found. Ensure a div with id 'dialog-system-container' exists.");
                return;
            }

            const newUnitElement = document.createElement('div');
            newUnitElement.id = componentId;
            newUnitElement.classList.add('dialog-component-unit', dialogConfig.kind);
            newUnitElement.tabIndex = 0;
            newUnitElement.style.position = 'absolute';
            newUnitElement.style.left = `${position.left}px`;
            newUnitElement.style.top = `${position.top}px`;
            newUnitElement.style.width = '0px';
            newUnitElement.style.height = '0px';
            newUnitElement.style.overflow = 'hidden';
            newUnitElement.style.transition = 'width 0.18s ease-out, height 0.18s ease-out';

            containerElement.appendChild(newUnitElement);

            const dialogUnit = new DialogComponentUnit(componentId, newUnitElement);
            dialogUnit.setUnitState('associatedEntity', entityContext);
            this.componentRegistry.set(componentId, dialogUnit);

            requestAnimationFrame(() => {
                newUnitElement.style.width = `${dimensions.width}px`;
                newUnitElement.style.height = `${dimensions.height}px`;
            });

            newUnitElement.addEventListener('transitionend', () => {
                newUnitElement.style.overflow = '';
                dialogUnit.renderUnitContent(dialogConfig);
                this.activeDialogUnit = dialogUnit;
                newUnitElement.focus();
            }, { once: true });

        }, setupDelay);
    }

    deactivateComponent(unitDomElement, refocusTarget) {
        if (!unitDomElement) return;

        const identifier = unitDomElement.id;
        const dialogUnitInstance = this.componentRegistry.get(identifier);

        if (!dialogUnitInstance) {
            console.warn(`Attempted to deactivate non-existent dialog unit: ${identifier}`);
            return;
        }

        dialogUnitInstance.clearUnitContent();

        unitDomElement.style.overflow = 'hidden';
        unitDomElement.style.transition = 'width 0.18s ease-in, height 0.18s ease-in, opacity 0.18s ease-in';
        unitDomElement.style.width = '0px';
        unitDomElement.style.height = '0px';
        unitDomElement.style.opacity = '0';
        unitDomElement.style.zIndex = '0';

        const entity = dialogUnitInstance.getUnitState('associatedEntity');

        unitDomElement.addEventListener('transitionend', () => {
            unitDomElement.remove();
            this.componentRegistry.delete(identifier);

            if (entity && typeof entity.dismissEmote === 'function') {
                entity.dismissEmote();
                if (GameState.currentEngagedEntity === entity) {
                    GameState.currentEngagedEntity = null;
                }
            }

            if (refocusTarget && typeof refocusTarget.focus === 'function') {
                refocusTarget.focus();
            }

            if (this.activeDialogUnit && this.activeDialogUnit.getUnitElement().id === identifier) {
                this.activeDialogUnit = null;
            }
        }, { once: true });
    }

    manageUnitProperty(targetDomElement, propertyOperation, propertyValue) {
        const identifier = targetDomElement.id;
        const dialogUnitInstance = this.componentRegistry.get(identifier);
        if (!dialogUnitInstance) {
            console.warn(`No dialog unit found for element ID: ${identifier}`);
            return;
        }

        if (typeof propertyValue === 'undefined') {
            return dialogUnitInstance.getUnitState(propertyOperation);
        } else {
            dialogUnitInstance.setUnitState(propertyOperation, propertyValue);
        }
    }
}

const globalDialogManager = new DialogManagementSystem();

function componentInteractionApi(targetElement, operation, ...parameters) {
    if (operation === 'activateNewComponent') {
        return globalDialogManager.activateNewComponent(...parameters);
    }

    if (!targetElement || typeof targetElement.id !== 'string') {
        console.error("Invalid target element for componentInteractionApi. Must be a DOM element with an ID.");
        return;
    }

    const componentInstance = globalDialogManager.componentRegistry.get(targetElement.id);
    if (!componentInstance) {
        console.warn(`No dialog component unit registered with ID: ${targetElement.id}`);
        return;
    }

    const mappedOperations = {
        'renderContent': componentInstance.renderUnitContent.bind(componentInstance),
        'deactivate': globalDialogManager.deactivateComponent.bind(globalDialogManager, targetElement),
        'manageProperty': globalDialogManager.manageUnitProperty.bind(globalDialogManager, targetElement)
    };

    if (mappedOperations[operation]) {
        return mappedOperations[operation](...parameters);
    }

    console.warn(`Unknown component operation: ${operation}`);
    return componentInstance;
}