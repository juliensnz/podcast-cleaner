import {propertyUpdater} from '@/utils/property';
import {XMLParser, XMLBuilder} from 'fast-xml-parser';
import {NextResponse} from 'next/server';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});
const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

// Function to calculate the mean
const calculateMean = (values: number[]) => {
  const sum = values.reduce((acc, val) => acc + val, 0);

  return sum / values.length;
};

// Function to calculate the standard deviation
const calculateStandardDeviation = (values: number[], mean: number) => {
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
};

// Calculate mean and standard deviation
const getThreshold = (durations: number[]) => {
  const mean = calculateMean(durations);
  const stdDev = calculateStandardDeviation(durations, mean);

  return mean + 2 * stdDev;
};

// const pad = (value: number): string => value.toString().padStart(2, '0');

// const formatTime = (seconds: number) => {
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const remainingSeconds = seconds % 60;

//   return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
// };

const parseDuration = (duration: string): number => {
  const regex = /((?<hours>\d\d):)*(?<minutes>\d\d):(?<seconds>\d\d)/;
  const result = duration.match(regex);

  if (!result) {
    return 0;
  }

  const {
    groups: {hours = '00', minutes = '00', seconds = '00'},
  } = result as unknown as {groups: {hours: string; minutes: string; seconds: string}};

  return parseInt(hours) * 60 * 60 + parseInt(minutes) * 60 + parseInt(seconds);
};

const GET = async (request: Request) => {
  const {searchParams} = new URL(request.url);
  const url = searchParams.get('url');
  console.log(url);

  if (!url) {
    return Response.error();
  }

  const response = await fetch(url as string);

  if (!response.ok) {
    return Response.error();
  }

  const xml = await response.text();

  const feed = parser.parse(xml);

  const durations = feed.rss.channel.item
    .map((item: Record<string, string>) => item['itunes:duration'])
    .map(parseDuration);

  const threshold = getThreshold(durations);

  const updatedFeed = propertyUpdater(
    feed,
    'rss.channel.item',
    feed.rss.channel.item.filter((item: Record<string, string>) => {
      const duration = parseDuration(item['itunes:duration']);

      return duration > threshold;
    })
  );

  const xmlContent = builder.build(updatedFeed);

  const xmlResponse = new NextResponse(xmlContent, {headers: {'Content-Type': 'application/xml'}});

  return xmlResponse;
};

export {GET};
