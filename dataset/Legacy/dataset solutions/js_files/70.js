process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', ondata);
function ondata(data) {
  data.split('\n').forEach(decrypt);
}
function decrypt(str, i) {
  str = String(str).replace(/[a-z]/g, function(c) {
    return String.fromCharCode(0x61 + (c.charCodeAt(0) - 0x61 + 1) % 26);
  });
  if (/the|this|that/.test(str)) {
    process.stdout.write(str + '\n');
  }
  i |= 0;
  if (i < 26) {
    decrypt(str, ++i);
  }
}