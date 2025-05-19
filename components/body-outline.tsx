"use client"

export function BodyOutline() {
  return (
    <div className="absolute inset-0 z-5 flex items-center justify-center pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 400 800" fill="none" preserveAspectRatio="xMidYMid meet">
        {/* Full body silhouette with red continuous line */}
        <path
          d="M200,100 
          C230,100 250,80 250,50 
          C250,20 230,0 200,0 
          C170,0 150,20 150,50 
          C150,80 170,100 200,100 
          
          M200,100 
          L200,300 
          
          M200,150 
          C200,150 150,200 120,250 
          C90,300 80,350 80,350 
          
          M200,150 
          C200,150 250,200 280,250 
          C310,300 320,350 320,350 
          
          M200,300 
          C200,300 150,350 130,450 
          C110,550 100,650 100,700 
          
          M200,300 
          C200,300 250,350 270,450 
          C290,550 300,650 300,700"
          stroke="#FF5252"
          strokeWidth="10"
          strokeOpacity="0.8"
          fill="none"
        />

        {/* Glow effect */}
        <path
          d="M200,100 
          C230,100 250,80 250,50 
          C250,20 230,0 200,0 
          C170,0 150,20 150,50 
          C150,80 170,100 200,100 
          
          M200,100 
          L200,300 
          
          M200,150 
          C200,150 150,200 120,250 
          C90,300 80,350 80,350 
          
          M200,150 
          C200,150 250,200 280,250 
          C310,300 320,350 320,350 
          
          M200,300 
          C200,300 150,350 130,450 
          C110,550 100,650 100,700 
          
          M200,300 
          C200,300 250,350 270,450 
          C290,550 300,650 300,700"
          stroke="#FF5252"
          strokeWidth="15"
          strokeOpacity="0.3"
          fill="none"
        />

        {/* Add a pulsing effect to make it more noticeable */}
        <path
          d="M200,100 
          C230,100 250,80 250,50 
          C250,20 230,0 200,0 
          C170,0 150,20 150,50 
          C150,80 170,100 200,100 
          
          M200,100 
          L200,300 
          
          M200,150 
          C200,150 150,200 120,250 
          C90,300 80,350 80,350 
          
          M200,150 
          C200,150 250,200 280,250 
          C310,300 320,350 320,350 
          
          M200,300 
          C200,300 150,350 130,450 
          C110,550 100,650 100,700 
          
          M200,300 
          C200,300 250,350 270,450 
          C290,550 300,650 300,700"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeOpacity="0.6"
          fill="none"
          className="animate-pulse"
        />
      </svg>
    </div>
  )
}
