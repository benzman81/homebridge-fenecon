const Constants = require('./Constants');

var request = require("request");

const callHttpApi = function(log, urlToCall, onSuccessCallback, onFailureCallback, timeout) {
    var theRequest = {
      method : "GET",
      url : urlToCall,
      timeout : timeout || Constants.DEFAULT_REQUEST_TIMEOUT
    };
    request(theRequest, (function(err, response, body) {
      var statusCode = response && response.statusCode ? response.statusCode : -1;
      log("Request to '%s' finished with status code '%s' and body '%s'.", urlToCall, statusCode, "no body printed", err);
      if (!err && statusCode >= 200 && statusCode < 300) {
        var json = {};
        if (body !== "") {
          json = JSON.parse(body);
        }
        onSuccessCallback(json);
      }
      else {
        onFailureCallback();
      }
    }).bind(this));
};

module.exports = {
  callHttpApi : callHttpApi
};