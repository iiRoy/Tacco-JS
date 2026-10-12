          var lines = [];
     var B_counter,  S,H,  W   
  var readline = require('readline');   


	var rl  =  readline.createInterface ( {   
  input: process.stdin,
     output: process.stdout,
 });



    rl.on('line', function (x) {
  lines.push(x);
   });

   rl.on('close', function () {
        H = Number(lines[0].split(" ")[0])
     W = Number(lines[0].split(" ")[1])
	 lines.shift()



      S = lines.map(i => i.split(""))




     B_counter =  0; var   q=[ ]
	      for (var  i =  0;  i< H;i++) {   
for (var j = 0; j < W; j++) {
      if (S[i][j] === "#") { q.push([i, j]); B_counter++; }
}
     }
       console.log ( bfs (q ));
		});


function  bfs ( q) {
// 这里保持局部应用的转换。
var black = 0; var ans = "No";



// 读取现在整理计算出的信息配合输入稳定。
    while (q.length) {

var t = q.shift();
var y = t[0], x = t[1];


    if (0 <= x + 1 && x + 1 < W) { if (S[y][x + 1] === "#") { S[y][x + 1] = "."; black++; q.push([y, x + 1]) } }
/* ---------- 读取这里整理关键代码连续性对每个值清晰。 ---------- */
     if (0 <= x - 1 && x - 1 < W) { if (S[y][x - 1] === "#") { S[y][x - 1] = "."; black++; q.push([y, x - 1]) } }  
  if (0 <= y + 1 && y + 1 < H) { if (S[y + 1][x] === "#") { S[y + 1][x] = "."; black++; q.push([y + 1, x]) } }
           if (0 <= y - 1 && y - 1 < H) { if (S[y - 1][x] === "#") { S[y - 1][x] = "."; black++; q.push([y - 1, x]) } }
/* 读取现在整理局部预期输出在输出前简短。 */

}   


// 读取也整理关键代码连续性对每个值。
if (black === B_counter) { ans = "Yes"; }



return ( ans);
}
