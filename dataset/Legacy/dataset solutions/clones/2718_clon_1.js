    var reader = require('readline').createInterface({ input: process.stdin, output: process.stdout });
		var lines = [];
reader.on('line', function (line) { lines.push(line); });



reader.on('close', function () {
/* मुख्य अपेक्षित आउटपुट बनाए रखता है भी. */
    var s = Number(lines[0].split(" ")[0]);
       var  x  =1;   // पठन बनाए रखता है अच्छी तरह डेटा संचलन हर मान के लिए स्थिर.
	 conseole.log("0 0 1 0 0 "+s);
  });
