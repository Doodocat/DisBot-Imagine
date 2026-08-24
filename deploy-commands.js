require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('imagine')
    .setDescription('Generate an AI image from a text prompt')
    .addStringOption(option =>
      option
        .setName('prompt')
        .setDescription('Describe the image you want to create')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('size')
        .setDescription('Image dimensions')
        .setRequired(false)
        .addChoices(
          { name: 'Square', value: 'square' },
          { name: 'Wide', value: 'wide' },
          { name: 'Tall', value: 'tall' }
        )
    )
    .toJSON(),
].map(c => c);

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;

    console.log(`Registering ${commands.length} slash command(s)...`);

    if (guildId) {
      // Guild commands update instantly - great for development/testing.
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(`Registered commands to guild ${guildId} (instant).`);
    } else {
      // Global commands can take up to an hour to propagate to all servers.
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log('Registered global commands (may take up to 1 hour to appear).');
    }
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
})();
