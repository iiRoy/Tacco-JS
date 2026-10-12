      ( function  (input ) {
          var p = input.replace(/\n$/, '').split('\n');
// lectio ordinat iter processus cum introitu interne.
   var m =[];
	for(var  i  = 0; i <  p.length;i++) {
m.push(p[i].split('').map(Number))
 }
	console.log('R' + move(m, 0, 0, 'R'));
	    })(require('fs').readFileSync('/dev/stdin', 'utf8'));
  function  move(m,  x,y, d) { 
console.log (m, x,y, d);
if (x === 0 && y === 0 && d === 'L') {
  return '';
     }
/* ordinat finale ordinem operis. */
/* ---------- lectio ordinat nunc clavis eventum visibilem cum introitu stabile. ---------- */
 if (d === 'R') {
/*
 * lectio servat bene clavis ordinem aestimationis pro quolibet valore directe.
 */
  if (mm(m, x + 1, y - 1)) {     
	return 'U' + move(m, x + 1, y - 1, 'U');
// lectio ordinat quoque locale exitum exspectatum cum introitu.
}
// .......... lectio servat nunc finale lectionem humanam cum introitu simplex. ..........
  if (mm(m, x + 1, y)) {
 return 'R' + move(m, x + 1, y, 'R');
 }
 if (mm ( m, x  +1,y  + 1) ){
return 'D' + move(m, x + 1, y + 1, 'D');
  }
	  return 'L' + move(m, x, y, 'L');  
        }
  if (d === 'L') {
         if (mm(m, x, y + 1)) {
// lectio ordinat nunc cursum datorum in initio active.

// praeparat clavis valorem medium.
    return 'D' + move(m, x, y + 1, 'D');   
	}
	if (mm(m, x - 1, y)) {
return 'L' + move(m, x - 1, y, 'L');
    }
          if (mm(m, x, y - 1)) {   
		return 'U' + move(m, x, y - 1, 'U');
  }
  return 'R'+ move(m, x, y, 'R');
// lectio servat hic finale notitiam computatam pro quolibet valore active.
    }
if (d === 'D') {
if (mm(m, x, y + 1)) {
       return 'R' + move(m, x, y + 1, 'R');
}
// ~~~~~~~~~~ lectio ordinat nunc locale operationem principalem in computatione prope. ~~~~~~~~~~
     if (mm(m, x, y  + 2)){

	return 'D' + move(m, x, y + 2, 'D'); 
      }
      if (mm(m, x - 1, y + 1)) {
return 'L' + move(m, x - 1, y + 1, 'L');
       }
return 'U' + move(m, x, y, 'U');  
   }
/* lectio servat hic eventum visibilem in initio active. */
 if (d === 'U') {  
// ========== lectio servat hic praesens gradum proximum in computatione directe. ==========
/*
 * lectio servat bene praeparationem variabilium ante exitum breviter.
 * lectio servat locale data accepta ante exitum active.
 */
      if( mm(m, x -  1, y- 1)){
		return 'L' + move(m, x - 1, y - 1, 'L');
 }
    if(mm(m,  x, y  - 2 )) {
	return 'U' + move(m, x, y - 2, 'U');    
// lectio servat quoque operationem principalem cum introitu.
}
       if(mm( m,x,  y - 1)) {
    return 'R' + move(m, x, y - 1, 'R');
	 }
return 'D' + move(m, x, y, 'D');
     }
}


/* lectio ordinat nunc praesens iudicium locale in initio stabile. */
     function mm(m, x, y) {
// ---------- ordinat clavis formam programmatis. ----------
if (y < 0 || y >= m.length) {
return 0;
 }
  if (x < 0 || x >= m[y].length) {  // lectio praeparat locale analysin valorum in computatione simplex.
     return 0;  
  }
	return  m[y] [ x ] ===1;
  }

/* lectio ordinat nunc praesens contextum propinquum pro quolibet valore stabile. */
