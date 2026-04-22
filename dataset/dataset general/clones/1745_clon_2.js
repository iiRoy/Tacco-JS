// ---------------------------------------------------------------------------------------------------------------------------
			//
			//     RENDERABLE ENTITIES
			//
			// ---------------------------------------------------------------------------------------------------------------------------


				/*
				 *  GEOMETRY ENTITY
				 */

				function generatePathPoints( totalPoints ) {
					// An array to hold the generated 3D points.
					let pointCollection = [];
					// Loop to create each point based on an index.
					for ( let pointIndex = 0; pointIndex < totalPoints; pointIndex++ ) {
						// Add a new 3D vector to the collection, using sine wave for X, 0 for Y, and linear progression for Z.
						pointCollection.push( new THREE.Vector3( Math.sin( pointIndex * 0.4 ) * 30 + 100, 0.0, ( pointIndex - 10 ) * 4.0 ) );
					}
					// Return the complete set of points for a custom shape.
					return pointCollection;
				}

				function createShapeData( shapeTypeIndex ) {
					// Define a collection of various 3D geometry constructors with their associated parameters.
					const geometryOptions = [
						new THREE.CubeGeometry( displayConfig.boxWidth, displayConfig.boxHeight, displayConfig.boxDepth ),
						new THREE.SphereGeometry( displayConfig.sphereRadius, displayConfig.sphereWidthSegs, displayConfig.sphereHeightSegs ),
						new THREE.IcosahedronGeometry( displayConfig.baseRadius, displayConfig.levelOfDetail ),
						new THREE.OctahedronGeometry( displayConfig.baseRadius, displayConfig.levelOfDetail ),
						new THREE.TetrahedronGeometry( displayConfig.baseRadius, displayConfig.levelOfDetail ),
						new THREE.CylinderGeometry( displayConfig.cylinderTopRad, displayConfig.cylinderBottomRad, displayConfig.cylinderHeight, displayConfig.cylinderRadialSegs, displayConfig.cylinderHeightSegs, displayConfig.cylinderOpenEnded ),
						new THREE.TorusGeometry( displayConfig.torusOuterRadius, displayConfig.torusTubeRadius, displayConfig.torusRadialSegments, displayConfig.torusTubularSegments, Math.PI * displayConfig.torusArcFactor ),
						new THREE.TorusKnotGeometry( displayConfig.knotRadius, displayConfig.knotTube, displayConfig.knotRadialSegs, displayConfig.knotTubularSegs, displayConfig.knotP_Val, displayConfig.knotQ_Val, displayConfig.knotHeightScale ),
						new THREE.LatheGeometry( generatePathPoints( displayConfig.lathePointCount ), displayConfig.latheSegments ),
						new THREE.PlaneGeometry( displayConfig.planeDimWidth, displayConfig.planeDimHeight, displayConfig.planeWidthSegs, displayConfig.planeHeightSegs ),
						new THREE.CircleGeometry( displayConfig.circleMainRadius, displayConfig.circleSegments, displayConfig.circleThetaStart, Math.PI * displayConfig.circleThetaLength ),
						new THREE.RingGeometry( displayConfig.ringInnerRadius, displayConfig.ringOuterRadius, displayConfig.ringThetaSegments, displayConfig.ringPhiSegments, displayConfig.ringThetaStart, Math.PI * displayConfig.ringThetaLength ),
						new THREE.ConvexGeometry( generateRandomPoints( displayConfig.convexPointsCount ) )
					];
					// Return the selected geometry based on the provided index.
					return geometryOptions[ shapeTypeIndex ];
				}
				function fetchMaterialType( materialChoice ) {
					// An array containing predefined THREE.js material instances.
					const materialPresets = [
						new THREE.MeshNormalMaterial(),
						new THREE.MeshBasicMaterial(),
						new THREE.MeshLambertMaterial(),
						new THREE.MeshPhongMaterial()
					];
					// Return the material corresponding to the given index.
					return materialPresets[ materialChoice ];
				}

			function DisplayObjectSettings() {
				// Core object properties
				this.currentGeometry = 0;
				this.currentMaterial = 0;
				this.hasTexture = false;
				this.assetIndex = 3;
				this.resourceCollection = ['white.jpg', 'mario.jpg', 'linen.jpg', 'crate.jpg', 'dots.jpg', 'rock_tile.jpg', 'water.jpg', 'wood.jpg', 'brillo.jpg', 'soup.jpg'];
				this.textureRepeat = 1;
				this.modelScale = 1;
				this.positionY = 0;
				this.rotationX = 0;
				this.rotationY = 0;
				this.rotationZ = 0;
				this.smoothShading = false;
				this.faceDisplayMode = 0;
				this.enableShadowCast = false;
				// Material GUI properties
				this.displayWireframe = false;
				this.wirelineWidth = 1;
				this.isTransparent = false;
				this.alphaValue = 1;
				this.baseColor = 0xdcdcdc;
				this.ambientColor = 0xffffff;
				this.emissiveColor = 0x000000;
				this.specularColor = 0x111111;
				this.specularShininess = 30;
				// Geometry GUI properties
				this.boxWidth = 200;
				this.boxHeight = 200;
				this.boxDepth = 200;
				this.sphereRadius = 150;
				this.sphereWidthSegs = 100;
				this.sphereHeightSegs = 100;
				this.baseRadius = 150;
				this.levelOfDetail = 0;
				this.cylinderTopRad = 100;
				this.cylinderBottomRad = 100;
				this.cylinderHeight = 200;
				this.cylinderRadialSegs = 50;
				this.cylinderHeightSegs = 50;
				this.cylinderOpenEnded = false;
				this.torusOuterRadius = 100;
				this.torusTubeRadius = 40;
				this.torusRadialSegments = 40;
				this.torusTubularSegments = 40;
				this.torusArcFactor = 2;
				this.lathePointCount = 26;
				this.latheSegments = 20;
				this.knotRadius = 100;
				this.knotTube = 40;
				this.knotRadialSegs = 64;
				this.knotTubularSegs = 8;
				this.knotP_Val = 2;
				this.knotQ_Val = 3;
				this.knotHeightScale = 1;
				this.planeDimWidth = 200;
				this.planeDimHeight = 200;
				this.planeWidthSegs = 4;
				this.planeHeightSegs = 4;
				this.circleMainRadius = 150;
				this.circleSegments = 50;
				this.circleThetaStart = 0;
				this.circleThetaLength = 2;
				this.ringInnerRadius = 150;
				this.ringOuterRadius = 50;
				this.ringThetaSegments = 50;
				this.ringPhiSegments = 5;
				this.ringThetaStart = 0;
				this.ringThetaLength = 2;
				this.convexPointsCount = 9;

				// Method to construct and update the 3D object in the scene.
				this.constructObject = function() {
					// Remove existing object from scene if it exists.
					mainScene.remove( renderableObject );
					// Create a new mesh with selected geometry and material.
					renderableObject = new THREE.Mesh( createShapeData( this.currentGeometry ), fetchMaterialType( this.currentMaterial ) );
					// Apply shading type based on preference.
					if ( this.smoothShading === false ) {
						renderableObject.material.shading = THREE.FlatShading;
					} else {
						renderableObject.material.shading = THREE.SmoothShading;
					}
					// Set basic or Lambert material color.
					if ( this.currentMaterial === 2 || this.currentMaterial === 1 ) {
						renderableObject.material.color.setHex( convertDecToHex( this.baseColor ) );
					}
					// Set Phong material properties.
					if ( this.currentMaterial === 3 ) {
						renderableObject.material.color.setHex( convertDecToHex( this.baseColor ) );
						renderableObject.material.ambient.setHex( convertDecToHex( this.ambientColor ) );
						renderableObject.material.emissive.setHex( convertDecToHex( this.emissiveColor ) );
						renderableObject.material.specular.setHex( convertDecToHex( this.specularColor ) );
						renderableObject.material.shininess = this.specularShininess;
					}
					// Apply texture if enabled.
					if ( this.hasTexture === true && CUSTOM_IMAGE_URL === undefined ) {
						// Load texture from predefined list.
						let textureMap = THREE.ImageUtils.loadTexture( '../texturez/' + this.resourceCollection[ this.assetIndex ] );
						renderableObject.material.map = textureMap;
						textureMap.wrapS = textureMap.wrapT = THREE.RepeatWrapping;
						textureMap.repeat.set( this.textureRepeat, this.textureRepeat );
					} else if ( this.hasTexture === true && CUSTOM_IMAGE_URL !== undefined ) {
						// Load custom texture from URL.
						let textureMap = THREE.ImageUtils.loadTexture( '../texturez/proxy.php?url=' + CUSTOM_IMAGE_URL );
						renderableObject.material.map = textureMap;
						textureMap.wrapS = textureMap.wrapT = THREE.RepeatWrapping;
						textureMap.repeat.set( this.textureRepeat, this.textureRepeat );
					}
					// Set material side rendering.
					if ( this.faceDisplayMode === 0 ) {
						renderableObject.material.side = THREE.FrontSide;
					} else if ( this.faceDisplayMode === 1 ) {
						renderableObject.material.side = THREE.BackSide;
					} else if ( this.faceDisplayMode === 2 ) {
						renderableObject.material.side = THREE.DoubleSide;
					}
					// Set wireframe properties.
					renderableObject.material.wireframe = this.displayWireframe;
					renderableObject.material.wireframeLinewidth = this.wirelineWidth;
					// Set transparency properties.
					renderableObject.material.transparent = this.isTransparent;
					if ( this.isTransparent === true ) {
						renderableObject.material.opacity = this.alphaValue;
					}
					// Apply scaling, position, and rotation.
					renderableObject.scale.x = renderableObject.scale.y = renderableObject.scale.z = this.modelScale;
					renderableObject.position.y = this.positionY;
					renderableObject.rotation.x = this.rotationX;
					renderableObject.rotation.y = this.rotationY;
					renderableObject.rotation.z = this.rotationZ;
					// Enable or disable shadow casting.
					renderableObject.castShadow = this.enableShadowCast;
					// Add the configured object to the scene.
					mainScene.add( renderableObject );
					// Update the display for the object's code representation.
					refreshObjectCodeDisplay();
				};

				// Functions to manage material and geometry GUI panels.
				this.showMaterialPanel = function() {
					if ( materialControlPanel === undefined ) {
						setupMaterialGUI( displayConfig.currentMaterial );
					}
				};
				this.hideMaterialPanel = function() {
					materialControlPanel.destroy();
					materialControlPanel = undefined;
				};
				this.showGeometryPanel = function() {
					if ( geometryControlPanel === undefined ) {
						setupGeometryGUI( displayConfig.currentGeometry );
					}
				};
				this.hideGeometryPanel = function() {
					geometryControlPanel.destroy();
					geometryControlPanel = undefined;
				};

				// Method to handle custom texture application via user input.
				this.applyCustomTexture = function() {
					// Create a new popup div element.
					const texturePopup = document.createElement( 'div' );
					texturePopup.id = "textureInputPopup";

					// Create an input field for the image URL.
					const urlInputField = document.createElement( 'input' );
					urlInputField.id = "imageUrlInput";
					urlInputField.style.width = "250px";
					urlInputField.value = 'enter a valid image url here';
					urlInputField.onkeypress = function() {
						// On key press, update custom texture and rebuild object.
						CUSTOM_IMAGE_URL = urlInputField.value;
						displayConfig.constructObject();
						document.body.removeChild( texturePopup );
					};
					texturePopup.appendChild( urlInputField );

					// Create a button to confirm texture application.
					const confirmButton = document.createElement( 'button' );
					confirmButton.innerHTML = "apply image";
					confirmButton.onclick = function() {
						// On button click, update custom texture and rebuild object.
						CUSTOM_IMAGE_URL = urlInputField.value;
						displayConfig.constructObject();
						document.body.removeChild( texturePopup );
					};
					texturePopup.appendChild( confirmButton );

					// Add the popup to the document body.
					document.body.appendChild( texturePopup );

					// Log a message to the console for debugging.
					console.log( 'Custom texture function executed.' );
				};

				// Property indicating if the shape is convex.
				this.isConvexShape = false;
			}
			// Instantiate the main display object configuration.
			const displayConfig = new DisplayObjectSettings();







			// ---------------------------------------------------------------------------------------------------------------------------
			//
			//     GROUND PLANE CONFIGURATION
			//
			// ---------------------------------------------------------------------------------------------------------------------------

			function GroundPlaneConfiguration() {
				// Control visibility of the ground plane
				this.showGroundPlane = false;
				// List of available ground texture image files
				this.groundTextureAssets = ['mario.jpg', 'linen.jpg', 'crate.jpg', 'dots.jpg', 'rock_tile.jpg', 'water.jpg', 'wood.jpg', 'white.jpg', 'brillo.jpg', 'soup.jpg'];
				// Index of the currently selected texture
				this.selectedTextureIndex = 7;
				// Repetition factor for the ground texture
				this.textureRepeatFactor = 80;
				// Overall scale of the ground plane
				this.planeScaleFactor = 30;
				// Control visibility of the wireframe overlay
				this.showWireframeGround = false;
				// Line thickness for the wireframe
				this.wireframeLineThickness = 1;
				// Scale factor for the wireframe overlay
				this.wireframeScaleFactor = 1;

				// Function to create or update the textured ground plane.
				this.createGroundPlane = function() {
					// Remove the existing ground plane from the scene if present.
					if ( groundSurface !== undefined ) {
						mainScene.remove( groundSurface );
					}
					// Initialize geometry for the ground plane.
					let groundGeometry = new THREE.PlaneGeometry( 1000, 1000, 20, 20 );
					// Load the selected texture for the ground.
					let surfaceMap = THREE.ImageUtils.loadTexture( '../texturez/' + this.groundTextureAssets[ this.selectedTextureIndex ] );
					// Create a Phong material with the loaded texture.
					let groundMaterial = new THREE.MeshPhongMaterial( { map: surfaceMap } );
					// Configure texture wrapping and repetition.
					surfaceMap.wrapS = surfaceMap.wrapT = THREE.RepeatWrapping;
					surfaceMap.repeat.set( this.textureRepeatFactor, this.textureRepeatFactor );
					// Create the ground mesh.
					groundSurface = new THREE.Mesh( groundGeometry, groundMaterial );
					// Rotate the plane to be horizontal.
					groundSurface.rotation.x = -Math.PI / 2;
					// Enable the plane to receive shadows.
					groundSurface.receiveShadow = true;
					// Set the overall scale of the ground plane.
					groundSurface.scale.set( this.planeScaleFactor, this.planeScaleFactor, this.planeScaleFactor );
					// Add the ground plane to the main scene.
					mainScene.add( groundSurface );
				};

				// Function to create or update the wireframe overlay for the ground.
				this.createWireframeOverlay = function() {
					// Remove existing wireframe if present.
					if ( wireframeGround !== undefined ) {
						mainScene.remove( wireframeGround );
					}
					// Initialize geometry for the wireframe plane.
					let wireframeGeometry = new THREE.PlaneGeometry( 1000, 1000, 100, 100 );
					// Create a basic material for the wireframe with specified color and line thickness.
					let wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, wireframeLinewidth: this.wireframeLineThickness } );
					// Create the wireframe mesh.
					wireframeGround = new THREE.Mesh( wireframeGeometry, wireframeMaterial );
					// Set the scale of the wireframe.
					wireframeGround.scale.set( this.wireframeScaleFactor, this.wireframeScaleFactor, this.wireframeScaleFactor );
					// Rotate the wireframe plane to be horizontal.
					wireframeGround.rotation.x = -Math.PI / 2;
					// Add the wireframe to the main scene.
					mainScene.add( wireframeGround );
				};
			}
			// Instantiate the ground plane settings object.
			const groundSettings = new GroundPlaneConfiguration();









			// ---------------------------------------------------------------------------------------------------------------------------
			//
			//     SCENE ILLUMINATION MANAGER
			//
			// ---------------------------------------------------------------------------------------------------------------------------

			function SceneIlluminationManager() {
				// Ambient Light settings
				this.enableAmbient = true;
				this.ambientColorValue = 0x000000;
				// Hemisphere Light settings
				this.enableHemisphere = true;
				this.hemisphereSkyColor = 0xffffff;
				this.hemisphereGroundColor = 0x000000;
				this.hemisphereIntensity = 0.2;
				// Directional Light settings
				this.enableDirectional = true;
				this.directionalColorValue = 0xffffff;
				this.directionalIntensity = 0.1;
				this.directionalPosX = 0;
				this.directionalPosY = 1;
				this.directionalPosZ = 0;
				// Spotlight One settings
				this.enableSpotlightOne = true;
				this.spotlightOneColor = 0xffffff;
				this.spotlightOnePosX = 100;
				this.spotlightOnePosY = 1000;
				this.spotlightOnePosZ = 100;
				this.spotlightOneIntensity = 0.1;
				this.spotlightOneShadowDarkness = 0.2;
				// Spotlight Two settings
				this.enableSpotlightTwo = true;
				this.spotlightTwoColor = 0xffffff;
				this.spotlightTwoPosX = 100;
				this.spotlightTwoPosY = 1000;
				this.spotlightTwoPosZ = 100;
				this.spotlightTwoIntensity = 0.1;
				this.spotlightTwoShadowDarkness = 0.2;

				// Method to create or refresh the Hemisphere Light.
				this.createHemisphereLight = function() {
					if ( sceneHemisphereLight !== undefined ) {
						mainScene.remove( sceneHemisphereLight );
					}
					sceneHemisphereLight = new THREE.HemisphereLight();
					sceneHemisphereLight.color.setHex( convertDecToHex( this.hemisphereSkyColor ) );
					sceneHemisphereLight.groundColor.setHex( convertDecToHex( this.hemisphereGroundColor ) );
					sceneHemisphereLight.intensity = this.hemisphereIntensity;
					mainScene.add( sceneHemisphereLight );
				};

				// Method to create or refresh the Directional Light.
				this.createDirectionalLight = function() {
					if ( sceneDirectionalLight !== undefined ) {
						mainScene.remove( sceneDirectionalLight );
					}
					sceneDirectionalLight = new THREE.DirectionalLight();
					sceneDirectionalLight.color.setHex( convertDecToHex( this.directionalColorValue ) );
					sceneDirectionalLight.intensity = this.directionalIntensity;
					sceneDirectionalLight.position.x = this.directionalPosX;
					sceneDirectionalLight.position.y = this.directionalPosY;
					sceneDirectionalLight.position.z = this.directionalPosZ;
					sceneDirectionalLight.castShadow = true;
					mainScene.add( sceneDirectionalLight );
				};

				// Method to create or refresh the first Spotlight.
				this.createSpotlightOne = function() {
					if ( sceneSpotlightOne !== undefined ) {
						mainScene.remove( sceneSpotlightOne );
					}
					sceneSpotlightOne = new THREE.SpotLight( 0xffffff, 0.5 );
					sceneSpotlightOne.color.setHex( convertDecToHex( this.spotlightOneColor ) );
					sceneSpotlightOne.position.x = this.spotlightOnePosX;
					sceneSpotlightOne.position.y = this.spotlightOnePosY;
					sceneSpotlightOne.position.z = this.spotlightOnePosZ;
					sceneSpotlightOne.castShadow = true;
					sceneSpotlightOne.shadowDarkness = this.spotlightOneShadowDarkness;
					sceneSpotlightOne.intensity = this.spotlightOneIntensity;
					mainScene.add( sceneSpotlightOne );
				};

				// Method to create or refresh the second Spotlight.
				this.createSpotlightTwo = function() {
					if ( sceneSpotlightTwo !== undefined ) {
						mainScene.remove( sceneSpotlightTwo );
					}
					sceneSpotlightTwo = new THREE.SpotLight( 0xffffff, 0.5 );
					sceneSpotlightTwo.color.setHex( convertDecToHex( this.spotlightTwoColor ) );
					sceneSpotlightTwo.position.x = this.spotlightTwoPosX;
					sceneSpotlightTwo.position.y = this.spotlightTwoPosY;
					sceneSpotlightTwo.position.z = this.spotlightTwoPosZ;
					sceneSpotlightTwo.castShadow = true;
					sceneSpotlightTwo.shadowDarkness = this.spotlightTwoShadowDarkness;
					sceneSpotlightTwo.intensity = this.spotlightTwoIntensity;
					mainScene.add( sceneSpotlightTwo );
				};

				// Method to create or refresh the Ambient Light.
				this.createAmbientLight = function() {
					if ( sceneAmbientLight !== undefined ) {
						mainScene.remove( sceneAmbientLight );
					}
					sceneAmbientLight = new THREE.AmbientLight();
					sceneAmbientLight.color.setHex( convertDecToHex( this.ambientColorValue ) );
					mainScene.add( sceneAmbientLight );
				};

				// Functions to manage the lighting control GUI.
				this.displayLightControls = function( _value ) {
					if ( lightControlPanel === undefined ) {
						setupLightGUI();
					}
				};
				this.hideLightControls = function( _value ) {
					lightControlPanel.destroy();
					lightControlPanel = undefined;
				};
			}
			// Instantiate the scene illumination manager.
			const illuminationSettings = new SceneIlluminationManager();








			// ---------------------------------------------------------------------------------------------------------------------------
			//
			//     SCENE ENVIRONMENT CONFIGURATION
			//
			// ---------------------------------------------------------------------------------------------------------------------------

			function SceneEnvironmentConfig() {
				// Global shadow rendering toggle.
				this.enableShadowRendering = false;
				// Fog effect activation.
				this.activateFogEffect = false;
				// Color of the fog.
				this.fogColorValue = 0xf2f7ff;
				// Near distance for fog effect.
				this.fogNearDistance = 1;
				// Far distance for fog effect.
				this.fogFarDistance = 9000;
				// Reset value for environment parameters.
				this.environmentResetValue = 100000;

				// Method to apply fog settings to the main scene.
				this.applyFogToScene = function() {
					mainScene.fog = new THREE.Fog( this.fogColorValue, this.fogNearDistance, this.fogFarDistance );
				};
			}
			// Instantiate the environment configuration object.
			const environmentConfig = new SceneEnvironmentConfig();



			// ---------------------------------------------------------------------------------------------------------------------------
			//
			//     CODE/CONSOLE DISPLAY INTERFACE
			//
			// ---------------------------------------------------------------------------------------------------------------------------

			function CodeDisplayInterface() {
				// Method to programmatically select the generated object code within a display element.
				this.highlightObjectCode = function() {
					const documentRef = document;
					const codeElement = documentRef.getElementById( 'meshCodeOutput' );
					// Check for older IE text selection method.
					if ( documentRef.body.createTextRange ) {
						let selectionRange = documentRef.body.createTextRange();
						selectionRange.moveToElementText( codeElement );
						selectionRange.select();
					} else if ( window.getSelection ) {
						// Standard compliant selection method.
						let windowSelection = window.getSelection();
						let selectionRange = document.createRange();
						selectionRange.selectNodeContents( codeElement );
						windowSelection.removeAllRanges();
						windowSelection.addRange( selectionRange );
					}
				};
				// Toggles the visibility of a background element related to the console.
				this.displayBackground = false;
			}
			// Instantiate the code display interface handler.
			const interfaceHandler = new CodeDisplayInterface();