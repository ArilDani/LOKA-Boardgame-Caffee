import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export const DEFAULT_SECTION_SETTINGS = {
  membership: true,
  instagram: true,
  blog: true,
};

export function getCachedSectionSettings() {
  try {
    const cached = localStorage.getItem("loka_section_settings");
    if (cached) return { ...DEFAULT_SECTION_SETTINGS, ...JSON.parse(cached) };
  } catch (_) {}
  return DEFAULT_SECTION_SETTINGS;
}

export function useSectionSettings() {
  const [settings, setSettings] = useState(() => getCachedSectionSettings());

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from("settings")
          .select("key, value")
          .in("key", [
            "section_membership_active",
            "section_instagram_active",
            "section_blog_active",
          ]);

        if (data && isMounted) {
          const next = { ...DEFAULT_SECTION_SETTINGS };
          data.forEach((s) => {
            if (s.key === "section_membership_active") next.membership = s.value !== "0";
            if (s.key === "section_instagram_active") next.instagram = s.value !== "0";
            if (s.key === "section_blog_active") next.blog = s.value !== "0";
          });
          setSettings(next);
          try {
            localStorage.setItem("loka_section_settings", JSON.stringify(next));
          } catch (_) {}
        }
      } catch (err) {
        console.error("Error fetching section settings:", err);
      }
    };

    fetchSettings();

    // BroadcastChannel synchronization across tabs
    let ch;
    try {
      ch = new BroadcastChannel("loka_section_settings");
      ch.onmessage = (e) => {
        if (e.data?.settings && isMounted) {
          setSettings(e.data.settings);
        }
      };
    } catch (_) {}

    // Storage event for window sync
    const handleStorage = (e) => {
      if (e.key === "loka_section_settings" && e.newValue && isMounted) {
        try {
          setSettings({ ...DEFAULT_SECTION_SETTINGS, ...JSON.parse(e.newValue) });
        } catch (_) {}
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      isMounted = false;
      if (ch) ch.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return settings;
}
