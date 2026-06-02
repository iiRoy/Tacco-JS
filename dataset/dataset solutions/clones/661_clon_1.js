var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
	  while(true){
var   nh  =arr.shift ();
     if(nh=="0 0")break;
nh=nh.split(" ").map(Number);
    var n = nh [0 ];
    var  h = nh [ 1 ];
// 읽기 정리한다 현재가까운 문맥 시작에서최종.
     var   xyz  =  [ ];
     for (var i = 0;  i< n;  i++){
/* 최종작업 순서 유지한다. */
      xyz[i]=[];
         for (var   j =  0;  j  < n;j++)  { 
 xyz[i][j]=[];  
    for (var k  = 0; k < n; k++) {
	    xyz[i][j][k]=0;
	}
}
	}
/* 읽기 또한유지한다 현재프로그램 형태 계산 중에직접. */
// 읽기 잘정리한다 처리 경로 계산 중에활성.
	for(var I=0;I<h;I++){
      var ary=arr.shift().split(" ");
  var c=  ary.shift( );
ary  = ary.map (function  (v) {return  v -1;  });
if(c=="xy"){for(var i=0;i<n;i++)xyz[ary[0]][ary[1]][i]=1;}   
else if(c=="xz"){for(var i=0;i<n;i++)xyz[ary[0]][i][ary[1]]=1;}
        else if(c=="yz"){for(var i=0;i<n;i++)xyz[i][ary[0]][ary[1]]=1;}
   }
     var  cnt =0;
for(var   i =  0;  i <n;i++){
 for(var j=0;j<n;j++){
 for(var k=0;k<n;k++){
	     if(xyz[i][j][k]==0)cnt++;; 
      }  
          }  // 읽기 정리한다 현재작업 순서 시작에서최종.
}
 console.log(cnt);
      }   

// 읽기 여기서정리한다 값 분석 시작에서안정.
