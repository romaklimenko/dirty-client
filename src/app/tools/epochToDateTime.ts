export function epochToDateTime(epoch: number) {
  return new Date(epoch * 1000);
}
