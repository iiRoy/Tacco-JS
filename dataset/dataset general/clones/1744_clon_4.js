const noOperation = () => false;

const activePresentationsRegistry = new Map();

const StylePrefixer = (function() {
    const testElementStyle = document.createElement('div').style;
    const commonPrefixes = ['webkit', 'moz', 'o', 'ms', 'khtml'];
    const prefixCache = new Map();

    function resolvePrefix(property) {
        if (prefixCache.has(property)) {
            return prefixCache.get(property);
        }

        const capitalizedProperty = property.charAt(0).toUpperCase() + property.slice(1);
        const candidates = [property, ...commonPrefixes.map(p => p + capitalizedProperty)];

        for (const candidate of candidates) {
            if (testElementStyle[candidate] !== undefined) {
                prefixCache.set(property, candidate);
                return candidate;
            }
        }
        prefixCache.set(property, null);
        return null;
    }
    return { resolve: resolvePrefix };
})();

const TransformComposer = {
    translate3d: (coords) => `translate3d(${coords.x || 0}px, ${coords.y || 0}px, ${coords.z || 0}px)`,
    rotateXYZ: (angles, orderReversed = false) => {
        const xRot = `rotateX(${angles.x || 0}deg)`;
        const yRot = `rotateY(${angles.y || 0}deg)`;
        const zRot = `rotateZ(${angles.z || 0}deg)`;
        return orderReversed ? `${zRot} ${yRot} ${xRot}` : `${xRot} ${yRot} ${zRot}`;
    },
    scaleFactor: (factor) => `scale(${factor})`,
    viewPerspective: (depth) => `perspective(${depth}px)`,
    combineAll: ({ translation, rotation, scaling, perspectiveValue, rotationOrderReversed }) => {
        let parts = [];
        if (perspectiveValue !== undefined) parts.push(TransformComposer.viewPerspective(perspectiveValue));
        if (translation) parts.push(TransformComposer.translate3d(translation));
        if (rotation) parts.push(TransformComposer.rotateXYZ(rotation, rotationOrderReversed));
        if (scaling !== undefined) parts.push(TransformComposer.scaleFactor(scaling));
        return parts.join(' ');
    }
};

const EnvironmentCapabilityChecker = (function() {
    const isCapable =
        CSS.supports('transform-style', 'preserve-3d') &&
        (typeof document.body.classList !== 'undefined') &&
        (typeof document.body.dataset !== 'undefined') &&
        !/(iphone|ipod|android|blackberry|iemobile|opera mini|windows phone)/i.test(navigator.userAgent);

    return {
        checkSupport: () => isCapable
    };
})();

class ScenePresenter {
    #containerElement;
    #displaySurface;
    #sceneItemRecords = new Map();
    #activeSceneItem = null;
    #currentViewTransform = null;
    #allSceneItems = [];
    #presentationConfiguration = null;
    #currentViewportScale = null;
    #isPresentationInitialized = false;
    #externalTransformMonitor = null;
    #lastProcessedScene = null;
    #eventCooldownTimer = null;

    constructor(hostIdentifier) {
        this.#containerElement = document.getElementById(hostIdentifier || "presentation-root");
        if (!this.#containerElement) {
            return;
        }
    }

    #toArray(collection) {
        return Array.from(collection);
    }

    #applyStyles(element, styleProps) {
        for (const [key, value] of Object.entries(styleProps)) {
            const prefixedKey = StylePrefixer.resolve(key);
            if (prefixedKey !== null) {
                element.style[prefixedKey] = value;
            }
        }
    }

    #normalizeToNumber(value, fallback = 0) {
        const num = parseFloat(value);
        return isNaN(num) ? fallback : num;
    }

    #dispatchComponentEvent(element, eventType, detailData) {
        const evt = new CustomEvent(eventType, {
            bubbles: true,
            cancelable: true,
            detail: detailData
        });
        element.dispatchEvent(evt);
    }

    #retrieveIdFromUrlFragment() {
        return window.location.hash.replace(/^#\/?/, "");
    }

    #calculateCurrentViewportScale(configObj) {
        const heightRatio = window.innerHeight / configObj.height;
        const widthRatio = window.innerWidth / configObj.width;
        let scaleVal = Math.min(heightRatio, widthRatio);

        if (configObj.maximumScale && scaleVal > configObj.maximumScale) {
            scaleVal = configObj.maximumScale;
        }
        if (configObj.minimumScale && scaleVal < configObj.minimumScale) {
            scaleVal = configObj.minimumScale;
        }
        return scaleVal;
    }

    #prepareComponentNode = (nodeElement, nodeIndex) => {
        const nodeData = nodeElement.dataset;
        const componentRecord = {
            translation: {
                x: this.#normalizeToNumber(nodeData.x),
                y: this.#normalizeToNumber(nodeData.y),
                z: this.#normalizeToNumber(nodeData.z)
            },
            rotation: {
                x: this.#normalizeToNumber(nodeData.rotateX),
                y: this.#normalizeToNumber(nodeData.rotateY),
                z: this.#normalizeToNumber(nodeData.rotateZ || nodeData.rotate)
            },
            scaling: this.#normalizeToNumber(nodeData.scale, 1),
            element: nodeElement
        };

        if (!nodeElement.id) {
            nodeElement.id = `component-${nodeIndex + 1}`;
        }

        this.#sceneItemRecords.set(`scene-${nodeElement.id}`, componentRecord);

        this.#applyStyles(nodeElement, {
            position: "absolute",
            transform: `translate(-50%,-50%) ${TransformComposer.combineAll({
                translation: componentRecord.translation,
                rotation: componentRecord.rotation,
                scaling: componentRecord.scaling
            })}`,
            transformStyle: "preserve-3d"
        });
    }

    #handleComponentEntry = (componentNode) => {
        if (this.#lastProcessedScene !== componentNode) {
            this.#dispatchComponentEvent(componentNode, "scene:entered");
            this.#lastProcessedScene = componentNode;
        }
    }

    #handleComponentExit = (componentNode) => {
        if (this.#lastProcessedScene === componentNode) {
            this.#dispatchComponentEvent(componentNode, "scene:exited");
            this.#lastProcessedScene = null;
        }
    }

    #retrieveComponentNode = (identifier) => {
        let componentElement = null;
        if (typeof identifier === "number") {
            componentElement = identifier < 0 ? this.#allSceneItems[this.#allSceneItems.length + identifier] : this.#allSceneItems[identifier];
        } else if (typeof identifier === "string") {
            componentElement = document.getElementById(identifier);
        }
        return (componentElement && componentElement.id && this.#sceneItemRecords.has(`scene-${componentElement.id}`)) ? componentElement : null;
    }

    // Public API methods
    setupPresentation() {
        if (this.#isPresentationInitialized) { return; }

        const viewportMeta = document.querySelector("meta[name='viewport']") || document.createElement("meta");
        viewportMeta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
        if (viewportMeta.parentNode !== document.head) {
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }

        const rootDataset = this.#containerElement.dataset;
        this.#presentationConfiguration = {
            width: this.#normalizeToNumber(rootDataset.width, 1024),
            height: this.#normalizeToNumber(rootDataset.height, 768),
            maximumScale: this.#normalizeToNumber(rootDataset.maxscale, 1),
            minimumScale: this.#normalizeToNumber(rootDataset.minscale, 0),
            viewingPerspective: this.#normalizeToNumber(rootDataset.perspective, 1000),
            transitionDurationMs: this.#normalizeToNumber(rootDataset.transitionduration, 1000)
        };

        this.#currentViewportScale = this.#calculateCurrentViewportScale(this.#presentationConfiguration);

        this.#displaySurface = document.createElement("div");
        this.#displaySurface.className = "display-canvas";

        this.#toArray(this.#containerElement.children).forEach(child => {
            this.#displaySurface.appendChild(child);
        });
        this.#containerElement.appendChild(this.#displaySurface);

        document.documentElement.style.height = "100%";
        this.#applyStyles(document.body, {
            height: "100%",
            overflow: "hidden"
        });

        const commonTransformStyles = {
            position: "absolute",
            transformOrigin: "top left",
            transition: "all 0s ease-in-out",
            transformStyle: "preserve-3d"
        };

        this.#applyStyles(this.#containerElement, commonTransformStyles);
        this.#applyStyles(this.#containerElement, {
            top: "50%",
            left: "50%",
            transform: TransformComposer.combineAll({
                perspectiveValue: this.#presentationConfiguration.viewingPerspective / this.#currentViewportScale,
                scaling: this.#currentViewportScale
            })
        });
        this.#applyStyles(this.#displaySurface, commonTransformStyles);

        document.body.classList.remove("presentation-disabled");
        document.body.classList.add("presentation-active");

        this.#allSceneItems = this.#toArray(this.#containerElement.querySelectorAll(".scene-item"));
        this.#allSceneItems.forEach(this.#prepareComponentNode);

        this.#currentViewTransform = {
            translation: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scaling: 1
        };

        this.#isPresentationInitialized = true;
        this.#dispatchComponentEvent(this.#containerElement, "presentation:initialized", { api: this });
    }

    transitionToScene(target, durationOverride) {
        if (!this.#isPresentationInitialized) { return false; }

        const targetNode = this.#retrieveComponentNode(target);
        if (!targetNode) { return false; }

        window.scroll(0, 0);

        const targetSceneRecord = this.#sceneItemRecords.get(`scene-${targetNode.id}`);

        if (this.#activeSceneItem) {
            this.#activeSceneItem.classList.remove("current-active");
            document.body.classList.remove(`on-scene-${this.#activeSceneItem.id}`);
            this.#handleComponentExit(this.#activeSceneItem);
        }
        targetNode.classList.add("current-active");
        document.body.classList.add(`on-scene-${targetNode.id}`);
        this.#activeSceneItem = targetNode;

        const inverseTargetTransform = {
            rotation: {
                x: -targetSceneRecord.rotation.x,
                y: -targetSceneRecord.rotation.y,
                z: -targetSceneRecord.rotation.z
            },
            translation: {
                x: -targetSceneRecord.translation.x,
                y: -targetSceneRecord.translation.y,
                z: -targetSceneRecord.translation.z
            },
            scaling: 1 / targetSceneRecord.scaling
        };

        if (this.#externalTransformMonitor) {
            this.#externalTransformMonitor({
                scaling: targetSceneRecord.scaling,
                rotation: targetSceneRecord.rotation,
                translation: targetSceneRecord.translation
            });
        }

        const isZoomingIn = inverseTargetTransform.scaling >= this.#currentViewTransform.scaling;
        const actualDuration = this.#normalizeToNumber(durationOverride, this.#presentationConfiguration.transitionDurationMs);
        const halfDuration = actualDuration / 2;

        if (targetNode === this.#activeSceneItem) { // Re-selected same slide, recompute scale
            this.#currentViewportScale = this.#calculateCurrentViewportScale(this.#presentationConfiguration);
        }

        const rootTransitionDelay = isZoomingIn ? halfDuration : 0;
        const canvasTransitionDelay = isZoomingIn ? 0 : halfDuration;

        this.#applyStyles(this.#containerElement, {
            transitionDuration: `${actualDuration}ms`,
            transitionDelay: `${rootTransitionDelay}ms`,
            transform: TransformComposer.combineAll({
                perspectiveValue: this.#presentationConfiguration.viewingPerspective / this.#currentViewportScale,
                scaling: this.#currentViewportScale
            })
        });

        this.#applyStyles(this.#displaySurface, {
            transitionDuration: `${actualDuration}ms`,
            transitionDelay: `${canvasTransitionDelay}ms`,
            transform: TransformComposer.combineAll({
                translation: inverseTargetTransform.translation,
                rotation: inverseTargetTransform.rotation,
                scaling: inverseTargetTransform.scaling
            })
        });

        this.#currentViewTransform = inverseTargetTransform;

        clearTimeout(this.#eventCooldownTimer);
        this.#eventCooldownTimer = setTimeout(() => {
            this.#handleComponentEntry(targetNode);
        }, actualDuration + rootTransitionDelay + 100);
    }

    monitorTransforms(callback) {
        this.#externalTransformMonitor = callback;
    }

    nextComponent() {
        const currentIndex = this.#allSceneItems.indexOf(this.#activeSceneItem);
        const nextIndex = (currentIndex + 1) % this.#allSceneItems.length;
        this.transitionToScene(nextIndex);
    }

    previousComponent() {
        const currentIndex = this.#allSceneItems.indexOf(this.#activeSceneItem);
        const prevIndex = (currentIndex - 1 + this.#allSceneItems.length) % this.#allSceneItems.length;
        this.transitionToScene(prevIndex);
    }
}

function createPresentationInstance(identifier) {
    if (!EnvironmentCapabilityChecker.checkSupport()) {
        document.body.className += " presentation-not-supported ";
        return {
            setupPresentation: noOperation,
            transitionToScene: noOperation,
            nextComponent: noOperation,
            previousComponent: noOperation,
            monitorTransforms: noOperation
        };
    } else {
        document.body.classList.remove("presentation-not-supported");
    }

    const instanceKey = `presenter-${identifier || "presentation-root"}`;
    if (activePresentationsRegistry.has(instanceKey)) {
        return activePresentationsRegistry.get(instanceKey);
    }

    const newPresenter = new ScenePresenter(identifier);
    if (!newPresenter.#containerElement) {
        return {
            setupPresentation: noOperation,
            transitionToScene: noOperation,
            nextComponent: noOperation,
            previousComponent: noOperation,
            monitorTransforms: noOperation
        };
    }
    activePresentationsRegistry.set(instanceKey, newPresenter);
    return newPresenter;
}

window.presentationFactory = createPresentationInstance;

document.addEventListener('DOMContentLoaded', () => {
    const defaultInstance = createPresentationInstance("presentation-root");
    if (defaultInstance.setupPresentation !== noOperation) {
        defaultInstance.setupPresentation();
        const initialTargetId = defaultInstance.#retrieveIdFromUrlFragment();
        if (initialTargetId) {
            defaultInstance.transitionToScene(initialTargetId);
        } else if (defaultInstance.#allSceneItems.length > 0) {
            defaultInstance.transitionToScene(0);
        }
    }
});

window.addEventListener("resize", () => {
    activePresentationsRegistry.forEach(presenter => {
        if (presenter.#isPresentationInitialized) {
            presenter.#currentViewportScale = presenter.#calculateCurrentViewportScale(presenter.#presentationConfiguration);
            presenter.#applyStyles(presenter.#containerElement, {
                transform: TransformComposer.combineAll({
                    perspectiveValue: presenter.#presentationConfiguration.viewingPerspective / presenter.#currentViewportScale,
                    scaling: presenter.#currentViewportScale
                })
            });
            if (presenter.#activeSceneItem) {
                const targetSceneRecord = presenter.#sceneItemRecords.get(`scene-${presenter.#activeSceneItem.id}`);
                const inverseTargetTransform = {
                    rotation: {
                        x: -targetSceneRecord.rotation.x,
                        y: -targetSceneRecord.rotation.y,
                        z: -targetSceneRecord.rotation.z
                    },
                    translation: {
                        x: -targetSceneRecord.translation.x,
                        y: -targetSceneRecord.translation.y,
                        z: -targetSceneRecord.translation.z
                    },
                    scaling: 1 / targetSceneRecord.scaling
                };
                presenter.#applyStyles(presenter.#displaySurface, {
                    transform: TransformComposer.combineAll({
                        translation: inverseTargetTransform.translation,
                        rotation: inverseTargetTransform.rotation,
                        scaling: inverseTargetTransform.scaling
                    })
                });
            }
        }
    });
});

window.addEventListener("hashchange", () => {
    activePresentationsRegistry.forEach(presenter => {
        if (presenter.#isPresentationInitialized) {
            const potentialTargetId = presenter.#retrieveIdFromUrlFragment();
            if (potentialTargetId) {
                presenter.transitionToScene(potentialTargetId);
            }
        }
    });
});

document.addEventListener("keydown", (event) => {
    for (const presenter of activePresentationsRegistry.values()) {
        if (presenter.#isPresentationInitialized) {
            let handled = false;
            switch (event.key) {
                case " ":
                case "ArrowRight":
                case "PageDown":
                case "ArrowDown":
                    presenter.nextComponent();
                    handled = true;
                    break;
                case "ArrowLeft":
                case "PageUp":
                case "ArrowUp":
                    presenter.previousComponent();
                    handled = true;
                    break;
                case "Home":
                    if (presenter.#allSceneItems.length > 0) {
                        presenter.transitionToScene(0);
                        handled = true;
                    }
                    break;
                case "End":
                    if (presenter.#allSceneItems.length > 0) {
                        presenter.transitionToScene(presenter.#allSceneItems.length - 1);
                        handled = true;
                    }
                    break;
            }

            if (handled) {
                event.preventDefault();
            }
        }
    }
});