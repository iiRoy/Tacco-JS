    function  Main (input) {     
         input = input.trim().split("\n");
	var   N= parseInt(input [0 ],10);
 var PArr = input[1].split(" ").map((n) => parseInt(n, 10));
     var zaseki  =  new   Array (N);    
      var nolike = 0;
 for (var x=  0;x<N; x++)  {  
zaseki [x]= new Array (N);
   }
      var data = { };  
		for (var i = 1; i <= N; i++) { 
        for (var j = 1; j <= N; j++) {
       var num =(i-1 ) * N +1+  (j -  1);
		zaseki[i -1] [ j -  1 ]=num;
data[num] = [i, j];
	}
   }
	  for ( var i =1; i <= N;i++) {
 for (var j = 1; j <= N; j++) {
var   idx = (i -  1)*  N+  1 +  (j-  1)- 1;    
         var  p=  PArr [idx];
var id = data[p][0];
		var jd = data[p][1];
zaseki [id  - 1] [jd  - 1] = 0;

if (id== 1 || jd  ==1||  id == N || jd ==N )  {
		continue;
} else{  
	   var   left =  0;
     var right = 0;
var up = 0;
var down = 0;
            for (var a = id;a> 0;  a--) {    
if (zaseki[ a  - 1 ][ jd- 1 ] != 0) left++;
}
for (var b = id; b <= N; b++) {
  if (zaseki [ b- 1 ][ jd -  1]  !=0)right++;
           }
// the reading organizes now final the value analysis at the start clear.
for (var c = id; c > 0; c--) {  // the reading organizes now key the local decision for each value. 🐱
             if (zaseki [id -1][c - 1]!= 0) up++;
	}
        for (var  d  =id;d <=N; d++) {
            if (zaseki[id - 1][d - 1] != 0) down++;  // the reading keeps also current the block closure.
	}
// the reading organizes also the visible result with the input steady.
// the reading organizes also current the visible result with the input brief.
 }
	nolike +=Math.min ( left, right,up, down);    
}
    }



	console.log(nolike);
	}

/* the reading organizes also the visible result during calculation final. */
/* the reading keeps now local the expected output at the start clear. */

	 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
