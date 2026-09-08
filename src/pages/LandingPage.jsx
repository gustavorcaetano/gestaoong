import React, { useEffect, useRef, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "../services/api";

// Importações do Three.js para o fundo de estrelas
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";

gsap.registerPlugin(ScrollTrigger);

// --- 1. FUNDO 3D DE ESTRELAS ---
function StarField() {
  const ref = useRef();
  const [sphere] = useState(() =>
    random.inSphere(new Float32Array(5000), { radius: 1.5 }),
  );

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x -= delta / 15;
    ref.current.rotation.y -= delta / 20;
    ref.current.rotation.x +=
      (state.mouse.y * 0.2 - ref.current.rotation.x) * 0.1;
    ref.current.rotation.y +=
      (state.mouse.x * 0.2 - ref.current.rotation.y) * 0.1;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#38bdf8"
          size={0.003}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

// --- 2. COMPONENTE PRINCIPAL ---
const LandingPage = () => {
  const navigate = useNavigate();
  const mainRef = useRef(null);

  const [feedAcoes, setFeedAcoes] = useState([]);

  useEffect(() => {
    api.get('/acoes')
      .then(res => setFeedAcoes(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error("Erro ao buscar feed de ações:", err);
        setFeedAcoes([]);
      });
  }, []);

  // --- FUNÇÕES DE HOVER ---
  const onButtonEnter = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      boxShadow: "0 0 35px rgba(56, 189, 248, 0.6)",
      filter: "brightness(1.2)",
      duration: 0.3,
    });
  };

  const onButtonLeave = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      boxShadow: "0 10px 25px rgba(56, 189, 248, 0.3)",
      filter: "brightness(1)",
      duration: 0.3,
    });
  };

  const onSecButtonEnter = (e) => {
    gsap.to(e.currentTarget, {
      backgroundColor: "rgba(56, 189, 248, 0.2)",
      borderColor: "#38bdf8",
      y: -5,
      duration: 0.3,
    });
  };

  const onSecButtonLeave = (e) => {
    gsap.to(e.currentTarget, {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderColor: "rgba(56, 189, 248, 0.2)",
      y: 0,
      duration: 0.3,
    });
  };

  const onBubbleEnter = (e, color) => {
    const target = e.currentTarget;
    const img = target.querySelector("img");
    const label = target.querySelector(".bubble-label");
    if (!target) return;

    gsap.to(target, {
      scale: 1.15,
      boxShadow: `0 0 50px ${color}, inset 0 0 20px ${color}`,
      borderColor: color,
      zIndex: 100,
      duration: 0.5,
      ease: "back.out(1.7)",
    });
    if (img) gsap.to(img, { opacity: 1, mixBlendMode: "normal", scale: 1.1, duration: 0.5 });
    if (label) gsap.to(label, { y: -10, opacity: 1, color: "#fff", textShadow: `0 0 15px ${color}`, duration: 0.4 });
  };

  const onBubbleLeave = (e, color) => {
    const target = e.currentTarget;
    const img = target.querySelector("img");
    const label = target.querySelector(".bubble-label");
    if (!target) return;

    gsap.to(target, {
      scale: 1,
      boxShadow: `0 0 20px ${color}cc, inset 0 0 15px ${color}aa`,
      borderColor: `${color}66`,
      zIndex: 5,
      duration: 0.5,
      ease: "power2.inOut",
    });
    if (img) gsap.to(img, { opacity: 0.6, mixBlendMode: "luminosity", scale: 1, duration: 0.5 });
    if (label) gsap.to(label, { y: 0, color: color, textShadow: `0 0 10px ${color}`, duration: 0.4 });
  };

  const onImpactCardEnter = (e) => {
    const target = e.currentTarget;
    const iconPath = target.querySelectorAll("svg path");

    gsap.to(target, {
      y: -15,
      background: "rgba(56, 189, 248, 0.08)",
      borderColor: "rgba(56, 189, 248, 0.5)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
      duration: 0.4,
    });

    if (iconPath.length) gsap.to(iconPath, { fill: "#38bdf8", duration: 0.4 });
  };

  const onImpactCardLeave = (e) => {
    const target = e.currentTarget;
    const iconPath = target.querySelectorAll("svg path");

    gsap.to(target, {
      y: 0,
      background: "rgba(255, 255, 255, 0.02)",
      borderColor: "rgba(56, 189, 248, 0.1)",
      boxShadow: "0 0 0px rgba(0, 0, 0, 0)",
      duration: 0.4,
    });

    if (iconPath.length) gsap.to(iconPath, { fill: "none", duration: 0.4 });
  };

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Hero Entry
      gsap.from(".hero-content", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2
      });

      // Impact Cards Animation
      const cards = document.querySelectorAll(".impact-card");
      if (cards.length > 0) {
        gsap.fromTo(".impact-card", 
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".impact-section",
              start: "top 80%",
              toggleActions: "play none none none"
            }
          }
        );
      }

      // Bubble Orbit Segura (valida se o elemento existe)
      const bubbleSelectors = [".bubble-1", ".bubble-2", ".bubble-3", ".bubble-4"];
      bubbleSelectors.forEach((sel, i) => {
        const el = document.querySelector(sel);
        if (!el) return; // Trava contra erros caso o elemento não exista

        const startAngle = (i / bubbleSelectors.length) * Math.PI * 2;
        const radius = 180;
        gsap.to(sel, {
          duration: 180,
          repeat: -1,
          ease: "none",
          onUpdate: function () {
            const time = this.progress() * Math.PI * 2 + startAngle;
            const x = Math.cos(time) * radius;
            const y = Math.sin(time) * radius;
            gsap.set(sel, { x: x, y: y });
          },
        });
      });
    }, mainRef);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  const iconHome = (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9.5L12 3L21 9.5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V9.5Z" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21V12H15V21" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const iconFood = (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C7.58172 2 4 5.58172 4 10C4 14.4183 7.58172 18 12 18C16.4183 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2Z" stroke="#818cf8" strokeWidth="1.5" />
      <path d="M12 2V10L16 6" stroke="#818cf8" strokeWidth="1.5" />
      <path d="M12 18V22" stroke="#818cf8" strokeWidth="1.5" />
    </svg>
  );

  const iconCheck = (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 11.08V12C21.9961 14.1564 21.3003 16.2547 20.0093 17.9999C18.7183 19.745 16.9033 21.0471 14.822 21.714C12.7407 22.3809 10.5002 22.3755 8.42217 21.6985C6.3441 21.0215 4.54284 19.7111 3.27641 17.9582C2.00997 16.2053 1.3481 14.0991 1.38379 11.9423C1.41947 9.78546 2.15064 7.70233 3.47352 5.98685C4.79639 4.27137 6.63939 2.98684 8.74015 2.31602C10.8409 1.6452 13.0813 1.62128 15.19 2.24" stroke="#22d3ee" strokeWidth="1.5" />
      <path d="M22 4L12 14.01L9 11.01" stroke="#22d3ee" strokeWidth="1.5" />
    </svg>
  );

  return (
    <div ref={mainRef} style={{ background: "#05070a", color: "white", overflowX: "hidden", fontFamily: '"Inter", sans-serif' }}>
      
      {/* SEÇÃO HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "0 8%", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
          <Canvas camera={{ position: [0, 0, 1] }}>
            <Suspense fallback={null}><StarField /></Suspense>
          </Canvas>
        </div>

        <div className="hero-content" style={{ flex: 1, zIndex: 10, position: "relative" }}>
          <h1 style={{ fontSize: "clamp(3rem, 7vw, 5rem)", fontWeight: "900", lineHeight: 1.1, marginBottom: "25px", letterSpacing: "-2px" }}>
            GESTÃO SOCIAL<br /><span style={{ color: "#38bdf8", textShadow: "0 0 30px rgba(56,189,248,0.3)" }}>INTELIGENTE</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.2rem", maxWidth: "480px", marginBottom: "35px", lineHeight: "1.6" }}>
            Transformando a realidade de famílias através de transparência e tecnologia humanizada.
          </p>
          <div style={{ marginBottom: "40px" }}>
            <button onClick={() => navigate("/doar")} onMouseEnter={onButtonEnter} onMouseLeave={onButtonLeave}
              style={{ background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)", border: "none", padding: "20px 50px", borderRadius: "50px", color: "white", fontWeight: "800", cursor: "pointer", fontSize: "1.1rem" }}>
              ❤ QUERO DOAR AGORA
            </button>
          </div>
          <div style={{ display: "flex", gap: "15px" }}>
            <button onClick={() => navigate("/login")} onMouseEnter={onSecButtonEnter} onMouseLeave={onSecButtonLeave}
              style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(56, 189, 248, 0.2)", padding: "12px 25px", borderRadius: "15px", color: "#38bdf8", fontWeight: "bold", cursor: "pointer" }}>
              Painel ADM
            </button>
            <button onClick={() => navigate("/beneficiario")} onMouseEnter={onSecButtonEnter} onMouseLeave={onSecButtonLeave}
              style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(56, 189, 248, 0.2)", padding: "12px 25px", borderRadius: "15px", color: "#818cf8", fontWeight: "bold", cursor: "pointer" }}>
              Sou Beneficiário
            </button>
          </div>
        </div>

        <div style={{ flex: 1, position: "relative", height: "600px", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 5 }}>
          {[
            { id: "bubble-1", color: "#38bdf8", img: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=400", label: "Acolhimento" },
            { id: "bubble-2", color: "#818cf8", img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400", label: "Educação" },
            { id: "bubble-3", color: "#22d3ee", img: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400", label: "União" },
            { id: "bubble-4", color: "#a78bfa", img: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400", label: "Amor" },
          ].map((b, i) => (
            <div key={i} className={b.id} onMouseEnter={(e) => onBubbleEnter(e, b.color)} onMouseLeave={(e) => onBubbleLeave(e, b.color)}
              style={{ width: "200px", height: "200px", borderRadius: "50%", overflow: "hidden", position: "absolute", cursor: "pointer", border: `2px solid ${b.color}66`, boxShadow: `0 0 20px ${b.color}cc`, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", transform: "translate(-50%, -50%)" }}>
              <img src={b.img} alt={b.label} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6, mixBlendMode: "luminosity" }} />
              <div className="bubble-label" style={{ position: "absolute", bottom: "25px", width: "100%", textAlign: "center", fontSize: "0.85rem", fontWeight: "900", color: b.color }}>{b.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO DE IMPACTO e FEED DE AÇÕES */}
      <section className="impact-section" style={{ padding: "120px 8%", backgroundColor: "#080a0f", position: "relative", zIndex: 10 }}>
        <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: "800", textAlign: "center", marginBottom: "80px" }}>
          Nossas <span style={{ color: "#38bdf8" }}>Ações e Impacto</span>
        </h2>
        
        <div style={{ display: "flex", gap: "30px", justifyContent: "center", flexWrap: "wrap", maxWidth: "1200px", margin: "0 auto" }}>
          {feedAcoes.length === 0 ? (
            [
              { title: "1.2k", desc: "Famílias Auxiliadas", icon: iconHome, color: "#38bdf8" },
              { title: "15t", desc: "Alimentos Distribuídos", icon: iconFood, color: "#818cf8" },
              { title: "100%", desc: "Transparência Total", icon: iconCheck, color: "#22d3ee" },
            ].map((item, i) => (
              <div key={i} className="impact-card" onMouseEnter={onImpactCardEnter} onMouseLeave={onImpactCardLeave}
                style={{ background: "rgba(255, 255, 255, 0.02)", backdropFilter: "blur(12px)", border: "1px solid rgba(56, 189, 248, 0.1)", padding: "60px 40px", borderRadius: "32px", width: "350px", textAlign: "center", cursor: "pointer", transition: "all 0.3s ease-out" }}>
                <div style={{ marginBottom: "30px", filter: `drop-shadow(0 0 10px ${item.color})` }}>{item.icon}</div>
                <h3 style={{ color: "white", fontWeight: "900", fontSize: "3.5rem", marginBottom: "10px", textShadow: `0 0 20px ${item.color}44` }}>{item.title}</h3>
                <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>{item.desc}</p>
              </div>
            ))
          ) : (
            feedAcoes.map((acao) => (
              <div key={acao.id} className="impact-card" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "24px", width: "350px", overflow: "hidden" }}>
                <img src={acao.imagem_url} alt={acao.titulo} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                <div style={{ padding: "20px" }}>
                  <small style={{ color: "#38bdf8", fontWeight: "bold" }}>{new Date(acao.data_acao).toLocaleDateString('pt-BR')}</small>
                  <h4 style={{ color: "white", fontWeight: "bold", marginTop: "5px" }}>{acao.titulo}</h4>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginTop: "10px" }}>{acao.descricao}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&display=swap');
        .impact-card svg path { transition: fill 0.4s ease; }
      `}</style>
    </div>
  );
};

export default LandingPage;