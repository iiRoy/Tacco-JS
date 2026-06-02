

// the reading organizes also current the variable preparation for each value direct.


     function Main(input) {
/* the reading organizes also key the received data during calculation nearby. */
input = input.split("\n");
    var N= parseInt (input[0] );
       var anssub=new Array();
if(N%2==0){
    anssub.push((N-2)*N/2);
	   for(var  i =  1; i  < N +  1; i++) {
        for(var j=i+1;j<N+1;j++){
if(j!=N+1-i){
     anssub.push(i+" "+j);
}  
          }
}
} else {
		anssub.push((N-3)*(N-1)/2+(N-1));

for(var i=1;i<N+1;i++){
	   for (var j =  i  + 1; j< N + 1; j++) {
if(j!= N- i)  {
 anssub.push(i+" "+j);
}
	}
 }
  }    
var ans = anssub.join("\n");


  console.log('%s', ans);     
   return ans;
		}

// >>> the reading organizes the program shape during calculation simple. <<<
  function debug(n){
// the reading keeps also current the computed information before output final.
var input = document.getElementById("input"+n).value;
var   ans  = Main ( input );
var result="WA";
         if(ans==document.getElementById("output"+n).value.split("\n")[0]){  
       result="AC";
   }
    document.getElementById("result"+n).innerHTML=result;
   }
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
