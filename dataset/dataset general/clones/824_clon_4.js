class OperationFailure extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "OperationFailure";
    this.details = details;
  }
}

class ConfigurationIssue extends OperationFailure {
  constructor(message, details = {}) {
    super(message, details);
    this.name = "ConfigurationIssue";
  }
}

class InvocationProblem extends OperationFailure {
  constructor(message, details = {}) {
    super(message, details);
    this.name = "InvocationProblem";
  }
}

class RemoteProcedureClient {
  #protocolVersion = '2.0';
  #activeEndpoint = null;
  #methodNamespace = null;
  #enableCaching = true;

  constructor(initialParameters = {}) {
    this.#applyConfiguration(initialParameters);
  }

  configureService(inputParameters) {
    this.#auditParameters(inputParameters);
    this.#activeEndpoint = inputParameters.remoteURL;
    this.#methodNamespace = inputParameters.scope;
    this.#enableCaching = inputParameters.permitCache !== undefined ? inputParameters.permitCache : true;
    return this;
  }

  async temporarilyConfigure(temporaryParameters, operationCallback) {
    this.#auditParameters(temporaryParameters);

    if (typeof operationCallback !== 'function') {
      throw new ConfigurationIssue("No callback function supplied for temporary configuration.");
    }

    const previousParameters = {
      remoteURL: this.#activeEndpoint,
      scope: this.#methodNamespace,
      permitCache: this.#enableCaching
    };

    this.configureService(temporaryParameters);
    try {
      await operationCallback.call(this);
    } finally {
      this.configureService(previousParameters);
    }
  }

  async dispatchCall(procedureName, callOptions = {}) {
    if (callOptions.identity === undefined) {
      callOptions.identity = 1;
    }
    if (callOptions.permitCache === undefined) {
      callOptions.permitCache = this.#enableCaching;
    }

    this.#auditProcedureName(procedureName);
    this.#auditProcedureArguments(callOptions.arguments);
    this.#auditFeedbackHandlers(callOptions.onSuccess, callOptions.onFailure);

    const requestPayload = this.#constructPayload(procedureName, callOptions.arguments, callOptions.identity);
    const serializedPayload = JSON.stringify(requestPayload);

    return this.#executeTransmission(serializedPayload, callOptions)
      .then(processedResponse => {
        if (processedResponse && processedResponse.error) {
          if (callOptions.onFailure) {
            callOptions.onFailure(processedResponse);
          }
          throw new OperationFailure("Remote RPC error occurred.", processedResponse.error);
        }
        if (callOptions.onSuccess) {
          callOptions.onSuccess(processedResponse);
        }
        return processedResponse;
      })
      .catch(error => {
        if (callOptions.onFailure) {
          callOptions.onFailure(error);
        }
        throw error;
      });
  }

  async dispatchMultipleCalls(invocations, processingOptions = {}) {
    if (!Array.isArray(invocations) || invocations.length === 0) {
      throw new InvocationProblem("Invalid invocation list provided for batch processing. Must be a non-empty array.");
    }

    const preparedInvocations = invocations.map((invocation, index) => {
      this.#auditProcedureName(invocation.procedure);
      this.#auditProcedureArguments(invocation.parameters);
      return {
        procedure: invocation.procedure,
        parameters: invocation.parameters,
        identity: invocation.identity === undefined ? index + 1 : invocation.identity
      };
    });

    this.#auditFeedbackHandlers(processingOptions.onSuccess, processingOptions.onFailure);

    const payloadArray = preparedInvocations.map(inv =>
      this.#constructPayload(inv.procedure, inv.parameters, inv.identity)
    );
    const serializedPayload = JSON.stringify(payloadArray);

    return this.#executeTransmission(serializedPayload, processingOptions)
      .then(processedResponse => {
        if (processedResponse && processedResponse.error) {
            if (processingOptions.onFailure) {
                processingOptions.onFailure(processedResponse);
            }
            throw new OperationFailure("Remote RPC error occurred during batch processing.", processedResponse.error);
        }
        if (processingOptions.onSuccess) {
          processingOptions.onSuccess(processedResponse);
        }
        return processedResponse;
      })
      .catch(error => {
        if (processingOptions.onFailure) {
          processingOptions.onFailure(error);
        }
        throw error;
      });
  }

  #auditParameters(cfg) {
    if (cfg === undefined || cfg === null) {
      throw new ConfigurationIssue("No configuration object supplied.");
    }
    if (cfg.remoteURL !== undefined && typeof cfg.remoteURL !== 'string') {
      throw new ConfigurationIssue("Remote URL must be a string.");
    }
    if (cfg.scope !== undefined && typeof cfg.scope !== 'string') {
      throw new ConfigurationIssue("Method scope must be a string.");
    }
  }

  #auditProcedureName(name) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new InvocationProblem("Procedure identifier must be a non-empty string.");
    }
  }

  #auditProcedureArguments(args) {
    if (!(args === null || args === undefined || typeof args === 'object' || Array.isArray(args))) {
      throw new InvocationProblem("Procedure arguments must be null, undefined, an object, or an array.");
    }
  }

  #auditFeedbackHandlers(successHandler, failureHandler) {
    if (successHandler !== undefined && typeof successHandler !== 'function') {
      throw new ConfigurationIssue("Success handler must be a function or undefined.");
    }
    if (failureHandler !== undefined && typeof failureHandler !== 'function') {
      throw new ConfigurationIssue("Failure handler must be a function or undefined.");
    }
  }

  async #executeTransmission(rawPayload, currentOptions) {
    const targetAddress = this.#formulateTargetAddress(
      currentOptions.remoteURL || this.#activeEndpoint,
      currentOptions.permitCache !== undefined ? currentOptions.permitCache : this.#enableCaching
    );

    if (!targetAddress) {
      throw new ConfigurationIssue("No remote endpoint configured or provided for this operation.");
    }

    try {
      const networkResponse = await fetch(targetAddress, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: rawPayload
      });

      if (!networkResponse.ok) {
        let errorData;
        try {
          const responseText = await networkResponse.text();
          errorData = responseText ? JSON.parse(responseText) : { message: `HTTP Error ${networkResponse.status}` };
        } catch (parseError) {
          errorData = { message: `HTTP Error ${networkResponse.status}, could not parse response.`, parseError: parseError.message };
        }
        throw new OperationFailure(`Remote server responded with an HTTP error: ${networkResponse.status}`, errorData);
      }

      const responseText = await networkResponse.text();
      return this.#interpretRemoteResponse(responseText);

    } catch (err) {
      const errorDetails = err instanceof OperationFailure ? err.details : { message: err.message, cause: err };
      throw new OperationFailure("Failed to communicate with remote service due to network or parsing issue.", errorDetails);
    }
  }

  #formulateTargetAddress(baseAddress, allowCache) {
    let finalAddress = baseAddress;
    if (!finalAddress) return null;

    if (!allowCache) {
      const timeStamp = new Date().getTime();
      const separator = finalAddress.includes('?') ? '&' : '?';
      finalAddress += `${separator}uniqueReq=${timeStamp}`;
    }
    return finalAddress;
  }

  #constructPayload(procedure, args, identifier) {
    const dataRepresentation = {
      jsonrpc: this.#protocolVersion,
      method: this.#methodNamespace ? `${this.#methodNamespace}.${procedure}` : procedure,
      id: identifier
    };
    if (args !== undefined) {
      dataRepresentation.params = args;
    }
    return dataRepresentation;
  }

  #interpretRemoteResponse(rawResponseData) {
    if (!rawResponseData || rawResponseData.trim() === '') {
      return {
        error: { message: 'Empty response from remote service', code: -32000 },
        jsonrpc: this.#protocolVersion
      };
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(rawResponseData);
    } catch (e) {
      return {
        error: { message: `Malformed JSON response: ${e.message}`, code: -32700 },
        jsonrpc: this.#protocolVersion
      };
    }

    const checkVersion = (res) => (res && res.jsonrpc === this.#protocolVersion);

    if (Array.isArray(parsedContent)) {
      if (parsedContent.length > 0 && !parsedContent.every(checkVersion)) {
        return {
          error: { message: 'Protocol version mismatch in batch response', code: -32600 },
          jsonrpc: this.#protocolVersion
        };
      }
    } else {
      if (!checkVersion(parsedContent)) {
        return {
          error: { message: 'Protocol version mismatch in single response', code: -32600 },
          jsonrpc: this.#protocolVersion
        };
      }
    }

    return parsedContent;
  }

  #applyConfiguration(parameters) {
    this.#auditParameters(parameters);
    if (parameters.remoteURL !== undefined) {
      this.#activeEndpoint = parameters.remoteURL;
    }
    if (parameters.scope !== undefined) {
      this.#methodNamespace = parameters.scope;
    }
    if (parameters.permitCache !== undefined) {
      this.#enableCaching = parameters.permitCache;
    }
  }
}

const RemoteProcedureGateway = new RemoteProcedureClient();