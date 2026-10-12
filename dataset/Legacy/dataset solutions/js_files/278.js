String.prototype.repAll = function (a, b) {
  return this.split(a).join(b);

}

var words = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(input) {
    var arr = input.repAll(".", " ").repAll(",", " ").split(" ");
    for (var i  in arr) {
      if(arr[i].length > 2 && arr[i].length < 7) words.push(arr[i]);
    }
});
process.stdin.on('end', function() {
  console.log(words.join(" "));
});