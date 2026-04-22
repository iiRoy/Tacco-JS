/*
 * Core module for rendering a dynamic 3D visual element within a web page.
 * This script leverages the Three.js library to display an interactive,
 * rotating box, demonstrating fundamental 3D graphics concepts.
 *
 * It's structured as an Immediately Invoked Function Expression (IIFE)
 * to encapsulate its scope and manage dependencies.
 */
const visualizerModule = (function () {
    // --- Internal Configuration and State Variables ---
    let graphicEngine = null; // The WebGL renderer instance.
    let displayAreaElement = null; // The jQuery object for the main container.
    let currentRotationAngle = 0.0; // Tracks the object's rotation in degrees.

    // Define fixed dimensions for the rendering canvas.
    const renderingDimensions = {
        canvasWidth: 600,
        canvasHeight: 400
    };

    // Path to the texture image asset.
    const assetTexturePath = 'Content/me.jpg';

    // --- Utility Functions ---

    /**
     * Converts an angle from degrees to radians.
     * @param {number} degreesValue - The angle in degrees.
     * @returns {number} The angle in radians.
     */
    const degreesToRadiansConverter = (degreesValue) => (Math.PI / 180) * degreesValue;

    /**
     * Performs a basic check for WebGL support and required DOM elements.
     * Displays a fallback message if conditions are not met.
     * @param {jQuery} targetDomContainer - The jQuery object of the container element.
     * @returns {boolean} True if environment seems suitable, false otherwise.
     */
    const verifyEnvironmentReadiness = (targetDomContainer) => {
        // Simple check for WebGL context availability.
        if (typeof WebGLRenderingContext === 'undefined') {
            console.warn("WebGL rendering context is not available in this browser.");
            targetDomContainer.children().first().append(
                '<div id="compatibilityNotice" style="height:400px; text-align:center; padding-top: 30px;">' +
                '<span>Your browser may not support WebGL.</span><br/>' +
                '<a href="https://get.webgl.org/" target="_blank">Check WebGL status here</a>' +
                '</div>'
            );
            return false;
        }

        // Ensure the target container element exists.
        if (!targetDomContainer || targetDomContainer.length === 0) {
            console.error("Target display container not found. Cannot initialize visualization.");
            return false;
        }

        // Additional check for Three.js library presence.
        if (typeof THREE === 'undefined') {
            console.error("THREE.js library not detected. Please ensure it's loaded before running.");
            targetDomContainer.children().first().append(
                '<div style="color: red; text-align: center; padding: 20px;">' +
                '<span>Error: THREE.js library not loaded.</span>' +
                '</div>'
            );
            return false;
        }

        return true;
    };

    // --- Three.js Component Builders ---

    /**
     * Initializes and configures the WebGL renderer.
     * @returns {HTMLElement} The DOM element representing the renderer's canvas.
     */
    const setupRenderer = () => {
        graphicEngine = new THREE.WebGLRenderer({ antialias: true }); // Enable anti-aliasing for smoother edges.
        graphicEngine.setSize(renderingDimensions.canvasWidth, renderingDimensions.canvasHeight);
        graphicEngine.domElement.id = 'threeJsRenderSurface'; // Assign a unique ID to the canvas.
        return graphicEngine.domElement;
    };

    /**
     * Creates and positions the scene camera.
     * @returns {THREE.PerspectiveCamera} The configured camera instance.
     */
    const createSceneCamera = () => {
        // Using a slightly different FOV and clipping planes.
        const activeCamera = new THREE.PerspectiveCamera(55, renderingDimensions.canvasWidth / renderingDimensions.canvasHeight, 0.75, 1100);
        activeCamera.position.z = 520; // Adjust camera's depth position.
        return activeCamera;
    };

    /**
     * Prepares an array of materials for the 3D box, all sharing the same texture.
     * @returns {Array<THREE.Material>} An array containing 6 instances of the texture material.
     */
    const generateBoxFaceMaterials = () => {
        const faceMaterials = [];
        const singleTextureLayer = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(assextTexturePath) // Load texture from the defined path.
        });

        // Apply the same texture to all six faces of the box.
        for (let materialIndex = 0; materialIndex < 6; materialIndex++) {
            faceMaterials.push(singleTextureLayer);
        }
        return faceMaterials;
    };

    /**
     * Constructs the 3D box geometry and mesh.
     * @returns {THREE.Mesh} The 3D box object with materials applied.
     */
    const constructRotatingBox = () => {
        // Using BoxGeometry (modern equivalent of CubeGeometry) with more segments.
        const boxGeometryInstance = new THREE.BoxGeometry(200, 200, 200, 2, 2, 2);
        return new THREE.Mesh(boxGeometryInstance, new THREE.MeshFaceMaterial(generateBoxFaceMaterials()));
    };

    /**
     * Creates an ambient light source for the scene.
     * @returns {THREE.AmbientLight} The ambient light object.
     */
    const createSubtleAmbientLight = () => new THREE.AmbientLight(0xbbbbbb); // Slightly adjusted color.

    /**
     * Creates and positions a directional light source.
     * @returns {THREE.DirectionalLight} The directional light object.
     */
    const createPrimaryDirectionalLight = () => {
        const keyLight = new THREE.DirectionalLight(0xfffff0); // Slightly adjusted color.
        keyLight.position.set(1.2, 1.2, 1.2).normalize(); // Slightly adjusted position vector.
        return keyLight;
    };

    // --- Animation Logic ---

    /**
     * The main animation loop that updates the box's rotation and renders the scene.
     * Utilizes requestAnimationFrame for smooth animations.
     * @param {THREE.Mesh} target3DObject - The object to animate (the box).
     * @param {THREE.Scene} active3DScene - The current scene.
     * @param {THREE.Camera} activeViewCamera - The camera viewing the scene.
     */
    const updateAndRenderFrame = (target3DObject, active3DScene, activeViewCamera) => {
        // Increment rotation angle and wrap around after 360 degrees.
        currentRotationAngle += 0.8; // Slightly different rotation speed.
        if (currentRotationAngle >= 360) {
            currentRotationAngle -= 360;
        }

        const currentRadAngle = degreesToRadiansConverter(currentRotationAngle);
        target3DObject.rotation.x = currentRadAngle;
        target3DObject.rotation.y = currentRadAngle;
        target3DObject.rotation.z = currentRadAngle;

        // Render the updated scene.
        graphicEngine.render(active3DScene, activeViewCamera);

        // Request the next animation frame.
        requestAnimationFrame(() => updateAndRenderFrame(target3DObject, active3DScene, activeViewCamera));
    };

    // --- Module Initialization ---

    /**
     * The primary function to kick off the 3D visualization.
     * It sets up the scene, camera, lights, and the 3D object, then starts the animation.
     */
    const initializeAndRunVisualization = () => {
        displayAreaElement = $('#mainDisplayContainer'); // Target a different container ID.

        // Perform initial environment checks.
        if (!verifyEnvironmentReadiness(displayAreaElement)) {
            return; // Exit if environment is not ready.
        }

        // Setup the rendering canvas and add it to the DOM.
        const renderCanvasElement = setupRenderer();
        displayAreaElement.children().first().append(renderCanvasElement);

        // Create the 3D scene, camera, and the main object.
        const main3DScene = new THREE.Scene();
        const mainViewCamera = createSceneCamera();
        const animated3DBox = constructRotatingBox();

        // Add components to the scene.
        main3DScene.add(mainViewCamera); // Although not strictly necessary for PerspectiveCamera, it's often done.
        main3DScene.add(animated3DBox);
        main3DScene.add(createSubtleAmbientLight());
        main3DScene.add(createPrimaryDirectionalLight());

        // Start the continuous animation loop.
        updateAndRenderFrame(animated3DBox, main3DScene, mainViewCamera);
    };

    // --- Public API ---
    return {
        start: initializeAndRunVisualization // Expose the initialization function under a new name.
    };

})(); // End of IIFE

// Execute the module's primary initialization function to start the visualization.
visualizerModule.start();