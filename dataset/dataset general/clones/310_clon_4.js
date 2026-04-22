function convertHexToRgb(hexValue) {
    const shorthandPattern = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hexValue = hexValue.replace(shorthandPattern, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

class VisualElement {
    constructor(baseColor, baseTransparency, initialPosition, systemConfiguration) {
        this.systemConfiguration = systemConfiguration;

        this.position = {
            x: initialPosition ? initialPosition.x : Math.random() * this.systemConfiguration.display.width,
            y: initialPosition ? initialPosition.y : Math.random() * this.systemConfiguration.display.height
        };

        this.size = (this.systemConfiguration.elements.randomDimension ? Math.random() : 1) * this.systemConfiguration.elements.dimension;
        if (this.systemConfiguration.isHighDPI) this.size *= this.systemConfiguration.display.pixelRatio;

        if (this.systemConfiguration.elements.randomColor) {
            this.color = {
                r: Math.floor(Math.random() * 256),
                g: Math.floor(Math.random() * 256),
                b: Math.floor(Math.random() * 256)
            };
        } else {
            this.color = baseColor;
        }

        this.currentTransparency = baseTransparency;
        if (this.systemConfiguration.elements.transparency.animation.enabled) {
            this.transparencyState = false;
            this.transparencyRate = this.systemConfiguration.elements.transparency.animation.speed / 100;
            if (!this.systemConfiguration.elements.transparency.animation.synchronized) {
                this.transparencyRate = this.transparencyRate * Math.random();
            }
        }

        this.velocity = {
            vx: -0.5 + Math.random(),
            vy: -0.5 + Math.random()
        };
    }

    render(context) {
        context.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.currentTransparency})`;
        context.beginPath();

        switch (this.systemConfiguration.elements.shapeType) {
            case 'circle':
                context.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2, false);
                break;
            case 'edge':
                context.rect(this.position.x, this.position.y, this.size * 2, this.size * 2);
                break;
            case 'triangle':
                context.moveTo(this.position.x, this.position.y - this.size);
                context.lineTo(this.position.x + this.size, this.position.y + this.size);
                context.lineTo(this.position.x - this.size, this.position.y + this.size);
                context.closePath();
                break;
        }
        context.fill();
    }
}

class AetherRenderer {
    constructor(containerId, options) {
        this.displaySurface = document.querySelector('#' + containerId + ' > canvas');
        if (!this.displaySurface) {
            console.error('Canvas element not found for identifier:', containerId);
            return;
        }

        this.systemConfig = this._getDefaultConfiguration(this.displaySurface);
        this._applyUserOptions(options);

        this.systemConfig.elements.colorRgb = convertHexToRgb(this.systemConfig.elements.color);
        this.systemConfig.elements.connection.colorRgb = convertHexToRgb(this.systemConfig.elements.connection.color);

        this._scaleForHighDPI();

        this.drawingContext = this.displaySurface.getContext('2d');
        this._setCanvasDimensions();
        this._attachResizeHandler();
        this._generateElements();
        this._setupInputListeners();
    }

    _getDefaultConfiguration(canvasElement) {
        return {
            display: {
                surface: canvasElement,
                width: canvasElement.offsetWidth,
                height: canvasElement.offsetHeight,
                pixelRatio: 1
            },
            elements: {
                color: '#fff',
                randomColor: false,
                shapeType: 'circle',
                transparency: {
                    value: 1,
                    animation: {
                        enabled: false,
                        speed: 2,
                        minimum: 0,
                        synchronized: false
                    }
                },
                dimension: 2.5,
                randomDimension: true,
                count: 200,
                connection: {
                    autoEnable: true,
                    range: 100,
                    color: '#fff',
                    transparency: 1,
                    thickness: 1,
                    condensedMotion: {
                        enabled: false,
                        rotationX: 3000,
                        rotationY: 3000
                    }
                },
                motion: {
                    enabled: true,
                    rate: 2
                },
                activeElements: []
            },
            interaction: {
                enabled: true,
                pointer: {
                    range: 100,
                    posX: 0,
                    posY: 0
                },
                detectionArea: 'canvas',
                mode: 'grab',
                connection: {
                    transparency: 1
                },
                actions: {
                    onClick: {
                        enabled: true,
                        mode: 'push',
                        number: 4
                    },
                    onResize: {
                        enabled: true,
                        mode: 'out',
                        densityAuto: false,
                        densityArea: 800
                    }
                }
            },
            highDPI: false,
            isHighDPI: false,
            status: 'none'
        };
    }

    _applyUserOptions(userOptions) {
        if (!userOptions) return;

        if (userOptions.particles) {
            const userElements = userOptions.particles;
            if (userElements.color) this.systemConfig.elements.color = userElements.color;
            if (userElements.color_random) this.systemConfig.elements.randomColor = userElements.color_random;
            if (userElements.shape) this.systemConfig.elements.shapeType = userElements.shape;
            if (userElements.opacity) {
                const userTransparency = userElements.opacity;
                if (typeof userTransparency == 'object') this.systemConfig.elements.transparency.value = userTransparency.opacity;
                else this.systemConfig.elements.transparency.value = userTransparency;
                if (userTransparency.anim) {
                    const userTransparencyAnim = userTransparency.anim;
                    if (userTransparencyAnim.enable === false || userTransparencyAnim.enable) this.systemConfig.elements.transparency.animation.enabled = userTransparencyAnim.enable;
                    if (userTransparencyAnim.speed) this.systemConfig.elements.transparency.animation.speed = userTransparencyAnim.speed;
                    if (userTransparencyAnim.opacity_min) this.systemConfig.elements.transparency.animation.minimum = userTransparencyAnim.opacity_min;
                    if (userTransparencyAnim.sync === false || userTransparencyAnim.sync) this.systemConfig.elements.transparency.animation.synchronized = userTransparencyAnim.sync;
                }
            }
            if (userElements.size) this.systemConfig.elements.dimension = userElements.size;
            if (userElements.size_random === false) this.systemConfig.elements.randomDimension = userElements.size_random;
            if (userElements.nb) this.systemConfig.elements.count = userElements.nb;
            if (userElements.line_linked) {
                const userConnection = userElements.line_linked;
                if (userConnection.enable_auto === false) this.systemConfig.elements.connection.autoEnable = userConnection.enable_auto;
                if (userConnection.distance) this.systemConfig.elements.connection.range = userConnection.distance;
                if (userConnection.color) this.systemConfig.elements.connection.color = userConnection.color;
                if (userConnection.opacity) this.systemConfig.elements.connection.transparency = userConnection.opacity;
                if (userConnection.width) this.systemConfig.elements.connection.thickness = userConnection.width;
                if (userConnection.condensed_mode) {
                    const userCondensedMotion = userConnection.condensed_mode;
                    if (userCondensedMotion.enable === false) this.systemConfig.elements.connection.condensedMotion.enabled = userCondensedMotion.enable;
                    if (userCondensedMotion.rotateX) this.systemConfig.elements.connection.condensedMotion.rotationX = userCondensedMotion.rotateX;
                    if (userCondensedMotion.rotateY) this.systemConfig.elements.connection.condensedMotion.rotationY = userCondensedMotion.rotateY;
                }
            }
            if (userElements.anim) {
                const userMotion = userElements.anim;
                if (userMotion.enable === false) this.systemConfig.elements.motion.enabled = userMotion.enable;
                if (userMotion.speed) this.systemConfig.elements.motion.rate = userMotion.speed;
            }
        }

        if (userOptions.interactivity) {
            const userInteraction = userOptions.interactivity;
            if (userInteraction.enable === false) this.systemConfig.interaction.enabled = userInteraction.enable;
            if (userInteraction.mouse) {
                if (userInteraction.mouse.distance) this.systemConfig.interaction.pointer.range = userInteraction.mouse.distance;
            }
            if (userInteraction.detect_on) this.systemConfig.interaction.detectionArea = userInteraction.detect_on;
            if (userInteraction.mode === false || userInteraction.mode) this.systemConfig.interaction.mode = userInteraction.mode;
            if (userInteraction.line_linked) {
                if (userInteraction.line_linked.opacity) this.systemConfig.interaction.connection.transparency = userInteraction.line_linked.opacity;
            }
            if (userInteraction.events) {
                const userActions = userInteraction.events;
                if (userActions.onclick) {
                    const userOnClick = userActions.onclick;
                    if (userOnClick.enable === false) this.systemConfig.interaction.actions.onClick.enabled = false;
                    if (userOnClick.mode !== 'push') this.systemConfig.interaction.actions.onClick.mode = userOnClick.mode;
                    if (userOnClick.nb) this.systemConfig.interaction.actions.onClick.number = userOnClick.nb;
                }
                if (userActions.onresize) {
                    const userOnResize = userActions.onresize;
                    if (userOnResize.enable === false) this.systemConfig.interaction.actions.onResize.enabled = false;
                    if (userOnResize.mode) this.systemConfig.interaction.actions.onResize.mode = userOnResize.mode;
                    if (userOnResize.density_auto === false || userOnResize.density_auto) this.systemConfig.interaction.actions.onResize.densityAuto = userOnResize.density_auto;
                    if (userOnResize.density_area) this.systemConfig.interaction.actions.onResize.densityArea = userOnResize.density_area;
                }
            }
        }
        if (userOptions.retina_detect !== undefined) {
            this.systemConfig.highDPI = userOptions.retina_detect;
        }
    }

    _scaleForHighDPI() {
        if (this.systemConfig.highDPI && window.devicePixelRatio > 1) {
            this.systemConfig.isHighDPI = true;
            this.systemConfig.display.pixelRatio = window.devicePixelRatio;
            this.systemConfig.display.width = this.displaySurface.offsetWidth * this.systemConfig.display.pixelRatio;
            this.systemConfig.display.height = this.displaySurface.offsetHeight * this.systemConfig.display.pixelRatio;
            this.systemConfig.elements.motion.rate = this.systemConfig.elements.motion.rate * this.systemConfig.display.pixelRatio;
            this.systemConfig.elements.connection.range = this.systemConfig.elements.connection.range * this.systemConfig.display.pixelRatio;
            this.systemConfig.elements.connection.thickness = this.systemConfig.elements.connection.thickness * this.systemConfig.display.pixelRatio;
            this.systemConfig.interaction.pointer.range = this.systemConfig.interaction.pointer.range * this.systemConfig.display.pixelRatio;
        }
    }

    _setCanvasDimensions() {
        this.displaySurface.width = this.systemConfig.display.width;
        this.displaySurface.height = this.systemConfig.display.height;
    }

    _attachResizeHandler() {
        window.addEventListener('resize', () => {
            if (this.systemConfig && this.systemConfig.interaction.actions.onResize.enabled) {
                this.systemConfig.display.width = this.displaySurface.offsetWidth;
                this.systemConfig.display.height = this.displaySurface.offsetHeight;

                if (this.systemConfig.isHighDPI) {
                    this.systemConfig.display.width *= this.systemConfig.display.pixelRatio;
                    this.systemConfig.display.height *= this.systemConfig.display.pixelRatio;
                }

                this.displaySurface.width = this.systemConfig.display.width;
                this.displaySurface.height = this.systemConfig.display.height;

                this.drawingContext.fillRect(0, 0, this.systemConfig.display.width, this.systemConfig.display.height);
                if (!this.systemConfig.elements.motion.enabled) {
                    this.removeElements();
                    this._clearCanvasCompletely();
                    this._generateElements();
                }
                this._adjustElementDensity();
            }
        });
    }

    _adjustElementDensity() {
        if (this.systemConfig.interaction.actions.onResize.densityAuto) {
            let currentArea = this.displaySurface.width * this.displaySurface.height / 1000;
            if (this.systemConfig.isHighDPI) {
                currentArea = currentArea / (this.systemConfig.display.pixelRatio * 2);
            }

            const targetElementCount = currentArea * this.systemConfig.elements.count / this.systemConfig.interaction.actions.onResize.densityArea;
            const existingElementCount = this.systemConfig.elements.activeElements.length;
            const difference = existingElementCount - targetElementCount;

            if (difference < 0) {
                this.addElements(Math.abs(difference));
            } else {
                this.removeElements(difference);
            }
        }
    }

    _clearCanvasCompletely() {
        this.drawingContext.clearRect(0, 0, this.systemConfig.display.width, this.systemConfig.display.height);
    }

    _generateElements() {
        this.systemConfig.elements.activeElements = [];
        for (let i = 0; i < this.systemConfig.elements.count; i++) {
            this.systemConfig.elements.activeElements.push(
                new VisualElement(
                    this.systemConfig.elements.colorRgb,
                    this.systemConfig.elements.transparency.value,
                    null,
                    this.systemConfig
                )
            );
        }
    }

    addElements(count, position = null) {
        for (let i = 0; i < count; i++) {
            this.systemConfig.elements.activeElements.push(
                new VisualElement(
                    this.systemConfig.elements.colorRgb,
                    this.systemConfig.elements.transparency.value,
                    position,
                    this.systemConfig
                )
            );
        }
    }

    removeElements(count = this.systemConfig.elements.activeElements.length) {
        this.systemConfig.elements.activeElements.splice(0, count);
    }

    _setupInputListeners() {
        let interactionTarget;
        if (this.systemConfig.interaction.detectionArea === 'window') {
            interactionTarget = window;
        } else {
            interactionTarget = this.displaySurface;
        }

        interactionTarget.onmousemove = (event) => {
            let currentX, currentY;
            if (interactionTarget === window) {
                currentX = event.clientX;
                currentY = event.clientY;
            } else {
                currentX = event.offsetX || event.clientX;
                currentY = event.offsetY || event.clientY;
            }

            if (this.systemConfig) {
                this.systemConfig.interaction.pointer.posX = currentX;
                this.systemConfig.interaction.pointer.posY = currentY;

                if (this.systemConfig.isHighDPI) {
                    this.systemConfig.interaction.pointer.posX *= this.systemConfig.display.pixelRatio;
                    this.systemConfig.interaction.pointer.posY *= this.systemConfig.display.pixelRatio;
                }
                this.systemConfig.status = 'active';
            }
        };

        interactionTarget.onmouseleave = (event) => {
            if (this.systemConfig) {
                this.systemConfig.interaction.pointer.posX = 0;
                this.systemConfig.interaction.pointer.posY = 0;
                this.systemConfig.status = 'inactive';
            }
        };

        if (this.systemConfig.interaction.actions.onClick.enabled) {
            switch (this.systemConfig.interaction.actions.onClick.mode) {
                case 'push':
                    interactionTarget.onclick = (event) => {
                        this.addElements(this.systemConfig.interaction.actions.onClick.number, {
                            x: this.systemConfig.interaction.pointer.posX,
                            y: this.systemConfig.interaction.pointer.posY
                        });
                    };
                    break;
                case 'remove':
                    interactionTarget.onclick = (event) => {
                        this.removeElements(this.systemConfig.interaction.actions.onClick.number);
                    };
                    break;
            }
        }
    }

    renderFrame() {
        this.drawingContext.clearRect(0, 0, this.systemConfig.display.width, this.systemConfig.display.height);
        this._updateElementStates();

        for (const element of this.systemConfig.elements.activeElements) {
            element.render(this.drawingContext);
        }
    }

    _updateElementStates() {
        const elements = this.systemConfig.elements.activeElements;
        const config = this.systemConfig;

        for (let i = 0; i < elements.length; i++) {
            const currentElement = elements[i];

            currentElement.position.x += currentElement.velocity.vx * (config.elements.motion.rate / 2);
            currentElement.position.y += currentElement.velocity.vy * (config.elements.motion.rate / 2);

            if (config.elements.transparency.animation.enabled) {
                if (currentElement.transparencyState === true) {
                    if (currentElement.currentTransparency >= config.elements.transparency.value) currentElement.transparencyState = false;
                    currentElement.currentTransparency += currentElement.transparencyRate;
                } else {
                    if (currentElement.currentTransparency <= config.elements.transparency.animation.minimum) currentElement.transparencyState = true;
                    currentElement.currentTransparency -= currentElement.transparencyRate;
                }
            }

            switch (config.interaction.actions.onResize.mode) {
                case 'bounce':
                    if (currentElement.position.x - currentElement.size > config.display.width) currentElement.velocity.vx = -currentElement.velocity.vx;
                    else if (currentElement.position.x + currentElement.size < 0) currentElement.velocity.vx = -currentElement.velocity.vx;
                    if (currentElement.position.y - currentElement.size > config.display.height) currentElement.velocity.vy = -currentElement.velocity.vy;
                    else if (currentElement.position.y + currentElement.size < 0) currentElement.velocity.vy = -currentElement.velocity.vy;
                    break;
                case 'out':
                    if (currentElement.position.x - currentElement.size > config.display.width) currentElement.position.x = currentElement.size;
                    else if (currentElement.position.x + currentElement.size < 0) currentElement.position.x = config.display.width + currentElement.size;
                    if (currentElement.position.y - currentElement.size > config.display.height) currentElement.position.y = currentElement.size;
                    else if (currentElement.position.y + currentElement.size < 0) currentElement.position.y = config.display.height + currentElement.size;
                    break;
            }

            for (let j = i + 1; j < elements.length; j++) {
                const otherElement = elements[j];

                if (config.elements.connection.autoEnable) {
                    this._renderConnectionBetweenElements(currentElement, otherElement);
                }

                if (config.interaction.enabled) {
                    switch (config.interaction.mode) {
                        case 'grab':
                            // The original snippet's `pJS.fn.vendors.interactivity.grabParticles`
                            // is called with two particles but is an empty object in the provided code.
                            // Therefore, no action is taken here to maintain functional equivalence.
                            break;
                    }
                }
            }
        }
    }

    _renderConnectionBetweenElements(element1, element2) {
        const dx = element1.position.x - element2.position.x;
        const dy = element1.position.y - element2.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const config = this.systemConfig;

        if (dist <= config.elements.connection.range) {
            const lineColor = config.elements.connection.colorRgb;
            this.drawingContext.beginPath();
            this.drawingContext.strokeStyle = `rgba(${lineColor.r},${lineColor.g},${lineColor.b},${(config.elements.connection.transparency - dist / config.elements.connection.range)})`;
            this.drawingContext.moveTo(element1.position.x, element1.position.y);
            this.drawingContext.lineTo(element2.position.x, element2.position.y);
            this.drawingContext.lineWidth = config.elements.connection.thickness;
            this.drawingContext.stroke();
            this.drawingContext.closePath();

            if (config.elements.connection.condensedMotion.enabled) {
                const accelX = dx / (config.elements.connection.condensedMotion.rotationX * 1000);
                const accelY = dy / (config.elements.connection.condensedMotion.rotationY * 1000);
                element2.velocity.vx += accelX;
                element2.velocity.vy += accelY;
            }
        }
    }
}

function initializeVisualSystem(containerId, options) {
    // The original `launchParticlesJS` creates a global `pJS` object.
    // To replicate this behavior without reusing the exact name,
    // we assign the instance to a new global variable.
    window.visualSystemInstance = new AetherRenderer(containerId, options);
    // The original function does not return a value.
}