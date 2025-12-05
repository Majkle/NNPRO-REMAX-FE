# Technická dokumentace - Frontend

## 1. Úvod

### 1.1 Účel dokumentu
Tento dokument poskytuje komplexní technickou dokumentaci pro frontendovou část aplikace NNPRO-REMAX, která slouží jako realitní portál pro správu a prezentaci nemovitostí. Dokument je určen pro vývojáře a technické pracovníky, kteří budují, nasazují nebo udržují frontend aplikace.

### 1.2 Rozsah projektu
Frontend aplikace NNPRO-REMAX je moderní single-page application (SPA) postavená na frameworku React s TypeScript. Aplikace poskytuje uživatelské rozhraní pro:
- Prohlížení a vyhledávání nemovitostí
- Detail nemovitostí s interaktivními mapami
- Správu uživatelů a agentů (admin interface)
- Hodnocení makléřů
- Autentizaci a autorizaci uživatelů

### 1.3 Cílové skupiny
- **Běžní uživatelé**: Hledají nemovitosti k prodeji nebo pronájmu
- **Agenti**: Spravují své nemovitosti a komunikují s klienty
- **Administrátoři**: Spravují uživatele, agenty a celý systém

## 2. Technologický stack

### 2.1 Hlavní technologie
- **React 19.2.0**: Moderní JavaScript knihovna pro budování uživatelských rozhraní
- **TypeScript 4.9.5**: Typovaný nadstavba JavaScriptu pro větší bezpečnost kódu
- **React Router DOM 7.9.5**: Knihovna pro client-side routing
- **Create React App 5.0.1**: Build nástroj a vývojové prostředí
- **CRACO 7.1.0**: Configuration override pro Create React App

### 2.2 UI knihovny a styling
- **Tailwind CSS 3.x**: Utility-first CSS framework
- **shadcn/ui**: Komponenty knihovna postavená na Radix UI
- **Radix UI**: Primitives pro přístupné komponenty
- **Lucide React 0.552.0**: Moderní ikonová knihovna
- **class-variance-authority 0.7.1**: Správa variant komponent
- **clsx 2.1.1** a **tailwind-merge 3.3.1**: Utility pro práci s CSS třídami

### 2.3 Správa stavu a data fetching
- **TanStack Query 5.90.6**: Správa server state a cache
- **React Hook Form 7.66.0**: Správa formulářů
- **Zod 4.1.12**: Validace schémat a TypeScript inference
- **Axios 1.13.1**: HTTP klient pro komunikaci s backendem

### 2.4 Mapové komponenty
- **Leaflet 1.9.4**: Open-source JavaScript knihovna pro interaktivní mapy
- **React Leaflet 5.0.0**: React wrapper pro Leaflet

### 2.5 Utility knihovny
- **date-fns 4.1.0**: Manipulace s datumy a časy
- **@hookform/resolvers 5.2.2**: Resolvery pro React Hook Form

### 2.6 Vývojářské nástroje
- **Jest 27.x**: Testovací framework
- **React Testing Library 16.3.0**: Testování React komponent
- **@testing-library/jest-dom 6.9.1**: Custom matchers pro Jest
- **@testing-library/user-event 13.5.0**: Simulace uživatelských interakcí

## 3. Architektura aplikace

### 3.1 Adresářová struktura
```
src/
├── components/          # React komponenty
│   ├── ui/             # Základní UI komponenty (shadcn/ui)
│   ├── PropertyCard.tsx
│   ├── PropertyMap.tsx
│   ├── PriceDisplay.tsx
│   └── ...
├── pages/              # Stránkové komponenty (routing)
│   ├── HomePage.tsx
│   ├── PropertiesPage.tsx
│   ├── PropertyDetailPage.tsx
│   ├── AdminDashboard.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   └── useAuth.tsx
├── services/           # API volání
│   └── api.ts
├── types/              # TypeScript definice typů
│   └── index.ts
├── utils/              # Utility funkce
│   └── mockData.ts
├── lib/                # Knihovní konfigurace
│   └── utils.ts
├── App.tsx             # Root komponenta s routingem
├── index.tsx           # Entry point
└── index.css           # Globální styly a Tailwind
```

### 3.2 Path aliasy
Projekt používá TypeScript path aliasy konfigurované v `tsconfig.json` a `craco.config.js`:
```typescript
// Místo relativních cest
import { cn } from "../../lib/utils"

// Používáme aliasy
import { cn } from "@/lib/utils"
```

### 3.3 Routing
Aplikace používá **React Router DOM v7** s následující strukturou routes:

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/nemovitosti" element={<PropertiesPage />} />
    <Route path="/nemovitosti/:id" element={<PropertyDetailPage />} />
    <Route path="/prihlaseni" element={<LoginPage />} />
    <Route path="/registrace" element={<RegistrationPage />} />

    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/recenze" element={<ReviewFormPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

#### Protected Routes
Chráněné routy používají komponentu `ProtectedRoute`, která kontroluje autentizaci:
```typescript
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = []
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/prihlaseni" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user!.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
```

### 3.4 Autentizace
Aplikace používá hook `useAuth` pro správu autentizace:

```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    // API call nebo mock autentizace
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Mock autentizace** pro vývoj:
- Email končící na `@remax.cz` → AGENT role
- Email končící na `@admin.cz` → ADMIN role
- Ostatní emaily → CLIENT role

### 3.5 Data fetching strategie

#### Hybridní přístup (Mock + Backend)
Aplikace používá hybridní strategii pro načítání dat:

1. **Primárně**: Pokus o načtení z backendu
2. **Fallback**: Pokud backend není dostupný, použije mock data

```typescript
// services/api.ts
export const getProperties = async (): Promise<Property[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/properties`);
    return response.data;
  } catch (error) {
    console.warn('Backend unavailable, using mock data');
    return mockProperties;
  }
};
```

#### TanStack Query integrace
Pro cache a synchronizaci server state:

```typescript
const { data: properties, isLoading, error } = useQuery({
  queryKey: ['properties'],
  queryFn: getProperties,
  staleTime: 5 * 60 * 1000, // 5 minut
  cacheTime: 10 * 60 * 1000, // 10 minut
});
```

### 3.6 Správa formulářů
Aplikace používá **React Hook Form** s **Zod** validací:

```typescript
// Definice validačního schématu
const reviewSchema = z.object({
  agentId: z.number().min(1, "Vyberte makléře"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Komentář musí mít alespoň 10 znaků")
});

type ReviewFormData = z.infer<typeof reviewSchema>;

// Použití ve komponentě
const form = useForm<ReviewFormData>({
  resolver: zodResolver(reviewSchema),
  defaultValues: {
    rating: 0,
    comment: ""
  }
});

const onSubmit = (data: ReviewFormData) => {
  // Handle form submission
};
```

### 3.7 Styling systém

#### Tailwind CSS konfigurace
Aplikace používá custom Tailwind konfiguraci s CSS proměnnými:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... další barvy
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  }
};
```

#### CSS proměnné (src/index.css)
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    /* ... další proměnné */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode proměnné */
  }
}
```

#### Utility funkce cn()
Pro kombinaci Tailwind tříd a podmíněné stylování:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 3.8 Responsive design
Aplikace používá **mobile-first** přístup s Tailwind breakpointy:

```typescript
// Mobile-first grid layout
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

// Breakpoints:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

## 4. Klíčové komponenty

### 4.1 PropertyMap
Interaktivní mapa zobrazující lokaci nemovitosti pomocí Leaflet.

**Props:**
```typescript
interface PropertyMapProps {
  latitude: number;
  longitude: number;
  propertyName: string;
  address: string;
}
```

**Použití:**
```typescript
<PropertyMap
  latitude={50.0755}
  longitude={14.4378}
  propertyName="Luxusní byt Praha 1"
  address="Václavské náměstí 1, Praha"
/>
```

**Implementace:**
- Používá OpenStreetMap tiles
- Custom marker ikona z Leaflet
- Popup s názvem a adresou nemovitosti
- Výška: 400px, zaoblené rohy, border

### 4.2 PriceDisplay
Komponenta pro zobrazení ceny s podporou předchozí ceny a procentuální změny.

**Props:**
```typescript
interface PriceDisplayProps {
  price: number;
  previousPrice?: number;
  transactionType: TransactionType;
}
```

**Funkce:**
- Formátování čísla s mezerami (5 000 000 Kč)
- Zobrazení procentuální změny ceny
- Barevné odlišení slevy (zelená) vs. navýšení (červená)
- Přeškrtnutá předchozí cena při slevě

### 4.3 Button (shadcn/ui)
Základní button komponenta s variantami a velikostmi.

**Varianty:**
- `default`: Primární modrý button
- `destructive`: Červený button pro destruktivní akce
- `outline`: Button s borderem
- `ghost`: Průhledný button
- `link`: Button stylovaný jako link

**Velikosti:**
- `default`: h-10 px-4 py-2
- `sm`: h-9 px-3
- `lg`: h-11 px-8
- `icon`: h-10 w-10

**Použití:**
```typescript
<Button variant="default" size="lg">
  Odeslat
</Button>

<Button variant="outline" size="sm" disabled>
  Zakázáno
</Button>

<Button asChild>
  <a href="/link">Link Button</a>
</Button>
```

### 4.4 PropertyCard
Karta pro zobrazení nemovitosti v seznamu.

**Funkce:**
- Responzivní layout (mobile: 1 sloupec, tablet: 2, desktop: 3)
- Obrázek nemovitosti s lazy loading
- PriceDisplay integrace
- Badge pro typ transakce (prodej/pronájem)
- Základní parametry (plocha, počet pokojů)
- Link na detail nemovitosti

## 5. API Integrace

### 5.1 Axios konfigurace
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor pro JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor pro error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/prihlaseni';
    }
    return Promise.reject(error);
  }
);
```

### 5.2 API endpointy

#### Nemovitosti
- `GET /api/properties` - Seznam všech nemovitostí
- `GET /api/properties/:id` - Detail nemovitosti
- `POST /api/properties` - Vytvoření nové nemovitosti (AGENT)
- `PUT /api/properties/:id` - Aktualizace nemovitosti (AGENT)
- `DELETE /api/properties/:id` - Smazání nemovitosti (AGENT)

#### Uživatelé
- `POST /api/auth/login` - Přihlášení
- `POST /api/auth/register` - Registrace
- `GET /api/users` - Seznam uživatelů (ADMIN)
- `PUT /api/users/:id` - Aktualizace uživatele (ADMIN)

#### Recenze
- `GET /api/reviews` - Seznam recenzí
- `POST /api/reviews` - Vytvoření recenze (CLIENT)
- `GET /api/reviews/agent/:agentId` - Recenze pro agenta

## 6. Testování

### 6.1 Testovací stack
- **Jest 27.x**: Test runner a assertion knihovna
- **React Testing Library 16.x**: Testování React komponent
- **@testing-library/user-event**: Simulace user interakcí
- **@testing-library/jest-dom**: Custom DOM matchers

### 6.2 Konfigurace testů
Testy jsou konfigurovány přes CRACO v `craco.config.js`:

```javascript
jest: {
  configure: {
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverageFrom: [
      'src/**/*.{js,jsx,ts,tsx}',
      '!src/**/*.d.ts',
      '!src/index.tsx',
      '!src/reportWebVitals.ts',
      '!src/setupTests.ts',
      '!src/**/*.test.{ts,tsx}',
      '!src/services/**',
      '!src/types/**',
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    coverageReporters: ['text', 'lcov', 'html'],
  },
}
```

### 6.3 Spuštění testů
```bash
# Interaktivní watch mode
npm test

# Single run s coverage
npm run test:coverage

# CI mode
npm run test:ci
```

### 6.4 Příklad testu
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button Component', () => {
  it('vykreslí tlačítko s textem', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i }))
      .toBeInTheDocument();
  });

  it('zpracuje události kliknutí', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 6.5 Mockování závislostí
Pro testování komponent s externími závislostmi:

```typescript
// Mock react-leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: any) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: any) => (
    <div data-testid="popup">{children}</div>
  ),
}));
```

### 6.6 Coverage cíle
Projekt má nastavený **80% coverage threshold** pro:
- Branches (větvení)
- Functions (funkce)
- Lines (řádky)
- Statements (příkazy)

Coverage reporty jsou generovány do složky `coverage/` ve formátech:
- Text (konzolový výstup)
- LCOV (pro CI/CD integrace)
- HTML (pro prohlížení v browseru)

## 7. Build a deployment

### 7.1 Development build
```bash
npm start
```
- Běží na `http://localhost:3000`
- Hot reload enabled
- Source maps pro debugging
- Development optimalizace

### 7.2 Production build
```bash
npm run build
```
Výstup:
- Optimalizovaný bundle v `build/` složce
- Minifikovaný JavaScript a CSS
- Code splitting
- Asset hashing pro cache busting
- Service worker pro PWA (optional)

### 7.3 Build analýza
Pro analýzu velikosti bundlu:
```bash
npm install --save-dev source-map-explorer
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

### 7.4 Environment proměnné
Konfigurace přes `.env` soubory:

```bash
# .env.development
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development

# .env.production
REACT_APP_API_URL=https://api.remax.cz
REACT_APP_ENV=production
```

**Použití v kódu:**
```typescript
const API_URL = process.env.REACT_APP_API_URL;
```

### 7.5 Deployment možnosti

#### Static hosting (Netlify, Vercel)
```bash
npm run build
# Upload build/ folder
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Docker deployment
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://backend:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## 8. Optimalizace a best practices

### 8.1 Performance optimalizace
- **Code splitting**: Lazy loading routes s React.lazy()
- **Image optimization**: Lazy loading obrázků, responsive images
- **Memoization**: useMemo, useCallback pro nákladné výpočty
- **Bundle size**: Analýza a redukce velikosti bundlu
- **TanStack Query**: Cache strategii pro minimalizaci API calls

### 8.2 Accessibility (A11y)
- Sémantické HTML elementy
- ARIA labels pro screen readers
- Keyboard navigation support
- Focus management
- Kontrast barev podle WCAG 2.1

### 8.3 Security best practices
- XSS prevence: React auto-escaping, dangerouslySetInnerHTML avoid
- CSRF protection: Token validace
- JWT storage: HttpOnly cookies preferovány před localStorage
- Input validace: Zod schemas
- HTTPS only v produkci

### 8.4 Code quality
- **ESLint**: Linting pravidla
- **Prettier**: Code formatting
- **TypeScript strict mode**: Type safety
- **Husky**: Pre-commit hooks
- **Conventional commits**: Commit message format

## 9. Troubleshooting

### 9.1 Časté problémy

#### "Module not found" error
```bash
# Vyčistit node_modules a cache
rm -rf node_modules package-lock.json
npm install
```

#### Leaflet marker ikony se nezobrazují
```typescript
// Přidat do PropertyMap.tsx
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;
```

#### TypeScript path alias nefungují
```json
// Zkontrolovat tsconfig.json a craco.config.js
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### Tests failují s Router errors
```typescript
// Wrap komponentu v BrowserRouter při testování
import { BrowserRouter } from 'react-router-dom';

render(
  <BrowserRouter>
    <ComponentWithRouter />
  </BrowserRouter>
);
```

### 9.2 Debugging
- **React Developer Tools**: Chrome/Firefox extension
- **Redux DevTools**: Pro state management debugging (pokud použit)
- **Network tab**: Pro API call monitoring
- **Console logs**: Strukturované s úrovněmi (info, warn, error)

## 10. Budoucí vylepšení
- [ ] Implementace dark mode toggle
- [ ] PWA features (offline support, instalace)
- [ ] Internationalization (i18n) pro více jazyků
- [ ] Real-time updates přes WebSockets
- [ ] Advanced filtering a fulltext search
- [ ] Unit testy pro zbývající komponenty (cíl 80%+ coverage)
- [ ] E2E testy pomocí Cypress nebo Playwright
- [ ] Performance monitoring (Web Vitals tracking)
- [ ] Storybook pro component documentation

## 11. Kontakty a podpora
Pro technické dotazy nebo problémy kontaktujte vývojový tým projektu NNPRO-REMAX.

---

**Verze dokumentu**: 1.0
**Datum poslední aktualizace**: 2025-12-05
**Autor**: Development Team
