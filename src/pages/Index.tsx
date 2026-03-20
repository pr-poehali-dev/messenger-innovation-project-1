import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const TABS = [
  { id: "chats", label: "Чаты", icon: "MessageCircle" },
  { id: "calls", label: "Звонки", icon: "Phone" },
  { id: "channels", label: "Каналы", icon: "Radio" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

const CHATS = [
  { id: 1, name: "Алина Морозова", avatar: "А", color: "#a855f7", last: "Голосовое сообщение • 0:42", time: "сейчас", unread: 3, online: true, encrypted: true, type: "voice" },
  { id: 2, name: "Дизайн-команда", avatar: "Д", color: "#ec4899", last: "Максим: отправил файл design_v3.fig", time: "2 мин", unread: 12, online: false, encrypted: false, type: "group" },
  { id: 3, name: "Кирилл Захаров", avatar: "К", color: "#06b6d4", last: "Видеосообщение • 0:58", time: "15 мин", unread: 0, online: true, encrypted: true, type: "video" },
  { id: 4, name: "Продуктовые новости", avatar: "П", color: "#f59e0b", last: "Релиз v2.4 — новые фичи шифрования", time: "1 ч", unread: 5, online: false, encrypted: false, type: "channel" },
  { id: 5, name: "Соня Петрова", avatar: "С", color: "#10b981", last: "Голосовой звонок • 12 мин", time: "3 ч", unread: 0, online: false, encrypted: true, type: "voice" },
  { id: 6, name: "Стартап-хаб", avatar: "🚀", color: "#6366f1", last: "Антон: встреча завтра в 10:00", time: "вчера", unread: 0, online: false, encrypted: false, type: "group" },
];

const INIT_MESSAGES = [
  { id: 1, from: "them", text: "Привет! Посмотрел твоё голосовое 🎧", time: "14:20", type: "text" as const },
  { id: 2, from: "me", text: "Да, всё верно! Отправляю файлы сейчас", time: "14:21", type: "text" as const },
  { id: 3, from: "them", text: "", time: "14:22", type: "voice" as const, duration: "0:42" },
  { id: 4, from: "me", text: "Понял, принял 👌 Шифрование включено", time: "14:23", type: "text" as const },
  { id: 5, from: "them", text: "", time: "14:24", type: "video" as const, duration: "0:58" },
  { id: 6, from: "me", text: "Отличное видео! Созвонимся вечером?", time: "14:25", type: "text" as const },
];

const CALLS = [
  { id: 1, name: "Алина Морозова", avatar: "А", color: "#a855f7", type: "video", dir: "in", time: "сегодня, 13:40", duration: "24 мин" },
  { id: 2, name: "Кирилл Захаров", avatar: "К", color: "#06b6d4", type: "voice", dir: "out", time: "сегодня, 11:15", duration: "7 мин" },
  { id: 3, name: "Дизайн-команда", avatar: "Д", color: "#ec4899", type: "group", dir: "in", time: "вчера, 19:00", duration: "58 мин" },
  { id: 4, name: "Соня Петрова", avatar: "С", color: "#10b981", type: "voice", dir: "missed", time: "вчера, 15:22", duration: "" },
  { id: 5, name: "Антон Волков", avatar: "Ан", color: "#f59e0b", type: "video", dir: "out", time: "вчера, 09:00", duration: "1 ч 12 мин" },
];

const CHANNELS = [
  { id: 1, name: "Крипто-инсайды", avatar: "₿", color: "#f59e0b", desc: "Аналитика, тренды, сигналы", subs: "128K", verified: true, newCount: 7 },
  { id: 2, name: "Дизайн будущего", avatar: "◈", color: "#a855f7", desc: "UI/UX тренды и вдохновение", subs: "84K", verified: true, newCount: 3 },
  { id: 3, name: "Стартап Россия", avatar: "🚀", color: "#ec4899", desc: "Истории, инвестиции, нетворкинг", subs: "210K", verified: true, newCount: 0 },
  { id: 4, name: "AI Новости", avatar: "🤖", color: "#06b6d4", desc: "Всё про искусственный интеллект", subs: "341K", verified: true, newCount: 14 },
  { id: 5, name: "Музыка 2026", avatar: "♫", color: "#10b981", desc: "Новые релизы и плейлисты", subs: "56K", verified: false, newCount: 2 },
];

const waveBars = Array.from({ length: 24 }, (_, i) => 8 + Math.abs(Math.sin(i * 0.8)) * 14);

function getNow() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

type Message = {
  id: number;
  from: string;
  text: string;
  time: string;
  type: "text" | "voice" | "video";
  duration?: string;
};

export default function Index() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState("chats");
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [message, setMessage] = useState("");
  const [videoCall, setVideoCall] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [messages, setMessages] = useState<Message[]>(INIT_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedChat = CHATS.find((c) => c.id === activeChat);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "me", text: message.trim(), time: getNow(), type: "text" },
    ]);
    setMessage("");
  };

  const startRecording = () => {
    setRecording(true);
    setRecordSeconds(0);
    recordTimer.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recordTimer.current) clearInterval(recordTimer.current);
    const dur = recordSeconds;
    setRecording(false);
    setRecordSeconds(0);
    const mins = Math.floor(dur / 60);
    const secs = dur % 60;
    const durationStr = `${mins}:${secs.toString().padStart(2, "0")}`;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "me", text: "", time: getNow(), type: "voice", duration: durationStr },
    ]);
  };

  const formatRecTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="messenger-root">
      {/* Video Call Overlay */}
      {videoCall && (
        <div className="videocall-overlay">
          <div className="videocall-bg" />
          <div className="videocall-content">
            <div className="videocall-avatar-large">
              <span style={{ color: selectedChat?.color }}>{selectedChat?.avatar}</span>
            </div>
            <p className="videocall-name">{selectedChat?.name}</p>
            <p className="videocall-status">● Видеозвонок идёт • 02:14</p>
            <div className="videocall-self">
              <div className="videocall-self-preview">
                <Icon name="Video" size={16} />
              </div>
            </div>
            <div className="videocall-controls">
              <button className="vcbtn vcbtn-mute"><Icon name="MicOff" size={20} /></button>
              <button className="vcbtn vcbtn-end" onClick={() => setVideoCall(false)}><Icon name="PhoneOff" size={22} /></button>
              <button className="vcbtn vcbtn-cam"><Icon name="VideoOff" size={20} /></button>
              <button className="vcbtn vcbtn-screen"><Icon name="Monitor" size={20} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-wrap">
            <div className="logo-icon">⚡</div>
            <span className="logo-text">NOVA</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Theme toggle */}
            <button className="theme-toggle" onClick={() => setIsDark(!isDark)} title={isDark ? "Светлая тема" : "Тёмная тема"}>
              <span className="theme-toggle-track">
                <span className="theme-toggle-thumb">
                  {isDark ? "🌙" : "☀️"}
                </span>
              </span>
            </button>
            <button className="icon-btn"><Icon name="Edit" size={18} /></button>
          </div>
        </div>

        <div className="search-wrap">
          <Icon name="Search" size={16} className="search-icon" />
          <input className="search-input" placeholder="Поиск..." />
        </div>

        <nav className="tab-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? "tab-btn-active" : ""}`}
              onClick={() => { setActiveTab(t.id); if (t.id !== "chats") setActiveChat(null); }}
            >
              <Icon name={t.icon} size={18} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {activeTab === "chats" && (
          <div className="chat-list">
            {CHATS.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${activeChat === chat.id ? "chat-item-active" : ""}`}
                onClick={() => setActiveChat(chat.id)}
              >
                <div className="chat-avatar" style={{ background: chat.color + "22", border: `2px solid ${chat.color}55` }}>
                  <span style={{ color: chat.color }}>{chat.avatar}</span>
                  {chat.online && <div className="online-dot" />}
                </div>
                <div className="chat-info">
                  <div className="chat-top">
                    <span className="chat-name">{chat.name}</span>
                    <span className="chat-time">{chat.time}</span>
                  </div>
                  <div className="chat-bottom">
                    <span className="chat-last">
                      {chat.encrypted && <Icon name="Lock" size={10} className="inline mr-1 opacity-50" />}
                      {chat.type === "voice" && <Icon name="Mic" size={10} className="inline mr-1" style={{ color: "#ec4899" }} />}
                      {chat.type === "video" && <Icon name="Video" size={10} className="inline mr-1" style={{ color: "#06b6d4" }} />}
                      {chat.last}
                    </span>
                    {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "calls" && (
          <div className="chat-list">
            {CALLS.map((call) => (
              <div key={call.id} className="chat-item">
                <div className="chat-avatar" style={{ background: call.color + "22", border: `2px solid ${call.color}55` }}>
                  <span style={{ color: call.color }}>{call.avatar}</span>
                </div>
                <div className="chat-info">
                  <div className="chat-top">
                    <span className="chat-name">{call.name}</span>
                    <button className="call-icon-btn">
                      <Icon name={call.type === "video" ? "Video" : "Phone"} size={16} style={{ color: call.color }} />
                    </button>
                  </div>
                  <div className="chat-bottom">
                    <span style={{ fontSize: "11px", color: call.dir === "missed" ? "#f87171" : "var(--nova-muted)" }}>
                      <Icon name={call.dir === "in" ? "PhoneIncoming" : call.dir === "missed" ? "PhoneMissed" : "PhoneOutgoing"} size={11} className="inline mr-1" />
                      {call.dir === "missed" ? "Пропущен" : call.dir === "in" ? "Входящий" : "Исходящий"}
                      {call.duration && ` • ${call.duration}`}
                    </span>
                    <span className="chat-time">{call.time.split(", ")[1]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "channels" && (
          <div className="chat-list">
            {CHANNELS.map((ch) => (
              <div key={ch.id} className="chat-item">
                <div className="chat-avatar" style={{ background: ch.color + "22", border: `2px solid ${ch.color}55`, fontSize: "20px" }}>
                  <span>{ch.avatar}</span>
                </div>
                <div className="chat-info">
                  <div className="chat-top">
                    <span className="chat-name">
                      {ch.name}
                      {ch.verified && <Icon name="BadgeCheck" size={13} className="inline ml-1" style={{ color: "#06b6d4" }} />}
                    </span>
                    <span className="subs-badge">{ch.subs}</span>
                  </div>
                  <div className="chat-bottom">
                    <span className="chat-last">{ch.desc}</span>
                    {ch.newCount > 0 && <span className="unread-badge">{ch.newCount}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="settings-panel">
            <div className="settings-profile">
              <div className="settings-avatar">Я</div>
              <div>
                <p className="settings-name">Мой профиль</p>
                <p className="settings-status">
                  <Icon name="ShieldCheck" size={12} className="inline mr-1" style={{ color: "#4ade80" }} />
                  E2E шифрование активно
                </p>
              </div>
            </div>
            {/* Theme switcher in settings */}
            <div className="settings-item" onClick={() => setIsDark(!isDark)} style={{ cursor: "pointer" }}>
              <div className="settings-icon-wrap">
                <Icon name={isDark ? "Moon" : "Sun"} size={18} />
              </div>
              <div className="flex-1">
                <p className="settings-item-label">Тема оформления</p>
                <p className="settings-item-sub">{isDark ? "Тёмная тема" : "Светлая тема"}</p>
              </div>
              <div className="theme-toggle-mini">
                <span className="theme-toggle-mini-thumb">{isDark ? "🌙" : "☀️"}</span>
              </div>
            </div>
            {[
              { icon: "Bell", label: "Уведомления", sub: "Все включены" },
              { icon: "Shield", label: "Приватность", sub: "Максимальная защита" },
              { icon: "Lock", label: "Шифрование", sub: "End-to-end активно" },
              { icon: "Smartphone", label: "Устройства", sub: "3 активных" },
              { icon: "HardDrive", label: "Хранилище", sub: "12.4 ГБ из 50 ГБ" },
            ].map((s) => (
              <div key={s.label} className="settings-item">
                <div className="settings-icon-wrap">
                  <Icon name={s.icon} size={18} />
                </div>
                <div className="flex-1">
                  <p className="settings-item-label">{s.label}</p>
                  <p className="settings-item-sub">{s.sub}</p>
                </div>
                <Icon name="ChevronRight" size={16} className="opacity-30" />
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main area */}
      <main className="chat-main">
        {activeTab === "chats" && selectedChat ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar-sm" style={{ background: selectedChat.color + "22", border: `2px solid ${selectedChat.color}66` }}>
                  <span style={{ color: selectedChat.color }}>{selectedChat.avatar}</span>
                </div>
                <div>
                  <p className="chat-header-name">
                    {selectedChat.name}
                    {selectedChat.encrypted && <Icon name="Lock" size={13} className="inline ml-2" style={{ color: "#4ade80" }} />}
                  </p>
                  <p className="chat-header-status">
                    {selectedChat.online
                      ? <><span className="status-dot-green" />в сети</>
                      : "был(а) недавно"}
                  </p>
                </div>
              </div>
              <div className="chat-header-actions">
                <button className="icon-btn" onClick={() => setVideoCall(true)} title="Видеозвонок">
                  <Icon name="Video" size={20} />
                </button>
                <button className="icon-btn"><Icon name="Phone" size={20} /></button>
                <button className="icon-btn"><Icon name="Search" size={20} /></button>
                <button className="icon-btn"><Icon name="MoreVertical" size={20} /></button>
              </div>
            </div>

            <div className="messages-area">
              <div className="encrypt-notice">
                <Icon name="ShieldCheck" size={14} className="inline mr-1" style={{ color: "#4ade80" }} />
                Сквозное шифрование активно — никто кроме вас не читает переписку
              </div>

              {messages.map((msg) => (
                <div key={msg.id} className={`msg-row ${msg.from === "me" ? "msg-row-me" : ""}`}>
                  {msg.from === "them" && (
                    <div className="msg-avatar-sm" style={{ background: selectedChat.color + "22" }}>
                      <span style={{ color: selectedChat.color, fontSize: "12px" }}>{selectedChat.avatar}</span>
                    </div>
                  )}
                  <div className={`msg-bubble ${msg.from === "me" ? "msg-bubble-me" : "msg-bubble-them"}`}>
                    {msg.type === "text" && <p className="msg-text">{msg.text}</p>}
                    {msg.type === "voice" && (
                      <div className="voice-msg">
                        <button className="play-btn"><Icon name="Play" size={14} /></button>
                        <div className="voice-wave">
                          {waveBars.map((h, i) => (
                            <div key={i} className="wave-bar" style={{ height: `${h}px` }} />
                          ))}
                        </div>
                        <span className="voice-dur">{msg.duration}</span>
                        <span className="voice-speed">1×</span>
                      </div>
                    )}
                    {msg.type === "video" && (
                      <div className="video-msg">
                        <div className="video-preview">
                          <Icon name="Video" size={24} />
                        </div>
                        <div>
                          <p className="video-label">Видеосообщение</p>
                          <p className="voice-dur">{msg.duration}</p>
                        </div>
                      </div>
                    )}
                    <div className="msg-meta">
                      <span className="msg-time">{msg.time}</span>
                      {msg.from === "me" && <Icon name="CheckCheck" size={12} style={{ color: "#06b6d4" }} />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <button className="icon-btn"><Icon name="Paperclip" size={20} /></button>
              <div className="input-wrap">
                {recording ? (
                  <div className="recording-indicator">
                    <span className="rec-dot" />
                    <span className="rec-text">Запись голосового...</span>
                    <span className="rec-time">{formatRecTime(recordSeconds)}</span>
                  </div>
                ) : (
                  <>
                    <input
                      className="msg-input"
                      placeholder="Сообщение..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button className="emoji-btn"><Icon name="Smile" size={18} /></button>
                  </>
                )}
              </div>
              {message && !recording ? (
                <button className="send-btn" onClick={sendMessage}>
                  <Icon name="Send" size={18} />
                </button>
              ) : (
                <button
                  className={`send-btn ${recording ? "send-btn-recording" : ""}`}
                  onClick={recording ? stopRecording : startRecording}
                  title={recording ? "Остановить и отправить" : "Записать голосовое"}
                >
                  <Icon name={recording ? "Send" : "Mic"} size={18} />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">
            {activeTab === "chats" && (
              <>
                <div className="empty-icon">⚡</div>
                <h2 className="empty-title">NOVA Messenger</h2>
                <p className="empty-sub">Выбери чат, чтобы начать общение</p>
                <div className="empty-features">
                  <div className="empty-feature"><Icon name="ShieldCheck" size={18} style={{ color: "#a855f7" }} /><span>End-to-end шифрование</span></div>
                  <div className="empty-feature"><Icon name="Video" size={18} style={{ color: "#ec4899" }} /><span>Видеозвонки до 16 участников</span></div>
                  <div className="empty-feature"><Icon name="Mic" size={18} style={{ color: "#06b6d4" }} /><span>Голосовые с транскрибацией ИИ</span></div>
                </div>
              </>
            )}
            {activeTab === "calls" && (
              <>
                <div className="empty-icon">📞</div>
                <h2 className="empty-title">Звонки</h2>
                <p className="empty-sub">Нажми иконку звонка в списке, чтобы перезвонить</p>
                <div className="empty-features">
                  <div className="empty-feature"><Icon name="Video" size={18} style={{ color: "#a855f7" }} /><span>HD видеозвонки до 16 чел.</span></div>
                  <div className="empty-feature"><Icon name="Users" size={18} style={{ color: "#ec4899" }} /><span>Групповые до 32 участников</span></div>
                  <div className="empty-feature"><Icon name="Monitor" size={18} style={{ color: "#06b6d4" }} /><span>Демонстрация экрана</span></div>
                  <div className="empty-feature"><Icon name="Mic2" size={18} style={{ color: "#10b981" }} /><span>Шумоподавление на базе ИИ</span></div>
                </div>
              </>
            )}
            {activeTab === "channels" && (
              <>
                <div className="empty-icon">📡</div>
                <h2 className="empty-title">Каналы</h2>
                <p className="empty-sub">Подпишись на канал из списка</p>
                <div className="empty-features">
                  <div className="empty-feature"><Icon name="Users" size={18} style={{ color: "#a855f7" }} /><span>До 200 000 участников</span></div>
                  <div className="empty-feature"><Icon name="BadgeCheck" size={18} style={{ color: "#06b6d4" }} /><span>Верифицированные каналы</span></div>
                  <div className="empty-feature"><Icon name="Bot" size={18} style={{ color: "#ec4899" }} /><span>Боты и интеграции</span></div>
                </div>
              </>
            )}
            {activeTab === "settings" && (
              <>
                <div className="empty-icon">⚙️</div>
                <h2 className="empty-title">Настройки</h2>
                <p className="empty-sub">Выбери раздел в меню слева</p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
