# Bot Runner — AI Ethics Lab

24/7 background process that generates realistic activity (votes, reactions, testimonies) using bot personas.

## Architecture

```
runner.js (pm2 managed)
  → storage.js (direct Postgres via pg)
  → personas.js (20 unique bot identities)
  → prompts.js (LLM testimony generation + fallback pool)
```

Bots write directly to the same Postgres tables used by the main API. They use `bot_id` as their `visitor_id`, so all existing endpoints treat them as normal users.

## Prerequisites

- Node.js 20+
- `pg` npm package (same as main backend)
- Access to the RDS/Postgres database

## Setup on EC2

### 1. Pull latest code

```bash
cd /path/to/project
git pull origin main
```

### 2. Run database migration

```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f aws-backend/bots/bot-tables.sql
```

### 3. Install dependencies (if not already)

```bash
cd aws-backend
npm install pg  # if not already installed
```

### 4. Set environment variables

Add to your `.env` or export directly:

```bash
export DB_HOST=your-rds-endpoint.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=ai_ethics_lab
export DB_USER=admin
export DB_PASSWORD=your-password

# Optional: AI-generated testimonies (fallback pool used if not set)
export BOT_AI_PROVIDER=openai           # or full URL like https://api.openai.com/v1
export BOT_AI_API_KEY=sk-your-key-here
export BOT_AI_MODEL=gpt-4o-mini         # optional, defaults to gpt-4o-mini
```

### 5. Start with pm2

```bash
pm2 start aws-backend/bots/runner.js --name aios-bot-runner
pm2 save
```

### 6. Enable bots

Bots are **disabled by default**. Enable them via SQL:

```sql
UPDATE bot_settings SET enabled = true, bots_count = 5, actions_per_minute = 10, testimony_probability = 0.05;
```

## Admin Controls

All tuning is done via the `bot_settings` table (singleton row):

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | false | Master on/off switch |
| `bots_count` | int | 5 | How many personas are active (0-20) |
| `actions_per_minute` | int | 10 | Global rate limit |
| `testimony_probability` | float | 0.05 | Chance of testimony vs other actions |

```sql
-- Turn off bots
UPDATE bot_settings SET enabled = false;

-- Increase intensity
UPDATE bot_settings SET bots_count = 10, actions_per_minute = 20;

-- More testimonies
UPDATE bot_settings SET testimony_probability = 0.15;
```

## Monitoring

```bash
# View live logs
pm2 logs aios-bot-runner

# Check status
pm2 status

# Restart
pm2 restart aios-bot-runner

# Stop
pm2 stop aios-bot-runner
```

### Check activity in DB

```sql
-- Recent bot actions
SELECT bot_id, action_type, created_at FROM bot_actions ORDER BY created_at DESC LIMIT 20;

-- Actions per bot
SELECT bot_id, COUNT(*) FROM bot_actions GROUP BY bot_id ORDER BY count DESC;

-- Actions in last hour
SELECT action_type, COUNT(*) FROM bot_actions WHERE created_at > NOW() - INTERVAL '1 hour' GROUP BY action_type;
```

## Safety

- **Rate limited**: Per-bot cooldown of 30-120s, global cap via `actions_per_minute`
- **Content safe**: Fallback testimonies are pre-vetted; LLM prompt explicitly forbids hate/threats/slurs/personal data
- **Testimony limit**: Max 120 characters per testimony
- **No browser automation**: Pure DB writes, no Puppeteer/Playwright
- **Auditable**: Every action logged in `bot_actions` table with full payload
