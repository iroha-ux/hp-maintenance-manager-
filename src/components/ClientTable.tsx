import { useState } from 'react';
import type { Client } from '../types';
import { calcProfit, calcProfitRate, calcTotalCost } from '../hooks/useClients';
import { ClientForm } from './ClientForm';

interface Props {
  clients: Client[];
  onUpdate: (id: string, updates: Partial<Omit<Client, 'id'>>) => void;
  onDelete: (id: string) => void;
}

const fmt = (n: number) => n.toLocaleString('ja-JP');

export function ClientTable({ clients, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (clients.length === 0) {
    return <p className="empty">クライアントが登録されていません。上のフォームから追加してください。</p>;
  }

  const totals = clients.reduce(
    (acc, c) => ({
      domainCost: acc.domainCost + c.domainCost,
      serverCost: acc.serverCost + c.serverCost,
      laborCost: acc.laborCost + c.laborCost,
      billingAmount: acc.billingAmount + c.billingAmount,
      totalCost: acc.totalCost + calcTotalCost(c),
      profit: acc.profit + calcProfit(c),
    }),
    { domainCost: 0, serverCost: 0, laborCost: 0, billingAmount: 0, totalCost: 0, profit: 0 }
  );

  const totalProfitRate = totals.billingAmount > 0
    ? (totals.profit / totals.billingAmount) * 100
    : 0;

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>クライアント名</th>
            <th className="num">請求日</th>
            <th className="num">ドメイン費</th>
            <th className="num">サーバー費</th>
            <th className="num">管理工数費</th>
            <th className="num">原価合計</th>
            <th className="num">請求金額</th>
            <th className="num">利益</th>
            <th className="num">利益率</th>
            <th>MF</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => {
            const profit = calcProfit(c);
            const profitRate = calcProfitRate(c);

            if (editingId === c.id) {
              return (
                <tr key={c.id}>
                  <td colSpan={11}>
                    <ClientForm
                      initial={c}
                      onSubmit={updates => { onUpdate(c.id, updates); setEditingId(null); }}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              );
            }

            return (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="num">{c.billingDay}日</td>
                <td className="num">{fmt(c.domainCost)}</td>
                <td className="num">{fmt(c.serverCost)}</td>
                <td className="num">{fmt(c.laborCost)}</td>
                <td className="num">{fmt(calcTotalCost(c))}</td>
                <td className="num">{fmt(c.billingAmount)}</td>
                <td className={`num ${profit < 0 ? 'negative' : ''}`}>{fmt(profit)}</td>
                <td className={`num ${profitRate < 20 ? 'warning' : ''}`}>{profitRate.toFixed(1)}%</td>
                <td>
                  {c.mfUrl ? (
                    <a href={c.mfUrl} target="_blank" rel="noopener noreferrer" className="btn-small btn-mf">MF確認</a>
                  ) : (
                    <span className="mf-none">-</span>
                  )}
                </td>
                <td className="actions">
                  <button onClick={() => setEditingId(c.id)} className="btn-small">編集</button>
                  <button onClick={() => { if (confirm(`${c.name} を削除しますか？`)) onDelete(c.id); }} className="btn-small btn-danger">削除</button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>合計</strong></td>
            <td></td>
            <td className="num"><strong>{fmt(totals.domainCost)}</strong></td>
            <td className="num"><strong>{fmt(totals.serverCost)}</strong></td>
            <td className="num"><strong>{fmt(totals.laborCost)}</strong></td>
            <td className="num"><strong>{fmt(totals.totalCost)}</strong></td>
            <td className="num"><strong>{fmt(totals.billingAmount)}</strong></td>
            <td className={`num ${totals.profit < 0 ? 'negative' : ''}`}><strong>{fmt(totals.profit)}</strong></td>
            <td className="num"><strong>{totalProfitRate.toFixed(1)}%</strong></td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
