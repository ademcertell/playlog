"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import ActivitySkeleton from "./ActivitySkeleton";

// Minimalist ActivityStatus
type ActivityStatusProps = {
  label?: string;
  className?: string;
};

function ActivityStatus({ label, className }: ActivityStatusProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-900 ${
        className ?? ""
      }`}
    >
      {label}
    </span>
  );
}

type RecentGame = {
  name: string;
  appId: number;
  storeUrl: string;
  headerImage: string;
};

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

export default function Activity() {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/steam/now-playing", { cache: "no-store" });
      const j = (await r.json()) as Resp;
      setData(j);
    } catch {
      setData({
        inGame: false,
        gameName: null,
        appId: null,
        headerImage: null,
        storeUrl: null,
        steamProfileUrl: null,
        avatar: null,
        error: "fetch-failed",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    if (alive) void load();

    const id = setInterval(() => {
      if (alive) void load();
    }, 30_000);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [load]);

  if (loading) {
    return (
      <section className="mt-4">
        <ActivitySkeleton />
      </section>
    );
  }

  const subtitle = data?.gameName ?? "No current activity";

  return (
    <section className="mt-6">
      <div className="max-w-3xl mx-auto px-4">
        <div className="border border-gray-300 rounded-2xl p-6 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            {data?.headerImage && (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={data.headerImage}
                  alt={subtitle}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <ActivityStatus
                    label={data?.status?.label ?? "Unknown"}
                    className="bg-gray-100 text-gray-900"
                  />
                  <span className="text-xs text-gray-500">
                    {data?.inGame
                      ? "Now playing"
                      : data?.fallback
                      ? "Last played"
                      : "Activity"}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  {subtitle}
                </h3>

                {data?.error && (
                  <p className="mt-2 text-xs text-red-400">
                    Steam error — try again later.
                  </p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => window.open(data?.storeUrl ?? "#", "_blank")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium"
                >
                  <Play size={18} />
                  Open in Steam
                </motion.button>

                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href="https://discord.com/invite/vHZVGRAm3P"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"
                >
                  Join Discord
                </motion.a>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Profile</h4>
            <div className="flex items-center gap-3">
              {data?.avatar && (
                <img
                  src={data.avatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border border-gray-300"
                />
              )}
              <a
                href={data?.steamProfileUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="text-gray-900 font-medium hover:underline"
              >
                Steam Profile
              </a>
            </div>
          </div>
          {data?.recentGames && data.recentGames.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Recent Games
              </h4>
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory py-1">
                {data.recentGames.map((game) => (
                  <motion.a
                    key={game.appId}
                    whileHover={{ scale: 1.05 }}
                    href={game.storeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-28 h-28 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden relative snap-start border border-gray-200"
                  >
                    <img
                      src={game.headerImage}
                      alt={game.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-white/80 text-gray-900 text-xs text-center py-1 line-clamp-1">
                      {game.name}
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}