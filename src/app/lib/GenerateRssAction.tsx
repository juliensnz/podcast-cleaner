'use server';

import {RuntimeError} from '@/utils/error';

const extractPodcastId = (url: string): string | null => {
  const regex = /https:\/\/podcasts.apple.com(.*)id(?<podcastId>\d*)$/;
  const result = url.match(regex);

  if (!result) {
    return null;
  }

  const {
    groups: {podcastId},
  } = result as unknown as {groups: {podcastId: string}};

  return podcastId;
};

const getFeedUrl = async (podcastId: string): Promise<string> => {
  const url = `https://itunes.apple.com/lookup?id=${podcastId}&media=podcast`;
  console.log(url);
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);

  return data.results[0].feedUrl;
};

const isXmlFeed = (url: string) => url.toString().endsWith('.xml');

type GenerateRssActionState = {url: string; error: RuntimeError | null; feedUrl: string | null};
const generateRssAction = async (
  _previousState: GenerateRssActionState,
  formData: FormData
): Promise<GenerateRssActionState> => {
  'use server';

  if (!formData.has('url')) {
    return {
      url: '',
      error: {
        type: 'generate_rss.no_url',
        message: 'No URL provided',
      },
      feedUrl: null,
    };
  }

  const url = formData.get('url');
  if (null === url) {
    return {
      url: '',
      error: {
        type: 'generate_rss.invalid_url',
        message: 'Invalid URL provided',
      },
      feedUrl: null,
    };
  }

  if (isXmlFeed(url as string)) {
    return {
      url: url as string,
      error: null,
      feedUrl: url as string,
    };
  }

  const podcastId = extractPodcastId(url as string);

  if (!podcastId) {
    return {
      url: url as string,
      error: null,
      feedUrl: null,
    };
  }

  const feedUrl = await getFeedUrl(podcastId);

  if (!feedUrl) {
    return {
      url: url as string,
      error: null,
      feedUrl: null,
    };
  }

  return {
    url: url as string,
    error: null,
    feedUrl: feedUrl as string,
  };
};

export {generateRssAction};
