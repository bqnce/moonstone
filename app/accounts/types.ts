export interface ManualAsset {
    _id: string;
    category: string;
    subCategory?: string;
    subcategory?: string;
    balance: number;
    currency: string;
    label: string;
  }
  
  export interface AccountsData {
    _id: string;
    userId: string;
    manualAssets: ManualAsset[];
    updatedAt?: string;
    lastUpdated?: string;
  }