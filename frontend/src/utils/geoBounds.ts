export const UF_BOUNDING_BOXES: Record<string, [number, number, number, number]> = {
  AC: [-73.991, -11.145, -66.62, -7.112],
  AL: [-38.238, -10.5, -35.153, -8.813],
  AM: [-73.801, -9.818, -56.097, 2.246],
  AP: [-54.876, -1.236, -49.876, 4.437],
  BA: [-46.617, -18.349, -37.341, -8.534],
  CE: [-41.424, -7.858, -37.253, -2.784],
  DF: [-48.287, -16.052, -47.308, -15.5],
  ES: [-41.88, -21.302, -39.666, -17.892],
  GO: [-53.251, -19.499, -45.907, -12.396],
  MA: [-48.755, -10.262, -41.797, -1.045],
  MG: [-51.046, -22.923, -39.857, -14.233],
  MS: [-58.168, -24.068, -50.923, -17.167],
  MT: [-61.633, -18.042, -50.225, -7.349],
  PA: [-58.898, -9.841, -46.061, 2.591],
  PB: [-38.765, -8.303, -34.794, -6.026],
  PE: [-41.358, -9.483, -32.392, -3.83],
  PI: [-45.994, -10.929, -40.371, -2.739],
  RJ: [-44.889, -23.368, -40.957, -20.764],
  RN: [-38.582, -6.983, -34.969, -4.832],
  RO: [-66.806, -13.694, -59.774, -7.969],
  RR: [-64.825, -1.581, -58.887, 5.272],
  RS: [-57.644, -33.752, -49.692, -27.081],
  SC: [-53.836, -29.351, -48.359, -25.956],
  SE: [-38.245, -11.569, -36.394, -9.515],
  TO: [-50.742, -13.468, -45.698, -5.168],
  PR: [-54.62, -26.717, -48.024, -22.517],
  SP: [-53.11, -25.31, -44.162, -19.78],
}

/**
 * Retorna as siglas das UFs cujo bounding box intersecta o viewport atual do mapa.
 */
export function getVisibleUfs(west: number, south: number, east: number, north: number): string[] {
  const visible: string[] = []
  for (const [uf, [minX, minY, maxX, maxY]] of Object.entries(UF_BOUNDING_BOXES)) {
    // Check rectangle overlap
    const noOverlap = west > maxX || east < minX || south > maxY || north < minY
    if (!noOverlap) {
      visible.push(uf)
    }
  }
  return visible
}
