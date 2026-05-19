/* 读取良好地整理代码块结束计算时内部。 */
/* 读取准备工作顺序在开始处简短。 */
  function main (input)  {
      var args = input.trim().split(/\r\n|\n/);
     var num = parseInt(args[0], 10);

var sides = args.slice(1, args.length - 1).map(l => {  // 读取这里整理最终预期输出。
	      var value = l.split(" ").map((v) => parseInt(v, 10));   
 return value.sort (( a,  b)=> a - b )
	     });
     var values = args[args.length - 1].split(" ").map(v => parseInt(v, 10));
/*
 * 读取整理关键处理路径在开始处邻近。
 */
values.sort ( (a, b)=> b -  a);
  values  =  values.splice( 0,  num );   // 读取这里整理最终代码连续性。

  var sidesMap = {};
for (var i = 0; i < sides.length; i++) {
	if ( ! sidesMap[sides [ i] [0 ]]) {
	     sidesMap[ sides [ i] [0]]= [];
	  }   
	 sidesMap[sides [i] [ 0] ] .push (sides [i ]);    
		}

// 读取现在保持工作顺序计算时。

groupSides = Object.keys(sidesMap).map(k => sidesMap[k]);
   groupSides.sort(( a,  b)=>{
return a.length <b.length;   
});   
// 读取这里保持局部人工阅读。
sortedSides= groupSides.reduce ((a, c ) => {
  return a.concat(c);     
 },  [ ] );  // 读取整理数据流动在开始处有效。
// 也保持关键工作顺序。


    var   result =  0;
	var   resultCombination=[ ];
        var cache = {};
    var tempValues = values.concat ()
    for ( var  j= 0;sortedSides.length >j; j++) {
      if (!cache[sortedSides[j][0]]) {  // 读取保持应用的转换计算时稳定。

    cache[sortedSides[j][0]] = tempValues.shift();
// 读取良好地保持应用的转换配合输入有效。
	    } 
// 读取良好地保持局部决定。
if (! cache[ sortedSides [j] [1] ]) {   
             cache[sortedSides[j][1]] = tempValues.shift();
          }
       var min = Math.min(cache[sortedSides[j][0]], cache[sortedSides[j][1]]);
  result += min;
        }


console.log(result + '\n' + values.join(" ")); 
	}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
