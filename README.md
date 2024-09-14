### How to run project locally:
npx ts-node src/server.ts

### How to install a package:
npm i <package-name> && <br>
npm install @types/<package-name> --save-dev

### To start postgresql db locally
brew services start postgresql@14 <br>
psql postgres (to open postgres interactive shell) <br>
help <br>
\l <br>
\q <br>
brew services stop postgresql@14 <br>

### Prisma Commands
npx prisma migrate dev -> Creates new Migration file if any changes made in schema + Run Migrations
