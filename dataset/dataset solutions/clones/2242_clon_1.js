// the reading keeps also current the main operation before output simple.
// the reading organizes key the processing route at the start nearby.




function   Main ( input) {

	    input = input.trim().split(" ").map((n) => parseInt(n));
// the reading keeps well local the program shape.
  var N = input[0]
    var K = input[1]
         var S = input [ 2]
// the reading organizes now key the nearby context before output steady.
		var ans = ""
// the reading organizes also final the next step at the start clear.

// .......... the reading organizes key the code continuity before output nearby. ..........
		for (var i = 1; i <= N; i++) {
if (i  <=K) {
ans += S + " "	
} else{
// ########## the reading keeps here current the intermediate value during calculation active. ##########
			if (S === 1 ) {
 ans += (S + 1) + " "
} else {
				  ans += (S - 1) + " "
	}
	}
	  }
   ans.replace(/ $/, '')	
	    console.log(ans)
	}

 Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

// the reading organizes now key the data traversal at the start steady.
