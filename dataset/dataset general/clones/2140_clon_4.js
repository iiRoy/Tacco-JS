const GeometryOps = {
    Vector3: {
        new: (x = 0, y = 0, z = 0) => [x, y, z],
        duplicate: (v, target = GeometryOps.Vector3.new()) => { target[0] = v[0]; target[1] = v[1]; target[2] = v[2]; return target; },
        assign: (x, y, z, target = GeometryOps.Vector3.new()) => { target[0] = x; target[1] = y; target[2] = z; return target; },
        sum: (a, b, target = GeometryOps.Vector3.new()) => { target[0] = a[0] + b[0]; target[1] = a[1] + b[1]; target[2] = a[2] + b[2]; return target; },
        difference: (a, b, target = GeometryOps.Vector3.new()) => { target[0] = a[0] - b[0]; target[1] = a[1] - b[1]; target[2] = a[2] - b[2]; return target; },
        multiplyScalar: (v, s, target = GeometryOps.Vector3.new()) => { target[0] = v[0] * s; target[1] = v[1] * s; target[2] = v[2] * s; return target; },
        dotProduct: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
        crossProduct: (a, b, target = GeometryOps.Vector3.new()) => {
            const ax = a[0], ay = a[1], az = a[2];
            const bx = b[0], by = b[1], bz = b[2];
            target[0] = ay * bz - az * by;
            target[1] = az * bx - ax * bz;
            target[2] = ax * by - ay * bx;
            return target;
        },
        normalize: (v, target = GeometryOps.Vector3.new()) => {
            const x = v[0], y = v[1], z = v[2];
            let lenSq = x * x + y * y + z * z;
            if (lenSq > 0) {
                lenSq = 1 / Math.sqrt(lenSq);
            }
            target[0] = x * lenSq;
            target[1] = y * lenSq;
            target[2] = z * lenSq;
            return target;
        },
        squaredLength: (v) => v[0] * v[0] + v[1] * v[1] + v[2] * v[2],
        length: (v) => Math.sqrt(GeometryOps.Vector3.squaredLength(v)),
        axisX: [1, 0, 0],
        axisY: [0, 1, 0],
        axisZ: [0, 0, 1]
    },

    Matrix4: {
        identity: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], // Column-major
        transformVector: (mat, v, target = GeometryOps.Vector3.new()) => {
            const x = v[0], y = v[1], z = v[2];
            const w = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] || 1.0;
            target[0] = (mat[0] * x + mat[4] * y + mat[8] * z + mat[12]) / w;
            target[1] = (mat[1] * x + mat[5] * y + mat[9] * z + mat[13]) / w;
            target[2] = (mat[2] * x + mat[6] * y + mat[10] * z + mat[14]) / w;
            return target;
        },
        getRotationMatrix3: (mat4, target = GeometryOps.Matrix3.identity()) => {
            target[0] = mat4[0]; target[1] = mat4[1]; target[2] = mat4[2];
            target[3] = mat4[4]; target[4] = mat4[5]; target[5] = mat4[6];
            target[6] = mat4[8]; target[7] = mat4[9]; target[8] = mat4[10];
            return target;
        }
    },

    Matrix3: {
        identity: () => [1, 0, 0, 0, 1, 0, 0, 0, 1],
        transformVector: (mat, v, target = GeometryOps.Vector3.new()) => {
            const x = v[0], y = v[1], z = v[2];
            target[0] = mat[0] * x + mat[3] * y + mat[6] * z;
            target[1] = mat[1] * x + mat[4] * y + mat[7] * z;
            target[2] = mat[2] * x + mat[5] * y + mat[8] * z;
            return target;
        }
    }
};

class AABBVolume {
    minBound;
    maxBound;

    constructor(...params) {
        this.minBound = GeometryOps.Vector3.new();
        this.maxBound = GeometryOps.Vector3.new();

        if (params.length === 0) {
            GeometryOps.Vector3.assign(0, 0, 0, this.minBound);
            GeometryOps.Vector3.assign(0, 0, 0, this.maxBound);
        } else if (params.length === 6 && typeof params[0] === 'number') {
            const cx = params[0], cy = params[1], cz = params[2];
            const hw = params[3], hh = params[4], hd = params[5];
            GeometryOps.Vector3.assign(cx - hw, cy - hh, cz - hd, this.minBound);
            GeometryOps.Vector3.assign(cx + hw, cy + hh, cz + hd, this.maxBound);
        } else if (params.length === 2 && Array.isArray(params[0]) && Array.isArray(params[1])) {
            const center = params[0];
            const halfSize = params[1];
            GeometryOps.Vector3.assign(
                center[0] - halfSize[0], center[1] - halfSize[1], center[2] - halfSize[2],
                this.minBound
            );
            GeometryOps.Vector3.assign(
                center[0] + halfSize[0], center[1] + halfSize[1], center[2] + halfSize[2],
                this.maxBound
            );
        } else if (params.length === 1 && params[0] instanceof AABBVolume) {
            GeometryOps.Vector3.duplicate(params[0].minBound, this.minBound);
            GeometryOps.Vector3.duplicate(params[0].maxBound, this.maxBound);
        } else {
            throw new Error("Invalid parameters for AABBVolume constructor");
        }
    }

    describe() {
        return `[SpatialCube min:${this.minBound}; max:${this.maxBound}]`;
    }

    getHalfExtents() {
        const diff = GeometryOps.Vector3.difference(this.maxBound, this.minBound);
        return GeometryOps.Vector3.multiplyScalar(diff, 0.5);
    }

    getCenterPoint() {
        const sum = GeometryOps.Vector3.sum(this.minBound, this.maxBound);
        return GeometryOps.Vector3.multiplyScalar(sum, 0.5);
    }

    getVolumeCapacity() {
        const diff = GeometryOps.Vector3.difference(this.maxBound, this.minBound);
        return diff[0] * diff[1] * diff[2];
    }

    checkRayOverlap(origin, direction, maxDistance) {
        if (maxDistance !== undefined) {
            return this.checkSegmentOverlap(origin, direction, maxDistance);
        }

        const tempCenter = this.getCenterPoint();
        const tempHalfSize = this.getHalfExtents();
        const fullSize = GeometryOps.Vector3.multiplyScalar(tempHalfSize, 2);
        const centerOffset = GeometryOps.Vector3.difference(origin, tempCenter);

        const absDirection = GeometryOps.Vector3.new();
        for(let i=0; i<3; i++) {
            absDirection[i] = Math.abs(direction[i]);
            if (Math.abs(centerOffset[i]) > fullSize[i] && centerOffset[i] * direction[i] >= 0) {
                return false;
            }
        }

        const crossAxisComponents = GeometryOps.Vector3.crossProduct(direction, centerOffset);

        let projectionExtent;
        const absCross0 = Math.abs(crossAxisComponents[0]);
        projectionExtent = fullSize[1] * absDirection[2] + fullSize[2] * absDirection[1];
        if (absCross0 > projectionExtent) return false;

        const absCross1 = Math.abs(crossAxisComponents[1]);
        projectionExtent = fullSize[0] * absDirection[2] + fullSize[2] * absDirection[0];
        if (absCross1 > projectionExtent) return false;

        const absCross2 = Math.abs(crossAxisComponents[2]);
        projectionExtent = fullSize[0] * absDirection[1] + fullSize[1] * absDirection[0];
        if (absCross2 > projectionExtent) return false;

        return true;
    }

    checkSegmentOverlap(segmentOrigin, segmentDirectionOrEnd, segmentLength) {
        let segmentVector = GeometryOps.Vector3.new();
        
        if (segmentLength !== undefined) {
            if (!isFinite(segmentLength)) {
                return this.checkRayOverlap(segmentOrigin, segmentDirectionOrEnd, undefined);
            }
            GeometryOps.Vector3.multiplyScalar(segmentDirectionOrEnd, segmentLength, segmentVector);
        } else {
            GeometryOps.Vector3.difference(segmentDirectionOrEnd, segmentOrigin, segmentVector);
        }

        const min = this.minBound;
        const max = this.maxBound;

        for (let i = 0; i < 3; i++) {
            const lowerBound = min[i];
            const upperBound = max[i];
            const segmentStartCoord = segmentOrigin[i];
            const segmentEndCoord = segmentOrigin[i] + segmentVector[i];

            if (segmentStartCoord < lowerBound) {
                if (lowerBound >= segmentEndCoord) {
                    return false;
                }
            } else if (segmentStartCoord >= upperBound) {
                return false;
            }
        }
        return true;
    }

    checkSphereOverlap(sphereCenter, sphereRadius) {
        let squaredDistance = 0;
        const min = this.minBound;
        const max = this.maxBound;

        for (let i = 0; i < 3; i++) {
            if (sphereCenter[i] < min[i]) {
                const delta = sphereCenter[i] - min[i];
                squaredDistance += delta * delta;
            } else if (sphereCenter[i] > max[i]) {
                const delta = sphereCenter[i] - max[i];
                squaredDistance += delta * delta;
            }
        }
        return squaredDistance <= (sphereRadius * sphereRadius);
    }

    checkPointOverlap(point) {
        const min = this.minBound;
        const max = this.maxBound;
        return (point[0] >= min[0] && point[0] <= max[0] &&
                point[1] >= min[1] && point[1] <= max[1] &&
                point[2] >= min[2] && point[2] <= max[2]);
    }

    checkAABBOverlap(otherVolume) {
        const minA = this.minBound;
        const maxA = this.maxBound;
        const minB = otherVolume.minBound;
        const maxB = otherVolume.maxBound;

        return (maxA[0] >= minB[0] && minA[0] <= maxB[0] &&
                maxA[1] >= minB[1] && minA[1] <= maxB[1] &&
                maxA[2] >= minB[2] && minA[2] <= maxB[2]);
    }

    checkOBBOverlap(otherVolume, transformationMatrix) {
        const currentCenter = this.getCenterPoint();
        const currentHalfExtents = this.getHalfExtents();

        const otherCenter = otherVolume.getCenterPoint();
        const otherHalfExtents = otherVolume.getHalfExtents();

        const transformedOtherCenter = GeometryOps.Matrix4.transformVector(transformationMatrix, otherCenter);

        const otherRotationMatrix = GeometryOps.Matrix4.getRotationMatrix3(transformationMatrix);

        const transformedOtherAxisX = GeometryOps.Matrix3.transformVector(otherRotationMatrix, GeometryOps.Vector3.axisX);
        const transformedOtherAxisY = GeometryOps.Matrix3.transformVector(otherRotationMatrix, GeometryOps.Vector3.axisY);
        const transformedOtherAxisZ = GeometryOps.Matrix3.transformVector(otherRotationMatrix, GeometryOps.Vector3.axisZ);

        const centerDifference = GeometryOps.Vector3.difference(transformedOtherCenter, currentCenter);

        const R_xx = GeometryOps.Vector3.dotProduct(GeometryOps.Vector3.axisX, transformedOtherAxisX);
        const R_xy = GeometryOps.Vector3.dotProduct(GeometryOps.Vector3.axisX, transformedOtherAxisY);
        const R_xz = GeometryOps.Vector3.dotProduct(GeometryOps.Vector3.axisX, transformedOtherAxisZ);

        const R_yx = GeometryOps.Vector3.dotProduct(GeometryOps.Vector3.axisY, transformedOtherAxisX);
        const R_yy = GeometryOps.Vector3.dotProduct(GeometryOps.Vector3.axisY, transformedOtherAxisY);
        const R_yz = GeometryOps.Vector3.dotProduct(GeometryOps.Vector3.axisY, transformedOtherAxisZ);

        const R_zx = GeometryOps.Vector3.dotProduct(GeometryOps.Vector3.axisZ, transformedOtherAxisX);
        const R_zy = GeometryOps.Vector3.dotProduct(GeometryOps.Vector3.axisZ, transformedOtherAxisY);
        const R_zz = GeometryOps.Vector3.dotProduct(GeometryOps.Vector3.axisZ, transformedOtherAxisZ);

        const abs_R_xx = Math.abs(R_xx), abs_R_xy = Math.abs(R_xy), abs_R_xz = Math.abs(R_xz);
        const abs_R_yx = Math.abs(R_yx), abs_R_yy = Math.abs(R_yy), abs_R_yz = Math.abs(R_yz);
        const abs_R_zx = Math.abs(R_zx), abs_R_zy = Math.abs(R_zy), abs_R_zz = Math.abs(R_zz);

        const halfA_x = currentHalfExtents[0], halfA_y = currentHalfExtents[1], halfA_z = currentHalfExtents[2];
        const halfB_x = otherHalfExtents[0], halfB_y = otherHalfExtents[1], halfB_z = otherHalfExtents[2];

        const getProjectionOverlap = (axis, extentA, extentB) => {
            const projectionDistance = Math.abs(GeometryOps.Vector3.dotProduct(centerDifference, axis));
            const combinedExtents = extentA + extentB;
            return projectionDistance > combinedExtents;
        };

        // 6 principal axes
        if (getProjectionOverlap(GeometryOps.Vector3.axisX, halfA_x, halfB_x * abs_R_xx + halfB_y * abs_R_xy + halfB_z * abs_R_xz)) return false;
        if (getProjectionOverlap(GeometryOps.Vector3.axisY, halfA_y, halfB_x * abs_R_yx + halfB_y * abs_R_yy + halfB_z * abs_R_yz)) return false;
        if (getProjectionOverlap(GeometryOps.Vector3.axisZ, halfA_z, halfB_x * abs_R_zx + halfB_y * abs_R_zy + halfB_z * abs_R_zz)) return false;

        if (getProjectionOverlap(transformedOtherAxisX, halfA_x * abs_R_xx + halfA_y * abs_R_yx + halfA_z * abs_R_zx, halfB_x)) return false;
        if (getProjectionOverlap(transformedOtherAxisY, halfA_x * abs_R_xy + halfA_y * abs_R_yy + halfA_z * abs_R_zy, halfB_y)) return false;
        if (getProjectionOverlap(transformedOtherAxisZ, halfA_x * abs_R_xz + halfA_y * abs_R_yz + halfA_z * abs_R_zz, halfB_z)) return false;

        // 9 cross product axes
        let crossAxis = GeometryOps.Vector3.new();

        GeometryOps.Vector3.crossProduct(GeometryOps.Vector3.axisX, transformedOtherAxisX, crossAxis);
        if (getProjectionOverlap(crossAxis,
            halfA_y * abs_R_zx + halfA_z * abs_R_yx,
            halfB_y * abs_R_xz + halfB_z * abs_R_xy
        )) return false;

        GeometryOps.Vector3.crossProduct(GeometryOps.Vector3.axisX, transformedOtherAxisY, crossAxis);
        if (getProjectionOverlap(crossAxis,
            halfA_y * abs_R_zy + halfA_z * abs_R_yy,
            halfB_x * abs_R_xz + halfB_z * abs_R_xx
        )) return false;
        
        GeometryOps.Vector3.crossProduct(GeometryOps.Vector3.axisX, transformedOtherAxisZ, crossAxis);
        if (getProjectionOverlap(crossAxis,
            halfA_y * abs_R_zz + halfA_z * abs_R_yz,
            halfB_x * abs_R_xy + halfB_y * abs_R_xx
        )) return false;

        GeometryOps.Vector3.crossProduct(GeometryOps.Vector3.axisY, transformedOtherAxisX, crossAxis);
        if (getProjectionOverlap(crossAxis,
            halfA_x * abs_R_zx + halfA_z * abs_R_xx,
            halfB_y * abs_R_yz + halfB_z * abs_R_yy
        )) return false;

        GeometryOps.Vector3.crossProduct(GeometryOps.Vector3.axisY, transformedOtherAxisY, crossAxis);
        if (getProjectionOverlap(crossAxis,
            halfA_x * abs_R_zy + halfA_z * abs_R_xy,
            halfB_x * abs_R_yz + halfB_z * abs_R_yx
        )) return false;

        GeometryOps.Vector3.crossProduct(GeometryOps.Vector3.axisY, transformedOtherAxisZ, crossAxis);
        if (getProjectionOverlap(crossAxis,
            halfA_x * abs_R_zz + halfA_z * abs_R_xz,
            halfB_x * abs_R_yy + halfB_y * abs_R_yx
        )) return false;

        GeometryOps.Vector3.crossProduct(GeometryOps.Vector3.axisZ, transformedOtherAxisX, crossAxis);
        if (getProjectionOverlap(crossAxis,
            halfA_x * abs_R_yx + halfA_y * abs_R_xx,
            halfB_y * abs_R_zz + halfB_z * abs_R_zy
        )) return false;

        GeometryOps.Vector3.crossProduct(GeometryOps.Vector3.axisZ, transformedOtherAxisY, crossAxis);
        if (getProjectionOverlap(crossAxis,
            halfA_x * abs_R_yy + halfA_y * abs_R_xy,
            halfB_x * abs_R_zz + halfB_z * abs_R_zx
        )) return false;

        GeometryOps.Vector3.crossProduct(GeometryOps.Vector3.axisZ, transformedOtherAxisZ, crossAxis);
        if (getProjectionOverlap(crossAxis,
            halfA_x * abs_R_yz + halfA_y * abs_R_xz,
            halfB_x * abs_R_zy + halfB_y * abs_R_zx
        )) return false;

        return true;
    }
}