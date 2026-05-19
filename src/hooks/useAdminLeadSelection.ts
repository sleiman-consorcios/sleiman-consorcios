import { useState, useCallback } from "react";

export function useAdminLeadSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === items.length && items.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  }, [items, selectedIds]);

  const toggleSelectLead = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    toggleSelectAll,
    toggleSelectLead,
    clearSelection,
    isAllSelected: items.length > 0 && selectedIds.length === items.length,
    hasSelection: selectedIds.length > 0
  };
}
