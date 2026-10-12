function formatLogMessage() {
    return "return";
}
function formatLogMessage1(a) {
    return a;
}
const initialValue = 1;
var RenamedCOUNTER_CLOCKWISE = initialValue;
const initialValue1 = -1;
var RenamedCLOCKWISE = initialValue1;
const initialValue2 = 2;
var RenamedONLINE_BACK = initialValue2;
const initialValue3 = -2;
var RenamedONLINE_FRONT = initialValue3;
const initialValue4 = 0;
var RenamedON_SEGMENT = initialValue4;
// Vector2d
var RenamedVector2D = class RenamedVector2D {
    constructor(sourceValue, targetValue) {
        this.x = sourceValue;
        this.y = targetValue;
    }
};
RenamedVector2D.prototype.Init = function (sourceValue, targetValue) {
    this.x = sourceValue;
    this.y = targetValue;
};
/*
 * v: Vector2D
 */
function rotateVector90(currentValue) {
    var resultValue = new RenamedVector2D();
    resultValue.x = -currentValue.y;
    resultValue.y = currentValue.x;
    return resultValue;
}
/*
 * get degree to radian return radian
 */
function getDegreeToRadian(degreeValue) {
    var nextValue = 3.14159265358979323846;
    const productValue = degreeValue * nextValue;
    const returnValue = productValue / 180;
    return returnValue;
}
/*
 * vec:Vector2D return Vector2D
 */
function getRotateVector(vecValue, degreeValue) {
    var radianValue = getDegreeToRadian(degreeValue);
    var sinValue = Math.sin(radianValue);
    var cosValue = Math.cos(radianValue);
    var resultValue = new RenamedVector2D();
    resultValue.x = vecValue.x * cosValue - vecValue.y * sinValue;
    resultValue.y = vecValue.x * sinValue + vecValue.y * cosValue;
    const returnValue1 = resultValue;
    return returnValue1;
}
/*
 * vec:Vector2D return Vector2D
 */
function getRotateVectorFromRad(vecValue, radianValue) {
    var sinValue = Math.sin(radianValue);
    var cosValue = Math.cos(radianValue);
    var resultValue = new RenamedVector2D();
    resultValue.x = vecValue.x * cosValue - vecValue.y * sinValue;
    resultValue.y = vecValue.x * sinValue + vecValue.y * cosValue;
    const returnValue2 = resultValue;
    return returnValue2;
}
function isEqualVectors(firstValue, secondValue) {
    const returnValue3 = equalFloats(firstValue.x - secondValue.x, 0) && equalFloats(firstValue.y - secondValue.y, 0);
    return returnValue3;
}
/**
 * vec:Vector2D
 *
 * return unitVector
 */
function getUnitVector(vecValue) {
    var lengthValue = getVectorLength2D(vecValue);
    if (lengthValue > 0) {
        return getDivideVector(vecValue, lengthValue);
    }
    return vecValue;
}
/**
 * return vector length
 *
 * vec:Vector2D
 */
function getVectorLength2D(vecValue) {
    return Math.sqrt((vecValue.x * vecValue.x) + (vecValue.y * vecValue.y));
}
function getNorm(vecValue) {
    return vecValue.x * vecValue.x + vecValue.y * vecValue.y;
}
function getDivideVector(vec2DValue, lengthValue) {
    var vecValue = new RenamedVector2D();
    vecValue.x = vec2DValue.x / lengthValue;
    vecValue.y = vec2DValue.y / lengthValue;
    return vecValue;
}
function equalFloats(firstValue, secondValue) {
    var thresholdValue = 1 / 8192;
    return Math.abs(firstValue - secondValue) < thresholdValue;
}
function isParallelVector(vectorAValue, vectorBValue) {
    var sourceValue1 = rotateVector90(vectorAValue);
    return equalFloats(0, dotProduct2D(sourceValue1, vectorBValue));
}
function isVerticalVector(vectorAValue, vectorBValue) {
    return equalFloats(0, dotProduct2D(vectorAValue, vectorBValue));
}
function subtractVector(vecAValue, vecBValue) {
    var vecValue = new RenamedVector2D();
    vecValue.x = vecAValue.x - vecBValue.x;
    vecValue.y = vecAValue.y - vecBValue.y;
    return vecValue;
}
function dotProduct2D(vecAValue, vecBValue) {
    var dotValue = vecAValue.x * vecBValue.x + vecAValue.y * vecBValue.y;
    return vecAValue.x * vecBValue.x + vecAValue.y * vecBValue.y;
}
/**
 * 外積
 *
 * @param vecA
 * @param vecB
 * @returns
 */
function getCross(vecAValue, vecBValue) {
    return vecAValue.x * vecBValue.y - vecAValue.y * vecBValue.x;
}
/**
 * line segment
 *
 * point1:Vector2D point2:Vector2D
 */
var RenamedLineSegment2D = class RenamedLineSegment2D {
    constructor(point1Value, point2Value) {
        this.point1 = point1Value;
        this.point2 = point2Value;
    }
};
RenamedLineSegment2D.prototype.Init = function (point1Value, point2Value) {
    this.point1 = point1Value;
    this.point2 = point2Value;
};
function onOneSide(axisValue, segmentValue) {
    var targetValue1 = new RenamedVector2D();
    const assignedValue = subtractVector(segmentValue.point1, axisValue.base);
    targetValue1 = assignedValue;
    var entryValue = new RenamedVector2D();
    entryValue = subtractVector(segmentValue.point2, axisValue.base);
    var limitValue = new RenamedVector2D();
    const assignedValue1 = rotateVector90(axisValue.direction);
    limitValue = assignedValue1;
    // 同じ方向だということを返す
    return dotProduct2D(limitValue, targetValue1) * dotProduct2D(limitValue, entryValue) > 0;
}
function overLapping(minAValue, maxAValue, minBValue, maxBValue) {
    const comparisonValue = minBValue <= maxAValue;
    const comparisonValue1 = minAValue <= maxBValue;
    const returnValue4 = comparisonValue && comparisonValue1;
    return returnValue4;
}
function isSegmentsCollide(segment1Value, segment2Value) {
    // 線分の方向をチェックするためのベクトル
    var axisAValue = new Line();
    var axisBValue = new Line();
    // 線分1のベクトルに対して、線分2が片側にあるかチェック
    axisAValue.base = segment1Value.point1;
    axisAValue.direction = subtractVector(segment1Value.point2, segment1Value.point1);
    if (onOneSide(axisAValue, segment2Value)) {
        return false;
    }
    // 同じく
    axisBValue.base = segment2Value.point1;
    axisBValue.direction = subtractVector(segment2Value.point2, segment2Value.point1);
    const conditionMet = onOneSide(axisBValue, segment1Value);
    if (conditionMet) {
        return false;
    }
    const conditionMet1 = isParallelVector(axisAValue.direction, axisBValue.direction);
    // 同じベクトルをもつケース
    if (conditionMet1) {
        var rangeAValue = getProjectSegment(segment1Value, axisAValue.direction);
        var rangeBValue = getProjectSegment(segment2Value, axisAValue.direction);
        // 重なっているか
        return isOverLappingRanges(rangeAValue, rangeBValue);
    }
    else {
        return true;
    }
}
/*
 * Line Object
 */
function Line() {
    // vector2D
    this.base;
    // vector2D
    this.direction;
}
Line.prototype.Init = function (baseValue, directionValue, colorValue) {
    this.base = baseValue;
    this.direction = directionValue;
};
/**
 * Range
 */
var RenamedRange = class RenamedRange {
    constructor(minValue, maxValue) {
        this.min = minValue;
        this.max = maxValue;
    }
};
function getMaxMinRange(range1Value, range2Value) {
    var rangeValue = new RenamedRange();
    rangeValue.min = range1Value.min < range2Value.min ? range1Value.min : range2Value.min;
    rangeValue.max = range1Value.max < range2Value.max ? range2Value.max : range1Value.max;
    return rangeValue;
}
function getSortRange(rangeValue) {
    var sortedValue = new RenamedRange(rangeValue.min, rangeValue.max);
    const conditionMet2 = rangeValue.min > rangeValue.max;
    if (conditionMet2) {
        sortedValue.min = rangeValue.max;
        sortedValue.max = rangeValue.min;
    }
    return sortedValue;
}
function getNegateVector(vectorValue) {
    vectorValue.x = -vectorValue.x;
    vectorValue.y = -vectorValue.y;
    return vectorValue;
}
function addVector(vecAValue, vecBValue) {
    return new RenamedVector2D(vecAValue.x + vecBValue.x, vecAValue.y + vecBValue.y);
}
/**
 * segment:segment onto:Vector2D
 * cc
 * return Range
 */
function getProjectSegment(segmentValue, ontoValue) {
    var ontoUnitVecValue = getUnitVector(ontoValue);
    var rangeValue = new RenamedRange();
    rangeValue.min = dotProduct2D(ontoUnitVecValue, segmentValue.point1);
    rangeValue.max = dotProduct2D(ontoUnitVecValue, segmentValue.point2);
    const assignedValue2 = getSortRange(rangeValue);
    rangeValue = assignedValue2;
    return rangeValue;
}
function isOverLappingRanges(range1Value, range2Value) {
    return overLapping(range1Value.min, range1Value.max, range2Value.min, range2Value.max);
}
function projectVector(projectValue, ontoValue) {
    var resultValue1 = dotProduct2D(ontoValue, ontoValue);
    const conditionMet3 = 0 < resultValue1;
    if (conditionMet3) {
        var workingValue = dotProduct2D(projectValue, ontoValue);
        return multiplyVector(ontoValue, workingValue / resultValue1);
    }
    return ontoValue;
}
/**
 * point class
 */
var RenamedPoint2D = class RenamedPoint2D {
    constructor(sourceValue, targetValue) {
        this.x = sourceValue;
        this.y = targetValue;
    }
};
function addPoint(point1Value, point2Value) {
    return new RenamedPoint2D(point1Value.x + point2Value.x, point1Value.y + point2Value.y);
}
function subtractPoint(point1Value, point2Value) {
    return new RenamedPoint2D(point1Value.x - point2Value.x, point1Value.y - point2Value.y);
}
function multiplyPoint(pointValue, scalarValue) {
    return new RenamedPoint2D(pointValue.x * scalarValue, pointValue.y * scalarValue);
}
/**
 * segment : LineSegment2D
 * point : Point
 */
function getProjectPoint(segmentValue, pointValue) {
    var vec1Value = new RenamedVector2D(segmentValue.point2.x - segmentValue.point1.x, segmentValue.point2.y - segmentValue.point1.y);
    var vec2Value = new RenamedVector2D(pointValue.x - segmentValue.point1.x, pointValue.y - segmentValue.point1.y);
    var rateValue = dotProduct2D(vec2Value, vec1Value) / getNorm(vec1Value);
    var vec3Value = multiplyVector(vec1Value, rateValue);
    var projectValue = new RenamedPoint2D(segmentValue.point1.x + vec3Value.x, segmentValue.point1.y + vec3Value.y);
    return projectValue;
}
function getReflectionPoint(segmentValue, pointValue) {
    var projectionValue = getProjectPoint(segmentValue, pointValue);
    // pから射影点までのベクトル
    var vecValue = subtractPoint(projectionValue, pointValue);
    // 2倍したものが射影点になる
    var refrectionPointValue = multiplyPoint(vecValue, 2);
    // 始点を足す
    return addPoint(refrectionPointValue, pointValue);
}
/**
 *
 * @param segment1
 * @param segment2
 * @returns point
 */
function getCrossPoint(segment1Value, segment2Value) {
    // 基準となる線を決める
    var baseVector = new RenamedVector2D(segment2Value.point2.x - segment2Value.point1.x, segment2Value.point2.y - segment2Value.point1.y);
    var d1Vec = new RenamedVector2D(segment1Value.point1.x - segment2Value.point1.x, segment1Value.point1.y - segment2Value.point1.y);
    var d2Vec = new RenamedVector2D(segment1Value.point2.x - segment2Value.point1.x, segment1Value.point2.y - segment2Value.point1.y);
    var targetValue1 = Math.abs(getCross(baseVector, d1Vec));
    var entryValue = Math.abs(getCross(baseVector, d2Vec));
    const partialValue = targetValue1 + entryValue;
    var t = targetValue1 / (partialValue);
    var sourceValue = segment1Value.point1.x + (segment1Value.point2.x - segment1Value.point1.x) * t;
    var targetValue = segment1Value.point1.y + (segment1Value.point2.y - segment1Value.point1.y) * t;
    return new RenamedPoint2D(sourceValue, targetValue);
}
function multiplyVector(vecValue, scalarValue) {
    var temp = new RenamedVector2D();
    temp.x = vecValue.x * scalarValue;
    temp.y = vecValue.y * scalarValue;
    return temp;
}
function clampOnRange(sourceValue, minValue, maxValue) {
    if (sourceValue < minValue) {
        return minValue;
    }
    else if (sourceValue > maxValue) {
        return maxValue;
    }
    else {
        return sourceValue;
    }
}
/**
 * 直線と点との距離
 */
function getDistanceLinePoint(line, pointValue) {
    var vec1Value = new RenamedVector2D(line.point2.x - line.point1.x, line.point2.y - line.point1.y);
    var vec2Value = new RenamedVector2D(pointValue.x - line.point1.x, pointValue.y - line.point1.y);
    return Math.abs(getCross(vec1Value, vec2Value) / getVectorLength2D(vec1Value));
}
/**
 * 線分と点との距離を求める
 */
function getDistanceSegmentPoint(segmentValue, pointValue) {
    // ベクトルp2 - p1とベクトルp - p1がなす角θが90どより大きい場合(-90より小さい場合)
    // dは点pと点p1の距離になる
    if (dotProduct2D(subtractPoint(segmentValue.point2, segmentValue.point1), subtractPoint(pointValue, segmentValue.point1)) < 0) {
        return getVectorLength2D(subtractPoint(pointValue, segmentValue.point1));
    }
    // ベクトルp1 - p2とベクトルp - p2がなす角θが90どより大きい場合(-90より小さい場合)
    // dは点pと点p2の距離になる
    if (dotProduct2D(subtractPoint(segmentValue.point1, segmentValue.point2), subtractPoint(pointValue, segmentValue.point2)) < 0) {
        return getVectorLength2D(subtractPoint(pointValue, segmentValue.point2));
    }
    // それ以外はdは点pと直線p1p2の距離になる
    return getDistanceLinePoint(segmentValue, pointValue);
}
/**
 * 線分と線分との距離を求める
 */
function getSegmentDistance(segment1Value, segment2Value) {
    // 交差していた場合距離は0になる
    if (isSegmentsCollide(segment1Value, segment2Value)) {
        return 0;
    }
    return Math.min(Math.min(getDistanceSegmentPoint(segment1Value, segment2Value.point1), getDistanceSegmentPoint(segment1Value, segment2Value.point2)), Math.min(getDistanceSegmentPoint(segment2Value, segment1Value.point1), getDistanceSegmentPoint(segment2Value, segment1Value.point2)));
}
function ccw(point1Value, point2Value, point3) {
    var vec1Value = new RenamedVector2D(point2Value.x - point1Value.x, point2Value.y - point1Value.y);
    var vec2Value = new RenamedVector2D(point3.x - point1Value.x, point3.y - point1Value.y);
    var cross = getCross(vec1Value, vec2Value);
    if (cross > Number.EPSILON) {
        return RenamedCOUNTER_CLOCKWISE;
    }
    if (cross < -Number.EPSILON) {
        return RenamedCLOCKWISE;
    }
    if (dotProduct2D(vec1Value, vec2Value) < -Number.EPSILON) {
        return RenamedONLINE_BACK;
    }
    if (getVectorLength2D(vec1Value) < getVectorLength2D(vec2Value)) {
        return RenamedONLINE_FRONT;
    }
    return RenamedON_SEGMENT;
}
/**
 * アンドリューでconvex hollを返す
*/
function getConvexHoll(points) {
    if (points.length < 3) {
        return points;
    }
    // xを基準に昇順にソート、数値が同じものはyが小さいもの基準にソート 
    points.sort((firstValue, secondValue) => (firstValue.x > secondValue.x) ? 1 : (firstValue.x == secondValue.x) ? ((firstValue.y > secondValue.y) ? 1 : -1) : -1);
    // xを小さいほうから2つ
    var u = [];
    u.push(points[0]);
    u.push(points[1]);
    // xを大きい方から2つ
    var l = [];
    l.push(points[points.length - 1]);
    l.push(points[points.length - 2]);
    // 上部の生成
    for (var i = 2; i < points.length; ++i) {
        var j = u.length;
        while (j >= 2 && ccw(u[j - 2], u[j - 1], points[i]) == RenamedCOUNTER_CLOCKWISE) {
            u.pop();
            --j;
        }
        u.push(points[i]);
    }
    // 下部の生成
    for (var i = points.length - 3; i >= 0; --i) {
        // 対象が半時計なら削除する
        for (var j = l.length; j >= 2 && ccw(l[j - 2], l[j - 1], points[i]) == RenamedCOUNTER_CLOCKWISE; --j) {
            l.pop();
            ;
        }
        l.push(points[i]);
    }
    // 時計回りに凸包の点の列を生成
    l.reverse();
    for (var i = u.length - 2; i >= 1; --i) {
        l.push(u[i]);
    }
    return l;
}
function getConvexDiameter(points) {
    // 対心点(p,q)を取る(y軸で最小・最大のもの)
    var is = 0;
    var js = 0;
    for (var i = 1; i < points.length; i++) {
        if (points[i].y > points[is].y)
            is = i;
        if (points[i].y < points[js].y)
            js = i;
    }
    var distance = getNorm(subtractVector(points[is], points[js]));
    var maxi = is, i = js, maxj = js, j = js;
    do {
        // 対心点の中で最長距離のものを探す
        if (getCross(subtractVector(points[(i + 1) % points.length], points[i]), subtractVector(points[(j + 1) % points.length], points[j])) >= 0) {
            j = (j + 1) % points.length;
        }
        else {
            i = (i + 1) % points.length;
        }
        if (getNorm(subtractVector(points[i], points[j])) > distance) {
            distance = getNorm(subtractVector(points[i], points[j]));
            maxi = i;
            maxj = j;
        }
    } while (i != is || j != js);
    return distance;
}
/**
 * 点で構成される多角形の2d面積を返す
 *
 */
function getArea(points) {
    var area = 0;
    for (var i = 0; i < points.length; ++i) {
        area += getCross(points[i], points[(i + 1) % points.length]);
    }
    return area / 2;
}
function getConvexCut(points, point1Value, point2Value) {
    // 切り取られた多角形
    var convex = [];
    for (var i = 0; i < points.length; ++i) {
        var nowPoint = points[i];
        var nextPoint = points[(i + 1) % points.length];
        var nowPointCcw = ccw(point1Value, point2Value, nowPoint);
        if (nowPointCcw != RenamedCLOCKWISE) {
            convex.push(nowPoint);
        }
        if (nowPointCcw * ccw(point1Value, point2Value, nextPoint) == RenamedCLOCKWISE) {
            // 交点を求める
            var crossPoint = getCrossPointFromPoints(point1Value, point2Value, nowPoint, nextPoint);
            convex.push(crossPoint);
        }
    }
    return convex;
}
function getPointDistance(point1Value, point2Value) {
    var sourceValue = point1Value.x - point2Value.x;
    var targetValue = point1Value.y - point2Value.y;
    return Math.sqrt(sourceValue * sourceValue + targetValue * targetValue);
}
function closestPair(points, limitValue) {
    if (limitValue == 1)
        return Number.MAX_SAFE_INTEGER;
    var resultValue1 = Number.MAX_SAFE_INTEGER;
    var m = Math.floor(limitValue / 2);
    resultValue1 = Math.min(closestPair(points, m), closestPair(points.slice(m), limitValue - m));
    var mx = points[m].x;
    var arr = [];
    for (var i = m; i >= 0; --i) {
        var sourceValue = Math.abs(points[i].x - mx);
        if (sourceValue > resultValue1) {
            break;
        }
        else {
            arr.push(points[i]);
        }
    }
    for (var i = m + 1; i < limitValue; ++i) {
        if (Math.abs(points[i].x - mx) > resultValue1) {
            break;
        }
        else {
            arr.push(points[i]);
        }
    }
    arr.sort((firstValue, secondValue) => (firstValue.y > secondValue.y) ? 1 : -1);
    for (var i = 0; i < arr.length; ++i) {
        for (var j = i + 1; j < arr.length && Math.abs(arr[j].y - arr[i].y) < resultValue1; ++j) {
            var tmp = getPointDistance(arr[i], arr[j]);
            if (tmp < resultValue1)
                resultValue1 = tmp;
        }
    }
    return resultValue1;
}
/**
 * 2d円を表すクラス
 *
 */
var Circle2D = class Circle2D {
    constructor(sourceValue, targetValue, resultValue) {
        this.center = new RenamedPoint2D(sourceValue, targetValue);
        this.r = resultValue;
    }
};
/**
 * 円と直線の交点を返す
 *
 */
function getCircleLineCrossPoints(line, circle) {
    var resultValue1 = getDistanceLinePoint(line, circle.center);
    // 交点がない場合
    if (resultValue1 > circle.r) {
        const messageText = formatLogMessage();
        console.log(messageText);
        return;
    }
    // 円の中心から直線への射影点
    var pr = getProjectPoint(line, circle.center);
    // 交点が一つ
    if (equalFloats(resultValue1, circle.r)) {
        // 射影点が交点になる
        return pr;
    }
    // 交点が2つ
    else {
        // 直線の単位ベクトルを求める
        var unit = getUnitVector(new RenamedVector2D(line.point1.x - line.point2.x, line.point1.y - line.point2.y));
        // 射影点から交点までの長さを求める
        var lengthValue = Math.sqrt((circle.r * circle.r) - getNorm(subtractVector(pr, circle.center)));
        var crossPoints = [];
        crossPoints[0] = addPoint(pr, multiplyVector(unit, lengthValue));
        crossPoints[1] = subtractVector(pr, multiplyVector(unit, lengthValue));
        return crossPoints;
    }
}
/**
 * 極点を返す
 *
*/
function getPolar(firstValue, resultValue) {
    return new RenamedPoint2D(Math.cos(resultValue) * firstValue, Math.sin(resultValue) * firstValue);
}
/*
 * 円と円との交点を求める
 */
function getCircleCircleCrossPoints(circle1, circle2) {
    var crossPoints = [];
    // 円の中心との距離
    var resultValue1 = getPointDistance(circle1.center, circle2.center);
    var rDis = circle1.r + circle2.r;
    // 交点がない
    if (resultValue1 > rDis) {
        return;
    }
    // 交点が一つ
    else if (equalFloats(resultValue1 == rDis)) {
        // 点と点のベクトルを求める
        var vecValue = new RenamedVector2D(circle2.center.x - circle1.center.x, circle2.center.y - circle1.center.y);
        // 単位ベクトル
        var unit = getUnitVector(vecValue);
        var pointValue = multiplyVector(unit, resultValue1);
        crossPoints[0] = crossPoints[1] = pointValue;
    }
    else {
        // 中心点1から中心点2の線分と交点との角度aを余弦を使って求める
        var firstValue = Math.acos((circle1.r * circle1.r + resultValue1 * resultValue1 - circle2.r * circle2.r) / (2 * circle1.r * resultValue1));
        // 中心点1を通るy = 0の直線とaとの差分の角度をtとする
        var vecValue = subtractVector(circle2.center, circle1.center);
        var t = Math.atan2(vecValue.y, vecValue.x);
        crossPoints[0] = addPoint(circle1.center, getPolar(circle1.r, t + firstValue));
        crossPoints[1] = addPoint(circle1.center, getPolar(circle1.r, t - firstValue));
    }
    return crossPoints;
}
/**
 * 円と点との接戦の交点を求める
 */
function getTangentsFromPoint(circle, pointValue) {
    var baseValue = subtractPoint(pointValue, circle.center);
    var baseLength = getVectorLength2D(baseValue);
    var radianValue = Math.acos(circle.r / baseLength);
    var vec1Value = getDivideVector(baseValue, baseLength);
    vec1Value = multiplyVector(vec1Value, circle.r);
    var points = [];
    points[0] = addPoint(circle.center, getRotateVectorFromRad(vec1Value, radianValue));
    points[1] = addPoint(circle.center, getRotateVectorFromRad(vec1Value, -radianValue));
    return points;
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
//var input = require('fs').readFileSync('input.txt', 'utf8');
var Arr = (input.trim()).split("\n");
var points = [];
Arr.forEach(function (currentValue) {
    var nums = currentValue.split(",").map(Number);
    points[0] = new RenamedPoint2D(nums[0], nums[1]);
    points[1] = new RenamedPoint2D(nums[2], nums[3]);
    points[2] = new RenamedPoint2D(nums[4], nums[5]);
    points[3] = new RenamedPoint2D(nums[6], nums[7]);
    ans = "NO";
    points = getConvexHoll(points);
    if (points.length > 3) {
        ans = "YES";
    }
    const messageText1 = formatLogMessage1(ans);
    console.log(messageText1);
});
