console.log("🔥 Custom Service Worker Loaded");

self.addEventListener("push", (event) => {
  console.log("📦 Push event received:", event);

  try {
    const data = event.data?.json();
    console.log("📨 Push data:", data);

    const title = data.title || "Notifikasi";
    const options = {
      body: data.body || "",
      icon: "/icons/icon-192x192.png",
      data: { url: data.url || "/" },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("❌ Failed to parse push data:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
