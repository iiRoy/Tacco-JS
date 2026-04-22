'use strict';
(function(stdin) {
  var lines  = stdin.toString();
  var result = (function(data) {

    var hashmap = data.filter(function(v) {
        return /[A-Za-z]/.test(v);
    })
    .map(function(v) {
      return v.toLowerCase();
    })
    .reduce(function(map,key) {
      map[key]++;
      return map;
    },{a:0,b:0,c:0,d:0,e:0,f:0,g:0,h:0,i:0,j:0
      ,k:0,l:0,m:0,n:0,o:0,p:0,q:0,r:0,s:0,t:0
      ,u:0,v:0,w:0,x:0,y:0,z:0}
    );

    var keys = Object.keys(hashmap);
    return keys.map(function(key) {
      return key + ' : ' + hashmap[key];
    }).join('\n');

  }(lines.split('')
  ));
  console.log(result);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));