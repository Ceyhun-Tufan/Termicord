const { Client } = require('discord.js-selfbot-v13');
const client = new Client();
require("dotenv").config();
const blessed = require("blessed");
// Totally didnt use chatgpt at all 

const screen = blessed.screen({
  smartCSR: true
});

screen.title = "Termicord";

const messageBox = blessed.box({
  top: '0',
  left: '0',
  width: '100%',
  height: '95%',
  content: "Don't fall for e-girls",
  tags: true,
  border: {
    type: 'none'
  },
  style: {
    border: {
      fg: '#212121'
    }
  },
  bg: "#212121",
  fg: "#212121"
});

const inputBox = blessed.textbox({
  bottom: 1,
  height: 3,
  width: '100%',
  inputOnFocus: true,
  border: {
    type: 'none'
  },
  style: {
    border: {
      fg: '#212121'
    }
  },
  bg: "#212121",
  fg: "#212121"
});

const listBox = blessed.list({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  items: ['Option 1', 'Option 2', 'Option 3', 'Option 4'], // List items
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: '#f0f0f0'
    },
    selected: {
      bg: 'blue',
      fg: 'white'
    }
  },
  hidden: true, // Start hidden
  keys: true, // Enable keyboard interactions
  vi: true, // Use vi-style key bindings
});

const listBox2 = blessed.list({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  items: ["select a server"], // List items
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: '#f0f0f0'
    },
    selected: {
      bg: 'blue',
      fg: 'white'
    }
  },
  keys: true, // Enable keyboard interactions
  vi: true, // Use vi-style key bindings
  hidden: true
});

screen.append(messageBox);
screen.append(inputBox);
screen.append(listBox);
screen.append(listBox2);

inputBox.focus();

const TOKEN = process.env.TOKEN;
const CHANNEL = process.env.CHANNEL;
const GUILD = process.env.GUILD;

class Currently {
  constructor() {
    this.mode = 0; // 0
    this.chatId = CHANNEL;
    this.guildId = GUILD;
    this.allGuilds = "";
    this.guildHolder = []; // Changed initialization to array
    this.channelHolder = [];
  }
}


class OldMessageHandler {
  constructor() {
    this.messagesWhileBusy = ""; // messages that are received while in modes other than 0
    this.oldMessages = ""; // to hold the messages while changing modes
  }
}

const messageHandler = new OldMessageHandler();
const current = new Currently();

client.on('ready', async () => {
  // Get guilds and update listBox items
  let xx = 0;
  current.guildHolder = client.guilds.cache.map(guild => ({ //{ name: 'Guild 3', id: '345678901234567890', index: 3 }
    name: guild.name,
    id: guild.id,
    index: xx++
  }));

  //console.log(current.guildHolder)

  var oof = client.guilds.cache.map(guild => guild.name); // Guild names
  listBox.setItems(oof);

  var foo = "";
  oof.forEach((name, index) => {
    foo += `\n{bold}${index + 1}- ${name}{/bold}`; // Changed index to be 1-based
  });
  current.allGuilds = foo;

  console.log("Ready");
});

client.on("messageCreate", async (message) => {
  if (message.channel.id === current.chatId) {
    const nick = message.member.nickname || message.member.displayName;
    if (current.mode !== 0) {
      messageHandler.messagesWhileBusy = messageBox.getContent() + `\n{bold}{yellow-fg}${nick}{/yellow-fg}{/bold}\n${message.content}`;
    }
    messageBox.setContent(messageBox.getContent() + `\n{bold}{yellow-fg}${nick}{/yellow-fg}{/bold}\n${message.content}`);
    setImmediate(() => {
      screen.render();
    });
  }
});

inputBox.on('submit', (value) => {
  if (value === "-servers") {
    messageHandler.oldMessages = messageBox.getContent();
    inputBox.clearValue();
    listBox.show();
    listBox.focus();
    screen.render();
    return;
  }

  if (value === "-chat") {
    messageBox.setContent(messageHandler.oldMessages || "" + messageHandler.messagesWhileBusy);
    inputBox.clearValue();
    inputBox.focus();
    screen.render();
    return;
  }

  const channel = client.channels.cache.get(current.chatId);
  if (channel) {
    channel.send(value)
      .then(() => {
        inputBox.clearValue();
        inputBox.focus();
        setImmediate(() => {
          screen.render();
        });
      })
      .catch(console.error);
  }
});


listBox.on('select', async (_, index) => {
  var channels = []
  try {
    current.guildId = current.guildHolder.find(guild => guild.index === index + 1).id
    var cguild = await client.guilds.fetch(current.guildId);
    channels = cguild.channels.cache.map(channel => channel.name)//.filter(channel => channel.type === "text")
    current.channelHolder = cguild.channels.cache.map(channel => ({name: channel.name,id:channel.id}))//.filter(channel => channel.type === "text"

  } catch (error) { } // something is happening here help

  listBox.clearItems();
  listBox.hide();
  listBox2.setItems(channels);
  listBox2.show();
  listBox2.focus();
  screen.render();

});

listBox2.on('select', (item) => {
  var channel = ""
  const channels = current.channelHolder
  const lastChatId = current.chatId
  try {
    channel = channels.find(chan => chan.name == item.getContent())
    current.chatId = channel.id 

  } catch (error) {}

  if (lastChatId === current.chatId){console.log("Kanal değiştirmediniz")}

  if (current.chatId) {
    listBox2.clearItems();
    listBox2.hide();
    inputBox.focus();
    screen.render();
  }
});

screen.key(['up', 'down', 'enter', 'escape'], (ch, key) => {
  const focused = screen.focused;

  switch (key.name) {
    case 'up':
      if (focused === listBox || focused === listBox2) {
        focused.up(); // Move up in the focused listbox
        screen.render();
      }
      break;
    case 'down':
      if (focused === listBox || focused === listBox2) {
        focused.down(); // Move down in the focused listbox
        screen.render();
      }
      break;
    case 'enter':
      if (focused === listBox || focused === listBox2) {
        focused.emit('select', focused.getItem(focused.selected));
        screen.render();
      }
      break;
    case 'escape':
      return process.exit(0)
  }
});

client.login(TOKEN);
screen.render();

