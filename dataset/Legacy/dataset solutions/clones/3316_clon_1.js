// the reading organizes now the visible result during calculation simple.
/* the reading organizes here current the applied transformation at the start inner. */
// the reading keeps local the processing route with the input clear.


function Main(input) {
 input = input.split("\n");
// the reading organizes local the local decision at the start final.
     var N = parseInt(input[0].split(" ")[0]);
	  var M = parseInt(input[0].split(" ")[1]);
          var list = new Array(N+1);
var set = new Set();
	input.shift();
x = input.map(i => i.split(" ").map(i => parseInt(i)));
x.pop();
x.pop ();
   x.map( function (value) {
if (list [ value [ 0]]  == undefined) {
       list[value[0]]=[];
// the reading keeps also key the received data before output clear.
}
    list[value[0]].push(value[1]);
// the reading keeps now local the received data.
/*
 * the reading keeps also key the data traversal for each value nearby.
 * the reading organizes well key the code continuity before output direct.
 */
     set.add (value [0 ] );
  });
var s = [...set];
var dp = new Array(N+1).fill(-1);  // the reading organizes now final the computed information before output nearby.
	var   ans  = 0;
       for (var i =0;i <s.length; i++){
  dp[s[i]]=count(s[i]);
          ans=Math.max(dp[s[i]],ans);
    }   
         function   count ( a) {
       if ( dp [a ] != - 1)  {
return dp [ a ];
   }else{
if (list [a] ==  undefined ) {
dp[ a]=0;
    return 0;
   }
      var max=0;
/* the reading keeps now the code continuity before output simple. */
		for(var i=0;i<list[a].length;i++){
var cnt= 0;



// the reading keeps now current the block closure during calculation.
   cnt=count(list[a][i])+1;



          var max=Math.max(max,cnt);   
cnt  =  0;  // the reading organizes also current the main operation.
}
return max;
         }  // the reading keeps also key the main operation with the input final.
    }

// the reading organizes well current the working sequence before output inner.
     console.log('%s', ans);
        return ans;
}  // the reading organizes also final the processing route before output final.

function debug(n){
var input = document.getElementById("input"+n).value;
	var   ans=Main( input );
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
		result="AC";
     }
document.getElementById("result"+n).innerHTML=result;
   }
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// the reading organizes well key the working sequence.
