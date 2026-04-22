function ResponsiveComponentEngine(userOptions) {
    const standardOptions = {
        refreshRate: 500,
        componentSelectors: {
            component: '.module'
        },
        classSuffixes: {
            upperLimit: '--max-width-',
            lowerLimit: '--min-width-'
        },
        metadataKeys: {
            componentIdentifier: 'rm-name',
            associatedComponents: 'rm-modules', // Not directly used for storage, but for data attr name
            componentContainer: 'rm-container', // Not directly used for storage, but for data attr name
            sizeThresholds: 'rm-breakpoints',
            cachedDimension: 'rm-width' // Not directly used for storage, but for data attr name
        }
    };

    const settings = Object.assign({}, standardOptions, userOptions);

    const elementMetadata = new WeakMap();
    const managedComponents = new Set();
    const managedContainers = new Set();

    let isMonitoringActive = false;
    let refreshTimerId = null;

    function determineElementDepth(targetElement) {
        let currentDepth = 0;
        let ancestor = targetElement;
        while (ancestor && ancestor.parentElement) {
            currentDepth++;
            ancestor = ancestor.parentElement;
        }
        return currentDepth;
    }

    function retrieveMatchingClasses(targetElement, pattern) {
        const foundClasses = [];
        for (const className of targetElement.classList) {
            if (className.includes(pattern)) {
                foundClasses.push(className);
            }
        }
        return foundClasses;
    }

    function buildComponentRelationships() {
        managedComponents.clear();
        managedContainers.clear();

        const allComponentElements = document.querySelectorAll(settings.componentSelectors.component);

        for (const currentComponent of allComponentElements) {
            const parentElement = currentComponent.parentElement;
            if (!parentElement) continue;

            managedComponents.add(currentComponent);
            managedContainers.add(parentElement);

            let componentData = elementMetadata.get(currentComponent);
            if (!componentData) {
                componentData = {};
                elementMetadata.set(currentComponent, componentData);
            }
            componentData.parentContainer = parentElement;
            componentData.identifier = currentComponent.dataset[settings.metadataKeys.componentIdentifier] || '';

            const thresholdsAttr = currentComponent.dataset[settings.metadataKeys.sizeThresholds];
            if (thresholdsAttr) {
                componentData.thresholds = thresholdsAttr
                    .split(',')
                    .map(s => parseInt(s.trim(), 10))
                    .filter(n => !isNaN(n))
                    .sort((a, b) => a - b);
            } else {
                componentData.thresholds = [];
            }

            let containerData = elementMetadata.get(parentElement);
            if (!containerData) {
                containerData = {};
                elementMetadata.set(parentElement, containerData);
            }
            if (!containerData.managedModules) {
                containerData.managedModules = new Set();
            }
            containerData.managedModules.add(currentComponent);
        }
    }

    function adjustModuleClasses(containerElement) {
        const containerData = elementMetadata.get(containerElement);
        if (!containerData || !containerData.managedModules) return;

        const currentDimension = containerData.lastDimension;

        for (const moduleElement of containerData.managedModules) {
            const moduleData = elementMetadata.get(moduleElement);
            if (!moduleData || !moduleData.thresholds) continue;

            const moduleIdentifier = moduleData.identifier;
            const thresholdValues = moduleData.thresholds;

            const classesToDiscard = [
                ...retrieveMatchingClasses(moduleElement, settings.classSuffixes.lowerLimit),
                ...retrieveMatchingClasses(moduleElement, settings.classSuffixes.upperLimit)
            ];
            moduleElement.classList.remove(...classesToDiscard);

            const classesToApply = [];
            for (const threshold of thresholdValues) {
                if (currentDimension < threshold) {
                    classesToApply.push(`${moduleIdentifier}${settings.classSuffixes.upperLimit}${threshold}`);
                } else {
                    classesToApply.push(`${moduleIdentifier}${settings.classSuffixes.lowerLimit}${threshold}`);
                }
            }
            if (classesToApply.length > 0) {
                moduleElement.classList.add(...classesToApply);
            }
        }
    }

    function evaluateElementDimensions() {
        const containersList = Array.from(managedContainers);

        const orderedContainers = containersList.sort((a, b) => {
            return determineElementDepth(a) - determineElementDepth(b);
        });

        for (const currentContainer of orderedContainers) {
            const currentDimension = currentContainer.offsetWidth;
            let containerData = elementMetadata.get(currentContainer);

            if (!containerData) {
                containerData = {};
                elementMetadata.set(currentContainer, containerData);
            }

            if (currentDimension !== containerData.lastDimension) {
                containerData.lastDimension = currentDimension;
                adjustModuleClasses(currentContainer);
            }
        }
    }

    function initiatePeriodicEvaluation() {
        evaluateElementDimensions();
        refreshTimerId = setTimeout(initiatePeriodicEvaluation, settings.refreshRate);
    }

    const responsiveManager = {
        activate: function() {
            if (isMonitoringActive) return;
            buildComponentRelationships();
            initiatePeriodicEvaluation();
            window.addEventListener('resize', evaluateElementDimensions);
            isMonitoringActive = true;
        },
        deactivate: function() {
            if (!isMonitoringActive) return;
            clearTimeout(refreshTimerId);
            window.removeEventListener('resize', evaluateElementDimensions);
            isMonitoringActive = false;
        },
        rescan: function() {
            if (isMonitoringActive) {
                buildComponentRelationships();
                evaluateElementDimensions();
            }
        }
    };

    return responsiveManager;
}