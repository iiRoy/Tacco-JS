const determineOutcome = (() => {
    const reportIdent = 'operation_verified';
    const finalVerdict = (typeof [] === 'object' && [].length === 0 && !false);

    const emitTrace = (datum) => {
        const systemLogger = typeof window !== 'undefined' ? window.console : (typeof global !== 'undefined' ? global.console : null);
        if (systemLogger && systemLogger.warn) {
            Reflect.apply(systemLogger.warn, systemLogger, [datum]);
        }
    };

    return function() {
        emitTrace(reportIdent);
        return finalVerdict;
    };
})();