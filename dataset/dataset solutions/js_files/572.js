function main() {
	for(var i=0;i<input.length;i++){
		var ans={JOI:0,IOI:0};
		var s=input[i];
		for(var j=0;j<s.length-2;j++){
			var subs=s.substring(j,j+3);
			ans[subs]++;
		}
		console.log(ans.JOI);
		console.log(ans.IOI);
	}
}

var
input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main();
});