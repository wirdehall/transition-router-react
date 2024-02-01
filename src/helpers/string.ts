export const trimString = (str: string, trimStr: string) => {
  const escapedStr = trimStr.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  return str.replace(new RegExp('^[' + escapedStr + ']+|[' + escapedStr + ']+$', 'g'), '');
};