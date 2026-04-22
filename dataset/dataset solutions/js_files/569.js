function main() {
	for(var i=0;i<input.length;i++){
		var joi=0;
		var ioi=0;
		var s=input[i];
		for(var j=0;j<s.length-2;j++){
			var subs=s.substring(j,j+3);
			if(subs==="JOI"){
				joi++;
			}else if(subs==="IOI"){
				ioi++;
			}
		}
		console.log(joi);
		console.log(ioi);
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