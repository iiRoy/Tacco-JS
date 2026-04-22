const SignatureAuthority = typeof Keygrip !== 'undefined' ? Keygrip : undefined;
const CommUtilities = typeof http !== 'undefined' ? http : undefined;
const patternCacheRegistry = new Map();

const buildCookieEntity = (labelIdentifier, valueContent, attributeMap = {}) => {
  const entity = {
    label: labelIdentifier,
    content: valueContent === null || valueContent === undefined ? "" : String(valueContent),
    expirationMoment: valueContent === null || valueContent === undefined ? new Date(0) : undefined,
    pathScope: "/",
    domainScope: undefined,
    isHttpOnly: true,
    isSecure: false,
    shouldReplace: false,
    maxAgeSeconds: undefined,
  };

  for (const propKey in attributeMap) {
    if (Object.prototype.hasOwnProperty.call(attributeMap, propKey)) {
      if (propKey === 'maxAge') {
        entity.maxAgeSeconds = attributeMap[propKey];
      } else if (propKey === 'maxage') { // Back-compat alias
        entity.maxAgeSeconds = attributeMap[propKey];
      } else if (propKey === 'path') {
        entity.pathScope = attributeMap[propKey];
      } else if (propKey === 'domain') {
        entity.domainScope = attributeMap[propKey];
      } else if (propKey === 'httpOnly') {
        entity.isHttpOnly = attributeMap[propKey];
      } else if (propKey === 'secure') {
        entity.isSecure = attributeMap[propKey];
      } else if (propKey === 'overwrite') {
        entity.shouldReplace = attributeMap[propKey];
      } else {
        entity[propKey] = attributeMap[propKey];
      }
    }
  }

  const generatePayloadString = () => `${entity.label}=${entity.content}`;

  const assembleHeaderLine = () => {
    let headerLine = generatePayloadString();
    let effectiveExpiration = entity.expirationMoment;

    if (entity.maxAgeSeconds !== undefined && entity.maxAgeSeconds !== null) {
      effectiveExpiration = new Date(Date.now() + entity.maxAgeSeconds * 1000);
    }

    if (entity.pathScope) headerLine += `; Path=${entity.pathScope}`;
    if (effectiveExpiration) headerLine += `; Expires=${effectiveExpiration.toUTCString()}`;
    if (entity.domainScope) headerLine += `; Domain=${entity.domainScope}`;
    if (entity.isSecure) headerLine += `; Secure`;
    if (entity.isHttpOnly) headerLine += `; HttpOnly`;

    return headerLine;
  };

  return {
    ...entity,
    generatePayloadString,
    assembleHeaderLine,
  };
};

const parseCookieHeaderString = (rawHeaderValue) => {
  if (!rawHeaderValue) return new Map();
  return new Map(
    rawHeaderValue.split(';').map(segment => {
      const parts = segment.trim().split('=', 2);
      return [parts[0], parts[1] || ''];
    })
  );
};

const updateHeaderCollection = (existingHeaders, newItem) => {
  let modifiedHeaders = Array.isArray(existingHeaders) ? [...existingHeaders] : (typeof existingHeaders === 'string' ? [existingHeaders] : []);

  if (newItem.shouldReplace) {
    modifiedHeaders = modifiedHeaders.filter(
      (currentHeader) => !currentHeader.startsWith(newItem.label + "=")
    );
  }
  modifiedHeaders.push(newItem.assembleHeaderLine());
  return modifiedHeaders;
};

const createWebSessionManager = (httpReq, httpRes, keySource) => {
  if (!new.target) return createWebSessionManager(httpReq, httpRes, keySource);

  this.currentRequest = httpReq;
  this.currentResponse = httpRes;
  this.signatureAuthority = undefined;

  if (keySource) {
    if (Array.isArray(keySource)) {
      if (!SignatureAuthority) throw new Error('SignatureAuthority (Keygrip) dependency not available.');
      this.signatureAuthority = new SignatureAuthority(keySource);
    } else if (keySource.constructor && keySource.constructor.name === 'Keygrip') { // Check for actual Keygrip constructor name
      this.signatureAuthority = keySource;
    }
  }

  this.obtainValue = (dataLabel, optionsObject) => {
    const signatureLabel = dataLabel + ".sig";
    const requestHeader = this.currentRequest.headers["cookie"];
    if (!requestHeader) return;

    const parsedCookies = parseCookieHeaderString(requestHeader);
    const storedValue = parsedCookies.get(dataLabel);
    if (storedValue === undefined) return;

    const requiresSignature = optionsObject && optionsObject.signed !== undefined ? optionsObject.signed : !!this.signatureAuthority;

    if (!optionsObject || !requiresSignature) return storedValue;

    const remoteSignature = parsedCookies.get(signatureLabel);
    if (remoteSignature === undefined) return;

    const payloadToVerify = `${dataLabel}=${storedValue}`;
    if (!this.signatureAuthority) throw new Error('Signature authority instance required for signed cookies');

    const verificationResult = this.signatureAuthority.index(payloadToVerify, remoteSignature);

    if (verificationResult < 0) {
      this.assignValue(signatureLabel, null, { path: "/", signed: false });
    } else {
      if (verificationResult > 0) { // Re-sign if not using the primary key
        this.assignValue(signatureLabel, this.signatureAuthority.sign(payloadToVerify), { signed: false });
      }
      return storedValue;
    }
  };

  this.assignValue = (dataLabel, dataValue, optionsObject) => {
    const outboundResponse = this.currentResponse;
    const inboundRequest = this.currentRequest;
    let existingHeaders = outboundResponse.getHeader("Set-Cookie") || [];
    const connectionIsSecure = inboundRequest.protocol === 'https' || (inboundRequest.connection && inboundRequest.connection.encrypted);

    const requiresSignature = optionsObject && optionsObject.signed !== undefined ? optionsObject.signed : !!this.signatureAuthority;

    if (typeof existingHeaders === "string") existingHeaders = [existingHeaders];

    const currentCookieConfig = buildCookieEntity(dataLabel, dataValue, optionsObject);

    // Replicate secure logic:
    let effectiveSecureSetting = connectionIsSecure;
    if (optionsObject && "secure" in optionsObject) effectiveSecureSetting = optionsObject.secure;
    if (optionsObject && "secureProxy" in optionsObject) effectiveSecureSetting = optionsObject.secureProxy;
    currentCookieConfig.isSecure = effectiveSecureSetting;

    if (!connectionIsSecure && currentCookieConfig.isSecure) {
      throw new Error('Cannot transmit secure cookie over unencrypted channel');
    }

    let updatedHeaders = updateHeaderCollection(existingHeaders, currentCookieConfig);

    if (optionsObject && requiresSignature) {
      if (!this.signatureAuthority) throw new Error('Signature authority instance required for signed cookies');
      const signatureValue = this.signatureAuthority.sign(currentCookieConfig.generatePayloadString());
      const signatureCookieConfig = buildCookieEntity(dataLabel + ".sig", signatureValue, {
        path: currentCookieConfig.pathScope,
        domain: currentCookieConfig.domainScope,
        isHttpOnly: currentCookieConfig.isHttpOnly,
        isSecure: currentCookieConfig.isSecure,
        shouldReplace: currentCookieConfig.shouldReplace,
        maxAge: currentCookieConfig.maxAgeSeconds // Pass original maxAge
      });
      updatedHeaders = updateHeaderCollection(updatedHeaders, signatureCookieConfig);
    }

    const responseHeaderSetter = outboundResponse.set ? CommUtilities.OutgoingMessage.prototype.setHeader : outboundResponse.setHeader;
    responseHeaderSetter.call(outboundResponse, 'Set-Cookie', updatedHeaders);
    return this;
  };
};

createWebSessionManager.middlewareFactory = (signatureKeys) => {
  return (reqObj, resObj, nextAction) => {
    reqObj.sessionCookies = resObj.sessionCookies = new createWebSessionManager(reqObj, resObj, signatureKeys);
    nextAction();
  };
};

createWebSessionManager.CookieItem = buildCookieEntity;

module.exports = createWebSessionManager;