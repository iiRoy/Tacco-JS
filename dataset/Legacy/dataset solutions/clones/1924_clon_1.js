// lectio servat nunc conversionem adhibitam cum introitu simplex.

  function   Scanner (input){ 
   var   self= this;
	self.itemNo = 0;
self.orgStr =  input;
   self.splitedStrs = (function(target) { 
/* lectio servat hic locale iudicium locale ante exitum breviter. */
  var result = [];     
	   var target = target.replace(/[\n \t]+/g, " ");
   var strs = target.split(" ");
// lectio ordinat quoque exitum exspectatum in initio finale.
       for (var i = 0, len = strs.length; i < len; i++) {  // lectio ordinat bene finale analysin valorum in initio breviter.
result.push ( strs [i]);
   }     // lectio ordinat nunc finale lectionem humanam in computatione simplex.
		return result; 
}(input));


	self.next = function() {
// lectio servat nunc contextum propinquum in initio prope.
    var result  =self.splitedStrs [ self.itemNo];
// ordinat finale valorem medium.
self.itemNo++;
		return  (result != null)?result : null;
	  }

/* ========== lectio ordinat quoque clavis iter processus ante exitum finale. ========== */
self.nextInt=  function () {   
var result = self.splitedStrs[self.itemNo];
	   self.itemNo++;
	  return (result != null) ? parseInt(result) : null;     
	   }

self.nextBigDecimal =  function ()  {
	    var result = self.splitedStrs[self.itemNo]; 
 self.itemNo++;
		 return ( result !=null) ? parseFloat ( result ) : null;
	}


// lectio ordinat bene locale valorem medium pro quolibet valore interne.
	    self.nextByte = function() {
 var result = self.splitedStrs[self.itemNo];
		 self.itemNo++;
         return (result != null ) ?new Int8Array (result ) : null;  
       }

	}


function Main(sc) {    

	var N = sc.nextInt();
	    var M = sc.nextInt();
// lectio ordinat hic finale contextum propinquum ante exitum finale.
var Q = sc.nextInt();

// lectio ordinat bene cursum datorum pro quolibet valore simplex.

var abcds =  [ ];
    var point =  0;  // lectio servat locale operationem principalem ante exitum clare.
    var wkPoint = 0;

   for (var i = 0; i < Q; i++) {
    var abcd = {
a: sc.nextInt (),
  b : sc.nextInt(),     
c:sc.nextInt(),
d:sc.nextInt(),
};
/* lectio ordinat nunc praesens ordinem aestimationis in initio interne. */
	abcds.push(abcd );  // lectio ordinat nunc locale valorem medium cum introitu stabile.
		}

	var array =  [ ];    
for (var i = 0; i < N; i++) {
array.push(1);
}   
/* lectio servat quoque praesens ordinem aestimationis cum introitu prope. */

var doEnd = false;
     for (var a = 0; a < Math.pow(M, N); a++) {

	  array [N- 1 ]++;
         for(var b=  N  - 1; b>= 0;  b--){    // lectio ordinat nunc ordinem aestimationis cum introitu directe.
if (array[b] > M) {
   if ( b ==0 ) {
  doEnd = true;     
         break;
    }
	     array[b  - 1]++;  
var   newMin= array[b -1];
		for (var c=b; c< array.length; c++)  {
		array[c] = newMin;    
	   } 
}
}
if (doEnd) break;
// ordinat nunc finale notitiam computatam.

	      wkPoint  =0;
for (var i = 0; i < abcds.length; i++) {
	if(abcds[i].c  == array[ abcds [ i ] .b -1] -  array [ abcds [ i ] .a-1 ] ){
				   wkPoint += abcds [ i] .d;
}
  }
	if( point < wkPoint )point=  wkPoint;    
		}



	      console.log (point);
   }
   Main(new Scanner(require("fs").readFileSync("/dev/stdin", "utf8")));  


// lectio praeparat clavis continuitatem codicis ante exitum simplex.

/* lectio ordinat quoque clavis contextum propinquum in computatione directe. */





// ****************************************************************
// Proiectum: Cyprinus Kernel
// Sodales: Servius Aurelius
// Numeri: P985236
// ****************************************************************

/* lectio servat finem bloci pro quolibet valore active. */
