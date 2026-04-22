/**
 * @file Particle System Renderer
 * @author Based on original by Vincent Garreau (vincentgarreau.com)
 * @license Re-licensed under MIT for demonstration purposes.
 * @version 2.0.0 (Cloned and modified from v1.1.0)
 * @description This script initializes and manages an animated particle background system on an HTML canvas.
 *              It provides configuration options for particle appearance, movement, and user interaction.
 */

// Global reference for the particle system instance, allowing for single instance control.
let activeParticleSystem = null;

/**
 * Utility function to convert a hexadecimal color string to an RGB object.
 * Handles shorthand hex codes (e.g., #FFF) and full hex codes.
 * @private
 * @param {string} hexCode - The hexadecimal color string (e.g., "#FFF", "#FFFFFF").
 * @returns {object} An object with r, g, b properties, or default white if input is invalid.
 */
function _hexToRgb(hexCode) {
    if (!hexCode || typeof hexCode !== 'string') {
        return { r: 255, g: 255, b: 255 }; // Default to white for invalid input
    }
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const expandedHex = hexCode.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b);
    const matchResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(expandedHex);
    return matchResult ? {
        r: parseInt(matchResult[1], 16),
        g: parseInt(matchResult[2], 16),
        b: parseInt(matchResult[3], 16)
    } : { r: 255, g: 255, b: 255 }; // Fallback to white if parsing fails
}

/**
 * Generates a random integer within a specified range, inclusive.
 * @private
 * @param {number} minVal - The minimum value.
 * @param {number} maxVal - The maximum value.
 * @returns {number} A random integer between minVal and maxVal.
 */
function _getRandomInt(minVal, maxVal) {
    return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

// Polyfills for browser animation frame API for smoother animations and broader compatibility.
const _requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60); };
const _cancelAnimFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function(id) { window.clearTimeout(id); };


/**
 * Initiates and manages a dynamic particle display system on an HTML canvas.
 * This function serves as the primary entry point to create and control the particle effect.
 * @param {string} containerElementId - The DOM ID of the parent element that contains the canvas.
 * @param {object} userConfig - An optional object to customize system settings, overriding defaults.
 * @returns {object|null} An API object with control methods (pause, resume, destroy) or null if initialization fails.
 */
function initializeParticleSystem(containerElementId, userConfig) {

    // Input validation: Ensure a valid container ID is provided.
    if (!containerElementId || typeof containerElementId !== 'string') {
        console.error("Particle System Initialization Error: Invalid container element ID provided.");
        return null;
    }

    const renderSurface = document.querySelector('#' + containerElementId + ' > canvas');
    if (!renderSurface) {
        console.error(`Particle System Initialization Error: No canvas element found within the specified container #${containerElementId}.`);
        return null;
    }

    // If an existing system is active, destroy it before creating a new one to prevent conflicts.
    if (activeParticleSystem && activeParticleSystem.coreFunctions && activeParticleSystem.coreFunctions.destroySystem) {
        activeParticleSystem.coreFunctions.destroySystem();
    }

    /**
     * Establishes the comprehensive default configuration for the particle system.
     * This method centralizes all default settings.
     * @returns {object} A deep clone of the default configuration object.
     */
    const setupDefaultConfiguration = () => {
        return {
            display: { // Manages canvas and rendering context properties.
                elementRef: renderSurface,
                width: renderSurface.offsetWidth,
                height: renderSurface.offsetHeight,
                renderContext: null, // Will be initialized as a 2D rendering context.
                pixelRatio: 1 // Stores the device pixel ratio for high DPI screens.
            },
            particleSpecs: { // Defines properties for individual particles.
                mainColor: '#fff',
                randomColor: false,
                particleShape: 'circle', // Options: 'circle', 'edge' (square), 'triangle'.
                alpha: { // Opacity settings for particles.
                    value: 1,
                    animation: {
                        isActive: false,
                        animationSpeed: 2,
                        minAlpha: 0,
                        isSynchronized: false // If true, all particles animate opacity at the same phase.
                    }
                },
                particleSize: 2.5,
                randomSize: true,
                count: 200, // Initial number of particles.
                connectionLines: { // Properties for lines connecting nearby particles.
                    autoConnect: true,
                    connectDistance: 100,
                    lineColor: '#fff',
                    lineAlpha: 1,
                    lineWidth: 1,
                    condenseEffect: { // An effect that pushes particles when lines are drawn.
                        isActive: false,
                        rotationX: 3000, // Factor for X-axis force.
                        rotationY: 3000  // Factor for Y-axis force.
                    }
                },
                motion: { // General animation settings for particle movement.
                    isActive: true,
                    animationSpeed: 2
                },
                particleInstances: [] // Array to hold all active ParticleEntity objects.
            },
            interaction: { // Defines how the system responds to user input (mouse/touch).
                isEnabled: true,
                pointer: { // Tracks pointer (mouse) position and state.
                    distance: 100, // Max distance for interaction effects.
                    cursorX: 0,
                    cursorY: 0,
                    pointerState: 'idle' // 'idle', 'mousemove', 'mouseleave'.
                },
                detectionTarget: 'canvas', // Where to detect events: 'canvas' or 'window'.
                interactionMode: 'grab', // Primary interaction mode: 'grab' (lines to cursor).
                lineLinkAlpha: 1, // Opacity for interaction lines (e.g., grab lines).
                eventHandlers: { // Specific event-triggered behaviors.
                    onClick: {
                        isEnabled: true,
                        interactionMode: 'push', // On click: 'push' (spawn particles) or 'remove'.
                        spawnCount: 4 // Number of particles to spawn/remove on click.
                    },
                    onViewportResize: { // Behavior when the browser window is resized.
                        isEnabled: true,
                        boundaryMode: 'wrap', // Particle boundary behavior: 'wrap' (teleport) or 'reflect' (bounce).
                        autoDensity: false, // Automatically adjust particle count based on canvas area.
                        densityArea: 800 // Reference area for density calculation.
                    }
                }
            },
            highDPI_enabled: false, // Flag to enable retina/high DPI display scaling.
            coreFunctions: { // Container for internal system methods.
                utilityModules: { // Sub-container for helper functions and vendor-like utilities.
                    interactionHelpers: {}
                }
            },
            animationFrameId: null, // Stores the ID returned by requestAnimationFrame for cancellation.
            isPaused: false // New flag to control animation loop pausing.
        };
    };

    /**
     * Recursively merges properties from a source configuration object into a target.
     * This provides a simplified deep merge for the system's configuration.
     * @param {object} targetObj - The object to receive merged properties.
     * @param {object} sourceObj - The object containing properties to merge.
     */
    const deepMergeConfig = (targetObj, sourceObj) => {
        for (const key in sourceObj) {
            if (Object.prototype.hasOwnProperty.call(sourceObj, key)) {
                if (typeof sourceObj[key] === 'object' && sourceObj[key] !== null && !Array.isArray(sourceObj[key]) && typeof targetObj[key] === 'object' && targetObj[key] !== null) {
                    // If both properties are objects, recurse for deep merging.
                    deepMergeConfig(targetObj[key], sourceObj[key]);
                } else {
                    // Otherwise, directly assign the source property to the target.
                    targetObj[key] = sourceObj[key];
                }
            }
        }
    };

    // Initialize the main system object with the default configuration.
    const systemCore = setupDefaultConfiguration();
    activeParticleSystem = systemCore; // Establish global reference for external control and internal cleanup.

    // Apply user-provided configurations, merging them deeply with the defaults.
    if (userConfig) {
        deepMergeConfig(systemCore, userConfig);
    }

    // Post-configuration processing: Convert hex colors to RGB for rendering efficiency.
    systemCore.particleSpecs.rgbColor = _hexToRgb(systemCore.particleSpecs.mainColor);
    systemCore.particleSpecs.connectionLines.rgbLineColor = _hexToRgb(systemCore.particleSpecs.connectionLines.lineColor);

    // High DPI / Retina display detection and scaling adjustments.
    if (systemCore.highDPI_enabled && window.devicePixelRatio > 1) {
        systemCore.display.pixelRatio = window.devicePixelRatio;
        systemCore.display.width *= systemCore.display.pixelRatio;
        systemCore.display.height *= systemCore.display.pixelRatio;
        // Scale relevant numeric parameters to maintain visual consistency on high DPI screens.
        systemCore.particleSpecs.motion.animationSpeed *= systemCore.display.pixelRatio;
        systemCore.particleSpecs.connectionLines.connectDistance *= systemCore.display.pixelRatio;
        systemCore.particleSpecs.connectionLines.lineWidth *= systemCore.display.pixelRatio;
        systemCore.interaction.pointer.distance *= systemCore.display.pixelRatio;
    }

    /* ---------- Display Management Functions ------------ */

    /**
     * Initializes the 2D rendering context for the canvas element.
     */
    systemCore.coreFunctions.initializeCanvas = function() {
        systemCore.display.renderContext = systemCore.display.elementRef.getContext('2d');
    };

    /**
     * Sets initial canvas dimensions and registers a resize event listener.
     * The listener ensures the canvas adapts to viewport changes.
     */
    systemCore.coreFunctions.updateCanvasDimensions = function() {
        systemCore.display.elementRef.width = systemCore.display.width;
        systemCore.display.elementRef.height = systemCore.display.height;

        const resizeHandler = () => {
            // Only proceed if the system is active and resize events are enabled.
            if (systemCore && systemCore.interaction.eventHandlers.onViewportResize.isEnabled) {
                // Update canvas dimensions based on parent container's size.
                systemCore.display.width = systemCore.display.elementRef.offsetWidth;
                systemCore.display.height = systemCore.display.elementRef.offsetHeight;

                // Adjust for high DPI if enabled.
                if (systemCore.highDPI_enabled) {
                    systemCore.display.width *= systemCore.display.pixelRatio;
                    systemCore.display.height *= systemCore.display.pixelRatio;
                }

                systemCore.display.elementRef.width = systemCore.display.width;
                systemCore.display.elementRef.height = systemCore.display.height;

                // Clear and redraw the canvas to reflect new dimensions.
                systemCore.coreFunctions.clearAndRedrawCanvas();

                // If particles are not actively animating, reset and recreate them.
                if (!systemCore.particleSpecs.motion.isActive) {
                    systemCore.coreFunctions.destroyParticles();
                    systemCore.coreFunctions.clearCanvas(); // Ensure a clean slate.
                    systemCore.coreFunctions.setupParticles(); // Recreate particles for static display.
                }

                // Adjust particle density if the auto-density feature is enabled.
                systemCore.coreFunctions.adjustParticleDensity();
            }
        };
        window.addEventListener('resize', resizeHandler);
        // Store the handler reference for proper removal during system destruction.
        systemCore.resizeHandler = resizeHandler;
    };

    /**
     * Automatically adjusts the number of particles based on the canvas area and configured density.
     * This helps maintain a consistent visual density across different screen sizes.
     */
    systemCore.coreFunctions.adjustParticleDensity = function() {
        if (systemCore.interaction.eventHandlers.onViewportResize.autoDensity) {
            // Calculate the current effective rendering area, accounting for pixel ratio.
            let currentArea = (systemCore.display.elementRef.width * systemCore.display.elementRef.height) / 1000;
            if (systemCore.highDPI_enabled) {
                currentArea = currentArea / (systemCore.display.pixelRatio * systemCore.display.pixelRatio);
            }

            // Determine the target particle count based on the density area.
            const targetParticleCount = Math.ceil(currentArea * systemCore.particleSpecs.count / systemCore.interaction.eventHandlers.onViewportResize.densityArea);

            // Calculate the difference from the current particle count.
            const particleDifference = systemCore.particleSpecs.particleInstances.length - targetParticleCount;

            // Add or remove particles as needed to reach the target count.
            if (particleDifference < 0) {
                systemCore.coreFunctions.utilityModules.interactionHelpers.addParticles(Math.abs(particleDifference));
            } else if (particleDifference > 0) {
                systemCore.coreFunctions.utilityModules.interactionHelpers.removeParticles(particleDifference);
            }
        }
    };

    /**
     * Fills the entire canvas with a solid color, effectively clearing and redrawing.
     */
    systemCore.coreFunctions.clearAndRedrawCanvas = function() {
        if (systemCore.display.renderContext) {
            systemCore.display.renderContext.fillRect(0, 0, systemCore.display.width, systemCore.display.height);
        }
    };

    /**
     * Clears the entire canvas area, making it transparent.
     */
    systemCore.coreFunctions.clearCanvas = function() {
        if (systemCore.display.renderContext) {
            systemCore.display.renderContext.clearRect(0, 0, systemCore.display.width, systemCore.display.height);
        }
    };

    /* --------- Particle Entity Definitions ----------- */

    /**
     * Constructor function for a single particle entity within the system.
     * Each particle has its own position, size, color, opacity, and velocity.
     * @param {object} baseColor - An RGB color object ({r, g, b}) for the particle.
     * @param {number} baseAlpha - The initial opacity value for the particle.
     * @param {object} [spawnPosition] - Optional initial x, y coordinates for particle spawning.
     */
    systemCore.coreFunctions.ParticleEntity = function(baseColor, baseAlpha, spawnPosition) {
        // Initialize particle position, either at a specific point or randomly across the canvas.
        this.x = spawnPosition ? spawnPosition.x : Math.random() * systemCore.display.width;
        this.y = spawnPosition ? spawnPosition.y : Math.random() * systemCore.display.height;

        // Determine particle size, applying randomness and high DPI scaling.
        this.currentRadius = (systemCore.particleSpecs.randomSize ? Math.random() : 1) * systemCore.particleSpecs.particleSize;
        if (systemCore.highDPI_enabled) {
            this.currentRadius *= systemCore.display.pixelRatio;
        }

        // Set particle color, either a fixed base color or a random RGB color.
        if (systemCore.particleSpecs.randomColor) {
            this.color = {
                r: _getRandomInt(0, 255),
                g: _getRandomInt(0, 255),
                b: _getRandomInt(0, 255)
            };
        } else {
            this.color = baseColor;
        }

        // Configure particle opacity and its animation properties.
        this.alpha = baseAlpha;
        if (systemCore.particleSpecs.alpha.animation.isActive) {
            this.alphaIncreasing = false; // Flag to track if opacity is currently increasing or decreasing.
            this.alphaVelocity = systemCore.particleSpecs.alpha.animation.animationSpeed / 100;
            // If not synchronized, each particle gets a slightly randomized opacity animation speed.
            if (!systemCore.particleSpecs.alpha.animation.isSynchronized) {
                this.alphaVelocity *= Math.random();
            }
        }

        // Assign initial random velocity components for particle movement.
        this.velocityX = -0.5 + Math.random();
        this.velocityY = -0.5 + Math.random();
    };

    /**
     * Prototype method to render a particle on the canvas.
     * Draws the particle based on its shape, position, size, color, and opacity.
     */
    systemCore.coreFunctions.ParticleEntity.prototype.render = function() {
        const ctx = systemCore.display.renderContext;
        if (!ctx) return; // Guard against an uninitialized rendering context.

        // Set the fill style using the particle's current color and alpha.
        ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.alpha})`;
        ctx.beginPath(); // Start a new path for drawing the particle.

        // Draw the particle based on the configured shape.
        switch (systemCore.particleSpecs.particleShape) {
            case 'circle':
                ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2, false);
                break;
            case 'edge': // Renders a square centered at the particle's position.
                ctx.rect(this.x - this.currentRadius, this.y - this.currentRadius, this.currentRadius * 2, this.currentRadius * 2);
                break;
            case 'triangle': // Renders an equilateral triangle.
                ctx.moveTo(this.x, this.y - this.currentRadius);
                ctx.lineTo(this.x + this.currentRadius, this.y + this.currentRadius);
                ctx.lineTo(this.x - this.currentRadius, this.y + this.currentRadius);
                ctx.closePath();
                break;
            default: // Fallback to drawing a circle if an unknown shape is specified.
                ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2, false);
                break;
        }

        ctx.fill(); // Fill the path to render the particle.
    };

    /**
     * Populates the particleInstances array with new ParticleEntity objects,
     * up to the configured particle count.
     */
    systemCore.coreFunctions.setupParticles = function() {
        for (let i = 0; i < systemCore.particleSpecs.count; i++) {
            systemCore.particleSpecs.particleInstances.push(
                new systemCore.coreFunctions.ParticleEntity(
                    systemCore.particleSpecs.rgbColor,
                    systemCore.particleSpecs.alpha.value
                )
            );
        }
    };

    /**
     * Updates the state of all particles, including their position, opacity,
     * and handles boundary interactions and inter-particle effects.
     */
    systemCore.coreFunctions.updateParticleStates = function() {
        const halfSpeed = systemCore.particleSpecs.motion.animationSpeed / 2; // Pre-calculate for efficiency.
        const boundaryMode = systemCore.interaction.eventHandlers.onViewportResize.boundaryMode;
        const minAlphaValue = systemCore.particleSpecs.alpha.animation.minAlpha;

        // Iterate through each particle to update its state.
        for (let i = 0; i < systemCore.particleSpecs.particleInstances.length; i++) {
            const currentParticle = systemCore.particleSpecs.particleInstances[i];

            // Update particle position based on its velocity and animation speed.
            currentParticle.x += currentParticle.velocityX * halfSpeed;
            currentParticle.y += currentParticle.velocityY * halfSpeed;

            // Update particle opacity if opacity animation is active.
            if (systemCore.particleSpecs.alpha.animation.isActive) {
                if (currentParticle.alphaIncreasing) {
                    if (currentParticle.alpha >= systemCore.particleSpecs.alpha.value) {
                        currentParticle.alphaIncreasing = false;
                    }
                    currentParticle.alpha += currentParticle.alphaVelocity;
                } else {
                    if (currentParticle.alpha <= minAlphaValue) {
                        currentParticle.alphaIncreasing = true;
                    }
                    currentParticle.alpha -= currentParticle.alphaVelocity;
                }
            }

            // Handle particle interaction with canvas boundaries based on configured mode.
            switch (boundaryMode) {
                case 'reflect': // Particles "bounce" off the edges.
                    if (currentParticle.x - currentParticle.currentRadius > systemCore.display.width || currentParticle.x + currentParticle.currentRadius < 0) {
                        currentParticle.velocityX *= -1;
                    }
                    if (currentParticle.y - currentParticle.currentRadius > systemCore.display.height || currentParticle.y + currentParticle.currentRadius < 0) {
                        currentParticle.velocityY *= -1;
                    }
                    break;
                case 'wrap': // Particles "wrap" around from one side to the other.
                    if (currentParticle.x - currentParticle.currentRadius > systemCore.display.width) {
                        currentParticle.x = currentParticle.currentRadius;
                    } else if (currentParticle.x + currentParticle.currentRadius < 0) {
                        currentParticle.x = systemCore.display.width + currentParticle.currentRadius;
                    }
                    if (currentParticle.y - currentParticle.currentRadius > systemCore.display.height) {
                        currentParticle.y = currentParticle.currentRadius;
                    } else if (currentParticle.y + currentParticle.currentRadius < 0) {
                        currentParticle.y = systemCore.display.height + currentParticle.currentRadius;
                    }
                    break;
                default:
                    // Default to wrap behavior if an unknown mode is specified.
                    if (currentParticle.x - currentParticle.currentRadius > systemCore.display.width) {
                        currentParticle.x = currentParticle.currentRadius;
                    } else if (currentParticle.x + currentParticle.currentRadius < 0) {
                        currentParticle.x = systemCore.display.width + currentParticle.currentRadius;
                    }
                    if (currentParticle.y - currentParticle.currentRadius > systemCore.display.height) {
                        currentParticle.y = currentParticle.currentRadius;
                    } else if (currentParticle.y + currentParticle.currentRadius < 0) {
                        currentParticle.y = systemCore.display.height + currentParticle.currentRadius;
                    }
                    break;
            }

            // Iterate through subsequent particles to check for inter-particle interactions and mouse interactions.
            for (let j = i + 1; j < systemCore.particleSpecs.particleInstances.length; j++) {
                const otherParticle = systemCore.particleSpecs.particleInstances[j];

                // Draw lines between particles if auto-connection is enabled.
                if (systemCore.particleSpecs.connectionLines.autoConnect) {
                    systemCore.coreFunctions.utilityModules.calculateAndDrawLine(currentParticle, otherParticle);
                }

                // Apply interactive effects if interaction is enabled and mode is 'grab'.
                if (systemCore.interaction.isEnabled && systemCore.interaction.interactionMode === 'grab') {
                    systemCore.coreFunctions.utilityModules.interactionHelpers.grabEffect(currentParticle); // Simplified to one particle, grabEffect will handle mouse separately.
                }
            }
        }
    };

    /**
     * Orchestrates the rendering of all particles for a single animation frame.
     * It clears the canvas, updates particle states, and then draws each particle.
     */
    systemCore.coreFunctions.renderAllParticles = function() {
        systemCore.coreFunctions.clearCanvas(); // Clear the entire canvas.
        systemCore.coreFunctions.updateParticleStates(); // Update positions and properties.

        // Draw each particle instance on the canvas.
        for (let i = 0; i < systemCore.particleSpecs.particleInstances.length; i++) {
            systemCore.particleSpecs.particleInstances[i].render();
        }
    };

    /**
     * Clears the array of particle instances, effectively removing all particles from the system.
     */
    systemCore.coreFunctions.destroyParticles = function() {
        systemCore.particleSpecs.particleInstances = [];
    };


    /* ---------- Utility Modules (Vendors) ------------ */

    /**
     * Calculates the distance between two particles and draws a connecting line if they are close enough.
     * Also applies the condensed mode effect if enabled.
     * @param {object} pA - The first particle object.
     * @param {object} pB - The second particle object.
     */
    systemCore.coreFunctions.utilityModules.calculateAndDrawLine = function(pA, pB) {
        const diffX = pA.x - pB.x;
        const diffY = pA.y - pB.y;
        const distanceBetween = Math.sqrt(diffX * diffX + diffY * diffY);

        // Draw a line only if the particles are within the specified connection distance.
        if (distanceBetween <= systemCore.particleSpecs.connectionLines.connectDistance) {
            const lineColorRgb = systemCore.particleSpecs.connectionLines.rgbLineColor;
            const ctx = systemCore.display.renderContext;

            if (!ctx) return; // Ensure context is available before drawing.

            ctx.beginPath();
            // Line opacity decreases with distance to create a fading effect.
            ctx.strokeStyle = `rgba(${lineColorRgb.r},${lineColorRgb.g},${lineColorRgb.b},${(systemCore.particleSpecs.connectionLines.lineAlpha - distanceBetween / systemCore.particleSpecs.connectionLines.connectDistance)})`;
            ctx.moveTo(pA.x, pA.y);
            ctx.lineTo(pB.x, pB.y);
            ctx.lineWidth = systemCore.particleSpecs.connectionLines.lineWidth;
            ctx.stroke();
            ctx.closePath();

            // Apply the "condensed mode" effect, which nudges particles towards each other.
            if (systemCore.particleSpecs.connectionLines.condenseEffect.isActive) {
                const accelX = diffX / (systemCore.particleSpecs.connectionLines.condenseEffect.rotationX * 1000);
                const accelY = diffY / (systemCore.particleSpecs.connectionLines.condenseEffect.rotationY * 1000);
                pB.velocityX += accelX;
                pB.velocityY += accelY;
            }
        }
    };

    /**
     * Sets up event listeners for pointer (mouse) interactions and click events.
     * These listeners track pointer position and trigger interactive behaviors.
     */
    systemCore.coreFunctions.utilityModules.interactionHelpers.setupEventListeners = function() {
        let eventSource = window; // Default target for events is the window.
        if (systemCore.interaction.detectionTarget === 'canvas') {
            eventSource = systemCore.display.elementRef; // Switch to canvas if specified.
        }

        // Handler for pointer movement events.
        const mouseMoveHandler = (e) => {
            if (!systemCore.interaction.isEnabled) return; // Skip if interactions are disabled.

            let cursorX, cursorY;
            if (eventSource === window) {
                cursorX = e.clientX;
                cursorY = e.clientY;
            } else {
                // Use offsetX/offsetY for canvas-relative coordinates, fallback to clientX/Y.
                cursorX = e.offsetX || e.clientX;
                cursorY = e.offsetY || e.clientY;
            }

            // Adjust cursor coordinates for high DPI screens.
            if (systemCore.highDPI_enabled) {
                cursorX *= systemCore.display.pixelRatio;
                cursorY *= systemCore.display.pixelRatio;
            }

            // Update the system's internal pointer position and state.
            systemCore.interaction.pointer.cursorX = cursorX;
            systemCore.interaction.pointer.cursorY = cursorY;
            systemCore.interaction.pointer.pointerState = 'mousemove';
        };

        // Handler for pointer leaving the detection area.
        const mouseLeaveHandler = () => {
            if (!systemCore.interaction.isEnabled) return;

            // Reset pointer position and state when it leaves.
            systemCore.interaction.pointer.cursorX = 0;
            systemCore.interaction.pointer.cursorY = 0;
            systemCore.interaction.pointer.pointerState = 'mouseleave';
        };

        // Register the event listeners.
        eventSource.addEventListener('mousemove', mouseMoveHandler);
        eventSource.addEventListener('mouseleave', mouseLeaveHandler);

        // Store references to the handlers and event source for proper cleanup.
        systemCore.mouseMoveHandler = mouseMoveHandler;
        systemCore.mouseLeaveHandler = mouseLeaveHandler;
        systemCore.eventSource = eventSource;

        // Setup click event handler if click interactions are enabled.
        if (systemCore.interaction.eventHandlers.onClick.isEnabled) {
            const clickMode = systemCore.interaction.eventHandlers.onClick.interactionMode;
            const clickHandler = (e) => {
                if (!systemCore.interaction.isEnabled) return;

                let clickX, clickY;
                if (eventSource === window) {
                    clickX = e.clientX;
                    clickY = e.clientY;
                } else {
                    clickX = e.offsetX || e.clientX;
                    clickY = e.offsetY || e.clientY;
                }

                if (systemCore.highDPI_enabled) {
                    clickX *= systemCore.display.pixelRatio;
                    clickY *= systemCore.display.pixelRatio;
                }

                // Execute action based on the configured click interaction mode.
                switch (clickMode) {
                    case 'push': // Spawn new particles at the click location.
                        systemCore.coreFunctions.utilityModules.interactionHelpers.addParticles(
                            systemCore.interaction.eventHandlers.onClick.spawnCount,
                            { x: clickX, y: clickY }
                        );
                        break;
                    case 'remove': // Remove particles near the click location.
                        systemCore.coreFunctions.utilityModules.interactionHelpers.removeParticlesNear(
                            systemCore.interaction.eventHandlers.onClick.spawnCount,
                            { x: clickX, y: clickY },
                            systemCore.interaction.pointer.distance / 2 // Define removal radius as half the grab distance.
                        );
                        break;
                    // Additional interactive click modes could be implemented here.
                }
            };
            eventSource.addEventListener('click', clickHandler);
            systemCore.clickHandler = clickHandler; // Store for cleanup.
        }
    };

    /**
     * Implements the "grab" effect, drawing lines from nearby particles to the pointer's position.
     * @param {object} particle - The particle object to check for interaction.
     */
    systemCore.coreFunctions.utilityModules.interactionHelpers.grabEffect = function(particle) {
        if (systemCore.interaction.pointer.pointerState === 'mousemove') {
            const pointerX = systemCore.interaction.pointer.cursorX;
            const pointerY = systemCore.interaction.pointer.cursorY;
            const grabDistance = systemCore.interaction.pointer.distance;

            // Calculate distance between the current particle and the pointer.
            const distToPointer = Math.sqrt(Math.pow(particle.x - pointerX, 2) + Math.pow(particle.y - pointerY, 2));

            // If the particle is within the grab distance, draw a line to the pointer.
            if (distToPointer <= grabDistance) {
                const lineColorRgb = systemCore.particleSpecs.connectionLines.rgbLineColor;
                const ctx = systemCore.display.renderContext;
                if (!ctx) return;

                ctx.beginPath();
                // Line opacity fades with distance to the pointer.
                ctx.strokeStyle = `rgba(${lineColorRgb.r},${lineColorRgb.g},${lineColorRgb.b},${(systemCore.interaction.lineLinkAlpha - distToPointer / grabDistance)})`;
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(pointerX, pointerY);
                ctx.lineWidth = systemCore.particleSpecs.connectionLines.lineWidth;
                ctx.stroke();
                ctx.closePath();
            }
        }
    };

    /**
     * Adds a specified number of new particles to the system.
     * @param {number} count - The number of particles to add.
     * @param {object} [position=null] - Optional x, y coordinates to spawn particles at.
     */
    systemCore.coreFunctions.utilityModules.interactionHelpers.addParticles = function(count, position = null) {
        for (let i = 0; i < count; i++) {
            systemCore.particleSpecs.particleInstances.push(
                new systemCore.coreFunctions.ParticleEntity(
                    systemCore.particleSpecs.rgbColor,
                    systemCore.particleSpecs.alpha.value,
                    position
                )
            );
        }
    };

    /**
     * Removes a specified number of particles from the beginning of the particle array.
     * @param {number} count - The number of particles to remove.
     */
    systemCore.coreFunctions.utilityModules.interactionHelpers.removeParticles = function(count) {
        systemCore.particleSpecs.particleInstances.splice(0, count);
    };

    /**
     * Removes a specified number of particles that are closest to a given point.
     * This is a new utility function added as part of Type III cloning.
     * @param {number} count - The maximum number of particles to remove.
     * @param {object} point - The {x, y} coordinates to remove particles around.
     * @param {number} radius - Particles within this radius of the point are considered for removal.
     */
    systemCore.coreFunctions.utilityModules.interactionHelpers.removeParticlesNear = function(count, point, radius) {
        let removedCount = 0;
        const particlesToKeep = [];

        // Iterate through particles, adding those outside the removal radius to a new array,
        // or skipping those inside if the removal count hasn't been met.
        for (let i = 0; i < systemCore.particleSpecs.particleInstances.length; i++) {
            const particle = systemCore.particleSpecs.particleInstances[i];
            const dist = Math.sqrt(Math.pow(particle.x - point.x, 2) + Math.pow(particle.y - point.y, 2));

            if (dist <= radius && removedCount < count) {
                removedCount++; // Increment count for removed particles.
            } else {
                particlesToKeep.push(particle); // Keep this particle.
            }
        }
        systemCore.particleSpecs.particleInstances = particlesToKeep; // Update the particle array.
    };


    /* ---------- Main Animation Loop ------------ */

    /**
     * The core animation loop function.
     * It continuously updates and renders the particle system, scheduling itself for the next frame.
     * Includes a guard clause for pausing the animation.
     */
    const animationTick = function() {
        if (systemCore.isPaused) {
            // If paused, still request the next frame to allow for unpausing without a full restart.
            systemCore.animationFrameId = _requestAnimFrame(animationTick);
            return;
        }

        systemCore.coreFunctions.renderAllParticles(); // Perform all rendering operations.
        systemCore.animationFrameId = _requestAnimFrame(animationTick); // Request the next animation frame.
    };

    /**
     * Initializes and starts the entire particle system, including canvas setup,
     * particle creation, event listeners, and the animation loop.
     */
    systemCore.coreFunctions.startSystem = function() {
        systemCore.coreFunctions.initializeCanvas();
        systemCore.coreFunctions.updateCanvasDimensions();
        systemCore.coreFunctions.setupParticles();
        systemCore.coreFunctions.utilityModules.interactionHelpers.setupEventListeners();
        systemCore.coreFunctions.adjustParticleDensity(); // Initial particle density adjustment.
        systemCore.animationFrameId = _requestAnimFrame(animationTick); // Begin the animation loop.
    };

    /**
     * Pauses the particle system animation. The animation loop continues to request frames
     * but skips rendering, allowing for a smooth resume.
     */
    systemCore.coreFunctions.pauseSystem = function() {
        systemCore.isPaused = true;
        console.log("Particle system paused.");
    };

    /**
     * Resumes the particle system animation if it was previously paused.
     */
    systemCore.coreFunctions.resumeSystem = function() {
        if (systemCore.isPaused) {
            systemCore.isPaused = false;
            console.log("Particle system resumed.");
        }
    };

    /**
     * Completely destroys the particle system: cancels animation, clears canvas,
     * removes all particles, and cleans up all event listeners.
     */
    systemCore.coreFunctions.destroySystem = function() {
        _cancelAnimFrame(systemCore.animationFrameId); // Stop the animation loop.
        systemCore.coreFunctions.clearCanvas(); // Clear any remaining drawings.
        systemCore.coreFunctions.destroyParticles(); // Remove all particle instances.

        // Remove all registered event listeners to prevent memory leaks.
        if (systemCore.eventSource) {
            if (systemCore.mouseMoveHandler) systemCore.eventSource.removeEventListener('mousemove', systemCore.mouseMoveHandler);
            if (systemCore.mouseLeaveHandler) systemCore.eventSource.removeEventListener('mouseleave', systemCore.mouseLeaveHandler);
            if (systemCore.clickHandler) systemCore.eventSource.removeEventListener('click', systemCore.clickHandler);
        }
        if (systemCore.resizeHandler) {
            window.removeEventListener('resize', systemCore.resizeHandler);
        }

        // Clear the global reference to this system.
        activeParticleSystem = null;
        console.log("Particle system destroyed.");
    };

    // Initiate the particle system upon creation.
    systemCore.coreFunctions.startSystem();

    // Return a public API to control the particle system externally.
    return {
        pause: systemCore.coreFunctions.pauseSystem,
        resume: systemCore.coreFunctions.resumeSystem,
        destroy: systemCore.coreFunctions.destroySystem,
        // For advanced debugging or external modifications, the entire systemCore can be exposed.
        // _internalSystem: systemCore
    };
}