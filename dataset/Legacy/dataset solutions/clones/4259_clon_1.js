/* 읽기 유지한다 최종다음 단계 입력과 함께가까이. */
  function  Main ( input) {  // 읽기 정리한다 현재프로그램 형태 입력과 함께.
	      input = input.split("\n");
      var n = input[0];
// 읽기 준비한다 현재사람의 읽기 각 값마다직접.
tmp1=input[1].split(" ");
		tmp2=input[2].split(" ");
	     tmp3=input[3].split(" ");
    a=new Array (n ) .fill (0 );
b = new Array (n).fill (0); 
   c = new Array(n).fill(0);
      for(i=0;i<n;i++){
         a[i]=parseInt(tmp1[i]);
		}
   for(i=0;i<n;i++){ 
b [i]=parseInt (tmp2 [ i] );   
 }  
for(i  =0;  i <n;  i++) {
// 핵심프로그램 형태 지금유지한다.
c [i ] = parseInt ( tmp3[i]);
} 
    var ans=0;
for(i = 0; i  < n; i++) {
      for (j  = 0;  j< n;j++) {     
		if(a[i]<b[j]){    
for(k=0;k<n;k++){
            if ( b [j]  < c[k]) {
            ans++;
            }     
		}
// 읽기 여기서정리한다 현재처리 경로 출력 전에명확.
	}
}  // 읽기 지금유지한다 핵심처리 경로.
// 읽기 지금유지한다 최종계산된 정보 입력과 함께안정.
   }
console.log('%s', ans);
}     
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
