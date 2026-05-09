ig.module( 'plugins.joncom.box2d.entities.capsule' )

// This module requires the base Box2D entity plugin.
.requires( 'plugins.joncom.box2d.entity' )


// Define the module's contents.
.defines( function( ) {

    // Define the EntityCapsule class, extending ig.Entity.
    EntityCapsule = ig.Entity.extend( {

        /**
         * Creates the Box2D body for the capsule entity.
         * @param {number} friction - The friction coefficient for the body's fixtures.
         */
        createBody: function( friction ) {

            // Ensure capsule dimensions are not equal; a capsule needs distinct width/height to be valid.
            if ( this.size.x === this.size.y )
            {
                // Throw an error if the dimensions are identical.
                throw 'Capsule width must be different than height.';
            }

            // --- Body Definition ---

            // Create a new Box2D body definition.
            var bodyDef = new Box2D.Dynamics.b2BodyDef( ) ;
            // Set the body type from the entity's properties.
            bodyDef.type = this.bodyType ;

            // Set the initial position of the body in Box2D coordinates.
            // Box2D.SCALE is used to convert game coordinates to physics coordinates.
            bodyDef.position.Set(
                  ( this.pos.x + this.size.x / 2 ) * Box2D.SCALE
                , ( this.pos.y + this.size.y / 2 ) * Box2D.SCALE
            ) ;

            // Create the actual Box2D body in the world.
            this.body = ig.world.CreateBody( bodyDef ) ;

            // --- Capsule Shape Calculations ---

            // Determine the radius of the circular ends. It's half of the smaller dimension.
            var radius        = ( this.size.x > this.size.y ? this.size.y / 2 : this.size.x / 2 ) ;
            // Calculate the X offset for the circular parts.
            var circleOffsetX = ( this.size.x > this.size.y ? ( this.size.x / 2 - radius ) : 0 ) ;
            // Calculate the Y offset for the circular parts.
            var circleOffsetY = ( this.size.y > this.size.x ? ( this.size.y / 2 - radius ) : 0 ) ;

            // --- First Circular End (A) ---

            // Create the shape definition for the first circle.
            var circleADef = new Box2D.Collision.Shapes.b2CircleShape( radius * Box2D.SCALE ) ;
            // Set the local position of this circle relative to the body's center.
            circleADef.SetLocalPosition( new Box2D.Common.Math.b2Vec2( -circleOffsetX * Box2D.SCALE , -circleOffsetY * Box2D.SCALE ) ) ;

            // Create the fixture for the first circle and attach it to the body.
            circleAFixture = this.body.CreateFixture2( circleADef , this.density ) ;
            // Apply restitution (bounciness).
            circleAFixture.SetRestitution( this.bounciness ) ;
            // Apply friction.
            circleAFixture.SetFriction( friction ) ;

            // --- Second Circular End (B) ---

            // Create the shape definition for the second circle.
            var circleBDef = new Box2D.Collision.Shapes.b2CircleShape( radius * Box2D.SCALE ) ;
            // Set the local position of this circle relative to the body's center.
            circleBDef.SetLocalPosition( new Box2D.Common.Math.b2Vec2( circleOffsetX * Box2D.SCALE , circleOffsetY * Box2D.SCALE ) ) ;

            // Create the fixture for the second circle.
            circleBFixture = this.body.CreateFixture2( circleBDef , this.density ) ;
            // Apply restitution.
            circleBFixture.SetRestitution( this.bounciness ) ;
            // Apply friction.
            circleBFixture.SetFriction( friction ) ;

            // --- Rectangular Middle Part ---

            // Create the shape definition for the connecting rectangle.
            var boxDef = new Box2D.Collision.Shapes.b2PolygonShape( ) ;

            // Calculate the width of the rectangular part.
            var boxWidth  = ( this.size.x > this.size.y ? this.size.y : this.size.x ) / 2 * Box2D.SCALE ;
            // Calculate the height of the rectangular part.
            var boxHeight = ( this.size.x > this.size.y ? this.size.y / 2 : ( this.size.y / 2 - this.size.x / 2 ) ) * Box2D.SCALE ;

            // Set the dimensions of the box shape.
            boxDef.SetAsBox( boxWidth , boxHeight ) ;

            // Create the fixture for the rectangular part.
            boxFixture = this.body.CreateFixture2( boxDef , this.density ) ;
            // Apply restitution.
            boxFixture.SetRestitution( this.bounciness ) ;
            // Apply friction.
            boxFixture.SetFriction( friction ) ;

        } // End of createBody function.

    } ) ; // End of EntityCapsule.extend.

} ) ; // End of defines function.
// This marks the end of the capsule module definition.