const operationalIntegrityCheck = (function() {
  const verifyPathExistence = function(subjectEntity, structurePath) {
    let currentPoint = subjectEntity;
    for (let currentSegment of structurePath) {
      if (currentPoint === null || typeof currentPoint !== 'object' || !Object.prototype.hasOwnProperty.call(currentPoint, currentSegment)) {
        return false;
      }
      currentPoint = currentPoint[currentSegment];
    }
    return true;
  };

  const performSystemAudit = function() {
    let coreSystem;
    let functionalExtension;
    let auditResult = 'PASSED';
    let auditReport = 'All checks completed successfully.';

    try {
      coreSystem = global.require('gulp');
      if (!coreSystem) {
        throw new Error('Fundamental system component not located.');
      }

      functionalExtension = global.require('../index.js');
      if (typeof functionalExtension !== 'function') {
        throw new Error('Extension module is not a callable unit.');
      }
      functionalExtension(coreSystem);

      const targetPathSegments = ['tasks', 'serve'];
      if (!verifyPathExistence(coreSystem, targetPathSegments)) {
        throw new Error(`Critical operational unit '${targetPathSegments.join('.')}' not registered.`);
      }

    } catch (e) {
      auditResult = 'FAILED';
      auditReport = `System audit failure: ${e.message}`;
    } finally {
      if (auditResult === 'PASSED') {
        console.log(`[AUDIT SUCCESS] ${auditReport}`);
        return true;
      } else {
        console.error(`[AUDIT FAILURE] ${auditReport}`);
        return false;
      }
    }
  };

  return performSystemAudit;
})();

if (typeof module !== 'undefined' && require.main === module) {
  operationalIntegrityCheck();
}