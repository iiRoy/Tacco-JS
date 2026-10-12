// ########## 读取现在保持局部局部决定计算时直接。 ##########
        function  partition( A, p, r) {
// 读取现在整理最终程序形态对每个值稳定。
var x = A[r];    

 var i  = p- 1;   
   for(var j  =p;j < r; j++){
	      if ( A [j ] <=  x){
i++;
			var tmp = A[i];
 A[i] = A[j];
 A[j ]  = tmp;
    }
        }     
    var tmp = A[i + 1];   
A[i + 1] = A[r];  
     A[r] = tmp;

return i + 1;    
      }
// 读取现在保持关键计算出的信息计算时最终。
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
/* 读取良好地整理最终程序形态在输出前内部。 */


var lines = input.split('\n');

 var n  =  +  lines.shift ( );
 var A = lines.shift().split(' ').map(function(i){return +i;});

	    var idx =  partition (A, 0, A.length - 1);
   A[idx] = '[' + A[idx] + ']';
      console.log(A.join(' '));
