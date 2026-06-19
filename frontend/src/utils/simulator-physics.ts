export type Direction = 'N' | 'S' | 'E' | 'W';

export interface Vehicle {
  id: string;
  type: 'car' | 'taxi' | 'bus' | 'truck' | 'ambulance';
  x: number; // progress along its path (0 to 1000)
  yOffset: number; // offset to represent lanes
  speed: number;
  maxSpeed: number;
  color: string;
  entry: Direction;
  exit: Direction;
  isEmergency: boolean;
  sirenBlink: boolean;
  waitingTime: number; // accumulated time stopped (in seconds)
  stopped: boolean;
  width: number;
  length: number;
  height: number;
}

export interface TrafficSignal {
  id: Direction;
  state: 'RED' | 'GREEN' | 'YELLOW';
  x: number; // Isometric coordinates of signal
  y: number;
  timer: number; // in seconds
}

export interface SimulationState {
  vehicles: Vehicle[];
  signals: Record<Direction, TrafficSignal>;
  queueLengths: Record<Direction, number>;
  averageWaitTimes: Record<Direction, number>;
  metrics: {
    totalVehicles: number;
    activeSignals: number;
    congestionLevel: number; // 0 to 100
    averageWaitTime: number; // in seconds
    trafficFlowScore: number; // 0 to 100
  };
  emergencyActive: boolean;
  emergencyDirection: Direction | null;
}

// ─── Projection Math ────
// Translates 3D isometric space coordinates (x, y, z) into 2D screen coordinates (px, py)
export const project = (x: number, y: number, z: number, width: number, height: number) => {
  const zoom = 0.55;
  const isoX = (x - y) * Math.cos(Math.PI / 6);
  const isoY = (x + y) * Math.sin(Math.PI / 6);
  
  return {
    x: width / 2 + isoX * zoom,
    y: height / 2.35 + (isoY - z) * zoom
  };
};

// Draw an isometric box (cube/parallelepiped)
export const drawIsoBox = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  z: number,
  w: number, // width along X
  l: number, // length along Y
  h: number, // height along Z
  color: string,
  canvasW: number,
  canvasH: number,
  opacity: number = 1
) => {
  // Vertices
  const p0 = project(x, y, z, canvasW, canvasH);
  const p1 = project(x + w, y, z, canvasW, canvasH);
  const p2 = project(x + w, y + l, z, canvasW, canvasH);
  const p4 = project(x, y, z + h, canvasW, canvasH);
  const p5 = project(x + w, y, z + h, canvasW, canvasH);
  const p6 = project(x + w, y + l, z + h, canvasW, canvasH);
  const p7 = project(x, y + l, z + h, canvasW, canvasH);

  // Helper colors
  const adjustColor = (hex: string, percent: number) => {
    let num = parseInt(hex.replace("#",""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
    return `rgba(${Math.min(255, Math.max(0, R))}, ${Math.min(255, Math.max(0, G))}, ${Math.min(255, Math.max(0, B))}, ${opacity})`;
  };

  const topColor = color.startsWith('rgba') ? color : adjustColor(color, 15);
  const leftColor = color.startsWith('rgba') ? color : adjustColor(color, -10);
  const rightColor = color.startsWith('rgba') ? color : adjustColor(color, -25);

  // Left Face (p0 - p1 - p5 - p4)
  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p5.x, p5.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();
  ctx.fill();

  // Right Face (p1 - p2 - p6 - p5)
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p6.x, p6.y);
  ctx.lineTo(p5.x, p5.y);
  ctx.closePath();
  ctx.fill();

  // Top Face (p4 - p5 - p6 - p7)
  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(p4.x, p4.y);
  ctx.lineTo(p5.x, p5.y);
  ctx.lineTo(p6.x, p6.y);
  ctx.lineTo(p7.x, p7.y);
  ctx.closePath();
  ctx.fill();

  // Outline
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(p4.x, p4.y); ctx.lineTo(p5.x, p5.y); ctx.lineTo(p6.x, p6.y); ctx.lineTo(p7.x, p7.y); ctx.closePath();
  ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p5.x, p5.y); ctx.lineTo(p4.x, p4.y);
  ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p6.x, p6.y);
  ctx.stroke();
};

// ─── Initial Signals Setup ────
export const initSignals = (): Record<Direction, TrafficSignal> => ({
  N: { id: 'N', state: 'RED', x: -50, y: -220, timer: 15 },
  S: { id: 'S', state: 'GREEN', x: 50, y: 220, timer: 15 },
  E: { id: 'E', state: 'RED', x: 220, y: -50, timer: 15 },
  W: { id: 'W', state: 'RED', x: -220, y: 50, timer: 15 },
});

// Calculate wait times and queue lengths
const recalculateTrafficMetrics = (vehicles: Vehicle[], signals: Record<Direction, TrafficSignal>) => {
  const queueLengths = { N: 0, S: 0, E: 0, W: 0 };
  const waitTimesSum = { N: 0, S: 0, E: 0, W: 0 };
  const waitTimesCount = { N: 0, S: 0, E: 0, W: 0 };

  vehicles.forEach((v) => {
    if (v.stopped || v.speed < 0.5) {
      queueLengths[v.entry]++;
      waitTimesSum[v.entry] += v.waitingTime;
      waitTimesCount[v.entry]++;
    }
  });

  const averageWaitTimes = { N: 0, S: 0, E: 0, W: 0 };
  (Object.keys(averageWaitTimes) as Direction[]).forEach((dir) => {
    averageWaitTimes[dir] = waitTimesCount[dir] > 0 ? Math.round(waitTimesSum[dir] / waitTimesCount[dir]) : 0;
  });

  // Global metrics
  const totalVehicles = vehicles.length;
  const activeSignals = Object.values(signals).filter((s) => s.state === 'GREEN').length;
  
  // Calculate Congestion Level based on queue sizes
  const totalQueue = Object.values(queueLengths).reduce((a, b) => a + b, 0);
  const congestionLevel = Math.min(100, Math.round((totalQueue / 18) * 100));
  
  // Flow score is higher if average speed is high and queues are low
  const avgSpeed = vehicles.length > 0 
    ? vehicles.reduce((sum, v) => sum + v.speed, 0) / vehicles.length 
    : 10;
  const trafficFlowScore = Math.max(10, Math.min(100, Math.round((avgSpeed / 10) * 60 + (100 - congestionLevel) * 0.4)));

  return {
    queueLengths,
    averageWaitTimes,
    metrics: {
      totalVehicles,
      activeSignals,
      congestionLevel,
      averageWaitTime: Math.round(vehicles.reduce((sum, v) => sum + v.waitingTime, 0) / Math.max(1, vehicles.length)),
      trafficFlowScore
    }
  };
};

// ─── Simulation Step Update ────
export const updateSimulation = (
  state: SimulationState,
  deltaTime: number // fraction of a second (e.g. 1/60)
): SimulationState => {
  const updatedVehicles = state.vehicles.map((v) => {
    const isRed = state.signals[v.entry].state === 'RED';
    const isYellow = state.signals[v.entry].state === 'YELLOW';
    
    // Stop line coordinates along the path (stop line is at progress ~380)
    const stopLineProgress = 370;
    let targetSpeed = v.maxSpeed;
    let targetStopped = false;

    // Check traffic lights
    if (v.x < stopLineProgress) {
      if (isRed) {
        // Red light: stop at stop line
        const distToStop = stopLineProgress - v.x;
        if (distToStop > 0 && distToStop < 220) {
          targetSpeed = 0;
          if (distToStop < 20) {
            targetStopped = true;
          }
        }
      } else if (isYellow) {
        // Yellow light: slow down if far, or speed through if close
        const distToStop = stopLineProgress - v.x;
        if (distToStop > 80 && distToStop < 200) {
          targetSpeed = v.maxSpeed * 0.4;
        }
      }
    }

    // Check vehicle in front to maintain safe distance
    // Find closest vehicle ahead in the same entry direction and path
    const vehiclesAhead = state.vehicles.filter((other) => {
      if (other.id === v.id) return false;
      if (other.entry !== v.entry) return false;
      // It must be further along the path, but not exited completely
      return other.x > v.x && (other.x - v.x) < 200;
    });

    if (vehiclesAhead.length > 0) {
      // Sort to find the nearest one
      vehiclesAhead.sort((a, b) => a.x - b.x);
      const leadVehicle = vehiclesAhead[0];
      const gap = leadVehicle.x - v.x;
      
      const safeGap = v.type === 'bus' || v.type === 'truck' ? 85 : 55;

      if (gap < safeGap) {
        // Adjust target speed relative to the leader
        targetSpeed = Math.min(targetSpeed, leadVehicle.speed * 0.9);
        if (gap < 25) {
          targetSpeed = 0;
          if (leadVehicle.speed < 0.2) {
            targetStopped = true;
          }
        }
      }
    }

    // Apply physics
    let newSpeed = v.speed;
    if (newSpeed < targetSpeed) {
      newSpeed += 4.5 * deltaTime; // Accelerate
      if (newSpeed > targetSpeed) newSpeed = targetSpeed;
    } else if (newSpeed > targetSpeed) {
      newSpeed -= 9.5 * deltaTime; // Decelerate/brake faster
      if (newSpeed < targetSpeed) newSpeed = targetSpeed;
    }

    if (newSpeed < 0) newSpeed = 0;

    const newX = v.x + newSpeed * 60 * deltaTime;

    // Track wait times
    let newWait = v.waitingTime;
    if (newSpeed < 0.2) {
      newWait += deltaTime;
    } else {
      newWait = Math.max(0, newWait - deltaTime * 0.5); // decay wait time slowly once moving
    }

    // Handle siren blinking for ambulance
    let newSirenBlink = v.sirenBlink;
    if (v.isEmergency && Math.floor(newX / 20) % 2 === 0) {
      newSirenBlink = !newSirenBlink;
    }

    return {
      ...v,
      x: newX,
      speed: newSpeed,
      waitingTime: newWait,
      stopped: targetStopped,
      sirenBlink: newSirenBlink,
    };
  });

  // Filter out vehicles that have fully traversed the screen (progress > 1000)
  const activeVehicles = updatedVehicles.filter((v) => v.x < 1000);

  // Recalculate queue lengths and statistics
  const { queueLengths, averageWaitTimes, metrics } = recalculateTrafficMetrics(
    activeVehicles,
    state.signals
  );

  return {
    ...state,
    vehicles: activeVehicles,
    queueLengths,
    averageWaitTimes,
    metrics
  };
};

// ─── Generate Spelled Coordinates on Path ────
// Interpolate a 3D isometric position based on entry, exit, and progress x (0 to 1000)
export const getPositionOnPath = (
  entry: Direction,
  exit: Direction,
  progress: number,
  yOffset: number = 0
): { x: number; y: number; z: number } => {
  // Center coordinates of the junction are (0, 0)
  // Incoming paths spawn at -500 or +500 along their active axis, approach center (0,0), then exit.
  
  // Outer boundaries
  const startDist = 550;
  const exitDist = 550;
  const stopDist = 60; // intersection boundary
  
  let x = 0;
  let y = 0;
  let z = 0;

  // Let's model a straight-through flow with lane offset for simple clean paths
  // If entry = N (approaches from -Y towards center)
  // If entry = S (approaches from +Y towards center)
  // If entry = W (approaches from -X towards center)
  // If entry = E (approaches from +X towards center)

  if (progress <= 400) {
    // Stage 1: Pre-intersection approach
    const ratio = progress / 400; // 0 to 1
    const currentDist = startDist - ratio * (startDist - stopDist);
    
    if (entry === 'N') { y = -currentDist; x = -15 + yOffset; }
    else if (entry === 'S') { y = currentDist; x = 15 + yOffset; }
    else if (entry === 'W') { x = -currentDist; y = 15 + yOffset; }
    else if (entry === 'E') { x = currentDist; y = -15 + yOffset; }
  } 
  else if (progress <= 600) {
    // Stage 2: In the junction / turning / roundabout
    const ratio = (progress - 400) / 200; // 0 to 1
    
    // For a roundabout: cars enter a circular track. Let's interpolate around a circle!
    // Roundabout radius = 50
    let startAngle = 0;
    let endAngle = 0;

    if (entry === 'N') startAngle = Math.PI;
    else if (entry === 'S') startAngle = 0;
    else if (entry === 'W') startAngle = Math.PI / 2;
    else if (entry === 'E') startAngle = 3 * Math.PI / 2;

    // Exit angles
    if (exit === 'N') endAngle = Math.PI;
    else if (exit === 'S') endAngle = 0;
    else if (exit === 'W') endAngle = Math.PI / 2;
    else if (exit === 'E') endAngle = 3 * Math.PI / 2;

    // Handle wrap-around of angles for smooth rotation (clockwise direction)
    if (endAngle <= startAngle) {
      endAngle += Math.PI * 2;
    }
    
    // Add extra sweep to make it turn along the roundabout circle
    const currentAngle = startAngle + (endAngle - startAngle) * ratio;
    const radius = 45 + yOffset;

    x = Math.cos(currentAngle) * radius;
    y = Math.sin(currentAngle) * radius;
    
    // Slight rise in center (Z-axis) for nice visual look
    z = Math.sin(ratio * Math.PI) * 4;
  } 
  else {
    // Stage 3: Exit path
    const ratio = (progress - 600) / 400; // 0 to 1
    const currentDist = stopDist + ratio * (exitDist - stopDist);

    if (exit === 'N') { y = -currentDist; x = -15 + yOffset; }
    else if (exit === 'S') { y = currentDist; x = 15 + yOffset; }
    else if (exit === 'W') { x = -currentDist; y = 15 + yOffset; }
    else if (exit === 'E') { x = currentDist; y = -15 + yOffset; }
  }

  return { x, y, z };
};

// ─── Procedural Visual Renderers ────

// Render the isometric grid background
export const drawJunctionBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  // Background solid
  ctx.fillStyle = '#06080c';
  ctx.fillRect(0, 0, width, height);

  // Draw grass areas (corners)
  const drawCornerZone = (cx: number, cy: number, size: number) => {
    ctx.fillStyle = '#081c15';
    ctx.strokeStyle = '#1b4332';
    ctx.lineWidth = 1;

    ctx.beginPath();
    const p0 = project(cx - size, cy - size, 0, width, height);
    const p1 = project(cx + size, cy - size, 0, width, height);
    const p2 = project(cx + size, cy + size, 0, width, height);
    const p3 = project(cx - size, cy + size, 0, width, height);

    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Draw grass grids
  drawCornerZone(-300, -300, 200);
  drawCornerZone(300, -300, 200);
  drawCornerZone(300, 300, 200);
  drawCornerZone(-300, 300, 200);

  // Draw Roads (X & Y corridors)
  ctx.fillStyle = '#11141a';
  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 2;

  // Horizontal Corridor (East-West)
  ctx.beginPath();
  const ew0 = project(-600, -35, 0, width, height);
  const ew1 = project(600, -35, 0, width, height);
  const ew2 = project(600, 35, 0, width, height);
  const ew3 = project(-600, 35, 0, width, height);
  ctx.moveTo(ew0.x, ew0.y); ctx.lineTo(ew1.x, ew1.y); ctx.lineTo(ew2.x, ew2.y); ctx.lineTo(ew3.x, ew3.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Vertical Corridor (North-South)
  ctx.beginPath();
  const ns0 = project(-35, -600, 0, width, height);
  const ns1 = project(35, -600, 0, width, height);
  const ns2 = project(35, 600, 0, width, height);
  const ns3 = project(-35, 600, 0, width, height);
  ctx.moveTo(ns0.x, ns0.y); ctx.lineTo(ns1.x, ns1.y); ctx.lineTo(ns2.x, ns2.y); ctx.lineTo(ns3.x, ns3.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Roundabout Circle (Center Island)
  ctx.fillStyle = '#1e2430';
  ctx.beginPath();
  // Draw circular coordinates projected
  for (let i = 0; i <= 36; i++) {
    const angle = (i * Math.PI * 2) / 36;
    const r = 55;
    const p = project(Math.cos(angle) * r, Math.sin(angle) * r, 0, width, height);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Roundabout Inner Hub (Solar tower base)
  ctx.fillStyle = '#081c15';
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i <= 36; i++) {
    const angle = (i * Math.PI * 2) / 36;
    const r = 30;
    const p = project(Math.cos(angle) * r, Math.sin(angle) * r, 0, width, height);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Core Tower (Solar Hub Tower)
  drawIsoBox(ctx, -10, -10, 0, 20, 20, 40, '#102a43', width, height); // Tower Base
  drawIsoBox(ctx, -6, -6, 40, 12, 12, 35, '#00ff88', width, height); // Glowing Core
  drawIsoBox(ctx, -8, -8, 75, 16, 16, 4, '#334e68', width, height); // Top cap

  // Draw Dashed Lane Dividers
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 12]);

  // Dash lines along North/South/East/West entry lanes
  const drawLaneDash = (sx: number, sy: number, ex: number, ey: number) => {
    ctx.beginPath();
    const pStart = project(sx, sy, 0, width, height);
    const pEnd = project(ex, ey, 0, width, height);
    ctx.moveTo(pStart.x, pStart.y);
    ctx.lineTo(pEnd.x, pEnd.y);
    ctx.stroke();
  };

  drawLaneDash(0, -600, 0, -80);
  drawLaneDash(0, 80, 0, 600);
  drawLaneDash(-600, 0, -80, 0);
  drawLaneDash(80, 0, 600, 0);

  ctx.setLineDash([]); // Reset line dash
  
  // Stop lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;

  const drawStopLine = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    const p1 = project(x1, y1, 0, width, height);
    const p2 = project(x2, y2, 0, width, height);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  };

  drawStopLine(-35, -80, 0, -80); // N stop line
  drawStopLine(0, 80, 35, 80);   // S stop line
  drawStopLine(-80, 0, -80, 35);   // W stop line
  drawStopLine(80, -35, 80, 0);   // E stop line
};

// Draw a Solar Signal Pole
export const drawSignalPole = (
  ctx: CanvasRenderingContext2D,
  signal: TrafficSignal,
  canvasW: number,
  canvasH: number,
  isActive: boolean = false
) => {
  const { x, y, state } = signal;
  const poleHeight = 65;

  // Draw the pole (grey box)
  drawIsoBox(ctx, x - 2, y - 2, 0, 4, 4, poleHeight, '#3e4c59', canvasW, canvasH);

  // Draw the signal head (dark housing block on top)
  const headSize = 8;
  const headHeight = 16;
  const headZ = poleHeight;
  drawIsoBox(ctx, x - 4, y - 4, headZ, headSize, headSize, headHeight, '#1f2933', canvasW, canvasH);

  // Draw Solar Panel on top of housing
  // Angled panel
  drawIsoBox(ctx, x - 6, y - 6, headZ + headHeight, 12, 12, 1.5, '#0f2b46', canvasW, canvasH);

  // Projection coordinate of signal lights
  const lightCenterY = headZ + headHeight / 2;
  const pLight = project(x, y, lightCenterY, canvasW, canvasH);

  // Glowing Signal light colors
  let lightColor = '#520808'; // dimmed red
  let glowColor = 'rgba(255, 59, 48, 0)';

  if (state === 'RED') {
    lightColor = '#ff3b30';
    glowColor = 'rgba(255, 59, 48, 0.8)';
  } else if (state === 'GREEN') {
    lightColor = '#00ff88';
    glowColor = 'rgba(0, 255, 136, 0.8)';
  } else if (state === 'YELLOW') {
    lightColor = '#ffaa00';
    glowColor = 'rgba(255, 170, 0, 0.8)';
  }

  // Draw light glow aura
  ctx.beginPath();
  const grad = ctx.createRadialGradient(pLight.x, pLight.y, 1, pLight.x, pLight.y, isActive ? 22 : 12);
  grad.addColorStop(0, glowColor);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.arc(pLight.x, pLight.y, isActive ? 22 : 12, 0, Math.PI * 2);
  ctx.fill();

  // Draw main bulb
  ctx.fillStyle = lightColor;
  ctx.beginPath();
  ctx.arc(pLight.x, pLight.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Hover rings if signal is active / clicked
  if (isActive) {
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pLight.x, pLight.y, 10 + Math.sin(Date.now() / 150) * 3, 0, Math.PI * 2);
    ctx.stroke();
  }
};
