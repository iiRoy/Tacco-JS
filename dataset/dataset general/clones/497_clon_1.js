/*
 * This file contains the implementation of the Ashima Panorama Viewer module.
 * It provides functionality for displaying 360-degree panoramic images
 * using WebGL. This code is a Type I clone, meaning its functionality
 * is identical to the original, with only changes in whitespace and comments.
 *
 * Original Author: Ian McEwan, Ashima Arts.
 * Copyright (C) 2011 Ashima Arts. All rights reserved.
 * Distributed under the MIT License. Please refer to the LICENSE file for details.
 */

function ashimaPanoViewer()
{
    // Reference to the current instance of the viewer
    var P = this;

    // External WebGL engine dependency
    var awe = ashimaWebGLEngine0;


    // --- Core WebGL variables ---
    var gl;                     // The WebGL rendering context
    var prog;                   // The compiled shader program
    var verts;                  // Vertex buffer for the screen quad
    var panoTex;                // Texture object for the panoramic image
    var panoStopTimer;          // Timer for the pano stop event


    // --- Mathematical constants and viewer state variables ---
    var pi = 3.1415926535897932384626433832795029; // Value of Pi
    var elemPan, elemRoot, elemCanvas;             // DOM elements for viewer components
    var zoom = 1.0;                                // Current zoom level
    var saspect = 8 / 2;                           // Aspect ratio related to panorama scaling
    var panoStopDelay = 500;                       // Delay in milliseconds for the pano stop event


    /**
     * Initializes the WebGL context and compiles shaders.
     */
    function glinit() {
        // Get the WebGL rendering context from the canvas element
        gl = awe.getGlContext(elemCanvas, {});

        // Check if WebGL is available
        if (!gl) {
            throw "No webgl here"; // Error if WebGL is not supported
        }


        // Vertex shader source code
        // This shader calculates the fragment position and sets the gl_Position.
        var vs = "\
            attribute vec2 p;                       \n\
            uniform   vec3 z;                       \n\
            varying   vec3 fpos;                    \n\
            void main(void) {                       \n\
              fpos = vec3(p * z.z, z.x);            \n\
              fpos.y *= z.y;                        \n\
              gl_Position = vec4(p.x, p.y, z.x, 1.0);\n\
            }";


        // Fragment shader source code
        // This shader samples the panoramic texture based on the calculated view direction.
        var fs = "#ifdef GL_ES\nprecision highp float;\n#endif\n\
            const float ipi = 1.0 / 3.1415926535897932384626433832795029;\n\
            uniform sampler2D pan;\n\
            uniform mat3 trans;\n\
            uniform vec2 sas;\n\
            varying vec3 fpos;\n\
            void main(void) {\n\
              vec3 q = normalize(fpos) * trans;\n\
              vec2 l = vec2(atan(q.z, q.x) * 0.5, sas.y - asin(q.y) * sas.x) * ipi;\n\
              l.y += 0.5;\n\
              gl_FragColor = texture2D(pan, l.xy);\n\
            }";


        // Compile and link the vertex and fragment shaders into a program
        prog = awe.compileAndLink(vs, fs);

        // Create a buffer for the screen quad vertices
        // The quad covers the entire viewport [-1, -1] to [1, 1]
        verts = awe.makeBuffer(gl.ARRAY_BUFFER, gl.FLOAT, 2, gl.STATIC_DRAW,
            [ -1., -1.,  1., -1.,  -1., 1.,  1., 1. ]);
    }


    /**
     * Initializes rendering-related settings and textures.
     */
    function renderinit()
    {
        // Create a new texture object
        panoTex = awe.textureCreate();

        // Configure texture parameters: linear filtering, repeat horizontally, clamp vertically
        panoTex.aweParams(gl.LINEAR, gl.LINEAR, gl.REPEAT, gl.CLAMP_TO_EDGE, false);

        // Disable depth testing and blending as they are not needed for this 2D rendering
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);

        // Activate the shader program
        prog.aweUse();

        // Assign the panorama texture to texture unit 0 and link to shader uniform 'pan'
        panoTex.aweSet(0, prog.aweSym['pan']);

        // Set up the vertex attribute pointer for position 'p'
        verts.aweSetVertexAttPtr(prog.aweSym["p"]);
    }


    // --- Viewport and scroll state variables ---
    var el = 0;             // Elevation angle
    var az = 0;             // Azimuth angle
    var prev_el = null;     // Previous elevation for change detection
    var prev_az = null;     // Previous azimuth for change detection
    curW = 0;               // Current canvas width
    curH = 0;               // Current canvas height
    wrap = 4;               // Padding/wrap amount for scrollable div


    /**
     * Updates the dimensions and scroll positions of the DOM elements
     * to match the current viewer state (zoom, aspect, angles).
     */
    function updateElems()
    {
        // Get current client dimensions of the root element
        curW = elemRoot.clientWidth;
        curH = elemRoot.clientHeight;

        // Set the width and height of the scrollable panorama div
        elemPan.style.width = curW * 2 / zoom + wrap + "px";
        elemPan.style.height = curH * 2 / (zoom * saspect) + "px";

        // Adjust scrollLeft based on azimuth
        elemRoot.scrollLeft = az * (elemPan.offsetWidth - curW - wrap) / (2 * pi) + wrap / 2;

        // Adjust scrollTop based on elevation
        elemRoot.scrollTop  = (-el * saspect / pi + 0.5) * (elemPan.offsetHeight - curH);
    }


    /**
     * Updates the WebGL viewport and canvas dimensions to match the current client size.
     */
    function updateCanvasSize()
    {
        // Set the WebGL viewport
        gl.viewport(
            0, 0,                               // x, y
            gl.viewportWidth  = elemCanvas.width  = curW,  // width
            gl.viewportHeight = elemCanvas.height = curH   // height
        );
    }


    /**
     * Handles resizing of the viewer. Updates elements, canvas size, and restarts animation.
     */
    function resizeNow()
    {
        updateElems();        // Recalculate element sizes and positions
        updateCanvasSize();   // Update canvas and WebGL viewport
        P.animator.play();    // Resume animation loop
    }


    /**
     * The main rendering loop function.
     * Calculates view angles, updates uniforms, and draws the panorama.
     */
    function render()
    {
        // Get current client width and height of the root element
        var w = elemRoot.clientWidth;
        var h = elemRoot.clientHeight;

        // Calculate azimuth from scrollLeft
        az = 2 * pi * (elemRoot.scrollLeft - wrap / 2) / (elemPan.offsetWidth - w - wrap);

        // Calculate elevation from scrollTop
        el = (1 / saspect) * -pi * (elemRoot.scrollTop / (elemPan.offsetHeight - h) - 0.5);

        // Wrap azimuth if it goes beyond 2*pi
        if (az > 2 * pi)
        {
            az -= 2 * pi;
            updateElems(); // Update scroll position to reflect wrap
        }

        // Wrap azimuth if it goes below 0
        if (az < 0)
        {
            az += 2 * pi;
            updateElems(); // Update scroll position to reflect wrap
        }

        // Check if the root element's dimensions have changed
        if (w != curW || h != curH)
        {
            P.animator.pause(); // Pause rendering to avoid flickering during resize
            setTimeout(resizeNow, 200); // Debounce resize operation
        }
        // Only render if the view angles have changed
        else if (el != prev_el || az != prev_az)
        {
            // Calculate sine and cosine of elevation and azimuth angles
            var ce = Math.cos(el);
            var se = Math.sin(el);
            var ca = Math.cos(az);
            var sa = Math.sin(az);

            // Construct the 3x3 rotation matrix
            var trans = [
                ca, -sa * se, sa * ce,
                0,  ce,       se,
                sa, se * ca, -ca * ce
            ];

            // Distance to the projection plane (fixed for this viewer)
            var z_dist = 1.0;

            // Update shader uniforms
            gl.uniform3f(prog.aweSym["z"], z_dist, h / w, zoom);          // z_dist, aspect ratio, zoom
            gl.uniform2f(prog.aweSym["sas"], saspect, 0);                 // saspect and padding
            gl.uniformMatrix3fv(prog.aweSym["trans"], false, trans);      // Rotation matrix

            // Draw the screen quad
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, verts.aweNumItems);

            // Store current angles for next comparison
            prev_el = el;
            prev_az = az;

            // Clear any existing pano stop timer
            clearTimeout(panoStopTimer);

            // Set a new timer for the onPanoStop event
            panoStopTimer = setTimeout(P.onPanoStop, panoStopDelay, az, el, zoom);
        }
    }


    // Expose internal functions as properties of the viewer instance
    P.updateCanvasSize = updateCanvasSize;
    P.updateElems = updateElems;


    /**
     * Initializes the pano viewer with a root DOM element.
     * @param {HTMLElement} p The parent DOM element for the viewer.
     */
    P.init = function(p)
    {
        elemRoot = p; // Store the root element

        // Create the canvas element for WebGL rendering
        elemCanvas = document.createElement("canvas");
        elemCanvas.style.zIndex = -1;             // Place canvas behind content
        elemCanvas.style.position = "absolute";   // Absolute positioning

        // Create the scrollable div element
        elemPan = document.createElement("div");
        elemPan.style.zIndex = 1;                 // Place div above canvas (for scrolling)

        // Append canvas to the panorama div, and div to the root element
        elemPan.appendChild(elemCanvas);
        elemRoot.appendChild(elemPan);

        // Perform initial setup
        glinit();           // Initialize WebGL
        renderinit();       // Initialize rendering parameters
        updateElems();      // Set initial element sizes and positions
        updateCanvasSize(); // Set initial canvas and viewport size

        // Start the animation loop
        P.animator = awe.animationStart(render, gl.canvas, 1000 / 30, true);
    };


    /**
     * Sets the panoramic image for the viewer.
     * @param {HTMLImageElement} i The image element to use as the panorama texture.
     */
    P.setImage = function(i)
    {
        var iw = i.naturalWidth;  // Natural width of the image
        var ih = i.naturalHeight; // Natural height of the image

        // Calculate aspect ratio based on image dimensions
        saspect = (iw / ih) * 0.5;

        // Load the image into the WebGL texture
        panoTex.aweFromElem(i);

        // Adjust zoom based on the new aspect ratio
        zoom = 1 / saspect;

        // Reset previous angles to force a re-render
        prev_el = prev_az = null;

        // Trigger a resize to apply new image dimensions
        resizeNow();
    };


    /**
     * Sets the zoom level of the panorama.
     * @param {number} _z The new zoom level.
     */
    P.setZoom = function(_z)
    {
        zoom = _z;            // Update the zoom variable
        updateElems();        // Recalculate element sizes based on new zoom
    };


    /**
     * Sets the view direction (azimuth and elevation) of the panorama.
     * @param {number} az_ The new azimuth angle.
     * @param {number} el_ The new elevation angle.
     */
    P.setView = function(az_, el_)
    {
        el = el_; // Set new elevation
        az = az_; // Set new azimuth
    };


    /**
     * Callback function triggered when the panorama view stops changing.
     * This is an empty placeholder function meant to be overridden by the user.
     * @param {number} az The final azimuth angle.
     * @param {number} el The final elevation angle.
     * @param {number} z The final zoom level.
     */
    P.onPanoStop = function(az, el, z) { /* No operation by default */ };
}