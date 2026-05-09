// This module defines a specialized entity within the physics system,
// representing a capsule or pill-shaped object.
ig.module('engine.physics.fixtures.pillShape')
.requires('engine.physics.baseEntity') // Base entity for physics interactions
.defines(function(){

    // PillShapeEntity extends the base game entity to provide
    // specific Box2D physical properties for a capsule shape.
    PillShapeEntity = ig.Entity.extend({

        // Default properties for the entity, can be overridden by instance.
        // These will be used if not explicitly set on the entity.
        objectPhysicsType: Box2D.Dynamics.b2Body.b2_dynamicBody, // Default to a dynamic body
        materialDensity: 1.0, // Standard density
        restitutionCoefficient: 0.2, // Default bounciness
        // Note: positionX, positionY, dimensionWidth, dimensionHeight are inherited from ig.Entity.

        /**
         * Initializes the Box2D physical body and its constituent shapes
         * (two circles and a rectangle) to form a capsule.
         * @param {number} surfaceResistance - The friction coefficient for the body's surfaces.
         * @returns {boolean} True if the body was successfully created, false otherwise.
         */
        configurePhysicalBody: function(surfaceResistance) {
            // Early validation: Ensure the physics engine and Box2D library components are available.
            if (!Box2D || !ig.physicsEngine || !ig.physicsEngine.buildPhysicsBody || !ig.physicsEngine.WORLD_SCALE_FACTOR) {
                console.error("Physics engine components or Box2D library not fully initialized. Cannot configure physical body.");
                return false;
            }

            // Extract dimensions for clarity and reuse.
            const currentWidth = this.size.x;
            const currentHeight = this.size.y;
            const worldScale = ig.physicsEngine.WORLD_SCALE_FACTOR; // Use renamed scale factor

            // Guard clause: A capsule requires distinct positive width and height for proper shape definition.
            if (currentWidth <= 0 || currentHeight <= 0) {
                throw new Error('PillShapeEntity: Dimensions (width and height) must be positive values for a valid physical shape.');
            }
            if (currentWidth === currentHeight) {
                // If dimensions are equal, it forms a circle. This entity type is for capsules.
                // A dedicated circle entity should be used for such cases.
                throw new Error('PillShapeEntity: For a true capsule shape, width and height must differ. Consider using a CircleEntity for equal dimensions.');
            }

            // Define the properties for the main physics body.
            let physicalBodyDefinition = new Box2D.Dynamics.BodyDefinition(); // Renamed Box2D type
            physicalBodyDefinition.type = this.objectPhysicsType;

            // Calculate the world coordinates for the body's center, applying the physics scale.
            const worldXCoordinate = (this.pos.x + currentWidth / 2) * worldScale;
            const worldYCoordinate = (this.pos.y + currentHeight / 2) * worldScale;
            physicalBodyDefinition.position.Set(worldXCoordinate, worldYCoordinate);

            // Create the Box2D body in the physics world using the renamed method.
            this.physicsObject = ig.physicsEngine.buildPhysicsBody(physicalBodyDefinition);

            // Determine the radius for the spherical caps and their offsets.
            // The radius is always half of the *smaller* dimension of the capsule.
            const sphereRadius = Math.min(currentWidth, currentHeight) / 2;
            const scaledSphereRadius = sphereRadius * worldScale;

            // Calculate the positional offsets for the two circular ends.
            // If the capsule is wider than it is tall, circles are offset along the X-axis.
            // If it's taller than it is wide, circles are offset along the Y-axis.
            let sphereOffsetX = 0;
            let sphereOffsetY = 0;

            if (currentWidth > currentHeight) {
                sphereOffsetX = (currentWidth / 2 - sphereRadius);
            } else { // currentHeight > currentWidth
                sphereOffsetY = (currentHeight / 2 - sphereRadius);
            }

            const scaledSphereOffsetX = sphereOffsetX * worldScale;
            const scaledSphereOffsetY = sphereOffsetY * worldScale;

            // --- Create Fixtures ---

            // Helper function to consistently apply common fixture properties.
            const applyCommonFixtureAttributes = (component) => {
                component.SetRestitution(this.restitutionCoefficient);
                component.SetFriction(surfaceResistance);
            };

            // 1. First Sphere Component (e.g., Left or Top end of the capsule)
            let firstSphereShape = new Box2D.Collision.Shapes.CircleShape(scaledSphereRadius); // Renamed Box2D type
            firstSphereShape.SetLocalPosition(new Box2D.Common.Math.Vector2(-scaledSphereOffsetX, -scaledSphereOffsetY)); // Renamed Box2D type
            let firstSphereComponent = this.physicsObject.CreateFixture2(firstSphereShape, this.materialDensity);
            applyCommonFixtureAttributes(firstSphereComponent);

            // 2. Second Sphere Component (e.g., Right or Bottom end of the capsule)
            let secondSphereShape = new Box2D.Collision.Shapes.CircleShape(scaledSphereRadius); // Renamed Box2D type
            secondSphereShape.SetLocalPosition(new Box2D.Common.Math.Vector2(scaledSphereOffsetX, scaledSphereOffsetY)); // Renamed Box2D type
            let secondSphereComponent = this.physicsObject.CreateFixture2(secondSphereShape, this.materialDensity);
            applyCommonFixtureAttributes(secondSphereComponent);

            // 3. Central Rectangle Component (connects the two spheres)
            let centralRectangleShape = new Box2D.Collision.Shapes.PolygonShape(); // Renamed Box2D type

            // The 'thickness' of the rectangle is determined by the sphere radius (half of the smaller dimension).
            const rectangleHalfThickness = sphereRadius * worldScale;
            // The 'length' of the rectangle is the remaining portion after accounting for the spheres.
            const rectangleHalfLength = (Math.max(currentWidth, currentHeight) / 2 - sphereRadius) * worldScale;

            // Set the dimensions of the rectangular box based on capsule orientation.
            if (currentWidth > currentHeight) {
                // Horizontal capsule: rectangle extends along the X-axis.
                centralRectangleShape.SetAsBox(rectangleHalfLength, rectangleHalfThickness); // Box(halfWidth, halfHeight)
            } else {
                // Vertical capsule: rectangle extends along the Y-axis.
                centralRectangleShape.SetAsBox(rectangleHalfThickness, rectangleHalfLength); // Box(halfWidth, halfHeight)
            }

            let centralRectangleComponent = this.physicsObject.CreateFixture2(centralRectangleShape, this.materialDensity);
            applyCommonFixtureAttributes(centralRectangleComponent);

            return true; // Indicates successful physical body construction.
        }

    });

});