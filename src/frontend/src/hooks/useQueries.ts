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
      if (!actor) throw new Error("Actor not ready");
      const blob = onProgress
        ? ExternalBlob.fromBytes(photoBytes).withUploadProgress(onProgress)
        : ExternalBlob.fromBytes(photoBytes);
      await actor.addEntry(id, date, note, blob);
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
