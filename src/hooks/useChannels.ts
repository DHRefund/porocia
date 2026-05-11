import { useState, useEffect } from "react";
import { listenChannels } from "@/lib/firebase/chat";
import { DocumentData } from "firebase/firestore";

export function useChannels(initialData: any[] = []) {
  const [channels, setChannels] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Nếu có initialData, chúng ta không cần set loading là true nữa
    const unsubscribe = listenChannels((data) => {
      setChannels(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  return { channels, loading, error };
}
