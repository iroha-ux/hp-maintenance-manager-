import { useState } from 'react';
import { useClients } from './hooks/useClients';
import { ClientForm } from './components/ClientForm';
import { ClientTable } from './components/ClientTable';
import { Simulation } from './components/Simulation';
import { InvoiceList } from './components/InvoiceList';
import './App.css';

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function App() {
  const { clients, loading, error, addClient, updateClient, deleteClient, getInvoiceStatus, setInvoiceStatus, refresh } = useClients();
  const [tab, setTab] = useState<'list' | 'invoice' | 'simulation'>('list');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);

  return (
    <div className="app">
      <header>
        <div className="header-top">
          <h1>HP保守 売上・原価・利益管理</h1>
          <button onClick={refresh} className="btn-refresh" disabled={loading}>
            {loading ? '読込中...' : '更新'}
          </button>
        </div>
        {error && <div className="error-bar">{error}</div>}
        <nav>
          <button className={tab === 'list' ? 'active' : ''} onClick={() => setTab('list')}>クライアント管理</button>
          <button className={tab === 'invoice' ? 'active' : ''} onClick={() => setTab('invoice')}>請求管理</button>
          <button className={tab === 'simulation' ? 'active' : ''} onClick={() => setTab('simulation')}>値上げシミュレーション</button>
        </nav>
      </header>

      <main>
        {loading && clients.length === 0 ? (
          <div className="loading">データを読み込み中...</div>
        ) : (
          <>
            {tab === 'list' && (
              <>
                <section className="card">
                  <h2>クライアント追加</h2>
                  <ClientForm onSubmit={addClient} />
                </section>
                <section className="card">
                  <h2>クライアント一覧 ({clients.length}件)</h2>
                  <ClientTable clients={clients} onUpdate={updateClient} onDelete={deleteClient} />
                </section>
              </>
            )}

            {tab === 'invoice' && (
              <section className="card">
                <div className="invoice-header">
                  <h2>請求管理</h2>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="month-picker"
                  />
                </div>
                <InvoiceList
                  clients={clients}
                  selectedMonth={selectedMonth}
                  getInvoiceStatus={getInvoiceStatus}
                  setInvoiceStatus={setInvoiceStatus}
                />
              </section>
            )}

            {tab === 'simulation' && (
              <section className="card">
                <h2>値上げシミュレーション</h2>
                <Simulation clients={clients} />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
