"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- Game Settings ---
const CAR_COLOR = '#E53E3E'; // Red car
const RUMBLE_COLOR_LIGHT = '#DDDDDD';
const RUMBLE_COLOR_DARK = '#D21818';
const ROAD_COLOR_LIGHT = '#B0B0B0';
const ROAD_COLOR_DARK = '#A0A0A0';
const GRASS_COLOR_LIGHT = '#4CAF50';
const GRASS_COLOR_DARK = '#459C48';
const SKY_COLOR = '#42A5F5';
const TREE_TRUNK_COLOR = '#8D6E63';
const TREE_LEAVES_COLOR = '#66BB6A';

export function CarRacingUI() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const cleanupRef = useRef<() => void>(() => {});

  const gameLoop = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // --- Game State ---
    const state = {
      player: {
        x: 0,
        y: 0,
        z: 0,
        speed: 0,
        maxSpeed: 1200,
        acceleration: 200,
        braking: -600,
        deceleration: -100,
        turnSpeed: 3,
        centrifugal: 0.3,
        offRoadDecel: -400,
        offRoadLimit: 200,
      },
      camera: {
        height: 1000,
        fieldOfView: 100,
        depth: 0, // distance from camera to screen
      },
      road: {
        length: 500,
        rumbleLength: 3,
        segmentLength: 200,
        lanes: 3,
        width: 2000,
        segments: [] as any[]
      },
      keys: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
      },
      lapTime: 0,
      totalTime: 0,
    };
    
    let lastTime = performance.now();

    // --- Helper Functions ---
    const project = (p: {world: {x: number, y: number, z: number}, camera: {x:number, y:number, z:number}, screen: {x:number, y:number, w: number}}, cameraX: number, cameraY: number, cameraZ: number) => {
      p.camera.x = (p.world.x || 0) - cameraX;
      p.camera.y = (p.world.y || 0) - cameraY;
      p.camera.z = (p.world.z || 0) - cameraZ;
      const scale = state.camera.depth / p.camera.z;
      p.screen.x = Math.round((canvas.width / 2) + (scale * p.camera.x * (canvas.width / 2)));
      p.screen.y = Math.round((canvas.height / 2) - (scale * p.camera.y * (canvas.height / 2)));
      p.screen.w = Math.round((scale * state.road.width * (canvas.width / 2)));
    };

    const drawSegment = (p1: any, p2: any) => {
        const lanes = state.road.lanes;
        const r1 = getRumbleWidth(p1.screen.w, lanes);
        const r2 = getRumbleWidth(p2.screen.w, lanes);
        const l1 = getLaneMarkerWidth(p1.screen.w, lanes);
        const l2 = getLaneMarkerWidth(p2.screen.w, lanes);

        // Grass
        ctx.fillStyle = p1.color.grass;
        ctx.fillRect(0, p2.screen.y, canvas.width, p1.screen.y - p2.screen.y);

        // Rumble strips
        drawPolygon(p1.screen.x - p1.screen.w - r1, p1.screen.y, p1.screen.x - p1.screen.w, p1.screen.y, p2.screen.x - p2.screen.w, p2.screen.y, p2.screen.x - p2.screen.w - r2, p2.screen.y, p1.color.rumble);
        drawPolygon(p1.screen.x + p1.screen.w + r1, p1.screen.y, p1.screen.x + p1.screen.w, p1.screen.y, p2.screen.x + p2.screen.w, p2.screen.y, p2.screen.x + p2.screen.w + r2, p2.screen.y, p1.color.rumble);
        
        // Road
        drawPolygon(p1.screen.x - p1.screen.w, p1.screen.y, p1.screen.x + p1.screen.w, p1.screen.y, p2.screen.x + p2.screen.w, p2.screen.y, p2.screen.x - p2.screen.w, p2.screen.y, p1.color.road);

        // Lane markers
        if (p1.color.lane) {
            const lanew1 = p1.screen.w * 2 / lanes;
            const lanew2 = p2.screen.w * 2 / lanes;
            let lanex1 = p1.screen.x - p1.screen.w + lanew1;
            let lanex2 = p2.screen.x - p2.screen.w + lanew2;
            for (let lane = 1; lane < lanes; lanex1 += lanew1, lanex2 += lanew2, lane++) {
                drawPolygon(lanex1 - l1 / 2, p1.screen.y, lanex1 + l1 / 2, p1.screen.y, lanex2 + l2 / 2, p2.screen.y, lanex2 - l2 / 2, p2.screen.y, p1.color.lane);
            }
        }
    };
    
    const drawPolygon = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.closePath();
        ctx.fill();
    };

    const getRumbleWidth = (projectedRoadWidth: number, lanes: number) => projectedRoadWidth / Math.max(6, 2 * lanes);
    const getLaneMarkerWidth = (projectedRoadWidth: number, lanes: number) => projectedRoadWidth / Math.max(32, 8 * lanes);
    
    const update = (dt: number) => {
      const { player, road } = state;
      const speedPercent = player.speed / player.maxSpeed;
      const dx = dt * state.player.turnSpeed * speedPercent;

      player.z = (player.z + dt * player.speed) % (road.length * road.segmentLength);

      // Acceleration / Braking
      if (state.keys.ArrowUp) player.speed += state.player.acceleration * dt;
      else if (state.keys.ArrowDown) player.speed += state.player.braking * dt;
      else player.speed += state.player.deceleration * dt;
      
      // Turning
      if (state.keys.ArrowLeft) player.x -= dx;
      if (state.keys.ArrowRight) player.x += dx;
      
      // Centrifugal force
      const playerSegment = road.segments[Math.floor((player.z / road.segmentLength)) % road.length];
      player.x -= (dx * speedPercent * playerSegment.curve * state.player.centrifugal);
      
      // Clamp speed
      player.speed = Math.max(0, Math.min(player.speed, player.maxSpeed));
      
      // Off-road
      if ((Math.abs(player.x) > road.width) && (player.speed > player.offRoadLimit)) {
          player.speed += player.offRoadDecel * dt;
      }
      
      // Update camera depth
      state.camera.depth = 1 / Math.tan((state.camera.fieldOfView / 2) * Math.PI / 180);
      state.totalTime += dt;
    };
    
    const render = () => {
      const { player, camera, road } = state;
      const playerSegment = road.segments[Math.floor(player.z / road.segmentLength) % road.length];
      const playerPercent = (player.z % road.segmentLength) / road.segmentLength;
      const playerY = playerSegment.p1.world.y + (playerSegment.p2.world.y - playerSegment.p1.world.y) * playerPercent;
      let cameraX = player.x * road.width;
      const cameraY = camera.height + playerY;
      let cameraZ = player.z;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = SKY_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      let maxy = canvas.height;

      for (let n = 0; n < 300; n++) {
        const i = (Math.floor(player.z / road.segmentLength) + n) % road.length;
        const segment = road.segments[i];
        
        const looped = i < Math.floor(player.z / road.segmentLength);
        const cameraZOffset = looped ? road.length * road.segmentLength : 0;
        
        const camZ = cameraZ - (looped ? road.length * road.segmentLength : 0);

        project(segment.p1, cameraX - playerSegment.curve * playerPercent * road.segmentLength * state.player.centrifugal * road.width, cameraY, camZ);
        project(segment.p2, cameraX - playerSegment.curve * playerPercent * road.segmentLength * state.player.centrifugal * road.width, cameraY, camZ);

        segment.clipped = segment.p1.camera.z <= camera.depth || segment.p2.screen.y >= segment.p1.screen.y || segment.p2.screen.y >= maxy;
        
        if (!segment.clipped) {
           drawSegment(segment.p1, segment.p2);
           maxy = segment.p1.screen.y;
        }
      }
      
      // Draw car
      ctx.fillStyle = CAR_COLOR;
      ctx.fillRect(canvas.width / 2 - 15, canvas.height - 60, 30, 40); // Simple car rectangle

      // Draw HUD
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.fillText(`Speed: ${Math.round(player.speed/10)} km/h`, 10, 30);
      ctx.fillText(`Lap: ${(state.totalTime / 60).toFixed(2)}`, 10, 60);
    };

    const buildRoad = () => {
        const { road } = state;
        const addSegment = (curve: number) => {
            const n = road.segments.length;
            const segmentLength = road.segmentLength;
            road.segments.push({
                index: n,
                p1: { world: { y: (n > 0 ? road.segments[n-1].p2.world.y : 0), z: n * segmentLength }, camera: {}, screen: {}, color: {} },
                p2: { world: { y: (n > 0 ? road.segments[n-1].p2.world.y : 0), z: (n + 1) * segmentLength }, camera: {}, screen: {}, color: {} },
                curve: curve,
            });
        };
        
        const addRoad = (enter: number, hold: number, leave: number, curve: number) => {
            for(let i = 0; i < enter; i++) addSegment(curve * (i / enter));
            for(let i = 0; i < hold; i++) addSegment(curve);
            for(let i = 0; i < leave; i++) addSegment(curve * (1 - i / leave));
        }

        addRoad(100, 100, 100, 2);
        addRoad(50, 100, 50, -3);
        addRoad(100, 150, 100, 1);
        
        state.road.length = state.road.segments.length;
        
        for (const segment of state.road.segments) {
            const isDark = Math.floor(segment.index / road.rumbleLength) % 2;
            segment.p1.color = isDark ? { road: ROAD_COLOR_DARK, grass: GRASS_COLOR_DARK, rumble: RUMBLE_COLOR_DARK, lane: '#FFFFFF' } : { road: ROAD_COLOR_LIGHT, grass: GRASS_COLOR_LIGHT, rumble: RUMBLE_COLOR_LIGHT, lane: '' };
            segment.p2.color = segment.p1.color;
        }
    };
    
    buildRoad();

    const frame = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      update(dt);
      render();
      animationFrameId.current = requestAnimationFrame(frame);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (state.keys.hasOwnProperty(e.key)) {
            e.preventDefault();
            state.keys[e.key as keyof typeof state.keys] = true;
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (state.keys.hasOwnProperty(e.key)) {
            e.preventDefault();
            state.keys[e.key as keyof typeof state.keys] = false;
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    animationFrameId.current = requestAnimationFrame(frame);
    
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
    };

  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    cleanupRef.current = gameLoop(ctx, canvas);
    
    return () => {
      cleanupRef.current();
    }
  }, [gameLoop]);

  const restartGame = useCallback(() => {
      cleanupRef.current();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      cleanupRef.current = gameLoop(ctx, canvas);
  }, [gameLoop])

  return (
    <Card className="shadow-2xl overflow-hidden">
      <CardContent className="p-2 md:p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-auto bg-stone-800 rounded-lg"
        ></canvas>
        <div className="mt-4 text-center">
            <Button onClick={restartGame}>Restart Game</Button>
        </div>
      </CardContent>
    </Card>
  );
}
