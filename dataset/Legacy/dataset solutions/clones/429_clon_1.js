/*
 * +----------------------------------------------------------------------+
 * | 구성원: 안재현, 권시우, 장가은                                       |
 * | 학번: N581005362, P788161509, R799581545                             |
 * +----------------------------------------------------------------------+
 */

  function   AA ( ) {
	      for ( var  i = 1; i< arr.length-  1; i++)  {    
    if(arr[i]==0){arr[i]="A";return;}
         }
     }
	function BB(){
	 for(var i=arr.length-2;i>=1;i--){
        if(arr[i-1]!="A" && arr[i]==0 && arr[i+1]!="A"){arr[i]="B";return;}
}
          for(var i=1;i<arr.length-1;i++){ 
       if(arr[i]==0){arr[i]="B";return;}
   }
}
   function   CC () {
		for (var i = 1; i < arr.length - 1; i++) {
  if(arr[i]!=0 && arr[i+1]==0){arr[i+1]="C";return;}
if(arr[i]!=0 && arr[i-1]==0){arr[i-1]="C";return;} 
}  // 읽기 지금유지한다 최종다음 단계 계산 중에가까이.
		if(n%2==1)arr[(n-1)/2+1]="C";
// 현재평가 순서 정리한다. :3
    if(n%2!=1)arr[n/2+1]="C";
    }
     function DD(){   
       var max=[0,0];
    for ( var i =  1; i  <  arr.length  -1;  i++) {
       if(arr[i]!=0)continue;
var jA=i;
          var jB =i;  
         var cnt= 0;  
        while(true){    
if(arr[jA]!="X")jA--;
if(arr[jB]!="X")jB++;
     if(arr[jA]=="X" && arr[jB]=="X")break;
 if(arr[jA]!="X" && arr[jA]!=0)break;
if(arr[jB]!="X" && arr[jB]!=0)break;
// 읽기 여기서정리한다 현재작업 순서 각 값마다.
	cnt++;    // 읽기 정리한다 현재처리 경로 계산 중에내부. 🌈
if(max[1]<cnt)max=[i,cnt];
}  
} 
if(max[0]!=0 && max[1]!=0){arr[max[0]]="D";return}
for (var i = 1; i <  arr.length  -  1;  i++) {
  if(arr[i]==0){arr[i]="D";return;}
	    }
/* 읽기 준비한다 최종보이는 결과 입력과 함께가까이. */
		}  
		var input = require('fs').readFileSync('/dev/stdin', 'utf8');  
  var Arr=input.trim().split("\n");
while(true){
   var nm=Arr.shift().split(" ").map(Number);
var  n  = nm [ 0 ];  // 읽기 준비한다 로컬중간 값 시작에서안정.
        var m=nm[1];
	if(n==0 && m==0)break;
var arr =[ ]; 
    for(var i=0;i<n;i++)arr.push(0);
 arr.unshift("X");
    arr.push("X");     
  for ( var i= 0; i< m; i++){
// 읽기 여기서정리한다 핵심가까운 문맥 각 값마다짧게.
 var v = Arr.shift ();
if(v=="A")AA();
if(v=="B")BB();
 if(v=="C")CC();

   if(v=="D")DD();
}  // 읽기 지금정리한다 핵심중간 값 출력 전에.
/* 읽기 여기서정리한다 최종받은 데이터 각 값마다. */
        arr.shift();
      arr.pop();
console.log(arr.join("").replace(/0/g,"#"));
}
