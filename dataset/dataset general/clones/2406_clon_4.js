const globalComponentRegistry = {};
let nextAvailableIdentifier = 0;

function mergeDeep(target, source) {
    const output = Object.assign({}, target);
    if (target && typeof target === 'object' && source && typeof source === 'object') {
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object') {
                output[key] = mergeDeep(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        });
    }
    return output;
}

const defaultLabelSettings = {
    content: {
        text: '',
        title: {
            text: ''
        },
        prerender: false
    },
    position: {
        corner: {
            target: 'top left',
            tooltip: 'bottom right'
        },
        target: 'element',
        container: null,
        type: 'absolute'
    },
    show: {
        when: {
            event: 'mouseenter',
            target: 'element'
        },
        effect: {
            type: 'fade',
            duration: 150
        },
        ready: false,
        solo: false
    },
    hide: {
        when: {
            event: 'mouseleave',
            target: 'element'
        },
        effect: {
            type: 'fade',
            duration: 150
        }
    },
    visual: {
        name: 'default',
        classes: {
            container: 'floating-label-container',
            content: 'floating-label-content',
            title: 'floating-label-title',
            closeButton: 'floating-label-close',
            target: 'floating-label-target',
            active: 'floating-label-active'
        }
    },
    api: {
        beforePresent: function() {},
        onPresent: function() {},
        beforeConceal: function() {},
        onConceal: function() {}
    }
};

const componentLogger = {
    reportIssue: function(code, message, method) {
        console.warn(`FloatingLabel Issue (${method || 'unknown'}): ${message} (Code: ${code})`);
        return this;
    }
};

const labelMessages = {
    NO_LABEL_PRESENT: "No floating label instance found on this element.",
    LABEL_NOT_RENDERED: "Floating label is not rendered.",
    CANNOT_POSITION_STATIC: "Cannot adjust position of a static floating label.",
    INVALID_AREA_SHAPE: "Invalid area shape for positioning."
};

function normalizeVisualSettings(currentVisuals) {
    const updatedVisuals = {};
    Object.assign(updatedVisuals, currentVisuals);
    if (typeof updatedVisuals.name !== 'string') {
        updatedVisuals.name = 'default';
    }
    return updatedVisuals;
}

function composeVisualProperties(baseConfig, userVisuals) {
    const finalClasses = mergeDeep(defaultLabelSettings.visual.classes, userVisuals.classes || {});
    return mergeDeep(baseConfig.visual, { classes: finalClasses });
}

class FloatingLabel {
    constructor(sourceElement, instanceConfiguration, identifier) {
        const labelSelf = this;

        labelSelf.identifier = identifier;
        labelSelf.configuration = instanceConfiguration;
        labelSelf.activityState = {
            isAnimating: false,
            isRendered: false,
            isDisabled: false,
            isFocused: false
        };
        labelSelf.domComponents = {
            sourceElement: sourceElement,
            mainWrapper: null,
            contentSection: null,
            contentContainer: null,
            titleBar: null,
            dismissButton: null,
            pointerTip: null,
            iframeShim: null
        };
        labelSelf.temporaryStorage = {
            mouseCoords: {},
            lastPosition: {},
            toggleFlag: 0
        };
        labelSelf.delayMechanisms = {};

        labelSelf.domComponents.sourceElement.classList.add(labelSelf.configuration.visual.classes.target);

        Object.assign(labelSelf, labelSelf.configuration.api, {
            presentVisual: function(triggerEvent) {
                let apiResult;

                if (!labelSelf.activityState.isRendered) {
                    return componentLogger.reportIssue(2, labelMessages.LABEL_NOT_RENDERED, 'presentVisual');
                }

                if (labelSelf.domComponents.mainWrapper.style.display !== 'none') return labelSelf;

                clearTimeout(labelSelf.delayMechanisms.hide);
                labelSelf.domComponents.mainWrapper.style.transition = 'none';
                labelSelf.domComponents.mainWrapper.style.opacity = '';
                labelSelf.domComponents.mainWrapper.style.height = '';
                labelSelf.domComponents.mainWrapper.style.overflow = '';
                labelSelf.domComponents.mainWrapper.style.transform = '';

                apiResult = labelSelf.beforePresent.call(labelSelf, triggerEvent);
                if (apiResult === false) return labelSelf;

                function afterPresent() {
                    if (labelSelf.configuration.position.type !== 'static') labelSelf.highlightComponent();
                    labelSelf.onPresent.call(labelSelf, triggerEvent);
                }

                labelSelf.temporaryStorage.toggleFlag = 1;

                if (labelSelf.configuration.position.type !== 'static') {
                    labelSelf.adjustPlacement(triggerEvent, (labelSelf.configuration.show.effect.duration > 0));
                }

                if (labelSelf.configuration.show.solo) {
                    let soloTargets = [];
                    if (typeof labelSelf.configuration.show.solo === 'object' && labelSelf.configuration.show.solo instanceof HTMLElement) {
                        soloTargets = [labelSelf.configuration.show.solo];
                    } else if (labelSelf.configuration.show.solo === true) {
                        soloTargets = Array.from(document.querySelectorAll(`.${labelSelf.configuration.visual.classes.container}`));
                    }
                    soloTargets.forEach(el => {
                        const instanceIdentifier = el.dataset.floatingLabelId;
                        if (instanceIdentifier && globalComponentRegistry[instanceIdentifier] && globalComponentRegistry[instanceIdentifier].activityState.isRendered && globalComponentRegistry[instanceIdentifier] !== labelSelf) {
                            globalComponentRegistry[instanceIdentifier].concealVisual();
                        }
                    });
                }

                const presentEffect = labelSelf.configuration.show.effect.type.toLowerCase();
                const presentDuration = labelSelf.configuration.show.effect.duration;
                labelSelf.domComponents.mainWrapper.classList.add(labelSelf.configuration.visual.classes.active);

                if (typeof labelSelf.configuration.show.effect.type === 'function') {
                    labelSelf.configuration.show.effect.type.call(labelSelf.domComponents.mainWrapper, presentDuration);
                    setTimeout(afterPresent, presentDuration);
                } else {
                    switch (presentEffect) {
                        case 'fade':
                            labelSelf.domComponents.mainWrapper.style.opacity = '0';
                            labelSelf.domComponents.mainWrapper.style.display = 'block';
                            labelSelf.domComponents.mainWrapper.style.transition = `opacity ${presentDuration}ms ease-in-out`;
                            requestAnimationFrame(() => {
                                labelSelf.domComponents.mainWrapper.style.opacity = '1';
                            });
                            setTimeout(afterPresent, presentDuration);
                            break;
                        case 'slide':
                            labelSelf.domComponents.mainWrapper.style.height = '0';
                            labelSelf.domComponents.mainWrapper.style.overflow = 'hidden';
                            labelSelf.domComponents.mainWrapper.style.display = 'block';
                            labelSelf.domComponents.mainWrapper.style.transition = `height ${presentDuration}ms ease-in-out`;
                            const targetHeight = labelSelf.domComponents.mainWrapper.scrollHeight + 'px';
                            requestAnimationFrame(() => {
                                labelSelf.domComponents.mainWrapper.style.height = targetHeight;
                            });
                            setTimeout(() => {
                                labelSelf.domComponents.mainWrapper.style.height = '';
                                labelSelf.domComponents.mainWrapper.style.overflow = '';
                                afterPresent();
                            }, presentDuration);
                            break;
                        case 'grow':
                            labelSelf.domComponents.mainWrapper.style.transform = 'scale(0)';
                            labelSelf.domComponents.mainWrapper.style.display = 'block';
                            labelSelf.domComponents.mainWrapper.style.transition = `transform ${presentDuration}ms ease-in-out`;
                            requestAnimationFrame(() => {
                                labelSelf.domComponents.mainWrapper.style.transform = 'scale(1)';
                            });
                            setTimeout(() => {
                                labelSelf.domComponents.mainWrapper.style.transform = '';
                                afterPresent();
                            }, presentDuration);
                            break;
                        default:
                            labelSelf.domComponents.mainWrapper.style.display = 'block';
                            afterPresent();
                            break;
                    }
                }

                return componentLogger.reportIssue(1, 'Floating label displayed.', 'presentVisual');
            },

            concealVisual: function(triggerEvent) {
                let apiResult;

                if (!labelSelf.activityState.isRendered) {
                    return componentLogger.reportIssue(2, labelMessages.LABEL_NOT_RENDERED, 'concealVisual');
                } else if (labelSelf.domComponents.mainWrapper.style.display === 'none') {
                    return labelSelf;
                }

                clearTimeout(labelSelf.delayMechanisms.show);
                labelSelf.domComponents.mainWrapper.style.transition = 'none';
                labelSelf.domComponents.mainWrapper.style.opacity = '';
                labelSelf.domComponents.mainWrapper.style.height = '';
                labelSelf.domComponents.mainWrapper.style.overflow = '';
                labelSelf.domComponents.mainWrapper.style.transform = '';

                apiResult = labelSelf.beforeConceal.call(labelSelf, triggerEvent);
                if (apiResult === false) return labelSelf;

                function afterConceal() {
                    labelSelf.onConceal.call(labelSelf, triggerEvent);
                    labelSelf.domComponents.mainWrapper.style.display = 'none';
                }

                labelSelf.temporaryStorage.toggleFlag = 0;

                const concealEffect = labelSelf.configuration.hide.effect.type.toLowerCase();
                const concealDuration = labelSelf.configuration.hide.effect.duration;
                labelSelf.domComponents.mainWrapper.classList.remove(labelSelf.configuration.visual.classes.active);

                if (typeof labelSelf.configuration.hide.effect.type === 'function') {
                    labelSelf.configuration.hide.effect.type.call(labelSelf.domComponents.mainWrapper, concealDuration);
                    setTimeout(afterConceal, concealDuration);
                } else {
                    switch (concealEffect) {
                        case 'fade':
                            labelSelf.domComponents.mainWrapper.style.opacity = '1';
                            labelSelf.domComponents.mainWrapper.style.transition = `opacity ${concealDuration}ms ease-in-out`;
                            requestAnimationFrame(() => {
                                labelSelf.domComponents.mainWrapper.style.opacity = '0';
                            });
                            setTimeout(afterConceal, concealDuration);
                            break;
                        case 'slide':
                            labelSelf.domComponents.mainWrapper.style.height = labelSelf.domComponents.mainWrapper.scrollHeight + 'px';
                            labelSelf.domComponents.mainWrapper.style.overflow = 'hidden';
                            labelSelf.domComponents.mainWrapper.style.transition = `height ${concealDuration}ms ease-in-out`;
                            requestAnimationFrame(() => {
                                labelSelf.domComponents.mainWrapper.style.height = '0';
                            });
                            setTimeout(afterConceal, concealDuration);
                            break;
                        case 'grow':
                            labelSelf.domComponents.mainWrapper.style.transform = 'scale(1)';
                            labelSelf.domComponents.mainWrapper.style.transition = `transform ${concealDuration}ms ease-in-out`;
                            requestAnimationFrame(() => {
                                labelSelf.domComponents.mainWrapper.style.transform = 'scale(0)';
                            });
                            setTimeout(afterConceal, concealDuration);
                            break;
                        default:
                            afterConceal();
                            break;
                    }
                }

                return componentLogger.reportIssue(1, 'Floating label concealed.', 'concealVisual');
            },

            adjustPlacement: function(triggerEvent, shouldAnimate) {
                let currentTarget, currentLabel, computedCoords, mapIdentifier, imageCoordinates, newPlacement,
                    currentRect;

                if (!labelSelf.activityState.isRendered) {
                    return componentLogger.reportIssue(2, labelMessages.LABEL_NOT_RENDERED, 'adjustPlacement');
                } else if (labelSelf.configuration.position.type === 'static') {
                    return componentLogger.reportIssue(1, labelMessages.CANNOT_POSITION_STATIC, 'adjustPlacement');
                }

                currentTarget = {
                    location: { x: 0, y: 0 },
                    dimensions: { height: 0, width: 0 },
                    anchorPoint: labelSelf.configuration.position.corner.target
                };
                currentLabel = {
                    location: labelSelf.getCurrentPlacement(),
                    dimensions: labelSelf.getComponentDimensions(),
                    anchorPoint: labelSelf.configuration.position.corner.tooltip
                };

                const positionTarget = labelSelf.configuration.position.target;

                if (positionTarget instanceof HTMLElement && positionTarget.nodeName.toLowerCase() === 'area') {
                    computedCoords = positionTarget.getAttribute('coords').split(',').map(Number);
                    mapIdentifier = positionTarget.parentNode.getAttribute('name');
                    imageCoordinates = document.querySelector(`img[usemap="#${mapIdentifier}"]`).getBoundingClientRect();

                    currentTarget.location = {
                        x: Math.floor(imageCoordinates.left + window.scrollX + computedCoords[0]),
                        y: Math.floor(imageCoordinates.top + window.scrollY + computedCoords[1])
                    };

                    switch (positionTarget.getAttribute('shape').toLowerCase()) {
                        case 'rect':
                            currentTarget.dimensions = {
                                width: Math.ceil(Math.abs(computedCoords[2] - computedCoords[0])),
                                height: Math.ceil(Math.abs(computedCoords[3] - computedCoords[1]))
                            };
                            break;
                        case 'circle':
                            currentTarget.dimensions = {
                                width: computedCoords[2] * 2,
                                height: computedCoords[2] * 2
                            };
                            currentTarget.location.x -= computedCoords[2];
                            currentTarget.location.y -= computedCoords[2];
                            break;
                        case 'poly':
                            let minX = computedCoords[0], maxX = computedCoords[0];
                            let minY = computedCoords[1], maxY = computedCoords[1];

                            for (let i = 0; i < computedCoords.length; i += 2) {
                                minX = Math.min(minX, computedCoords[i]);
                                maxX = Math.max(maxX, computedCoords[i]);
                                minY = Math.min(minY, computedCoords[i + 1]);
                                maxY = Math.max(maxY, computedCoords[i + 1]);
                            }

                            currentTarget.location.x = Math.floor(imageCoordinates.left + window.scrollX + minX);
                            currentTarget.location.y = Math.floor(imageCoordinates.top + window.scrollY + minY);
                            currentTarget.dimensions = {
                                width: maxX - minX,
                                height: maxY - minY
                            };
                            break;
                        default:
                            return componentLogger.reportIssue(4, labelMessages.INVALID_AREA_SHAPE, 'adjustPlacement');
                    }
                } else if (positionTarget === document || positionTarget === document.body) {
                    currentTarget.location = { x: window.scrollX, y: window.scrollY };
                    currentTarget.dimensions = { height: window.innerHeight, width: window.innerWidth };
                } else if (positionTarget === 'element' || positionTarget instanceof HTMLElement) {
                    const actualTarget = (positionTarget === 'element') ? labelSelf.domComponents.sourceElement : positionTarget;
                    const targetData = actualTarget.dataset.floatingLabelCurrentPosition;
                    if (targetData) {
                        currentTarget.location = JSON.parse(targetData);
                    } else {
                        currentRect = actualTarget.getBoundingClientRect();
                        currentTarget.location = { x: currentRect.left + window.scrollX, y: currentRect.top + window.scrollY };
                    }
                    currentTarget.dimensions = {
                        height: actualTarget.offsetHeight,
                        width: actualTarget.offsetWidth
                    };
                } else if (positionTarget === 'mouse') {
                    currentTarget.location = { x: labelSelf.temporaryStorage.mouseCoords.x, y: labelSelf.temporaryStorage.mouseCoords.y };
                    currentTarget.dimensions = { height: 1, width: 1 };
                } else {
                    if (positionTarget && positionTarget.getBoundingClientRect) {
                        currentRect = positionTarget.getBoundingClientRect();
                        currentTarget.location = { x: currentRect.left + window.scrollX, y: currentRect.top + window.scrollY };
                        currentTarget.dimensions = {
                            height: positionTarget.offsetHeight,
                            width: positionTarget.offsetWidth
                        };
                    }
                }

                newPlacement = { ...currentTarget.location };

                if (currentTarget.anchorPoint.includes('right')) newPlacement.x += currentTarget.dimensions.width;
                if (currentTarget.anchorPoint.includes('bottom')) newPlacement.y += currentTarget.dimensions.height;
                if (currentTarget.anchorPoint.includes('middle') || currentTarget.anchorPoint.includes('center')) {
                    if (currentTarget.anchorPoint.includes('top') || currentTarget.anchorPoint.includes('bottom')) {
                         newPlacement.x += (currentTarget.dimensions.width / 2);
                    } else {
                        newPlacement.y += (currentTarget.dimensions.height / 2);
                    }
                }

                if (currentLabel.anchorPoint.includes('right')) newPlacement.x -= currentLabel.dimensions.width;
                if (currentLabel.anchorPoint.includes('bottom')) newPlacement.y -= currentLabel.dimensions.height;
                if (currentLabel.anchorPoint.includes('middle') || currentLabel.anchorPoint.includes('center')) {
                    if (currentLabel.anchorPoint.includes('top') || currentLabel.anchorPoint.includes('bottom')) {
                        newPlacement.x -= (currentLabel.dimensions.width / 2);
                    } else {
                        newPlacement.y -= (currentLabel.dimensions.height / 2);
                    }
                }

                labelSelf.domComponents.sourceElement.dataset.floatingLabelCurrentPosition = JSON.stringify(newPlacement);
                labelSelf.temporaryStorage.lastPosition = newPlacement;

                labelSelf.domComponents.mainWrapper.style.left = `${newPlacement.x}px`;
                labelSelf.domComponents.mainWrapper.style.top = `${newPlacement.y}px`;

                return componentLogger.reportIssue(1, 'Floating label position updated.', 'adjustPlacement');
            },

            getCurrentPlacement: function() {
                const rect = labelSelf.domComponents.mainWrapper.getBoundingClientRect();
                return { x: rect.left + window.scrollX, y: rect.top + window.scrollY };
            },

            getComponentDimensions: function() {
                return {
                    width: labelSelf.domComponents.mainWrapper.offsetWidth,
                    height: labelSelf.domComponents.mainWrapper.offsetHeight
                };
            },

            highlightComponent: function() {
                const allLabels = Array.from(document.querySelectorAll(`.${labelSelf.configuration.visual.classes.container}`));
                let maxZ = 0;
                allLabels.forEach(lbl => {
                    const z = parseInt(lbl.style.zIndex || 0);
                    if (z > maxZ) maxZ = z;
                });
                labelSelf.domComponents.mainWrapper.style.zIndex = maxZ + 1;
                labelSelf.activityState.isFocused = true;
            },

            deactivateComponent: function(state) {
                labelSelf.activityState.isDisabled = state;
                if (state) {
                    labelSelf.concealVisual();
                    labelSelf.domComponents.mainWrapper.classList.add('floating-label-disabled');
                } else {
                    labelSelf.domComponents.mainWrapper.classList.remove('floating-label-disabled');
                }
            },

            activateComponent: function() {
                labelSelf.deactivateComponent(false);
            },

            removeComponent: function() {
                labelSelf.domComponents.sourceElement.removeEventListener(labelSelf.configuration.show.when.event, labelSelf.boundPresentHandler);
                labelSelf.domComponents.sourceElement.removeEventListener(labelSelf.configuration.hide.when.event, labelSelf.boundConcealHandler);
                if (labelSelf.configuration.content.prerender === false && labelSelf.configuration.show.when.event !== false && labelSelf.configuration.show.ready !== true) {
                    const prerenderTarget = (labelSelf.configuration.show.when.target === 'element') ? labelSelf.domComponents.sourceElement : labelSelf.configuration.show.when.target;
                    prerenderTarget.removeEventListener(
                        labelSelf.configuration.show.when.event,
                        labelSelf.boundPrerenderHandler
                    );
                }

                if (labelSelf.domComponents.mainWrapper && labelSelf.domComponents.mainWrapper.parentNode) {
                    labelSelf.domComponents.mainWrapper.parentNode.removeChild(labelSelf.domComponents.mainWrapper);
                }

                delete globalComponentRegistry[labelSelf.identifier];

                const elementInstances = labelSelf.domComponents.sourceElement.dataset.floatingLabelInstances;
                if (elementInstances) {
                    const ids = JSON.parse(elementInstances).filter(id => id !== labelSelf.identifier);
                    if (ids.length) {
                        labelSelf.domComponents.sourceElement.dataset.floatingLabelInstances = JSON.stringify(ids);
                        labelSelf.domComponents.sourceElement.dataset.floatingLabelActiveReference = ids[ids.length - 1];
                    } else {
                        delete labelSelf.domComponents.sourceElement.dataset.floatingLabelInstances;
                        delete labelSelf.domComponents.sourceElement.dataset.floatingLabelActiveReference;
                    }
                }
                delete labelSelf.domComponents.sourceElement.dataset.floatingLabelCurrentPosition;

                labelSelf.activityState.isRendered = false;
                componentLogger.reportIssue(1, 'Floating label destroyed.', 'removeComponent');
            }
        });
    }

    buildVisual() {
        const labelSelf = this;
        const config = labelSelf.configuration;

        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = config.visual.classes.container;
        wrapperDiv.style.position = config.position.type;
        wrapperDiv.style.display = 'none';
        wrapperDiv.setAttribute('data-floating-label-id', labelSelf.identifier);
        labelSelf.domComponents.mainWrapper = wrapperDiv;

        const contentDiv = document.createElement('div');
        contentDiv.className = config.visual.classes.content;
        labelSelf.domComponents.contentContainer = contentDiv;
        wrapperDiv.appendChild(contentDiv);

        if (config.content.title.text) {
            const titleDiv = document.createElement('div');
            titleDiv.className = config.visual.classes.title;
            titleDiv.innerHTML = config.content.title.text;
            labelSelf.domComponents.titleBar = titleDiv;
            contentDiv.appendChild(titleDiv);
        }

        if (config.content.text instanceof HTMLElement) {
            labelSelf.domComponents.contentSection = config.content.text;
            contentDiv.appendChild(config.content.text);
        } else {
            const textContentDiv = document.createElement('div');
            textContentDiv.innerHTML = config.content.text;
            labelSelf.domComponents.contentSection = textContentDiv;
            contentDiv.appendChild(textContentDiv);
        }

        const containerElement = config.position.container || document.body;
        containerElement.appendChild(wrapperDiv);

        labelSelf.activityState.isRendered = true;

        labelSelf.bindComponentEvents();

        if (config.position.type !== 'static') {
            labelSelf.adjustPlacement();
        }

        componentLogger.reportIssue(1, 'Floating label DOM constructed.', 'buildVisual');
    }

    bindComponentEvents() {
        const labelSelf = this;
        const config = labelSelf.configuration;

        const showTarget = (config.show.when.target === 'element') ? labelSelf.domComponents.sourceElement : config.show.when.target;
        const hideTarget = (config.hide.when.target === 'element') ? labelSelf.domComponents.sourceElement : config.hide.when.target;

        labelSelf.boundPresentHandler = function(evt) {
            labelSelf.temporaryStorage.mouseCoords = { x: evt.pageX, y: evt.pageY };
            labelSelf.presentVisual(evt);
        };
        labelSelf.boundConcealHandler = function(evt) {
            labelSelf.temporaryStorage.mouseCoords = { x: evt.pageX, y: evt.pageY };
            labelSelf.concealVisual(evt);
        };

        if (config.show.when.event) {
            showTarget.addEventListener(config.show.when.event, labelSelf.boundPresentHandler);
        }
        if (config.hide.when.event && config.hide.when.event !== config.show.when.event) {
            hideTarget.addEventListener(config.hide.when.event, labelSelf.boundConcealHandler);
        }
    }
}

function manageFloatingLabel(targetElements, userParameters, globalDirective) {
    const targets = Array.from(targetElements);

    if (typeof userParameters === 'string') {
        const actionType = userParameters.toLowerCase();
        const results = [];

        targets.forEach(currentElement => {
            const instanceId = currentElement.dataset.floatingLabelActiveReference;
            if (!instanceId || !globalComponentRegistry[instanceId]) {
                componentLogger.reportIssue(1, labelMessages.NO_LABEL_PRESENT, actionType);
                results.push(null);
                return;
            }

            const activeInstance = globalComponentRegistry[instanceId];

            if (globalDirective === true && actionType === 'removecomponent') {
                const allIds = JSON.parse(currentElement.dataset.floatingLabelInstances || '[]');
                allIds.forEach(id => {
                    if (globalComponentRegistry[id]) globalComponentRegistry[id].removeComponent();
                });
                results.push(true);
            } else {
                if (actionType === 'getapi') {
                    results.push(activeInstance);
                } else if (actionType === 'getinstances') {
                    const allIds = JSON.parse(currentElement.dataset.floatingLabelInstances || '[]');
                    results.push(allIds.map(id => globalComponentRegistry[id]).filter(Boolean));
                } else if (activeInstance.activityState.isRendered || actionType === 'removecomponent') {
                    switch (actionType) {
                        case 'removecomponent': activeInstance.removeComponent(); break;
                        case 'presentvisual': activeInstance.presentVisual(); break;
                        case 'concealvisual': activeInstance.concealVisual(); break;
                        case 'highlightcomponent': activeInstance.highlightComponent(); break;
                        case 'deactivatecomponent': activeInstance.deactivateComponent(true); break;
                        case 'activatecomponent': activeInstance.deactivateComponent(false); break;
                        default: componentLogger.reportIssue(1, `Unknown action: ${actionType}`, 'manageFloatingLabel'); break;
                    }
                    results.push(activeInstance);
                }
            }
        });
        return results.length === 1 ? results[0] : results;
    }

    let workingConfig = userParameters || {};

    if (typeof workingConfig.content !== 'object' || (workingConfig.content instanceof HTMLElement)) {
        workingConfig.content = { text: workingConfig.content };
    }
    if (typeof workingConfig.content.title !== 'object') {
        workingConfig.content.title = { text: workingConfig.content.title };
    }
    if (typeof workingConfig.position !== 'object') {
        workingConfig.position = { corner: workingConfig.position };
    }
    if (typeof workingConfig.position.corner !== 'object') {
        workingConfig.position.corner = { target: workingConfig.position.corner, tooltip: workingConfig.position.corner };
    }
    if (typeof workingConfig.show !== 'object') {
        workingConfig.show = { when: workingConfig.show };
    }
    if (typeof workingConfig.show.when !== 'object') {
        workingConfig.show.when = { event: workingConfig.show.when };
    }
    if (typeof workingConfig.show.effect !== 'object') {
        workingConfig.show.effect = { type: workingConfig.show.effect };
    }
    if (typeof workingConfig.hide !== 'object') {
        workingConfig.hide = { when: workingConfig.hide };
    }
    if (typeof workingConfig.hide.when !== 'object') {
        workingConfig.hide.when = { event: workingConfig.hide.when };
    }
    if (typeof workingConfig.hide.effect !== 'object') {
        workingConfig.hide.effect = { type: workingConfig.hide.effect };
    }
    if (typeof workingConfig.visual !== 'object') {
        workingConfig.visual = { name: workingConfig.visual };
    }
    workingConfig.visual = normalizeVisualSettings(workingConfig.visual);

    const finalConfig = mergeDeep(defaultLabelSettings, workingConfig);
    finalConfig.visual = composeVisualProperties(finalConfig, workingConfig.visual);

    if (finalConfig.position.container === false) finalConfig.position.container = document.body;
    if (finalConfig.position.target === false) finalConfig.position.target = 'element';
    if (finalConfig.show.when.target === false) finalConfig.show.when.target = 'element';
    if (finalConfig.hide.when.target === false) finalConfig.hide.when.target = 'element';

    targets.forEach(currentElement => {
        let currentIdentifier = nextAvailableIdentifier++;
        const currentObject = new FloatingLabel(currentElement, finalConfig, currentIdentifier);
        globalComponentRegistry[currentIdentifier] = currentObject;

        let existingInstances = JSON.parse(currentElement.dataset.floatingLabelInstances || '[]');
        existingInstances.push(currentIdentifier);
        currentElement.dataset.floatingLabelInstances = JSON.stringify(existingInstances);
        currentElement.dataset.floatingLabelActiveReference = currentIdentifier;

        if (finalConfig.content.prerender === false && finalConfig.show.when.event !== false && finalConfig.show.ready !== true) {
            const prerenderTarget = (finalConfig.show.when.target === 'element') ? currentElement : finalConfig.show.when.target;
            currentObject.boundPrerenderHandler = function(event) {
                const apiInstance = globalComponentRegistry[this.dataset.floatingLabelActiveReference];
                if (apiInstance) {
                    prerenderTarget.removeEventListener(finalConfig.show.when.event, apiInstance.boundPrerenderHandler);
                    apiInstance.temporaryStorage.mouseCoords = { x: event.pageX, y: event.pageY };
                    apiInstance.buildVisual();
                    apiInstance.presentVisual(event);
                }
            }.bind(prerenderTarget);
            prerenderTarget.addEventListener(finalConfig.show.when.event, currentObject.boundPrerenderHandler);
        } else {
            currentObject.temporaryStorage.mouseCoords = {
                x: currentElement.getBoundingClientRect().left + window.scrollX,
                y: currentElement.getBoundingClientRect().top + window.scrollY
            };
            currentObject.buildVisual();
        }
    });

    return targets;
}

window.floatingLabel = function(selector, parameters, directive) {
    const elements = typeof selector === 'string' ? document.querySelectorAll(selector) : (selector instanceof HTMLElement ? [selector] : selector);
    return manageFloatingLabel(elements, parameters, directive);
};