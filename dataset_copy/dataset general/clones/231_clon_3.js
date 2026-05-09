const INTERACTION_TRIGGERS = Object.freeze({
    PRESS: 10,
    RELEASE: 20,
    DRAG: 30
});

// Represents a 3D vector for coordinates, velocities, etc.
class CoordVector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // Adds another vector to this one, returning a new vector.
    add(otherVector) {
        return new CoordVector(this.x + otherVector.x, this.y + otherVector.y, this.z + otherVector.z);
    }

    // Subtracts another vector from this one, returning a new vector.
    subtract(otherVector) {
        return new CoordVector(this.x - otherVector.x, this.y - otherVector.y, this.z - otherVector.z);
    }

    // Multiplies this vector by a scalar, returning a new vector.
    multiplyScalar(scalar) {
        return new CoordVector(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    // Calculates the magnitude (length) of the vector.
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    // Returns a new vector representing the normalized (unit) version of this vector.
    normalize() {
        const magnitude = this.length();
        return magnitude > 0 ? new CoordVector(this.x / magnitude, this.y / magnitude, this.z / magnitude) : new CoordVector(0, 0, 0);
    }

    // Creates a new vector with the same components as this one.
    clone() {
        return new CoordVector(this.x, this.y, this.z);
    }
}

// Defines various block types and their properties.
const ELEMENT_TYPES = Object.freeze({
    EMPTY: { id: 0, name: "AIR", isSpawnable: false },
    SOIL: { id: 1, name: "DIRT", isSpawnable: true },
    STONE: { id: 2, name: "STONE", isSpawnable: true },
    WOOD: { id: 3, name: "WOOD", isSpawnable: true },
    WATER: { id: 4, name: "WATER", isSpawnable: false }
});

// Placeholder for external collision helper functions.
// These functions are assumed to exist in the global scope or imported.

// Checks if a line segment (representing a block side) collides with an axis-aligned rectangle (player's XY bounds).
function checkLineRectangleCollision(lineSegment, rectangleBounds) {
    if (lineSegment.xCoord !== undefined) { // Vertical line segment
        const lineX = lineSegment.xCoord;
        const lineYMin = lineSegment.yStart;
        const lineYMax = lineSegment.yEnd;
        const rectCenterX = rectangleBounds.x;
        const rectCenterY = rectangleBounds.y;
        const rectHalfWidth = rectangleBounds.halfSize;

        // Check for X-axis overlap
        const xOverlap = (rectCenterX - rectHalfWidth < lineX && rectCenterX + rectHalfWidth > lineX);
        // Check for Y-axis overlap
        const yOverlap = (Math.max(rectCenterY - rectHalfWidth, lineYMin) < Math.min(rectCenterY + rectHalfWidth, lineYMax));
        return xOverlap && yOverlap;
    } else if (lineSegment.yCoord !== undefined) { // Horizontal line segment
        const lineY = lineSegment.yCoord;
        const lineXMin = lineSegment.xStart;
        const lineXMax = lineSegment.xEnd;
        const rectCenterX = rectangleBounds.x;
        const rectCenterY = rectangleBounds.y;
        const rectHalfWidth = rectangleBounds.halfSize;

        // Check for Y-axis overlap
        const yOverlap = (rectCenterY - rectHalfWidth < lineY && rectCenterY + rectHalfWidth > lineY);
        // Check for X-axis overlap
        const xOverlap = (Math.max(rectCenterX - rectHalfWidth, lineXMin) < Math.min(rectCenterX + rectHalfWidth, lineXMax));
        return xOverlap && yOverlap;
    }
    return false;
}

// Checks for overlap between two axis-aligned rectangles (used for Z-axis collision).
function checkRectangleOverlap(rectA, rectB) {
    // AABB collision check
    return (
        rectA.x1 < rectB.x2 &&
        rectA.x2 > rectB.x1 &&
        rectA.y1 < rectB.y2 &&
        rectA.y2 > rectB.y1
    );
}

// Manages the state and interactions of the local player character within the game.
class AvatarController {
    // Initializes the core components for a local player's management.
    constructor() {
        // Properties will be initialized by dedicated setup methods.
        // This constructor is intentionally minimal.
    }

    // Assigns the player to a specific game world or simulation context.
    assignGameEnvironment(simulationContext) {
        if (!simulationContext || typeof simulationContext.getSpawnPoint !== 'function') {
            console.warn("Invalid simulation context provided to AvatarController. Cannot assign environment.");
            return; // Guard clause for invalid input
        }

        this.currentSimulationContext = simulationContext;
        // Establish a bidirectional link if the context supports it
        if (typeof this.currentSimulationContext.setLocalAvatar === 'function') {
            this.currentSimulationContext.setLocalAvatar(this);
        } else {
            // Fallback for contexts without a direct setter (e.g., older versions)
            this.currentSimulationContext.activePlayerReference = this;
        }

        this.avatarPosition = simulationContext.getSpawnPoint();
        this.motionVector = new CoordVector(0.0, 0.0, 0.0);
        this.viewRotationAngles = [0.0, Math.acos(-1), 0.0]; // [pitch, yaw, roll]
        this.isGroundContactLost = false; // Indicates if the avatar is currently falling
        this.activeKeyStates = {}; // Stores the current pressed/released state of keys
        this.selectedBlockType = ELEMENT_TYPES.SOIL; // Default material for building
        this.callbackRegistry = {}; // Stores event handler functions
        this.lastFrameTimestamp = null; // Used for calculating delta time between updates
    }

    // Links the local player to a network client for multiplayer interactions.
    linkNetworkAgent(networkInterface) {
        if (!networkInterface) {
            console.warn("Attempted to link an undefined network agent.");
            return; // Guard clause
        }
        this.associatedNetworkAgent = networkInterface;
    }

    // Configures the HTML canvas element that will handle user input.
    establishInputSurface(targetElementId) {
        const inputElement = document.getElementById(targetElementId);
        if (!inputElement) {
            console.error(`Input surface element with ID '${targetElementId}' not found. Input will not be bound.`);
            return; // Guard clause
        }

        this.interactionCanvas = inputElement;

        // Maintain a consistent reference to 'this' for event handlers.
        const boundInstance = this;

        // Helper function for keyboard events to prevent default browser actions.
        const handleDocumentKeyEvent = (event, pressedState) => {
            if (event.target && event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA") {
                boundInstance.processKeyboardInput(event.keyCode, pressedState);
                event.preventDefault(); // Prevent default browser behavior (e.g., scrolling with spacebar)
            }
        };

        // Attach keyboard event listeners to the document.
        document.addEventListener("keydown", (e) => handleDocumentKeyEvent(e, true));
        document.addEventListener("keyup", (e) => handleDocumentKeyEvent(e, false));

        // Helper function for mouse events, using modern event properties.
        const handleCanvasMouseEvent = (event, actionType) => {
            event.preventDefault(); // Prevent default canvas interactions like text selection or context menu
            const isRightClick = event.button === 2; // Modern way to check for right mouse button
            boundInstance.processPointerInteraction(event.clientX, event.clientY, actionType, isRightClick);
        };

        // Attach mouse event listeners to the interaction canvas.
        this.interactionCanvas.addEventListener("mousedown", (e) => handleCanvasMouseEvent(e, INTERACTION_TRIGGERS.PRESS));
        this.interactionCanvas.addEventListener("mouseup", (e) => handleCanvasMouseEvent(e, INTERACTION_TRIGGERS.RELEASE));
        this.interactionCanvas.addEventListener("mousemove", (e) => handleCanvasMouseEvent(e, INTERACTION_TRIGGERS.DRAG));
    }

    // Sets up the visual palette for selecting different block types.
    initializeBlockPalette(paletteContainerElementId) {
        const containerElement = document.getElementById(paletteContainerElementId);
        if (!containerElement) {
            console.warn(`Block palette container with ID '${paletteContainerElementId}' not found. Palette not initialized.`);
            return;
        }

        const materialRow = containerElement.querySelector("tr");
        if (!materialRow) {
            console.warn("No table row found within the block palette container. Palette not fully initialized.");
            return;
        }

        let currentTextureOffsetPx = 0;
        const CELL_TEXTURE_WIDTH = 70; // Assumed width for each block texture in the sprite sheet

        // Inner helper function to create and configure a single palette cell.
        const createPaletteCell = (blockDefinition, offsetPosition) => {
            const cellElement = document.createElement("td");
            cellElement.style.backgroundPosition = `${offsetPosition}px 0px`;
            cellElement.dataset.materialName = blockDefinition.name.toLowerCase(); // Store material name for identification

            cellElement.associatedMaterial = blockDefinition; // Link the block definition directly
            cellElement.addEventListener("click", () => {
                // Deselect the previously active cell, if any.
                if (this.lastActivePaletteCell) {
                    this.lastActivePaletteCell.classList.remove("is-active");
                }

                // Mark the current cell as active.
                cellElement.classList.add("is-active");
                this.lastActivePaletteCell = cellElement;
                this.selectedBlockType = blockDefinition; // Update the player's active build material
            });
            return cellElement;
        };

        // Iterate through all defined element types to create palette entries.
        Object.entries(ELEMENT_TYPES).forEach(([key, blockData]) => {
            // Only add spawnable block types to the palette.
            if (typeof blockData === "object" && blockData !== null && blockData.isSpawnable) {
                const paletteCell = createPaletteCell(blockData, currentTextureOffsetPx);

                // Set initial selection to SOIL (formerly DIRT).
                if (key === "SOIL") {
                    paletteCell.classList.add("is-active");
                    this.lastActivePaletteCell = paletteCell;
                    this.selectedBlockType = blockData;
                }

                materialRow.appendChild(paletteCell);
                currentTextureOffsetPx -= CELL_TEXTURE_WIDTH; // Shift for the next texture in the sprite sheet
            }
        });
    }

    // Registers a custom callback function for a specific player event.
    registerCallback(notificationName, handlerFunction) {
        if (typeof notificationName !== 'string' || typeof handlerFunction !== 'function') {
            console.error("Invalid arguments for registerCallback. Expected (string, function).");
            return;
        }
        this.callbackRegistry[notificationName] = handlerFunction;
    }

    // Processes keyboard input, updating key states and triggering special actions.
    processKeyboardInput(keyIdentifier, isKeyCurrentlyPressed) {
        const charRepresentation = String.fromCharCode(keyIdentifier).toLowerCase();
        this.activeKeyStates[charRepresentation] = isKeyCurrentlyPressed;
        this.activeKeyStates[keyIdentifier] = isKeyCurrentlyPressed; // Store by numeric key code as well

        // Handle specific key-release actions (e.g., chat activation).
        if (!isKeyCurrentlyPressed) {
            switch (charRepresentation) {
                case "t": // 'T' key to open chat
                    const chatHandler = this.callbackRegistry.onChatActivation;
                    if (chatHandler && typeof chatHandler === 'function') {
                        chatHandler();
                    }
                    break;
                case "p": // 'P' key for pausing the game (example of new functionality)
                    const pauseHandler = this.callbackRegistry.onGamePause;
                    if (pauseHandler && typeof pauseHandler === 'function') {
                        pauseHandler();
                    }
                    break;
                // Add more key-specific actions here
                default:
                    // No special action for this key
                    break;
            }
        }
    }

    // Handles various mouse and pointer interactions, including view rotation and block actions.
    processPointerInteraction(pointerX, pointerY, interactionType, isRightMouseButton) {
        if (!this.interactionCanvas) {
            console.warn("Pointer interaction received without an active input canvas. Ignoring.");
            return; // Guard for uninitialized canvas
        }

        switch (interactionType) {
            case INTERACTION_TRIGGERS.PRESS:
                this.initialDragCoordinates = { x: pointerX, y: pointerY };
                this.isPointerDown = true;
                // Capture current view angles to calculate relative rotation during drag.
                this.initialYaw = this.currentYawTarget = this.viewRotationAngles[1];
                this.initialPitch = this.currentPitchTarget = this.viewRotationAngles[0];
                break;

            case INTERACTION_TRIGGERS.RELEASE:
                if (this.initialDragCoordinates) {
                    const deltaX = this.initialDragCoordinates.x - pointerX;
                    const deltaY = this.initialDragCoordinates.y - pointerY;
                    const squaredDragDistance = deltaX * deltaX + deltaY * deltaY;

                    // If the pointer moved very little, consider it a click for block manipulation.
                    if (squaredDragDistance < 16) { // Threshold for distinguishing click from drag (original was sum of abs diff < 4)
                        this.executeBlockManipulation(pointerX, pointerY, !isRightMouseButton);
                    }
                }

                this.isViewDragging = false;
                this.isPointerDown = false;
                this.interactionCanvas.style.cursor = "default"; // Reset cursor
                break;

            case INTERACTION_TRIGGERS.DRAG:
                if (this.isPointerDown) {
                    this.isViewDragging = true;
                    // Update target pitch and yaw based on pointer movement relative to drag start.
                    this.currentPitchTarget = this.initialPitch - (pointerY - this.initialDragCoordinates.y) / 200.0;
                    this.currentYawTarget = this.initialYaw + (pointerX - this.initialDragCoordinates.x) / 200.0;
                    this.interactionCanvas.style.cursor = "move"; // Indicate dragging visually
                }
                break;

            default:
                console.warn(`Unknown pointer interaction type received: ${interactionType}`);
        }
    }

    // Performs an action (destroy or place block) based on player's input and target.
    executeBlockManipulation(cursorX, cursorY, isPrimaryAction) {
        if (!this.currentSimulationContext || !this.interactionCanvas || !this.interactionCanvas.renderEngine) {
            console.warn("Cannot execute block action: missing simulation context or rendering engine.");
            return;
        }

        // Determine the block coordinates where the player is currently standing.
        const currentAvatarBlockCoords = new CoordVector(
            Math.floor(this.avatarPosition.x),
            Math.floor(this.avatarPosition.y),
            Math.floor(this.avatarPosition.z)
        );

        // Define a bounding box for the block picking raycast, centered around the player.
        const PICK_RANGE = 4;
        const searchVolumeMin = currentAvatarBlockCoords.subtract(new CoordVector(PICK_RANGE, PICK_RANGE, PICK_RANGE));
        const searchVolumeMax = currentAvatarBlockCoords.add(new CoordVector(PICK_RANGE, PICK_RANGE, PICK_RANGE));

        // Use the renderer to find which block is under the cursor.
        const hitBlockDetails = this.interactionCanvas.renderEngine.pickBlockAtScreenCoords(
            searchVolumeMin,
            searchVolumeMax,
            cursorX,
            cursorY
        );

        if (hitBlockDetails !== false) { // If a block was successfully identified
            // Decide whether to send the action to the network client or directly to the world.
            const targetSystem = this.associatedNetworkAgent || this.currentSimulationContext;

            // Extract coordinates and the normal vector of the hit surface.
            const { x: blockX, y: blockY, z: blockZ, n: normalVector } = hitBlockDetails;

            if (isPrimaryAction) { // Left-click: destroy the block
                targetSystem.updateBlockAtCoords(blockX, blockY, blockZ, ELEMENT_TYPES.EMPTY);
            } else { // Right-click: place a block
                // Place the selected block type adjacent to the hit block, along its normal direction.
                targetSystem.updateBlockAtCoords(
                    blockX + normalVector.x,
                    blockY + normalVector.y,
                    blockZ + normalVector.z,
                    this.selectedBlockType
                );
            }
        }
    }

    // Calculates and returns the eye-level position of the player for rendering purposes.
    retrieveEyeLevelPosition() {
        const AVATAR_EYE_HEIGHT_OFFSET = 1.7; // Vertical offset from player's base position to eyes
        return this.avatarPosition.add(new CoordVector(0.0, 0.0, AVATAR_EYE_HEIGHT_OFFSET));
    }

    // Performs a single frame update for the player, including movement, gravity, and view rotation.
    performFrameUpdate() {
        const currentEnv = this.currentSimulationContext;
        let movementVec = this.motionVector;
        let currentPos = this.avatarPosition;
        const avatarBaseBlock = new CoordVector(
            Math.floor(currentPos.x),
            Math.floor(currentPos.y),
            Math.floor(currentPos.z)
        );

        const currentTime = performance.now(); // High-resolution timestamp for accurate delta time
        if (this.lastFrameTimestamp === null) {
            this.lastFrameTimestamp = currentTime;
            return; // Skip first update as delta time cannot be calculated
        }

        const deltaTimeSeconds = (currentTime - this.lastFrameTimestamp) / 1000.0;
        this.lastFrameTimestamp = currentTime;

        // Prevent erratic behavior from extremely small or large delta times.
        if (deltaTimeSeconds <= 0 || deltaTimeSeconds > 0.15) { // Cap delta time to prevent physics explosions
            return;
        }

        // --- View Rotation Update ---
        const ROTATION_SMOOTHING_RATE = 30.0; // Speed factor for view interpolation
        if (this.isViewDragging) {
            this.viewRotationAngles[0] += (this.currentPitchTarget - this.viewRotationAngles[0]) * ROTATION_SMOOTHING_RATE * deltaTimeSeconds;
            this.viewRotationAngles[1] += (this.currentYawTarget - this.viewRotationAngles[1]) * ROTATION_SMOOTHING_RATE * deltaTimeSeconds;

            // Clamp pitch (vertical view angle) to prevent looking beyond straight up/down.
            const MAX_PITCH_ANGLE = Math.acos(-1) / 2; // Equivalent to Math.PI / 2
            this.viewRotationAngles[0] = Math.max(-MAX_PITCH_ANGLE, Math.min(MAX_PITCH_ANGLE, this.viewRotationAngles[0]));
        }

        // --- Gravity Effect ---
        const GRAVITY_ACCELERATION_PER_SEC = -0.5; // Vertical acceleration due to gravity
        if (this.isGroundContactLost) {
            movementVec.z += GRAVITY_ACCELERATION_PER_SEC;
        }

        // --- Jump Action ---
        const JUMP_INITIAL_VELOCITY = 8.0;
        if (this.activeKeyStates[" "] && !this.isGroundContactLost) { // Spacebar pressed and not already falling
            movementVec.z = JUMP_INITIAL_VELOCITY;
            this.isGroundContactLost = true; // Player is now airborne
        }

        // --- Horizontal Movement (Walking) ---
        let intendedWalkDirection = new CoordVector(0, 0, 0);
        const BASE_MOVE_SPEED = 4.0;
        const ANGLE_CONVERSION_OFFSET = Math.acos(-1) / 2; // Used for converting forward/backward/left/right to world coordinates
        const currentYawAngle = this.viewRotationAngles[1];

        // Helper function to apply directional input based on key state and angle.
        const applyDirectionalInput = (keyChar, angleModifier) => {
            if (this.activeKeyStates[keyChar]) {
                intendedWalkDirection.x += Math.cos(angleModifier + ANGLE_CONVERSION_OFFSET - currentYawAngle);
                intendedWalkDirection.y += Math.sin(angleModifier + ANGLE_CONVERSION_OFFSET - currentYawAngle);
            }
        };

        if (!this.isGroundContactLost) { // Only allow direct horizontal input when on ground
            applyDirectionalInput("w", 0); // Forward
            applyDirectionalInput("s", Math.acos(-1)); // Backward (PI radians)
            applyDirectionalInput("a", ANGLE_CONVERSION_OFFSET); // Left (PI/2 radians)
            applyDirectionalInput("d", -ANGLE_CONVERSION_OFFSET); // Right (-PI/2 radians)
        }

        if (intendedWalkDirection.length() > 0) {
            intendedWalkDirection = intendedWalkDirection.normalize(); // Normalize for consistent speed
            movementVec.x = intendedWalkDirection.x * BASE_MOVE_SPEED;
            movementVec.y = intendedWalkDirection.y * BASE_MOVE_SPEED;
        } else {
            // Apply friction/decay to horizontal movement when no input is given.
            const horizontalDecayFactor = this.isGroundContactLost ? 0.99 : 0.66; // Slower decay when airborne (0.99 vs 0.66 on ground)
            movementVec.x *= horizontalDecayFactor;
            movementVec.y *= horizontalDecayFactor;

            // Snap very small velocities to zero to prevent perpetual "sliding."
            if (Math.abs(movementVec.x) < 0.005) movementVec.x = 0;
            if (Math.abs(movementVec.y) < 0.005) movementVec.y = 0;
        }

        // Resolve all potential collisions for the calculated movement step.
        this.avatarPosition = this.handleSpatialCollisions(currentPos, avatarBaseBlock, movementVec.multiplyScalar(deltaTimeSeconds));
    }

    // Detects and resolves collisions between the player and environmental blocks.
    handleSpatialCollisions(currentPosition, baseBlockCoords, intendedMovement) {
        const environmentRef = this.currentSimulationContext;
        let resolvedPosition = currentPosition.clone(); // Start with current position, will be updated
        let effectiveMovement = intendedMovement.clone(); // Movement vector that will be adjusted by collisions

        // --- XY (Horizontal) Collision Detection ---
        const AVATAR_HALF_WIDTH = 0.25; // Half the width of the player's collision box
        const avatarBoundsXY = {
            x: resolvedPosition.x + effectiveMovement.x,
            y: resolvedPosition.y + effectiveMovement.y,
            halfSize: AVATAR_HALF_WIDTH
        };

        const horizontalCollisionPlanes = [];
        const HORIZONTAL_SEARCH_EXTENT = 1; // Search blocks 1 unit around the player's current block position

        for (let blockX = baseBlockCoords.x - HORIZONTAL_SEARCH_EXTENT; blockX <= baseBlockCoords.x + HORIZONTAL_SEARCH_EXTENT; blockX++) {
            for (let blockY = baseBlockCoords.y - HORIZONTAL_SEARCH_EXTENT; blockY <= baseBlockCoords.y + HORIZONTAL_SEARCH_EXTENT; blockY++) {
                // Check for blocks at player's feet level (Z) and head level (Z+1).
                for (let zLevelOffset = 0; zLevelOffset <= 1; zLevelOffset++) {
                    const currentBlockZ = baseBlockCoords.z + zLevelOffset;
                    if (environmentRef.retrieveBlockType(blockX, blockY, currentBlockZ) !== ELEMENT_TYPES.EMPTY) {
                        // If a solid block is found, consider its adjacent empty spaces as potential collision planes.
                        if (environmentRef.retrieveBlockType(blockX - 1, blockY, currentBlockZ) === ELEMENT_TYPES.EMPTY) horizontalCollisionPlanes.push({ xCoord: blockX, direction: -1, yStart: blockY, yEnd: blockY + 1 });
                        if (environmentRef.retrieveBlockType(blockX + 1, blockY, currentBlockZ) === ELEMENT_TYPES.EMPTY) horizontalCollisionPlanes.push({ xCoord: blockX + 1, direction: 1, yStart: blockY, yEnd: blockY + 1 });
                        if (environmentRef.retrieveBlockType(blockX, blockY - 1, currentBlockZ) === ELEMENT_TYPES.EMPTY) horizontalCollisionPlanes.push({ yCoord: blockY, direction: -1, xStart: blockX, xEnd: blockX + 1 });
                        if (environmentRef.retrieveBlockType(blockX, blockY + 1, currentBlockZ) === ELEMENT_TYPES.EMPTY) horizontalCollisionPlanes.push({ yCoord: blockY + 1, direction: 1, xStart: blockX, xEnd: blockX + 1 });
                    }
                }
            }
        }

        // Iterate through detected horizontal collision planes and resolve impacts.
        for (const wallPlane of horizontalCollisionPlanes) {
            if (checkLineRectangleCollision(wallPlane, avatarBoundsXY)) {
                // If moving into the wall, adjust position and zero out velocity component.
                if (wallPlane.xCoord !== undefined && effectiveMovement.x * wallPlane.direction < 0) {
                    resolvedPosition.x = wallPlane.xCoord + AVATAR_HALF_WIDTH * (effectiveMovement.x > 0 ? -1 : 1);
                    effectiveMovement.x = 0;
                } else if (wallPlane.yCoord !== undefined && effectiveMovement.y * wallPlane.direction < 0) {
                    resolvedPosition.y = wallPlane.yCoord + AVATAR_HALF_WIDTH * (effectiveMovement.y > 0 ? -1 : 1);
                    effectiveMovement.y = 0;
                }
            }
        }

        // --- Z (Vertical) Collision Detection ---
        const AVATAR_TOTAL_HEIGHT = 1.7;
        const AVATAR_HEAD_BUFFER = 0.1; // Small buffer above head for collision checks

        const avatarProjectedXYPlane = {
            x1: resolvedPosition.x + effectiveMovement.x - AVATAR_HALF_WIDTH,
            y1: resolvedPosition.y + effectiveMovement.y - AVATAR_HALF_WIDTH,
            x2: resolvedPosition.x + effectiveMovement.x + AVATAR_HALF_WIDTH,
            y2: resolvedPosition.y + effectiveMovement.y + AVATAR_HALF_WIDTH
        };

        const lowerZCheckLevel = Math.floor(resolvedPosition.z + effectiveMovement.z);
        const upperZCheckLevel = Math.floor(resolvedPosition.z + AVATAR_TOTAL_HEIGHT + effectiveMovement.z * 1.1 + AVATAR_HEAD_BUFFER); // Extended check for head

        const verticalCollisionSurfaces = [];
        const VERTICAL_SEARCH_EXTENT = 1; // Search blocks 1 unit horizontally around player

        for (let blockX = baseBlockCoords.x - VERTICAL_SEARCH_EXTENT; blockX <= baseBlockCoords.x + VERTICAL_SEARCH_EXTENT; blockX++) {
            for (let blockY = baseBlockCoords.y - VERTICAL_SEARCH_EXTENT; blockY <= baseBlockCoords.y + VERTICAL_SEARCH_EXTENT; blockY++) {
                // Check for blocks at the player's feet level (for landing)
                if (environmentRef.retrieveBlockType(blockX, blockY, lowerZCheckLevel) !== ELEMENT_TYPES.EMPTY) {
                    verticalCollisionSurfaces.push({
                        zCoord: lowerZCheckLevel + 1, // Top surface of the block
                        direction: 1, // Indicates collision from above (landing)
                        xStart: blockX, yStart: blockY, xEnd: blockX + 1, yEnd: blockY + 1
                    });
                }
                // Check for blocks at the player's head level (for hitting ceiling)
                if (environmentRef.retrieveBlockType(blockX, blockY, upperZCheckLevel) !== ELEMENT_TYPES.EMPTY) {
                    verticalCollisionSurfaces.push({
                        zCoord: upperZCheckLevel, // Bottom surface of the block
                        direction: -1, // Indicates collision from below (hitting ceiling)
                        xStart: blockX, yStart: blockY, xEnd: blockX + 1, yEnd: blockY + 1
                    });
                }
            }
        }

        this.isGroundContactLost = true; // Assume player is falling until a floor collision is confirmed.
        for (const verticalSurface of verticalCollisionSurfaces) {
            if (checkRectangleOverlap(verticalSurface, avatarProjectedXYPlane) && effectiveMovement.z * verticalSurface.direction < 0) {
                // Collision detected: player's vertical movement is opposite to surface normal.
                if (effectiveMovement.z < 0) { // Moving downwards, hit a floor
                    this.isGroundContactLost = false; // Player is now on solid ground
                    resolvedPosition.z = verticalSurface.zCoord;
                    effectiveMovement.z = 0;
                    this.motionVector.z = 0; // Reset avatar's own vertical velocity
                } else { // Moving upwards, hit a ceiling
                    resolvedPosition.z = verticalSurface.zCoord - (AVATAR_TOTAL_HEIGHT + AVATAR_HEAD_BUFFER); // Adjust position to be just below the ceiling
                    effectiveMovement.z = 0;
                    this.motionVector.z = 0; // Reset avatar's own vertical velocity
                }
                // Break after the first vertical collision to simplify, assuming a single dominant collision.
                break;
            }
        }

        // Return the final position after all collision resolutions.
        return resolvedPosition.add(effectiveMovement);
    }
}