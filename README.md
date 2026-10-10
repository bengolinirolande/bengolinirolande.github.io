# Strona dewelopera: bengolinirolande.github.io

Statyczna strona produktu aplikacji „Angielski bez gramatyki 50 dni” (Szybciej Się Nie Da)
od Snoochie Soft. Bez frameworka i bez kroku budowania — GitHub Pages serwuje pliki tak, jak leżą.

Źródło trzymane jest w głównym repo projektu w `docs/site/`; do repo
`bengolinirolande/bengolinirolande.github.io` (gałąź `main`) kopiuje się zawartość tego folderu.

## Przełącznik premiery: `APP_LIVE`

Na górze `js/site.js`:

```js
const APP_LIVE = false;
```

- `false` (teraz): przyciski „Wkrótce w Google Play” są nieaktywne (`aria-disabled`), pod nimi
  notka „Premiera w Google Play już wkrótce. Zajrzyj tu za kilka dni.”
- `true`: oba przyciski (hero i zamknięcie strony) zamieniają się w link
  „Pobierz z Google Play” do `https://play.google.com/store/apps/details?id=pl.szybciejsienieda.app`.

Po publikacji w sklepie: zmień na `true`, skopiuj do repo strony, commit, push. HTML bez JS
pokazuje stan „wkrótce”, więc jeśli chcesz, żeby link działał także bez JavaScriptu, podmień
też dwa bloki `[data-cta]` w `index.html`.

## Pliki

- `index.html`, `404.html`, `css/site.css`, `js/site.js`
- `js/words.js` — 500 najczęstszych słów w kolejności z aplikacji (do mozaiki)
- `fonts/` — Manrope (zmienna waga, latin + latin-ext), hostowana lokalnie, bez Google Fonts; licencja `fonts/OFL.txt`
- `img/` — zrzuty ekranu aplikacji (WebP), ikona, `og.jpg` (grafika z listingu Play)
- `app-ads.txt` — **nie usuwać ani nie zmieniać**: jedna linia dla AdMob
- `robots.txt`, `sitemap.xml`, `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`

## Podgląd lokalny

```
py -m http.server 8000 --directory docs/site
```
