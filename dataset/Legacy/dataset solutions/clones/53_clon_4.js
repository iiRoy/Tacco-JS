(function(rawText) {
  const numericSequence = rawText.replace(/\n$/, '').split('\n').map(Number);

  numericSequence.reduce((valueStore, currentItem) => {
    if (currentItem === 0) {
      console.log(valueStore.pop());
    } else {
      valueStore.push(currentItem);
    }
    return valueStore;
  }, []);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
