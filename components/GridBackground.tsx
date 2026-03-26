"use client";

import { useEffect, useRef } from "react";

export default function GridBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const DOT_SPACING = 40;
        const DOT_RADIUS = 1;

        function draw() {
            canvas!.width = window.innerWidth;
            canvas!.height = document.documentElement.scrollHeight;

            const isLight = document.documentElement.classList.contains("light");
            const DOT_COLOR = isLight ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.12)";

            const cols = Math.ceil(canvas!.width / DOT_SPACING) + 1;
            const rows = Math.ceil(canvas!.height / DOT_SPACING) + 1;

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    ctx!.beginPath();
                    ctx!.arc(col * DOT_SPACING, row * DOT_SPACING, DOT_RADIUS, 0, Math.PI * 2);
                    ctx!.fillStyle = DOT_COLOR;
                    ctx!.fill();
                }
            }
        }

        draw();
        window.addEventListener("resize", draw);
        window.addEventListener("themechange", draw);
        return () => {
            window.removeEventListener("resize", draw);
            window.removeEventListener("themechange", draw);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
