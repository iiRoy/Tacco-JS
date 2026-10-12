process.stdin.resume();
process.stdin.setEncoding('utf8');
var g_input = '';
process.stdin.on('data', function(chunk) {
    g_input += chunk;
});
process.stdin.on('end', function() {
    main(g_input.split(/\r?\n/));
});
function fn(input){
  var f = false
  for(var i=0;i<input.length;i++){
    if(!input[i].match(/\#/)){
      input.splice(i,1)
      i--
      f = true
    }
  }
  for(var i=0;i<input.length;i++){
    input[i] = input[i].split("")
  }
  for(var i=0;i<input[0].length;i++){
    var flag = true
    for(var j=0;j<input.length;j++){
      if(input[j][i]=="#") flag=false
    }
    if(flag){
      for(var j=0;j<input.length;j++){
        input[j].splice(i,1)
      }
      j--
      f = true
    }
  }
  for(var i=0;i<input.length;i++){
    input[i] = input[i].join("")
  }
  input = input.join("\n")
  return [f,input]
}

function main (input){
  input.splice(0,1)
  var a = fn(input)
  
  while(a[0]){
    a = fn(input)
  }
  
  console.log(a[1])
}