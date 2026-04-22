var v3d = { // Main 3D visualization object definition.
    options: { /* Configuration settings for the 3D environment. */
        width: 400, // Display width in pixels.
        height: 400,  // Display height in pixels.
        radius: 5, // Base radius for spherical elements.
        red_intensity: 0.3, /* Initial intensity for the red light. */
        red_mod: 0.3, // Modulation factor for red light animation.
        thetas: [-80, -65, -55, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 55, 65, 80] // Array of theta angles in degrees.
    },

    callbacks: {}, // Object to store various callback functions.

    objects: {},   /* Object to hold references to Three.js scene objects. */

    loadBody: function () { // Function responsible for loading the main 3D body model.

        // Initialize a loading manager for handling asset loading.
        var manager = new THREE.LoadingManager();

        manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total ); // Log progress of loaded items.
        };

        /*
         *   Callback function to report progress during file loading.
         */
        var onProgress = function ( xhr ) {
            if ( xhr.lengthComputable ) { // Check if the total size is known.
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log( Math.round(percentComplete, 2) + '% downloaded' ); // Output download percentage.
            }
        };

        // Error callback function, currently does nothing.
        var onError = function ( xhr ) {
        };

        // Reference to the main scene object of the v3d instance.
        var scene = this.scene;

        // Create an OBJ loader, passing the loading manager.
        var loader = new THREE.OBJLoader( manager );
        loader.load( 'malebase.obj', function ( object ) { // Load the 'malebase.obj' model.
            object.traverse( function ( child ) { // Traverse all child objects within the loaded model.
                if ( child instanceof THREE.Mesh ) { // If a child is a mesh, apply material and shadow properties.
                    child.material = new THREE.MeshPhongMaterial(
                    {
                        color: 0xffffff,    // Set material color to white.
                        shininess: 70.0,    /* Define the shininess of the material. */
                        ambient: 0xff0000,  // Set ambient color to red.
                        emissive: 0x111111, // Define emissive color.
                        specular: 0xbbbbbb  // Set specular color.
                    });
                    child.castShadow = true;    // Enable shadow casting for this mesh.
                    child.receiveShadow = true; // Enable shadow receiving for this mesh.
                }
            } );
            object.rotation.y = Math.PI; // Rotate the object around the Y-axis by 180 degrees.
            object.position.y = - 9.02;   // Adjust the object's Y-position.
            object.position.z = 0.6;      // Adjust the object's Z-position.
            scene.add( object ); // Add the processed object to the scene.

        }, onProgress, onError ); // Pass the progress and error callbacks to the loader.
    },

    initObjects: function(scene) { // Initializes various 3D objects and adds them to the scene.
        var geometry = new THREE.CylinderGeometry( 4, 4, 3, 45 ); // Create cylinder geometry for the pedestal.
        var material = new THREE.MeshLambertMaterial( {color: 0xffffff} ); // Create a white Lambert material.
        var pedestal = new THREE.Mesh( geometry, material ); // Create the pedestal mesh.
        pedestal.receiveShadow = true; // Pedestal should receive shadows.
        pedestal.position.y = -22.1;   // Set the pedestal's Y-position.
        scene.add( pedestal ); // Add the pedestal to the scene.

        var sphere_geometry = new THREE.SphereGeometry(0.7, 32, 32); // Create sphere geometry for the main sphere.
        this.objects.sphere = new THREE.Mesh(sphere_geometry, new THREE.MeshLambertMaterial(
                    {
                      color: 0xFF5555 // Set sphere color to a reddish hue.
                    }));
        scene.add(this.objects.sphere); // Add the main sphere to the scene.

        var help_sphere_r = 0.4; // Radius for the helper spheres.
        var help_sphere_material = new THREE.MeshLambertMaterial(
            {
              color: 0x0507ff // Blue color for helper spheres.
            });

        var top_sphere = new THREE.Mesh( new THREE.SphereGeometry(help_sphere_r,16,16), help_sphere_material); // Create top helper sphere.
        top_sphere.position.set(0,v3d.options.radius,0); // Position it above the center.
        top_sphere.castShadow = true; // Enable shadow casting for the top sphere.
        scene.add( top_sphere ); // Add top sphere to scene.

        var back_sphere = new THREE.Mesh( new THREE.SphereGeometry(help_sphere_r,16,16), help_sphere_material); // Create back helper sphere.
        back_sphere.position.set(0,0,v3d.options.radius); // Position it behind the center.
        back_sphere.castShadow = true; // Enable shadow casting.
        scene.add( back_sphere ); // Add back sphere to scene.

        var front_sphere = new THREE.Mesh( new THREE.SphereGeometry(help_sphere_r,16,16), help_sphere_material); // Create front helper sphere.
        front_sphere.position.set(0,0,-v3d.options.radius); // Position it in front of the center.
        front_sphere.castShadow = true;
        scene.add( front_sphere );

        var left_sphere = new THREE.Mesh( new THREE.SphereGeometry(help_sphere_r,16,16), help_sphere_material); // Create left helper sphere.
        left_sphere.position.set(-v3d.options.radius,0,0); // Position it to the left.
        left_sphere.castShadow = true;
        scene.add( left_sphere );

        var right_sphere = new THREE.Mesh( new THREE.SphereGeometry(help_sphere_r,16,16), help_sphere_material); // Create right helper sphere.
        right_sphere.position.set(v3d.options.radius,0,0); // Position it to the right.
        right_sphere.castShadow = true;
        scene.add( right_sphere );

        // Custom shader material for a glow effect.
        var customMaterial = new THREE.ShaderMaterial(
        {
            uniforms:
            {
                "c":   { type: "f", value: 0.05 }, // Uniform 'c' for the shader.
                "p":   { type: "f", value: 4.5 },  // Uniform 'p' for the shader.
                glowColor: { type: "c", value: new THREE.Color(0xff1030) }, // Glow color uniform.
                viewVector: { type: "v3", value: this.camera.position } // Camera position as a view vector.
            },
            vertexShader:   document.getElementById( 'vertexShader'   ).textContent,     // Vertex shader source.
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent, // Fragment shader source.
            side: THREE.FrontSide,     // Render only the front side of the mesh.
            blending: THREE.AdditiveBlending, // Use additive blending for the glow effect.
            transparent: true          // Enable transparency for the material.
        }   );

        var glow_sphere = new THREE.Mesh( sphere_geometry.clone(), customMaterial.clone() ); // Create glow sphere by cloning geometry and material.
        this.objects.glow_sphere = glow_sphere; // Store reference to the glow sphere.
        glow_sphere.scale.multiplyScalar(1.2); // Scale up the glow sphere slightly.
        scene.add( glow_sphere ); // Add the glow sphere to the scene.
    },

    initLines: function(scene) { // Initializes various lines and circles in the scene.
        // A simple straight line.
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-this.options.radius, 0, 0)); // Start point.
        geometry.vertices.push(new THREE.Vector3(this.options.radius, 0, 0));  // End point.
        var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0x000000})); // Black line material.
        // scene.add(line); // This line is commented out in the original code, so it remains commented.
        var line_material = new THREE.LineBasicMaterial({color: 0x445566, opacity: 0.2, transparent: true }); // Material for other lines.

        // Half circles for decorative purposes.
        var circle = new THREE.CircleGeometry(this.options.radius,64); // Full circle geometry.
        circle.vertices.shift(); // Remove the center vertex.
        circle.vertices.splice(circle.vertices.length / 2 + 1); // Keep only half of the circle's vertices.

        var circle_line, delta;
        for(delta = -Math.PI * (0.75); delta <= Math.PI * (0.75 + 0.03125); delta += 1.53125 * Math.PI / 50)
        {
            circle_line = new THREE.Line(circle, line_material); // Create a line from the half circle.
            circle_line.rotation.x = delta; // Rotate each half circle around the X-axis.
            scene.add(circle_line); // Add the half circle line to the scene.
        }

        // Three-quarters circles.
        circle = new THREE.CircleGeometry(this.options.radius,64); // New circle geometry.
        circle.vertices.shift(); // Remove center.
        circle.vertices.splice(circle.vertices.length / 4 * 3 + 2); // Keep three-quarters of the vertices.

        // Circles positioned to form a grid-like pattern.
        for(delta = -0.92; delta <= 0.92; delta += 0.08) {
            circle_line = new THREE.Line(circle, line_material); // Create a line from the three-quarters circle.
            circle_line.scale.x = Math.sqrt(1.0-delta*delta); // Scale X based on delta.
            circle_line.scale.y = circle_line.scale.x; // Scale Y uniformly with X.
            circle_line.position.x = delta * this.options.radius; // Position along the X-axis.
            circle_line.rotation.y = Math.PI * 0.5; // Rotate 90 degrees around Y.
            circle_line.rotation.x = -Math.PI * (0.25); // Rotate -45 degrees around X.
            scene.add(circle_line); // Add the circle line to the scene.
        }
    },

    initLights: function(scene) { // Sets up the lighting for the 3D scene.
        var ambient = new THREE.AmbientLight( 0x101010 ); // Create a dim ambient light.
        scene.add( ambient ); // Add ambient light to the scene.

        var d = 22; // Dimension parameter for shadow camera frustum.
        this.objects.directionalLight = new THREE.DirectionalLight( 0xffffff, 1 ); // Create a white directional light.
        var directionalLight = this.objects.directionalLight; // Alias for convenience.
        directionalLight.position.set( 5, 8, 3 ); // Set the position of the directional light source.
        directionalLight.castShadow = true; // Enable shadow casting for this light.
        directionalLight.shadowDarkness = 0.5; // Set the darkness of the shadows.
        directionalLight.shadowCameraNear = 0.01; // Near clipping plane for the shadow camera.
        // directionalLight.shadowCameraVisible = true; // Uncomment for debugging shadow camera frustum.
        directionalLight.shadowCameraFar = this.camera.far; // Far clipping plane for the shadow camera.
        directionalLight.shadowMapWidth = 1024; // Resolution of the shadow map.
        directionalLight.shadowMapHeight = 1024;
        directionalLight.shadowCameraLeft = -d; // Left boundary of the shadow camera frustum.
        directionalLight.shadowCameraRight = d; // Right boundary.
        directionalLight.shadowCameraTop = d;   // Top boundary.
        directionalLight.shadowCameraBottom = -d; // Bottom boundary.
        scene.add( directionalLight ); // Add the directional light to the scene.

        this.objects.redLight = new THREE.DirectionalLight( 0xff0000, 1 ); // Create a red directional light.
        var redLight = this.objects.redLight; // Alias.
        redLight.position.set( 0, 8, 0 ); // Position the red light.
        redLight.castShadow = true; // Enable shadow casting for the red light.
        redLight.shadowDarkness = 0.1; // Shadow darkness for red light.
        redLight.shadowMapWidth = 1024;
        redLight.shadowMapHeight = 1024;
        redLight.shadowCameraNear = 0.01;
        redLight.shadowCameraFar = this.camera.far;
        redLight.shadowCameraLeft = -d;
        redLight.shadowCameraRight = d;
        redLight.shadowCameraTop = d;
        redLight.shadowCameraBottom = -d;
        scene.add( redLight ); // Add the red light to the scene.

        var topLight = new THREE.DirectionalLight( 0xffffff, 1 ); // Create another white directional light, positioned at the top.
        topLight.position.set( 0, 8, 0 ); // Position it at the top.
        topLight.castShadow = true; // Enable shadow casting.
        topLight.shadowDarkness = 0.05; // Set shadow darkness.
        topLight.intensity = 0.2; // Set intensity.
        topLight.shadowMapWidth = 1024;
        topLight.shadowMapHeight = 1024;
        topLight.shadowCameraNear = 0.01;
        topLight.shadowCameraFar = this.camera.far;
        topLight.shadowCameraLeft = -d;
        topLight.shadowCameraRight = d;
        topLight.shadowCameraTop = d;
        topLight.shadowCameraBottom = -d;
        scene.add( topLight ); // Add top light to the scene.

    },

    init: function(mouse_move, mouse_down) { // Main initialization function for the 3D viewer.
        this.callbacks.mouse_move = mouse_move; // Store the provided mouse move callback.
        this.callbacks.mouse_down = mouse_down; // Store the provided mouse down callback.

        // Convert theta angles from degrees to radians for internal use.
        this.options.thetas_rad = [];
        for(var i = 0; i < this.options.thetas.length; i++)
        {
            this.options.thetas_rad.push(this.options.thetas[i]/180.0*Math.PI);
        }

        var renderer = new THREE.WebGLRenderer({ // Create a WebGL renderer.
            antialias: true, // Enable antialiasing for smoother edges.
            alpha: true}); // Enable transparency for the canvas.
        this.renderer = renderer; // Store the renderer instance.
        renderer.shadowMapEnabled = true; // Enable shadow mapping.
        renderer.shadowMapType = THREE.PCFSoftShadowMap; // Use PCF soft shadows.
        renderer.shadowMapSoft = true; // Redundant with PCFSoftShadowMap but kept for consistency.
        renderer.setSize(this.options.width, this.options.height); // Set the size of the renderer's output.
        document.body.appendChild(renderer.domElement); // Append the renderer's DOM element to the document body.

        var scene = new THREE.Scene(); // Create a new Three.js scene.
        this.scene = scene; // Store the scene instance.

        var camera = new THREE.PerspectiveCamera(60, this.options.width / this.options.height, 0.1, 1000); // Create a perspective camera.
        this.camera = camera; // Store the camera instance.
        camera.position.z = 0.55*10; // Set camera's Z position.
        camera.position.y = 0.55*32; // Set camera's Y position.
        camera.lookAt({x: 0, y: 0, z: 0}); // Make the camera look at the origin.
        scene.add(camera); // Add the camera to the scene.

        this.loadBody(); // Load the main 3D body.
        this.initObjects(scene); // Initialize various 3D objects.
        this.initLines(scene);   // Initialize lines and circles.
        this.initLights(scene);  // Initialize lighting.

        // Add event listeners to the renderer's DOM element for user interaction.
        renderer.domElement.addEventListener( 'mousemove', this.mouse_move, false );
        renderer.domElement.addEventListener( 'mousedown', this.mouse_down, false );
        renderer.domElement.addEventListener( 'mouseup', this.mouse_up, false );
        renderer.domElement.addEventListener( 'mouseover', this.mouse_over, false);
        renderer.domElement.addEventListener( 'mouseout', this.mouse_out, false);
    },

    render: function() { // Renders the current state of the 3D scene.
        this.renderer.render(this.scene, this.camera); // Perform the rendering operation.
    },

    animate: function() { // The main animation loop.
        requestAnimationFrame( v3d.animate ); // Request the next animation frame.

        // Update the 'c' uniform of the glow sphere material for a pulsating effect.
        v3d.objects.glow_sphere.material.uniforms[ "c" ].value = 0.05 - 0.05 * Math.cos(Math.PI * 0.002 * new Date().getMilliseconds());
        // Update the intensity of the red light for a pulsating effect.
        v3d.objects.redLight.intensity = v3d.options.red_intensity * (1.0 + v3d.options.red_mod * Math.cos(Math.PI * 0.002 * new Date().getMilliseconds()));
        // Update the shadow darkness of the red light, also pulsating.
        v3d.objects.redLight.shadowDarkness = 0.5 * v3d.options.red_intensity * (1.0 + v3d.options.red_mod * Math.cos(Math.PI * 0.002 * new Date().getMilliseconds()));;; // Double semicolon preserved.

        v3d.render(); // Render the scene after updates.
    },

    spherical_to_hrir: function(s) // Converts spherical coordinates (alpha, beta) to HRIR-related values (x, rx, gamma).
    {
        var x = Math.sin(s.alpha) * Math.cos(s.beta);
        var rx = (Math.sqrt(1 - Math.pow(x/1,2.0))); // Calculate rx. x/1 is redundant but preserved.
        var gamma = Math.acos(Math.cos(s.alpha) / rx);
        gamma = Math.sign(s.beta) * gamma; // Adjust gamma based on the sign of beta.

        // Apply boundary constraints to gamma.
        if(gamma < -Math.PI * 3/4.0) gamma = -Math.PI * 3/4.0;
        if(gamma > Math.PI * (3/4.0+0.03125)) gamma = Math.PI * (3/4.0+0.03125);

        return { // Return the calculated HRIR components.
            x: x,
            rx: rx,
            gamma: gamma
        };
    },

    mouse_to_hrir: function(event) { // Converts mouse coordinates to HRIR-related values.
        var mouseX = ( event.clientX ); // Get client X coordinate of the mouse.
        var mouseY = ( event.clientY ); // Get client Y coordinate of the mouse.
        var dx = mouseX - v3d.options.width / 2; // Calculate X-offset from the center of the canvas.
        var dy = mouseY - v3d.options.height / 2; // Calculate Y-offset from the center of the canvas.

        // Calculate spherical coordinates (r, beta, alpha) from mouse position.
        var r = Math.sqrt(dx*dx+dy*dy);
        var beta = Math.atan2(dy,dx);
        var alpha = r/(2*v3d.options.radius*20)*Math.PI;

        // Convert and return HRIR coordinates using the spherical_to_hrir function.
        return v3d.spherical_to_hrir({r: r, beta: beta, alpha: alpha});
    },

    hrir_index: function(hrir) // Determines the closest HRIR array indices (theta, phi) for given HRIR values.
    {
        function closest(arr, target) { // Helper function to find the index of the closest value in a sorted array.
            for (var i=1; i < arr.length; i++) {
                if (arr[i] > target) {
                    var p = arr[i-1]; // Previous element.
                    var c = arr[i];   // Current element.
                    return Math.abs(p-target) < Math.abs(c-target) ? i-1 : i; // Return index of the closer value.
                }
            }
            return arr.length-1; // If target is larger than all elements, return the last index.
        }

        return { // Return the calculated theta and phi indices.
            theta: closest(v3d.options.thetas_rad, Math.asin(hrir.x)),
            phi: Math.round(hrir.gamma/((6/4.0+0.03125)*Math.PI)*49)+24
        };
    },

    hrir_to_xyz: function(hrir) { // Converts HRIR values to 3D XYZ coordinates.
        return { // Return the calculated XYZ coordinates.
            x: v3d.options.radius * hrir.x,
            y: v3d.options.radius * hrir.rx * Math.cos(hrir.gamma),
            z: v3d.options.radius * hrir.rx * Math.sin(hrir.gamma)
        }
    },

    mouse_down: function(event) { // Event handler for mouse down actions.
        var source_hrir = v3d.mouse_to_hrir(event); // Get HRIR coordinates from the mouse event.
        v3d.set_hrir_pos(source_hrir); // Set the position of 3D objects based on the HRIR.
        if(v3d.callbacks.mouse_down) v3d.callbacks.mouse_down(v3d.hrir_index(source_hrir)); // Call the external mouse down callback if defined.
    },

    set_hrir_pos: function(hrir_pos) { // Sets the 3D position of the glow sphere and red light based on HRIR position.
        var source_pos = v3d.hrir_to_xyz(hrir_pos); // Convert HRIR position to XYZ coordinates.
        v3d.objects.glow_sphere.position.set(source_pos.x, source_pos.y, source_pos.z); // Position the glow sphere.
        v3d.objects.redLight.position.set(source_pos.x, source_pos.y, source_pos.z); // Position the red light.
    },

    mouse_up: function(event) {
        // This function is intentionally left blank, no specific action on mouse up.
    },

    mouse_move: function(event) { // Event handler for mouse move actions.
        var source_hrir = v3d.mouse_to_hrir(event); // Get HRIR coordinates from the mouse event.
        var source_pos = v3d.hrir_to_xyz(source_hrir); // Convert HRIR to XYZ coordinates.

        v3d.objects.sphere.position.set(source_pos.x, source_pos.y, source_pos.z); // Position the main sphere.
        v3d.objects.directionalLight.position.set(source_pos.x, source_pos.y, source_pos.z); // Position the directional light.
        if(event.clientX < v3d.options.width) { // Check if mouse is within the canvas width.
            // v3d.camera.position.x = (event.clientX - 0.5*v3d.options.width) * 0.0005; // Original commented out camera adjustment.
        }
        if(v3d.callbacks.mouse_move) v3d.callbacks.mouse_move(v3d.hrir_index(source_hrir)); // Call the external mouse move callback if defined.
    },

    mouse_over: function(event) { // Event handler for mouse entering the canvas area.
        v3d.objects.directionalLight.intensity = 1; // Restore directional light intensity.
        v3d.objects.directionalLight.castShadow = true; // Re-enable shadow casting for directional light.
        v3d.objects.sphere.visible = true; // Make the main sphere visible.
    },

    mouse_out: function(event) { // Event handler for mouse leaving the canvas area.
        v3d.objects.directionalLight.intensity = 0; // Turn off directional light intensity.
        v3d.objects.directionalLight.castShadow = false; // Disable shadow casting for directional light.
        v3d.objects.sphere.visible = false; // Hide the main sphere.
    }
};

/*
 * This object (hpl) handles HRIR (Head-Related Impulse Response) loading and processing.
 * It manages the audio context, convolver, and HRIR data for spatial audio effects.
 */
var hpl = {
    hrir_l: [], // Array to store left channel HRIR data.
    hrir_r: [], // Array to store right channel HRIR data.
    Fs: 44100, // Default sampling frequency.
    theta: 0,  // Current theta index for HRIR lookup (mid-position default).
    phi: 10,   // Current phi index for HRIR lookup (mid-position default).

    load_hrir: function(name) { // Function to load HRIR data from specified files.
        this.hrir_loaded = false; // Flag indicating if HRIR data has been successfully loaded.
        this.hrir_l = [];         // Initialize or clear left HRIR data array.
        this.hrir_r = [];         // Initialize or clear right HRIR data array.

        // Initialize 3D arrays with zeros for HRIR data storage.
        for(var i = 0; i < 25; i++)
        {
            this.hrir_l.push([]);
            this.hrir_r.push([]);
            for(var j = 0; j < 50; j++)
            {
                this.hrir_l[i].push([]);
                this.hrir_r[i].push([]);
                for(var k = 0; k < 200; k++)
                {
                    this.hrir_l[i][j].push(0); // Set initial value to 0.
                    this.hrir_r[i][j].push(0); // Set initial value to 0.
                }
            }
        }

        var client_l = new XMLHttpRequest(); // XMLHttpRequest for fetching left channel data.
        var client_r = new XMLHttpRequest(); // XMLHttpRequest for fetching right channel data.
        var done_l = false, // Flag to track completion of left channel data loading.
            done_r = false; // Flag to track completion of right channel data loading.

        client_l.open('GET', 'hrir/' + name + '_l.dat'); // Configure request for left channel HRIR.
        client_r.open('GET', 'hrir/' + name + '_r.dat'); // Configure request for right channel HRIR.

        client_l.onreadystatechange = function() { // Event handler for state changes of the left channel request.
            if (client_l.readyState==4 && client_l.status==200) // Check if request is complete and successful.
            {
                var all_data = client_l.responseText.split('\n'); // Split the response text by newlines.
                for(var i = 0; i < 25; i++)
                {
                    var data = all_data[i].split(','); // Split each line by commas to get data points.
                    for(var j = 0; j < 50; j++)
                    {
                        for(var k = 0; k < 200; k++)
                        {
                            hpl.hrir_l[i][j][k] = data[j+k*50]; // Populate the left HRIR array.
                        }
                    }
                }
                if(done_r) { // If the right channel data is also loaded.
                    hpl.hrir_loaded = true; // Mark HRIR as fully loaded.
                    hpl.update_convolver(); // Update the convolver with the new data.
                }
                done_l = true; // Mark left channel loading as complete.
            }
        }

        client_r.onreadystatechange = function() { // Event handler for state changes of the right channel request.
            if (client_r.readyState==4 && client_r.status==200) // Check if request is complete and successful.
            {
                var all_data = client_r.responseText.split('\n'); // Split the response text by newlines.
                for(var i = 0; i < 25; i++)
                {
                    var data = all_data[i].split(','); // Split each line by commas.
                    for(var j = 0; j < 50; j++)
                    {
                        for(var k = 0; k < 200; k++)
                        {
                            hpl.hrir_r[i][j][k] = data[j+k*50]; // Populate the right HRIR array.
                        }
                    }
                }
                if(done_l) { // If the left channel data is also loaded.
                    hpl.hrir_loaded = true; // Mark HRIR as fully loaded.
                    hpl.update_convolver(); // Update the convolver.
                }
                done_r = true; // Mark right channel loading as complete.
            }
        }
        client_l.send(); // Send the request for left channel data.
        client_r.send(); // Send the request for right channel data.
    },

    update_convolver: function() { // Updates the convolver node with the currently selected HRIR.
        if(!hpl.hrir_loaded) return; // Exit if HRIR data has not been loaded yet.
        console.log(hpl.theta + "," + hpl.phi); // Log the current HRIR indices.

        hpl.left = hpl.hrir_buffer.getChannelData(0); // Get the audio data array for the left channel.
        hpl.right = hpl.hrir_buffer.getChannelData(1); // Get the audio data array for the right channel.

        // Perform linear interpolation of the HRIR data to match the AudioContext's sample rate.
        if(hpl.hrir_l && hpl.hrir_r) {
            var q, d, k_p, k_n; // Variables for interpolation calculations.
            for (var k = 0; k < this.hrir_length; k++) {
                q = k / (1.0*this.hrir_length) * 200; // Calculate the fractional position in the source HRIR.
                k_p = Math.floor(q); // Index of the previous sample.
                k_n = Math.ceil(q);  // Index of the next sample.
                d = q - k_p;         // Interpolation factor.

                // Apply linear interpolation for both left and right channels.
                hpl.left[k] = hpl.hrir_l[hpl.theta][hpl.phi][k_p] * (1.0-d) + hpl.hrir_l[hpl.theta][hpl.phi][k_n] * d;
                hpl.right[k] = hpl.hrir_r[hpl.theta][hpl.phi][k_p] * (1.0-d) + hpl.hrir_r[hpl.theta][hpl.phi][k_n] * d;
            }
        }

        console.log("Updated convolver"); // Log a message indicating the convolver has been updated.
    },

    init_convolver: function() { // Initializes the Web Audio API ConvolverNode.
        this.hrir_length = Math.ceil(200.0 * this.ctx.sampleRate / this.Fs); // Calculate the required length for the HRIR buffer.
        if(!hpl.convolver) // If the convolver node hasn't been created yet.
        {
            hpl.convolver = hpl.ctx.createConvolver(); // Create a new ConvolverNode.

            hpl.hrir_buffer = hpl.ctx.createBuffer(2, this.hrir_length, this.ctx.sampleRate); // Create an AudioBuffer for the HRIR.
            hpl.left = hpl.hrir_buffer.getChannelData(0); // Get the Float32Array for the left channel.
            hpl.right = hpl.hrir_buffer.getChannelData(1); // Get the Float32Array for the right channel.

            // Initialize the HRIR buffer with a Kronecker delta (identity impulse response).
            hpl.left[0] = 1; // First sample of left channel is 1.
            hpl.right[0] = 1; // First sample of right channel is 1.
            for (var i = 1; i < hpl.hrir_buffer.length; i++) {
                hpl.left[i] = 0;  // Remaining samples are 0.
                hpl.right[i] = 0; // Remaining samples are 0.
            }

            hpl.convolver.buffer = hpl.hrir_buffer; // Assign the created HRIR buffer to the convolver.
            hpl.convolver.connect(hpl.gain); // Connect the convolver to a gain node.
            hpl.gain.connect(hpl.ctx.destination); // Connect the gain node to the audio context's destination (speakers).
        }
    },

    init_source: function(file) { // Initializes an audio source by loading a sound file.
        var ajaxRequest = new XMLHttpRequest(); // Create a new XMLHttpRequest object.
        ajaxRequest.open('GET', 'sounds/' + file, true); // Configure the request to get the sound file.
        ajaxRequest.responseType = 'arraybuffer'; // Set the expected response type to an ArrayBuffer.
        ajaxRequest.onload = function() { // Callback for when the request successfully loads.
            var audioData = ajaxRequest.response; // Get the raw audio data as an ArrayBuffer.
            hpl.ctx.decodeAudioData(audioData, function(buffer) { // Decode the audio data into an AudioBuffer.
                hpl.source_buffer = buffer; // Store the decoded AudioBuffer.
            }, function(e){"Error decoding audio data" + e.err}); // Error handler for decoding.
        }
        ajaxRequest.send(); // Send the XMLHttpRequest.
    },

    play_source: function() { // Plays the initialized audio source.
        if(!hpl.source) // If the audio source node does not exist.
        {
            hpl.source = hpl.ctx.createBufferSource(); // Create a new AudioBufferSourceNode.
        }
        else // If an audio source node already exists.
        {
            hpl.source.stop(); // Stop the currently playing source.
            hpl.source = hpl.ctx.createBufferSource(); // Create a new AudioBufferSourceNode for playback.
        }
    }
};