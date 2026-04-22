class VisualObject {
    constructor(visualClassId = '', initialHost = null) {
        this.representation = document.createElement('div');
        if (visualClassId.startsWith('.')) {
            this.representation.className = visualClassId.substring(1);
        } else if (visualClassId) {
            this.representation.id = visualClassId;
        }

        this.childElements = [];
        this.parentReference = null;

        this.translation = { x: 0, y: 0, z: 0 };
        this.orientation = { x: 0, y: 0, z: 0 };
        this.scaling = { x: 1, y: 1, z: 1 };
        this.contentOrigin = { x: 0, y: 0 }; // Similar to Sprite3D.origin
        this.transformPivot = { x: 0, y: 0 }; // Similar to Sprite3D.transformOrigin

        this.additionalData = {};

        if (initialHost) {
            this.attachTo(initialHost);
        }
    }

    attachTo(hostObject) {
        if (this.parentReference) {
            this.parentReference.detachChild(this);
        }
        if (hostObject instanceof VisualObject) {
            hostObject.representation.appendChild(this.representation);
            hostObject.childElements.push(this);
            this.parentReference = hostObject;
        } else if (hostObject instanceof HTMLElement) {
            hostObject.appendChild(this.representation);
            this.parentReference = null;
        }
        return this;
    }

    detachChild(childObject) {
        this.childElements = this.childElements.filter(c => c !== childObject);
        childObject.representation.remove();
        childObject.parentReference = null;
        return this;
    }

    setTranslation(x, y, z) {
        this.translation.x = x;
        this.translation.y = y;
        this.translation.z = z;
        return this;
    }

    setOrientation(x, y, z) {
        this.orientation.x = x;
        this.orientation.y = y;
        this.orientation.z = z;
        return this;
    }

    setDimensions(x, y, z) {
        this.scaling.x = x;
        this.scaling.y = y;
        this.scaling.z = z;
        return this;
    }

    setOrigin(x, y) {
        this.contentOrigin.x = x;
        this.contentOrigin.y = y;
        return this;
    }

    setPivot(x, y) {
        this.transformPivot.x = x;
        this.transformPivot.y = y;
        return this;
    }

    storeProperty(key, value) {
        this.additionalData[key] = value;
        return this;
    }

    retrieveProperty(key) {
        return this.additionalData[key];
    }

    getCoordX() { return this.translation.x; }
    getCoordY() { return this.translation.y; }
    getCoordZ() { return this.translation.z; }

    getAngleY() { return this.orientation.y; }

    moveBy(dx, dy, dz) {
        this.translation.x += dx;
        this.translation.y += dy;
        this.translation.z += dz;
        return this;
    }
    rotateBy(rx, ry, rz) {
        this.orientation.x += rx;
        this.orientation.y += ry;
        this.orientation.z += rz;
        return this;
    }

    applyTransforms() {
        const transformString =
            `translate3d(${this.translation.x}px, ${this.translation.y}px, ${this.translation.z}px) ` +
            `rotateX(${this.orientation.x}deg) ` +
            `rotateY(${this.orientation.y}deg) ` +
            `rotateZ(${this.orientation.z}deg) ` +
            `scale3d(${this.scaling.x}, ${this.scaling.y}, ${this.scaling.z})`;

        this.representation.style.transform = transformString;
        this.representation.style.transformOrigin = `${this.transformPivot.x}px ${this.transformPivot.y}px`;
    }

    addEventHook(eventMap) {
        for (const eventType in eventMap) {
            this.representation.addEventListener(eventType, eventMap[eventType].bind(this), false);
        }
        return this;
    }
}

class DisplayUniverse {
    constructor(containerId = 'main-display-container') {
        this.rootElement = document.createElement('div');
        this.rootElement.id = containerId;
        document.body.appendChild(this.rootElement);
        this.currentGlobalScale = { x: 1, y: 1, z: 1 };
        this.initializePerspective();
    }

    initializePerspective() {
        this.rootElement.style.perspective = '1000px';
        this.rootElement.style.overflow = 'hidden';
        this.rootElement.style.position = 'absolute';
        this.rootElement.style.width = '100%';
        this.rootElement.style.height = '100%';
    }

    addSceneRoot(sceneElement) {
        if (sceneElement instanceof VisualObject) {
            sceneElement.attachTo(this.rootElement);
        }
        return this;
    }

    setUniverseScale(sx, sy, sz) {
        this.currentGlobalScale = { x: sx, y: sy, z: sz };
        this.rootElement.style.transform = `scale3d(${sx}, ${sy}, ${sz})`;
        return this;
    }

    applyTransforms() {
        this.rootElement.style.transform = `scale3d(${this.currentGlobalScale.x}, ${this.currentGlobalScale.y}, ${this.currentGlobalScale.z})`;
        return this;
    }
}

class InteractionHandler {
    constructor(observationTarget, dragMovementCallback, dragCompletionCallback) {
        this.observationTarget = observationTarget;
        this.isPointerActive = false;
        this.previousPointerX = 0;
        this.previousPointerY = 0;
        this.activePointerIdentifier = -1;

        this.onDragEvent = dragMovementCallback;
        this.onReleaseEvent = dragCompletionCallback;

        this.setupEventBindings();
    }

    setupEventBindings() {
        this.observationTarget.addEventListener('mousedown', this.handlePointerStart.bind(this), false);
        this.observationTarget.addEventListener('mousemove', this.handlePointerMove.bind(this), false);
        this.observationTarget.addEventListener('mouseup', this.handlePointerEnd.bind(this), false);
        this.observationTarget.addEventListener('touchstart', this.handlePointerStart.bind(this), false);
        this.observationTarget.addEventListener('touchmove', this.handlePointerMove.bind(this), false);
        this.observationTarget.addEventListener('touchend', this.handlePointerEnd.bind(this), false);
        this.observationTarget.addEventListener('touchcancel', this.handlePointerEnd.bind(this), false);
    }

    handlePointerStart(event) {
        if (!this.isPointerActive) {
            const pointer = event.changedTouches ? event.changedTouches[0] : event;
            this.previousPointerX = pointer.pageX;
            this.previousPointerY = pointer.pageY;
            this.isPointerActive = true;
            this.activePointerIdentifier = pointer.identifier || -1;
        }
        event.preventDefault();
    }

    handlePointerMove(event) {
        if (this.isPointerActive) {
            let currentPointer = null;
            if (event.changedTouches) {
                for (let i = 0; i < event.changedTouches.length; i++) {
                    if (event.changedTouches[i].identifier === this.activePointerIdentifier) {
                        currentPointer = event.changedTouches[i];
                        break;
                    }
                }
            } else {
                currentPointer = event;
            }

            if (currentPointer) {
                this.onDragEvent(currentPointer.pageX, currentPointer.pageY, this.previousPointerX, this.previousPointerY);
                this.previousPointerX = currentPointer.pageX;
                this.previousPointerY = currentPointer.pageY;
            }
        }
        event.preventDefault();
    }

    handlePointerEnd(event) {
        if (this.isPointerActive) {
            let pointerReleased = true;
            if (event.changedTouches) {
                pointerReleased = false;
                for (let i = 0; i < event.changedTouches.length; i++) {
                    if (event.changedTouches[i].identifier === this.activePointerIdentifier) {
                        pointerReleased = true;
                        break;
                    }
                }
            }

            if (pointerReleased) {
                this.isPointerActive = false;
                this.activePointerIdentifier = -1;
                this.onReleaseEvent();
            }
        }
        event.preventDefault();
    }
}


class WorldSimulator {
    constructor() {
        this.displayManager = new DisplayUniverse();
        this.mainWorldElement = new VisualObject('world-view-root');
        this.displayManager.addSceneRoot(this.mainWorldElement);

        this.currentWindowWidth = window.innerWidth;
        this.currentWindowHeight = window.innerHeight;

        this.viewTargetX = -0.17849898580121704;
        this.viewTargetY = 0.4572815533980582;
        this.viewCurrentX = this.viewTargetX;
        this.viewCurrentY = this.viewTargetY;

        this.environmentGridSize = 575;
        this.lastSelectedAnimal = null;
        this.animalHerd = [];
        this.atmosphericClouds = [];
        this.airFlowMagnitude = 2;
        this.targetAirFlowMagnitude = 2;
        this.welcomeBanner = null;
        this.worldTopSurface = null;
        this.windMachineRotor = null;

        this.interactionCoordinator = new InteractionHandler(
            document,
            this.onGlobalDragMotion.bind(this),
            this.onGlobalPointerUp.bind(this)
        );

        this.constructSceneElements();
        this.setupSystemListeners();
        this.updateViewportDimensions();
        this.initiateSimulationLoop();
    }

    setupSystemListeners() {
        window.addEventListener('resize', this.updateViewportDimensions.bind(this), false);
        window.addEventListener('orientationchange', this.handleDeviceOrientation.bind(this), false);
    }

    updateViewportDimensions() {
        this.currentWindowWidth = window.innerWidth;
        this.currentWindowHeight = window.innerHeight;
        const scaleFactor = Math.min(this.currentWindowWidth, this.currentWindowHeight) / 768.0;
        this.displayManager.setUniverseScale(scaleFactor, scaleFactor, scaleFactor).applyTransforms();
    }

    handleDeviceOrientation() {
        window.scrollTo(0, 0);
    }

    onGlobalDragMotion(currentX, currentY, previousX, previousY) {
        this.welcomeBanner.representation.className = "inactive";
        const normalizedCurrentX = (currentX / this.currentWindowWidth) - 0.5;
        const normalizedCurrentY = (currentY / this.currentWindowHeight) - 0.5;
        const normalizedPreviousX = (previousX / this.currentWindowWidth) - 0.5;
        const normalizedPreviousY = (previousY / this.currentWindowHeight) - 0.5;

        this.viewTargetX -= (normalizedCurrentX - normalizedPreviousX);
        this.viewTargetY -= (normalizedCurrentY - normalizedPreviousY);

        this.viewTargetX = Math.max(-0.5, Math.min(this.viewTargetX, 0.5));
        this.viewTargetY = Math.max(-0.5, Math.min(this.viewTargetY, 0.5));
    }

    onGlobalPointerUp() {
        // No specific action for camera on release, movement is continuous.
    }

    addBoundaryPanel(panelId, xPos, yPos, rotationDegrees) {
        this.mainWorldElement.attachTo(
            new VisualObject(panelId)
                .setPivot(0, 0)
                .setTranslation(xPos, yPos, 231)
                .setOrientation(-90, rotationDegrees, 0)
                .applyTransforms()
        );
    }

    constructSceneElements() {
        this.welcomeBanner = new VisualObject('greeting-message');
        document.body.appendChild(this.welcomeBanner.representation);

        this.mainWorldElement
            .setOrigin(640, 640)
            .setTranslation(0, 200, -600)
            .setOrientation(70, 0, 0)
            .applyTransforms();

        this.worldTopSurface = new VisualObject('upper-plane');
        this.mainWorldElement.attachTo(this.worldTopSurface)
            .setTranslation(358, 362, 231)
            .applyTransforms();

        this.addBoundaryPanel('panel-alpha', 358, 937, 0);
        this.addBoundaryPanel('panel-beta', 358, 362, 270);
        this.addBoundaryPanel('panel-gamma', 933, 362, 180);
        this.addBoundaryPanel('panel-delta', 933, 937, 90);

        for (let count = 0; count < 5; count++) {
            const xPositionRatio = (Math.random() * 0.8 + 0.1);
            const isReflected = Math.random() > 0.5;
            const currentAnimal = new VisualObject(`.pasture-animal-${Math.ceil(Math.random() * 3)}`)
                .setOrigin(38, 78)
                .setPivot(38, 78)
                .setTranslation(xPositionRatio * this.environmentGridSize, (Math.random() * 0.8 + 0.1) * this.environmentGridSize, 0)
                .setOrientation(-90, (xPositionRatio - 0.5) * 45, 0)
                .storeProperty("isReflected", isReflected)
                .addEventHook({
                    'mouseover': this.onAnimalInteraction.bind(this),
                    'touchstart': this.onAnimalInteraction.bind(this)
                })
                .applyTransforms();
            this.animalHerd.push(currentAnimal);
            this.worldTopSurface.attachTo(currentAnimal);
        }

        this.worldTopSurface.attachTo(
            new VisualObject('announcement-strip')
                .setOrigin(0, 332)
                .setPivot(0, 332)
                .setTranslation(10, 60, 0)
                .setOrientation(-90, 0.4, 0)
                .applyTransforms()
        );

        this.worldTopSurface.attachTo(
            new VisualObject('celestial-body')
                .setOrigin(125, 750 - 136)
                .setPivot(125, 750 - 136)
                .setTranslation(this.environmentGridSize * 0.92, -250, 360)
                .setOrientation(-90, -2, 0)
                .addEventHook({
                    'mouseover': this.onCelestialBodyInteraction.bind(this),
                    'touchstart': this.onCelestialBodyInteraction.bind(this)
                })
                .applyTransforms()
        );

        for (let count = 0; count < 7; count++) {
            const cloudYCoordinate = (Math.random() * 1.4 - 0.4) * this.environmentGridSize;
            const cloudZCoordinate = Math.random() * 190 + 300;
            const currentCloud = new VisualObject(`.sky-formation-${Math.ceil(Math.random() * 3)}`)
                .setPivot(62, 750 - 40)
                .setOrigin(62, 750 - 40)
                .setTranslation((Math.random() * 1.4 - 0.2) * this.environmentGridSize, cloudYCoordinate, cloudZCoordinate)
                .setOrientation(-90, -Math.random() * 10 - 5, 0)
                .storeProperty("targetYCoordinate", cloudYCoordinate)
                .storeProperty("targetZCoordinate", cloudZCoordinate)
                .applyTransforms();
            this.atmosphericClouds.push(currentCloud);
            this.worldTopSurface.attachTo(currentCloud);
        }

        const windTower = new VisualObject('wind-tower')
            .setOrigin(60, 201)
            .setPivot(60, 201)
            .setTranslation(90, 380, 0)
            .setOrientation(-90, 20, 0)
            .applyTransforms();
        this.worldTopSurface.attachTo(windTower);

        this.windMachineRotor = new VisualObject('rotor-blades');
        windTower.attachTo(this.windMachineRotor)
            .setOrigin(89, 93)
            .setPivot(89, 93)
            .setTranslation(60, 80, 5)
            .addEventHook({
                'mousedown': this.onRotorActivation.bind(this),
                'touchstart': this.onRotorActivation.bind(this)
            })
            .applyTransforms();

        this.worldTopSurface.attachTo(
            new VisualObject('flying-saucer')
                .setPivot(61, 0)
                .setOrigin(61, 750 - 50)
                .setTranslation(this.environmentGridSize >> 1, this.environmentGridSize >> 1, 800)
                .setOrientation(-90, -2, 0)
                .applyTransforms()
        );
    }

    onAnimalInteraction(event) {
        const animal = this;
        if (this.lastSelectedAnimal && this.lastSelectedAnimal !== animal) {
            this.lastSelectedAnimal
                .setDimensions(this.lastSelectedAnimal.retrieveProperty("isReflected") ? -1 : 1, 1, 1)
                .applyTransforms();
        }
        this.lastSelectedAnimal = animal;

        const newX = animal.getCoordX() + (Math.round(Math.random()) * 2 - 1) * 50;
        const newY = animal.getCoordY() + (Math.round(Math.random()) * 2 - 1) * 50;
        const currentReflected = animal.retrieveProperty("isReflected");

        const clampedX = Math.max(50, Math.min(newX, this.environmentGridSize - 50));
        const clampedY = Math.max(80, Math.min(newY, this.environmentGridSize - 50));

        animal
            .setTranslation(clampedX, clampedY, 0)
            .setOrientation(-90, (clampedX / this.environmentGridSize - 0.5) * 45, 0)
            .storeProperty("isReflected", currentReflected)
            .applyTransforms();

        event.preventDefault();
        event.stopImmediatePropagation();
    }

    onCelestialBodyInteraction(event) {
        const body = this;
        body
            .setTranslation(this.environmentGridSize * Math.random(), -250, 360)
            .rotateBy(0, 180, 0)
            .applyTransforms();
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    onRotorActivation(event) {
        if (this.targetAirFlowMagnitude === 0) {
            this.targetAirFlowMagnitude = 1 + Math.random() * 7;
        } else {
            this.targetAirFlowMagnitude = 0;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    initiateSimulationLoop() {
        let previousFrameTime = performance.now();
        const frameUpdate = (currentTime) => {
            // const timeDelta = currentTime - previousFrameTime; // Not used in original, but good practice
            previousFrameTime = currentTime;
            this.updateWorldState();
            requestAnimationFrame(frameUpdate);
        };
        requestAnimationFrame(frameUpdate);
    }

    updateWorldState() {
        this.viewCurrentX += (this.viewTargetX - this.viewCurrentX) * 0.1;
        this.viewCurrentY += (this.viewTargetY - this.viewCurrentY) * 0.1;
        this.mainWorldElement
            .setTranslation(this.viewCurrentX * 100, 230 + this.viewCurrentY * 50, -this.viewCurrentY * 600 - 150)
            .setOrientation(70 + this.viewCurrentY * 50, 0, this.viewCurrentX * 210)
            .applyTransforms();

        this.airFlowMagnitude += (this.targetAirFlowMagnitude - this.airFlowMagnitude) * 0.01;
        this.windMachineRotor.rotateBy(0, 0, this.airFlowMagnitude).applyTransforms();

        for (let i = 0; i < this.atmosphericClouds.length; i++) {
            const cloud = this.atmosphericClouds[i];
            let currentCloudX = cloud.getCoordX();
            if (currentCloudX < -290) {
                currentCloudX = -290 - currentCloudX;
                cloud.setTranslation(cloud.getCoordX(), cloud.getCoordY(), cloud.retrieveProperty("targetZCoordinate") + currentCloudX * currentCloudX * 0.1);
            } else if (currentCloudX > this.environmentGridSize + 290) {
                currentCloudX = currentCloudX - (this.environmentGridSize + 290);
                cloud.setTranslation(cloud.getCoordX(), cloud.getCoordY(), cloud.retrieveProperty("targetZCoordinate") + currentCloudX * currentCloudX * 0.1);
                if (currentCloudX > 110) {
                    cloud.storeProperty("targetYCoordinate", (Math.random() * 1.4 - 0.4) * this.environmentGridSize);
                    cloud.storeProperty("targetZCoordinate", Math.random() * 190 + 300);
                    cloud.setTranslation(-400 - Math.random() * 400, cloud.retrieveProperty("targetYCoordinate"), 3000);
                }
            }
            cloud.moveBy(this.airFlowMagnitude, 0, 0).applyTransforms();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WorldSimulator();
});