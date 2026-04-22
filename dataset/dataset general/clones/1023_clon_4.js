const WORLD_SCHEMA = {
    units: [],
    spriteAtlases: []
};

const makeUnit = (prototypeIdx, instanceTag, initialPos, layerVal) => ({
    prototypeId: prototypeIdx,
    identifier: instanceTag,
    placement: initialPos,
    renderLayer: layerVal,
    components: [],
    linkages: []
});

const makeComponent = (componentLabel) => ({
    label: componentLabel,
    physicsBody: null,
    shapeType: null,
    shapeGeometry: null,
    visualSprite: null
});

const makeLinkage = (linkageLabel) => ({
    label: linkageLabel,
    physicsJoint: null
});

const makeVisualSprite = (label, sheetName, xOffset, yOffset, frameIndex, animationType, renderLevel) => ({
    displayLabel: label,
    atlasName: sheetName,
    offsetX: xOffset,
    offsetY: yOffset,
    frameIdx: frameIndex,
    animStyle: animationType,
    renderOrder: renderLevel,
    overlays: []
});

const isPointInCircle = (testPoint, centerPoint, radius) => {
    const dx = testPoint.x - centerPoint.x;
    const dy = testPoint.y - centerPoint.y;
    return (dx * dx + dy * dy) <= (radius * radius);
};

const isPointInPolygon = (testPoint, polygonVertices) => {
    let intersectionCount = 0;
    const vertexCount = polygonVertices.length;
    for (let i = 0, j = vertexCount - 1; i < vertexCount; j = i++) {
        const vI = polygonVertices[i];
        const vJ = polygonVertices[j];

        const intersect = ((vI.y > testPoint.y) !== (vJ.y > testPoint.y)) &&
                          (testPoint.x < (vJ.x - vI.x) * (testPoint.y - vI.y) / (vJ.y - vI.y) + vI.x);
        if (intersect) {
            intersectionCount++;
        }
    }
    return (intersectionCount % 2) === 1;
};

const checkPointInBounds = (testPoint, rectangle) => {
    return (testPoint.x >= rectangle.x && testPoint.x <= (rectangle.x + rectangle.w) &&
            testPoint.y >= rectangle.y && testPoint.y <= (rectangle.y + rectangle.h));
};

function generateGameCore(gameConfig, visualCanvas, interfaceDisplay, transparentLayer) {
    const internalState = {
        keyUp: false,
        keyDown: false,
        keyLeft: false,
        keyRight: false,
        physicalEnv: {
            worldInstance: {},
            scaleFactor: 32,
            initialized: false,
            debugMode: false,
            velocityIterations: 8,
            positionIterations: 3,
            stepInterval: 1/60
        },
        displayTarget: visualCanvas,
        displayCenter: { x: visualCanvas.width / 2, y: visualCanvas.height / 2 },
        renderContext: null,
        pointerOverlay: {
            visible: false,
            graphicTiles: null,
            tileOpacity: 1,
            boundaryBox: null,
            focusPoint: null,
            graphicImage: null,
            graphicImages: null,
            imageOpacity: 1
        },
        frameRate: {
            current: 60,
            previous: 0,
            target: 30,
            average: 60,
            averageHistory: [],
            spritesPerFrame: 15,
            useAnimationFrames: true,
            animationFrameHandle: null
        },
        activeGame: gameConfig,
        overlayInterface: interfaceDisplay,
        transparentSurface: transparentLayer,
        prevWidth: visualCanvas.width,
        prevHeight: visualCanvas.height,
        inputPointer: {
            screenCoords: { x: 0, y: 0 },
            worldCoords: { x: 0, y: 0 },
            pressCoords: { x: 0, y: 0 },
            tileLocation: { row: 0, col: 0 },
            inWorldBounds: false
        },
        engineRunning: false,
        displayZoom: 1,
        currentWorld: {
            entities: [],
            spriteAtlases: [],
            mapData: { layoutType: "orthogonal" }
        },
        worldLoadProgress: 0,
        audioCues: [],
        spriteAnimationTimer: null,
        tileDrawingBounds: {
            rowRange: { start: 0, end: 0 },
            colRange: { start: 0, end: 0 }
        },
        isoTileDrawingList: [],
        tileSpacing: { width: 1, height: 1 },
        updateLoopTimer: null,
        pathfindingEnabled: {
            active: false,
            colorBlocked: "#FF0000",
            colorOpen: "#00FF00",
            opacity: .25
        },
        webGlInterface: null,
        zoomSettings: { zoomInFactor: 2, zoomOutFactor: 0.5 }
    };

    const acquireRenderer = (type) => {
        internalState.renderContext = internalState.displayTarget.getContext(type);
        return internalState.renderContext;
    };
    internalState.renderContext = acquireRenderer('2d');

    if (gameConfig && gameConfig.renderMode === 'webgl') {
        internalState.webGlInterface = {};
    }

    const coreMethods = {
        retrieveUnit(unitTag) {
            return internalState.currentWorld.entities.find(element => element.identifier === unitTag);
        },

        detectUnitClicks() {
            const hitEntities = [];
            const clickPosition = { x: internalState.inputPointer.worldCoords.x, y: internalState.inputPointer.worldCoords.y };

            internalState.currentWorld.entities.forEach((entity, entityIndex) => {
                const entityHits = {
                    tag: entity.identifier,
                    parts: [],
                    elementIndex: entityIndex
                };

                entity.components.forEach(part => {
                    const physicalPart = part.physicsBody;
                    const partShape = part.shapeType;
                    const partGeometry = part.shapeGeometry;

                    const partWorldPosition = {
                        x: (physicalPart.GetPosition().x * internalState.physicalEnv.scaleFactor),
                        y: (physicalPart.GetPosition().y * internalState.physicalEnv.scaleFactor)
                    };

                    let isPartHit = false;
                    const currentMapType = internalState.currentWorld.mapData.layoutType;

                    const shapeHandlers = {
                        "circle": () => isPointInCircle(clickPosition, partWorldPosition, partGeometry.radius),
                        "box": () => {
                            const bodyAngle = physicalPart.GetAngle();
                            const rectCorners = [
                                { x: -(partGeometry.w / 2), y: -(partGeometry.h / 2) },
                                { x: (partGeometry.w / 2), y: -(partGeometry.h / 2) },
                                { x: (partGeometry.w / 2), y: (partGeometry.h / 2) },
                                { x: -(partGeometry.w / 2), y: (partGeometry.h / 2) }
                            ];
                            const transformedPoints = rectCorners.map(pt => {
                                const rotatedX = pt.x * Math.cos(bodyAngle) - pt.y * Math.sin(bodyAngle);
                                const rotatedY = pt.x * Math.sin(bodyAngle) + pt.y * Math.cos(bodyAngle);
                                return { x: rotatedX + partWorldPosition.x, y: rotatedY + partWorldPosition.y };
                            });
                            return isPointInPolygon(clickPosition, transformedPoints);
                        },
                        "poly": () => {
                            const bodyAngle = physicalPart.GetAngle();
                            const transformedPoints = partGeometry.map(pt => {
                                const rotatedX = pt.x * Math.cos(bodyAngle) - pt.y * Math.sin(bodyAngle);
                                const rotatedY = pt.x * Math.sin(bodyAngle) + pt.y * Math.cos(bodyAngle);
                                return { x: rotatedX + partWorldPosition.x, y: rotatedY + partWorldPosition.y };
                            });
                            return isPointInPolygon(clickPosition, transformedPoints);
                        },
                        "tile": () => {
                            const bodyAngle = physicalPart.GetAngle();
                            let tileShapePoints = [];
                            switch (currentMapType) {
                                case "orthogonal":
                                    tileShapePoints = [
                                        { x: -(partGeometry.w / 2), y: -(partGeometry.h / 2) },
                                        { x: (partGeometry.w / 2), y: -(partGeometry.h / 2) },
                                        { x: (partGeometry.w / 2), y: (partGeometry.h / 2) },
                                        { x: -(partGeometry.w / 2), y: (partGeometry.h / 2) }
                                    ];
                                    break;
                                case "isometric":
                                    tileShapePoints = [
                                        { x: -(partGeometry.w / 2), y: 0 },
                                        { x: 0, y: -(partGeometry.h / 2) },
                                        { x: (partGeometry.w / 2), y: 0 },
                                        { x: 0, y: (partGeometry.h / 2) }
                                    ];
                                    break;
                                case "hexagonal":
                                    tileShapePoints = [
                                        { x: -(partGeometry.w / 2), y: 0 },
                                        { x: -(partGeometry.w / 4), y: -(partGeometry.h / 2) },
                                        { x: (partGeometry.w / 4), y: -(partGeometry.h / 2) },
                                        { x: (partGeometry.w / 2), y: 0 },
                                        { x: (partGeometry.w / 4), y: (partGeometry.h / 2) },
                                        { x: -(partGeometry.w / 4), y: (partGeometry.h / 2) }
                                    ];
                                    break;
                                default:
                                    return false;
                            }
                            const transformedPoints = tileShapePoints.map(pt => {
                                const rotatedX = pt.x * Math.cos(bodyAngle) - pt.y * Math.sin(bodyAngle);
                                const rotatedY = pt.x * Math.sin(bodyAngle) + pt.y * Math.cos(bodyAngle);
                                return { x: rotatedX + partWorldPosition.x, y: rotatedY + partWorldPosition.y };
                            });
                            return isPointInPolygon(clickPosition, transformedPoints);
                        }
                    };

                    isPartHit = (shapeHandlers[partShape] || (() => false))();

                    if (isPartHit) {
                        entityHits.parts.push(part.label);
                    }
                });

                if (entityHits.parts.length > 0) {
                    hitEntities.push(entityHits);
                }
            });
            return hitEntities;
        },

        detectComponentGraphicsClicks() {
            const graphicHits = [];
            const clickPosition = { x: internalState.inputPointer.worldCoords.x, y: internalState.inputPointer.worldCoords.y };

            internalState.currentWorld.entities.forEach(entity => {
                entity.components.forEach(part => {
                    const physicalPart = part.physicsBody;

                    const partWorldPosition = {
                        x: (physicalPart.GetPosition().x * internalState.physicalEnv.scaleFactor),
                        y: (physicalPart.GetPosition().y * internalState.physicalEnv.scaleFactor)
                    };

                    if (part.visualSprite && part.visualSprite.overlays) {
                        part.visualSprite.overlays.forEach(overlay => {
                            const overlayRectData = WORLD_SCHEMA.spriteAtlases[overlay.atlasIdx].tileRects[overlay.frameIdx];
                            const overlayPoint = {
                                x: partWorldPosition.x + overlay.offsetX,
                                y: partWorldPosition.y + overlay.offsetY
                            };

                            const checkBoundary = {
                                x: overlayPoint.x - ((overlayRectData.w / 2) * internalState.displayZoom),
                                y: overlayPoint.y - ((overlayRectData.h / 2) * internalState.displayZoom),
                                w: overlayRectData.w * internalState.displayZoom,
                                h: overlayRectData.h * internalState.displayZoom
                            };

                            if (checkPointInBounds(clickPosition, checkBoundary)) {
                                graphicHits.push(overlay.label);
                            }
                        });
                    }
                });
            });
            return graphicHits;
        },

        placeUnit(prototypeLabel, instanceTag, placementDetails) {
            const details = placementDetails || {};
            const initialX = details.x || 0;
            const initialY = details.y || 0;
            const initialLayer = details.layer || 0;

            const unitPrototypes = WORLD_SCHEMA.units;
            const prototypeDefinition = unitPrototypes.find(proto => proto.name === prototypeLabel);

            if (prototypeDefinition) {
                const newUnit = makeUnit(
                    unitPrototypes.indexOf(prototypeDefinition),
                    instanceTag,
                    { x: initialX, y: initialY },
                    initialLayer
                );
                internalState.currentWorld.entities.push(newUnit);

                prototypeDefinition.bodies.forEach(bodyProto => {
                    newUnit.components.push(makeComponent(bodyProto.name));
                });

                prototypeDefinition.joints.forEach(jointProto => {
                    newUnit.linkages.push(makeLinkage(jointProto.name));
                });

                this.integrateUnitPhysics(internalState.currentWorld.entities.length - 1);
            }
        },

        integrateUnitPhysics(unitIdx) {
            const targetUnit = internalState.currentWorld.entities[unitIdx];
            const prototypeDef = WORLD_SCHEMA.units[targetUnit.prototypeId];

            targetUnit.components.forEach((component, compIdx) => {
                const componentProto = prototypeDef.bodies[compIdx];

                const bodyDefinition = new b2BodyDef();
                const fixtureDefinition = new b2FixtureDef();

                const shapeBuilders = {
                    "box": () => {
                        fixtureDefinition.shape = new b2PolygonShape();
                        fixtureDefinition.shape.SetAsBox(
                            (componentProto.shapeDefinition.w / 2) / internalState.physicalEnv.scaleFactor,
                            (componentProto.shapeDefinition.h / 2) / internalState.physicalEnv.scaleFactor
                        );
                    },
                    "circle": () => {
                        const radius = componentProto.shapeDefinition.radius / internalState.physicalEnv.scaleFactor;
                        fixtureDefinition.shape = new b2CircleShape(radius);
                    },
                    "poly": () => {
                        fixtureDefinition.shape = new b2PolygonShape();
                        const pointsScaled = componentProto.shapeDefinition.map(pt => ({
                            x: pt.x / internalState.physicalEnv.scaleFactor,
                            y: pt.y / internalState.physicalEnv.scaleFactor
                        }));
                        fixtureDefinition.shape.SetAsArray(pointsScaled);
                    },
                    "tile": () => {
                        fixtureDefinition.shape = new b2PolygonShape();
                        const mapLayout = internalState.currentWorld.mapData.layoutType;
                        const sd = componentProto.shapeDefinition;

                        switch (mapLayout) {
                            case "orthogonal":
                                fixtureDefinition.shape.SetAsBox(
                                    (sd.w / 2) / internalState.physicalEnv.scaleFactor,
                                    (sd.h / 2) / internalState.physicalEnv.scaleFactor
                                );
                                break;
                            case "isometric":
                                fixtureDefinition.shape.SetAsArray([
                                    new b2Vec2(0, -(sd.h / 2) / internalState.physicalEnv.scaleFactor),
                                    new b2Vec2((sd.w / 2) / internalState.physicalEnv.scaleFactor, 0),
                                    new b2Vec2(0, (sd.h / 2) / internalState.physicalEnv.scaleFactor),
                                    new b2Vec2(-(sd.w / 2) / internalState.physicalEnv.scaleFactor, 0)
                                ]);
                                break;
                            case "hexagonal":
                                fixtureDefinition.shape.SetAsArray([
                                    new b2Vec2(-(sd.w / 4) / internalState.physicalEnv.scaleFactor, -(sd.h / 2) / internalState.physicalEnv.scaleFactor),
                                    new b2Vec2((sd.w / 4) / internalState.physicalEnv.scaleFactor, -(sd.h / 2) / internalState.physicalEnv.scaleFactor),
                                    new b2Vec2((sd.w / 2) / internalState.physicalEnv.scaleFactor, 0),
                                    new b2Vec2((sd.w / 4) / internalState.physicalEnv.scaleFactor, (sd.h / 2) / internalState.physicalEnv.scaleFactor),
                                    new b2Vec2(-(sd.w / 4) / internalState.physicalEnv.scaleFactor, (sd.h / 2) / internalState.physicalEnv.scaleFactor),
                                    new b2Vec2(-(sd.w / 2) / internalState.physicalEnv.scaleFactor, 0)
                                ]);
                                break;
                        }
                    }
                };

                (shapeBuilders[componentProto.shape] || (() => {}))();

                fixtureDefinition.density = componentProto.fixDef.density;
                fixtureDefinition.friction = componentProto.fixDef.friction;
                fixtureDefinition.restitution = componentProto.fixDef.restitution;
                fixtureDefinition.filter.groupIndex = componentProto.fixDef.filter.groupIndex;

                const bodyTypeMap = {
                    "static": b2Body.b2_staticBody,
                    "dynamic": b2Body.b2_dynamicBody,
                    "kinematic": b2Body.b2_kinematicBody
                };
                bodyDefinition.type = bodyTypeMap[componentProto.type];

                if (compIdx === 0) {
                    bodyDefinition.position.x = targetUnit.placement.x;
                    bodyDefinition.position.y = targetUnit.placement.y;
                } else {
                    bodyDefinition.position.x = targetUnit.placement.x + componentProto.position.x;
                    bodyDefinition.position.y = targetUnit.placement.y + componentProto.position.y;
                }

                bodyDefinition.position.Set(
                    bodyDefinition.position.x / internalState.physicalEnv.scaleFactor,
                    bodyDefinition.position.y / internalState.physicalEnv.scaleFactor
                );

                bodyDefinition.userData = {
                    entityPartName: componentProto.name,
                    parentEntityTag: targetUnit.identifier
                };

                component.physicsBody = internalState.physicalEnv.worldInstance.CreateBody(bodyDefinition);

                if (componentProto.shape === "poly") {
                    const polyPointsScaled = componentProto.shapeDefinition.map(pt => ({
                        x: pt.x / internalState.physicalEnv.scaleFactor,
                        y: pt.y / internalState.physicalEnv.scaleFactor
                    }));
                    Box2DSeparator.separate(component.physicsBody, fixtureDefinition, polyPointsScaled, internalState.physicalEnv.scaleFactor);
                } else {
                    component.physicsBody.CreateFixture(fixtureDefinition);
                }

                if (componentProto.fixedRotation === true) {
                    component.physicsBody.SetFixedRotation(true);
                }

                if (componentProto.spriteSheet !== null) {
                    component.visualSprite = makeVisualSprite(
                        componentProto.name,
                        componentProto.spriteSheet,
                        0, 0,
                        componentProto.frame,
                        componentProto.animation,
                        prototypeDef.layer
                    );
                } else {
                    component.visualSprite = null;
                }

                component.shapeType = componentProto.shape;
                component.shapeGeometry = componentProto.shapeDefinition;
            });

            targetUnit.linkages.forEach((link, linkIdx) => {
                const jointProto = prototypeDef.joints[linkIdx];
                let jointDef;

                switch (jointProto.type) {
                    case "distance":
                        jointDef = new b2DistanceJointDef();
                        jointDef.frequencyHz = jointProto.frequencyHz;
                        jointDef.dampingRatio = jointProto.dampingRatio;
                        jointDef.collideConnected = jointProto.collideConnected;
                        jointDef.Initialize(
                            targetUnit.components[jointProto.body1].physicsBody,
                            targetUnit.components[jointProto.body2].physicsBody,
                            targetUnit.components[jointProto.body1].physicsBody.GetWorldCenter(),
                            targetUnit.components[jointProto.body2].physicsBody.GetWorldCenter()
                        );
                        link.physicsJoint = internalState.physicalEnv.worldInstance.CreateJoint(jointDef);
                        break;
                    case "revolve":
                        jointDef = new b2RevoluteJointDef();
                        jointDef.motorSpeed = jointProto.motorSpeed;
                        jointDef.maxMotorTorque = jointProto.maxMotorTorque;
                        jointDef.enableMotor = jointProto.enableMotor;
                        // Original code is incomplete here, so this clone remains incomplete too.
                        break;
                }
            });
        }
    };

    return coreMethods;
}