// Constants for orientation
const ORIENTATION_CCW = 1;
const ORIENTATION_CW = -1;
const ONLINE_BEHIND = 2;
const ONLINE_AHEAD = -2;
const ON_LINE_SEG = 0;

// Floating point comparison threshold
const EPSILON_THRESHOLD = 1 / 8192;
const PI_VALUE = Math.PI;

// Vec2D class
class Vec2D {
    constructor(x_coord, y_coord) {
        this.x = x_coord;
        this.y = y_coord;
    }

    // Static factory method for a zero vector
    static zero() {
        return new Vec2D(0, 0);
    }

    // Method to get the squared length (norm) of the vector
    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    // Method to get the length of the vector
    length() {
        return Math.sqrt(this.lengthSq());
    }
}

/*
 * v: Vec2D
 */
function rotateVec90(v_input) {
    return new Vec2D(-v_input.y, v_input.x);
}

/*
 * get degree to radian return radian
 */
function degToRad(degree_val) {
    return degree_val * PI_VALUE / 180;
}

/*
 * vec:Vec2D return Vec2D
 */
function rotateVecByDeg(target_vec, degree_angle) {
    const radian_angle = degToRad(degree_angle);
    return rotateVecByRad(target_vec, radian_angle);
}

/*
 * vec:Vec2D return Vec2D
 */
function rotateVecByRad(target_vec, radian_angle) {
    const sin_val = Math.sin(radian_angle);
    const cos_val = Math.cos(radian_angle);

    return new Vec2D(
        target_vec.x * cos_val - target_vec.y * sin_val,
        target_vec.x * sin_val + target_vec.y * cos_val
    );
}

function areVecsEqual(vec_a, vec_b) {
    return isFloatEqual(vec_a.x - vec_b.x, 0) && isFloatEqual(vec_a.y - vec_b.y, 0);
}

/**
 * vec:Vec2D
 *
 * return unitVector
 */
function normalizeVec(input_vec) {
    const vec_len = input_vec.length();
    if (vec_len > 0) {
        return scaleVecByScalar(input_vec, 1 / vec_len);
    }
    return input_vec; // Return original if length is zero
}

function scaleVecByScalar(input_vec, scalar_val) {
    return new Vec2D(input_vec.x * scalar_val, input_vec.y * scalar_val);
}

function isFloatEqual(val_a, val_b) {
    return Math.abs(val_a - val_b) < EPSILON_THRESHOLD;
}

function areVecsParallel(vec_a, vec_b) {
    const normal_a = rotateVec90(vec_a);
    return isFloatEqual(0, dotProd(normal_a, vec_b));
}

function areVecsOrthogonal(vec_a, vec_b) {
    return isFloatEqual(0, dotProd(vec_a, vec_b));
}

function subVec(vec_a, vec_b) {
    return new Vec2D(vec_a.x - vec_b.x, vec_a.y - vec_b.y);
}

function dotProd(vec_a, vec_b) {
    return vec_a.x * vec_b.x + vec_a.y * vec_b.y;
}

/**
 * Cross product (2D magnitude)
 *
 * @param vec_a
 * @param vec_b
 * @returns
 */
function crossProd(vec_a, vec_b) {
    return vec_a.x * vec_b.y - vec_a.y * vec_b.x;
}

/**
 * line segment
 *
 * point1:Pt2D point2:Pt2D
 */
class Seg2D {
    constructor(pt_start, pt_end) {
        this.point1 = pt_start;
        this.point2 = pt_end;
    }
}

function isOnOneSide(axis_line, segment_to_check) {
    const diff1 = subVec(segment_to_check.point1, axis_line.base);
    const diff2 = subVec(segment_to_check.point2, axis_line.base);

    const normal_vec = rotateVec90(axis_line.direction);

    // Check if both points are on the same side of the axis line
    return dotProd(normal_vec, diff1) * dotProd(normal_vec, diff2) > 0;
}

function isRangeOverlap(min_a, max_a, min_b, max_b) {
    return min_b <= max_a && min_a <= max_b;
}

function doSegsIntersect(segment_a, segment_b) {
    // Create lines from segments for axis checks
    const line_a = new LineObj(segment_a.point1, subVec(segment_a.point2, segment_a.point1));
    const line_b = new LineObj(segment_b.point1, subVec(segment_b.point2, segment_b.point1));

    // Check if segment_b is entirely on one side of line_a
    if (isOnOneSide(line_a, segment_b)) {
        return false;
    }

    // Check if segment_a is entirely on one side of line_b
    if (isOnOneSide(line_b, segment_a)) {
        return false;
    }

    // If segments are parallel, check for overlap on the line
    if (areVecsParallel(line_a.direction, line_b.direction)) {
        const range_a = projectSegOntoVec(segment_a, line_a.direction);
        const range_b = projectSegOntoVec(segment_b, line_a.direction);

        // Check if projected ranges overlap
        return areRangesOverlapping(range_a, range_b);
    }
    // If not parallel and not on one side, they must intersect
    return true;
}

/*
 * Line Object class
 */
class LineObj {
    constructor(base_pt, direction_vec) {
        this.base = base_pt; // Vec2D
        this.direction = direction_vec; // Vec2D
    }
}

/**
 * Range class
 */
class Range {
    constructor(min_val, max_val) {
        this.min = min_val;
        this.max = max_val;
    }
}

function getCombinedRange(range_one, range_two) {
    return new Range(
        Math.min(range_one.min, range_two.min),
        Math.max(range_one.max, range_two.max)
    );
}

function getSortedRange(input_range) {
    if (input_range.min > input_range.max) {
        return new Range(input_range.max, input_range.min);
    }
    return new Range(input_range.min, input_range.max);
}

function negateVec(input_vec) {
    return new Vec2D(-input_vec.x, -input_vec.y);
}

function addVec(vec_a, vec_b) {
    return new Vec2D(vec_a.x + vec_b.x, vec_a.y + vec_b.y);
}

/**
 * segment:Seg2D onto:Vec2D
 *
 * return Range
 */
function projectSegOntoVec(target_segment, onto_vec) {
    const onto_unit_vec = normalizeVec(onto_vec);

    const min_proj = dotProd(onto_unit_vec, target_segment.point1);
    const max_proj = dotProd(onto_unit_vec, target_segment.point2);

    return getSortedRange(new Range(min_proj, max_proj));
}

function areRangesOverlapping(range_one, range_two) {
    return isRangeOverlap(range_one.min, range_one.max, range_two.min, range_two.max);
}

function projectVec(project_vec, onto_vec) {
    const onto_norm_sq = onto_vec.lengthSq();
    if (onto_norm_sq > 0) {
        const dot_product = dotProd(project_vec, onto_vec);
        return scaleVecByScalar(onto_vec, dot_product / onto_norm_sq);
    }
    return Vec2D.zero(); // If onto_vec is zero, projection is zero vector
}

/**
 * point class
 */
class Pt2D {
    constructor(x_coord, y_coord) {
        this.x = x_coord;
        this.y = y_coord;
    }
}

function addPts(pt_a, pt_b) {
    return new Pt2D(pt_a.x + pt_b.x, pt_a.y + pt_b.y);
}

function subPts(pt_a, pt_b) {
    return new Pt2D(pt_a.x - pt_b.x, pt_a.y - pt_b.y);
}

function scalePt(input_pt, scalar_val) {
    return new Pt2D(input_pt.x * scalar_val, input_pt.y * scalar_val);
}

/**
 * segment : Seg2D
 * point : Pt2D
 */
function projectPtOntoSeg(target_segment, target_point) {
    const seg_vec = subPts(target_segment.point2, target_segment.point1);
    const pt_to_seg_start_vec = subPts(target_point, target_segment.point1);

    const rate = dotProd(pt_to_seg_start_vec, seg_vec) / seg_vec.lengthSq();
    const projected_vec = scaleVecByScalar(seg_vec, rate);
    return addPts(target_segment.point1, projected_vec);
}

function reflectPtAcrossSeg(target_segment, target_point) {
    const projection_pt = projectPtOntoSeg(target_segment, target_point);
    // Vector from point to its projection
    const vec_to_proj = subPts(projection_pt, target_point);
    // Double this vector and add to original point to get reflection
    const reflection_vec = scalePt(vec_to_proj, 2);
    return addPts(reflection_vec, target_point);
}

/**
 * Helper to get intersection point of two lines defined by four points.
 * This is a Type III addition to support getConvexCut more directly.
 * @param {Pt2D} p1_line1 - First point of line 1
 * @param {Pt2D} p2_line1 - Second point of line 1
 * @param {Pt2D} p1_line2 - First point of line 2
 * @param {Pt2D} p2_line2 - Second point of line 2
 * @returns {Pt2D} The intersection point
 */
function getLineLineIntersection(p1_line1, p2_line1, p1_line2, p2_line2) {
    const vec_line1 = subPts(p2_line1, p1_line1);
    const vec_line2 = subPts(p2_line2, p1_line2);

    const cross_val = crossProd(vec_line1, vec_line2);

    // If cross_val is zero, lines are parallel or collinear, no unique intersection
    if (isFloatEqual(cross_val, 0)) {
        return null; // Or handle as needed, for convex cut, it implies no intersection or overlap
    }

    const vec_p1_to_p1 = subPts(p1_line2, p1_line1);
    const t = crossProd(vec_p1_to_p1, vec_line2) / cross_val;

    return addPts(p1_line1, scalePt(vec_line1, t));
}


/**
 *
 * @param seg_a
 * @param seg_b
 * @returns point
 */
function getSegIntersectionPt(seg_a, seg_b) {
    // This function calculates the intersection point of two line segments.
    // It uses the cross product method to find the parameter 't' along segment_a.
    const base_vec = subPts(seg_b.point2, seg_b.point1);
    const d1_vec = subPts(seg_a.point1, seg_b.point1);
    const d2_vec = subPts(seg_a.point2, seg_b.point1);

    const cross_d1 = Math.abs(crossProd(base_vec, d1_vec));
    const cross_d2 = Math.abs(crossProd(base_vec, d2_vec));

    const t_param = cross_d1 / (cross_d1 + cross_d2);

    const intersect_x = seg_a.point1.x + (seg_a.point2.x - seg_a.point1.x) * t_param;
    const intersect_y = seg_a.point1.y + (seg_a.point2.y - seg_a.point1.y) * t_param;

    return new Pt2D(intersect_x, intersect_y);
}

function clampVal(x_val, min_val, max_val) {
    if (x_val < min_val) {
        return min_val;
    } else if (x_val > max_val) {
        return max_val;
    } else {
        return x_val;
    }
}

/**
 * Distance between a line (defined by two points) and a point
 */
function distLineToPt(line_segment_as_line, target_point) {
    const vec_line = subPts(line_segment_as_line.point2, line_segment_as_line.point1);
    const vec_pt_to_line_start = subPts(target_point, line_segment_as_line.point1);
    return Math.abs(crossProd(vec_line, vec_pt_to_line_start) / vec_line.length());
}

/**
 * Distance between a line segment and a point
 */
function distSegToPt(target_segment, target_point) {
    const vec_seg_p2_p1 = subPts(target_segment.point2, target_segment.point1);
    const vec_pt_p1 = subPts(target_point, target_segment.point1);

    // If dot product is negative, point is "behind" p1
    if (dotProd(vec_seg_p2_p1, vec_pt_p1) < 0) {
        return subPts(target_point, target_segment.point1).length();
    }

    const vec_seg_p1_p2 = subPts(target_segment.point1, target_segment.point2);
    const vec_pt_p2 = subPts(target_point, target_segment.point2);

    // If dot product is negative, point is "behind" p2
    if (dotProd(vec_seg_p1_p2, vec_pt_p2) < 0) {
        return subPts(target_point, target_segment.point2).length();
    }

    // Otherwise, the closest point is on the line segment
    return distLineToPt(target_segment, target_point);
}

/**
 * Distance between two line segments
 */
function distSegToSeg(seg_a, seg_b) {
    // If segments intersect, distance is 0
    if (doSegsIntersect(seg_a, seg_b)) {
        return 0;
    }

    // Otherwise, find the minimum distance between endpoints of one segment to the other segment
    const dist1 = distSegToPt(seg_a, seg_b.point1);
    const dist2 = distSegToPt(seg_a, seg_b.point2);
    const dist3 = distSegToPt(seg_b, seg_a.point1);
    const dist4 = distSegToPt(seg_b, seg_a.point2);

    return Math.min(dist1, dist2, dist3, dist4);
}

function getOrientation(pt_a, pt_b, pt_c) {
    const vec_ab = subPts(pt_b, pt_a);
    const vec_ac = subPts(pt_c, pt_a);
    const signed_area = crossProd(vec_ab, vec_ac);

    if (signed_area > EPSILON_THRESHOLD) {
        return ORIENTATION_CCW;
    }
    if (signed_area < -EPSILON_THRESHOLD) {
        return ORIENTATION_CW;
    }
    // Collinear case
    if (dotProd(vec_ab, vec_ac) < -EPSILON_THRESHOLD) {
        return ONLINE_BEHIND; // C is behind A-B
    }
    if (vec_ab.lengthSq() < vec_ac.lengthSq()) {
        return ONLINE_AHEAD; // C is ahead of B on line A-B
    }
    return ON_LINE_SEG; // C is on segment A-B
}

/**
 * Andrew's Monotone Chain algorithm for convex hull
 */
function computeConvexHull(input_points) {
    if (input_points.length < 3) {
        return input_points;
    }

    // Sort points lexicographically (x then y)
    const point_sorter = (a, b) => {
        if (a.x !== b.x) return a.x - b.x;
        return a.y - b.y;
    };
    input_points.sort(point_sorter);

    const upper_hull = [];
    const lower_hull = [];

    // Build upper hull
    for (let i = 0; i < input_points.length; ++i) {
        while (upper_hull.length >= 2 && getOrientation(upper_hull[upper_hull.length - 2], upper_hull[upper_hull.length - 1], input_points[i]) !== ORIENTATION_CCW) {
            upper_hull.pop();
        }
        upper_hull.push(input_points[i]);
    }

    // Build lower hull
    for (let i = input_points.length - 1; i >= 0; --i) {
        while (lower_hull.length >= 2 && getOrientation(lower_hull[lower_hull.length - 2], lower_hull[lower_hull.length - 1], input_points[i]) !== ORIENTATION_CCW) {
            lower_hull.pop();
        }
        lower_hull.push(input_points[i]);
    }

    // Combine hulls, removing duplicates (first and last points)
    lower_hull.pop(); // Remove last point (duplicate of upper_hull's first)
    upper_hull.pop(); // Remove last point (duplicate of lower_hull's first)

    return upper_hull.concat(lower_hull.reverse());
}

function calcConvexDiameter(convex_points) {
    const num_points = convex_points.length;
    if (num_points < 2) return 0;
    if (num_points === 2) return distPts(convex_points[0], convex_points[1]);

    // Find initial antipodal pair (min/max y)
    let idx_i = 0; // Index for point with min y
    let idx_j = 0; // Index for point with max y
    for (let k = 1; k < num_points; k++) {
        if (convex_points[k].y > convex_points[idx_i].y) idx_i = k;
        if (convex_points[k].y < convex_points[idx_j].y) idx_j = k;
    }

    let max_dist_sq = subPts(convex_points[idx_i], convex_points[idx_j]).lengthSq();
    let current_i = idx_i;
    let current_j = idx_j;

    // Rotating calipers algorithm
    do {
        const next_i = (current_i + 1) % num_points;
        const next_j = (current_j + 1) % num_points;

        const vec_i_to_next_i = subPts(convex_points[next_i], convex_points[current_i]);
        const vec_j_to_next_j = subPts(convex_points[next_j], convex_points[current_j]);

        // Determine which caliper to advance
        if (crossProd(vec_i_to_next_i, vec_j_to_next_j) >= 0) {
            current_j = next_j;
        } else {
            current_i = next_i;
        }

        const current_dist_sq = subPts(convex_points[current_i], convex_points[current_j]).lengthSq();
        if (current_dist_sq > max_dist_sq) {
            max_dist_sq = current_dist_sq;
        }
    } while (current_i !== idx_i || current_j !== idx_j);

    return Math.sqrt(max_dist_sq);
}

/**
 * Returns the 2D area of a polygon defined by points
 * (Shoelace formula)
 */
function calcPolygonArea(polygon_points) {
    let total_area = 0;
    const num_points = polygon_points.length;
    for (let i = 0; i < num_points; ++i) {
        total_area += crossProd(polygon_points[i], polygon_points[(i + 1) % num_points]);
    }
    return total_area / 2;
}

function clipConvexPolygon(polygon_points, cut_line_p1, cut_line_p2) {
    const clipped_polygon = [];
    const num_points = polygon_points.length;

    for (let i = 0; i < num_points; ++i) {
        const current_pt = polygon_points[i];
        const next_pt = polygon_points[(i + 1) % num_points];

        const current_pt_orientation = getOrientation(cut_line_p1, cut_line_p2, current_pt);

        // If current point is on the "inside" (not clockwise relative to cut line)
        if (current_pt_orientation !== ORIENTATION_CW) {
            clipped_polygon.push(current_pt);
        }

        const next_pt_orientation = getOrientation(cut_line_p1, cut_line_p2, next_pt);

        // If points cross the cutting line (one is CW, other is not)
        if (current_pt_orientation !== next_pt_orientation && current_pt_orientation !== ON_LINE_SEG && next_pt_orientation !== ON_LINE_SEG) {
            const intersection_pt = getLineLineIntersection(cut_line_p1, cut_line_p2, current_pt, next_pt);
            if (intersection_pt) { // Ensure an intersection was found
                clipped_polygon.push(intersection_pt);
            }
        }
    }
    return clipped_polygon;
}

function distPts(pt_a, pt_b) {
    const dx = pt_a.x - pt_b.x;
    const dy = pt_a.y - pt_b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function findClosestPair(points_arr, count) {
    if (count <= 1) return Number.MAX_SAFE_INTEGER;
    if (count === 2) return distPts(points_arr[0], points_arr[1]);

    const mid_idx = Math.floor(count / 2);
    const mid_x = points_arr[mid_idx].x;

    // Recursively find closest pair in left and right halves
    let min_dist = Math.min(
        findClosestPair(points_arr.slice(0, mid_idx), mid_idx),
        findClosestPair(points_arr.slice(mid_idx), count - mid_idx)
    );

    // Create a strip of points within min_dist of the dividing line
    const strip_points = [];
    for (let i = 0; i < count; ++i) {
        if (Math.abs(points_arr[i].x - mid_x) < min_dist) {
            strip_points.push(points_arr[i]);
        }
    }

    // Sort strip points by y-coordinate
    strip_points.sort((a, b) => a.y - b.y);

    // Check distances within the strip
    for (let i = 0; i < strip_points.length; ++i) {
        for (let j = i + 1; j < strip_points.length && (strip_points[j].y - strip_points[i].y) < min_dist; ++j) {
            const current_dist = distPts(strip_points[i], strip_points[j]);
            if (current_dist < min_dist) {
                min_dist = current_dist;
            }
        }
    }
    return min_dist;
}

/**
 * 2D Circle class
 */
class Circ2D {
    constructor(x_center, y_center, radius_val) {
        this.center = new Pt2D(x_center, y_center);
        this.r = radius_val;
    }
}

/**
 * Returns intersection points of a circle and a line (segment)
 */
function getCircLineIntersections(line_seg, circle_obj) {
    const dist_to_center = distLineToPt(line_seg, circle_obj.center);

    // No intersection
    if (dist_to_center > circle_obj.r + EPSILON_THRESHOLD) { // Add epsilon for robustness
        return [];
    }

    // Projection point of circle center onto the line
    const proj_pt = projectPtOntoSeg(line_seg, circle_obj.center);

    // One intersection (tangent)
    if (isFloatEqual(dist_to_center, circle_obj.r)) {
        return [proj_pt];
    }
    // Two intersections
    else {
        // Line direction vector (from p1 to p2)
        const line_dir_vec = normalizeVec(subPts(line_seg.point2, line_seg.point1));
        // Distance from projection point to intersection points
        const dist_proj_to_intersect = Math.sqrt(circle_obj.r * circle_obj.r - subPts(proj_pt, circle_obj.center).lengthSq());

        const intersection_pts = [];
        intersection_pts.push(addPts(proj_pt, scaleVecByScalar(line_dir_vec, dist_proj_to_intersect)));
        intersection_pts.push(subPts(proj_pt, scaleVecByScalar(line_dir_vec, dist_proj_to_intersect)));
        return intersection_pts;
    }
}

/**
 * Returns polar coordinates (x,y) from magnitude 'a' and angle 'r' (radians)
 */
function getPolarCoords(magnitude_a, angle_rad) {
    return new Pt2D(Math.cos(angle_rad) * magnitude_a, Math.sin(angle_rad) * magnitude_a);
}

/*
 * Returns intersection points of two circles
 */
function getCircCircIntersections(circle_one, circle_two) {
    const intersection_pts = [];
    // Distance between centers
    const center_dist = distPts(circle_one.center, circle_two.center);
    const radius_sum = circle_one.r + circle_two.r;
    const radius_diff = Math.abs(circle_one.r - circle_two.r);

    // No intersection (circles too far apart or one completely inside other without touching)
    if (center_dist > radius_sum + EPSILON_THRESHOLD || center_dist < radius_diff - EPSILON_THRESHOLD) {
        return [];
    }
    // One intersection (tangent)
    else if (isFloatEqual(center_dist, radius_sum) || isFloatEqual(center_dist, radius_diff)) {
        const vec_c1_to_c2 = subPts(circle_two.center, circle_one.center);
        const unit_vec = normalizeVec(vec_c1_to_c2);
        const tangent_pt = addPts(circle_one.center, scaleVecByScalar(unit_vec, circle_one.r));
        intersection_pts.push(tangent_pt);
        return intersection_pts;
    }
    // Two intersections
    else {
        // Angle 'a' from center1-center2 line to center1-intersection line
        const angle_a = Math.acos((circle_one.r * circle_one.r + center_dist * center_dist - circle_two.r * circle_two.r) / (2 * circle_one.r * center_dist));
        // Angle 't' of the center1-center2 vector relative to x-axis
        const vec_c1_to_c2 = subPts(circle_two.center, circle_one.center);
        const angle_t = Math.atan2(vec_c1_to_c2.y, vec_c1_to_c2.x);

        intersection_pts.push(addPts(circle_one.center, getPolarCoords(circle_one.r, angle_t + angle_a)));
        intersection_pts.push(addPts(circle_one.center, getPolarCoords(circle_one.r, angle_t - angle_a)));
        return intersection_pts;
    }
}

/**
 * Returns the tangent points from an external point to a circle
 */
function getTangentPtsFromExternalPt(circle_obj, external_pt) {
    const vec_center_to_ext = subPts(external_pt, circle_obj.center);
    const dist_center_to_ext = vec_center_to_ext.length();

    // If point is inside the circle, no real tangents
    if (dist_center_to_ext < circle_obj.r - EPSILON_THRESHOLD) {
        return [];
    }
    // If point is on the circle, it's a single tangent point (itself)
    if (isFloatEqual(dist_center_to_ext, circle_obj.r)) {
        return [external_pt];
    }

    // Angle from center-external_pt vector to center-tangent_pt vector
    const tangent_angle = Math.acos(circle_obj.r / dist_center_to_ext);
    // Angle of center-external_pt vector relative to x-axis
    const angle_vec_center_to_ext = Math.atan2(vec_center_to_ext.y, vec_center_to_ext.x);

    const tangent_points = [];
    tangent_points.push(addPts(circle_obj.center, getPolarCoords(circle_obj.r, angle_vec_center_to_ext + tangent_angle)));
    tangent_points.push(addPts(circle_obj.center, getPolarCoords(circle_obj.r, angle_vec_center_to_ext - tangent_angle)));
    return tangent_points;
}

function getSignedArea(pt_a, pt_b, pt_c) {
    const vec_ab = subPts(pt_b, pt_a);
    const vec_ac = subPts(pt_c, pt_a);
    return crossProd(vec_ab, vec_ac);
}

const input_data = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input_data.trim().split("\n");

for (let i = 0; i < lines.length; ++i) {
    const coords = lines[i].split(" ").map(Number);
    const p1_tri = new Pt2D(coords[0], coords[1]);
    const p2_tri = new Pt2D(coords[2], coords[3]);
    const p3_tri = new Pt2D(coords[4], coords[5]);
    const p_test = new Pt2D(coords[6], coords[7]);

    // Calculate signed areas (cross products) for point P relative to each triangle edge
    const area1 = getSignedArea(p1_tri, p2_tri, p_test);
    const area2 = getSignedArea(p2_tri, p3_tri, p_test);
    const area3 = getSignedArea(p3_tri, p1_tri, p_test);

    let result_str = "NO";
    // If all signed areas have the same sign (all positive or all negative),
    // the point is inside the triangle.
    // This handles both clockwise and counter-clockwise triangle definitions.
    if ((area1 > 0 && area2 > 0 && area3 > 0) || (area1 < 0 && area2 < 0 && area3 < 0)) {
        result_str = "YES";
    }
    console.log(result_str);
}
