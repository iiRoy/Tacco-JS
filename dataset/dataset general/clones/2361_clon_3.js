;(function (extLib) {
    'use strict';

    // This module provides a mechanism for deferring the loading of video embeds
    // until a user interaction occurs. It targets specific container elements
    // and transforms them into interactive video placeholders.
    // Module Version: 2.0.0
    // Date: 2023-10-27
    // License: Unspecified, derived from original.
    // Usage: Initialize on a jQuery selection, e.g., $('.video-placeholder').videoLazyLoader();
    // Container requirements: Class 'video-placeholder', data-vid-id (YouTube video ID),
    // optional data-vid-width, data-vid-height, data-vid-ratio, data-vid-config (YouTube URL parameters).

    // Ensure the external library (jQuery in this context) is available.
    if (!extLib || typeof extLib.fn === 'undefined') {
        console.error('Critical dependency (jQuery) not detected. Video embed module cannot function.');
        return;
    }

    // Helper utility to construct the SVG markup for the play button icon.
    // This encapsulates a complex string, making the main logic cleaner.
    function generatePlayButtonSvg(scaleOption) {
        let svgElements = [];
        let transformCss = scaleOption ? ` style="transform: scale(${scaleOption});"` : '';

        svgElements.push(`<div class="video-play-icon"${transformCss}>`);
        svgElements.push('<svg viewBox="0 0 84.15 59.15">');
        svgElements.push('<path fill-rule="evenodd" clip-rule="evenodd" fill="#1F1F1F" d="M84.15,26.4v6.35c0,2.833-0.15,5.967-0.45,9.4c-0.133,1.7-0.267,3.117-0.4,4.25l-0.15,0.95c-0.167,0.767-0.367,1.517-0.6,2.25c-0.667,2.367-1.533,4.083-2.6,5.15c-1.367,1.4-2.967,2.383-4.8,2.95c-0.633,0.2-1.316,0.333-2.05,0.4c-0.767,0.1-1.3,0.167-1.6,0.2c-4.9,0.367-11.283,0.617-19.15,0.75c-2.434,0.034-4.883,0.067-7.35,0.1h-2.95C38.417,59.117,34.5,59.067,30.3,59c-8.433-0.167-14.05-0.383-16.85-0.65c-0.067-0.033-0.667-0.117-1.8-0.25c-0.9-0.133-1.683-0.283-2.35-0.45c-2.066-0.533-3.783-1.5-5.15-2.9c-1.033-1.067-1.9-2.783-2.6-5.15C1.317,48.867,1.133,48.117,1,47.35L0.8,46.4c-0.133-1.133-0.267-2.55-0.4-4.25C0.133,38.717,0,35.583,0,32.75V26.4c0-2.833,0.133-5.95,0.4-9.35l0.4-4.25c0.167-0.966,0.417-2.05,0.75-3.25c0.7-2.333,1.567-4.033,2.6-5.1c1.367-1.434,2.967-2.434,4.8-3c0.633-0.167,1.333-0.3,2.1-0.4c0.4-0.066,0.917-0.133,1.55-0.2c4.9-0.333,11.283-0.567,19.15-0.7C35.65,0.05,39.083,0,42.05,0L45,0.05c2.467,0,4.933,0.034,7.4,0.1c7.833,0.133,14.2,0.367,19.1,0.7c0.3,0.033,0.833,0.1,1.6,0.2c0.733,0.1,1.417,0.233,2.05,0.4c1.833,0.566,3.434,1.566,4.8,3c1.066,1.066,1.933,2.767,2.6,5.1c0.367,1.2,0.617,2.284,0.75,3.25l0.4,4.25C84,20.45,84.15,23.567,84.15,26.4z M33.3,41.4L56,29.6L33.3,17.75V41.4z"></path>');
        svgElements.push('<polygon fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" points="33.3,41.4 33.3,17.75 56,29.6"></polygon>');
        svgElements.push('</svg>');
        svgElements.push('</div>'); // Close .video-play-icon
        return svgElements.join('');
    }

    // Core function to process and initialize an individual video container.
    function configureVideoEmbed($currentElement, embedConfiguration) {
        // Extract necessary data attributes, providing fallbacks where appropriate.
        let targetWidth = parseFloat($currentElement.data('vid-width')) || 0;
        let targetHeight = parseFloat($currentElement.data('vid-height')) || 0;
        let videoIdentifier = $currentElement.data('vid-id');
        let aspectRatioValue = $currentElement.data('vid-ratio') || embedConfiguration.defaultAspect;
        let youtubeQueryString = $currentElement.data('vid-config') || '';

        // Essential validation: A video ID must be present.
        if (!videoIdentifier) {
            console.warn('Skipping video embed: Missing "data-vid-id" attribute on element:', $currentElement[0]);
            return;
        }

        let ratioComponents = aspectRatioValue.split(":").map(Number);
        // Validate ratio components; default to standard if invalid.
        if (ratioComponents.length !== 2 || isNaN(ratioComponents[0]) || isNaN(ratioComponents[1]) || ratioComponents[0] === 0) {
            console.warn('Invalid aspect ratio format, reverting to default:', aspectRatioValue, 'on element:', $currentElement[0]);
            ratioComponents = embedConfiguration.defaultAspect.split(":").map(Number);
        }

        let containerBottomPadding; // This will hold the CSS 'padding-bottom' value.

        // Determine the dimensions and calculate the responsive padding.
        if (targetWidth > 0 && targetHeight > 0) {
            $currentElement.css('width', targetWidth + 'px');
            containerBottomPadding = targetHeight + 'px';
        } else if (targetWidth > 0) {
            $currentElement.css('width', targetWidth + 'px');
            containerBottomPadding = (targetWidth * ratioComponents[1] / ratioComponents[0]) + 'px';
        } else {
            // Assume fluid width: calculate padding as a percentage of the width.
            // If the element itself has 0 width, try its parent. This is a heuristic for fluid layouts.
            let elementActualWidth = $currentElement.width();
            if (elementActualWidth === 0 && $currentElement.parent().length) {
                elementActualWidth = $currentElement.parent().width();
            }
            containerBottomPadding = (ratioComponents[1] / ratioComponents[0] * 100) + '%';
        }

        // Construct the initial HTML markup for the placeholder state.
        let placeholderHtml = `
            <div class="video-thumbnail-view">
                ${generatePlayButtonSvg()}
            </div>
            <div class="video-title-overlay">
                <span class="video-title-display">${$currentElement.text().trim() || embedConfiguration.placeholderText}</span>
            </div>
        `;

        // Apply calculated padding and inject the placeholder HTML.
        $currentElement.css({
            'padding-bottom': containerBottomPadding
        }).html(placeholderHtml);

        // Determine the most suitable thumbnail image based on the container's current width.
        const youtubeThumbnailBase = `http://img.youtube.com/vi/${videoIdentifier}/`;
        let selectedThumbnail = 'hqdefault.jpg'; // Sensible default

        const thumbnailQualityMap = [
            { minWidth: 641, fileName: 'maxresdefault.jpg' },
            { minWidth: 481, fileName: 'sddefault.jpg' },
            { minWidth: 321, fileName: 'hqdefault.jpg' },
            { minWidth: 121, fileName: 'mqdefault.jpg' }
        ];

        let finalElementWidth = $currentElement.width(); // Get width after CSS application.

        // Iterate through the quality map to find the best match.
        for (const quality of thumbnailQualityMap) {
            if (finalElementWidth >= quality.minWidth) {
                selectedThumbnail = quality.fileName;
                break;
            }
        }
        // Specific case for very small embeds, if not caught by the above.
        if (finalElementWidth > 0 && finalElementWidth <= 120) {
            selectedThumbnail = 'default.jpg';
        }
        // If finalElementWidth is 0 (e.g., element not yet rendered or hidden), hqdefault is a reasonable fallback.

        let $thumbnailDisplay = $currentElement.find('.video-thumbnail-view');
        $thumbnailDisplay.css({
            'background-image': `url(${youtubeThumbnailBase}${selectedThumbnail})`
        }).addClass('thumbnail-loaded')
          .on('click', function (evt) {
            evt.preventDefault();
            // Only load the video if it hasn't been loaded yet and the thumbnail is ready.
            if (!$currentElement.hasClass('video-active-embed') && $thumbnailDisplay.hasClass('thumbnail-loaded')) {
                // Construct and embed the YouTube iframe.
                let videoFrame = extLib('<iframe>', {
                    src: `//www.youtube.com/embed/${videoIdentifier}?autoplay=1&${youtubeQueryString}`,
                    frameborder: '0',
                    allowfullscreen: 'allowfullscreen', // HTML5 attribute for fullscreen capability.
                    loading: 'lazy' // Modern browser lazy loading hint.
                });
                $currentElement.empty().append(videoFrame).addClass('video-active-embed');
            }
          });

        // The original implementation included a call to a deprecated YouTube API to fetch video titles.
        // This functionality has been removed in this Type III clone to simplify the code,
        // reduce external dependencies, and avoid using non-functional APIs.
        // The placeholder text will remain as the default title.
    }

    // Attach the plugin to the external library (jQuery).
    extLib.fn.videoLazyLoader = function (userOptions) {
        // Establish default configuration settings for the video loader.
        const moduleDefaults = {
            placeholderText: 'Loading Video Content...',
            defaultAspect: '16:9', // Standard aspect ratio.
            wrapperCssClass: 'video-embed-container' // Class applied to processed elements.
        };
        // Merge user-provided options with the defaults.
        const activeConfiguration = extLib.extend({}, moduleDefaults, userOptions);

        // Iterate over each selected DOM element and apply the video loader logic.
        return this.each(function () {
            const $targetElement = extLib(this).addClass(activeConfiguration.wrapperCssClass);
            configureVideoEmbed($targetElement, activeConfiguration);
        });
    };

}(jQuery));