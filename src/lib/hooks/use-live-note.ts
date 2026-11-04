import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/clients/supabase/client";
import type { Note } from "@/lib/types";

/**
 * Refetch an open note as soon as another device saves it, using Supabase
 * Realtime (RLS limits events to the user's own notes). The editor then loads
 * the new version, or merges with it on its next save if it has unsaved edits.
 *
 * Saves from this tab are already cached, so their echoes are skipped.
 */
export function useLiveNote(noteId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refetchIfNewer = (version?: number) => {
      const cached = queryClient.getQueryData<Note>(["note", noteId]);
      if (version !== undefined && cached && cached.version >= version) return;
      void queryClient.invalidateQueries({ queryKey: ["note", noteId], exact: true });
    };

    let connectedBefore = false;
    const channel = supabase
      .channel(`note:${noteId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notes", filter: `id=eq.${noteId}` },
        (payload) => refetchIfNewer((payload.new as Partial<Note>).version),
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") return;
        // After a reconnect (sleep, network loss), catch up on missed saves.
        if (connectedBefore) refetchIfNewer();
        connectedBefore = true;
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [noteId, queryClient]);
}
