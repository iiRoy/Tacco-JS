(function (globalScope, voidValue) {

  const isMobileDevice = /FFOS|Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(globalScope.navigator.userAgent);

  globalScope.frameScheduler = (function () {
    return globalScope.requestAnimationFrame ||
      globalScope.webkitRequestAnimationFrame ||
      globalScope.mozRequestAnimationFrame ||
      globalScope.oRequestAnimationFrame ||
      globalScope.msRequestAnimationFrame ||
      function (action) {
        globalScope.setTimeout(action, 1000 / 60);
      };
  })();

  class CoreEngine {
    constructor(interactionHandlers, operationalState, targetElement) {
      this.targetElement = targetElement === voidValue ? globalScope :
        (typeof targetElement === "string" ? document.querySelector(targetElement) : targetElement);

      this.currentSettings = operationalState || interactionHandlers;

      this.currentSettings.outputScale = 1;
      this.currentSettings.inputScale = 1;
      this.currentSettings.blockMultiTouch = this.currentSettings.blockMultiTouch || false;

      for (const handlerName in interactionHandlers) {
        if (typeof this[handlerName] === "function") {
          this[handlerName](this.targetElement, interactionHandlers[handlerName], this.currentSettings);
        }
      }

      if (this.currentSettings.autoAdjust) {
        globalScope.addEventListener("resize", () => {
          this.adjustToViewport(this.targetElement, this.currentSettings);
        });
        this.adjustToViewport(this.targetElement, this.currentSettings);
      }

      globalScope.setInterval(this.advanceFrame.bind(this), 1000 / 60);

      this.acceptPointerInput = !isMobileDevice;
    }

    static augment(...sources) {
      const destination = sources[0];
      for (let k = 1; k < sources.length; k++) {
        for (const prop in sources[k]) {
          destination[prop] = sources[k][prop];
        }
      }
      return destination;
    }

    static controlInputMap = new Map([
      [0, "primary"],
      [1, "secondary"],
      [2, "tertiary"],
      [3, "quaternary"],
      [4, "leftBumper"],
      [5, "rightBumper"],
      [6, "leftTrigger"],
      [7, "rightTrigger"],
      [8, "back"],
      [9, "forward"],
      [12, "padUp"],
      [13, "padDown"],
      [14, "padLeft"],
      [15, "padRight"]
    ]);

    static keyboardMap = new Map([
      [37, "arrowLeft"],
      [38, "arrowUp"],
      [39, "arrowRight"],
      [40, "arrowDown"],
      [45, "insertKey"],
      [46, "deleteKey"],
      [8, "backspaceKey"],
      [9, "tabKey"],
      [13, "enterKey"],
      [16, "shiftKey"],
      [17, "controlKey"],
      [18, "altKey"],
      [19, "pauseKey"],
      [20, "capsLockKey"],
      [27, "escapeKey"],
      [32, "spaceKey"],
      [33, "pageUpKey"],
      [34, "pageDownKey"],
      [35, "endKey"],
      [112, "f1Key"],
      [113, "f2Key"],
      [114, "f3Key"],
      [115, "f4Key"],
      [116, "f5Key"],
      [117, "f6Key"],
      [118, "f7Key"],
      [119, "f8Key"],
      [120, "f9Key"],
      [121, "f10Key"],
      [122, "f11Key"],
      [123, "f12Key"],
      [144, "numLockKey"],
      [145, "scrollLockKey"],
      [186, "semicolonKey"],
      [187, "equalKey"],
      [188, "commaKey"],
      [189, "dashKey"],
      [190, "periodKey"],
      [191, "slashKey"],
      [192, "graveAccentKey"],
      [219, "openBracketKey"],
      [220, "backslashKey"],
      [221, "closeBracketKey"],
      [222, "singleQuoteKey"]
    ]);

    padStatus = [];
    eventRegistry = new Map();

    registerListener(signal, handler) {
      if (!this.eventRegistry.has(signal)) {
        this.eventRegistry.set(signal, new Set());
      }
      this.eventRegistry.get(signal).add(handler);
    }

    dispatchSignal(signal, ...args) {
      const listeners = this.eventRegistry.get(signal);
      if (listeners) {
        listeners.forEach(listener => listener.apply(this, args));
      }
    }

    calculateHypotenuse(pt1X, pt1Y, pt2X, pt2Y) {
      return Math.hypot(pt2X - pt1X, pt2Y - pt1Y);
    }

    advanceFrame() {
      const gamepadAPI = globalScope.navigator.getGamepads || globalScope.navigator.webkitGetGamepads;

      if (gamepadAPI) {
        const connectedPads = gamepadAPI.call(globalScope.navigator);

        for (let idx = 0; idx < connectedPads.length; idx++) {
          const currentPad = connectedPads[idx];

          if (!currentPad) continue;

          if (!this.padStatus[idx]) {
            this.padStatus[idx] = {
              buttons: Array(currentPad.buttons.length + 4).fill(0),
              axes: Array(currentPad.axes.length).fill(0)
            };
          }

          const previousPadState = this.padStatus[idx];

          if (previousPadState.axes[0] !== currentPad.axes[0] || previousPadState.axes[1] !== currentPad.axes[1]) {
            this.dispatchSignal("controllerAxisMove", currentPad.axes[0], currentPad.axes[1], idx);
          }

          const axisDerivedButtons = [];
          axisDerivedButtons[0] = currentPad.axes[1] < 0 ? 1 : 0;
          axisDerivedButtons[1] = currentPad.axes[1] > 0 ? 1 : 0;
          axisDerivedButtons[2] = currentPad.axes[0] < 0 ? 1 : 0;
          axisDerivedButtons[3] = currentPad.axes[0] > 0 ? 1 : 0;

          const combinedButtons = currentPad.buttons.map(btn => btn.value > 0 ? 1 : 0).concat(axisDerivedButtons);

          for (let btnIdx = 0; btnIdx < combinedButtons.length; btnIdx++) {
            const previousBtnValue = previousPadState.buttons[btnIdx];
            const currentBtnValue = combinedButtons[btnIdx];
            const buttonIdentifier = CoreEngine.controlInputMap.get(btnIdx);

            if (previousBtnValue === 0 && currentBtnValue === 1) {
              this.dispatchSignal("controllerButtonDown", buttonIdentifier, idx);
            }
            if (previousBtnValue === 1 && currentBtnValue === 0) {
              this.dispatchSignal("controllerButtonUp", buttonIdentifier, idx);
            }
          }

          this.padStatus[idx] = {
            buttons: combinedButtons,
            axes: [...currentPad.axes]
          };
        }
      }
    }

    getPointerCoordinates(eventData, hostElement) {
      const currentHost = hostElement || eventData.target || eventData.srcElement;
      let clientX = 0,
        clientY = 0;

      if (eventData.changedTouches && eventData.changedTouches[0] !== voidValue) {
        eventData = eventData.changedTouches[0];
      }

      if (eventData.pageX || eventData.pageY) {
        clientX = eventData.pageX;
        clientY = eventData.pageY;
      } else if (eventData.clientX || eventData.clientY) {
        clientX = eventData.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        clientY = eventData.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }

      const rect = currentHost.getBoundingClientRect();
      const relativeX = clientX - rect.left - globalScope.scrollX;
      const relativeY = clientY - rect.top - globalScope.scrollY;

      return {
        x: relativeX,
        y: relativeY
      };
    }

    onAnimationFrame(targetElement, handlerFunction, operatingContext) {
      let lastMeasurementTime = Date.now();

      const animationCallback = () => {
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastMeasurementTime;
        lastMeasurementTime = currentTime;
        globalScope.frameScheduler(animationCallback);
        handlerFunction.call(operatingContext, timeElapsed, currentTime);
      };

      globalScope.frameScheduler(animationCallback);
    }

    onDisplayUpdate(targetElement, handlerFunction, operatingContext) {
      let lastMeasurementTime = Date.now();

      const displayCallback = () => {
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastMeasurementTime;
        lastMeasurementTime = currentTime;
        globalScope.frameScheduler(displayCallback);
        handlerFunction.call(operatingContext, timeElapsed, currentTime);
      };

      globalScope.frameScheduler(displayCallback);
    }

    onPointerMovement(targetElement, handlerFunction, operatingContext) {
      targetElement.addEventListener("mousemove", (eventData) => {
        if (!this.acceptPointerInput) return;
        const coordinates = this.getPointerCoordinates(eventData, targetElement);
        handlerFunction.call(operatingContext, Math.floor(coordinates.x * operatingContext.inputScale), Math.floor(coordinates.y * operatingContext.inputScale));
      });
      return this;
    }

    onPointerDown(targetElement, handlerFunction, operatingContext) {
      targetElement.addEventListener("mousedown", (eventData) => {
        if (!this.acceptPointerInput) return;
        const coordinates = this.getPointerCoordinates(eventData, targetElement);
        operatingContext.pointerStart = {
          x: Math.floor(coordinates.x * operatingContext.inputScale),
          y: Math.floor(coordinates.y * operatingContext.inputScale)
        };
        handlerFunction.call(operatingContext, Math.floor(coordinates.x * operatingContext.inputScale), Math.floor(coordinates.y * operatingContext.inputScale), eventData.button);
      });
      return this;
    }

    onPointerUp(targetElement, handlerFunction, operatingContext) {
      targetElement.addEventListener("mouseup", (eventData) => {
        if (!this.acceptPointerInput) return;
        const coordinates = this.getPointerCoordinates(eventData, targetElement);
        handlerFunction.call(operatingContext, Math.floor(coordinates.x * operatingContext.inputScale), Math.floor(coordinates.y * operatingContext.inputScale), eventData.button);
      });
      return this;
    }

    onScrollWheel(targetElement, handlerFunction, operatingContext) {
      const scrollEvents = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'];

      scrollEvents.forEach(eventName => {
        targetElement.addEventListener(eventName, (eventData) => {
          if (!this.acceptPointerInput) return;

          let scrollDelta = 0;
          if (eventData.wheelDelta) {
            scrollDelta = eventData.wheelDelta;
          } else if (eventData.detail) {
            scrollDelta = eventData.detail * -1;
          } else if (eventData.deltaY) {
            scrollDelta = eventData.deltaY * -1;
          }

          const normalizedDelta = scrollDelta !== 0 ? scrollDelta / Math.abs(scrollDelta) : 0;

          handlerFunction.call(operatingContext, normalizedDelta);
          eventData.preventDefault();
        }, false);
      });
    }

    onTouchGesture(targetElement, handlerFunction, operatingContext) {
      targetElement.addEventListener("touchmove", (eventData) => {
        if (operatingContext.blockMultiTouch && eventData.touches.length > 1) return;
        eventData.preventDefault();
        const coordinates = this.getPointerCoordinates(eventData, targetElement);
        handlerFunction.call(operatingContext, Math.floor(coordinates.x * operatingContext.inputScale), Math.floor(coordinates.y * operatingContext.inputScale), eventData.touches);
      });
    }

    onTouchInitiate(targetElement, handlerFunction, operatingContext) {
      targetElement.addEventListener("touchstart", (eventData) => {
        if (operatingContext.blockMultiTouch && eventData.touches.length > 0) return;

        const coordinates = this.getPointerCoordinates(eventData, targetElement);
        operatingContext.pointerStart = {
          x: Math.floor(coordinates.x * operatingContext.inputScale),
          y: Math.floor(coordinates.y * operatingContext.inputScale)
        };
        handlerFunction.call(operatingContext, Math.floor(coordinates.x * operatingContext.inputScale), Math.floor(coordinates.y * operatingContext.inputScale), eventData.touches);
      });
    }

    onTouchTerminate(targetElement, handlerFunction, operatingContext) {
      targetElement.addEventListener("touchend", (eventData) => {
        if (operatingContext.blockMultiTouch && eventData.touches.length > 0) return;
        const coordinates = this.getPointerCoordinates(eventData, targetElement);
        handlerFunction.call(operatingContext, Math.floor(coordinates.x * operatingContext.inputScale), Math.floor(coordinates.y * operatingContext.inputScale), eventData.touches);
      });
    }

    onPointerClick(targetElement, handlerFunction, operatingContext) {
      this.onPointerUp(targetElement, (x, y) => {
        if (this.calculateHypotenuse(x, y, operatingContext.pointerStart.x, operatingContext.pointerStart.y) < 5) {
          handlerFunction.call(operatingContext, Math.floor(x), Math.floor(y));
        }
      }, operatingContext);
    }

    onKeyPress(targetElement, handlerFunction, operatingContext) {
      document.addEventListener("keydown", (eventData) => {
        const keyCode = eventData.which;
        let keyIdentifier;
        if (keyCode >= 48 && keyCode <= 90) {
          keyIdentifier = String.fromCharCode(keyCode).toLowerCase();
        } else {
          keyIdentifier = CoreEngine.keyboardMap.get(keyCode);
        }
        handlerFunction.call(operatingContext, keyIdentifier);
      });
      return this;
    }

    onKeyRelease(targetElement, handlerFunction, operatingContext) {
      document.addEventListener("keyup", (eventData) => {
        const keyCode = eventData.which;
        let keyIdentifier;
        if (keyCode >= 48 && keyCode <= 90) {
          keyIdentifier = String.fromCharCode(keyCode).toLowerCase();
        } else {
          keyIdentifier = CoreEngine.keyboardMap.get(keyCode);
        }
        handlerFunction.call(operatingContext, keyIdentifier);
      });
      return this;
    }

    onControllerButtonDown(targetElement, handlerFunction, operatingContext) {
      this.registerListener("controllerButtonDown", (button, controllerIndex) => {
        handlerFunction.call(operatingContext, button, controllerIndex);
      });
      return this;
    }

    onControllerButtonUp(targetElement, handlerFunction, operatingContext) {
      this.registerListener("controllerButtonUp", (button, controllerIndex) => {
        handlerFunction.call(operatingContext, button, controllerIndex);
      });
      return this;
    }

    onControllerAxisMove(targetElement, handlerFunction, operatingContext) {
      this.registerListener("controllerAxisMove", (x, y, controllerIndex) => {
        handlerFunction.call(operatingContext, x, y, controllerIndex);
      });
      return this;
    }

    onViewportResize(targetElement, handlerFunction, operatingContext) {
      globalScope.addEventListener("resize", () => {
        handlerFunction.call(operatingContext, globalScope.innerWidth, globalScope.innerHeight);
      });
      return this;
    }

    onImageDrop(targetElement, handlerFunction, operatingContext) {
      document.addEventListener('drop', (eventData) => {
        eventData.stopPropagation();
        eventData.preventDefault();

        const droppedFile = eventData.dataTransfer.files[0];

        if (!droppedFile || !(/image/i).test(droppedFile.type)) return;

        const fileReader = new FileReader();

        fileReader.onload = (readEvent) => {
          const loadedImage = new Image();

          loadedImage.onload = () => {
            handlerFunction.call(operatingContext, loadedImage);
          };

          loadedImage.src = readEvent.target.result;
        };

        fileReader.readAsDataURL(droppedFile);
      });

      document.addEventListener("dragover", (eventData) => {
        eventData.preventDefault();
      });

      return this;
    }

    adjustToViewport(targetElement, operatingContext) {
      let calculatedScale = globalScope.innerWidth / operatingContext.width;

      if (operatingContext.height * calculatedScale > globalScope.innerHeight) {
        calculatedScale = globalScope.innerHeight / operatingContext.height;
      }
    }
  }

  globalScope.Maestro = function (interactionHandlers, operationalState, targetElement) {
    return new CoreEngine(interactionHandlers, operationalState, targetElement);
  };

  Object.assign(globalScope.Maestro, {
    augment: CoreEngine.augment,
    controlInputMap: CoreEngine.controlInputMap,
    keyboardMap: CoreEngine.keyboardMap
  });

})(window, undefined);