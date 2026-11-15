import { useState } from "react";
import {
  AudioLines,
  Compass,
  Headphones,
  Mic,
  Search,
  Send,
  Hash,
  Play,
  Pause,
  ArrowUpRight,
  Plus,
  Menu,
} from "lucide-react";

type Post = {
  id: number;
  duration: string;
  time: string;
  text: string;
  tags: string[];
  replies: number;
  bars: number[];
};

const posts: Post[] = [
  {
    id: 1,
    duration: "0:18",
    time: "hace 2 min",
    text: "A veces uno necesita caminar sin rumbo para darse cuenta de dónde quiere ir.",
    tags: ["pensamientos", "vida"],
    replies: 3,
    bars: [18, 30, 22, 48, 36, 58, 28, 42, 66, 38, 52, 26, 44, 62, 34, 48, 22, 56, 38, 68, 30, 46, 24, 54, 36, 60, 28, 44, 20, 50, 34, 62, 26, 46, 32, 56, 22, 40, 30, 52],
  },
  {
    id: 2,
    duration: "0:32",
    time: "hace 11 min",
    text: "¿No les pasa que escuchan una canción y vuelven por un instante a otro momento de su vida?",
    tags: ["musica", "recuerdos"],
    replies: 8,
    bars: [28, 44, 62, 32, 50, 72, 38, 56, 24, 46, 66, 34, 52, 76, 40, 60, 28, 48, 68, 36, 54, 72, 32, 50, 64, 42, 58, 26, 46, 70, 36, 54, 74, 30, 48, 66, 38, 56, 24, 44],
  },
  {
    id: 3,
    duration: "0:09",
    time: "hace 24 min",
    text: "Un pequeño recordatorio: no tenés que resolver toda tu vida hoy.",
    tags: ["reflexiones"],
    replies: 1,
    bars: [20, 34, 48, 26, 42, 60, 30, 48, 66, 36, 54, 24, 42, 58, 32, 48, 22, 40, 56, 30, 46, 62, 34, 50, 24, 42, 58, 32, 48, 64, 36, 52, 26, 44, 60, 32, 48, 22, 40, 56],
  },
];

const topics = ["todos", "pensamientos", "vida", "confesiones", "musica", "preguntas"];

function Waveform({ bars, active }: { bars: number[]; active: boolean }) {
  return (
    <div className={`waveform ${active ? "waveform-active" : ""}`} aria-label="Visualización de audio">
      {bars.map((height, index) => (
        <span key={index} style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

function AudioPost({ post }: { post: Post }) {
  const [playing, setPlaying] = useState(false);

  return (
    <article className="post">
      <div className="post-topline">
        <span className="anonymous-mark"><AudioLines size={15} strokeWidth={1.8} /></span>
        <span className="post-anonymous">voz anónima</span>
        <span className="post-dot">·</span>
        <time>{post.time}</time>
        <span className="post-spacer" />
        <span className="duration">{post.duration}</span>
      </div>
      <p className="post-text">{post.text}</p>
      <div className="audio-player">
        <button className="play-button" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pausar" : "Reproducir"}>
          {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
        </button>
        <Waveform bars={post.bars} active={playing} />
        <span className="audio-time">{playing ? "0:07" : "0:00"}</span>
      </div>
      <div className="post-bottom">
        <div className="tag-list">
          {post.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}
        </div>
        <button className="reply-link"><Send size={14} /> Responder con audio <span>· {post.replies}</span></button>
      </div>
    </article>
  );
}

export default function App() {
  const [activeTopic, setActiveTopic] = useState("todos");
  const [activeNav, setActiveNav] = useState("feed");
  const [search, setSearch] = useState("");

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="Voxurn inicio">VOXURN<span>.</span></a>
        <div className="topbar-center"><span className="live-dot" /> UN LUGAR PARA SER ESCUCHADO</div>
        <button className="icon-button mobile-menu" aria-label="Abrir menú"><Menu size={20} /></button>
        <button className="publish-top" onClick={() => setActiveNav("publish")}><Plus size={16} /> Publicar audio</button>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-label">DESCUBRIR</div>
          <button className={`nav-item ${activeNav === "feed" ? "selected" : ""}`} onClick={() => setActiveNav("feed")}><Headphones size={18} /> Feed</button>
          <button className={`nav-item ${activeNav === "explore" ? "selected" : ""}`} onClick={() => setActiveNav("explore")}><Compass size={18} /> Explorar</button>
          <div className="sidebar-divider" />
          <div className="sidebar-label">TEMAS</div>
          {topics.slice(1).map((topic) => (
            <button key={topic} className={`topic-item ${activeTopic === topic ? "topic-selected" : ""}`} onClick={() => { setActiveTopic(topic); setActiveNav("feed"); }}>
              <Hash size={14} /> {topic}
            </button>
          ))}
          <div className="sidebar-note"><span className="note-line" />No necesitás un nombre para tener algo que decir.</div>
        </aside>

        <main className="main-content">
          <div className="feed-heading">
            <div>
              <div className="eyebrow">EL SONIDO DE LO ANÓNIMO</div>
              <h1>{activeNav === "explore" ? "Explorá voces." : activeNav === "publish" ? "Tu voz, acá." : "Escuchá."}</h1>
              <p>{activeNav === "explore" ? "Encontrá conversaciones por tema." : activeNav === "publish" ? "Compartí eso que tenés para decir." : "Historias, ideas y pensamientos. Sin nombres."}</p>
            </div>
            <div className="heading-mark"><AudioLines size={28} strokeWidth={1.2} /></div>
          </div>

          {activeNav === "publish" ? (
            <section className="composer-card">
              <div className="composer-icon"><Mic size={25} /></div>
              <h2>¿Qué querés decir?</h2>
              <p>Grabá un audio y compartilo con el mundo.</p>
              <button className="record-button"><Mic size={17} /> Empezar a grabar</button>
              <span className="composer-hint">Tu voz. Sin perfil. Sin nombre.</span>
            </section>
          ) : activeNav === "explore" ? (
            <section className="explore-section">
              <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar un hashtag..." /></label>
              <div className="explore-label">TEMAS PARA EXPLORAR</div>
              <div className="explore-tags">
                {topics.slice(1).filter((topic) => topic.includes(search.toLowerCase())).map((topic, index) => (
                  <button className="explore-tag" key={topic} onClick={() => { setActiveTopic(topic); setActiveNav("feed"); }}>
                    <span>#{topic}</span><ArrowUpRight size={15} />
                    <small>{[128, 86, 64, 52, 39][index % 5]} audios</small>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <>
              <div className="feed-controls">
                <div className="filter-tabs">
                  {["todos", "recientes", "populares"].map((tab) => <button className={tab === "todos" ? "filter-active" : ""} key={tab}>{tab}</button>)}
                </div>
                <span className="feed-count">VOCES DE LA COMUNIDAD</span>
              </div>
              <div className="posts-list">
                {posts.filter((post) => activeTopic === "todos" || post.tags.includes(activeTopic)).map((post) => <AudioPost key={post.id} post={post} />)}
              </div>
            </>
          )}
          <footer className="footer"><span>VOXURN © 2026</span><span>HECHO PARA ESCUCHAR.</span></footer>
        </main>

        <aside className="right-rail">
          <div className="rail-card">
            <div className="rail-heading">EN MOVIMIENTO <span className="live-dot" /></div>
            <h3>Conversaciones<br />que están sonando.</h3>
            {["#pensamientos", "#vida", "#confesiones", "#musica"].map((tag, index) => (
              <button className="trending-row" key={tag} onClick={() => { setActiveTopic(tag.slice(1)); setActiveNav("feed"); }}>
                <span className="trend-number">0{index + 1}</span><span>{tag}</span><ArrowUpRight size={14} />
              </button>
            ))}
          </div>
          <div className="manifesto"><span>“</span><p>Acá no importa quién sos. Importa lo que tenés para decir.</p><div>VOXURN MANIFIESTO Nº 001</div></div>
        </aside>
      </div>
      <nav className="mobile-nav">
        <button onClick={() => setActiveNav("feed")}><Headphones size={19} /><span>Feed</span></button>
        <button onClick={() => setActiveNav("explore")}><Compass size={19} /><span>Explorar</span></button>
        <button onClick={() => setActiveNav("publish")}><Mic size={19} /><span>Publicar</span></button>
      </nav>
    </div>
  );
}