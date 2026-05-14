import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // توجيه المستخدم مباشرة لصفحة تسجيل الدخول
    // صفحة اللوجن ستقوم بفحص حالة المستخدم وتوجيهه للداشبورد الصحيح تلقائياً
    throw redirect({
      to: '/login',
    })
  },
})