import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { useIncomeStore } from '../../store/incomeStore';
import type { MiscIncome } from '../../types';

interface MiscIncomeFormProps {
  miscIncome?: MiscIncome;
  onClose: () => void;
}

export function MiscIncomeForm({ miscIncome, onClose }: MiscIncomeFormProps) {
  const { addMiscIncome, updateMiscIncome } = useIncomeStore();
  const [description, setDescription] = useState(miscIncome?.description ?? '');
  const [amount, setAmount] = useState(miscIncome ? String(miscIncome.amount) : '');
  const [date, setDate] = useState(miscIncome?.date ?? new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(miscIncome?.note ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!description.trim()) errs.description = 'Description is required';
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount';
    if (!date) errs.date = 'Date is required';
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const data = {
      description: description.trim(),
      amount: parseFloat(amount),
      date,
      note: note.trim() || undefined,
    };

    if (miscIncome) {
      updateMiscIncome(miscIncome.id, data);
    } else {
      addMiscIncome(data);
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="description"
        label="Description"
        placeholder="e.g. Tax refund, Garage sale, Bonus"
        value={description}
        onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })); }}
        error={errors.description}
        autoFocus
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="amount"
          label="Amount ($)"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: '' })); }}
          error={errors.amount}
        />
        <DatePicker
          id="date"
          label="Date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: '' })); }}
          error={errors.date}
        />
      </div>

      <Input
        id="note"
        label="Note (optional)"
        placeholder="Additional details"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">{miscIncome ? 'Save Changes' : 'Add Income'}</Button>
      </div>
    </form>
  );
}
