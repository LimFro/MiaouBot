const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// --- CONFIGURATION POUR RENDER ---
const app = express();
app.get('/', (req, res) => {
  res.send('MiaouBot est en vie ! 🐾');
});
app.listen(3000, () => {
  console.log("Serveur de maintien en vie démarré sur le port 3000");
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// --- MÉMOIRE POUR LE SNIPE ---
let dernierMessageSupprime = null;

client.once('ready', () => {
  console.log('✅ MiaouBot est en ligne !');
});

// --- DÉTECTEUR DE SUPPRESSION (SNIPE) ---
client.on('messageDelete', message => {
  // On ignore les bots et les commandes commençant par "!"
  if (message.author?.bot || message.content?.startsWith('!')) return;

  dernierMessageSupprime = {
    content: message.content,
    author: message.author.tag
  };
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // 1. !ping
  if (message.content === '!ping') {
    return message.reply('🏓 Pong !');
  }

  // 2. !hasard100
  if (message.content === '!hasard100') {
    const chiffre = Math.floor(Math.random() * 101);
    return message.reply(`🎲 Tu as obtenu le chiffre **${chiffre}** !`);
  }

  // 3. !snipe
  if (message.content === '!snipe') {
    if (!dernierMessageSupprime) {
      return message.reply("Rien à voir ici... Personne n'a rien effacé ! 👻");
    }
    return message.reply(`🎯 **Dernier message supprimé :**\n> "${dernierMessageSupprime.content}"\n— par **${dernierMessageSupprime.author}**`);
  }

  // 4. !dis (Répéter)
  if (message.content.startsWith('!dis')) {
    const args = message.content.split(' ').slice(1);
    const texteARepeter = args.join(' ');
    if (!texteARepeter) return message.reply('Dis-moi quoi répéter !');

    try {
      await message.delete(); 
    } catch (error) { }
    
    return message.channel.send(texteARepeter);
  }

  // 5. !kick
  if (message.content.startsWith('!kick')) {
    if (!message.member.permissions.has('KickMembers')) return message.reply("🚫 Pas le droit !");
    const utilisateur = message.mentions.members.first();
    if (utilisateur) {
      utilisateur.kick().then(() => message.reply(`Bye bye ${utilisateur.user.tag} ! 👢`))
        .catch(() => message.reply("Je ne peux pas l'expulser."));
    }
  }

  // 6. !ban
  if (message.content.startsWith('!ban')) {
    if (!message.member.permissions.has('BanMembers')) return message.reply("🚫 Pas le droit !");
    const utilisateur = message.mentions.members.first();
    if (utilisateur) {
      utilisateur.ban().then(() => message.reply(`🔨 ${utilisateur.user.tag} a été banni !`))
        .catch(() => message.reply("Erreur de ban."));
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
