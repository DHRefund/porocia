import { useState, useEffect } from "react";
import { listenChannels } from "@/lib/firebase/chat";
import { DocumentData } from "firebase/firestore";

export function useChannels() {
  const [channels, setChannels] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = listenChannels((data) => {
      setChannels(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  return { channels, loading, error };
}
