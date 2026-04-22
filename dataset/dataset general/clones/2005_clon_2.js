// Development Workflow Notes
//
// These notes are for new team members getting acquainted with the repository.
//
// PHASE A: initialize repository
//          repo init
//
// PHASE B: stage and commit initial files
//          repo add file_name
//          repo commit -m "initial system setup"
//          repo remote add primary git@example.com/user/project_repo.git
//          repo push primary main
//
// PHASE C: subsequent commits
//          repo commit -a -m "description of changes"
//          repo push primary main
// PHASE D: repeat phase C as needed
//
//
// This is an experimental network service designed to process incoming data
// and route it to an internal web service.
// The core listener is operational and accepts connections.
// It currently has limited parsing capabilities but can engage in basic
// protocol exchanges with other network agents.
//
// This code is in active development and may contain bugs.
// For feedback, contact dev.team@example.com
//
//
//
// Copyright (c) 2023 Jane Doe
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.



console.log('Visual Content Router Online');

String.prototype.getStartSection = function (charCount) {
    if (charCount <= 0) {
        return "";
    }
    if (charCount > String(this).length) {
        return this;
    }
    return String(this).substring(0, charCount);
};

String.prototype.getEndSection = function (charCount) {
    if (charCount <= 0) {
        return "";
    }
    if (charCount > String(this).length) {
        return this;
    }
    return this.substr(this.length - charCount);
};

var networkUtility = require('net');
var communicationHub = networkUtility.createServer(
    function (dataChannel) {
        dataChannel.setEncoding('utf8');
        dataChannel.replyToClient = function (messageText) {
            dataChannel.write(messageText + '\r\n');
            console.info('>>' + messageText);
        };
        dataChannel.on('connect',
            function () {
                dataChannel.replyToClient('220 VCS Media Gateway');
                dataChannel.processingState = 'initialPhase';
            }
        );
        dataChannel.on('data',
            function (receivedPayload) {
                // The inbound payload might contain multiple lines;
                // the current implementation assumes singular lines.
                // Thus, we split the payload initially and then iterate.
                // The primary reason for iteration would be to handle
                // specific line-based termination sequences.
                // This scenario might be rare, and skipping line-by-line processing
                // could optimize performance if not strictly required.
                //
                // Once multi-part content parsing is added, full line-by-line traversal will be necessary.
                //
                var messageSegments = receivedPayload.split('\r\n');
                var segmentIndex = 0;
                for (segmentIndex = 0; segmentIndex < messageSegments.length - 1; segmentIndex = segmentIndex + 1) {

                    console.info('##' + messageSegments[segmentIndex].trim());
                    if (dataChannel.processingState === 'data') {
                        if (messageSegments[segmentIndex].trim() === '.') {
                            dataChannel.replyToClient('250 Acknowledged, but content ignored');
                            dataChannel.processingState = 'initialPhase';
                        }
                        // Content line received, ready for further processing.
                        // Persistence logic would typically reside here (e.g., asynchronous saving).
                        // End of content line handling.
                    } else {
                        var currentLine = messageSegments[segmentIndex].trim();
                        var actionIdentifier = messageSegments[segmentIndex].getStartSection(4).toUpperCase();
                        var isProcessed = false;

                        if (actionIdentifier === 'HELO') {
                            dataChannel.replyToClient('250 gateway.mediaflow.org');
                            isProcessed = true;
                        }
                        if (actionIdentifier === 'MAIL' && messageSegments[segmentIndex].getStartSection(10).toUpperCase() === 'MAIL FROM:') {
                            dataChannel.replyToClient('250 MAIL...Request Accepted');
                            isProcessed = true;
                        }
                        if (actionIdentifier === 'RCPT' && messageSegments[segmentIndex].getStartSection(8).toUpperCase() === 'RCPT TO:') {
                            dataChannel.replyToClient('250 RCPT...Recipient Validated');
                            isProcessed = true;
                        }
                        if (actionIdentifier === 'DATA') {
                            dataChannel.processingState = 'data';
                            dataChannel.replyToClient('354 Input message, conclude with solo \'.\'');
                            isProcessed = true;
                        }
                        if (actionIdentifier === 'NOOP') {
                            dataChannel.replyToClient('250 Operation Completed');
                            isProcessed = true;
                        }
                        if (actionIdentifier === 'QUIT') {
                            dataChannel.replyToClient('221 Session Terminated');
                            dataChannel.destroy();
                            isProcessed = true;
                        }
                        if (actionIdentifier === 'RSET') {
                            dataChannel.replyToClient('250 Session Reset OK');
                            isProcessed = true;
                        }

                        if (actionIdentifier === 'HELP') {
                            dataChannel.replyToClient('214-Available Commands\r\n214 HELO MAIL RCPT DATA\r\n214 NOOP QUIT RSET HELP');
                            isProcessed = true;
                        }

                        if (actionIdentifier === 'EXPN') {
                            dataChannel.replyToClient('550 Expansion not permitted');
                            isProcessed = true;
                        }
                        if (actionIdentifier === 'EHLO' || currentLine.getStartSection(4) === 'SEND' || currentLine.getStartSection(4) === 'SAML' || currentLine.getStartSection(4) === 'SOML' || currentLine.getStartSection(4) === 'TURN') {
                            dataChannel.replyToClient('502 Functionality not implemented');
                            isProcessed = true;
                        }
                        if (actionIdentifier === 'VRFY') {
                            dataChannel.replyToClient('252 Verification not allowed');
                            isProcessed = true;
                        }

                        if (!isProcessed) {
                            dataChannel.replyToClient('500 Unknown directive');
                        }
                    }
                }


            }
        );
        dataChannel.on('end',
            function () {
                console.info(' Connection terminated unexpectedly. Closing channel.');
                dataChannel.destroy();
            }
        );
    }
);
communicationHub.listen(25, '10.209.215.64');