/* global describe, it, before */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const express = require('express');
const handler = require('../').handler;

describe('integration test', () => {
  const app = express();
  before(() => {
    app.get('/news/feed/1234/rss.xml', (req, res) => {
      res.send(fs.readFileSync(path.join(__dirname, 'assets/justin.xml'), 'utf8'));
    });

    process.env.CONTENT_READ_THE_STORY = 'Read the story 🔗';
    process.env.CONTENT_NEXT_STORY = 'Next story';
    process.env.CONTENT_IM_DONE = 'Thanks, I\'m done';
    process.env.BLOCK_IM_DONE = 'back in touch (gif)';
    process.env.READER_BLOCK_NAME = 'Feed Reader';
    process.env.CHATFEED_BASEURL = 'http://localhost:8080';

    app.listen(8080);
  });

  it('should process feed & return first item', (done) => {
    const event = {
      body: 'feed_current=1234&_feed_current_session=%7B%7D&_feed_global_session=%7B%7D',
    };
    handler(event, {}, (error, res) => {
      assert.deepEqual(
        res.messages[0].attachment.payload.elements[0].title,
        'Manchester locals open doors to concert-goers stranded after \'terror attack\''
      );
      assert.deepEqual(res.set_attributes, {
        global: {},
        session: { seenItems: [8550116], current: 1234 },
      });
      done();
    });
  });
});
