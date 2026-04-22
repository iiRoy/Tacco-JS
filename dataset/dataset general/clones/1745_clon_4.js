// Assume the following global variables/objects are available in the execution environment, renamed from their originals:
// ThreedEngine (formerly THREE)
// renderSpace (formerly scene)
// primaryVisual (formerly mesh)
// groundVisual (formerly plane)
// groundGridVisual (formerly wireplane)
// skyGroundLight (formerly hemisphereLight)
// distantSunLight (formerly directionalLight)
// focusedLightA (formerly spotLight1)
// focusedLightB (formerly spotLight2)
// overallIllumination (formerly ambientLight)
// colorConverter (an object with a .toHex method, formerly dec2hex)
// randomPointGenerator (an object with a .generate method, formerly ranPnts)
// materialAdjusterUI (formerly matgui)
// geometryAdjusterUI (formerly geogui)
// illuminationAdjusterUI (formerly lightgui)
// refreshCodeDisplay (formerly updateMeshCode)
// userDefinedTextureURL (formerly CUSTOM_TEXTURE)
// document, window (standard browser globals)

// ---------------------------------------------------------------------------------------------------------------------------
//
//     Visual Element Configuration
//
// ---------------------------------------------------------------------------------------------------------------------------

// Helper for Lathe points - renamed and refactored from lathePnts
const createCurvedPathPoints = (count) =>
  Array.from({ length: count }, (_, idx) =>
    new ThreedEngine.Vector3(
      Math.sin(idx * 0.4) * 30 + 100,
      0,
      (idx - 10) * 4
    )
  );

// Geometry factory - renamed and refactored from newGeometry
const shapeFactory = (shapeId, shapeParameters) => {
  const params = shapeParameters;

  const shapeConstructors = new Map([
    ['CUBE', () => new ThreedEngine.BoxGeometry(params.boxWidth, params.boxHeight, params.boxDepth)],
    ['SPHERE', () => new ThreedEngine.SphereGeometry(params.sphereRadius, params.sphereWidthSegments, params.sphereHeightSegments)],
    ['ICOSAHEDRON', () => new ThreedEngine.IcosahedronGeometry(params.polyhedronRadius, params.polyhedronDetail)],
    ['OCTAHEDRON', () => new ThreedEngine.OctahedronGeometry(params.polyhedronRadius, params.polyhedronDetail)],
    ['TETRAHEDRON', () => new ThreedEngine.TetrahedronGeometry(params.polyhedronRadius, params.polyhedronDetail)],
    ['CYLINDER', () => new ThreedEngine.CylinderGeometry(params.cylinderRadiusTop, params.cylinderRadiusBottom, params.cylinderHeight, params.cylinderRadialSegments, params.cylinderHeightSegments, params.cylinderOpenEnded)],
    ['TORUS', () => new ThreedEngine.TorusGeometry(params.torusRadius, params.torusTube, params.torusRadialSegments, params.torusTubularSegments, Math.PI * params.torusArc)],
    ['TORUS_KNOT', () => new ThreedEngine.TorusKnotGeometry(params.knotRadius, params.knotTube, params.knotRadialSegments, params.knotTubularSegments, params.knotP, params.knotQ, params.knotHeightSegments)],
    ['LATHE', () => new ThreedEngine.LatheGeometry(createCurvedPathPoints(params.lathePointsCount), params.latheSegments)],
    ['PLANE_GEOM', () => new ThreedEngine.PlaneGeometry(params.planeWidth, params.planeHeight, params.planeWidthSegments, params.planeHeightSegments)],
    ['CIRCLE', () => new ThreedEngine.CircleGeometry(params.circleRadius, params.circleSegments, params.circleThetaStart, Math.PI * params.circleThetaLength)],
    ['RING', () => new ThreedEngine.RingGeometry(params.ringInnerRadius, params.ringOuterRadius, params.ringThetaSegments, params.ringPhiSegments, params.ringThetaStart, Math.PI * params.ringThetaLength)],
    ['CONVEX', () => new ThreedEngine.ConvexGeometry(randomPointGenerator.generate(params.convexPointsCount))]
  ]);

  const constructorFn = shapeConstructors.get(shapeId);
  return constructorFn ? constructorFn() : null;
};

// Material factory - renamed and refactored from newMaterial
const surfaceAppearanceFactory = (materialId) => {
  const materialConstructors = new Map([
    ['NORMAL', () => new ThreedEngine.MeshNormalMaterial()],
    ['BASIC', () => new ThreedEngine.MeshBasicMaterial()],
    ['LAMBERT', () => new ThreedEngine.MeshLambertMaterial()],
    ['PHONG', () => new ThreedEngine.MeshPhongMaterial()]
  ]);

  const constructorFn = materialConstructors.get(materialId);
  return constructorFn ? constructorFn() : null;
};

// Main Renderable Entity (formerly MeshObj)
class MainRenderableEntity {
  #internalConfig = {
    visualShapeType: 'CUBE',
    surfaceType: 'NORMAL',
    usesTexture: false,
    textureIndex: 3,
    textureSources: ['white.jpg', 'mario.jpg', 'linen.jpg', 'crate.jpg', 'dots.jpg', 'rock_tile.jpg', 'water.jpg', 'wood.jpg', 'brillo.jpg', 'soup.jpg'],
    textureRepetition: 1,
    overallScale: 1,
    verticalPosition: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    smoothShadingEnabled: false,
    faceOrientation: 0, // 0: Front, 1: Back, 2: Double
    castsShadows: false,
    wireframeMode: false,
    wireframeThickness: 1,
    isTransparent: false,
    transparencyLevel: 1,
    baseColor: 0xdcdcdc,
    ambientColor: 0xffffff,
    emissiveColor: 0x000000,
    specularColor: 0x111111,
    shininessValue: 30,
    geometryParameters: {
      boxWidth: 200, boxHeight: 200, boxDepth: 200,
      sphereRadius: 150, sphereWidthSegments: 100, sphereHeightSegments: 100,
      polyhedronRadius: 150, polyhedronDetail: 0,
      cylinderRadiusTop: 100, cylinderRadiusBottom: 100, cylinderHeight: 200, cylinderRadialSegments: 50, cylinderHeightSegments: 50, cylinderOpenEnded: false,
      torusRadius: 100, torusTube: 40, torusRadialSegments: 40, torusTubularSegments: 40, torusArc: 2,
      lathePointsCount: 26, latheSegments: 20,
      knotRadius: 100, knotTube: 40, knotRadialSegments: 64, knotTubularSegments: 8, knotP: 2, knotQ: 3, knotHeightSegments: 1,
      planeWidth: 200, planeHeight: 200, planeWidthSegments: 4, planeHeightSegments: 4,
      circleRadius: 150, circleSegments: 50, circleThetaStart: 0, circleThetaLength: 2,
      ringInnerRadius: 150, ringOuterRadius: 50, ringThetaSegments: 50, ringPhiSegments: 5, ringThetaStart: 0, ringThetaLength: 2,
      convexPointsCount: 9,
    },
  };

  constructor() { }

  updateSetting(key, value) {
    if (this.#internalConfig.hasOwnProperty(key)) {
      this.#internalConfig[key] = value;
    } else if (this.#internalConfig.geometryParameters.hasOwnProperty(key)) {
      this.#internalConfig.geometryParameters[key] = value;
    }
  }

  assembleAndDisplay() {
    if (primaryVisual !== undefined) {
      renderSpace.remove(primaryVisual);
    }

    const currentShape = shapeFactory(this.#internalConfig.visualShapeType, this.#internalConfig.geometryParameters);
    const currentSurface = surfaceAppearanceFactory(this.#internalConfig.surfaceType);

    primaryVisual = new ThreedEngine.Mesh(currentShape, currentSurface);

    primaryVisual.material.shading = this.#internalConfig.smoothShadingEnabled ? ThreedEngine.SmoothShading : ThreedEngine.FlatShading;

    const hexColor = (c) => colorConverter.toHex(c);

    switch (this.#internalConfig.surfaceType) {
      case 'BASIC':
      case 'LAMBERT':
        primaryVisual.material.color.setHex(hexColor(this.#internalConfig.baseColor));
        break;
      case 'PHONG':
        primaryVisual.material.color.setHex(hexColor(this.#internalConfig.baseColor));
        primaryVisual.material.ambient.setHex(hexColor(this.#internalConfig.ambientColor));
        primaryVisual.material.emissive.setHex(hexColor(this.#internalConfig.emissiveColor));
        primaryVisual.material.specular.setHex(hexColor(this.#internalConfig.specularColor));
        primaryVisual.material.shininess = this.#internalConfig.shininessValue;
        break;
    }

    if (this.#internalConfig.usesTexture) {
      const texturePath = userDefinedTextureURL ? `../texturez/proxy.php?url=${userDefinedTextureURL}` : `../texturez/${this.#internalConfig.textureSources[this.#internalConfig.textureIndex]}`;
      const textureMap = ThreedEngine.ImageUtils.loadTexture(texturePath);
      primaryVisual.material.map = textureMap;
      textureMap.wrapS = textureMap.wrapT = ThreedEngine.RepeatWrapping;
      textureMap.repeat.set(this.#internalConfig.textureRepetition, this.#internalConfig.textureRepetition);
    }

    primaryVisual.material.side = [ThreedEngine.FrontSide, ThreedEngine.BackSide, ThreedEngine.DoubleSide][this.#internalConfig.faceOrientation];
    primaryVisual.material.wireframe = this.#internalConfig.wireframeMode;
    primaryVisual.material.wireframeLinewidth = this.#internalConfig.wireframeThickness;
    primaryVisual.material.transparent = this.#internalConfig.isTransparent;
    if (this.#internalConfig.isTransparent) {
      primaryVisual.material.opacity = this.#internalConfig.transparencyLevel;
    }

    primaryVisual.scale.set(this.#internalConfig.overallScale, this.#internalConfig.overallScale, this.#internalConfig.overallScale);
    primaryVisual.position.y = this.#internalConfig.verticalPosition;
    primaryVisual.rotation.set(this.#internalConfig.rotationX, this.#internalConfig.rotationY, this.#internalConfig.rotationZ);
    primaryVisual.castShadow = this.#internalConfig.castsShadows;

    renderSpace.add(primaryVisual);
    refreshCodeDisplay();
  }

  launchSurfaceEditor() {
    if (materialAdjusterUI === undefined) {
      materialAdjusterUI(this.#internalConfig.surfaceType);
    }
  }

  closeSurfaceEditor() {
    materialAdjusterUI.destroy();
    materialAdjusterUI = undefined;
  }

  launchShapeEditor() {
    if (geometryAdjusterUI === undefined) {
      geometryAdjusterUI(this.#internalConfig.visualShapeType);
    }
  }

  closeShapeEditor() {
    geometryAdjusterUI.destroy();
    geometryAdjusterUI = undefined;
  }

  promptForExternalTexture() {
    const overlayElement = document.createElement('div');
    overlayElement.id = 'textureInputOverlay';
    overlayElement.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.7); display: flex;
      justify-content: center; align-items: center; z-index: 1000;
    `;

    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      background: white; padding: 20px; border-radius: 5px;
      display: flex; flex-direction: column; gap: 10px;
    `;

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'Enter image URL here...';
    urlInput.style.width = '300px';
    urlInput.value = userDefinedTextureURL || 'paste a valid image url here';

    const applyButton = document.createElement('button');
    applyButton.textContent = 'Add Texture';
    applyButton.onclick = () => {
      userDefinedTextureURL = urlInput.value;
      this.assembleAndDisplay();
      document.body.removeChild(overlayElement);
    };

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => {
      document.body.removeChild(overlayElement);
    };

    urlInput.onkeypress = (event) => {
      if (event.key === 'Enter') {
        applyButton.click();
      }
    };

    inputContainer.append(urlInput, applyButton, cancelButton);
    overlayElement.appendChild(inputContainer);
    document.body.appendChild(overlayElement);
    urlInput.focus();

    console.log('External texture prompt initiated');
  }

  isConvexShape = false;
}

const primaryObjectController = new MainRenderableEntity();

// ---------------------------------------------------------------------------------------------------------------------------
//
//     Ground Surface Controller
//
// ---------------------------------------------------------------------------------------------------------------------------

class GroundSurfaceController {
  #surfaceConfig = {
    visibilityToggle: false,
    textureOptions: ['mario.jpg', 'linen.jpg', 'crate.jpg', 'dots.jpg', 'rock_tile.jpg', 'water.jpg', 'wood.jpg', 'white.jpg', 'brillo.jpg', 'soup.jpg'],
    selectedTextureIndex: 7,
    textureRepeatFactor: 80,
    overallScaling: 30,
    wireframeToggle: false,
    wireframeLineThickness: 1,
    wireframeScaling: 1,
  };

  configure(key, value) {
    if (this.#surfaceConfig.hasOwnProperty(key)) {
      this.#surfaceConfig[key] = value;
    }
  }

  generateTexturedSurface() {
    if (groundVisual !== undefined) {
      renderSpace.remove(groundVisual);
    }

    const baseGeometry = new ThreedEngine.PlaneGeometry(1000, 1000, 20, 20);
    const textureSource = `../texturez/${this.#surfaceConfig.textureOptions[this.#surfaceConfig.selectedTextureIndex]}`;
    const surfaceTexture = ThreedEngine.ImageUtils.loadTexture(textureSource);

    surfaceTexture.wrapS = surfaceTexture.wrapT = ThreedEngine.RepeatWrapping;
    surfaceTexture.repeat.set(this.#surfaceConfig.textureRepeatFactor, this.#surfaceConfig.textureRepeatFactor);

    const surfaceMaterial = new ThreedEngine.MeshPhongMaterial({ map: surfaceTexture });
    groundVisual = new ThreedEngine.Mesh(baseGeometry, surfaceMaterial);

    groundVisual.rotation.x = -Math.PI / 2;
    groundVisual.receiveShadow = true;
    groundVisual.scale.set(this.#surfaceConfig.overallScaling, this.#surfaceConfig.overallScaling, this.#surfaceConfig.overallScaling);
    renderSpace.add(groundVisual);
  }

  generateWireframeGrid() {
    if (groundGridVisual !== undefined) {
      renderSpace.remove(groundGridVisual);
    }

    const gridGeometry = new ThreedEngine.PlaneGeometry(1000, 1000, 100, 100);
    const gridMaterial = new ThreedEngine.MeshBasicMaterial({ color: 0x000000, wireframe: true, wireframeLinewidth: this.#surfaceConfig.wireframeLineThickness });
    groundGridVisual = new ThreedEngine.Mesh(gridGeometry, gridMaterial);

    groundGridVisual.scale.set(this.#surfaceConfig.wireframeScaling, this.#surfaceConfig.wireframeScaling, this.#surfaceConfig.wireframeScaling);
    groundGridVisual.rotation.x = -Math.PI / 2;
    renderSpace.add(groundGridVisual);
  }
}

const floorController = new GroundSurfaceController();

// ---------------------------------------------------------------------------------------------------------------------------
//
//     Illumination Manager
//
// ---------------------------------------------------------------------------------------------------------------------------

class IlluminationManager {
  #lightConfiguration = {
    ambientLightEnabled: true,
    ambientColor: 0x000000,
    hemisphereLightEnabled: true,
    hemisphereSkyColor: 0xffffff,
    hemisphereGroundColor: 0x000000,
    hemisphereIntensity: 0.2,
    directionalLightEnabled: true,
    directionalColor: 0xffffff,
    directionalIntensity: 0.1,
    directionalX: 0,
    directionalY: 1,
    directionalZ: 0,
    spotLight1Enabled: true,
    spotLight1Color: 0xffffff,
    spotLight1X: 100,
    spotLight1Y: 1000,
    spotLight1Z: 100,
    spotLight1Intensity: 0.1,
    spotLight1ShadowDarkness: 0.2,
    spotLight2Enabled: true,
    spotLight2Color: 0xffffff,
    spotLight2X: 100,
    spotLight2Y: 1000,
    spotLight2Z: 100,
    spotLight2Intensity: 0.1,
    spotLight2ShadowDarkness: 0.2,
  };

  updateLightSetting(key, value) {
    if (this.#lightConfiguration.hasOwnProperty(key)) {
      this.#lightConfiguration[key] = value;
    }
  }

  refreshAllLights() {
    const config = this.#lightConfiguration;
    const hexColor = (c) => colorConverter.toHex(c);

    if (overallIllumination !== undefined) renderSpace.remove(overallIllumination);
    if (config.ambientLightEnabled) {
      overallIllumination = new ThreedEngine.AmbientLight();
      overallIllumination.color.setHex(hexColor(config.ambientColor));
      renderSpace.add(overallIllumination);
    }

    if (skyGroundLight !== undefined) renderSpace.remove(skyGroundLight);
    if (config.hemisphereLightEnabled) {
      skyGroundLight = new ThreedEngine.HemisphereLight();
      skyGroundLight.color.setHex(hexColor(config.hemisphereSkyColor));
      skyGroundLight.groundColor.setHex(hexColor(config.hemisphereGroundColor));
      skyGroundLight.intensity = config.hemisphereIntensity;
      renderSpace.add(skyGroundLight);
    }

    if (distantSunLight !== undefined) renderSpace.remove(distantSunLight);
    if (config.directionalLightEnabled) {
      distantSunLight = new ThreedEngine.DirectionalLight();
      distantSunLight.color.setHex(hexColor(config.directionalColor));
      distantSunLight.intensity = config.directionalIntensity;
      distantSunLight.position.set(config.directionalX, config.directionalY, config.directionalZ);
      distantSunLight.castShadow = true;
      renderSpace.add(distantSunLight);
    }

    if (focusedLightA !== undefined) renderSpace.remove(focusedLightA);
    if (config.spotLight1Enabled) {
      focusedLightA = new ThreedEngine.SpotLight(0xffffff, 0.5);
      focusedLightA.color.setHex(hexColor(config.spotLight1Color));
      focusedLightA.position.set(config.spotLight1X, config.spotLight1Y, config.spotLight1Z);
      focusedLightA.castShadow = true;
      focusedLightA.shadow.darkness = config.spotLight1ShadowDarkness;
      focusedLightA.intensity = config.spotLight1Intensity;
      renderSpace.add(focusedLightA);
    }

    if (focusedLightB !== undefined) renderSpace.remove(focusedLightB);
    if (config.spotLight2Enabled) {
      focusedLightB = new ThreedEngine.SpotLight(0xffffff, 0.5);
      focusedLightB.color.setHex(hexColor(config.spotLight2Color));
      focusedLightB.position.set(config.spotLight2X, config.spotLight2Y, config.spotLight2Z);
      focusedLightB.castShadow = true;
      focusedLightB.shadow.darkness = config.spotLight2ShadowDarkness;
      focusedLightB.intensity = config.spotLight2Intensity;
      renderSpace.add(focusedLightB);
    }
  }

  openLightingPanel() {
    if (illuminationAdjusterUI === undefined) {
      illuminationAdjusterUI();
    }
  }

  closeLightingPanel() {
    illuminationAdjusterUI.destroy();
    illuminationAdjusterUI = undefined;
  }
}

const illuminationController = new IlluminationManager();

// ---------------------------------------------------------------------------------------------------------------------------
//
//     Scene Environment Settings
//
// ---------------------------------------------------------------------------------------------------------------------------

class SceneEnvironmentSettings {
  #envConfig = {
    shadowRenderingEnabled: false,
    fogEnabled: false,
    fogColor: 0xf2f7ff,
    fogNear: 1,
    fogFar: 9000,
    resetValue: 100000,
  };

  updateEnvironmentSetting(key, value) {
    if (this.#envConfig.hasOwnProperty(key)) {
      this.#envConfig[key] = value;
    }
  }

  configureFog() {
    if (this.#envConfig.fogEnabled) {
      renderSpace.fog = new ThreedEngine.Fog(this.#envConfig.fogColor, this.#envConfig.fogNear, this.#envConfig.fogFar);
    } else {
      renderSpace.fog = null;
    }
  }
}

const environmentController = new SceneEnvironmentSettings();

// ---------------------------------------------------------------------------------------------------------------------------
//
//     Code Snippet Handler
//
// ---------------------------------------------------------------------------------------------------------------------------

class CodeSnippetHandler {
  #snippetConfig = {
    backgroundDisplay: false,
  };

  updateSnippetSetting(key, value) {
    if (this.#snippetConfig.hasOwnProperty(key)) {
      this.#snippetConfig[key] = value;
    }
  }

  highlightCodeSnippet(targetElementId) {
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
      console.warn(`Element with ID '${targetElementId}' not found for code highlighting.`);
      return;
    }

    if (window.getSelection && document.createRange) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(targetElement);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (document.body.createTextRange) {
      const textRange = document.body.createTextRange();
      textRange.moveToElementText(targetElement);
      textRange.select();
    }
  }
}

const codeDisplayManager = new CodeSnippetHandler();