import { createBrowserRouter, Navigate } from 'react-router'
import { DayView } from '@/features/tasks/views/DayView'
import { MonthView } from '@/features/tasks/views/MonthView'
import { WeekView } from '@/features/tasks/views/WeekView'
import { Layout } from './Layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/week" replace /> },
      { path: 'week/:date?', element: <WeekView /> },
      { path: 'day/:date?', element: <DayView /> },
      { path: 'month/:month?', element: <MonthView /> },
      { path: '*', element: <Navigate to="/week" replace /> },
    ],
  },
])
