import { InventoryItem, NotificationItem } from '../types';

export interface InventoryCheckResult {
  lowStockItems: InventoryItem[];
  checkedAt: string;
  totalItems: number;
  threshold: number;
  hasAlert: boolean;
}

/**
 * Evaluates the inventory items against the user-defined threshold.
 * An item triggers an alert if its currentQty is below the user-defined threshold
 * (or below its specific reorderPt, whichever is defined and applicable).
 */
export function checkInventoryStock(
  inventory: InventoryItem[],
  userDefinedThreshold: number
): InventoryCheckResult {
  const effectiveThreshold = Math.max(1, userDefinedThreshold || 10);
  
  const lowStockItems = inventory.filter((item) => {
    // If the item has a specific reorderPt set by user, we consider the threshold
    // Either the user's global threshold or the item's reorder point
    const itemThreshold = item.reorderPt > 0 ? Math.min(item.reorderPt, effectiveThreshold) : effectiveThreshold;
    return (item.currentQty ?? 0) < effectiveThreshold || (item.currentQty ?? 0) < (item.reorderPt || effectiveThreshold);
  });

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return {
    lowStockItems,
    checkedAt: timeString,
    totalItems: inventory.length,
    threshold: effectiveThreshold,
    hasAlert: lowStockItems.length > 0
  };
}

/**
 * Creates or updates persistent notifications for items that have fallen below the user-defined threshold.
 */
export function syncInventoryNotifications(
  lowStockItems: InventoryItem[],
  existingNotifications: NotificationItem[],
  userThreshold: number,
  userId = 'demo'
): { updatedNotifications: NotificationItem[]; newAlertsAdded: NotificationItem[] } {
  const currentNotifs = [...existingNotifications];
  const newAlertsAdded: NotificationItem[] = [];

  for (const item of lowStockItems) {
    const alertId = `low-stock-${item.sku}`;
    const existingIndex = currentNotifs.findIndex(
      (n) => n.id === alertId || (n.sku === item.sku && n.type === 'alert')
    );

    const title = `⚠️ Low Stock Alert: ${item.name}`;
    const description = `Current quantity is ${item.currentQty} unit${item.currentQty === 1 ? '' : 's'}, below your defined threshold of ${userThreshold}. SKU: ${item.sku}.`;

    if (existingIndex >= 0) {
      // Update description with newest count if changed
      const existing = currentNotifs[existingIndex];
      if (existing.description !== description) {
        currentNotifs[existingIndex] = {
          ...existing,
          title,
          description,
          time: 'Just now',
          read: false // re-surface unread status on new change
        };
      }
    } else {
      // Create new persistent alert
      const newAlert: NotificationItem = {
        id: alertId,
        userId,
        title,
        description,
        time: 'Just now',
        read: false,
        type: 'alert',
        sku: item.sku,
        isPersistentAlert: true
      };
      currentNotifs.unshift(newAlert);
      newAlertsAdded.push(newAlert);
    }
  }

  return {
    updatedNotifications: currentNotifs,
    newAlertsAdded
  };
}
