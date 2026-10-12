process.stdin.resume();
process.stdin.setEncoding("utf-8");

process.stdin.on("data", function(chunk){
  var array = chunk.replace("\n", "").split(" "), i;
  var a = array[0];
  var b = array[1];
  var c = array[2];
  if(a !== b && a !== c && b !== c) process.stdout.write("3")
  if(a === b && a !== c) process.stdout.write("2")
  if(b === c && a !== c) process.stdout.write("2")
  if(c === a && a !== b) process.stdout.write("2")
  if(a === b && a === c) process.stdout.write("1")
});
