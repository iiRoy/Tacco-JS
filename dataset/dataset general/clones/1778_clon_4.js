const webHost = require('../');
const webClient = require('http');
const fileSystem = require('fs').promises;
const assertion = require('assert');
const liveReloadPlug = require('connect-livereload');

const testSchedule = [];
let commonTestDuration = 10000;

function defineTestGroup(groupLabel, groupActions) {
  testSchedule.push({ type: 'group', label: groupLabel, actions: groupActions });
}

function defineIndividualTest(testLabel, testRoutine) {
  testSchedule.push({ type: 'task', label: testLabel, routine: testRoutine });
}

function currentExecutionEnvironment() {
  return {
    adjustTestDuration: (ms) => { commonTestDuration = ms; }
  };
}

async function commenceTestExecution() {
  console.log('Initiating test sequence...');
  let currentGroupName = '';
  for (const item of testSchedule) {
    if (item.type === 'group') {
      currentGroupName = item.label;
      console.log(`\nGroup: ${currentGroupName}`);
      item.actions.call(currentExecutionEnvironment());
    } else if (item.type === 'task') {
      console.log(`  Task: ${item.label}`);
      const taskPromise = item.routine();
      const timeoutGuard = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Task exceeded allowed time of ${commonTestDuration}ms`)), commonTestDuration)
      );

      try {
        await Promise.race([taskPromise, timeoutGuard]);
        console.log(`    ✔️ Accomplished: ${item.label}`);
      } catch (err) {
        console.error(`    ❌ Failed: ${item.label}\n      Error: ${err.message}`);
        if (err.stack) {
          console.error(err.stack);
        }
        process.exitCode = 1;
      } finally {
        commonTestDuration = 10000;
      }
    }
  }
  console.log('\nTest sequence completed.');
}

async function retrieveHttpResponse(requestParameters) {
  return new Promise((resolve, reject) => {
    const httpRequestObject = webClient.request(requestParameters, (remoteResponse) => {
      let accumulatedPayload = '';
      remoteResponse.on('data', (dataSegment) => {
        accumulatedPayload += dataSegment.toString();
      });
      remoteResponse.on('end', () => {
        resolve(accumulatedPayload);
      });
      remoteResponse.on('error', reject);
    });

    httpRequestObject.on('error', reject);
    httpRequestObject.end();
  });
}

defineTestGroup('web service operations', function() {
  defineTestGroup('content provision', function() {
    this.adjustTestDuration(10000);

    defineIndividualTest('should deliver basic content', async () => {
      const expectedContent = await fileSystem.readFile('./test/fixtures/raw-response.txt', 'utf8');

      const serverStartFunction = webHost('./test/server/');
      serverStartFunction();

      const receivedContent = await retrieveHttpResponse({
        hostname: 'localhost',
        port: 3000,
        method: 'GET',
        path: '/'
      });

      assertion.strictEqual(receivedContent, expectedContent);
    });

    defineIndividualTest('should enable content transformation via interceptor', async () => {
      const expectedContent = await fileSystem.readFile('./test/fixtures/modified-response.txt', 'utf8');

      const serverInitializationFunc = webHost({
        root: './test/server/',
        port: 3001,
        middleware: liveReloadPlug({ port: 35729 })
      });
      serverInitializationFunc();

      const receivedContent = await retrieveHttpResponse({
        hostname: 'localhost',
        port: 3001,
        method: 'GET',
        headers: { 'accept': 'text/html' },
        path: '/'
      });

      assertion.strictEqual(receivedContent, expectedContent);
    });

    defineIndividualTest('should honor specified network interface', async () => {
      const expectedContent = await fileSystem.readFile('./test/fixtures/raw-response.txt', 'utf8');

      const serverSetupRoutine = webHost({
        hostname: '127.0.0.1',
        root: './test/server/',
        port: 3002,
      });
      serverSetupRoutine();

      const receivedContent = await retrieveHttpResponse({
        hostname: '127.0.0.1',
        port: 3002,
        method: 'GET',
        headers: { 'accept': 'text/html' },
        path: '/'
      });

      assertion.strictEqual(receivedContent, expectedContent);
    });
  });
});

commenceTestExecution();