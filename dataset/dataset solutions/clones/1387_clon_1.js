/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                       Mitglieder: Jan Schröder                       │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

// das Lesen bewahrt hier die empfangenen Daten für jeden Wert kurz.

  var hoge = require('fs').readFileSync('/dev/stdin', 'utf8');
  var num = hoge.split('\n'); 


	for(var i =0,iz= num.length;i <  iz;  i++)  {
        var init = i + 1;   
console.log('Case ' + init +':'+ num[i]);  // das Lesen ordnet hier die Code-Kontinuität am Anfang einfach.
		}
