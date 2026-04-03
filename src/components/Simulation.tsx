import { useState } from 'react';
import type { Client, SimulationResult } from '../types';
import { calcProfit, calcProfitRate, calcTotalCost } from '../hooks/useClients';

interface Props {
  clients: Client[];
}

const fmt = (n: number) => n.toLocaleString('ja-JP');

export function Simulation({ clients }: Props) {
  const [mode, setMode] = useState<'bulk' | 'individual'>('bulk');
  const [bulkPercent, setBulkPercent] = useState('10');
  const [bulkAmount, setBulkAmount] = useState('');
  const [individualRaises, setIndividualRaises] = useState<Record<string, string>>({});
  const [results, setResults] = useState<SimulationResult[] | null>(null);

  if (clients.length === 0) {
    return <p className="empty">シミュレーションにはクライアントの登録が必要です。</p>;
  }

  const runBulkSimulation = () => {
    const percent = Number(bulkPercent) || 0;
    const amount = Number(bulkAmount) || 0;
    const res = clients.map(c => {
      const raiseByPercent = Math.round(c.billingAmount * percent / 100);
      const newBilling = c.billingAmount + raiseByPercent + amount;
      const cost = calcTotalCost(c);
      return {
        clientId: c.id,
        clientName: c.name,
        currentBilling: c.billingAmount,
        newBilling,
        currentProfit: calcProfit(c),
        newProfit: newBilling - cost,
        currentProfitRate: calcProfitRate(c),
        newProfitRate: newBilling > 0 ? ((newBilling - cost) / newBilling) * 100 : 0,
      };
    });
    setResults(res);
  };

  const runIndividualSimulation = () => {
    const res = clients.map(c => {
      const raise = Number(individualRaises[c.id]) || 0;
      const newBilling = c.billingAmount + raise;
      const cost = calcTotalCost(c);
      return {
        clientId: c.id,
        clientName: c.name,
        currentBilling: c.billingAmount,
        newBilling,
        currentProfit: calcProfit(c),
        newProfit: newBilling - cost,
        currentProfitRate: calcProfitRate(c),
        newProfitRate: newBilling > 0 ? ((newBilling - cost) / newBilling) * 100 : 0,
      };
    });
    setResults(res);
  };

  const totalCurrent = results?.reduce((a, r) => ({ billing: a.billing + r.currentBilling, profit: a.profit + r.currentProfit }), { billing: 0, profit: 0 });
  const totalNew = results?.reduce((a, r) => ({ billing: a.billing + r.newBilling, profit: a.profit + r.newProfit }), { billing: 0, profit: 0 });

  return (
    <div className="simulation">
      <div className="sim-tabs">
        <button className={mode === 'bulk' ? 'active' : ''} onClick={() => { setMode('bulk'); setResults(null); }}>一括値上げ</button>
        <button className={mode === 'individual' ? 'active' : ''} onClick={() => { setMode('individual'); setResults(null); }}>個別値上げ</button>
      </div>

      {mode === 'bulk' && (
        <div className="sim-form">
          <label>
            値上げ率 (%)
            <input type="number" value={bulkPercent} onChange={e => setBulkPercent(e.target.value)} />
          </label>
          <label>
            + 固定額 (円)
            <input type="number" value={bulkAmount} onChange={e => setBulkAmount(e.target.value)} placeholder="0" />
          </label>
          <button onClick={runBulkSimulation}>シミュレーション実行</button>
        </div>
      )}

      {mode === 'individual' && (
        <div className="sim-individual">
          <div className="sim-individual-list">
            {clients.map(c => (
              <div key={c.id} className="sim-individual-row">
                <span>{c.name}</span>
                <span className="current">現在: {fmt(c.billingAmount)}円</span>
                <label>
                  値上げ額 (円)
                  <input
                    type="number"
                    value={individualRaises[c.id] ?? ''}
                    onChange={e => setIndividualRaises(prev => ({ ...prev, [c.id]: e.target.value }))}
                    placeholder="0"
                  />
                </label>
              </div>
            ))}
          </div>
          <button onClick={runIndividualSimulation}>シミュレーション実行</button>
        </div>
      )}

      {results && (
        <div className="sim-results">
          <h3>シミュレーション結果</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>クライアント名</th>
                  <th className="num">現在の請求額</th>
                  <th className="num">値上げ後</th>
                  <th className="num">差額</th>
                  <th className="num">現在の利益</th>
                  <th className="num">値上げ後利益</th>
                  <th className="num">現在利益率</th>
                  <th className="num">値上げ後利益率</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.clientId}>
                    <td>{r.clientName}</td>
                    <td className="num">{fmt(r.currentBilling)}</td>
                    <td className="num">{fmt(r.newBilling)}</td>
                    <td className="num diff-positive">+{fmt(r.newBilling - r.currentBilling)}</td>
                    <td className={`num ${r.currentProfit < 0 ? 'negative' : ''}`}>{fmt(r.currentProfit)}</td>
                    <td className={`num ${r.newProfit < 0 ? 'negative' : ''}`}>{fmt(r.newProfit)}</td>
                    <td className="num">{r.currentProfitRate.toFixed(1)}%</td>
                    <td className="num">{r.newProfitRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              {totalCurrent && totalNew && (
                <tfoot>
                  <tr>
                    <td><strong>合計</strong></td>
                    <td className="num"><strong>{fmt(totalCurrent.billing)}</strong></td>
                    <td className="num"><strong>{fmt(totalNew.billing)}</strong></td>
                    <td className="num diff-positive"><strong>+{fmt(totalNew.billing - totalCurrent.billing)}</strong></td>
                    <td className="num"><strong>{fmt(totalCurrent.profit)}</strong></td>
                    <td className="num"><strong>{fmt(totalNew.profit)}</strong></td>
                    <td className="num"><strong>{totalCurrent.billing > 0 ? (totalCurrent.profit / totalCurrent.billing * 100).toFixed(1) : '0.0'}%</strong></td>
                    <td className="num"><strong>{totalNew.billing > 0 ? (totalNew.profit / totalNew.billing * 100).toFixed(1) : '0.0'}%</strong></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
