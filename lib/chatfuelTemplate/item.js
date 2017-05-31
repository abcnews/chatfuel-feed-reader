module.exports = function templateItem(item, nextItem, config) {
  // Chose the "next" block to show.
  let nextBlock;
  if (nextItem) {
    // Read the next story
    nextBlock = {
      type: 'show_block',
      block_name: config.READER_BLOCK_NAME,
      title: config.CONTENT_NEXT_STORY,
    };
  } else {
    // Thanks, I'm done!
    nextBlock = {
      type: 'show_block',
      block_name: config.BLOCK_IM_DONE,
      title: config.CONTENT_IM_DONE,
    };
  }

  return {
    messages: [
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: item.title,
                image_url: item.image,
                subtitle: item.description,
                buttons: [
                  {
                    type: 'web_url',
                    url: item.link,
                    title: config.CONTENT_READ_THE_STORY,
                  },
                  nextBlock,
                ],
              },
            ],
          },
        },
      },
    ],
  };
};
