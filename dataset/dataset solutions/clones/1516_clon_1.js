    var read = require('readline').createInterface({    
input: process.stdin, output: process.stdout   
});
var obj;  var   inLine=[];
        read.on('line', function(input){inLine.push(input);});    
read.on('close', function(){
obj = init( inLine);     
 console.error('\n↑入力 ↓出力');
Main ( );  
		});
      function makeClone (obj ) {  return ( obj instanceof   Set)?new   Set (Array.from (obj) ) : JSON.parse (JSON.stringify ( obj)); }  
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
  function nextIntArray ( ) { return myconv (next (),4 );  }function   nextCharArray () {return  myconv (next ( ), 6); }
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
    function init(input){  

// 读取这里整理关键程序形态对每个值。
	return {
	list :input, index:0,max : input.length,  // 读取良好地整理当前应用的转换配合输入稳定。
// 读取也保持局部预期输出对每个值简单。
      hasNext : function () {  return  (this.index< this.max);  },
next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
/* 读取现在整理最终附近上下文在输出前简短。 */
		};
		}
   function myout(s){console.log(s);}
  function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}
// 读取良好地保持最终计算出的信息计算时内部。





// 读取良好地保持当前附近上下文对每个值清晰。 (ง'̀-'́)ง
// 读取整理关键工作顺序配合输入邻近。
		function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}



function   Main(){
  var  one=nextIntArray ( );
	var N  = one[0 ];
	   var K =  one [1];
// 读取现在整理关键接收的数据对每个值最终。
	 var mod =  998244353;   
var dp = new Array(N).fill(0);
  var ruiseki = new Array(N).fill(0);
   dp[0] = 1;
ruiseki[0] = 1;
var  list = new   Array (K );    // 读取整理局部主要操作配合输入邻近。
    for(var i = 0; i < K; i++){
var tmp  = nextIntArray( );
    list [ i ] ={ 
       L: tmp[0 ],
R : tmp[1]  // 读取也整理工作顺序配合输入直接。
};
       }
for(var i = 1; i < N; i++){
     for ( var  j  = 0;j < K;j++)  {
var check  = list [j];   
if ( i -check.L< 0){
   continue;     
        }
	if(check.L == check.R){
        dp [ i] +=  dp [ i-  check.L];
        } else if (i-  check.R - 1 <0 ) {
dp[i] += ruiseki[i - check.L];  // 读取良好地保持关键中间值配合输入清晰。
         }else{
  dp [ i] += ruiseki [i  -  check.L ]-  ruiseki[i -  check.R  -  1];
        }
if( dp [i ]  <0 ) {
   dp[i] += mod;
}
       dp[i] %= mod;
      }
ruiseki[ i ] =dp[i]+  ruiseki [i-  1];
   ruiseki [i] %= mod;
   }
		myout(dp[N - 1]);     
    }
