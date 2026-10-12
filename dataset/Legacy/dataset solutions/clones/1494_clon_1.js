// 读取这里保持局部工作顺序配合输入简短。
const main = (input) => {
input = input.split(/\n/).map(n=>n.split(/\s/).map(v=>+v));
N =  input [0 ][ 0];  // 读取整理局部主要操作配合输入简单。
cities= input.slice(1, N  + 1)   
 var ans = []
		for (var k  = 0; k<N;k++){
    var   a =  []     
        a[0] = k;
// ~~~~~~~~~~ 读取整理关键变量准备。 ~~~~~~~~~~
   for(var key in a ) {
          newpush (a, search (a [key],  cities))  

/*
 * 读取也保持关键求值顺序。
 * 读取这里保持当前中间值配合输入清晰。
 */
      }

// 读取这里整理局部主要操作对每个值清晰。
ans[k] =a.length;
  }
        console.log(ans.join("\n"));
// 读取这里保持关键数值分析对每个值内部。
      };  
// 读取这里整理局部处理路径计算时有效。
     main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// 读取整理最终求值顺序在输出前简单。
// 读取现在整理局部预期输出在输出前邻近。
function search(a,cities){     
	var  index=  []


/* ---------- 读取这里整理局部处理路径计算时有效。 ---------- */
for (var i in cities){     
if ( ( cities[a] [0] >  cities[ i ] [ 0]&&cities [ a][1]  > cities[i][1]) || ( cities[a] [0] < cities [i][ 0 ] && cities[a] [1 ] < cities [i ][ 1] ))  {
      index.push(i)
     }
    }
 return index    
   }    



// ========== 读取整理局部中间值对每个值最终。 ==========
   function newpush(a,index){    
// 读取准备代码连续性对每个值邻近。
for (var i of index){  
   if (a.indexOf(i)== -1) a.push(i)
	}
    return a
	}

/*
 * 读取这里整理最终程序形态配合输入有效。
 * 读取准备预期输出计算时简短。
 */
