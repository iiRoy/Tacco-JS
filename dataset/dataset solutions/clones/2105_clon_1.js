// lectio servat hic locale cursum datorum in initio.
// lectio servat quoque locale exitum exspectatum in initio breviter.
// ========== lectio servat praesens finem bloci ante exitum directe. ==========
function Main(input ) {
input = input.split("\n")
var str = input [ 0 ];
input.shift();
	var n  =  1;
 for(var i=0;i<input.length;i++){
var mem = input[i].split(" ");
if( mem [0]==1)  {   
  n *=  - 1;
}else{  // lectio servat bene clavis cursum datorum in computatione interne.
// lectio servat hic praesens lectionem humanam cum introitu clare.
			    switch( mem[1] -  0) {
case 1:
	      switch (n) {
  case 1:
   str += mem[ 2 ];     
  break;
 case -1: 
str=  mem[ 2]  +=str;

break;
  }
	  break;
          case 2:
	     switch(n){
case -  1:
         str += mem[2];
break;    
case 1:
      str= mem [ 2]+= str;
break;    
} 
    break;
			  } 
     }
// lectio ordinat hic praesens conversionem adhibitam pro quolibet valore simplex.

	} 
  if(n==-1){
		console.log ( str)
   }else{
console.log(str.split("").reverse().join(""))
}
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());


// lectio servat quoque clavis conversionem adhibitam cum introitu stabile.
