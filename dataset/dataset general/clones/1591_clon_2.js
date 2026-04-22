(function() {
  // This module manages the interactive game grid and blob mechanics.
  var GRID_UNIT_PIXELS, BlobEntity, BlobComponent, GameArena, idx, currentPuzzleIndex, puzzleSelector, puzzleMaps, repositionElement, choiceElem, gameInstance, loopVar, loopLimit,
    _arrayContainsItem = [].indexOf || function(itemToCheck) { for (var k = 0, limit = this.length; k < limit; k++) { if (k in this && this[k] === itemToCheck) return k; } return -1; };

  puzzleMaps = [
    ["xxxxxxxxxxxxxx", "x            x", "x            x", "x      r     x", "x      xx    x", "x  g     r b x", "xxbxxxg xxxxxx", "xxxxxxxxxxxxxx"],
    ["xxxxxxxxxxxxxx", "x            x", "x            x", "x            x", "x     g   g  x", "x   r r   r  x", "xxxxx x x xxxx", "xxxxxxxxxxxxxx"],
    ["xxxxxxxxxxxxxx", "x            x", "x            x", "x   bg  x g  x", "xxx xxxrxxx  x", "x      b     x", "xxx xxxrxxxxxx", "xxxxxxxxxxxxxx"],
    ["xxxxxxxxxxxxxx", "x            x", "x       r    x", "x       b    x", "x       x    x", "x b r        x", "x b r      b x", "xxx x      xxx", "xxxxx xxxxxxxx", "xxxxxxxxxxxxxx"],
    ["xxxxxxxxxxxxxx", "x            x", "x            x", "xrg  gg      x", "xxx xxxx xx  x", "xrg          x", "xxxxx  xx   xx", "xxxxxx xx  xxx", "xxxxxxxxxxxxxx"],
    ["xxxxxxxxxxxxxx", "xxxxxxx      x", "xxxxxxx g    x", "x       xx   x", "x r   b      x", "x x xxx x g  x", "x         x bx", "x       r xxxx", "x   xxxxxxxxxx", "xxxxxxxxxxxxxx"]
  ];

  GRID_UNIT_PIXELS = 48;

  repositionElement = function(targetElement, gridX, gridY) {
    targetElement.style.left = gridX * GRID_UNIT_PIXELS + 'px';
    return targetElement.style.top = gridY * GRID_UNIT_PIXELS + 'px';
  };

  GameArena = (function() {

    function GameArena(displayContainer, layoutData) {
      var evtName, trapEventFunction, eventIterator, eventCount, eventList,
        selfRef = this;
      this.displayContainer = displayContainer;
      this.blobEntities = [];
      this.initializeLayout(layoutData);
      this.isProcessingAction = false;
      trapEventFunction = function(e) {
        e.preventDefault();
        if (selfRef.isProcessingAction) {
          return e.stopPropagation();
        }
      };
      eventList = ['contextmenu', 'click', 'touchstart', 'touchmove'];
      for (eventIterator = 0, eventCount = eventList.length; eventIterator < eventCount; eventIterator++) {
        evtName = eventList[eventIterator];
        this.displayContainer.addEventListener(evtName, trapEventFunction, true);
      }
      this.checkAndCombineBlobs();
    }

    GameArena.prototype.initializeLayout = function(layoutData) {
      var currentCell, componentColor, rowString, gridTable, tableDataCell, tableRow, colCoord, rowCoord;
      gridTable = document.createElement('table');
      this.displayContainer.appendChild(gridTable);
      this.gridCells = (function() {
        var rowIterator, rowLimit, rowResults;
        rowResults = [];
        for (rowCoord = rowIterator = 0, rowLimit = layoutData.length; rowIterator < rowLimit; rowCoord = rowIterator += 1) {
          rowString = layoutData[rowCoord].split(/(?:)/);
          tableRow = document.createElement('tr');
          gridTable.appendChild(tableRow);
          rowResults.push((function() {
            var colIterator, colLimit, colResults;
            colResults = [];
            for (colCoord = colIterator = 0, colLimit = rowString.length; colIterator < colLimit; colCoord = colIterator += 1) {
              componentColor = null;
              currentCell = null;
              switch (rowString[colCoord]) {
                case 'x':
                  currentCell = document.createElement('td');
                  currentCell.className = 'cell wall';
                  tableRow.appendChild(currentCell);
                  break;
                case 'r':
                  componentColor = 'red';
                  break;
                case 'g':
                  componentColor = 'green';
                  break;
                case 'b':
                  componentColor = 'blue';
              }
              if (!currentCell) {
                tableDataCell = document.createElement('td');
                tableDataCell.className = 'transparent';
                tableRow.appendChild(tableDataCell);
              }
              if (componentColor) {
                var blobEntity = new BlobEntity(this, colCoord, rowCoord, componentColor);
                this.displayContainer.appendChild(blobEntity.displayElement);
                this.blobEntities.push(blobEntity);
                currentCell = blobEntity;
              }
              colResults.push(currentCell);
            }
            return colResults;
          }).call(this));
        }
        return rowResults;
      }).call(this);
      this.addGridBorders();
    };

    GameArena.prototype.addGridBorders = function() {
      var styleAttribute, borderStyle, currentCell, deltaX, deltaY, borderDirections, neighborCell, colCoord, rowCoord, rowIterator, rowCount, colIterator, colCount, directionIterator, directionCount, directionComponent, neighborCheckY, neighborCheckX;
      for (rowCoord = rowIterator = 0, rowCount = this.gridCells.length; rowIterator < rowCount; rowCoord = rowIterator += 1) {
        for (colCoord = colIterator = 0, colCount = this.gridCells[0].length; colIterator < colCount; colCoord = colIterator += 1) {
          currentCell = this.gridCells[rowCoord][colCoord];
          if (!(currentCell && currentCell.nodeName === 'TD')) {
            continue;
          }
          borderStyle = 'solid 1px #777';
          borderDirections = [['borderBottom', 0, 1], ['borderTop', 0, -1], ['borderLeft', -1, 0], ['borderRight', 1, 0]];
          for (directionIterator = 0, directionCount = borderDirections.length; directionIterator < directionCount; directionIterator++) {
            directionComponent = borderDirections[directionIterator], styleAttribute = directionComponent[0], deltaX = directionComponent[1], deltaY = directionComponent[2];
            if (!((0 <= (neighborCheckY = rowCoord + deltaY) && neighborCheckY < this.gridCells.length))) {
              continue;
            }
            if (!((0 <= (neighborCheckX = colCoord + deltaX) && neighborCheckX < this.gridCells[0].length))) {
              continue;
            }
            neighborCell = this.gridCells[rowCoord + deltaY][colCoord + deltaX];
            if (!(neighborCell && neighborCell.nodeName === 'TD')) {
              currentCell.style[styleAttribute] = borderStyle;
            }
          }
        }
      }
    };

    GameArena.prototype.waitForAnimation = function(callbackFunction) {
      var animationEndHandler, eventName, animationEvents, eventIterator, eventCount,
        selfRef = this;
      animationEvents = ['transitionend', 'webkitTransitionEnd'];
      animationEndHandler = function() {
        var name, eventInnerIterator, eventInnerCount;
        for (eventInnerIterator = 0, eventInnerCount = animationEvents.length; eventInnerIterator < eventInnerCount; eventInnerIterator++) {
          name = animationEvents[eventInnerIterator];
          selfRef.displayContainer.removeEventListener(name, animationEndHandler);
        }
        return setTimeout(callbackFunction, 0);
      };
      for (eventIterator = 0, eventCount = animationEvents.length; eventIterator < eventCount; eventIterator++) {
        eventName = animationEvents[eventIterator];
        this.displayContainer.addEventListener(eventName, animationEndHandler);
      }
    };

    GameArena.prototype.trySlide = function(movingBlob, directionValue) {
      var affectedBlobs,
        selfRef = this;
      affectedBlobs = [movingBlob];
      if (this.checkObstruction(affectedBlobs, directionValue, 0)) {
        return;
      }
      this.isProcessingAction = true;
      this.shiftElements(affectedBlobs, directionValue, 0);
      return this.waitForAnimation(function() {
        return selfRef.initiateGravity(function() {
          selfRef.checkAndCombineBlobs();
          return selfRef.isProcessingAction = false;
        });
      });
    };

    GameArena.prototype.shiftElements = function(movingBlobs, shiftX, shiftY) {
      var currentBlob, cellX, cellY, firstLoop, secondLoop, thirdLoop, fourthLoop, fifthLoop, blobCount1, blobCount2, blobCount3, blobCount4, blobCount5, coordLoop, blobCoords, currentCoord, nextBlobCoords, finalCoord;
      for (firstLoop = 0, blobCount1 = movingBlobs.length; firstLoop < blobCount1; firstLoop++) {
        currentBlob = movingBlobs[firstLoop];
        blobCoords = currentBlob.getComponentCoordinates();
        for (secondLoop = 0, blobCount2 = blobCoords.length; secondLoop < blobCount2; secondLoop++) {
          currentCoord = blobCoords[secondLoop], cellX = currentCoord[0], cellY = currentCoord[1];
          this.gridCells[cellY][cellX] = null;
        }
      }
      for (thirdLoop = 0, blobCount3 = movingBlobs.length; thirdLoop < blobCount3; thirdLoop++) {
        currentBlob = movingBlobs[thirdLoop];
        currentBlob.adjustPosition(currentBlob.currentX + shiftX, currentBlob.currentY + shiftY);
      }
      for (fourthLoop = 0, blobCount4 = movingBlobs.length; fourthLoop < blobCount4; fourthLoop++) {
        currentBlob = movingBlobs[fourthLoop];
        nextBlobCoords = currentBlob.getComponentCoordinates();
        for (fifthLoop = 0, blobCount5 = nextBlobCoords.length; fifthLoop < blobCount5; fifthLoop++) {
          finalCoord = nextBlobCoords[fifthLoop], cellX = finalCoord[0], cellY = finalCoord[1];
          this.gridCells[cellY][cellX] = currentBlob;
        }
      }
    };

    GameArena.prototype.checkObstruction = function(blobGroup, testDx, testDy) {
      var isFinished, currentBlob, nextGridItem, currentX, currentY, blobIterator, coordIterator, groupSize, coordList, currentCoord;
      isFinished = false;
      while (!isFinished) {
        isFinished = true;
        for (blobIterator = 0, groupSize = blobGroup.length; blobIterator < groupSize; blobIterator++) {
          currentBlob = blobGroup[blobIterator];
          coordList = currentBlob.getComponentCoordinates();
          for (coordIterator = 0, currentCoord = coordList.length; coordIterator < currentCoord; coordIterator++) {
            currentCoord = coordList[coordIterator], currentX = currentCoord[0], currentY = currentCoord[1];
            nextGridItem = this.gridCells[currentY + testDy][currentX + testDx];
            if (nextGridItem && _arrayContainsItem.call(blobGroup, nextGridItem) < 0) {
              if (!(nextGridItem instanceof BlobEntity)) {
                return true;
              }
              blobGroup.push(nextGridItem);
              isFinished = false;
              break;
            }
          }
        }
      }
      return false;
    };

    GameArena.prototype.initiateGravity = function(completionCallback) {
      var hasMovedInCycle, currentBlob, overallMovementOccurred, blobIterator, totalBlobs, allBlobs;
      overallMovementOccurred = false;
      hasMovedInCycle = true;
      while (hasMovedInCycle) {
        hasMovedInCycle = false;
        allBlobs = this.blobEntities;
        for (blobIterator = 0, totalBlobs = allBlobs.length; blobIterator < totalBlobs; blobIterator++) {
          currentBlob = allBlobs[blobIterator];
          if (!this.checkObstruction([currentBlob], 0, 1)) {
            this.shiftElements([currentBlob], 0, 1);
            hasMovedInCycle = true;
            overallMovementOccurred = true;
          }
        }
      }
      if (overallMovementOccurred) {
        this.waitForAnimation(completionCallback);
      } else {
        completionCallback();
      }
    };

    GameArena.prototype.checkAndCombineBlobs = function() {
      var mergedBlob, mergeHappened, col, row, blobIterator, coordIterator, blobCoords, currentCoord;
      mergeHappened = false;
      while (mergedBlob = this.performSingleMerge()) {
        mergeHappened = true;
        blobCoords = mergedBlob.getComponentCoordinates();
        for (blobIterator = 0, coordIterator = blobCoords.length; blobIterator < coordIterator; blobIterator++) {
          currentCoord = blobCoords[blobIterator], col = currentCoord[0], row = currentCoord[1];
          this.gridCells[row][col] = mergedBlob;
        }
      }
      if (mergeHappened) {
        this.checkGameCompletion();
      }
    };

    GameArena.prototype.checkGameCompletion = function() {
      var uniqueColors, singleBlob, blobIterator, blobCount, allBlobs;
      uniqueColors = {};
      allBlobs = this.blobEntities;
      for (blobIterator = 0, blobCount = allBlobs.length; blobIterator < blobCount; blobIterator++) {
        singleBlob = allBlobs[blobIterator];
        uniqueColors[singleBlob.hue] = 1;
      }
      if (Object.keys(uniqueColors).length === this.blobEntities.length) {
        alert("Congratulations! Level completed.");
      }
    };

    GameArena.prototype.performSingleMerge = function() {
      var deltaX, deltaY, currentBlob, adjacentBlob, cellX, cellY, blobIterator, coordIterator, directionIterator, blobCount, coordCount, directionCount, allBlobs, blobCoords, currentCoord, mergeDirections, currentDirection;
      allBlobs = this.blobEntities;
      for (blobIterator = 0, blobCount = allBlobs.length; blobIterator < blobCount; blobIterator++) {
        currentBlob = allBlobs[blobIterator];
        blobCoords = currentBlob.getComponentCoordinates();
        for (coordIterator = 0, coordCount = blobCoords.length; coordIterator < coordCount; coordIterator++) {
          currentCoord = blobCoords[coordIterator], cellX = currentCoord[0], cellY = currentCoord[1];
          mergeDirections = [[1, 0], [0, 1]];
          for (directionIterator = 0, directionCount = mergeDirections.length; directionIterator < directionCount; directionIterator++) {
            currentDirection = mergeDirections[directionIterator], deltaX = currentDirection[0], deltaY = currentDirection[1];
            adjacentBlob = this.gridCells[cellY + deltaY][cellX + deltaX];
            if (!(adjacentBlob && adjacentBlob instanceof BlobEntity)) {
              continue;
            }
            if (adjacentBlob === currentBlob) {
              continue;
            }
            if (currentBlob.hue !== adjacentBlob.hue) {
              continue;
            }
            currentBlob.combine(adjacentBlob);
            this.blobEntities = this.blobEntities.filter(function(j) {
              return j !== adjacentBlob;
            });
            return currentBlob;
          }
        }
      }
      return null;
    };

    return GameArena;

  })();

  BlobComponent = (function() {

    function BlobComponent(parentBlob, compX, compY, compColor) {
      this.parentBlob = parentBlob;
      this.compX = compX;
      this.compY = compY;
      this.displayElement = document.createElement('div');
      this.displayElement.className = 'cell blob ' + compColor;
    }

    return BlobComponent;

  })();

  BlobEntity = (function() {

    function BlobEntity(gameArea, initialX, initialY, entityColor) {
      var componentPart,
        selfRef = this;
      this.currentX = initialX;
      this.currentY = initialY;
      this.hue = entityColor;
      this.displayElement = document.createElement('div');
      this.adjustPosition(this.currentX, this.currentY);
      this.displayElement.className = 'cell blob-container';
      componentPart = new BlobComponent(this, 0, 0, this.hue);
      this.displayElement.appendChild(componentPart.displayElement);
      this.componentParts = [componentPart];
      this.displayElement.addEventListener('contextmenu', function(e) {
        return gameArea.trySlide(selfRef, 1);
      });
      this.displayElement.addEventListener('click', function(e) {
        return gameArea.trySlide(selfRef, -1);
      });
      this.displayElement.addEventListener('touchstart', function(e) {
        return selfRef.touchStartX = e.touches[0].pageX;
      });
      this.displayElement.addEventListener('touchmove', function(e) {
        var deltaX;
        deltaX = e.touches[0].pageX - selfRef.touchStartX;
        if (Math.abs(deltaX) > 10) {
          deltaX = Math.max(Math.min(deltaX, 1), -1);
          return gameArea.trySlide(selfRef, deltaX);
        }
      });
    }

    BlobEntity.prototype.getComponentCoordinates = function() {
      var comp, partIterator, partCount, allParts, coordinatesList;
      allParts = this.componentParts;
      coordinatesList = [];
      for (partIterator = 0, partCount = allParts.length; partIterator < partCount; partIterator++) {
        comp = allParts[partIterator];
        coordinatesList.push([this.currentX + comp.compX, this.currentY + comp.compY]);
      }
      return coordinatesList;
    };

    BlobEntity.prototype.adjustPosition = function(newX, newY) {
      this.currentX = newX;
      this.currentY = newY;
      return repositionElement(this.displayElement, this.currentX, this.currentY);
    };

    BlobEntity.prototype.combine = function(otherBlob) {
      var component, diffX, diffY, neighborComponent, firstLoop, secondLoop, thirdLoop, compCount1, compCount2, compCount3, otherParts, currentParts, allParts;
      diffX = otherBlob.currentX - this.currentX;
      diffY = otherBlob.currentY - this.currentY;
      otherParts = otherBlob.componentParts;
      for (firstLoop = 0, compCount1 = otherParts.length; firstLoop < compCount1; firstLoop++) {
        component = otherParts[firstLoop];
        this.componentParts.push(component);
        component.compX += diffX;
        component.compY += diffY;
        repositionElement(component.displayElement, component.compX, component.compY);
        this.displayElement.appendChild(component.displayElement);
      }
      otherBlob.componentParts = null;
      otherBlob.displayElement.parentNode.removeChild(otherBlob.displayElement);
      currentParts = this.componentParts;
      for (secondLoop = 0, compCount2 = currentParts.length; secondLoop < compCount2; secondLoop++) {
        component = currentParts[secondLoop];
        allParts = this.componentParts;
        for (thirdLoop = 0, compCount3 = allParts.length; thirdLoop < compCount3; thirdLoop++) {
          neighborComponent = allParts[thirdLoop];
          if (neighborComponent === component) {
            continue;
          }
          if (neighborComponent.compX === component.compX + 1 && neighborComponent.compY === component.compY) {
            component.displayElement.style.borderRight = 'none';
          } else if (neighborComponent.compX === component.compX - 1 && neighborComponent.compY === component.compY) {
            component.displayElement.style.borderLeft = 'none';
          } else if (neighborComponent.compX === component.compX && neighborComponent.compY === component.compY + 1) {
            component.displayElement.style.borderBottom = 'none';
          } else if (neighborComponent.compX === component.compX && neighborComponent.compY === component.compY - 1) {
            component.displayElement.style.borderTop = 'none';
          }
        }
      }
    };

    return BlobEntity;

  })();

  currentPuzzleIndex = parseInt(window.location.search.substring(1), 10) || 1;

  gameInstance = new GameArena(document.getElementById('game-board'), puzzleMaps[currentPuzzleIndex - 1]);

  window.activeGame = gameInstance;

  puzzleSelector = document.getElementById('puzzle-level-selector');

  for (idx = loopVar = 1, loopLimit = puzzleMaps.length; loopVar <= loopLimit; idx = loopVar += 1) {
    choiceElem = document.createElement('option');
    choiceElem.value = idx;
    choiceElem.textContent = "Level " + idx;
    puzzleSelector.appendChild(choiceElem);
  }

  puzzleSelector.value = currentPuzzleIndex;

  puzzleSelector.addEventListener('change', function() {
    return window.location.search = '?' + puzzleSelector.value;
  });

  document.getElementById('restart-button').addEventListener('click', function() {
    gameInstance.displayContainer.innerHTML = '';
    return gameInstance = new GameArena(gameInstance.displayContainer, puzzleMaps[currentPuzzleIndex - 1]);
  });

}).call(this);