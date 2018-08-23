Chatfuel Feed Reader
====================

An RSS reader for the [ABC News Facebook Messenger bot](https://www.messenger.com/t/abcnews.au) and [Chatfuel](https://chatfuel.com/).

![Example card showing Aurora Australis story](assets/example-card.png)

Setup
-----
This app is intended for use with Google Cloud Functions. General setup:

* Set requisite env vars (see below - or keep defaults in config.js)
* Deploy to Google Cloud Functions as a HTTP trigger 
* Set up in Chatfuel as a JSON API endpoint, sending through the Chatfuel vars (see below)

Create a feed in Chatfuel
-------------------------
Once the feed reader has been set up (see above), you can create feeds in
Chatfuel by doing the following:

1. Create a new block
2. Add a `Set up user attribute` card
3. Set the user attribute `feed_current` to the ID of the ABC News feed you wish to use. This is the number portion of the RSS feed URL
4. Add a `Go to block` linking to the RSS Reader block

Now when a user lands on your block they will have the RSS feed set and be
redirected to the RSS feed reader. 

Environment Variables
---------------------
The following environment variables need to be set.

Variable               | Description          | Example value       
-----------------------|----------------------|---------------------
CHATFEED_BASEURL       | The base URL for feeds to be fetched from. | http://www.abc.net.au/
CONTENT_READ_THE_STORY | Text for the button which links to the full article. | Read the story      
CONTENT_NEXT_STORY     | Text for the button which shows the next story | Next story          
CONTENT_IM_DONE        | Text for the button that shows when there are no more stories. Redirects to `BLOCK_IM_DONE`. | Thanks, I'm done    
BLOCK_IM_DONE          | The name of the block in Chatfuel which the `CONTENT_IM_DONE` button redirects to. This might be a "more topics" block.
READER_BLOCK_NAME      | Name of the Chatfuel block that contains the JSON endpoint. This is the block the "next story" button redirects to. |                     

Chatfuel variables
------------------
When launching the feed reader via the Chatfuel JSON plugin, the following three variables must be sent:

Variable              | Description         
----------------------|---------------------
feed_current          | The ID for the feed the reader should read
_feed_current_session | Private JSON configuration for the user's feed reader session.
_feed_global_session  | Private JSON configuration for all the user's feed sessions

To start a feed reader session, you should set the `feed_current` variable to the ID of the feed to read. The remaining variables are set by the feed reader itself, and only need to be passed back.

Authors
-------
* [Ash Kyd](https://github.com/AshKyd)
* [Joshua Byrd](https://github.com/phocks)
