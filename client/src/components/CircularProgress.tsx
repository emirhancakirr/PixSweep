interface CircularProgressProps {
    current: number;      // Kaç tane tamamlandı
    total: number;        // Toplam kaç tane
    label?: string;       // "photos", "items", vs. (optional)
    size?: number;        // Boyut (optional, default 120)
    textColor?: string;   // Yazı rengi (optional, default "#fff")
}

export function CircularProgress({
    current,
    total,
    label = "photos",
    size = 120,
    textColor = "#fff"
}: CircularProgressProps) {
    const percentage = total > 0 ? current / total : 0;
    const radius = (size - 16) / 2; // 8px stroke width * 2
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percentage);

    return (
        <>
            {/* CSS Animations */}
            <style>{`
        @keyframes blur-in {
          to {
            filter: blur(0);
            transform: scale(1);
          }
        }

        .circular-progress__text-char {
          display: inline-block;
          animation: blur-in 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          filter: blur(0.2em);
          transform: scale(1.3);
        }

        .circular-progress__circle {
          transform-origin: center;
          transition: stroke-dashoffset 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>

            <div style={{ position: "relative", width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    style={{
                        transform: "rotate(-90deg)",
                    }}
                >
                    {/* Arka plan circle (gri) */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(100, 100, 100, 0.2)"
                        strokeWidth="8"
                    />

                    {/* Progress circle (renkli gradient) */}
                    <circle
                        className="circular-progress__circle"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{
                            filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))",
                        }}
                    />

                    {/* Gradient tanımı */}
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Ortadaki metin */}
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                }}>
                    <div style={{
                        fontSize: `${size / 80}em`, // Boyuta göre ölçeklendir
                        fontWeight: "300",
                        color: textColor,
                        lineHeight: 1,
                    }}>
                        <span className="circular-progress__text-char">{current}</span>
                        <span style={{ opacity: 0.5 }}>/</span>
                        <span style={{ opacity: 0.7 }}>{total}</span>
                    </div>
                    {label && (
                        <div style={{
                            fontSize: `${size / 160}em`, // Boyuta göre ölçeklendir
                            color: textColor,
                            opacity: 0.6,
                            marginTop: "0.25em",
                            fontWeight: "300",
                        }}>
                            {label}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

