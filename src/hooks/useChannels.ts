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
        const type = channel.type || (channel.id.startsWith("dm_") ? "dm" : "public");
        
        if (type === "public") return true; // Standard public channels are always visible
        
        // Private channels or DM: only visible to members
        return channel.members?.includes(user.uid) ?? false;
      });

      setChannels(visibleChannels);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [user]);

  return { channels, loading, error };
}
