var COUNTER_CLOCKWISE = 1;
var CLOCKWISE = -1;
var ONLINE_BACK = 2;
var ONLINE_FRONT = -2;
var ON_SEGMENT = 0;

class Point2D {
    constructor(posX, posY) {
        this.x = posX;
        this.y = posY;
    }
}

class Vector2D {
    constructor(posX, posY) {
        this.x = posX;
        this.y = posY;
    }
}

function getCross(vecA, vecB) {
    return vecA.x * vecB.y - vecA.y * vecB.x;
}

function dotProduct2D(vecA, vecB) {
    return vecA.x * vecB.x + vecA.y * vecB.y;
}

function getVectorLength2D(vec) {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

function ccw(pointA, pointB, pointC) {
    var vectorA = new Vector2D(pointB.x - pointA.x, pointB.y - pointA.y);
    var vectorB = new Vector2D(pointC.x - pointA.x, pointC.y - pointA.y);
    var crossValue = getCross(vectorA, vectorB);

    if (crossValue > Number.EPSILON) {
        return COUNTER_CLOCKWISE;
    }

    if (crossValue < -Number.EPSILON) {
        return CLOCKWISE;
    }

    if (dotProduct2D(vectorA, vectorB) < -Number.EPSILON) {
        return ONLINE_BACK;
    }

    if (getVectorLength2D(vectorA) < getVectorLength2D(vectorB)) {
        return ONLINE_FRONT;
    }

    return ON_SEGMENT;
}

function getConvexHoll(pointList) {
    if (pointList.length < 3) {
        return pointList;
    }

    pointList.sort(function (pointA, pointB) {
        if (pointA.x > pointB.x) return 1;
        if (pointA.x === pointB.x) return pointA.y > pointB.y ? 1 : -1;
        return -1;
    });

    var upperHull = [];
    upperHull.push(pointList[0]);
    upperHull.push(pointList[1]);

    var lowerHull = [];
    lowerHull.push(pointList[pointList.length - 1]);
    lowerHull.push(pointList[pointList.length - 2]);

    for (var index = 2; index < pointList.length; index++) {
        for (
            var limit = upperHull.length;
            limit >= 2 && ccw(upperHull[limit - 2], upperHull[limit - 1], pointList[index]) === COUNTER_CLOCKWISE;
            limit--
        ) {
            upperHull.pop();
        }
        upperHull.push(pointList[index]);
    }

    for (var index = pointList.length - 3; index >= 0; index--) {
        for (
            var limit = lowerHull.length;
            limit >= 2 && ccw(lowerHull[limit - 2], lowerHull[limit - 1], pointList[index]) === COUNTER_CLOCKWISE;
            limit--
        ) {
            lowerHull.pop();
        }
        lowerHull.push(pointList[index]);
    }

    lowerHull.reverse();

    for (var index = upperHull.length - 2; index >= 1; index--) {
        lowerHull.push(upperHull[index]);
    }

    return lowerHull;
}

var inputText = require("fs").readFileSync("/dev/stdin", "utf8");
var inputLines = inputText.trim().split("\n");

inputLines.forEach(function (currentLine) {
    var values = currentLine.split(",").map(Number);
    var points = [];

    points[0] = new Point2D(values[0], values[1]);
    points[1] = new Point2D(values[2], values[3]);
    points[2] = new Point2D(values[4], values[5]);
    points[3] = new Point2D(values[6], values[7]);

    var answer = "NO";
    points = getConvexHoll(points);

    if (points.length > 3) {
        answer = "YES";
    }

    console.log(answer);
});