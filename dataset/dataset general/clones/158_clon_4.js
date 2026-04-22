ig.module('stellar.dynamics.constructs.elongatedBody')
.requires('plugins.joncom.box2d.entity')
.defines(function(){

    const ElongatedBodyAssembler = ig.Entity.extend({

        establishPhysicalForm: function(surfaceResistance) {
            const currentWidth = this.geometricProps.spanX;
            const currentHeight = this.geometricProps.spanY;

            if (currentWidth === currentHeight) {
                throw 'Dimensional axes must not be equivalent.';
            }

            const calculateComponentDimensions = (spanX, spanY) => {
                const minHalf = Math.min(spanX, spanY) / 2;
                let hOffset = 0;
                let vOffset = 0;
                let halfBoxW = 0;
                let halfBoxH = 0;

                if (spanX > spanY) {
                    hOffset = spanX / 2 - minHalf;
                    halfBoxW = minHalf;
                    halfBoxH = minHalf;
                } else {
                    vOffset = spanY / 2 - minHalf;
                    halfBoxW = minHalf;
                    halfBoxH = spanY / 2 - minHalf;
                }

                return {
                    primaryCurveRadius: minHalf,
                    curveCenterOffsetH: hOffset,
                    curveCenterOffsetV: vOffset,
                    midSegmentHalfWidth: halfBoxW,
                    midSegmentHalfHeight: halfBoxH
                };
            };

            const computedGeom = calculateComponentDimensions(currentWidth, currentHeight);

            const coreStructureDescriptor = new Box2D.Dynamics.b2BodyDef();
            coreStructureDescriptor.type = this.compositionType;
            coreStructureDescriptor.position.Set(
                (this.initialCoordinates.x + currentWidth / 2) * Box2D.SCALE,
                (this.initialCoordinates.y + currentHeight / 2) * Box2D.SCALE
            );
            this.mainPhysicalComponent = ig.world.CreateBody(coreStructureDescriptor);

            const fixtureSpecificationList = [
                {
                    shapeInstantiator: () => {
                        const endCapShapeA = new Box2D.Collision.Shapes.b2CircleShape(computedGeom.primaryCurveRadius * Box2D.SCALE);
                        endCapShapeA.SetLocalPosition(new Box2D.Common.Math.b2Vec2(-computedGeom.curveCenterOffsetH * Box2D.SCALE, -computedGeom.curveCenterOffsetV * Box2D.SCALE));
                        return endCapShapeA;
                    },
                    assignedProperty: 'endCapAttachmentA'
                },
                {
                    shapeInstantiator: () => {
                        const endCapShapeB = new Box2D.Collision.Shapes.b2CircleShape(computedGeom.primaryCurveRadius * Box2D.SCALE);
                        endCapShapeB.SetLocalPosition(new Box2D.Common.Math.b2Vec2(computedGeom.curveCenterOffsetH * Box2D.SCALE, computedGeom.curveCenterOffsetV * Box2D.SCALE));
                        return endCapShapeB;
                    },
                    assignedProperty: 'endCapAttachmentB'
                },
                {
                    shapeInstantiator: () => {
                        const midSectionShape = new Box2D.Collision.Shapes.b2PolygonShape();
                        midSectionShape.SetAsBox(computedGeom.midSegmentHalfWidth * Box2D.SCALE, computedGeom.midSegmentHalfHeight * Box2D.SCALE);
                        return midSectionShape;
                    },
                    assignedProperty: 'midSectionAttachment'
                }
            ];

            fixtureSpecificationList.forEach(spec => {
                const currentShapeInstance = spec.shapeInstantiator();
                const createdFixture = this.mainPhysicalComponent.CreateFixture2(currentShapeInstance, this.materialDensity);
                createdFixture.SetRestitution(this.restitutionCoefficient);
                createdFixture.SetFriction(surfaceResistance);
                this[spec.assignedProperty] = createdFixture;
            });
        }
    });

});