'use strict';

const infoService = require('./module/InfoService');

const answer = (title, message) => {
  return {
    "version": "1.0",
    "response": {
      "outputSpeech": {
        "type": "PlainText",
        "text": message
      },
      "card": {
        "content": message,
        "title": title,
        "type": "Simple"
      },
      "shouldEndSession": true
    },
    "sessionAttributes": {}
  }
}

module.exports.giveMeInfo = (event, context, callback) => {
  const request = event.request;

  // handle launch request
  console.log('giveMeInfo handler input - ' + JSON.stringify(request));

  function greet() {
    callback(null, answer(
        "Hello",
        'Hi. This is your assistant from Synerzip. What can I do for you?'
    ));
  }

  if (request.type === 'LaunchRequest') {
    greet();
  } else if (request.type === 'IntentRequest') {

    if (request.intent && request.intent.slots) {
      const search = request.intent.slots.SearchKey.value;

      infoService.searchInfo(search, function (data) {
        callback(null, answer(
            "Asked for " + search,
            data
        ));
      });
    }
  } else {
    greet();
  }
};
