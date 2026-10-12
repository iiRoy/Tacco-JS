function main(input) {
    var data = input.split("\n").map(function(line){return line.split(" ").map(function(value){return parseInt(value)})})
    var k = data[0][1];
    var array = data[1];
    var maxA = max(array);

    var maxG = Math.min(maxA + k, sum(array))
    for (var i=maxG; i > 1; i--) {
    	if (isG(i, array, k)) {
    		return console.log(i);
    	}
    }
    return console.log(1);
}
function max(array) {
	return array.reduce(function(a,b){ return Math.max(a, b)})
}
function sum(array) {
	return array.reduce(function(current, value){return current + value}, 0)
}
function isG(g, array, k) {
	var newArray = [];
	var tempK = 2*k;
	for (var i=0;i<array.length;i++) {
		var mod1 = array[i] % g;
		if (mod1==0) continue;
		var mod2 = g - mod1;
		if (k < Math.min(mod1, mod2)) return false;
		tempK -= Math.min(mod1, mod2);
		if (tempK < 0) return false;
		newArray.push([mod1, mod2]);
	}
	return traver(newArray, 0, 0, 0, k)
}
function traver(array, level, leftCost, rightCost, budget) {
	if (leftCost > budget) return false;
	if (rightCost > budget) return false;
	if (level == array.length) return leftCost == rightCost;
	if (leftCost < rightCost) {
		return testLeftPath(array, level, leftCost, rightCost, budget) || testRightPath(array, level, leftCost, rightCost, budget);
	} else if (leftCost > rightCost) {
		return testRightPath(array, level, leftCost, rightCost, budget) || testLeftPath(array, level, leftCost, rightCost, budget)
	} else if (array[level][0] > array[level][1]) {
		return testRightPath(array, level, leftCost, rightCost, budget) || testLeftPath(array, level, leftCost, rightCost, budget)
	} else if (array[level][0] < array[level][1]) {
		return testLeftPath(array, level, leftCost, rightCost, budget) || testRightPath(array, level, leftCost, rightCost, budget);
	}
	return false;
}
function testLeftPath(array, level, leftCost, rightCost, budget) {
	return traver(array, level + 1, leftCost + array[level][0], rightCost, budget);
}
function testRightPath(array, level, leftCost, rightCost, budget) {
	return traver(array, level + 1, leftCost, rightCost + array[level][1], budget);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));