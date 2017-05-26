const he = require('he');
const cheerio = require('cheerio');
const request = require('request');
const striptags = require('striptags');

// Get the resolution of a media item
function getResolution($item){
  return Number($item.attr('width') || 0) * Number($item.attr('height') || 0);
}

function removeHTML(string){
  return striptags(he.decode(string));
}

const feedModule = module.exports = {
  cmId2URL: function(cmId){
    if(isNaN(Number(cmId)) || cmId < 1) return false;
    return `${process.env.CHATFEED_BASEURL}/news/feed/${Number(cmId)}/rss.xml`;
  },
  parse: function(xml){
    const $ = cheerio.load(xml, {
      normalizeWhitespace: true,
      xmlMode: true
    });

    return $('channel > item').map(function(){
      // Find the largest image.
      const mediaItems = $(this).find('media\\:content');
      let largestMedia;
      if(mediaItems.length > 0){
        largestMedia = mediaItems.toArray().reduce((prev, next) => {
          if(getResolution($(next)) > getResolution($(prev))) return next;
          return prev;
        });
        largestMedia = $(largestMedia).attr('url').trim();
      }

      const link = $(this).find('link').text().trim() || 'http://www.abc.net.au/news/';
      const cmId = link.match(/(\d*)$/)[0];


      // return json object
      return {
        id: Number(cmId),
        title: $(this).find('title').text().trim(),
        description: removeHTML($(this).find('description').text().trim()),
        link: link,
        image: largestMedia,
      };
    }).get();
  },
  load: function(cmId, callback){
    const url = feedModule.cmId2URL(cmId);
    if(!url) return callback(new Error('Invalid cmId'));
    request.get(url, function(error, response, body){
      if(error) return callback(error);
      const parsed = feedModule.parse(body.toString());
      if(!parsed) return callback(new Error('Could not parse feed'));
      callback(null, parsed);
    });
  }
}
