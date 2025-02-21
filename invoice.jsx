export function Invoice({ invoiceNumber, amount, dueDate, clientName }) {
  return (
    <div>
      <h2>Invoice: {invoiceNumber}</h2>
      <p>Amount: ${amount}</p>
      <p>Due: {new Date(dueDate).toLocaleDateString()}</p>
      <p>Client: {clientName}</p>
    </div>
  );
}
