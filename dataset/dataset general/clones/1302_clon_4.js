(function() {

    const listContains = (targetList, soughtItem) => targetList.indexOf(soughtItem) !== -1;

    const createDomItemRef = (identifier) => {
        const domRef = document.getElementById(identifier);
        if (!domRef) {
            console.warn(`Element with ID "${identifier}" not found.`);
            return null;
        }

        const dataAttrCollection = {};
        for (const { name, value } of Array.from(domRef.attributes)) {
            if (name.startsWith('data-')) {
                const propName = name.substring(5);
                dataAttrCollection[propName] = parseFloat(value) || value;
            }
        }

        const defaults = {
            opacity: 1, x: 0, y: 0, z: 0,
            scaleX: 1, scaleY: 1, scaleZ: 1,
            rotate: 0, rotateX: 0, rotateY: 0, rotateZ: 0,
            scale: 1
        };

        return Object.freeze({
            visualNode: domRef,
            currentVisualProps: { ...defaults, ...dataAttrCollection }
        });
    };

    const makeMotionCalc = (associatedTransition, transformFunc) => {
        const calculator = Object.freeze({
            performFrameCalculation: (currentKey) => {
                const rate = associatedTransition.getRateAtFrame(currentKey);
                return transformFunc(rate);
            },
            isMotionCalculator: true
        });
        return calculator;
    };

    const createTransitionConfig = (initialSettings = {}) => {
        let internalConfig = {
            transformProperty: null,
            animEquation: typeof Easie !== 'undefined' ? Easie.linearNone : (t,b,c,d) => b + c * (t/d), // Default if Easie not found
            beginFrame: 0,
            endFrame: 100,
            unitSuffix: "px",
            startCoord: null,
            endCoord: null,
            amplitudeValue: null,
            periodValue: null,
            lastCalculatedValue: null,
            lastComputedFrame: -1,
            frameRate: 0
        };

        internalConfig = { ...internalConfig, ...initialSettings };

        const setters = {
            setPropName: (prop) => { internalConfig.transformProperty = prop; return setters; },
            setFinalPoint: (point) => { internalConfig.endCoord = parseFloat(point); return setters; },
            setInitialPoint: (point) => { internalConfig.startCoord = parseFloat(point); return setters; },
            setMeasurementUnit: (units) => { internalConfig.unitSuffix = units; return setters; },
            setEasingFunction: (equation) => { internalConfig.animEquation = equation; return setters; },
            setWaveAmplitude: (amp) => { internalConfig.amplitudeValue = amp; return setters; },
            setWavePeriod: (per) => { internalConfig.periodValue = per; return setters; },
            setStartingFrame: (frame) => { internalConfig.beginFrame = frame; return setters; },
            setEndingFrame: (frame) => { internalConfig.endFrame = frame; return setters; }
        };

        const getElementPropValue = (elementRef, propName) => {
            return elementRef.currentVisualProps[propName];
        };

        const calculatePointForFrame = (framePoint, domAccessor) => {
            let actualStart = internalConfig.startCoord !== null ? internalConfig.startCoord : getElementPropValue(domAccessor, internalConfig.transformProperty);
            let actualEnd = internalConfig.endCoord !== null ? internalConfig.endCoord : getElementPropValue(domAccessor, internalConfig.transformProperty);

            let adjustedFrame = framePoint;
            if (framePoint < internalConfig.beginFrame) {
                adjustedFrame = internalConfig.beginFrame;
            } else if (framePoint > internalConfig.endFrame) {
                adjustedFrame = internalConfig.endFrame;
            }

            let resultValue;
            const timeElapsed = adjustedFrame - internalConfig.beginFrame;
            const totalDuration = internalConfig.endFrame - internalConfig.beginFrame;
            const changeInValue = actualEnd - actualStart;

            if (internalConfig.periodValue !== null || internalConfig.amplitudeValue !== null) {
                resultValue = internalConfig.animEquation(timeElapsed, actualStart, changeInValue, totalDuration, internalConfig.amplitudeValue, internalConfig.periodValue);
            } else {
                resultValue = internalConfig.animEquation(timeElapsed, actualStart, changeInValue, totalDuration);
            }
            return resultValue;
        };

        const coreMethods = {
            ...setters,

            getRateAtFrame: (framePoint) => {
                if (framePoint === internalConfig.lastComputedFrame && framePoint !== 0 && framePoint !== 100) {
                    return internalConfig.frameRate;
                }
                return 0;
            },

            isRateBased: () => internalConfig.animEquation && internalConfig.animEquation.isMotionCalculator,
            
            getValueForFrame: (framePoint, domAccessor) => {
                if (internalConfig.lastComputedFrame !== framePoint) {
                    internalConfig.lastComputedFrame = framePoint;
                    let currentResult;
                    if (coreMethods.isRateBased()) {
                        currentResult = internalConfig.animEquation.performFrameCalculation(framePoint);
                    } else {
                        currentResult = calculatePointForFrame(framePoint, domAccessor);
                    }
                    internalConfig.frameRate = Math.abs(currentResult - (internalConfig.lastCalculatedValue || currentResult));
                    internalConfig.lastCalculatedValue = currentResult;
                }
                return internalConfig.lastCalculatedValue;
            },

            getUnitString: () => internalConfig.unitSuffix,
            getPropIdentifier: () => internalConfig.transformProperty
        };

        return coreMethods;
    };

    const StyleConstants = Object.freeze({
        ROTATION_KEY: "rotate",
        SCALING_KEY: "scale",
        TRANSLATION_KEYS: ["x", "y", "z"],
        PRECISE_SCALING_KEYS: ["scaleX", "scaleY", "scaleZ"],
        PRECISE_ROTATION_KEYS: ["rotateX", "rotateY", "rotateZ"],
        ALL_TRANSFORM_KEYS: ["x", "y", "z", "scale", "rotate", "scaleX", "scaleY", "scaleZ", "rotateX", "rotateY", "rotateZ"],
        DIMENSION_UNITS_KEYS: ["height", "width"]
    });

    const createElementAnimator = () => {
        const activeTransitions = new Map();
        let boundDomAccessor = null;
        let currentAnimationFrame = 0;
        let usingRateCalculations = false;

        const queryPropPresence = (propList) => {
            for (const p of propList) {
                if (activeTransitions.has(p)) return true;
            }
            return false;
        };

        const getComputedValue = (propName) => {
            const transition = activeTransitions.get(propName);
            if (transition && !(transition.isRateBased() && !usingRateCalculations)) {
                return transition.getValueForFrame(currentAnimationFrame, boundDomAccessor);
            }
            return null;
        };

        const generateTransformString = () => {
            let transformAccumulator = "";
            const transformSupport3D = typeof BrowserUtility !== 'undefined' && BrowserUtility.has3DTransforms();
            const transformSupport2D = typeof BrowserUtility !== 'undefined' && BrowserUtility.has2DTransforms();

            if (queryPropPresence(StyleConstants.ALL_TRANSFORM_KEYS) && boundDomAccessor && currentAnimationFrame !== null) {
                if (transformSupport3D) {
                    if (queryPropPresence(StyleConstants.TRANSLATION_KEYS)) {
                        transformAccumulator += `translate3d(${getComputedValue("x") || 0}px,${getComputedValue("y") || 0}px,${getComputedValue("z") || 0}px)`;
                    }
                    if (queryPropPresence(StyleConstants.PRECISE_SCALING_KEYS)) {
                        transformAccumulator += `scale3d(${getComputedValue("scaleX") || 1},${getComputedValue("scaleY") || 1},${getComputedValue("scaleZ") || 0})`;
                    } else if (activeTransitions.has(StyleConstants.SCALING_KEY)) {
                        transformAccumulator += `scale3d(${getComputedValue("scale") || 1},${getComputedValue("scale") || 1},${getComputedValue("scale") || 0})`;
                    }
                    if (queryPropPresence(StyleConstants.PRECISE_ROTATION_KEYS)) {
                        transformAccumulator += `rotate3d(${getComputedValue("rotateX") || 0},${getComputedValue("rotateY") || 0},${getComputedValue("rotateZ") || 0},${getComputedValue("rotate") || 0}deg)`;
                    } else if (activeTransitions.has(StyleConstants.ROTATION_KEY)) {
                        transformAccumulator += `rotate(${getComputedValue("rotate") || 0}deg)`;
                    }
                } else if (transformSupport2D) {
                    if (queryPropPresence(StyleConstants.TRANSLATION_KEYS)) {
                        transformAccumulator += `translate(${getComputedValue("x") || 0}px,${getComputedValue("y") || 0}px)`;
                    }
                    if (activeTransitions.has(StyleConstants.SCALING_KEY)) {
                        transformAccumulator += `scale(${getComputedValue("scale") || 1},${getComputedValue("scale") || 1})`;
                    }
                    if (activeTransitions.has(StyleConstants.ROTATION_KEY)) {
                        transformAccumulator += `rotate(${getComputedValue("rotate") || 0}deg)`;
                    }
                }
            }
            return transformAccumulator || null;
        };

        return Object.freeze({
            associateElement: (domAccessor) => { boundDomAccessor = domAccessor; },
            setFrameIndex: (frame) => { currentAnimationFrame = frame; },
            enableRateCalculations: (enable) => { usingRateCalculations = enable; },

            getTransitionBuilder: (propName) => {
                if (!activeTransitions.has(propName)) {
                    activeTransitions.set(propName, createTransitionConfig().setPropName(propName));
                }
                return activeTransitions.get(propName);
            },

            createRateDrivenMotion: (propName, eqFunc) => {
                const existingTransition = activeTransitions.get(propName);
                if (!existingTransition) {
                    console.error(`Cannot create rate-driven motion for non-existent property: ${propName}`);
                    return null;
                }
                const motionCalc = makeMotionCalc(existingTransition, eqFunc);
                existingTransition.setEasingFunction(motionCalc);
                return motionCalc;
            },

            getStyleBlock: (frameIndex) => {
                currentAnimationFrame = frameIndex;
                let styleText = "";

                if (activeTransitions.size > 0) {
                    for (const [prop, transition] of activeTransitions.entries()) {
                        let generateRule = true;
                        let units = "";

                        if (listContains(StyleConstants.ALL_TRANSFORM_KEYS, prop)) generateRule = false;
                        if (listContains(StyleConstants.DIMENSION_UNITS_KEYS, prop)) units = transition.getUnitString();

                        const val = transition.getValueForFrame(currentAnimationFrame, boundDomAccessor);
                        if (generateRule) {
                            styleText += `${prop}: ${val}${units};`;
                        }
                    }
                }

                const transformSupport = typeof BrowserUtility !== 'undefined' && (BrowserUtility.has2DTransforms() || BrowserUtility.has3DTransforms());
                const browserPrefix = typeof BrowserUtility !== 'undefined' ? BrowserUtility.getBrowserPrefix() : '';

                if (!transformSupport) {
                    const xVal = getComputedValue("x");
                    const yVal = getComputedValue("y");
                    if (xVal !== null) styleText += `left:${xVal}px;`;
                    if (yVal !== null) styleText += `top:${yVal}px;`;
                } else {
                    const generatedTransform = generateTransformString();
                    if (generatedTransform !== null) {
                        styleText += `-${browserPrefix}-transform: ${generatedTransform};`;
                    }
                }
                return styleText;
            },

            getPropertyValue: (propName) => getComputedValue(propName),
            getAssociatedTransitions: () => activeTransitions,
            getGeneratedTransformString: generateTransformString
        });
    };

    const BrowserUtility = (() => {
        let _prefix = '';
        let _has3D = false;
        let _has2D = false;
        let _animationNameProp = '';
        let _animationDelayProp = '';
        let _animationDurationProp = '';
        let _animationIterationProp = '';
        let _animationEndEvent = '';
        let _transformProp = '';
        let _styleSheet = null;

        const detectCapabilities = (force2D = false) => {
            if (_prefix) return;

            const tempDiv = document.createElement('div');
            const style = tempDiv.style;
            const prefixes = ['webkit', 'moz', 'ms', 'o', ''];

            for (const p of prefixes) {
                const testTransform = p ? `${p}Transform` : 'transform';
                if (style[testTransform] !== undefined) {
                    _prefix = p;
                    _transformProp = testTransform;
                    if (!force2D && (style[`${p}Perspective`] !== undefined || style['perspective'] !== undefined)) {
                        _has3D = true;
                    }
                    _has2D = true;
                    
                    _animationNameProp = p ? `${p}AnimationName` : 'animationName';
                    _animationDelayProp = p ? `${p}AnimationDelay` : 'animationDelay';
                    _animationDurationProp = p ? `${p}AnimationDuration` : 'animationDuration';
                    _animationIterationProp = p ? `${p}AnimationIterationCount` : 'animationIterationCount';
                    _animationEndEvent = p ? `${p}AnimationEnd` : 'animationend';
                    break;
                }
            }

            _styleSheet = document.getElementById('animation-rules-sheet');
            if (!_styleSheet) {
                _styleSheet = document.createElement('style');
                _styleSheet.id = 'animation-rules-sheet';
                document.head.appendChild(_styleSheet);
            }
            _styleSheet = _styleSheet.sheet;
        };

        return Object.freeze({
            initialize: detectCapabilities,
            getBrowserPrefix: () => _prefix,
            has3DTransforms: () => _has3D,
            has2DTransforms: () => _has2D,
            getAnimationNameProperty: () => _animationNameProp,
            getAnimationDelayProperty: () => _animationDelayProp,
            getAnimationDurationProperty: () => _animationDurationProp,
            getAnimationIterationProperty: () => _animationIterationProp,
            getAnimationEndEvent: () => _animationEndEvent,
            getTransformProperty: () => _transformProp,
            getStylesheet: () => _styleSheet
        });
    })();

    let globalAnimationCounter = 0;
    const getUniqueAnimationIdentifier = () => `anim_${++globalAnimationCounter}_${Date.now()}`;

    const createFlowEngine = (config = {}) => {
        BrowserUtility.initialize(config.force2dSupport);

        const animationSettings = {
            ruleSheet: config.ruleSheet || BrowserUtility.getStylesheet(),
            totalFrames: config.totalFrames || 60,
            recipeFunction: config.recipeFunc || null,
            animationDelaySec: 0,
            animationDurationSec: 1,
            animationLoopCount: 1,
            completionCallback: config.onFinish || null
        };

        const managedDomItems = new Map();
        const elementAnimators = new Map();
        const animationNames = new Map();

        let lastProcessedElementId = null;

        const retrieveDomItem = (id) => {
            if (!managedDomItems.has(id)) {
                const item = createDomItemRef(id);
                if (item) managedDomItems.set(id, item);
            }
            return managedDomItems.get(id);
        };

        const retrieveElementAnimator = (id) => {
            if (!elementAnimators.has(id)) {
                const animator = createElementAnimator();
                elementAnimators.set(id, animator);
            }
            return elementAnimators.get(id);
        };

        const calculateFrameInterval = () => 100 / animationSettings.totalFrames;

        const generateAnimationKeyframes = (targetId) => {
            const currentAnimator = retrieveElementAnimator(targetId);
            const currentDomItem = retrieveDomItem(targetId);
            if (!currentAnimator || !currentDomItem) return;

            currentAnimator.associateElement(currentDomItem);
            currentAnimator.enableRateCalculations(true);

            let frameCSSCollection = "";
            for (let frameIndex = 0; frameIndex <= animationSettings.totalFrames; frameIndex++) {
                const percentage = frameIndex * calculateFrameInterval();
                let frameLabel = `${percentage}%`;
                if (frameIndex === 0) frameLabel = "from";
                else if (frameIndex === animationSettings.totalFrames) frameLabel = "to";

                currentAnimator.setFrameIndex(percentage);
                frameCSSCollection += ` ${frameLabel} {${currentAnimator.getStyleBlock(percentage)}}`;
            }
            currentAnimator.enableRateCalculations(false);

            const animationIdentifier = getUniqueAnimationIdentifier();
            animationNames.set(targetId, animationIdentifier);

            const keyframeRule = `@-${BrowserUtility.getBrowserPrefix()}-keyframes ${animationIdentifier} {${frameCSSCollection}}`;
            
            const stylesheet = animationSettings.ruleSheet;
            if (stylesheet && typeof stylesheet.insertRule === 'function') {
                const ruleIndex = stylesheet.cssRules ? stylesheet.cssRules.length : 0;
                stylesheet.insertRule(keyframeRule, ruleIndex);
            } else {
                console.error("Stylesheet not found or cannot insert rules.");
            }
        };

        const attachAnimationToElement = (domItem) => {
            const elementId = domItem.visualNode.id;
            const animationId = animationNames.get(elementId);
            if (!animationId) return;

            const nodeStyle = domItem.visualNode.style;
            nodeStyle[BrowserUtility.getAnimationNameProperty()] = animationId;
            nodeStyle[BrowserUtility.getAnimationDelayProperty()] = `${animationSettings.animationDelaySec}s`;
            nodeStyle[BrowserUtility.getAnimationDurationProperty()] = `${animationSettings.animationDurationSec}s`;
            nodeStyle[BrowserUtility.getAnimationIterationProperty()] = animationSettings.animationLoopCount;

            const finishHandler = (event) => {
                if (event.target === domItem.visualNode) {
                    domItem.visualNode.removeEventListener(BrowserUtility.getAnimationEndEvent(), finishHandler);
                    applyFinalStyles(animationSettings.totalFrames, domItem);
                    if (animationSettings.completionCallback) {
                        animationSettings.completionCallback();
                        animationSettings.completionCallback = null;
                    }
                }
            };
            domItem.visualNode.addEventListener(BrowserUtility.getAnimationEndEvent(), finishHandler, false);
        };

        const applyFinalStyles = (frameNumber, domItem) => {
            const currentAnimator = retrieveElementAnimator(domItem.visualNode.id);
            if (!currentAnimator) return;

            const currentFramePercentage = frameNumber * calculateFrameInterval();
            currentAnimator.associateElement(domItem);
            currentAnimator.setFrameIndex(currentFramePercentage);

            const nodeStyle = domItem.visualNode.style;
            const trackedProps = new Set(domItem.visualNode.getAttribute("data-properties")?.split(',') || []);

            for (const [propName, transition] of currentAnimator.getAssociatedTransitions().entries()) {
                const value = transition.getValueForFrame(currentFramePercentage, domItem);
                nodeStyle[propName] = value;
                domItem.visualNode.setAttribute(`data-${propName}`, value);
                trackedProps.add(propName);
            }
            domItem.visualNode.setAttribute("data-properties", Array.from(trackedProps).join(','));

            const transformSupport = BrowserUtility.has2DTransforms() || BrowserUtility.has3DTransforms();
            if (!transformSupport) {
                const xVal = currentAnimator.getPropertyValue("x");
                const yVal = currentAnimator.getPropertyValue("y");
                if (xVal !== null) nodeStyle.left = `${xVal}px`;
                if (yVal !== null) nodeStyle.top = `${yVal}px`;
            } else {
                const transformValue = currentAnimator.getGeneratedTransformString();
                if (transformValue) {
                    nodeStyle[BrowserUtility.getTransformProperty()] = transformValue;
                }
            }
        };

        const publicAPI = {
            defineRecipe: (func) => { animationSettings.recipeFunction = func; return publicAPI; },
            setCompletionHandler: (handler) => { animationSettings.completionCallback = handler; return publicAPI; },
            setTotalDuration: (duration) => { animationSettings.animationDurationSec = duration; return publicAPI; },
            setInitialDelay: (delay) => { animationSettings.animationDelaySec = delay; return publicAPI; },
            setLoopCount: (count) => { animationSettings.animationLoopCount = count; return publicAPI; },
            
            activateOnNode: (elementId) => {
                lastProcessedElementId = elementId;
                const domItem = retrieveDomItem(elementId);
                if (!domItem) return publicAPI;

                const animator = retrieveElementAnimator(elementId);
                animator.associateElement(domItem);

                const initialPropsAttr = domItem.visualNode.getAttribute("data-properties");
                if (initialPropsAttr) {
                    const initialProps = initialPropsAttr.split(',');
                    for (const prop of initialProps) {
                        const dataValue = domItem.visualNode.getAttribute(`data-${prop}`);
                        // Ensure it's a number for points, but keep original for others
                        const parsedValue = parseFloat(dataValue);
                        animator.getTransitionBuilder(prop).setInitialPoint(isNaN(parsedValue) ? dataValue : parsedValue).setFinalPoint(isNaN(parsedValue) ? dataValue : parsedValue);
                    }
                }

                if (animationSettings.recipeFunction) {
                    animationSettings.recipeFunction(animator);
                }

                generateAnimationKeyframes(elementId);
                applyFinalStyles(0, domItem);
                attachAnimationToElement(domItem);
                return publicAPI;
            },

            forElement: (id) => publicAPI.activateOnNode(id),
            withDuration: (duration) => publicAPI.setTotalDuration(duration),
            withDelay: (delay) => publicAPI.setInitialDelay(delay),
            loop: (count) => publicAPI.setLoopCount(count),

            reapplyToNode: (elementId) => {
                lastProcessedElementId = elementId;
                const domItem = retrieveDomItem(elementId);
                if (domItem) {
                    attachAnimationToElement(domItem);
                }
                return publicAPI;
            }
        };

        return publicAPI;
    };

    const AnimationBuilder = Object.freeze({
        beginAnimation: (recipeFunc) => createFlowEngine({ recipeFunc: recipeFunc })
    });

    this.AnimationBuilder = AnimationBuilder;

}).call(this);