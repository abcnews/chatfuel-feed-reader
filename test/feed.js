/* eslint-env node, mocha */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const feed = require('../lib/feed');

describe('feed', () => {
  describe('cmId2URL', () => {
    before(() => {
      process.env.CHATFEED_BASEURL = 'http://www.abc.net.au';
    });
    [0, null, -1].forEach((input) => {
      it(`should return false on input "${input}"`, () => {
        const result = feed.cmId2URL(input);
        assert.deepEqual(result, false);
      });
    });

    it('should return a url for a positive integer', () => {
      const result = feed.cmId2URL('999');
      assert.deepEqual(result, 'http://www.abc.net.au/news/feed/999/rss.xml');
    });
  });

  describe('parse', () => {
    let parsed;
    before(() => {
      const xml = fs.readFileSync(path.join(__dirname, './assets/justin.xml'), 'utf8');
      parsed = feed.parse(xml);
    });
    it('should parse', () => {
      assert.deepEqual(typeof parsed, 'object');
      assert.deepEqual(parsed[0], {
        id: 8550116,
        title: 'Manchester locals open doors to concert-goers stranded after \'terror attack\'',
        description: 'Manchester locals open their doors and offer transport to people stranded after a suspected terrorist incident at an Ariana Grande concert, with the nearby train station shut down.',
        link: 'http://www.abc.net.au/news/2017-05-23/manchester-arena-terror-attack-locals-offer-accommodation/8550116',
        image: 'http://www.abc.net.au/news/image/8549714-16x9-2150x1210.jpg',
      });
    });

    it('should decode entities', () => {
      const ampersands = parsed.find(post => post.id === 8548218);
      if (!ampersands) throw new Error('can\'t find ampersands post');
      assert.deepEqual(ampersands, {
        id: 8548218,
        title: 'S&P downgrades banks on property crash risk',
        description: 'Ratings agency S&P Global is downgrading almost all financial institutions in Australia because they face an "increased risk of a sharp correction in property prices".',
        link: 'http://www.abc.net.au/news/2017-05-22/sp-downgrades-banks-credit-rating-on-property-crash-risk/8548218',
        image: 'http://www.abc.net.au/news/image/183026-16x9-2150x1210.jpg',
      });
    });
  });
});
