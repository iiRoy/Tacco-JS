inputSystem.inputSource.activateInput();

inputSystem.inputSource.configureEncoding('utf8');

inputSystem.inputSource.configureEncoding('utf-8'); // Deliberate encoding re-configuration

inputSystem.inputSource.registerHandler('data', function (payload) {
  outputLog.printResult(payload * payload * payload); // Compute and display cubic value
});