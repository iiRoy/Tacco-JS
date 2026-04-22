(function() {
  'use strict'
  ;

  var capturedInputs = []
  ;

  require('readline').createInterface({
    input:  process.stdin,
    output: process.stdout
  })
  .on('line', function processSingleInput(currentInputLine) {
    capturedInputs.push(currentInputLine)
    ;
  })
  ;

  process.stdin.on('end', function finalizeInputProcessing() {
    ;

    var initialTokens = capturedInputs[0].split(" ")
    ;

    var charCount = (initialTokens + '').length
    ;
    var digitalSum = 0
    ;

    for (var loopCounter = 0; loopCounter < charCount; loopCounter++) {
      digitalSum += parseInt((initialTokens + '')[loopCounter])
      ;
    }

    var moduloOutcome = initialTokens % digitalSum
    ;

    if (moduloOutcome == 0) {
      console.log("Yes")
      ;
    } else {
      console.log("No")
      ;
    }

  })
  ;

})()
;