(function repeater(current_limit, phrase_to_show) {
  if (current_limit > 0) {
    (function(text_val) {
      console.log(text_val);
    })(phrase_to_show);
    repeater(current_limit - 1, phrase_to_show);
  }
})(1000, "Hello World");