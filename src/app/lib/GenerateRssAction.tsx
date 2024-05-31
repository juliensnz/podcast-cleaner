'use server';

import Parser from 'rss-parser';

let parser = new Parser();

const generateRssAction = async (previousState: FormDataEntryValue | null, formData: FormData) => {
  'use server';

  if (!formData.has('url')) {
    return previousState;
  }

  const url = formData.get('url');
  if (!url || url === previousState) {
    return previousState;
  }

  try {
    const feed = await parser.parseURL(url as string);

    console.log(feed.items);

    return url;
  } catch (error) {
    return previousState;
  }
};

export {generateRssAction};
