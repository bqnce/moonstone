export interface DailyStat {
  _id: string; // date string YYYY-MM-DD
  netChange: number;
  income: number;
  expense: number;
  transactionCount: number;
  cumulativeLiquidity?: number;
}

export interface TopEvent {
  _id: string;
  category: string;
  source: string;
  delta: number;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalIn: number;
  totalOut: number;
  netTotal: number;
}

export interface AnalyticsData {
  dailyStats: DailyStat[];
  topEvents: {
    gains: TopEvent[];
    losses: TopEvent[];
  };
  summary: AnalyticsSummary;
}
