// src/routes/cart.lazy.tsx
import React, { useState } from "react";
import { Link, useNavigate, createLazyFileRoute } from "@tanstack/react-router";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, CheckCircle2, Package } from "lucide-react";
import { useCart, useUpdateCartQuantity, useRemoveFromCart, useCheckout } from "@/queries/useQueries";
import { GlassCard, Badge, Skeleton } from "../components/ui/Primitives";
import { cn, formatCurrency } from "../lib/utils";

export const Route = createLazyFileRoute('/cart')({
  component: CartPage,
})

export function CartPage() {
  const { data: cart = [], isLoading } = useCart();
  const updateQtyMutation = useUpdateCartQuantity();
  const removeItemMutation = useRemoveFromCart();
  const checkoutMutation   = useCheckout();
  const navigate = useNavigate();

  const [ordered, setOrdered] = useState(false);

  const total    = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const count    = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
  const tax      = total * 0.07;
  const grandTotal = total + tax;

  const handleCheckout = () => {
    checkoutMutation.mutate(cart, {
      onSuccess: () => {
        setOrdered(true);
        // الانتقال تلقائياً بعد 3 ثوانٍ إلى صفحة التحكم قسم الباقات
        setTimeout(() => {
          setOrdered(false);
          navigate({ to: "/patient-dashboard", search: { tab: 'packages' } as any });
        }, 3000);
      },
      onError: (error) => {
        console.error("Checkout failed:", error);
        if ((error as any)?.response?.status === 404) {
          alert("خطأ 404: الرابط البرمجي /orders غير موجود على السيرفر. تأكد من إعدادات الـ Backend.");
          return;
        }
        const message = (error as any)?.response?.data?.message || "حدث خطأ أثناء إتمام الطلب. يرجى المحاولة مرة أخرى.";
        alert(message);
      }
    });
  };

  if (ordered) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 animate-scale-in">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,255,163,0.12)", border: "2px solid rgba(0,255,163,0.3)" }}
        >
          <CheckCircle2 size={44} style={{ color: "var(--neon-emerald)" }} />
        </div>
        <h2 className="heading-display text-green-600 text-2xl">Package Booked Successfully!</h2>
        <p className="text-green-500 text-sm text-center max-w-xs">
          تم حجز الباقات الطبية بنجاح! سيتم توجيهك الآن إلى لوحة التحكم لمتابعة مشترياتك.
        </p>
      </div>
    );
  }

  if (!isLoading && cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: "#ecfdf5", border: "1px solid rgba(16, 185, 129, 0.2)" }}
        >
          <Package size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-emerald-900 text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>No Medical Packages Selected</h2>
        <p className="text-emerald-600/70 text-sm font-medium">Browse our clinical plans to start your health journey.</p>
        <Link to="/products/packages" className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-sm mt-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
          Browse Packages
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-display text-green-600 text-2xl">My Cart</h1>
          <p className="text-green-500 text-sm mt-1">{count} item{count !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Items */}
        <div className="xl:col-span-2 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
          ) : (
            cart.map((item: any) => (
            <GlassCard key={item.id} className="flex items-center gap-4">
              <img src={item.thumbnail} alt={item.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <Badge variant="violet" className="mb-1.5 text-[10px]">{item.category}</Badge>
                <p className="text-white font-semibold text-sm leading-tight">{item.title}</p>
                <p className="text-white/40 text-xs mt-1 line-clamp-1">{item.description}</p>
                <p className="font-bold text-sm mt-2" style={{ color: "var(--neon-emerald)" }}>
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>

              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (item.quantity > 1) {
                        updateQtyMutation.mutate({ cartId: item.id, quantity: item.quantity - 1 });
                      }
                    }}
                    disabled={updateQtyMutation.isPending}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-white font-semibold text-sm w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQtyMutation.mutate({ cartId: item.id, quantity: item.quantity + 1 })}
                    disabled={updateQtyMutation.isPending}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
                {/* Remove */}
                <button
                  onClick={() => removeItemMutation.mutate(item.id)}
                  disabled={removeItemMutation.isPending}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-rose-400/40 hover:text-rose-400 hover:bg-rose-400/10 transition-all border border-transparent hover:border-rose-400/20"
                >
                  <Trash2 size={12} />
                  <span>Remove</span>
                </button>
              </div>
            </GlassCard>
          )))}
        </div>

        {/* Summary */}
        <div>
          <GlassCard hover={false} className="sticky top-20">
            <h3 className="text-grey-500 font-semibold mb-5" style={{ fontFamily: "var(--font-display)" }}>
              Order Summary
            </h3>

            <div className="space-y-3 mb-5">
              {cart.map((item:any) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-green-500 truncate flex-1 mr-3">{item.category} ×{item.quantity}</span>
                  <span className="text-green-500 flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="divider-neon mb-5" />

            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-grey/50">Subtotal</span>
                <span className="text-green-500">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-500">Tax (7%)</span>
                <span className="text-gray-500">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <span className="text-white">Total</span>
                <span style={{ color: "var(--neon-emerald)" }}>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={checkoutMutation.isPending}
              className="btn-primary w-full text-sm justify-center gap-2"
            >
              {checkoutMutation.isPending ? "Processing..." : "Checkout"} <ArrowRight size={15} />
            </button>

            <Link to="/products/packages" className="flex items-center justify-center gap-2 mt-3 text-xs text-white/40 hover:text-white/70 transition-colors">
              <Package size={13} /> Continue Shopping
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}