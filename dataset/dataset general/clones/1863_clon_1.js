/*
 * This file contains JavaScript code for rendering
 * a 3D cube using the Three.js library.
 * It also uses jQuery for DOM manipulation.
 *
 * <reference path="Three.js" />
 * <reference path="jquery-1.7.1.min.js" />
 */

// Define a self-executing anonymous function to encapsulate the cube logic.
var cubeUsingThreejs = function () {

    /* Module-level variables */
    var container, renderer; // DOM container and Three.js renderer instance

    var angle = 1; // Initial rotation angle for the cube.

    var viewPortWidth = 600; // The desired width of the rendering viewport.
    var viewPortHeight = 400; // The desired height of the rendering viewport.


    /*
     * Initializes the 3D scene, camera, lights, and cube.
     * Sets up the rendering loop.
     */
    var init = function () {

        // Get the main container element by its ID.
        container = $('#container');

        // Check if the browser is Internet Explorer.
        if ($.browser.msie) {
            // If it's IE, display a message prompting the user to download a better browser.
            container.children().first().append(
                '<div id="surface" style="height:400px; text-align:center; padding-top: 30px;">' +
                '<a style="vertical-align:middle;" href="https://www.google.com/chrome">Download a proper browser</a>' +
                '</div>'
            );
            return; // Exit the init function early for IE.
        }

        // Create a new WebGL renderer instance.
        renderer = new THREE.WebGLRenderer();
        // Set the size of the renderer to match the viewport dimensions.
        renderer.setSize(viewPortWidth, viewPortHeight);
        // Assign an 'id' attribute to the renderer's DOM element.
        renderer.domElement.setAttribute('id', 'surface');


        // Create a new Three.js scene.
        var scene = new THREE.Scene();
        // Build and retrieve the camera for the scene.
        var camera = buildCamera();
        // Build and retrieve the 3D cube object.
        var cube = buildCube();


        // Add the camera to the scene.
        scene.add(camera);
        // Add the cube to the scene.
        scene.add(cube);
        // Add an ambient light to the scene.
        scene.add(buildAmbientLight());
        // Add a directional light to the scene.
        scene.add(buildDirectionalLight());


        // Append the renderer's DOM element (canvas) to the container.
        container.children().first().append(renderer.domElement);

        // Set up an interval to continuously update and render the cube.
        setInterval(function () {
            // Call the function to calculate new cube rotation and render the scene.
            calculateCube(cube, scene, camera);
        }, 20); // Update every 20 milliseconds (approx. 50 frames per second).

    }; // End of the init function.


    /*
     * Creates and configures a directional light source.
     * @returns {THREE.DirectionalLight} The configured directional light.
     */
    var buildDirectionalLight = function () {
        // Create a new directional light with white color.
        var directionalLight = new THREE.DirectionalLight(0xffffff);
        // Set the light's position and normalize its direction vector.
        directionalLight.position.set(1, 1, 1).normalize();
        return directionalLight; // Return the light object.
    };


    /*
     * Creates an ambient light source.
     * @returns {THREE.AmbientLight} The configured ambient light.
     */
    var buildAmbientLight = function () {
        // Return a new ambient light with a grey color.
        return new THREE.AmbientLight(0x999999);
    };


    /*
     * Constructs the 3D cube geometry and mesh.
     * @returns {THREE.Mesh} The cube mesh.
     */
    var buildCube = function () {
        // Create a cube geometry with specified dimensions and segments.
        var cubeGeometry = new THREE.CubeGeometry(200, 200, 200, 1, 1, 1, buildMaterials());
        // Create a mesh from the geometry and a face material.
        return new THREE.Mesh(cubeGeometry, new THREE.MeshFaceMaterial());
    };


    /*
     * Prepares an array of materials for the cube's faces.
     * In this case, all faces share the same texture.
     * @returns {Array<THREE.Material>} An array of materials.
     */
    var buildMaterials = function () {
        var materials = []; // Initialize an empty array to hold materials.

        // Create a Lambert material, suitable for non-shiny surfaces.
        var texture = new THREE.MeshLambertMaterial({
            // Load a texture image to be applied to the material.
            map: THREE.ImageUtils.loadTexture('Content/me.jpg')
        });

        // Loop 6 times to apply the same texture to each of the cube's 6 faces.
        for (var i = 0; i < 6; i++) {
            materials.push(texture); // Add the texture material to the array.
        }

        return materials; // Return the array of materials.
    };


    /*
     * Sets up the perspective camera for the scene.
     * @returns {THREE.PerspectiveCamera} The configured camera.
     */
    var buildCamera = function () {
        // Create a new perspective camera with field of view, aspect ratio, near, and far clipping planes.
        var camera = new THREE.PerspectiveCamera(50, viewPortWidth / viewPortHeight, 1, 1000);
        // Set the camera's Z position to be 500 units away from the origin.
        camera.position.z = 500;
        return camera; // Return the camera object.
    };


    /*
     * Helper function to convert degrees to radians.
     * @param {number} degrees The angle in degrees.
     * @returns {number} The angle in radians.
     */
    var degreesToRadians = function (degrees) {
        return Math.PI / 180 * degrees; // Conversion formula.
    };


    /*
     * Updates the cube's rotation and re-renders the scene.
     * This function is called repeatedly by the setInterval.
     * @param {THREE.Mesh} cube The cube object to rotate.
     * @param {THREE.Scene} scene The scene to render.
     * @param {THREE.Camera} camera The camera to render from.
     */
    var calculateCube = function (cube, scene, camera) {
        angle++; // Increment the global angle for rotation.

        // Update the cube's rotation around the X-axis.
        cube.rotation.x = degreesToRadians(angle);
        // Update the cube's rotation around the Y-axis.
        cube.rotation.y = degreesToRadians(angle);
        // Update the cube's rotation around the Z-axis.
        cube.rotation.z = degreesToRadians(angle);

        // Render the scene with the updated cube and camera.
        renderer.render(scene, camera);
    };


    // Expose the init function as a public method of the module.
    return {
        init: init
    };

}().init(); // Immediately invoke the function and call its init method to start the application.