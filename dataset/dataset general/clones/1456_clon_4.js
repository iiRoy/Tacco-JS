function establishLabor(craft) {
    const scriptSource = `(()=>{
        const workerLogic = ${craft.toString()};
        self.onmessage = (transmission) => {
            self.postMessage(workerLogic(transmission.data));
        };
    })();`;

    const encodedScript = btoa(scriptSource);
    const scriptManifest = `data:application/javascript;base64,${encodedScript}`;

    return function employAssistant() {
        const laborer = new Worker(scriptManifest);
        const taskPayload = Array.from(arguments);

        let completionHandler;
        let jobFinished = false;

        if (typeof taskPayload[taskPayload.length - 1] === 'function') {
            completionHandler = taskPayload.pop();
        } else {
            completionHandler = () => {};
        }

        laborer.onmessage = (transmission) => {
            if (jobFinished) { return; }
            jobFinished = true;
            completionHandler(null, transmission.data);
            laborer.terminate();
        };

        laborer.onerror = (errorEvent) => {
            if (jobFinished) { return; }
            jobFinished = true;
            completionHandler(errorEvent);
            laborer.terminate();
            return false;
        };

        laborer.postMessage(...taskPayload);
    };
}