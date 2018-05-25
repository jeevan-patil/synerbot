'use strict';

const infoService = require('./module/InfoService');
const queryString = require('query-string');

const answer = (title, message, closeSession) => {
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
      "shouldEndSession": closeSession
    },
    "sessionAttributes": {}
  }
}

function close(sessionAttributes, fulfillmentState, message, responseCard) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'Close',
      fulfillmentState,
      message,
      responseCard,
    },
  };
}

function buildMessage(message) {
  return {
    contentType: 'PlainText',
    content: message,
  };
}

module.exports.giveMeInfo = (event, context, callback) => {
  const request = event.request;

  // handle launch request
  console.log('giveMeInfo handler input - ' + JSON.stringify(request));

  function greet() {
    callback(null, answer(
        "Hello",
        'Hi. This is your assistant from Synerzip. What can I do for you?',
        false
    ));
  }

  if (request.type === 'LaunchRequest' || request.intent.name === 'AMAZON.HelpIntent') {
    greet();
  } else if (request.type === 'IntentRequest' && request.intent.name === 'GiveMeInfo') {
    if (request.intent && request.intent.slots) {
      const search = request.intent.slots.SearchKey.value;

      infoService.searchInfo(search, function (data) {
        callback(null, answer(
            "Asked for " + search,
            data,
            false
        ));
      });
    }
  } else if (request.type === 'IntentRequest' && (request.intent.name === 'AMAZON.StopIntent'
      || request.intent.name === 'AMAZON.CancelIntent')) {
    callback(null, answer(
        "Thank you!",
        "Thank you. Bye!",
        true
    ));
  } else {
    greet();
  }
};

function buildMattermostMessage(message) {
    return {
        "body": JSON.stringify({
            "response_type": "in_channel",
            "text": message,
        }),
        "headers": {
            "Content-Type": "application/json"
        },
        "statusCode": 200,
    };
};

module.exports.provideMeInfo = (event, context, callback) => {
  console.log('provideMeInfo event - ' + JSON.stringify(event));
  const outputSessionAttributes = event.sessionAttributes || {};
  var question = event.inputTranscript;

  infoService.searchInfo(question, function (data) {
    callback(null, close(outputSessionAttributes, 'Fulfilled', buildMessage(data)));
  });
};

module.exports.greetConversationalBot = (event, context, callback) => {
  console.log('provideMeInfo event - ' + JSON.stringify(event));
  const outputSessionAttributes = event.sessionAttributes || {};
  var question = event.inputTranscript;

  infoService.searchInfo(question, function (data) {
    callback(null, close(outputSessionAttributes, 'Fulfilled',
        buildMessage('Hi. This is your assistant from Synerzip. What can I do for you?')));
  });
};

module.exports.thankConversationalBot = (event, context, callback) => {
  console.log('provideMeInfo event - ' + JSON.stringify(event));
  const outputSessionAttributes = event.sessionAttributes || {};
  var question = event.inputTranscript;

  infoService.searchInfo(question, function (data) {
    callback(null, close(outputSessionAttributes, 'Fulfilled', buildMessage('Thank you. Bye!')));
  });
};

module.exports.provideInfoApi = (event, context, callback) => {
  console.log('provideInfoApi event - ' + JSON.stringify(event));
  const body = queryString.parse(event.body);
  const searchQuery = body.text;

  infoService.searchInfo(searchQuery, function (data) {
    callback(null, buildMattermostMessage(data));
  });
};