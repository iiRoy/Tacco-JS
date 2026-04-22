/*
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
CORE Simulation System - sys.js
Creator: Algorithmic Architect
Web: www.algorithmic-architect.com
version 1.0.0.1
updated 03/05/2015

This file contains the fundamental code for the CORE Simulation System. You can deploy this
file locally, on your server, or acquire the latest version from www.algorithmic-architect.com/CORE/sys.js

Thank you for exploring the CORE Simulation System; best of luck with your endeavors!
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
*/



// SIMULATION_ENGINE
// The primary constructor for the CORE Simulation System.
// An instance of this class is loaded into the SIMULATION global object once the DOM is fully loaded.
// ------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------

function SIMULATION_ENGINE(simulation,displaySurface,userInterface,overlayLayer){

	// SYSTEM_PARAMETERS
	this.upKeyActive = 0;
	this.downKeyActive = 0;
	this.leftKeyActive = 0;
	this.rightKeyActive = 0;
	this.PhysicsSystem = {physicsWorld:{},unitScale:32,isInitialized:0,debugMode:0,velocityIterations:8,positionIterations:3,fixedTimeStep:1/60};
	this.DisplaySurface = displaySurface;
	this.viewportCenter = {horiz:displaySurface.width/2,vert:displaySurface.height/2};
	this.RenderContext = this.establishContext('2d');
	this.PointerVisual = {isVisible:0,tileImages:void 0,tileTransparency:1,displayRect:void 0,currentPoint:void 0,displayImage:void 0,allImages:void 0,imageTransparency:1};
	this.FrameRateControl = {currentRate:60,previousRate:0,targetRate:30,averageRate:60,averageHistory:[],spriteLimit:15,useAnimationFrame:1,animationFrameHandle:void 0};
	this.GameInstance = simulation;
	this.OverlayLayer = overlayLayer;
	this.MapGrid = {gridVisible:0,gridColor:"#505050",lineWidth:1,lineAlpha:1};
	this.UserInterface = userInterface;
	this.previousWidth = displaySurface.width;
	this.previousHeight = displaySurface.height;
	this.InputDevice = {screenCoordinates:{coordX:0,coordY:0},worldCoordinates:{coordX:0,coordY:0},pressCoordinates:{coordX:0,coordY:0},activeTile:{gridRow:0,gridCol:0},overMap:0};
	this.engineActive = 0;
	this.globalScale = 1;
	this.CurrentScene = void 0;
	this.sceneLoadingProgress = 0;
	this.AudioAssets = [];
	this.spriteAnimationInterval = void 0;
	this.renderTiles = {rowRange:{start:0,end:0},colRange:{start:0,end:0}};
	this.renderIsoTiles = [];
	this.tilePadding = {padWidth:1,padHeight:1};
	this.engineUpdateInterval = void 0;
	this.PathfindingOverlay = {overlayEnabled:0,blockColor:"#FF0000",pathColor:"#00FF00",overlayAlpha:.25};
	this.WebGLRenderer = void 0;
	this.cameraZoom = {zoomInFactor:2,zoomOutFactor:.5};	
	
	// WebGL Integration
	if(this.renderContextType == 'webgl'){
		this.WebGLRenderer = new WebGLSystem(this.DisplaySurface, this.RenderContext);
	}
};


// RETRIEVE_ENTITY
// Fetches a game entity from the current scene by its name.
// ------------------------------------------------------------------
SIMULATION_ENGINE.prototype.RetrieveEntity = function(entityIdentifier){
	let entityCount = this.CurrentScene.gameEntities.length;
	for(let idx=0;idx<entityCount;idx++){
		if(this.CurrentScene.gameEntities[idx].entityName == entityIdentifier){
			return this.CurrentScene.gameEntities[idx];
		}
	}
}
// ------------------------------------------------------------------
// END_RETRIEVE_ENTITY


// DETECT_ENTITY_CLICKS
// Provides a list of names for entities and their components that are under a pointer click.
// ------------------------------------------------------------------
SIMULATION_ENGINE.prototype.DetectEntityClicks = function(){
	// A collection to hold the names of identified entities and their clicked physical bodies.
	let hitEntities = [];
	// Obtain the interaction point from the input device.
	let interactionPoint = {coordX:this.InputDevice.worldCoordinates.coordX, coordY:this.InputDevice.worldCoordinates.coordY};
	// Iterate through all active game entities.
	let entityCount = this.CurrentScene.gameEntities.length;
	for(let entityIdx=0;entityIdx<entityCount;entityIdx++){
		let bodyCount = this.CurrentScene.gameEntities[entityIdx].physicalBodies.length;
		let detectedObject = {entityName:this.CurrentScene.gameEntities[entityIdx].entityName,bodyNames:[],sceneIndex:entityIdx};
		for(let bodyIdx=0;bodyIdx<bodyCount;bodyIdx++){
			let physicsBody = this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].physicsBodyRef;
			let formType = this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].formType;
			let formDetails = this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].formDetails;
			// Retrieve the position of the physics body.
			let posX = ((physicsBody.GetPosition().x*this.PhysicsSystem.unitScale));
			let posY = ((physicsBody.GetPosition().y*this.PhysicsSystem.unitScale));
			let bodyCenter = {coordX:posX,coordY:posY};
			switch(formType){
				case "circle":
					if(this.isPointInCircle(interactionPoint,bodyCenter,formDetails.radius) == 1){
						detectedObject.bodyNames.push(this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].bodyName);
					}
					break;
				case "box":
					// Get the rotation angle of the body in radians.
					let rotationAngle = physicsBody.GetAngle();
					let rectangleVertices = []
					rectangleVertices.push({coordX:-(formDetails.w/2),coordY:-(formDetails.h/2)});
					rectangleVertices.push({coordX:(formDetails.w/2),coordY:-(formDetails.h/2)});
					rectangleVertices.push({coordX:(formDetails.w/2),coordY:(formDetails.h/2)});
					rectangleVertices.push({coordX:-(formDetails.w/2),coordY:(formDetails.h/2)});
					let polygonPoints = [];
					for(let pointIdx=0;pointIdx<4;pointIdx++){
						let xVal = rectangleVertices[pointIdx].coordX;
						let yVal = rectangleVertices[pointIdx].coordY;
						
						// Apply rotation to the vertices.
						let rotatedX = xVal * Math.cos(rotationAngle) - yVal * Math.sin(rotationAngle);
						let rotatedY = xVal * Math.sin(rotationAngle) + yVal * Math.cos(rotationAngle);
						
						// Add the body's position to the rotated points.
						polygonPoints.push({coordX:rotatedX + bodyCenter.coordX,coordY:rotatedY + bodyCenter.coordY});
					}
					
					// Verify if the click point is within the shape's boundaries.
					if(this.isPointInPolygon(interactionPoint,polygonPoints) == 1){
						detectedObject.bodyNames.push(this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].bodyName);
					}
					break;
				case "poly":
					// Get the rotation angle of the body in radians.
					let polyRotationAngle = physicsBody.GetAngle();
					let polyPoints = [];
					let pointCount = formDetails.length;
					for(let pointIdx=0;pointIdx<pointCount;pointIdx++){
						let xVal = formDetails[pointIdx].coordX;
						let yVal = formDetails[pointIdx].coordY;
						
						// Apply rotation to the vertices.
						let rotatedX = xVal * Math.cos(polyRotationAngle) - yVal * Math.sin(polyRotationAngle);
						let rotatedY = xVal * Math.sin(polyRotationAngle) + yVal * Math.cos(polyRotationAngle);
						
						// Add the body's position to the rotated points.
						polyPoints.push({coordX:rotatedX + bodyCenter.coordX,coordY:rotatedY + bodyCenter.coordY});
					}
					
					// Verify if the click point is within the shape's boundaries.
					if(this.isPointInPolygon(interactionPoint,polyPoints) == 1){
						detectedObject.bodyNames.push(this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].bodyName);
					}
					break;
				case "tile":
					switch(this.CurrentScene.MapData.layoutType){
						case "orthogonal":		
							// Get the rotation angle of the body in radians.
							let orthoRotationAngle = physicsBody.GetAngle();
							let orthoRectVertices = []
							orthoRectVertices.push({coordX:-(formDetails.w/2),coordY:-(formDetails.h/2)});
							orthoRectVertices.push({coordX:(formDetails.w/2),coordY:-(formDetails.h/2)});
							orthoRectVertices.push({coordX:(formDetails.w/2),coordY:(formDetails.h/2)});
							orthoRectVertices.push({coordX:-(formDetails.w/2),coordY:(formDetails.h/2)});
							let orthoPolyPoints = [];
							for(let pointIdx=0;pointIdx<4;pointIdx++){
								let xVal = orthoRectVertices[pointIdx].coordX;
								let yVal = orthoRectVertices[pointIdx].coordY;
						
								// Apply rotation to the vertices.
								let rotatedX = xVal * Math.cos(orthoRotationAngle) - yVal * Math.sin(orthoRotationAngle);
								let rotatedY = xVal * Math.sin(orthoRotationAngle) + yVal * Math.cos(orthoRotationAngle);
						
								// Add the body's position to the rotated points.
								orthoPolyPoints.push({coordX:rotatedX + bodyCenter.coordX,coordY:rotatedY + bodyCenter.coordY});
							}
					
							// Verify if the click point is within the shape's boundaries.
							if(this.isPointInPolygon(interactionPoint,orthoPolyPoints) == 1){
								detectedObject.bodyNames.push(this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].bodyName);
							}
							break;
						case "isometric":
							let isometricShape = [];
							isometricShape.push({coordX:-(formDetails.w/2),coordY:0});
							isometricShape.push({coordX:0,coordY:-(formDetails.h/2)});
							isometricShape.push({coordX:(formDetails.w/2),coordY:0});
							isometricShape.push({coordX:0,coordY:(formDetails.h/2)});
							
							// Get the rotation angle of the body in radians.
							let isoRotationAngle = physicsBody.GetAngle();
							let isoPolyPoints = [];
							let isoPointCount = isometricShape.length;
							for(let pointIdx=0;pointIdx<isoPointCount;pointIdx++){
								let xVal = isometricShape[pointIdx].coordX;
								let yVal = isometricShape[pointIdx].coordY;
						
								// Apply rotation to the vertices.
								let rotatedX = xVal * Math.cos(isoRotationAngle) - yVal * Math.sin(isoRotationAngle);
								let rotatedY = xVal * Math.sin(isoRotationAngle) + yVal * Math.cos(isoRotationAngle);
						
								// Add the body's position to the rotated points.
								isoPolyPoints.push({coordX:rotatedX + bodyCenter.coordX,coordY:rotatedY + bodyCenter.coordY});
							}
					
							// Verify if the click point is within the shape's boundaries.
							if(this.isPointInPolygon(interactionPoint,isoPolyPoints) == 1){
								detectedObject.bodyNames.push(this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].bodyName);
							}
							break;
						case "hexagonal":
							let hexagonalShape = [];
							hexagonalShape.push({coordX:-(formDetails.w/2),coordY:0});
							hexagonalShape.push({coordX:-(formDetails.w/4),coordY:-(formDetails.h/2)});
							hexagonalShape.push({coordX:(formDetails.w/4),coordY:-(formDetails.h/2)});
							hexagonalShape.push({coordX:(formDetails.w/2),coordY:0});
							hexagonalShape.push({coordX:(formDetails.w/4),coordY:(formDetails.h/2)});
							hexagonalShape.push({coordX:-(formDetails.w/4),coordY:(formDetails.h/2)});
							
							// Get the rotation angle of the body in radians.
							let hexRotationAngle = physicsBody.GetAngle();
							let hexPolyPoints = [];
							let hexPointCount = hexagonalShape.length;
							for(let pointIdx=0;pointIdx<hexPointCount;pointIdx++){
								let xVal = hexagonalShape[pointIdx].coordX;
								let yVal = hexagonalShape[pointIdx].coordY;
						
								// Apply rotation to the vertices.
								let rotatedX = xVal * Math.cos(hexRotationAngle) - yVal * Math.sin(hexRotationAngle);
								let rotatedY = xVal * Math.sin(hexRotationAngle) + yVal * Math.cos(hexRotationAngle);
						
								// Add the body's position to the rotated points.
								hexPolyPoints.push({coordX:rotatedX + bodyCenter.coordX,coordY:rotatedY + bodyCenter.coordY});
							}
					
							// Verify if the click point is within the shape's boundaries.
							if(this.isPointInPolygon(interactionPoint,hexPolyPoints) == 1){
								detectedObject.bodyNames.push(this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].bodyName);
							}
							break;
					}
					break;
			}
		}
		if(detectedObject.bodyNames.length > 0){
			hitEntities.push(detectedObject);
		}
	}
	return hitEntities;
}
// ------------------------------------------------------------------
// END_DETECT_ENTITY_CLICKS


// DETECT_SPRITE_CLICKS
// Returns a list of sprite overlay names associated with entities under the pointer.
// ------------------------------------------------------------------
SIMULATION_ENGINE.prototype.DetectSpriteClicks = function(){
	// An array to store the names of detected sprites.
	let hitSprites = [];
	// Get the pointer's world coordinates.
	let interactionPoint = {coordX:this.InputDevice.worldCoordinates.coordX, coordY:this.InputDevice.worldCoordinates.coordY};
	// Iterate through all entities in the scene.
	let entityCount = this.CurrentScene.gameEntities.length;
	for(let entityIdx=0;entityIdx<entityCount;entityIdx++){
		let bodyCount = this.CurrentScene.gameEntities[entityIdx].physicalBodies.length;
		for(let bodyIdx=0;bodyIdx<bodyCount;bodyIdx++){
			let physicsBody = this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].physicsBodyRef;
			let spriteAsset = this.CurrentScene.imageCollections[this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].VisualComponent.assetIndex];
			// Get the body's world position.
			let posX = ((physicsBody.GetPosition().x*this.PhysicsSystem.unitScale));
			let posY = ((physicsBody.GetPosition().y*this.PhysicsSystem.unitScale));
			// Check for sprites (decals) attached to this body.
			let decalCount = this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].VisualComponent.overlays.length;
			for(let decalIdx=0;decalIdx<decalCount;decalIdx++){
				// Get the decal's display rectangle.
				let spriteRectangle = this.CurrentScene.imageCollections[this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].VisualComponent.overlays[decalIdx].assetIndex].tileRects[this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].VisualComponent.overlays[decalIdx].currentFrame];	
				let spritePosition = {coordX:posX+(this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].VisualComponent.overlays[decalIdx].offsetX), coordY:posY+(this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].VisualComponent.overlays[decalIdx].offsetY)};
				// Define the collision rectangle for the sprite.
				let collisionRectangle = {coordX:0,coordY:0,w:0,h:0};
				collisionRectangle.coordX = spritePosition.coordX - ((spriteRectangle.w/2)*this.globalScale);
				collisionRectangle.coordY = spritePosition.coordY - ((spriteRectangle.h/2)*this.globalScale);
				collisionRectangle.w = spriteRectangle.w*this.globalScale;
				collisionRectangle.h = spriteRectangle.h*this.globalScale;
			
				if(this.isPointInRectangle(interactionPoint,collisionRectangle) == 1){
					hitSprites.push(this.CurrentScene.gameEntities[entityIdx].physicalBodies[bodyIdx].VisualComponent.overlays[decalIdx].overlayName);
				}	
			}
		}
	}
	return hitSprites;
}
// ------------------------------------------------------------------
// END_DETECT_SPRITE_CLICKS


// ADD_GAME_ENTITY
// Introduces a new game entity into the active scene during runtime.
// ------------------------------------------------------------------
SIMULATION_ENGINE.prototype.AddGameEntity = function(entityBlueprintName,entityInstanceID,positionData){
	if(typeof positionData != "object"){let p = {horizCoord:0,vertCoord:0,drawLayer:0}; positionData = p;};
	if(!positionData.hasOwnProperty('horizCoord')){positionData.horizCoord = 0;};
	if(!positionData.hasOwnProperty('vertCoord')){positionData.vertCoord = 0;};
	if(!positionData.hasOwnProperty('drawLayer')){positionData.drawLayer = 0;};

	// Locate the blueprint index matching the provided name.
	let blueprintCount = BLUEPRINTS.entities.length;
	let blueprintIndex = -1;
	for(let idx=0;idx<blueprintCount;idx++){
		if(entityBlueprintName == BLUEPRINTS.entities[idx].blueprintName){
			blueprintIndex = idx;
			break;
		}
	}
	if(blueprintIndex != -1){
		let currentEntityCount = this.CurrentScene.gameEntities.length;
		let assignedID = entityInstanceID;
		let initialCoords = {horiz:positionData.horizCoord,vert:positionData.vertCoord};
		let entityCollectionIndex = currentEntityCount;
		let freshEntity = new GameEntity(blueprintIndex,assignedID,initialCoords,positionData.drawLayer);
		this.CurrentScene.gameEntities.push(freshEntity);
		let bodyDefinitionCount = BLUEPRINTS.entities[blueprintIndex].bodyDefinitions.length;
		let entityBodies = []; // This variable seems unused, keeping for structural similarity.
		for(let bodyIdx=0;bodyIdx<bodyDefinitionCount;bodyIdx++){
			let newEntityBody = new PhysicalBody(BLUEPRINTS.entities[blueprintIndex].bodyDefinitions[bodyIdx].bodyName);
			freshEntity.physicalBodies.push(newEntityBody);
		}
		let jointDefinitionCount = BLUEPRINTS.entities[blueprintIndex].jointDefinitions.length;
		let entityJoints = []; // This variable seems unused, keeping for structural similarity.
		for(let jointIdx=0;jointIdx<jointDefinitionCount;jointIdx++){
			let newEntityJoint = new PhysicsJoint(BLUEPRINTS.entities[blueprintIndex].jointDefinitions[jointIdx].jointName);
			freshEntity.physicsJoints.push(newEntityJoint);
		}
		
		this.IntegrateEntityIntoPhysics(entityCollectionIndex);
	}
}
// ------------------------------------------------------------------
// END_ADD_GAME_ENTITY


// INTEGRATE_ENTITY_INTO_PHYSICS
// Incorporates a game entity into the Box2D physics simulation world.
// ------------------------------------------------------------------
SIMULATION_ENGINE.prototype.IntegrateEntityIntoPhysics = function(entityIndex){
	// Alias Box2D library types for strict renaming
	const PhysBodyDefinition = b2BodyDef;
	const PhysFixtureDefinition = b2FixtureDef;
	const PolyShapeDefinition = b2PolygonShape;
	const CircShapeDefinition = b2CircleShape;
	const Vector2D = b2Vec2;
	const PhysBodyType = {
		STATIC: b2Body.b2_staticBody,
		DYNAMIC: b2Body.b2_dynamicBody,
		KINEMATIC: b2Body.b2_kinematicBody
	};
	const DistJointDefinition = b2DistanceJointDef;
	const RevolveJointDefinition = b2RevoluteJointDef;

	let currentEntity = this.CurrentScene.gameEntities[entityIndex];
	let bodyCount = currentEntity.physicalBodies.length;
	for(let bodyIdx=0;bodyIdx<bodyCount;bodyIdx++){
		let bodyDescriptor = new PhysBodyDefinition();
		let fixtureDescriptor = new PhysFixtureDefinition();
		switch(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formType){
			case "box":		
				fixtureDescriptor.shape = new PolyShapeDefinition();
				fixtureDescriptor.shape.SetAsBox((BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.w/2)/this.PhysicsSystem.unitScale,(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.h/2)/this.PhysicsSystem.unitScale);
				break;
			case "circle":
				let sphereRadius = BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.radius/this.PhysicsSystem.unitScale;
				fixtureDescriptor.shape = new CircShapeDefinition(sphereRadius);
				break;
			case "poly":
				fixtureDescriptor.shape = new PolyShapeDefinition();
				let pointCount = BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.length;
				let vertexArray = [];
				for(let pointIdx=0;pointIdx<pointCount;pointIdx++){
					vertexArray.push({coordX:BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails[pointIdx].coordX/this.PhysicsSystem.unitScale,coordY:BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails[pointIdx].coordY/this.PhysicsSystem.unitScale});
				}
				fixtureDescriptor.shape.SetAsArray(vertexArray);
				break;
			case "tile":		
				switch(this.CurrentScene.MapData.layoutType){
					case "orthogonal":		
						fixtureDescriptor.shape = new PolyShapeDefinition();
						fixtureDescriptor.shape.SetAsBox((BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.w/2)/this.PhysicsSystem.unitScale,(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.h/2)/this.PhysicsSystem.unitScale);
						break;
					case "isometric":
						fixtureDescriptor.shape = new PolyShapeDefinition();
						fixtureDescriptor.shape.SetAsArray([
							new Vector2D(0,-(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.h/2)/this.PhysicsSystem.unitScale),
							new Vector2D((BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.w/2)/this.PhysicsSystem.unitScale,0),
							new Vector2D(0,(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.h/2)/this.PhysicsSystem.unitScale),
							new Vector2D(-(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.w/2)/this.PhysicsSystem.unitScale,0)
						]);
						break;
					case "hexagonal":		
						fixtureDescriptor.shape = new PolyShapeDefinition();
						fixtureDescriptor.shape.SetAsArray([
							new Vector2D(-(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.w/4)/this.PhysicsSystem.unitScale,-(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.h/2)/this.PhysicsSystem.unitScale),
							new Vector2D((BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.w/4)/this.PhysicsSystem.unitScale,-(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.h/2)/this.PhysicsSystem.unitScale),
							new Vector2D((BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.w/2)/this.PhysicsSystem.unitScale,0),
							new Vector2D((BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.w/4)/this.PhysicsSystem.unitScale,(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.h/2)/this.PhysicsSystem.unitScale),
							new Vector2D(-(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.w/4)/this.PhysicsSystem.unitScale,(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.h/2)/this.PhysicsSystem.unitScale),
							new Vector2D(-(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.w/2)/this.PhysicsSystem.unitScale,0)
						]);
						break;
				}
				break;
			default:
				break;
		}
		
		
		fixtureDescriptor.density = BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].fixtureDefaults.massDensity;
		fixtureDescriptor.friction = BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].fixtureDefaults.surfaceFriction;
		fixtureDescriptor.restitution = BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].fixtureDefaults.elasticity;
		fixtureDescriptor.filter.groupIndex = BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].fixtureDefaults.collisionFilter.groupID;
		
		
		switch(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].bodyKind){
			case "static":
				bodyDescriptor.type = PhysBodyType.STATIC;
				break;
			case "dynamic":
				bodyDescriptor.type = PhysBodyType.DYNAMIC;
				break;
			case "kinematic":
				bodyDescriptor.type = PhysBodyType.KINEMATIC;
				break;
		}
		
		if(bodyIdx==0){
			bodyDescriptor.position.coordX = currentEntity.initialPosition.horiz;
			bodyDescriptor.position.coordY = currentEntity.initialPosition.vert;
		}else{
			bodyDescriptor.position.coordX = currentEntity.initialPosition.horiz + BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].offsetPosition.horiz;
			bodyDescriptor.position.coordY = currentEntity.initialPosition.vert + BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].offsetPosition.vert;
		}
		
		// Convert position from pixels to Box2D units.
		bodyDescriptor.position.Set(bodyDescriptor.position.coordX/this.PhysicsSystem.unitScale,bodyDescriptor.position.coordY/this.PhysicsSystem.unitScale);
		
		bodyDescriptor.entityData = {
			bodyName				:	BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].bodyName,
			parentEntityName		:	""
		};
		bodyDescriptor.entityData.parentEntityName = currentEntity.entityName;
		
		// Adds the body to the physics world.
		currentEntity.physicalBodies[bodyIdx].physicsBodyRef = this.PhysicsSystem.physicsWorld.CreateBody(bodyDescriptor);
		
		// If the body's shape is defined as a polygon.
		if(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formType == "poly"){
			
			let pointCount = BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails.length;
			let vertexArray = [];
			for(let pointIdx=0;pointIdx<pointCount;pointIdx++){
				vertexArray.push({coordX:BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails[pointIdx].coordX/this.PhysicsSystem.unitScale,coordY:BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails[pointIdx].coordY/this.PhysicsSystem.unitScale});
			}
			
			// Polygon Convexity Check
			// Determines if polygon vertices are in clockwise order.
			//if(PhysicsShapeSeparator.validate(vertexArray)==0){console.log("Good");}else{console.log("No Good");}
		
			// Decomposes the body into convex shapes for Box2D.
			PhysicsShapeSeparator.decompose(currentEntity.physicalBodies[bodyIdx].physicsBodyRef, fixtureDescriptor, vertexArray, this.PhysicsSystem.unitScale);
		
		// If the body's shape is not a polygon.
		}else{
			
			currentEntity.physicalBodies[bodyIdx].physicsBodyRef.CreateFixture(fixtureDescriptor);
		
		}
					
		if(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].rotationLocked == 1){
			currentEntity.physicalBodies[bodyIdx].physicsBodyRef.SetFixedRotation(1);
		}
		
		// Assign the body its visual component (sprite).
		if(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].visualAsset != void 0){
			currentEntity.physicalBodies[bodyIdx].VisualComponent = new VisualComponent(BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].bodyName,BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].visualAsset,0,0,BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].initialFrame,BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].startingAnimation,BLUEPRINTS.entities[currentEntity.blueprintIndex].drawLayer);
		}else{
			currentEntity.physicalBodies[bodyIdx].VisualComponent = void 0;
		}
		
		// Assign the body its form type and detailed form properties.
		currentEntity.physicalBodies[bodyIdx].formType = BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formType;
		currentEntity.physicalBodies[bodyIdx].formDetails = BLUEPRINTS.entities[currentEntity.blueprintIndex].bodyDefinitions[bodyIdx].formDetails;
	}
	
	
	let jointCount = currentEntity.physicsJoints.length;
	for(let jointIdx=0;jointIdx<jointCount;jointIdx++){
		let jointDescriptor = new b2JointDef(); // Keep b2JointDef as it's a base class used for initialization, then specialized.
		switch(BLUEPRINTS.entities[currentEntity.blueprintIndex].jointDefinitions[jointIdx].connectionType){
			case "distance":
				currentEntity.physicsJoints[jointIdx].physicsJointRef = new DistJointDefinition();
				jointDescriptor = new DistJointDefinition();
				jointDescriptor.frequencyHz = BLUEPRINTS.entities[currentEntity.blueprintIndex].jointDefinitions[jointIdx].oscillationFrequency;
				jointDescriptor.dampingRatio = BLUEPRINTS.entities[currentEntity.blueprintIndex].jointDefinitions[jointIdx].dampeningRatio;
				jointDescriptor.collideConnected = BLUEPRINTS.entities[currentEntity.blueprintIndex].jointDefinitions[jointIdx].enableCollision;
				jointDescriptor.Initialize(currentEntity.physicalBodies[BLUEPRINTS.entities[currentEntity.blueprintIndex].jointDefinitions[jointIdx].firstBodyIndex].physicsBodyRef,currentEntity.physicalBodies[BLUEPRINTS.entities[currentEntity.blueprintIndex].jointDefinitions[jointIdx].secondBodyIndex].physicsBodyRef,currentEntity.physicalBodies[BLUEPRINTS.entities[currentEntity.blueprintIndex].jointDefinitions[jointIdx].firstBodyIndex].physicsBodyRef.GetWorldCenter(),currentEntity.physicalBodies[BLUEPRINTS.entities[currentEntity.blueprintIndex].jointDefinitions[jointIdx].secondBodyIndex].physicsBodyRef.GetWorldCenter());
				currentEntity.physicsJoints[jointIdx].physicsJointRef = this.PhysicsSystem.physicsWorld.CreateJoint(jointDescriptor);
				break;
			case "revolve":
				currentEntity.physicsJoints[jointIdx].physicsJointRef = new RevolveJointDefinition();
				jointDescriptor = new RevolveJointDefinition();
				jointDescriptor.motorSpeed = BLUEPRINTS.entities[currentEntity.blueprintIndex].jointDefinitions[jointIdx].rotationSpeed;
				jointDescriptor.maxMotorTorque = BLUEPRINTS.entities[currentEntity.blueprintIndex].jointDefinitions[jointIdx].maxTorque;
				jointDescriptor.enableMotor = BLUEPRINTS.entities[currentEntity.blueprintIndex].jointDefinitions[jointIdx].motorEnabled;