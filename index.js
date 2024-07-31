const { Client } = require('discord.js-selfbot-v13');
const client = new Client();
require("dotenv").config();
const blessed = require("blessed");

const screen = blessed.screen({
  smartCSR: true
});

screen.title = 'Lightcord';

// Create a box to display messages
const messageBox = blessed.box({
  top: '0',
  left: '0',
  width: '100%',
  height: '95%',
  content: 'Messages will appear here...',
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

// Create a textbox for user input
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

// Append the boxes to the screen
screen.append(messageBox);
screen.append(inputBox);

// Focus the input box on screen load
inputBox.focus();

const TOKEN = process.env.TOKEN;
const CHANNEL = process.env.CHANNEL;
const GUILD = process.env.GUILD;

class CurrentlyOn {
  constructor() {
    this.ChatId = CHANNEL;
    this.GuildId = GUILD;
  }
}

const current = new CurrentlyOn();


client.on('ready', async () => {
    console.log("Hazır")
})

// nickname : message.member.nickname

client.on("messageCreate", async (message) => {
  if (message.channel.id === current.ChatId) {
    const nick = message.member.nickname || message.member.displayName
    messageBox.setContent(messageBox.getContent() + `\n{bold}{yellow-fg}${nick}{/yellow-fg}{/bold}\n${message.content}`);
    setImmediate(() => { // değişti
      screen.render();
    });
  }
 
})

inputBox.on('submit', (value) => {
  const channel = client.channels.cache.get(current.ChatId);
  if (channel) {
    channel.send(value)
      .then(() => {
        inputBox.clearValue();
        inputBox.focus();
        setImmediate(() => { // değişti
          screen.render();
        });
      })
      .catch(console.error);
  }
});

screen.key(['escape'], (ch, key) => {
  return process.exit(0);
});

// Log in to Discord
client.login(TOKEN);

// Render the screen
screen.render();


