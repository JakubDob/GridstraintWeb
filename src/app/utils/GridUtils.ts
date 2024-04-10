export function getRandomColor() {
  return `rgb(${Math.random() * 255} ${Math.random() * 255} ${
    Math.random() * 255
  })`;
}

export function getDistinctColor(rangeSize: number, i: number) {
  const hue = Math.floor(360 * (i / rangeSize));
  return `hsl(${hue}, 100%, 50%)`;
}
