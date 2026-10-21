/**
 * Demo data.
 *
 * Used by the "cargar datos de ejemplo" action in Settings so the app can be
 * explored without typing anything. All the values are fictional.
 */

import { addMonths, currentMonthKey, daysInMonth, parseMonthKey, pad2, todayISO } from '@/utils/date';
import { createId } from '@/utils/id';

import type { Account, AppState, CalendarEvent, Debt, FixedExpense, Task } from '@/store/types';

function dayIn(monthKey: string, day: number): string {
  const { year, month } = parseMonthKey(monthKey);
  const max = daysInMonth(year, month);
  return `${monthKey}-${pad2(Math.min(day, max))}`;
}

export function buildSampleState(): AppState {
  const now = new Date().toISOString();
  const current = currentMonthKey();

  const months = Array.from({ length: 8 }, (_, index) => addMonths(current, index - 7));

  const accounts: Account[] = [
    {
      id: createId('acc'),
      name: 'Cuenta corriente',
      type: 'bank',
      color: '#2F6BFF',
      createdAt: now,
      snapshots: months.map((month, index) => ({
        id: createId('snap'),
        month,
        cash: 1200 + index * 180 + (index % 3) * 90,
        invested: 0,
      })),
    },
    {
      id: createId('acc'),
      name: 'Bróker indexado',
      type: 'broker',
      color: '#7A5AF8',
      createdAt: now,
      snapshots: months.map((month, index) => ({
        id: createId('snap'),
        month,
        cash: 300 + index * 20,
        invested: 8500 + index * 420,
      })),
    },
    {
      id: createId('acc'),
      name: 'Fondo de emergencia',
      type: 'bank',
      color: '#0E9E8D',
      createdAt: now,
      snapshots: months.slice(2).map((month, index) => ({
        id: createId('snap'),
        month,
        cash: 3000 + index * 150,
        invested: 0,
      })),
    },
  ];

  const today = todayISO();
  const tomorrow = dayIn(addMonths(current, 0), 24);

  const tasks: Task[] = [
    {
      id: createId('task'),
      title: 'Revisar la factura de la luz',
      notes: 'Comprobar si ha subido respecto al trimestre anterior.',
      done: false,
      dueDate: today,
      priority: 'medium',
      createdAt: now,
    },
    {
      id: createId('task'),
      title: 'Hacer la compra semanal',
      done: false,
      dueDate: tomorrow,
      priority: 'low',
      createdAt: now,
    },
    {
      id: createId('task'),
      title: 'Preparar la reunión del lunes',
      notes: 'Llevar las cifras de cartera.',
      done: false,
      dueDate: dayIn(addMonths(current, 1), 3),
      priority: 'high',
      createdAt: now,
    },
    {
      id: createId('task'),
      title: 'Sacar la cita del médico',
      done: true,
      dueDate: dayIn(addMonths(current, -1), 12),
      priority: 'medium',
      createdAt: now,
      completedAt: now,
    },
  ];

  const events: CalendarEvent[] = [
    {
      id: createId('evt'),
      title: 'Actualizar la cartera',
      date: dayIn(addMonths(current, -1), 28),
      time: '20:00',
      kind: 'done',
      notes: 'Cierre de mes.',
      createdAt: now,
    },
    {
      id: createId('evt'),
      title: 'Actualizar la cartera',
      date: dayIn(current, 28),
      time: '20:00',
      kind: 'planned',
      notes: 'Cierre de mes.',
      createdAt: now,
    },
    {
      id: createId('evt'),
      title: 'Paseo por el parque',
      date: dayIn(current, 15),
      kind: 'done',
      createdAt: now,
    },
    {
      id: createId('evt'),
      title: 'Cena con Marta',
      date: dayIn(current, 20),
      time: '21:00',
      kind: 'planned',
      createdAt: now,
    },
  ];

  const expenses: FixedExpense[] = [
    {
      id: createId('exp'),
      name: 'Alquiler',
      amount: 750,
      category: 'Vivienda',
      dayOfMonth: 1,
      active: true,
    },
    {
      id: createId('exp'),
      name: 'Luz y agua',
      amount: 95,
      category: 'Suministros',
      dayOfMonth: 8,
      active: true,
    },
    {
      id: createId('exp'),
      name: 'Suscripciones',
      amount: 38.9,
      category: 'Suscripciones',
      dayOfMonth: 15,
      active: true,
    },
    {
      id: createId('exp'),
      name: 'Gimnasio',
      amount: 42,
      category: 'Salud',
      dayOfMonth: 3,
      active: true,
    },
    {
      id: createId('exp'),
      name: 'Transporte',
      amount: 55,
      category: 'Transporte',
      dayOfMonth: 20,
      active: true,
    },
    {
      id: createId('exp'),
      name: 'Seguro del coche',
      amount: 380,
      category: 'Transporte',
      dayOfMonth: 12,
      active: false,
    },
  ];

  const debts: Debt[] = [
    {
      id: createId('debt'),
      title: 'Un gorro de lana',
      kind: 'other',
      direction: 'they_owe_me',
      person: 'Mi amiga Marta',
      dueDate: dayIn(current, 22),
      settled: false,
      notes: 'Me lo pidió para el invierno.',
      createdAt: now,
    },
    {
      id: createId('debt'),
      title: 'Cena de la pizza',
      kind: 'money',
      amount: 24.5,
      direction: 'i_owe',
      person: 'Lucas',
      settled: false,
      createdAt: now,
    },
    {
      id: createId('debt'),
      title: 'Entradas del concierto',
      kind: 'money',
      amount: 45,
      direction: 'they_owe_me',
      person: 'Nuria',
      settled: false,
      createdAt: now,
    },
    {
      id: createId('debt'),
      title: 'Devolver el libro',
      kind: 'other',
      direction: 'i_owe',
      person: 'Biblioteca del barrio',
      settled: true,
      createdAt: now,
      settledAt: now,
    },
  ];

  return {
    tasks,
    events,
    accounts,
    expenses,
    debts,
    settings: { monthlyIncome: 2400 },
  };
}
