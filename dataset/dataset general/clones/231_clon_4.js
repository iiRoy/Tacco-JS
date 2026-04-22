const PointerEventTypes = Object.freeze({
    PRESS: 10,
    RELEASE: 20,
    DRAG: 30
});

class AvatarController {
    #environment = null;
    #communicator = null;
    #position = null;
    #momentum = null;
    #orientation = [0, Math.PI, 0];
    #isFalling = false;
    #keyStates = {};
    #activeResource = null;
    #activityListeners = {};
    #interactionElement = null;

    #dragOrigin = null;
    #pointerDepressed = false;
    #isDragging = false;
    #initialYaw = 0;
    #initialPitch = 0;
    #desiredYaw = 0;
    #desiredPitch = 0;
    #lastTickTime = null;
    #previousPaletteItem = null;

    constructor() {
    }

    assignEnvironment(anEnv) {
        this.#environment = anEnv;
        this.#environment.controlledEntity = this;
        this.#position = anEnv.entryPoint;
        this.#momentum = new Vector(0, 0, 0);
        this.#orientation = [0, Math.PI, 0];
        this.#isFalling = false;
        this.#keyStates = {};
        this.#activeResource = BLOCK.DIRT;
        this.#activityListeners = {};
    }

    linkCommunicator(comm) {
        this.#communicator = comm;
    }

    registerInteractionSurface(elementId) {
        const displaySurface = this.#interactionElement = document.getElementById(elementId);

        const handleKeyboard = (eventPayload, pressedState) => {
            if (eventPayload.target.tagName !== "INPUT") {
                this.#handleKeyboardInput(eventPayload.keyCode, pressedState);
                return false;
            }
        };

        const handlePointer = (eventPayload, eventCategory) => {
            this.#handlePointerInput(eventPayload.clientX, eventPayload.clientY, eventCategory, eventPayload.which === 3);
            return false;
        };

        document.addEventListener("keydown", (e) => handleKeyboard(e, true));
        document.addEventListener("keyup", (e) => handleKeyboard(e, false));
        displaySurface.addEventListener("mousedown", (e) => handlePointer(e, PointerEventTypes.PRESS));
        displaySurface.addEventListener("mouseup", (e) => handlePointer(e, PointerEventTypes.RELEASE));
        displaySurface.addEventListener("mousemove", (e) => handlePointer(e, PointerEventTypes.DRAG));
    }

    configureResourcePalette(tableRowId) {
        const materialRow = document.getElementById(tableRowId).getElementsByTagName("tr")[0];
        let texturePosition = 0;

        Object.values(BLOCK)
              .filter(materialData => typeof materialData === "object" && materialData.spawnable)
              .forEach(materialConfig => {
                  const selectionCell = document.createElement("td");
                  selectionCell.style.backgroundPosition = texturePosition + "px 0px";

                  selectionCell.resourceData = materialConfig;
                  selectionCell.onclick = (event) => {
                      const currentCell = event.currentTarget;
                      currentCell.style.opacity = "1.0";

                      if (this.#previousPaletteItem) {
                          this.#previousPaletteItem.style.opacity = null;
                      }
                      this.#previousPaletteItem = currentCell;
                      this.#activeResource = currentCell.resourceData;
                  };

                  if (materialConfig === BLOCK.DIRT) {
                      this.#previousPaletteItem = selectionCell;
                      selectionCell.style.opacity = "1.0";
                  }

                  materialRow.appendChild(selectionCell);
                  texturePosition -= 70;
              });
    }

    subscribeToActivity(activityName, handlerFunction) {
        this.#activityListeners[activityName] = handlerFunction;
    }

    #handleKeyboardInput(codeValue, isDepressed) {
        const charKey = String.fromCharCode(codeValue).toLowerCase();
        this.#keyStates[charKey] = isDepressed;
        this.#keyStates[codeValue] = isDepressed;

        if (!isDepressed && charKey === "t" && this.#activityListeners["openChat"]) {
            this.#activityListeners.openChat();
        }
    }

    #handlePointerInput(coordX, coordY, eventCategory, isRightButton) {
        switch (eventCategory) {
            case PointerEventTypes.PRESS:
                this.#dragOrigin = { x: coordX, y: coordY };
                this.#pointerDepressed = true;
                this.#initialYaw = this.#desiredYaw = this.#orientation[1];
                this.#initialPitch = this.#desiredPitch = this.#orientation[0];
                break;
            case PointerEventTypes.RELEASE:
                if (Math.abs(this.#dragOrigin.x - coordX) + Math.abs(this.#dragOrigin.y - coordY) < 4) {
                    this.#performBlockManipulation(coordX, coordY, !isRightButton);
                }
                this.#isDragging = false;
                this.#pointerDepressed = false;
                this.#interactionElement.style.cursor = "default";
                break;
            case PointerEventTypes.DRAG:
                if (this.#pointerDepressed) {
                    this.#isDragging = true;
                    this.#desiredPitch = this.#initialPitch - (coordY - this.#dragOrigin.y) / 200;
                    this.#desiredYaw = this.#initialYaw + (coordX - this.#dragOrigin.x) / 200;
                    this.#interactionElement.style.cursor = "move";
                }
                break;
        }
    }

    #performBlockManipulation(targetX, targetY, shouldRemove) {
        const currentBlockOrigin = new Vector(
            Math.floor(this.#position.x),
            Math.floor(this.#position.y),
            Math.floor(this.#position.z)
        );
        const identifiedBlock = this.#interactionElement.renderer.pickAt(
            new Vector(currentBlockOrigin.x - 4, currentBlockOrigin.y - 4, currentBlockOrigin.z - 4),
            new Vector(currentBlockOrigin.x + 4, currentBlockOrigin.y + 4, currentBlockOrigin.z + 4),
            targetX, targetY
        );

        if (identifiedBlock) {
            const targetSystem = this.#communicator || this.#environment;

            if (shouldRemove) {
                targetSystem.setBlock(identifiedBlock.x, identifiedBlock.y, identifiedBlock.z, BLOCK.AIR);
            } else {
                targetSystem.setBlock(
                    identifiedBlock.x + identifiedBlock.n.x,
                    identifiedBlock.y + identifiedBlock.n.y,
                    identifiedBlock.z + identifiedBlock.n.z,
                    this.#activeResource
                );
            }
        }
    }

    obtainViewpoint() {
        return this.#position.add(new Vector(0.0, 0.0, 1.7));
    }

    advanceState() {
        const currentEnvironment = this.#environment;
        const currentMomentum = this.#momentum;
        const currentPosition = this.#position;
        const currentBlockPosition = new Vector(
            Math.floor(currentPosition.x),
            Math.floor(currentPosition.y),
            Math.floor(currentPosition.z)
        );

        if (this.#lastTickTime !== null) {
            const timeElapsed = (new Date().getTime() - this.#lastTickTime) / 1000;

            if (this.#isDragging) {
                this.#orientation[0] += (this.#desiredPitch - this.#orientation[0]) * 30 * timeElapsed;
                this.#orientation[1] += (this.#desiredYaw - this.#orientation[1]) * 30 * timeElapsed;
                this.#orientation[0] = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.#orientation[0]));
            }

            if (this.#isFalling) {
                currentMomentum.z += -0.5;
            }

            if (this.#keyStates[" "] && !this.#isFalling) {
                currentMomentum.z = 8;
            }

            const movementContribution = new Vector(0, 0, 0);
            if (!this.#isFalling) {
                const rotationAngle = this.#orientation[1];
                const keyMapping = {
                    "w": new Vector(Math.cos(Math.PI / 2 - rotationAngle), Math.sin(Math.PI / 2 - rotationAngle), 0),
                    "s": new Vector(Math.cos(Math.PI + Math.PI / 2 - rotationAngle), Math.sin(Math.PI + Math.PI / 2 - rotationAngle), 0),
                    "a": new Vector(Math.cos(Math.PI / 2 + Math.PI / 2 - rotationAngle), Math.sin(Math.PI / 2 + Math.PI / 2 - rotationAngle), 0),
                    "d": new Vector(Math.cos(-Math.PI / 2 + Math.PI / 2 - rotationAngle), Math.sin(-Math.PI / 2 + Math.PI / 2 - rotationAngle), 0)
                };

                Object.keys(keyMapping).forEach(key => {
                    if (this.#keyStates[key]) {
                        movementContribution.x += keyMapping[key].x;
                        movementContribution.y += keyMapping[key].y;
                    }
                });
            }

            if (movementContribution.length() > 0) {
                const normalizedMovement = movementContribution.normal();
                currentMomentum.x = normalizedMovement.x * 4;
                currentMomentum.y = normalizedMovement.y * 4;
            } else {
                currentMomentum.x /= this.#isFalling ? 1.01 : 1.5;
                currentMomentum.y /= this.#isFalling ? 1.01 : 1.5;
            }

            this.#position = this.#computeMovementBounds(
                currentPosition,
                currentBlockPosition,
                currentMomentum.mul(timeElapsed)
            );
        }

        this.#lastTickTime = new Date().getTime();
    }

    #computeMovementBounds(currentPos, currentBlockPos, desiredDisplacement) {
        const currentEnv = this.#environment;
        const entityBoundary = { x: currentPos.x + desiredDisplacement.x, y: currentPos.y + desiredDisplacement.y, size: 0.25 };

        let potentialXYCollisions = [];

        for (let xOffset = -1; xOffset <= 1; xOffset++) {
            for (let yOffset = -1; yOffset <= 1; yOffset++) {
                for (let zOffset = 0; zOffset <= 1; zOffset++) {
                    const blockX = currentBlockPos.x + xOffset;
                    const blockY = currentBlockPos.y + yOffset;
                    const blockZ = currentBlockPos.z + zOffset;

                    if (currentEnv.getBlock(blockX, blockY, blockZ) !== BLOCK.AIR) {
                        if (currentEnv.getBlock(blockX - 1, blockY, blockZ) === BLOCK.AIR) potentialXYCollisions.push({ xCoord: blockX, direction: -1, startY: blockY, endY: blockY + 1 });
                        if (currentEnv.getBlock(blockX + 1, blockY, blockZ) === BLOCK.AIR) potentialXYCollisions.push({ xCoord: blockX + 1, direction: 1, startY: blockY, endY: blockY + 1 });
                        if (currentEnv.getBlock(blockX, blockY - 1, blockZ) === BLOCK.AIR) potentialXYCollisions.push({ yCoord: blockY, direction: -1, startX: blockX, endX: blockX + 1 });
                        if (currentEnv.getBlock(blockX, blockY + 1, blockZ) === BLOCK.AIR) potentialXYCollisions.push({ yCoord: blockY + 1, direction: 1, startX: blockX, endX: blockX + 1 });
                    }
                }
            }
        }

        potentialXYCollisions.forEach(boundarySegment => {
            if (checkLineRectangleOverlap(boundarySegment, entityBoundary)) {
                if (boundarySegment.xCoord !== undefined && desiredDisplacement.x * boundarySegment.direction < 0) {
                    currentPos.x = boundarySegment.xCoord + entityBoundary.size / 2 * (desiredDisplacement.x > 0 ? -1 : 1);
                    desiredDisplacement.x = 0;
                } else if (boundarySegment.yCoord !== undefined && desiredDisplacement.y * boundarySegment.direction < 0) {
                    currentPos.y = boundarySegment.yCoord + entityBoundary.size / 2 * (desiredDisplacement.y > 0 ? -1 : 1);
                    desiredDisplacement.y = 0;
                }
            }
        });

        const entityFaceBounds = {
            x1: currentPos.x + desiredDisplacement.x - 0.125,
            y1: currentPos.y + desiredDisplacement.y - 0.125,
            x2: currentPos.x + desiredDisplacement.x + 0.125,
            y2: currentPos.y + desiredDisplacement.y + 0.125
        };
        const newLowerZ = Math.floor(currentPos.z + desiredDisplacement.z);
        const newUpperZ = Math.floor(currentPos.z + 1.7 + desiredDisplacement.z * 1.1);

        let potentialZCollisions = [];

        for (let xOffset = -1; xOffset <= 1; xOffset++) {
            for (let yOffset = -1; yOffset <= 1; yOffset++) {
                const blockX = currentBlockPos.x + xOffset;
                const blockY = currentBlockPos.y + yOffset;

                if (currentEnv.getBlock(blockX, blockY, newLowerZ) !== BLOCK.AIR) {
                    potentialZCollisions.push({
                        zCoord: newLowerZ + 1,
                        direction: 1,
                        minX: blockX,
                        minY: blockY,
                        maxX: blockX + 1,
                        maxY: blockY + 1
                    });
                }
                if (currentEnv.getBlock(blockX, blockY, newUpperZ) !== BLOCK.AIR) {
                    potentialZCollisions.push({
                        zCoord: newUpperZ,
                        direction: -1,
                        minX: blockX,
                        minY: blockY,
                        maxX: blockX + 1,
                        maxY: blockY + 1
                    });
                }
            }
        }

        this.#isFalling = true;
        potentialZCollisions.some(faceBoundary => {
            if (checkRectangleOverlap(faceBoundary, entityFaceBounds) && desiredDisplacement.z * faceBoundary.direction < 0) {
                if (desiredDisplacement.z < 0) {
                    this.#isFalling = false;
                    currentPos.z = faceBoundary.zCoord;
                    desiredDisplacement.z = 0;
                    this.#momentum.z = 0;
                } else {
                    currentPos.z = faceBoundary.zCoord - 1.8;
                    desiredDisplacement.z = 0;
                    this.#momentum.z = 0;
                }
                return true;
            }
            return false;
        });

        return currentPos.add(desiredDisplacement);
    }
}