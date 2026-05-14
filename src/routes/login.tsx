import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '../pages/auth/LoginPage'
import { z } from 'zod'

// تعريف المتوقع في رابط البحث (مثلاً: /login?redirect=/cart)
const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  component: LoginPage,
  validateSearch: (search) => loginSearchSchema.parse(search),
  beforeLoad: ({ search }) => {
    // إذا كان المستخدم مسجل دخول بالفعل، لا نسمح له بفتح صفحة اللوجن ونعيده للداشبورد
    const authData = localStorage.getItem('telehealth-auth')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        const token = parsed?.state?.token
        const role = parsed?.state?.user?.role
        if (token) {
          throw redirect({
            to: search.redirect || (role === 'admin' ? '/dashboard/admin' : '/dashboard/patient'),
            replace: true,
          })
        }
      } catch (e) {
        // في حال وجود خطأ في البيانات المخزنة نترك المستخدم يكمل للوجن
      }
    }
  },
})