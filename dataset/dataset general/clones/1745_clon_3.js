// -----------------------------------------------------------------------------------------------------------------------------
//
//     SCENE ELEMENT CONSTRUCTORS
//
// -----------------------------------------------------------------------------------------------------------------------------

// Utility for converting hexadecimal color strings to decimal numbers for THREE.js
const colorValueConverter = (hexInput) => {
    if (typeof hexInput === 'number') {
        return hexInput; // Already a number
    }
    if (typeof hexInput === 'string' && hexInput.startsWith('0x')) {
        return parseInt(hexInput, 16);
    }
    // Fallback or error handling for invalid input
    return 0x000000;
};

/*
 * Generates an array of THREE.Vector3 points suitable for LatheGeometry.
 * @param {number} pointCount - The number of points to generate.
 * @returns {Array<THREE.Vector3>} An array of 3D vectors.
 */
function generatePathVertices(pointCount) {
    const minPoints = 5; // Minimum reasonable points for a lathe
    const actualPointCount = Math.max(pointCount || 50, minPoints); // Ensure minimum points
    const angleIncrement = 0.4;
    const amplitude = 30;
    const offsetX = 100;
    const startZOffset = -40;
    const zSpacing = 4;

    let pathPoints = [];
    for (let currentIdx = 0; currentIdx < actualPointCount; currentIdx++) {
        const xPos = Math.sin(currentIdx * angleIncrement) * amplitude + offsetX;
        const zPos = (currentIdx - 10) * zSpacing; // Offset for z-axis
        pathPoints.push(new THREE.Vector3(xPos, 0, zPos + startZOffset));
    }
    return pathPoints;
}

/*
 * Creates a specific THREE.Geometry based on an index.
 * @param {number} shapeIdentifier - Index indicating which geometry to create.
 * @returns {THREE.Geometry} A THREE.js geometry object.
 */
function createGeometricPrimitive(shapeIdentifier) {
    if (typeof THREE === 'undefined' || !THREE.Geometry) {
        console.error("THREE.js library not loaded or Geometry not available.");
        return new THREE.BoxGeometry(1, 1, 1); // Return a fallback geometry
    }

    // Reference to the global configuration object for geometry parameters
    const currentSettings = sceneObjectSettings;

    // Define a collection of geometry constructors
    const geometryConstructors = [
        () => new THREE.BoxGeometry(currentSettings.boxWidth, currentSettings.boxHeight, currentSettings.boxDepth),
        () => new THREE.SphereGeometry(currentSettings.sphereRadius, currentSettings.sphereWidthSegments, currentSettings.sphereHeightSegments),
        () => new THREE.IcosahedronGeometry(currentSettings.polyhedronRadius, currentSettings.polyhedronDetail),
        () => new THREE.OctahedronGeometry(currentSettings.polyhedronRadius, currentSettings.polyhedronDetail),
        () => new THREE.TetrahedronGeometry(currentSettings.polyhedronRadius, currentSettings.polyhedronDetail),
        () => new THREE.CylinderGeometry(currentSettings.cylinderRadiusTop, currentSettings.cylinderRadiusBottom, currentSettings.cylinderHeight, currentSettings.cylinderRadialSegments, currentSettings.cylinderHeightSegments, currentSettings.cylinderOpenEnded),
        () => new THREE.TorusGeometry(currentSettings.torusMainRadius, currentSettings.torusTubeRadius, currentSettings.torusRadialSegments, currentSettings.torusTubularSegments, Math.PI * currentSettings.torusArc),
        () => new THREE.TorusKnotGeometry(currentSettings.knotRadius, currentSettings.knotTube, currentSettings.knotRadialSegments, currentSettings.knotTubularSegments, currentSettings.knotP, currentSettings.knotQ, currentSettings.knotHeight),
        () => new THREE.LatheGeometry(generatePathVertices(currentSettings.lathePoints), currentSettings.latheSegments),
        () => new THREE.PlaneGeometry(currentSettings.planeWidth, currentSettings.planeHeight, currentSettings.planeWidthSegments, currentSettings.planeHeightSegments),
        () => new THREE.CircleGeometry(currentSettings.circleRadius, currentSettings.circleSegments, currentSettings.circleThetaStart, Math.PI * currentSettings.circleThetaLength),
        () => new THREE.RingGeometry(currentSettings.ringInnerRadius, currentSettings.ringOuterRadius, currentSettings.ringThetaSegments, currentSettings.ringPhiSegments, currentSettings.ringThetaStart, Math.PI * currentSettings.ringThetaLength),
        // Note: ranPnts is not defined in the original snippet, assuming it's a global helper.
        // For Type III, I'll assume it generates an array of THREE.Vector3 for ConvexGeometry.
        () => new THREE.ConvexGeometry(ranPnts(currentSettings.convexPointCount))
    ];

    // Validate the identifier and return the corresponding geometry, or a default.
    if (shapeIdentifier >= 0 && shapeIdentifier < geometryConstructors.length) {
        return geometryConstructors[shapeIdentifier]();
    } else {
        console.warn(`Invalid geometry identifier: ${shapeIdentifier}. Returning default BoxGeometry.`);
        return geometryConstructors[0](); // Default to BoxGeometry
    }
}

/*
 * Retrieves a standard THREE.Material based on an index.
 * @param {number} materialKindIndex - Index indicating which material type to create.
 * @returns {THREE.Material} A THREE.js material object.
 */
function obtainStandardMaterial(materialKindIndex) {
    if (typeof THREE === 'undefined' || !THREE.Material) {
        console.error("THREE.js library not loaded or Material not available.");
        return new THREE.MeshBasicMaterial({ color: 0xcccccc }); // Fallback material
    }

    const materialPresets = [
        new THREE.MeshNormalMaterial(),
        new THREE.MeshBasicMaterial(),
        new THREE.MeshLambertMaterial(),
        new THREE.MeshPhongMaterial()
    ];

    if (materialKindIndex >= 0 && materialKindIndex < materialPresets.length) {
        return materialPresets[materialKindIndex];
    } else {
        console.warn(`Invalid material kind index: ${materialKindIndex}. Returning default MeshBasicMaterial.`);
        return materialPresets[1]; // Default to MeshBasicMaterial
    }
}

// -----------------------------------------
//                                         \\
//     SCENE MESH CONFIGURATION            ||
//                                         //
// -----------------------------------------

function SceneObjectConfigurator() {
    // Core properties for object representation
    this.activeGeometryType = 0;
    this.activeMaterialType = 0;
    this.useTextureMap = false;
    this.textureIndex = 3; // Default texture index
    this.availableTextureFiles = ['white.jpg', 'mario.jpg', 'linen.jpg', 'crate.jpg', 'dots.jpg', 'rock_tile.jpg', 'water.jpg', 'wood.jpg', 'brillo.jpg', 'soup.jpg'];
    this.textureRepeatFactor = 1;
    this.uniformScaleFactor = 1;
    this.positionYOffset = 0;
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    this.smoothShadingEnabled = false;
    this.faceCullingMode = 0; // 0: Front, 1: Back, 2: Double
    this.enableShadowCasting = false;

    // Material specific properties (popup GUI)
    this.renderWireframe = false;
    this.wireframeLineThickness = 1;
    this.enableTransparency = false;
    this.alphaTransparency = 1;
    this.mainColor = 0xdcdcdc;
    this.ambientLightColor = 0xffffff;
    this.emissiveLightColor = 0x000000;
    this.specularLightColor = 0x111111;
    this.specularShininess = 30;

    // Geometry specific parameters (popup GUI)
    this.boxWidth = 200;
    this.boxHeight = 200;
    this.boxDepth = 200;
    this.sphereRadius = 150;
    this.sphereWidthSegments = 100;
    this.sphereHeightSegments = 100;
    this.polyhedronRadius = 150;
    this.polyhedronDetail = 0;
    this.cylinderRadiusTop = 100;
    this.cylinderRadiusBottom = 100;
    this.cylinderHeight = 200;
    this.cylinderRadialSegments = 50;
    this.cylinderHeightSegments = 50;
    this.cylinderOpenEnded = false;
    this.torusMainRadius = 100;
    this.torusTubeRadius = 40;
    this.torusRadialSegments = 40;
    this.torusTubularSegments = 40;
    this.torusArc = 2; // Multiplier for Math.PI
    this.lathePoints = 26;
    this.latheSegments = 20;
    this.knotRadius = 100;
    this.knotTube = 40;
    this.knotRadialSegments = 64;
    this.knotTubularSegments = 8;
    this.knotP = 2;
    this.knotQ = 3;
    this.knotHeight = 1;
    this.planeWidth = 200;
    this.planeHeight = 200;
    this.planeWidthSegments = 4;
    this.planeHeightSegments = 4;
    this.circleRadius = 150;
    this.circleSegments = 50;
    this.circleThetaStart = 0;
    this.circleThetaLength = 2; // Multiplier for Math.PI
    this.ringInnerRadius = 150;
    this.ringOuterRadius = 50;
    this.ringThetaSegments = 50;
    this.ringPhiSegments = 5;
    this.ringThetaStart = 0;
    this.ringThetaLength = 2; // Multiplier for Math.PI
    this.convexPointCount = 9;

    /**
     * Assembles the 3D object in the scene based on current settings.
     * Removes existing mesh, creates a new one, applies materials, textures, and transformations.
     */
    this.assembleObject = function() {
        if (typeof THREE === 'undefined' || typeof scene === 'undefined') {
            console.error("THREE.js or scene object not initialized. Cannot assemble object.");
            return;
        }

        // Remove previous mesh from the scene if it exists
        if (typeof mesh !== 'undefined' && mesh !== null) {
            scene.remove(mesh);
        }

        // Create new mesh with chosen geometry and material
        mesh = new THREE.Mesh(
            createGeometricPrimitive(this.activeGeometryType),
            obtainStandardMaterial(this.activeMaterialType)
        );

        // Apply shading model
        mesh.material.shading = this.smoothShadingEnabled ? THREE.SmoothShading : THREE.FlatShading;

        // Update material colors based on type
        const currentMaterial = mesh.material;
        if (this.activeMaterialType === 2 || this.activeMaterialType === 1) { // Lambert or Basic
            currentMaterial.color.setHex(colorValueConverter(this.mainColor));
        } else if (this.activeMaterialType === 3) { // Phong
            currentMaterial.color.setHex(colorValueConverter(this.mainColor));
            currentMaterial.ambient.setHex(colorValueConverter(this.ambientLightColor));
            currentMaterial.emissive.setHex(colorValueConverter(this.emissiveLightColor));
            currentMaterial.specular.setHex(colorValueConverter(this.specularLightColor));
            currentMaterial.shininess = this.specularShininess;
        }

        // Handle texture mapping
        if (this.useTextureMap) {
            let texturePath = '';
            if (typeof CUSTOM_TEXTURE === 'undefined' || CUSTOM_TEXTURE === null || CUSTOM_TEXTURE === '') {
                texturePath = '../texturez/' + this.availableTextureFiles[this.textureIndex];
            } else {
                texturePath = '../texturez/proxy.php?url=' + CUSTOM_TEXTURE;
            }

            if (texturePath) {
                const textureMap = THREE.ImageUtils.loadTexture(texturePath);
                currentMaterial.map = textureMap;
                textureMap.wrapS = textureMap.wrapT = THREE.RepeatWrapping;
                textureMap.repeat.set(this.textureRepeatFactor, this.textureRepeatFactor);
            }
        } else {
            currentMaterial.map = null; // Ensure no texture map is applied if useTextureMap is false
        }


        // Set face culling side
        switch (this.faceCullingMode) {
            case 0:
                currentMaterial.side = THREE.FrontSide;
                break;
            case 1:
                currentMaterial.side = THREE.BackSide;
                break;
            case 2:
                currentMaterial.side = THREE.DoubleSide;
                break;
            default:
                currentMaterial.side = THREE.FrontSide; // Default
        }

        // Apply wireframe and transparency settings
        currentMaterial.wireframe = this.renderWireframe;
        currentMaterial.wireframeLinewidth = this.wireframeLineThickness;
        currentMaterial.transparent = this.enableTransparency;
        if (this.enableTransparency) {
            currentMaterial.opacity = this.alphaTransparency;
        }

        // Apply transformations
        mesh.scale.set(this.uniformScaleFactor, this.uniformScaleFactor, this.uniformScaleFactor);
        mesh.position.y = this.positionYOffset;
        mesh.rotation.x = this.rotationX;
        mesh.rotation.y = this.rotationY;
        mesh.rotation.z = this.rotationZ;
        mesh.castShadow = this.enableShadowCasting;

        // Add the new mesh to the scene
        scene.add(mesh);
        // Call a global update function, assuming `refreshSceneCodeDisplay` exists
        if (typeof refreshSceneCodeDisplay === 'function') {
            refreshSceneCodeDisplay();
        }
    };

    // GUI Interaction Methods (assuming dat.GUI context)
    this.displayMaterialEditor = function() {
        if (typeof materialPropertiesGUI === 'function' && typeof guiMaterialController === 'undefined') {
            guiMaterialController = materialPropertiesGUI(this.activeMaterialType);
        }
    };
    this.hideMaterialEditor = function() {
        if (typeof guiMaterialController !== 'undefined' && guiMaterialController !== null) {
            guiMaterialController.destroy();
            guiMaterialController = undefined;
        }
    };
    this.displayGeometryEditor = function() {
        if (typeof geometryParametersGUI === 'function' && typeof guiGeometryController === 'undefined') {
            guiGeometryController = geometryParametersGUI(this.activeGeometryType);
        }
    };
    this.hideGeometryEditor = function() {
        if (typeof guiGeometryController !== 'undefined' && guiGeometryController !== null) {
            guiGeometryController.destroy();
            guiGeometryController = undefined;
        }
    };

    /**
     * Prompts the user for a custom image URL to be used as a texture.
     * Creates a temporary DOM element for input.
     */
    this.promptForCustomTexture = function() {
        // Check for an existing popup to prevent multiple instances
        let existingPopup = document.getElementById("textureInputPopup");
        if (existingPopup) {
            document.body.removeChild(existingPopup);
        }

        const inputContainer = document.createElement('div');
        inputContainer.id = "textureInputPopup";
        inputContainer.style.position = 'absolute';
        inputContainer.style.top = '50%';
        inputContainer.style.left = '50%';
        inputContainer.style.transform = 'translate(-50%, -50%)';
        inputContainer.style.padding = '20px';
        inputContainer.style.background = 'rgba(0,0,0,0.8)';
        inputContainer.style.color = 'white';
        inputContainer.style.zIndex = '10000';
        inputContainer.style.borderRadius = '5px';
        inputContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        inputContainer.style.display = 'flex';
        inputContainer.style.flexDirection = 'column';
        inputContainer.style.gap = '10px';

        const urlInput = document.createElement('input');
        urlInput.id = "textureURLField";
        urlInput.type = "text";
        urlInput.style.width = "300px";
        urlInput.style.padding = "8px";
        urlInput.style.border = "1px solid #ccc";
        urlInput.style.borderRadius = "3px";
        urlInput.value = 'https://example.com/your-image.jpg'; // Example URL

        const applyButton = document.createElement('button');
        applyButton.textContent = "Apply Texture";
        applyButton.style.padding = "8px 15px";
        applyButton.style.background = "#007bff";
        applyButton.style.color = "white";
        applyButton.style.border = "none";
        applyButton.style.borderRadius = "3px";
        applyButton.style.cursor = "pointer";

        // Event handler for applying texture and closing popup
        const applyTextureAndClose = () => {
            const enteredURL = urlInput.value.trim();
            if (enteredURL && (enteredURL.startsWith('http://') || enteredURL.startsWith('https://'))) {
                window.CUSTOM_TEXTURE = enteredURL; // Assign to global CUSTOM_TEXTURE
                this.useTextureMap = true; // Automatically enable texture mapping
                this.assembleObject(); // Re-assemble the mesh with the new texture
            } else {
                alert("Please enter a valid image URL.");
                window.CUSTOM_TEXTURE = undefined; // Clear invalid custom texture
            }
            document.body.removeChild(inputContainer);
        };

        urlInput.onkeypress = (event) => {
            if (event.key === 'Enter') {
                applyTextureAndClose();
            }
        };
        applyButton.onclick = applyTextureAndClose;

        inputContainer.appendChild(urlInput);
        inputContainer.appendChild(applyButton);
        document.body.appendChild(inputContainer);
    };
}
const sceneObjectSettings = new SceneObjectConfigurator();

// -----------------------------------------
//                                         \\
//     GROUND PLANE MANAGEMENT             ||
//                                         //
// -----------------------------------------

function GroundPlaneManager() {
    this.isGroundVisible = false;
    this.groundTextureOptions = ['mario.jpg', 'linen.jpg', 'crate.jpg', 'dots.jpg', 'rock_tile.jpg', 'water.jpg', 'wood.jpg', 'white.jpg', 'brillo.jpg', 'soup.jpg'];
    this.selectedTextureIndex = 7; // Default to 'white.jpg'
    this.textureTileFactor = 80;
    this.groundScaleFactor = 30;
    this.isWireframeVisible = false;
    this.wireframeLineWeight = 1;
    this.wireframeScaleFactor = 1;

    /**
     * Renders or updates the main ground plane in the scene.
     */
    this.renderGroundPlane = function() {
        if (typeof THREE === 'undefined' || typeof scene === 'undefined') {
            console.error("THREE.js or scene object not initialized. Cannot render ground plane.");
            return;
        }

        if (typeof globalGroundPlane !== 'undefined' && globalGroundPlane !== null) {
            scene.remove(globalGroundPlane);
        }

        const groundGeometry = new THREE.PlaneGeometry(1000, 1000, 20, 20);
        const textureLoader = THREE.ImageUtils.loadTexture('../texturez/' + this.groundTextureOptions[this.selectedTextureIndex]);
        const groundMaterial = new THREE.MeshPhongMaterial({ map: textureLoader });

        textureLoader.wrapS = textureLoader.wrapT = THREE.RepeatWrapping;
        textureLoader.repeat.set(this.textureTileFactor, this.textureTileFactor);

        globalGroundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        globalGroundPlane.rotation.x = -Math.PI / 2; // Orient horizontally
        globalGroundPlane.receiveShadow = true;
        globalGroundPlane.scale.set(this.groundScaleFactor, this.groundScaleFactor, this.groundScaleFactor);
        scene.add(globalGroundPlane);
    };

    /**
     * Renders or updates a wireframe overlay for the ground plane.
     */
    this.renderWireframeOverlay = function() {
        if (typeof THREE === 'undefined' || typeof scene === 'undefined') {
            console.error("THREE.js or scene object not initialized. Cannot render wireframe overlay.");
            return;
        }

        if (typeof globalWireframePlane !== 'undefined' && globalWireframePlane !== null) {
            scene.remove(globalWireframePlane);
        }

        const wireframeGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true,
            wireframeLinewidth: this.wireframeLineWeight
        });

        globalWireframePlane = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        globalWireframePlane.scale.set(this.wireframeScaleFactor, this.wireframeScaleFactor, this.wireframeScaleFactor);
        globalWireframePlane.rotation.x = -Math.PI / 2; // Match ground plane orientation
        scene.add(globalWireframePlane);
    };
}
const groundSettings = new GroundPlaneManager();

// -----------------------------------------
//                                         \\
//     SCENE ILLUMINATION CONTROL          ||
//                                         //
// -----------------------------------------

function SceneIlluminationController() {
    // Ambient Light settings
    this.enableAmbientLight = true;
    this.ambientLightColorValue = 0x000000;

    // Hemisphere Light settings
    this.enableHemisphereLight = true;
    this.hemisphereSkyColor = 0xffffff;
    this.hemisphereGroundColor = 0x000000;
    this.hemisphereIntensity = 0.2;

    // Directional Light settings
    this.enableDirectionalLight = true;
    this.directionalLightColor = 0xffffff;
    this.directionalIntensity = 0.1;
    this.directionalPosX = 0;
    this.directionalPosY = 1;
    this.directionalPosZ = 0;

    // Primary Spotlight settings
    this.enablePrimarySpotlight = true;
    this.primarySpotlightColor = 0xffffff;
    this.primarySpotlightX = 100;
    this.primarySpotlightY = 1000;
    this.primarySpotlightZ = 100;
    this.primarySpotlightIntensity = 0.1;
    this.primarySpotlightShadowDarkness = 0.2;

    // Secondary Spotlight settings
    this.enableSecondarySpotlight = true;
    this.secondarySpotlightColor = 0xffffff;
    this.secondarySpotlightX = 100;
    this.secondarySpotlightY = 1000;
    this.secondarySpotlightZ = 100;
    this.secondarySpotlightIntensity = 0.1;
    this.secondarySpotlightShadowDarkness = 0.2;

    /**
     * Creates or updates the ambient light source in the scene.
     */
    this.createAmbientLightSource = function() {
        if (typeof THREE === 'undefined' || typeof scene === 'undefined') {
            console.error("THREE.js or scene object not initialized. Cannot create ambient light.");
            return;
        }
        if (typeof globalAmbientLight !== 'undefined' && globalAmbientLight !== null) {
            scene.remove(globalAmbientLight);
        }
        globalAmbientLight = new THREE.AmbientLight(colorValueConverter(this.ambientLightColorValue));
        scene.add(globalAmbientLight);
    };

    /**
     * Creates or updates the hemispheric light source in the scene.
     */
    this.createHemisphericLight = function() {
        if (typeof THREE === 'undefined' || typeof scene === 'undefined') {
            console.error("THREE.js or scene object not initialized. Cannot create hemispheric light.");
            return;
        }
        if (typeof globalHemisphereLight !== 'undefined' && globalHemisphereLight !== null) {
            scene.remove(globalHemisphereLight);
        }
        globalHemisphereLight = new THREE.HemisphereLight(
            colorValueConverter(this.hemisphereSkyColor),
            colorValueConverter(this.hemisphereGroundColor),
            this.hemisphereIntensity
        );
        scene.add(globalHemisphereLight);
    };

    /**
     * Creates or updates the directional light source in the scene.
     */
    this.createDirectionalLight = function() {
        if (typeof THREE === 'undefined' || typeof scene === 'undefined') {
            console.error("THREE.js or scene object not initialized. Cannot create directional light.");
            return;
        }
        if (typeof globalDirectionalLight !== 'undefined' && globalDirectionalLight !== null) {
            scene.remove(globalDirectionalLight);
        }
        globalDirectionalLight = new THREE.DirectionalLight(colorValueConverter(this.directionalLightColor), this.directionalIntensity);
        globalDirectionalLight.position.set(this.directionalPosX, this.directionalPosY, this.directionalPosZ);
        globalDirectionalLight.castShadow = true;
        scene.add(globalDirectionalLight);
    };

    /**
     * Creates or updates the primary spotlight in the scene.
     */
    this.createPrimarySpotlight = function() {
        if (typeof THREE === 'undefined' || typeof scene === 'undefined') {
            console.error("THREE.js or scene object not initialized. Cannot create primary spotlight.");
            return;
        }
        if (typeof globalSpotlightOne !== 'undefined' && globalSpotlightOne !== null) {
            scene.remove(globalSpotlightOne);
        }
        globalSpotlightOne = new THREE.SpotLight(colorValueConverter(this.primarySpotlightColor), this.primarySpotlightIntensity);
        globalSpotlightOne.position.set(this.primarySpotlightX, this.primarySpotlightY, this.primarySpotlightZ);
        globalSpotlightOne.castShadow = true;
        globalSpotlightOne.shadowDarkness = this.primarySpotlightShadowDarkness;
        scene.add(globalSpotlightOne);
    };

    /**
     * Creates or updates the secondary spotlight in the scene.
     */
    this.createSecondarySpotlight = function() {
        if (typeof THREE === 'undefined' || typeof scene === 'undefined') {
            console.error("THREE.js or scene object not initialized. Cannot create secondary spotlight.");
            return;
        }
        if (typeof globalSpotlightTwo !== 'undefined' && globalSpotlightTwo !== null) {
            scene.remove(globalSpotlightTwo);
        }
        globalSpotlightTwo = new THREE.SpotLight(colorValueConverter(this.secondarySpotlightColor), this.secondarySpotlightIntensity);
        globalSpotlightTwo.position.set(this.secondarySpotlightX, this.secondarySpotlightY, this.secondarySpotlightZ);
        globalSpotlightTwo.castShadow = true;
        globalSpotlightTwo.shadowDarkness = this.secondarySpotlightShadowDarkness;
        scene.add(globalSpotlightTwo);
    };

    // GUI Interaction Methods
    this.openLightEditor = function() {
        if (typeof lightConfigurationGUI === 'function' && typeof guiLightController === 'undefined') {
            guiLightController = lightConfigurationGUI();
        }
    };
    this.closeLightEditor = function() {
        if (typeof guiLightController !== 'undefined' && guiLightController !== null) {
            guiLightController.destroy();
            guiLightController = undefined;
        }
    };
}
const illuminationSettings = new SceneIlluminationController();

// -----------------------------------------
//                                         \\
//     SCENE ENVIRONMENT SETTINGS          ||
//                                         //
// -----------------------------------------

function SceneEnvironmentSettings() {
    this.shadowRenderingEnabled = false;
    this.fogEffectEnabled = false;
    this.fogColorValue = 0xf2f7ff;
    this.fogNearDistance = 1;
    this.fogFarDistance = 9000;

    /**
     * Applies or updates the fog effect in the scene.
     */
    this.applyFogEffect = function() {
        if (typeof THREE === 'undefined' || typeof scene === 'undefined') {
            console.error("THREE.js or scene object not initialized. Cannot apply fog.");
            return;
        }
        if (this.fogEffectEnabled) {
            scene.fog = new THREE.Fog(colorValueConverter(this.fogColorValue), this.fogNearDistance, this.fogFarDistance);
        } else {
            scene.fog = null; // Disable fog
        }
    };
}
const environmentSetup = new SceneEnvironmentSettings();

// -----------------------------------------
//                                         \\
//     CODE SNIPPET DISPLAY UTILITY        ||
//                                         //
// -----------------------------------------

function CodeSnippetDisplay() {
    this.hasBackgroundTheme = false; // A conceptual property, not directly used in the provided code

    /**
     * Selects the text content of the mesh configuration display area.
     */
    this.highlightMeshConfiguration = function() {
        const currentDocument = document;
        const targetElement = currentDocument.getElementById('meshConfigurationOutput'); // Renamed ID

        if (!targetElement) {
            console.warn("Target element 'meshConfigurationOutput' not found for selection.");
            return;
        }

        // Standard way to select text in modern browsers
        if (window.getSelection) {
            const selection = window.getSelection();
            const range = currentDocument.createRange();
            range.selectNodeContents(targetElement);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        // Fallback for older IE versions
        else if (currentDocument.body.createTextRange) {
            const range = currentDocument.body.createTextRange();
            range.moveToElementText(targetElement);
            range.select();
        }
    };
}
const snippetManager = new CodeSnippetDisplay();