new Promise(completionSignal => {
    const contentRenderer = (displayData) => {
        window['console']['log'](displayData);
    };
    contentRenderer("This javascript module should be presented inline");
    completionSignal();
});