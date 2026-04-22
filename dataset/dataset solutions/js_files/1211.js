(function(stdin) {
  // Define Function
  function Time(sec) {
    const ONE_HOUR_PAR_SECOND   = 60 * 60;
    const ONE_MINUTE_PAR_SECOND = 60;
    return {
      getHour  :function() {
        return Math.floor(sec / (ONE_HOUR_PAR_SECOND));
      },
      getMinute: function() {
        return Math.floor((sec % (ONE_HOUR_PAR_SECOND) / ONE_MINUTE_PAR_SECOND));
      },
      getSecond: function() {
        return sec % ONE_MINUTE_PAR_SECOND;
      },
      toString: function(separator) {
        let sep = separator || ':';
        return [
          this.getHour(), this.getMinute(), this.getSecond()
        ].join(sep);
      }
    };
  }
  // Declare Variable
  const inputs  = stdin.toString().trim().split('\n');

  // Main Procedure
  const result = (function(S) {
    const time = new Time(S);
    return time.toString();

  }(parseInt(inputs[0], 10)));

  // Display
  console.log(result);

}(require('fs').readFileSync('/dev/stdin', 'utf8')));