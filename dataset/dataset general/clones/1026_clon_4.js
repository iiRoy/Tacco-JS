const SystemInsight = (function() {
    class CapabilityScanner {
        #displaySurfaceSupport;
        #graphicsPipelineSupport;
        #workerThreadSupport;
        #fileSystemAPISupport;

        constructor() {
            this.#displaySurfaceSupport = Boolean(window.CanvasRenderingContext2D);
            this.#graphicsPipelineSupport = CapabilityScanner.#evaluateGraphicsPipeline();
            this.#workerThreadSupport = Boolean(window.Worker);
            this.#fileSystemAPISupport = [window.File, window.FileReader, window.FileList, window.Blob].every(Boolean);
        }

        static #evaluateGraphicsPipeline() {
            try {
                const testCanvasElement = document.createElement('canvas');
                return Boolean(window.WebGLRenderingContext) && (
                    testCanvasElement.getContext('webgl') || testCanvasElement.getContext('experimental-webgl')
                );
            } catch (errorCondition) {
                return false;
            }
        }

        get hasDisplaySurface() {
            return this.#displaySurfaceSupport;
        }

        get hasGraphicsPipeline() {
            return this.#graphicsPipelineSupport;
        }

        get hasWorkerThreads() {
            return this.#workerThreadSupport;
        }

        get hasFileSystemAPI() {
            return this.#fileSystemAPISupport;
        }

        retrieveIssueDisplay() {
            const notificationContainer = document.createElement('div');
            notificationContainer.id = 'trouble-message-box';
            Object.assign(notificationContainer.style, {
                fontFamily: 'sans-serif',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                backgroundColor: '#eee',
                color: '#333',
                padding: '2em',
                maxWidth: '450px',
                margin: '6em auto 0',
                border: '1px solid #ccc'
            });

            if (!this.#graphicsPipelineSupport) {
                const issueOrigin = Boolean(window.WebGLRenderingContext)
                    ? 'graphics hardware'
                    : 'web browser';

                notificationContainer.innerHTML = `Your ${issueOrigin} appears to lack <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#666">WebGL</a> capabilities.<br />Discover how to enable it <a href="http://get.webgl.org/" style="color:#666">here</a>.`;
            }

            return notificationContainer;
        }

        renderIssueDisplay(outputSettings = {}) {
            const { targetParent = document.body, uniqueElementId = 'platform-oldie' } = outputSettings;

            const displayElement = this.retrieveIssueDisplay();
            displayElement.id = uniqueElementId;

            targetParent.appendChild(displayElement);
        }
    }

    const instance = new CapabilityScanner();

    return {
        hasDisplaySurface: instance.hasDisplaySurface,
        hasGraphicsPipeline: instance.hasGraphicsPipeline,
        hasWorkerThreads: instance.hasWorkerThreads,
        hasFileSystemAPI: instance.hasFileSystemAPI,
        retrieveIssueDisplay: ( ) => instance.retrieveIssueDisplay(),
        renderIssueDisplay: ( outputSettings ) => instance.renderIssueDisplay(outputSettings)
    };
})();