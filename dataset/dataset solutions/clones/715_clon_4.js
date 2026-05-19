#!/usr/bin/node
(function() {
  const allInputLinesBuffer = [];
  const standardInputChannel = process.openStdin();
  standardInputChannel.setEncoding('utf8');

  standardInputChannel.on('data', function(incomingChunk) {
    allInputLinesBuffer.push(...incomingChunk.split('\n'));
  });

  standardInputChannel.on('end', function() {
    // Filter out any empty strings that might result from split, especially at the end
    const completeInputSegments = allInputLinesBuffer.filter(segment => segment.trim() !== '');
    let currentSegmentIndex = 0;

    // DisjointSet-like class for tracking connected components
    class ComponentGroupManager {
        constructor(totalElements) {
            // Stores the parent (representative) of each element.
            // If groupRepresentatives[i] === i, then i is the root of its group.
            this.groupRepresentatives = new Array(totalElements);
            // Stores the size of the tree rooted at i. Used for union by size heuristic.
            this.groupSizes = new Array(totalElements);
            // Elements are initialized only when a '1' is encountered in the grid.
            // Uninitialized elements will have 'undefined' in groupRepresentatives.
        }

        // Finds the representative (root) of the group containing element 'idx'
        // with path compression for efficiency.
        findRepresentative(idx) {
            // If element is not yet initialized, it's its own root for now.
            // This case should ideally be handled by ensureInitialized before findRepresentative is called.
            if (this.groupRepresentatives[idx] === undefined) {
                return idx;
            }
            if (this.groupRepresentatives[idx] === idx) {
                return idx;
            }
            return this.groupRepresentatives[idx] = this.findRepresentative(this.groupRepresentatives[idx]);
        }

        // Merges the groups containing elements 'idxA' and 'idxB'.
        // Returns true if a merge occurred (i.e., they were in different groups), false otherwise.
        uniteGroups(idxA, idxB) {
            let rootA = this.findRepresentative(idxA);
            let rootB = this.findRepresentative(idxB);

            if (rootA !== rootB) {
                // Union by size heuristic: attach smaller tree under the root of the larger tree.
                if (this.groupSizes[rootA] < this.groupSizes[rootB]) {
                    [rootA, rootB] = [rootB, rootA]; // Swap to ensure rootA is the larger or equal tree
                }
                this.groupRepresentatives[rootB] = rootA;
                this.groupSizes[rootA] += this.groupSizes[rootB];
                return true; // A merge happened
            }
            return false; // Elements were already in the same group
        }

        // Initializes an element as a new, standalone group.
        // Returns true if the element was newly initialized, false if it was already part of a group.
        ensureInitialized(idx) {
            if (this.groupRepresentatives[idx] === undefined) {
                this.groupRepresentatives[idx] = idx;
                this.groupSizes[idx] = 1;
                return true; // Element was not part of any group, now it's its own root
            }
            return false; // Element was already initialized
        }
    }

    // Offsets for checking all 8 neighboring cells (including diagonals)
    const eightWayNeighborOffsets = [
        [-1,-1], [0,-1], [1,-1], // Top row neighbors
        [-1,0],           [1,0],  // Middle row neighbors (excluding self)
        [-1,1],  [0,1],  [1,1]   // Bottom row neighbors
    ];

    while (currentSegmentIndex < completeInputSegments.length) {
      const dimensionValues = completeInputSegments[currentSegmentIndex].split(' ').map(Number);
      const gridWidth = dimensionValues[0];
      const gridHeight = dimensionValues[1];

      if (gridHeight === 0) {
        break; // Signal to terminate processing
      }

      currentSegmentIndex++; // Advance past the dimension line

      const currentGridMatrix = [];
      for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        currentGridMatrix.push(completeInputSegments[currentSegmentIndex + rowIdx].split(' ').map(Number));
      }
      currentSegmentIndex += gridHeight; // Advance past the grid data lines

      const totalGridCells = gridWidth * gridHeight;
      const componentTracker = new ComponentGroupManager(totalGridCells);
      let distinctIslandCount = 0;

      for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
          if (currentGridMatrix[row][col] === 1) {
            const currentCellLinearPosition = row * gridWidth + col;

            // If this '1' cell is encountered for the first time, it initially forms a new island
            if (componentTracker.ensureInitialized(currentCellLinearPosition)) {
              distinctIslandCount++;
            }

            // Examine all 8 neighbors of the current '1' cell
            for (const [deltaColumn, deltaRow] of eightWayNeighborOffsets) {
              const neighborRow = row + deltaRow;
              const neighborCol = col + deltaColumn;

              // Check if the neighbor is within the grid boundaries
              if (neighborRow >= 0 && neighborRow < gridHeight &&
                  neighborCol >= 0 && neighborCol < gridWidth) {

                // If the neighbor is also a '1'
                if (currentGridMatrix[neighborRow][neighborCol] === 1) {
                  const neighborCellLinearPosition = neighborRow * gridWidth + neighborCol;

                  // Ensure the neighbor cell is also initialized as a potential island component.
                  // This might increment distinctIslandCount if it's a new '1' cell not yet processed.
                  if (componentTracker.ensureInitialized(neighborCellLinearPosition)) {
                      distinctIslandCount++;
                  }

                  // Attempt to merge the component of the current cell with that of its neighbor.
                  // If a merge successfully occurs (they were in different components), reduce the total count.
                  if (componentTracker.uniteGroups(currentCellLinearPosition, neighborCellLinearPosition)) {
                    distinctIslandCount--; // A merge happened, so the number of distinct islands decreases
                  }
                }
              }
            }
          }
        }
      }
      console.log(distinctIslandCount);
    }
  });
}).call(this);
