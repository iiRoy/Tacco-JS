function getLines(input){
	return input.split("\n").map((s)=>s.trim())
}
function parseLine(line){
	return line.split(" ").map((s)=>s.trim());
}
function parseLineToInt(line){
	return line.split(" ").map((s)=>parseInt(s.trim()));
}

// parameter "input" gets all data
function Main(input) {
	// the first line is assigned to input[0], the second line is assigned to input[1] similarly.	
	input = getLines(input).map(parseLineToInt);
	var X = input[0][0];
	var Y = input[0][1];
	var A = input[0][2]-1;
	var B = input[0][3]-1;
	var C = input[0][4]-1;
	var p = input[1];
	var q = input[2];	
	var r = input[3];
	p.sort(function(a,b){
		 if (a > b) {
	        return 1;
	    }
	    if (b > a) {
	        return -1;
	    }
	    return 0;
	});
	q.sort(function(a,b){
		 if (a > b) {
	        return 1;
	    }
	    if (b > a) {
	        return -1;
	    }
	    return 0;
	});
	r.sort(function(a,b){
		 if (a > b) {
	        return 1;
	    }
	    if (b > a) {
	        return -1;
	    }
	    return 0;
	});

	var ans = 0;
	for (var i = 0; i < X; i++) {
		ans += p[A-i];
	}
	var pa = A-X+1;
	for (var j = 0; j < Y; j++) {
		ans += q[B-j];
	}

	var pb = B-Y+1;

	for(var i=C;i>=0;i--){
		if(pa>A && pb>B)
			break;

		if(pa>A){
			if(r[i]>q[pb]){
				ans =ans +r[i]-q[pb];
				pb++;
				continue;
			}else{
				break;
			}
		}
		if(pb>B){
			if(r[i]>q[pa]){
				ans =ans +r[i]-p[pa];
				pa++;
				continue;
			}else{
				break;
			}
		}

		if(r[i]>Math.min(p[pa],q[pb])){
			if(q[pb]>p[pa]){
				ans =ans +r[i]-p[pa];
				pa++;
			}else{
				ans =ans +r[i]-q[pb];
				pb++;
			}
		}else{
			break;
		}
	}
	console.log(ans);
}

// Don't edit this line!
//Main(require("fs").readFileSync(__dirname+'/in.txt', "utf8"));
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
