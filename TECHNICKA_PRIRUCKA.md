# Technická Příručka - Realitní Portál

Tento dokument poskytuje technickou dokumentaci realitního portálu vytvořeného pomocí React, TypeScript a moderního frontend stacku.

## Obsah
1. [Přehled Projektu](#1-přehled-projektu)
2. [Technologický Stack](#2-technologický-stack)
3. [Architektura Aplikace](#3-architektura-aplikace)
4. [Struktura Projektu](#4-struktura-projektu)
5. [Datové Modely](#5-datové-modely)
6. [Služby a API Integrace](#6-služby-a-api-integrace)
7. [Autentizace a Autorizace](#7-autentizace-a-autorizace)
8. [Komponenty](#8-komponenty)
9. [Routing](#9-routing)
10. [State Management](#10-state-management)
11. [Formuláře a Validace](#11-formuláře-a-validace)
12. [Styling](#12-styling)
13. [Vývojové Prostředí](#13-vývojové-prostředí)
14. [Build a Deployment](#14-build-a-deployment)
15. [Testování](#15-testování)
16. [Budoucí Rozšíření](#16-budoucí-rozšíření)

---

## 1. Přehled Projektu

### 1.1 Účel Aplikace
Realitní portál je webová aplikace určená pro správu a prohlížení nemovitostí. Umožňuje klientům procházet nabídku nemovitostí, plánovat schůzky s makléři a psát recenze. Makléři mohou spravovat své nemovitosti a schůzky, zatímco administrátoři mají přístup k celé správě systému.

### 1.2 Klíčové Funkce
- **Prohlížení nemovitostí** s pokročilým filtrováním
- **Správa uživatelských účtů** s role-based přístupem
- **Plánování schůzek** mezi klienty a makléři
- **Systém recenzí** pro hodnocení makléřů
- **Admin dashboard** pro správu uživatelů
- **Responsivní design** pro všechna zařízení

---

## 2. Technologický Stack

### 2.1 Core Framework
- **React 19.2.0** - Hlavní UI framework
- **TypeScript 4.9.5** - Typová bezpečnost
- **Create React App** - Build nástroj a konfigurace

### 2.2 Routing a State Management
- **React Router DOM 7.9.5** - Client-side routing
- **TanStack Query 5.90.6** - Server state management a data fetching
- **React Context API** - Autentizační stav

### 2.3 Formuláře a Validace
- **React Hook Form 7.66.0** - Správa formulářů
- **Zod 4.1.12** - Schema validace
- **@hookform/resolvers 5.2.2** - Integrace Zod s React Hook Form

### 2.4 UI Komponenty a Styling
- **shadcn/ui** - Komponentová knihovna
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI komponenty
- **Lucide React 0.552.0** - Ikony
- **class-variance-authority** - Varianty komponent

### 2.5 HTTP Client a Utilities
- **Axios 1.13.1** - HTTP klient
- **date-fns 4.1.0** - Manipulace s daty

### 2.6 Development Tools
- **@craco/craco 7.1.0** - Konfigurace CRA bez eject
- **Jest** - Unit testing framework
- **React Testing Library** - Testing utilities

---

## 3. Architektura Aplikace

### 3.1 Architektonický Vzor
Aplikace využívá **komponentovou architekturu** s následujícími vrstvami:

```
┌─────────────────────────────────────┐
│        Presentation Layer           │
│    (Pages & UI Components)          │
├─────────────────────────────────────┤
│        Business Logic Layer         │
│   (Hooks, Context, Services)        │
├─────────────────────────────────────┤
│        Data Access Layer            │
│   (API Services, TanStack Query)    │
├─────────────────────────────────────┤
│        External Services            │
│         (Backend API)               │
└─────────────────────────────────────┘
```

### 3.2 Data Flow
1. **Uživatelská akce** → Komponenta
2. Komponenta → **Custom Hook** nebo **Service**
3. Service → **API Call** (Axios)
4. API Response → **TanStack Query Cache**
5. Cache → **Komponenta** (re-render)

### 3.3 Autentizace Flow
```
Login → AuthContext → localStorage →
API Interceptor (Bearer Token) → Protected Routes
```

---

## 4. Struktura Projektu

```
src/
├── components/          # React komponenty
│   ├── ui/             # shadcn/ui komponenty
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── admin/          # Admin-specifické komponenty
│   ├── Layout.tsx      # Hlavní layout wrapper
│   └── ProtectedRoute.tsx  # Route guard komponenta
│
├── pages/              # Page-level komponenty
│   ├── HomePage.tsx
│   ├── PropertiesPage.tsx
│   ├── PropertyDetailPage.tsx
│   ├── PropertyFormPage.tsx
│   ├── AppointmentsPage.tsx
│   ├── AppointmentFormPage.tsx
│   ├── ReviewsPage.tsx
│   ├── ProfilePage.tsx
│   ├── AdminDashboard.tsx
│   └── ...
│
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Autentizační context
│
├── services/           # API služby
│   ├── api.ts         # Axios instance s interceptory
│   ├── authService.ts
│   ├── propertyService.ts
│   ├── reviewService.ts
│   └── appointmentService.ts
│
├── types/              # TypeScript definice
│   └── index.ts       # Všechny typy a interface
│
├── hooks/              # Custom React hooks
│   └── use-toast.ts
│
├── lib/                # Utility funkce
│   └── utils.ts       # cn() a další helpers
│
├── data/               # Mock data
│   └── mockData.ts
│
├── App.tsx             # Root komponenta s routingem
├── index.tsx           # Entry point
└── index.css           # Globální styles
```

---

## 5. Datové Modely

### 5.1 User Model
```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  CLIENT = 'CLIENT'
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isBlocked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 Property Model
Aplikace podporuje tři typy nemovitostí pomocí **discriminated union**:

```typescript
enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  LAND = 'LAND'
}

// Base interface
interface RealEstateBase {
  id: number;
  name: string;
  description: string;
  status: PropertyStatus;
  price: number;
  usableArea: number;
  contractType: TransactionType;
  address: Address;
  buildingProperties: BuildingProperties;
  utilities: Utilities;
  transportPossibilities: TransportPossibilities;
  civicAmenities: CivicAmenities;
  images: PropertyImage[];
  agentId: number;
  // ...
}

// Specific types
interface Apartment extends RealEstateBase {
  type: PropertyType.APARTMENT;
  floor: number;
  rooms: number;
  balcony: boolean;
  // ...
}

interface House extends RealEstateBase {
  type: PropertyType.HOUSE;
  plotArea: number;
  stories: number;
  // ...
}

interface Land extends RealEstateBase {
  type: PropertyType.LAND;
  isForHousing: boolean;
}

type Property = Apartment | House | Land;
```

### 5.3 Appointment Model
```typescript
enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

enum AppointmentType {
  PROPERTY_VIEWING = 'PROPERTY_VIEWING',
  CONSULTATION = 'CONSULTATION',
  ONLINE_MEETING = 'ONLINE_MEETING'
}

interface Appointment {
  id: number;
  title: string;
  type: AppointmentType;
  status: AppointmentStatus;
  startTime: Date;
  endTime: Date;
  propertyId?: number;
  agentId: number;
  clientId: number;
  location?: string;
  // ...
}
```

### 5.4 Review Model
```typescript
interface Review {
  id: number;
  rating: number; // 1-5
  comment: string;
  propertyId?: number;
  agentId?: number;
  authorId: number;
  createdAt: Date;
  // ...
}
```

### 5.5 Pomocné Modely

#### Address
```typescript
interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  region: AddressRegion;
  latitude?: number;
  longitude?: number;
}
```

#### Building Properties
```typescript
interface BuildingProperties {
  constructionMaterial: ConstructionMaterial;
  buildingCondition: BuildingCondition;
  energyEfficiencyClass: EnergyEfficiencyClass;
  buildingLocation: BuildingLocation;
  isInProtectionZone: boolean;
}
```

#### Utilities
```typescript
interface Utilities {
  hasWater: boolean;
  hasElectricity: boolean;
  hasGas: boolean;
  hasSewerage: boolean;
  hasHeating: boolean;
  internetConnection: InternetConnection;
  parkingPlaces: number;
  // ...
}
```

---

## 6. Služby a API Integrace

### 6.1 API Client (api.ts)
Centralizovaná Axios instance s automatickým přidáváním JWT tokenu:

```typescript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - přidá JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - obsluha 401 (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 6.2 Service Layer Pattern

Každá entita má vlastní service soubor:

**propertyService.ts**
```typescript
const propertyService = {
  getProperties: (page: number, pageSize: number) =>
    api.get<PaginatedResponse<Property>>('/properties', {
      params: { page, pageSize }
    }),

  getPropertyById: (id: number) =>
    api.get<Property>(`/properties/${id}`),

  createProperty: (data: CreatePropertyInput) =>
    api.post<Property>('/properties', data),

  updateProperty: (id: number, data: UpdatePropertyInput) =>
    api.put<Property>(`/properties/${id}`, data),

  deleteProperty: (id: number) =>
    api.delete(`/properties/${id}`),
};
```

### 6.3 Mock Data Strategy
Aplikace momentálně používá **mock data** pro vývoj frontend funkcí bez backend závislosti. V kódu jsou připraveny komentované bloky pro snadné přepnutí na real API:

```typescript
// Mock approach (současný stav)
const [properties, setProperties] = useState<Property[]>(mockProperties);

/*
// Backend integration (připraveno pro budoucnost)
useEffect(() => {
  const fetchProperties = async () => {
    const response = await propertyService.getProperties(page, PAGE_SIZE);
    setProperties(response.data.data);
  };
  fetchProperties();
}, [page]);
*/
```

---

## 7. Autentizace a Autorizace

### 7.1 AuthContext Provider
Aplikace používá **Context API** pro správu autentizačního stavu:

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (...) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  hasRole: (roles: UserRole[]) => boolean;
}
```

### 7.2 Protected Routes
Komponenta `ProtectedRoute` chrání routes podle rolí:

```typescript
<ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
  <AdminDashboard />
</ProtectedRoute>
```

Implementace:
```typescript
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" />; // Unauthorized
  }

  return <>{children}</>;
};
```

### 7.3 Token Storage
- **JWT token** uložen v `localStorage`
- **User data** uložena v `localStorage` (JSON)
- Automatické načtení při mount aplikace
- Automatické vymazání při logout nebo 401 error

### 7.4 Mock Autentizace
Pro vývoj je implementována mock autentizace:
- `admin@remax.cz` → ADMIN role
- `*@remax.cz` → AGENT role
- Ostatní → CLIENT role

---

## 8. Komponenty

### 8.1 UI Komponenty (shadcn/ui)
Aplikace používá **shadcn/ui** komponenty postavené na Radix UI:

- **Button** - Tlačítka s různými variantami
- **Card** - Karty pro obsah
- **Form** - Formulářové komponenty s integrací React Hook Form
- **Input/Textarea** - Vstupní pole
- **Select** - Dropdown výběr
- **Dialog** - Modální okna
- **Tabs** - Záložky
- **Calendar** - Kalendář pro výběr data
- **Toast** - Notifikace
- **Badge** - Štítky
- **Avatar** - Uživatelské avatary
- **Dropdown Menu** - Kontextová menu
- **Alert Dialog** - Potvrzovací dialogy

### 8.2 Layout Components

**Layout.tsx**
```typescript
// Hlavní layout s navigací a footer
<div className="min-h-screen flex flex-col">
  <Navbar />
  <main className="flex-1">
    <Outlet /> {/* React Router outlet */}
  </main>
  <Footer />
</div>
```

### 8.3 Feature Components

**PropertyCard** - Karta nemovitosti s obrázkem, cenou, lokací
**AppointmentCard** - Zobrazení schůzky s časem a statusem
**ReviewCard** - Zobrazení recenze s hvězdičkami
**UserEditDialog** - Dialog pro editaci uživatele (admin)

---

## 9. Routing

### 9.1 Route Struktura
```typescript
<Routes>
  {/* Public Routes - bez layoutu */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  {/* Protected Routes - s layoutem */}
  <Route element={<Layout />}>
    {/* Veřejné stránky */}
    <Route path="/" element={<HomePage />} />
    <Route path="/properties" element={<PropertiesPage />} />
    <Route path="/properties/:id" element={<PropertyDetailPage />} />

    {/* Authenticated only */}
    <Route path="/profile" element={
      <ProtectedRoute><ProfilePage /></ProtectedRoute>
    } />

    <Route path="/appointments" element={
      <ProtectedRoute><AppointmentsPage /></ProtectedRoute>
    } />

    {/* Agent & Client only */}
    <Route path="/appointments/new" element={
      <ProtectedRoute requiredRoles={[UserRole.AGENT, UserRole.CLIENT]}>
        <AppointmentFormPage />
      </ProtectedRoute>
    } />

    {/* Admin only */}
    <Route path="/admin" element={
      <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
        <AdminDashboard />
      </ProtectedRoute>
    } />
  </Route>
</Routes>
```

### 9.2 Navigation Pattern
- Programmatická navigace pomocí `useNavigate()` hook
- Deklarativní navigace pomocí `<Link>` komponenty
- Route parametry pomocí `useParams()` hook

---

## 10. State Management

### 10.1 Server State (TanStack Query)
Pro server data používáme **TanStack Query**:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minut
      retry: 1,
    },
  },
});

// Použití v komponentě
const { data, isLoading, error } = useQuery({
  queryKey: ['properties', page],
  queryFn: () => propertyService.getProperties(page, PAGE_SIZE),
});
```

### 10.2 Client State
- **useState** pro lokální component state
- **Context API** pro globální auth state
- **useMemo** pro expensive computations
- **useEffect** pro side effects

### 10.3 Form State
- **React Hook Form** pro správu formulářového stavu
- **Zod** pro validaci
- **useForm** hook s `zodResolver`

---

## 11. Formuláře a Validace

### 11.1 Validační Schema (Zod)
```typescript
const propertyFormSchema = z.object({
  title: z.string()
    .min(5, 'Nadpis musí mít alespoň 5 znaků')
    .max(100, 'Nadpis je příliš dlouhý'),
  price: z.number().min(1, 'Cena musí být větší než 0'),
  type: z.nativeEnum(PropertyType),
  // ...
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;
```

### 11.2 Form Implementation
```typescript
const form = useForm<PropertyFormValues>({
  resolver: zodResolver(propertyFormSchema),
  defaultValues: {
    title: '',
    price: 0,
    type: PropertyType.APARTMENT,
  },
});

const onSubmit = async (data: PropertyFormValues) => {
  // Handle form submission
};
```

### 11.3 Form Components Pattern
```typescript
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nadpis</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

---

## 12. Styling

### 12.1 Tailwind CSS
Aplikace používá **utility-first** přístup s Tailwind CSS:

```typescript
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  <h1 className="text-3xl font-bold text-gray-900">Title</h1>
</div>
```

### 12.2 CSS Variables
Témata definována pomocí CSS variables v `index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}
```

### 12.3 Dark Mode Support
Konfigurace pro dark mode (class-based):

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  // ...
}
```

### 12.4 Responsive Design
Mobile-first přístup s Tailwind breakpoints:
- `sm:` - ≥640px
- `md:` - ≥768px
- `lg:` - ≥1024px
- `xl:` - ≥1280px

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### 12.5 cn() Utility
Merge classNames s Tailwind merge:

```typescript
import { cn } from "@/lib/utils"

<Button className={cn("base-classes", conditional && "extra-class")} />
```

---

## 13. Vývojové Prostředí

### 13.1 Instalace Závislostí
```bash
npm install
```

### 13.2 Spuštění Dev Serveru
```bash
npm start
```
Aplikace běží na `http://localhost:3000` s hot reload.

### 13.3 Environment Variables
Vytvořte `.env` soubor v root adresáři:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

### 13.4 Path Aliases
Nakonfigurovány v `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Použití:
```typescript
import { Button } from "@/components/ui/button"
import { User } from "@/types"
```

### 13.5 CRACO Configuration
Aplikace používá CRACO pro customizaci CRA bez eject:

```bash
npm start  # používá craco start
npm build  # používá craco build
npm test   # používá craco test
```

---

## 14. Build a Deployment

### 14.1 Production Build
```bash
npm run build
```

Vytvoří optimalizovaný build v `build/` složce:
- Minifikovaný JavaScript
- Optimalizované CSS
- Optimalizované obrázky
- Source maps

### 14.2 Build Output
```
build/
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── index.html
└── asset-manifest.json
```

### 14.3 Deployment Checklist
- [ ] Nastavit `REACT_APP_API_URL` pro produkci
- [ ] Spustit `npm run build`
- [ ] Test production build lokálně: `npx serve -s build`
- [ ] Deploy `build/` složku na hosting
- [ ] Nakonfigurovat server pro SPA routing (fallback na index.html)

### 14.4 Doporučené Hosting Platformy
- **Vercel** - Zero-config deployment pro React
- **Netlify** - Auto-deploy z Git
- **GitHub Pages** - Zdarma pro open source
- **AWS S3 + CloudFront** - Scalable enterprise solution

---

## 15. Testování

### 15.1 Testing Stack
- **Jest** - Test runner
- **React Testing Library** - React component testing
- **@testing-library/user-event** - Simulace user interactions
- **@testing-library/jest-dom** - Custom matchers

### 15.2 Spuštění Testů
```bash
# Interactive watch mode
npm test

# Specifický test file
npm test -- PropertyCard.test.tsx

# Coverage report
npm test -- --coverage
```

### 15.3 Test File Structure
```
src/
├── components/
│   ├── PropertyCard.tsx
│   └── PropertyCard.test.tsx
└── pages/
    ├── HomePage.tsx
    └── HomePage.test.tsx
```

### 15.4 Příklad Testu
```typescript
import { render, screen } from '@testing-library/react';
import { PropertyCard } from './PropertyCard';

describe('PropertyCard', () => {
  it('renders property title', () => {
    const property = { /* mock property */ };
    render(<PropertyCard property={property} />);

    expect(screen.getByText(property.name)).toBeInTheDocument();
  });
});
```

### 15.5 Testing Best Practices
- Test user behavior, ne implementation details
- Používat `screen.getByRole` preferenčně
- Mock API calls
- Test accessibility (a11y)

---

## 16. Budoucí Rozšíření

### 16.1 Backend Integrace
Připraveno pro backend připojení:

**1. Odkomentovat API calls v services:**
```typescript
// Remove mock data
// const [properties] = useState(mockProperties);

// Uncomment this:
const { data, isLoading } = useQuery({
  queryKey: ['properties'],
  queryFn: () => propertyService.getProperties(),
});
```

**2. Nastavit ENV variable:**
```env
REACT_APP_API_URL=https://api.realitni-portal.cz
```

**3. Implementovat real autentizaci:**
```typescript
// V authService.ts
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};
```

### 16.2 Plánované Funkce

#### Real-time Notifikace
- WebSocket integrace pro live updates
- Push notifikace pro nové schůzky
- Real-time chat mezi klientem a makléřem

#### Pokročilé Vyhledávání
- Geolokační vyhledávání (okruh od bodu)
- Mapa s polygonálním výběrem oblasti
- Uložené filtry a vyhledávání
- Email notifikace pro nové nemovitosti dle filtrů

#### Finanční Kalkulačky
- Hypoteční kalkulačka
- Kalkulace zhodnocení investice
- Porovnání nákladů pronájem vs. koupě

#### Dokumenty a Smlouvy
- Upload a správa dokumentů k nemovitosti
- E-signing smluv
- PDF generování prohlídkových sestav

#### Analytics
- Admin analytics dashboard
- Statistiky prodejů a pronájmů
- Tracking engagement uživatelů
- Conversion funnel analytics

#### Internationalization (i18n)
- Multi-language podpora (CZ, EN, DE)
- Měnové konverze
- Lokalizované formáty data/času

#### PWA Features
- Offline mode
- Install as app
- Background sync
- Push notifications

### 16.3 Technologická Vylepšení

#### Performance Optimization
- Code splitting per route
- Image lazy loading
- Virtual scrolling pro dlouhé seznamy
- Service Worker caching

#### Security Enhancements
- JWT refresh token rotation
- CSRF protection
- Content Security Policy (CSP)
- Rate limiting
- XSS sanitization

#### Testing Coverage
- Zvýšení coverage na >80%
- E2E testing s Playwright/Cypress
- Visual regression testing
- Performance testing

#### DevOps
- CI/CD pipeline (GitHub Actions)
- Automated testing v PR
- Automated deployment
- Environment staging (dev, staging, prod)
- Docker containerization

---

## Závěr

Tento dokument poskytuje komplexní technický přehled realitního portálu. Pro další informace o použití aplikace z pohledu uživatele viz [Uživatelská Příručka](./UZIVATELSKA_PRIRUCKA.md).

### Kontakt pro Vývojáře
Pro technické dotazy a návrhy kontaktujte vývojový tým.

### Verzování
- **Verze:** 0.1.0
- **Datum poslední aktualizace:** 2025-11-22
- **Autor dokumentace:** Development Team

---

**© 2025 Realitní Portál - Technická Dokumentace**
