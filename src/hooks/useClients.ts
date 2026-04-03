import { useState, useEffect, useCallback } from 'react';
import type { Client, InvoiceStatus } from '../types';

const GAS_URL = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbyk32EHcWAcSi_P6eovs5r5Sub0zrWtkIB9ngjIFqpdlNhSTPPQiU3Lx6gcGdQgrrZw/exec';

interface GASClient {
  id: number;
  name: string;
  domainCost: number;
  serverCost: number;
  laborCost: number;
  billingAmount: number;
  billingDay: number;
  mfUrl: string;
}

interface GASInvoice {
  clientName: string;
  month: string;
  status: InvoiceStatus;
}

async function gasGet(action: string) {
  const res = await fetch(`${GAS_URL}?action=${action}`);
  return res.json();
}

async function gasPost(data: Record<string, unknown>) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<GASInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [clientsData, invoicesData] = await Promise.all([
        gasGet('getClients'),
        gasGet('getInvoices'),
      ]);
      setClients((clientsData as GASClient[]).map(c => ({
        ...c,
        id: String(c.id),
      })));
      setInvoices(invoicesData as GASInvoice[]);
    } catch (e) {
      setError('データの取得に失敗しました');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addClient = async (client: Omit<Client, 'id'>) => {
    try {
      await gasPost({ action: 'addClient', ...client });
      await fetchAll();
    } catch (e) {
      setError('追加に失敗しました');
      console.error(e);
    }
  };

  const updateClient = async (id: string, updates: Partial<Omit<Client, 'id'>>) => {
    const current = clients.find(c => c.id === id);
    if (!current) return;
    const merged = { ...current, ...updates };
    try {
      const { id: _id, ...rest } = merged;
      await gasPost({ action: 'updateClient', id: Number(id), ...rest });
      await fetchAll();
    } catch (e) {
      setError('更新に失敗しました');
      console.error(e);
    }
  };

  const deleteClient = async (id: string) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    try {
      await gasPost({ action: 'deleteClient', id: Number(id), name: client.name });
      await fetchAll();
    } catch (e) {
      setError('削除に失敗しました');
      console.error(e);
    }
  };

  const getInvoiceStatus = (clientId: string, month: string): InvoiceStatus => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return 'not_sent';
    const inv = invoices.find(i => i.clientName === client.name && i.month === month);
    return inv?.status ?? 'not_sent';
  };

  const setInvoiceStatus = async (clientId: string, month: string, status: InvoiceStatus) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    try {
      await gasPost({ action: 'setInvoiceStatus', clientName: client.name, month, status });
      await fetchAll();
    } catch (e) {
      setError('ステータス更新に失敗しました');
      console.error(e);
    }
  };

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    getInvoiceStatus,
    setInvoiceStatus,
    refresh: fetchAll,
  };
}

export function calcProfit(client: Client): number {
  return client.billingAmount - client.domainCost - client.serverCost - client.laborCost;
}

export function calcTotalCost(client: Client): number {
  return client.domainCost + client.serverCost + client.laborCost;
}

export function calcProfitRate(client: Client): number {
  if (client.billingAmount === 0) return 0;
  return (calcProfit(client) / client.billingAmount) * 100;
}
