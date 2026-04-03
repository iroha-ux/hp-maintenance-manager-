import type { Client, InvoiceStatus } from '../types';
import { INVOICE_STATUS_LABELS } from '../types';

interface Props {
  clients: Client[];
  selectedMonth: string;
  getInvoiceStatus: (clientId: string, month: string) => InvoiceStatus;
  setInvoiceStatus: (clientId: string, month: string, status: InvoiceStatus) => void;
}

const fmt = (n: number) => n.toLocaleString('ja-JP');

const NEXT_STATUS: Record<InvoiceStatus, InvoiceStatus> = {
  not_sent: 'sent',
  sent: 'paid',
  paid: 'not_sent',
};

const STATUS_CLASS: Record<InvoiceStatus, string> = {
  not_sent: 'status-not-sent',
  sent: 'status-sent',
  paid: 'status-paid',
};

export function InvoiceList({ clients, selectedMonth, getInvoiceStatus, setInvoiceStatus }: Props) {
  if (clients.length === 0) {
    return <p className="empty">クライアントが登録されていません。</p>;
  }

  const items = clients.map(c => ({
    client: c,
    status: getInvoiceStatus(c.id, selectedMonth),
  }));

  const summary = {
    not_sent: items.filter(i => i.status === 'not_sent').length,
    sent: items.filter(i => i.status === 'sent').length,
    paid: items.filter(i => i.status === 'paid').length,
    totalBilling: items.reduce((a, i) => a + i.client.billingAmount, 0),
    paidAmount: items.filter(i => i.status === 'paid').reduce((a, i) => a + i.client.billingAmount, 0),
  };

  return (
    <div className="invoice-list">
      <div className="invoice-summary">
        <div className="summary-item">
          <span className="summary-label">請求総額</span>
          <span className="summary-value">{fmt(summary.totalBilling)}円</span>
        </div>
        <div className="summary-item status-not-sent">
          <span className="summary-label">未送信</span>
          <span className="summary-value">{summary.not_sent}件</span>
        </div>
        <div className="summary-item status-sent">
          <span className="summary-label">送信済</span>
          <span className="summary-value">{summary.sent}件</span>
        </div>
        <div className="summary-item status-paid">
          <span className="summary-label">入金済</span>
          <span className="summary-value">{summary.paid}件 ({fmt(summary.paidAmount)}円)</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>クライアント名</th>
              <th className="num">請求日</th>
              <th className="num">請求金額</th>
              <th>ステータス</th>
              <th>MF確認</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ client: c, status }) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="num">{selectedMonth}-{String(c.billingDay).padStart(2, '0')}</td>
                <td className="num">{fmt(c.billingAmount)}円</td>
                <td>
                  <span className={`status-badge ${STATUS_CLASS[status]}`}>
                    {INVOICE_STATUS_LABELS[status]}
                  </span>
                </td>
                <td>
                  {c.mfUrl ? (
                    <a href={c.mfUrl} target="_blank" rel="noopener noreferrer" className="btn-small btn-mf">MFで確認</a>
                  ) : (
                    <span className="mf-none">未設定</span>
                  )}
                </td>
                <td className="actions">
                  <button
                    className={`btn-small btn-status ${STATUS_CLASS[NEXT_STATUS[status]]}`}
                    onClick={() => setInvoiceStatus(c.id, selectedMonth, NEXT_STATUS[status])}
                  >
                    → {INVOICE_STATUS_LABELS[NEXT_STATUS[status]]}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
