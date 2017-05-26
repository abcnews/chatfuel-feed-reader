const querystring = require('querystring');

function tryParse(string) {
  try {
    return JSON.parse(string);
  } catch (e) {
    return {};
  }
}

function parseEventBody(eventBody) {
  const parsedBody = querystring.parse(eventBody);

  const event = {
    current: Number(parsedBody.feed_current),
    session: tryParse(parsedBody._feed_current_session),
    global: tryParse(parsedBody._feed_global_session),
  };

  return event;
}

module.exports = function (event, callback) {
  callback(null, parseEventBody(event.body));
};
