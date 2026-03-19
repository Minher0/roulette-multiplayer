'use client';

export default function CasinoBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient - dark casino floor */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-black" />
      
      {/* Felt texture overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(16, 185, 129, 0.1) 0%, transparent 40%)
          `
        }}
      />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Spotlight effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2">
        <div 
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }}
        />
      </div>
      
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] translate-x-1/2 -translate-y-1/2">
        <div 
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.06) 0%, transparent 70%)',
            filter: 'blur(50px)'
          }}
        />
      </div>

      {/* Ambient glow from bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2">
        <div 
          className="w-full h-full"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Floating particles using CSS only */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
        <div className="particle particle-6" />
        <div className="particle particle-7" />
        <div className="particle particle-8" />
        <div className="particle particle-9" />
        <div className="particle particle-10" />
        <div className="particle particle-11" />
        <div className="particle particle-12" />
        <div className="particle particle-13" />
        <div className="particle particle-14" />
        <div className="particle particle-15" />
      </div>

      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.6) 100%)'
        }}
      />

      {/* Noise texture for realism */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      <style jsx>{`
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(251, 191, 36, 0.3);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite;
        }
        .particle-1 { left: 10%; top: 20%; animation-delay: 0s; animation-duration: 6s; }
        .particle-2 { left: 20%; top: 80%; animation-delay: 1s; animation-duration: 7s; width: 3px; height: 3px; }
        .particle-3 { left: 30%; top: 40%; animation-delay: 2s; animation-duration: 5s; }
        .particle-4 { left: 40%; top: 60%; animation-delay: 0.5s; animation-duration: 8s; width: 1px; height: 1px; }
        .particle-5 { left: 50%; top: 30%; animation-delay: 1.5s; animation-duration: 6.5s; }
        .particle-6 { left: 60%; top: 70%; animation-delay: 3s; animation-duration: 7.5s; width: 3px; height: 3px; }
        .particle-7 { left: 70%; top: 50%; animation-delay: 0.8s; animation-duration: 5.5s; }
        .particle-8 { left: 80%; top: 25%; animation-delay: 2.5s; animation-duration: 6.8s; width: 2px; height: 2px; }
        .particle-9 { left: 90%; top: 85%; animation-delay: 1.2s; animation-duration: 7.2s; }
        .particle-10 { left: 15%; top: 55%; animation-delay: 3.5s; animation-duration: 5.8s; width: 1px; height: 1px; }
        .particle-11 { left: 25%; top: 15%; animation-delay: 2.2s; animation-duration: 6.2s; }
        .particle-12 { left: 75%; top: 35%; animation-delay: 0.3s; animation-duration: 7.8s; width: 3px; height: 3px; }
        .particle-13 { left: 85%; top: 65%; animation-delay: 1.8s; animation-duration: 5.2s; }
        .particle-14 { left: 5%; top: 45%; animation-delay: 2.8s; animation-duration: 6.6s; width: 2px; height: 2px; }
        .particle-15 { left: 95%; top: 95%; animation-delay: 0.6s; animation-duration: 7.4s; }
        
        @keyframes float {
          0%, 100% {
            opacity: 0.2;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translateY(-20px) scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
