import { createFileRoute, redirect } from '@tanstack/react-router'
import { RegisterPage } from '../pages/auth/RegisterPage'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
  beforeLoad: () => {
    // منع المستخدم المسجل من الوصول لصفحة إنشاء حساب جديد
    const authData = localStorage.getItem('telehealth-auth')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        const token = parsed?.state?.token
        if (token) {
          throw redirect({
            to: '/login',
            replace: true,
          })
        }
      } catch (e) {
        // استمرار العملية إذا كانت البيانات غير صالحة
      }
    }
  },
})