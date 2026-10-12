fs = require('fs');
input = fs.readFileSync('/dev/stdin','utf-8');
tmp1 = input.split('\n');
T = tmp1[0];
for(i = 1;i <= T; i++) {
  tmp2 = tmp1[i].split(' ')
  N = parseInt(tmp2[0],10);
  A = parseInt(tmp2[1],10);
  B = parseInt(tmp2[2],10);
  C = parseInt(tmp2[3],10);
  D = parseInt(tmp2[4],10);
  R = 0;
  ab(N,0);
  console.log(R);
}
function ab(n,coin) {
  if(n >= 2) {
    P1 = n % 2; P2 = (n - P1) / 2;
    if(P1 == 0 || P2 == 1) {
      tc = coin + A * P2 + D * P1;
      if(R == 0 || R > tc) { R = tc; };
    } else {
      ab(P2,coin + A + D * P1);
      P2 = P2 + 1; P1 = n - P2 * 2;
      if(P1 == 0) {
        tc = coin + A * P2 + D; P2 = 1;
        if(R == 0 || R > tc) R = tc;
      } else ab(P2,coin + A + D * P1);
    }
  }

  if(n >= 3) {
    P1 = n % 3; P2 = (n - P1) / 3;
    if(P1 == 0 || P2 == 1) {
      tc = coin + B * P2 + D * P1;
      if(R == 0 || R > tc) { R = tc; };
    } else {
      ab(P2,coin + B + D * P1);
      P2 = P2 + 1; P1 = n - P2 * 3;
      if(P1 == 0) {
        tc = coin + B * P2 + D;
        if(R == 0 || R > tc) R = tc;
      } else ab(P2,coin + B + D * P1);
    }
  }
/*
  if(n >= 5) {
    P1 = n % 5; P2 = (n - P1) / 5;
    if(P1 == 0 || P2 == 1) {
      tc = coin + C * P2 + D * P1;
      if(R == 0 || R > tc) { R = tc; };
    } else {
      ab(P2,coin + C + D * P1);
      P2 = P2 + 1; P1 = n - P2 * 5;
      if(P1 == 0) {
        tc = coin + C * P2 + D;
        if(R == 0 || R > tc) R = tc;
      } else ab(P2,coin + C + D * P1);
    }
  }
*/

}