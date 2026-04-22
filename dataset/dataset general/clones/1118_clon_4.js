const networkClient = require('net');
const domainResolver = require('dns');
const lineDelimiter = '\r\n';

class MailDispatcher {
    constructor(configuration) {
        this._logFacility = (configuration && configuration.logr) || {
            debug: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error
        };
    }

    _extractDomain(fullEmailAddress) {
        const matchResult = /[^@]+@([\w\d\-\.]+)/.exec(fullEmailAddress);
        return matchResult && matchResult[1];
    }

    _distributeRecipients(allRecipients) {
        const recipientGroups = {};
        for (const singleRecipient of allRecipients) {
            const currentDomain = this._extractDomain(singleRecipient);
            (recipientGroups[currentDomain] || (recipientGroups[currentDomain] = [])).push(singleRecipient);
        }
        return recipientGroups;
    }

    async _establishConnection(targetRealm) {
        return new Promise((resolve, reject) => {
            domainResolver.resolveMx(targetRealm, (issue, mxRecords) => {
                if (issue) {
                    return reject(issue);
                }

                if (!mxRecords || mxRecords.length === 0) {
                    return reject(new Error(`No MX entries for <${targetRealm}>`));
                }

                mxRecords.sort((a, b) => a.priority - b.priority);
                this._logFacility.debug('MX records resolved:', mxRecords);

                const attemptConnection = (index) => {
                    if (index >= mxRecords.length) {
                        return reject(new Error('Failed to connect to any SMTP server'));
                    }

                    const currentMx = mxRecords[index];
                    const socketConnection = networkClient.createConnection(25, currentMx.exchange);

                    const onError = (errorDetails) => {
                        this._logFacility.error(`Connection error for ${currentMx.exchange}:`, errorDetails);
                        socketConnection.removeAllListeners();
                        attemptConnection(index + 1);
                    };

                    const onConnect = () => {
                        this._logFacility.debug(`Connected to MX: ${currentMx.exchange}`);
                        socketConnection.removeListener('error', onError);
                        resolve(socketConnection);
                    };

                    socketConnection.once('error', onError);
                    socketConnection.once('connect', onConnect);
                };

                attemptConnection(0);
            });
        });
    }

    _cleanAddress(complexAddressString) {
        return complexAddressString.replace(/^.+</, '').replace(/>\s*$/, '').trim();
    }

    _parseAddressList(inputAddresses) {
        const processedAddresses = [];
        const addressArray = Array.isArray(inputAddresses) ? inputAddresses : inputAddresses.split(',');
        for (const addr of addressArray) {
            processedAddresses.push(this._cleanAddress(addr));
        }
        return processedAddresses;
    }

    async _readResponseLine(socketConnection, targetRealm) {
        let currentBuffer = '';
        return new Promise((resolve, reject) => {
            const dataAccumulator = (chunk) => {
                currentBuffer += chunk.toString('utf8');
                const lineEndIndex = currentBuffer.indexOf(lineDelimiter);
                if (lineEndIndex !== -1) {
                    const lineSegment = currentBuffer.substring(0, lineEndIndex);
                    this._logFacility.debug(`Received from ${targetRealm}: ${lineSegment}`);
                    currentBuffer = currentBuffer.substring(lineEndIndex + lineDelimiter.length);
                    socketConnection.removeListener('data', dataAccumulator);
                    socketConnection.removeListener('error', errorNotifier);
                    resolve(lineSegment);
                }
            };
            const errorNotifier = (issue) => {
                socketConnection.removeListener('data', dataAccumulator);
                socketConnection.removeListener('error', errorNotifier);
                reject(issue);
            };
            socketConnection.on('data', dataAccumulator);
            socketConnection.on('error', errorNotifier);
        });
    }

    async _readFullResponse(socketConnection, targetRealm) {
        let fullMessage = '';
        let statusValue = 0;
        while (true) {
            const currentLine = await this._readResponseLine(socketConnection, targetRealm);
            fullMessage += currentLine + lineDelimiter;
            if (currentLine.length >= 4 && currentLine[3] === ' ') {
                statusValue = parseInt(currentLine.substring(0, 3), 10);
                break;
            }
        }
        return { statusValue, fullMessage: fullMessage.trim() };
    }

    async _transmitViaSMTP(targetRealm, originIdentifier, senderIdentity, destinationList, mailContents) {
        let socketConnection;
        try {
            socketConnection = await this._establishConnection(targetRealm);
            const sendCommand = (cmdText) => {
                this._logFacility.debug(`Sending to ${targetRealm}: ${cmdText}`);
                socketConnection.write(cmdText + lineDelimiter);
            };

            let { statusValue, fullMessage } = await this._readFullResponse(socketConnection, targetRealm);
            if (statusValue !== 220) {
                throw new Error(`Unexpected initial response: ${statusValue} ${fullMessage}`);
            }

            const initialCommand = fullMessage.toLowerCase().includes('esmtp') ? 'EHLO' : 'HELO';
            sendCommand(`${initialCommand} ${originIdentifier}`);
            ({ statusValue, fullMessage } = await this._readFullResponse(socketConnection, targetRealm));
            if (statusValue !== 250) {
                throw new Error(`EHLO/HELO failed: ${statusValue} ${fullMessage}`);
            }

            sendCommand(`MAIL FROM:<${senderIdentity}>`);
            ({ statusValue, fullMessage } = await this._readFullResponse(socketConnection, targetRealm));
            if (statusValue !== 250) {
                throw new Error(`MAIL FROM failed: ${statusValue} ${fullMessage}`);
            }

            for (const recipient of destinationList) {
                sendCommand(`RCPT TO:<${recipient}>`);
                ({ statusValue, fullMessage } = await this._readFullResponse(socketConnection, targetRealm));
                if (statusValue !== 250 && statusValue !== 251) {
                    throw new Error(`RCPT TO for ${recipient} failed: ${statusValue} ${fullMessage}`);
                }
            }

            sendCommand('DATA');
            ({ statusValue, fullMessage } = await this._readFullResponse(socketConnection, targetRealm));
            if (statusValue !== 354) {
                throw new Error(`DATA command failed: ${statusValue} ${fullMessage}`);
            }

            this._logFacility.info('Sending mail content...');
            socketConnection.write(mailContents);
            socketConnection.write(lineDelimiter);
            sendCommand('.');

            ({ statusValue, fullMessage } = await this._readFullResponse(socketConnection, targetRealm));
            if (statusValue !== 250) {
                throw new Error(`Mail data transmission failed: ${statusValue} ${fullMessage}`);
            }
            this._logFacility.info(`Mail successfully sent to ${targetRealm}.`);

            sendCommand('QUIT');
            ({ statusValue, fullMessage } = await this._readFullResponse(socketConnection, targetRealm));
            if (statusValue !== 221) {
                this._logFacility.warn(`Unexpected QUIT response: ${statusValue} ${fullMessage}`);
            }
            return { outcome: 'success', serverResponse: fullMessage };

        } catch (issue) {
            this._logFacility.error(`SMTP transmission error for ${targetRealm}:`, issue);
            throw issue;
        } finally {
            if (socketConnection && !socketConnection.destroyed) {
                socketConnection.end();
            }
        }
    }

    _composeMessage(mailConfiguration) {
        let messageOutput = '';

        const sender = mailConfiguration.from;
        const recipientsTo = Array.isArray(mailConfiguration.to) ? mailConfiguration.to.join(',') : mailConfiguration.to;
        const recipientsCc = Array.isArray(mailConfiguration.cc) ? mailConfiguration.cc.join(',') : mailConfiguration.cc;

        messageOutput += `From: ${sender}${lineDelimiter}`;
        if (recipientsTo) {
            messageOutput += `To: ${recipientsTo}${lineDelimiter}`;
        }
        if (recipientsCc) {
            messageOutput += `Cc: ${recipientsCc}${lineDelimiter}`;
        }

        messageOutput += `Subject: ${mailConfiguration.subject}${lineDelimiter}`;
        messageOutput += `MIME-Version: ${mailConfiguration.version || '1.0'}${lineDelimiter}`;
        const messageId = mailConfiguration.id || (new Date().getTime() + this._extractDomain(this._cleanAddress(sender)));
        messageOutput += `Message-ID: <${messageId}>${lineDelimiter}`;
        const contentType = mailConfiguration.type || 'text/plain';
        const charEncoding = mailConfiguration.charset || 'utf-8';
        messageOutput += `Content-Type: ${contentType}; charset="${charEncoding}"${lineDelimiter}`;
        const transferEncoding = mailConfiguration.encoding || 'base64';
        messageOutput += `Content-Transfer-Encoding: ${transferEncoding}${lineDelimiter}`;

        for (const headerName in mailConfiguration.headers) {
            if (Object.prototype.hasOwnProperty.call(mailConfiguration.headers, headerName)) {
                messageOutput += `${headerName}: ${mailConfiguration.headers[headerName]}${lineDelimiter}`;
            }
        }

        messageOutput += lineDelimiter;

        const rawContent = mailConfiguration.content.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
        messageOutput += Buffer.from(rawContent).toString('base64');

        return messageOutput;
    }

    async dispatchMail(mailConfiguration, completionNotifier) {
        const notify = (typeof completionNotifier === 'function') ? completionNotifier : () => {};

        try {
            let allRecipients = [];
            if (mailConfiguration.to) {
                allRecipients = allRecipients.concat(this._parseAddressList(mailConfiguration.to));
            }
            if (mailConfiguration.cc) {
                allRecipients = allRecipients.concat(this._parseAddressList(mailConfiguration.cc));
            }
            if (mailConfiguration.bcc) {
                allRecipients = allRecipients.concat(this._parseAddressList(mailConfiguration.bcc));
            }

            const recipientGroups = this._distributeRecipients(allRecipients);
            const senderAddress = this._cleanAddress(mailConfiguration.from);
            const originHost = this._extractDomain(senderAddress);
            const mailPayload = this._composeMessage(mailConfiguration);

            for (const targetRealm in recipientGroups) {
                if (Object.prototype.hasOwnProperty.call(recipientGroups, targetRealm)) {
                    try {
                        const result = await this._transmitViaSMTP(
                            targetRealm,
                            originHost,
                            senderAddress,
                            recipientGroups[targetRealm],
                            mailPayload
                        );
                        notify(null, result.serverResponse);
                    } catch (issue) {
                        const errorMatch = issue.message.match(/^(\d{3})\s(.+)/);
                        if (errorMatch) {
                            notify(parseInt(errorMatch[1], 10), errorMatch[2]);
                        } else {
                            notify(issue);
                        }
                    }
                }
            }

        } catch (overallIssue) {
            this._logFacility.error('Overall mail dispatch error:', overallIssue);
            throw overallIssue;
        }
    }
}

module.exports = (configuration) => {
    const dispatcherInstance = new MailDispatcher(configuration);
    return (mailConfiguration, completionNotifier) => dispatcherInstance.dispatchMail(mailConfiguration, completionNotifier);
};