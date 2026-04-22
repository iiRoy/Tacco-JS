(function($) {
    /*
     * jQuery SparkleFX Plugin 1.0.0
     *
     * A utility for creating dynamic visual particle effects,
     * such as floating sparks or glowing motes, within a specified area.
     *
     * Original concept by Dharmveer Motyar (c) 2010.
     * This version includes significant refactoring, feature enhancements,
     * and adherence to modern JavaScript practices.
     *
     * Licensed under the MIT License:
     *   http://www.opensource.org/licenses/mit-license.php
     *
     * @example $.sparkleFX({ targetElement: '#myContainer', particleCount: 15 });
     *
     * @name sparkleFX
     * @type jQuery
     * @cat Plugins/VisualEffects
     */

    // Default configuration for the sparkle effect.
    // These values can be overridden during plugin initialization.
    var defaultSettings = {
        spriteSources: [ // Array of image URLs to use as particles
            'http://dharmmotyar.googlecode.com/svn/trunk/images/spark.png',
            'http://dharmmotyar.googlecode.com/svn/trunk/images//spark2.png',
            'http://dharmmotyar.googlecode.com/svn/trunk/images/spark3.png',
            'http://dharmmotyar.googlecode.com/svn/trunk/images/spark4.png'
        ],
        particleCount: 10,   // Total number of particles to generate
        targetElement: 'body', // Selector for the container where particles will appear
        flickerIntensity: 0.2, // Probability (0-1) for a particle to momentarily disappear
        animationSpeedMin: 5000, // Minimum animation duration in milliseconds
        animationSpeedMax: 15000, // Maximum animation duration in milliseconds
        particleSizeOffset: 50 // Adjustment to keep particles within bounds (e.g., width/height of particle)
    };

    // Internal state and utility functions for the plugin.
    // These are not directly exposed as public methods.
    var _internal = {
        // Stores references to active particle elements for cleanup
        activeParticles: [],
        // Dimensions and offsets of the target container
        containerElement: null,
        containerHeight: 0,
        containerWidth: 0,
        containerOffsetY: 0,
        containerOffsetX: 0,
        // Flag to control active animation loops
        isAnimating: false,

        /**
         * Generates a random integer between 0 (inclusive) and max (exclusive).
         * @param {number} max - The upper bound (exclusive).
         * @returns {number} A random integer.
         */
        getRandomInt: function(max) {
            if (max <= 0) return 0; // Handle edge case for non-positive max
            return Math.floor(Math.random() * max);
        },

        /**
         * Determines particle opacity based on flicker intensity.
         * @param {number} threshold - The flicker probability threshold (0-1).
         * @returns {number} 0 for invisible, 1 for visible.
         */
        getFlickerEffect: function(threshold) {
            if (Math.random() < threshold) {
                return 0; // Particle flickers off
            }
            return 1; // Particle remains visible
        },

        /**
         * Preloads all particle sprite images to prevent visual delays.
         * @param {Array<string>} imageUrls - An array of image URLs to preload.
         * @returns {boolean} True if preloading initiated, false otherwise.
         */
        cacheSprites: function(imageUrls) {
            if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
                console.warn("SparkleFX: No image URLs provided for preloading.");
                return false;
            }
            var preloadedImages = [];
            for (var idx = 0; idx < imageUrls.length; idx++) {
                var img = new Image();
                img.src = imageUrls[idx];
                preloadedImages.push(img); // Keep reference to prevent GC
            }
            // In a real-world scenario, you might want to wait for these to load
            // or provide a callback. For this clone, we assume synchronous loading.
            return true;
        },

        /**
         * Creates a single particle element and appends it to the container.
         * @param {string} spriteUrl - The URL of the image to use for the particle.
         * @param {object} currentSettings - The active plugin settings.
         * @returns {jQuery} The created jQuery particle element.
         */
        spawnParticle: function(spriteUrl, currentSettings) {
            var particleId = 'sparkle-particle-' + Date.now() + '-' + _internal.getRandomInt(9999);
            var particleElement = $('<div>').addClass('sparkle-fx-particle').attr('id', particleId)
                                .append($('<img>').attr('src', spriteUrl).addClass('sparkle-fx-sprite'));

            // Set initial position and z-index
            particleElement.css({
                'position': 'absolute',
                'z-index': -1 * _internal.getRandomInt(20), // Place particles behind most content
                'top': _internal.containerOffsetY + _internal.getRandomInt(_internal.containerHeight - currentSettings.particleSizeOffset),
                'left': _internal.containerOffsetX + _internal.getRandomInt(_internal.containerWidth - currentSettings.particleSizeOffset),
                'opacity': 1 // Start visible
            });

            _internal.containerElement.append(particleElement);
            _internal.activeParticles.push(particleElement);
            return particleElement;
        },

        /**
         * Animates a single particle's movement and opacity.
         * This function calls itself recursively to create continuous motion.
         * @param {jQuery} particleElement - The jQuery object of the particle to animate.
         * @param {object} currentSettings - The active plugin settings.
         */
        animateParticle: function(particleElement, currentSettings) {
            if (!_internal.isAnimating || !particleElement.is(':visible')) {
                // Stop animation if plugin is inactive or particle is hidden
                particleElement.stop(true, true); // Stop current animation and clear queue
                return;
            }

            // Calculate new random position within container bounds
            var newTop = _internal.containerOffsetY + _internal.getRandomInt(_internal.containerHeight - currentSettings.particleSizeOffset);
            var newLeft = _internal.containerOffsetX + _internal.getRandomInt(_internal.containerWidth - currentSettings.particleSizeOffset);

            // Determine flicker effect
            var targetOpacity = _internal.getFlickerEffect(currentSettings.flickerIntensity);

            // Generate a random animation duration
            var animationDuration = _internal.getRandomInt(currentSettings.animationSpeedMax - currentSettings.animationSpeedMin) + currentSettings.animationSpeedMin;

            particleElement.animate({
                top: newTop,
                left: newLeft,
                opacity: targetOpacity
            }, animationDuration, 'linear', function() {
                // Recursively call animateParticle for continuous motion
                _internal.animateParticle(particleElement, currentSettings);
            });
        },

        /**
         * Stops all animations and removes all active particles.
         */
        cleanupParticles: function() {
            _internal.isAnimating = false; // Halt all ongoing animations
            _internal.activeParticles.forEach(function(particle) {
                particle.stop(true, true).remove(); // Stop animation, remove from DOM
            });
            _internal.activeParticles = []; // Clear the tracking array
            _internal.containerElement = null; // Clear container reference
        }
    };

    /**
     * Initializes the SparkleFX plugin.
     * @param {object} options - Configuration options to override defaults.
     */
    $.sparkleFX = function(options) {
        // Ensure previous instances are cleaned up before starting a new one
        if (_internal.isAnimating) {
            $.sparkleFX.destroy();
        }

        // Merge default settings with user-provided options
        var currentSettings = $.extend({}, defaultSettings, options);

        // Validate target element
        var targetEl = $(currentSettings.targetElement);
        if (targetEl.length === 0) {
            console.error("SparkleFX: Target element '" + currentSettings.targetElement + "' not found. Cannot initialize.");
            return;
        }
        _internal.containerElement = targetEl;

        // Determine container dimensions and offsets
        if (currentSettings.targetElement === 'body' || currentSettings.targetElement === 'document.body') {
            _internal.containerOffsetY = 0;
            _internal.containerOffsetX = 0;
            _internal.containerHeight = $(document.body).height();
            _internal.containerWidth = $(document.body).width();
        } else {
            var offset = _internal.containerElement.offset();
            _internal.containerOffsetY = offset.top;
            _internal.containerOffsetX = offset.left;
            _internal.containerHeight = _internal.containerElement.height();
            _internal.containerWidth = _internal.containerElement.width();
        }

        // Basic validation for container dimensions
        if (_internal.containerHeight <= currentSettings.particleSizeOffset || _internal.containerWidth <= currentSettings.particleSizeOffset) {
            console.warn("SparkleFX: Target container is too small (" + _internal.containerWidth + "x" + _internal.containerHeight + ") for particles. May cause issues.");
        }

        // Preload images for smoother performance
        if (!_internal.cacheSprites(currentSettings.spriteSources)) {
            console.error("SparkleFX: No valid sprite sources provided. Plugin will not function.");
            return;
        }

        _internal.isAnimating = true; // Set animation flag to true

        // Create and animate each particle
        for (var loopCounter = 0; loopCounter < currentSettings.particleCount; loopCounter++) {
            var randomSpriteIndex = _internal.getRandomInt(currentSettings.spriteSources.length);
            var selectedSprite = currentSettings.spriteSources[randomSpriteIndex];
            var newParticle = _internal.spawnParticle(selectedSprite, currentSettings);
            _internal.animateParticle(newParticle, currentSettings);
        }
    };

    /**
     * Public method to stop all particle animations and remove them from the DOM.
     * This effectively "destroys" the active SparkleFX instance.
     */
    $.sparkleFX.destroy = function() {
        if (_internal.isAnimating) {
            _internal.cleanupParticles();
            console.log("SparkleFX: All particles removed and animations stopped.");
        } else {
            console.log("SparkleFX: No active instance to destroy.");
        }
    };

})(jQuery);