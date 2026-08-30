# LearnLand

LearnLand turns a topic into AI-generated exam notes and a narrated lecture
video. The Next.js application searches YouTube and Wikipedia, asks Gemini for
structured lecture content, renders slides with Canvas, narrates them with
the local Piper neural text-to-speech engine, and joins the clips with FFmpeg.

## Docker development setup

Docker is the supported development environment. It fixes the Node.js version
and supplies Canvas native libraries, Python, FFmpeg, and MongoDB so contributors
do not need to install those tools directly on Windows or macOS.

Prerequisites:

- Docker Desktop (or Docker Engine with Compose v2)
- Gemini and YouTube Data API keys
- Google Custom Search credentials only if your project already has API access

Create local configuration:

```powershell
Copy-Item .env.example .env
```

Fill in the API keys in `.env`. Generate a NextAuth secret, for example:

```powershell
openssl rand -base64 32
```

Narration runs locally and does not require a Google Cloud account or billing.
The Docker build installs Piper and downloads the `en_US-lessac-medium` voice
once into the image.

Build and start all services:

```powershell
docker compose up --build
```

Then open <http://localhost:3000>. Source files are bind-mounted, so Next.js
hot reload works without rebuilding the image. Dependencies and `.next` output
live in Docker volumes and do not mix Linux native packages with the host.
At startup, the container compares `package-lock.json` with the installed
dependency volume and runs `npm ci` only when the lockfile changed.

The Dockerfile also contains a verified production target:

```powershell
docker build --target production -t learnland:production .
```

Useful commands:

```powershell
# Show service state
docker compose ps

# Follow application logs
docker compose logs -f app

# Generate/update Prisma Client after changing schema.prisma
docker compose exec app npx prisma generate

# Stop services while preserving MongoDB data
docker compose down

# Stop and remove database/dependency/cache volumes
docker compose down --volumes
```

The final command deletes local container data and should only be used when a
clean reset is intended.

## Services

- `app`: Next.js 14 development server on port 3000. Its image uses Node 20 and
  includes Canvas build libraries, Python dependencies, Piper, its bundled
  English voice model, and FFmpeg.
- `mongo`: MongoDB 7 on port 27017 with a persistent named volume.
- `mongo-init`: One-shot helper that initializes the `rs0` replica set required
  by Prisma and waits until MongoDB has elected a writable primary.

Compose supplies the application with the internal database URL
`mongodb://mongo:27017/learnland?replicaSet=rs0`; it takes precedence over the
host-oriented value in `.env`.

## Non-Docker installation

Node 20 is recommended. `canvas@2.11.2` may require a native compiler and Cairo
libraries, and the media pipeline additionally requires Python, Piper, a Piper
voice model, and FFmpeg. On Windows this usually means Visual Studio Build Tools with the Desktop
development with C++ workload. Docker avoids that host-specific setup.

The repository enables npm's legacy peer-dependency resolver because the
currently dormant `react-chat-ui` and `react-chat-widget` packages declare peer
support for older React versions. Remove or replace those packages before
removing `.npmrc`.

```powershell
npm ci
npx prisma generate
pip install -r requirements.txt
python -m piper.download_voices --data-dir config/piper en_US-lessac-medium
$env:PIPER_DATA_DIR = "config/piper"
npm run dev
```
