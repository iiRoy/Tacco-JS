/*
 * Zoomy v2.0.0 jQuery Plugin
 * Enhanced image zooming capabilities.
 * Project Website: http://zoomy.me
 *
 * Copyright (c) 2012 Jacob Lowe (http://redeyeoperations.com)
 * License: MIT (http://opensource.org/licenses/MIT)
 *
 * Built upon the jQuery library: http://jquery.com
 *
 * Significant refactoring, bug fixes, and logic corrections
 * by Larry Battle (blarry@bateru.com).
 *
 */


(function($) {
    // ZoomyS object stores data for each Zoomy instance.
    'use strict'; // Enforce strict mode for cleaner code.
    var ZoomyS = {
        count: [], // Tracks the number of Zoomy instances.
        pos: null // Stores position data, reset per interaction.
    };

    /**
     * @method zoomy - jQuery plugin entry point for Zoomy.
     * @param {string} event - The DOM event that triggers Zoomy (e.g., 'click', 'mouseover').
     * @param {object} options - Configuration settings for the Zoomy instance.
     */
    $.fn.zoomy = function (event, options) {

        // Default settings, overridden by user-provided options.
        var defaults = {
                zoomSize: 200, // Size of the zoom lens (width and height).
                round: true, // Make the zoom lens circular.
                glare: true, // Show a glare effect on the lens.
                clickable: false, // Make the zoomed image clickable.
                attr: 'href', // HTML attribute containing the large image URL.
                border: '5px solid #999', // CSS border for the zoom lens.
                zoomInit: null, // Callback function when Zoomy initializes.
                zoomStart: null, // Callback function when zooming begins.
                zoomStop: null, // Callback function when zooming ends.
                fixed: false, // If true, Zoomy lens stays at a fixed position.
                fixedX: 0, // X-coordinate for fixed Zoomy lens.
                fixedY: 0 // Y-coordinate for fixed Zoomy lens.
            },

            // Feature detection for touch devices.
            touch = (('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch)) ? true : false,

            // Detect CSS transform support for smoother animations.
            cssTranforms = (function () {
                var b = document.body || document.documentElement,
                    s = b.style,
                    p = 'transition',
                    v; // Vendor prefix variable.

                // Check for standard property.
                if (typeof s[p] === 'string') {
                    return true;
                }

                // Check for vendor-prefixed properties.
                v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
                p = p.charAt(0).toUpperCase() + p.substr(1);
                for (var i = 0; i < v.length; i++) {
                    if (typeof s[v[i] + p] === 'string') {
                        return true;
                    }
                }
                return false; // No transform support found.
            }()),

            // Determine the default event based on touch support.
            defaultEvent = (touch) ? 'touchstart' : 'click',


            /*
             * @object utils - A collection of utility functions for Zoomy calculations.
             *
             * @property {object} pos - Position calculation utilities.
             * @method stop - Calculates collision stop points.
             *   @param {number} x - Thumbnail image position.
             *   @param {number} z - Size of the zoom element.
             *   @param {number} o - Border offset size.
             *   @param {number} s - Position of the stop point.
             *
             * @method mouse - Calculates mouse position relative to the image.
             *   @param {number} x - Page offset X.
             *   @param {number} y - Thumbnail offset Y.
             *   @param {number} h - Half the zoom element size.
             *
             * @method zoom - Calculates the position of the Zoomy element.
             *   @param {number} x - Page offset X.
             *   @param {number} y - Element position Y.
             *   @param {number} z - Zoom ratio.
             *   @param {number} h - Half the zoom element size.
             *   @param {number} o - Border offset size.
             *
             * @method css - Compiles a CSS object for element styling.
             * @method ratio - Calculates aspect ratio.
             * @method setParams - Sets up dynamic parameters for a zoom instance.
             */
            utils = {
                pos: {
                    stop: function (x, z, o, s) {
                        return (x - z - o) + s;
                    },
                    mouse: function (x, y, h) {
                        return x - y - h;
                    },
                    zoom: function (x, y, z, h, o) {
                        return ((x - y) / z) - h + o;
                    }
                },
                /*
                 * @method css - Generates a CSS object for positioning,
                 *                using transforms if available.
                 */
                css: function (a) {
                    if (typeof a !== 'undefined' && a.length > 0) {

                        // Apply fixed positions if enabled in options.
                        if (options.fixed) {
                            a[2] = options.fixedX;
                            a[3] = options.fixedY;
                        }

                        var translate = 'translate3d(' + a[2] + 'px, ' + a[3] + 'px, 0)';
                        var movement = (cssTranforms) ? {
                            '-webkit-transform': translate,
                            '-moz-transform': translate,
                            '-ms-tranform': translate,
                            '-o-tranform': translate,
                            'transform': translate
                        } : {
                            'top': a[3] + 'px',
                            'left': a[2] + 'px'
                        };

                        // Combine background position with movement.
                        return $.extend({'backgroundPosition': '-' + a[0] + 'px ' + '-' + a[1] + 'px'}, movement);
                    } else {
                        return {}; // Return empty object if no valid array is provided.
                    }
                },
                // Calculates the aspect ratio.
                ratio: function (x, y) {
                    return x / y;
                },
                // Sets up various size and stop parameters for a zoom instance.
                setParams: function (zoom) {

                    var id = zoom.attr('rel');

                    // Initialize size properties.
                    ZoomyS[id].size = {};
                    ZoomyS[id].size.full = options.zoomSize + (ZoomyS[id].zoom.border * 2);
                    ZoomyS[id].size.half = ZoomyS[id].size.full / 2;
                    ZoomyS[id].size.ratioX = utils.ratio(ZoomyS[id].css.width, ZoomyS[id].zoom.x);
                    ZoomyS[id].size.ratioY = utils.ratio(ZoomyS[id].css.height, ZoomyS[id].zoom.y);
                    ZoomyS[id].size.zoomX = ZoomyS[id].zoom.x - ZoomyS[id].size.full;
                    ZoomyS[id].size.zoomY = ZoomyS[id].zoom.y - ZoomyS[id].size.full;

                    // Initialize stop properties for collision detection.
                    ZoomyS[id].stop = {};
                    ZoomyS[id].stop.main = ZoomyS[id].size.half - (ZoomyS[id].size.half * ZoomyS[id].size.ratioX) - (ZoomyS[id].zoom.border * ZoomyS[id].size.ratioX) + ZoomyS[id].zoom.border;
                    ZoomyS[id].stop.right = utils.pos.stop(ZoomyS[id].css.width, ZoomyS[id].size.full, ZoomyS[id].zoom.border, ZoomyS[id].stop.main);
                    ZoomyS[id].stop.bottom = utils.pos.stop(ZoomyS[id].css.height, ZoomyS[id].size.full, ZoomyS[id].zoom.border, ZoomyS[id].stop.main);
                }

            },

            /*
             * @object change - Manages interactions and visual changes related to Zoomy.
             *
             * @method collision - Detects if the zoom lens is at an edge or corner.
             * @param {number} posX - X-position of the mouse relative to the image.
             * @param {number} posY - Y-position of the mouse relative to the image.
             * @param {object} dataset - ZoomyS data for the current instance.
             *
             * @method possibilities - Returns an array of coordinates based on collision index.
             * @param {number} index - Collision index (0-8).
             * @param {object} dataset - ZoomyS data for the current instance.
             * @param {number} leftX - Calculated left position.
             * @param {number} topY - Calculated top position.
             * @param {number} posX - Current X position.
             * @param {number} posY - Current Y position.
             *
             * @method move - Calculates and applies movement to the Zoomy element.
             * @param {object} ele - The main element (anchor/image).
             * @param {object} zoom - The Zoomy lens element.
             * @param {object} e - The event object (mousemove/touchmove).
             *
             * @method classes - Toggles 'inactive' class on the main element.
             * @param {object} ele - The main element.
             *
             * @method enter - Handles the start of a zoom interaction.
             * @param {object} ele - The main element.
             * @param {object} zoom - The Zoomy lens element.
             *
             * @method leave - Handles the end of a zoom interaction.
             * @param {object} ele - The main element.
             * @param {object} zoom - The Zoomy lens element.
             * @param {number} x - Flag for different exit states.
             *
             * @method callback - Executes a user-defined callback function.
             * @param {function} type - The callback function to execute.
             * @param {object} zoom - The Zoomy lens element.
             */
            change = {

                collision: function (posX, posY, dataset) {

                    // Boolean flags to test for various collision scenarios.
                    var a = -dataset.stop.main <= posX,
                        e2 = -dataset.stop.main > posX,
                        b = -dataset.stop.main <= posY,
                        f = -dataset.stop.main > posY,
                        d = dataset.stop.bottom > posY,
                        g = dataset.stop.bottom <= posY,
                        c = dataset.stop.right > posX,
                        j = dataset.stop.right <= posX;

                    // Returns an integer representing the collision zone (0-8).
                    return (a && b && c && d) ? 0 : (e2) ? (b && d) ? 1 : (f) ? 2 : (g) ? 3 : null : (f) ? (c) ? 4 : 5 : (j) ? (d) ? 6 : 7 : (g) ? 8 : null;
                },

                possibilities: function (index, dataset, leftX, topY, posX, posY) {

                    // Map collision index to specific coordinate arrays.
                    var fn = {
                        // Center region.
                        0: [leftX, topY, posX, posY],

                        // Left edge.
                        1: [0, topY, -dataset.stop.main, posY],

                        // Top-left corner.
                        2: [0, 0, -dataset.stop.main, -dataset.stop.main],

                        // Bottom-left corner.
                        3: [0, dataset.size.zoomY, -dataset.stop.main, dataset.stop.bottom],

                        // Top edge.
                        4: [leftX, 0, posX, -dataset.stop.main],

                        // Top-right corner.
                        5: [dataset.size.zoomX, 0, dataset.stop.right, -dataset.stop.main],

                        // Right edge.
                        6: [dataset.size.zoomX, topY, dataset.stop.right, posY],

                        // Bottom-right corner.
                        7: [dataset.size.zoomX, dataset.size.zoomY, dataset.stop.right, dataset.stop.bottom],

                        // Bottom edge.
                        8: [leftX, dataset.size.zoomY, posX, dataset.stop.bottom]
                    };

                    return fn[index];
                },

                // Handles moving the Zoomy cursor/lens.
                move: function (ele, zoom, e) {

                    // Retrieve instance data to avoid recalculations.
                    var id = zoom.attr('rel'),
                        l = ele.offset(),
                        dataset = ZoomyS[id],
                        yOffset = (touch) ? -70 : 0, // Y-offset for touch events.

                        // Dynamic variables based on current mouse/touch position.
                        posX = utils.pos.mouse(e.pageX, l.left, dataset.size.half),
                        posY = utils.pos.mouse(e.pageY + yOffset, l.top, dataset.size.half),
                        leftX = utils.pos.zoom(e.pageX, l.left, dataset.size.ratioX, dataset.size.half, ZoomyS[id].zoom.border),
                        topY = utils.pos.zoom(e.pageY + yOffset, l.top, dataset.size.ratioY, dataset.size.half, ZoomyS[id].zoom.border),

                        // Determine the collision index.
                        cssArrIndex = change.collision(posX, posY, dataset),

                        // Compile CSS properties for the Zoomy lens movement.
                        move = utils.css(change.possibilities(cssArrIndex, dataset, leftX, topY, posX, posY));

                    // Apply the compiled CSS to move the Zoomy lens.
                    zoom.css(move);

                },

                // Toggles the 'inactive' class on the original image.
                classes: function (ele) {
                    var i = ele.find('.zoomy').attr('rel');
                    if (ZoomyS[i].state === 0 || ZoomyS[i].state === null) {
                        ele.removeClass('inactive');
                    } else {
                        ele.addClass('inactive');
                    }
                },

                // Actions to take when the zoom area is entered.
                enter: function (ele, zoom) {
                    var i = zoom.attr('rel');
                    ZoomyS[i].state = 1; // Set state to active.
                    zoom.css('visibility', 'visible'); // Make lens visible.
                    change.classes(ele); // Update classes on the main element.
                },

                // Actions to take when the zoom area is left.
                leave: function (ele, zoom, x) {
                    var i = zoom.attr('rel');
                    if (x !== null) {
                        ZoomyS[i].state = null; // Set state to null if specific exit.
                    } else {
                        ZoomyS[i].state = 0; // Set state to inactive.
                    }
                    zoom.css('visibility', 'hidden'); // Hide the lens.
                    change.classes(ele); // Update classes.
                },

                // Executes user-defined callbacks (zoomInit, zoomStart, zoomStop).
                callback: function (type, zoom) {
                    var callbackFunc = type,
                        zoomId = zoom.attr('rel');

                    if (callbackFunc !== null && typeof callbackFunc === 'function') {

                        // Pass relevant data to the callback.
                        callbackFunc($.extend({}, ZoomyS[zoomId], ZoomyS.pos));

                    }

                }


            },

            // @object style - Handles all CSS styling for Zoomy elements.
            style = {

                // Calculates border-radius for rounded or square lenses.
                round: function (x, y) {
                    return (!options.round) ? 0 : (x === undefined) ? '100%' : options.zoomSize / 2 + 'px ' + options.zoomSize / 2 + 'px 0px 0px';
                },

                // Applies glare styling to the zoom lens.
                glare: function (zoom) {
                    zoom
                        .children('span')
                        .css({
                            height: options.zoomSize / 2,
                            width: options.zoomSize - 10,
                            margin: '5px auto',
                            'border-radius': style.round(0)
                        });
                },

                // Parses the border string and returns raw string and size.
                border: function (zoom) {

                    var borderRaw = options.border.replace(/^\s*|\s*$/g, ''), // Trim whitespace.
                        borderArr = borderRaw.split(' '),
                        interger = parseFloat(borderArr[0]),
                        size = (borderArr.length > 2 && interger * 1 === interger) ? interger : 0; // Extract border width.

                    return [borderRaw, size];
                },

                // Sets up initial CSS parameters for the main element and zoom lens.
                params: function (ele, zoom) {
                    var img = ele.children('img'),

                        // Get border details.
                        border = style.border(zoom),
                        // Preserve original margin values.
                        margin = {
                            'marginTop': img.css('margin-top'),
                            'marginRight': img.css('margin-right'),
                            'marginBottom': img.css('margin-bottom'),
                            'marginLeft': img.css('margin-left')
                        },
                        // Preserve original float property.
                        floats = {
                            'float': img.css('float')
                        },

                        // Base styles required for Zoomy to function correctly.
                        zoomMin = {
                            'display': 'block',
                            height: img.height(),
                            width: img.width(),
                            'position': 'relative'
                        },

                        // Checks if parent has text-align: center and adjusts margins.
                        parentCenter = function () {

                            var textAlign = ele.parent('*:first').css('text-align');
                            if (textAlign === 'center') {
                                margin.marginRight = 'auto';
                                margin.marginLeft = 'auto';
                            }

                        },
                        id = zoom.attr('rel'),
                        css = {}; // Temporary CSS object.

                    // Adjust margins if the image is floated.
                    if (floats['float'] === 'none') {
                        parentCenter();
                    }

                    // Combine all CSS properties.
                    $.extend(css, margin, floats, zoomMin);

                    // Store final CSS for the instance.
                    ZoomyS[id].css = css;

                    // Adjust glare or lens size if glare is disabled.
                    if (!options.glare) {
                        if (options.fixed) {
                            zoom.children('span').css({
                                height: options.zoomSize - 10,
                                width: options.zoomSize - 10
                            });
                        } else {
                            zoom.children('span').css({
                                height: options.zoomSize - 10,
                                width: options.zoomSize - 10
                            });
                        }

                    }

                    // Apply core CSS to the zoom lens.
                    if (options.fixed) {
                        zoom.css({
                            height: options.zoomSize,
                            width: options.zoomSize,
                            top: 0,
                            left: 0,
                            'border-radius': style.round(undefined, border[1]),
                            border: border[0]
                        });
                    } else {
                        zoom.css({
                            height: options.zoomSize,
                            width: options.zoomSize,
                            top: 0,
                            left: 0,
                            'border-radius': style.round(undefined, border[1]),
                            border: border[0]
                        });
                    }

                    // Reset image margin for proper positioning.
                    img.css('margin', '0px');

                    // Ensure CSS is applied after image loads.
                    img.one("load", function () {

                        ele.css(ZoomyS[id].css);

                        // If wrapped, apply CSS to wrapper too.
                        if (ele.parent('.zoomy-wrap').length) {
                            ele.parent('.zoomy-wrap').css(ZoomyS[id].css);
                        }

                    }).each(function () {
                        // Trigger load event if image is already cached.
                        if (this.complete) {
                            $(this).trigger("load");
                        }
                    });

                }

            },

            // @object build - Responsible for constructing and adding Zoomy elements to the DOM.
            build = {

                // Loads the high-resolution zoom image.
                image: function (image, zoom, callback) {
                    var id = zoom.attr('rel');

                    // Temporarily move Zoomy off-screen while loading to prevent flashes.
                    zoom.show().css({top: '-9999px', left: '-9999px'});

                    // Only load if the image source is different.
                    if (zoom.find('img').attr('src') !== image) {
                        zoom.find('img').attr('src', image).load(function () {

                            var assets = (options.glare) ? '<span/>' : '', // Add glare span if enabled.
                                border = style.border(zoom); // Get border details.

                            // Store zoom image dimensions and border size.
                            ZoomyS[id].zoom = {
                                'x': zoom.find('img').width(),
                                'y': zoom.find('img').height(),
                                'border': border[1]
                            };

                            // Apply background image and initial visibility.
                            zoom.append(assets)
                                .css({
                                    'background-image': 'url(' + image + ')',
                                    top: '0px',
                                    left: '0px',
                                    visibility: 'hidden'
                                })
                                .find('img')
                                .remove(); // Remove temporary img tag.

                            style.glare(zoom); // Apply glare styling.
                            utils.setParams(zoom); // Set up dynamic parameters.
                            callback(); // Execute callback after image is loaded and processed.

                        }).each(function () {

                            // Trigger load event if image is already complete (cached).
                            if (this.complete) {

                                $(this).trigger("load");

                            }
                        });

                    }
                },

                // Creates and adds the zoom lens element to the page.
                zoom: function (ele, i) {

                    // Initialize the state and index for this Zoomy instance.
                    ZoomyS[i] = {
                        state: null,
                        index: i
                    };

                    // Increment the global Zoomy count.
                    ZoomyS.count.push(0);

                    // Determine the large image source from the specified attribute.
                    var image = (typeof (ele.attr(options.attr)) === 'string' && options.attr !== 'href') ? ele.attr(options.attr) : ele.attr('href'),
                        zoom = null, // Placeholder for the zoom element.
                        initCallback = options.zoomInit, // Store the initialization callback.
                        eventHandler = function () { // Event handler function.