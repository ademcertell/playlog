import { NextResponse } from "next/server";

const API = "https://api.steampowered.com";

type Player = {
  steamid: string;
  personastate: number;
  gameid?: string;
  gameextrainfo?: string;
  profileurl: string;
  avatarfull: string;
};

type RecentGame = {
  name: string;
  appId: number;
  storeUrl: string;
  headerImage: string;
};

function mapStatus(code: number, inGame: boolean) {
  if (inGame) return { label: "In-Game", emoji: "🎮" };
  const map: Record<number, { label: string; emoji: string }> = {
    0: { label: "Offline", emoji: "⚫" },
    1: { label: "Online", emoji: "🟢" },
    2: { label: "Busy", emoji: "🔴" },
    3: { label: "Away", emoji: "🟠" },
    4: { label: "Snooze", emoji: "🟡" },
    5: { label: "Looking to Trade", emoji: "🟣" },
    6: { label: "Looking to Play", emoji: "🟢" },
  };
  return map[code] ?? { label: "Unknown", emoji: "⚪" };
}

export async function GET() {
  try {
    const key = process.env.STEAM_API_KEY!;
    const steamId = process.env.STEAM_ID64!;
    if (!key || !steamId) {
      return NextResponse.json({ error: "Missing env" }, { status: 500 });
    }
    const sumRes = await fetch(
      `${API}/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamId}`,
      { cache: "no-store" }
    );
    const player: Player | undefined = (await sumRes.json())?.response?.players?.[0];

    if (!player) {
      return NextResponse.json({ error: "player-not-found" }, { status: 404 });
    }

    const inGame = Boolean(player.gameid);
    const status = mapStatus(player.personastate ?? 0, inGame);
    const recentRes = await fetch(
      `${API}/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${key}&steamid=${steamId}&format=json`,
      { cache: "no-store" }
    );
    const recent = await recentRes.json();
type SteamGame = {
  appid: number;
  name: string;
  rtime_last_played?: number;
};

const recentGames: RecentGame[] = (recent?.response?.games ?? [] as SteamGame[])
  .slice()
  .sort((a: SteamGame, b: SteamGame) => (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0))
  .map((g: SteamGame) => ({
    name: g.name,
    appId: g.appid,
    storeUrl: `https://store.steampowered.com/app/${g.appid}`,
    headerImage: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${g.appid}/header.jpg`,
  }));

  let currentGameData = null;
    if (inGame && player.gameid) {
      currentGameData = {
        inGame: true,
        status,
        gameName: player.gameextrainfo ?? "Playing",
        appId: player.gameid,
        storeUrl: `https://store.steampowered.com/app/${player.gameid}`,
        headerImage: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${player.gameid}/header.jpg`,
        steamProfileUrl: player.profileurl,
        avatar: player.avatarfull,
        recentGames,
      };
      return NextResponse.json(currentGameData, {
        headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
      });
    }

    const mostRecent = recentGames[0] ?? null;

    return NextResponse.json(
      {
        inGame: false,
        status,
        gameName: mostRecent?.name ?? null,
        appId: mostRecent?.appId ?? null,
        storeUrl: mostRecent?.storeUrl ?? null,
        headerImage: mostRecent?.headerImage ?? null,
        steamProfileUrl: player.profileurl,
        avatar: player.avatarfull,
        recentGames,
      },
      {
        headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
      }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Steam API error" }, { status: 500 });
  }
}
