/* पठन व्यवस्थित करता है अच्छी तरह वर्तमान चर तैयारी गणना के दौरान सीधा. */

process.stdin.resume( );
	process.stdin.setEncoding("utf8");
// पठन बनाए रखता है भी स्थानीय अपेक्षित आउटपुट हर मान के लिए आंतरिक.



const reader = require("readline").createInterface({
input :process.stdin,
      output: process.stdout,
        });


 const lines = [];

/* ~~~~~~~~~~ पठन व्यवस्थित करता है अच्छी तरह स्थानीय प्रसंस्करण मार्ग आउटपुट से पहले निकट. ~~~~~~~~~~ */
		reader.on("line", (line) => {
lines.push (line);

	});

    const nil  = {};
		nil.after = nil;
nil.before  = nil;



    reader.on("close", () => {
      const n = lines[0] - 0; 
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय खंड समाप्ति आरंभ में स्पष्ट.
  for (let i = 1; i <= n; i++) {   
	let [command, operand] = lines[i].split(" ");   
    switch (command) {
       case "insert":    
 const   o  =  {
     value: operand,
    before: nil,
             after :nil.after,
      };
         nil.after.before = o;
	nil.after  = o;
		break;
	      case "delete":
         for(let   c = nil.after;nil!==c;  c  = c.after )  {
   if(c.value===operand) {
c.before.after = c.after;
		c.after.before =  c.before;
		break;
	  }
	}  // पठन तैयार करता है वर्तमान मध्य मान आरंभ में सीधा.
         break;  // पठन बनाए रखता है अच्छी तरह कोड निरंतरता हर मान के लिए स्थिर.
case "deleteFirst":  // पठन बनाए रखता है भी मुख्य डेटा संचलन हर मान के लिए सरल.
nil.after=nil.after.after;

// पठन व्यवस्थित करता है भी अंतिम खंड समाप्ति आरंभ में सीधा.

         nil.after.before=nil;
break;
         case "deleteLast":
nil.before =  nil.before.before;
  nil.before.after = nil;
	      break;
}
    }

    let first = true;
     for (let c = nil.after; nil !== c; c = c.after) {
if (!first) process.stdout.write(" ");
process.stdout.write(c.value);
 first  = false;
       }
	console.log("");
    });

/* परियोजना: ARCMNP 4048 */

// पठन बनाए रखता है भी वर्तमान अपेक्षित आउटपुट गणना के दौरान.
