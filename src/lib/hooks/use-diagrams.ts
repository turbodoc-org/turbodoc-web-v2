import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDiagrams,
  getDiagram,
  createDiagram,
  updateDiagram,
  deleteDiagram,
  duplicateDiagram,
} from '../api';
import type { Diagram } from '../types';

// Query keys
export const diagramKeys = {
  all: ['diagrams'] as const,
  lists: () => [...diagramKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) =>
    [...diagramKeys.lists(), filters] as const,
  details: () => [...diagramKeys.all, 'detail'] as const,
  detail: (id: string) => [...diagramKeys.details(), id] as const,
};

// Get all diagrams
export function useDiagrams() {
  return useQuery({
    queryKey: diagramKeys.lists(),
    queryFn: getDiagrams,
  });
}

// Get single diagram
export function useDiagram(id: string) {
  return useQuery({
    queryKey: diagramKeys.detail(id),
    queryFn: () => getDiagram(id),
    enabled: !!id,
  });
}

// Create diagram mutation
export function useCreateDiagram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDiagram,
    onSuccess: (newDiagram) => {
      // Update the diagrams list
      queryClient.setQueryData<Diagram[]>(diagramKeys.lists(), (old) =>
        old ? [newDiagram, ...old] : [newDiagram],
      );

      // Set the new diagram in cache
      queryClient.setQueryData(diagramKeys.detail(newDiagram.id), newDiagram);
    },
  });
}

// Update diagram mutation
export function useUpdateDiagram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Diagram> }) =>
      updateDiagram(id, updates),
    onSuccess: (updatedDiagram) => {
      // Update the diagram in cache
      queryClient.setQueryData(
        diagramKeys.detail(updatedDiagram.id),
        updatedDiagram,
      );

      // Update the diagram in the list
      queryClient.setQueryData<Diagram[]>(
        diagramKeys.lists(),
        (old) =>
          old?.map((diagram) =>
            diagram.id === updatedDiagram.id ? updatedDiagram : diagram,
          ) ?? [],
      );
    },
  });
}

// Delete diagram mutation
export function useDeleteDiagram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDiagram,
    onSuccess: (_, deletedId) => {
      // Remove from the list
      queryClient.setQueryData<Diagram[]>(
        diagramKeys.lists(),
        (old) => old?.filter((diagram) => diagram.id !== deletedId) ?? [],
      );

      // Remove from cache
      queryClient.removeQueries({
        queryKey: diagramKeys.detail(deletedId),
      });
    },
  });
}

// Duplicate diagram mutation
export function useDuplicateDiagram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateDiagram,
    onSuccess: (duplicatedDiagram) => {
      // Add to the diagrams list
      queryClient.setQueryData<Diagram[]>(diagramKeys.lists(), (old) =>
        old ? [duplicatedDiagram, ...old] : [duplicatedDiagram],
      );

      // Set the duplicated diagram in cache
      queryClient.setQueryData(
        diagramKeys.detail(duplicatedDiagram.id),
        duplicatedDiagram,
      );
    },
  });
}
