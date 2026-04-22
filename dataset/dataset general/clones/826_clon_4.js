// Custom Array prototype method to replicate ImpactJS's `erase` functionality.
// Renamed to `purge` to avoid identifier reuse.
if (!Array.prototype.purge) {
    Array.prototype.purge = function(itemToRemove) {
        for (let i = this.length - 1; i >= 0; i--) {
            if (this[i] === itemToRemove) {
                this.splice(i, 1);
            }
        }
        return this;
    };
}

// --- PointerVisual Class (Replaces ig.gui.cursor) ---
class PointerVisual {
    constructor() {
        this.location = { x: 0, y: 0 };
        this.visualShift = { x: 0, y: 0 };
        this.displayAsset = null;
    }

    assignAsset(assetToSet) {
        this.displayAsset = assetToSet;
    }

    removeAsset() {
        this.displayAsset = null;
    }

    render() {
        if (this.displayAsset !== null) {
            this.displayAsset.draw(this.location.x - this.visualShift.x, this.location.y - this.visualShift.y);
        }
    }
}

// --- ComponentManager Class (Replaces ig.gui.element) ---
class ComponentManager {
    constructor(collectionReference) {
        this.managedComponents = collectionReference; // Reference to GlobalInterface's interfaceElements array
        this.operationRegistry = this.initializeOperationRegistry();
    }

    initializeOperationRegistry() {
        const operations = {
            'fetchByName': (comp, identifier) => comp.componentName === identifier,
            'fetchByGroup': (comp, identifier) => comp.componentGroup === identifier,
            'revealElement': (comp, identifier) => { if (comp.componentName === identifier) comp.visibility = true; },
            'revealGroupElements': (comp, identifier) => { if (comp.componentGroup === identifier) comp.visibility = true; },
            'concealElement': (comp, identifier) => { if (comp.componentName === identifier) comp.visibility = false; },
            'concealGroupElements': (comp, identifier) => { if (comp.componentGroup === identifier) comp.visibility = false; },
            'eliminateElement': (comp, identifier) => comp.componentName === identifier,
            'eliminateGroupElements': (comp, identifier) => comp.componentGroup === identifier,
            'enableElement': (comp, identifier) => { if (comp.componentName === identifier) comp.isDeactivated = false; },
            'enableGroupElements': (comp, identifier) => { if (comp.componentGroup === identifier) comp.isDeactivated = false; },
            'disableElement': (comp, identifier) => { if (comp.componentName === identifier) comp.isDeactivated = true; },
            'disableGroupElements': (comp, identifier) => { if (comp.componentGroup === identifier) comp.isDeactivated = true; },
            'disableAllElements': (comp) => { comp.isDeactivated = true; }
        };
        return new Map(Object.entries(operations));
    }

    performOperation(operationKey, identifierValue) {
        const actionFunction = this.operationRegistry.get(operationKey);
        if (!actionFunction) return;

        let operationResults = [];
        let componentsToRetain = [];

        this.managedComponents.forEach(component => {
            if (operationKey.startsWith('fetch')) {
                if (actionFunction(component, identifierValue)) {
                    operationResults.push(component);
                }
                componentsToRetain.push(component); // Fetch operations don't modify the array
            } else if (operationKey.startsWith('eliminate')) {
                if (!actionFunction(component, identifierValue)) { // If it's NOT to be eliminated
                    componentsToRetain.push(component);
                }
            } else if (operationKey === 'disableAllElements') {
                actionFunction(component);
                componentsToRetain.push(component);
            } else { // All other actions (reveal, conceal, enable, disable)
                actionFunction(component, identifierValue);
                componentsToRetain.push(component);
            }
        });

        // Update the managedComponents array if elements were marked for removal
        if (operationKey.startsWith('eliminate')) {
            this.managedComponents.length = 0; // Clear the original array
            this.managedComponents.push(...componentsToRetain); // Populate with retained elements
        }

        if (operationResults.length > 0) {
            return operationResults.length === 1 ? operationResults[0] : operationResults;
        }
        return undefined;
    }

    registerComponent(componentConfiguration) {
        if (componentConfiguration.visibility === undefined) componentConfiguration.visibility = true;
        if (componentConfiguration.isDeactivated === undefined) componentConfiguration.isDeactivated = false;
        if (componentConfiguration.isActive === undefined) componentConfiguration.isActive = false;
        this.managedComponents.push(componentConfiguration);
    }

    processAndRenderComponents(inputController, pointerLocation) {
        this.managedComponents.forEach(component => {
            if (!component.visibility) return;

            let currentVisualState = 'defaultState'; // Renamed 'normal' to 'defaultState'
            const isCursorOver = !component.isDeactivated &&
                                 pointerLocation.x >= component.location.x &&
                                 pointerLocation.x <= component.location.x + component.dimension.x &&
                                 pointerLocation.y >= component.location.y &&
                                 pointerLocation.y <= component.location.y + component.dimension.y;

            if (isCursorOver) {
                currentVisualState = 'hoverState'; // Renamed 'hover' to 'hoverState'
            }
            
            const isPrimaryClickActive = inputController.state('leftClick'); // Renamed 'mouse1' to 'leftClick'
            const isPrimaryClickPressed = inputController.pressed('leftClick');

            if (currentVisualState === 'hoverState' && (isPrimaryClickActive || isPrimaryClickPressed)) {
                currentVisualState = 'activeInteractionState'; // Renamed 'active' to 'activeInteractionState'
                if (isPrimaryClickActive && typeof component.onPrimaryButtonDown === 'function') { // Renamed 'mouseDown' to 'onPrimaryButtonDown'
                    component.onPrimaryButtonDown.call(component);
                }
                if (isPrimaryClickPressed) {
                    if (component.canToggle) { // Renamed 'toggle' to 'canToggle'
                        component.isActive = !component.isActive;
                    }
                    if (typeof component.onPrimaryButtonClick === 'function') { // Renamed 'click' to 'onPrimaryButtonClick'
                        component.onPrimaryButtonClick.call(component);
                    }
                }
            }

            if (component.canToggle && component.isActive) {
                currentVisualState = 'activeInteractionState';
            }

            if (component.visualStates[currentVisualState] === undefined) {
                currentVisualState = 'defaultState';
            }

            const initialGlobalAlpha = ig.system.context.globalAlpha;
            if (component.transparencyFactor !== undefined) { // Renamed 'alpha' to 'transparencyFactor'
                ig.system.context.globalAlpha = component.transparencyFactor;
            }

            const visualRepresentation = component.visualStates[currentVisualState];
            if (isNaN(visualRepresentation.tileIndex) || isNaN(visualRepresentation.tileDimension)) { // Renamed 'tile' to 'tileIndex', 'tileSize' to 'tileDimension'
                visualRepresentation.displayAsset.draw(component.location.x, component.location.y); // Renamed 'image' to 'displayAsset'
            } else {
                visualRepresentation.displayAsset.drawTile(component.location.x, component.location.y, visualRepresentation.tileIndex, visualRepresentation.tileDimension);
            }

            ig.system.context.globalAlpha = initialGlobalAlpha;
        });
    }
}

// --- Main GlobalInterface Class (Replaces ig.gui) ---
class GlobalInterface {
    constructor() {
        this.isVisible = true; // Renamed 'show' to 'isVisible'
        this.isConfigured = false; // Renamed 'initialized' to 'isConfigured'

        this.pointerVisual = new PointerVisual();
        this.interfaceElements = [];
        this.componentManager = new ComponentManager(this.interfaceElements);
    }

    refreshScene() { // Renamed 'draw' to 'refreshScene'
        if (!this.isVisible) return;

        this.componentManager.processAndRenderComponents(ig.input, ig.input.mouse);

        this.pointerVisual.location = {
            x: ig.input.mouse.x,
            y: ig.input.mouse.y
        };
        this.pointerVisual.render();
    }
}

// Instantiate the global interface manager
var globalInterfaceInstance = new GlobalInterface();

// Assign to global 'ig' object, simulating ig.gui
ig.unifiedInterface = globalInterfaceInstance; // Renamed 'ig.gui' to 'ig.unifiedInterface'


// --- Game Integration Function (Replaces ig.Game.inject) ---
function integrateGameMechanics(GameClassConstructor) {
    const originalUpdateMethod = GameClassConstructor.prototype.update;
    GameClassConstructor.prototype.update = function() {
        originalUpdateMethod.call(this); // Call the original parent update

        // Perform one-time configuration
        if (!ig.unifiedInterface.isConfigured) {
            ig.unifiedInterface.isConfigured = true;
            ig.input.bind(ig.KEY.MOUSE1, 'leftClick'); // Renamed 'mouse1' to 'leftClick'
        }
    };

    const originalDrawMethod = GameClassConstructor.prototype.draw;
    GameClassConstructor.prototype.draw = function() {
        originalDrawMethod.call(this); // Call the original parent draw
        if (ig.unifiedInterface.isVisible) {
            ig.unifiedInterface.refreshScene(); // Ensure our new draw method is called
        }
    };
}

// Call the integration function to modify ig.Game's prototype
integrateGameMechanics(ig.Game);