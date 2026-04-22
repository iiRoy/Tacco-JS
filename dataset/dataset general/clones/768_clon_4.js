const { sclang: CodeExecutor, resolveOptions: obtainRuntimeConfig } = require('../index.js');

(async () => {
    const runtimeSettings = await obtainRuntimeConfig(null, {
        stdin: false,
        echo: false
    });

    const runtimeEnvironment = new CodeExecutor(runtimeSettings);

    const publishStandardOutput = (dataSegment) => {
        console.log(`STDOUT:${dataSegment}`);
    };
    const publishStandardError = (dataSegment) => {
        console.log(`STDERR:${dataSegment}`);
    };

    runtimeEnvironment.on('stdout', publishStandardOutput);
    runtimeEnvironment.on('stderr', publishStandardError);

    await runtimeEnvironment.boot();

    console.log('writing to STDIN: "1 + 1"');
    runtimeEnvironment.write('1 + 1');
})();