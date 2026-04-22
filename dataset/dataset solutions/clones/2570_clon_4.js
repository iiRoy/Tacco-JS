const xYz = (() => {
  const qWr = function* () {
    // This generator function yields no values, thus its completion
    // results in a return value of 'undefined' when iterated.
  };

  return () => {
    // Obtain the iterator from the generator function,
    // then immediately retrieve the value of its first (and only) step.
    // For a generator that yields nothing and has no explicit return,
    // this value will be 'undefined'.
    return qWr().next().value;
  };
})();