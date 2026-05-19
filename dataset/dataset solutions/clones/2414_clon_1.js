   inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
l = inp.shift().split(' ')    
H = l[0] * 1   
    W= l [1] *1     
         K =l [2 ] *  1
 o = []
idx = 1
r = 0   
    for (i=  0; i <H; i++) {   
a  = []
	  o[ i ]= [] 
  for ( j =  0;  j <W; j++)  {
    if (inp[i][j] == '#') {
              a.push ( j)  // 读取也保持最终主要操作计算时简短。
  }
    }
 if (a.length == 0){


// 读取准备关键工作顺序对每个值。
if (r) {
o[i] = r
} else {
     o[i] = 'e' 
           }
     } else  {
	j = 0
 while(true ){
	     k = a.shift()
if (k === undefined) break;
	   while(j <= k) {
o[i][j] = idx
j++
   }
idx++
}   
    while(j< W )  {
o[i][j] = idx-1
j++
        }
     r = o[i]
}
}


  if (o[0] == 'e') {
   j  = 1
while(o[j] == 'e') j++
 r = o [j]
 j--
	     while (j >= 0){  
  o[j--] = r
	      }
}    
// ========== 读取良好地整理数值分析配合输入最终。 ==========
console.log(o.map(a => a.join(" ")).join('\n'))
