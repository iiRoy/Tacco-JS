var visuals = {
  settings: {
    viewWidth: 400,
    viewHeight: 400,
    sphereRadius: 5,
    lightRedIntensity: 0.3,
    lightRedModifier: 0.3,
    angleValues: [-80, -65, -55, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 55, 65, 80]
  },
  handlers: {},
  elements: {},

  // Function to load the main 3D asset into the scene
  loadModel: function() {
    var resourceLoader = new THREE.LoadingManager();
    resourceLoader.onProgress = function(itemPath, currentLoaded, totalAssets) {
      console.log(itemPath, currentLoaded, totalAssets);
    };
    var progressMonitor = function(httpRequest) {
      if (httpRequest.lengthComputable) {
        var completionPercentage = httpRequest.loaded / httpRequest.total * 100;
        console.log(Math.round(completionPercentage, 2) + '% data fetched');
      }
    };

    var failureHandler = function(httpRequest) {};

    var displayScene = this.displayScene;

    var meshLoader = new THREE.OBJLoader(resourceLoader);
    meshLoader.load('malebase.obj', function(loadedModel) {
      loadedModel.traverse(function(meshPart) {
        if (meshPart instanceof THREE.Mesh) {
          meshPart.material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 70.0,
            ambient: 0xff0000,
            emissive: 0x111111,
            specular: 0xbbbbbb
          });
          meshPart.castShadow = true;
          meshPart.receiveShadow = true;
        }
      });
      loadedModel.rotation.y = Math.PI;
      loadedModel.position.y = -9.02;
      loadedModel.position.z = 0.6;
      displayScene.add(loadedModel);

    }, progressMonitor, failureHandler);
  },

  // Function to set up various objects in the 3D environment
  setupElements: function(displayScene) {
    var cylinderShape = new THREE.CylinderGeometry(4, 4, 3, 45);
    var cylinderSurface = new THREE.MeshLambertMaterial({
      color: 0xffffff
    });
    var baseStand = new THREE.Mesh(cylinderShape, cylinderSurface);
    baseStand.receiveShadow = true;
    baseStand.position.y = -22.1;
    displayScene.add(baseStand);

    var mainOrbShape = new THREE.SphereGeometry(0.7, 32, 32);
    this.elements.mainOrb = new THREE.Mesh(mainOrbShape, new THREE.MeshLambertMaterial({
      color: 0xFF5555
    }));
    displayScene.add(this.elements.mainOrb);

    var guideOrbRadius = 0.4;
    var guideOrbSurface = new THREE.MeshLambertMaterial({
      color: 0x0507ff
    });

    var upwardOrb = new THREE.Mesh(new THREE.SphereGeometry(guideOrbRadius, 16, 16), guideOrbSurface);
    upwardOrb.position.set(0, visuals.settings.sphereRadius, 0);
    upwardOrb.castShadow = true;
    displayScene.add(upwardOrb);

    var rearwardOrb = new THREE.Mesh(new THREE.SphereGeometry(guideOrbRadius, 16, 16), guideOrbSurface);
    rearwardOrb.position.set(0, 0, visuals.settings.sphereRadius);
    rearwardOrb.castShadow = true;
    displayScene.add(rearwardOrb);

    var forwardOrb = new THREE.Mesh(new THREE.SphereGeometry(guideOrbRadius, 16, 16), guideOrbSurface);
    forwardOrb.position.set(0, 0, -visuals.settings.sphereRadius);
    forwardOrb.castShadow = true;
    displayScene.add(forwardOrb);

    var leftwardOrb = new THREE.Mesh(new THREE.SphereGeometry(guideOrbRadius, 16, 16), guideOrbSurface);
    leftwardOrb.position.set(-visuals.settings.sphereRadius, 0, 0);
    leftwardOrb.castShadow = true;
    displayScene.add(leftwardOrb);

    var rightwardOrb = new THREE.Mesh(new THREE.SphereGeometry(guideOrbRadius, 16, 16), guideOrbSurface);
    rightwardOrb.position.set(visuals.settings.sphereRadius, 0, 0);
    rightwardOrb.castShadow = true;
    displayScene.add(rightwardOrb);

    var specialSurface = new THREE.ShaderMaterial({
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
          value: this.viewCamera.position
        }
      },
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader').textContent,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    var luminousOrb = new THREE.Mesh(mainOrbShape.clone(), specialSurface.clone());
    this.elements.luminousOrb = luminousOrb;
    luminousOrb.scale.multiplyScalar(1.2);
    displayScene.add(luminousOrb);
  },

  // Function to draw grid lines and circles
  drawGuides: function(displayScene) {
    // Axis line
    var lineShape = new THREE.Geometry();
    lineShape.vertices.push(new THREE.Vector3(-this.settings.sphereRadius, 0, 0));
    lineShape.vertices.push(new THREE.Vector3(this.settings.sphereRadius, 0, 0));
    var axisLine = new THREE.Line(lineShape, new THREE.LineBasicMaterial({
      color: 0x000000
    }));
    // displayScene.add(axisLine);
    var lineStyle = new THREE.LineBasicMaterial({
      color: 0x445566,
      opacity: 0.2,
      transparent: true
    });

    // Half circles
    var ringShape = new THREE.CircleGeometry(this.settings.sphereRadius, 64);
    ringShape.vertices.shift();
    ringShape.vertices.splice(ringShape.vertices.length / 2 + 1);

    var ringSegment, angleIncrement;
    for (angleIncrement = -Math.PI * (0.75); angleIncrement <= Math.PI * (0.75 + 0.03125); angleIncrement += 1.53125 * Math.PI / 50) {
      ringSegment = new THREE.Line(ringShape, lineStyle);
      ringSegment.rotation.x = angleIncrement;
      displayScene.add(ringSegment);
    }

    // Three-quarter circles
    ringShape = new THREE.CircleGeometry(this.settings.sphereRadius, 64);
    ringShape.vertices.shift();
    ringShape.vertices.splice(ringShape.vertices.length / 4 * 3 + 2);

    // Full circles (scaled)
    for (angleIncrement = -0.92; angleIncrement <= 0.92; angleIncrement += 0.08) {
      ringSegment = new THREE.Line(ringShape, lineStyle);
      ringSegment.scale.x = Math.sqrt(1.0 - angleIncrement * angleIncrement);
      ringSegment.scale.y = ringSegment.scale.x; // plane
      ringSegment.position.x = angleIncrement * this.settings.sphereRadius;
      ringSegment.rotation.y = Math.PI * 0.5;
      ringSegment.rotation.x = -Math.PI * (0.25);
      displayScene.add(ringSegment);
    }
  },

  // Function to initialize scene lighting
  illuminateScene: function(displayScene) {
    var ambientLightSource = new THREE.AmbientLight(0x101010);
    displayScene.add(ambientLightSource);

    var shadowDistance = 22;
    this.elements.mainDirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
    var mainDirectionalLight = this.elements.mainDirectionalLight;
    mainDirectionalLight.position.set(5, 8, 3);
    mainDirectionalLight.castShadow = true;
    mainDirectionalLight.shadowDarkness = 0.5;
    mainDirectionalLight.shadowCameraNear = 0.01;
    // mainDirectionalLight.shadowCameraVisible = true;
    mainDirectionalLight.shadowCameraFar = this.viewCamera.far;
    mainDirectionalLight.shadowMapWidth = 1024;
    mainDirectionalLight.shadowMapHeight = 1024;
    mainDirectionalLight.shadowCameraLeft = -shadowDistance;
    mainDirectionalLight.shadowCameraRight = shadowDistance;
    mainDirectionalLight.shadowCameraTop = shadowDistance;
    mainDirectionalLight.shadowCameraBottom = -shadowDistance;
    displayScene.add(mainDirectionalLight);

    this.elements.alertLight = new THREE.DirectionalLight(0xff0000, 1);
    var alertLight = this.elements.alertLight;
    alertLight.position.set(0, 8, 0);
    alertLight.castShadow = true;
    alertLight.shadowDarkness = 0.1;
    alertLight.shadowMapWidth = 1024;
    alertLight.shadowMapHeight = 1024;
    alertLight.shadowCameraNear = 0.01;
    alertLight.shadowCameraFar = this.viewCamera.far;
    alertLight.shadowCameraLeft = -shadowDistance;
    alertLight.shadowCameraRight = shadowDistance;
    alertLight.shadowCameraTop = shadowDistance;
    alertLight.shadowCameraBottom = -shadowDistance;
    displayScene.add(alertLight);

    var overheadLight = new THREE.DirectionalLight(0xffffff, 1);
    overheadLight.position.set(0, 8, 0);
    overheadLight.castShadow = true;
    overheadLight.shadowDarkness = 0.05;
    overheadLight.intensity = 0.2;
    overheadLight.shadowMapWidth = 1024;
    overheadLight.shadowMapHeight = 1024;
    overheadLight.shadowCameraNear = 0.01;
    overheadLight.shadowCameraFar = this.viewCamera.far;
    overheadLight.shadowCameraLeft = -shadowDistance;
    overheadLight.shadowCameraRight = shadowDistance;
    overheadLight.shadowCameraTop = shadowDistance;
    overheadLight.shadowCameraBottom = -shadowDistance;
    displayScene.add(overheadLight);

  },

  // Main initialization function for the 3D environment
  initialize: function(pointerMoveHandler, pointerDownHandler) {
    this.handlers.pointerMove = pointerMoveHandler;
    this.handlers.pointerDown = pointerDownHandler;

    // Convert angle settings to radians for internal use
    this.settings.angleRadians = [];
    for (var i = 0; i < this.settings.angleValues.length; i++) {
      this.settings.angleRadians.push(this.settings.angleValues[i] / 180.0 * Math.PI);
    }

    var graphicsRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.graphicsRenderer = graphicsRenderer;
    graphicsRenderer.shadowMapEnabled = true;
    graphicsRenderer.shadowMapType = THREE.PCFSoftShadowMap;
    graphicsRenderer.shadowMapSoft = true;
    graphicsRenderer.setSize(this.settings.viewWidth, this.settings.viewHeight);
    document.body.appendChild(graphicsRenderer.domElement);

    var displayScene = new THREE.Scene();
    this.displayScene = displayScene;

    var viewCamera = new THREE.PerspectiveCamera(60, this.settings.viewWidth / this.settings.viewHeight, 0.1, 1000);
    this.viewCamera = viewCamera;
    viewCamera.position.z = 0.55 * 10;
    viewCamera.position.y = 0.55 * 32;
    viewCamera.lookAt({
      x: 0,
      y: 0,
      z: 0
    });
    displayScene.add(viewCamera);

    this.loadModel();
    this.setupElements(displayScene);
    this.drawGuides(displayScene);
    this.illuminateScene(displayScene);

    // Attach event listeners for user interaction
    graphicsRenderer.domElement.addEventListener('mousemove', this.onPointerMove, false);
    graphicsRenderer.domElement.addEventListener('mousedown', this.onPointerDown, false);
    graphicsRenderer.domElement.addEventListener('mouseup', this.onPointerUp, false);
    graphicsRenderer.domElement.addEventListener('mouseover', this.onPointerEnter, false);
    graphicsRenderer.domElement.addEventListener('mouseout', this.onPointerLeave, false);
  },

  // Renders a single frame of the scene
  displayFrame: function() {
    this.graphicsRenderer.render(this.displayScene, this.viewCamera);
  },

  // Animation loop for continuous updates
  updateAnimation: function() {
    requestAnimationFrame(visuals.updateAnimation);

    visuals.elements.luminousOrb.material.uniforms["c"].value = 0.05 - 0.05 * Math.cos(Math.PI * 0.002 * new Date().getMilliseconds());
    visuals.elements.alertLight.intensity = visuals.settings.lightRedIntensity * (1.0 + visuals.settings.lightRedModifier * Math.cos(Math.PI * 0.002 * new Date().getMilliseconds()));
    visuals.elements.alertLight.shadowDarkness = 0.5 * visuals.settings.lightRedIntensity * (1.0 + visuals.settings.lightRedModifier * Math.cos(Math.PI * 0.002 * new Date().getMilliseconds()));;

    visuals.displayFrame();
  },

  // Converts spherical coordinates to HRIR format
  convertSphericalToHrir: function(sphericalCoords) {
    var coordX = Math.sin(sphericalCoords.alpha) * Math.cos(sphericalCoords.beta);
    var radialX = (Math.sqrt(1 - Math.pow(coordX / 1, 2.0)));
    var angleGamma = Math.acos(Math.cos(sphericalCoords.alpha) / radialX);
    angleGamma = Math.sign(sphericalCoords.beta) * angleGamma;

    // Apply boundary constraints
    if (angleGamma < -Math.PI * 3 / 4.0) angleGamma = -Math.PI * 3 / 4.0;
    if (angleGamma > Math.PI * (3 / 4.0 + 0.03125)) angleGamma = Math.PI * (3 / 4.0 + 0.03125);

    return {
      x: coordX,
      rx: radialX,
      gamma: angleGamma
    };
  },

  // Maps mouse input coordinates to HRIR data
  mapMouseToHrir: function(inputEvent) {
    var cursorX = (inputEvent.clientX);
    var cursorY = (inputEvent.clientY);
    var diffX = cursorX - visuals.settings.viewWidth / 2;
    var diffY = cursorY - visuals.settings.viewHeight / 2;

    // Calculate spherical coordinates
    var radiusVal = Math.sqrt(diffX * diffX + diffY * diffY);
    var betaAngle = Math.atan2(diffY, diffX);
    var alphaAngle = radiusVal / (2 * visuals.settings.sphereRadius * 20) * Math.PI;

    // Convert to HRIR coordinates
    return visuals.convertSphericalToHrir({
      r: radiusVal,
      beta: betaAngle,
      alpha: alphaAngle
    });
  },

  // Finds the closest HRIR index for given HRIR coordinates
  getHrirIndex: function(hrirData) {
    function findClosest(valueArray, targetValue) {
      for (var idx = 1; idx < valueArray.length; idx++) {
        if (valueArray[idx] > targetValue) {
          var prevVal = valueArray[idx - 1];
          var currVal = valueArray[idx];
          return Math.abs(prevVal - targetValue) < Math.abs(currVal - targetValue) ? idx - 1 : idx;
        }
      }
      return valueArray.length - 1;
    }

    return {
      theta: findClosest(visuals.settings.angleRadians, Math.asin(hrirData.x)),
      phi: Math.round(hrirData.gamma / ((6 / 4.0 + 0.03125) * Math.PI) * 49) + 24
    };
  },

  // Converts HRIR coordinates to XYZ Cartesian coordinates
  transformHrirToXyz: function(hrirData) {
    return {
      x: visuals.settings.sphereRadius * hrirData.x,
      y: visuals.settings.sphereRadius * hrirData.rx * Math.cos(hrirData.gamma),
      z: visuals.settings.sphereRadius * hrirData.rx * Math.sin(hrirData.gamma)
    }
  },

  // Handles mouse down events
  onPointerDown: function(inputEvent) {
    var inputHrir = visuals.mapMouseToHrir(inputEvent);
    visuals.placeHrirSource(inputHrir);
    if (visuals.handlers.pointerDown) visuals.handlers.pointerDown(visuals.getHrirIndex(inputHrir));
  },

  // Sets the position of the HRIR source in the 3D scene
  placeHrirSource: function(hrirPosition) {
    var sourcePosition = visuals.transformHrirToXyz(hrirPosition);
    visuals.elements.luminousOrb.position.set(sourcePosition.x, sourcePosition.y, sourcePosition.z);
    visuals.elements.alertLight.position.set(sourcePosition.x, sourcePosition.y, sourcePosition.z);
  },

  // Handles mouse up events (currently empty)
  onPointerUp: function(inputEvent) {

  },

  // Handles mouse move events
  onPointerMove: function(inputEvent) {
    var inputHrir = visuals.mapMouseToHrir(inputEvent);
    var sourcePosition = visuals.transformHrirToXyz(inputHrir);

    visuals.elements.mainOrb.position.set(sourcePosition.x, sourcePosition.y, sourcePosition.z);
    visuals.elements.mainDirectionalLight.position.set(sourcePosition.x, sourcePosition.y, sourcePosition.z);
    if (inputEvent.clientX < visuals.settings.viewWidth) {
      // visuals.viewCamera.position.x = (inputEvent.clientX - 0.5 * visuals.settings.viewWidth) * 0.0005;
    }
    if (visuals.handlers.pointerMove) visuals.handlers.pointerMove(visuals.getHrirIndex(inputHrir));
  },

  // Handles mouse over events
  onPointerEnter: function(inputEvent) {
    visuals.elements.mainDirectionalLight.intensity = 1;
    visuals.elements.mainDirectionalLight.castShadow = true;
    visuals.elements.mainOrb.visible = true;
  },

  // Handles mouse out events
  onPointerLeave: function(inputEvent) {
    visuals.elements.mainDirectionalLight.intensity = 0;
    visuals.elements.mainDirectionalLight.castShadow = false;
    visuals.elements.mainOrb.visible = false;
  }
};

var audioSpatializer = {
  leftImpulseResponses: [],
  rightImpulseResponses: [],
  sampleRate: 44100,
  azimuthAngle: 0, // Horizontal angle
  elevationAngle: 10, // Vertical angle

  // Loads HRIR data from files
  fetchImpulseResponses: function(dataName) {
    this.hrirDataLoaded = false;
    this.leftImpulseResponses = [];
    this.rightImpulseResponses = [];
    for (var idxX = 0; idxX < 25; idxX++) {
      this.leftImpulseResponses.push([]);
      this.rightImpulseResponses.push([]);
      for (var idxY = 0; idxY < 50; idxY++) {
        this.leftImpulseResponses[idxX].push([]);
        this.rightImpulseResponses[idxX].push([]);
        for (var idxZ = 0; idxZ < 200; idxZ++) {
          this.leftImpulseResponses[idxX][idxY].push(0);
          this.rightImpulseResponses[idxX][idxY].push(0);
        }
      }
    }

    var leftClientReq = new XMLHttpRequest();
    var rightClientReq = new XMLHttpRequest();
    var leftDone = false,
      rightDone = false;
    leftClientReq.open('GET', 'hrir/' + dataName + '_l.dat');
    rightClientReq.open('GET', 'hrir/' + dataName + '_r.dat');

    leftClientReq.onreadystatechange = function() {
      if (leftClientReq.readyState == 4 && leftClientReq.status == 200) {
        var receivedData = leftClientReq.responseText.split('\n');
        for (var idxX = 0; idxX < 25; idxX++) {
          var lineData = receivedData[idxX].split(',');
          for (var idxY = 0; idxY < 50; idxY++) {
            for (var idxZ = 0; idxZ < 200; idxZ++) {
              audioSpatializer.leftImpulseResponses[idxX][idxY][idxZ] = lineData[idxY + idxZ * 50];
            }
          }
        }
        if (rightDone) {
          audioSpatializer.hrirDataLoaded = true;
          audioSpatializer.refreshConvolver();
        }
        leftDone = true;
      }
    }

    rightClientReq.onreadystatechange = function() {
      if (rightClientReq.readyState == 4 && rightClientReq.status == 200) {
        var receivedData = rightClientReq.responseText.split('\n');
        for (var idxX = 0; idxX < 25; idxX++) {
          var lineData = receivedData[idxX].split(',');
          for (var idxY = 0; idxY < 50; idxY++) {
            for (var idxZ = 0; idxZ < 200; idxZ++) {
              audioSpatializer.rightImpulseResponses[idxX][idxY][idxZ] = lineData[idxY + idxZ * 50];
            }
          }
        }
        if (leftDone) {
          audioSpatializer.hrirDataLoaded = true;
          audioSpatializer.refreshConvolver();
        }
        rightDone = true;
      }
    }
    leftClientReq.send();
    rightClientReq.send();
  },

  // Updates the convolver with current HRIR data
  refreshConvolver: function() {
    if (!audioSpatializer.hrirDataLoaded) return;
    console.log(audioSpatializer.azimuthAngle + "," + audioSpatializer.elevationAngle);
    audioSpatializer.leftChannel = audioSpatializer.hrirAudioBuffer.getChannelData(0);
    audioSpatializer.rightChannel = audioSpatializer.hrirAudioBuffer.getChannelData(1);

    // Perform linear interpolation of HRIR to match audio context sample rate
    if (audioSpatializer.leftImpulseResponses && audioSpatializer.rightImpulseResponses) {
      var scaledIndex, interpolationFactor, prevIndex, nextIndex;
      for (var k = 0; k < this.irLength; k++) {
        scaledIndex = k / (1.0 * this.irLength) * 200;
        prevIndex = Math.floor(scaledIndex);
        nextIndex = Math.ceil(scaledIndex);
        interpolationFactor = scaledIndex - prevIndex;

        audioSpatializer.leftChannel[k] = audioSpatializer.leftImpulseResponses[audioSpatializer.azimuthAngle][audioSpatializer.elevationAngle][prevIndex] * (1.0 - interpolationFactor) + audioSpatializer.leftImpulseResponses[audioSpatializer.azimuthAngle][audioSpatializer.elevationAngle][nextIndex] * interpolationFactor;
        audioSpatializer.rightChannel[k] = audioSpatializer.rightImpulseResponses[audioSpatializer.azimuthAngle][audioSpatializer.elevationAngle][prevIndex] * (1.0 - interpolationFactor) + audioSpatializer.rightImpulseResponses[audioSpatializer.azimuthAngle][audioSpatializer.elevationAngle][nextIndex] * interpolationFactor;
      }
    }

    console.log("Convolver reconfigured");
  },

  // Initializes the audio convolver node
  setupConvolver: function() {
    this.irLength = Math.ceil(200.0 * this.audioContext.sampleRate / this.sampleRate);
    if (!audioSpatializer.convolverNode) {
      audioSpatializer.convolverNode = audioSpatializer.audioContext.createConvolver();

      audioSpatializer.hrirAudioBuffer = audioSpatializer.audioContext.createBuffer(2, this.irLength, this.audioContext.sampleRate);
      audioSpatializer.leftChannel = audioSpatializer.hrirAudioBuffer.getChannelData(0);
      audioSpatializer.rightChannel = audioSpatializer.hrirAudioBuffer.getChannelData(1);

      // Default to Kronecker delta (identity impulse)
      audioSpatializer.leftChannel[0] = 1;
      audioSpatializer.rightChannel[0] = 1;
      for (var i = 1; i < audioSpatializer.hrirAudioBuffer.length; i++) {
        audioSpatializer.leftChannel[i] = 0;
        audioSpatializer.rightChannel[i] = 0;
      }

      audioSpatializer.convolverNode.buffer = audioSpatializer.hrirAudioBuffer;
      audioSpatializer.convolverNode.connect(audioSpatializer.gainNode);
      audioSpatializer.gainNode.connect(audioSpatializer.audioContext.destination);
    }
  },

  // Loads an audio file as a source
  loadAudioSource: function(audioFileName) {
    var dataRequest = new XMLHttpRequest();
    dataRequest.open('GET', 'sounds/' + audioFileName, true);
    dataRequest.responseType = 'arraybuffer';
    dataRequest.onload = function() {
      var soundData = dataRequest.response;
      audioSpatializer.audioContext.decodeAudioData(soundData, function(audioBuffer) {
        audioSpatializer.soundBuffer = audioBuffer;
      }, function(e) {
        "Error decoding audio data" + e.err
      });
    }
    dataRequest.send();
  },

  // Plays the loaded audio source
  startAudioPlayback: function() {
    if (!audioSpatializer.audioSource) {
      audioSpatializer.audioSource = audioSpatializer.audioContext.createBufferSource();
    } else {
      audioSpatializer.audioSource.stop();
      audioSpatializer.audioSource = audioSpatializer.audioContext.createBufferSource();
    }
  }
};