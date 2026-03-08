import type { Device, Cable } from './types';

// Otestuje přímé kabelové spojení (s možností ignorovat konkrétní port pomocí null)
export function hasLink(cables: Cable[], d1: string, p1: string | null, d2: string, p2: string | null): boolean {
  return cables.some(c => 
    (c.fromDevice === d1 && (p1 === null || c.fromPort === p1) && c.toDevice === d2 && (p2 === null || c.toPort === p2)) ||
    (c.toDevice === d1 && (p1 === null || c.toPort === p1) && c.fromDevice === d2 && (p2 === null || c.fromPort === p2))
  );
}

// Helper for BFS network traversal to check connectivity
export function isConnected(devices: Device[], cables: Cable[], fromId: string, toId: string): boolean {
  return checkPath(devices, cables, fromId, toId) !== null;
}

// Complex BFS that returns path or null and allows testing conditions
export function checkPath(
   devices: Device[], 
   cables: Cable[], 
   startId: string, 
   targetId: string,
   condition?: (device: Device, fromPortId: string, toPortId: string) => boolean
): string[] | null {
  const visited = new Set<string>([startId]);
  const queue: { id: string, path: string[], enterPort: string }[] = [{ id: startId, path: [startId], enterPort: '' }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.id === targetId) return current.path;

    const deviceObj = devices.find(d => d.id === current.id);
    if (!deviceObj) continue;

    // Najdi všechny kabely zapojené do tohoto zařízení
    const connectedCables = cables.filter(c => c.fromDevice === current.id || c.toDevice === current.id);
    
    for (const cable of connectedCables) {
      const isFrom = cable.fromDevice === current.id;
      const neighborId = isFrom ? cable.toDevice : cable.fromDevice;
      const exitPort = isFrom ? cable.fromPort : cable.toPort;

      // Ověříme, zda node samotný propustí data z enterPort do exitPort
      if (condition && current.id !== startId && !condition(deviceObj, current.enterPort, exitPort)) {
         continue; // Podmínka zamítla průtok tímto zařízením pro tyto porty
      }

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        const nextEnterPort = isFrom ? cable.toPort : cable.fromPort;
        queue.push({ id: neighborId, path: [...current.path, neighborId], enterPort: nextEnterPort });
      }
    }
  }

  return null;
}

// Basic engine hook logic can be used in components
