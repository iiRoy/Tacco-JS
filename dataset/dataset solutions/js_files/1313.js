const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const arr = [...input];
let str ='';
let obj = {
  a: 0,
  b: 0,
  c: 0,
  d: 0,
  e: 0,
  f: 0,
  g: 0,
  h: 0,
  i: 0,
  j: 0,
  k: 0,
  l: 0,
  m: 0,
  n: 0,
  o: 0,
  p: 0,
  q: 0,
  r: 0,
  s: 0,
  t: 0,
  u: 0,
  v: 0,
  w: 0,
  x: 0,
  y: 0,
  z: 0,
}
for(let i = 0; i < arr.length; i++){
  if((/[^A-Z,a-z]/).test(arr[i])) continue;
  if(/[Aa]/.test(arr[i])) obj.a++;
  if(/[Bb]/.test(arr[i])) obj.b++;
  if(/[Cc]/.test(arr[i])) obj.c++;
  if(/[Dd]/.test(arr[i])) obj.d++;
  if(/[Ee]/.test(arr[i])) obj.e++;
  if(/[Ff]/.test(arr[i])) obj.f++;
  if(/[Gg]/.test(arr[i])) obj.g++;
  if(/[Hh]/.test(arr[i])) obj.h++;
  if(/[Ii]/.test(arr[i])) obj.i++;
  if(/[Jj]/.test(arr[i])) obj.j++;
  if(/[Kk]/.test(arr[i])) obj.k++;
  if(/[Ll]/.test(arr[i])) obj.l++;
  if(/[Mm]/.test(arr[i])) obj.m++;
  if(/[Nn]/.test(arr[i])) obj.n++;
  if(/[Oo]/.test(arr[i])) obj.o++;
  if(/[Pp]/.test(arr[i])) obj.p++;
  if(/[Qq]/.test(arr[i])) obj.q++;
  if(/[Rr]/.test(arr[i])) obj.r++;
  if(/[Ss]/.test(arr[i])) obj.s++;
  if(/[Tt]/.test(arr[i])) obj.t++;
  if(/[Uu]/.test(arr[i])) obj.u++;
  if(/[Vv]/.test(arr[i])) obj.v++;
  if(/[Ww]/.test(arr[i])) obj.w++;
  if(/[Xx]/.test(arr[i])) obj.x++;
  if(/[Yy]/.test(arr[i])) obj.y++;
  if(/[Zz]/.test(arr[i])) obj.z++;
}
Object.keys(obj).forEach(key => {
  str += key + ' : ' + obj[key] + '\n';
})
console.log(str.trim());
