import { useEffect, useRef, useState } from "react";
import {
  AudioLines, Compass, Headphones, Mic, Search, Send, Hash, ArrowUpRight,
  Plus, Menu, Moon, Sun, Square, X, RefreshCw,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

type Reply = {
  id: string;
  audio_path: string;
  duration_seconds: number;
  created_at: string;
};

type Post = {
  id: string;
  text: string;
  audio_path: string;
  duration_seconds: number;
  tags: string[];
  topic: string;
  created_at: string;
  replies: Reply[];
};

const topics = [
  "Joker's Club", "Confesiones", "Amor y relaciones", "Vida cotidiana", "Humor",
  "Desahogo", "Preguntas", "Opiniones", "Pensamientos", "Historias", "Música",
  "Cine y series", "Gaming", "Tecnología", "Actualidad", "Trabajo y estudio",
  "Arte y creatividad", "Filosofía",
];

function formatDuration(seconds: number) {
  const safe = Math.max(0, seconds || 0);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "hace unos segundos";
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} h`;
  return `hace ${Math.floor(seconds / 86400)} días`;
}

function publicAudioUrl(path: string) {
  if (!supabase) return "";
  return supabase.storage.from("voxurn-audio").getPublicUrl(path).data.publicUrl;
}

function AudioPost({ post, onReply, onTopic }: { post: Post; onReply: (id: string) => void; onTopic: (topic: string) => void }) {
  const [showReplies, setShowReplies] = useState(false);
  return (
    <article className="post">
      <div className="post-topline">
        <span className="anonymous-mark"><AudioLines size={15} strokeWidth={1.8} /></span>
        <span className="post-anonymous">voz anónima</span>
        <span className="post-dot">·</span>
        <time>{relativeTime(post.created_at)}</time>
        <button type="button" className="post-topic-badge" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onTopic(post.topic || "Joker's Club"); }} aria-label={`Ver sección ${post.topic || "Joker's Club"}`}>{post.topic || "Joker's Club"}</button>
        <span className="post-spacer" />
        <span className="duration">{formatDuration(post.duration_seconds)}</span>
      </div>
      {post.text && <p className="post-text">{post.text}</p>}
      <div className="audio-player real-audio-player">
        <audio controls preload="none" src={publicAudioUrl(post.audio_path)} aria-label="Audio publicado" />
      </div>
      <div className="post-bottom">
        <div className="tag-list"><button type="button" className="category-label" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onTopic(post.topic || "Joker's Club"); }} aria-label={`Ver sección ${post.topic || "Joker's Club"}`}>{post.topic || "Joker's Club"}</button>{post.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div>
        <div className="post-actions">
          {post.replies.length > 0 && (
            <button className="reply-link" onClick={() => setShowReplies((value) => !value)}>
              <Headphones size={14} /> {showReplies ? "Ocultar respuestas" : "Escuchar respuestas"} <span>· {post.replies.length}</span>
            </button>
          )}
          <button className="reply-link" onClick={() => onReply(post.id)}><Send size={14} /> Responder con audio</button>
        </div>
      </div>
      {showReplies && (
        <div className="replies-list">
          {post.replies.map((reply) => (
            <div className="reply-audio" key={reply.id}>
              <span className="reply-anonymous"><AudioLines size={13} /> respuesta anónima</span>
              <span className="duration">{formatDuration(reply.duration_seconds)}</span>
              <audio controls preload="none" src={publicAudioUrl(reply.audio_path)} aria-label="Respuesta de audio" />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default function App() {
  const [activeTopic, setActiveTopic] = useState("todos");
  const [activeNav, setActiveNav] = useState("feed");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("voxurn-theme") === "dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [postText, setPostText] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("Joker's Club");
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const targetRef = useRef<string | null>(null);
  const startedAtRef = useRef(0);

  const loadPosts = async () => {
    if (!supabase) {
      setIsLoading(false);
      setLoadError("Falta configurar la conexión con Supabase.");
      return;
    }
    setIsLoading(true);
    setLoadError("");
    const { data, error } = await supabase
      .from("posts")
      .select("id,text,audio_path,duration_seconds,tags,topic,created_at,replies(id,audio_path,duration_seconds,created_at)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      setLoadError(`Supabase respondió: ${error.message} (código ${error.code || "sin código"}). Si indica que no existe la tabla posts o la relación replies, falta ejecutar la migración SQL.`);
      setIsLoading(false);
      return;
    }
    setPosts((data ?? []) as Post[]);
    setIsLoading(false);
  };

  useEffect(() => { void loadPosts(); }, []);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      setRecordingSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => () => {
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
  }, []);

  const toggleTheme = () => {
    setDarkMode((current) => {
      const next = !current;
      localStorage.setItem("voxurn-theme", next ? "dark" : "light");
      return next;
    });
  };

  const startRecording = async (targetPostId: string | null = null) => {
    setActionError("");
    if (!supabase || !isSupabaseConfigured) {
      setActionError("La conexión con Supabase todavía no está configurada.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setActionError("Tu navegador no permite grabar audio. Probá con una versión actualizada de Chrome, Edge o Firefox.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
      const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      targetRef.current = targetPostId;
      startedAtRef.current = Date.now();
      setRecordingSeconds(0);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
        if (blob.size === 0) {
          setActionError("No se pudo capturar el audio. Intentá grabar otra vez.");
          setIsUploading(false);
          return;
        }
        setIsUploading(true);
        try {
          const extension = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
          const path = `${targetRef.current ? "replies" : "posts"}/${crypto.randomUUID()}.${extension}`;
          const { error: uploadError } = await supabase!.storage.from("voxurn-audio").upload(path, blob, {
            contentType: blob.type || "audio/webm",
            upsert: false,
          });
          if (uploadError) throw uploadError;

          if (targetRef.current) {
            const { error } = await supabase!.from("replies").insert({
              post_id: targetRef.current,
              audio_path: path,
              duration_seconds: duration,
            });
            if (error) throw error;
          } else {
            const tags = [...new Set(tagInput.split(/[\s,]+/).map((tag) => tag.replace(/^#/, "").toLowerCase()).filter((tag) => /^[\p{L}\p{N}_-]{1,30}$/u.test(tag)))];
            const { error } = await supabase!.from("posts").insert({
              text: postText.trim().slice(0, 1000),
              audio_path: path,
              duration_seconds: duration,
              tags,
              topic: selectedTopic,
            });
            if (error) throw error;
            setPostText("");
            setTagInput("");
            setSelectedTopic("Joker's Club");
          }
          setReplyTarget(null);
          setActiveNav("feed");
          await loadPosts();
        } catch (error) {
          console.error(error);
          setActionError("No se pudo publicar el audio. Revisá la conexión y las políticas de Supabase e intentá nuevamente.");
        } finally {
          setIsUploading(false);
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setReplyTarget(targetPostId);
      setRecording(true);
    } catch (error) {
      console.error(error);
      setActionError("No se pudo acceder al micrófono. Permití el acceso cuando el navegador te lo solicite.");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      setRecording(false);
      recorderRef.current.stop();
    }
  };

  const visiblePosts = posts.filter((post) => activeTopic === "todos" || (post.topic || "Joker's Club") === activeTopic);
  const filteredTopics = topics.filter((topic) => topic.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`app-shell ${darkMode ? "theme-dark" : ""}`}>
      <header className="topbar">
        <a className="wordmark" href="/voxurn/" aria-label="Voxurn inicio">VOXURN<span>.</span></a>
        <div className="topbar-center"><span className="live-dot" /> UN LUGAR PARA SER ESCUCHADO</div>
        <button className="theme-toggle" onClick={toggleTheme} aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"} title={darkMode ? "Modo claro" : "Modo oscuro"}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
        <button className="icon-button mobile-menu" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen}><Menu size={20} /></button>
        <button className="publish-top" onClick={() => setActiveNav("publish")}><Plus size={16} /> Publicar audio</button>
      </header>

      {menuOpen && <div className="mobile-menu-panel">
        <button onClick={() => { setActiveNav("feed"); setMenuOpen(false); }}><Headphones size={17} /> Feed</button>
        <button onClick={() => { setActiveNav("explore"); setMenuOpen(false); }}><Compass size={17} /> Explorar</button>
        <button onClick={() => { setActiveNav("publish"); setMenuOpen(false); }}><Mic size={17} /> Publicar audio</button>
        <div className="mobile-menu-divider" />
        <span className="mobile-menu-label">TEMAS</span>
        {topics.map((topic) => <button key={topic} onClick={() => { setActiveTopic(topic); setActiveNav("feed"); setMenuOpen(false); }}><Hash size={15} /> {topic}</button>)}
      </div>}

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-label">DESCUBRIR</div>
          <button className={`nav-item ${activeNav === "feed" ? "selected" : ""}`} onClick={() => setActiveNav("feed")}><Headphones size={18} /> Feed</button>
          <button className={`nav-item ${activeNav === "explore" ? "selected" : ""}`} onClick={() => setActiveNav("explore")}><Compass size={18} /> Explorar</button>
          <div className="sidebar-divider" />
          <div className="sidebar-label">TEMAS</div>
          {topics.map((topic) => <button key={topic} className={`topic-item ${activeTopic === topic ? "topic-selected" : ""}`} onClick={() => { setActiveTopic(topic); setActiveNav("feed"); }}><Hash size={14} /> {topic}</button>)}
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

          {actionError && <div className="status-message error-message" role="alert">{actionError}<button onClick={() => setActionError("")} aria-label="Cerrar aviso"><X size={15} /></button></div>}

          {activeNav === "publish" ? (
            <section className="composer-card">
              <div className="composer-icon"><Mic size={25} /></div>
              <h2>{replyTarget ? "Respondé con tu voz" : "¿Qué querés decir?"}</h2>
              <p>{replyTarget ? "Tu respuesta se publicará de forma anónima." : "Grabá un audio y compartilo con el mundo."}</p>
              {!replyTarget && <>
                <label className="topic-picker-label" htmlFor="post-topic">ELEGÍ LA TEMÁTICA</label>
                <select id="post-topic" className="topic-picker" value={selectedTopic} onChange={(event) => setSelectedTopic(event.target.value)} required>{topics.map((topic) => <option key={topic} value={topic}>{topic}{topic === "Joker's Club" ? " — general / off-topic" : ""}</option>)}</select>
                <textarea className="composer-text" value={postText} onChange={(event) => setPostText(event.target.value)} maxLength={1000} placeholder="Podés agregar un texto (opcional)..." />
                <input className="composer-tags" value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="Hashtags opcionales: #anecdotas #ideas..." aria-label="Hashtags opcionales separados por espacios" />
              </>}
              {recording ? (
                <div className="recording-state"><span className="recording-indicator" /> GRABANDO · {formatDuration(recordingSeconds)}<button className="record-button stop-recording" onClick={stopRecording}><Square size={15} fill="currentColor" /> Detener y publicar</button></div>
              ) : (
                <button className="record-button" onClick={() => void startRecording(replyTarget)} disabled={isUploading}><Mic size={17} /> {isUploading ? "Subiendo audio..." : replyTarget ? "Grabar respuesta" : "Empezar a grabar"}</button>
              )}
              <span className="composer-hint">{isUploading ? "Estamos subiendo tu audio..." : "Tu voz. Sin perfil. Sin nombre."}</span>
              {replyTarget && <button className="cancel-reply" onClick={() => { setReplyTarget(null); setActiveNav("feed"); }}>Cancelar respuesta</button>}
            </section>
          ) : activeNav === "explore" ? (
            <section className="explore-section">
              <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar un hashtag..." /></label>
              <div className="explore-label">SECCIONES DE VOXURN</div>
              <div className="explore-tags">
                {filteredTopics.map((topic) => {
                  const count = posts.filter((post) => (post.topic || "Joker's Club") === topic).length;
                  return <button className="explore-tag" key={topic} onClick={() => { setActiveTopic(topic); setActiveNav("feed"); }}><span>{topic === "Joker's Club" ? topic : `# ${topic}`}</span><ArrowUpRight size={15} /><small>{count} {count === 1 ? "audio" : "audios"}</small></button>;
                })}
                {filteredTopics.length === 0 && <p className="empty-state">No encontramos ese tema.</p>}
              </div>
            </section>
          ) : (
            <>
              <div className="feed-controls">
                <div className="filter-tabs"><button className={activeTopic === "todos" ? "filter-active" : ""} onClick={() => setActiveTopic("todos")}>Todos</button><button className={activeTopic === "Joker's Club" ? "filter-active" : ""} onClick={() => setActiveTopic("Joker's Club")}>Joker's Club</button><button onClick={() => void loadPosts()}>actualizar</button></div>
                <span className="feed-count">VOCES DE LA COMUNIDAD</span>
              </div>
              {isLoading ? <div className="empty-state"><RefreshCw size={18} className="spin-icon" /> Cargando voces...</div>
                : loadError ? <div className="empty-state">{loadError}<button className="retry-button" onClick={() => void loadPosts()}>Reintentar</button></div>
                : visiblePosts.length === 0 ? <div className="empty-state">Todavía no hay voces por acá. Podés ser la primera.</div>
                : <div className="posts-list">{visiblePosts.map((post) => <AudioPost key={post.id} post={post} onTopic={(topic) => { setActiveTopic(topic); setActiveNav("feed"); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} onReply={(id) => { setReplyTarget(id); setActiveNav("publish"); setActionError(""); }} />)}</div>}
            </>
          )}
          <footer className="footer"><span>VOXURN © 2026</span><span>HECHO PARA ESCUCHAR.</span></footer>
        </main>

        <aside className="right-rail">
          <div className="rail-card">
            <div className="rail-heading">EN MOVIMIENTO <span className="live-dot" /></div>
            <h3>Conversaciones<br />que están sonando.</h3>
            {topics.slice(0, 5).map((tag, index) => <button className="trending-row" key={tag} onClick={() => { setActiveTopic(tag); setActiveNav("feed"); }}><span className="trend-number">0{index + 1}</span><span>{tag}</span><ArrowUpRight size={14} /></button>)}
          </div>
          <div className="manifesto"><span>“</span><p>Acá no importa quién sos. Importa lo que tenés para decir.</p><div>VOXURN MANIFIESTO Nº 001</div></div>
        </aside>
      </div>

      <nav className="mobile-nav">
        <button className={activeNav === "feed" ? "mobile-nav-active" : ""} onClick={() => setActiveNav("feed")}><Headphones size={19} /><span>Feed</span></button>
        <button className={activeNav === "explore" ? "mobile-nav-active" : ""} onClick={() => setActiveNav("explore")}><Compass size={19} /><span>Explorar</span></button>
        <button className={activeNav === "publish" ? "mobile-nav-active" : ""} onClick={() => setActiveNav("publish")}><Mic size={19} /><span>Publicar</span></button>
      </nav>
    </div>
  );
}
