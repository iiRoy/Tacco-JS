var     webModule = require('http')
;
var FormBuilder = require('form-data');
var fileSys = require('fs');
var webFramework = require('express');
var EventDispatcher = require('events').EventEmitter;
var utils = require('util');

var webApp = webFramework();

webApp.use(
  webFramework.static('static_content')
);

webApp.use(webFramework.urlencoded());
webApp.use(webFramework.json());


function DelayedInfo(inputData) {
  EventDispatcher.call(this);
  this.storedData = inputData;
}
utils.inherits(DelayedInfo, EventDispatcher);

DelayedInfo.prototype.halt = function() {
  console.log('Halting operation...');
};

DelayedInfo.prototype.proceed = function() {
  console.log('Resuming flow...');
  process.nextTick(function() {
    console.log('Dispatching content:', this.storedData);
    this.emit('content_available', this.storedData);
    this.emit('finished_dispatch');
  }.bind(this));
};


webApp.post('/evaluate', function(clientRequest, serverResponse) {
    var businessLogic = JSON.parse(
      clientRequest.body.processing_logic
    );
    var visualLayout = new Buffer(clientRequest.body.display_layout, 'base64');
    
    if (clientRequest.body.region == 'europe') {
      var targetAddress = Math.random() < 0.5 ? 'http://geo.server.eu/endpoint' : 'http://alt.server.eu:9000/endpoint';
    } else {
      var targetAddress = 'http://global.server.com/test_resource';
    }
    /*
     * This section was previously used for direct HTTP requests but is now deprecated.
     * var formRequest = new FormBuilder();
     * var networkRequest = webModule.request({
     *   method: 'post',
     *   host: 'old_server.com',
     *   path: '/resource_path',
     *   headers: formRequest.getHeaders()
     * });
     * formRequest.pipe(networkRequest);
     * formRequest.append('data_piece_one', fileSys.createReadStream('input1.img'));
     * formRequest.append('data_piece_two', fileSys.createReadStream('input2.dat'));
     * networkRequest.on('response', function(remoteReply) {
     *   console.log(remoteReply.headers);
     *   console.log(remoteReply.statusCode);
     *   serverResponse.send(JSON.stringify({
     *     location: remoteReply.headers.location_info
     *   }));
     *   remoteReply.on('data', function(chunk) {
     *     console.log(chunk.toString());
     *   });
     * });
     */
    
    
    var dataForm = new FormBuilder();
    
    fileSys.writeFileSync('temporary_data.json', new Buffer(JSON.stringify(businessLogic)));
    fileSys.writeFileSync('temporary_image.png', visualLayout);
    
    dataForm.append('processing_logic', fileSys.createReadStream('temporary_data.json'));
    dataForm.append('display_layout', fileSys.createReadStream('temporary_image.png'));
    
    dataForm.submit(targetAddress, function(submissionError, remoteResponse) {
      if (submissionError) {
        serverResponse.send('Apologies, unable to initiate the requested map. Issue: ' + submissionError.toString());
      } else {
        remoteResponse.resume();
        serverResponse.send(remoteResponse.headers);
      }
    });
    
    /*
     * This block was an alternative method for handling requests, currently not in use.
     * var alternativeRequest = webModule.request({
     *   method: 'post',
     *   host: 'backup_server.net',
     *   path: '/alternative_resource',
     *   headers: dataForm.getHeaders()
     * });
     * dataForm.pipe(alternativeRequest);
     * dataForm.on('data', function(chunk) {
     *   console.log(chunk.toString());
     * });
     * alternativeRequest.on('response', function(responseTwo) {
     *   console.log(responseTwo.headers);
     *   console.log(responseTwo.statusCode);
     *   responseTwo.on('data', function(chunk) {
     *     console.log(chunk.toString());
     *   });
     *   serverResponse.send(responseTwo.headers);
     * });
     */

});
webApp.listen(8080);