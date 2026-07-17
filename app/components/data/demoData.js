const notifications = [
  {
    title: "New Instagram DM",
    body: "@sanaiqbal_ asked about delivery timing",
    time: "2m ago",
    unread: true,
  },
  {
    title: "Task assigned",
    body: "Arjun Verma — Marriage compatibility",
    time: "18m ago",
    unread: true,
  },
  {
    title: "Cap warning",
    body: "You're at 6 of 10 for today",
    time: "1h ago",
    unread: true,
  },
  {
    title: "Report delivered",
    body: "Rohan Sen's career report was sent",
    time: "3h ago",
    unread: false,
  },
];

const tasks = [
  {
    name: "Priya Nair — Career report",
    meta: "Assigned 09:12 · Due today",
    status: "progress",
  },
  {
    name: "Arjun Verma — Marriage compatibility",
    meta: "Assigned 08:40 · Due today",
    status: "new",
  },
  {
    name: "Wedding WoWs — Instagram DM",
    meta: "3 messages waiting",
    status: "new",
  },
  {
    name: "Sana Iqbal — Annual forecast",
    meta: "PDF uploaded · awaiting review",
    status: "ready",
  },
];

const threadMessages = {
  c2: [
    {
      from: "in",
      text: "Hi, I filled the form for a career report last week.",
      time: "10:02",
    },
    {
      from: "out",
      text: "Hi! Yes, I have your birth details here. Reviewing your chart now.",
      time: "10:05",
      sendStatus: "Sent",
    },
    {
      from: "in",
      text: "Thank you! Sending birth details now.",
      time: "10:12",
    },
  ],
};

const columns = [
  { key: "new", label: "New" },
  { key: "progress", label: "In progress" },
  { key: "ready", label: "Ready" },
  { key: "delivered", label: "Delivered" },
];

const initialTasks = [
  {
    id: "t1",
    client: "Priya Nair",
    service: "Career report",
    status: "progress",
    who: "RS",
    due: "Today",
    priority: "high",
  },
  {
    id: "t2",
    client: "Arjun Verma",
    service: "Marriage compatibility",
    status: "new",
    who: "—",
    due: "Tomorrow",
    priority: "med",
  },
  {
    id: "t3",
    client: "Sana Iqbal",
    service: "Annual forecast",
    status: "ready",
    who: "RS",
    due: "Today",
    priority: "high",
  },
  {
    id: "t4",
    client: "Meher Dutta",
    service: "Career report",
    status: "new",
    who: "—",
    due: "in 2 days",
    priority: "low",
  },
  {
    id: "t5",
    client: "K. Bannerjee",
    service: "Health & wellness reading",
    status: "progress",
    who: "AJ",
    due: "Tomorrow",
    priority: "med",
  },
  {
    id: "t6",
    client: "Rohan Sen",
    service: "Career report",
    status: "delivered",
    who: "AJ",
    due: "Delivered",
    priority: "low",
  },
  {
    id: "t7",
    client: "Wedding WoWs client",
    service: "Marriage compatibility",
    status: "delivered",
    who: "RS",
    due: "Delivered",
    priority: "low",
  },
];

const columnColors = {
  new: "var(--maroon)",
  progress: "var(--gold)",
  ready: "var(--success)",
  delivered: "var(--slate)",
};

/* ---------------- Inbox ---------------- */
const conversations = [
  {
    id: "c1",
    channel: "ig",
    name: "@sanaiqbal_",
    preview: "Can I get the report by Friday?",
    time: "2m",
    status: "new",
  },
  {
    id: "c2",
    channel: "fb",
    name: "Wedding WoWs",
    preview: "Thank you! Sending birth details now.",
    time: "11m",
    status: "progress",
  },
  {
    id: "c3",
    channel: "ig",
    name: "@arjun.verma",
    preview: "Is the compatibility report ready?",
    time: "34m",
    status: "new",
  },
  {
    id: "c4",
    channel: "fb",
    name: "Priya Nair",
    preview: "Got it, thank you astro ji 🙏",
    time: "1h",
    status: "closed",
  },
  {
    id: "c5",
    channel: "ig",
    name: "@cosmic.believer",
    preview: "How much for a career reading?",
    time: "3h",
    status: "replied",
  },
];

export {
  notifications,
  tasks,
  threadMessages,
  columns,
  initialTasks,
  columnColors,
  conversations
};
