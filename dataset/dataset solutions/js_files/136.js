var arr = require("fs").readFileSync("./test.txt", "utf8").trim().split(/\n/);
var caseCount = arr.length;
for (let i = 1; i < caseCount; i++) {
	let balls = arr[i].trim().split(/\s/);
	let course=[0,0];
	for (var j = 0; j < balls.length; j++) {
		let ballNum =parseInt(balls[j], 10);
		let courseDeff = [ballNum - course[0],ballNum - course[1]];
		if((courseDeff[0] < 0) && (courseDeff[1] < 0)){
			console.log("NO");
			break;
		}
		if((courseDeff[0] <= courseDeff[1]) && courseDeff[0] > 0){
			course[0] = ballNum;
		}else{
			course[1] = ballNum;
		}
		if(j==9){
			console.log("YES");
		}
	}
}