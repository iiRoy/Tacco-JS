process.stdin.resume();
process.stdin.setEncoding('utf8');

var g_input = '';
process.stdin.on('data', function(chunk) {
    g_input += chunk;
});
process.stdin.on('end', function() {
    main(g_input.split(/\r?\n/));
});
function main(input){
  input = input + ""
  input = input.match(/2/g)
  if(input === null) input = []
  console.log(input)
  console.log(input.length)
}