import { useState, useEffect } from "react";
import { getChannels } from "@/lib/firebase/chat";
import { DocumentData } from "firebase/firestore";

export function useChannels() {
  const [channels, setChannels] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchChannels() {
      try {
        setLoading(true);
        const data = await getChannels();
        if (mounted) {
          setChannels(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch channels"));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchChannels();

    return () => {
      mounted = false;
    };
  }, []);

  return { channels, loading, error };
}
