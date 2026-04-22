var webModule = require('http');

var acquire_media_link = function(
  requestOptions,
  resultProcessor
) {


  if (requestOptions.deviceType === 'mobilePlatform_A') {
    var connectionHeaders = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 2.3.7; en-us; Nexus One Build/GRK39F) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
      'Referer': 'http://www.youtube.com/watch?v=' + requestOptions.mediaIdentifier
    }
  } else {
    var connectionHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/600.8.9 (KHTML, like Gecko) Version/7.1.8 Safari/537.85.17',
      'Referer': 'http://www.youtube.com/watch?v=' + requestOptions.mediaIdentifier
    }
  }

  var httpRequestConfig = {
    hostname: 'm.youtube.com',
    path: '/watch?ajax=1&layout=mobile&tsp=1&utcoffset=330&v=' + requestOptions.mediaIdentifier,
    method: 'GET',
    headers: connectionHeaders
  };

  var payloadAccumulator = '';

  var dataFetcher = webModule.request(
    httpRequestConfig,
    function(networkResponse) {
      networkResponse.setEncoding('utf8');
      networkResponse.on(
        'data',
        function(dataSegment) {
          payloadAccumulator += dataSegment;
        }
      );

      networkResponse.on('end', function() {
        try {
          var jsonPayload = JSON.parse(payloadAccumulator.substring(4, payloadAccumulator.length));
          if (jsonPayload && jsonPayload.content && jsonPayload.content.video) {

            var mediaStreamURL = jsonPayload.content.player_data.fmt_stream_map ? jsonPayload.content.player_data.fmt_stream_map[0].url : jsonPayload.content.player_data.stream_url;

            resultProcessor(null, mediaStreamURL);
          } else {
            resultProcessor('invalid_payload_error');
          }
        } catch (exceptionInstance) {
          resultProcessor(exceptionInstance);
        }

      })
    });

  dataFetcher.on('error', function(failureEvent) {
    console.log('Issue encountered with network request: ' + failureEvent.message);
    console.log(failureEvent.stack);
  });

  dataFetcher.end();
}

exports.acquire_media_link = acquire_media_link;