# Steam Now-Playing Activity Component

This project is a **Next.js client component** that displays the current Steam activity of a user, along with their recent games and Steam profile. It is designed with a minimalist, typographic, and clean UI inspired by Apple design principles.

---

## Features

- Display **current Steam activity**: Shows the game currently being played if the user is in-game.
- **Recent games list**: Horizontally scrollable, showing the most recently played games with cover images.
- **Steam profile integration**: Shows the user's Steam avatar and profile link.
- **Discord link**: Optional "Join Discord" button for community connection.
- **Minimalist UI**: Clean borders, subtle shadows, and typographic focus.
- **Responsive design**: Works on mobile and desktop screens.
- **Auto-refresh**: Fetches Steam data every 30 seconds to stay up to date.


## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/steam-activity-component.git

cd steam-activity-component

npm install

STEAM_API_KEY=your_steam_api_key
STEAM_ID64=your_steam_64bit_id

npm run dev
```

## Usage
Activity Component

Import the component into your page:

```js
import Activity from "@/components/Activity";

export default function HomePage() {
  return (
    <div>
      <Activity />
    </div>
  );
}
```
The component automatically fetches data from your Steam profile via the now-playing API route and renders the current activity, recent games, and profile information.

## API Route

The component expects an API endpoint at `/api/steam/now-playing` which fetches:

- Player summary (including in-game status)
- Recently played games
- Steam profile data

Ensure your API route returns JSON in the following format:

```js
type Resp = {
  inGame: boolean;
  status?: { label: string; emoji: string };
  gameName: string | null;
  appId: string | number | null;
  headerImage: string | null;
  storeUrl: string | null;
  steamProfileUrl: string | null;
  avatar: string | null;
  fallback?: "recent" | "owned" | null;
  error?: string;
  recentGames?: RecentGame[];
};

type RecentGame = {
  name: string;
  appId: number;
  storeUrl: string;
  headerImage: string;
};
```

## Contact

[Join Discord](https://discord.com/invite/vHZVGRAm3P)