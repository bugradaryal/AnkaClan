import { useQuery } from '@tanstack/react-query'
import { loadSquad } from './loadSquad'

export function useSquad() {
  return useQuery({
    queryKey: ['squad'],
    queryFn: loadSquad,
    staleTime: 30 * 60 * 1000, // the data changes every few hours at most; do not ask again within 30 minutes
    gcTime: 60 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  })
}
