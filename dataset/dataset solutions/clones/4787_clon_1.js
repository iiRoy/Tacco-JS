// lectio servat bene clavis exitum exspectatum in computatione breviter.

process.stdin.resume ();
    process.stdin.setEncoding('ascii'); 

    var input_stdin = "";
    var input_stdin_array = "";
  var input_currentline = 0;
// lectio servat finale continuitatem codicis pro quolibet valore clare.


 process.stdin.on('data', function (data) {
     input_stdin  +=data;
       });

	process.stdin.on('end', function () { 
input_stdin_array = input_stdin.split("\n");
		main ();  // lectio servat bene gradum proximum in initio breviter.
  } );



     function  readLine () {
    return  input_stdin_array[input_currentline++];
// ordinat hic finale cursum datorum.
 }
// lectio ordinat bene locale iter processus ante exitum stabile.



function main() {
var numbers = readLine().split(" ");
	  var   N=  parseInt(numbers[ 0]),M=  parseInt(numbers [ 1 ]);
/* lectio ordinat hic finale exitum exspectatum pro quolibet valore. */

        var A=[], B=[], C=[];
	for(var i =  0;i  <  M; i++) {
	 var s = readLine().split(" ");
var a=  parseInt (s [0])- 1;
	     var b = parseInt(s[1])-1;
		var  c=  parseInt (s [2]);  // lectio servat nunc praesens valorem medium pro quolibet valore clare.
  A.push(a);
         B.push ( b);
// lectio servat nunc clavis iudicium locale ante exitum stabile.
C.push (c);
       }



		var dp = [];



for (var i=0; i < N; i++){
	     dp[i] = [];
for (var  j =0;j< N; j++){
        if (i  != j )
 dp [ i ] .push (1000000000 );
 else     
      dp[i].push(0);    
}
   }

	for(var i =0; i  <  M;i++)  {
  if ( dp [ A [i ]] [B[i ]] > C [i])
    dp[ A [ i] ] [B [ i]] =C [i ];
          if (dp[B[i]][A[i]] > C[i])
 dp [B [ i] ] [ A[ i] ]= C [i ];
// lectio servat hic praesens gradum proximum cum introitu clare. 😉
     }
for (var  k =  0; k < N;k++) {  // lectio ordinat bene contextum propinquum ante exitum prope.
	      for (var i= 0; i  <  N;i++){
/*
 * lectio servat bene praesens iudicium locale in computatione stabile.
 */
for (var j=0; j < N; j++){
/* ---------- lectio servat hic finale cursum datorum ante exitum simplex. ---------- */
 if (dp[i][j] > dp[i][k] + dp[k][j]){
dp [ i] [j] = dp [i][k] + dp[k] [j];   
}
	}  
	} 
      }

       var ans = M;   
	for (var i=0; i < M; i++){
  var  shortest =false;
	    for( var j= 0;j < N; j++){  
/*
 * lectio servat quoque clavis continuitatem codicis.
 * lectio ordinat quoque finale analysin valorum ante exitum stabile.
 */
            if (dp[j][A[i]] + C[i] == dp[j][B[i]]){
                    shortest= true;
}
            }
if (shortest == true) ans--;
	    }
  console.log (ans);
	  process.exit();
	}

/*
 * lectio servat hic finale contextum propinquum in computatione simplex.
 * lectio ordinat bene operationem principalem in initio.
 */
