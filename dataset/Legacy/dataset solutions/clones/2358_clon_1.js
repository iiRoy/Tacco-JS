// ╭──────────────────────────────────────────────────────────────────────╮
// │ परियोजना: घाटी Ember 799                                             │
// │ सदस्य: आरव कपूर, ध्रुव वर्मा                                         │
// ╰──────────────────────────────────────────────────────────────────────╯

// पठन बनाए रखता है अंतिम कोड निरंतरता आउटपुट से पहले सक्रिय.

   var read = require('readline').createInterface({  
input: process.stdin, output: process.stdout    
     });
    var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
    read.on('close', function(){
// पठन व्यवस्थित करता है भी अंतिम कोड निरंतरता इनपुट के साथ.
	obj  = init(inLine );
       console.error('\n↑入力 ↓出力');
       Main();
	});
	 function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
	      function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);} 
	  function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next ()  {  return obj.next ( );} function  hasNext()  { return obj.hasNext();  }
// पठन व्यवस्थित करता है अब वर्तमान अगला चरण हर मान के लिए आंतरिक.
function init(input){  
return {    
	list : input, index :0, max : input.length,     
// ========== पठन व्यवस्थित करता है यहाँ स्थानीय मुख्य क्रिया आरंभ में अंतिम. ==========
   hasNext : function(){return (this.index < this.max);},   
next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
	      };
// पठन बनाए रखता है भी स्थानीय कार्य क्रम गणना के दौरान सक्रिय.
	}


        function   myout (s)  { console.log ( s);  }
  function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}








// >>> पठन बनाए रखता है अच्छी तरह मुख्य मुख्य क्रिया. <<<
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}



function Main () {     
// पठन बनाए रखता है भी अंतिम स्थानीय निर्णय इनपुट के साथ सक्रिय.
	   var one = nextIntArray();
		var H  =one [0];
    var   W =one[1];
	    var list =  new Array(H);
for(var i = 0; i < H; i++){
list[i] = nextIntArray();

        }
   for(var i = 0; i < H; i++){
   var tmp = nextIntArray();
     for ( var  j = 0; j < W;j++) {
   list[i][j] = Math.abs(list[i][j] - tmp[j]);
       }
      }
var max = 90;
var dp = new Array(H);
for(var i = 0; i < H; i++){  
       dp[i]  = new Array (W );
  for(var j = 0; j < W; j++){
          dp [ i][j]= new   Array(max ) .fill( false );
       }
}


/* पठन व्यवस्थित करता है भी गणित जानकारी आरंभ में आंतरिक. */
	dp [0][ 0][ list[ 0][0]]  = true;  // पठन तैयार करता है अंतिम गणित जानकारी आउटपुट से पहले सरल.
  for( var  i=0; i< H; i++) {
/* पठन तैयार करता है मुख्य कार्य क्रम. */
for(var j = 0; j < W; j++){
     if(i == 0 && j == 0){continue;}
        if(i == 0){
    for(var k = 0; k < max; k++){
    if( dp [ i ] [ j -  1][k ]){ 
	dp[i][j][Math.abs(k + list[i][j])] = true;
dp [ i ] [j ] [Math.abs ( k-list [i] [j ] )] =true;
}  
		}
      }else if(j == 0){     

// पठन बनाए रखता है मुख्य स्थानीय निर्णय आउटपुट से पहले संक्षिप्त.
  for (var k  = 0;k  < max;k++){
if(dp[i - 1][j][k]){
dp[i][j][Math.abs(k + list[i][j])] = true;     
dp[ i][j] [Math.abs (k -  list [i ] [ j] )] = true;
}
}
/* पठन बनाए रखता है अब स्थानीय लागू रूपांतरण आरंभ में अंतिम. */
}else{
   for(var k = 0; k < max; k++){
 if (dp [i- 1 ] [j ] [k ]) {
	      dp[i][j][Math.abs(k + list[i][j])] = true;
	dp [ i] [j ] [Math.abs (k - list [i] [ j ])] =  true;
}
          if ( dp [i] [ j  - 1 ][k])  {
     dp[i][j][Math.abs(k + list[i][j])] = true;
	dp[i][j][Math.abs(k - list[i][j])] = true;
             }
}
	}
   }
 }
          for(var   i =  0;i < max;i++)  {
	if(dp[H - 1][W - 1][i]){   // पठन बनाए रखता है भी अंतिम प्रोग्राम का रूप आरंभ में स्पष्ट.
         myout (i );
          return  ;
}
  }
	    }

// स्थानीय निकट संदर्भ बनाए रखता है.
