# Uživatelská Příručka - Realitní Portál

Tento dokument slouží jako návod k použití pro všechny uživatele realitního portálu. Popisuje klíčové funkce dostupné pro jednotlivé role v systému.

## Obsah
1. [Pro Všechny Uživatele](#1-pro-všechny-uživatele)
2. [Neregistrovaný Uživatel](#2-neregistrovaný-uživatel)
3. [Role: Klient](#3-role-klient)
4. [Role: Makléř](#4-role-makléř)
5. [Role: Administrátor](#5-role-administrátor)

---

### 1. Pro Všechny Uživatele

#### Prohlížení Nemovitostí
Každý návštěvník portálu může volně procházet seznam dostupných nemovitostí na stránce **"Nemovitosti"**.
- **Filtrování a vyhledávání:** Lze použít filtry pro zúžení výběru podle typu, stavu, lokality nebo ceny.
- **Detail nemovitosti:** Kliknutím na kartu nemovitosti se zobrazí její detailní stránka s kompletními informacemi, fotogalerií a kontaktem na makléře.

---

### 2. Neregistrovaný Uživatel

Jako neregistrovaný uživatel máte kromě prohlížení přístup k následujícím funkcím:

#### Registrace Nového Účtu
1. Na kterékoliv stránce klikněte na tlačítko **"Registrovat"**.
2. Vyplňte požadované údaje: jméno, příjmení, e-mail a heslo.
3. Po úspěšném odeslání formuláře bude váš účet vytvořen s rolí **Klient** a budete automaticky přihlášeni.

#### Přihlášení
1. Klikněte na tlačítko **"Přihlásit se"**.
2. Zadejte svůj e-mail a heslo.
3. Po úspěšném přihlášení budete přesměrováni na hlavní stránku.

---

### 3. Role: Klient

Jako přihlášený Klient máte k dispozici všechny funkce neregistrovaného uživatele a navíc:

#### Správa Profilu
- V menu pod vaším jménem najdete odkaz na **"Můj profil"**.
- Zde si můžete **upravit své osobní údaje** (jméno, e-mail, telefon).
- V záložce **"Zabezpečení"** si můžete **změnit heslo**.
- V "Nebezpečné zóně" je možné trvale **smazat váš účet**.

#### Správa Recenzí
- Na stránce **"Recenze"** si můžete prohlížet hodnocení makléřů.
- Kliknutím na **"Přidat recenzi"** můžete ohodnotit makléře, se kterým jste spolupracovali.

#### Správa Schůzek
- Na stránce **"Schůzky"** si můžete prohlížet své naplánované schůzky v **kalendáři** nebo v **seznamu**.
- Statistiky zobrazují počet schůzek dnes, nadcházejících, tento měsíc a dokončených.
- **Vytvoření nové schůzky:**
  1. Klikněte na tlačítko **"Naplánovat schůzku"** (dostupné na stránce Schůzky nebo v profilu makléře)
  2. Vyplňte formulář:
     - **Nadpis schůzky** - např. "Prohlídka bytu v centru Prahy"
     - **Popis** - volitelné podrobnosti
     - **Typ schůzky** - Prohlídka nemovitosti, Konzultace, nebo Online schůzka
     - **Makléř** - vyberte makléře, se kterým chcete schůzku
     - **Nemovitost** - zobrazí se pouze u typu "Prohlídka nemovitosti"
     - **Datum a čas** - vyberte termín schůzky
     - **Místo konání** - adresa nebo odkaz na online meeting
     - **Poznámky** - jakékoliv další informace
  3. Klikněte na **"Rezervovat schůzku"**
- Schůzky můžete filtrovat podle kalendáře (vyberete konkrétní den) nebo zobrazit seznam všech nadcházejících schůzek.

---

### 4. Role: Makléř

Jako Makléř máte všechna oprávnění Klienta a navíc následující možnosti pro správu nemovitostí:

#### Správa Vlastních Nemovitostí
- Na stránce **"Nemovitosti"** vidíte všechny nemovitosti. U svých nemovitostí máte možnost je spravovat.
- **Přidání nemovitosti:** Pomocí tlačítka **"Přidat nemovitost"** otevřete formulář pro zadání nové nemovitosti.
- **Úprava nemovitosti:** Na detailu vaší nemovitosti klikněte na tlačítko **"Upravit"**.
- **Smazání nemovitosti:** Na detailu vaší nemovitosti klikněte na tlačítko **"Smazat"**.

#### Správa Schůzek
- Na stránce **"Schůzky"** vidíte nejen své schůzky, ale také žádosti od klientů, které můžete potvrzovat nebo zamítat (tato funkcionalita bude dostupná po připojení na backend).
- Můžete vytvářet nové schůzky stejně jako klienti - viz sekce "Správa Schůzek" v roli Klient.

#### Profil Makléře
- Každý makléř má svůj veřejný profil dostupný na `/agents/:id`.
- Klienti mohou na vašem profilu vidět vaše kontaktní údaje a kliknout na **"Naplánovat schůzku"** pro vytvoření žádosti o schůzku přímo s vámi.

---

### 5. Role: Administrátor

Jako Administrátor máte nejvyšší oprávnění. Můžete dělat vše, co Makléř, a navíc máte přístup ke správě uživatelů.

#### Admin Dashboard (Nástěnka)
- V menu je pro vás viditelná položka **"Admin Dashboard"**.
- Zde se nachází přehled všech uživatelů v systému.

#### Správa Uživatelů
- **Zobrazení uživatelů:** V nástěnce vidíte seznam všech uživatelů, rozdělený na agenty a klienty.
- **Úprava uživatele:** Kliknutím na tlačítko **"Upravit"** u daného uživatele můžete měnit jeho údaje, včetně role (Klient, Makléř, Admin).
- **Blokování uživatele:** Tlačítkem **"Zablokovat"** / **"Odblokovat"** můžete dočasně deaktivovat nebo znovu aktivovat účet uživatele. Zablokovaný uživatel se nemůže přihlásit.
- **Smazání uživatele:** Tlačítkem **"Smazat"** můžete trvale odstranit účet uživatele ze systému.
*Poznámka: Z bezpečnostních důvodů nelze smazat ani zablokovat jiného administrátora.*
