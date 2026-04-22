globalThis.addEventListener('message', function receptionDevice(receivedSignal) {
    globalThis.removeEventListener('message', receptionDevice);
    const scriptPayload = receivedSignal.data;
    new Function(scriptPayload)();
});