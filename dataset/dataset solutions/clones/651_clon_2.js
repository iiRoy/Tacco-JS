var   sourceData   =   require('fs').readFileSync('/dev/stdin',    'utf8') ;

var   [dailyGain,    bonusGain,    requiredTotal]   =   sourceData
    .trim()
    .split(" ")
    .map(Number);

var   elapsedDays   =   0;
var   dayInWeek   =   0;
var   currentEarnings   =   0;

while   (   true   )   {
    if   (   requiredTotal   <=   currentEarnings   )
        break   ;

    elapsedDays++;
    dayInWeek++;

    currentEarnings   +=   dailyGain;

    if   (   dayInWeek   ==   7   )   {
        currentEarnings   +=   bonusGain;
        dayInWeek   =   0;
    }
}

console.log(elapsedDays);