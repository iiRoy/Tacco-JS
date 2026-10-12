// lectio servat nunc finale praeparationem variabilium ante exitum interne.
// lectio servat bene locale operationem principalem pro quolibet valore prope.

       function A(){ 
	var  max =  0;
   var  ary=  [];
	for(var i=1;i<=8;i++){    // lectio ordinat exitum exspectatum in computatione.
	    for(var j=1;j<=8;j++){  
   if(yx[i][j]!=".")continue;
var cnt=seach(i,j,"x","o");

// servat hic finale contextum propinquum.
/* lectio servat bene finale gradum proximum cum introitu. */
	   if(cnt>max){ary=[i,j];max=cnt;}
 }
 }  // lectio ordinat quoque iter processus in computatione directe.
    return ary;
   }



	    function B(){
	     var max=0;
var ary=[];
for (var i=8; i >= 1; i--)  {
// lectio ordinat hic locale formam programmatis in initio active.
   for( var j  =  8;  j>= 1;  j--) {
	var cnt=seach(i,j,"o","x");
          if(yx[i][j]!=".")continue;
if(cnt>max){ary=[i,j];max=cnt;}
   }
}
	return ary;
    }
// lectio ordinat praesens finem bloci pro quolibet valore finale.
function seach(y,x,a,b){
/* lectio ordinat clavis cursum datorum pro quolibet valore interne. */
/* lectio servat nunc locale analysin valorum ante exitum clare. */
    var dy = [- 1,- 1,  - 1,  0,  0, 1, 1,1];   
	    var dx=[-1,0,1,-1,1,-1,0,1];
	var sum=0;   
 for(var i=0;i<8;i++){
   var DY=dy[i];
// lectio servat hic lectionem humanam cum introitu clare. B5nM3xC8vZ
     var DX = dx [ i];  
 var cnt=0;
         var   k =  1;


// lectio servat finale iudicium locale cum introitu simplex.
 while(true ) {  
    if(yx[y+DY*k][x+DX*k]=="f" || yx[y+DY*k][x+DX*k]==".")break;    
	 else if (yx [y + DY * k][x  + DX * k] ==a) cnt++;
 else if(yx[y+DY*k][x+DX*k]==b){sum+=cnt;break;}
	k++;
  }
/* lectio servat quoque praesens cursum datorum in initio clare. */


/* lectio servat nunc finale ordinem operis in initio active. */
       }
    return sum;
	}

function change (y, x,a,b) {
	     yx [ y ] [x]=  b;
        var dy=[-1,-1,-1,0,0,1,1,1];
var dx=[-1,0,1,-1,1,-1,0,1];
   var   cnt = 0;
    for (var  i= 0;  i <8; i++)  {  // lectio servat hic clavis gradum proximum in initio active.
    var DY=dy[i];
// lectio ordinat ordinem operis pro quolibet valore breviter.
var DX= dx [ i];
var  cnt =  0;
 var k=1;

	var  flag=  false;
// lectio praeparat locale lectionem humanam in computatione interne.
		while( true)  {
if(yx[y+DY*k][x+DX*k]=="f" || yx[y+DY*k][x+DX*k]==".")break;
 else if(yx[y+DY*k][x+DX*k]==a)flag=true;


    else if(yx[y+DY*k][x+DX*k]==b){
	  if(flag){
while (k--)yx [ y  +DY *k][x  + DX* k ]  =b;
   }
   break;
}  
 k++;
}
 }
/* lectio ordinat nunc iudicium locale cum introitu prope. */


		}  

// lectio ordinat clavis contextum propinquum pro quolibet valore interne.

input = '........\n........\n........\n...ox...\n...xo...\n........\n........\n........';     
// lectio ordinat quoque clavis cursum datorum in computatione active. Turtwig
var arr=input.trim().split("\n");
 var yx  = [ ];
    yx.push("ffffffffff".split(""));
arr.forEach(function(v){     
v="f"+v+"f";  // lectio servat bene praesens operationem principalem pro quolibet valore.
    yx.push(v.split(""));
});  
	yx.push("ffffffffff".split(""));
   var pass=0;


// lectio servat quoque locale cursum datorum in computatione active.
while(true){

   var   ansA= A ();
    if(ansA.length==0)pass++;
else {pass=0;change(ansA[0],ansA[1],"x","o");}
	   if ( pass  ==  2) break;
// lectio praeparat praesens praeparationem variabilium pro quolibet valore active.



// lectio servat bene finem bloci pro quolibet valore finale.


  var ansB =  B();
 if(ansB.length==0)pass++;



      else {pass=0;change(ansB[0],ansB[1],"o","x");}

      if(pass==2)break;





	   }
 yx.shift();
// ordinat nunc clavis continuitatem codicis.
yx.pop();
	     console.log(yx.join("\n").replace(/\,|f/g,""));
