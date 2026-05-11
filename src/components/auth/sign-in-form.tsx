"use client"

import * as React from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import * as z from "zod"
import { useAuth } from "@/components/auth-provider";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  loginWithEmail,
  registerWithEmail,
} from "@/lib/firebase/auth"

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください。")
    .email("メールアドレスの形式が正しくありません。"),

  password: z
    .string()
    .min(1, "パスワードを入力してください。")
    .min(6, "パスワードは6文字以上で入力してください。"),

  confirmPassword: z.string().optional(),
})

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/invalid-credential":
    "メールアドレスまたはパスワードが正しくありません。",

  "auth/email-already-in-use":
    "このメールアドレスは既に登録されています。",

  "auth/weak-password":
    "パスワードが弱すぎます。6文字以上で設定してください。",

  "auth/invalid-email":
    "メールアドレスの形式が正しくありません。",

  "auth/too-many-requests":
    "操作回数が多すぎます。しばらくしてから再度お試しください。",
}

export function SignInForm() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [serverError, setServerError] = React.useState("")
  const [mode, setMode] = React.useState<"sign-in" | "sign-up">("sign-in")

  // Nếu user đã login ở client, tự động redirect luôn
  React.useEffect(() => {
    if (!loading && user) {
      const params = new URLSearchParams(window.location.search)
      router.push(params.get("redirect") || "/")
    }
  }, [user, loading, router])

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: z.infer<typeof signInSchema>) {
    setServerError("")

    if (
      mode === "sign-up" &&
      data.password !== data.confirmPassword
    ) {
      form.setError("confirmPassword", {
        type: "manual",
        message: "確認用パスワードが一致しません。",
      })
      return
    }

    try {
      const isSignIn = mode === "sign-in"

      if (isSignIn) {
        await loginWithEmail(data.email, data.password)
      } else {
        await registerWithEmail(data.email, data.password)
      }

      toast.success(
        isSignIn ? "ログインしました" : "アカウントを作成しました",
        {
          description: "ワークスペースへ移動しています...",
          position: "bottom-right",
        }
      )

      const params = new URLSearchParams(window.location.search)

      router.push(params.get("redirect") || "/")
      // router.refresh()
    } catch (error: any) {
      setServerError(
        FIREBASE_ERRORS[error?.code] ||
          "エラーが発生しました。もう一度お試しください。"
      )
    }
  }

  const switchMode = (
    nextMode: "sign-in" | "sign-up"
  ) => {
    setMode(nextMode)
    setServerError("")
    form.reset()
  }

  return (
    <Card className="w-full border-cream bg-ivory shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="font-heading text-3xl tracking-[-0.03em] text-near-black">
          {mode === "sign-in"
            ? "ログイン"
            : "アカウント作成"}
        </CardTitle>

        <CardDescription className="text-sm leading-6 text-olive">
          {mode === "sign-in"
            ? "社内ワークスペースへアクセスします。"
            : "ワークスペース参加用のアカウントを作成します。"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-cream bg-parchment p-1">
          {(["sign-in", "sign-up"] as const).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchMode(tab)}
                className={`flex-1 h-8 rounded-lg text-[13px] font-medium transition-colors ${
                  mode === tab
                    ? "bg-ivory text-near-black shadow-sm"
                    : "text-olive hover:text-dark"
                }`}
              >
                {tab === "sign-in"
                  ? "ログイン"
                  : "新規登録"}
              </button>
            )
          )}
        </div>

        <form
          id="sign-in-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            {/* Email */}
            <Controller
              name="email"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel
                    htmlFor="email"
                    className="text-dark"
                  >
                    メールアドレス
                  </FieldLabel>

                  <Input
                    {...field}
                    id="email"
                    type="email"
                    className="h-12 rounded-2xl border border-warm bg-ivory text-near-black"
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            {/* Password */}
            <Controller
              name="password"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel
                    htmlFor="password"
                    className="text-dark"
                  >
                    パスワード
                  </FieldLabel>

                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder="パスワードを入力"
                    className="h-12 rounded-2xl border border-warm bg-ivory text-near-black"
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            {/* Confirm Password */}
            {mode === "sign-up" && (
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <Field
                    data-invalid={
                      fieldState.invalid
                    }
                  >
                    <FieldLabel
                      htmlFor="confirmPassword"
                      className="text-dark"
                    >
                      パスワード確認
                    </FieldLabel>

                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      placeholder="もう一度入力してください"
                      value={
                        field.value || ""
                      }
                      className="h-12 rounded-2xl border border-warm bg-ivory text-near-black"
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[
                          fieldState.error,
                        ]}
                      />
                    )}
                  </Field>
                )}
              />
            )}

            {/* Server Error */}
            {serverError && (
              <div className="rounded-2xl border border-[#e7c9c9] bg-[#fbf2f2] px-4 py-3 text-sm font-medium text-[#9a3d3d]">
                {serverError}
              </div>
            )}
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {/* Submit */}
        <Button
          type="submit"
          form="sign-in-form"
          disabled={
            form.formState.isSubmitting
          }
          className="h-12 w-full rounded-2xl bg-terracotta text-ivory hover:bg-[#bf5d3c] disabled:opacity-75"
        >
          {form.formState.isSubmitting
            ? "処理中..."
            : mode === "sign-in"
            ? "ログイン"
            : "アカウント作成"}
        </Button>

        {/* Forgot Password */}
        {mode === "sign-in" && (
          <Link
            href="/forgot-password"
            className="block text-center text-[12px] text-stone underline underline-offset-4 hover:text-terracotta"
          >
            パスワードをお忘れですか？
          </Link>
        )}

        {/* Divider */}
        <div className="flex w-full items-center gap-3 py-1">
          <div className="h-px flex-1 bg-cream" />

          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone">
            または
          </span>

          <div className="h-px flex-1 bg-cream" />
        </div>

        {/* Google */}
        <Button
          type="button"
          variant="secondary"
          className="h-12 w-full rounded-2xl border border-warm bg-sand text-dark shadow-none hover:bg-[#e2dfd3]"
        >
          Googleで続行
        </Button>
      </CardFooter>
    </Card>
  )
}