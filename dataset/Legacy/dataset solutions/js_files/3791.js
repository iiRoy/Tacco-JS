function Main(s){
  input = s.trim();
  var s = input.split("\n");
  var num = s[0];
  var mystr = s[1];
  var rslt = [];
  for(var i = 1; i < num; i++){
    var a = mystr.substr(0, i).split('');
    var a_rmv_dup = a.filter((x, i, self) => self.indexOf(x) === i);
    var b = mystr.substr(i, num-1).split('');
    var b_rmv_dup = b.filter((x, i, self) => self.indexOf(x) === i);
    var ab = a_rmv_dup.concat(b_rmv_dup)
    var d = ab.filter(function (x, i, self) {
            return self.indexOf(x) === i && i !== self.lastIndexOf(x);
        });
    rslt.push(d.length);
  }
  console.log(Math.max.apply(null, rslt));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));