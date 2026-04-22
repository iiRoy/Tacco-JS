const visualizerSettings = Object.freeze({
    canvasWidth: 400,
    canvasHeight: 400,
    sphereRadius: 5,
    lightPulseStrength: 0.3,
    lightPulseModulation: 0.3,
    azimuthAnglesDegrees: [-80, -65, -55, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 55, 65, 80],
    azimuthAnglesRadians: [],
    pedestalHeight: 3,
    pedestalRadius: 4,
    pedestalSegments: 45,
    mainSphereRadius: 0.7,
    guideSphereRadius: 0.4,
    glowEffectC: 0.05,
    glowEffectP: 4.5,
    lineMaterialColor: 0x445566,
    lineMaterialOpacity: 0.2,
    ambientLightColor: 0x101010,
    directionalLightColor: 0xffffff,
    redLightColor: 0xff0000,
    shadowCameraDepth: 22,
    shadowMapResolution: 1024,
    cameraFOV: 60,
    cameraNear: 0.1,
    cameraFar: 1000,
    cameraZOffset: 0.55 * 10,
    cameraYOffset: 0.55 * 32,
    humanModelPath: 'malebase.obj'
});

const convertToRadians = (degrees) => degrees * Math.PI / 180.0;
visualizerSettings.azimuthAnglesRadians = visualizerSettings.azimuthAnglesDegrees.map(convertToRadians);

class SpatialDisplayEngine {
    #renderCanvas;
    #mainScene;
    #perspectiveCamera;
    #visualElements = new Map();
    #userCallbacks = new Map();

    constructor(onPointerMove, onPointerDown) {
        this.#userCallbacks.set('move', onPointerMove);
        this.#userCallbacks.set('down', onPointerDown);

        this.#renderCanvas = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.#renderCanvas.shadowMap.enabled = true;
        this.#renderCanvas.shadowMap.type = THREE.PCFSoftShadowMap;
        this.#renderCanvas.setSize(visualizerSettings.canvasWidth, visualizerSettings.canvasHeight);
        document.body.appendChild(this.#renderCanvas.domElement);

        this.#mainScene = new THREE.Scene();
        this.#perspectiveCamera = new THREE.PerspectiveCamera(
            visualizerSettings.cameraFOV,
            visualizerSettings.canvasWidth / visualizerSettings.canvasHeight,
            visualizerSettings.cameraNear,
            visualizerSettings.cameraFar
        );
        this.#perspectiveCamera.position.set(0, visualizerSettings.cameraYOffset, visualizerSettings.cameraZOffset);
        this.#perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));
        this.#mainScene.add(this.#perspectiveCamera);

        this.#configureSceneElements();
        this.#establishInputHandlers();
    }

    static #createStandardMaterial(colorHex, shininess, ambientHex, emissiveHex, specularHex) {
        return new THREE.MeshPhongMaterial({
            color: colorHex,
            shininess: shininess,
            ambient: new THREE.Color(ambientHex),
            emissive: new THREE.Color(emissiveHex),
            specular: new THREE.Color(specularHex)
        });
    }

    static #createSphereVisual(radius, segments, material, positionVec3 = new THREE.Vector3(0, 0, 0), castsShadow = true) {
        const sphereGeometry = new THREE.SphereGeometry(radius, segments, segments);
        const sphereMesh = new THREE.Mesh(sphereGeometry, material);
        sphereMesh.position.copy(positionVec3);
        sphereMesh.castShadow = castsShadow;
        return sphereMesh;
    }

    async #loadHumanoidModel() {
        const assetManager = new THREE.LoadingManager();
        assetManager.onProgress = (item, loaded, total) => console.log(`Asset progress: ${item} ${loaded}/${total}`);

        const objectLoader = new THREE.OBJLoader(assetManager);
        try {
            const loadedObject = await new Promise((resolve, reject) => {
                objectLoader.load(visualizerSettings.humanModelPath, resolve, (xhr) => {
                    if (xhr.lengthComputable) {
                        console.log(`Model download: ${Math.round(xhr.loaded / xhr.total * 100)}%`);
                    }
                }, reject);
            });

            loadedObject.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = SpatialDisplayEngine.#createStandardMaterial(
                        0xffffff, 70.0, 0xff0000, 0x111111, 0xbbbbbb
                    );
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            loadedObject.rotation.y = Math.PI;
            loadedObject.position.y = -9.02;
            loadedObject.position.z = 0.6;
            this.#mainScene.add(loadedObject);
        } catch (error) {
            console.error("Failed to load 3D model:", error);
        }
    }

    #assembleSceneElements() {
        const cylinderForm = new THREE.CylinderGeometry(visualizerSettings.pedestalRadius, visualizerSettings.pedestalRadius, visualizerSettings.pedestalHeight, visualizerSettings.pedestalSegments);
        const cylinderSurface = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const basePedestal = new THREE.Mesh(cylinderForm, cylinderSurface);
        basePedestal.receiveShadow = true;
        basePedestal.position.y = -22.1;
        this.#mainScene.add(basePedestal);

        const interactiveSphereMaterial = new THREE.MeshLambertMaterial({ color: 0xFF5555 });
        const interactiveSphere = SpatialDisplayEngine.#createSphereVisual(
            visualizerSettings.mainSphereRadius, 32, interactiveSphereMaterial, new THREE.Vector3(0, 0, 0), false
        );
        this.#mainScene.add(interactiveSphere);
        this.#visualElements.set('mainIndicator', interactiveSphere);

        const guideSphereMaterial = new THREE.MeshLambertMaterial({ color: 0x0507ff });
        const guideSpherePositions = [
            new THREE.Vector3(0, visualizerSettings.sphereRadius, 0),
            new THREE.Vector3(0, 0, visualizerSettings.sphereRadius),
            new THREE.Vector3(0, 0, -visualizerSettings.sphereRadius),
            new THREE.Vector3(-visualizerSettings.sphereRadius, 0, 0),
            new THREE.Vector3(visualizerSettings.sphereRadius, 0, 0)
        ];
        guideSpherePositions.forEach(pos => {
            this.#mainScene.add(SpatialDisplayEngine.#createSphereVisual(visualizerSettings.guideSphereRadius, 16, guideSphereMaterial, pos));
        });

        const glowSphereGeometry = new THREE.SphereGeometry(visualizerSettings.mainSphereRadius, 32, 32);
        const glowShaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                "c": { type: "f", value: visualizerSettings.glowEffectC },
                "p": { type: "f", value: visualizerSettings.glowEffectP },
                glowColor: { type: "c", value: new THREE.Color(0xff1030) },
                viewVector: { type: "v3", value: this.#perspectiveCamera.position }
            },
            vertexShader: document.getElementById('vertexShader')?.textContent || '',
            fragmentShader: document.getElementById('fragmentShader')?.textContent || '',
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        const glowEffectSphere = new THREE.Mesh(glowSphereGeometry, glowShaderMaterial);
        glowEffectSphere.scale.multiplyScalar(1.2);
        this.#mainScene.add(glowEffectSphere);
        this.#visualElements.set('glowEffect', glowEffectSphere);
    }

    #drawGuideLines() {
        const lineMaterial = new THREE.LineBasicMaterial({
            color: visualizerSettings.lineMaterialColor,
            opacity: visualizerSettings.lineMaterialOpacity,
            transparent: true
        });

        const horizLineGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-visualizerSettings.sphereRadius, 0, 0),
            new THREE.Vector3(visualizerSettings.sphereRadius, 0, 0)
        ]);
        this.#mainScene.add(new THREE.Line(horizLineGeom, lineMaterial));

        const halfCircleGeom = new THREE.CircleGeometry(visualizerSettings.sphereRadius, 64);
        halfCircleGeom.vertices.shift();
        halfCircleGeom.vertices.splice(halfCircleGeom.vertices.length / 2 + 1);

        Array.from({ length: 50 }).forEach((_, i) => {
            const angle = -Math.PI * (0.75) + i * (1.53125 * Math.PI / 50);
            const lineSegment = new THREE.Line(halfCircleGeom, lineMaterial);
            lineSegment.rotation.x = angle;
            this.#mainScene.add(lineSegment);
        });

        const threeQuarterCircleGeom = new THREE.CircleGeometry(visualizerSettings.sphereRadius, 64);
        threeQuarterCircleGeom.vertices.shift();
        threeQuarterCircleGeom.vertices.splice(threeQuarterCircleGeom.vertices.length / 4 * 3 + 2);

        Array.from({ length: Math.floor((0.92 - (-0.92)) / 0.08) + 1 }).forEach((_, i) => {
            const delta = -0.92 + i * 0.08;
            const lineSegment = new THREE.Line(threeQuarterCircleGeom, lineMaterial);
            const scaleFactor = Math.sqrt(1.0 - delta * delta);
            lineSegment.scale.set(scaleFactor, scaleFactor, 1);
            lineSegment.position.x = delta * visualizerSettings.sphereRadius;
            lineSegment.rotation.y = Math.PI * 0.5;
            lineSegment.rotation.x = -Math.PI * 0.25;
            this.#mainScene.add(lineSegment);
        });
    }

    #illuminateScene() {
        this.#mainScene.add(new THREE.AmbientLight(visualizerSettings.ambientLightColor));

        const shadowBoundary = visualizerSettings.shadowCameraDepth;
        const createShadowLight = (color, intensity, castsShadow, darkness, position) => {
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(position.x, position.y, position.z);
            light.castShadow = castsShadow;
            light.shadow.mapSize.width = visualizerSettings.shadowMapResolution;
            light.shadow.mapSize.height = visualizerSettings.shadowMapResolution;
            light.shadow.camera.near = visualizerSettings.cameraNear;
            light.shadow.camera.far = this.#perspectiveCamera.far;
            light.shadow.camera.left = -shadowBoundary;
            light.shadow.camera.right = shadowBoundary;
            light.shadow.camera.top = shadowBoundary;
            light.shadow.camera.bottom = -shadowBoundary;
            light.shadow.darkness = darkness;
            return light;
        };

        const primaryLight = createShadowLight(
            visualizerSettings.directionalLightColor, 1, true, 0.5,
            new THREE.Vector3(5, 8, 3)
        );
        this.#mainScene.add(primaryLight);
        this.#visualElements.set('primaryDirectionalLight', primaryLight);

        const accentLight = createShadowLight(
            visualizerSettings.redLightColor, 1, true, 0.1,
            new THREE.Vector3(0, 8, 0)
        );
        this.#mainScene.add(accentLight);
        this.#visualElements.set('accentRedLight', accentLight);

        const overheadLight = createShadowLight(
            visualizerSettings.directionalLightColor, 0.2, true, 0.05,
            new THREE.Vector3(0, 8, 0)
        );
        this.#mainScene.add(overheadLight);
    }

    #configureSceneElements() {
        this.#loadHumanoidModel();
        this.#assembleSceneElements();
        this.#drawGuideLines();
        this.#illuminateScene();
    }

    #establishInputHandlers() {
        const handlerWrapper = (eventName) => (event) => {
            const callback = this.#userCallbacks.get(eventName);
            if (callback) callback(event);
        };

        this.#renderCanvas.domElement.addEventListener('mousemove', handlerWrapper('move'), false);
        this.#renderCanvas.domElement.addEventListener('mousedown', handlerWrapper('down'), false);
        this.#renderCanvas.domElement.addEventListener('mouseup', handlerWrapper('up'), false);
        this.#renderCanvas.domElement.addEventListener('mouseover', handlerWrapper('over'), false);
        this.#renderCanvas.domElement.addEventListener('mouseout', handlerWrapper('out'), false);
    }

    renderFrame() {
        this.#renderCanvas.render(this.#mainScene, this.#perspectiveCamera);
    }

    initiateAnimationCycle() {
        const animate = () => {
            requestAnimationFrame(animate);

            const currentTime = new Date().getMilliseconds();
            const cosValue = Math.cos(Math.PI * 0.002 * currentTime);

            const glowSphere = this.#visualElements.get('glowEffect');
            if (glowSphere && glowSphere.material.uniforms) {
                glowSphere.material.uniforms["c"].value = visualizerSettings.glowEffectC - visualizerSettings.glowEffectC * cosValue;
            }

            const redLight = this.#visualElements.get('accentRedLight');
            if (redLight) {
                redLight.intensity = visualizerSettings.lightPulseStrength * (1.0 + visualizerSettings.lightPulseModulation * cosValue);
                redLight.shadow.darkness = 0.5 * visualizerSettings.lightPulseStrength * (1.0 + visualizerSettings.lightPulseModulation * cosValue);
            }

            this.renderFrame();
        };
        animate();
    }

    updateSpherePosition(xCoord, yCoord, zCoord) {
        const mainIndicator = this.#visualElements.get('mainIndicator');
        const primaryLight = this.#visualElements.get('primaryDirectionalLight');
        const glowEffect = this.#visualElements.get('glowEffect');
        const redLight = this.#visualElements.get('accentRedLight');

        if (mainIndicator) mainIndicator.position.set(xCoord, yCoord, zCoord);
        if (primaryLight) primaryLight.position.set(xCoord, yCoord, zCoord);
        if (glowEffect) glowEffect.position.set(xCoord, yCoord, zCoord);
        if (redLight) redLight.position.set(xCoord, yCoord, zCoord);
    }

    toggleMainIndicatorVisibility(isVisible) {
        const mainIndicator = this.#visualElements.get('mainIndicator');
        const primaryLight = this.#visualElements.get('primaryDirectionalLight');
        if (mainIndicator) mainIndicator.visible = isVisible;
        if (primaryLight) {
            primaryLight.intensity = isVisible ? 1 : 0;
            primaryLight.castShadow = isVisible;
        }
    }

    getCurrentCameraPosition() {
        return this.#perspectiveCamera.position;
    }

    getCanvasDimensions() {
        return { width: visualizerSettings.canvasWidth, height: visualizerSettings.canvasHeight };
    }
}

class CoordinateMapper {
    static #findClosestIndex(sortedArray, targetValue) {
        let low = 0;
        let high = sortedArray.length - 1;
        if (targetValue <= sortedArray[low]) return low;
        if (targetValue >= sortedArray[high]) return high;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (sortedArray[mid] === targetValue) return mid;
            if (sortedArray[mid] < targetValue) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return (targetValue - sortedArray[high] < sortedArray[low] - targetValue) ? high : low;
    }

    static transformSphericalToHRIR(azimuthAngle, elevationAngle) {
        const xVal = Math.sin(azimuthAngle) * Math.cos(elevationAngle);
        const radialX = (Math.sqrt(1 - Math.pow(xVal, 2.0)));
        let gammaAngle = Math.acos(Math.cos(azimuthAngle) / radialX);
        gammaAngle = Math.sign(elevationAngle) * gammaAngle;

        gammaAngle = Math.max(gammaAngle, -Math.PI * 0.75);
        gammaAngle = Math.min(gammaAngle, Math.PI * (0.75 + 0.03125));

        return { xComponent: xVal, radialComponent: radialX, gammaComponent: gammaAngle };
    }

    static mapPointerToHRIR(pointerEvent, screenDimensions) {
        const deltaX = pointerEvent.clientX - screenDimensions.width / 2;
        const deltaY = pointerEvent.clientY - screenDimensions.height / 2;

        const radialDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const betaAngle = Math.atan2(deltaY, deltaX);
        const alphaAngle = radialDistance / (2 * visualizerSettings.sphereRadius * 20) * Math.PI;

        return CoordinateMapper.transformSphericalToHRIR(alphaAngle, betaAngle);
    }

    static deriveHRIRIndices(transformedHRIR) {
        const thetaIndex = CoordinateMapper.#findClosestIndex(
            visualizerSettings.azimuthAnglesRadians, Math.asin(transformedHRIR.xComponent)
        );
        const phiIndex = Math.round(transformedHRIR.gammaComponent / ((6 / 4.0 + 0.03125) * Math.PI) * 49) + 24;
        return { theta: thetaIndex, phi: phiIndex };
    }

    static convertHRIRToCartesian(transformedHRIR) {
        return {
            x: visualizerSettings.sphereRadius * transformedHRIR.xComponent,
            y: visualizerSettings.sphereRadius * transformedHRIR.radialComponent * Math.cos(transformedHRIR.gammaComponent),
            z: visualizerSettings.sphereRadius * transformedHRIR.radialComponent * Math.sin(transformedHRIR.gammaComponent)
        };
    }
}

class DisplayEventHandler {
    #displayInstance;
    #audioCallbackRef;

    constructor(displayEngine, audioUpdateCallback) {
        this.#displayInstance = displayEngine;
        this.#audioCallbackRef = audioUpdateCallback;
    }

    onDisplayPointerMove = (event) => {
        const hrirResult = CoordinateMapper.mapPointerToHRIR(event, this.#displayInstance.getCanvasDimensions());
        const cartesianCoords = CoordinateMapper.convertHRIRToCartesian(hrirResult);

        this.#displayInstance.updateSpherePosition(cartesianCoords.x, cartesianCoords.y, cartesianCoords.z);
        this.#audioCallbackRef(CoordinateMapper.deriveHRIRIndices(hrirResult));
    };

    onDisplayPointerDown = (event) => {
        const hrirResult = CoordinateMapper.mapPointerToHRIR(event, this.#displayInstance.getCanvasDimensions());
        const cartesianCoords = CoordinateMapper.convertHRIRToCartesian(hrirResult);
        this.#displayInstance.updateSpherePosition(cartesianCoords.x, cartesianCoords.y, cartesianCoords.z);
        this.#audioCallbackRef(CoordinateMapper.deriveHRIRIndices(hrirResult));
    };

    onDisplayPointerUp = (event) => { };

    onDisplayPointerEnter = (event) => {
        this.#displayInstance.toggleMainIndicatorVisibility(true);
    };

    onDisplayPointerExit = (event) => {
        this.#displayInstance.toggleMainIndicatorVisibility(false);
    };
}

class AudioImpulseEngine {
    #hrirLeftData = [];
    #hrirRightData = [];
    #audioContext;
    #convolverNode;
    #audioSourceBuffer;
    #currentAudioSource;
    #outputGainNode;
    #hrirDataLoaded = false;
    #hrirSampleRate = 44100;
    #hrirArrayDimensions = { thetaCount: 25, phiCount: 50, sampleCount: 200 };
    #convolverBufferLength;

    #currentThetaIndex = 0;
    #currentPhiIndex = 10;

    constructor() {
        this.#audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.#outputGainNode = this.#audioContext.createGain();
        this.#outputGainNode.connect(this.#audioContext.destination);
    }

    async initializeConvolver() {
        this.#convolverBufferLength = Math.ceil(this.#hrirArrayDimensions.sampleCount * this.#audioContext.sampleRate / this.#hrirSampleRate);

        if (!this.#convolverNode) {
            this.#convolverNode = this.#audioContext.createConvolver();
            const impulseBuffer = this.#audioContext.createBuffer(2, this.#convolverBufferLength, this.#audioContext.sampleRate);
            const leftChannel = impulseBuffer.getChannelData(0);
            const rightChannel = impulseBuffer.getChannelData(1);

            leftChannel.fill(0);
            rightChannel.fill(0);
            leftChannel[0] = 1;
            rightChannel[0] = 1;

            this.#convolverNode.buffer = impulseBuffer;
            this.#convolverNode.connect(this.#outputGainNode);
        }
    }

    async loadImpulseResponses(baseName) {
        this.#hrirDataLoaded = false;
        this.#hrirLeftData = Array.from({ length: this.#hrirArrayDimensions.thetaCount }, () =>
            Array.from({ length: this.#hrirArrayDimensions.phiCount }, () =>
                new Array(this.#hrirArrayDimensions.sampleCount).fill(0)
            )
        );
        this.#hrirRightData = Array.from({ length: this.#hrirArrayDimensions.thetaCount }, () =>
            Array.from({ length: this.#hrirArrayDimensions.phiCount }, () =>
                new Array(this.#hrirArrayDimensions.sampleCount).fill(0)
            )
        );

        const parseHRIRData = (rawText, targetArray) => {
            const lines = rawText.split('\n').filter(line => line.trim() !== '');
            lines.forEach((line, i) => {
                const values = line.split(',').map(Number);
                if (i < this.#hrirArrayDimensions.thetaCount) {
                    for (let j = 0; j < this.#hrirArrayDimensions.phiCount; j++) {
                        for (let k = 0; k < this.#hrirArrayDimensions.sampleCount; k++) {
                            const flatIndex = k * this.#hrirArrayDimensions.phiCount + j;
                            if (flatIndex < values.length) {
                                targetArray[i][j][k] = values[flatIndex];
                            }
                        }
                    }
                }
            });
        };

        try {
            const [leftResponse, rightResponse] = await Promise.all([
                fetch(`hrir/${baseName}_l.dat`).then(res => res.text()),
                fetch(`hrir/${baseName}_r.dat`).then(res => res.text())
            ]);

            parseHRIRData(leftResponse, this.#hrirLeftData);
            parseHRIRData(rightResponse, this.#hrirRightData);

            this.#hrirDataLoaded = true;
            this.refreshConvolverBuffer();
            console.log("HRIR data loaded and parsed.");
        } catch (error) {
            console.error("Failed to load HRIR data:", error);
        }
    }

    refreshConvolverBuffer() {
        if (!this.#hrirDataLoaded || !this.#convolverNode || !this.#convolverNode.buffer) return;

        console.log(`Updating convolver for theta: ${this.#currentThetaIndex}, phi: ${this.#currentPhiIndex}`);

        const impulseBuffer = this.#convolverNode.buffer;
        const leftChannel = impulseBuffer.getChannelData(0);
        const rightChannel = impulseBuffer.getChannelData(1);

        for (let k = 0; k < this.#convolverBufferLength; k++) {
            const q = k / (1.0 * this.#convolverBufferLength) * this.#hrirArrayDimensions.sampleCount;
            const k_p = Math.floor(q);
            const k_n = Math.ceil(q);
            const d = q - k_p;

            const safe_k_p = Math.min(k_p, this.#hrirArrayDimensions.sampleCount - 1);
            const safe_k_n = Math.min(k_n, this.#hrirArrayDimensions.sampleCount - 1);

            leftChannel[k] = this.#hrirLeftData[this.#currentThetaIndex][this.#currentPhiIndex][safe_k_p] * (1.0 - d) +
                             this.#hrirLeftData[this.#currentThetaIndex][this.#currentPhiIndex][safe_k_n] * d;
            rightChannel[k] = this.#hrirRightData[this.#currentThetaIndex][this.#currentPhiIndex][safe_k_p] * (1.0 - d) +
                              this.#hrirRightData[this.#currentThetaIndex][this.#currentPhiIndex][safe_k_n] * d;
        }
        console.log("Convolver buffer refreshed.");
    }

    updateSpatialIndices = (newIndices) => {
        const { theta, phi } = newIndices;
        if (theta !== this.#currentThetaIndex || phi !== this.#currentPhiIndex) {
            this.#currentThetaIndex = theta;
            this.#currentPhiIndex = phi;
            this.refreshConvolverBuffer();
        }
    };

    async loadSourceAudio(audioFileName) {
        try {
            const response = await fetch(`sounds/${audioFileName}`);
            const arrayBuffer = await response.arrayBuffer();
            this.#audioSourceBuffer = await this.#audioContext.decodeAudioData(arrayBuffer);
            console.log("Audio source loaded.");
        } catch (error) {
            console.error("Failed to load audio source:", error);
        }
    }

    playAudioSource() {
        if (!this.#audioSourceBuffer) {
            console.warn("No audio source loaded to play.");
            return;
        }

        if (this.#currentAudioSource) {
            this.#currentAudioSource.stop();
            this.#currentAudioSource.disconnect();
        }

        this.#currentAudioSource = this.#audioContext.createBufferSource();
        this.#currentAudioSource.buffer = this.#audioSourceBuffer;
        this.#currentAudioSource.loop = true;
        this.#currentAudioSource.connect(this.#convolverNode);
        this.#currentAudioSource.start(0);
        console.log("Audio source started.");
    }

    stopAudioSource() {
        if (this.#currentAudioSource) {
            this.#currentAudioSource.stop();
            this.#currentAudioSource.disconnect();
            this.#currentAudioSource = null;
            console.log("Audio source stopped.");
        }
    }
}

const ApplicationOrchestrator = (() => {
    let visualComponent;
    let audioComponent;
    let inputHandler;

    const initializeApplication = async (externalMouseMoveCallback, externalMouseDownCallback) => {
        audioComponent = new AudioImpulseEngine();
        await audioComponent.initializeConvolver();
        await audioComponent.loadImpulseResponses('default_hrir_profile');
        await audioComponent.loadSourceAudio('default_sound.mp3');

        inputHandler = new DisplayEventHandler(null, audioComponent.updateSpatialIndices);

        visualComponent = new SpatialDisplayEngine(
            inputHandler.onDisplayPointerMove,
            inputHandler.onDisplayPointerDown
        );

        inputHandler.#displayInstance = visualComponent;

        visualComponent.#userCallbacks.set('up', inputHandler.onDisplayPointerUp);
        visualComponent.#userCallbacks.set('over', inputHandler.onDisplayPointerEnter);
        visualComponent.#userCallbacks.set('out', inputHandler.onDisplayPointerExit);

        if (typeof externalMouseMoveCallback === 'function') visualComponent.#userCallbacks.set('externalMove', externalMouseMoveCallback);
        if (typeof externalMouseDownCallback === 'function') visualComponent.#userCallbacks.set('externalDown', externalMouseDownCallback);

        visualComponent.initiateAnimationCycle();
        console.log("Application initialized.");
    };

    const startSound = () => {
        if (audioComponent) {
            audioComponent.playAudioSource();
        }
    };

    const stopSound = () => {
        if (audioComponent) {
            audioComponent.stopAudioSource();
        }
    };

    return {
        start: initializeApplication,
        playAudio: startSound,
        stopAudio: stopSound,
    };
})();