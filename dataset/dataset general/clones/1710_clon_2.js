/*
 * jQuery lumina effect 0.2_alpha
 *
 * This plugin creates a dynamic light emission effect.
 *
 * Copyright (c) 2010 Motyar, D.
 * Blog: http://motyar.blogspot.com
 *
 * Version: $Revision: 1.0.1 $
 *
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Example usage: jq.lumina();
 *
 * @pluginName lumina
 * @type jQueryExtension
 * @category Effects
 */
(function(jq) {
    // These are the initial configuration values for the lumina effect.
    var initialSettings = {
        graphicSources: [
            'http://dharmmotyar.googlecode.com/svn/trunk/images/spark.png',
            'http://dharmmotyar.googlecode.com/svn/trunk/images//spark2.png',
            'http://dharmmotyar.googlecode.com/svn/trunk/images/spark3.png',
            'http://dharmmotyar.googlecode.com/svn/trunk/images/spark4.png'
        ],
        count: 10, // Total number of light particles to display
        verticalShift: 0, // Vertical adjustment for particle placement
        horizontalShift: 0, // Horizontal adjustment for particle placement
        containerSelector: 'document.body', // The element where particles will appear
        flickerIntensity: 0.2 // A value indicating how often particles might become invisible
    };

    /**
     * Initializes the lumina particle effect.
     * @param {Object} customParameters - User-defined settings to override defaults.
     */
    jq.lumina = function(customParameters) {
        jq.lumina.currentOptions = jq.extend({}, initialSettings, customParameters);

        // Determine the dimensions of the particle container.
        jq.lumina.containerHeight = jq(jq.lumina.currentOptions.containerSelector).height();
        jq.lumina.containerWidth = jq(jq.lumina.currentOptions.containerSelector).width();

        // Check if the target is the document body or a specific element.
        if (jq.lumina.currentOptions.containerSelector !== 'document.body') {
            var offsetData = jq(jq.lumina.currentOptions.containerSelector).offset();
            jq.lumina.yPosOffset = offsetData.top;
            jq.lumina.xPosOffset = offsetData.left;
            jq.lumina.containerHeight = jq(jq.lumina.currentOptions.containerSelector).height();
            jq.lumina.containerWidth = jq(jq.lumina.currentOptions.containerSelector).width();
        } else {
            jq.lumina.yPosOffset = 0;
            jq.lumina.xPosOffset = 0;
            jq.lumina.containerHeight = jq(document.body).height();
            jq.lumina.containerWidth = jq(document.body).width();
        }

        // Preload graphic assets and then generate and animate particles.
        if (jq.lumina.cacheGraphics()) {
            for (var idx = 0; idx < jq.lumina.currentOptions.count; idx++) {
                var imagePath = jq.lumina.currentOptions.graphicSources[jq.lumina.getRandomValue((jq.lumina.currentOptions.graphicSources).length)];
                var newParticle = jq.lumina.generateParticle(imagePath);
                jq.lumina.animateParticle(newParticle);
            }
        }
        return; // The function completes after initialization.
    };

    /**
     * Creates and positions a single light particle element.
     * @param {string} graphicPath - The URL of the image to use for the particle.
     * @returns {jQuery} The newly created jQuery element representing the particle.
     */
    jq.lumina.generateParticle = function(graphicPath) {
        var particleElement = jq('<img>').attr({
            'src': graphicPath
        }).hide();

        // Append the particle to the appropriate container.
        if (jq.lumina.currentOptions.containerSelector === 'document.body') {
            jq(document.body).append(particleElement);
        } else {
            jq(jq.lumina.currentOptions.containerSelector).append(particleElement);
        }

        // Apply initial styling and positioning, then display.
        return particleElement.css({
            'position': 'absolute',
            'z-index': -1 * jq.lumina.getRandomValue(20), // Place behind content
            top: jq.lumina.yPosOffset + jq.lumina.getRandomValue((jq.lumina.containerHeight - 50)), // Random vertical position
            left: jq.lumina.xPosOffset + jq.lumina.getRandomValue((jq.lumina.containerWidth - 50)) // Random horizontal position
        }).show();
    };


    /**
     * Animates a given particle element, making it move and flicker.
     * @param {jQuery} particle - The jQuery element of the particle to animate.
     */
    jq.lumina.animateParticle = function(particle) {
        jq(particle).animate({
            top: jq.lumina.yPosOffset + jq.lumina.getRandomValue((jq.lumina.containerHeight - 50)),
            left: jq.lumina.xPosOffset + jq.lumina.getRandomValue((jq.lumina.containerWidth - 50)),
            opacity: jq.lumina.calculateTransparency(jq.lumina.currentOptions.flickerIntensity)
        }, (jq.lumina.getRandomValue(10) + 5) * 2000, function() {
            jq.lumina.animateParticle(particle);
        });
    };

    /**
     * Halts the animation of a specific particle.
     * @param {jQuery} particleRef - The jQuery element of the particle to stop.
     */
    jq.lumina.haltParticle = function(particleRef) {
        jq(particleRef).stop();
    };

    /**
     * Preloads all the particle images into memory.
     * @returns {boolean} Always returns true after attempting to preload.
     */
    jq.lumina.cacheGraphics = function() {
        var imageCache = {}; // Using an object for preloads.
        for (var indexNum = 0; indexNum < (jq.lumina.currentOptions.graphicSources).length; indexNum++) {
            imageCache[indexNum] = new Image();
            imageCache[indexNum].src = jq.lumina.currentOptions.graphicSources[indexNum];
        }
        return true;
    };

    /**
     * Generates a random integer between 0 (inclusive) and upperBound (exclusive).
     * @param {number} upperBound - The maximum value (exclusive) for the random number.
     * @returns {number} A random integer.
     */
    jq.lumina.getRandomValue = function(upperBound) {
        return Math.ceil(Math.random() * upperBound) - 1;
    };

    /**
     * Determines the transparency level of a particle based on a flicker threshold.
     * @param {number} threshold - The minimum random value required for full visibility.
     * @returns {number} Either 0.0 (invisible) or 1.0 (fully visible).
     */
    jq.lumina.calculateTransparency = function(threshold) {
        var transparencyLevel = Math.random();
        if (transparencyLevel < threshold) {
            return 0.0; // Data type change: from int to float
        } else {
            return 1.0; // Data type change: from int to float
        }
    };
})(jQuery);