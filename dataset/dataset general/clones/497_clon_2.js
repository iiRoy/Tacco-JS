/*
 *  Module: Spherical Projection Display Utility
 *  Author: Ivan McLean, Artisanal Arts.
 *  Rights: Copyright (C) 2011 Artisanal Arts. All rights reserved.
 *          Licensed under the MIT License. Refer to the LICENSE document.
 */

function sphericalProjectionDisplay() {
  // Reference to the current instance object
  var inst = this;
  // Initialize the graphics core helper
  var gfxTool = shaderEngineCore;

  // Declare core rendering components
  var glContext, shaderProgram, vertexBuffer, imageTexture, renderDelayTimer;
  // Mathematical constant for half-tau
  var halfTau = 3.1415926535897932384626433832795029;
  // DOM element references
  var containerDiv, baseElement, renderSurface;
  // Current magnification level
  var magnification = 1.0;
  // Aspect ratio scaling factor for panorama
  var aspectScale = 8 / 2;
  // Timeout for inactivity
  var inactivityTimeoutMs = 500;

  // Function to set up the WebGL context and shaders
  function initializeGraphics() {
    glContext = gfxTool.getGLContext(renderSurface, {});

    if (!glContext) {
      throw "WebGL rendering context not found or initialized.";
    }

    // Source for the vertex shader
    var vertexShaderSource = `
      attribute vec2 positionCoord;
      uniform   vec3 viewParameters;
      varying   vec3 interpolatedPosition;
      void main(void) {
        interpolatedPosition = vec3(positionCoord * viewParameters.z, viewParameters.x);
        interpolatedPosition.y *= viewParameters.y;
        gl_Position = vec4(positionCoord.x, positionCoord.y, viewParameters.x, 1.0);
      }`;

    // Source for the fragment shader
    var fragmentShaderSource = `#ifdef GL_ES
precision highp float;
#endif
      const float inversePi = 1.0 / 3.1415926535897932384626433832795029;
      uniform sampler2D panoramaSampler;
      uniform mat3 rotationMatrix;
      uniform vec2 scalingFactors;
      varying vec3 interpolatedPosition;
      void main(void) {
        vec3 normalizedVector = normalize(interpolatedPosition) * rotationMatrix;
        vec2 textureCoordinates = vec2(atan(normalizedVector.z, normalizedVector.x) * 0.5, scalingFactors.y - asin(normalizedVector.y) * scalingFactors.x) * inversePi;
        textureCoordinates.y += 0.5;
        gl_FragColor = texture2D(panoramaSampler, textureCoordinates.xy);
      }`;


    shaderProgram = gfxTool.compileAndLinkShaders(vertexShaderSource, fragmentShaderSource);

    // Define the vertex data for a full-screen quad
    vertexBuffer = gfxTool.createBuffer(glContext.ARRAY_BUFFER, glContext.FLOAT, 2, glContext.STATIC_DRAW,
      [ -1., -1., 1., -1., -1., 1., 1., 1. ]);
  }

  // Function to prepare rendering settings
  function prepareDrawing() {
    imageTexture = gfxTool.createTexture();
    // Set texture filtering and wrapping parameters
    imageTexture.setTextureParameters(glContext.LINEAR, glContext.LINEAR, glContext.REPEAT, glContext.CLAMP_TO_EDGE, false);
    glContext.disable(glContext.DEPTH_TEST); // No depth testing needed for a 2D quad
    glContext.disable(glContext.BLEND); // No blending needed

    shaderProgram.useProgram();
    // Assign texture unit 0 to the 'panoramaSampler' uniform
    imageTexture.assignTextureUnit(0, shaderProgram.getUniformLocation('panoramaSampler'));
    // Link the vertex buffer to the 'positionCoord' attribute
    vertexBuffer.setVertexAttributePointer(shaderProgram.getAttributeLocation("positionCoord"));
  }

  // Current view angles and dimensions
  var currentElevation = 0;
  var currentAzimuth = 0;
  var previousElevation = null;
  var previousAzimuth = null;
  var currentViewportWidth = 0;
  var currentViewportHeight = 0;
  var scrollPadding = 4; // Padding for scrollable area

  // Updates the dimensions and scroll positions of the DOM elements
  function adjustDomElements() {
    currentViewportWidth = baseElement.clientWidth;
    currentViewportHeight = baseElement.clientHeight;

    containerDiv.style.width = (currentViewportWidth * 2 / magnification) + scrollPadding + "px";
    containerDiv.style.height = (currentViewportHeight * 2 / (magnification * aspectScale)) + "px";

    // Adjust scroll positions based on current view angles
    baseElement.scrollLeft = currentAzimuth * (containerDiv.offsetWidth - currentViewportWidth - scrollPadding) / (2 * halfTau) + scrollPadding / 2;
    baseElement.scrollTop = (-currentElevation * aspectScale / halfTau + 0.5) * (containerDiv.offsetHeight - currentViewportHeight);
  }

  // Resizes the WebGL canvas to match the current viewport dimensions
  function recalibrateRenderSurface() {
    glContext.viewport(0, 0,
      glContext.viewportWidth = renderSurface.width = currentViewportWidth,
      glContext.viewportHeight = renderSurface.height = currentViewportHeight);
  }

  // Handles the full resize process
  function handleResizeEvent() {
    adjustDomElements();
    recalibrateRenderSurface();
    inst.animationLoopHandler.resume(); // Resume animation after resize
  }

  // Main rendering function, called per frame
  function drawSceneFrame() {
    var actualWidth = baseElement.clientWidth;
    var actualHeight = baseElement.clientHeight;

    // Calculate current azimuth and elevation from scroll positions
    currentAzimuth = 2 * halfTau * (baseElement.scrollLeft - scrollPadding / 2) / (containerDiv.offsetWidth - actualWidth - scrollPadding);
    currentElevation = (1 / aspectScale) * -halfTau * (baseElement.scrollTop / (containerDiv.offsetHeight - actualHeight) - 0.5);

    // Normalize azimuth angle
    if (currentAzimuth > 2 * halfTau) {
      currentAzimuth -= 2 * halfTau;
      adjustDomElements(); // Update elements if azimuth wrapped
    }

    if (currentAzimuth < 0) {
      currentAzimuth += 2 * halfTau;
      adjustDomElements(); // Update elements if azimuth wrapped
    }

    // Check if the actual viewport size has changed
    if (actualWidth !== currentViewportWidth || actualHeight !== currentViewportHeight) {
      inst.animationLoopHandler.pause();
      // Delay resize handling to avoid rapid updates
      setTimeout(handleResizeEvent, 200);
    }
    // Only redraw if view angles have changed
    else if (currentElevation !== previousElevation || currentAzimuth !== previousAzimuth) {
      // Calculate sine and cosine for elevation and azimuth
      var cosElevation = Math.cos(currentElevation), sinElevation = Math.sin(currentElevation);
      var cosAzimuth = Math.cos(currentAzimuth), sinAzimuth = Math.sin(currentAzimuth);

      // Construct the 3x3 rotation matrix
      var rotationMatrix = [
        cosAzimuth, -sinAzimuth * sinElevation, sinAzimuth * cosElevation,
        0, cosElevation, sinElevation,
        sinAzimuth, sinElevation * cosAzimuth, -cosAzimuth * cosElevation
      ];

      var distanceZ = 1.0;

      // Update shader uniforms
      glContext.uniform3f(shaderProgram.getUniformLocation("viewParameters"), distanceZ, actualHeight / actualWidth, magnification);
      glContext.uniform2f(shaderProgram.getUniformLocation("scalingFactors"), aspectScale, 0);
      glContext.uniformMatrix3fv(shaderProgram.getUniformLocation("rotationMatrix"), false, rotationMatrix);
      glContext.drawArrays(glContext.TRIANGLE_STRIP, 0, vertexBuffer.itemCount);

      // Store current angles for next frame comparison
      previousElevation = currentElevation;
      previousAzimuth = currentAzimuth;

      // Reset inactivity timer
      clearTimeout(renderDelayTimer);
      renderDelayTimer = setTimeout(inst.onViewIdle, inactivityTimeoutMs, currentAzimuth, currentElevation, magnification);
    }
  }

  // Expose internal functions
  inst.updateRenderDimensions = recalibrateRenderSurface;
  inst.adjustLayoutElements = adjustDomElements;

  /**
   * Initializes the spherical projection viewer.
   * @param {HTMLElement} parentElement The DOM element to attach the viewer to.
   */
  inst.initializeViewer = function(parentElement) {
    baseElement = parentElement;

    renderSurface = document.createElement("canvas");
    renderSurface.style.zIndex = "-1";
    renderSurface.style.position = "absolute";
    containerDiv = document.createElement("div");
    containerDiv.style.zIndex = "1";
    containerDiv.appendChild(renderSurface);
    baseElement.appendChild(containerDiv);

    initializeGraphics();
    prepareDrawing();
    adjustDomElements();
    recalibrateRenderSurface();
    // Start the animation loop
    inst.animationLoopHandler = gfxTool.startAnimationLoop(drawSceneFrame, glContext.canvas, 1000 / 30, true);
  };

  /**
   * Sets the panorama image to display.
   * @param {HTMLImageElement} imageElement The image element containing the panorama.
   */
  inst.loadPanoramaImage = function(imageElement) {
    var imgNaturalWidth = imageElement.naturalWidth,
        imgNaturalHeight = imageElement.naturalHeight;
    aspectScale = (imgNaturalWidth / imgNaturalHeight) * 0.5;
    imageTexture.loadFromElement(imageElement);
    magnification = 1 / aspectScale;
    previousElevation = previousAzimuth = null; // Force redraw
    handleResizeEvent();
  };

  /**
   * Sets the magnification level of the view.
   * @param {number} newZoomLevel The new zoom factor.
   */
  inst.setMagnification = function(newZoomLevel) {
    magnification = newZoomLevel;
    adjustDomElements();
  };

  /**
   * Sets the current view angles.
   * @param {number} azimuthValue The azimuth angle in radians.
   * @param {number} elevationValue The elevation angle in radians.
   */
  inst.setViewportAngles = function(azimuthValue, elevationValue) {
    currentElevation = elevationValue;
    currentAzimuth = azimuthValue;
  };

  /**
   * Callback function invoked when the panorama view becomes idle.
   * Can be overridden by the user.
   * @param {number} currentAzimuth The current azimuth angle.
   * @param {number} currentElevation The current elevation angle.
   * @param {number} currentZoom The current zoom level.
   */
  inst.onViewIdle = function(currentAzimuth, currentElevation, currentZoom) { /* Placeholder for user-defined logic */ };
}