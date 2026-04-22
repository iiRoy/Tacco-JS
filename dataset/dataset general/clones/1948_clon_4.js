(function (globalJ, pluginName) {
    const assembleAttributes = (inputObject) => {
        const attributeList = [];
        Reflect.ownKeys(inputObject).forEach(keyIdentifier => {
            const propertyValue = inputObject[keyIdentifier];
            const valueType = typeof propertyValue;
            if ((valueType === 'string' || valueType === 'number') && String(propertyValue).trim() !== '') {
                attributeList.push(`${String(keyIdentifier)}="${String(propertyValue)}"`);
            }
        });
        return attributeList.join('');
    };

    const composeParameters = (configParams) => {
        if (typeof configParams !== 'object' || configParams === null) {
            return configParams;
        }

        const parameterTags = Object.entries(configParams).map(([paramName, paramValue]) => {
            let processedValue = paramValue;
            if (typeof paramValue === 'object' && paramValue !== null) {
                const nestedParams = Object.entries(paramValue).map(([nestedKey, nestedVal]) => {
                    return `${nestedKey}=${encodeURIComponent(nestedVal)}`;
                });
                processedValue = nestedParams.join('&amp;');
            }

            if (processedValue || processedValue === 0) { // Include 0 as a valid value
                return `<param name="${paramName}" value="${processedValue}" />`;
            }
            return '';
        }).filter(Boolean);

        return parameterTags.join('');
    };

    const deepMergeObjects = (target, source) => {
        const output = { ...target };
        if (target && typeof target === 'object' && source && typeof source === 'object') {
            Reflect.ownKeys(source).forEach(key => {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: {} });
                    }
                    output[key] = deepMergeObjects(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    };

    let detectedSwfVersionString = '0,0,0';
    let isSwfActiveX = false;
    let pluginDescription = null;

    try {
        if (window.navigator.plugins && window.navigator.plugins['Shockwave Flash']) {
            pluginDescription = window.navigator.plugins['Shockwave Flash'];
            detectedSwfVersionString = pluginDescription.description || '0,0,0';
        } else if (typeof window.ActiveXObject !== 'undefined') {
            isSwfActiveX = true;
            try {
                const activeXInstance = new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                detectedSwfVersionString = activeXInstance.GetVariable('$version') || '0,0,0';
            } catch (activeXError) {
                // IE might not have Flash installed, or security settings prevent ActiveXObject
            }
        }
    } catch (globalDetectionError) {
        // General error during detection
    }

    let versionMatchResult = detectedSwfVersionString.match(/^[A-Za-z\s]*?(\d+)[\.|,](\d+)(?:\s+[d|r]|,)(\d+)/);
    if (!versionMatchResult) {
        versionMatchResult = ['0,0,0', '0', '0', '0']; // Default if no match
    }

    const currentSwfVersion = {
        top: parseInt(versionMatchResult[1], 10),
        mid: parseInt(versionMatchResult[2], 10),
        low: parseInt(versionMatchResult[3], 10)
    };

    const checkSwfCapability = (requiredVersion) => {
        let requirementArray = requiredVersion;

        if (typeof requirementArray === 'string') {
            requirementArray = requirementArray.split('.').map(Number);
        } else if (typeof requirementArray === 'number') {
            requirementArray = [requirementArray, 0, 0];
        } else if (typeof requirementArray === 'object' && requirementArray !== null && !Array.isArray(requirementArray)) {
            requirementArray = [
                requirementArray.major || 0,
                requirementArray.minor || 0,
                requirementArray.release || 0
            ];
        } else if (!Array.isArray(requirementArray)) {
            requirementArray = [0, 0, 0];
        }

        requirementArray = [
            requirementArray[0] || 0,
            requirementArray[1] || 0,
            requirementArray[2] || 0
        ];

        const reqMajor = requirementArray[0];
        const reqMinor = requirementArray[1];
        const reqRelease = requirementArray[2];

        const instMajor = currentSwfVersion.top;
        const instMinor = currentSwfVersion.mid;
        const instRelease = currentSwfVersion.low;

        // Returns true if installed version >= required version
        return (instMajor > reqMajor) ||
               (instMajor === reqMajor && instMinor > reqMinor) ||
               (instMajor === reqMajor && instMinor === reqMinor && instRelease >= reqRelease);
    };

    let installerActiveFlag = false;
    const defaultInstallerSwfPath = 'expressInstall.swf';

    const createFlashEmbed = (inputConfig) => {
        if (!flashUtil.isSwfAvailable || installerActiveFlag || typeof inputConfig !== 'object' || !inputConfig.swfSource) {
            return ''; // Return empty string if conditions not met
        }

        let effectiveConfig = inputConfig;

        if (effectiveConfig.minimumVersion && !flashUtil.checkSwfCapability(effectiveConfig.minimumVersion)) {
            effectiveConfig = {
                swfSource: effectiveConfig.installerSwf || flashUtil.defaultInstallerSwfPath,
                htmlAttributes: {
                    elementId: effectiveConfig.elementId || 'SWFObjectExprInst',
                    elementName: effectiveConfig.elementName,
                    renderHeight: effectiveConfig.renderHeight || 137,
                    renderWidth: effectiveConfig.renderWidth || 214
                },
                objectParameters: {
                    flashVariables: {
                        redirectionURL: window.location.href,
                        playerKind: (flashUtil.isSwfActiveX) ? 'ActiveXPlayer' : 'PlugInPlayer',
                        pageTitle: window.document.title.slice(0, 47) + ' - Flash Player Installation'
                    }
                }
            };
            installerActiveFlag = true;
        } else {
            const baseSettings = {
                htmlAttributes: {
                    elementId: effectiveConfig.elementId,
                    elementName: effectiveConfig.elementName,
                    renderHeight: effectiveConfig.renderHeight || 180,
                    renderWidth: effectiveConfig.renderWidth || 320
                },
                objectParameters: {
                    windowMode: effectiveConfig.windowMode || 'opaque',
                    flashVariables: effectiveConfig.flashVariables
                }
            };
            effectiveConfig = deepMergeObjects(baseSettings, effectiveConfig);
        }

        if (flashUtil.isSwfActiveX) {
            effectiveConfig.htmlAttributes.classIdentifier = effectiveConfig.htmlAttributes.classIdentifier || 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
            effectiveConfig.objectParameters.moviePath = effectiveConfig.objectParameters.moviePath || effectiveConfig.swfSource;
        } else {
            effectiveConfig.htmlAttributes.mimeType = effectiveConfig.htmlAttributes.mimeType || 'application/x-shockwave-flash';
            effectiveConfig.htmlAttributes.dataSource = effectiveConfig.htmlAttributes.dataSource || effectiveConfig.swfSource;
        }

        const objectAttributesString = assembleAttributes(effectiveConfig.htmlAttributes);
        const objectParametersString = composeParameters(effectiveConfig.objectParameters);

        return `<object ${objectAttributesString}>${objectParametersString}</object>`;
    };

    const flashUtil = {
        isSwfAvailable: currentSwfVersion.top > 0,
        isSwfActiveX: isSwfActiveX,
        currentSwfVersion: currentSwfVersion,
        checkSwfCapability: checkSwfCapability,
        defaultInstallerSwfPath: defaultInstallerSwfPath,
        createFlashEmbed: createFlashEmbed
    };

    globalJ[pluginName] = flashUtil;

    globalJ.fn[pluginName] = function (actionConfiguration) {
        if (typeof actionConfiguration === 'object' && actionConfiguration !== null) {
            Array.from(this).forEach(currentElement => {
                const temporaryHtmlContainer = document.createElement('div');
                const newEmbedMarkup = flashUtil.createFlashEmbed(actionConfiguration);

                if (newEmbedMarkup) {
                    temporaryHtmlContainer.innerHTML = newEmbedMarkup;
                    if (temporaryHtmlContainer.firstElementChild) {
                        currentElement.appendChild(temporaryHtmlContainer.firstElementChild);
                    }
                }
            });
        } else if (typeof actionConfiguration === 'function') {
            const allTargets = globalJ(this).find('object').get();
            if (globalJ(this).is('object')) {
                Array.from(this).forEach(el => allTargets.unshift(el));
            }
            const uniqueTargetObjects = [...new Set(allTargets)];

            uniqueTargetObjects.forEach(targetObjectElement => {
                const interactionDelayProperty = 'interactionPollingDelayMs';
                targetObjectElement[interactionDelayProperty] = targetObjectElement[interactionDelayProperty] || 0;

                const maximumInteractionDelay = 660;
                const progressiveDelayIncrement = 66;

                if (targetObjectElement[interactionDelayProperty] < maximumInteractionDelay) {
                    if (targetObjectElement.clientWidth || targetObjectElement.clientHeight) {
                        actionConfiguration.call(targetObjectElement);
                    } else {
                        setTimeout(() => {
                            targetObjectElement[interactionDelayProperty] += progressiveDelayIncrement;
                            globalJ(targetObjectElement)[pluginName](actionConfiguration);
                        }, targetObjectElement[interactionDelayProperty]);
                    }
                }
            });
        }

        return this;
    };

}(jQuery, 'flashComponent'));