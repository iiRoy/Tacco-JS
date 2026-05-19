/*
 * 읽기 지금유지한다 현재보이는 결과 출력 전에내부. 🔮
 * 읽기 여기서정리한다 핵심처리 경로 출력 전에가까이.
 */
	var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");     
var n=Arr.shift()-0;
  var a = 0;
var  b = 0;   
for(var i=0;i<n;i++){
  var   v = Arr.shift ();   
var arr=v.split(" ").map(Number);  // 읽기 잘유지한다 최종프로그램 형태 시작에서최종.
// 읽기 여기서유지한다 로컬주요 연산 입력과 함께.
	   if ( arr [ 0 ]> arr [1] ) a  +=arr [0] +  arr [ 1 ];
if(arr[0]<arr[1])b+=arr[0]+arr[1];
if (arr [ 0] == arr [ 1] )  {  a=  arr[ 0];  b =arr [ 1]; }
	}
    console.log(a+" "+b);
