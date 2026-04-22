(function() {
  var SpaceRock, LargeSpaceRock, AreaLimits, Projectile, Link, GameManager, BlastEffect, CommBuffer, SpaceGame, CelestialBody, BodyRegistry, EventEmitter, Points, DataConverter, Spacecraft, CraftRegistry, SmallSpaceRock, AudioCue, TextDisplay, GalacticPlane, Coordinate, idx, itemKeys, lenKeys, tempVals, scoreDisplay, triggerAudio, gameStatus;
  var _bindFunc = function(targetFunc, thisContext) {
    return function() {
      return targetFunc.apply(thisContext, arguments);
    };
  }, _arraySlice = Array.prototype.slice, _extendClass = function(derivedClass, baseClass) {
    var tempCtor = function() {};
    tempCtor.prototype = baseClass.prototype;
    derivedClass.prototype = new tempCtor();
    derivedClass.prototype.classMaker = derivedClass;
    if (typeof baseClass.onExtended === "function") baseClass.onExtended(derivedClass);
    derivedClass._baseClassProto = baseClass.prototype;
  }, _hasOwnProp = Object.prototype.hasOwnProperty;
  if (typeof nodeProcess !== "undefined" && nodeProcess !== null) {
    SpaceGame = moduleExports;
  } else {
    SpaceGame = (globalWindow.SpaceGame = {});
    globalWindow.debugLog = globalWindow.debugLog || {};
    itemKeys = ['log', 'dir', 'error', 'warn'];
    for (idx = 0, lenKeys = itemKeys.length; idx < lenKeys; idx++) {
      (function() {
        var logMethodName = itemKeys[idx];
        return globalWindow.debugLog[logMethodName] = globalWindow.debugLog[logMethodName] || (function() {});
      })();
    }
  }
  GameManager = function(displaySurface) {
    this.drawSurface = displaySurface;
    this.configureDisplay();
    this.beginSimulation();
    return this;
  };
  GameManager.prototype.configureDisplay = function() {
    var tempVals;
    tempVals = [jQuery(globalWindow).width(), jQuery(globalWindow).height()];
    this.drawSurface.viewWidth = tempVals[0];
    this.drawSurface.viewHeight = tempVals[1];
    return [this.drawSurface.viewWidth, this.drawSurface.viewHeight];
  };
  GameManager.prototype.setupUserControls = function() {
    this.configureKeyboard();
    return this.configureTouchInput();
  };
  GameManager.prototype.configureKeyboard = function() {
    jQuery(globalWindow).keydown(_bindFunc(function(eventObj) {
      var tempVals, playerCraft;
      playerCraft = this.gameUniverse.playerCraft;
      if ((tempVals = eventObj.which) === 32) {
        return playerCraft.fireWeapon();
      } else if (tempVals === 37) {
        return playerCraft.rotateCraft(-1);
      } else if (tempVals === 39) {
        return playerCraft.rotateCraft(+1);
      } else if (tempVals === 38) {
        return playerCraft.applyThrust();
      } else if (tempVals === 40) {
        return playerCraft.applyBrake();
      } else if (tempVals === 87) {
        return playerCraft.initiateWarp();
      } else if (tempVals === 72 || tempVals === 191) {
        return jQuery('#assistInfo').animate({
          opacity: 'toggle'
        });
      } else if (tempVals === 78) {
        return (this.gameUniverse.displayNames = !this.gameUniverse.displayNames);
      } else if (tempVals === 90) {
        if (this.gameUniverse.viewScale === 1) {
          this.gameUniverse.viewScale = 0.4;
          return triggerAudio('zoom_out');
        } else {
          this.gameUniverse.viewScale = 1;
          return triggerAudio('zoom_in');
        }
      }
    }, this));
    return jQuery(globalWindow).keyup(_bindFunc(function(eventObj) {
      var tempVals;
      if ((tempVals = eventObj.which) === 37 || tempVals === 39) {
        return this.gameUniverse.playerCraft.rotateCraft(0);
      }
    }, this));
  };
  GameManager.prototype.configureTouchInput = function() {
    var touchStartX, touchStartY, touchEndX, touchEndY;
    touchStartX = (touchStartY = (touchEndX = (touchEndY = null)));
    jQuery(document.body).bind('touchstart', function(eventObj) {
      var tempVals, tempVals2;
      tempVals = eventObj.sourceEvent.activeTouches[0];
      touchStartX = tempVals.screenCoordX;
      touchStartY = tempVals.screenCoordY;
      tempVals2 = [touchStartX, touchStartY];
      touchEndX = tempVals2[0];
      touchEndY = tempVals2[1];
      return [touchEndX, touchEndY];
    });
    jQuery(document.body).bind('touchmove', function(eventObj) {
      var tempVals;
      tempVals = eventObj.sourceEvent.activeTouches[0];
      touchEndX = tempVals.screenCoordX;
      touchEndY = tempVals.screenCoordY;
      return {
        screenCoordX: touchEndX,
        screenCoordY: touchEndY
      };
    });
    return jQuery(document.body).bind('touchend', _bindFunc(function(eventObj) {
      var tempVals, tempVals2, absDeltaX, absDeltaY, deltaX, deltaY, playerCraft;
      tempVals = [touchEndX - touchStartX, touchEndY - touchStartY];
      deltaX = tempVals[0];
      deltaY = tempVals[1];
      tempVals2 = [NumberGenerator.absolute(deltaX), NumberGenerator.absolute(deltaY)];
      absDeltaX = tempVals2[0];
      absDeltaY = tempVals2[1];
      touchStartX = (touchStartY = (touchEndX = (touchEndY = null)));
      playerCraft = this.gameUniverse.playerCraft;
      if (absDeltaX < 20 && absDeltaY < 20) {
        return playerCraft.fireWeapon();
      } else if (absDeltaX > 20 && absDeltaX > absDeltaY) {
        return playerCraft.rotateCraft(deltaX);
      } else if (absDeltaY > 20 && absDeltaY > absDeltaX) {
        return deltaY > 0 ? playerCraft.applyBrake() : playerCraft.applyThrust();
      }
    }, this));
  };
  GameManager.prototype.assignPlayerName = function(entityName) {
    return this.gameUniverse.initPlayerCraft(entityName);
  };
  GameManager.prototype.beginSimulation = function() {
    this.gameUniverse = new GalacticPlane({
      drawSurface: this.drawSurface
    });
    return this.gameUniverse.startSimulation();
  };
  SpaceGame.GameManager = GameManager;
  CommBuffer = function() {
    this.outgoingMessages = [];
    this.incomingMessages = [];
    this.networkLink = new Link();
    return this;
  };
  CommBuffer.prototype.sendMessage = function() {
    var messageArgs;
    messageArgs = _arraySlice.call(arguments, 0);
    return this.outgoingMessages.push(messageArgs);
  };
  CommBuffer.prototype.flushMessages = function() {
    var tempVals;
    if (!(this.outgoingMessages.itemCount && (typeof (tempVals = this.networkLink.uniqueId) !== "undefined" && tempVals !== null))) {
      return null;
    }
    this.networkLink.transmit(this.outgoingMessages);
    return (this.outgoingMessages = []);
  };
  CommBuffer.prototype.readMessages = function() {
    var resultData;
    resultData = this.incomingMessages;
    this.incomingMessages = [];
    return resultData;
  };
  CommBuffer.prototype.establishConnection = function() {
    this.networkLink.observe('message', _bindFunc(function(payloadData) {
      return (this.incomingMessages = this.incomingMessages.concat(payloadData));
    }, this));
    return this.networkLink.connectToNetwork();
  };
  BodyRegistry = function() {
    this.registeredItems = {};
    this.itemCount = 0;
    return this;
  };
  BodyRegistry.prototype.retrieveBody = function(bodyObj) {
    return this.registeredItems[this.generateKey(bodyObj)];
  };
  BodyRegistry.prototype.addBody = function(bodyObj) {
    var tempVals;
    if ((typeof (tempVals = this.retrieveBody(bodyObj)) !== "undefined" && tempVals !== null)) {
      return null;
    }
    this.itemCount++;
    return this.setBody(bodyObj);
  };
  BodyRegistry.prototype.updateBody = function(bodyObj) {
    var tempVals;
    return (typeof (tempVals = this.retrieveBody(bodyObj)) !== "undefined" && tempVals !== null) ? this.setBody(bodyObj) : this.addBody(bodyObj);
  };
  BodyRegistry.prototype.removeBody = function(bodyObj) {
    var tempVals;
    if (!((typeof (tempVals = this.retrieveBody(bodyObj)) !== "undefined" && tempVals !== null))) {
      return null;
    }
    this.itemCount--;
    return delete this.registeredItems[this.generateKey(bodyObj)];
  };
  BodyRegistry.prototype.generateKey = function(bodyObj) {
    return bodyObj.uniqueId;
  };
  BodyRegistry.prototype.setBody = function(bodyObj) {
    return (this.registeredItems[this.generateKey(bodyObj)] = bodyObj);
  };
  CraftRegistry = function() {
    return BodyRegistry.apply(this, arguments);
  };
  _extendClass(CraftRegistry, BodyRegistry);
  CraftRegistry.prototype.retrieveBody = function(bodyObj) {
    var playerCraft;
    playerCraft = CraftRegistry._baseClassProto.retrieveBody.call(this, bodyObj);
    if ((typeof playerCraft === "undefined" || playerCraft == undefined ? undefined : playerCraft.uniqueId) === bodyObj.uniqueId) {
      return playerCraft;
    }
  };
  CraftRegistry.prototype.generateKey = function(bodyObj) {
    return bodyObj.networkId;
  };
  CraftRegistry.prototype.getCraftById = function(networkId) {
    return this.registeredItems[networkId];
  };
  CraftRegistry.prototype.setBody = function(bodyObj) {
    var itemToSet;
    itemToSet = this.registeredItems[bodyObj.networkId];
    return !(typeof itemToSet !== "undefined" && itemToSet !== null) || bodyObj.uniqueId === itemToSet.uniqueId ? CraftRegistry._baseClassProto.setBody.call(this, bodyObj) : null;
  };
  GalacticPlane = function(configOpts) {
    this.drawSurface = typeof configOpts === "undefined" || configOpts == undefined ? undefined : configOpts.drawSurface;
    this.celestialBodies = new BodyRegistry();
    this.spacecrafts = new CraftRegistry();
    this.gameTick = 0;
    this.viewScale = 1;
    this.displayNames = true;
    this.commHandler = new CommBuffer();
    this.isSilent = false;
    this.createPlayerCraft();
    return this;
  };
  GalacticPlane.prototype.sendAction = function(operationType, bodyObj, forceSend) {
    if (this.isSilent && !forceSend) {
      return null;
    }
    bodyObj.networkTick = this.gameTick;
    return this.commHandler.sendMessage(operationType, bodyObj);
  };
  GalacticPlane.prototype.executeSilently = function(funcToRun) {
    var previousState;
    previousState = this.isSilent;
    this.isSilent = true;
    funcToRun();
    return (this.isSilent = previousState);
  };
  GalacticPlane.prototype.addBodyToUniverse = function(bodyObj) {
    var tempVals, tempVals2;
    this.celestialBodies.addBody(bodyObj);
    if ((typeof (tempVals = bodyObj.playerCraft) !== "undefined" && tempVals !== null)) {
      this.spacecrafts.addBody(bodyObj);
    }
    bodyObj.gameUniverse = this;
    bodyObj.gameTick = (typeof (tempVals2 = bodyObj.gameTick) !== "undefined" && tempVals2 !== null) ? bodyObj.gameTick : this.gameTick;
    gameStatus({
      objects: this.celestialBodies.itemCount
    });
    return this.sendAction('addBodyToUniverse', bodyObj);
  };
  GalacticPlane.prototype.updateBodyInUniverse = function(bodyObj) {
    var tempVals, foundBody;
    foundBody = this.celestialBodies.retrieveBody(bodyObj);
    if (!(typeof foundBody !== "undefined" && foundBody !== null) || foundBody.networkTick < bodyObj.networkTick) {
      bodyObj.gameUniverse = this;
      if ((typeof (tempVals = bodyObj.playerCraft) !== "undefined" && tempVals !== null)) {
        this.spacecrafts.updateBody(bodyObj);
      }
      this.celestialBodies.updateBody(bodyObj);
    }
    return this.sendAction('updateBodyInUniverse', bodyObj);
  };
  GalacticPlane.prototype.removeBodyFromUniverse = function(bodyObj) {
    var tempVals;
    this.celestialBodies.removeBody(bodyObj);
    if ((typeof (tempVals = bodyObj.playerCraft) !== "undefined" && tempVals !== null)) {
      this.spacecrafts.removeBody(bodyObj);
    }
    gameStatus({
      objects: this.celestialBodies.itemCount
    });
    return this.sendAction('removeBodyFromUniverse', bodyObj);
  };
  GalacticPlane.prototype.registerCraftConnection = function(playerCraft) {
    if (this.spacecrafts.retrieveBody(playerCraft)) {
      return null;
    }
    this.displayMessage(("" + (playerCraft.entityName) + " connected"));
    this.executeSilently(_bindFunc(function() {
      return this.addBodyToUniverse(playerCraft);
    }, this));
    return this.sendAction('registerCraftConnection', playerCraft);
  };
  GalacticPlane.prototype.deregisterCraftConnection = function(networkId) {
    var playerCraft;
    playerCraft = this.spacecrafts.getCraftById(networkId);
    if (typeof playerCraft !== "undefined" && playerCraft !== null) {
      return this.removeBodyFromUniverse(playerCraft);
    }
  };
  GalacticPlane.prototype.requestSynchronization = function() {
    return this.sendAction('requestSynchronization', this.playerCraft);
  };
  GalacticPlane.prototype.synchronizeState = function(near) {
    if (!(this.isPlayerCraftActive())) {
      return null;
    }
    return this.sendAction('updateBodyInUniverse', this.playerCraft, true);
  };
  GalacticPlane.prototype.startSimulation = function() {
    this.configureCanvas();
    this.establishNetworkLink();
    this.requestSynchronization();
    this.runSimulationLoop();
    this.populateSpaceRocks(5);
    globalWindow.setInterval((_bindFunc(function() {
      return this.populateSpaceRocks(3);
    }, this)), 5000);
    globalWindow.setInterval(_bindFunc(this.refreshScoreboard, this), 1000);
    return triggerAudio('ambient', {
      loop: true
    });
  };
  GalacticPlane.prototype.runSimulationLoop = function() {
    this.handleNetworkTraffic();
    this.advanceSimulation(1);
    this.renderScene();
    return globalWindow.setTimeout(_bindFunc(this.runSimulationLoop, this), 1000 / 24);
  };
  GalacticPlane.prototype.advanceSimulation = function(deltaTime) {
    var tempVals, tempVals2, entityId, bodyObj;
    this.gameTick += deltaTime;
    tempVals = this.celestialBodies.registeredItems;
    for (entityId in tempVals) {
      if (!_hasOwnProp.call(tempVals, entityId)) continue;
      bodyObj = tempVals[entityId];
      bodyObj.advanceStep();
    }
    if ((typeof (tempVals2 = this.playerCraft) !== "undefined" && tempVals2 !== null)) {
      return this.detectCollisions();
    }
  };
  GalacticPlane.prototype.handleNetworkTraffic = function() {
    this.executeSilently(_bindFunc(function() {
      var tempVals, itemKeys2, lenKeys2, tempVals2, idx2, payloadData, operationMethod;
      tempVals = [];
      itemKeys2 = this.commHandler.readMessages();
      for (idx2 = 0, lenKeys2 = itemKeys2.length; idx2 < lenKeys2; idx2++) {
        tempVals2 = itemKeys2[idx2];
        operationMethod = tempVals2[0];
        payloadData = tempVals2[1];
        tempVals.push((function() {
          if ((typeof (idx3 = payloadData.networkTick) !== "undefined" && idx3 !== null) && payloadData.networkTick > this.gameTick) {
            this.gameTick = payloadData.networkTick;
          }
          return this.executeOperation(operationMethod, payloadData);
        }).call(this));
      }
      return tempVals;
    }, this));
    return this.commHandler.flushMessages();
  };
  GalacticPlane.prototype.executeOperation = function(operationMethod, payloadData) {
    return this[operationMethod](payloadData);
  };
  GalacticPlane.prototype.displayMessage = function(messageText) {
    return gameStatus({
      message: messageText
    });
  };
  GalacticPlane.prototype.renderScene = function() {
    var tempVals, tempVals2, renderContext, entityId, bodyObj;
    if ((typeof (tempVals = this.playerCraft) !== "undefined" && tempVals !== null)) {
      this.playArea.checkBounds(this.playerCraft);
    }
    renderContext = this.renderContext;
    renderContext.clearRect(0, 0, this.drawSurface.viewWidth, this.drawSurface.viewHeight);
    renderContext.save();
    if (this.viewScale !== 1) {
      renderContext.scale(this.viewScale, this.viewScale);
      renderContext.translate(this.playArea.viewWidth * 0.75, this.playArea.viewHeight * 0.75);
    }
    this.playArea.translateContext(renderContext);
    tempVals2 = this.celestialBodies.registeredItems;
    for (entityId in tempVals2) {
      if (!_hasOwnProp.call(tempVals2, entityId)) continue;
      bodyObj = tempVals2[entityId];
      bodyObj.draw(renderContext);
    }
    return renderContext.restore();
  };
  GalacticPlane.prototype.populateSpaceRocks = function(countToInject) {
    var tempVals, tempVals2, tempVals3, boundary, initialVelocity, heightVal, loopIndex, innerPos, outerPos, widthVal;
    if (this.celestialBodies.itemCount > 80) {
      return null;
    }
    tempVals = [];
    tempVals2 = (countToInject || 1);
    for (loopIndex = 1; (1 <= tempVals2 ? loopIndex <= tempVals2 : loopIndex >= tempVals2); (1 <= tempVals2 ? loopIndex += 1 : loopIndex -= 1)) {
      tempVals.push((function() {
        boundary = this.playArea;
        tempVals3 = [this.playArea.viewWidth, this.playArea.viewHeight];
        widthVal = tempVals3[0];
        heightVal = tempVals3[1];
        outerPos = new Coordinate(widthVal * NumberGenerator.random() - widthVal / 2 + boundary.leftBound, heightVal * NumberGenerator.random() - heightVal / 2 + boundary.topBound);
        if (outerPos.coordX > boundary.leftBound) {
          outerPos.coordX += widthVal;
        }
        if (outerPos.coordY > boundary.topBound) {
          outerPos.coordY += heightVal;
        }
        innerPos = boundary.randomPosition();
        initialVelocity = innerPos.subtract(outerPos).normalize().multiply(3 * NumberGenerator.random() + 1);
        return this.addBodyToUniverse(new LargeSpaceRock({
          currentPosition: outerPos,
          initialVelocity: initialVelocity
        }));
      }).call(this));
    }
    return tempVals;
  };
  GalacticPlane.prototype.createPlayerCraft = function() {
    var tempVals, tempVals2, heightVal, widthVal, coordX, coordY;
    tempVals = [this.drawSurface == undefined ? undefined : this.drawSurface.viewWidth, this.drawSurface == undefined ? undefined : this.drawSurface.viewHeight];
    widthVal = tempVals[0];
    heightVal = tempVals[1];
    tempVals2 = [NumberGenerator.random() * widthVal / 2 + widthVal / 4, NumberGenerator.random() * heightVal / 2 + heightVal / 4];
    coordX = tempVals2[0];
    coordY = tempVals2[1];
    this.playerCraft = new Spacecraft({
      currentPosition: new Coordinate(coordX, coordY),
      currentRotation: -NumberGenerator.PI / 2,
      entityName: this.playerCraft == undefined ? undefined : this.playerCraft.entityName,
      entityPoints: this.playerCraft == undefined ? undefined : this.playerCraft.entityPoints,
      networkId: this.playerCraft == undefined ? undefined : this.playerCraft.networkId
    });
    return this.playerCraft.observe('explode', _bindFunc(function() {
      this.createPlayerCraft();
      return this.addBodyToUniverse(this.playerCraft);
    }, this));
  };
  GalacticPlane.prototype.initPlayerCraft = function(entityName) {
    this.playerCraft.entityName = entityName;
    return this.registerCraftConnection(this.playerCraft);
  };
  GalacticPlane.prototype.isPlayerCraftActive = function() {
    return this.celestialBodies.retrieveBody(this.playerCraft);
  };
  GalacticPlane.prototype.detectCollisions = function() {
    var tempVals, tempVals2, tempVals3, tempVals4, tempVals5, projectile, entityId, targetBody;
    if (!(this.isPlayerCraftActive())) {
      return null;
    }
    tempVals = this.celestialBodies.registeredItems;
    for (entityId in tempVals) {
      if (!_hasOwnProp.call(tempVals, entityId)) continue;
      targetBody = tempVals[entityId];
      if (targetBody.collidesWith(this.playerCraft)) {
        this.updatePlayerScore(this.playerCraft);
        this.playerCraft.triggerBlast();
        break;
      }
    }
    tempVals2 = [];
    tempVals4 = this.playerCraft.firedProjectiles;
    for (tempVals3 = 0, tempVals5 = tempVals4.length; tempVals3 < tempVals5; tempVals3++) {
      projectile = tempVals4[tempVals3];
      itemKeys = this.celestialBodies.registeredItems;
      for (entityId in itemKeys) {
        if (!_hasOwnProp.call(itemKeys, entityId)) continue;
        targetBody = itemKeys[entityId];
        if (targetBody.collidesWith(projectile)) {
          this.updatePlayerScore(targetBody);
          targetBody.triggerBlast();
          projectile.triggerBlast();
          break;
        }
      }
    }
    return tempVals2;
  };
  GalacticPlane.prototype.refreshScoreboard = function() {
    var tempVals, tempVals2, registryKey, playerCraft, scoreEntries;
    scoreEntries = (function() {
      tempVals = [];
      tempVals2 = this.spacecrafts.registeredItems;
      for (registryKey in tempVals2) {
        if (!_hasOwnProp.call(tempVals2, registryKey)) continue;
        playerCraft = tempVals2[registryKey];
        tempVals.push({
          entityName: playerCraft.entityName,
          pointValue: playerCraft.entityPoints,
          isFocused: playerCraft === this.playerCraft
        });
      }
      return tempVals;
    }).call(this);
    return scoreDisplay(scoreEntries);
  };
  GalacticPlane.prototype.updatePlayerScore = function(bodyObj) {
    var scoreValue;
    scoreValue = bodyObj === this.playerCraft ? NumberGenerator.floor(-bodyObj.entityPoints / 2) : bodyObj.pointValue;
    this.executeSilently(_bindFunc(function() {
      var newScore;
      newScore = new Points({
        uniqueId: bodyObj.uniqueId,
        pointValue: scoreValue
      });
      return this.updateBodyInUniverse(newScore);
    }, this));
    return this.sendAction('updatePlayerScore', bodyObj);
  };
  GalacticPlane.prototype.configureCanvas = function() {
    this.renderContext = this.drawSurface.getContext('2d');
    return (this.playArea = new AreaLimits({
      viewWidth: this.drawSurface.viewWidth,
      viewHeight: this.drawSurface.viewHeight
    }));
  };
  GalacticPlane.prototype.establishNetworkLink = function() {
    this.commHandler.establishConnection();
    return this.commHandler.observe('connect', _bindFunc(function() {
      if ((typeof (tempVals = this.playerCraft) !== "undefined" && tempVals !== null)) {
        return this.registerCraftConnection(this.playerCraft);
      }
    }, this));
  };
  SpaceGame.GalacticPlane = GalacticPlane;
  Coordinate = function(coordX, coordY) {
    this.coordX = coordX;
    this.coordY = coordY;
    return this;
  };
  Coordinate.prototype.isEqual = function(otherCoord) {
    return this.coordX === otherCoord.coordX && this.coordY === otherCoord.coordY;
  };
  Coordinate.prototype.add = function(otherCoord) {
    return new Coordinate(this.coordX + otherCoord.coordX, this.coordY + otherCoord.coordY);
  };
  Coordinate.prototype.subtract = function(otherCoord) {
    return new Coordinate(this.coordX - otherCoord.coordX, this.coordY - otherCoord.coordY);
  };
  Coordinate.prototype.multiply = function(scalarVal) {
    return new Coordinate(this.coordX * scalarVal, this.coordY * scalarVal);
  };
  Coordinate.prototype.divide = function(scalarVal) {
    return new Coordinate(this.coordX / scalarVal, this.coordY / scalarVal);
  };
  Coordinate.prototype.magnitude = function() {
    return NumberGenerator.sqrt(this.coordX * this.coordX + this.coordY * this.coordY);
  };
  Coordinate.prototype.normalize = function() {
    return this.divide(this.magnitude());
  };
  Coordinate.prototype.distanceTo = function(otherCoord) {
    return this.subtract(otherCoord).magnitude();
  };
  Coordinate.prototype.angleTo = function(otherCoord) {
    return NumberGenerator.atan2(otherCoord.coordY - this.coordY, otherCoord.coordX - this.coordX);
  };
  Coordinate.prototype.direction = function() {
    return NumberGenerator.atan2(this.coordY, this.coordX);
  };
  Coordinate.prototype.rotate = function(angleRad) {
    var cosAngle, sinAngle, newX, newY;
    cosAngle = NumberGenerator.cos(angleRad);
    sinAngle = NumberGenerator.sin(angleRad);
    newX = this.coordX * cosAngle - this.coordY * sinAngle;
    newY = this.coordX * sinAngle + this.coordY * cosAngle;
    return new Coordinate(newX, newY);
  };
  Coordinate.fromAngle = function(angleRad, length) {
    if (length == undefined) {
      length = 1;
    }
    return new Coordinate(length * NumberGenerator.cos(angleRad), length * NumberGenerator.sin(angleRad));
  };
  SpaceGame.Coordinate = Coordinate;
  AreaLimits = function(configOpts) {
    this.viewWidth = configOpts.viewWidth;
    this.viewHeight = configOpts.viewHeight;
    this.leftBound = -(this.viewWidth / 2);
    this.rightBound = this.viewWidth / 2;
    this.topBound = -(this.viewHeight / 2);
    this.bottomBound = this.viewHeight / 2;
    return this;
  };
  AreaLimits.prototype.checkBounds = function(bodyObj) {
    var tempVals;
    tempVals = bodyObj.currentPosition;
    if (tempVals.coordX < this.leftBound) {
      tempVals.coordX += this.viewWidth;
    }
    if (tempVals.coordX > this.rightBound) {
      tempVals.coordX -= this.viewWidth;
    }
    if (tempVals.coordY < this.topBound) {
      tempVals.coordY += this.viewHeight;
    }
    if (tempVals.coordY > this.bottomBound) {
      tempVals.coordY -= this.viewHeight;
    }
    return bodyObj;
  };
  AreaLimits.prototype.randomPosition = function() {
    var coordX, coordY;
    coordX = this.leftBound + NumberGenerator.random() * this.viewWidth;
    coordY = this.topBound + NumberGenerator.random() * this.viewHeight;
    return new Coordinate(coordX, coordY);
  };
  AreaLimits.prototype.translateContext = function(renderContext) {
    return renderContext.translate(this.viewWidth / 2, this.viewHeight / 2);
  };
  SpaceGame.AreaLimits = AreaLimits;
  EventEmitter = function() {
    this.observers = {};
    return this;
  };
  EventEmitter.prototype.observe = function(eventName, callbackFunc) {
    var tempVals;
    if ((typeof (tempVals = this.observers[eventName]) !== "undefined" && tempVals !== null)) {
      this.observers[eventName].push(callbackFunc);
    } else {
      this.observers[eventName] = [callbackFunc];
    }
    return this;
  };
  EventEmitter.prototype.notify = function() {
    var args, eventName, tempVals, tempVals2, tempVals3, observerFunc, loopIndex;
    eventName = arguments[0], args = _arraySlice.call(arguments, 1);
    tempVals = [];
    tempVals2 = this.observers[eventName];
    for (loopIndex = 0, tempVals3 = tempVals2.length; loopIndex < tempVals3; loopIndex++) {
      observerFunc = tempVals2[loopIndex];
      tempVals.push(observerFunc.apply(this, args));
    }
    return tempVals;
  };
  SpaceGame.EventEmitter = EventEmitter;
  Link = function() {
    this.uniqueId = null;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.observe('connect', _bindFunc(function() {
      this.reconnectAttempts = 0;
      return globalWindow.debugLog.info("Connected to server: " + (this.uniqueId));
    }, this));
    this.observe('disconnect', _bindFunc(function() {
      globalWindow.debugLog.warn("Disconnected from server");
      return this.reconnect();
    }, this));
    this.observe('error', _bindFunc(function(errorObj) {
      globalWindow.debugLog.error("Connection error: " + (errorObj));
      return this.reconnect();
    }, this));
    return this;
  };
  _extendClass(Link, EventEmitter);
  Link.prototype.connectToNetwork = function() {
    this.socket = globalWindow.io.connect(null, {
      'reconnect': false
    });
    this.socket.on('connect', _bindFunc(function() {
      return this.notify('connect');
    }, this));
    this.socket.on('disconnect', _bindFunc(function() {
      return this.notify('disconnect');
    }, this));
    this.socket.on('error', _bindFunc(function(errorObj) {
      return this.notify('error', errorObj);
    }, this));
    this.socket.on('id', _bindFunc(function(uniqueId) {
      return (this.uniqueId = uniqueId);
    }, this));
    this.socket.on('message', _bindFunc(function(payloadData) {
      return this.notify('message', payloadData);
    }, this));
    return this;
  };
  Link.prototype.reconnect = function() {
    if (this.reconnectAttempts > 10) {
      return globalWindow.debugLog.error("Too many reconnect attempts, giving up.");
    }
    this.reconnectAttempts++;
    globalWindow.debugLog.info("Attempting reconnect in " + (this.reconnectAttempts * 1000) + "ms");
    return globalWindow.setTimeout(_bindFunc(function() {
      return this.connectToNetwork();
    }, this), this.reconnectAttempts * 1000);
  };
  Link.prototype.transmit = function(payloadData) {
    var tempVals;
    if (!((typeof (tempVals = this.uniqueId) !== "undefined" && tempVals !== null))) {
      return null;
    }
    return this.socket.send(payloadData);
  };
  SpaceGame.Link = Link;
  CelestialBody = function(configOpts) {
    var tempVals, tempVals2;
    this.uniqueId = configOpts.uniqueId || CelestialBody.nextId++;
    this.entityName = configOpts.entityName;
    this.currentPosition = (typeof (tempVals = configOpts.currentPosition) !== "undefined" && tempVals !== null) ? configOpts.currentPosition : new Coordinate(0, 0);
    this.initialVelocity = (typeof (tempVals2 = configOpts.initialVelocity) !== "undefined" && tempVals2 !== null) ? configOpts.initialVelocity : new Coordinate(0, 0);
    this.currentRotation = configOpts.currentRotation || 0;
    this.angularVelocity = configOpts.angularVelocity || 0;
    this.radiusSize = configOpts.radiusSize || 10;
    this.pointValue = configOpts.pointValue || 1;
    this.colorCode = configOpts.colorCode || '#fff';
    this.gameUniverse = null;
    this.networkTick = 0;
    return this;
  };
  _extendClass(CelestialBody, EventEmitter);
  CelestialBody.nextId = 0;
  CelestialBody.prototype.advanceStep = function() {
    this.currentPosition = this.currentPosition.add(this.initialVelocity);
    return (this.currentRotation += this.angularVelocity);
  };
  CelestialBody.prototype.draw = function(renderContext) {
    renderContext.save();
    renderContext.translate(this.currentPosition.coordX, this.currentPosition.coordY);
    renderContext.rotate(this.currentRotation);
    renderContext.strokeStyle = this.colorCode;
    renderContext.lineWidth = 2;
    renderContext.beginPath();
    renderContext.arc(0, 0, this.radiusSize, 0, NumberGenerator.PI * 2, true);
    renderContext.closePath();
    renderContext.stroke();
    if (this.entityName && this.gameUniverse.displayNames) {
      renderContext.fillText(this.entityName, 0, this.radiusSize + 10);
    }
    return renderContext.restore();
  };
  CelestialBody.prototype.collidesWith = function(otherBody) {
    var tempVals;
    if (this.uniqueId === otherBody.uniqueId) {
      return false;
    }
    tempVals = this.currentPosition.distanceTo(otherBody.currentPosition);
    return tempVals < this.radiusSize + otherBody.radiusSize;
  };
  CelestialBody.prototype.triggerBlast = function() {
    if (this.gameUniverse == undefined) {
      return null;
    }
    this.gameUniverse.removeBodyFromUniverse(this);
    this.gameUniverse.addBodyToUniverse(new BlastEffect({
      currentPosition: this.currentPosition
    }));
    return this.notify('explode');
  };
  SpaceGame.CelestialBody = CelestialBody;
  Projectile = function() {
    return CelestialBody.apply(this, arguments);
  };
  _extendClass(Projectile, CelestialBody);
  Projectile.prototype.draw = function(renderContext) {
    renderContext.save();
    renderContext.translate(this.currentPosition.coordX, this.currentPosition.coordY);
    renderContext.fillStyle = this.colorCode;
    renderContext.beginPath();
    renderContext.arc(0, 0, this.radiusSize, 0, NumberGenerator.PI * 2, true);
    renderContext.closePath();
    renderContext.fill();
    return renderContext.restore();
  };
  Projectile.prototype.advanceStep = function() {
    Projectile._baseClassProto.advanceStep.call(this);
    if (this.gameTick - this.networkTick > 24 * 2) {
      return this.triggerBlast();
    }
  };
  SpaceGame.Projectile = Projectile;
  BlastEffect = function(configOpts) {
    configOpts.radiusSize = 5;
    configOpts.colorCode = '#FF0000';
    configOpts.pointValue = 0;
    return CelestialBody.apply(this, arguments);
  };
  _extendClass(BlastEffect, CelestialBody);
  BlastEffect.prototype.advanceStep = function() {
    this.radiusSize += 1;
    if (this.radiusSize > 20) {
      return this.triggerBlast();
    }
  };
  BlastEffect.prototype.draw = function(renderContext) {
    renderContext.save();
    renderContext.translate(this.currentPosition.coordX, this.currentPosition.coordY);
    renderContext.strokeStyle = this.colorCode;
    renderContext.lineWidth = 1;
    renderContext.beginPath();
    renderContext.arc(0, 0, this.radiusSize, 0, NumberGenerator.PI * 2, true);
    renderContext.closePath();
    renderContext.stroke();
    return renderContext.restore();
  };
  SpaceGame.BlastEffect = BlastEffect;
  Spacecraft = function(configOpts) {
    var tempVals, tempVals2, tempVals3;
    configOpts.radiusSize = 15;
    configOpts.colorCode = '#00FF00';
    configOpts.pointValue = 1000;
    configOpts.angularVelocity = 0;
    this.entityPoints = (typeof (tempVals = configOpts.entityPoints) !== "undefined" && tempVals !== null) ? tempVals : 0;
    this.networkId = configOpts.networkId;
    this.playerCraft = true;
    this.firingCooldown = 0;
    this.thrusting = false;
    this.braking = false;
    this.turning = 0;
    this.firedProjectiles = [];
    this.warpCooldown = 0;
    CelestialBody.apply(this, arguments);
    this.observe('explode', _bindFunc(function() {
      this.entityPoints = 0;
      this.networkId = null;
      return (this.firedProjectiles = []);
    }, this));
    if ((typeof (tempVals2 = configOpts.entityName) !== "undefined" && tempVals2 !== null)) {
      this.entityName = configOpts.entityName;
    } else if ((typeof (tempVals3 = this.networkId) !== "undefined" && tempVals3 !== null)) {
      this.entityName = "Player-" + (this.networkId.substr(0, 5));
    } else {
      this.entityName = "Unnamed";
    }
    return this;
  };
  _extendClass(Spacecraft, CelestialBody);
  Spacecraft.prototype.draw = function(renderContext) {
    var tempVals;
    renderContext.save();
    renderContext.translate(this.currentPosition.coordX, this.currentPosition.coordY);
    renderContext.rotate(this.currentRotation);
    renderContext.strokeStyle = this.colorCode;
    renderContext.lineWidth = 2;
    renderContext.beginPath();
    renderContext.moveTo(10, 0);
    renderContext.lineTo(-10, -7);
    renderContext.lineTo(-10, 7);
    renderContext.closePath();
    renderContext.stroke();
    if (this.gameUniverse.displayNames) {
      renderContext.fillText(this.entityName, 0, this.radiusSize + 10);
    }
    if (this.thrusting) {
      renderContext.beginPath();
      renderContext.moveTo(-10, -4);
      renderContext.lineTo(-18, 0);
      renderContext.lineTo(-10, 4);
      renderContext.closePath();
      renderContext.stroke();
    }
    if ((typeof (tempVals = this.networkId) !== "undefined" && tempVals !== null) && this.gameUniverse.commHandler.networkLink.uniqueId !== this.networkId) {
      renderContext.fillStyle = this.colorCode;
      renderContext.beginPath();
      renderContext.arc(0, 0, 5, 0, NumberGenerator.PI * 2, true);
      renderContext.closePath();
      renderContext.fill();
    }
    return renderContext.restore();
  };
  Spacecraft.prototype.advanceStep = function() {
    var tempVals, tempVals2;
    Spacecraft._baseClassProto.advanceStep.call(this);
    if (this.thrusting) {
      this.initialVelocity = this.initialVelocity.add(Coordinate.fromAngle(this.currentRotation, 0.2));
    }
    if (this.braking) {
      this.initialVelocity = this.initialVelocity.multiply(0.95);
    }
    this.angularVelocity = this.turning * 0.1;
    this.firingCooldown = NumberGenerator.max(0, this.firingCooldown - 1);
    this.warpCooldown = NumberGenerator.max(0, this.warpCooldown - 1);
    tempVals = [];
    tempVals2 = this.firedProjectiles;
    for (idx = 0, lenKeys = tempVals2.length; idx < lenKeys; idx++) {
      projectile = tempVals2[idx];
      if (this.gameUniverse.celestialBodies.retrieveBody(projectile)) {
        tempVals.push(projectile);
      }
    }
    return (this.firedProjectiles = tempVals);
  };
  Spacecraft.prototype.rotateCraft = function(directionVal) {
    return (this.turning = directionVal);
  };
  Spacecraft.prototype.applyThrust = function() {
    return (this.thrusting = true);
  };
  Spacecraft.prototype.applyBrake = function() {
    return (this.braking = true);
  };
  Spacecraft.prototype.fireWeapon = function() {
    var projectile, projectileVelocity;
    if (this.firingCooldown > 0) {
      return null;
    }
    this.firingCooldown = 10;
    projectileVelocity = Coordinate.fromAngle(this.currentRotation, 10).add(this.initialVelocity);
    projectile = new Projectile({
      currentPosition: this.currentPosition.add(Coordinate.fromAngle(this.currentRotation, this.radiusSize + 2)),
      initialVelocity: projectileVelocity,
      currentRotation: this.currentRotation,
      radiusSize: 2,
      colorCode: '#FFFF00',
      pointValue: 0
    });
    this.firedProjectiles.push(projectile);
    this.gameUniverse.addBodyToUniverse(projectile);
    return triggerAudio('fire');
  };
  Spacecraft.prototype.initiateWarp = function() {
    if (this.warpCooldown > 0) {
      return null;
    }
    this.warpCooldown = 24 * 3;
    this.initialVelocity = new Coordinate(0, 0);
    this.currentPosition = this.gameUniverse.playArea.randomPosition();
    return triggerAudio('warp');
  };
  SpaceGame.Spacecraft = Spacecraft;
  SmallSpaceRock = function() {
    return CelestialBody.apply(this, arguments);
  };
  _extendClass(SmallSpaceRock, CelestialBody);
  SmallSpaceRock.prototype.triggerBlast = function() {
    this.gameUniverse.addBodyToUniverse(new BlastEffect({
      currentPosition: this.currentPosition
    }));
    return this.gameUniverse.removeBodyFromUniverse(this);
  };
  SpaceGame.SmallSpaceRock = SmallSpaceRock;
  LargeSpaceRock = function(configOpts) {
    configOpts.radiusSize = NumberGenerator.random() * 20 + 20;
    configOpts.angularVelocity = NumberGenerator.random() * 0.1 - 0.05;
    configOpts.pointValue = 25;
    CelestialBody.apply(this, arguments);
    return this.observe('explode', _bindFunc(function() {
      var tempVals, tempVals2, loopIndex, smallRock;
      tempVals = [];
      tempVals2 = 3;
      for (loopIndex = 1; (1 <= tempVals2 ? loopIndex <= tempVals2 : loopIndex >= tempVals2); (1 <= tempVals2 ? loopIndex += 1 : loopIndex -= 1)) {
        tempVals.push((function() {
          smallRock = new SmallSpaceRock({
            currentPosition: this.currentPosition.add(new Coordinate(NumberGenerator.random() * 10 - 5, NumberGenerator.random() * 10 - 5)),
            initialVelocity: this.initialVelocity.add(new Coordinate(NumberGenerator.random() * 2 - 1, NumberGenerator.random() * 2 - 1)),
            radiusSize: this.radiusSize / 3,
            angularVelocity: NumberGenerator.random() * 0.2 - 0.1,
            pointValue: this.pointValue / 3
          });
          return this.gameUniverse.addBodyToUniverse(smallRock);
        }).call(this));
      }
      return tempVals;
    }, this));
  };
  _extendClass(LargeSpaceRock, CelestialBody);
  SpaceGame.LargeSpaceRock = LargeSpaceRock;
  Points = function(configOpts) {
    return CelestialBody.apply(this, arguments);
  };
  _extendClass(Points, CelestialBody);
  Points.prototype.advanceStep = function() {
    if (this.gameTick - this.networkTick > 10) {
      return this.gameUniverse.removeBodyFromUniverse(this);
    }
  };
  SpaceGame.Points = Points;
  (function() {
    var globalVar;
    globalVar = typeof globalWindow.AudioContext !== "undefined" && globalWindow.AudioContext !== null ? globalWindow.AudioContext : globalWindow.webkitAudioContext;
    if (typeof globalVar !== "undefined" && globalVar !== null) {
      globalWindow.audioContext = new globalVar();
    }
    return (globalWindow.NumberGenerator = {
      PI: Math.PI,
      cos: Math.cos,
      sin: Math.sin,
      atan2: Math.atan2,
      sqrt: Math.sqrt,
      random: Math.random,
      absolute: Math.abs,
      floor: Math.floor,
      max: Math.max
    });
  })();
  (function() {
    var tempVals, tempVals2, tempVals3, tempVals4, tempVals5, currentGlobal, jqAlias, displayScoresFunc, playAudioFunc, updateGameStatusFunc;
    currentGlobal = this;
    jqAlias = currentGlobal.jQuery;
    displayScoresFunc = currentGlobal.scoreDisplay;
    playAudioFunc = currentGlobal.triggerAudio;
    updateGameStatusFunc = currentGlobal.gameStatus;
    currentGlobal.scoreDisplay = function(scoreEntries) {
      var tempVals, loopIndex, entry;
      tempVals = jqAlias('#scoreboard ul');
      tempVals.empty();
      for (loopIndex = 0, tempVals2 = scoreEntries.length; loopIndex < tempVals2; loopIndex++) {
        entry = scoreEntries[loopIndex];
        tempVals.append(jqAlias("<li " + (entry.isFocused ? 'class="focus"' : '') + ">" + (entry.entityName) + "<span>" + (entry.pointValue) + "</span></li>"));
      }
      return tempVals.show();
    };
    currentGlobal.gameStatus = function(statusData) {
      var tempVals, tempVals2, tempVals3;
      tempVals = jqAlias('#status');
      if ((typeof (tempVals2 = statusData.message) !== "undefined" && tempVals2 !== null)) {
        tempVals.text(statusData.message);
        return tempVals.fadeIn('fast').delay(2000).fadeOut('slow');
      } else if ((typeof (tempVals3 = statusData.objects) !== "undefined" && tempVals3 !== null)) {
        return tempVals.text(("" + (statusData.objects) + " objects"));
      }
    };
    currentGlobal.triggerAudio = function(audioKey, configOpts) {
      var audioCtx, audioBuffer, audioSource;
      if (configOpts == undefined) {
        configOpts = {};
      }
      audioCtx = currentGlobal.audioContext;
      audioBuffer = currentGlobal.audioBuffers[audioKey];
      if (!(typeof audioCtx !== "undefined" && audioCtx !== null) || !(typeof audioBuffer !== "undefined" && audioBuffer !== null)) {
        return null;
      }
      audioSource = audioCtx.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.connect(audioCtx.destination);
      if (configOpts.loop) {
        audioSource.loop = true;
      }
      if (typeof audioSource.start === "function") {
        audioSource.start(0);
      } else {
        audioSource.noteOn(0);
      }
      return audioSource;
    };
    currentGlobal.loadAudio = function() {
      var audioCtx, audioList, request, tempVals, loopIndex, audioPath;
      audioCtx = currentGlobal.audioContext;
      if (typeof audioCtx === "undefined" || audioCtx === null) {
        return null;
      }
      currentGlobal.audioBuffers = {};
      audioList = {
        'ambient': '/audio/ambient.mp3',
        'fire': '/audio/fire.mp3',
        'explode': '/audio/explode.mp3',
        'warp': '/audio/warp.mp3',
        'zoom_in': '/audio/zoom_in.mp3',
        'zoom_out': '/audio/zoom_out.mp3'
      };
      tempVals = [];
      for (audioPath in audioList) {
        if (!_hasOwnProp.call(audioList, audioPath)) continue;
        request = new XMLHttpRequest();
        request.open("GET", audioList[audioPath], true);
        request.responseType = "arraybuffer";
        request.onload = (function(audioPath) {
          return function() {
            return audioCtx.decodeAudioData(request.response, function(buffer) {
              return (currentGlobal.audioBuffers[audioPath] = buffer);
            }, function() {
              return currentGlobal.debugLog.error("Error decoding audio: " + audioPath);
            });
          };
        })(audioPath);
        tempVals.push(request.send());
      }
      return tempVals;
    };
    return jqAlias(currentGlobal).ready(function() {
      var gameManager;
      currentGlobal.loadAudio();
      gameManager = new SpaceGame.GameManager(jqAlias('#gameCanvas')[0]);
      gameManager.setupUserControls();
      return jqAlias('#nameForm').submit(function(eventObj) {
        var playerName;
        eventObj.preventDefault();
        playerName = jqAlias('#playerName').val();
        gameManager.assignPlayerName(playerName);
        return jqAlias('#nameForm').hide();
      });
    });
  }).call(this);
}).call(this);