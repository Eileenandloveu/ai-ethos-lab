# AWS Deployment Checklist

## 1. RDS PostgreSQL Setup

1. Go to **AWS Console → RDS → Create Database**
2. Choose **PostgreSQL 16**, Free Tier or desired size
3. Set DB name: `ai_ethics_lab`, username: `admin`, set password
4. Under Connectivity: enable **Public access** (or use VPC + Lambda in same VPC)
5. Note the **Endpoint** (host), port (5432)
6. Connect via `psql` or pgAdmin and run:
   ```bash
   psql -h <RDS_ENDPOINT> -U admin -d ai_ethics_lab -f sql/schema.sql
   psql -h <RDS_ENDPOINT> -U admin -d ai_ethics_lab -f sql/seed.sql
   ```

## 2. Lambda Layer (pg dependency)

1. On your machine:
   ```bash
   cd aws-lambda
   npm install
   mkdir -p layer/nodejs
   cp -r node_modules layer/nodejs/
   cd layer && zip -r pg-layer.zip nodejs
   ```
2. **AWS Console → Lambda → Layers → Create Layer**
   - Name: `pg-layer`, upload `pg-layer.zip`, runtime: Node.js 20.x

## 3. Create Lambda Functions

For **each** handler file, repeat:

1. **Lambda → Create Function**
   - Name: e.g. `aios-current-case`
   - Runtime: Node.js 20.x
   - Architecture: x86_64
2. **Code tab**: paste the handler code. Set handler to `index.handler`
   - For the handler file, also include `shared/db.js` — easiest approach:
     - Create a deployment zip containing:
       ```
       index.js          ← the handler file (renamed)
       shared/db.js      ← the shared helper
       ```
     - Or use the Layer approach (see below)
3. **Layers**: attach `pg-layer`
4. **Configuration → Environment variables**:
   ```
   DB_HOST     = <RDS endpoint>
   DB_PORT     = 5432
   DB_NAME     = ai_ethics_lab
   DB_USER     = admin
   DB_PASSWORD = <your password>
   ```
5. **Configuration → General**: timeout = 10 seconds, memory = 256 MB
6. If RDS is in VPC, attach Lambda to same VPC/subnets/security group

### Packaging Option (recommended)

Create one zip per function:
```bash
# Example for current-case
mkdir -p dist/current-case/shared
cp handlers/current-case.js dist/current-case/index.js
cp shared/db.js dist/current-case/shared/db.js
cd dist/current-case && zip -r ../../zips/current-case.zip . && cd ../..
```

Repeat for all 11 handlers. Upload each zip to its Lambda.

### All function names:
| Handler file | Lambda name | Route |
|---|---|---|
| current-case.js | aios-current-case | GET /current-case |
| list-cases.js | aios-list-cases | GET /list-cases |
| vote.js | aios-vote | POST /vote |
| stats.js | aios-stats | GET /stats |
| ai-council.js | aios-ai-council | GET /ai-council |
| profile.js | aios-profile | GET /profile |
| list-arguments.js | aios-list-arguments | GET /list-arguments |
| vote-argument.js | aios-vote-argument | POST /vote-argument |
| list-testimonies.js | aios-list-testimonies | GET /list-testimonies |
| submit-testimony.js | aios-submit-testimony | POST /submit-testimony |
| vote-testimony.js | aios-vote-testimony | POST /vote-testimony |

## 4. API Gateway HTTP API

1. **API Gateway → Create API → HTTP API**
2. Name: `aios-api`
3. Add routes (one per endpoint):
   - `GET /current-case` → integrate with `aios-current-case`
   - `GET /list-cases` → integrate with `aios-list-cases`
   - `POST /vote` → integrate with `aios-vote`
   - `GET /stats` → integrate with `aios-stats`
   - `GET /ai-council` → integrate with `aios-ai-council`
   - `GET /profile` → integrate with `aios-profile`
   - `GET /list-arguments` → integrate with `aios-list-arguments`
   - `POST /vote-argument` → integrate with `aios-vote-argument`
   - `GET /list-testimonies` → integrate with `aios-list-testimonies`
   - `POST /submit-testimony` → integrate with `aios-submit-testimony`
   - `POST /vote-testimony` → integrate with `aios-vote-testimony`
4. For each route, also add `OPTIONS` method pointing to the same Lambda (CORS preflight)
5. Under **CORS** configuration:
   - Allow Origin: `https://www.n-ai.org`
   - Allow Methods: `GET, POST, OPTIONS`
   - Allow Headers: `content-type`
6. Deploy to `$default` stage

## 5. Frontend Migration

Update `src/lib/api.ts`:
- Change `BASE` from the Supabase functions URL to your API Gateway URL:
  ```typescript
  const BASE = "https://<api-id>.execute-api.<region>.amazonaws.com";
  ```
- Remove any Supabase-specific headers (apikey, authorization)
- All endpoint paths stay the same (`/current-case`, `/vote`, etc.)

## 6. Custom Domain (optional)

1. **API Gateway → Custom domain names**
2. Add `api.n-ai.org`, attach ACM certificate
3. Map to your HTTP API stage
4. Update DNS CNAME

## 7. Verify

```bash
# Test current-case
curl https://<api-url>/current-case

# Test vote
curl -X POST https://<api-url>/vote \
  -H "Content-Type: application/json" \
  -d '{"visitor_id":"test123","case_id":"<uuid>","choice":"A"}'

# Test profile
curl "https://<api-url>/profile?visitor_id=test123"
```
