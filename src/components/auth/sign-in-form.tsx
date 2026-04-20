"use client"

import * as React from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupText } from "@/components/ui/input-group"
import { loginWithEmail, registerWithEmail } from "@/lib/firebase/auth"

const signInSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập thư điện tử.").email("Địa chỉ email chưa chính xác."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu.").min(6, "Mật khẩu cần ít nhất 6 ký tự."),
  confirmPassword: z.string().optional(),
})

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Tài khoản hoặc mật khẩu không đúng.",
  "auth/email-already-in-use": "Email này đã được đăng ký từ trước.",
  "auth/weak-password": "Mật khẩu quá yếu, cần ít nhất 6 ký tự.",
  "auth/invalid-email": "Địa chỉ email không hợp lệ.",
  "auth/too-many-requests": "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau.",
};

export function SignInForm() {
  const router = useRouter()
  const [serverError, setServerError] = React.useState("")
  const [mode, setMode] = React.useState<"sign-in" | "sign-up">("sign-in")

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  })

  async function onSubmit(data: z.infer<typeof signInSchema>) {
    setServerError("")
    
    // Kiểm tra mật khẩu thủ công cho mode sign-up
    if (mode === "sign-up" && data.password !== data.confirmPassword) {
      form.setError("confirmPassword", { type: "manual", message: "Mật khẩu xác nhận không khớp." })
      return
    }

    try {
      const isSignIn = mode === "sign-in"
      if (isSignIn) {
        await loginWithEmail(data.email, data.password)
      } else {
        await registerWithEmail(data.email, data.password)
      }

      toast.success(isSignIn ? "Đăng nhập thành công" : "Tạo tài khoản thành công", {
        description: "Đang tải workspace của bạn...",
        position: "bottom-right",
      })

      router.push("/chat")
      router.refresh()
    } catch (error: any) {
      setServerError(FIREBASE_ERRORS[error?.code] || "Có lỗi xảy ra. Xin thử lại.")
    }
  }

  const toggleMode = () => {
    setMode(mode === "sign-in" ? "sign-up" : "sign-in")
    setServerError("")
    form.reset()
  }

  return (
    <Card className="w-full border-[--color-border-cream] bg-[--color-ivory] shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="font-heading text-3xl tracking-[-0.03em] text-[--color-near-black]">
          {mode === "sign-in" ? "Welcome Back" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-[--color-olive-gray]">
          {mode === "sign-in" 
            ? "Đăng nhập bằng tài khoản làm việc của bạn để tham gia cùng nhóm."
            : "Tạo tài khoản cá nhân mới để truy cập không gian làm việc."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="sign-in-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            
            {/* EMAIL */}
            <Controller name="email" control={form.control} render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email" className="text-[--color-dark-warm]">Email</FieldLabel>
                <InputGroup>
                  <Input {...field} id="email" type="email" placeholder="name@porocia.co.jp" className="h-12 rounded-2xl border-[--color-border-warm] bg-[--color-ivory] text-[--color-near-black] placeholder:text-[--color-stone-gray]" />
                  <InputGroupAddon><InputGroupText>@</InputGroupText></InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )} />

            {/* PASSWORD */}
            <Controller name="password" control={form.control} render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-[--color-dark-warm]">Mật khẩu</FieldLabel>
                  {mode === "sign-in" && <Link href="/forgot-password" className="text-[13px] font-medium text-[--color-olive-gray] underline hover:text-[--color-terracotta]">Quên mật khẩu?</Link>}
                </div>
                <Input {...field} id="password" type="password" placeholder="Nhập mật khẩu..." className="h-12 rounded-2xl border-[--color-border-warm] bg-[--color-ivory] text-[--color-near-black]" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )} />

            {/* CONFIRM PASSWORD */}
            {mode === "sign-up" && (
              <Controller name="confirmPassword" control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword" className="text-[--color-dark-warm]">Xác thực mật khẩu</FieldLabel>
                  <Input {...field} id="confirmPassword" type="password" placeholder="Nhập lại mật khẩu..." value={field.value || ""} className="h-12 rounded-2xl border-[--color-border-warm] bg-[--color-ivory] text-[--color-near-black]" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )} />
            )}

            {/* SERVER ERROR */}
            {serverError && (
              <Field data-invalid="true">
                <div className="rounded-2xl border border-[#e7c9c9] bg-[#fbf2f2] px-4 py-3 text-sm font-medium text-[#9a3d3d]">{serverError}</div>
              </Field>
            )}
            
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        {/* ACTION BUTTONS */}
        <Field orientation="horizontal" className="justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => { form.reset(); setServerError(""); }} className="h-12 flex-1 rounded-2xl border-[--color-border-warm] text-[--color-dark-warm] shadow-sm hover:bg-[--color-warm-sand]">
            Đặt lại
          </Button>

          <Button type="submit" form="sign-in-form" disabled={form.formState.isSubmitting} className="h-12 flex-1 rounded-2xl border-none bg-[--color-terracotta] text-[--color-ivory] shadow-sm hover:bg-[#bf5d3c] disabled:opacity-75">
            {form.formState.isSubmitting ? "Đang xử lý..." : mode === "sign-in" ? "Đăng Nhập" : "Mở Tài Khoản"}
          </Button>
        </Field>

        {/* DIVIDER */}
        <div className="relative mt-2 flex justify-center py-1 border-t border-[--color-border-cream]">
          <span className="absolute -top-2.5 bg-[--color-ivory] px-3 text-[10px] uppercase tracking-[0.15em] font-bold text-[--color-stone-gray]">Hoặc truy cập bằng</span>
        </div>

        {/* GOOGLE BUTTON */}
        <Button type="button" variant="secondary" className="mt-1 h-12 w-full rounded-2xl border border-[--color-border-warm] bg-[--color-warm-sand] text-[--color-dark-warm] shadow-none hover:bg-[#e2dfd3]">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </Button>

        {/* TOGGLE MODE */}
        <p className="mt-2 text-center text-[13px] text-[--color-olive-gray]">
          {mode === "sign-in" ? "Chưa là thành viên?" : "Đã có tài khoản nội bộ?"} {" "}
          <button type="button" onClick={toggleMode} className="font-semibold text-[--color-terracotta] hover:text-[#bf5d3c]">
            {mode === "sign-in" ? "Tạo tài khoản" : "Đăng nhập ngay"}
          </button>
        </p>
      </CardFooter>
    </Card>
  )
}