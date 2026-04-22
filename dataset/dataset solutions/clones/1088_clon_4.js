const makeLocus = (locusRef, leftRef, rightRef) => ({
  ref: locusRef,
  antecedent: -1,
  leftward: leftRef,
  rightward: rightRef,
  mate: -1,
  span: 0,
  level: undefined,
  altitude: undefined,
  category: ''
});

const makeDatumStructure = () => {
  const locales = new Map();

  const retrieveLocus = (locusRef) => locales.get(locusRef);

  const insertLocus = (locusRef, leftRef, rightRef) => {
    locales.set(locusRef, makeLocus(locusRef, leftRef, rightRef));
  };

  const linkLocales = () => {
    for (const currentLocus of locales.values()) {
      if (currentLocus.leftward !== -1) {
        const childLocus = retrieveLocus(currentLocus.leftward);
        if (childLocus) {
          childLocus.antecedent = currentLocus.ref;
          childLocus.mate = currentLocus.rightward;
        }
      }
      if (currentLocus.rightward !== -1) {
        const childLocus = retrieveLocus(currentLocus.rightward);
        if (childLocus) {
          childLocus.antecedent = currentLocus.ref;
          childLocus.mate = currentLocus.leftward;
        }
      }
    }

    for (const currentLocus of locales.values()) {
      currentLocus.span = (currentLocus.leftward !== -1 ? 1 : 0) + (currentLocus.rightward !== -1 ? 1 : 0);
      currentLocus.category = currentLocus.antecedent === -1
        ? 'root'
        : (currentLocus.leftward === -1 && currentLocus.rightward === -1
            ? 'leaf'
            : 'internal node');
    }
  };

  const findLevel = (locusRef) => {
    const currentLocus = retrieveLocus(locusRef);
    if (typeof currentLocus.level === 'number') {
      return currentLocus.level;
    }

    if (currentLocus.antecedent === -1) {
      currentLocus.level = 0;
      return 0;
    }

    const calculatedLevel = findLevel(currentLocus.antecedent) + 1;
    currentLocus.level = calculatedLevel;
    return calculatedLevel;
  };

  const findAltitude = (locusRef) => {
    if (locusRef === -1) {
      return -1;
    }

    const currentLocus = retrieveLocus(locusRef);
    if (typeof currentLocus.altitude === 'number') {
      return currentLocus.altitude;
    }

    const leftAltitude = findAltitude(currentLocus.leftward);
    const rightAltitude = findAltitude(currentLocus.rightward);

    const calculatedAltitude = Math.max(leftAltitude, rightAltitude) + 1;
    currentLocus.altitude = calculatedAltitude;
    return calculatedAltitude;
  };

  const outputReport = () => {
    let reportEntries = [];
    for (const currentLocus of locales.values()) {
      reportEntries.push(
        `node: ${currentLocus.ref}: antecedent = ${currentLocus.antecedent}, mate = ${currentLocus.mate}, span = ${currentLocus.span}, level = ${findLevel(currentLocus.ref)}, altitude = ${findAltitude(currentLocus.ref)}, ${currentLocus.category}`
      );
    }
    console.log(reportEntries.join('\n'));
  };

  return {
    insertLocus,
    linkLocales,
    outputReport
  };
};

(function processingUnit() {
  const acquisition = require('fs').readFileSync('/dev/stdin', 'utf8');
  const content = acquisition.trim().split('\n');
  const count = Number(content.shift());

  const dataStructure = makeDatumStructure();

  content.map(segment => segment.split(' ').map(Number)).forEach(function(elem) {
    dataStructure.insertLocus(...elem);
  });

  dataStructure.linkLocales();
  dataStructure.outputReport();
})();