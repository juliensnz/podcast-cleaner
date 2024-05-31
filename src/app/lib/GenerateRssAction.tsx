'use server';

import Parser from 'rss-parser';

let parser = new Parser();

const generateRssAction = async (previousState: FormDataEntryValue | null, formData: FormData) => {
  'use server';

  if (!formData.has('url')) {
    console.log('no url');
    return previousState;
  }

  const url = formData.get('url');
  if (!url || url === previousState) {
    console.log('invalid url');
    return previousState;
  }

  const feed = await parser.parseURL(url as string);

  console.log(feed.items);

  return url;
};

export {generateRssAction};
