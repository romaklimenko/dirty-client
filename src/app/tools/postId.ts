export function postId(url: string): string {
  const match = url.split('#')[0].match(/(\d+)(?!.*\d)/);
  return match === null ? null : match[0];
}
