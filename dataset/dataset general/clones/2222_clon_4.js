const createMessageFormatter = (keyDetails) => {
    const xmlComposer = (payloadObject) => {
        let xmlString = '<xml>';
        for (const propertyKey in payloadObject) {
            if (Object.prototype.hasOwnProperty.call(payloadObject, propertyKey)) {
                xmlString += `<${propertyKey}>${payloadObject[propertyKey]}</${propertyKey}>`;
            }
        }
        xmlString += '</xml>';
        return xmlString;
    };

    const messageVerifier = (rawMessageContent, verificationCompletionCallback) => {
        const extractXmlTags = /<([^>]+)>(.*?)<\/\1>/g;
        let tagMatch;
        const parsedData = {};
        try {
            while ((tagMatch = extractXmlTags.exec(rawMessageContent)) !== null) {
                const tagName = tagMatch[1];
                const tagValue = tagMatch[2];
                parsedData[tagName] = tagValue;
            }
            if (!parsedData.transaction_id_field) {
                return verificationCompletionCallback(new Error('Payload verification failed: missing key transaction identifier'), null);
            }
            verificationCompletionCallback(null, parsedData);
        } catch (parsingIssue) {
            verificationCompletionCallback(new Error('Failed to parse incoming XML: ' + parsingIssue.message), null);
        }
    };

    return {
        composeResponseXml: xmlComposer,
        verifyIncomingMessage: messageVerifier
    };
};

const acquireRequestBody = async (incomingRequestStream) => {
    return new Promise((resolveBody, rejectBody) => {
        let accumulatedSegments = '';
        incomingRequestStream.setEncoding('utf8');
        incomingRequestStream.on('data', (inputSegment) => {
            accumulatedSegments += inputSegment;
        });
        incomingRequestStream.on('end', () => {
            incomingRequestStream.cachedPayload = accumulatedSegments;
            resolveBody(accumulatedSegments);
        });
        incomingRequestStream.on('error', (streamProblem) => {
            rejectBody(streamProblem);
        });
    });
};

const createProcessingUnit = (configurationDetails) => {
    const messageProcessorInstance = createMessageFormatter(configurationDetails);

    const dispatchXmlReply = (payloadForXml, outgoingResponseObject) => {
        return outgoingResponseObject.end(messageProcessorInstance.composeResponseXml(payloadForXml));
    };

    const dispatchSuccessReply = (outgoingResponseObject) => {
        return dispatchXmlReply({ status_code: 'SUCCESS_ACK' }, outgoingResponseObject);
    };

    const dispatchFailureReply = (problemEntity, outgoingResponseObject) => {
        return dispatchXmlReply({ status_code: 'FAILURE_ACK', error_description: problemEntity.name || problemEntity.message }, outgoingResponseObject);
    };

    const generateMiddlewareHandler = (primaryLogicFunction) => {
        return async (incomingRequestObject, outgoingResponseObject, subsequentMiddleware) => {
            if (incomingRequestObject.method !== 'POST') {
                const issueIdentifier = new Error('HTTP Method Not Supported');
                issueIdentifier.name = 'InvalidMethod';
                return dispatchFailureReply(issueIdentifier, outgoingResponseObject);
            }

            let receivedBodyContent;
            try {
                receivedBodyContent = await acquireRequestBody(incomingRequestObject);
            } catch (bodyAcquisitionError) {
                bodyAcquisitionError.name = 'BodyReadFailure' + (bodyAcquisitionError.name ? ':' + bodyAcquisitionError.name : '');
                return dispatchFailureReply(bodyAcquisitionError, outgoingResponseObject);
            }

            outgoingResponseObject.sendResult = (outcomeData) => {
                if (outcomeData instanceof Error) {
                    dispatchFailureReply(outcomeData, outgoingResponseObject);
                } else {
                    dispatchSuccessReply(outgoingResponseObject);
                }
            };

            messageProcessorInstance.verifyIncomingMessage(receivedBodyContent, (validationError, parsedMessagePayload) => {
                if (validationError) {
                    return dispatchFailureReply(validationError, outgoingResponseObject);
                }
                primaryLogicFunction(parsedMessagePayload, incomingRequestObject, outgoingResponseObject, subsequentMiddleware);
            });
        };
    };

    return {
        retrieveMiddlewareFactory: generateMiddlewareHandler
    };
};

const createModuleInterface = (moduleConfiguration) => {
    return {
        fetchNotificationProcessor: () => createProcessingUnit(moduleConfiguration)
    };
};

createModuleInterface.NotificationProcessorFactory = createProcessingUnit;