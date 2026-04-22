/*
 *  ========================================================================================================================================================================================================================
 *  
 *      O B J E C T   D E F I N I T I O N S
 *  
 *  ========================================================================================================================================================================================================================
 */


/*
 *  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 *  
 *      M E S H   O B J E C T
 *  
 *      This section defines functions and a class related to creating and manipulating 3D mesh objects in a Three.js scene.
 *      It includes geometry generation, material application, and mesh properties.
 *  
 *  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

    /**
     *  Generates an array of THREE.Vector3 points for a LatheGeometry.
     *  The number of points is determined by the input parameter 'n'.
     *
     *  @param {number} n - The number of points to generate for the lathe. Default is 50.
     *  @returns {THREE.Vector3[]} An array of THREE.Vector3 objects.
     */
    function lathePnts( n )
    {
        var pnts = [ ]; 
        // Iterate 'n' times to create points along a curve
        for ( var i = 0 ; i < n ; i ++ ) 
        { 
            // Calculate a point's position based on sine wave for X, 0 for Y, and linear progression for Z
            pnts.push( new THREE.Vector3( ( Math.sin( i * 0.4 ) * 30 ) + 100 , 0 , ( i - 10 ) * 4 ) );
        }
        return pnts;
    }

    /**
     *  Creates and returns a new Three.js Geometry object based on the provided index 'v'.
     *  The geometry parameters are sourced from the global 'meshObj' instance.
     *
     *  @param {number} v - The index indicating which geometry type to create.
     *  @returns {THREE.Geometry} A Three.js Geometry instance.
     */
    function newGeometry( v )
    {
        // Array containing various Three.js geometry constructors
        var geoArray =
        [
            new THREE.CubeGeometry( meshObj.cubeW , meshObj.cubeH , meshObj.cubeD ) ,
            new THREE.SphereGeometry( meshObj.sphereR , meshObj.sphereSW , meshObj.sphereSH ) ,
            new THREE.IcosahedronGeometry( meshObj.radius , meshObj.detail ) ,
            new THREE.OctahedronGeometry( meshObj.radius , meshObj.detail ) ,
            new THREE.TetrahedronGeometry( meshObj.radius , meshObj.detail ) ,
            new THREE.CylinderGeometry( meshObj.cyliRT , meshObj.cyliRB , meshObj.cyliH , meshObj.cyliRS , meshObj.cyliHS , meshObj.cyliOE ) ,
            new THREE.TorusGeometry( meshObj.torusR , meshObj.torusT , meshObj.torusRS , meshObj.torusTS , Math.PI * meshObj.torusA ) ,
            new THREE.TorusKnotGeometry( meshObj.knotR , meshObj.knotT , meshObj.knotRS , meshObj.knotTS , meshObj.knotP , meshObj.knotQ , meshObj.knotH ) ,
            new THREE.LatheGeometry( lathePnts( meshObj.latheP ) , meshObj.latheS ) ,
            new THREE.PlaneGeometry( meshObj.planeW , meshObj.planeH , meshObj.planeWS , meshObj.planeHS ) ,
            new THREE.CircleGeometry( meshObj.circleR , meshObj.circleS , meshObj.circleTS , Math.PI * meshObj.circleTL ) ,
            new THREE.RingGeometry( meshObj.ringIR , meshObj.ringOR , meshObj.ringTS , meshObj.ringPS , meshObj.ringTSt , Math.PI * meshObj.ringTL ) ,
            new THREE.ConvexGeometry( ranPnts( meshObj.convexP ) )
        ];

        // Return the selected geometry from the array
        return geoArray[ v ];
    }

    /**
     *  Creates and returns a new Three.js Material object based on the provided index 'v'.
     *
     *  @param {number} v - The index indicating which material type to create.
     *  @returns {THREE.Material} A Three.js Material instance.
     */
    function newMaterial( v )
    {
        // Array containing various Three.js material constructors
        var matArray =
        [
            new THREE.MeshNormalMaterial( ) ,
            new THREE.MeshBasicMaterial( ) ,
            new THREE.MeshLambertMaterial( ) ,
            new THREE.MeshPhongMaterial( )
        ];

        // Return the selected material from the array
        return matArray[ v ];
    }

    /**
     *  MeshObj class constructor.
     *  Manages all properties and methods related to the primary 3D mesh displayed in the scene.
     */
    function MeshObj( )
    {
        // --- Core Mesh Properties ---
        this.geometry = 0;
        this.material = 0;
        this.texture  = false;
        this.txt      = 3; // Index for texture list
        this.txtList  = [ 'white.jpg' , 'mario.jpg' , 'linen.jpg' , 'crate.jpg' , 'dots.jpg' , 'rock_tile.jpg' , 'water.jpg' , 'wood.jpg' , 'brillo.jpg' , 'soup.jpg' ];
        this.txtRepeat = 1;
        this.scale = 1;
        this.posy = 0;
        this.rotx = 0;
        this.roty = 0;
        this.rotz = 0;
        this.smooth = false; // Toggles flat or smooth shading
        this.sided = 0;      // 0: FrontSide, 1: BackSide, 2: DoubleSide
        this.castShadow = false;

        // --- Material Properties (for popUp matGUI) ---
        this.wireframe   = false;
        this.linewidth   = 1;
        this.transparent = false;
        this.opacity     = 1;
        this.color       = 0xdcdcdc;   // Base color
        this.ambient     = 0xffffff;   // Ambient color (for Lambert/Phong)
        this.emissive    = 0x000000;   // Emissive color (for Lambert/Phong)
        this.specular    = 0x111111;   // Specular color (for Phong)
        this.shininess   = 30;         // Shininess (for Phong)

        // --- Geometry Properties (for popUp geoGUI) ---
        // Cube Geometry
        this.cubeW = 200;
        this.cubeH = 200;
        this.cubeD = 200;

        // Sphere Geometry
        this.sphereR  = 150;
        this.sphereSW = 100;
        this.sphereSH = 100;

        // Icosahedron, Octahedron, Tetrahedron
        this.radius = 150;
        this.detail = 0;

        // Cylinder Geometry
        this.cyliRT = 100;
        this.cyliRB = 100;
        this.cyliH  = 200;
        this.cyliRS = 50;
        this.cyliHS = 50;
        this.cyliOE = false; // Open ended

        // Torus Geometry
        this.torusR  = 100;
        this.torusT  = 40;
        this.torusRS = 40;
        this.torusTS = 40;
        this.torusA  = 2; // Arc

        // Lathe Geometry
        this.latheP = 26; // Number of points
        this.latheS = 20; // Segments

        // TorusKnot Geometry
        this.knotR  = 100;
        this.knotT  = 40;
        this.knotRS = 64;
        this.knotTS = 8;
        this.knotP  = 2;
        this.knotQ  = 3;
        this.knotH  = 1; // Height scale

        // Plane Geometry
        this.planeW  = 200;
        this.planeH  = 200;
        this.planeWS = 4; // Width segments
        this.planeHS = 4; // Height segments

        // Circle Geometry
        this.circleR  = 150;
        this.circleS  = 50; // Segments
        this.circleTS = 0;  // Theta start
        this.circleTL = 2;  // Theta length (multiplier for PI)

        // Ring Geometry
        this.ringIR  = 150; // Inner radius
        this.ringOR  = 50;  // Outer radius
        this.ringTS  = 50;  // Theta segments
        this.ringPS  = 5;   // Phi segments
        this.ringTSt = 0;   // Theta start
        this.ringTL  = 2;   // Theta length (multiplier for PI)

        // Convex Geometry
        this.convexP = 9; // Number of points for convex hull

        /**
         *  Recreates the mesh object in the scene based on current properties.
         *  Removes the old mesh, creates a new one with updated geometry, material, and transformations, then adds it to the scene.
         */
        this.make = function( )
        {
            // Remove previous mesh from scene if it exists
            scene.remove( mesh ); 

            // Create new mesh with selected geometry and material
            mesh = new THREE.Mesh( newGeometry( this.geometry ) , newMaterial( this.material ) );

            // Apply shading type (flat or smooth)
            if ( this.smooth == false )
            {
                mesh.material.shading = THREE.FlatShading;
            }
            else
            {
                mesh.material.shading = THREE.SmoothShading;
            }

            // Set material color for Basic and Lambert materials
            if ( this.material == 2 || this.material == 1 )
            {
                mesh.material.color.setHex( dec2hex( this.color ) ); 
            }

            // Set extensive material properties for Phong material
            if ( this.material == 3 )
            {
                mesh.material.color.setHex( dec2hex( this.color ) ); 
                mesh.material.ambient.setHex( dec2hex( this.ambient ) );
                mesh.material.emissive.setHex( dec2hex( this.emissive ) ); 
                mesh.material.specular.setHex( dec2hex( this.specular ) ); 
                mesh.material.shininess = this.shininess;
            }

            // Apply texture if enabled
            if ( this.texture == true && CUSTOM_TEXTURE == undefined )
            {
                // Load texture from local path
                map = THREE.ImageUtils.loadTexture( '../texturez/' + this.txtList[ this.txt ] );
                mesh.material.map = map;
                map.wrapS = map.wrapT = THREE.RepeatWrapping;
                map.repeat.set( this.txtRepeat , this.txtRepeat );
            }
            else if ( this.texture == true && CUSTOM_TEXTURE != undefined )
            {
                // Load custom texture from URL via proxy
                map = THREE.ImageUtils.loadTexture( '../texturez/proxy.php?url=' + CUSTOM_TEXTURE );
                mesh.material.map = map;
                map.wrapS = map.wrapT = THREE.RepeatWrapping;
                map.repeat.set( this.txtRepeat , this.txtRepeat );
            }

            // Set material side rendering (front, back, or double)
            if ( this.sided == 0 )
            {
                mesh.material.side = THREE.FrontSide;
            }
            else if ( this.sided == 1 )
            {
                mesh.material.side = THREE.BackSide;
            }
            else if ( this.sided == 2 )
            {
                mesh.material.side = THREE.DoubleSide;
            }

            // Apply wireframe properties
            mesh.material.wireframe = this.wireframe; 
            mesh.material.wireframeLinewidth = this.linewidth;

            // Apply transparency properties
            mesh.material.transparent = this.transparent;
            if ( this.transparent == true )
            {
                mesh.material.opacity = this.opacity;
            }

            // Apply scale, position, and rotation
            mesh.scale.x = mesh.scale.y = mesh.scale.z = this.scale;
            mesh.position.y = this.posy;
            mesh.rotation.x = this.rotx; 
            mesh.rotation.y = this.roty; 
            mesh.rotation.z = this.rotz;

            // Enable or disable shadow casting
            mesh.castShadow = this.castShadow;

            // Add the newly configured mesh to the scene
            scene.add( mesh );

            // Update the mesh code display
            updateMeshCode( );
        };

        /**
         *  Opens the material GUI if it's not already open.
         */
        this.openMat = function( )
        {
            if ( matgui == undefined )
            {
                materialzGUI( meshObj.material );
            }
        };

        /**
         *  Closes and destroys the material GUI.
         */
        this.closeMat = function( )
        {
            matgui.destroy( );
            matgui = undefined;
        };

        /**
         *  Opens the geometry GUI if it's not already open.
         */
        this.openGeo = function( )
        {
            if ( geogui == undefined )
            {
                geometriezGUI( meshObj.geometry );
            }
        };

        /**
         *  Closes and destroys the geometry GUI.
         */
        this.closeGeo = function( )
        {
            geogui.destroy( );
            geogui = undefined;
        };

        /**
         *  Creates a popup for entering a custom texture URL.
         *  Applies the custom texture and updates the mesh upon submission.
         */
        this.customTexture = function( )
        {
            // Create the popup container div
            var popup = document.createElement( 'div' );
            popup.id = "popup";

            // Create the input field for the image URL
            var field = document.createElement( 'input' );    
            field.id = "imageURL";
            field.style.width = "250px";
            field.value = 'paste a valid image url here';
            field.onkeypress = function( )
            {
                // On key press, update custom texture and remake mesh
                CUSTOM_TEXTURE = field.value;
                meshObj.make( );
                document.body.removeChild( popup ); // Close popup
            };
            popup.appendChild( field );

            // Create the button to add the texture
            var button = document.createElement( 'button' );
            button.innerHTML = "add texture";
            button.onclick = function( )
            {
                // On button click, update custom texture and remake mesh
                CUSTOM_TEXTURE = field.value;
                meshObj.make( );
                document.body.removeChild( popup ); // Close popup
            };
            popup.appendChild( button );

            // Add the popup to the document body
            document.body.appendChild( popup );

            // Log that the function was run (for debugging)
            console.log( 'ran' );
        };

        // Flag to indicate if the current geometry is convex (used for specific handling)
        this.isConvex = false;
    } 

    // Instantiate the MeshObj globally
    meshObj = new MeshObj( );    


/*
 *  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 *  
 *      P L A N E   O B J E C T
 *  
 *      This section defines a class for managing a ground plane in the Three.js scene.
 *      It includes properties for texture, repeat, scale, and wireframe options.
 *  
 *  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

    /**
     *  PlaneObj class constructor.
     *  Manages properties and methods related to the ground plane in the scene.
     */
    function PlaneObj( )
    {
        // --- Plane Visibility and Texture Properties ---
        this.togglePlane = false;
        this.txtList     = [ 'mario.jpg' , 'linen.jpg' , 'crate.jpg' , 'dots.jpg' , 'rock_tile.jpg' , 'water.jpg' , 'wood.jpg' , 'white.jpg' , 'brillo.jpg' , 'soup.jpg' ];
        this.texture     = 7; // Index for texture list
        this.repeat      = 80;
        this.scale       = 30;

        // --- Wireframe Plane Properties ---
        this.toggleWireframe = false;
        this.w_line          = 1; // Wireframe line width
        this.w_scale         = 1; // Wireframe plane scale

        /**
         *  Creates or updates the textured ground plane.
         *  Removes the old plane if it exists, configures new geometry and material,
         *  applies texture and transformations, then adds it to the scene.
         */
        this.makePlane = function( )
        {
            // Remove existing plane from scene
            if ( plane != undefined )
            {
                scene.remove( plane );
            }

            // Create plane geometry
            pgeometry = new THREE.PlaneGeometry( 1000 , 1000 , 20 , 20 );

            // Load and apply texture to material
            map = THREE.ImageUtils.loadTexture( '../texturez/' + this.txtList[ this.texture ] );
            pmaterial = new THREE.MeshPhongMaterial( { map: map } ); 
            map.wrapS = map.wrapT = THREE.RepeatWrapping;
            map.repeat.set( this.repeat , this.repeat );

            // Create mesh for the plane
            plane = new THREE.Mesh( pgeometry , pmaterial );

            // Set rotation and shadow receiving
            plane.rotation.x = - Math.PI / 2;
            plane.receiveShadow = true;

            // Apply scale
            plane.scale.set( this.scale , this.scale , this.scale );

            // Add plane to the scene
            scene.add( plane );
        };

        /**
         *  Creates or updates the wireframe ground plane.
         *  Removes the old wireframe plane if it exists, configures new geometry and material,
         *  applies transformations, then adds it to the scene.
         */
        this.makeWireframe = function( )
        {
            // Remove existing wireframe plane from scene
            if ( wireplane != undefined )
            {
                scene.remove( wireplane );
            }

            // Create wireframe plane geometry
            wgeometry = new THREE.PlaneGeometry( 1000 , 1000 , 100 , 100 );

            // Create basic material with wireframe enabled
            wmaterial = new THREE.MeshBasicMaterial( { color: 0x000000 , wireframe: true , wireframeLinewidth: this.w_line } );

            // Create mesh for the wireframe plane
            wireplane = new THREE.Mesh( wgeometry , wmaterial );

            // Apply scale and rotation
            wireplane.scale.set( this.w_scale , this.w_scale , this.w_scale );
            wireplane.rotation.x = - Math.PI / 2;

            // Add wireframe plane to the scene
            scene.add( wireplane );
        };
    } 

    // Instantiate the PlaneObj globally
    planeObj = new PlaneObj( );


/*
 *  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 *  
 *      L I G H T S   O B J E C T
 *  
 *      This section defines a class for managing various light sources in the Three.js scene.
 *      It includes properties and methods for Ambient, Hemisphere, Directional, and Spot lights.
 *  
 *  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

    /**
     *  LightsObj class constructor.
     *  Manages properties and methods for different light types in the scene.
     */
    function LightsObj( )
    {
        // --- Ambient Light Properties ---
        this.AmbientLight = true;
        this.aclr         = 0x000000; // Ambient light color

        // --- Hemisphere Light Properties ---
        this.HemisphereLight = true;
        this.hs              = 0xffffff; // Sky color
        this.hg              = 0x000000; // Ground color
        this.hi              = 0.2;      // Intensity

        // --- Directional Light Properties ---
        this.DirectionalLight = true;
        this.dclr             = 0xffffff; // Directional light color
        this.di               = 0.1;      // Intensity
        this.dx               = 0;        // X position
        this.dy               = 1;        // Y position
        this.dz               = 0;        // Z position

        // --- Spot Light 1 Properties ---
        this.SpotLight1 = true;
        this.s1clr      = 0xffffff; // Spot light 1 color
        this.s1x        = 100;      // X position
        this.s1y        = 1000;     // Y position
        this.s1z        = 100;      // Z position
        this.s1i        = 0.1;      // Intensity
        this.s1sd       = 0.2;      // Shadow darkness

        // --- Spot Light 2 Properties ---
        this.SpotLight2 = true;
        this.s2clr      = 0xffffff; // Spot light 2 color
        this.s2x        = 100;      // X position
        this.s2y        = 1000;     // Y position
        this.s2z        = 100;      // Z position
        this.s2i        = 0.1;      // Intensity
        this.s2sd       = 0.2;      // Shadow darkness

        /**
         *  Creates or updates the Hemisphere Light in the scene.
         */
        this.makeHem = function( )
        {
            // Remove existing HemisphereLight
            if ( hemisphereLight != undefined )
            {
                scene.remove( hemisphereLight );
            }

            // Create new HemisphereLight
            hemisphereLight = new THREE.HemisphereLight( );
            hemisphereLight.color.setHex( dec2hex( this.hs ) ); 
            hemisphereLight.groundColor.setHex( dec2hex( this.hg ) ); 
            hemisphereLight.intensity = this.hi;

            // Add to scene
            scene.add( hemisphereLight ); 
        };

        /**
         *  Creates or updates the Directional Light in the scene.
         */
        this.makeDir = function( )
        {
            // Remove existing DirectionalLight
            if ( directionalLight != undefined )
            {
                scene.remove( directionalLight );
            }

            // Create new DirectionalLight
            directionalLight = new THREE.DirectionalLight( );
            directionalLight.color.setHex( dec2hex( this.dclr ) ); 
            directionalLight.intensity = this.di;
            directionalLight.position.x = this.dx;
            directionalLight.position.y = this.dy;
            directionalLight.position.z = this.dz;
            directionalLight.castShadow = true; // Enable shadow casting

            // Add to scene
            scene.add( directionalLight ); 
        };

        /**
         *  Creates or updates Spot Light 1 in the scene.
         */
        this.makeSpot1 = function( )
        {
            // Remove existing SpotLight 1
            if ( spotLight1 != undefined )
            {
                scene.remove( spotLight1 );
            }

            // Create new SpotLight 1
            spotLight1 = new THREE.SpotLight( 0xffffff , 0.5 );
            spotLight1.color.setHex( dec2hex( this.s1clr ) ); 
            spotLight1.position.x = this.s1x;
            spotLight1.position.y = this.s1y;
            spotLight1.position.z = this.s1z;
            spotLight1.castShadow = true; // Enable shadow casting
            spotLight1.shadowDarkness = this.s1sd;
            spotLight1.intensity = this.s1i;

            // Add to scene
            scene.add( spotLight1 ); 
        };

        /**
         *  Creates or updates Spot Light 2 in the scene.
         */
        this.makeSpot2 = function( )
        {
            // Remove existing SpotLight 2
            if ( spotLight2 != undefined )
            {
                scene.remove( spotLight2 );
            }

            // Create new SpotLight 2
            spotLight2 = new THREE.SpotLight( 0xffffff , 0.5 );
            spotLight2.color.setHex( dec2hex( this.s2clr ) ); 
            spotLight2.position.x = this.s2x;
            spotLight2.position.y = this.s2y;
            spotLight2.position.z = this.s2z;
            spotLight2.castShadow = true; // Enable shadow casting
            spotLight2.shadowDarkness = this.s2sd;
            spotLight2.intensity = this.s2i;

            // Add to scene
            scene.add( spotLight2 ); 
        };

        /**
         *  Creates or updates the Ambient Light in the scene.
         */
        this.makeAmbient = function( )
        {
            // Remove existing AmbientLight
            if ( ambientLight != undefined )
            {
                scene.remove( ambientLight );
            }

            // Create new AmbientLight
            ambientLight = new THREE.AmbientLight( );
            ambientLight.color.setHex( dec2hex( this.aclr ) ); 

            // Add to scene
            scene.add( ambientLight ); 
        };

        /**
         *  Opens the lights GUI if it's not already open.
         *  @param {any} v - Unused parameter.
         */
        this.open = function( v )
        {
            if ( lightgui == undefined )
            {
                lightGUI( );
            }
        };

        /**
         *  Closes and destroys the lights GUI.
         *  @param {any} v - Unused parameter.
         */
        this.close = function( v )
        {
            lightgui.destroy( );
            lightgui = undefined;
        };              
    } 

    // Instantiate the LightsObj globally
    lights = new LightsObj( );


/*
 *  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 *  
 *      E N V I R O N M E N T   O B J E C T
 *  
 *      This section defines a class for managing environment-related properties in the Three.js scene,
 *      such as shadows and fog.
 *  
 *  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

    /**
     *  EnvironmentObj class constructor.
     *  Manages scene-wide environment settings like shadows and fog.
     */
    function EnvironmentObj( )
    {
        // --- Shadow Properties ---
        this.renderShadows = false;

        // --- Fog Properties ---
        this.fog   = false;
        this.fclr  = 0xf2f7ff; // Fog color
        this.fnear = 1;        // Near distance
        this.ffar  = 9000;     // Far distance

        // --- Reset Property ---
        this.reset = 100000; // Reset distance (purpose not explicitly clear from context, possibly for camera/controls)

        /**
         *  Applies fog to the scene based on current properties.
         */
        this.makeFog = function( )
        {
            scene.fog = new THREE.Fog( this.fclr , this.fnear , this.ffar );
        };
    } 

    // Instantiate the EnvironmentObj globally
    enviro = new EnvironmentObj( );


/*
 *  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 *  
 *      C O D E / C O N S O L E   O B J E C T
 *  
 *      This section defines a class for managing interactions with code snippets or console-like features,
 *      such as selecting mesh code.
 *  
 *  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

    /**
     *  ConsoleObj class constructor.
     *  Provides utility functions, such as selecting text in a code display area.
     */
    function ConsoleObj( )
    {
        /**
         *  Selects the text content of the HTML element with id 'mcnsl'.
         *  This is typically used to allow users to easily copy generated code.
         */
        this.selectMeshCode = function( )
        {
            var doc  = document;
            var text = doc.getElementById( 'mcnsl' );    

            // Check for IE-specific text range selection
            if ( doc.body.createTextRange )
            {
                var range = document.body.createTextRange( );
                range.moveToElementText( text );
                range.select( );
            }
            // Standard selection for other browsers
            else if ( window.getSelection )
            {
                var selection = window.getSelection( );
                var range     = document.createRange( );
                range.selectNodeContents( text );
                selection.removeAllRanges( );
                selection.addRange( range );
            }
        };

        // Property to control background (purpose not explicitly clear from context)
        this.background = false;
    } 

    // Instantiate the ConsoleObj globally
    codez = new ConsoleObj( );