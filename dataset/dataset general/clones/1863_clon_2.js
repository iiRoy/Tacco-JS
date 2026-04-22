// External library dependencies for this visualization script
// Requires Three.js for 3D rendering capabilities
// Requires jQuery for DOM manipulation and browser detection

var threeDObjectAnimator = function () {

  // Main variables for our display and render process
  var displayArea, visualizer;
  var rotationValue = 0; // Initial rotational degree for the object
  var canvasWidth = 600; // Desired width of the render canvas
  var canvasHeight = 400; // Desired height of the render canvas

  // Function to set up the 3D scene and start the animation
  var initializeDisplay = function () {

    // Get the main container element from the DOM
    displayArea = jQuery('#container');

    // Check for Internet Explorer browser and display a message if found
    if (jQuery.browser.msie) {
      displayArea.children().eq(0).append('<div id="render-surface" style="height:400px; text-align:center; padding-top: 30px;"><a style="vertical-align:middle;" href="https://www.google.com/chrome">Please acquire a more modern browser</a></div>');
      return; // Exit if IE is detected
    }

    // Initialize the WebGL renderer
    visualizer = new THREE.WebGLRenderer();
    visualizer.setSize(canvasWidth, canvasHeight); // Set the size of the renderer
    visualizer.domElement.setAttribute('id', 'render-surface'); // Assign an ID to the renderer's DOM element

    // Create the main 3D scene
    var mainScene = new THREE.Scene();
    // Build the camera for viewing the scene
    var viewingPerspective = createCameraView();
    // Construct the 3D object to be animated
    var spinningObject = create3DObject();

    // Add elements to the scene
    mainScene.add(viewingPerspective);
    mainScene.add(spinningObject);
    mainScene.add(generateAmbientLight()); // Add global ambient lighting
    mainScene.add(generateDirectionalLight()); // Add directional light source

    // Append the renderer's canvas to the container
    displayArea.children().eq(0).append(visualizer.domElement);

    // Set up an animation loop to update the object's position
    window.setInterval(function () {
      updateObjectPosition(spinningObject, mainScene, viewingPerspective);
    }, 25); // Update every 25 milliseconds

  }; // End of initializeDisplay function

  // Function to create and configure a directional light
  var generateDirectionalLight = function () {
    var primaryLightSource = new THREE.DirectionalLight(0xFFFFFF); // White light
    primaryLightSource.position.set(1.0, 1.0, 1.0).normalize(); // Position and normalize the light direction
    return primaryLightSource;
  };

  // Function to create an ambient light source
  var generateAmbientLight = function () {
    return new THREE.AmbientLight(0xAAAAAA); // Soft grey ambient light
  };

  // Function to build the 3D object (a cube in this case)
  var create3DObject = function () {
    // Define the geometry of the object (a box)
    var objectShape = new THREE.BoxGeometry(200, 200, 200, 1, 1, 1, createMaterials());
    // Create a mesh from the geometry and a face material
    return new THREE.Mesh(objectShape, new THREE.MeshFaceMaterial());
  };

  // Function to generate materials for the object's faces
  var createMaterials = function () {
    var surfaceTextures = []; // Array to hold the materials

    // Load an image as a texture for the object
    var baseTexture = new THREE.MeshLambertMaterial({
      map: THREE.ImageUtils.loadTexture('Assets/my_image.png')
    });

    // Apply the same texture to all 6 faces of the cube
    for (var index = 0; index < 6; index++) {
      surfaceTextures.push(baseTexture);
    }

    return surfaceTextures; // Return the array of materials
  };

  // Function to set up the perspective camera
  var createCameraView = function () {
    // Create a perspective camera with specified field of view, aspect ratio, and near/far planes
    var viewerCam = new THREE.PerspectiveCamera(50, canvasWidth / canvasHeight, 1, 1000);
    viewerCam.position.z = 500.0; // Position the camera along the Z-axis
    return viewerCam;
  };

  // Helper function to convert degrees to radians
  var convertDegreesToRadians = function (inputDegrees) {
    return Math.PI / 180.0 * inputDegrees;
  };

  // Function to update the object's rotation and render the scene
  var updateObjectPosition = function (targetObject, currentScene, currentCamera) {
    rotationValue++; // Increment the rotation value
    // Apply rotation to the object's X, Y, and Z axes
    targetObject.rotation.x = convertDegreesToRadians(rotationValue);
    targetObject.rotation.y = convertDegreesToRadians(rotationValue);
    targetObject.rotation.z = convertDegreesToRadians(rotationValue);
    // Render the updated scene from the camera's perspective
    visualizer.render(currentScene, currentCamera);
  };

  // Public interface for the module
  return {
    startRendering: initializeDisplay
  };

} ().startRendering(); // Immediately invoke the function and call its public `startRendering` method