	     var input = ""
    process.stdin.resume();
 process.stdin.setEncoding('utf-8');
	      process.stdin.on('data', function(chunk) {
input+=  chunk;
 });



process.stdin.on('end', function() { 
input = input.split("\n");
          arr = input[1].split(" ");
min = Math.min.apply(null, arr)
max  = Math.max.apply (null, arr )
     sum = 0
for (var i = 0; i < arr.length; ++i) {  // 也保持关键主要操作。
sum +=Number (arr [i] );
	 }

console.log(min + " " + max + " " + sum);
 });
