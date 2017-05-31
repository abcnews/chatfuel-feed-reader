/* eslint-env node, mocha */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const express = require('express');
const handler = require('../').handler;
const config = require('../config');

describe('integration test', () => {
  const app = express();
  before(() => {
    app.get('/news/feed/1234/rss.xml', (req, res) => {
      res.send(fs.readFileSync(path.join(__dirname, 'assets/justin.xml'), 'utf8'));
    });
    config.CHATFEED_BASEURL = 'http://localhost:8080';
    app.listen(8080);
  });

  it('should process feed & return first item', (done) => {
    const event = {
      body: 'feed_current=1234&_feed_current_session=%7B%7D&_feed_global_session=%7B%7D',
    };
    handler(event, {}, (error, res) => {
      const body = JSON.parse(res.body);
      assert.deepEqual(
        body.messages[0].attachment.payload.elements[0].title,
        'Manchester locals open doors to concert-goers stranded after \'terror attack\''
      );
      assert.deepEqual(body.set_attributes, {
        feed_current: 1234,
        _feed_global_session: '{}',
        _feed_current_session: JSON.stringify({ seen: [8550116], current: 1234 }),
      });
      done();
    });
  });
});
