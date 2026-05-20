import { useState, useEffect } from "react";
import { listenChannels } from "@/lib/firebase/chat";
import { useAuth } from "@/components/AuthProvider";

export function useChannels(initialData: any[] = []) {
  const [channels, setChannels] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setChannels([]);
      setLoading(false);
      return;
    }

    const unsubscribe = listenChannels((data) => {
      const visibleChannels = data.filter((channel) => {
        const isDM = channel.id.startsWith("dm_");
        if (!isDM) return true; // Standard channels are public
        return channel.members?.includes(user.uid) ?? false; // DM only for participants
      });

      setChannels(visibleChannels);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [user]);

  return { channels, loading, error };
}
