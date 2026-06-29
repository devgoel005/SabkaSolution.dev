import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Orbit, RefreshCw, Zap } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  growth: number;
  angle: number;
  speed: number;
}

interface GravityWell {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  type: 'repel' | 'attract' | 'ripple';
  alpha: number;
}

export const AntigravityCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [physicsMode, setPhysicsMode] = useState<'antigravity' | 'vortex' | 'aurora'>('antigravity');
  const [particleCount, setParticleCount] = useState(65);
  const [showControls, setShowControls] = useState(false);

  // Use refs to avoid re-running useEffect on state change
  const modeRef = useRef(physicsMode);
  useEffect(() => {
    modeRef.current = physicsMode;
  }, [physicsMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particles: Particle[] = [];
    let gravityWells: GravityWell[] = [];
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };

    // Beautiful Saffron, Turquoise, and Cosmic Saffron colors
    const colors = [
      'rgba(255, 107, 0, 0.7)',  // Civic Saffron
      'rgba(6, 214, 160, 0.7)',   // Verified Green
      'rgba(6, 182, 212, 0.7)',   // Ocean Cyan
      'rgba(99, 102, 241, 0.7)',  // Tech Indigo
      'rgba(251, 191, 36, 0.7)',  // Golden Amber
    ];

    const createParticle = (x?: number, y?: number): Particle => {
      const px = x !== undefined ? x : Math.random() * width;
      const py = y !== undefined ? y : Math.random() * height;
      const baseRadius = Math.random() * 2.5 + 1.5;
      return {
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2, // Drift upwards (Antigravity feel)
        radius: baseRadius,
        baseRadius,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.3,
        growth: Math.random() * 0.05,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
      };
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    initParticles();

    // Resize Handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Click/Touch creates a beautiful expanding gravity ripple well
    const handleTouchOrClick = (clientX: number, clientY: number) => {
      // Spawn a gravity well
      gravityWells.push({
        x: clientX,
        y: clientY,
        radius: 0,
        maxRadius: Math.random() * 120 + 80,
        strength: 20,
        type: modeRef.current === 'vortex' ? 'attract' : 'repel',
        alpha: 1.0,
      });

      // Spawn extra active burst particles at click coordinates
      for (let i = 0; i < 8; i++) {
        const p = createParticle(clientX, clientY);
        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * 3 + 1;
        p.vx = Math.cos(angle) * force;
        p.vy = Math.sin(angle) * force;
        particles.push(p);
      }

      // Keep particles size in boundary
      if (particles.length > 150) {
        particles.splice(0, particles.length - 150);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      // Avoid interference with interactive buttons/cards
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('select') || target.closest('input') || target.closest('.issue-card') || target.closest('.modal') || target.closest('textarea')) {
        return;
      }
      handleTouchOrClick(e.clientX, e.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('select') || target.closest('input') || target.closest('.issue-card')) {
        return;
      }
      if (e.touches.length > 0) {
        handleTouchOrClick(e.touches[0].clientX, e.touches[0].clientY);
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // Core Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.1;
        mouse.y += (mouse.targetY - mouse.y) * 0.1;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      const activeMode = modeRef.current;

      // 1. Draw Subtle Ambient Interactive Grid Lines (Antigravity Grid)
      ctx.lineWidth = 0.6;
      const gridSize = 65;
      for (let x = 0; x < width; x += gridSize) {
        ctx.strokeStyle = 'rgba(255, 107, 0, 0.045)'; // Subtle Saffron vertical grids
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.strokeStyle = 'rgba(18, 136, 7, 0.045)'; // Subtle Emerald horizontal grids
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Update and Draw Gravity Wells (Ripples)
      gravityWells = gravityWells.filter((well) => {
        well.radius += 4;
        well.alpha -= 0.015;

        if (well.alpha <= 0) return false;

        ctx.strokeStyle = `rgba(255, 107, 0, ${well.alpha * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(well.x, well.y, well.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(6, 214, 160, ${well.alpha * 0.1})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(well.x, well.y, well.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        return well.radius < well.maxRadius;
      });

      // 3. Update & Draw Particles
      particles.forEach((p, index) => {
        // Slow float/orbital mathematics based on active mode
        if (activeMode === 'antigravity') {
          p.vy -= 0.005; // acceleration upwards
          if (p.vy < -1.8) p.vy = -1.8;
          p.vx += Math.sin(p.angle) * 0.01;
        } else if (activeMode === 'vortex') {
          // Orbit slow vortex rotation around screen center
          const dx = width / 2 - p.x;
          const dy = height / 2 - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = 0.15;
          p.vx += (-dy / (dist || 1)) * force + (dx / (dist || 1)) * 0.02;
          p.vy += (dx / (dist || 1)) * force + (dy / (dist || 1)) * 0.02;
        } else if (activeMode === 'aurora') {
          // Horizontal waves drift
          p.vx += Math.sin(p.angle) * 0.05;
          p.vy = -0.3 + Math.cos(p.angle) * 0.1;
        }

        p.angle += p.speed;

        // Apply Mouse Proximity Physics (Anti-gravity pushing)
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const force = (180 - dist) / 180;
            if (activeMode === 'vortex') {
              // Pull in like black hole
              p.vx -= (dx / (dist || 1)) * force * 0.8;
              p.vy -= (dy / (dist || 1)) * force * 0.8;
            } else {
              // Repel / Push away (Standard antigravity)
              p.vx += (dx / (dist || 1)) * force * 1.5;
              p.vy += (dy / (dist || 1)) * force * 1.5;
            }
          }
        }

        // Apply Expanding Ripple Forces
        gravityWells.forEach((well) => {
          const dx = p.x - well.x;
          const dy = p.y - well.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (Math.abs(dist - well.radius) < 20) {
            const pushForce = (1 - Math.abs(dist - well.radius) / 20) * well.strength * well.alpha * 0.15;
            p.vx += (dx / (dist || 1)) * pushForce;
            p.vy += (dy / (dist || 1)) * pushForce;
          }
        });

        // Speed dampening for organic feel
        p.vx *= 0.95;
        p.vy *= 0.95;

        // Apply velocities
        p.x += p.vx;
        p.y += p.vy;

        // Pulse size
        p.radius = p.baseRadius + Math.sin(p.angle) * 0.8;

        // Boundary Wrapping/Re-spawning
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.vx = (Math.random() - 0.5) * 0.4;
          p.vy = -Math.random() * 0.6 - 0.2;
        } else if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        if (p.x < -10) {
          p.x = width + 10;
        } else if (p.x > width + 10) {
          p.x = -10;
        }

        // Render Particle Glowing Circle
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.5);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.3, p.color.replace('0.7', '0.2'));
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Constellation Network Links
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            const alpha = (110 - dist) / 110 * 0.08;
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      // 4. Draw Ambient Pulsing Cosmic Dust Cloud Aura around the cursor
      if (mouse.active) {
        ctx.beginPath();
        const radialGlow = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 120);
        radialGlow.addColorStop(0, 'rgba(255, 107, 0, 0.08)');
        radialGlow.addColorStop(0.5, 'rgba(6, 214, 160, 0.03)');
        radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radialGlow;
        ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" id="antigravity-background-layer">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* Floating Control Hub for physical playground (Tucked neatly in bottom corner) */}
      <div 
        className="fixed bottom-16 right-4 sm:bottom-6 sm:right-6 pointer-events-auto z-50 flex flex-col items-end gap-2"
        id="antigravity-controls"
      >
        {showControls && (
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-4 shadow-xl flex flex-col gap-3 min-w-[200px] animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#FF6B00]" /> Physics Grid
              </span>
              <button 
                onClick={() => setPhysicsMode(prev => prev === 'antigravity' ? 'vortex' : prev === 'vortex' ? 'aurora' : 'antigravity')}
                className="text-slate-400 hover:text-[#FF6B00] transition-colors p-1"
                title="Change Physics Mode"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {/* Mode Select Buttons */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setPhysicsMode('antigravity')}
                className={`text-left text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-2 ${physicsMode === 'antigravity' ? 'bg-[#FF6B00]/10 text-[#FF6B00]' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Orbit size={12} /> Antigravity Drift
              </button>
              <button
                onClick={() => setPhysicsMode('vortex')}
                className={`text-left text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-2 ${physicsMode === 'vortex' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Zap size={12} /> Vortex Gravity Well
              </button>
              <button
                onClick={() => setPhysicsMode('aurora')}
                className={`text-left text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-2 ${physicsMode === 'aurora' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Sparkles size={12} /> Cosmic Aurora
              </button>
            </div>

            {/* Particle Density */}
            <div className="flex flex-col gap-1 pt-1 border-t border-slate-100">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Node Density</span>
                <span>{particleCount}</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                value={particleCount}
                onChange={(e) => setParticleCount(Number(e.target.value))}
                className="w-full accent-[#FF6B00] h-1 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>
            
            <p className="text-[9px] text-slate-400 font-medium italic mt-1 leading-normal text-center">
              Touch the blank screen backgrounds to trigger gravitational ripple shockwaves!
            </p>
          </div>
        )}

        {/* Launcher Pill */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="bg-slate-900 text-white hover:bg-slate-800 border border-slate-800 shadow-lg px-3 py-2 rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-xs font-bold"
          id="toggle-physics-panel"
        >
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span>{showControls ? 'Close Grid' : 'Gravity Grid'}</span>
        </button>
      </div>
    </div>
  );
};
