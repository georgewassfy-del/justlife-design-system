import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePicker } from './DatePicker';

const DAYS = [
  { day: 'FRI', date: 19 },
  { day: 'SAT', date: 20 },
  { day: 'SUN', date: 21 },
  { day: 'MON', date: 22 },
  { day: 'TUE', date: 23 },
  { day: 'WED', date: 24 },
  { day: 'THU', date: 25 },
];

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal strip of single-select day chips (weekday label over the date number). Composes `Selectable`. Used on the booking funnel’s Date & Time step.',
      },
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<number | string>(19);
    return <DatePicker days={DAYS} value={date} onChange={setDate} />;
  },
};

const DAYS_WITH_MONTH = DAYS.map((d) => ({ ...d, month: 'Feb' }));

export const WithMonth: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Each cell shows weekday + date + an optional `month` caption (used on the booking funnel).',
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<number | string>(19);
    return <DatePicker days={DAYS_WITH_MONTH} value={date} onChange={setDate} />;
  },
};
