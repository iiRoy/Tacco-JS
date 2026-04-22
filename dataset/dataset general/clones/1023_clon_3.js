/*
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
CORE WORLD SIMULATOR - worldsim.js
Developer: NexGen Studios
URL: nexgenstudios.dev
Version 1.0.0 Alpha
Last Modified: 2024-07-20

This module provides the foundational simulation environment for interactive applications.
It handles rendering, physics integration, user input processing, and scene management.
Designed for adaptability across various project types, from games to interactive visualizations.
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
*/

// WorldSimulator - The central hub for all simulation activities.
// Upon document readiness, a single instance of this manager is typically loaded into a global 'SIM_CORE' object.
// --------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------

function WorldSimulator(simInstance, displayElement, interfaceModule, overlayLayer) {

    // Input state tracking
    this.inputState = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    // Physics Engine Configuration (assuming Box2D.js or similar global library)
    this.physicsEngine = {
        physicalWorld: {}, // Placeholder for the actual physics world instance
        pixelToMeterRatio: 32,
        isPhysicsReady: false,
        debugDrawingEnabled: false,
        velocityIterations: 8,
        positionIterations: 3,
        fixedTimeStep: 1 / 60
    };

    // Rendering surfaces and contexts
    this.renderingSurface = displayElement;
    this.viewportCenter = {
        x: displayElement.width / 2,
        y: displayElement.height / 2
    };
    this.renderContext = this.initRenderContext('2d'); // Default to 2D

    // Visual feedback for pointer/cursor
    this.pointerVisual = {
        isVisible: false,
        tileSet: null,
        tileOpacity: 1,
        boundingRectangle: null,
        hotspot: null,
        cursorImage: null,
        imageAssets: null,
        imageOpacity: 1
    };

    // Frame rate and performance monitoring
    this.frameRateMonitor = {
        currentFPS: 60,
        lastFrameTime: 0,
        targetFPS: 30,
        averageFPS: 60,
        fpsHistory: [],
        spriteBatchSize: 15, // Max sprites per batch for optimization
        useRequestAnimationFrame: true,
        animationFrameHandle: null
    };

    // Core application instance reference
    this.gameInstance = simInstance;

    // Additional rendering layers
    this.overlayCanvas = overlayLayer;

    // Debugging grid visualization
    this.debugGrid = {
        isEnabled: false,
        lineColor: "#505050",
        lineWidth: 1,
        lineOpacity: 1
    };

    // User interface manager
    this.userInterface = interfaceModule;

    // Previous dimensions for resize detection
    this.previousWidth = displayElement.width;
    this.previousHeight = displayElement.height;

    // Pointer/Mouse input tracking
    this.inputPointer = {
        screenCoords: {
            x: 0,
            y: 0
        },
        worldCoords: {
            x: 0,
            y: 0
        },
        pressCoords: {
            x: 0,
            y: 0
        },
        activeTile: {
            row: 0,
            col: 0
        },
        isOverMap: false
    };

    // Simulation state
    this.isEngineRunning = false;

    // Global rendering scale factor
    this.renderScaleFactor = 1.0;

    // Current active scene data
    this.currentScene = null;
    this.sceneLoadingProgress = 0;

    // Sound and audio management
    this.audioAssets = [];

    // Timers and intervals
    this.spriteAnimationTimer = null;
    this.gameLoopTimer = null;

    // Visible tile boundaries for rendering optimization
    this.visibleTileBounds = {
        row: {
            first: 0,
            last: 0
        },
        col: {
            first: 0,
            last: 0
        }
    };
    this.isometricTilesToRender = []; // For isometric specific rendering

    // Tile spacing/gutter for map rendering
    this.tileSpacing = {
        width: 1,
        height: 1
    };

    // Navigable area visualization for debugging pathfinding
    this.navigableAreas = {
        showNavigable: false,
        unwalkableColor: "#FF0000",
        walkableColor: "#00FF00",
        areaOpacity: 0.25
    };

    // WebGL specific renderer instance
    this.webGLRenderer = null;

    // Camera zoom levels
    this.cameraZoom = {
        in: 2,
        out: 0.5
    };

    // Initialize WebGL if context type is specified
    if (this.contextType === 'webgl') {
        this.webGLRenderer = new WebGLRenderingSystem(this.renderingSurface, this.renderContext);
    }

    // Helper for context initialization (example of a small extracted method)
    this.initRenderContext = function(type) {
        if (!this.renderingSurface) {
            console.error("Rendering surface (canvas) is not provided.");
            return null;
        }
        return this.renderingSurface.getContext(type);
    };
}

// Placeholder for global asset collection, assuming it's structured similarly to original POLE
const ASSET_COLLECTION = {
    actors: []
};

// Placeholder classes for type III changes
function SceneEntity(templateIdx, entityName, initialPos, renderLayer) {
    this.templateRefIndex = templateIdx;
    this.name = entityName;
    this.position = initialPos;
    this.renderLayer = renderLayer;
    this.bodies = [];
    this.joints = [];
}

function EntityPhysicalBody(bodyName) {
    this.name = bodyName;
    this.fb2Body = null; // Box2D body reference
    this.Sprite = null; // Sprite component reference
    this.shape = null;
    this.shapeDefinition = null;
}

function EntityPhysicsJoint(jointName) {
    this.name = jointName;
    this.fb2Joint = null; // Box2D joint reference
}

function EntitySpriteComponent(name, sheet, x, y, frame, anim, layer) {
    this.name = name;
    this.pIndex = sheet; // Placeholder for sheet index
    this.x = x;
    this.y = y;
    this.frame = frame;
    this.animation = anim;
    this.layer = layer;
    this.decals = []; // Sub-sprites/decals
}

// Placeholder for Box2D-like library aliases
const PhysBodyDef = Box2D.Dynamics.b2BodyDef;
const PhysFixtureDef = Box2D.Dynamics.b2FixtureDef;
const PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const CircleShape = Box2D.Collision.Shapes.b2CircleShape;
const Vec2 = Box2D.Common.Math.b2Vec2;
const BodyType = Box2D.Dynamics.b2Body;
const PhysJointDef = Box2D.Dynamics.Joints.b2JointDef;
const DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;
const RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

// Placeholder for polygon separation tool
const PhysicsShapeTool = {
    validatePolygon: function(vertices) {
        // Dummy implementation
        return 0; // 0 for good
    },
    decomposePolygon: function(body, fixture, vertices, scale) {
        // Dummy implementation
        // This would typically iterate and create multiple fixtures for concave shapes
    }
};

// ------------------------------------------------------------------
// Scene Entity Retrieval
// Obtains a reference to an entity within the current scene by its unique identifier.
// ------------------------------------------------------------------
WorldSimulator.prototype.findSceneEntity = function(entityIdentifier) {
    if (!this.currentScene || !this.currentScene.actors) {
        console.warn("No active scene or entity list to search.");
        return null;
    }

    const sceneEntities = this.currentScene.actors;
    const totalEntities = sceneEntities.length;

    for (let idx = 0; idx < totalEntities; ++idx) {
        if (sceneEntities[idx].name === entityIdentifier) {
            return sceneEntities[idx];
        }
    }
    return null; // Entity not found
};
// ------------------------------------------------------------------
// END Scene Entity Retrieval

// ------------------------------------------------------------------
// Query Clickable Bodies
// Returns a collection of entities and their physical bodies that intersect with a pointer click.
// ------------------------------------------------------------------
WorldSimulator.prototype.queryClickableBodies = function() {
    const hitEntities = [];
    const interactionCoords = {
        x: this.inputPointer.worldCoords.x,
        y: this.inputPointer.worldCoords.y
    };

    // Ensure physics is ready and scene data exists
    if (!this.physicsEngine.isPhysicsReady || !this.currentScene || !this.currentScene.actors) {
        return hitEntities;
    }

    const entityCount = this.currentScene.actors.length;
    for (let entityIdx = 0; entityIdx < entityCount; ++entityIdx) {
        const currentEntity = this.currentScene.actors[entityIdx];
        const bodyCount = currentEntity.bodies.length;
        const detectedObject = {
            name: currentEntity.name,
            bodies: [],
            sceneIndex: entityIdx
        };

        for (let bodyIdx = 0; bodyIdx < bodyCount; ++bodyIdx) {
            const currentBodyComponent = currentEntity.bodies[bodyIdx];
            const physicsBody = currentBodyComponent.fb2Body;
            const bodyShapeType = currentBodyComponent.shape;
            const shapeParams = currentBodyComponent.shapeDefinition;

            if (!physicsBody || !bodyShapeType || !shapeParams) {
                continue; // Skip if essential data is missing
            }

            const bodyPhysicsPosition = physicsBody.GetPosition();
            const bodyCenterCoords = {
                x: bodyPhysicsPosition.x * this.physicsEngine.pixelToMeterRatio,
                y: bodyPhysicsPosition.y * this.physicsEngine.pixelToMeterRatio
            };

            const rotationAngleRad = physicsBody.GetAngle();
            let transformedVertices = [];
            let isHit = false;

            switch (bodyShapeType) {
                case "circle":
                    const radiusPx = shapeParams.radius;
                    isHit = this.isPointInCircle(interactionCoords, bodyCenterCoords, radiusPx);
                    break;

                case "box":
                    const baseRectVertices = [{
                        x: -(shapeParams.w / 2),
                        y: -(shapeParams.h / 2)
                    }, {
                        x: (shapeParams.w / 2),
                        y: -(shapeParams.h / 2)
                    }, {
                        x: (shapeParams.w / 2),
                        y: (shapeParams.h / 2)
                    }, {
                        x: -(shapeParams.w / 2),
                        y: (shapeParams.h / 2)
                    }, ];
                    transformedVertices = this.transformVertices(baseRectVertices, bodyCenterCoords, rotationAngleRad);
                    isHit = this.isPointInPolygon(interactionCoords, transformedVertices);
                    break;

                case "poly":
                    // Polygon vertices are already defined relative to body origin
                    transformedVertices = this.transformVertices(shapeParams, bodyCenterCoords, rotationAngleRad);
                    isHit = this.isPointInPolygon(interactionCoords, transformedVertices);
                    break;

                case "tile":
                    const mapType = this.currentScene.Map ? this.currentScene.Map.type : "orthogonal";
                    let tileShapeVertices = [];

                    switch (mapType) {
                        case "orthogonal":
                            tileShapeVertices = [{
                                x: -(shapeParams.w / 2),
                                y: -(shapeParams.h / 2)
                            }, {
                                x: (shapeParams.w / 2),
                                y: -(shapeParams.h / 2)
                            }, {
                                x: (shapeParams.w / 2),
                                y: (shapeParams.h / 2)
                            }, {
                                x: -(shapeParams.w / 2),
                                y: (shapeParams.h / 2)
                            }, ];
                            break;
                        case "isometric":
                            tileShapeVertices = [{
                                x: -(shapeParams.w / 2),
                                y: 0
                            }, {
                                x: 0,
                                y: -(shapeParams.h / 2)
                            }, {
                                x: (shapeParams.w / 2),
                                y: 0
                            }, {
                                x: 0,
                                y: (shapeParams.h / 2)
                            }, ];
                            break;
                        case "hexagonal":
                            tileShapeVertices = [{
                                x: -(shapeParams.w / 2),
                                y: 0
                            }, {
                                x: -(shapeParams.w / 4),
                                y: -(shapeParams.h / 2)
                            }, {
                                x: (shapeParams.w / 4),
                                y: -(shapeParams.h / 2)
                            }, {
                                x: (shapeParams.w / 2),
                                y: 0
                            }, {
                                x: (shapeParams.w / 4),
                                y: (shapeParams.h / 2)
                            }, {
                                x: -(shapeParams.w / 4),
                                y: (shapeParams.h / 2)
                            }, ];
                            break;
                        default:
                            console.warn(`Unsupported map type for tile shape detection: ${mapType}`);
                            break;
                    }
                    transformedVertices = this.transformVertices(tileShapeVertices, bodyCenterCoords, rotationAngleRad);
                    isHit = this.isPointInPolygon(interactionCoords, transformedVertices);
                    break;
            }

            if (isHit) {
                detectedObject.bodies.push(currentBodyComponent.name);
            }
        }

        if (detectedObject.bodies.length > 0) {
            hitEntities.push(detectedObject);
        }
    }
    return hitEntities;
};

// Internal helper for point-in-circle test
WorldSimulator.prototype.isPointInCircle = function(point, circleCenter, radius) {
    const dx = point.x - circleCenter.x;
    const dy = point.y - circleCenter.y;
    return (dx * dx + dy * dy) <= (radius * radius);
};

// Internal helper for point-in-polygon test (ray casting algorithm)
WorldSimulator.prototype.isPointInPolygon = function(point, polygonVertices) {
    let intersectionCount = 0;
    const numVertices = polygonVertices.length;

    for (let i = 0, j = numVertices - 1; i < numVertices; j = i++) {
        const v1 = polygonVertices[i];
        const v2 = polygonVertices[j];

        // Check if the ray from point.x intersects the edge (v1, v2)
        if (((v1.y > point.y) !== (v2.y > point.y)) &&
            (point.x < (v2.x - v1.x) * (point.y - v1.y) / (v2.y - v1.y) + v1.x)) {
            intersectionCount++;
        }
    }
    return (intersectionCount % 2) === 1;
};

// Internal helper to apply rotation and translation to vertices
WorldSimulator.prototype.transformVertices = function(baseVertices, bodyCenter, angle) {
    const transformed = [];
    for (const vertex of baseVertices) {
        const rotatedX = vertex.x * Math.cos(angle) - vertex.y * Math.sin(angle);
        const rotatedY = vertex.x * Math.sin(angle) + vertex.y * Math.cos(angle);
        transformed.push({
            x: rotatedX + bodyCenter.x,
            y: rotatedY + bodyCenter.y
        });
    }
    return transformed;
};
// ------------------------------------------------------------------
// END Query Clickable Bodies

// ------------------------------------------------------------------
// Query Sprite Decals At Pointer
// Fetches a list of sprite decal names that are under the current pointer location.
// ------------------------------------------------------------------
WorldSimulator.prototype.querySpriteDecalsAtPointer = function() {
    const hitDecalNames = [];
    const interactionCoords = {
        x: this.inputPointer.worldCoords.x,
        y: this.inputPointer.worldCoords.y
    };

    if (!this.currentScene || !this.currentScene.actors) {
        return hitDecalNames;
    }

    for (const entity of this.currentScene.actors) {
        if (!entity || !entity.bodies) continue;

        for (const bodyComponent of entity.bodies) {
            const physicsBody = bodyComponent.fb2Body;
            const spriteComponent = bodyComponent.Sprite;

            if (!physicsBody || !spriteComponent || !spriteComponent.decals || spriteComponent.decals.length === 0) {
                continue;
            }

            const bodyPhysicsPosition = physicsBody.GetPosition();
            const bodyRenderX = bodyPhysicsPosition.x * this.physicsEngine.pixelToMeterRatio;
            const bodyRenderY = bodyPhysicsPosition.y * this.physicsEngine.pixelToMeterRatio;

            for (const decal of spriteComponent.decals) {
                const decalSpriteSheet = this.currentScene.spriteSheets[decal.pIndex];
                if (!decalSpriteSheet || !decalSpriteSheet.tileRects || !decalSpriteSheet.tileRects[decal.frame]) {
                    continue;
                }

                const decalFrameRect = decalSpriteSheet.tileRects[decal.frame];
                const decalRenderPosition = {
                    x: bodyRenderX + decal.x,
                    y: bodyRenderY + decal.y
                };

                const hitTestRectangle = {
                    x: decalRenderPosition.x - ((decalFrameRect.w / 2) * this.renderScaleFactor),
                    y: decalRenderPosition.y - ((decalFrameRect.h / 2) * this.renderScaleFactor),
                    width: decalFrameRect.w * this.renderScaleFactor,
                    height: decalFrameRect.h * this.renderScaleFactor
                };

                if (interactionCoords.x >= hitTestRectangle.x &&
                    interactionCoords.x <= hitTestRectangle.x + hitTestRectangle.width &&
                    interactionCoords.y >= hitTestRectangle.y &&
                    interactionCoords.y <= hitTestRectangle.y + hitTestRectangle.height) {
                    hitDecalNames.push(decal.name);
                }
            }
        }
    }
    return hitDecalNames;
};
// ------------------------------------------------------------------
// END Query Sprite Decals At Pointer

// ------------------------------------------------------------------
// Spawn Entity Into Scene
// Dynamically adds a new entity instance to the current scene during runtime.
// ------------------------------------------------------------------
WorldSimulator.prototype.spawnEntityIntoScene = function(entityTemplateName, newEntityInstanceID, creationOptions = {}) {
    const {
        x = 0, y = 0, layer = 0
    } = creationOptions;

    let templateIndex = -1;
    for (let i = 0; i < ASSET_COLLECTION.actors.length; ++i) {
        if (entityTemplateName === ASSET_COLLECTION.actors[i].name) {
            templateIndex = i;
            break;
        }
    }

    if (templateIndex === -1) {
        console.error(`Entity template "${entityTemplateName}" not found in asset collection.`);
        return; // Early exit if template doesn't exist
    }

    const templateData = ASSET_COLLECTION.actors[templateIndex];
    const initialPosition = {
        x: x,
        y: y
    };
    const spawnedEntity = new SceneEntity(templateIndex, newEntityInstanceID, initialPosition, layer);

    // Add the new entity to the scene's actor list
    if (!this.currentScene.actors) {
        this.currentScene.actors = [];
    }
    this.currentScene.actors.push(spawnedEntity);
    const entitySceneIndex = this.currentScene.actors.length - 1; // Get the actual index in the scene

    // Process physical bodies for the new entity
    for (const bodyTemplate of templateData.bodies) {
        const newBodyComponent = new EntityPhysicalBody(bodyTemplate.name);
        spawnedEntity.bodies.push(newBodyComponent);
    }

    // Process joints for the new entity
    for (const jointTemplate of templateData.joints) {
        const newJointComponent = new EntityPhysicsJoint(jointTemplate.name);
        spawnedEntity.joints.push(newJointComponent);
    }

    // Integrate the newly created entity's bodies and joints into the physics world
    this.integrateEntityIntoPhysicsWorld(entitySceneIndex);
};
// ------------------------------------------------------------------
// END Spawn Entity Into Scene

// ------------------------------------------------------------------
// Integrate Entity Into Physics World
// Incorporates an entity's physical bodies and joints into the Box2D physics simulation.
// ------------------------------------------------------------------
WorldSimulator.prototype.integrateEntityIntoPhysicsWorld = function(entityIndex) {
    if (!this.physicsEngine.isPhysicsReady || !this.physicsEngine.physicalWorld) {
        console.warn("Physics engine not ready. Cannot integrate entity.");
        return;
    }
    if (!this.currentScene || !this.currentScene.actors || !this.currentScene.actors[entityIndex]) {
        console.error(`Attempted to integrate non-existent entity at index ${entityIndex}.`);
        return;
    }

    const targetEntity = this.currentScene.actors[entityIndex];
    const entityTemplate = ASSET_COLLECTION.actors[targetEntity.templateRefIndex];

    if (!entityTemplate) {
        console.error(`Entity template for ref index ${targetEntity.templateRefIndex} not found.`);
        return;
    }

    // Process all physical bodies defined for this entity
    for (let bodyIdx = 0; bodyIdx < entityTemplate.bodies.length; ++bodyIdx) {
        const bodyTemplate = entityTemplate.bodies[bodyIdx];
        const currentBodyComponent = targetEntity.bodies[bodyIdx];

        const physicsBodyDefinition = new PhysBodyDef();
        const fixtureDefinition = new PhysFixtureDef();

        // Determine fixture shape based on template
        switch (bodyTemplate.shape) {
            case "box":
                fixtureDefinition.shape = new PolygonShape();
                fixtureDefinition.shape.SetAsBox(
                    (bodyTemplate.shapeDefinition.w / 2) / this.physicsEngine.pixelToMeterRatio,
                    (bodyTemplate.shapeDefinition.h / 2) / this.physicsEngine.pixelToMeterRatio
                );
                break;
            case "circle":
                const circleRadius = bodyTemplate.shapeDefinition.radius / this.physicsEngine.pixelToMeterRatio;
                fixtureDefinition.shape = new CircleShape(circleRadius);
                break;
            case "poly":
                fixtureDefinition.shape = new PolygonShape();
                const polyVertices = bodyTemplate.shapeDefinition.map(v => ({
                    x: v.x / this.physicsEngine.pixelToMeterRatio,
                    y: v.y / this.physicsEngine.pixelToMeterRatio
                }));
                fixtureDefinition.shape.SetAsArray(polyVertices);
                break;
            case "tile":
                const mapLayoutType = this.currentScene.Map ? this.currentScene.Map.type : "orthogonal";
                fixtureDefinition.shape = new PolygonShape();
                const tileShapeDef = bodyTemplate.shapeDefinition;
                const halfW = (tileShapeDef.w / 2) / this.physicsEngine.pixelToMeterRatio;
                const halfH = (tileShapeDef.h / 2) / this.physicsEngine.pixelToMeterRatio;
                const quarterW = (tileShapeDef.w / 4) / this.physicsEngine.pixelToMeterRatio;
                const quarterH = (tileShapeDef.h / 4) / this.physicsEngine.pixelToMeterRatio;


                switch (mapLayoutType) {
                    case "orthogonal":
                        fixtureDefinition.shape.SetAsBox(halfW, halfH);
                        break;
                    case "isometric":
                        fixtureDefinition.shape.SetAsArray([
                            new Vec2(0, -halfH),
                            new Vec2(halfW, 0),
                            new Vec2(0, halfH),
                            new Vec2(-halfW, 0)
                        ]);
                        break;
                    case "hexagonal":
                        fixtureDefinition.shape.SetAsArray([
                            new Vec2(-quarterW, -halfH),
                            new Vec2(quarterW, -halfH),
                            new Vec2(halfW, 0),
                            new Vec2(quarterW, halfH),
                            new Vec2(-quarterW, halfH),
                            new Vec2(-halfW, 0)
                        ]);
                        break;
                }
                break;
            default:
                console.warn(`Unknown shape type for body: ${bodyTemplate.shape}`);
                continue; // Skip to next body
        }

        // Apply common fixture properties
        fixtureDefinition.density = bodyTemplate.fixDef.density;
        fixtureDefinition.friction = bodyTemplate.fixDef.friction;
        fixtureDefinition.restitution = bodyTemplate.fixDef.restitution;
        fixtureDefinition.filter.groupIndex = bodyTemplate.fixDef.filter.groupIndex;

        // Set body type
        switch (bodyTemplate.type) {
            case "static":
                physicsBodyDefinition.type = BodyType.b2_staticBody;
                break;
            case "dynamic":
                physicsBodyDefinition.type = BodyType.b2_dynamicBody;
                break;
            case "kinematic":
                physicsBodyDefinition.type = BodyType.b2_kinematicBody;
                break;
            default:
                physicsBodyDefinition.type = BodyType.b2_staticBody; // Default to static
                break;
        }

        // Set initial body position
        let initialBodyPosX = targetEntity.position.x;
        let initialBodyPosY = targetEntity.position.y;

        if (bodyIdx > 0) { // If it's not the root body, add its relative offset
            initialBodyPosX += bodyTemplate.position.x;
            initialBodyPosY += bodyTemplate.position.y;
        }

        physicsBodyDefinition.position.Set(
            initialBodyPosX / this.physicsEngine.pixelToMeterRatio,
            initialBodyPosY / this.physicsEngine.pixelToMeterRatio
        );

        // Assign user data for identification during collision callbacks
        physicsBodyDefinition.userData = {
            componentName: bodyTemplate.name,
            parentEntityName: targetEntity.name,
            isPhysicsBody: true // Custom flag for Box2D user data
        };

        // Create the body in the physics world
        currentBodyComponent.fb2Body = this.physicsEngine.physicalWorld.CreateBody(physicsBodyDefinition);

        // Special handling for polygon shapes that might need decomposition (concave polygons)
        if (bodyTemplate.shape === "poly") {
            const originalVerticesInPixels = bodyTemplate.shapeDefinition;
            // Optionally validate polygon winding or convexity
            // if (PhysicsShapeTool.validatePolygon(originalVerticesInPixels) !== 0) {
            //     console.warn(`Polygon for body ${bodyTemplate.name} is invalid or concave.`);
            // }
            PhysicsShapeTool.decomposePolygon(currentBodyComponent.fb2Body, fixtureDefinition, originalVerticesInPixels, this.physicsEngine.pixelToMeterRatio);
        } else {
            // For simple shapes, just create the fixture directly
            currentBodyComponent.fb2Body.CreateFixture(fixtureDefinition);
        }

        // Set fixed rotation property if specified
        if (bodyTemplate.fixedRotation === true) {
            currentBodyComponent.fb2Body.SetFixedRotation(true);
        }

        // Attach sprite component if available
        if (bodyTemplate.spriteSheet !== null) {
            currentBodyComponent.Sprite = new EntitySpriteComponent(
                bodyTemplate.name,
                bodyTemplate.spriteSheet,
                0, // Placeholder X offset, actual position handled by rendering
                0, // Placeholder Y offset
                bodyTemplate.frame,
                bodyTemplate.animation,
                entityTemplate.layer
            );
        } else {
            currentBodyComponent.Sprite = null;
        }

        // Store shape details on the body component for later use (e.g., click detection)
        currentBodyComponent.shape = bodyTemplate.shape;
        currentBodyComponent.shapeDefinition = bodyTemplate.shapeDefinition;
    }

    // Process all physics joints defined for this entity
    for (let jointIdx = 0; jointIdx < entityTemplate.joints.length; ++jointIdx) {
        const jointTemplate = entityTemplate.joints[jointIdx];
        const currentJointComponent = targetEntity.joints[jointIdx];

        let physicsJointDefinition; // Local variable for joint definition

        // Ensure referenced bodies exist before creating joint
        const bodyA = targetEntity.bodies[jointTemplate.body1];
        const bodyB = targetEntity.bodies[jointTemplate.body2];

        if (!bodyA || !bodyB || !bodyA.fb2Body || !bodyB.fb2Body) {
            console.error(`Cannot create joint "${jointTemplate.name}": one or both bodies are missing.`);
            continue;
        }

        switch (jointTemplate.type) {
            case "distance":
                physicsJointDefinition = new DistanceJointDef();
                physicsJointDefinition.frequencyHz = jointTemplate.frequencyHz;
                physicsJointDefinition.dampingRatio = jointTemplate.dampingRatio;
                physicsJointDefinition.collideConnected = jointTemplate.collideConnected;
                physicsJointDefinition.Initialize(
                    bodyA.fb2Body,
                    bodyB.fb2Body,
                    bodyA.fb2Body.GetWorldCenter(),
                    bodyB.fb2Body.GetWorldCenter()
                );
                currentJointComponent.fb2Joint = this.physicsEngine.physicalWorld.CreateJoint(physicsJointDefinition);
                break;
            case "revolve":
                physicsJointDefinition = new RevoluteJointDef();
                physicsJointDefinition.motorSpeed = jointTemplate.motorSpeed;
                physicsJointDefinition.maxMotorTorque = jointTemplate.maxMotorTorque;
                physicsJointDefinition.enableMotor = jointTemplate.enableMotor;
                // Initialize for revolute joint would typically include anchor points
                // The original code was cut off here, so I'll just follow the pattern.
                break;
                // ... other joint types would follow
        }
    }
};
// ------------------------------------------------------------------
// END Integrate Entity Into Physics World