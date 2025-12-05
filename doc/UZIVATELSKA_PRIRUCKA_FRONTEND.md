# Uživatelská příručka - Frontend

## 1. Úvod

### 1.1 O aplikaci
NNPRO-REMAX frontend je webová aplikace postavená na moderním frameworku React, která poskytuje uživatelské rozhraní pro realitní portál. Aplikace umožňuje prohlížení nemovitostí, správu uživatelských účtů, hodnocení makléřů a administraci systému.

### 1.2 Účel dokumentu
Tento dokument poskytuje kompletní návod pro:
- Instalaci a konfiguraci vývojového prostředí
- Spuštění aplikace v development a production módu
- Běžné úkony při vývoji a údržbě
- Řešení nejčastějších problémů

### 1.3 Předpoklady
Před instalací aplikace je potřeba mít nainstalováno:
- **Node.js** verze 16.x nebo vyšší
- **npm** verze 8.x nebo vyšší (instaluje se s Node.js)
- **Git** pro práci s verzovacím systémem
- Textový editor nebo IDE (doporučujeme VS Code, WebStorm)

## 2. Systémové požadavky

### 2.1 Hardware
**Minimální požadavky:**
- CPU: Dual-core 2 GHz
- RAM: 4 GB
- Disk: 2 GB volného místa

**Doporučené požadavky:**
- CPU: Quad-core 2.5 GHz nebo lepší
- RAM: 8 GB nebo více
- SSD disk: 5 GB volného místa

### 2.2 Software
**Operační systém:**
- Windows 10/11
- macOS 10.15 (Catalina) nebo novější
- Linux (Ubuntu 20.04+, Fedora 35+, nebo ekvivalent)

**Node.js:**
- Verze: 16.x, 18.x nebo 20.x LTS
- npm: 8.x nebo novější

**Prohlížeče (pro testování):**
- Google Chrome 90+
- Mozilla Firefox 88+
- Safari 14+ (pouze macOS)
- Microsoft Edge 90+

### 2.3 Síťové požadavky
- Internetové připojení pro stažení závislostí (npm install)
- Přístup k backend API (výchozí: http://localhost:8080)
- Doporučená rychlost: 10 Mbps+ pro plynulý development

## 3. Instalace

### 3.1 Instalace Node.js

#### Windows
1. Stáhněte instalátor z https://nodejs.org/
2. Spusťte instalátor a následujte pokyny
3. Restartujte terminál
4. Ověřte instalaci:
```bash
node --version
npm --version
```

#### macOS
Pomocí Homebrew:
```bash
brew install node@18
```

Nebo stáhněte instalátor z https://nodejs.org/

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3.2 Stažení projektu

#### Z Git repository
```bash
git clone <repository-url>
cd nnpro
```

#### Z ZIP archivu
1. Rozbalte archiv do požadované složky
2. Otevřete terminál v této složce

### 3.3 Instalace závislostí
```bash
npm install
```

Tento příkaz:
- Stáhne všechny potřebné Node.js balíčky
- Vytvoří složku `node_modules/`
- Může trvat 2-5 minut v závislosti na rychlosti připojení

**Možné problémy:**
- Pokud se objeví chyby, zkuste:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 4. Konfigurace

### 4.1 Environment proměnné

#### Development prostředí
Vytvořte soubor `.env.development` v root složce projektu:

```env
# API URL backendu
REACT_APP_API_URL=http://localhost:8080

# Prostředí
REACT_APP_ENV=development

# Debug mode (optional)
REACT_APP_DEBUG=true
```

#### Production prostředí
Vytvořte soubor `.env.production`:

```env
# API URL backendu v produkci
REACT_APP_API_URL=https://api.remax.cz

# Prostředí
REACT_APP_ENV=production

# Debug mode (vypnuto)
REACT_APP_DEBUG=false
```

**Důležité poznámky:**
- Všechny proměnné musí začínat prefixem `REACT_APP_`
- Proměnné se načítají při spuštění/buildu aplikace
- Po změně proměnných je nutné restartovat dev server

### 4.2 Konfigurace IDE

#### VS Code
Doporučená rozšíření (vytvořte `.vscode/extensions.json`):
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "styled-components.vscode-styled-components"
  ]
}
```

Nastavení (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### WebStorm
1. Zapněte ESLint: Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Zapněte Prettier: Settings → Languages & Frameworks → JavaScript → Prettier
3. Nastavte Auto Import: Settings → Editor → General → Auto Import

## 5. Spuštění aplikace

### 5.1 Development server
```bash
npm start
```

Tento příkaz:
- Spustí Webpack dev server na `http://localhost:3000`
- Automaticky otevře prohlížeč
- Zapne hot reload (změny se projeví okamžitě bez restartu)
- Zobrazuje TypeScript a ESLint chyby v konzoli

**Výstup v terminále:**
```
Compiled successfully!

You can now view nnpro in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled with 1 warning
```

**Zastavení serveru:**
- Windows/Linux: `Ctrl + C`
- macOS: `Cmd + C`

### 5.2 Production build
```bash
npm run build
```

Tento příkaz:
- Vytvoří optimalizovaný build v složce `build/`
- Minifikuje JavaScript a CSS
- Provede code splitting
- Vygeneruje source maps
- Trvá 1-3 minuty

**Výstup:**
```
Creating an optimized production build...
Compiled successfully.

File sizes after gzip:

  52.1 kB  build/static/js/main.a1b2c3d4.js
  2.5 kB   build/static/css/main.e5f6g7h8.css

The build folder is ready to be deployed.
```

### 5.3 Testování produkčního buildu lokálně
```bash
# Instalace jednoduchého HTTP serveru
npm install -g serve

# Spuštění
serve -s build -l 3000
```

Aplikace bude dostupná na `http://localhost:3000`

## 6. Testování

### 6.1 Spuštění testů

#### Interaktivní watch mode
```bash
npm test
```

Tento režim:
- Spustí testy a čeká na změny
- Po změně souboru automaticky znovu spustí relevantní testy
- Zobrazuje interaktivní menu pro filtrování testů

**Interaktivní příkazy:**
- `a` - spustit všechny testy
- `f` - spustit pouze failed testy
- `p` - filtrovat podle názvu souboru
- `t` - filtrovat podle názvu testu
- `q` - ukončit watch mode

#### Single run s coverage
```bash
npm run test:coverage
```

Tento příkaz:
- Spustí všechny testy jednou
- Vygeneruje coverage report
- Vytvoří HTML report v `coverage/lcov-report/index.html`
- Vypíše coverage summary do konzole

**Příklad výstupu:**
```
=============================== Coverage summary ===============================
Statements   : 82.5% ( 165/200 )
Branches     : 78.9% ( 56/71 )
Functions    : 85.2% ( 23/27 )
Lines        : 83.1% ( 162/195 )
================================================================================
```

#### CI mode
```bash
npm run test:ci
```

Pro použití v continuous integration:
- Spustí testy bez watch mode
- Vygeneruje coverage
- Failuje pokud coverage threshold není splněn (80%)
- Negeneruje interaktivní výstupy

### 6.2 Test konkrétního souboru
```bash
npm test -- Button.test.tsx
```

Nebo použijte pattern:
```bash
npm test -- --testPathPattern=components/ui
```

### 6.3 Debug testů

#### VS Code
Vytvořte `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug CRA Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/react-scripts",
      "args": ["test", "--runInBand", "--no-cache", "--watchAll=false"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

#### Chrome DevTools
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```
Otevřete `chrome://inspect` a připojte se k procesu.

### 6.4 Prohlížení coverage reportu
```bash
# Vygenerujte coverage
npm run test:coverage

# Otevřete HTML report (Windows)
start coverage/lcov-report/index.html

# Otevřete HTML report (macOS)
open coverage/lcov-report/index.html

# Otevřete HTML report (Linux)
xdg-open coverage/lcov-report/index.html
```

HTML report zobrazuje:
- Celkový coverage v procentech
- Coverage pro jednotlivé soubory
- Barevně označené řádky kódu (zelená = covered, červená = uncovered)
- Branch coverage

## 7. Běžné úkony

### 7.1 Přidání nové npm závislosti
```bash
# Produkční závislost
npm install <package-name>

# Development závislost
npm install --save-dev <package-name>

# Specifická verze
npm install <package-name>@1.2.3
```

**Příklady:**
```bash
npm install axios
npm install --save-dev @types/node
npm install react@18.2.0
```

### 7.2 Aktualizace závislostí
```bash
# Kontrola zastaralých balíčků
npm outdated

# Aktualizace všech na nejnovější minor/patch verze
npm update

# Aktualizace konkrétního balíčku na latest
npm install <package-name>@latest
```

### 7.3 Vyčištění cache a reinstalace
```bash
# Smazání node_modules a lock file
rm -rf node_modules package-lock.json

# Windows PowerShell
Remove-Item -Recurse -Force node_modules, package-lock.json

# Vyčištění npm cache
npm cache clean --force

# Reinstalace
npm install
```

### 7.4 Přidání shadcn/ui komponenty
```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
```

Komponenta se automaticky přidá do `src/components/ui/`

### 7.5 Kontrola TypeScript errors
```bash
# Type check bez buildu
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

### 7.6 Linting a formatting
```bash
# ESLint
npx eslint src/

# Prettier check
npx prettier --check "src/**/*.{ts,tsx,css}"

# Prettier fix
npx prettier --write "src/**/*.{ts,tsx,css}"
```

## 8. Development workflow

### 8.1 Typický pracovní postup

1. **Stažení aktuálního kódu**
```bash
git pull origin main
npm install  # Pokud se změnil package.json
```

2. **Vytvoření nové feature branch**
```bash
git checkout -b feature/nova-funkcionalita
```

3. **Spuštění dev serveru**
```bash
npm start
```

4. **Vývoj s hot reload**
- Editujte soubory v `src/`
- Změny se automaticky projeví v prohlížeči
- TypeScript errory se zobrazí v konzoli a prohlížeči

5. **Psaní testů**
```bash
# V druhém terminálu
npm test
```

6. **Commit změn**
```bash
git add .
git commit -m "feat: přidána nová funkcionalita"
```

7. **Push a vytvoření PR**
```bash
git push origin feature/nova-funkcionalita
# Vytvořte Pull Request na GitHubu/GitLabu
```

### 8.2 Debugging v prohlížeči

#### React Developer Tools
1. Nainstalujte rozšíření pro Chrome/Firefox
2. Otevřete DevTools (F12)
3. Záložka "Components" pro inspekci React stromu
4. Záložka "Profiler" pro performance analýzu

#### Redux DevTools (pokud používáte Redux)
1. Nainstalujte rozšíření
2. Otevřete DevTools
3. Záložka "Redux" pro state management debugging

#### Network tab
- Sledujte API calls
- Kontrolujte request/response data
- Debugujte timeout a network errors

### 8.3 Hot Module Replacement (HMR)
- Automaticky zapnuto v development mode
- Většina změn se projeví bez refresh stránky
- State zůstává zachován (pokud možno)

**Kdy je potřeba ruční refresh:**
- Změny v `public/` složce
- Změny v `.env` souborech
- Změny v `craco.config.js`
- Některé změny v `index.tsx`

## 9. Deployment

### 9.1 Statický hosting (Netlify, Vercel)

#### Netlify
1. **Lokální build**
```bash
npm run build
```

2. **Deploy přes Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=build
```

3. **Nebo připojte Git repository**
   - Vytvořte nový site na Netlify
   - Připojte GitHub/GitLab repository
   - Build command: `npm run build`
   - Publish directory: `build`

**netlify.toml konfigurace:**
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```

Nebo:
1. Importujte projekt na vercel.com
2. Framework preset: Create React App
3. Build command: `npm run build`
4. Output directory: `build`

### 9.2 Docker deployment

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }

  # API proxy (optional)
  location /api {
    proxy_pass http://backend:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # Cache static assets
  location /static {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

#### Build a spuštění
```bash
# Build image
docker build -t nnpro-frontend:latest .

# Spuštění
docker run -d -p 80:80 --name nnpro-frontend nnpro-frontend:latest

# S environment proměnnými
docker run -d -p 80:80 \
  -e REACT_APP_API_URL=https://api.remax.cz \
  --name nnpro-frontend \
  nnpro-frontend:latest
```

### 9.3 Docker Compose (Frontend + Backend)
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=http://backend:8080
    depends_on:
      - backend
    networks:
      - nnpro-network

  backend:
    image: nnpro-backend:latest
    ports:
      - "8080:8080"
    networks:
      - nnpro-network

networks:
  nnpro-network:
    driver: bridge
```

Spuštění:
```bash
docker-compose up -d
```

## 10. Troubleshooting

### 10.1 Instalační problémy

#### "npm ERR! ERESOLVE unable to resolve dependency tree"
```bash
# Řešení 1: Legacy peer deps
npm install --legacy-peer-deps

# Řešení 2: Force install
npm install --force

# Řešení 3: Vyčistit a zkusit znovu
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### "node-gyp" chyby na Windows
1. Nainstalujte Windows Build Tools:
```bash
npm install --global windows-build-tools
```

2. Nebo nainstalujte Visual Studio Build Tools manually:
   - Stáhněte z https://visualstudio.microsoft.com/downloads/
   - Vyberte "Desktop development with C++"

#### Pomalá instalace závislostí
```bash
# Změňte npm registry na rychlejší mirror
npm config set registry https://registry.npmmirror.com

# Nebo použijte yarn
npm install -g yarn
yarn install
```

### 10.2 Runtime chyby

#### "Cannot find module '@/...' "
```bash
# Restartujte dev server
# Ctrl+C pro zastavení
npm start
```

Pokud problém přetrvává:
```bash
# Zkontrolujte tsconfig.json
cat tsconfig.json | grep "paths"

# Zkontrolujte craco.config.js
cat craco.config.js | grep "alias"

# Vyčistěte cache
rm -rf node_modules/.cache
npm start
```

#### "Module not found: Can't resolve 'leaflet/dist/leaflet.css'"
```bash
npm install leaflet react-leaflet @types/leaflet
```

Zkontrolujte import v `src/index.css`:
```css
@import 'leaflet/dist/leaflet.css';
```

#### Leaflet marker ikony se nezobrazují
Přidejte do komponenty PropertyMap:
```typescript
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;
```

### 10.3 Build chyby

#### "JavaScript heap out of memory"
Zvyšte paměťový limit:
```bash
# Windows
set NODE_OPTIONS=--max-old-space-size=4096
npm run build

# Linux/macOS
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

Nebo upravte `package.json`:
```json
"scripts": {
  "build": "NODE_OPTIONS=--max-old-space-size=4096 craco build"
}
```

#### TypeScript compilation errors v CI
```bash
# Zkontrolujte všechny TypeScript chyby
npx tsc --noEmit

# Pokud používáte strict mode, dočasně vypněte:
# tsconfig.json
{
  "compilerOptions": {
    "strict": false
  }
}
```

### 10.4 Test chyby

#### "Cannot find module 'react-router-dom' from 'Component.test.tsx'"
Wrap komponentu v Router:
```typescript
import { BrowserRouter } from 'react-router-dom';

render(
  <BrowserRouter>
    <ComponentWithRouter />
  </BrowserRouter>
);
```

#### "ReferenceError: fetch is not defined"
V Jest 27- je potřeba polyfill:
```bash
npm install --save-dev whatwg-fetch
```

V `src/setupTests.ts`:
```typescript
import 'whatwg-fetch';
```

#### Coverage threshold not met
```bash
# Zkontrolujte aktuální coverage
npm run test:coverage

# Upravte threshold v craco.config.js pokud je příliš vysoký
coverageThreshold: {
  global: {
    branches: 60,  // Snížit z 80
    functions: 60,
    lines: 60,
    statements: 60,
  },
}
```

### 10.5 Performance problémy

#### Pomalý dev server
```bash
# Vyčistěte cache
rm -rf node_modules/.cache

# Vypněte source maps
# .env.development
GENERATE_SOURCEMAP=false

# Použijte fast refresh
FAST_REFRESH=true
```

#### Velký bundle size
```bash
# Analyzujte bundle
npm install --save-dev source-map-explorer
npm run build
npx source-map-explorer 'build/static/js/*.js'

# Implementujte code splitting
# Lazy load routes v App.tsx
const HomePage = React.lazy(() => import('./pages/HomePage'));
```

#### Hot reload nefunguje
```bash
# Zkontrolujte počet sledovaných souborů (Linux)
cat /proc/sys/fs/inotify/max_user_watches

# Zvyšte limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 10.6 API Connection problémy

#### "Network Error" při API calls
1. **Zkontrolujte backend běží**:
```bash
curl http://localhost:8080/api/health
```

2. **Zkontrolujte CORS nastavení** v backendu:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

3. **Zkontrolujte environment proměnné**:
```bash
# .env.development
REACT_APP_API_URL=http://localhost:8080
```

4. **Restartujte dev server** po změně .env

#### "Unauthorized" 401 errors
Zkontrolujte JWT token:
```typescript
// V browser DevTools console
console.log(localStorage.getItem('authToken'));

// Nebo v Application tab → Local Storage
```

### 10.7 Git problémy

#### Large files v repository
```bash
# Použijte .gitignore
echo "node_modules/" >> .gitignore
echo "build/" >> .gitignore
echo "coverage/" >> .gitignore
echo ".env.local" >> .gitignore
```

#### Merge conflicts v package-lock.json
```bash
# Smazat a regenerovat
rm package-lock.json
npm install
git add package-lock.json
git commit -m "chore: regenerate package-lock.json"
```