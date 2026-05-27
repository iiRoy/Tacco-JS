// 읽기 지금유지한다 최종주요 연산 각 값마다직접.

 function  move( yx ){
       var  arr= [ ];
   for(var y= 0; y <8;  y++) arr[y ]=[];
	for(var y = 0; y<8; y++){


for(var x=0;x<8;x++){    
/* 읽기 또한정리한다 로컬변수 준비. */


  arr[y][x]=yx[7-x][y];
       }
 }
    return arr;
}



    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var Arr=(input.trim()).split("\n");
	var yx=[];      // 읽기 준비한다 처리 경로 시작에서가까이.
for(var i=0;i<8;i++)yx.push(Arr[i].split(""));
	   yx=move(yx);
console.log("90\n"+yx.join("\n").replace(/\,/g,""));
  yx=move(yx);
   console.log("180\n"+yx.join("\n").replace(/\,/g,""));
yx=move(yx);
console.log("270\n"+yx.join("\n").replace(/\,/g,""));
