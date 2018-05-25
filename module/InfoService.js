var request = require('request');

var InfoService = {
  searchInfo: function (search, callback) {
    request(getRequestBody(search), function (err, res, body) {
      if (err) {
        console.log('Error while calling synerbot service.', err);
        couldNotAnswer(callback);
      } else {
        console.log('synerbot service response - ' + JSON.stringify(res));
        if (res.statusCode === 200) {
          callback(convertDataHumanLanguage(body));
        } else {
          couldNotAnswer(callback);
        }
      }
    });
  }
};

function couldNotAnswer(callback) {
  callback('There was an error while gathering information. Please try again.');
}

function noInfoGathered() {
  return 'Could not understand what you want. Please try again.'
}

function convertDataHumanLanguage(data) {
  data = JSON.parse(data);
  const intent = data.intent;

  switch (intent) {
    case 'definition':
      return (data.answer ? data.answer : noInfoGathered());
    case 'developer_count':
    case 'expertise_capability':
    case 'area_capability':
    case 'comparison':
      return (data.details ? data.details : noInfoGathered());
    default:
      return noInfoGathered();
  }
};

var getRequestBody = function (search) {

  const options = {
    url: process.env.API_ENDPOINT,
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "user_email_id": process.env.API_USERID,
      "user_name": process.env.API_USERNAME,
      "user_reply": "NO",
      "utterance": search
    })
  };

  console.log('request is - ' + JSON.stringify(options));

  return options;
};

module.exports = InfoService;