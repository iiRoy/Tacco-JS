const libFile = require('fs');
const perfTool = require('benchmark');
const domSim = require('jsdom');
const path = require('path');

async function initiatePerformanceEvaluation() {
    const markupLocation = path.join(__dirname, 'tests.html');
    const utilityScriptLocation = path.join(__dirname, '..', 'src', 'ess.js');

    let documentMarkupContent;
    let utilityScriptCode;

    try {
        [documentMarkupContent, utilityScriptCode] = await Promise.all([
            libFile.promises.readFile(markupLocation, 'utf8'),
            libFile.promises.readFile(utilityScriptLocation, 'utf8')
        ]);
    } catch (contentReadError) {
        console.error("Failed to retrieve necessary files:", contentReadError);
        throw contentReadError;
    }

    const virtualBrowserEnvironment = new domSim.JSDOM(documentMarkupContent, {
        url: 'file://' + markupLocation,
        resources: 'usable',
        runScripts: 'dangerously'
    });

    const activeWindowContext = virtualBrowserEnvironment.window;
    const activeDocumentObject = activeWindowContext.document;

    try {
        activeWindowContext.eval(utilityScriptCode);
    } catch (scriptExecutionError) {
        console.error("Problem executing ESS script within virtual DOM:", scriptExecutionError);
        throw scriptExecutionError;
    }

    if (typeof activeWindowContext.ess === 'undefined') {
        throw new Error("ESS library did not load correctly into the virtual environment.");
    }

    const selectorProcessingFunction = activeWindowContext.ess;

    await orchestrateBenchmarkRun(activeDocumentObject, selectorProcessingFunction);

    virtualBrowserEnvironment.window.close();
}

async function orchestrateBenchmarkRun(targetDocumentHandle, processingUtility) {
    const performanceTestCollection = new perfTool.Suite('Query Selector Performance Metrics');

    const queryExpressions = [
        { label: 'Basic Two-Level Div', expr: 'div div' },
        { label: 'Navigational List Elements', expr: '#nav li' },
        { label: 'Deep Nested Highlight Span', expr: '#nav ul li a .hl span' },
        { label: 'Complex Failure Path', expr: '#nav .fail div li a span' },
    ];

    queryExpressions.reduce((accumulatorSuite, currentQuery) => {
        return accumulatorSuite.add(currentQuery.label, () => {
            processingUtility(currentQuery.expr);
        });
    }, performanceTestCollection);

    return new Promise((completionSignal, failureSignal) => {
        performanceTestCollection
            .on('cycle', (eventResult) => {
                console.log(String(eventResult.target));
            })
            .on('complete', () => {
                console.log('All performance evaluations have finished');
                completionSignal();
            })
            .on('error', (benchmarkError) => {
                console.error("An error occurred during benchmarking:", benchmarkError.target.error);
                failureSignal(benchmarkError.target.error);
            })
            .run({ async: true });
    });
}

initiatePerformanceEvaluation().catch(err => {
    console.error("Global error in performance evaluation pipeline:", err);
    process.exit(1);
});