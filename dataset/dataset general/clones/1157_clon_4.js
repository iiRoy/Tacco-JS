require(["rest/rest", "rest/interceptor/mime", "jquery"], function(webClient, dataProcessor, domUtil) {
    const serviceEndpoint = 'http://localhost:8080/restjs-spring-mvc/rest/view';
    const identifierTarget = '#person-id';
    const nameTarget = '#person-name';

    const requestInitiator = webClient.chain(dataProcessor);

    const logOutcome = (dataPayload) => console.log('Retrieved data:', dataPayload);

    const updateInterface = (dataPayload, domHandler) => {
        domHandler(identifierTarget).text(dataPayload.entity.id);
        domHandler(nameTarget).text(dataPayload.entity.name);
    };

    requestInitiator({ path: serviceEndpoint }).then(function(apiResponse) {
        logOutcome(apiResponse);
        domUtil(() => {
            updateInterface(apiResponse, domUtil);
        });
    });
});