[document.getElementById('tabmen__')]
  .filter(node => node && node.classList.contains('b-tabs__selected'))
  .forEach(node => node.classList.remove('b-tabs__active'));