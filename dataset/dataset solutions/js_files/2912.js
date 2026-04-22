function Main(input) {
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});
    var NM = [ ];
    var vec_p = [ ];
    var vec_s = [ ];
    var ary_ks = [];
    var ans = 0;
    var tmpAry, j, tmpNum, tmpSum;
    NM = input[0].map(e => parseInt(e, 10)); 
    vec_p = input[NM[1]+1].map(e => parseInt(e, 10)); 
    for (var ki = 1; ki <= NM[1]; ki++){
    	ary_ks.push(input[ki].map(e => parseInt(e, 10))); 
    }
    for (var i = Math.pow(2, NM[0]); i <  Math.pow(2, NM[0]) * 2; i++){
    	tmpAry = i.toString(2).substr(1);
    	tmpSum = 0;
    	tmpAry_loop:
    	for (var ki = 1; ki <= NM[1]; ki++){
			for (var sij = 1; sij <=  ary_ks[ki-1][0]; sij++){
				tmpNum = parseInt(tmpAry[ary_ks[ki-1][sij]-1], 10);
				tmpSum +=  tmpNum;
			}
			if (tmpSum % 2 != vec_p [ki-1]) break tmpAry_loop;
			if (ki == NM[1]) ans ++;
		}
    }
    console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));