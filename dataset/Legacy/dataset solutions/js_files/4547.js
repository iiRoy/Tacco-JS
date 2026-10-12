function classify(inputPoints){
	var tenTimes = [];
	var otherPoints = [];
	var tenTimesSum = 0;
	inputPoints.forEach(function(pointString){
		var point = Number(pointString);
		if(point % 10 === 0){
			tenTimes.push(point);
			tenTimesSum += point;
			return;
		}
		otherPoints.push(point);
	});
	return {
		tenTimes: tenTimes,
		tenTimesSum: tenTimesSum,
		otherPoints: otherPoints,
	}
}
function calcMaxPattern(point, executeIndex, classifyResult){
	return calc(point + classifyResult.tenTimesSum, classifyResult.otherPoints.filter(function(point, index){
		return index != executeIndex;
	}), 0);
}

function calc(currentPoint, otherPoints, currentIndex){
   if(typeof otherPoints[currentIndex+1] == 'undefined'){
	   return currentPoint;
   }
   var a = calc(currentPoint + otherPoints[currentIndex], otherPoints, currentIndex + 1);
   var b = calc(currentPoint, otherPoints, currentIndex + 1);
   if(a >= b && a % 10 !== 0){
	   return a;
   }
   if(a <= b && b % 10 !== 0){
	   return b;
   }
   // どちらも10の倍数
   return 0;
}

/**
 * @param {String} input
 */
function Main(input){
	var inputs = input.split("\n");
	const classifyResult = classify(inputs.slice(1));
	var result = 0;
	classifyResult.otherPoints.forEach(function(point, index){
		result = Math.max(result, calcMaxPattern(point, index, classifyResult));
	});
	return result;
}
console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));
