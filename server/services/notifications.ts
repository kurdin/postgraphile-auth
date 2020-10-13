import createSubscriber from "pg-listen";
import config from "../config";

const subscriber = createSubscriber({ connectionString: config.databaseUrl });

subscriber.notifications.on("confirm_email", (payload) => {
  console.log("Received notification in 'confirm_email':", payload);
});

subscriber.events.on("error", (error) => {
  console.error("Fatal database connection error:", error);
  process.exit(1);
});

process.on("exit", () => {
  subscriber.close();
});

export const subscribeToNotifications = async () => {
  await subscriber.connect();
  await subscriber.listenTo("confirm_email");
};
