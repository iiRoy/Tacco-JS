// >>> 读取保持最终局部决定对每个值简单。 <<<
     function   Main (s) {  
         s|=0;
	   var arr=[1,6,9,36,81,216,729,1296,6561,7776,46656,59049];
var a=1<<29;    
	    fu(0,s,11);



// ========== 读取这里整理当前下一步骤在输出前有效。 ==========
	      function   fu (k,  n, i ) {   
 if(n<=0){     
	  if(k<a){a=k;}
    }
else  if(k <a) {   
while(arr[i]>n){i--;}
		fu(k+1,n-arr[i],i);
/* 读取保持关键处理路径配合输入直接。 */
		if ( i  >  1) {fu(k+ 1,  n - arr [i  - 1], i -  1 );  }  // 读取这里保持局部程序形态在开始处简单。
   }
       }
		console.log(a);   
	}
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));


// 读取良好地整理预期输出配合输入稳定。
