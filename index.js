require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Pollinations.ai is a free, no-API-key-required image generation service.
// It works by encoding the prompt straight into a URL that returns an image.
function buildPollinationsUrl(prompt, { width, height, seed }) {
  const encodedPrompt = encodeURIComponent(prompt);
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    seed: String(seed),
    nologo: 'true',
  });
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;
}

// Simple per-user cooldown so one person can't spam expensive image calls.
const COOLDOWN_MS = 20_000;
const lastUsed = new Map();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}. /imagine is ready.`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'imagine') return;

  const userId = interaction.user.id;
  const now = Date.now();
  const cooldownEnd = lastUsed.get(userId) || 0;

  if (now < cooldownEnd) {
    const secondsLeft = Math.ceil((cooldownEnd - now) / 1000);
    await interaction.reply({
      content: `Slow down a bit — you can generate another image in ${secondsLeft}s.`,
      ephemeral: true,
    });
    return;
  }

  const prompt = interaction.options.getString('prompt');
  const sizeChoice = interaction.options.getString('size') || 'square';

  const dimensions = {
    square: { width: 1024, height: 1024 },
    wide: { width: 1344, height: 768 },
    tall: { width: 768, height: 1344 },
  }[sizeChoice];

  lastUsed.set(userId, now + COOLDOWN_MS);

  // Image generation can take several seconds — defer so Discord doesn't time out.
  await interaction.deferReply();

  try {
    // Random seed so repeated identical prompts don't return a cached/identical image.
    const seed = Math.floor(Math.random() * 1_000_000);
    const imageUrl = buildPollinationsUrl(prompt, { ...dimensions, seed });

    // Pollinations generates the image lazily on request, so we fetch it once here
    // to (a) confirm it actually succeeded and (b) attach the bytes directly rather
    // than relying on Discord to fetch a slow-to-resolve URL.
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Image service returned ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const attachment = new AttachmentBuilder(buffer, { name: 'imagine.png' });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🖼️ Imagine')
      .setDescription(`**Prompt:** ${prompt}`)
      .setImage('attachment://imagine.png')
      .setFooter({ text: `Requested by ${interaction.user.username} • via Pollinations.ai (free)` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  } catch (error) {
    console.error('Image generation failed:', error);
    await interaction.editReply({
      content: 'Something went wrong generating that image. The free image service may be under heavy load — try again in a moment.',
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
