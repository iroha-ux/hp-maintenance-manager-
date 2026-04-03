import { useState } from 'react';
import type { Client } from '../types';

interface Props {
  onSubmit: (client: Omit<Client, 'id'>) => void;
  initial?: Client;
  onCancel?: () => void;
}

export function ClientForm({ onSubmit, initial, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [domainCost, setDomainCost] = useState(initial?.domainCost?.toString() ?? '');
  const [serverCost, setServerCost] = useState(initial?.serverCost?.toString() ?? '');
  const [laborCost, setLaborCost] = useState(initial?.laborCost?.toString() ?? '');
  const [billingAmount, setBillingAmount] = useState(initial?.billingAmount?.toString() ?? '');
  const [billingDay, setBillingDay] = useState(initial?.billingDay?.toString() ?? '');
  const [mfUrl, setMfUrl] = useState(initial?.mfUrl ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      domainCost: Number(domainCost) || 0,
      serverCost: Number(serverCost) || 0,
      laborCost: Number(laborCost) || 0,
      billingAmount: Number(billingAmount) || 0,
      billingDay: Number(billingDay) || 1,
      mfUrl: mfUrl.trim(),
    });
    if (!initial) {
      setName('');
      setDomainCost('');
      setServerCost('');
      setLaborCost('');
      setBillingAmount('');
      setBillingDay('');
      setMfUrl('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="client-form">
      <div className="form-row">
        <label>
          クライアント名
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          ドメイン費 (月額)
          <input type="number" min="0" value={domainCost} onChange={e => setDomainCost(e.target.value)} placeholder="0" />
        </label>
        <label>
          サーバー費 (月額)
          <input type="number" min="0" value={serverCost} onChange={e => setServerCost(e.target.value)} placeholder="0" />
        </label>
        <label>
          管理工数費 (月額)
          <input type="number" min="0" value={laborCost} onChange={e => setLaborCost(e.target.value)} placeholder="0" />
        </label>
        <label>
          請求金額 (月額)
          <input type="number" min="0" value={billingAmount} onChange={e => setBillingAmount(e.target.value)} placeholder="0" />
        </label>
      </div>
      <div className="form-row">
        <label>
          請求日 (毎月)
          <input type="number" min="1" max="31" value={billingDay} onChange={e => setBillingDay(e.target.value)} placeholder="1" />
        </label>
        <label className="wide">
          MFクラウド請求書URL
          <input value={mfUrl} onChange={e => setMfUrl(e.target.value)} placeholder="https://invoice.moneyforward.com/..." />
        </label>
      </div>
      <div className="form-actions">
        <button type="submit">{initial ? '更新' : '追加'}</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">キャンセル</button>}
      </div>
    </form>
  );
}
