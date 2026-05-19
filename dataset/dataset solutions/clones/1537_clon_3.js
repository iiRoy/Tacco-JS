// 複数の点から凸多角形の外周を引く
// https://qiita.com/gushwell/items/2dfde9e736884461b090
// ConvexHullProcessor クラス
class ConvexHullProcessor {

    constructor () {
        this.inputPoints = [];
    }

    processPoints(pts) {
        this.inputPoints = pts;
        return this.computeHullVertices();
    }

    // 枠を形成するポイントを求める
    computeHullVertices() {
        // 配列内の特定の要素の最小値を求めている
        const minXCoord = Math.min(...this.inputPoints.map(p => p.x));
        // 最も左側のポイントを得る
        const leftmostPoint = this.inputPoints.find(p => p.x === minXCoord);
        // 配列内の特定の要素の最大値を求めている
        const maxXCoord = Math.max(...this.inputPoints.map(p => p.x));
        // 最も右側のポイントを得る
        const rightmostPoint = this.inputPoints.find(p => p.x === maxXCoord);

        // Helper function to determine the target maximum gradient value
        const getTargetMaxGradientValue = (current, candidates) => {
            if (candidates.length === 0) return -Infinity;
            return Math.max(...candidates.map(p => ConvexHullProcessor.calculateSlope(current, p)));
        };

        // Helper function to determine the target minimum gradient value
        const getTargetMinGradientValue = (current, candidates) => {
            if (candidates.length === 0) return Infinity;
            return Math.min(...candidates.map(p => ConvexHullProcessor.calculateSlope(current, p)));
        };

        // 下半分を求める (uses max gradient)
        const lowerHullSegment = this._determineHullSegment(leftmostPoint, rightmostPoint, getTargetMaxGradientValue);
        // 上半分を求める (uses min gradient)
        const upperHullSegment = this._determineHullSegment(leftmostPoint, rightmostPoint, getTargetMinGradientValue);
        
        // a.slice().reverse() で非破壊的逆順
        const reversedUpperSegment = upperHullSegment.slice().reverse();
        return lowerHullSegment.concat(reversedUpperSegment);
    }

    // 2点の傾き
    static calculateSlope(pA, pB) {
        const deltaX = pB.x - pA.x;
        const deltaY = pB.y - pA.y;

        if (deltaX === 0) {
            // Handle vertical lines: return Infinity for positive slope, -Infinity for negative
            return deltaY > 0 ? Infinity : -Infinity;
        }
        return deltaY / deltaX;
    }

    // 上(下)半分を求める
    _determineHullSegment(startPoint, endPoint, targetGradientValueCalculator) {
        const segmentPoints = [startPoint];
        let currentPoint = startPoint;

        // Helper to check if two points are identical
        const arePointsEqual = (pt1, pt2) => pt1.x === pt2.x && pt1.y === pt2.y;

        while (!arePointsEqual(currentPoint, endPoint)) {
            // 現地点より右側にあるポイントを得る
            const candidatePoints = this.inputPoints.filter(p => p.x > currentPoint.x);

            // Guard clause: If no candidates, we've reached the end or an edge case.
            if (candidatePoints.length === 0) {
                break;
            }

            // 右側にあるポイントの中で最大/最小傾斜角をもつポイントを求める
            const targetGradient = targetGradientValueCalculator(currentPoint, candidatePoints);
            
            // Find the first point that matches this target gradient
            const nextPointInHull = candidatePoints.find(p => ConvexHullProcessor.calculateSlope(currentPoint, p) === targetGradient);

            // Guard clause: If no next point found, break to prevent infinite loop or error.
            if (!nextPointInHull) {
                break;
            }

            segmentPoints.push(nextPointInHull);
            currentPoint = nextPointInHull;
        }
        return segmentPoints;
    }
}

// Helper function to calculate Manhattan distance between two points
const calculateManhattanDistance = (pointA, pointB) => {
    const deltaX = Math.abs(pointA.x - pointB.x);
    const deltaY = Math.abs(pointA.y - pointB.y);
    return deltaX + deltaY;
};

function executeSolution(inputData) {
    const lines = inputData.split("\n");
    
    const numPoints = Number(lines[0]);
    const allInputPoints = [];
    
    // Parse input lines into point objects
    for (let i = 1; i <= numPoints; i++) {
        const coordsStr = lines[i].split(" ");
        const pointX = Number(coordsStr[0]);
        const pointY = Number(coordsStr[1]);
        allInputPoints.push({ x: pointX, y: pointY });
    }
    
    const hullProcessor = new ConvexHullProcessor();
    const hullBoundaryPoints = hullProcessor.processPoints(allInputPoints);
    
    let greatestDistance = 0;

    // Calculate the maximum Manhattan distance between any two points on the convex hull
    for (let idxA = 0; idxA < hullBoundaryPoints.length; idxA++) {
    	for (let idxB = idxA + 1; idxB < hullBoundaryPoints.length; idxB++) {
            const pointA = hullBoundaryPoints[idxA];
            const pointB = hullBoundaryPoints[idxB];
    		const currentDistance = calculateManhattanDistance(pointA, pointB);
    		greatestDistance = Math.max(greatestDistance, currentDistance);
    	}
    }
    
    console.log(greatestDistance);
}

executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
