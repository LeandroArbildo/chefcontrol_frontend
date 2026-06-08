import { useState } from 'react';
import OrderCard from '../components/OrderCard.jsx';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import TableMap from '../components/TableMap.jsx';
import { formatMoney, getOrderTotal } from '../services/orderService.js';
import { addCashExpense, markOrderPaid, useRestaurantState } from '../services/restaurantStore.js';

const paymentMethods = ['efectivo', 'tarjeta', 'yape/plin'];

export default function CajaPanel() {
  const { orders: allOrders, movements } = useRestaurantState();
  const orders = allOrders.filter((order) => ['listo', 'entregado'].includes(order.status));
  const [selectedPayment, setSelectedPayment] = useState('efectivo');
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [expenseConcept, setExpenseConcept] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const income = movements
    .filter((movement) => movement.type === 'ingreso')
    .reduce((sum, movement) => sum + movement.amount, 0);
  const expenses = movements
    .filter((movement) => movement.type === 'egreso')
    .reduce((sum, movement) => sum + movement.amount, 0);
  const paidOrders = orders.filter((order) => order.paid).length;

  function markAsPaid(orderId) {
    markOrderPaid(orderId, selectedPayment);
  }

  function openReceipt(order) {
    setReceiptOrder(order);
  }

  function printReceipt() {
    window.print();
  }

  function addExpense(event) {
    event.preventDefault();
    const amount = Number(expenseAmount);
    if (!expenseConcept.trim() || !amount || amount <= 0) return;

    addCashExpense(expenseConcept.trim(), amount);
    setExpenseConcept('');
    setExpenseAmount('');
  }

  return (
    <>
      <PageHeader
        eyebrow="Caja diaria"
        title="Ingresos y cobros del dia"
        description="Caja ve pagos, mesas, cocina y movimientos operativos del dia."
      />

      <div className="metric-grid">
        <MetricCard label="Ingresos" value={formatMoney(income)} helper="Cobros registrados hoy" />
        <MetricCard label="Egresos" value={formatMoney(expenses)} helper="Gastos operativos del dia" />
        <MetricCard label="Saldo del dia" value={formatMoney(income - expenses)} helper="Ingreso menos egreso" />
        <MetricCard label="Mesas pagadas" value={`${paidOrders}/${orders.length}`} helper="Pedidos listos o entregados" />
      </div>

      <Section title="Mesas del restaurante">
        <TableMap compact />
      </Section>

      <div className="two-column two-column--wide-left">
        <Section title="Pedidos por cobrar">
          <div className="card-list">
            {orders.map((order) => (
              <OrderCard
                order={order}
                key={order.id}
                showPayment
                actions={(
                  <>
                    {!order.paid && (
                      <>
                        <select value={selectedPayment} onChange={(event) => setSelectedPayment(event.target.value)}>
                          {paymentMethods.map((method) => <option value={method} key={method}>{method}</option>)}
                        </select>
                        <button className="primary-button" type="button" onClick={() => markAsPaid(order.id)}>
                          Marcar pagado
                        </button>
                      </>
                    )}
                    <button className="ghost-button" type="button" onClick={() => openReceipt(order)}>
                      Comprobante
                    </button>
                  </>
                )}
              />
            ))}
          </div>
        </Section>

        <Section title="Comprobante">
          <div className="receipt">
            <strong>Chef Control</strong>
            <span>RUC 20123456789</span>
            <hr />
            {orders.slice(0, 3).map((order) => (
              <div className="receipt-line" key={order.id}>
                <span>{order.id}</span>
                <b>{formatMoney(getOrderTotal(order))}</b>
              </div>
            ))}
            <hr />
            <div className="receipt-line">
              <span>Total mostrado</span>
              <b>{formatMoney(orders.slice(0, 3).reduce((sum, order) => sum + getOrderTotal(order), 0))}</b>
            </div>
          </div>
        </Section>
      </div>

      <div className="two-column">
        <Section title="Movimientos del dia">
          <form className="expense-form" onSubmit={addExpense}>
            <label>
              Concepto de egreso
              <input
                value={expenseConcept}
                onChange={(event) => setExpenseConcept(event.target.value)}
                placeholder="Aceite, gas, bolsas, movilidad..."
              />
            </label>
            <label>
              Monto
              <input
                min="1"
                step="0.10"
                type="number"
                value={expenseAmount}
                onChange={(event) => setExpenseAmount(event.target.value)}
                placeholder="0.00"
              />
            </label>
            <button className="primary-button" type="submit">
              Registrar egreso
            </button>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Concepto</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{movement.type}</td>
                    <td>{movement.concept}</td>
                    <td>{formatMoney(movement.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Cocina ahora">
          <div className="status-summary">
            <div><strong>{allOrders.filter((order) => order.status === 'pendiente').length}</strong><span>Pendientes</span></div>
            <div><strong>{allOrders.filter((order) => order.status === 'en preparacion').length}</strong><span>En preparacion</span></div>
            <div><strong>{allOrders.filter((order) => order.status === 'listo').length}</strong><span>Listos</span></div>
          </div>
        </Section>
      </div>

      {receiptOrder && (
        <div className="modal-backdrop" role="presentation" onClick={() => setReceiptOrder(null)}>
          <section className="receipt-modal" role="dialog" aria-modal="true" aria-label="Comprobante de pago" onClick={(event) => event.stopPropagation()}>
            <div className="receipt-ticket" id="receipt-print-area">
              <div className="receipt-ticket__brand">
                <strong>Chef Control</strong>
                <span>Polleria Chifa</span>
                <small>RUC 20123456789</small>
              </div>

              <div className="receipt-ticket__meta">
                <span>Comprobante simple</span>
                <b>{receiptOrder.id}</b>
              </div>

              <div className="receipt-ticket__meta">
                <span>{receiptOrder.table}</span>
                <span>{receiptOrder.createdAt}</span>
              </div>

              <hr />

              <div className="receipt-ticket__items">
                {receiptOrder.items.map((item) => (
                  <div key={`${receiptOrder.id}-${item.productId}`}>
                    <span>{item.quantity} x {item.name}</span>
                    <b>{formatMoney(item.quantity * item.price)}</b>
                  </div>
                ))}
              </div>

              <hr />

              <div className="receipt-ticket__total">
                <span>Total</span>
                <strong>{formatMoney(getOrderTotal(receiptOrder))}</strong>
              </div>

              <div className="receipt-ticket__meta">
                <span>Pago</span>
                <b>{receiptOrder.paid ? receiptOrder.paymentMethod : selectedPayment}</b>
              </div>

              <p>Gracias por su preferencia.</p>
            </div>

            <div className="receipt-modal__actions">
              <button className="ghost-button" type="button" onClick={() => setReceiptOrder(null)}>
                Cerrar
              </button>
              <button className="primary-button" type="button" onClick={printReceipt}>
                Imprimir
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
