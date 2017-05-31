Chatfuel Feed Reader
====================

An RSS reader for the [ABC News Facebook Messenger bot](https://www.messenger.com/t/abcnews.au).

![Example card showing Aurora Australis story](assets/example-card.png)

Usage
-----

This app is intended for use in AWS Lambda. General setup:

* Configure this app as an AWS Lambda
* Set requisite env vars (see below)
* Expose via a web gateway
* Set up in ChatFuel as a JSON API endpoint, sending through the chatfuel vars (see below)

Environment Variables
---------------------
The following environment variables need to be set.

Variable             | Description          | Example value       
---------------------|----------------------|---------------------
CHATFEED_BASEURL     | The base URL for feeds to be fetched from. | http://www.abc.net.au/
CONTENT_READ_THE_STORY | Text for the button which links to the full article. | Read the story      
CONTENT_NEXT_STORY   | Text for the button which shows the next story | Next story          
CONTENT_IM_DONE      | Text for the button that shows when there are no more stories. Redirects to `BLOCK_IM_DONE`. | Thanks, I'm done    
BLOCK_IM_DONE        | The name of the block in Chatfuel which the `CONTENT_IM_DONE` button redirects to. This might be a "more topics" block.
READER_BLOCK_NAME    | Name of the Chatfuel block that contains the JSON endpoint. This is the block the "next story" button redirects to. |                     

Chatfuel variables
------------------
When launching the feed reader via the Chatfuel JSON plugin, the following three variables must be sent:

Variable             | Description         
---------------------|---------------------
feed_current         | The ID for the feed the reader should read
_feed_current_session | Private JSON configuration for the user's feed reader session.
_feed_global_session | Private JSON configuration for all the user's feed sessions

To start a feed reader session, you should set the `feed_current` variable to the ID of the feed to read. The remaining variables are set by the feed reader itself, and only need to be passed back.
