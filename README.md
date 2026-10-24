# VateLife

Membership platform rebuilt from the recorded VateLife site map. Page names, plan prices, and access rules come from that package. Copy that was not captured is left empty instead of being invented.

## Run locally

1. Copy `.env.example` to `.env` and set `NEXTAUTH_SECRET` and `DEMO_PASSWORD`.
2. Create the PostgreSQL database named in `DATABASE_URL`.
3. `npx prisma db push && npx prisma db seed`
4. `npm run dev`

The seed creates `demo@localhost` (Basic paid member) and `admin@localhost` (admin). The password is the local `DEMO_PASSWORD` and is stored only as a hash.

Locales are `en`, `el`, and `nl`. Open `/en`.
