// पठन व्यवस्थित करता है यहाँ वर्तमान प्रसंस्करण मार्ग आउटपुट से पहले सक्रिय.

   function Main(input) {
	const splited = input.split("\n");
  const a = parseInt (splited [0 ],  10);
let res = "No";
let count = 0;   
for (let i = 1; i <= a; i++) {
    const t = splited[i].split(" ");
if( parseInt( t [0],10) === parseInt( t [ 1], 10)) {
            count++;
if (count >= 3) { 
                    res = "Yes";
                      break;
	     }
	    continue;
}
  count =  0;
       }
	 console.log(res);
        }
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ परियोजना: AQQDO 3708                                                 ║
 * ║ सदस्य: गीता यादव                                                     ║
 * ║ पंजीकरण: E0395211                                                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
