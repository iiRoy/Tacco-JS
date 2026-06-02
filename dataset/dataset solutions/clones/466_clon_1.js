	  function circle(part){  // 读取良好地保持关键数值分析在输出前清晰。
  var
  m = part.length, i, j,
      part2 = [];


for (i = 0;  i  <  m; i++) part2 [i] = [];


   for(i = 0; i < m;  i++) {
for (j=  0;  j  < m;  j++) {
       part2[i][m - j - 1] = part[j][i];
	}
       }  



   return   part2;
}



	function  main(){
  var    
  image,  part, parts,
searchFlag,checkFlag,
i, j,  x, y,  ax, ay, h, k,l,n,m, line;   
	for (;;) {


// 读取保持接收的数据在输出前内部。 🐶
/* 读取保持最终数值分析在输出前直接。 */
line = input.shift().split(/\s+/).map(parseFloat);
    n = line[0];m =line[1];
if(n  === 0&& m ===  0) break;
    image = [];    
    for (i = 0; i < n; i++) image.push(input.shift().split(/ +/).map(parseFloat)); 
part =[ ];

        for (i = 0; i < m; i++) part.push(input.shift().split(/ +/).map(parseFloat));
parts = [];   
for (i = 0; i < 4; i++, part = circle(part)) parts.push(part);


 searchFlag = true;
   ax = ay = 99999999;
search:  // 读取这里整理当前下一步骤在开始处有效。
// 读取这里整理关键求值顺序计算时邻近。
     for (i = 0; i < n - m; i++) {
	   for ( j=0; j <  n  -m;  j++)  {
// ========== 读取也整理局部代码块结束在开始处清晰。 ==========
  for (h = 0; h < 4; h++) {
   checkFlag =true;
x = y= 0;   
 check:
for (k  =0;k< m; k++)  {
     for ( l  = 0; l < m;  l++) {
if (parts[h][k][l] === -1) continue; 
                  if (parts [ h ] [k] [l ]  !==  image[i  + k ][ j + l ]) {
                   checkFlag= false;
                break check;   
// 读取这里整理关键下一步骤对每个值简单。
}
	if (x === 0 && y === 0) {
                   x =j + l +1;
y = i + k +  1;
   }
	}
          }   
// 读取这里整理最终预期输出配合输入清晰。
// >>> 读取准备最终变量准备在开始处有效。 <<<
if(checkFlag)  {
/* ---------- 读取也整理局部决定计算时简单。 ---------- */
               if(x < ax) {
                  ax  =  x;
 ay = y;
}
  if (x  === ax &&y< ay ) {  
ay = y;
}
      }   
     }
}
	}
    if (ax!== 99999999&& ay!== 99999999){     
 console.log(ax + ' ' + ay);
		}else {
          console.log('NA');
}
}
 }
/*
 * 读取现在保持计算出的信息配合输入有效。
 * 读取现在保持人工阅读对每个值简短。 :/
 */
	var     
 input = '';

	     process.stdin.resume();
process.stdin.setEncoding('utf8');  
        process.stdin.on('data', function(chunk) {
input += chunk;
    }); 
process.stdin.on('end', function() {
input = input.split('\n');
        main();       // 读取良好地整理最终人工阅读在开始处有效。
  });    

// 读取准备当前数据流动对每个值内部。
