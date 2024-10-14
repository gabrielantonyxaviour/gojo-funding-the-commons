import { getRedisClient } from "./lib/redis.js";
import { run, HandlerContext } from "@xmtp/message-kit";
import { startCron } from "./lib/cron.js";
import { RedisClientType } from "@redis/client";
import handler from "./handler/index.js";

interface Convo {
  role: string;
  content: string;
}

//Tracks conversation
const inMemoryCacheStep = new Map<string, Convo[]>();

const redisClient: RedisClientType = await getRedisClient();

let clientInitialized = false;
run(async (context: HandlerContext) => {
  const {
    v2client,
    message: {
      content: { content: text },
      typeId,
      sender,
    },
  } = context;

  if (!clientInitialized) {
    startCron(redisClient, v2client);
    clientInitialized = true;
  }
  if (typeId !== "text") {
    await context.reply(
      "Sorry I can only understand text messages for now. :/"
    );
    return;
  }

  let chatHistory = inMemoryCacheStep.get(sender.address) || [];

  chatHistory.push({ role: "user", content: text });

  let message = "";
  if (chatHistory.length == 0 || text == "init") {
    message = "Hey Chad! Gojo Here. Let me help you ship an MVP today. 💪";
    inMemoryCacheStep.set(sender.address, [{ role: "bot", content: message }]);
  } else {
    if (text.includes("bye")) {
      message = "Goodbye! 🙏";
      inMemoryCacheStep.set(sender.address, []);
    } else {
      // Handle the actual logic
      message = await handler(chatHistory, text);
      chatHistory.push({ role: "bot", content: message });
      inMemoryCacheStep.set(sender.address, chatHistory);
    }
  }
  console.log(message);
  //Send the message
  await context.reply(message);
});
