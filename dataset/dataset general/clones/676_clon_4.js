'use strict';

const GEOM_TOLERANCE = 1e-5;
const FACE_ON_PLANE = 0;
const FACE_IN_FRONT = 1;
const FACE_BEHIND = 2;
const FACE_SPANNING = 3;

class SpatialPoint {
    constructor(x, y, z, normal, uv) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.normal = normal || new THREE.Vector3();
        this.uv = uv || new THREE.Vector2();
    }

    clone() {
        return new SpatialPoint(this.x, this.y, this.z, this.normal.clone(), this.uv.clone());
    }

    add(other) {
        return new SpatialPoint(this.x + other.x, this.y + other.y, this.z + other.z, this.normal.clone(), this.uv.clone());
    }

    subtract(other) {
        return new SpatialPoint(this.x - other.x, this.y - other.y, this.z - other.z, this.normal.clone(), this.uv.clone());
    }

    scale(scalar) {
        return new SpatialPoint(this.x * scalar, this.y * scalar, this.z * scalar, this.normal.clone(), this.uv.clone());
    }

    cross(other) {
        const x = this.x, y = this.y, z = this.z;
        return new SpatialPoint(
            y * other.z - z * other.y,
            z * other.x - x * other.z,
            x * other.y - y * other.x,
            this.normal.clone(), this.uv.clone()
        );
    }

    normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        return new SpatialPoint(this.x / length, this.y / length, this.z / length, this.normal.clone(), this.uv.clone());
    }

    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    interpolate(other, t) {
        const x = this.x + (other.x - this.x) * t;
        const y = this.y + (other.y - this.y) * t;
        const z = this.z + (other.z - this.z) * t;
        const normal = this.normal.clone().lerp(other.normal, t);
        const uv = this.uv.clone().lerp(other.uv, t);
        return new SpatialPoint(x, y, z, normal, uv);
    }

    transformByMatrix(matrix) {
        const x = this.x, y = this.y, z = this.z;
        const e = matrix.elements;
        this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
        this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
        this.z = e[2] * x + e[6] * y + e[10] * z + e[14];
        return this;
    }
}

class PolyFacet {
    constructor(points) {
        this.points = points || [];
        if (this.points.length >= 3) {
            this.updatePlaneData();
        } else {
            this.planeNormal = undefined;
            this.planeConstant = undefined;
        }
    }

    updatePlaneData() {
        const p1 = this.points[0];
        const p2 = this.points[1];
        const p3 = this.points[2];

        const v1 = new THREE.Vector3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
        const v2 = new THREE.Vector3(p3.x - p1.x, p3.y - p1.y, p3.z - p1.z);

        this.planeNormal = v1.cross(v2).normalize();
        this.planeConstant = this.planeNormal.dot(new THREE.Vector3(p1.x, p1.y, p1.z));
    }

    clone() {
        return new PolyFacet(this.points.map(p => p.clone()));
    }

    createFlipped() {
        const newPoints = this.points.map(p => p.clone()).reverse();
        const newFacet = new PolyFacet(newPoints);
        newFacet.planeNormal.multiplyScalar(-1);
        newFacet.planeConstant *= -1;
        return newFacet;
    }

    classifyPoint(point) {
        const value = this.planeNormal.dot(new THREE.Vector3(point.x, point.y, point.z)) - this.planeConstant;

        if (value < -GEOM_TOLERANCE) {
            return FACE_BEHIND;
        } else if (value > GEOM_TOLERANCE) {
            return FACE_IN_FRONT;
        } else {
            return FACE_ON_PLANE;
        }
    }

    determineSide(otherFacet) {
        let frontCount = 0;
        let backCount = 0;

        for (const point of otherFacet.points) {
            const classification = this.classifyPoint(point);
            if (classification === FACE_IN_FRONT) {
                frontCount++;
            } else if (classification === FACE_BEHIND) {
                backCount++;
            }
        }

        if (frontCount > 0 && backCount === 0) {
            return FACE_IN_FRONT;
        } else if (frontCount === 0 && backCount > 0) {
            return FACE_BEHIND;
        } else if (frontCount === 0 && backCount === 0) {
            return FACE_ON_PLANE;
        } else {
            return FACE_SPANNING;
        }
    }

    split(otherFacet) {
        const classification = this.determineSide(otherFacet);

        const splitHandlers = {
            [FACE_ON_PLANE]: () => ({
                onPlaneFront: (this.planeNormal.dot(otherFacet.planeNormal) > 0) ? [otherFacet] : [],
                onPlaneBack: (this.planeNormal.dot(otherFacet.planeNormal) > 0) ? [] : [otherFacet],
                front: [],
                back: []
            }),
            [FACE_IN_FRONT]: () => ({ onPlaneFront: [], onPlaneBack: [], front: [otherFacet], back: [] }),
            [FACE_BEHIND]: () => ({ onPlaneFront: [], onPlaneBack: [], front: [], back: [otherFacet] }),
            [FACE_SPANNING]: () => {
                const frontPoints = [];
                const backPoints = [];

                for (let i = 0; i < otherFacet.points.length; i++) {
                    const j = (i + 1) % otherFacet.points.length;
                    const pI = otherFacet.points[i];
                    const pJ = otherFacet.points[j];

                    const classI = this.classifyPoint(pI);
                    const classJ = this.classifyPoint(pJ);

                    if (classI !== FACE_BEHIND) frontPoints.push(pI);
                    if (classI !== FACE_IN_FRONT) backPoints.push(pI);

                    if ((classI | classJ) === FACE_SPANNING) {
                        const numerator = this.planeConstant - this.planeNormal.dot(new THREE.Vector3(pI.x, pI.y, pI.z));
                        const denominator = this.planeNormal.dot(new THREE.Vector3(pJ.x - pI.x, pJ.y - pI.y, pJ.z - pI.z));
                        const t = numerator / denominator;
                        const intersectionPoint = pI.interpolate(pJ, t);
                        frontPoints.push(intersectionPoint);
                        backPoints.push(intersectionPoint);
                    }
                }

                return {
                    onPlaneFront: [],
                    onPlaneBack: [],
                    front: frontPoints.length >= 3 ? [new PolyFacet(frontPoints)] : [],
                    back: backPoints.length >= 3 ? [new PolyFacet(backPoints)] : []
                };
            }
        };

        return splitHandlers[classification]();
    }
}

class RegionTree {
    constructor(facets) {
        this.regionFacets = [];
        this.frontRegion = null;
        this.backRegion = null;
        this.dividerFacet = null;

        if (!Array.isArray(facets) || facets.length === 0) return;

        this.dividerFacet = facets[0].clone();

        const frontAccumulator = [];
        const backAccumulator = [];

        for (const facet of facets) {
            const splitResult = this.dividerFacet.split(facet);
            this.regionFacets.push(...splitResult.onPlaneFront, ...splitResult.onPlaneBack);
            frontAccumulator.push(...splitResult.front);
            backAccumulator.push(...splitResult.back);
        }

        if (frontAccumulator.length > 0) {
            this.frontRegion = new RegionTree(frontAccumulator);
        }
        if (backAccumulator.length > 0) {
            this.backRegion = new RegionTree(backAccumulator);
        }
    }

    clone() {
        const newTree = new RegionTree();
        newTree.dividerFacet = this.dividerFacet ? this.dividerFacet.clone() : null;
        newTree.regionFacets = this.regionFacets.map(f => f.clone());
        if (this.frontRegion) newTree.frontRegion = this.frontRegion.clone();
        if (this.backRegion) newTree.backRegion = this.backRegion.clone();
        return newTree;
    }

    invert() {
        this.regionFacets = this.regionFacets.map(f => f.createFlipped());
        if (this.dividerFacet) {
            this.dividerFacet = this.dividerFacet.createFlipped();
        }

        [this.frontRegion, this.backRegion] = [this.backRegion, this.frontRegion];

        if (this.frontRegion) this.frontRegion.invert();
        if (this.backRegion) this.backRegion.invert();
    }

    clipAgainst(otherTree) {
        if (!this.dividerFacet) return;

        const newRegionFacets = [];
        const frontAccumulator = [];
        const backAccumulator = [];

        for (const facet of this.regionFacets) {
            const splitResult = this.dividerFacet.split(facet);
            newRegionFacets.push(...splitResult.onPlaneFront);
            frontAccumulator.push(...splitResult.front);
            backAccumulator.push(...splitResult.back);
        }

        if (this.frontRegion) this.frontRegion.clipAgainst(otherTree);
        if (this.backRegion) this.backRegion.clipAgainst(otherTree);

        this.regionFacets = newRegionFacets.concat(
            (this.frontRegion ? this.frontRegion.collectAllFacets() : []),
            (this.backRegion ? this.backRegion.collectAllFacets() : [])
        );

        if (otherTree.dividerFacet) {
            this.regionFacets = this.regionFacets.filter(facet => otherTree.dividerFacet.determineSide(facet) !== FACE_BEHIND);
        }
    }

    reconstruct(newFacets) {
        if (!this.dividerFacet) {
            if (newFacets.length === 0) return;
            this.dividerFacet = newFacets[0].clone();
        }

        const frontAccumulator = [];
        const backAccumulator = [];

        for (const facet of newFacets) {
            const splitResult = this.dividerFacet.split(facet);
            this.regionFacets.push(...splitResult.onPlaneFront, ...splitResult.onPlaneBack);
            frontAccumulator.push(...splitResult.front);
            backAccumulator.push(...splitResult.back);
        }

        if (frontAccumulator.length > 0) {
            if (!this.frontRegion) this.frontRegion = new RegionTree();
            this.frontRegion.reconstruct(frontAccumulator);
        }
        if (backAccumulator.length > 0) {
            if (!this.backRegion) this.backRegion = new RegionTree();
            this.backRegion.reconstruct(backAccumulator);
        }
    }

    collectAllFacets() {
        return [
            ...this.regionFacets,
            ...(this.frontRegion ? this.frontRegion.collectAllFacets() : []),
            ...(this.backRegion ? this.backRegion.collectAllFacets() : [])
        ];
    }
}

class SolidGeometryProcessor {
    constructor(geometryInput) {
        this.transformationMatrix = new THREE.Matrix4();
        this.rootTree = null;

        if (geometryInput instanceof THREE.Geometry) {
            this.rootTree = new RegionTree(this._convertGeometryToFacets(geometryInput, this.transformationMatrix));
        } else if (geometryInput instanceof THREE.Mesh) {
            geometryInput.updateMatrix();
            this.transformationMatrix = geometryInput.matrix.clone();
            this.rootTree = new RegionTree(this._convertGeometryToFacets(geometryInput.geometry, this.transformationMatrix));
        } else if (geometryInput instanceof RegionTree) {
            this.rootTree = geometryInput;
        } else {
            throw new Error('SolidGeometryProcessor: Provided input is not supported.');
        }
    }

    _convertGeometryToFacets(geometry, matrix) {
        const facets = [];
        for (let i = 0; i < geometry.faces.length; i++) {
            const face = geometry.faces[i];
            const faceUvs = geometry.faceVertexUvs[0][i];
            const points = [];

            const addPoint = (vertexIndex, normalArrayIndex, uvArrayIndex) => {
                const vertex = geometry.vertices[vertexIndex];
                const normal = face.vertexNormals[normalArrayIndex] || face.normal;
                const uv = faceUvs && faceUvs[uvArrayIndex] ? new THREE.Vector2(faceUvs[uvArrayIndex].x, faceUvs[uvArrayIndex].y) : null;
                const sp = new SpatialPoint(vertex.x, vertex.y, vertex.z, normal.clone(), uv ? uv.clone() : new THREE.Vector2());
                sp.transformByMatrix(matrix);
                points.push(sp);
            };

            if (face instanceof THREE.Face3) {
                addPoint(face.a, 0, 0);
                addPoint(face.b, 2, 1);
                addPoint(face.c, 2, 2);
            } else if (face instanceof THREE.Face4) {
                addPoint(face.a, 0, 0);
                addPoint(face.b, 1, 1);
                addPoint(face.c, 2, 2);
                addPoint(face.d, 3, 3);
            } else {
                throw new Error('Invalid face type at index ' + i);
            }
            facets.push(new PolyFacet(points));
        }
        return facets;
    }

    performSubtraction(otherProcessor) {
        const treeA = this.rootTree.clone();
        const treeB = otherProcessor.rootTree.clone();

        treeA.invert();
        treeA.clipAgainst(treeB);
        treeB.clipAgainst(treeA);
        treeB.invert();
        treeB.clipAgainst(treeA);
        treeB.invert();
        treeA.reconstruct(treeB.collectAllFacets());
        treeA.invert();

        const resultProcessor = new SolidGeometryProcessor(treeA);
        resultProcessor.transformationMatrix = this.transformationMatrix;
        return resultProcessor;
    }

    performUnion(otherProcessor) {
        const treeA = this.rootTree.clone();
        const treeB = otherProcessor.rootTree.clone();

        treeA.clipAgainst(treeB);
        treeB.clipAgainst(treeA);
        treeB.invert();
        treeB.clipAgainst(treeA);
        treeB.invert();
        treeA.reconstruct(treeB.collectAllFacets());

        const resultProcessor = new SolidGeometryProcessor(treeA);
        resultProcessor.transformationMatrix = this.transformationMatrix;
        return resultProcessor;
    }

    performIntersection(otherProcessor) {
        const treeA = this.rootTree.clone();
        const treeB = otherProcessor.rootTree.clone();

        treeA.invert();
        treeB.clipAgainst(treeA);
        treeB.invert();
        treeA.clipAgainst(treeB);
        treeB.clipAgainst(treeA);
        treeA.reconstruct(treeB.collectAllFacets());
        treeA.invert();

        const resultProcessor = new SolidGeometryProcessor(treeA);
        resultProcessor.transformationMatrix = this.transformationMatrix;
        return resultProcessor;
    }

    exportGeometry() {
        const inverseMatrix = new THREE.Matrix4().copy(this.transformationMatrix).invert();
        const outputGeometry = new THREE.Geometry();
        const allFacets = this.rootTree.collectAllFacets();
        const vertexMap = new Map();

        for (const facet of allFacets) {
            for (let i = 2; i < facet.points.length; i++) {
                const points = [facet.points[0], facet.points[i - 1], facet.points[i]];
                const faceUvs = [];
                const faceVertices = [];

                for (const point of points) {
                    const transformedPoint = point.clone().transformByMatrix(inverseMatrix);
                    const key = `${transformedPoint.x},${transformedPoint.y},${transformedPoint.z}`;

                    let vertexIndex;
                    if (vertexMap.has(key)) {
                        vertexIndex = vertexMap.get(key);
                    } else {
                        outputGeometry.vertices.push(new THREE.Vector3(transformedPoint.x, transformedPoint.y, transformedPoint.z));
                        vertexIndex = outputGeometry.vertices.length - 1;
                        vertexMap.set(key, vertexIndex);
                    }
                    faceVertices.push(vertexIndex);
                    faceUvs.push(new THREE.Vector2(point.uv.x, point.uv.y));
                }

                const newFace = new THREE.Face3(
                    faceVertices[0],
                    faceVertices[1],
                    faceVertices[2],
                    new THREE.Vector3(facet.planeNormal.x, facet.planeNormal.y, facet.planeNormal.z)
                );
                outputGeometry.faces.push(newFace);
                outputGeometry.faceVertexUvs[0].push(faceUvs);
            }
        }
        return outputGeometry;
    }

    exportMesh(material) {
        const geometry = this.exportGeometry();
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.setFromMatrixPosition( this.transformationMatrix );
		mesh.rotation.setFromRotationMatrix( this.transformationMatrix );

        return mesh;
    }
}

window.SolidGeometryProcessor = SolidGeometryProcessor;