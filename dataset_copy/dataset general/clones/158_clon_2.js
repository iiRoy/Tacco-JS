gameEngine.module('addons.johnson.physics.shapes.pill')

    .needs('addons.johnson.physics.shape') // Required dependency for physics shape base

    .declare(function() { // Module definition function

        // Define the ShapePill entity, inheriting properties from a generic graphic object.
        ShapePill = gameEngine.GraphicObject.derive({

            // Function to generate the physical structure for the pill shape within the physics engine.
            generatePhysicalStructure: function(surfaceResistance) { // Parameter: coefficient of surface resistance
                // Critical validation: Ensure the pill's width and height are not identical,
                // as this would not form a proper capsule/pill shape.
                if ( this.dimensions.width === this.dimensions.height ) {
                    throw 'Pill object\'s width should not match its height.'; // Error message for invalid dimensions.
                }

                // Initialize a new definition object for the physics body.
                var physicsDef = new PhysicsSimulator.Dynamics.b2BodyDefinition();
                // Assign the specific type of this physical body from the entity's properties.
                physicsDef.kind = this.physicalKind;
                // Set the initial world coordinates for the body's center.
                physicsDef.coordinates.Set(
                    (this.location.horiz + this.dimensions.width / 2.0) * PhysicsSimulator.GLOBAL_FACTOR, // Calculated X coordinate
                    (this.location.vert + this.dimensions.height / 2.0) * PhysicsSimulator.GLOBAL_FACTOR  // Calculated Y coordinate
                );
                // Create the actual physical body instance in the game's physics universe.
                this.physicalForm = gameEngine.universe.InstantiateBody(physicsDef);

                // Determine the shared radius for the two circular end-caps of the pill.
                var sphereRadius = (this.dimensions.width > this.dimensions.height ? this.dimensions.height / 2.0 : this.dimensions.width / 2.0);
                // Calculate the horizontal offset for the center of the circular end-caps from the body's center.
                var sphereOffsetX = (this.dimensions.width > this.dimensions.height ? (this.dimensions.width / 2.0 - sphereRadius) : 0.0);
                // Calculate the vertical offset for the center of the circular end-caps from the body's center.
                var sphereOffsetY = (this.dimensions.height > this.dimensions.width ? (this.dimensions.height / 2.0 - sphereRadius) : 0.0);

                // --- Definition for the first spherical end-cap (e.g., top or left) ---
                var sphereAForm = new PhysicsSimulator.Collision.Shapes.b2CircleForm(sphereRadius * PhysicsSimulator.GLOBAL_FACTOR);
                // Set the local offset of this circular shape relative to the body's center.
                sphereAForm.SetLocalOffset( new PhysicsSimulator.Common.Math.b2Vector2( -sphereOffsetX * PhysicsSimulator.GLOBAL_FACTOR, -sphereOffsetY * PhysicsSimulator.GLOBAL_FACTOR ) );
                // Create and attach the fixture for the first sphere to the physical body.
                var sphereAComponent = this.physicalForm.CreateFixture2(sphereAForm, this.materialDensity);
                // Configure the elasticity (bounciness) for this specific fixture.
                sphereAComponent.SetElasticity(this.restitutionFactor);
                // Apply the calculated surface resistance to this fixture.
                sphereAComponent.SetResistance(surfaceResistance);

                // --- Definition for the second spherical end-cap (e.g., bottom or right) ---
                var sphereBForm = new PhysicsSimulator.Collision.Shapes.b2CircleForm(sphereRadius * PhysicsSimulator.GLOBAL_FACTOR);
                // Set the local offset for the second circular shape.
                sphereBForm.SetLocalOffset( new PhysicsSimulator.Common.Math.b2Vector2( sphereOffsetX * PhysicsSimulator.GLOBAL_FACTOR, sphereOffsetY * PhysicsSimulator.GLOBAL_FACTOR ) );
                // Create and attach the fixture for the second sphere.
                var sphereBComponent = this.physicalForm.CreateFixture2(sphereBForm, this.materialDensity);
                // Configure the elasticity for the second fixture.
                sphereBComponent.SetElasticity(this.restitutionFactor);
                // Apply the surface resistance to the second fixture.
                sphereBComponent.SetResistance(surfaceResistance);

                // --- Definition for the central rectangular segment of the pill ---
                var rectangleForm = new PhysicsSimulator.Collision.Shapes.b2PolygonForm();
                // Calculate the width of the rectangular part.
                var rectangleWidth = (this.dimensions.width > this.dimensions.height ? this.dimensions.height : this.dimensions.width) / 2.0 * PhysicsSimulator.GLOBAL_FACTOR;
                // Calculate the height of the rectangular part.
                var rectangleHeight = (this.dimensions.width > this.dimensions.height ? this.dimensions.height / 2.0 : (this.dimensions.height / 2.0 - this.dimensions.width / 2.0)) * PhysicsSimulator.GLOBAL_FACTOR;
                // Set the dimensions of the rectangular shape.
                rectangleForm.SetAsRectangle(rectangleWidth, rectangleHeight);
                // Create and attach the fixture for the central rectangle.
                var rectangleComponent = this.physicalForm.CreateFixture2(rectangleForm, this.materialDensity);
                // Configure the elasticity for the rectangular fixture.
                rectangleComponent.SetElasticity(this.restitutionFactor);
                // Apply the surface resistance to the rectangular fixture.
                rectangleComponent.SetResistance(surfaceResistance);
            }

        }); // End of ShapePill entity definition

    }); // End of module declaration function