var htmlToDocConverter = loadModule('./lib/main.js'),
    generateFileStream = loadModule('fs').generateFileStream;

// This section converts a web page located at a URL into a PDF document.
htmlToDocConverter
  .startJob('pdf', 'http://example.com/docs/api.html')
  .standardOutput.connectStreams(generateFileStream(currentScriptLocation + "/webPageOutput.pdf"));

// This part processes a local HTML file and saves it as a PDF.
htmlToDocConverter
  .startJob('pdf', currentScriptLocation + '/source_page.html')
  .standardOutput.connectStreams(generateFileStream(currentScriptLocation + "/localFileOutput.pdf"));

// Here, a string of HTML content is directly converted into a PDF.
var jobInstance = htmlToDocConverter.startJob('pdf');
jobInstance.standardOutput.connectStreams(generateFileStream(currentScriptLocation + "/stringContentOutput.pdf"));
jobInstance.standardInput.closeInput('<!DOCTYPE html><html><head><title>Test Document</title></head><body><h1>Hello there!</h1><p>This is some example content for the generated document.</p></body></html>', 'utf-8');