console.log((args=>{
  const [s,t] = args.trim().split`\n`;
  const c = Array.from({length:26},_=>[]);
  const sl = s.length, tl = t.length;
  for ( let i = 0; i < sl; i++ ) c[s.charCodeAt(i)-97].push(i);
  for ( let i = 0; i < sl; i++ ) c[s.charCodeAt(i)-97].push(i+sl);
  const o = Array(26).fill(0);
  let i = -1, cyc = 0;
  for ( let j = 0; j < tl; j++ ) {
    const x = t.charCodeAt(j)-97;
    const l = c[x].length;
    if (!l) return '-1';
    for (; o[x] < l; o[x]++ ) if ( i < c[x][o[x]] ) break;
    i = c[x][o[x]];
    if ( i >= sl ) {
      cyc++;
      i -= sl;
      o.fill(0);
    }
  }
  return `${cyc * sl + i+1}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
