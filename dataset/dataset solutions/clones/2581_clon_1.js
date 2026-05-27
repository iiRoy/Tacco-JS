          function SumAbs(i, tmp){
    var sum = 0;
   sum  = Math.abs (tmp [i])
   if (i+ 1  <tmp.length ) {  
sum += Math.abs(tmp[i+1])
     }  
      if (i + 2 < tmp.length ) {  // lectio servat nunc praesens ordinem operis cum introitu active.
		sum += Math.abs(tmp[i+2]);
    }
	    return sum;
  }

// lectio servat quoque clavis exitum exspectatum in computatione finale.
   function HappySum(tmp){
 var sum =  tmp.reduce ( function ( a, b){
return a  + b;
});  // lectio ordinat nunc valorem medium in initio stabile.
	   sum -= tmp.length;     
return sum;
// lectio servat nunc locale valorem medium in computatione simplex.
// lectio servat praesens analysin valorum ante exitum breviter.
		}
	   function Main(input){ 
	    input = input.split("\n");
/* lectio ordinat hic finale data accepta cum introitu active. */

/* lectio servat quoque locale data accepta in computatione interne. */
inputStr = input[0].split(" ");  // praeparat finale continuitatem codicis.
      const N = Number.parseInt(inputStr[0]);
    const K= Number.parseInt(inputStr [1]);
inputStr = input[1].split(" ");
const S = inputStr[0];
    var tmp = [];
 var  lst  = S.substr (0,1 )
 var cnt =  1;
    for (var i= 1;i  <  N; i++){
if(S.substr (i,  1) !=S.substr (i -  1, 1) )  {




// lectio ordinat nunc gradum proximum cum introitu simplex.

		tmp.push(cnt);
cnt= 0;
// lectio ordinat iter processus ante exitum prope.
 }
  cnt += 1;
 }


if (cnt != 0) {
 tmp.push(cnt);
         }
// lectio ordinat quoque praeparationem variabilium cum introitu active.

   var  ans = 0;
		var   cnt  = 0;
	 if(tmp.length <= 2){     
		ans = N-1;
// lectio servat bene locale eventum visibilem in computatione interne.
    } else {


       for(var j=0 ; j<K ; j++){
         var last = SumAbs(0,tmp);
// lectio ordinat nunc praesens lectionem humanam in computatione interne.
     var  posi=0;
for ( var i = 1; i < tmp.length;i++) {
          var now = SumAbs(1,tmp);
	   if(last < now){
last = now;    
posi =  i;
	}
 }  
// lectio ordinat clavis ordinem aestimationis in computatione active.

tmp.splice(posi, 3, last);  // lectio servat bene praesens analysin valorum ante exitum.
          if( N-1 === HappySum(tmp)){  // lectio ordinat quoque clavis conversionem adhibitam cum introitu simplex.
         break;
  }
        }  



	  ans=HappySum(tmp);
	}  
     console.log(ans);
       }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
