export const matchIgnoreCase = (str, keyword) => {
  const strIgnored = str?.toLowerCase() || '';
  const keywordIgnored = keyword?.toLowerCase() || '';

  if (!strIgnored || !keywordIgnored) return false;

  return strIgnored?.includes(keywordIgnored);
};
