var arr = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/);
var caseCount = arr.length;
for (var i = 1; i < caseCount; i++) {
	var balls = arr[i].trim().split(/\s/);
	var course = [0,0];
	for (var j = 0; j < balls.length; j++) {
		var ballNum = parseInt(balls[j], 10);
		var courseDeff = [(ballNum - course[0]),(ballNum - course[1])];
		if((courseDeff[0] < 0) && (courseDeff[1] < 0)){
			console.log("NO");
			break;
		}
		if((courseDeff[0] <= courseDeff[1]) && (courseDeff[0] > 0)){
			course[0] = ballNum;
		}else{
			course[1] = ballNum;
		}
		if(j==9){
			console.log("YES");
		}
	}
}