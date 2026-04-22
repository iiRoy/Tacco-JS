let   fileSystemModule   =   require   (   'fs'   );
const   rawData   =   fileSystemModule.readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;
const   lineSegments   =   rawData.trim   ()   .split   (   "\n"   )   ;
while   (   true   )   {
    let   currentScenarioItemCount   =   Number   (   lineSegments.shift   ()   )   ;
    if   (   currentScenarioItemCount   ===   0   )   {
        break   ;
    }
    const   scenarioProfitValues   =   lineSegments.shift   ()   .split   (   " "   )   .map   (   Number   )   ;
    const   scenarioBonusAdjustments   =   lineSegments.shift   ()   .split   (   " "   )   .map   (   Number   )   ;
    const   totalInitialProfit   =   scenarioProfitValues.reduce   (   (   accumulator   ,   currentValue   )   =>   accumulator   +   currentValue   )   ;
    scenarioBonusAdjustments.sort   (   (   valA   ,   valB   )   =>   valB   -   valA   )   ;
    let   maximumAchievableScore   =   totalInitialProfit   *   currentScenarioItemCount   ;
    while   (   true   )   {
        if   (   scenarioBonusAdjustments.length   ===   0   )   {
            break   ;
        }
        currentScenarioItemCount--   ;
        maximumAchievableScore   =   Math.max   (   maximumAchievableScore   ,   (   totalInitialProfit   +   scenarioBonusAdjustments.shift   ()   )   *   currentScenarioItemCount   )   ;
    }
    console.log   (   maximumAchievableScore   )   ;
}