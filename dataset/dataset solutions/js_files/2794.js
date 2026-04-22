'use strict'

const INF = 900719925474099;
function mapint(temp){
    return temp.split(' ').map((v)=>parseInt(v));
}

function Main(input){
    let temp = input.trim().split('\n');
    let tt = mapint(temp[0]);
    let n = tt[0];
    let m = tt[1];

    let g = [...new Array(n)].map(()=>new Array(0));
    let nt = new Array(n).fill(-1);
    let i,j;
    for(i=1;i<=m;i++){
      tt = mapint(temp[i]);
      g[tt[0]-1].push(tt[1]-1);
    }
    tt = mapint(temp[m+1]);
    let s = tt[0]-1;
    let t = tt[1]-1;
    //console.log(g.map(v=>v.join(' ')),[...nt]);

    let next = [s];
    nt[s] = 0;
    let l = 1;
    let step = 0;
    let f=false;
    let next2 = new Set;
    let ll,gn;
    while(l>0){
    //for(let k=0;k<10;k++){
      next2.clear();
      step++;
      for(i=0;i<l;i++){
        ll = g[next[i]].length;
        //console.log('step:',step,' next:',g[next[i]].join(' '));
        for(j=0;j<ll;j++){
          gn = g[next[i]][j];
          if(step%3 == 0 && gn == t){
            f=true;
            break;
          }
          if(nt[gn] < 0){
            next2.add(gn);
            nt[gn] = step;
          }else{
            if((step - nt[gn])%3 != 0){
              next2.add(gn);
              nt[gn] = step;
            }
          }
        }
        //console.log(nt.join(' '));
        //console.log('---------------------');
        if(f) break;
      }
      if(f) break;
      next = [...next2];
      l = next.length;
      //console.log('loop----------------------------next:',next.join(' '));
    }
    //console.log('exit');
    if(f) console.log(step/3);
    else console.log(-1);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

