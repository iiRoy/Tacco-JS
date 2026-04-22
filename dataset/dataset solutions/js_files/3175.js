function calc_mp(depth,N,ABC,abc,ls){
  if(depth==N){
    if(Math.min(...abc)>0){
      const mp = Math.abs(ABC[0]-abc[0])+Math.abs(ABC[1]-abc[1])+Math.abs(ABC[2]-abc[2]) -30;
      return mp;
    }else{
      const m = 1000*1000;
      return m*m*m;
    }
  }

  const ret0 = calc_mp(depth+1, N, ABC, abc, ls);
  var ret1 = calc_mp(depth+1, N, ABC, [abc[0]+ls[depth], abc[1], abc[2]], ls)+10;
  var ret2 = calc_mp(depth+1, N, ABC, [abc[0], abc[1]+ls[depth], abc[2]], ls)+10;
  var ret3 = calc_mp(depth+1, N, ABC, [abc[0], abc[1], abc[2]+ls[depth]], ls)+10;

  return Math.min(ret0, ret1, ret2, ret3);
}

function main(input){
  const lines = input.split('\n');
  const N = lines[0].split(' ').map(x => parseInt(x))[0];
  const A = lines[0].split(' ').map(x => parseInt(x))[1];
  const B = lines[0].split(' ').map(x => parseInt(x))[2];
  const C = lines[0].split(' ').map(x => parseInt(x))[3];
  var Ls = lines.map(x => parseInt(x));
  Ls.shift();


  const result = calc_mp(0,N,[A,B,C],[0,0,0],Ls);
  console.log(result);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));