import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

// ─── ДАННЫЕ ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "chats", label: "Чаты", icon: "MessageCircle" },
  { id: "calls", label: "Звонки", icon: "Phone" },
  { id: "channels", label: "Каналы", icon: "Radio" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

const EMOJI_LIST = ["😊","😂","❤️","🔥","👍","🎉","😍","🤔","😭","🙏","✨","💯","🚀","😎","🥰","😅","🤣","💪","🎯","👏","😘","🤝","💡","🌟","😜","🥳","💀","🤯","😤","💬"];

const CHATS_INIT = [
  { id: 1, name: "Алина Морозова", avatar: "А", color: "#a855f7", last: "Голосовое сообщение • 0:42", time: "сейчас", unread: 3, online: true, encrypted: true },
  { id: 2, name: "Дизайн-команда", avatar: "Д", color: "#ec4899", last: "Максим: отправил файл design_v3.fig", time: "2 мин", unread: 12, online: false, encrypted: false },
  { id: 3, name: "Кирилл Захаров", avatar: "К", color: "#06b6d4", last: "Видеосообщение • 0:58", time: "15 мин", unread: 0, online: true, encrypted: true },
  { id: 4, name: "Продуктовые новости", avatar: "П", color: "#f59e0b", last: "Релиз v2.4 — новые фичи шифрования", time: "1 ч", unread: 5, online: false, encrypted: false },
  { id: 5, name: "Соня Петрова", avatar: "С", color: "#10b981", last: "Голосовой звонок • 12 мин", time: "3 ч", unread: 0, online: false, encrypted: true },
  { id: 6, name: "Стартап-хаб", avatar: "🚀", color: "#6366f1", last: "Антон: встреча завтра в 10:00", time: "вчера", unread: 0, online: false, encrypted: false },
];

const INIT_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, from: "them", text: "Привет! Как дела? 👋", time: "14:18", type: "text" },
    { id: 2, from: "me", text: "Всё отлично! Работаю над новым проектом 🚀", time: "14:19", type: "text" },
    { id: 3, from: "them", text: "", time: "14:20", type: "voice", duration: "0:42" },
    { id: 4, from: "me", text: "Понял, принял 👌 Шифрование включено", time: "14:21", type: "text" },
    { id: 5, from: "them", text: "", time: "14:22", type: "video", duration: "0:58" },
    { id: 6, from: "me", text: "Отличное видео! Созвонимся вечером?", time: "14:23", type: "text" },
    { id: 7, from: "them", text: "Да, давай в 19:00 по видео!", time: "14:24", type: "text" },
  ],
  2: [
    { id: 1, from: "them", text: "Команда, всем привет! 👋", time: "11:00", type: "text" },
    { id: 2, from: "me", text: "Привет! Что по дедлайнам?", time: "11:05", type: "text" },
    { id: 3, from: "them", text: "Максим загрузил новые макеты", time: "11:10", type: "text" },
    { id: 4, from: "them", text: "", time: "11:12", type: "voice", duration: "1:24" },
  ],
  3: [
    { id: 1, from: "them", text: "Кирилл: смотри что снял сегодня!", time: "09:30", type: "text" },
    { id: 2, from: "them", text: "", time: "09:31", type: "video", duration: "0:58" },
    { id: 3, from: "me", text: "Шикарно! 🔥", time: "10:00", type: "text" },
  ],
  4: [
    { id: 1, from: "them", text: "📢 Релиз v2.4 уже доступен! Новые возможности шифрования E2E и улучшенные голосовые сообщения.", time: "09:00", type: "text" },
    { id: 2, from: "them", text: "🔐 Теперь все звонки защищены протоколом NOVA-Shield. Обновите приложение!", time: "09:01", type: "text" },
  ],
  5: [
    { id: 1, from: "them", text: "Соня: помнишь про встречу в пятницу?", time: "вчера", type: "text" },
    { id: 2, from: "me", text: "Конечно, буду! 🙌", time: "вчера", type: "text" },
    { id: 3, from: "them", text: "", time: "вчера", type: "voice", duration: "0:15" },
  ],
  6: [
    { id: 1, from: "them", text: "Всем привет! Встреча завтра в 10:00 в офисе Антона", time: "вчера", type: "text" },
    { id: 2, from: "me", text: "Буду онлайн 👍", time: "вчера", type: "text" },
  ],
};

const AUTO_REPLIES: Record<number, string[]> = {
  1: ["Окей, понял 👍", "Хорошо, договорились!", "Да, отправлю позже", "😊", "Отлично!"],
  2: ["Принято!", "Обновим к вечеру", "ОК, держите в курсе 📋", "👍"],
  3: ["🔥🔥🔥", "Круто получилось!", "Спасибо!", "Надо показать всем!"],
  4: ["Спасибо за обновление!", "Уже обновил ✅", "Отличные новости!"],
  5: ["Хорошо! До встречи 😊", "Окей 👋", "Не забуду!"],
  6: ["Буду онлайн!", "Записал 📝", "Принял, спасибо!"],
};

const CALLS_LIST = [
  { id: 1, name: "Алина Морозова", avatar: "А", color: "#a855f7", type: "video", dir: "in", time: "сегодня, 13:40", duration: "24 мин", chatId: 1 },
  { id: 2, name: "Кирилл Захаров", avatar: "К", color: "#06b6d4", type: "voice", dir: "out", time: "сегодня, 11:15", duration: "7 мин", chatId: 3 },
  { id: 3, name: "Дизайн-команда", avatar: "Д", color: "#ec4899", type: "group", dir: "in", time: "вчера, 19:00", duration: "58 мин", chatId: 2 },
  { id: 4, name: "Соня Петрова", avatar: "С", color: "#10b981", type: "voice", dir: "missed", time: "вчера, 15:22", duration: "", chatId: 5 },
  { id: 5, name: "Антон Волков", avatar: "Ан", color: "#f59e0b", type: "video", dir: "out", time: "вчера, 09:00", duration: "1 ч 12 мин", chatId: -1 },
];

const CHANNELS_LIST = [
  { id: 1, name: "Крипто-инсайды", avatar: "₿", color: "#f59e0b", desc: "Аналитика, тренды, сигналы", subs: "128K", verified: true, newCount: 7 },
  { id: 2, name: "Дизайн будущего", avatar: "◈", color: "#a855f7", desc: "UI/UX тренды и вдохновение", subs: "84K", verified: true, newCount: 3 },
  { id: 3, name: "Стартап Россия", avatar: "🚀", color: "#ec4899", desc: "Истории, инвестиции, нетворкинг", subs: "210K", verified: true, newCount: 0 },
  { id: 4, name: "AI Новости", avatar: "🤖", color: "#06b6d4", desc: "Всё про искусственный интеллект", subs: "341K", verified: true, newCount: 14 },
  { id: 5, name: "Музыка 2026", avatar: "♫", color: "#10b981", desc: "Новые релизы и плейлисты", subs: "56K", verified: false, newCount: 2 },
];

const CHANNEL_POSTS: Record<number, { id: number; text: string; time: string; views: string; likes: number }[]> = {
  1: [
    { id: 1, text: "🚀 BTC пробил уровень $95K. Технический анализ говорит о продолжении роста до $110K. Следим!", time: "10:00", views: "12.4K", likes: 342 },
    { id: 2, text: "📊 ETH показывает силу: +8% за последние 24 часа. Открытый интерес на фьючерсах растёт.", time: "11:30", views: "8.1K", likes: 201 },
    { id: 3, text: "⚡ Solana обновила рекорд транзакций — 65 000 TPS. DeFi-экосистема взрывается!", time: "14:00", views: "19.2K", likes: 567 },
  ],
  2: [
    { id: 1, text: "✨ Новый тренд 2026: Brutalist Glassmorphism. Грубые формы + прозрачность. Примеры в карточках.", time: "09:00", views: "5.2K", likes: 189 },
    { id: 2, text: "🎨 Figma выпустила AI-автолейаут. Теперь адаптив строится за секунды на основе контента.", time: "13:00", views: "7.8K", likes: 312 },
    { id: 3, text: "💡 10 принципов дизайна, которые изменят ваш подход в 2026. Сохраняйте!", time: "16:00", views: "15.6K", likes: 489 },
  ],
  3: [
    { id: 1, text: "🦄 Новый единорог из России: платформа ИИ-рекрутинга Talentia привлекла $40M Series B.", time: "08:00", views: "22K", likes: 678 },
    { id: 2, text: "📈 Топ-5 стартапов этой недели по версии редакции. Читайте в нашем Telegram!", time: "12:00", views: "11K", likes: 234 },
    { id: 3, text: "🎯 Как строить команду в 2026: опыт 3 основателей, которые прошли путь от 0 до $10M ARR.", time: "15:00", views: "18K", likes: 502 },
  ],
  4: [
    { id: 1, text: "🤖 GPT-5 официально анонсирован. Контекстное окно 2M токенов, нативное видео, live-browsing.", time: "07:00", views: "45K", likes: 1234 },
    { id: 2, text: "🧠 DeepMind AlphaFold 4 решил задачу предсказания белков на 99.9%. Революция в медицине.", time: "11:00", views: "38K", likes: 987 },
    { id: 3, text: "⚡ Nvidia H200 поступила в открытую продажу. Производительность +3× по сравнению с H100.", time: "16:00", views: "29K", likes: 765 },
  ],
  5: [
    { id: 1, text: "🎵 Kendrick Lamar выпустил неожиданный дроп. Альбом уже бьёт рекорды стримингов.", time: "00:01", views: "98K", likes: 4521 },
    { id: 2, text: "🎶 Плейлист недели: 25 треков для рабочего настроения. Ссылка в описании!", time: "12:00", views: "14K", likes: 678 },
  ],
};

const waveBars = Array.from({ length: 24 }, (_, i) => 8 + Math.abs(Math.sin(i * 0.8)) * 14);

function getNow() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

// ─── ТИПЫ ──────────────────────────────────────────────────────────────────

type Message = {
  id: number;
  from: string;
  text: string;
  time: string;
  type: "text" | "voice" | "video";
  duration?: string;
  reactions?: string[];
};

type Chat = typeof CHATS_INIT[0];
type CallItem = typeof CALLS_LIST[0];

// ─── КОМПОНЕНТ ─────────────────────────────────────────────────────────────

export default function Index() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState("chats");
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [videoCall, setVideoCall] = useState(false);
  const [voiceCall, setVoiceCall] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [allMessages, setAllMessages] = useState<Record<number, Message[]>>(INIT_MESSAGES);
  const [chats, setChats] = useState(CHATS_INIT);
  const [channels, setChannels] = useState(CHANNELS_LIST);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatSearch, setChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [voicePlayingId, setVoicePlayingId] = useState<number | null>(null);
  const [voiceSpeed, setVoiceSpeed] = useState<Record<number, number>>({});
  const [playProgress, setPlayProgress] = useState<Record<number, number>>({});
  const [reactionTarget, setReactionTarget] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const callTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const playTimers = useRef<Record<number, ReturnType<typeof setInterval>>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedChat = chats.find((c) => c.id === activeChat);
  const messages = activeChat ? (allMessages[activeChat] || []) : [];

  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = chatSearchQuery
    ? messages.filter(m => m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : messages;

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeChat]);

  // Close menus on outside click
  useEffect(() => {
    const handler = () => { setShowEmoji(false); setShowMenu(false); setReactionTarget(null); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Call timer
  useEffect(() => {
    if (videoCall || voiceCall) {
      setCallSeconds(0);
      callTimer.current = setInterval(() => setCallSeconds(s => s + 1), 1000);
    } else {
      if (callTimer.current) clearInterval(callTimer.current);
    }
    return () => { if (callTimer.current) clearInterval(callTimer.current); };
  }, [videoCall, voiceCall]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // ─── ОТПРАВКА СООБЩЕНИЯ ──────────────────────────────────────────────────

  const sendMessage = useCallback(() => {
    if (!message.trim() || !activeChat) return;
    const newMsg: Message = {
      id: Date.now(),
      from: "me",
      text: message.trim(),
      time: getNow(),
      type: "text",
    };
    setAllMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMsg] }));
    setChats(prev => prev.map(c => c.id === activeChat ? { ...c, last: message.trim(), time: "сейчас" } : c));
    setMessage("");
    setShowEmoji(false);

    // Typing indicator + auto-reply
    setTimeout(() => setIsTyping(true), 600);
    const delay = 1200 + Math.random() * 1000;
    const replies = AUTO_REPLIES[activeChat] || ["👍"];
    const replyText = replies[Math.floor(Math.random() * replies.length)];
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: Date.now() + 1,
        from: "them",
        text: replyText,
        time: getNow(),
        type: "text",
      };
      setAllMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), reply] }));
      setChats(prev => prev.map(c => c.id === activeChat ? { ...c, last: replyText, time: "сейчас" } : c));
    }, delay);
  }, [message, activeChat]);

  // ─── ГОЛОСОВОЕ СООБЩЕНИЕ ─────────────────────────────────────────────────

  const startRecording = () => {
    setRecording(true);
    setRecordSeconds(0);
    recordTimer.current = setInterval(() => setRecordSeconds(s => s + 1), 1000);
  };

  const stopRecording = () => {
    if (recordTimer.current) clearInterval(recordTimer.current);
    const dur = recordSeconds;
    setRecording(false);
    setRecordSeconds(0);
    if (!activeChat) return;
    const durationStr = `${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, "0")}`;
    const voiceMsg: Message = {
      id: Date.now(),
      from: "me",
      text: "",
      time: getNow(),
      type: "voice",
      duration: durationStr,
    };
    setAllMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), voiceMsg] }));
    setChats(prev => prev.map(c => c.id === activeChat ? { ...c, last: `Голосовое • ${durationStr}`, time: "сейчас" } : c));
  };

  const cancelRecording = () => {
    if (recordTimer.current) clearInterval(recordTimer.current);
    setRecording(false);
    setRecordSeconds(0);
  };

  // ─── ВОСПРОИЗВЕДЕНИЕ ГОЛОСОВОГО ──────────────────────────────────────────

  const togglePlay = (msgId: number, durationStr: string = "0:30") => {
    const parts = durationStr.split(":").map(Number);
    const totalSec = parts[0] * 60 + (parts[1] || 0);

    if (voicePlayingId === msgId) {
      clearInterval(playTimers.current[msgId]);
      setVoicePlayingId(null);
      setPlayProgress(prev => ({ ...prev, [msgId]: 0 }));
      return;
    }

    if (voicePlayingId) {
      clearInterval(playTimers.current[voicePlayingId]);
      setPlayProgress(prev => ({ ...prev, [voicePlayingId!]: 0 }));
    }

    setVoicePlayingId(msgId);
    setPlayProgress(prev => ({ ...prev, [msgId]: 0 }));

    let elapsed = 0;
    const speed = voiceSpeed[msgId] || 1;
    playTimers.current[msgId] = setInterval(() => {
      elapsed += 0.1 * speed;
      const progress = Math.min((elapsed / totalSec) * 100, 100);
      setPlayProgress(prev => ({ ...prev, [msgId]: progress }));
      if (elapsed >= totalSec) {
        clearInterval(playTimers.current[msgId]);
        setVoicePlayingId(null);
        setPlayProgress(prev => ({ ...prev, [msgId]: 0 }));
      }
    }, 100);
  };

  const cycleSpeed = (msgId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = voiceSpeed[msgId] || 1;
    const next = current === 1 ? 1.5 : current === 1.5 ? 2 : 1;
    setVoiceSpeed(prev => ({ ...prev, [msgId]: next }));
  };

  // ─── РЕАКЦИИ ──────────────────────────────────────────────────────────────

  const addReaction = (msgId: number, emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeChat) return;
    setAllMessages(prev => ({
      ...prev,
      [activeChat]: prev[activeChat].map(m =>
        m.id === msgId
          ? { ...m, reactions: m.reactions?.includes(emoji) ? m.reactions.filter(r => r !== emoji) : [...(m.reactions || []), emoji] }
          : m
      ),
    }));
    setReactionTarget(null);
  };

  // ─── УВЕДОМЛЕНИЯ ──────────────────────────────────────────────────────────

  const showNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 2500);
  };

  // ─── НОВЫЙ ЧАТ ────────────────────────────────────────────────────────────

  const createChat = () => {
    if (!newChatName.trim()) return;
    const colors = ["#a855f7", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#6366f1"];
    const newChat: Chat = {
      id: Date.now(),
      name: newChatName.trim(),
      avatar: newChatName.trim()[0].toUpperCase(),
      color: colors[Math.floor(Math.random() * colors.length)],
      last: "Новый чат",
      time: "сейчас",
      unread: 0,
      online: true,
      encrypted: true,
    };
    setChats(prev => [newChat, ...prev]);
    setAllMessages(prev => ({ ...prev, [newChat.id]: [] }));
    setActiveChat(newChat.id);
    setShowNewChat(false);
    setNewChatName("");
    showNotification("Чат создан!");
  };

  // ─── ОЧИСТИТЬ ЧАТ / УДАЛИТЬ ──────────────────────────────────────────────

  const clearChat = () => {
    if (!activeChat) return;
    setAllMessages(prev => ({ ...prev, [activeChat]: [] }));
    setShowMenu(false);
    showNotification("Чат очищен");
  };

  const deleteChat = () => {
    if (!activeChat) return;
    setChats(prev => prev.filter(c => c.id !== activeChat));
    setActiveChat(null);
    setShowMenu(false);
    showNotification("Чат удалён");
  };

  const markAllRead = () => {
    setChats(prev => prev.map(c => ({ ...c, unread: 0 })));
    showNotification("Все сообщения прочитаны");
  };

  // ─── РЕНДЕР ───────────────────────────────────────────────────────────────

  return (
    <div className="messenger-root">

      {/* ── УВЕДОМЛЕНИЕ ── */}
      {notification && (
        <div className="toast-notify" onClick={() => setNotification(null)}>
          <Icon name="CheckCircle" size={15} />
          {notification}
        </div>
      )}

      {/* ── ЗВОНОК (ГОЛОСОВОЙ / ВИДЕО) ── */}
      {(videoCall || voiceCall) && (
        <div className="videocall-overlay">
          <div className="videocall-bg" />
          <div className="videocall-content">
            <div className="videocall-avatar-large" style={{ borderColor: selectedChat?.color + "88" }}>
              <span style={{ color: selectedChat?.color }}>{selectedChat?.avatar}</span>
            </div>
            <p className="videocall-name">{selectedChat?.name}</p>
            <p className="videocall-status">● {videoCall ? "Видеозвонок" : "Голосовой звонок"} • {formatTime(callSeconds)}</p>

            {videoCall && !isCamOff && (
              <div className="videocall-self">
                <div className="videocall-self-preview">
                  <Icon name="Video" size={16} />
                  <span style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>Камера</span>
                </div>
              </div>
            )}

            <div className="vcall-indicators">
              {isMuted && <span className="vcall-indicator"><Icon name="MicOff" size={12} /> Muted</span>}
              {isCamOff && videoCall && <span className="vcall-indicator"><Icon name="VideoOff" size={12} /> Cam off</span>}
            </div>

            <div className="videocall-controls">
              <button className={`vcbtn ${isMuted ? "vcbtn-active" : "vcbtn-mute"}`} onClick={() => { setIsMuted(!isMuted); showNotification(isMuted ? "Микрофон включён" : "Микрофон выключен"); }}>
                <Icon name={isMuted ? "Mic" : "MicOff"} size={20} />
              </button>
              <button className="vcbtn vcbtn-end" onClick={() => { setVideoCall(false); setVoiceCall(false); setIsMuted(false); setIsCamOff(false); showNotification("Звонок завершён"); }}>
                <Icon name="PhoneOff" size={22} />
              </button>
              {videoCall && (
                <button className={`vcbtn ${isCamOff ? "vcbtn-active" : "vcbtn-cam"}`} onClick={() => { setIsCamOff(!isCamOff); showNotification(isCamOff ? "Камера включена" : "Камера выключена"); }}>
                  <Icon name={isCamOff ? "Video" : "VideoOff"} size={20} />
                </button>
              )}
              <button className="vcbtn vcbtn-screen" onClick={() => showNotification("Демонстрация экрана начата")}>
                <Icon name="Monitor" size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── НОВЫЙ ЧАТ МОДАЛКА ── */}
      {showNewChat && (
        <div className="modal-overlay" onClick={() => setShowNewChat(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Новый чат</span>
              <button className="icon-btn" onClick={() => setShowNewChat(false)}><Icon name="X" size={18} /></button>
            </div>
            <input
              className="modal-input"
              placeholder="Имя контакта..."
              value={newChatName}
              onChange={e => setNewChatName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createChat()}
              autoFocus
            />
            <button className="modal-btn" onClick={createChat}>
              <Icon name="Plus" size={16} />
              Создать чат
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-wrap">
            <div className="logo-icon">⚡</div>
            <span className="logo-text">NOVA</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button className="theme-toggle" onClick={() => setIsDark(!isDark)} title={isDark ? "Светлая тема" : "Тёмная тема"}>
              <span className="theme-toggle-track">
                <span className="theme-toggle-thumb">{isDark ? "🌙" : "☀️"}</span>
              </span>
            </button>
            <button className="icon-btn" onClick={() => setShowNewChat(true)} title="Новый чат">
              <Icon name="Edit" size={18} />
            </button>
          </div>
        </div>

        <div className="search-wrap">
          <Icon name="Search" size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery("")}>
              <Icon name="X" size={14} />
            </button>
          )}
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
              {t.id === "chats" && chats.some(c => c.unread > 0) && <span className="tab-dot" />}
            </button>
          ))}
        </nav>

        {/* ── СПИСОК ЧАТОВ ── */}
        {activeTab === "chats" && (
          <div className="chat-list">
            {filteredChats.length === 0 && (
              <div className="list-empty">
                <Icon name="SearchX" size={28} />
                <span>Ничего не найдено</span>
              </div>
            )}
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${activeChat === chat.id ? "chat-item-active" : ""}`}
                onClick={() => { setActiveChat(chat.id); setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c)); }}
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
                      {chat.last}
                    </span>
                    {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── СПИСОК ЗВОНКОВ ── */}
        {activeTab === "calls" && (
          <div className="chat-list">
            <div className="calls-new-btn" onClick={() => { setActiveTab("chats"); showNotification("Выберите контакт для звонка"); }}>
              <Icon name="Phone" size={16} />
              <span>Новый звонок</span>
            </div>
            {CALLS_LIST.map((call) => (
              <div key={call.id} className="chat-item" onClick={() => { if (call.chatId > 0) { setActiveTab("chats"); setActiveChat(call.chatId); } }}>
                <div className="chat-avatar" style={{ background: call.color + "22", border: `2px solid ${call.color}55` }}>
                  <span style={{ color: call.color }}>{call.avatar}</span>
                </div>
                <div className="chat-info">
                  <div className="chat-top">
                    <span className="chat-name">{call.name}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="call-icon-btn" onClick={e => { e.stopPropagation(); setActiveChat(call.chatId > 0 ? call.chatId : null); setActiveTab("chats"); setTimeout(() => setVoiceCall(true), 100); }} title="Позвонить">
                        <Icon name="Phone" size={15} style={{ color: call.color }} />
                      </button>
                      {call.type === "video" && (
                        <button className="call-icon-btn" onClick={e => { e.stopPropagation(); setActiveChat(call.chatId > 0 ? call.chatId : null); setActiveTab("chats"); setTimeout(() => setVideoCall(true), 100); }} title="Видеозвонок">
                          <Icon name="Video" size={15} style={{ color: call.color }} />
                        </button>
                      )}
                    </div>
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

        {/* ── СПИСОК КАНАЛОВ ── */}
        {activeTab === "channels" && (
          <div className="chat-list">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className={`chat-item ${activeChannel === ch.id ? "chat-item-active" : ""}`}
                onClick={() => { setActiveChannel(ch.id); setChannels(prev => prev.map(c => c.id === ch.id ? { ...c, newCount: 0 } : c)); }}
              >
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

        {/* ── НАСТРОЙКИ ── */}
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

            <div className="settings-item" onClick={() => setIsDark(!isDark)}>
              <div className="settings-icon-wrap"><Icon name={isDark ? "Moon" : "Sun"} size={18} /></div>
              <div className="flex-1">
                <p className="settings-item-label">Тема оформления</p>
                <p className="settings-item-sub">{isDark ? "Тёмная" : "Светлая"}</p>
              </div>
              <div className="theme-toggle-mini">{isDark ? "🌙" : "☀️"}</div>
            </div>

            <div className="settings-item" onClick={() => { markAllRead(); }}>
              <div className="settings-icon-wrap"><Icon name="CheckCheck" size={18} /></div>
              <div className="flex-1">
                <p className="settings-item-label">Прочитать всё</p>
                <p className="settings-item-sub">Сбросить все непрочитанные</p>
              </div>
              <Icon name="ChevronRight" size={16} className="opacity-30" />
            </div>

            {[
              { icon: "Bell", label: "Уведомления", sub: "Все включены", action: () => showNotification("Настройки уведомлений") },
              { icon: "Shield", label: "Приватность", sub: "Максимальная защита", action: () => showNotification("Настройки приватности") },
              { icon: "Lock", label: "Шифрование", sub: "End-to-end активно", action: () => showNotification("E2E шифрование включено ✅") },
              { icon: "Smartphone", label: "Устройства", sub: "3 активных", action: () => showNotification("Управление устройствами") },
              { icon: "HardDrive", label: "Хранилище", sub: "12.4 ГБ из 50 ГБ", action: () => showNotification("Управление хранилищем") },
              { icon: "LogOut", label: "Выйти", sub: "Выход из аккаунта", action: () => showNotification("Выход выполнен") },
            ].map((s) => (
              <div key={s.label} className="settings-item" onClick={s.action}>
                <div className="settings-icon-wrap"><Icon name={s.icon} size={18} /></div>
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

      {/* ══════════════ MAIN ══════════════ */}
      <main className="chat-main">

        {/* ── АКТИВНЫЙ ЧАТ ── */}
        {activeTab === "chats" && selectedChat ? (
          <>
            {/* Header */}
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
                    {isTyping
                      ? <><span className="typing-dots"><span/><span/><span/></span> печатает...</>
                      : selectedChat.online
                        ? <><span className="status-dot-green" />в сети</>
                        : "был(а) недавно"}
                  </p>
                </div>
              </div>
              <div className="chat-header-actions">
                {/* Chat search toggle */}
                <div style={{ position: "relative" }}>
                  <button className={`icon-btn ${chatSearch ? "icon-btn-active" : ""}`} onClick={() => { setChatSearch(!chatSearch); setChatSearchQuery(""); }} title="Поиск в чате">
                    <Icon name="Search" size={20} />
                  </button>
                </div>
                <button className="icon-btn" onClick={() => { setVoiceCall(true); }} title="Голосовой звонок">
                  <Icon name="Phone" size={20} />
                </button>
                <button className="icon-btn" onClick={() => setVideoCall(true)} title="Видеозвонок">
                  <Icon name="Video" size={20} />
                </button>
                <div style={{ position: "relative" }}>
                  <button className="icon-btn" onClick={e => { e.stopPropagation(); setShowMenu(!showMenu); }} title="Меню">
                    <Icon name="MoreVertical" size={20} />
                  </button>
                  {showMenu && (
                    <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
                      <button className="dropdown-item" onClick={() => { showNotification("Контакт добавлен в избранное ⭐"); setShowMenu(false); }}>
                        <Icon name="Star" size={15} /> Добавить в избранное
                      </button>
                      <button className="dropdown-item" onClick={() => { showNotification("Чат заглушён 🔕"); setShowMenu(false); }}>
                        <Icon name="BellOff" size={15} /> Заглушить уведомления
                      </button>
                      <button className="dropdown-item" onClick={clearChat}>
                        <Icon name="Trash2" size={15} /> Очистить историю
                      </button>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item dropdown-item-danger" onClick={deleteChat}>
                        <Icon name="Trash" size={15} /> Удалить чат
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat search bar */}
            {chatSearch && (
              <div className="chat-search-bar">
                <Icon name="Search" size={15} className="search-icon" />
                <input
                  className="search-input"
                  style={{ flex: 1 }}
                  placeholder="Поиск по сообщениям..."
                  value={chatSearchQuery}
                  onChange={e => setChatSearchQuery(e.target.value)}
                  autoFocus
                />
                {chatSearchQuery && (
                  <span style={{ fontSize: 11, color: "var(--nova-muted)" }}>
                    {filteredMessages.length} найдено
                  </span>
                )}
                <button className="icon-btn" onClick={() => { setChatSearch(false); setChatSearchQuery(""); }}>
                  <Icon name="X" size={16} />
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="messages-area" onClick={() => { setShowEmoji(false); setShowMenu(false); setReactionTarget(null); }}>
              <div className="encrypt-notice">
                <Icon name="ShieldCheck" size={14} className="inline mr-1" style={{ color: "#4ade80" }} />
                Сквозное шифрование активно
              </div>

              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`msg-row ${msg.from === "me" ? "msg-row-me" : ""}`}
                  onDoubleClick={e => { e.stopPropagation(); setReactionTarget(reactionTarget === msg.id ? null : msg.id); }}
                >
                  {msg.from === "them" && (
                    <div className="msg-avatar-sm" style={{ background: selectedChat.color + "22" }}>
                      <span style={{ color: selectedChat.color, fontSize: "12px" }}>{selectedChat.avatar}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: msg.from === "me" ? "flex-end" : "flex-start", gap: 2 }}>
                    <div className={`msg-bubble ${msg.from === "me" ? "msg-bubble-me" : "msg-bubble-them"} ${chatSearchQuery && msg.text.toLowerCase().includes(chatSearchQuery.toLowerCase()) ? "msg-highlight" : ""}`}>
                      {msg.type === "text" && <p className="msg-text">{msg.text}</p>}

                      {msg.type === "voice" && (
                        <div className="voice-msg">
                          <button className="play-btn" onClick={() => togglePlay(msg.id, msg.duration)}>
                            <Icon name={voicePlayingId === msg.id ? "Pause" : "Play"} size={14} />
                          </button>
                          <div className="voice-wave">
                            {waveBars.map((h, i) => (
                              <div
                                key={i}
                                className="wave-bar"
                                style={{
                                  height: `${h}px`,
                                  opacity: voicePlayingId === msg.id && (i / waveBars.length) * 100 < (playProgress[msg.id] || 0) ? 1 : 0.4,
                                  background: voicePlayingId === msg.id && (i / waveBars.length) * 100 < (playProgress[msg.id] || 0)
                                    ? "linear-gradient(to top, var(--nova-purple), var(--nova-pink))"
                                    : undefined,
                                }}
                              />
                            ))}
                          </div>
                          <span className="voice-dur">{msg.duration}</span>
                          <span className="voice-speed" onClick={e => cycleSpeed(msg.id, e)}>
                            {(voiceSpeed[msg.id] || 1)}×
                          </span>
                        </div>
                      )}

                      {msg.type === "video" && (
                        <div className="video-msg" onClick={() => showNotification("Видеосообщение воспроизводится 🎬")}>
                          <div className="video-preview">
                            <Icon name="Play" size={24} />
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

                    {/* Реакции */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="reactions-row">
                        {msg.reactions.map((r, i) => (
                          <span key={i} className="reaction-chip" onClick={e => addReaction(msg.id, r, e)}>{r}</span>
                        ))}
                      </div>
                    )}

                    {/* Picker реакций */}
                    {reactionTarget === msg.id && (
                      <div className="reaction-picker" onClick={e => e.stopPropagation()}>
                        {["❤️","👍","😂","🔥","😮","😢","👏","🚀"].map(e => (
                          <button key={e} className="reaction-pick-btn" onClick={ev => addReaction(msg.id, e, ev)}>{e}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="msg-row">
                  <div className="msg-avatar-sm" style={{ background: selectedChat.color + "22" }}>
                    <span style={{ color: selectedChat.color, fontSize: "12px" }}>{selectedChat.avatar}</span>
                  </div>
                  <div className="msg-bubble msg-bubble-them typing-bubble">
                    <span className="typing-dots"><span /><span /><span /></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <button className="icon-btn" onClick={() => showNotification("Прикрепить файл (до 2 ГБ)")} title="Прикрепить файл">
                <Icon name="Paperclip" size={20} />
              </button>

              <div className="input-wrap">
                {recording ? (
                  <div className="recording-indicator">
                    <span className="rec-dot" />
                    <span className="rec-text">Запись...</span>
                    <span className="rec-time">{formatTime(recordSeconds)}</span>
                    <button className="rec-cancel" onClick={cancelRecording} title="Отменить">
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={inputRef}
                      className="msg-input"
                      placeholder="Сообщение..."
                      value={message}
                      onChange={(e) => { setMessage(e.target.value); }}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    />
                    <button
                      className={`emoji-btn ${showEmoji ? "emoji-btn-active" : ""}`}
                      onClick={e => { e.stopPropagation(); setShowEmoji(!showEmoji); }}
                    >
                      <Icon name="Smile" size={18} />
                    </button>
                  </>
                )}

                {/* Emoji picker */}
                {showEmoji && (
                  <div className="emoji-picker" onClick={e => e.stopPropagation()}>
                    {EMOJI_LIST.map(em => (
                      <button key={em} className="emoji-item" onClick={() => { setMessage(prev => prev + em); inputRef.current?.focus(); }}>
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {message && !recording ? (
                <button className="send-btn" onClick={sendMessage} title="Отправить">
                  <Icon name="Send" size={18} />
                </button>
              ) : (
                <button
                  className={`send-btn ${recording ? "send-btn-recording" : ""}`}
                  onClick={recording ? stopRecording : startRecording}
                  title={recording ? "Отправить голосовое" : "Записать голосовое"}
                >
                  <Icon name={recording ? "Send" : "Mic"} size={18} />
                </button>
              )}
            </div>
          </>
        ) : null}

        {/* ── КАНАЛ ── */}
        {activeTab === "channels" && activeChannel && (() => {
          const ch = channels.find(c => c.id === activeChannel)!;
          const posts = CHANNEL_POSTS[activeChannel] || [];
          return (
            <>
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="chat-avatar-sm" style={{ background: ch.color + "22", border: `2px solid ${ch.color}66`, fontSize: 20 }}>
                    <span>{ch.avatar}</span>
                  </div>
                  <div>
                    <p className="chat-header-name">
                      {ch.name}
                      {ch.verified && <Icon name="BadgeCheck" size={14} className="inline ml-1" style={{ color: "#06b6d4" }} />}
                    </p>
                    <p className="chat-header-status">{ch.subs} подписчиков</p>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button className="channel-subscribe-btn" onClick={() => showNotification(`Вы подписаны на ${ch.name} ✅`)}>
                    <Icon name="Bell" size={15} /> Подписаться
                  </button>
                </div>
              </div>
              <div className="messages-area">
                {posts.map(post => (
                  <div key={post.id} className="channel-post">
                    <div className="channel-post-avatar" style={{ background: ch.color + "22", border: `1px solid ${ch.color}44` }}>
                      <span style={{ color: ch.color }}>{ch.avatar}</span>
                    </div>
                    <div className="channel-post-body">
                      <div className="channel-post-header">
                        <span className="channel-post-name">{ch.name}</span>
                        <span className="channel-post-time">{post.time}</span>
                      </div>
                      <p className="channel-post-text">{post.text}</p>
                      <div className="channel-post-footer">
                        <button className="channel-action" onClick={() => showNotification("Лайк поставлен ❤️")}>
                          <Icon name="Heart" size={14} /> {post.likes}
                        </button>
                        <span className="channel-views">
                          <Icon name="Eye" size={13} /> {post.views}
                        </span>
                        <button className="channel-action" onClick={() => showNotification("Ссылка скопирована 📋")}>
                          <Icon name="Share2" size={14} /> Поделиться
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        {/* ── ПУСТЫЕ СОСТОЯНИЯ ── */}
        {((activeTab === "chats" && !selectedChat) ||
          (activeTab === "calls") ||
          (activeTab === "channels" && !activeChannel) ||
          (activeTab === "settings")) && (
          <div className="empty-state">
            {activeTab === "chats" && (
              <>
                <div className="empty-icon">⚡</div>
                <h2 className="empty-title">NOVA Messenger</h2>
                <p className="empty-sub">Выбери чат или начни новый</p>
                <button className="empty-start-btn" onClick={() => setShowNewChat(true)}>
                  <Icon name="Plus" size={16} /> Новый чат
                </button>
                <div className="empty-features">
                  <div className="empty-feature"><Icon name="ShieldCheck" size={18} style={{ color: "#a855f7" }} /><span>End-to-end шифрование</span></div>
                  <div className="empty-feature"><Icon name="Video" size={18} style={{ color: "#ec4899" }} /><span>Видеозвонки до 16 участников</span></div>
                  <div className="empty-feature"><Icon name="Mic" size={18} style={{ color: "#06b6d4" }} /><span>Голосовые с анимацией волны</span></div>
                </div>
              </>
            )}
            {activeTab === "calls" && (
              <>
                <div className="empty-icon">📞</div>
                <h2 className="empty-title">Звонки</h2>
                <p className="empty-sub">Выбери контакт в списке → нажми иконку звонка</p>
                <div className="empty-features">
                  <div className="empty-feature"><Icon name="Video" size={18} style={{ color: "#a855f7" }} /><span>HD видеозвонки до 16 чел.</span></div>
                  <div className="empty-feature"><Icon name="Users" size={18} style={{ color: "#ec4899" }} /><span>Групповые до 32 участников</span></div>
                  <div className="empty-feature"><Icon name="Monitor" size={18} style={{ color: "#06b6d4" }} /><span>Демонстрация экрана</span></div>
                  <div className="empty-feature"><Icon name="Mic2" size={18} style={{ color: "#10b981" }} /><span>Шумоподавление на базе ИИ</span></div>
                </div>
              </>
            )}
            {activeTab === "channels" && !activeChannel && (
              <>
                <div className="empty-icon">📡</div>
                <h2 className="empty-title">Каналы</h2>
                <p className="empty-sub">Выбери канал из списка слева</p>
                <div className="empty-features">
                  <div className="empty-feature"><Icon name="Users" size={18} style={{ color: "#a855f7" }} /><span>До 200 000 участников</span></div>
                  <div className="empty-feature"><Icon name="BadgeCheck" size={18} style={{ color: "#06b6d4" }} /><span>Верифицированные каналы</span></div>
                  <div className="empty-feature"><Icon name="Heart" size={18} style={{ color: "#ec4899" }} /><span>Реакции и статистика</span></div>
                </div>
              </>
            )}
            {activeTab === "settings" && (
              <>
                <div className="empty-icon">⚙️</div>
                <h2 className="empty-title">Настройки</h2>
                <p className="empty-sub">Используй меню слева</p>
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
