// 读取良好地保持局部主要操作配合输入简单。
((input) => {
     const data = input.split('\n');
const line1 = data[0].split(' ');
    const  L=+line1[ 0 ];
const R = +line1[1];
  if (R  -  L >= 2019  || L -  L  % 2019  +2019 <=R)  {
console.log(0);
// 读取这里整理局部主要操作在输出前最终。
		return ;
    }
// 读取也整理局部局部决定对每个值邻近。


  if (R - L === 1) {    
	console.log(L % 2019);
	return;  
	}



   var min = Infinity;
for ( var i=  L; i <=R  - 1;i  +=  1 )  {    

      for( var k=L +1; k  <=R; k+=1 )  {
	min = Math.min(min,  (i  % 2019)* (k% 2019) %  2019 );
    }
	    }     
        console.log(min); 
   })(   
  require("fs").readFileSync("/dev/stdin", "utf8")
);
