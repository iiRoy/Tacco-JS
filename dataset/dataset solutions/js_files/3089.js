"use strict";
function I(s,f){this._s=s.split("\n");this._c=0;this._l=0;this._f=f||Number}I.prototype.a=function(){var l=this._s[this._l];if(!l)return;var t=l.trim().split(" ");var a=t[this._c];this._c++;if(t.length===this._c){this._c=0;this._l++}return this._f(a)};I.prototype.l=function(){var l=this._s[this._l];if(!l)return;this._c=0;this._l++;return l.split(" ").map(this._f)};

function main(input) {
  const o = new I(input);

  const N = o.a();
  const X = o.a();
  
  const S = [];
  for(let i = 0; i<N; i++) {
    S.push(o.a());
  }

  S.sort((a,b) => a - b);

  const fac = [1, 1];
  for(let i = 2; i<=N; i++) {
    fac[i] = fac[i - 1] * i % 1000000007;
  }

  // console.log(sum);
  // console.log({S, fac})

  console.log(calc(X,"0".repeat(N)));

  function calc(cur, mark) {
    // console.log({cur, mark})
    if (cur < S[0]) {
      return cur * fac[mark.split("").filter(x => x==="0").length];
    }

    let index = 0;
    while(S[index] < cur) {
      index ++;
    }

    let result = 0;
    for ( let i = 0; i < index; i++ ) {
      if (mark[i] !== "1") {
        let newmark = mark.split("");
        newmark[i] = "1";
        newmark = newmark.join("");
        result += calc(cur % S[i], newmark);
        result = result % 1000000007;
      }
    }
    return result;
  }
}


main(require("fs").readFileSync("/dev/stdin", "utf8"));
