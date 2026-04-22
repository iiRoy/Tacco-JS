/*
 *  Module: Interactive Globe Viewer
 *  Purpose : Renders a 360-degree panoramic image within a scrollable HTML element using WebGL.
 *  Author : Derived from Ashima Arts (Ian McEwan)
 *  License : MIT License (Original source: Copyright (C) 2011 Ashima Arts)
 */
function createInteractiveGlobe() {
  const self = this; // Reference to the public API of the viewer instance
  const webglEngine = ashimaWebGLEngine0; // External WebGL utility library

  // Core WebGL components
  let webglContext;
  let shaderProgram;
  let vertexDataBuffer;
  let panoramaTexture;

  // UI elements and dimensions
  let mainViewportElement; // The root HTML element containing the viewer
  let scrollWrapperElement; // Div to handle scrollable area
  let renderingCanvasElement; // The WebGL canvas
  let currentViewportWidth = 0;
  let currentViewportHeight = 0;

  // View parameters
  let magnificationFactor = 1.0; // Controls the zoom level
  let imageAspectRatioScale = 4 / 2; // Derived from image aspect ratio, affects vertical scaling
  let currentElevationAngle = 0; // Vertical angle (pitch)
  let currentAzimuthAngle = 0; // Horizontal angle (yaw)
  let lastRecordedElevation = null; // For change detection
  let lastRecordedAzimuth = null; // For change detection

  // Animation and timing
  let idlePositionTimer; // Timer for `onIdlePositionChange` callback
  const IDLE_CALLBACK_DELAY_MS = 500; // Delay for the idle timer

  // Mathematical constants
  const MATH_PI = Math.PI;
  const TWO_PI = MATH_PI * 2;
  const HALF_PI = MATH_PI * 0.5;

  /**
   * Initializes the WebGL context and compiles shaders.
   * @throws {Error} If WebGL context cannot be obtained.
   */
  function initializeWebGLContext() {
    webglContext = webglEngine.getGlContext(renderingCanvasElement, {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: true // Added for robustness
    });

    if (!webglContext) {
      console.error("Failed to obtain WebGL context. Your browser might not support it, or it's disabled.");
      throw new Error("WebGL context unavailable.");
    }

    // Vertex Shader Source: Projects 2D screen coordinates to 3D view vector
    const vertexShaderSrc = `
      attribute vec2 a_position;
      uniform   vec3 u_viewParams; // (depth, aspect_ratio_y, zoom)
      varying   vec3 v_fragmentDirection;

      void main(void) {
        // Calculate a 3D direction vector based on screen position and view parameters
        v_fragmentDirection = vec3(a_position * u_viewParams.z, u_viewParams.x);
        v_fragmentDirection.y *= u_viewParams.y; // Apply y-axis aspect ratio correction
        gl_Position = vec4(a_position.x, a_position.y, u_viewParams.x, 1.0); // Output clip-space position
      }
    `;

    // Fragment Shader Source: Samples panorama texture based on 3D view vector
    const fragmentShaderSrc = `
      #ifdef GL_ES
      precision highp float;
      #endif
      
      const float INV_PI = 1.0 / 3.1415926535897932384626433832795029; // Inverse of PI
      uniform sampler2D u_panoramaSampler; // The panoramic image texture
      uniform mat3      u_rotationMatrix;  // Rotation matrix for view orientation
      uniform vec2      u_textureAspect;   // (image_aspect_scale, unused)
      varying vec3      v_fragmentDirection; // Interpolated 3D direction from vertex shader

      void main(void) {
        // Apply rotation to the fragment direction vector
        vec3 rotatedDir = normalize(v_fragmentDirection) * u_rotationMatrix;
        
        // Convert 3D direction to spherical UV coordinates (equirectangular projection)
        // atan(y, x) maps to longitude, asin(y) maps to latitude
        vec2 uvCoords = vec2(atan(rotatedDir.z, rotatedDir.x) * 0.5, u_textureAspect.y - asin(rotatedDir.y) * u_textureAspect.x) * INV_PI;
        uvCoords.y += 0.5; // Adjust Y to be 0-1 range

        gl_FragColor = texture2D(u_panoramaSampler, uvCoords.xy); // Sample the panorama
      }
    `;

    shaderProgram = webglEngine.compileAndLink(vertexShaderSrc, fragmentShaderSrc);

    // Define vertices for a full-screen quad (two triangles)
    // The positions are -1 to 1 for x and y, covering the entire viewport
    vertexDataBuffer = webglEngine.makeBuffer(
      webglContext.ARRAY_BUFFER,
      webglContext.FLOAT,
      2, // 2 components per vertex (x, y)
      webglContext.STATIC_DRAW,
      [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]
    );
  }

  /**
   * Configures WebGL state and binds initial resources.
   */
  function prepareRendererState() {
    panoramaTexture = webglEngine.textureCreate();
    // Configure texture filtering and wrapping
    panoramaTexture.aweParams(
      webglContext.LINEAR, // Min filter
      webglContext.LINEAR, // Mag filter
      webglContext.REPEAT, // Wrap S (horizontal)
      webglContext.CLAMP_TO_EDGE, // Wrap T (vertical)
      false // Mipmaps disabled
    );

    webglContext.disable(webglContext.DEPTH_TEST); // No depth buffering needed for 2D quad
    webglContext.disable(webglContext.BLEND); // No blending needed

    shaderProgram.aweUse(); // Activate the shader program
    // Bind the panorama texture to texture unit 0 and link to shader uniform
    panoramaTexture.aweSet(0, shaderProgram.aweSym['u_panoramaSampler']);
    // Link the vertex buffer to the 'a_position' attribute in the shader
    vertexDataBuffer.aweSetVertexAttPtr(shaderProgram.aweSym["a_position"]);
  }

  /**
   * Adjusts the dimensions and scroll positions of the HTML container elements
   * to create the illusion of a scrollable panorama.
   */
  function adjustScrollLayout() {
    currentViewportWidth = mainViewportElement.clientWidth;
    currentViewportHeight = mainViewportElement.clientHeight;

    // Calculate dimensions for the scrollable inner div
    // It's effectively 2*PI wide and PI high in 'scroll units'
    scrollWrapperElement.style.width = `${currentViewportWidth * TWO_PI / magnificationFactor}px`; // Simplified width calculation
    scrollWrapperElement.style.height = `${currentViewportHeight * MATH_PI / (magnificationFactor * imageAspectRatioScale)}px`; // Simplified height calculation

    // Set scroll positions based on current azimuth and elevation
    mainViewportElement.scrollLeft = currentAzimuthAngle / TWO_PI * (scrollWrapperElement.offsetWidth - currentViewportWidth);
    mainViewportElement.scrollTop = (HALF_PI - currentElevationAngle * imageAspectRatioScale) / MATH_PI * (scrollWrapperElement.offsetHeight - currentViewportHeight);
  }

  /**
   * Synchronizes the WebGL canvas dimensions with the viewport size.
   */
  function syncCanvasDimensions() {
    webglContext.viewport(
      0, 0,
      webglContext.viewportWidth = renderingCanvasElement.width = currentViewportWidth,
      webglContext.viewportHeight = renderingCanvasElement.height = currentViewportHeight
    );
  }

  /**
   * Handles a resize event, updating layout and canvas, then resuming animation.
   */
  function handleResizeEvent() {
    adjustScrollLayout();
    syncCanvasDimensions();
    self.animationController.play(); // Resume rendering loop
  }

  /**
   * The main rendering loop. Calculates view parameters and draws the scene.
   */
  function drawScene() {
    // Read current scroll positions from the main viewport
    const viewportWidth = mainViewportElement.clientWidth;
    const viewportHeight = mainViewportElement.clientHeight;

    // Calculate azimuth and elevation from scroll positions
    currentAzimuthAngle = mainViewportElement.scrollLeft / (scrollWrapperElement.offsetWidth - viewportWidth) * TWO_PI;
    currentElevationAngle = (HALF_PI - mainViewportElement.scrollTop / (scrollWrapperElement.offsetHeight - viewportHeight) * MATH_PI) / imageAspectRatioScale;

    // Normalize azimuth angle to be within [0, 2*PI)
    currentAzimuthAngle = (currentAzimuthAngle % TWO_PI + TWO_PI) % TWO_PI; // Modern modulo for positive results

    // Check if viewport dimensions have changed
    if (viewportWidth !== currentViewportWidth || viewportHeight !== currentViewportHeight) {
      self.animationController.pause();
      // Use requestAnimationFrame for a more robust delayed resize, instead of setTimeout
      // This ensures the resize happens on the next animation frame, reducing flicker
      requestAnimationFrame(() => requestAnimationFrame(handleResizeEvent));
    } else if (currentElevationAngle !== lastRecordedElevation || currentAzimuthAngle !== lastRecordedAzimuth) {
      // Only re-render if the view has actually changed
      if (!panoramaTexture || !panoramaTexture.isLoaded) { // Guard clause: Don't render without a loaded texture
        console.warn("Panorama texture not loaded, skipping render frame.");
        return;
      }

      const cosElevation = Math.cos(currentElevationAngle);
      const sinElevation = Math.sin(currentElevationAngle);
      const cosAzimuth = Math.cos(currentAzimuthAngle);
      const sinAzimuth = Math.sin(currentAzimuthAngle);

      // Construct the 3x3 rotation matrix
      // This matrix rotates the camera view, based on azimuth and elevation
      const rotationMatrix = [
        cosAzimuth, -sinAzimuth * sinElevation, sinAzimuth * cosElevation,
        0, cosElevation, sinElevation,
        sinAzimuth, sinElevation * cosAzimuth, -cosAzimuth * cosElevation
      ];

      const depthDistance = 1.0; // Fixed depth for the fragment calculations

      // Update shader uniforms
      webglContext.uniform3f(shaderProgram.aweSym["u_viewParams"], depthDistance, viewportHeight / viewportWidth, magnificationFactor);
      webglContext.uniform2f(shaderProgram.aweSym["u_textureAspect"], imageAspectRatioScale, 0); // Second param unused
      webglContext.uniformMatrix3fv(shaderProgram.aweSym["u_rotationMatrix"], false, rotationMatrix);

      // Perform the draw call for the full-screen quad
      webglContext.drawArrays(webglContext.TRIANGLE_STRIP, 0, vertexDataBuffer.aweNumItems);

      // Update last recorded positions for the next frame's comparison
      lastRecordedElevation = currentElevationAngle;
      lastRecordedAzimuth = currentAzimuthAngle;

      // Reset and start the idle timer
      clearTimeout(idlePositionTimer);
      idlePositionTimer = setTimeout(() => {
        self.onIdlePositionChange(currentAzimuthAngle, currentElevationAngle, magnificationFactor);
      }, IDLE_CALLBACK_DELAY_MS);
    }
  }

  // --- Public API methods ---

  /**
   * Initializes the viewer within a given root HTML element.
   * @param {HTMLElement} rootElement - The container element for the viewer.
   * @param {object} [options] - Optional configuration settings.
   * @param {number} [options.initialZoom=1.0] - Initial zoom level.
   * @param {number} [options.initialAzimuth=0] - Initial azimuth angle in radians.
   * @param {number} [options.initialElevation=0] - Initial elevation angle in radians.
   */
  self.setupViewer = function(rootElement, options = {}) {
    if (!rootElement || !(rootElement instanceof HTMLElement)) {
      throw new Error("Invalid root element provided for viewer initialization.");
    }
    mainViewportElement = rootElement;

    // Create and append the canvas element
    renderingCanvasElement = document.createElement("canvas");
    renderingCanvasElement.style.position = "absolute"; // Position absolutely within parent
    renderingCanvasElement.style.top = "0";
    renderingCanvasElement.style.left = "0";
    renderingCanvasElement.style.width = "100%";
    renderingCanvasElement.style.height = "100%";
    renderingCanvasElement.style.pointerEvents = "none"; // Allow events to pass through to scrollWrapper

    // Create a scrollable div that contains the canvas
    scrollWrapperElement = document.createElement("div");
    scrollWrapperElement.style.overflow = "scroll"; // Make it scrollable
    scrollWrapperElement.style.position = "relative"; // For canvas absolute positioning
    scrollWrapperElement.style.width = "100%";
    scrollWrapperElement.style.height = "100%";
    scrollWrapperElement.appendChild(renderingCanvasElement);
    mainViewportElement.appendChild(scrollWrapperElement);

    // Initialize WebGL and renderer states
    initializeWebGLContext();
    prepareRendererState();

    // Apply initial options
    magnificationFactor = options.initialZoom !== undefined ? Math.max(0.1, options.initialZoom) : 1.0;
    currentAzimuthAngle = options.initialAzimuth !== undefined ? options.initialAzimuth : 0;
    currentElevationAngle = options.initialElevation !== undefined ? options.initialElevation : 0;

    // Perform initial layout and canvas sizing
    adjustScrollLayout();
    syncCanvasDimensions();

    // Start the animation loop
    self.animationController = webglEngine.animationStart(drawScene, renderingCanvasElement, 1000 / 60, true); // Target 60 FPS
  };

  /**
   * Loads a panoramic image into the viewer.
   * @param {HTMLImageElement} imageElement - The image element to use as the panorama texture.
   */
  self.loadPanoramaImage = function(imageElement) {
    if (!imageElement || !(imageElement instanceof HTMLImageElement)) {
      console.error("Invalid image element provided for panorama.");
      return;
    }

    const processImage = () => {
      const imageWidth = imageElement.naturalWidth;
      const imageHeight = imageElement.naturalHeight;

      if (imageWidth === 0 || imageHeight === 0) {
        console.error("Loaded image has zero dimensions.");
        return;
      }

      imageAspectRatioScale = (imageWidth / imageHeight) * 0.5; // Half of actual aspect ratio for spherical projection
      panoramaTexture.aweFromElem(imageElement); // Upload image to WebGL texture
      panoramaTexture.isLoaded = true; // Custom flag to indicate texture is ready

      // Reset view state to trigger a full re-render and layout update
      magnificationFactor = 1.0 / imageAspectRatioScale; // Adjust zoom based on image aspect
      lastRecordedElevation = null;
      lastRecordedAzimuth = null;
      handleResizeEvent(); // Force a layout update and redraw
    };

    if (imageElement.complete && imageElement.naturalWidth > 0) {
      processImage();
    } else {
      imageElement.onload = processImage;
      imageElement.onerror = () => console.error("Failed to load panorama image.");
    }
  };

  /**
   * Sets the viewer's magnification level.
   * @param {number} newZoomValue - The new zoom factor (e.g., 1.0 for default).
   */
  self.setMagnification = function(newZoomValue) {
    if (typeof newZoomValue !== 'number' || newZoomValue <= 0) {
      console.warn("Invalid zoom value. Must be a positive number.");
      return;
    }
    magnificationFactor = newZoomValue;
    adjustScrollLayout(); // Update scrollable area dimensions
    self.animationController.play(); // Ensure a redraw
  };

  /**
   * Sets the viewer's orientation (azimuth and elevation).
   * @param {number} newAzimuth - The new azimuth angle in radians.
   * @param {number} newElevation - The new elevation angle in radians.
   */
  self.setOrientation = function(newAzimuth, newElevation) {
    if (typeof newAzimuth !== 'number' || typeof newElevation !== 'number') {
      console.warn("Invalid orientation values. Must be numbers.");
      return;
    }
    currentElevationAngle = newElevation;
    currentAzimuthAngle = newAzimuth;
    adjustScrollLayout(); // Update scroll position
    self.animationController.play(); // Ensure a redraw
  };

  /**
   * Sets the initial view (azimuth, elevation, and zoom).
   * This is an alternative to setting options during setupViewer.
   * @param {number} az - Initial azimuth.
   * @param {number} el - Initial elevation.
   * @param {number} z - Initial zoom.
   */
  self.setInitialView = function(az, el, z) {
    self.setMagnification(z);
    self.setOrientation(az, el);
  };

  /**
   * Callback function invoked when the viewer has been idle at a position for a short duration.
   * Users can override this.
   * @param {number} azimuth - The current azimuth angle.
   * @param {number} elevation - The current elevation angle.
   * @param {number} zoom - The current zoom factor.
   */
  self.onIdlePositionChange = function(azimuth, elevation, zoom) {
    // console.log(`Viewer idle at: Azimuth=${azimuth.toFixed(2)}, Elevation=${elevation.toFixed(2)}, Zoom=${zoom.toFixed(2)}`);
  };

  /**
   * Cleans up WebGL resources and DOM elements.
   */
  self.destroy = function() {
    self.animationController.stop(); // Stop the animation loop
    clearTimeout(idlePositionTimer);

    if (webglContext) {
      // Delete WebGL objects
      if (shaderProgram) webglContext.deleteProgram(shaderProgram.program);
      if (vertexDataBuffer) webglContext.deleteBuffer(vertexDataBuffer.buffer);
      if (panoramaTexture) webglContext.deleteTexture(panoramaTexture.texture);
      // Further cleanup if awe provides it, e.g., webglEngine.releaseContext(webglContext);
    }

    // Remove DOM elements
    if (scrollWrapperElement && scrollWrapperElement.parentNode) {
      scrollWrapperElement.parentNode.removeChild(scrollWrapperElement);
    }
    if (renderingCanvasElement && renderingCanvasElement.parentNode) {
      renderingCanvasElement.parentNode.removeChild(renderingCanvasElement);
    }

    // Nullify references to aid garbage collection
    webglContext = null;
    shaderProgram = null;
    vertexDataBuffer = null;
    panoramaTexture = null;
    mainViewportElement = null;
    scrollWrapperElement = null;
    renderingCanvasElement = null;
  };
}