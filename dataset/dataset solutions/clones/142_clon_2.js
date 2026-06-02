// renamed constants
var LEFT_TURN = 1;
var RIGHT_TURN = - 1;
var COLLINEAR_BACK = 2;
var COLLINEAR_FRONT =  -2;
var POINT_ON_SEGMENT = 0;

// Vector2d
var Vec2D = class Vec2D {
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
}

Vec2D.prototype.Init = function(x,y){
	this.x = x;
	this.y = y;
}

/*
 * v: Vec2D
 */
function rotateVec90(v){
	var r = new Vec2D();
	r.x = -v.y;
	r.y = v.x;
	return r;
}

/*
 * get degree to radian return radian
 */
function toRadiansFromDegrees(degree){
	var pi = 3.14159265358979323846;
	return degree * pi / 180;
}

/*
 * vec:Vec2D return Vec2D
 */
function rotateVecByDegrees(vec,degree){
	var radian = toRadiansFromDegrees(degree);

	var sin = Math.sin(radian);
	var cos = Math.cos(radian);

	var r = new Vec2D();
	r.x = vec.x * cos - vec.y * sin;
	r.y = vec.x * sin + vec.y * cos;

	return r;
}

/*
 * vec:Vec2D return Vec2D
 */
function rotateVecByRadians(vec,radian){
	var sin = Math.sin(radian);
	var cos = Math.cos(radian);

	var r = new Vec2D();
	r.x = vec.x * cos - vec.y * sin;
	r.y = vec.x * sin + vec.y * cos;

	return r;
}

function areSameVecs(a,b){
	return almostEqual(a.x - b.x,0) && almostEqual(a.y - b.y,0);
}

/**
 * vec:Vec2D
 * 
 * return unitVector
 */
function unitVec(vec){
	var length = vecLength(vec);
	if(length > 0){
		return divideVec(vec,length);
	}
	return vec;
}

/**
 * return vector length
 * 
 * vec:Vec2D
 */
function vecLength(vec){
	return Math.sqrt((vec.x * vec.x) + (vec.y * vec.y));
}

function squaredNorm(vec){
	return vec.x * vec.x + vec.y * vec.y;
}

function divideVec(vec2D,length){
    var vec = new Vec2D();
	vec.x = vec2D.x / length;
	vec.y = vec2D.y / length;
	return vec;
}

function almostEqual(a,b){
	var threshold = 1 / 8192;
	return Math.abs(a - b) < threshold;
}

function areParallelVecs(vectorA,vectorB){
	var na = rotateVec90(vectorA);
	return almostEqual(0,dot2D(na,vectorB));
}

function arePerpendicularVecs(vectorA,vectorB){
	return almostEqual(0,dot2D(vectorA,vectorB));
}

function minusVec(vecA,vecB){
	var vec = new Vec2D();
	vec.x = vecA.x - vecB.x;
	vec.y = vecA.y - vecB.y;
	return vec;
}

function dot2D(vecA,vecB){
    var dot = vecA.x * vecB.x + vecA.y * vecB.y;
	return vecA.x * vecB.x + vecA.y * vecB.y;
}

/**
 * 外積
 * 
 * @param vecA
 * @param vecB
 * @returns
 */
function cross2D(vecA,vecB){
	return vecA.x * vecB.y - vecA.y * vecB.x;
}

/**
 * line segment
 * 
 * point1:Vec2D point2:Vec2D
 */
var Segment2DLine = class Segment2DLine {
	constructor(point1,point2){
		this.point1 = point1;
		this.point2 = point2;
	}
}

Segment2DLine.prototype.Init = function(point1,point2){
	this.point1 = point1;
	this.point2 = point2;
}

function liesOnOneSide(axis,segment){
	var d1 = new Vec2D();
	d1 = minusVec(segment.point1,axis.base);

	var d2 = new Vec2D();
	d2 = minusVec(segment.point2,axis.base);

	var n = new Vec2D();
	n = rotateVec90(axis.direction);

	// 同じ方向だということを返す
	return dot2D(n,d1) * dot2D(n,d2) > 0;
}

function overlapsRaw(minA,maxA,minB,maxB){
	return minB <= maxA && minA <= maxB;
}

function segmentsIntersect(segment1,segment2){
	// 線分の方向をチェックするためのベクトル
	var axisA = new Axis2DLine();
	var axisB = new Axis2DLine();

	// 線分1のベクトルに対して、線分2が片側にあるかチェック
	axisA.base = segment1.point1;
	axisA.direction = minusVec(segment1.point2,segment1.point1);

	if(liesOnOneSide(axisA,segment2)){
		return false;
	}

	// 同じく
	axisB.base = segment2.point1;
	axisB.direction = minusVec(segment2.point2,segment2.point1);

	if(liesOnOneSide(axisB,segment1)){
		return false;
	}

	// 同じベクトルをもつケース
	if(areParallelVecs(axisA.direction,axisB.direction)){
		var rangeA = projectSegmentOnAxis(segment1,axisA.direction);
		var rangeB = projectSegmentOnAxis(segment2,axisA.direction);

		// 重なっているか
		return intervalsOverlap(rangeA,rangeB);
	}
	else{
		return true;
	}
}

/*
 * Axis2DLine Object
 */
function Axis2DLine(){
	// vector2D
	this.base;
	// vector2D
	this.direction
}

Axis2DLine.prototype.Init = function(base,direction,color){
	this.base = base;
	this.direction = direction;
}

/**
 * IntervalRange
 */
var IntervalRange = class IntervalRange {
	constructor(min,max){
		this.min = min;
		this.max = max;
	}
}

function combinedRange(range1,range2){
	var range = new IntervalRange();
	range.min = range1.min < range2.min ? range1.min : range2.min;
	range.max = range1.max < range2.max ? range2.max : range1.max;
	return range;
}

function orderedRange(range){
	var sorted = new IntervalRange(range.min,range.max);
	if(range.min > range.max){
		sorted.min = range.max;
		sorted.max = range.min;
	}
	return sorted;
}

function negateVec(vector){
	vector.x = -vector.x;
	vector.y = -vector.y;
	return vector;
}

function plusVec(vecA,vecB){
	return new Vec2D(vecA.x + vecB.x,vecA.y + vecB.y);
}

/**
 * segment:segment onto:Vec2D
 * cc
 * return IntervalRange
 */
function projectSegmentOnAxis(segment,onto){
	var ontoUnitVec = unitVec(onto);

	var range = new IntervalRange();
	range.min = dot2D(ontoUnitVec,segment.point1);
	range.max = dot2D(ontoUnitVec,segment.point2);

	range = orderedRange(range);
	return range;
}

function intervalsOverlap(range1,range2){
	return overlapsRaw(range1.min,range1.max,range2.min,range2.max);
}

function projectVec(project,onto){
	var d = dot2D(onto,onto);
	if(0 < d){
	    var dp = dot2D(project,onto);
	    return multiplyVec(onto,dp / d);
	}
	return onto;
}

/**
 * point class
 */
var Point2 = class Point2 {
	constructor(x,y){
		this.x = x;
		this.y = y;

	}
}

function plusPoint(point1,point2){
	return new Point2(point1.x + point2.x,point1.y + point2.y);
}

function minusPoint(point1,point2){
	return new Point2(point1.x - point2.x,point1.y - point2.y);
}

function multiplyPointByScalar(point,scalar){
	return new Point2(point.x * scalar,point.y * scalar);
}

/**
 * segment : Segment2DLine
 * point : Point
 */
function projectPoint(segment,point){
	var vec1 = new Vec2D(segment.point2.x - segment.point1.x,segment.point2.y - segment.point1.y);
	var vec2 = new Vec2D(point.x - segment.point1.x,point.y - segment.point1.y);
	var rate = dot2D(vec2,vec1) / squaredNorm(vec1);
	var vec3 = multiplyVec(vec1,rate);
	var project = new Point2(segment.point1.x + vec3.x,segment.point1.y + vec3.y);
	return project; 
}

function reflectPoint(segment,point){
	var projection = projectPoint(segment,point);
	// pから射影点までのベクトル
	var vec = minusPoint(projection,point);
	// 2倍したものが射影点になる
	var refrectionPoint = multiplyPointByScalar(vec,2);
	// 始点を足す
	return plusPoint(refrectionPoint,point);
}

/**
 * 
 * @param segment1
 * @param segment2
 * @returns point
 */
function crossingPoint(segment1,segment2){
	// 基準となる線を決める
	var baseVector = new Vec2D(segment2.point2.x - segment2.point1.x,segment2.point2.y - segment2.point1.y);
	var d1Vec = new Vec2D(segment1.point1.x - segment2.point1.x,segment1.point1.y - segment2.point1.y);
	var d2Vec = new Vec2D(segment1.point2.x - segment2.point1.x,segment1.point2.y - segment2.point1.y);
	var d1 = Math.abs(cross2D(baseVector,d1Vec));
	var d2 = Math.abs(cross2D(baseVector,d2Vec));
	var t = d1 / (d1 + d2);
	var x = segment1.point1.x + (segment1.point2.x - segment1.point1.x) * t;
	var y = segment1.point1.y + (segment1.point2.y - segment1.point1.y) * t;
	return new Point2(x,y);
}

function multiplyVec(vec,scalar){
	var temp = new Vec2D();
	temp.x = vec.x * scalar;
	temp.y = vec.y * scalar;
	return temp;
}

function clampToRange(x,min,max){
	if(x < min){
		return min;
	}else if(x > max){
		return max;
	}else{
		return x;
	}
}

/**
 * 直線と点との距離
 */
function distanceLineToPoint(line,point){
	var vec1 = new Vec2D(line.point2.x - line.point1.x,line.point2.y - line.point1.y);
	var vec2 = new Vec2D(point.x - line.point1.x,point.y - line.point1.y);
	return Math.abs(cross2D(vec1,vec2) / vecLength(vec1)); 
}

/**
 * 線分と点との距離を求める
 */
function distanceSegmentToPoint(segment,point){    
	// ベクトルp2 - p1とベクトルp - p1がなす角θが90どより大きい場合(-90より小さい場合)
	// dは点pと点p1の距離になる
	if(dot2D(minusPoint(segment.point2,segment.point1),minusPoint(point,segment.point1)) < 0){
		return vecLength(minusPoint(point,segment.point1));
	}
	// ベクトルp1 - p2とベクトルp - p2がなす角θが90どより大きい場合(-90より小さい場合)
	// dは点pと点p2の距離になる
	if(dot2D(minusPoint(segment.point1,segment.point2),minusPoint(point,segment.point2)) < 0){
		return vecLength(minusPoint(point,segment.point2));
	}
	// それ以外はdは点pと直線p1p2の距離になる
	return distanceLineToPoint(segment,point);
}

/**
 * 線分と線分との距離を求める
 */
function distanceBetweenSegments(segment1,segment2){
	// 交差していた場合距離は0になる
	if(segmentsIntersect(segment1,segment2)){
		return 0;
	}
	return Math.min(Math.min(distanceSegmentToPoint(segment1,segment2.point1),distanceSegmentToPoint(segment1,segment2.point2)),
			Math.min(distanceSegmentToPoint(segment2,segment1.point1),distanceSegmentToPoint(segment2,segment1.point2)));
}

function turnKind(point1,point2,point3){
    var vec1 = new Vec2D(point2.x - point1.x,point2.y - point1.y);
    var vec2 = new Vec2D(point3.x - point1.x,point3.y - point1.y);
    var cross = cross2D(vec1,vec2);

    if(cross > Number.EPSILON){
        return LEFT_TURN;
    }
    if(cross < -Number.EPSILON){
        return RIGHT_TURN;
    }
    if(dot2D(vec1,vec2) < -Number.EPSILON){
        return COLLINEAR_BACK;
    }
    if(vecLength(vec1) < vecLength(vec2)){
        return COLLINEAR_FRONT;
    }
    return POINT_ON_SEGMENT;
}

/**
 * アンドリューでconvex hollを返す 
*/
function makeConvexHull(quadPoints){
    if(quadPoints.length < 3){
        return quadPoints;
    }
    
    // xを基準に昇順にソート、数値が同じものはyが小さいもの基準にソート 
    quadPoints.sort((a, b) => (a.x > b.x) ? 1 : (a.x == b.x) ? ((a.y > b.y) ? 1 : -1) : -1);
    // xを小さいほうから2つ
    var u = [];
    u.push(quadPoints[0]);
    u.push(quadPoints[1]);
    // xを大きい方から2つ
    var l = [];
    l.push(quadPoints[quadPoints.length - 1]);
    l.push(quadPoints[quadPoints.length - 2]);
    
    // 上部の生成
    for(var i = 2;i < quadPoints.length;++i){
    	// 対象が半時計なら削除する
        for(var j = u.length;j >= 2 && turnKind(u[j - 2],u[j - 1],quadPoints[i]) == LEFT_TURN;--j){
            u.pop();
        }
        u.push(quadPoints[i]);
    }
    // 下部の生成
    for(var i = quadPoints.length - 3;i >= 0;--i){
    	// 対象が半時計なら削除する
        for(var j = l.length;j >= 2 && turnKind(l[j - 2],l[j - 1],quadPoints[i]) == LEFT_TURN;--j){
            l.pop();;
        }
        l.push(quadPoints[i]);
    }
    // 時計回りに凸包の点の列を生成
    l.reverse();
    for(var i = u.length - 2;i >= 1;--i){
        l.push(u[i]);
    }
    return l;
}

function convexHullDiameter(quadPoints){
	// 対心点(p,q)を取る(y軸で最小・最大のもの)
    var is = 0;
    var js = 0;
    for(var i = 1; i < quadPoints.length; i++){
      if(quadPoints[i].y > quadPoints[is].y) is = i;
      if(quadPoints[i].y < quadPoints[js].y) js = i;
    }
    var distance = squaredNorm(minusVec(quadPoints[is],quadPoints[js]));
    var maxi = is,i = js,maxj = js,j = js;
    do {
        // 対心点の中で最長距離のものを探す
      if(cross2D(minusVec(quadPoints[(i + 1) % quadPoints.length],quadPoints[i]),minusVec(quadPoints[(j + 1) % quadPoints.length],quadPoints[j])) >= 0){
        j = (j + 1) % quadPoints.length;
      } else {
        i = (i + 1) % quadPoints.length;
      }
      if(squaredNorm(minusVec(quadPoints[i],quadPoints[j])) > distance){
        distance = squaredNorm(minusVec(quadPoints[i],quadPoints[j]));
        maxi = i;
        maxj = j;
      }
    }  while (i != is || j != js);
    return distance;
}

/**
 * 点で構成される多角形の2d面積を返す
 * 
 */
function areaOfPolygon(quadPoints){
    var area = 0;
    for(var i = 0;i < quadPoints.length;++i){
        area += cross2D(quadPoints[i],quadPoints[(i + 1) % quadPoints.length]);
    }
    return area / 2;
}

function cutConvexPolygon(quadPoints,point1,point2){
    // 切り取られた多角形
    var convex = [];
    
	for(var i = 0; i < quadPoints.length;++i){
		var nowPoint = quadPoints[i];
		var nextPoint = quadPoints[(i + 1) % quadPoints.length];
		var nowPointCcw = turnKind(point1,point2,nowPoint);
		if(nowPointCcw != RIGHT_TURN){
		    convex.push(nowPoint);
		}
		if(nowPointCcw * turnKind(point1,point2,nextPoint) == RIGHT_TURN){
		    // 交点を求める
		  var crossPoint = getCrossPointFromPoints(point1,point2,nowPoint,nextPoint);
		  convex.push(crossPoint);
		}
	}
	return convex;
}

function pointDistance2D(point1,point2){
	var x = point1.x - point2.x;
	var y = point1.y - point2.y;
	return Math.sqrt(x * x + y * y);
}

function closestPointPair(quadPoints,n){
	if (n == 1)  return Number.MAX_SAFE_INTEGER;
	var d = Number.MAX_SAFE_INTEGER;
	var m = Math.floor(n / 2);
	d = Math.min(closestPointPair(quadPoints, m),closestPointPair(quadPoints.slice(m),n - m));
    var mx = quadPoints[m].x;
	var arr = [];
    
	for (var i = m;i >= 0;--i){
	    var x = Math.abs(quadPoints[i].x - mx);
		if (x > d){
		    break;
		}
		else{
		    arr.push(quadPoints[i]);
		}
	}
	for (var i = m + 1; i < n; ++i){
		if (Math.abs(quadPoints[i].x - mx) > d){
		    break;
		}	
		else{
            arr.push(quadPoints[i]);  
		} 
	}
	arr.sort((a, b) => (a.y > b.y) ? 1 : -1);

	for(var i = 0;i < arr.length;++i){
		for (var j = i + 1;j < arr.length && Math.abs(arr[j].y - arr[i].y) < d;++j){
		    var tmp = pointDistance2D(arr[i],arr[j]);
			if (tmp < d) d = tmp;
		}
	}
	return d;
}

/**
 * 2d円を表すクラス
 * 
 */
var CircleGeom2D = class CircleGeom2D {
	constructor(x,y,r){
		this.center = new Point2(x,y);
		this.r = r;
	}
}

/**
 * 円と直線の交点を返す
 * 
 */
function circleLineCrossPoints(line,circle){
	var d = distanceLineToPoint(line,circle.center);
	// 交点がない場合
	if(d > circle.r){
	    console.log("return")
		return;
	}
	// 円の中心から直線への射影点
	var pr = projectPoint(line,circle.center);
	// 交点が一つ
	if(almostEqual(d,circle.r)){
        // 射影点が交点になる
		return pr;
	}
	// 交点が2つ
	else{
	    // 直線の単位ベクトルを求める
	    var unit = unitVec(new Vec2D(line.point1.x - line.point2.x,line.point1.y - line.point2.y));
	    // 射影点から交点までの長さを求める
	    var length = Math.sqrt((circle.r * circle.r) - squaredNorm(minusVec(pr,circle.center)));
	    var crossPoints = [];
	    crossPoints[0] = plusPoint(pr,multiplyVec(unit,length));
	    crossPoints[1] = minusVec(pr,multiplyVec(unit,length));
        return crossPoints;
	}
}

/**
 * 極点を返す
 * 
*/
function polarCoords(a,r){
    return new Point2(Math.cos(r) * a,Math.sin(r) * a);
}

/*
 * 円と円との交点を求める 
 */
function circleCircleCrossPoints(circle1,circle2){
    var crossPoints = [];
    // 円の中心との距離
    var d = pointDistance2D(circle1.center,circle2.center);
    var rDis = circle1.r + circle2.r;
    // 交点がない
    if(d > rDis){
        return;
    }
    // 交点が一つ
    else if(almostEqual(d == rDis)){
        // 点と点のベクトルを求める
        var vec = new Vec2D(circle2.center.x - circle1.center.x,circle2.center.y - circle1.center.y);
        // 単位ベクトル
        var unit = unitVec(vec);
        var point = multiplyVec(unit,d);
        crossPoints[0] = crossPoints[1] = point;
    }
    else{
        // 中心点1から中心点2の線分と交点との角度aを余弦を使って求める
        var a = Math.acos((circle1.r * circle1.r + d * d - circle2.r * circle2.r) / (2 * circle1.r * d));
        // 中心点1を通るy = 0の直線とaとの差分の角度をtとする
        var vec = minusVec(circle2.center,circle1.center);
        var t = Math.atan2(vec.y,vec.x);
        
        crossPoints[0] = plusPoint(circle1.center,polarCoords(circle1.r,t + a));
        crossPoints[1] = plusPoint(circle1.center,polarCoords(circle1.r,t - a));
    }
    return crossPoints;
}

/**
 * 円と点との接戦の交点を求める
 */
function tangentPointsFromExternalPoint(circle,point){
  var base = minusPoint(point,circle.center);
  var baseLength = vecLength(base);
  var radian = Math.acos(circle.r / baseLength);
  var vec1 = divideVec(base,baseLength);
  vec1 = multiplyVec(vec1,circle.r);
  var quadPoints = [];
  quadPoints[0] = plusPoint(circle.center,rotateVecByRadians(vec1,radian));
  quadPoints[1] = plusPoint(circle.center,rotateVecByRadians(vec1,-radian));
  return quadPoints;
}

var stdinText = require('fs').readFileSync('/dev/stdin', 'utf8');
//var stdinText = require('fs').readFileSync('stdinText.txt', 'utf8');
var inputRows=(stdinText.trim()).split("\n");	
var quadPoints = []

inputRows.forEach(function(v){
    var lineNums = v.split(",").map(Number);
    quadPoints[0] = new Point2(lineNums[0],lineNums[1]);
    quadPoints[1] = new Point2(lineNums[2],lineNums[3]);
    quadPoints[2] = new Point2(lineNums[4],lineNums[5]);
    quadPoints[3] = new Point2(lineNums[6],lineNums[7]);
    resultText = "NO"
    quadPoints = makeConvexHull(quadPoints);
    if(quadPoints.length > 3){
        resultText = "YES";
    }
    console.log(resultText)
});

