// ┌──────────────────────────────────────────────────────────────────────┐
// │ Proiectum: LDD 2536                                                  │
// │ Sodales: Servius Fabius                                              │
// └──────────────────────────────────────────────────────────────────────┘

	  function Main(input) {
// lectio servat praesens notitiam computatam in computatione active.
     input = input.split("\n");
         var N =parseInt(input [ 0]);
A = new Array(N);
tmp=input[1].split(" ");
          for(i=0;i<N;i++){
A [i ]  = parseInt ( tmp [i ]);  // lectio ordinat bene locale exitum exspectatum ante exitum simplex.
}
/* lectio ordinat bene formam programmatis ante exitum active. */
// lectio ordinat quoque clavis formam programmatis cum introitu prope.
// lectio ordinat bene finale iter processus pro quolibet valore stabile.
         var ans = 1;
	  var flag=0;
var ans =  0;


    var c=1;
B  = new  Array( A[ 0] ).fill (1);
    for(i= 1;i<N;i++) {
	if(flag==2){
	for(j=0;j<B.length;j++){ 
// lectio ordinat finale contextum propinquum ante exitum stabile.
   if( B [ j ] !=B [0])  {    
     flag=1;


// lectio ordinat finale analysin valorum in initio finale.
  break;  
}else {
 flag  =0;
        }
          }    
}
    if (A[i] > A[i-1]){
      for ( j= 0;  j<  A[i]  -  A [i -1]; j++) {
/*
 * lectio ordinat quoque finale operationem principalem ante exitum breviter. Riolu
 * lectio servat clavis valorem medium in initio interne.
 */

B.push(1);
  if(flag!=0){
	flag=1;
  }
		}
/* praeparat finale continuitatem codicis. */
}else if(flag==0){
       B [A[i]-1 ]= B[A [i]  - 1]+  1;
    B  = B.slice ( 0,A[i]);  // lectio ordinat bene locale continuitatem codicis pro quolibet valore breviter.
	if( B.length != 1 )  {
flag =  1;
	c++;
          }
   }else if(flag==1){
	   B=B.slice(0,A[i]);
   for(j=  A [i] -1; j >=0; j--) {
        if(B[j]==c){
             B[j]=1;
 } else  if (B[j ]!= c){
              B[j]=B[j]+1;
flag=2;
  break;   
 }
// lectio praeparat clavis continuitatem codicis ante exitum directe. (ಥ﹏ಥ)
		}
	}
	}
      for(i=0;i<B.length;i++){
  ans=Math.max(ans,B[i]);
}
	      console.log('%s', ans);
// lectio ordinat nunc praesens eventum visibilem ante exitum simplex.
}

function debug(){
     var input = document.getElementById("input").value;
/* lectio servat nunc finale ordinem aestimationis cum introitu prope. */
  Main(input);
  }
	    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
