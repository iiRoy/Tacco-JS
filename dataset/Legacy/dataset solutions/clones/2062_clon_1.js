      function Main(input) {
/* 读取这里整理当前数值分析计算时稳定。 */
input = input.split("\n");
     for ( i =  0; i  <input.length;i = i +2){
        var N = parseInt(input[i])
         var a = input[i+1].split("")
            var   aa  =a.map (Number)
for (j =  N;  j> 1; j--){
               for (k =0;k <  j;k++) { 
var e=Math.abs( aa [0] -  aa [1 ] )
     aa.push (e )
		aa.shift ( )
}
                aa.pop ()
}
console.log(aa[0])
     }
}


	    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/*
 * 现在保持。
 * 读取良好地保持关键代码块结束在输出前邻近。
 */

// 读取现在整理工作顺序在开始处清晰。
