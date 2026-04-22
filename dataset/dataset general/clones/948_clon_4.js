const dataCanvas = {};

dataCanvas.config = {
    VIEW_IDENTIFIER: "visual-element",
    DEBUG_MARKER: "debug-mode",
    LAYER_MARKER: "data-layer",
    DESELECTED_STATE: "inactive",
    SELECTED_STATE: "active",
    NODE_REF_KEY: "element_idx",
    GROUP_REF_KEY: "group_idx",
    DEFAULT_CATEGORY_NAME: "system_default_category",
    ACTION_COOLDOWN_MS: 50,
    EPSILON_VALUE: 1e-9
};

dataCanvas.hooks = {
    postRenderCallback: null
};

const ComponentTracker = (() => {
    const visualComponentMap = new Map();

    const establishCategory = (categoryIdentifier) => {
        const validatedCategory = categoryIdentifier || dataCanvas.config.DEFAULT_CATEGORY_NAME;
        if (!visualComponentMap.has(validatedCategory)) {
            visualComponentMap.set(validatedCategory, new Set());
        }
        return validatedCategory;
    };

    const trackerOperations = {
        includesComponent: (targetComponent) => {
            for (const componentSet of visualComponentMap.values()) {
                if (componentSet.has(targetComponent)) {
                    return true;
                }
            }
            return false;
        },

        addVisual: (visualComponent, categoryIdentifier) => {
            const currentCategory = establishCategory(categoryIdentifier);
            visualComponentMap.get(currentCategory).add(visualComponent);
        },

        purgeAll: () => {
            visualComponentMap.clear();
        },

        retrieveComponents: (categoryIdentifier) => {
            const currentCategory = establishCategory(categoryIdentifier);
            return Array.from(visualComponentMap.get(currentCategory));
        }
    };

    return trackerOperations;
})();

dataCanvas.enrollVisual = (visualComponent, categoryIdentifier) => {
    ComponentTracker.addVisual(visualComponent, categoryIdentifier);
};

dataCanvas.checkVisualEnrollment = (visualComponent) => {
    return ComponentTracker.includesComponent(visualComponent);
};

dataCanvas.clearAllVisuals = () => {
    ComponentTracker.purgeAll();
};

dataCanvas.processAllFilters = (categoryIdentifier) => {
    const activeComponents = ComponentTracker.retrieveComponents(categoryIdentifier);
    activeComponents.forEach(component => {
        if (typeof component.filterAll === 'function') {
            component.filterAll();
        }
    });
};

dataCanvas.paintAllViews = (categoryIdentifier) => {
    const activeComponents = ComponentTracker.retrieveComponents(categoryIdentifier);
    activeComponents.forEach(component => {
        if (typeof component.render === 'function') {
            component.render();
        }
    });

    if (typeof dataCanvas.hooks.postRenderCallback === 'function') {
        dataCanvas.hooks.postRenderCallback(categoryIdentifier);
    }
};

dataCanvas.refreshAllViews = (categoryIdentifier) => {
    const activeComponents = ComponentTracker.retrieveComponents(categoryIdentifier);
    activeComponents.forEach(component => {
        if (typeof component.redraw === 'function') {
            component.redraw();
        }
    });

    if (typeof dataCanvas.hooks.postRenderCallback === 'function') {
        dataCanvas.hooks.postRenderCallback(categoryIdentifier);
    }
};

dataCanvas.eventStream = {
    pendingAction: null,
    invokeDelayedAction: (actionFunction, delayMillis) => {
        if (!delayMillis) {
            actionFunction();
            return;
        }

        dataCanvas.eventStream.pendingAction = actionFunction;

        setTimeout(() => {
            if (actionFunction === dataCanvas.eventStream.pendingAction) {
                actionFunction();
            }
        }, delayMillis);
    }
};

dataCanvas.setRenderCompletionHook = (callbackFn) => {
    if (!arguments.length) return dataCanvas.hooks.postRenderCallback;
    dataCanvas.hooks.postRenderCallback = callbackFn;
    return dataCanvas;
};

class SequentialAccumulator {
    constructor() {
        this.valueRegistry = new Map();
    }

    normalizeKey(inputKey) {
        return String(inputKey);
    }

    reset() {
        this.valueRegistry.clear();
    }

    keyCount() {
        return this.valueRegistry.size;
    }

    fetchValue(key) {
        return this.valueRegistry.get(this.normalizeKey(key));
    }

    storeValue(key, value) {
        this.valueRegistry.set(this.normalizeKey(key), value);
    }

    getKeyInsertionOrderIndex(key) {
        let index = 0;
        const normalizedKey = this.normalizeKey(key);
        for (const k of this.valueRegistry.keys()) {
            if (k === normalizedKey) {
                return index;
            }
            index++;
        }
        return -1;
    }

    getKeyByOrderIndex(index) {
        let currentIndex = 0;
        for (const k of this.valueRegistry.keys()) {
            if (currentIndex === index) {
                return k;
            }
            currentIndex++;
        }
        return undefined;
    }
}

dataCanvas.cumulativeOperations = {};
dataCanvas.cumulativeOperations.ProgressiveSummation = class extends SequentialAccumulator {
    constructor() {
        super();
    }

    includeValue(key, val) {
        const normalizedKey = this.normalizeKey(key);
        const currentValue = this.valueRegistry.get(normalizedKey) || 0;
        this.valueRegistry.set(normalizedKey, currentValue + (val == null ? 0 : val));
    }

    deductValue(key, val) {
        const normalizedKey = this.normalizeKey(key);
        const currentValue = this.valueRegistry.get(normalizedKey) || 0;
        this.valueRegistry.set(normalizedKey, currentValue - val);
    }

    calculateCumulative(key) {
        const keyIndex = this.getKeyInsertionOrderIndex(key);
        if (keyIndex < 0) return 0;

        let totalAccumulated = 0;
        let currentIndex = 0;
        for (const [k, v] of this.valueRegistry.entries()) {
            totalAccumulated += v;
            if (currentIndex === keyIndex) {
                break;
            }
            currentIndex++;
        }
        return totalAccumulated;
    }
};

dataCanvas.cumulativeOperations.UniqueElementCounter = class extends SequentialAccumulator {
    constructor() {
        super();
    }

    addUniqueElement(key, element) {
        const normalizedKey = this.normalizeKey(key);
        if (!this.valueRegistry.has(normalizedKey)) {
            this.valueRegistry.set(normalizedKey, new Set());
        }
        if (element != null) {
            this.valueRegistry.get(normalizedKey).add(element);
        }
    }

    removeUniqueElement(key, element) {
        const normalizedKey = this.normalizeKey(key);
        const elementSet = this.valueRegistry.get(normalizedKey);
        if (elementSet && element != null) {
            elementSet.delete(element);
        }
    }

    getUniqueCount(key) {
        const normalizedKey = this.normalizeKey(key);
        const elementSet = this.valueRegistry.get(normalizedKey);
        return elementSet ? elementSet.size : 0;
    }

    calculateCumulativeUniqueCount(key) {
        const keyIndex = this.getKeyInsertionOrderIndex(key);
        if (keyIndex < 0) return 0;

        let totalUniqueElements = new Set();
        let currentIndex = 0;
        for (const [k, elementSet] of this.valueRegistry.entries()) {
            if (elementSet) {
                elementSet.forEach(item => totalUniqueElements.add(item));
            }
            if (currentIndex === keyIndex) {
                break;
            }
            currentIndex++;
        }
        return totalUniqueElements.size;
    }
};

dataCanvas.utilities = {};

dataCanvas.utilities.LayeredDataGrid = class {
    constructor() {
        this.coordinateDataStore = new Map();
        this.categoryDefinitions = [];
        this.primaryExtractor = null;
    }

    #ensureXCoordinateEntry(xCoord) {
        if (!this.coordinateDataStore.has(xCoord)) {
            this.coordinateDataStore.set(xCoord, new Map());
        }
    }

    assignDatum(xCoord, yCoord, dataItem) {
        this.#ensureXCoordinateEntry(xCoord);
        this.coordinateDataStore.get(xCoord).set(yCoord, dataItem);
    }

    fetchDatum(xCoord, yCoord) {
        this.#ensureXCoordinateEntry(xCoord);
        const yMap = this.coordinateDataStore.get(xCoord);
        const dataItem = yMap ? yMap.get(yCoord) : undefined;
        return dataItem === undefined ? 0 : dataItem;
    }

    createCategory(categoryIdentifier, dataExtractor) {
        this.categoryDefinitions.push({
            identifier: categoryIdentifier,
            extractor: dataExtractor || this.primaryExtractor
        });
        return this.categoryDefinitions.length - 1;
    }

    retrieveCategory(index) {
        const definition = this.categoryDefinitions[index];
        return definition ? definition.identifier : undefined;
    }

    retrieveExtractor(index) {
        const definition = this.categoryDefinitions[index];
        return definition ? definition.extractor : undefined;
    }

    categoryCount() {
        return this.categoryDefinitions.length;
    }

    resetGrid() {
        this.coordinateDataStore.clear();
        this.categoryDefinitions = [];
    }

    setPrimaryExtractor(extractorFn) {
        this.primaryExtractor = extractorFn;
    }

    exportGridData() {
        return this.coordinateDataStore;
    }
};

dataCanvas.utilities.isValueNegligible = (value) => {
    return value === undefined || (value < dataCanvas.config.EPSILON_VALUE && value > -dataCanvas.config.EPSILON_VALUE);
};

dataCanvas.utilities.findCollectionMax = (dataCollection, valueExtractor) => {
    let maxValue = -Infinity;
    let hasValue = false;
    dataCollection.all().forEach(item => {
        const val = valueExtractor(item);
        if (val > maxValue) {
            maxValue = val;
        }
        hasValue = true;
    });
    if (!hasValue || dataCanvas.utilities.isValueNegligible(maxValue)) {
        return 0;
    }
    return maxValue;
};

dataCanvas.utilities.findCollectionMin = (dataCollection, valueExtractor) => {
    let minValue = Infinity;
    let hasValue = false;
    dataCollection.all().forEach(item => {
        const val = valueExtractor(item);
        if (val < minValue) {
            minValue = val;
        }
        hasValue = true;
    });
    if (!hasValue || dataCanvas.utilities.isValueNegligible(minValue)) {
        return 0;
    }
    return minValue;
};

dataCanvas.utilities.generateSlug = (phrase) => {
    return String(phrase).toLowerCase().replace(/\s/g, "_").replace(/['.]/g, "");
};

dataCanvas.utilities.obtainOrCreateElement = (parentSelection, tagName) => {
    let targetElement = parentSelection.select(tagName);
    if (targetElement.empty()) {
        targetElement = parentSelection.append(tagName);
    }
    return targetElement;
};

dataCanvas.checkChartInstance = (candidateObject) => {
    return candidateObject instanceof Object && candidateObject.__viz_component_marker__;
};

dataCanvas.errorHandling = {};

dataCanvas.errorHandling.VizError = class extends Error {
    constructor(message = "An unexpected visualization error occurred") {
        super(message);
        this.name = "VizError";
    }
};

dataCanvas.errorHandling.InvalidComponentState = class extends dataCanvas.errorHandling.VizError {
    constructor(...args) {
        super(...args);
        this.name = "InvalidComponentState";
    }
};