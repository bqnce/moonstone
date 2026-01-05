export interface EventItem {
    _id: string;
    timestamp: string;
    source: string;
    delta: number;
    balanceAfter: number;
    currency: string;
    category: string;
    subcategory?: string;
    metadata?: {
      month?: string;
    };
  }