(function() {
    // Helper for deep merging objects, replicating jQuery.extend(true, ...) functionality
    function recursiveMerge(target, source) {
        if (typeof target !== 'object' || target === null || Array.isArray(target)) {
            target = {}; // Ensure target is an object for merging
        }
        if (typeof source !== 'object' || source === null || Array.isArray(source)) {
            return target; // Only merge objects
        }

        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    // Deep merge for nested objects
                    if (typeof target[key] !== 'object' || target[key] === null) {
                        target[key] = {}; // Ensure target property is an object for deep merge
                    }
                    recursiveMerge(target[key], source[key]);
                } else {
                    // Assign primitive values or arrays directly
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    class ConfigurationInterface {
        constructor(hostElement, initialSettings, updateCallbacks) {
            if (!hostElement || !(hostElement instanceof Element)) {
                console.error("Host element is invalid or not provided.");
                return;
            }

            this.mainContainer = hostElement;
            this.notificationCallbacks = Array.isArray(updateCallbacks) ? updateCallbacks : [];
            this.inputElements = {}; // Stores references to generated input elements

            this._constructInterface();
            this._initializeState(initialSettings || {});
        }

        _constructInterface() {
            // Section for primary configuration options
            const primaryOptionsDiv = document.createElement('div');
            primaryOptionsDiv.id = 'primaryOptionsContainer';
            primaryOptionsDiv.className = 'optionGroup';
            this.mainContainer.appendChild(primaryOptionsDiv);

            this.inputElements.activateFeature = this._createInputWithLabel(primaryOptionsDiv, 'checkbox', 'activateFeatureId', 'featureOption', 'activate feature');
            this.inputElements.monoAdjust = this._createInputWithLabel(primaryOptionsDiv, 'checkbox', 'monoAdjustId', 'featureOption', 'monotonic adjust');
            this.inputElements.curveSmoothness = this._createInputWithLabel(primaryOptionsDiv, 'range', 'curveSmoothnessId', 'featureOption', 'curve smoothness /in [0,1]', { min: '0', max: '1', step: '0.1' });
            this.inputElements.pointCount = this._createInputWithLabel(primaryOptionsDiv, 'text', 'pointCountId', 'featureOption', '# points');

            // Section for secondary/legacy configuration options
            const secondaryOptionsDiv = document.createElement('div');
            secondaryOptionsDiv.id = 'secondaryOptionsContainer';
            secondaryOptionsDiv.className = 'optionGroup';
            this.mainContainer.appendChild(secondaryOptionsDiv);

            this.inputElements.enableLegacy = this._createInputWithLabel(secondaryOptionsDiv, 'checkbox', 'enableLegacyId', 'legacyOption', 'enable old options');
            this.inputElements.legacyCurveFit = this._createInputWithLabel(secondaryOptionsDiv, 'checkbox', 'legacyCurveFitId', 'legacyOption', 'old fit');
            this.inputElements.legacyFactor = this._createInputWithLabel(secondaryOptionsDiv, 'text', 'legacyFactorId', 'legacyOption', 'old factor');
            this.inputElements.legacyDistance = this._createInputWithLabel(secondaryOptionsDiv, 'text', 'legacyDistanceId', 'legacyOption', 'old dist');
        }

        _createInputWithLabel(parentDiv, type, id, className, labelText, attributes = {}) {
            const input = document.createElement('input');
            input.type = type;
            input.id = id;
            input.className = className;
            for (const key in attributes) {
                input.setAttribute(key, attributes[key]);
            }
            parentDiv.appendChild(input);

            const label = document.createElement('label');
            label.htmlFor = id;
            label.textContent = labelText;
            parentDiv.appendChild(label);

            return input;
        }

        _getBaseConfiguration() {
            return {
                activated: false,
                monoAdjust: false,
                curveSmoothness: "0.0", // Original reads .val() as string
                pointCount: "20",     // Original reads .val() as string
                subConfig: undefined
            };
        }

        _getBaseLegacySettings() {
            return {
                legacyCurveFit: false,
                legacyFactor: "20",   // Original reads .val() as string
                legacyDistance: undefined
            };
        }

        _initializeState(incomingSettings) {
            const baseConfig = this._getBaseConfiguration();
            const baseLegacy = this._getBaseLegacySettings();

            let effectiveBaseConfig = recursiveMerge({}, baseConfig); // Create a mutable copy

            // Replicate original's specific legacyOverride handling
            if (typeof incomingSettings.subConfig !== 'undefined') {
                effectiveBaseConfig.subConfig = recursiveMerge({}, baseLegacy); // Ensure base has legacy defaults if incoming has subConfig
                if (incomingSettings.subConfig === true) {
                    incomingSettings.subConfig = recursiveMerge({}, baseLegacy); // If incoming.subConfig is 'true', replace with actual defaults
                }
            }

            const finalConfiguration = recursiveMerge(effectiveBaseConfig, incomingSettings);

            // Set UI element states based on finalConfiguration
            this.inputElements.activateFeature.checked = finalConfiguration.activated;
            this.inputElements.monoAdjust.checked = finalConfiguration.monoAdjust;
            this.inputElements.curveSmoothness.value = finalConfiguration.curveSmoothness;
            this.inputElements.pointCount.value = finalConfiguration.pointCount;

            const hasSubConfig = typeof finalConfiguration.subConfig !== 'undefined';
            this.inputElements.enableLegacy.checked = hasSubConfig;
            if (hasSubConfig) {
                this.inputElements.legacyCurveFit.checked = finalConfiguration.subConfig.legacyCurveFit;
                this.inputElements.legacyFactor.value = finalConfiguration.subConfig.legacyFactor;
                this.inputElements.legacyDistance.value = finalConfiguration.subConfig.legacyDistance === undefined ? '' : finalConfiguration.subConfig.legacyDistance;
            } else {
                // Ensure legacy inputs are cleared if no subConfig is active
                this.inputElements.legacyCurveFit.checked = false;
                this.inputElements.legacyFactor.value = '';
                this.inputElements.legacyDistance.value = '';
            }

            // Attach event listeners
            this.inputElements.activateFeature.addEventListener('change', this._handleActivateChange.bind(this));
            this.inputElements.monoAdjust.addEventListener('change', this._handleMonoAdjustChange.bind(this));
            this.inputElements.curveSmoothness.addEventListener('change', this._handleSmoothnessChange.bind(this));
            this.inputElements.pointCount.addEventListener('change', this._handlePointCountChange.bind(this));
            this.inputElements.enableLegacy.addEventListener('change', this._handleEnableLegacyChange.bind(this));
            this.inputElements.legacyCurveFit.addEventListener('change', this._handleLegacyCurveFitChange.bind(this));
            this.inputElements.legacyFactor.addEventListener('change', this._handleLegacyFactorChange.bind(this));
            this.inputElements.legacyDistance.addEventListener('change', this._handleLegacyDistanceChange.bind(this));

            this._dispatchUpdates();
        }

        _gatherCurrentSettings() {
            const currentConfiguration = {
                activated: this.inputElements.activateFeature.checked,
                monoAdjust: this.inputElements.monoAdjust.checked,
                curveSmoothness: this.inputElements.curveSmoothness.value,
                pointCount: this.inputElements.pointCount.value,
                subConfig: undefined
            };

            if (this.inputElements.enableLegacy.checked) {
                const legacyDistValue = this.inputElements.legacyDistance.value;
                currentConfiguration.subConfig = {
                    legacyCurveFit: this.inputElements.legacyCurveFit.checked,
                    legacyFactor: this.inputElements.legacyFactor.value,
                    legacyDistance: legacyDistValue === '' ? undefined : legacyDistValue,
                };
            }
            return currentConfiguration;
        }

        _dispatchUpdates() {
            const config = this._gatherCurrentSettings();
            this.notificationCallbacks.forEach(callback => callback(config));
        }

        // Event Handlers
        _handleActivateChange() {
            this._dispatchUpdates();
        }

        _handleEnableLegacyChange() {
            this._dispatchUpdates();
        }

        _handleLegacyCurveFitChange() {
            if (this.inputElements.enableLegacy.checked) {
                this._dispatchUpdates();
            }
        }

        _handleLegacyFactorChange() {
            if (this.inputElements.enableLegacy.checked) {
                this._dispatchUpdates();
            }
        }

        _handleLegacyDistanceChange() {
            if (this.inputElements.enableLegacy.checked) {
                this._dispatchUpdates();
            }
        }

        _handleMonoAdjustChange() {
            this.inputElements.enableLegacy.checked = false;
            this._dispatchUpdates();
        }

        _handleSmoothnessChange() {
            this.inputElements.enableLegacy.checked = false;
            this._dispatchUpdates();
        }

        _handlePointCountChange() {
            this.inputElements.enableLegacy.checked = false;
            this._dispatchUpdates();
        }
    }

    // Expose the class globally under a new name
    this.ConfigurationInterface = ConfigurationInterface;
})();