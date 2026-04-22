(function () {
    // Check for the essential Sprite3D library. If not present, log an error and halt execution.
    if (typeof Sprite3D === 'undefined') {
        console.error("Sprite3D library is a prerequisite. Please ensure it's loaded.");
        return;
    }

    // --- Configuration & Global State Variables ---

    // Define constants for magic numbers to improve readability and maintainability.
    const VIEWPORT_NORMALIZATION_FACTOR = 0.5;
    const MIN_DRAG_BOUNDARY = -0.5;
    const MAX_DRAG_BOUNDARY = 0.5;
    const INTERPOLATION_RATE_DRAG = 0.1;
    const INTERPOLATION_RATE_WIND = 0.01;

    const CAMERA_OFFSET_X_FACTOR = 100;
    const CAMERA_OFFSET_Y_BASE = 230;
    const CAMERA_OFFSET_Y_FACTOR = 50;
    const CAMERA_OFFSET_Z_FACTOR = -600;
    const CAMERA_BASE_Z_POSITION = -150;
    const CAMERA_ROTATION_X_BASE = 70;
    const CAMERA_ROTATION_Z_FACTOR = 210;

    const WORLD_CUBE_DIMENSION = 575; // The primary size for the interactive 3D world.

    const CLOUD_OOB_THRESHOLD_LEFT = -290;
    const CLOUD_OOB_THRESHOLD_RIGHT_OFFSET = 290;
    const CLOUD_RESET_X_CHECK = 110;
    const CLOUD_RESET_X_RANGE_OFFSET = 400; // For initial off-screen placement.
    const CLOUD_Y_RAND_MULTIPLIER = 1.4;
    const CLOUD_Y_RAND_SUBTRACT = 0.4;
    const CLOUD_Z_BASE = 300;
    const CLOUD_Z_RANGE = 190;
    const CLOUD_Z_OFFSET_FACTOR_OOB = 0.1;

    const COW_RANDOM_MOVE_DISTANCE = 50;
    const COW_MIN_X_POSITION = 50;
    const COW_MIN_Y_POSITION = 80;
    const COW_MAX_POSITION_OFFSET = 50; // For clamping max X/Y.
    const COW_ROTATION_Y_FACTOR = 45;

    let mainRenderStage = Sprite3D.stage(); // The top-level container for all 3D content.
    let sceneGraphRoot = mainRenderStage.appendChild(Sprite3D.create()); // The root node for the 3D scene elements.

    let worldCubeContainer; // The central 3D cube holding the environment.
    let feedbackBanner; // A DOM element to display user instructions.
    let cubeTopSurface; // The Sprite3D element representing the top face of the cube.

    let currentViewportWidth = window.innerWidth;
    let currentViewportHeight = window.innerHeight;

    // Normalized pointer coordinates (mouse or touch) from -0.5 to 0.5.
    let currentPointerX = -0.17849898580121704;
    let currentPointerY = 0.4572815533980582;
    let lastPointerX = 0.0;
    let lastPointerY = 0.0;

    // Smoothed pointer coordinates for camera movement.
    let smoothPointerX = -0.17849898580121704;
    let smoothPointerY = 0.4572815533980582;

    let previousActiveCow = null; // Stores the Sprite3D object of the last cow interacted with.
    const ruralAnimals = []; // Collection of cow Sprite3D objects.
    const atmosphericElements = []; // Collection of cloud Sprite3D objects.

    let currentWindSpeed = 2; // The current speed of the virtual wind.
    let desiredWindSpeed = 2; // The target wind speed, adjusted by user interaction.

    let isInteractionActive = false; // Flag to indicate if a mouse or touch drag is in progress.
    let activeInteractionID = -1; // Identifier for the active touch point (for multi-touch).

    let windMachineBlades; // The Sprite3D object for the windmill's rotating blades.
    let mysteryFlyingObject; // The Sprite3D object for the UFO.

    let animationLastTimestamp = 0; // Timestamp of the previous animation frame.


    // --- Event Listener Functions ---

    /**
     * Initiates a touch interaction, tracking the first touch point.
     * @param {TouchEvent} evt - The touch event object.
     */
    const onTouchStartHandler = function (evt) {
        if (!isInteractionActive) {
            const primaryTouch = evt.changedTouches[0];
            if (!primaryTouch) return; // Defensive check for touch data.

            lastPointerX = (primaryTouch.pageX / currentViewportWidth) - VIEWPORT_NORMALIZATION_FACTOR;
            lastPointerY = (primaryTouch.pageY / currentViewportHeight) - VIEWPORT_NORMALIZATION_FACTOR;
            isInteractionActive = true;
            activeInteractionID = primaryTouch.identifier;
        }
        evt.preventDefault(); // Prevents default browser actions like scrolling.
    };

    /**
     * Updates pointer position during a touch move, adjusting camera orientation.
     * @param {TouchEvent} evt - The touch event object.
     */
    const onTouchMoveHandler = function (evt) {
        if (isInteractionActive) {
            const touchList = evt.changedTouches;
            let touchIndex = touchList.length;

            while (touchIndex--) { // Iterate backwards for efficiency.
                const individualTouch = touchList[touchIndex];
                if (individualTouch.identifier === activeInteractionID) {
                    const normalizedTouchX = (individualTouch.pageX / currentViewportWidth) - VIEWPORT_NORMALIZATION_FACTOR;
                    const normalizedTouchY = (individualTouch.pageY / currentViewportHeight) - VIEWPORT_NORMALIZATION_FACTOR;

                    currentPointerX -= (normalizedTouchX - lastPointerX);
                    currentPointerY -= (normalizedTouchY - lastPointerY);
                    lastPointerX = normalizedTouchX;
                    lastPointerY = normalizedTouchY;

                    // Clamp pointer coordinates within defined bounds.
                    currentPointerX = Math.max(MIN_DRAG_BOUNDARY, Math.min(MAX_DRAG_BOUNDARY, currentPointerX));
                    currentPointerY = Math.max(MIN_DRAG_BOUNDARY, Math.min(MAX_DRAG_BOUNDARY, currentPointerY));
                    break; // Found the active touch, exit loop.
                }
            }
        }
        evt.preventDefault();
    };

    /**
     * Concludes a touch interaction, resetting flags and hiding the instruction banner.
     * @param {TouchEvent} evt - The touch event object.
     */
    const onTouchEndHandler = function (evt) {
        if (isInteractionActive) {
            feedbackBanner.classList.add("off"); // Indicate that instructions are no longer needed.
            const touchList = evt.changedTouches;
            let touchIndex = touchList.length;

            while (touchIndex--) {
                const individualTouch = touchList[touchIndex];
                if (individualTouch.identifier === activeInteractionID) {
                    isInteractionActive = false;
                    activeInteractionID = -1; // Reset touch ID.
                    break;
                }
            }
        }
        evt.preventDefault();
    };


    // --- Mouse Event Handlers ---

    /**
     * Initiates a mouse drag interaction.
     * @param {MouseEvent} evt - The mouse event object.
     */
    const onMouseDownHandler = function (evt) {
        if (!isInteractionActive) {
            lastPointerX = (evt.pageX / currentViewportWidth) - VIEWPORT_NORMALIZATION_FACTOR;
            lastPointerY = (evt.pageY / currentViewportHeight) - VIEWPORT_NORMALIZATION_FACTOR;
            isInteractionActive = true;
        }
        evt.preventDefault();
    };

    /**
     * Updates pointer position during mouse movement, adjusting camera.
     * @param {MouseEvent} evt - The mouse event object.
     */
    const onMouseMoveHandler = function (evt) {
        if (isInteractionActive) {
            const normalizedMouseX = (evt.pageX / currentViewportWidth) - VIEWPORT_NORMALIZATION_FACTOR;
            const normalizedMouseY = (evt.pageY / currentViewportHeight) - VIEWPORT_NORMALIZATION_FACTOR;

            currentPointerX -= (normalizedMouseX - lastPointerX);
            currentPointerY -= (normalizedMouseY - lastPointerY);
            lastPointerX = normalizedMouseX;
            lastPointerY = normalizedMouseY;

            // Clamp pointer coordinates.
            currentPointerX = Math.max(MIN_DRAG_BOUNDARY, Math.min(MAX_DRAG_BOUNDARY, currentPointerX));
            currentPointerY = Math.max(MIN_DRAG_BOUNDARY, Math.min(MAX_DRAG_BOUNDARY, currentPointerY));
        }
        evt.preventDefault();
    };

    /**
     * Concludes a mouse drag interaction.
     * @param {MouseEvent} evt - The mouse event object.
     */
    const onMouseUpHandler = function (evt) {
        feedbackBanner.classList.add("off");
        isInteractionActive = false;
        evt.preventDefault();
    };


    // --- Window Event Handlers ---

    /**
     * Responds to window resize events, updating viewport dimensions and stage scaling.
     * @param {Event} evt - The resize event object.
     */
    const onWindowResizeHandler = function (evt) {
        currentViewportWidth = window.innerWidth;
        currentViewportHeight = window.innerHeight;

        // Scale the entire stage based on the smaller dimension to fit well on various screens.
        const dynamicStageScale = Math.min(currentViewportWidth, currentViewportHeight) / 768.0;
        mainRenderStage.scale(dynamicStageScale, dynamicStageScale, dynamicStageScale).update();
    };

    /**
     * Handles device orientation changes, primarily to prevent unwanted browser scrolling on mobile.
     * @param {Event} evt - The device orientation event object.
     */
    const onDeviceOrientationHandler = function (evt) {
        window.scrollTo(0, 0); // Force scroll position to top-left.
    };


    // --- Object-Specific Interaction Logic ---

    /**
     * Designates a cow sprite as the currently active one, potentially unhighlighting a previous one.
     * @param {Sprite3D} targetCowSprite - The cow Sprite3D object to activate.
     */
    const setActiveCowHighlight = function (targetCowSprite) {
        if (previousActiveCow && previousActiveCow !== targetCowSprite) {
            // Revert scale of the previously active cow if it was flipped.
            previousActiveCow.scale(previousActiveCow.get("flipped") ? -1 : 1, 1, 1).update();
        }
        previousActiveCow = targetCowSprite;
        // Further visual effects (e.g., glow, larger scale) could be added here for targetCowSprite.
    };

    /**
     * Handles user interaction (click/touch) with a cow sprite, moving it to a new random position.
     * @param {Event} evt - The interaction event object.
     */
    const onCowInteractionHandler = function (evt) {
        const interactingCow = this; // 'this' refers to the Sprite3D instance.

        // Determine random movement direction and new coordinates.
        const moveDirectionX = (Math.random() < 0.5 ? -1 : 1);
        const moveDirectionY = (Math.random() < 0.5 ? -1 : 1);

        let newCowX = interactingCow.x() + moveDirectionX * COW_RANDOM_MOVE_DISTANCE;
        let newCowY = interactingCow.y() + moveDirectionY * COW_RANDOM_MOVE_DISTANCE;
        const currentFlipState = interactingCow.get("flipped");

        // Clamp new positions within the world cube bounds.
        newCowX = Math.max(COW_MIN_X_POSITION, Math.min(WORLD_CUBE_DIMENSION - COW_MAX_POSITION_OFFSET, newCowX));
        newCowY = Math.max(COW_MIN_Y_POSITION, Math.min(WORLD_CUBE_DIMENSION - COW_MAX_POSITION_OFFSET, newCowY));

        // Apply new transformations.
        interactingCow
            .position(newCowX, newCowY, 0)
            .rotation(-90, (newCowX / WORLD_CUBE_DIMENSION - VIEWPORT_NORMALIZATION_FACTOR) * COW_ROTATION_Y_FACTOR, 0)
            .set("flipped", currentFlipState)
            .update();

        console.log(`Cow [${interactingCow.id || interactingCow.className}] moved to X:${newCowX.toFixed(2)}, Y:${newCowY.toFixed(2)}.`);
        setActiveCowHighlight(interactingCow); // Update highlight.
        evt.preventDefault();
        evt.stopImmediatePropagation(); // Prevent event from bubbling up to the main stage.
    };

    /**
     * Handles mouseover event for cow sprites, setting active highlight.
     * @param {MouseEvent} evt - The mouseover event object.
     */
    const onCowHoverHandler = function (evt) {
        setActiveCowHighlight(this);
    };

    /**
     * Toggles the wind speed when the windmill rotor is clicked/touched.
     * @param {Event} evt - The interaction event object.
     */
    const onRotorInteractionHandler = function (evt) {
        if (desiredWindSpeed === 0) {
            desiredWindSpeed = 1 + Math.random() * 7; // Set a new random wind speed.
        } else {
            desiredWindSpeed = 0; // Stop the wind.
        }
        console.log(`Windmill rotor interacted. Desired wind speed: ${desiredWindSpeed.toFixed(2)}.`);
        evt.preventDefault();
        evt.stopImmediatePropagation();
    };

    /**
     * Repositions and rotates the sun sprite upon interaction.
     * @param {Event} evt - The interaction event object.
     */
    const onSunInteractionHandler = function (evt) {
        this
            .position(WORLD_CUBE_DIMENSION * Math.random(), -250, 360)
            .rotation(-90, this.rotationY() + 180, 0) // Rotate 180 degrees on Y-axis.
            .update();
        console.log("Sun sprite repositioned and orientation changed.");
        evt.preventDefault();
        evt.stopImmediatePropagation();
    };


    // --- Core Animation Loop ---

    /**
     * The recursive function driving the animation. Requests the next frame.
     */
    const requestNextFrame = function () {
        window.requestAnimationFrame(requestNextFrame);
        updateSceneState();
    };

    /**
     * Updates the state of all animated elements in the scene for the current frame.
     */
    const updateSceneState = function () {
        // Smoothly interpolate the camera's X and Y offsets.
        smoothPointerX += (currentPointerX - smoothPointerX) * INTERPOLATION_RATE_DRAG;
        smoothPointerY += (currentPointerY - smoothPointerY) * INTERPOLATION_RATE_DRAG;

        // Apply interpolated values to the world cube container's position and rotation.
        worldCubeContainer
            .position(smoothPointerX * CAMERA_OFFSET_X_FACTOR, CAMERA_OFFSET_Y_BASE + smoothPointerY * CAMERA_OFFSET_Y_FACTOR, smoothPointerY * CAMERA_OFFSET_Z_FACTOR + CAMERA_BASE_Z_POSITION)
            .rotation(CAMERA_ROTATION_X_BASE + smoothPointerY * CAMERA_OFFSET_Y_FACTOR, 0, smoothPointerX * CAMERA_ROTATION_Z_FACTOR)
            .update();

        // Smoothly adjust the current wind speed towards the desired speed.
        currentWindSpeed += (desiredWindSpeed - currentWindSpeed) * INTERPOLATION_RATE_WIND;

        // Rotate the windmill blades based on the current wind speed.
        windMachineBlades.rotate(0, 0, currentWindSpeed).update();

        // Update cloud positions and handle boundary wrapping.
        let cloudCount = atmosphericElements.length;
        while (cloudCount--) {
            const cloudSprite = atmosphericElements[cloudCount];
            let cloudCurrentX = cloudSprite.x();

            // Check if cloud has moved too far left.
            if (cloudCurrentX < CLOUD_OOB_THRESHOLD_LEFT) {
                // Adjust Z-position based on how far past the boundary it went.
                const overflowAmountX = CLOUD_OOB_THRESHOLD_LEFT - cloudCurrentX;
                cloudSprite.z(cloudSprite.targetZ + overflowAmountX * overflowAmountX * CLOUD_Z_OFFSET_FACTOR_OOB);
            }
            // Check if cloud has moved too far right.
            else if (cloudCurrentX > WORLD_CUBE_DIMENSION + CLOUD_OOB_THRESHOLD_RIGHT_OFFSET) {
                const overflowAmountX = cloudCurrentX - (WORLD_CUBE_DIMENSION + CLOUD_OOB_THRESHOLD_RIGHT_OFFSET);
                cloudSprite.z(cloudSprite.targetZ + overflowAmountX * overflowAmountX * CLOUD_Z_OFFSET_FACTOR_OOB);

                // If significantly past the right boundary, reset its position to the far left.
                if (overflowAmountX > CLOUD_RESET_X_CHECK) {
                    cloudSprite.targetY = (Math.random() * CLOUD_Y_RAND_MULTIPLIER - CLOUD_Y_RAND_SUBTRACT) * WORLD_CUBE_DIMENSION;
                    cloudSprite.targetZ = Math.random() * CLOUD_Z_RANGE + CLOUD_Z_BASE;
                    cloudSprite.position(-CLOUD_RESET_X_RANGE_OFFSET - Math.random() * CLOUD_RESET_X_RANGE_OFFSET, cloudSprite.targetY, 3000);
                }
            }
            cloudSprite.move(currentWindSpeed, 0, 0).update(); // Move the cloud.
        }
    };


    // --- Scene Construction Helper Functions ---

    /**
     * Creates and attaches one of the four side panels to the main world cube.
     * @param {string} uniqueId - A unique ID for the side element.
     * @param {number} xPos - The X coordinate.
     * @param {number} yPos - The Y coordinate.
     * @param {number} yRotation - The Y-axis rotation in degrees.
     */
    const createCubeSidePanel = function (uniqueId, xPos, yPos, yRotation) {
        worldCubeContainer.appendChild(
            Sprite3D.create(".cubeSideElement") // Using a generic class for all sides.
                .set("id", uniqueId)
                .transformOrigin(0, 0)
                .transformString("p rx rz ry s") // Explicit transform order.
                .position(xPos, yPos, 231)
                .rotation(-90, yRotation, 0)
                .update()
        );
    };

    /**
     * Provides a random CSS class name for a cow asset.
     * @returns {string} A string like ".vache1", ".vache2", or ".vache3".
     */
    const getCowAssetClass = () => `.vache${Math.ceil(Math.random() * 3)}`;

    /**
     * Provides a random CSS class name for a cloud asset.
     * @returns {string} A string like ".cloud1", ".cloud2", or ".cloud3".
     */
    const getCloudAssetClass = () => `.cloud${Math.ceil(Math.random() * 3)}`;

    /**
     * Utility to bind multiple event listeners from an object map to a Sprite3D instance.
     * @param {Sprite3D} targetSprite - The Sprite3D object to bind events to.
     * @param {Object.<string, Function>} eventHandlersMap - Object mapping event names to functions.
     * @returns {Sprite3D} The targetSprite for chaining.
     */
    const applyEventBindings = (targetSprite, eventHandlersMap) => {
        for (const eventType in eventHandlersMap) {
            if (Object.prototype.hasOwnProperty.call(eventHandlersMap, eventType)) {
                targetSprite.bind({ [eventType]: eventHandlersMap[eventType] });
            }
        }
        return targetSprite;
    };


    // --- Scene Initialization ---

    // Create and append the user instruction overlay to the document body.
    feedbackBanner = document.createElement("div");
    feedbackBanner.id = "userInstructionBanner";
    feedbackBanner.textContent = "Drag your mouse or finger to explore!";
    document.body.appendChild(feedbackBanner);

    // Initialize the primary world container.
    worldCubeContainer = sceneGraphRoot.appendChild(
        Sprite3D.create("mainWorldContainer")
            .origin(640, 640)
            .position(0, 200, -600)
            .rotation(70, 0, 0)
            .transformString("p rx rz ry s")
            .update()
    );

    // Initialize the top surface of the 3D cube environment.
    cubeTopSurface = worldCubeContainer.appendChild(
        Sprite3D.create("worldTopPlane")
            .position(358, 362, 231)
            .update()
    );

    // Construct the four sides of the cube.
    createCubeSidePanel("cubeSideA", 358, 937, 0);
    createCubeSidePanel("cubeSideB", 358, 362, 270);
    createCubeSidePanel("cubeSideC", 933, 362, 180);
    createCubeSidePanel("cubeSideD", 933, 937, 90);

    // Add multiple cow sprites to the scene.
    const totalCows = 5;
    for (let i = 0; i < totalCows; i++) {
        const randomXRatio = (Math.random() * 0.8 + 0.1);
        const randomYRatio = (Math.random() * 0.8 + 0.1);
        const initialFlippedState = Math.random() > 0.5;

        const newCowSprite = applyEventBindings(
            Sprite3D.create(getCowAssetClass())
                .origin(38, 78)
                .transformOrigin(38, 78)
                .position(randomXRatio * WORLD_CUBE_DIMENSION, randomYRatio * WORLD_CUBE_DIMENSION, 0)
                .rotation(-90, (randomXRatio - VIEWPORT_NORMALIZATION_FACTOR) * COW_ROTATION_Y_FACTOR, 0)
                .set("flipped", initialFlippedState),
            { mouseover: onCowHoverHandler, touchstart: onCowInteractionHandler, click: onCowInteractionHandler } // Added click for broader desktop support.
        ).update();
        ruralAnimals.push(cubeTopSurface.appendChild(newCowSprite));
    }

    // Add a scenic banner element.
    cubeTopSurface.appendChild(
        Sprite3D.create("scenicBannerDisplay")
            .origin(0, 332)
            .transformOrigin(0, 332)
            .position(10, 60, 0)
            .rotation(-90, 0.4, 0)
            .update()
    );

    // Add the sun sprite and bind its interaction.
    const sunEntity = applyEventBindings(
        Sprite3D.create("celestialBodySun")
            .transformString("p rx rz ry s")
            .origin(125, 750 - 136)
            .transformOrigin(125, 750 - 136)
            .position(WORLD_CUBE_DIMENSION * 0.92, -250, 360)
            .rotation(-90, -2, 0),
        { mouseover: onSunInteractionHandler, touchstart: onSunInteractionHandler }
    ).update();
    cubeTopSurface.appendChild(sunEntity);

    // Populate the sky with cloud sprites.
    const numClouds = 7;
    for (let i = 0; i < numClouds; i++) {
        const initialCloudY = (Math.random() * CLOUD_Y_RAND_MULTIPLIER - CLOUD_Y_RAND_SUBTRACT) * WORLD_CUBE_DIMENSION;
        const initialCloudZ = Math.random() * CLOUD_Z_RANGE + CLOUD_Z_BASE;

        const cloudEntity = Sprite3D.create(getCloudAssetClass())
            .transformString("p rx rz ry s")
            .transformOrigin(62, 750 - 40)
            .origin(62, 750 - 40)
            .position((Math.random() * CLOUD_Y_RAND_MULTIPLIER - 0.2) * WORLD_CUBE_DIMENSION, initialCloudY, initialCloudZ)
            .rotation(-90, -Math.random() * 10 - 5, 0)
            .set("targetY", initialCloudY) // Store initial/target properties for resetting.
            .set("targetZ", initialCloudZ)
            .update();
        atmosphericElements.push(cubeTopSurface.appendChild(cloudEntity));
    }

    // Add the windmill base structure.
    const windmillStructure = cubeTopSurface.appendChild(
        Sprite3D.create("windmillTowerBase")
            .origin(60, 201)
            .transformOrigin(60, 201)
            .position(90, 380, 0)
            .rotation(-90, 20, 0)
            .update()
    );

    // Add the windmill's rotating blades and bind interaction.
    windMachineBlades = applyEventBindings(
        Sprite3D.create("windmillRotorBlades")
            .origin(89, 93)
            .transformOrigin(89, 93)
            .position(60, 80, 5),
        { mousedown: onRotorInteractionHandler, touchstart: onRotorInteractionHandler }
    ).update();
    windmillStructure.appendChild(windMachineBlades);

    // Add a mysterious flying object (UFO).
    mysteryFlyingObject = cubeTopSurface.appendChild(
        Sprite3D.create("unidentifiedFlyingObject")
            .transformString("p rx rz ry s")
            .origin(61, 750 - 50)
            .transformOrigin(61, 0)
            .position(Math.floor(WORLD_CUBE_DIMENSION / 2), Math.floor(WORLD_CUBE_DIMENSION / 2), 800) // Using Math.floor for integer pixel positions.
            .rotation(-90, -2, 0)
            .update()
    );


    // --- Global Event Listener Registration ---

    // Register mouse input handlers.
    document.addEventListener("mousedown", onMouseDownHandler, false);
    document.addEventListener("mousemove", onMouseMoveHandler, false);
    document.addEventListener("mouseup", onMouseUpHandler, false);

    // Register touch input handlers.
    document.addEventListener("touchstart", onTouchStartHandler, false);
    document.addEventListener("touchmove", onTouchMoveHandler, false);
    document.addEventListener("touchend", onTouchEndHandler, false);

    // Register window-level event handlers.
    window.addEventListener("resize", onWindowResizeHandler, false);
    window.addEventListener("deviceorientation", onDeviceOrientationHandler, false);

    // Perform an initial resize to correctly set up the stage based on current window dimensions.
    onWindowResizeHandler();

    // Start the continuous animation loop.
    animationLastTimestamp = performance.now(); // Use high-resolution timer for animation.
    requestNextFrame();

})();