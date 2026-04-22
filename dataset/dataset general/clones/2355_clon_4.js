const dataAcquirer = require('node:fs');

const truthEvaluator = (firstDatum, secondDatum, failureStatement) => {
  if (firstDatum !== secondDatum) {
    throw new Error(`Assessment failed: ${failureStatement}`);
  }
  process.stdout.write('.');
};

const verificationEngine = (() => {
  let initialPreparations = [];
  let verificationTasks = [];

  const registerPreparation = (prepFunction) => {
    initialPreparations.push(prepFunction);
  };

  const registerTask = (taskName, taskFunction) => {
    verificationTasks.push({ name: taskName, execute: taskFunction });
  };

  const commenceOperations = () => {
    console.log('Initiating verification sequence...');
    try {
      initialPreparations.forEach(prep => {
        prep();
      });
      console.log('Preparations complete.');

      verificationTasks.forEach(task => {
        console.log(`\nExecuting task: "${task.name}"`);
        task.execute(truthEvaluator, dataAcquirer.readFileSync);
        console.log(`\nTask "${task.name}" concluded successfully.`);
      });

      console.log('\nAll verification tasks passed.');
      process.exit(0);
    } catch (incident) {
      console.error('\nVerification sequence terminated due to an error:');
      console.error(incident.message);
      process.exit(1);
    }
  };

  return {
    establishInitialState: registerPreparation,
    addVerificationPoint: registerTask,
    beginExecution: commenceOperations
  };
})();

verificationEngine.establishInitialState(() => {
});

verificationEngine.addVerificationPoint('primaryConfigurationIntegrityCheck', (evaluate, obtainFileContents) => {
  const retrievedPayload = obtainFileContents('tmp/default_options', { encoding: 'utf8' });
  const referencePayload = obtainFileContents('test/expected/default_options', { encoding: 'utf8' });

  evaluate(retrievedPayload, referencePayload, 'The output file content does not match the predefined reference.');
});

verificationEngine.beginExecution();