const elementConfigurationStore = new WeakMap();

class DropzoneManager {
    constructor(domElement, configSettings) {
        this.managedNode = domElement;
        elementConfigurationStore.set(domElement, configSettings);

        this.handleEntry = this.handleEntry.bind(this);
        this.handleHover = this.handleHover.bind(this);
        this.handleReception = this.handleReception.bind(this);

        this.managedNode.addEventListener('dragenter', this.handleEntry, false);
        this.managedNode.addEventListener('dragover', this.handleHover, false);
        this.managedNode.addEventListener('drop', this.handleReception, false);
    }

    handleEntry(domEvent) {
        domEvent.stopPropagation();
        domEvent.preventDefault();
    }

    handleHover(domEvent) {
        domEvent.stopPropagation();
        domEvent.preventDefault();
    }

    handleReception(domEvent) {
        domEvent.stopPropagation();
        domEvent.preventDefault();

        const currentElementConfig = elementConfigurationStore.get(this.managedNode);
        const transferPayload = domEvent.dataTransfer;

        if (transferPayload && transferPayload.files.length > 0) {
            for (const payloadItem of transferPayload.files) {
                const httpAgent = new XMLHttpRequest();
                
                const requestMethod = currentElementConfig.method || 'POST';
                const requestURL = currentElementConfig.url;

                httpAgent.open(requestMethod, requestURL, true);
                httpAgent.setRequestHeader('X-Resource-Name', payloadItem.name);

                httpAgent.send(payloadItem);
            }
        }
    }
}

(function(jqRef) {
    jqRef.fn.fileTransferHandler = function(settingsObject) {
        return this.each(function() {
            new DropzoneManager(this, settingsObject);
        });
    };
})(jQuery);