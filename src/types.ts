export type InvoiceStatus = 'not_sent' | 'sent' | 'paid';

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  not_sent: '未送信',
  sent: '送信済',
  paid: '入金済',
};

export interface Client {
  id: string;
  name: string;
  domainCost: number;
  serverCost: number;
  laborCost: number;
  billingAmount: number;
  billingDay: number;
  mfUrl: string;
}

export interface MonthlyInvoice {
  clientId: string;
  month: string; // "2026-03"
  status: InvoiceStatus;
}

export interface SimulationResult {
  clientId: string;
  clientName: string;
  currentBilling: number;
  newBilling: number;
  currentProfit: number;
  newProfit: number;
  currentProfitRate: number;
  newProfitRate: number;
}
