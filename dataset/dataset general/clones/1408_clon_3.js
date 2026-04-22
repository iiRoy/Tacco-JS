const spatialViz = (function() {
    const _configuration = {
        canvasDimensions: {
            width: 400,
            height: 400
        },
        primaryRadius: 5,
        redLight: {
            initialIntensity: 3 / 10,
            modulationFactor: 3 / 10
        },
        angleSetDegrees: [-80, -65, -55, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 55, 65, 80]
    };

    const _interactionHooks = {};
    const _sceneElements = {};

    let _glRenderer;
    let _mainScene;
    let _perspectiveCamera;

    const assignShadowProperties = (light, mapResolution = 1024, cameraClipRange = 22, nearPlane = 0.01) => {
        if (!light || typeof THREE === 'undefined') return;
        light.castShadow = true;
        light.shadow.mapSize.width = mapResolution;
        light.shadow.mapSize.height = mapResolution;
        light.shadow.camera.near = nearPlane;
        light.shadow.camera.far = _perspectiveCamera ? _perspectiveCamera.far : 1000;
        light.shadow.camera.left = -cameraClipRange;
        light.shadow.camera.right = cameraClipRange;
        light.shadow.camera.top = cameraClipRange;
        light.shadow.camera.bottom = -cameraClipRange;
    };

    const load3dAsset = async () => {
        if (!_mainScene || typeof THREE === 'undefined') {
            return;
        }

        const assetManager = new THREE.LoadingManager();
        assetManager.onStart = () => {};
        assetManager.onLoad = () => {};
        assetManager.onError = (url) => {
            console.error('Asset load error: ' + url);
        };

        const objAssetLoader = new THREE.OBJLoader(assetManager);
        try {
            const loadedObject = await new Promise((resolve, reject) => {
                objAssetLoader.load(
                    'malebase.obj',
                    (obj) => resolve(obj),
                    (xhr) => {
                        if (xhr.lengthComputable) {
                            const completionPercentage = (xhr.loaded / xhr.total * 100).toFixed(2);
                        }
                    },
                    (error) => reject(error)
                );
            });

            loadedObject.traverse((node) => {
                if (node instanceof THREE.Mesh) {
                    node.material = new THREE.MeshPhongMaterial({
                        color: 0xffffff,
                        shininess: 70.0,
                        ambient: 0xff0000,
                        emissive: 0x111111,
                        specular: 0xbbbbbb
                    });
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });

            loadedObject.rotation.y = Math.PI;
            loadedObject.position.set(0, -9.02, 0.6);
            _mainScene.add(loadedObject);

        } catch (error) {
            console.error("Failed to load 3D model: ", error);
        }
    };

    const buildVisualElements = (targetScene) => {
        if (!targetScene || typeof THREE === 'undefined') return;

        const pedestalBase = new THREE.CylinderGeometry(4, 4, 3, 45);
        const pedestalMat = new THREE.MeshLambertMaterial({
            color: 0xffffff
        });
        const scenePedestal = new THREE.Mesh(pedestalBase, pedestalMat);
        scenePedestal.receiveShadow = true;
        scenePedestal.position.y = -22.1;
        targetScene.add(scenePedestal);

        const interactiveSphereGeometry = new THREE.SphereGeometry(0.7, 32, 32);
        const interactiveSphereMaterial = new THREE.MeshLambertMaterial({
            color: 0xFF5555
        });
        _sceneElements.userInteractionSphere = new THREE.Mesh(interactiveSphereGeometry, interactiveSphereMaterial);
        targetScene.add(_sceneElements.userInteractionSphere);

        const createDirectionalIndicator = (sphereRadius, sphereColor, posVec) => {
            const indicatorGeom = new THREE.SphereGeometry(sphereRadius, 16, 16);
            const indicatorMat = new THREE.MeshLambertMaterial({
                color: sphereColor
            });
            const indicatorSphere = new THREE.Mesh(indicatorGeom, indicatorMat);
            indicatorSphere.position.copy(posVec);
            indicatorSphere.castShadow = true;
            return indicatorSphere;
        };

        const indicatorSize = 0.4;
        const indicatorHue = 0x0507ff;
        const primaryRadiusVal = _configuration.primaryRadius;

        targetScene.add(createDirectionalIndicator(indicatorSize, indicatorHue, new THREE.Vector3(0, primaryRadiusVal, 0)));
        targetScene.add(createDirectionalIndicator(indicatorSize, indicatorHue, new THREE.Vector3(0, 0, primaryRadiusVal)));
        targetScene.add(createDirectionalIndicator(indicatorSize, indicatorHue, new THREE.Vector3(0, 0, -primaryRadiusVal)));
        targetScene.add(createDirectionalIndicator(indicatorSize, indicatorHue, new THREE.Vector3(-primaryRadiusVal, 0, 0)));
        targetScene.add(createDirectionalIndicator(indicatorSize, indicatorHue, new THREE.Vector3(primaryRadiusVal, 0, 0)));

        const customGlowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                "c": {
                    type: "f",
                    value: 0.05
                },
                "p": {
                    type: "f",
                    value: 4.5
                },
                glowColor: {
                    type: "c",
                    value: new THREE.Color(0xff1030)
                },
                viewVector: {
                    type: "v3",
                    value: _perspectiveCamera ? _perspectiveCamera.position : new THREE.Vector3(0, 0, 0)
                }
            },
            vertexShader: `
                uniform vec3 viewVector;
                uniform float c;
                uniform float p;
                varying float intensity;
                void main() 
                {
                    vec3 vNormal = normalize( normalMatrix * normal );
                    vec3 vNormel = normalize( normalMatrix * viewVector );
                    intensity = pow( c - dot(vNormal, vNormel), p );
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() 
                {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4( glow, 1.0 );
                }
            `,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        _sceneElements.effectGlowSphere = new THREE.Mesh(interactiveSphereGeometry.clone(), customGlowMaterial);
        _sceneElements.effectGlowSphere.scale.multiplyScalar(1.2);
        targetScene.add(_sceneElements.effectGlowSphere);
    };

    const createAuxiliaryGeometry = (targetScene) => {
        if (!targetScene || typeof THREE === 'undefined') return;

        const mainRadius = _configuration.primaryRadius;
        const gridLineStyle = new THREE.LineBasicMaterial({
            color: 0x445566,
            opacity: 0.2,
            transparent: true
        });

        const halfCircleGeom = new THREE.CircleGeometry(mainRadius, 64);
        halfCircleGeom.vertices.shift();
        halfCircleGeom.vertices = halfCircleGeom.vertices.slice(0, Math.floor(halfCircleGeom.vertices.length / 2) + 1);

        const angleIncrement = Math.PI * 1.5 / 50;
        for (let currentAngle = -Math.PI * 0.75; currentAngle <= Math.PI * (0.75 + angleIncrement / Math.PI / 2); currentAngle += angleIncrement) {
            const lineFragment = new THREE.Line(halfCircleGeom, gridLineStyle);
            lineFragment.rotation.x = currentAngle;
            targetScene.add(lineFragment);
        }

        const quarterCircleGeom = new THREE.CircleGeometry(mainRadius, 64);
        quarterCircleGeom.vertices.shift();
        quarterCircleGeom.vertices = quarterCircleGeom.vertices.slice(0, Math.floor(quarterCircleGeom.vertices.length * 3 / 4) + 2);

        const xOffsetStep = 0.08;
        for (let xPos = -0.92; xPos <= 0.92 + xOffsetStep / 2; xPos += xOffsetStep) {
            const lineFragment = new THREE.Line(quarterCircleGeom, gridLineStyle);
            const scaleFactor = Math.sqrt(1.0 - xPos * xPos);
            lineFragment.scale.set(scaleFactor, scaleFactor, scaleFactor);
            lineFragment.position.x = xPos * mainRadius;
            lineFragment.rotation.y = Math.PI * 0.5;
            lineFragment.rotation.x = -Math.PI * 0.25;
            targetScene.add(lineFragment);
        }
    };

    const setupSceneIllumination = (targetScene) => {
        if (!targetScene || typeof THREE === 'undefined') return;

        targetScene.add(new THREE.AmbientLight(0x101010));

        const shadowVolumeSize = 22;

        _sceneElements.mainDirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
        _sceneElements.mainDirectionalLight.position.set(5, 8, 3);
        _sceneElements.mainDirectionalLight.shadow.darkness = 0.5;
        assignShadowProperties(_sceneElements.mainDirectionalLight, 1024, shadowVolumeSize);
        targetScene.add(_sceneElements.mainDirectionalLight);

        _sceneElements.interactiveRedLight = new THREE.DirectionalLight(0xff0000, 1);
        _sceneElements.interactiveRedLight.position.set(0, 8, 0);
        _sceneElements.interactiveRedLight.shadow.darkness = 0.1;
        assignShadowProperties(_sceneElements.interactiveRedLight, 1024, shadowVolumeSize);
        targetScene.add(_sceneElements.interactiveRedLight);

        const overheadLight = new THREE.DirectionalLight(0xffffff, 1);
        overheadLight.position.set(0, 8, 0);
        overheadLight.shadow.darkness = 0.05;
        overheadLight.intensity = 0.2;
        assignShadowProperties(overheadLight, 1024, shadowVolumeSize);
        targetScene.add(overheadLight);
    };

    const initializeDisplay = (onPointerMoveCallback, onPointerDownCallback) => {
        if (typeof THREE === 'undefined') {
            console.error("THREE.js library not detected.");
            return;
        }

        _interactionHooks.onPointerMove = onPointerMoveCallback;
        _interactionHooks.onPointerDown = onPointerDownCallback;

        _configuration.angleSetRadians = _configuration.angleSetDegrees.map(degrees => degrees * (Math.PI / 180.0));

        _glRenderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        _glRenderer.shadowMap.enabled = true;
        _glRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        _glRenderer.setSize(_configuration.canvasDimensions.width, _configuration.canvasDimensions.height);
        document.body.appendChild(_glRenderer.domElement);

        _mainScene = new THREE.Scene();

        _perspectiveCamera = new THREE.PerspectiveCamera(
            60,
            _configuration.canvasDimensions.width / _configuration.canvasDimensions.height,
            0.1,
            1000
        );
        _perspectiveCamera.position.set(0, 0.55 * 32, 0.55 * 10);
        _perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));
        _mainScene.add(_perspectiveCamera);

        load3dAsset();
        buildVisualElements(_mainScene);
        createAuxiliaryGeometry(_mainScene);
        setupSceneIllumination(_mainScene);

        const canvasElement = _glRenderer.domElement;
        canvasElement.addEventListener('mousemove', handlePointerMove, false);
        canvasElement.addEventListener('mousedown', handlePointerDown, false);
        canvasElement.addEventListener('mouseup', handlePointerUp, false);
        canvasElement.addEventListener('mouseover', handlePointerEnter, false);
        canvasElement.addEventListener('mouseout', handlePointerLeave, false);
    };

    const drawFrame = () => {
        if (!_glRenderer || !_mainScene || !_perspectiveCamera) return;
        _glRenderer.render(_mainScene, _perspectiveCamera);
    };

    const startAnimationLoop = () => {
        requestAnimationFrame(startAnimationLoop);

        const currentTimeMs = Date.now();
        const animationPhase = Math.cos(Math.PI * 0.002 * currentTimeMs);

        if (_sceneElements.effectGlowSphere && _sceneElements.effectGlowSphere.material.uniforms) {
            _sceneElements.effectGlowSphere.material.uniforms["c"].value = 0.05 - 0.05 * animationPhase;
        }

        if (_sceneElements.interactiveRedLight) {
            const dynamicIntensity = _configuration.redLight.initialIntensity * (1.0 + _configuration.redLight.modulationFactor * animationPhase);
            _sceneElements.interactiveRedLight.intensity = dynamicIntensity;
            _sceneElements.interactiveRedLight.shadow.darkness = 0.5 * dynamicIntensity;
        }

        drawFrame();
    };

    const convertSphericalToHrtf = (sphericalInput) => {
        const sineAlpha = Math.sin(sphericalInput.alpha);
        const cosineAlpha = Math.cos(sphericalInput.alpha);
        const cosineBeta = Math.cos(sphericalInput.beta);

        const hrtf_x = sineAlpha * cosineBeta;
        const hrtf_rx = Math.sqrt(1 - hrtf_x * hrtf_x);

        let hrtf_gamma;
        if (hrtf_rx < Number.EPSILON) {
            hrtf_gamma = 0;
        } else {
            hrtf_gamma = Math.acos(cosineAlpha / hrtf_rx);
            hrtf_gamma = (sphericalInput.beta >= 0 ? 1 : -1) * hrtf_gamma;
        }

        const lowerGammaBound = -Math.PI * 3 / 4.0;
        const upperGammaBound = Math.PI * (3 / 4.0 + 0.03125);
        hrtf_gamma = Math.max(lowerGammaBound, Math.min(upperGammaBound, hrtf_gamma));

        return {
            x: hrtf_x,
            rx: hrtf_rx,
            gamma: hrtf_gamma
        };
    };

    const mapPointerToHrtf = (pointerEvent) => {
        const halfCanvasWidth = _configuration.canvasDimensions.width / 2;
        const halfCanvasHeight = _configuration.canvasDimensions.height / 2;

        const deltaX = pointerEvent.clientX - halfCanvasWidth;
        const deltaY = pointerEvent.clientY - halfCanvasHeight;

        const radialDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angleBeta = Math.atan2(deltaY, deltaX);
        const angleAlpha = radialDistance / (2 * _configuration.primaryRadius * 20) * Math.PI;

        return convertSphericalToHrtf({
            r: radialDistance,
            beta: angleBeta,
            alpha: angleAlpha
        });
    };

    const getHrtfIndex = (hrtfData) => {
        const findNearestIndex = (sortedValues, target) => {
            if (!sortedValues || sortedValues.length === 0) return -1;
            let low = 0;
            let high = sortedValues.length - 1;
            let mid;

            while (low <= high) {
                mid = Math.floor((low + high) / 2);
                if (sortedValues[mid] === target) return mid;
                if (sortedValues[mid] < target) low = mid + 1;
                else high = mid - 1;
            }
            return (Math.abs(sortedValues[low] - target) < Math.abs(sortedValues[high] - target)) ? low : high;
        };

        const thetaIdx = findNearestIndex(_configuration.angleSetRadians, Math.asin(hrtfData.x));
        const phiIdx = Math.round(hrtfData.gamma / ((6 / 4.0 + 0.03125) * Math.PI) * 49) + 24;

        return {
            theta: thetaIdx,
            phi: phiIdx
        };
    };

    const transformHrtfToCartesian = (hrtfData) => {
        const currentRadius = _configuration.primaryRadius;
        return {
            x: currentRadius * hrtfData.x,
            y: currentRadius * hrtfData.rx * Math.cos(hrtfData.gamma),
            z: currentRadius * hrtfData.rx * Math.sin(hrtfData.gamma)
        };
    };

    const updateSourcePosition = (hrtfData) => {
        const cartesianPosition = transformHrtfToCartesian(hrtfData);
        if (_sceneElements.effectGlowSphere) {
            _sceneElements.effectGlowSphere.position.set(cartesianPosition.x, cartesianPosition.y, cartesianPosition.z);
        }
        if (_sceneElements.interactiveRedLight) {
            _sceneElements.interactiveRedLight.position.set(cartesianPosition.x, cartesianPosition.y, cartesianPosition.z);
        }
    };

    const handlePointerDown = (event) => {
        const currentHrtf = mapPointerToHrtf(event);
        updateSourcePosition(currentHrtf);
        if (_interactionHooks.onPointerDown) {
            _interactionHooks.onPointerDown(getHrtfIndex(currentHrtf));
        }
    };

    const handlePointerUp = (event) => {};

    const handlePointerMove = (event) => {
        const currentHrtf = mapPointerToHrtf(event);
        const cartesianPosition = transformHrtfToCartesian(currentHrtf);

        if (_sceneElements.userInteractionSphere) {
            _sceneElements.userInteractionSphere.position.set(cartesianPosition.x, cartesianPosition.y, cartesianPosition.z);
        }
        if (_sceneElements.mainDirectionalLight) {
            _sceneElements.mainDirectionalLight.position.set(cartesianPosition.x, cartesianPosition.y, cartesianPosition.z);
        }

        if (_interactionHooks.onPointerMove) {
            _interactionHooks.onPointerMove(getHrtfIndex(currentHrtf));
        }
    };

    const handlePointerEnter = (event) => {
        if (_sceneElements.mainDirectionalLight) {
            _sceneElements.mainDirectionalLight.intensity = 1;
            _sceneElements.mainDirectionalLight.castShadow = true;
        }
        if (_sceneElements.userInteractionSphere) {
            _sceneElements.userInteractionSphere.visible = true;
        }
    };

    const handlePointerLeave = (event) => {
        if (_sceneElements.mainDirectionalLight) {
            _sceneElements.mainDirectionalLight.intensity = 0;
            _sceneElements.mainDirectionalLight.castShadow = false;
        }
        if (_sceneElements.userInteractionSphere) {
            _sceneElements.userInteractionSphere.visible = false;
        }
    };

    return {
        initialize: initializeDisplay,
        startAnimation: startAnimationLoop,
        get currentCamera() {
            return _perspectiveCamera;
        },
        get sceneState() {
            return _mainScene;
        },
        updateHrtfPosition: updateSourcePosition
    };
})();

const audioEngine = (function() {
    let _leftImpulseResponse = [];
    let _rightImpulseResponse = [];
    const _systemSampleRate = 44100;
    let _azimuthIndex = 0;
    let _elevationIndex = 10;

    let _isHrirDataReady = false;
    let _webAudioContext;
    let _convolverNode;
    let _masterGainNode;
    let _hrirBufferLength;
    let _hrirAudioBuffer;
    let _sourceAudioBuffer;
    let _audioSourceNode;

    const createNestedArray = (dim1, dim2, dim3, initialVal = 0) => {
        return Array.from({
            length: dim1
        }, () =>
            Array.from({
                length: dim2
            }, () =>
                Array.from({
                    length: dim3
                }).fill(initialVal)
            )
        );
    };

    const fetchImpulseResponses = async (responseSetName) => {
        _isHrirDataReady = false;
        _leftImpulseResponse = createNestedArray(25, 50, 200);
        _rightImpulseResponse = createNestedArray(25, 50, 200);

        const performFetch = async (url) => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Network response was not ok for ${url}`);
            return await response.text();
        };

        try {
            const [leftDataText, rightDataText] = await Promise.all([
                performFetch(`hrir/${responseSetName}_l.dat`),
                performFetch(`hrir/${responseSetName}_r.dat`)
            ]);

            const parseAndPopulateHrir = (targetArray, rawText) => {
                const lines = rawText.split('\n').filter(line => line.trim().length > 0);
                lines.forEach((line, i) => {
                    if (i >= 25) return;
                    const values = line.split(',').map(Number);
                    for (let j = 0; j < 50; ++j) {
                        for (let k = 0; k < 200; ++k) {
                            const dataIdx = j + k * 50;
                            if (dataIdx < values.length) {
                                targetArray[i][j][k] = values[dataIdx];
                            }
                        }
                    }
                });
            };

            parseAndPopulateHrir(_leftImpulseResponse, leftDataText);
            parseAndPopulateHrir(_rightImpulseResponse, rightDataText);

            _isHrirDataReady = true;
            refreshSpatializer();
        } catch (error) {
            console.error("Failed to load HRIR data:", error);
            _isHrirDataReady = false;
        }
    };

    const refreshSpatializer = () => {
        if (!_isHrirDataReady || !_hrirAudioBuffer || !_webAudioContext) {
            return;
        }

        const leftChannel = _hrirAudioBuffer.getChannelData(0);
        const rightChannel = _hrirAudioBuffer.getChannelData(1);

        const originalHrirLength = 200;
        const currentTheta = _azimuthIndex;
        const currentPhi = _elevationIndex;

        const leftHrirSegment = _leftImpulseResponse[currentTheta] ? _leftImpulseResponse[currentTheta][currentPhi] : null;
        const rightHrirSegment = _rightImpulseResponse[currentTheta] ? _rightImpulseResponse[currentTheta][currentPhi] : null;

        if (leftHrirSegment && rightHrirSegment) {
            for (let i = 0; i < _hrirBufferLength; ++i) {
                const scaledIdx = (i / (_hrirBufferLength * 1.0)) * originalHrirLength;
                const idxFloor = ~~scaledIdx;
                const idxCeil = Math.min(originalHrirLength - 1, idxFloor + 1);
                const fractionalPart = scaledIdx - idxFloor;

                const leftValFloor = leftHrirSegment[idxFloor] || 0;
                const leftValCeil = leftHrirSegment[idxCeil] || 0;
                leftChannel[i] = leftValFloor * (1.0 - fractionalPart) + leftValCeil * fractionalPart;

                const rightValFloor = rightHrirSegment[idxFloor] || 0;
                const rightValCeil = rightHrirSegment[idxCeil] || 0;
                rightChannel[i] = rightValFloor * (1.0 - fractionalPart) + rightValCeil * fractionalPart;
            }
        } else {
            leftChannel.fill(0);
            rightChannel.fill(0);
        }
    };

    const setupConvolverNode = () => {
        if (_convolverNode) {
            return;
        }

        if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
            console.error("Web Audio API is not available.");
            return;
        }
        _webAudioContext = _webAudioContext || new (window.AudioContext || window.webkitAudioContext)();
        _hrirBufferLength = Math.ceil(200.0 * _webAudioContext.sampleRate / _systemSampleRate);

        _convolverNode = _webAudioContext.createConvolver();
        _masterGainNode = _webAudioContext.createGain();

        _hrirAudioBuffer = _webAudioContext.createBuffer(2, _hrirBufferLength, _webAudioContext.sampleRate);

        _hrirAudioBuffer.getChannelData(0).fill(0);
        _hrirAudioBuffer.getChannelData(1).fill(0);
        _hrirAudioBuffer.getChannelData(0)[0] = 1;
        _hrirAudioBuffer.getChannelData(1)[0] = 1;

        _convolverNode.buffer = _hrirAudioBuffer;
        _convolverNode.connect(_masterGainNode);
        _masterGainNode.connect(_webAudioContext.destination);
    };

    const loadAudioSource = async (fileName) => {
        if (!_webAudioContext) {
            setupConvolverNode();
        }
        try {
            const response = await fetch(`sounds/${fileName}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const audioDataBuffer = await response.arrayBuffer();
            _sourceAudioBuffer = await _webAudioContext.decodeAudioData(audioDataBuffer);
        } catch (error) {
            console.error(`Error loading audio source '${fileName}':`, error);
            _sourceAudioBuffer = null;
        }
    };

    const startPlayback = () => {
        if (!_sourceAudioBuffer || !_webAudioContext) {
            return;
        }

        if (_audioSourceNode) {
            try {
                _audioSourceNode.stop();
                _audioSourceNode.disconnect();
            } catch (e) {}
        }

        _audioSourceNode = _webAudioContext.createBufferSource();
        _audioSourceNode.buffer = _sourceAudioBuffer;
        _audioSourceNode.loop = true;
        _audioSourceNode.connect(_convolverNode);
        _audioSourceNode.start(0);
    };

    const setHrtfIndices = (azimuth, elevation) => {
        if (azimuth !== _azimuthIndex || elevation !== _elevationIndex) {
            _azimuthIndex = azimuth;
            _elevationIndex = elevation;
            refreshSpatializer();
        }
    };

    return {
        initializeAudioSystem: setupConvolverNode,
        loadHrtfData: fetchImpulseResponses,
        loadSoundFile: loadAudioSource,
        playCurrentSource: startPlayback,
        updateHrtfIndices: setHrtfIndices,
        get currentAzimuthIndex() {
            return _azimuthIndex;
        },
        get currentElevationIndex() {
            return _elevationIndex;
        }
    };
})();