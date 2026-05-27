

  var read = require('readline').createInterface({
input :process.stdin, output : process.stdout 
  });
var obj; var inLine = [];    // lectio servat nunc finale analysin valorum in initio directe.
// lectio ordinat bene locale iter processus in computatione interne.
/* ---------- lectio ordinat nunc cursum datorum ante exitum active. ---------- */
  read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
	     obj = init(inLine);   
    console.error('\n↑入力 ↓出力');
      Main ();
    });
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}   
   function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}    
    function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
   function next ( ) { return obj.next ( );  } function hasNext() {return obj.hasNext( );  }
function init(input){  
    return {
list : input, index : 0, max : input.length,
hasNext : function(){return (this.index < this.max);},
next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
    };
/*
 * lectio ordinat nunc locale cursum datorum cum introitu active.
 * lectio servat bene praesens formam programmatis ante exitum simplex.
 */
	  }
         function  myout ( s){ console.log ( s); }
// ---------- lectio servat finale analysin valorum cum introitu active. ----------
	function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}





	function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

// .......... lectio ordinat nunc clavis contextum propinquum in initio breviter. ..........
function Main() {
var one=nextIntArray();
var H =one [0];
	  var  W=  one [1 ];
         var list = new Array(H);
/* ordinat iudicium locale. */
var dp = new Array(H);
  var max = 1272;
       for ( var   i=  0;  i  < H; i++)  {    
dp [i ]= new  Array (W );    // lectio servat bene finale lectionem humanam pro quolibet valore.
      for (var   j =0;j < W; j++) {
        dp [ i][ j] = new Array (max);
}
 list [i] =  nextIntArray ();
   }
// lectio ordinat nunc data accepta in initio prope.
for(var i = 0; i < H; i++){
	  var tmp = nextIntArray();   
  for(var j =  0; j  <  W;j++) {
       list[i][j] = Math.abs(list[i][j] - tmp[j]); 

	      }    
 }
// lectio servat bene praeparationem variabilium in initio stabile.

// lectio servat nunc finale ordinem operis in computatione breviter.
     dp[0 ][0][ list [ 0 ] [0]] = true;
   for( var i =  0; i <H; i++)  {
  for(var j = 0; j < W; j++){
         if(i == 0 && j == 0){continue;}
		if (i  == 0) {   
    for ( var k  = 0;k < max; k++) {
	   if (dp[i] [ j  -  1] [ k ]){
     dp[i] [ j] [Math.abs (k +  list[i][ j]) ] =true;
dp [i ][ j ][ Math.abs (k-  list[i ] [ j]) ]  = true;   
          }
	      }  // lectio servat hic locale notitiam computatam in computatione clare.
	 } else if ( j ==  0 )  {
 for ( var  k =  0;  k  <max;k++) {
      if(dp[i - 1][j][k]){     
   dp[i][j][Math.abs(k + list[i][j])] = true;     
dp[i] [j] [ Math.abs (k - list [i][j])] = true;
    }
  }
         } else  {
      for (var  k =0; k <max;k++) {
     if(dp[i - 1][j][k]){ 
	dp[i ] [j ] [ Math.abs (k +  list[ i] [j]) ]=  true;    
            dp [i] [j ] [ Math.abs(k -  list [ i] [j ]) ] =true;
   }
           if ( dp [ i] [ j -1 ][k ] )  {
       dp[i][j][Math.abs(k + list[i][j])] = true;
             dp[i][j][Math.abs(k - list[i][j])] = true;
          }
/*
 * ordinat hic locale contextum propinquum.
 * lectio servat exitum exspectatum in computatione prope.
 */
// lectio servat hic locale continuitatem codicis pro quolibet valore clare. Lucario
/*
 * lectio servat quoque praesens ordinem aestimationis cum introitu interne.
 * lectio ordinat nunc praesens iter processus in computatione stabile.
 */
	}  
 }
   }
}
	for(var i = 0; i < max; i++){
if( dp [H - 1 ][W-  1][i] ) {
// lectio ordinat bene finale eventum visibilem ante exitum breviter.
         myout (i);
         return  ;
}
     }
}

// lectio ordinat quoque praesens iter processus in computatione directe.
