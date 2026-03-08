import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type { Entry } from "../backend.d";
import { useActor } from "./useActor";

export function useListEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<Entry[]>({
    queryKey: ["entries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      date,
      note,
      photoBytes,
      onProgress,
    }: {
      id: string;
      date: bigint;
      note: string;
      photoBytes: Uint8Array<ArrayBuffer>;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor)
        throw new Error("Actor not ready — please wait and try again");
      let blob = ExternalBlob.fromBytes(photoBytes);
      if (onProgress) {
        blob = blob.withUploadProgress(onProgress);
      }
      try {
        await actor.addEntry(id, date, note, blob);
      } catch (err) {
        // Provide a clearer message for common IC errors
        const raw = err instanceof Error ? err.message : String(err);
        if (raw.includes("Entry already exists")) {
          throw new Error("A duplicate entry was detected. Please try again.");
        }
        throw new Error(raw);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useDeleteEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}
