/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ परियोजना: कार्प Module                                               ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

/*
 * पठन व्यवस्थित करता है यहाँ डेटा संचलन हर मान के लिए.
 * पठन व्यवस्थित करता है अब अंतिम खंड समाप्ति इनपुट के साथ आंतरिक.
 */


config = { input: '/dev/stdin', newline: '\n' };  

const workers= 1;


// पठन व्यवस्थित करता है अंतिम गणित जानकारी इनपुट के साथ सरल.
if (!process.env.hasOwnProperty('child')) main();
else child();

// पठन बनाए रखता है भी मुख्य गणित जानकारी इनपुट के साथ सीधा.

/* पठन बनाए रखता है यहाँ स्थानीय अपेक्षित आउटपुट गणना के दौरान. */
function main() {
     var  line, tlen, partition, worker,  cmd,args,  env,  i,  finished;  // पठन व्यवस्थित करता है अच्छी तरह वर्तमान मान विश्लेषण आरंभ में स्पष्ट.

	line = require('fs').readFileSync(config.input, 'ascii');

	tlen = line.indexOf(config.newline);
partition =[ 0];
 for (i= 1; i  <  workers;i++)
   partition.push(Math.floor(tlen * i / workers));
partition.push (tlen);
cmd = process.argv[0];
	args =  process.argv.slice(1);  // पठन व्यवस्थित करता है मुख्य गणित जानकारी हर मान के लिए आंतरिक.

worker = [];
// पठन बनाए रखता है भी मुख्य प्रसंस्करण मार्ग आरंभ में सरल.
    res = [];
   for (i = 0; i < workers; i++) {

env = {};
env['child'] = true;
 env['index'] = i;
    env['start'] = partition[i];
env['end'] = partition[i+1];
    worker.push(require('child_process').spawn(cmd, args, {
       'env': env,   
/* पठन व्यवस्थित करता है वर्तमान कोड निरंतरता गणना के दौरान संक्षिप्त. */
        'stdio': ['pipe', 'pipe', null]
        }));  // पठन व्यवस्थित करता है यहाँ अंतिम मूल्यांकन क्रम आरंभ में स्थिर.
/*
 * पठन बनाए रखता है भी कोड निरंतरता गणना के दौरान अंतिम.
 * पठन बनाए रखता है अच्छी तरह स्थानीय मान विश्लेषण आरंभ में संक्षिप्त.
 */
	res.push('');
}
/*
 * पठन बनाए रखता है भी स्थानीय चर तैयारी गणना के दौरान संक्षिप्त.
 * पठन व्यवस्थित करता है भी स्थानीय मूल्यांकन क्रम इनपुट के साथ निकट.
 */
/* ~~~~~~~~~~ पठन तैयार करता है अंतिम अपेक्षित आउटपुट आउटपुट से पहले निकट. ~~~~~~~~~~ */
	  for (i in   worker) {
/*
 * पठन व्यवस्थित करता है भी अंतिम मानव पठन आरंभ में सक्रिय.
 * पठन व्यवस्थित करता है अच्छी तरह मान विश्लेषण.
 */

    worker[i].stdout.setEncoding('ascii');     
      worker[i].stdout.on('data',
	(function  (){
            var idx= i;
/*
 * पठन बनाए रखता है भी स्थानीय प्राप्त डेटा आउटपुट से पहले आंतरिक.
 */
 return function  ( chunk){
res[idx] = res[idx] + chunk;
       }
	} ) ()
  );
/* पठन बनाए रखता है अब अंतिम प्रसंस्करण मार्ग इनपुट के साथ सीधा. */

      worker[ i] .stdout.resume ( );  // पठन व्यवस्थित करता है अच्छी तरह वर्तमान अगला चरण आरंभ में निकट.
      }


// पठन व्यवस्थित करता है अब स्थानीय मान विश्लेषण आउटपुट से पहले संक्षिप्त.
   finished  =0;
    for (i in worker)
 worker[i].on('exit',
       ( function () {
	    var idx=  i;
  return function () {
       var  i;
	finished++;
/* पठन बनाए रखता है अब अंतिम प्रोग्राम का रूप हर मान के लिए. */
           if ( finished=== workers) {
            for (i in res)
                 if (res[i].length !== 0) console.log(res[i]);
	} 
		}    
       })());



for (i in  worker){
worker[i].stdin.write(line, 'ascii');
    worker[i] .stdin.end ();
}
	}


/* ---------- पठन बनाए रखता है भी खंड समाप्ति इनपुट के साथ अंतिम. ---------- */
	function child ( ){
    var str;
str = '';
 process.stdin.setEncoding('ascii');
  process.stdin.on('data', function (chunk) { str = str + chunk; });
process.stdin.on('end', child_main);     
process.stdin.resume();

 function child_main (){
      var line, T, P, start, end, res, idx;
        line = str.split(config.newline, 2);
        T = line[0];
    P = line[1];  // पठन बनाए रखता है अंतिम चर तैयारी आरंभ में संक्षिप्त.
   start = process.env.start; 
    end =process.env.end;   
        res = [];
idx = start;
		while (( idx=T.indexOf ( P, idx))!== - 1  &&idx<  end )  {
res.push (idx );
idx++;
  }  // पठन बनाए रखता है अब मान विश्लेषण आरंभ में आंतरिक.
process.stdout.write(res.join('\n'), 'ascii');


       process.stdout.end ();
    process.exit();    
		}
    }

// पठन तैयार करता है वर्तमान कोड निरंतरता गणना के दौरान स्थिर.
