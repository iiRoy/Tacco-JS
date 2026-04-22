(function() {
  // A constant defining the pixel dimension for each grid unit.
  const GRID_UNIT_SIZE = 48;

  // An array of predefined level layouts, representing the game's puzzles.
  const PUZZLE_LEVELS = [
    ["xxxxxxxxxxxxxx", "x            x", "x            x", "x      r     x", "x      xx    x", "x  g     r b x", "xxbxxxg xxxxxx", "xxxxxxxxxxxxxx"],
    ["xxxxxxxxxxxxxx", "x            x", "x            x", "x            x", "x     g   g  x", "x   r r   r  x", "xxxxx x x xxxx", "xxxxxxxxxxxxxx"],
    ["xxxxxxxxxxxxxx", "x            x", "x            x", "x   bg  x g  x", "xxx xxxrxxx  x", "x      b     x", "xxx xxxrxxxxxx", "xxxxxxxxxxxxxx"],
    ["xxxxxxxxxxxxxx", "x            x", "x       r    x", "x       b    x", "x       x    x", "x b r        x", "x b r      b x", "xxx x      xxx", "xxxxx xxxxxxxx", "xxxxxxxxxxxxxx"],
    ["xxxxxxxxxxxxxx", "x            x", "x            x", "xrg  gg      x", "xxx xxxx xx  x", "xrg          x", "xxxxx  xx   xx", "xxxxxx xx  xxx", "xxxxxxxxxxxxxx"],
    ["xxxxxxxxxxxxxx", "xxxxxxx      x", "xxxxxxx g    x", "x       xx   x", "x r   b      x", "x x xxx x g  x", "x         x bx", "x       r xxxx", "x   xxxxxxxxxx", "xxxxxxxxxxxxxx"]
  ];

  /**
   * Helper function to position a DOM element on the game grid.
   * @param {HTMLElement} targetElement - The DOM element to position.
   * @param {number} gridX - The X-coordinate on the grid.
   * @param {number} gridY - The Y-coordinate on the grid.
   */
  const alignElementToGrid = (targetElement, gridX, gridY) => {
    targetElement.style.left = `${gridX * GRID_UNIT_SIZE}px`;
    targetElement.style.top = `${gridY * GRID_UNIT_SIZE}px`;
  };

  /**
   * Represents a single component (or cell) of a larger game blob.
   */
  class BlobComponent {
    /**
     * @param {GameBlob} parentBlob - The main blob this component belongs to.
     * @param {number} localX - X-coordinate relative to the parent blob's origin.
     * @param {number} localY - Y-coordinate relative to the parent blob's origin.
     * @param {string} componentColor - The color of this component.
     */
    constructor(parentBlob, localX, localY, componentColor) {
      this.parentBlob = parentBlob;
      this.localX = localX;
      this.localY = localY;
      this.componentColor = componentColor;
      this.domNode = document.createElement('div');
      this.domNode.className = `grid-cell blob-part ${componentColor}`;
    }
  }

  /**
   * Represents a movable game piece (jelly blob) composed of one or more BlobComponents.
   */
  class GameBlob {
    /**
     * @param {GameGrid} currentGrid - The game grid this blob exists on.
     * @param {number} initialX - Initial X-coordinate of the blob's origin.
     * @param {number} initialY - Initial Y-coordinate of the blob's origin.
     * @param {string} blobColor - The primary color of the blob.
     */
    constructor(currentGrid, initialX, initialY, blobColor) {
      this.currentGrid = currentGrid;
      this.xPosition = initialX;
      this.yPosition = initialY;
      this.blobColor = blobColor;
      this.domNode = document.createElement('div');
      this.updateGridPosition(this.xPosition, this.yPosition);
      this.domNode.className = 'grid-cell game-blob-container';

      // Create the initial component for this blob
      const coreComponent = new BlobComponent(this, 0, 0, this.blobColor);
      this.domNode.appendChild(coreComponent.domNode);
      this.components = [coreComponent];

      // Store touch start position for swipe detection
      let touchStartX = 0;

      // Event listeners for user interaction
      this.domNode.addEventListener('contextmenu', (event) => {
        event.preventDefault(); // Prevent default context menu
        this.currentGrid.attemptMovement(this, 1); // Simulate right swipe
      });
      this.domNode.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default click behavior
        this.currentGrid.attemptMovement(this, -1); // Simulate left swipe
      });
      this.domNode.addEventListener('touchstart', (event) => {
        touchStartX = event.touches[0].pageX;
      });
      this.domNode.addEventListener('touchmove', (event) => {
        const currentTouchX = event.touches[0].pageX;
        const deltaX = currentTouchX - touchStartX;
        // Only trigger a slide if the swipe is significant enough
        if (Math.abs(deltaX) > 10) {
          const slideDirection = Math.sign(deltaX); // -1 for left, 1 for right
          this.currentGrid.attemptMovement(this, slideDirection);
          touchStartX = currentTouchX; // Reset touch start to prevent multiple triggers
        }
      });
    }

    /**
     * Calculates the absolute grid coordinates occupied by all components of this blob.
     * @returns {Array<[number, number]>} An array of [x, y] coordinate pairs.
     */
    getOccupiedGridCoordinates() {
      return this.components.map(comp => [this.xPosition + comp.localX, this.yPosition + comp.localY]);
    }

    /**
     * Updates the blob's position on the grid and its corresponding DOM element.
     * @param {number} newX - The new X-coordinate.
     * @param {number} newY - The new Y-coordinate.
     */
    updateGridPosition(newX, newY) {
      this.xPosition = newX;
      this.yPosition = newY;
      alignElementToGrid(this.domNode, this.xPosition, this.yPosition);
    }

    /**
     * Merges another blob into this one. This blob absorbs all components of the other.
     * @param {GameBlob} otherBlob - The blob to merge into this one.
     */
    merge(otherBlob) {
      // Calculate relative displacement for components from otherBlob
      const displacementX = otherBlob.xPosition - this.xPosition;
      const displacementY = otherBlob.yPosition - this.yPosition;

      // Transfer components from the other blob to this one
      otherBlob.components.forEach(comp => {
        this.components.push(comp);
        comp.localX += displacementX;
        comp.localY += displacementY;
        alignElementToGrid(comp.domNode, comp.localX, comp.localY); // Update component's local position
        this.domNode.appendChild(comp.domNode); // Re-parent component DOM node
      });

      // Clear components and remove DOM for the merged blob
      otherBlob.components = [];
      if (otherBlob.domNode.parentNode) {
        otherBlob.domNode.parentNode.removeChild(otherBlob.domNode);
      }

      // Re-evaluate and adjust borders between merged components
      this.adjustInternalBorders();
    }

    /**
     * Adjusts the borders between components within this blob after a merge or initial creation.
     */
    adjustInternalBorders() {
      this.components.forEach(compA => {
        // Reset borders first
        compA.domNode.style.borderRight = '';
        compA.domNode.style.borderLeft = '';
        compA.domNode.style.borderBottom = '';
        compA.domNode.style.borderTop = '';

        this.components.forEach(compB => {
          if (compB === compA) return;

          // Check for adjacent components and remove shared borders
          if (compB.localX === compA.localX + 1 && compB.localY === compA.localY) {
            compA.domNode.style.borderRight = 'none';
          } else if (compB.localX === compA.localX - 1 && compB.localY === compA.localY) {
            compA.domNode.style.borderLeft = 'none';
          } else if (compB.localX === compA.localX && compB.localY === compA.localY + 1) {
            compA.domNode.style.borderBottom = 'none';
          } else if (compB.localX === compA.localX && compB.localY === compA.localY - 1) {
            compA.domNode.style.borderTop = 'none';
          }
        });
      });
    }
  }

  /**
   * The main game grid, managing blobs, movement, and game state.
   */
  class GameGrid {
    /**
     * @param {HTMLElement} hostElement - The DOM element where the game grid will be rendered.
     * @param {Array<string>} levelLayout - An array of strings representing the level map.
     */
    constructor(hostElement, levelLayout) {
      if (!hostElement || !levelLayout) {
        console.error("GameGrid constructor requires a host element and level layout.");
        return;
      }

      this.containerNode = hostElement;
      this.activeBlobs = []; // All game blobs currently on the grid
      this.isBusyAnimating = false; // Flag to prevent multiple actions during animation

      this.initializeGrid(levelLayout);
      this.setupInteractionListeners();
      this.processInitialMerges();
    }

    /**
     * Initializes the grid structure and places game elements based on the level layout.
     * @param {Array<string>} levelLayout - The layout map for the current level.
     */
    initializeGrid(levelLayout) {
      const gridTableElement = document.createElement('table');
      this.containerNode.appendChild(gridTableElement);

      this.gridCells = levelLayout.map((rowStr, yIdx) => {
        const rowElements = rowStr.split('');
        const gridRowElement = document.createElement('tr');
        gridTableElement.appendChild(gridRowElement);

        return rowElements.map((char, xIdx) => {
          let cellNode = null;
          let blobInstance = null;
          let cellType = 'empty';
          let blobColor = null;

          switch (char) {
            case 'x':
              cellType = 'wall';
              cellNode = document.createElement('td');
              cellNode.className = 'grid-cell wall-cell';
              gridRowElement.appendChild(cellNode);
              break;
            case 'r':
              blobColor = 'red';
              break;
            case 'g':
              blobColor = 'green';
              break;
            case 'b':
              blobColor = 'blue';
              break;
            default: // Empty space
              cellNode = document.createElement('td');
              cellNode.className = 'grid-cell transparent-cell';
              gridRowElement.appendChild(cellNode);
              break;
          }

          if (blobColor) {
            blobInstance = new GameBlob(this, xIdx, yIdx, blobColor);
            this.containerNode.appendChild(blobInstance.domNode);
            this.activeBlobs.push(blobInstance);
            // In the gridCells array, a blob occupies its own space
            // This is a simplification; in reality, a blob has "components"
            // For collision detection, we treat the blob's origin as its primary cell.
            return blobInstance;
          } else {
            return cellNode; // Return the DOM node for walls/empty cells
          }
        });
      });

      this.addGridBorders();
    }

    /**
     * Adds visual borders to grid cells that are adjacent to non-grid elements (or outside boundaries).
     */
    addGridBorders() {
      const wallBorder = 'solid 1px #777';
      const cellHeight = this.gridCells.length;
      const cellWidth = this.gridCells[0].length;

      for (let y = 0; y < cellHeight; y++) {
        for (let x = 0; x < cellWidth; x++) {
          const currentCell = this.gridCells[y][x];

          // Only add borders to actual DOM cells (not blobs, which are separate DOM elements)
          if (!currentCell || !(currentCell instanceof HTMLElement)) {
            continue;
          }

          const borderDirections = [
            { attr: 'borderBottom', dx: 0, dy: 1 },
            { attr: 'borderTop', dx: 0, dy: -1 },
            { attr: 'borderLeft', dx: -1, dy: 0 },
            { attr: 'borderRight', dx: 1, dy: 0 }
          ];

          for (const { attr, dx, dy } of borderDirections) {
            const neighborY = y + dy;
            const neighborX = x + dx;

            // Check if neighbor is out of bounds
            if (neighborY < 0 || neighborY >= cellHeight || neighborX < 0 || neighborX >= cellWidth) {
              currentCell.style[attr] = wallBorder;
              continue;
            }

            const neighborCell = this.gridCells[neighborY][neighborX];
            // If the neighbor is not a DOM element (i.e., it's a blob) or is null, add a border
            if (!neighborCell || !(neighborCell instanceof HTMLElement)) {
              currentCell.style[attr] = wallBorder;
            }
          }
        }
      }
    }

    /**
     * Sets up global event listeners to prevent default actions during game interaction.
     */
    setupInteractionListeners() {
      const swallowEventIfBusy = (evt) => {
        evt.preventDefault();
        if (this.isBusyAnimating) {
          evt.stopPropagation();
        }
      };

      ['contextmenu', 'click', 'touchstart', 'touchmove'].forEach(eventType => {
        this.containerNode.addEventListener(eventType, swallowEventIfBusy, { passive: false });
      });
    }

    /**
     * Waits for CSS transitions to complete before executing a callback.
     * @param {Function} callback - The function to execute after animation.
     */
    waitForTransitionEnd(callback) {
      const transitionEvents = ['transitionend', 'webkitTransitionEnd'];
      let completedTransitions = 0;
      const expectedTransitions = this.activeBlobs.length; // Approximate, depends on actual moving blobs

      const handleTransition = () => {
        completedTransitions++;
        if (completedTransitions >= expectedTransitions || expectedTransitions === 0) {
          transitionEvents.forEach(eventName => this.containerNode.removeEventListener(eventName, handleTransition));
          // Use setTimeout to ensure event loop clears before callback, preventing immediate re-trigger
          setTimeout(callback, 0);
        }
      };

      transitionEvents.forEach(eventName => this.containerNode.addEventListener(eventName, handleTransition, { once: true }));
      // Fallback for no transitions or if expectedTransitions is 0
      if (expectedTransitions === 0) {
          setTimeout(callback, 0);
      }
    }

    /**
     * Attempts to slide a blob (or group of blobs) in a given direction.
     * @param {GameBlob} initialBlob - The blob that initiated the slide.
     * @param {number} direction - -1 for left, 1 for right.
     */
    attemptMovement(initialBlob, direction) {
      if (this.isBusyAnimating) {
        return;
      }

      // Determine the actual movement vector
      const deltaX = direction;
      const deltaY = 0; // Horizontal movement only

      // Collect all blobs that would move together
      const blobsToMove = [initialBlob];
      if (this.wouldCollideOrBeBlocked(blobsToMove, deltaX, deltaY)) {
        return; // Movement is blocked
      }

      this.isBusyAnimating = true;
      this.executeMovement(blobsToMove, deltaX, deltaY);

      this.waitForTransitionEnd(() => {
        this.checkAndResolveGravity(() => {
          this.processInitialMerges(); // Check for merges after fall
          this.isBusyAnimating = false;
        });
      });
    }

    /**
     * Executes the physical movement of a collection of blobs on the grid.
     * @param {Array<GameBlob>} movingBlobs - An array of blobs to move.
     * @param {number} deltaX - Change in X-coordinate.
     * @param {number} deltaY - Change in Y-coordinate.
     */
    executeMovement(movingBlobs, deltaX, deltaY) {
      // Clear current positions in the gridCells map
      movingBlobs.forEach(blob => {
        blob.getOccupiedGridCoordinates().forEach(([x, y]) => {
          if (this.gridCells[y] && this.gridCells[y][x] === blob) {
            // Restore the underlying cell type (e.g., transparent)
            this.gridCells[y][x] = document.createElement('td'); // Placeholder for empty
            this.gridCells[y][x].className = 'grid-cell transparent-cell';
            // Note: This is a simplified representation. A real game might keep track of actual empty DOM nodes.
          }
        });
      });

      // Update blob positions and their DOM
      movingBlobs.forEach(blob => {
        blob.updateGridPosition(blob.xPosition + deltaX, blob.yPosition + deltaY);
      });

      // Update gridCells map with new blob positions
      movingBlobs.forEach(blob => {
        blob.getOccupiedGridCoordinates().forEach(([x, y]) => {
          if (this.gridCells[y] && x >= 0 && x < this.gridCells[0].length) {
             this.gridCells[y][x] = blob;
          }
        });
      });
    }

    /**
     * Checks if a set of blobs would collide with walls or other non-moving blobs.
     * @param {Array<GameBlob>} blobsToCheck - The blobs proposed to move.
     * @param {number} prospectiveDx - The prospective X-movement.
     * @param {number} prospectiveDy - The prospective Y-movement.
     * @returns {boolean} True if a collision or blockage is detected, false otherwise.
     */
    wouldCollideOrBeBlocked(blobsToCheck, prospectiveDx, prospectiveDy) {
      const gridHeight = this.gridCells.length;
      const gridWidth = this.gridCells[0].length;

      // Iterate until no more connected blobs are found
      let allMovingBlobs = new Set(blobsToCheck);
      let changed = true;

      while (changed) {
        changed = false;
        for (const currentBlob of Array.from(allMovingBlobs)) { // Iterate over a copy
          for (const [x, y] of currentBlob.getOccupiedGridCoordinates()) {
            const nextX = x + prospectiveDx;
            const nextY = y + prospectiveDy;

            // Check grid boundaries
            if (nextY < 0 || nextY >= gridHeight || nextX < 0 || nextX >= gridWidth) {
              return true; // Out of bounds
            }

            const targetCell = this.gridCells[nextY][nextX];

            // If target is a wall
            if (targetCell instanceof HTMLElement && targetCell.classList.contains('wall-cell')) {
              return true;
            }

            // If target is another blob not already part of the moving group
            if (targetCell instanceof GameBlob && !allMovingBlobs.has(targetCell)) {
              allMovingBlobs.add(targetCell);
              changed = true; // Found a new blob to add to the moving group
            }
          }
        }
      }
      // If we reach here, no immediate blockage, but we need to update blobsToCheck with allMovingBlobs
      blobsToCheck.splice(0, blobsToCheck.length, ...Array.from(allMovingBlobs));
      return false; // No blockage detected
    }

    /**
     * Checks if any blobs need to fall due to gravity and executes the fall.
     * @param {Function} onFallComplete - Callback to execute after all falling animations complete.
     */
    checkAndResolveGravity(onFallComplete) {
      let anyBlobMoved = false;
      let didOnePassMove = true;

      while (didOnePassMove) {
        didOnePassMove = false;
        // Iterate through blobs, checking for downward movement opportunity
        // IMPORTANT: Iterate in reverse Y order to avoid issues with blobs falling into positions
        // that other blobs are still "occupying" in the current iteration.
        const sortedBlobs = [...this.activeBlobs].sort((a, b) => b.yPosition - a.yPosition);

        for (const blob of sortedBlobs) {
          // If a blob is newly merged, its components list might be empty. Skip it.
          if (blob.components.length === 0) continue;

          const blobsToFall = [blob];
          // Check if it can fall without collision
          if (!this.wouldCollideOrBeBlocked(blobsToFall, 0, 1)) {
            this.executeMovement(blobsToFall, 0, 1);
            didOnePassMove = true;
            anyBlobMoved = true;
          }
        }
      }

      if (anyBlobMoved) {
        this.waitForTransitionEnd(onFallComplete);
      } else {
        onFallComplete();
      }
    }

    /**
     * Continuously checks for and performs merges until no more merges are possible.
     */
    processInitialMerges() {
      let mergedThisRound = false;
      let mergedBlob;

      // Loop as long as merges are occurring
      while ((mergedBlob = this.findAndPerformOneMerge())) {
        mergedThisRound = true;
        // After a merge, the merged blob might change shape, so update its grid representation
        mergedBlob.getOccupiedGridCoordinates().forEach(([x, y]) => {
          if (this.gridCells[y] && x >= 0 && x < this.gridCells[0].length) {
            this.gridCells[y][x] = mergedBlob;
          }
        });
      }

      if (mergedThisRound) {
        this.checkCompletionStatus();
      }
    }

    /**
     * Attempts to find and perform a single merge between two adjacent blobs of the same color.
     * @returns {GameBlob|null} The merged blob if a merge occurred, otherwise null.
     */
    findAndPerformOneMerge() {
      const adjacencyVectors = [[1, 0], [0, 1]]; // Check right and down

      for (const currentBlob of this.activeBlobs) {
        // If a blob has been merged into another, it will have no components left
        if (currentBlob.components.length === 0) continue;

        for (const [x, y] of currentBlob.getOccupiedGridCoordinates()) {
          for (const [dx, dy] of adjacencyVectors) {
            const neighborX = x + dx;
            const neighborY = y + dy;

            // Ensure neighbor is within grid bounds
            if (neighborY < 0 || neighborY >= this.gridCells.length || neighborX < 0 || neighborX >= this.gridCells[0].length) {
              continue;
            }

            const neighborCellContent = this.gridCells[neighborY][neighborX];

            // Check if neighbor is a blob, not the current blob, and has the same color
            if (neighborCellContent instanceof GameBlob &&
              neighborCellContent !== currentBlob &&
              currentBlob.blobColor === neighborCellContent.blobColor) {

              currentBlob.merge(neighborCellContent);
              // Remove the merged-into blob from the active list
              this.activeBlobs = this.activeBlobs.filter(blob => blob !== neighborCellContent);
              return currentBlob; // Return the blob that grew
            }
          }
        }
      }
      return null; // No merge found
    }

    /**
     * Checks if the current level has been completed (all blobs of the same color merged).
     */
    checkCompletionStatus() {
      // Collect unique colors from remaining active blobs
      const uniqueColors = new Set(this.activeBlobs.map(blob => blob.blobColor));

      // If all remaining blobs have unique colors, it means each color has merged into a single blob.
      if (uniqueColors.size === this.activeBlobs.length && this.activeBlobs.length > 0) {
        alert("Level Cleared! Fantastic work!");
        // Optionally, advance to the next level or show a victory screen.
      }
    }
  }

  // --- Main Game Initialization ---

  // Get the current level from URL query parameter, default to 1
  let currentPuzzleIndex = parseInt(location.search.substring(1), 10) || 1;
  // Adjust to 0-based index for array access
  currentPuzzleIndex = Math.max(1, Math.min(currentPuzzleIndex, PUZZLE_LEVELS.length)) - 1;

  const gameContainer = document.getElementById('game-area');
  let activeGameInstance = new GameGrid(gameContainer, PUZZLE_LEVELS[currentPuzzleIndex]);

  // Expose the game instance for debugging if needed
  window.activeGameInstance = activeGameInstance;

  // Level selection dropdown logic
  const puzzleSelectorElement = document.getElementById('level-selector');
  if (puzzleSelectorElement) {
    PUZZLE_LEVELS.forEach((_, idx) => {
      const optionElement = document.createElement('option');
      optionElement.value = idx + 1;
      optionElement.textContent = `Puzzle ${idx + 1}`;
      puzzleSelectorElement.appendChild(optionElement);
    });

    puzzleSelectorElement.value = currentPuzzleIndex + 1; // Set selected option

    puzzleSelectorElement.addEventListener('change', () => {
      // Reload page with new level parameter
      window.location.search = `?${puzzleSelectorElement.value}`;
    });
  }

  // Reset button logic
  const resetButton = document.getElementById('reset-button');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      // Clear previous game state and reinitialize
      if (gameContainer) {
        gameContainer.innerHTML = ''; // Remove all child elements
        activeGameInstance = new GameGrid(gameContainer, PUZZLE_LEVELS[currentPuzzleIndex]);
        window.activeGameInstance = activeGameInstance;
      }
    });
  }
})();