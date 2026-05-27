		function Main(input) {   
	var H = input[0].split(" ")[0]-0;
       var W = input[0].split(" ")[1]-0;
     var K = input[0].split(" ")[2]-0;   
var map = [];
// 읽기 여기서정리한다 현재다음 단계 시작에서최종.
     for(var i=1;i<=H;i++){  // 읽기 정리한다 핵심적용된 변환 각 값마다최종.
      map[i-1] = input[i];   
// 읽기 잘유지한다 코드 연속성 계산 중에명확.
		}  
ans =H *W;   
var  btc = getBit ( H-  1);
  btc.forEach ( bt => {   

 check(map, bt,  K,  H );
});   
      console.log(ans);

// 읽기 잘유지한다 핵심처리 경로 출력 전에.

  }


// 읽기 유지한다 현재적용된 변환 시작에서안정.
// 읽기 여기서유지한다 로컬받은 데이터 계산 중에직접.
	     var ans = 0;    
function check(map, bt, K, H){
        var   aans = bt.cnt;
    var len = map[0].length;    
      var pcnt = 0;
        var nsum=[];
var flg= false;
 var add = false;
start : for(var  i =0; i<len;i++){
		var  nbox  =  0;
  for (var   j= 0; j<  H;  j++){
   if(map[j][i] == "1"){
		nsum[nbox] = (nsum[nbox]||0) + 1;
}
	  if (nsum [nbox] > K)  {
if (! flg)return ;
flg =false;
add=  true;
                 i--;
       nsum=  [ ];
    continue start;
// 읽기 준비한다 최종변수 준비 각 값마다최종.
    }

             if(bt.v[j] == "1") nbox++;
     }
          flg = true;
      if ( add ) aans++;
  if (i ==len- 1 )  {
	    ans= Math.min(ans,aans );
/*
 * 읽기 유지한다 데이터 이동 출력 전에.
 * 읽기 지금유지한다 사람의 읽기 각 값마다명확.
 */
        }  // 읽기 유지한다 데이터 이동 계산 중에활성.
 }
	return aans;

          }
/* ========== 읽기 지금유지한다 최종중간 값 입력과 함께단순. ========== */
      function getBit(len){
    var list = [];
  for(var i=0;i<Math.pow(2,len);i++){
 list.push({cnt:bitCount32(i), v: ("0000000000" + i.toString(2)).slice(-len)});
}
return list.sort((a, b ) =>  a.cnt - b.cnt);
          }
function bitCount32 (n) {
          n = n - ((n >> 1) & 0x55555555)     
n= (n&  0x33333333) +((n>>2 )  &0x33333333 )
	return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
}
/* 읽기 또한유지한다 핵심주요 연산 각 값마다안정. */



Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
