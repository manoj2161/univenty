# UNIVENTY mobile image assets

The app uses the existing local image assets in `assets/images`.

- `campus.png`: Home hero banner
- `collegeimg2.png`: Dashboard campus banner
- `fest.png`: Cultural event cards
- `tech.png`: Technical event cards
- `football.png`: Sports event cards
- `graduation-hat.png`: Academic event cards
- `graphic.png`: Workshop/design event cards
- `profile.jpg`: Profile avatar
- `loginimg.png`: Login illustration
- `univenty-logo.png`: Login and registration branding

Event cards use a backend-provided `image`, `coverImage`, or `poster` URL when present. Otherwise, they select a local image based on the event category.

Install dependencies and start Expo from this directory:

```bash
npm install
npx expo start -c
```

The app still requires the UNIVENTY backend to be running and the API URL in `.env` to be reachable from the phone.
