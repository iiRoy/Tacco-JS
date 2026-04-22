"use strict";
function I(s,f){this._s=s.split("\n");this._c=0;this._l=0;this._f=f||Number}I.prototype.a=function(){var l=this._s[this._l];if(!l)return;var t=l.trim().split(" ");var a=t[this._c];this._c++;if(t.length===this._c){this._c=0;this._l++}return this._f(a)};I.prototype.l=function(){var l=this._s[this._l];if(!l)return;this._c=0;this._l++;return l.split(" ").map(this._f)};
function buildArray(r,t){let l=t||0;for(let t=r.length;t>0;t--){const n=r[t-1];l=Array(n).fill().map(()=>JSON.parse(JSON.stringify(l)))}return l}

function Perm(m, n) {
  let r = 1;
  for (let i = m + 1; i <= n; i++) {
    r *= i;
  }

  return r;
}

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

  const cache = buildArray([N + 1, X + 1], -1);
  function calc(k, x) {
    if (cache[k][x] !== -1) return cache[k][x];
    if (x < S[0]) {
      cache[k][x] = (x * fac[k]) % 1000000007;
    } else {
      let sum = 0;

      let i = 0;
      while (S[i] <= x && i < N) {
        sum += calc(k-1, x % S[i]);
        i += 1;
      }

      cache[k][x] = (sum * Perm(i, k)) % 1000000007;
    }

    return cache[k][x];
  }

  console.log(calc(N, X));
}


main(require("fs").readFileSync("/dev/stdin", "utf8"));
