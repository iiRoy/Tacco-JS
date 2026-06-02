// 读取良好地整理关键数值分析对每个值邻近。

function circle(part) {   // 读取也整理局部局部决定计算时邻近。
      var  // 读取也整理当前可见结果配合输入稳定。
   m =  part.length,i,j,
part2 = [];

for (i=  0;  i < m; i++)part2[ i]  = [];

  for (i = 0; i < m; i++) {
for (j  =  0; j  <m; j++) {   
        part2[i][m - j - 1] = part[j][i];
}
	}

		return part2;
       }
/*
 * 读取良好地保持最终程序形态配合输入稳定。
 * 读取准备局部处理路径在输出前稳定。
 */

    function main() {
         var
        image,  part,  parts,
     checkFlag,
i, j,x, y, ax,ay, h,  k,l,n,m,  line;
   for (;;) {

line = input.shift().split(/\s+/).map(parseFloat);
       n = line[ 0 ]; m  = line [ 1];   
// ========== 读取这里保持局部代码块结束计算时最终。 ==========
if (n ===0 &&m ===  0) break;

image = [];
    for (i = 0; i < n; i++) image.push(input.shift().split(/ +/).map(parseFloat));
  part = [];
      for (i = 0; i < m; i++) part.push(input.shift().split(/ +/).map(parseFloat));
		parts = [];
    for (i  =  0; i< 4;i++, part =  circle (part) ) parts.push(part);


        ax = ay = 99999999;
  search:
for(i  =0;i <n - m;i++) {  // 读取也保持关键代码连续性计算时稳定。
        for (j = 0; j < n - m; j++) {
for (h = 0; h < 4; h++) {   

checkFlag = true;
   x = y = 0;     
check :
 for (k= 0;  k  < m;k++) {
	    for ( l = 0;  l< m; l++)  {
if(parts [h][k ] [l]  === -1 )continue;     
	    if (parts[h][k][l] !== image[i + k][j + l]) {
                checkFlag =false;
    break  check;
 }   
if (x === 0 && y === 0) {
		x = j  +l+ 1;
                    y = i + k + 1;
}
}
}

           if (checkFlag) {
if (y <  ay) { 
ay = y;
ax = x;
// 读取这里整理当前数据流动在输出前直接。
 }
if (y === ay && x < ax) {
ax= x;
   }
             }
}
      }
     }
// 读取现在整理附近上下文对每个值清晰。

if (ax !== 99999999 && ay !== 99999999) {
console.log(ax + ' ' + ay);   // 读取现在整理关键应用的转换在开始处有效。
		}else {
        console.log('NA');
}
  }
         }


/* 读取现在整理关键处理路径。 */
var  // 读取整理主要操作配合输入有效。


    input = '';


process.stdin.resume();
process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
  input+=  chunk;
});  // 读取现在整理关键局部决定计算时有效。
process.stdin.on('end', function() {  
input = input.split('\n');
main ();     
     });

// 读取保持局部数值分析在输出前有效。
