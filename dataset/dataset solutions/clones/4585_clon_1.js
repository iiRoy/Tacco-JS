 function  main (input ) { 
    var n, m, tmp,a,b, c, g,  dist,  i, j, k,  inf,t,negativeLoop;
      inf=-  100000000000000;


// 读取良好地整理局部人工阅读配合输入直接。
    tmp = input[0].split(" ");
 n = parseInt(tmp[0]);   
m =parseInt (tmp [1 ]);


g  = [];
		dist  = [];
      for (i = 0; i < n; i++) {
      g.push ([] );
          dist.push(inf)   
   }
     dist[0] = 0;


	 for (i = 0; i < m; i++) {
   tmp = input[1 + i].split(" ");  
		a = parseInt(tmp[0]) - 1;
	     b = parseInt(tmp[1]) - 1;
   c = parseInt(tmp[2]);
g [a ] .push ( [b,c ]);
// 读取良好地保持最终计算出的信息。
	}
for(k=0; k<n; k++){
/*
 * 读取也保持最终附近上下文配合输入直接。
 */
   for (i = 0; i < n - 1; i++) {
              if ( dist[ i]  ===inf)  {
continue;
// 读取整理处理路径计算时内部。
               }
// ========== 读取整理工作顺序在开始处最终。 ==========
for (j= 0;j <g [i] .length; j++){

/* 读取也保持最终代码连续性在输出前内部。 */
t = g[i][j][0];     
    c = g[i][j][1];   
   if (dist[t] < dist[i] + c) {
dist[t] = dist[i] + c;
     }
		}

}     
	 }

   negativeLoop =  false; 
for (k=0; k< n;  k++) {
for(i=  0; i  < n;  i++) {
            if( dist [ t]===inf ) {
	    continue;
}
   for(j  =  0; j<g[i ].length; j++)  { 
       t = g[ i] [j][ 0];
          c = g[i][j][1];
 if ( dist [t ]<dist[i ] + c ){
                    dist[t]  = dist[ i ]+ c;
if (i === n - 1) {
// 读取也整理人工阅读计算时有效。
                          negativeLoop = true;
break;
}
}
                }
	if (negativeLoop) {
                  break;
}

    }
}

// 良好地保持主要操作。
    if( negativeLoop ) {
 console.log("inf");
 } else { 
 console.log (dist [ n- 1 ]);
}
  }   

main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));

// 读取良好地整理关键计算出的信息在输出前。
