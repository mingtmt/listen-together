export const fetchVideoTitle = async (videoId: string): Promise<string> => {
  try {
    const res = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
    );
    const data = await res.json();
    return data.title || 'This song is not available';
  } catch (e) {
    console.error('Error fetching video title:', e);
    return 'This song is not available';
  }
};
