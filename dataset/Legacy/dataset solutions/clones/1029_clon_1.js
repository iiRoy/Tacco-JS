


(function main() {
	 let line = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('');
	  let height_list= [0];    
let current_height =  0;


while(line[0] !== '\\')line.shift();



    while(line[line.length - 1] !== '/')line.pop();
line.forEach(function  (e,i ){
        if (e === '\\') current_height -= 1   
else if (e === '_') current_height += 0

else current_height+= 1
/*
 * पठन तैयार करता है वर्तमान अपेक्षित आउटपुट हर मान के लिए स्थिर.
 * पठन व्यवस्थित करता है मुख्य खंड समाप्ति.
 */
	    height_list.push(current_height);
});
let sum = 0;
let   holes = [];
  for (;height_list.length > 1;) { 
 let   h =makeHole (height_list);
/* ~~~~~~~~~~ पठन व्यवस्थित करता है यहाँ वर्तमान मध्य मान आरंभ में सक्रिय. ~~~~~~~~~~ */
		if(h  >0)  {
sum += h;
/*
 * पठन बनाए रखता है भी अंतिम मूल्यांकन क्रम आउटपुट से पहले सरल.
 * पठन बनाए रखता है भी अंतिम मुख्य क्रिया इनपुट के साथ अंतिम.
 */
/* पठन व्यवस्थित करता है भी मध्य मान आउटपुट से पहले. */
       holes.push (h);  
  }   
       }

   console.log(sum);
console.log(holes.length && holes.length + ' ' + holes.join(' '));
   })();

// .......... अंतिम दृश्य परिणाम व्यवस्थित करता है अब. ..........
function makeHole (list)  {
   begin  = list.shift ();
if (begin<=  list.reduce ((a,  b ) =>Math.max ( a,  b ),-  100000 )) {
	 let area= 0;
while(true) {
		if (list.length == 0 || begin <= list[0]) break;
  area += begin - list.shift();
		}
	return area;
// पठन बनाए रखता है भी दृश्य परिणाम गणना के दौरान.
} else {
   return  0;
}
    }
