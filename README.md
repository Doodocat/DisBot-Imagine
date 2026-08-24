# 🖼️ Imagine Bot

A Discord bot with a `/imagine` slash command that generates AI images from
a text prompt — Midjourney-style, but **100% free**. Powered by
[Pollinations.ai](https://pollinations.ai) — no API key, no signup, no cost.

```
/imagine prompt: a cozy cabin in the mountains at sunset with an orange cat in front of the cabin, watercolor style, Note: Do not make the cat squint
```

Add `size: wide | tall | square` to change the aspect ratio. The bot replies
with the generated image in a clean embed.

## Setup

```bash
npm install
cp .env.example .env    # then fill in the values below
npm run deploy-commands
npm start
```

**In `.env`**, set:

| Variable                | Where to get it                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| `DISCORD_TOKEN`         | Developer Portal → your app → **Bot** tab                                                                     |
| `CLIENT_ID`             | Developer Portal → your app → **General Information**                                                         |
| `GUILD_ID` _(optional)_ | A server ID, for instant command updates while testing. Leave blank to register globally (~1hr to propagate). |

Get both from https://discord.com/developers/applications. No image-API key needed.

**Invite the bot:** OAuth2 → URL Generator → check `bot` + `applications.commands`
scopes and `Send Messages` + `Embed Links` permissions → open the generated URL.

## Notes

- **Cooldown**: 20s per user by default (`COOLDOWN_MS` in `index.js`) — polite
  to the shared free service, adjust as you like.
- **Hosting**: needs to stay running to work — a VPS, Railway, Fly.io, Render,
  or similar. It goes offline if your own machine sleeps.
- **Reliability**: as a free unauthenticated service, Pollinations can be
  slower under load than a paid API. Swapping in DALL·E 3 or Stable Diffusion
  later only means changing the fetch logic in `index.js`.
- **Moderation**: Pollinations applies its own content filtering; the bot adds
  none of its own, so restrict `/imagine` to specific channels/roles if needed.

## Troubleshooting

**`Expected token to be set for this request, but none was present`**
Your `.env` isn't being read. Check that:

1. The file is named exactly `.env` (not `.env.txt` — Windows likes to hide
   the real extension; run `dir /a` in the folder to confirm).
2. It sits next to `index.js`, not in a subfolder.
3. Values have no quotes or spaces: `DISCORD_TOKEN=abc123`, not `DISCORD_TOKEN = "abc123"`.

Verify it's loading correctly:

```bash
node -e "require('dotenv').config(); console.log(!!process.env.DISCORD_TOKEN)"
```

Should print `true`.
