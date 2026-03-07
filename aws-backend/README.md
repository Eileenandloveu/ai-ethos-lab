# AWS Backend — AI Ethics Lab

Complete AWS Lambda + RDS PostgreSQL backend, replacing the Supabase edge functions with identical API behavior.

## Architecture

```
Client (n-ai.org)
  → API Gateway HTTP API (api.n-ai.org)
    → Lambda functions (Node.js 20)
      → RDS PostgreSQL
```

## Prerequisites

- AWS Account with console access
- `psql` CLI or pgAdmin for database setup
- Domain `api.n-ai.org` (optional, for custom domain)

---

## Step-by-Step Deployment

### 1. Create RDS PostgreSQL

1. **AWS Console → RDS → Create Database**
2. Engine: **PostgreSQL 16**
3. Template: Free Tier (or Production)
4. DB instance identifier: `ai-ethics-lab`
5. Master username: `admin` (or your choice)
6. Set a strong password
7. DB name: `ai_ethics_lab`
8. **Connectivity**: 
   - VPC: default
   - Public access: **Yes** (for initial setup; disable later)
   - Security group: allow port 5432 from your IP + Lambda security group
9. Click **Create database**, wait ~5 min
10. Note the **Endpoint** (e.g., `ai-ethics-lab.xxxx.us-east-1.rds.amazonaws.com`)

### 2. Initialize Database

```bash
# Create tables
psql -h <RDS_ENDPOINT> -U admin -d ai_ethics_lab -f schema.sql

# Seed data (6 cases, arguments, council state)
psql -h <RDS_ENDPOINT> -U admin -d ai_ethics_lab -f seed.sql
```

### 3. Create Lambda Layer (pg dependency)

```bash
cd aws-backend
npm init -y
npm install pg
mkdir -p layer/nodejs
cp -r node_modules layer/nodejs/
cd layer && zip -r ../pg-layer.zip nodejs && cd ..
```

**AWS Console → Lambda → Layers → Create Layer**
- Name: `pg-layer`
- Upload: `pg-layer.zip`
- Compatible runtimes: Node.js 20.x
- Click **Create**

### 4. Create Lambda Functions

For **each** of the 11 endpoints, create a Lambda:

| Lambda Name | Handler Source | API Route |
|---|---|---|
| `aios-current-case` | `lambdas/current-case/index.js` | `GET /current-case` |
| `aios-list-cases` | `lambdas/list-cases/index.js` | `GET /list-cases` |
| `aios-vote` | `lambdas/vote/index.js` | `POST /vote` |
| `aios-stats` | `lambdas/stats/index.js` | `GET /stats` |
| `aios-ai-council` | `lambdas/ai-council/index.js` | `GET /ai-council` |
| `aios-profile` | `lambdas/profile/index.js` | `GET /profile` |
| `aios-list-arguments` | `lambdas/list-arguments/index.js` | `GET /list-arguments` |
| `aios-vote-argument` | `lambdas/vote-argument/index.js` | `POST /vote-argument` |
| `aios-list-testimonies` | `lambdas/list-testimonies/index.js` | `GET /list-testimonies` |
| `aios-submit-testimony` | `lambdas/submit-testimony/index.js` | `POST /submit-testimony` |
| `aios-vote-testimony` | `lambdas/vote-testimony/index.js` | `POST /vote-testimony` |

#### Per-function steps:

1. **Lambda → Create function**
   - Name: e.g., `aios-current-case`
   - Runtime: **Node.js 20.x**
   - Architecture: x86_64
2. **Package the code** (each Lambda needs its handler + shared files):
   ```bash
   # Example for current-case
   mkdir -p dist/current-case/shared
   cp lambdas/current-case/index.js dist/current-case/index.js
   cp shared/db.js dist/current-case/shared/db.js
   cp shared/http.js dist/current-case/shared/http.js
   cd dist/current-case && zip -r ../../zips/current-case.zip . && cd ../..
   ```
   Repeat for all 11 functions.
3. **Upload**: In Lambda console → Code → Upload from → .zip file
4. **Handler**: Set to `index.handler`
5. **Layers**: Add the `pg-layer` layer
6. **Environment variables** (Configuration → Environment variables):
   ```
   DB_HOST     = <RDS endpoint>
   DB_PORT     = 5432
   DB_NAME     = ai_ethics_lab
   DB_USER     = admin
   DB_PASSWORD = <your password>
   ```
7. **General configuration**: Timeout = **10 seconds**, Memory = **256 MB**
8. If RDS is in a VPC, attach Lambda to the **same VPC/subnets** and ensure security groups allow traffic

#### Build script (all at once):

```bash
#!/bin/bash
LAMBDAS=(current-case list-cases vote stats ai-council profile list-arguments vote-argument list-testimonies submit-testimony vote-testimony)
rm -rf dist zips && mkdir -p zips

for name in "${LAMBDAS[@]}"; do
  mkdir -p "dist/$name/shared"
  cp "lambdas/$name/index.js" "dist/$name/index.js"
  cp shared/db.js "dist/$name/shared/db.js"
  cp shared/http.js "dist/$name/shared/http.js"
  (cd "dist/$name" && zip -r "../../zips/$name.zip" .)
done

echo "✅ All zips created in zips/"
```

### 5. Create API Gateway HTTP API

1. **API Gateway → Create API → HTTP API**
2. Name: `aios-api`
3. **Add routes** (one per endpoint):

   | Method | Path | Integration |
   |---|---|---|
   | GET | /current-case | aios-current-case |
   | GET | /list-cases | aios-list-cases |
   | POST | /vote | aios-vote |
   | GET | /stats | aios-stats |
   | GET | /ai-council | aios-ai-council |
   | GET | /profile | aios-profile |
   | GET | /list-arguments | aios-list-arguments |
   | POST | /vote-argument | aios-vote-argument |
   | GET | /list-testimonies | aios-list-testimonies |
   | POST | /submit-testimony | aios-submit-testimony |
   | POST | /vote-testimony | aios-vote-testimony |

4. **CORS configuration** (API Gateway → CORS):
   - Allow Origins: `https://www.n-ai.org`, `https://n-ai.org`
   - Allow Methods: `GET, POST, OPTIONS`
   - Allow Headers: `content-type`
5. Deploy to **$default** stage
6. Note the **Invoke URL** (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com`)

### 6. Custom Domain (optional)

1. **API Gateway → Custom domain names → Create**
2. Domain: `api.n-ai.org`
3. Create/select ACM certificate for `api.n-ai.org`
4. Map to your HTTP API + `$default` stage
5. Update DNS: CNAME `api.n-ai.org` → the API Gateway domain name

### 7. Switch Frontend

Update your frontend environment variable:

```
VITE_API_BASE_URL=https://api.n-ai.org
```

Then update `src/lib/api.ts` to use `VITE_API_BASE_URL` instead of the Supabase functions URL. Remove any Supabase-specific headers (`apikey`, `authorization`). All endpoint paths remain the same.

### 8. Verify

```bash
BASE="https://api.n-ai.org"

# Current case
curl "$BASE/current-case"

# List cases
curl "$BASE/list-cases"

# Vote
curl -X POST "$BASE/vote" \
  -H "Content-Type: application/json" \
  -d '{"visitor_id":"test123","case_id":"<uuid>","choice":"A"}'

# Profile
curl "$BASE/profile?visitor_id=test123"

# Stats
curl "$BASE/stats?case_id=<uuid>&mode=hybrid"

# Arguments
curl "$BASE/list-arguments?case_id=<uuid>&visitor_id=test123"
```

---

## File Structure

```
aws-backend/
├── README.md              ← This file
├── schema.sql             ← Database tables + indexes
├── seed.sql               ← 6 cases + arguments + council state
├── shared/
│   ├── db.js              ← pg Pool connection helper
│   └── http.js            ← CORS, JSON response, body/query parsing
└── lambdas/
    ├── current-case/index.js
    ├── list-cases/index.js
    ├── vote/index.js
    ├── stats/index.js
    ├── ai-council/index.js
    ├── profile/index.js
    ├── list-arguments/index.js
    ├── vote-argument/index.js
    ├── list-testimonies/index.js
    ├── submit-testimony/index.js
    └── vote-testimony/index.js
```

## Environment Variables (per Lambda)

| Variable | Example |
|---|---|
| `DB_HOST` | `ai-ethics-lab.xxxx.us-east-1.rds.amazonaws.com` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `ai_ethics_lab` |
| `DB_USER` | `admin` |
| `DB_PASSWORD` | `your-secure-password` |

---

## 🤖 Bot Runner (24/7 Background Activity)

A separate Node.js process that generates realistic votes, reactions, and testimonies around the clock.

**Full documentation:** See [`bots/README.md`](bots/README.md)

### Quick Start

```bash
# 1. Run migration
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f aws-backend/bots/bot-tables.sql

# 2. Enable bots
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c \
  "UPDATE bot_settings SET enabled = true, bots_count = 5, actions_per_minute = 10;"

# 3. Start with pm2
pm2 start aws-backend/bots/runner.js --name aios-bot-runner
pm2 save

# 4. Monitor
pm2 logs aios-bot-runner
```

### Bot-specific Environment Variables

| Variable | Required | Example |
|---|---|---|
| `BOT_AI_PROVIDER` | No | `openai` |
| `BOT_AI_API_KEY` | No | `sk-...` |
| `BOT_AI_MODEL` | No | `gpt-4o-mini` |
