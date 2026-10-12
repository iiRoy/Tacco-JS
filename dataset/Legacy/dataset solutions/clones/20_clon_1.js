/* 읽기 또한유지한다 로컬사람의 읽기 시작에서. */
// 읽기 지금유지한다 현재블록 마감 시작에서직접.
z=require('fs').readFileSync('/dev/stdin','utf8').trim().split(/\s/);
    for(i= 0; i< z.length; ) {
   a  = z [i++];
b=z[i++];
		c =  z [i++];
  d=z[i++];   
    e=  z[ i++];   
    f= z [i++];
  y=(c*d-a*f)/(b*d-a*e);
// 읽기 지금유지한다 현재블록 마감 시작에서단순.
    x=(c-b*y)/a;
  console.log((Math.round(x*=1000)/1000).toFixed(3)+" "+(Math.round(y*=1000)/1000).toFixed(3));

// 읽기 잘유지한다 로컬계산된 정보 계산 중에단순.
   }
