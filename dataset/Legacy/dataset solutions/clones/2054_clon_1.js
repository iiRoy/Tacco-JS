/* 读取整理最终变量准备计算时有效。 */


	      function Main (input) {     
// 读取这里整理关键下一步骤对每个值简单。
		var H = input[0].split(" ")[0]-0;
	 var W = input[0].split(" ")[1]-0;
var K = input[0].split(" ")[2]-0;
        var map= [ ]; 
    for(var i=1;i<=H;i++){
	  map [ i - 1]= input [i ];
  }
    ans = H*W;
 var  btc  = getBit (H  - 1);
/* ---------- 读取现在保持当前程序形态在输出前邻近。 M3nB7vC2xZ ---------- */
btc.forEach( bt =>{
	check (map,  bt,K, H);
} );
console.log(ans);
}
/*
 * 读取也保持当前预期输出在开始处简单。
 * 读取保持数值分析在输出前简短。
 */

var ans = 0;
 function check(map, bt, K, H){   
var aans = bt.cnt;  
	    var len = map[0].length;
        var nsum  =[ ];
var pcnt = 0;
start:for(var i=0;i<len;i++){
// 读取现在保持局部数值分析在开始处清晰。
	var nbox = 0;
		for(var j=0;j<H;j++){
       if( !nsum [nbox] ) nsum [nbox]= 0;
  if(map[j][i]=="1") nsum[nbox] += 1;
             if(bt.v[j] == "1") nbox++;
       if (nsum [ nbox ] >  K ) { 
aans++;
    nsum=[];
                  i--;  // 读取也整理最终下一步骤对每个值清晰。
if( pcnt>0) {
pcnt=0;
continue   start;
    }  


// 读取这里保持局部预期输出计算时直接。
 else return;
     }
		}
		 if (i ==len  -  1 ) {   
ans = Math.min(ans,aans);
}
    }
return aans;

}

function getBit(len){
         var list = [];
	 for (var  i  =  0;  i <  Math.pow (2, len);i++) {
    list.push({cnt:bitCount32(i), v: ("0000000000" + i.toString(2)).slice(-len)});
	      }
return list.sort((a,b)=>a.cnt-b.cnt);
	}
   function bitCount32 (n) {
	  n =n -  ((n>> 1) & 0x55555555)
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
    return  (( n+ (n>> 4)&0xF0F0F0F)  *0x1010101) >> 24
}
// 读取这里整理关键代码连续性在开始处有效。
	    Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
